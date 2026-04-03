/// PlayNode: Shop — Affiliate commerce.
/// Creators curate shop links (affiliate URLs) and bundles. Click and
/// conversion events are recorded on-chain for transparent attribution.
module playnode::shop {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use std::string::String;

    // ─── Errors ───────────────────────────────────────────────
    const ENotOwner: u64 = 0;
    const ELinkNotActive: u64 = 1;
    const EBundleEmpty: u64 = 2;

    // ─── Status constants ─────────────────────────────────────
    const STATUS_ACTIVE: u8 = 0;
    const STATUS_PAUSED: u8 = 1;

    // ─── Objects ──────────────────────────────────────────────

    /// An affiliate link to an external game store or product.
    public struct ShopLink has key, store {
        id: UID,
        creator: address,
        game_id: String,
        title: String,
        description: String,
        /// The affiliate URL (stored on-chain for auditability).
        affiliate_url: String,
        /// Platform (Steam, Epic, GOG, etc.).
        platform: String,
        status: u8,
        total_clicks: u64,
        total_conversions: u64,
        total_commission: u64,
        created_at: u64,
    }

    /// A curated collection of ShopLinks bundled together as a recommendation
    /// list (e.g. "Best RPGs of 2026").
    public struct CuratedBundle has key, store {
        id: UID,
        creator: address,
        title: String,
        description: String,
        /// IDs of the ShopLinks in the bundle.
        link_ids: vector<ID>,
        total_clicks: u64,
        created_at: u64,
    }

    // ─── Events ───────────────────────────────────────────────

    public struct ShopLinkCreated has copy, drop {
        link_id: ID,
        creator: address,
        game_id: String,
    }

    public struct BundleCreated has copy, drop {
        bundle_id: ID,
        creator: address,
        title: String,
    }

    public struct ClickRecorded has copy, drop {
        link_id: ID,
        clicker: address,
    }

    public struct ConversionRecorded has copy, drop {
        link_id: ID,
        commission: u64,
    }

    // ─── Public entry functions ───────────────────────────────

    /// Create a new affiliate shop link.
    public entry fun create_shop_link(
        game_id: String,
        title: String,
        description: String,
        affiliate_url: String,
        platform: String,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let uid = object::new(ctx);
        let link_id = object::uid_to_inner(&uid);

        let link = ShopLink {
            id: uid,
            creator: sender,
            game_id,
            title,
            description,
            affiliate_url,
            platform,
            status: STATUS_ACTIVE,
            total_clicks: 0,
            total_conversions: 0,
            total_commission: 0,
            created_at: tx_context::epoch(ctx),
        };

        event::emit(ShopLinkCreated {
            link_id,
            creator: sender,
            game_id: link.game_id,
        });

        transfer::transfer(link, sender);
    }

    /// Create a curated bundle of existing shop links.
    public entry fun create_bundle(
        title: String,
        description: String,
        link_ids: vector<ID>,
        ctx: &mut TxContext,
    ) {
        assert!(!vector::is_empty(&link_ids), EBundleEmpty);

        let sender = tx_context::sender(ctx);
        let uid = object::new(ctx);
        let bundle_id = object::uid_to_inner(&uid);

        let bundle = CuratedBundle {
            id: uid,
            creator: sender,
            title,
            description,
            link_ids,
            total_clicks: 0,
            created_at: tx_context::epoch(ctx),
        };

        event::emit(BundleCreated {
            bundle_id,
            creator: sender,
            title: bundle.title,
        });

        transfer::transfer(bundle, sender);
    }

    /// Record an affiliate click (called by backend relayer).
    public entry fun record_click(
        link: &mut ShopLink,
        ctx: &mut TxContext,
    ) {
        assert!(link.status == STATUS_ACTIVE, ELinkNotActive);
        link.total_clicks = link.total_clicks + 1;

        event::emit(ClickRecorded {
            link_id: object::uid_to_inner(&link.id),
            clicker: tx_context::sender(ctx),
        });
    }

    /// Record a confirmed conversion and commission (called by backend oracle
    /// after the affiliate network confirms the sale).
    public entry fun record_conversion(
        link: &mut ShopLink,
        commission: u64,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(link.creator == sender, ENotOwner);

        link.total_conversions = link.total_conversions + 1;
        link.total_commission = link.total_commission + commission;

        event::emit(ConversionRecorded {
            link_id: object::uid_to_inner(&link.id),
            commission,
        });
    }

    // ─── Accessors ────────────────────────────────────────────

    public fun creator(link: &ShopLink): address { link.creator }
    public fun total_clicks(link: &ShopLink): u64 { link.total_clicks }
    public fun total_conversions(link: &ShopLink): u64 { link.total_conversions }
    public fun total_commission(link: &ShopLink): u64 { link.total_commission }
}
