/// PlayNode: Rank — Soulbound rank badge.
/// The Rank struct has `key` but NOT `store`, making it non-transferable
/// (soulbound). It represents a creator's tier within the platform.
///
/// Tier thresholds:
///   0 - Bronze:   Signup (default)
///   1 - Silver:   10+ drops, 5+ reviews, 10K views
///   2 - Gold:     30+ content pieces, 100K views
///   3 - Diamond:  50+ content pieces, 500K views, 500 shop links
///   4 - Master:   Top 1% + community vote (set by admin)
module playnode::rank {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use playnode::node::{Self, Node};

    // ─── Errors ───────────────────────────────────────────────
    const ENotEligible: u64 = 0;
    const EAlreadyHasRank: u64 = 1;
    const ENotAdmin: u64 = 2;

    // ─── Tier constants ───────────────────────────────────────
    const TIER_BRONZE: u8 = 0;
    const TIER_SILVER: u8 = 1;
    const TIER_GOLD: u8 = 2;
    const TIER_DIAMOND: u8 = 3;
    const TIER_MASTER: u8 = 4;

    // ─── Threshold constants ──────────────────────────────────
    const SILVER_DROPS: u64 = 10;
    const SILVER_REVIEWS: u64 = 5;
    const SILVER_VIEWS: u64 = 10_000;

    const GOLD_CONTENT: u64 = 30;   // drops + reviews
    const GOLD_VIEWS: u64 = 100_000;

    const DIAMOND_CONTENT: u64 = 50;
    const DIAMOND_VIEWS: u64 = 500_000;
    // Diamond also requires 500 shop links (tracked off-chain in v1).

    // ─── Objects ──────────────────────────────────────────────

    /// Soulbound rank badge. No `store` ability = cannot be transferred
    /// or wrapped after initial transfer.
    public struct Rank has key {
        id: UID,
        owner: address,
        node_id: ID,
        tier: u8,
        awarded_at: u64,
        updated_at: u64,
    }

    /// Admin capability for setting Master rank.
    public struct RankAdmin has key, store {
        id: UID,
    }

    // ─── Events ───────────────────────────────────────────────

    public struct RankCreated has copy, drop {
        rank_id: ID,
        owner: address,
        tier: u8,
    }

    public struct RankUpdated has copy, drop {
        rank_id: ID,
        old_tier: u8,
        new_tier: u8,
    }

    // ─── Init (creates admin cap) ─────────────────────────────

    /// Module initialiser — mints the RankAdmin capability and transfers it
    /// to the publisher.
    fun init(ctx: &mut TxContext) {
        let admin = RankAdmin { id: object::new(ctx) };
        transfer::transfer(admin, tx_context::sender(ctx));
    }

    // ─── Public entry functions ───────────────────────────────

    /// Mint a Bronze rank badge for a creator. Called once per creator.
    public entry fun create_rank(
        creator_node: &Node,
        ctx: &mut TxContext,
    ) {
        let owner = node::owner(creator_node);
        let uid = object::new(ctx);
        let rank_id = object::uid_to_inner(&uid);
        let now = tx_context::epoch(ctx);

        let rank = Rank {
            id: uid,
            owner,
            node_id: object::id(creator_node),
            tier: TIER_BRONZE,
            awarded_at: now,
            updated_at: now,
        };

        event::emit(RankCreated {
            rank_id,
            owner,
            tier: TIER_BRONZE,
        });

        // Transfer soulbound badge to the creator.
        transfer::transfer(rank, owner);
    }

    /// Attempt to upgrade a rank based on current Node stats.
    /// Anyone can call this (permissionless check), but the Rank must belong
    /// to the Node's owner.
    public entry fun update_rank(
        rank: &mut Rank,
        creator_node: &mut Node,
        ctx: &mut TxContext,
    ) {
        let new_tier = check_eligibility(creator_node);
        assert!(new_tier > rank.tier, ENotEligible);

        let old_tier = rank.tier;
        rank.tier = new_tier;
        rank.updated_at = tx_context::epoch(ctx);

        // Also update the rank field on the Node.
        node::set_rank(creator_node, new_tier);

        event::emit(RankUpdated {
            rank_id: object::uid_to_inner(&rank.id),
            old_tier,
            new_tier,
        });
    }

    /// Admin-only: set Master rank (top 1% + community vote).
    public entry fun set_master_rank(
        _admin: &RankAdmin,
        rank: &mut Rank,
        creator_node: &mut Node,
        ctx: &mut TxContext,
    ) {
        let old_tier = rank.tier;
        rank.tier = TIER_MASTER;
        rank.updated_at = tx_context::epoch(ctx);
        node::set_rank(creator_node, TIER_MASTER);

        event::emit(RankUpdated {
            rank_id: object::uid_to_inner(&rank.id),
            old_tier,
            new_tier: TIER_MASTER,
        });
    }

    // ─── Eligibility checker ──────────────────────────────────

    /// Determine the highest tier a creator is eligible for based on their
    /// Node statistics. Returns the tier as a u8.
    public fun check_eligibility(creator_node: &Node): u8 {
        let drops = node::total_drops(creator_node);
        let reviews = node::total_reviews(creator_node);
        let views = node::total_views(creator_node);
        let content = drops + reviews;

        // Check from highest to lowest.
        if (content >= DIAMOND_CONTENT && views >= DIAMOND_VIEWS) {
            TIER_DIAMOND
        } else if (content >= GOLD_CONTENT && views >= GOLD_VIEWS) {
            TIER_GOLD
        } else if (drops >= SILVER_DROPS && reviews >= SILVER_REVIEWS && views >= SILVER_VIEWS) {
            TIER_SILVER
        } else {
            TIER_BRONZE
        }
        // Master is admin-only, not checked here.
    }

    // ─── Accessors ────────────────────────────────────────────

    public fun tier(rank: &Rank): u8 { rank.tier }
    public fun owner(rank: &Rank): address { rank.owner }
}
