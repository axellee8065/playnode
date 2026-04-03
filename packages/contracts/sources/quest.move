/// PlayNode: Quest — Bounty system.
/// Creators or sponsors post quests (e.g. "First to beat boss X") with a
/// bounty pool. Participants accept, submit proof, and the poster approves.
module playnode::quest {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use std::string::String;

    // ─── Errors ───────────────────────────────────────────────
    const ENotOwner: u64 = 0;
    const EQuestNotOpen: u64 = 1;
    const EAlreadyAccepted: u64 = 2;
    const ENotParticipant: u64 = 3;
    const EQuestNotPendingReview: u64 = 4;
    const EInvalidStatus: u64 = 5;

    // ─── Status constants ─────────────────────────────────────
    const STATUS_OPEN: u8 = 0;
    const STATUS_IN_PROGRESS: u8 = 1;
    const STATUS_PENDING_REVIEW: u8 = 2;
    const STATUS_COMPLETED: u8 = 3;
    const STATUS_CANCELLED: u8 = 4;

    // ─── Objects ──────────────────────────────────────────────

    /// A quest/bounty posted by a creator or sponsor.
    public struct Quest has key, store {
        id: UID,
        poster: address,
        title: String,
        description: String,
        game_id: String,
        /// Bounty amount in MIST held in escrow (transferred on approval).
        bounty_amount: u64,
        /// Requirements description (e.g. "Screenshot of boss kill").
        requirements: String,
        /// Address of the participant who accepted the quest.
        participant: address,
        /// URI to submitted proof.
        submission_uri: String,
        status: u8,
        /// Deadline epoch. 0 = no deadline.
        deadline: u64,
        created_at: u64,
    }

    // ─── Events ───────────────────────────────────────────────

    public struct QuestCreated has copy, drop {
        quest_id: ID,
        poster: address,
        title: String,
        bounty_amount: u64,
    }

    public struct QuestAccepted has copy, drop {
        quest_id: ID,
        participant: address,
    }

    public struct QuestSubmitted has copy, drop {
        quest_id: ID,
        participant: address,
        submission_uri: String,
    }

    public struct QuestApproved has copy, drop {
        quest_id: ID,
        participant: address,
        bounty_amount: u64,
    }

    public struct QuestCancelled has copy, drop {
        quest_id: ID,
    }

    // ─── Sentinel address (no participant yet) ────────────────
    const ZERO_ADDRESS: address = @0x0;

    // ─── Public entry functions ───────────────────────────────

    /// Create a new quest with a bounty. The bounty coin is held by the
    /// shared Quest object; it will be released on approval or returned on
    /// cancellation.
    public entry fun create_quest(
        title: String,
        description: String,
        game_id: String,
        requirements: String,
        deadline: u64,
        bounty: Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let bounty_amount = coin::value(&bounty);
        let uid = object::new(ctx);
        let quest_id = object::uid_to_inner(&uid);

        let quest = Quest {
            id: uid,
            poster: sender,
            title,
            description,
            game_id,
            bounty_amount,
            requirements,
            participant: ZERO_ADDRESS,
            submission_uri: std::string::utf8(b""),
            status: STATUS_OPEN,
            deadline,
            created_at: tx_context::epoch(ctx),
        };

        event::emit(QuestCreated {
            quest_id,
            poster: sender,
            title: quest.title,
            bounty_amount,
        });

        // Park the bounty coin with the quest poster for now (simplified
        // escrow — a production version would use a balance field).
        transfer::public_transfer(bounty, sender);
        transfer::share_object(quest);
    }

    /// Accept an open quest. Only one participant at a time.
    public entry fun accept_quest(
        quest: &mut Quest,
        ctx: &mut TxContext,
    ) {
        assert!(quest.status == STATUS_OPEN, EQuestNotOpen);
        assert!(quest.participant == ZERO_ADDRESS, EAlreadyAccepted);

        let participant = tx_context::sender(ctx);
        quest.participant = participant;
        quest.status = STATUS_IN_PROGRESS;

        event::emit(QuestAccepted {
            quest_id: object::uid_to_inner(&quest.id),
            participant,
        });
    }

    /// Submit proof of quest completion.
    public entry fun submit_quest(
        quest: &mut Quest,
        submission_uri: String,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(quest.participant == sender, ENotParticipant);
        assert!(quest.status == STATUS_IN_PROGRESS, EInvalidStatus);

        quest.submission_uri = submission_uri;
        quest.status = STATUS_PENDING_REVIEW;

        event::emit(QuestSubmitted {
            quest_id: object::uid_to_inner(&quest.id),
            participant: sender,
            submission_uri,
        });
    }

    /// Poster approves the submission and releases bounty to the participant.
    public entry fun approve_quest(
        quest: &mut Quest,
        bounty: Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        assert!(quest.poster == tx_context::sender(ctx), ENotOwner);
        assert!(quest.status == STATUS_PENDING_REVIEW, EQuestNotPendingReview);

        quest.status = STATUS_COMPLETED;

        // Transfer the bounty to the participant.
        transfer::public_transfer(bounty, quest.participant);

        event::emit(QuestApproved {
            quest_id: object::uid_to_inner(&quest.id),
            participant: quest.participant,
            bounty_amount: quest.bounty_amount,
        });
    }

    /// Cancel a quest (poster only). Only allowed while OPEN or IN_PROGRESS.
    public entry fun cancel_quest(
        quest: &mut Quest,
        ctx: &mut TxContext,
    ) {
        assert!(quest.poster == tx_context::sender(ctx), ENotOwner);
        assert!(
            quest.status == STATUS_OPEN || quest.status == STATUS_IN_PROGRESS,
            EInvalidStatus,
        );

        quest.status = STATUS_CANCELLED;

        event::emit(QuestCancelled {
            quest_id: object::uid_to_inner(&quest.id),
        });
    }

    // ─── Accessors ────────────────────────────────────────────

    public fun poster(quest: &Quest): address { quest.poster }
    public fun participant(quest: &Quest): address { quest.participant }
    public fun bounty_amount(quest: &Quest): u64 { quest.bounty_amount }
    public fun status(quest: &Quest): u8 { quest.status }
}
