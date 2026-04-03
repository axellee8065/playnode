/// PlayNode: Subscription (Link) — Monthly subscriptions.
/// Fans subscribe to a creator's Node to get premium access (exclusive drops,
/// early access, community channels). A LinkPass NFT represents the active sub.
module playnode::subscription {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;

    // ─── Errors ───────────────────────────────────────────────
    const ENotOwner: u64 = 0;
    const EInsufficientPayment: u64 = 1;
    const EAlreadyExpired: u64 = 2;
    const ENotSubscriber: u64 = 3;

    // ─── Objects ──────────────────────────────────────────────

    /// A subscription pass (NFT) held by the subscriber.
    struct LinkPass has key, store {
        id: UID,
        /// The creator's Node ID this pass subscribes to.
        node_id: ID,
        subscriber: address,
        /// Creator who receives payments.
        creator: address,
        /// Monthly price in MIST.
        monthly_price: u64,
        /// Epoch when the subscription was first activated.
        started_at: u64,
        /// Epoch when current period expires.
        expires_at: u64,
        /// Whether the subscriber has actively cancelled.
        cancelled: bool,
        /// Total amount paid over the lifetime of this pass.
        total_paid: u64,
    }

    // ─── Events ───────────────────────────────────────────────

    struct Subscribed has copy, drop {
        pass_id: ID,
        node_id: ID,
        subscriber: address,
        creator: address,
        amount: u64,
    }

    struct Renewed has copy, drop {
        pass_id: ID,
        new_expiry: u64,
        amount: u64,
    }

    struct Cancelled has copy, drop {
        pass_id: ID,
        subscriber: address,
    }

    // ─── Constants ────────────────────────────────────────────

    /// Approximate epochs per month (Sui epochs are ~24h, so ~30 epochs).
    const EPOCHS_PER_MONTH: u64 = 30;

    // ─── Public entry functions ───────────────────────────────

    /// Subscribe to a creator by paying the monthly price.
    /// A new LinkPass NFT is minted and transferred to the subscriber.
    public entry fun subscribe(
        node_id: ID,
        creator: address,
        monthly_price: u64,
        payment: Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        let paid = coin::value(&payment);
        assert!(paid >= monthly_price, EInsufficientPayment);

        let subscriber = tx_context::sender(ctx);
        let now = tx_context::epoch(ctx);
        let uid = object::new(ctx);
        let pass_id = object::uid_to_inner(&uid);

        let pass = LinkPass {
            id: uid,
            node_id,
            subscriber,
            creator,
            monthly_price,
            started_at: now,
            expires_at: now + EPOCHS_PER_MONTH,
            cancelled: false,
            total_paid: paid,
        };

        // Transfer payment to the creator.
        transfer::public_transfer(payment, creator);

        event::emit(Subscribed {
            pass_id,
            node_id,
            subscriber,
            creator,
            amount: paid,
        });

        transfer::transfer(pass, subscriber);
    }

    /// Renew an existing subscription for another month.
    public entry fun renew(
        pass: &mut LinkPass,
        payment: Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        assert!(pass.subscriber == tx_context::sender(ctx), ENotSubscriber);
        assert!(!pass.cancelled, EAlreadyExpired);

        let paid = coin::value(&payment);
        assert!(paid >= pass.monthly_price, EInsufficientPayment);

        let now = tx_context::epoch(ctx);
        // If already expired, restart from now; otherwise extend from current expiry.
        if (pass.expires_at < now) {
            pass.expires_at = now + EPOCHS_PER_MONTH;
        } else {
            pass.expires_at = pass.expires_at + EPOCHS_PER_MONTH;
        };

        pass.total_paid = pass.total_paid + paid;

        transfer::public_transfer(payment, pass.creator);

        event::emit(Renewed {
            pass_id: object::uid_to_inner(&pass.id),
            new_expiry: pass.expires_at,
            amount: paid,
        });
    }

    /// Cancel a subscription. The pass remains (with history) but is flagged
    /// as cancelled. Access continues until expires_at.
    public entry fun cancel(
        pass: &mut LinkPass,
        ctx: &mut TxContext,
    ) {
        assert!(pass.subscriber == tx_context::sender(ctx), ENotSubscriber);
        pass.cancelled = true;

        event::emit(Cancelled {
            pass_id: object::uid_to_inner(&pass.id),
            subscriber: pass.subscriber,
        });
    }

    // ─── Accessors ────────────────────────────────────────────

    public fun is_active(pass: &LinkPass, current_epoch: u64): bool {
        !pass.cancelled && pass.expires_at >= current_epoch
    }

    public fun subscriber(pass: &LinkPass): address { pass.subscriber }
    public fun creator(pass: &LinkPass): address { pass.creator }
    public fun expires_at(pass: &LinkPass): u64 { pass.expires_at }
    public fun total_paid(pass: &LinkPass): u64 { pass.total_paid }
}
