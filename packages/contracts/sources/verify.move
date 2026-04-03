/// PlayNode: Verify — Playtime verification.
/// Off-chain oracles submit verification records proving a user's game
/// playtime. These records are used to gate reviews and rank eligibility.
module playnode::verify {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use std::string::String;

    // ─── Errors ───────────────────────────────────────────────
    const ENotVerifier: u64 = 0;
    const EAlreadyValidated: u64 = 1;
    const ENotPending: u64 = 2;

    // ─── Status constants ─────────────────────────────────────
    const STATUS_PENDING: u8 = 0;
    const STATUS_VALIDATED: u8 = 1;
    const STATUS_REJECTED: u8 = 2;

    // ─── Objects ──────────────────────────────────────────────

    /// A verification record attesting to a user's playtime on a game.
    public struct VerificationRecord has key, store {
        id: UID,
        /// The user whose playtime is verified.
        user: address,
        game_id: String,
        /// Platform where playtime was recorded (Steam, Riot, etc.).
        platform: String,
        /// Total hours played.
        playtime_hours: u64,
        /// Hash of the off-chain proof data (API response hash, screenshot hash, etc.).
        proof_hash: vector<u8>,
        status: u8,
        /// The oracle/verifier address that submitted or validated this record.
        verifier: address,
        submitted_at: u64,
        validated_at: u64,
    }

    /// Capability object held by trusted verifier oracles.
    public struct VerifierCap has key, store {
        id: UID,
        verifier: address,
    }

    // ─── Events ───────────────────────────────────────────────

    public struct VerificationSubmitted has copy, drop {
        record_id: ID,
        user: address,
        game_id: String,
        playtime_hours: u64,
    }

    public struct VerificationValidated has copy, drop {
        record_id: ID,
        user: address,
        game_id: String,
        status: u8,
    }

    public struct VerifierCapCreated has copy, drop {
        cap_id: ID,
        verifier: address,
    }

    // ─── Admin functions ──────────────────────────────────────

    /// Create a VerifierCap for a trusted oracle address.
    /// In production this would be gated by an AdminCap; here the deployer
    /// calls it during setup.
    public entry fun create_verifier_cap(
        verifier: address,
        ctx: &mut TxContext,
    ) {
        let uid = object::new(ctx);
        let cap_id = object::uid_to_inner(&uid);

        let cap = VerifierCap {
            id: uid,
            verifier,
        };

        event::emit(VerifierCapCreated { cap_id, verifier });
        transfer::transfer(cap, verifier);
    }

    // ─── Public entry functions ───────────────────────────────

    /// Submit a playtime verification record. Can be called by the user
    /// themselves or by a relayer on behalf of the user.
    public entry fun submit_verification(
        user: address,
        game_id: String,
        platform: String,
        playtime_hours: u64,
        proof_hash: vector<u8>,
        ctx: &mut TxContext,
    ) {
        let uid = object::new(ctx);
        let record_id = object::uid_to_inner(&uid);
        let now = tx_context::epoch(ctx);

        let record = VerificationRecord {
            id: uid,
            user,
            game_id,
            platform,
            playtime_hours,
            proof_hash,
            status: STATUS_PENDING,
            verifier: @0x0,
            submitted_at: now,
            validated_at: 0,
        };

        event::emit(VerificationSubmitted {
            record_id,
            user,
            game_id: record.game_id,
            playtime_hours,
        });

        transfer::transfer(record, user);
    }

    /// Validate (approve or reject) a pending verification record.
    /// Only callable by the holder of a VerifierCap.
    public entry fun validate_verification(
        cap: &VerifierCap,
        record: &mut VerificationRecord,
        approved: bool,
        ctx: &mut TxContext,
    ) {
        assert!(cap.verifier == tx_context::sender(ctx), ENotVerifier);
        assert!(record.status == STATUS_PENDING, ENotPending);

        if (approved) {
            record.status = STATUS_VALIDATED;
        } else {
            record.status = STATUS_REJECTED;
        };

        record.verifier = cap.verifier;
        record.validated_at = tx_context::epoch(ctx);

        event::emit(VerificationValidated {
            record_id: object::uid_to_inner(&record.id),
            user: record.user,
            game_id: record.game_id,
            status: record.status,
        });
    }

    // ─── Accessors ────────────────────────────────────────────

    public fun user(record: &VerificationRecord): address { record.user }
    public fun playtime_hours(record: &VerificationRecord): u64 { record.playtime_hours }
    public fun status(record: &VerificationRecord): u8 { record.status }
    public fun is_validated(record: &VerificationRecord): bool { record.status == STATUS_VALIDATED }
}
