/// PlayNode: Review — Verified game reviews.
/// Creators submit reviews tied to their Node. Other users can mark reviews
/// as helpful, boosting the creator's reputation.
module playnode::review {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use std::string::String;
    use playnode::node::{Self, Node};

    // ─── Errors ───────────────────────────────────────────────
    const ENotOwner: u64 = 0;
    const ERatingOutOfRange: u64 = 1;

    // ─── Objects ──────────────────────────────────────────────

    /// An on-chain game review authored by a creator.
    struct Review has key, store {
        id: UID,
        author: address,
        node_id: ID,
        game_id: String,
        title: String,
        content_uri: String,
        /// Rating 1-10.
        rating: u8,
        /// Hours played at time of review (self-reported, cross-checked off-chain).
        playtime_hours: u64,
        helpful_count: u64,
        created_at: u64,
        updated_at: u64,
    }

    // ─── Events ───────────────────────────────────────────────

    struct ReviewCreated has copy, drop {
        review_id: ID,
        author: address,
        game_id: String,
        rating: u8,
    }

    struct ReviewUpdated has copy, drop {
        review_id: ID,
        rating: u8,
    }

    struct ReviewMarkedHelpful has copy, drop {
        review_id: ID,
        voter: address,
    }

    // ─── Public entry functions ───────────────────────────────

    /// Submit a new review. The author must pass their Node so we can
    /// increment the review counter.
    public entry fun create_review(
        author_node: &mut Node,
        game_id: String,
        title: String,
        content_uri: String,
        rating: u8,
        playtime_hours: u64,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(node::owner(author_node) == sender, ENotOwner);
        assert!(rating >= 1 && rating <= 10, ERatingOutOfRange);

        let uid = object::new(ctx);
        let review_id = object::uid_to_inner(&uid);
        let now = tx_context::epoch(ctx);

        let review = Review {
            id: uid,
            author: sender,
            node_id: object::id(author_node),
            game_id,
            title,
            content_uri,
            rating,
            playtime_hours,
            helpful_count: 0,
            created_at: now,
            updated_at: now,
        };

        node::increment_reviews(author_node);

        event::emit(ReviewCreated {
            review_id,
            author: sender,
            game_id: review.game_id,
            rating,
        });

        transfer::transfer(review, sender);
    }

    /// Update an existing review (owner only).
    public entry fun update_review(
        review: &mut Review,
        title: String,
        content_uri: String,
        rating: u8,
        playtime_hours: u64,
        ctx: &mut TxContext,
    ) {
        assert!(review.author == tx_context::sender(ctx), ENotOwner);
        assert!(rating >= 1 && rating <= 10, ERatingOutOfRange);

        review.title = title;
        review.content_uri = content_uri;
        review.rating = rating;
        review.playtime_hours = playtime_hours;
        review.updated_at = tx_context::epoch(ctx);

        event::emit(ReviewUpdated {
            review_id: object::uid_to_inner(&review.id),
            rating,
        });
    }

    /// Anyone can mark a review as helpful. This bumps the helpful counter
    /// and gives the author a small reputation boost.
    public entry fun mark_helpful(
        review: &mut Review,
        author_node: &mut Node,
        ctx: &mut TxContext,
    ) {
        review.helpful_count = review.helpful_count + 1;
        // +1 reputation per helpful vote.
        node::add_reputation(author_node, 1);

        event::emit(ReviewMarkedHelpful {
            review_id: object::uid_to_inner(&review.id),
            voter: tx_context::sender(ctx),
        });
    }

    // ─── Accessors ────────────────────────────────────────────

    public fun author(review: &Review): address { review.author }
    public fun rating(review: &Review): u8 { review.rating }
    public fun helpful_count(review: &Review): u64 { review.helpful_count }
}
