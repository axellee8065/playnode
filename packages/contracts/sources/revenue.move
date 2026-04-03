/// PlayNode: Revenue — USDC revenue distribution router.
/// Splits incoming payments among creator, platform, and other stakeholders
/// using basis-point rates defined in RevenueConfig.
///
/// Basis-point split rates (per PRD):
///   Drop revenue:   Creator 85%, Platform 10%, Community Pool 5%
///   Grid revenue:   Grid admin 70%, Platform 20%, Community Pool 10%
///   Shop revenue:   Creator 70%, Platform 15%, Affiliate Network 15%
///   Quest revenue:  Creator 80%, Platform 15%, Community Pool 5%
module playnode::revenue {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;

    // ─── Errors ───────────────────────────────────────────────
    const ENotAdmin: u64 = 0;
    const EInvalidSplit: u64 = 1;
    const EZeroAmount: u64 = 2;

    // ─── Basis-point constants (1 bp = 0.01%) ─────────────────
    const BPS_TOTAL: u64 = 10_000;

    // Default splits — Drop
    const DROP_CREATOR_BPS: u64 = 8_500;   // 85%
    const DROP_PLATFORM_BPS: u64 = 1_000;  // 10%
    const DROP_COMMUNITY_BPS: u64 = 500;   //  5%

    // Default splits — Grid
    const GRID_ADMIN_BPS: u64 = 7_000;     // 70%
    const GRID_PLATFORM_BPS: u64 = 2_000;  // 20%
    const GRID_COMMUNITY_BPS: u64 = 1_000; // 10%

    // Default splits — Shop
    const SHOP_CREATOR_BPS: u64 = 7_000;   // 70%
    const SHOP_PLATFORM_BPS: u64 = 1_500;  // 15%
    const SHOP_AFFILIATE_BPS: u64 = 1_500; // 15%

    // Default splits — Quest
    const QUEST_CREATOR_BPS: u64 = 8_000;  // 80%
    const QUEST_PLATFORM_BPS: u64 = 1_500; // 15%
    const QUEST_COMMUNITY_BPS: u64 = 500;  //  5%

    // ─── Objects ──────────────────────────────────────────────

    /// Shared singleton that stores the platform addresses and split rates.
    struct RevenueConfig has key {
        id: UID,
        admin: address,
        /// Platform treasury address.
        platform_address: address,
        /// Community pool / DAO treasury address.
        community_address: address,
        /// Affiliate network settlement address.
        affiliate_address: address,
        // Drop splits
        drop_creator_bps: u64,
        drop_platform_bps: u64,
        drop_community_bps: u64,
        // Grid splits
        grid_admin_bps: u64,
        grid_platform_bps: u64,
        grid_community_bps: u64,
        // Shop splits
        shop_creator_bps: u64,
        shop_platform_bps: u64,
        shop_affiliate_bps: u64,
        // Quest splits
        quest_creator_bps: u64,
        quest_platform_bps: u64,
        quest_community_bps: u64,
        // Lifetime stats
        total_distributed: u64,
    }

    // ─── Events ───────────────────────────────────────────────

    struct RevenueDistributed has copy, drop {
        category: u8,  // 0=drop, 1=grid, 2=shop, 3=quest
        total_amount: u64,
        creator_share: u64,
        platform_share: u64,
        other_share: u64,
    }

    struct ConfigCreated has copy, drop {
        config_id: ID,
        admin: address,
    }

    // ─── Category constants ───────────────────────────────────
    const CATEGORY_DROP: u8 = 0;
    const CATEGORY_GRID: u8 = 1;
    const CATEGORY_SHOP: u8 = 2;
    const CATEGORY_QUEST: u8 = 3;

    // ─── Initialisation ───────────────────────────────────────

    /// Create the shared RevenueConfig singleton. Should be called once at
    /// deploy time by the platform admin.
    public entry fun create_config(
        platform_address: address,
        community_address: address,
        affiliate_address: address,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let uid = object::new(ctx);
        let config_id = object::uid_to_inner(&uid);

        let config = RevenueConfig {
            id: uid,
            admin: sender,
            platform_address,
            community_address,
            affiliate_address,
            drop_creator_bps: DROP_CREATOR_BPS,
            drop_platform_bps: DROP_PLATFORM_BPS,
            drop_community_bps: DROP_COMMUNITY_BPS,
            grid_admin_bps: GRID_ADMIN_BPS,
            grid_platform_bps: GRID_PLATFORM_BPS,
            grid_community_bps: GRID_COMMUNITY_BPS,
            shop_creator_bps: SHOP_CREATOR_BPS,
            shop_platform_bps: SHOP_PLATFORM_BPS,
            shop_affiliate_bps: SHOP_AFFILIATE_BPS,
            quest_creator_bps: QUEST_CREATOR_BPS,
            quest_platform_bps: QUEST_PLATFORM_BPS,
            quest_community_bps: QUEST_COMMUNITY_BPS,
            total_distributed: 0,
        };

        event::emit(ConfigCreated { config_id, admin: sender });
        transfer::share_object(config);
    }

    // ─── Internal split helper ────────────────────────────────

    /// Split a coin into three portions by basis points and transfer them.
    /// Returns nothing — all coins are transferred inside.
    fun split_and_send(
        payment: Coin<SUI>,
        addr_a: address,
        bps_a: u64,
        addr_b: address,
        bps_b: u64,
        addr_c: address,
        _bps_c: u64,
        ctx: &mut TxContext,
    ): (u64, u64, u64) {
        let total = coin::value(&payment);
        assert!(total > 0, EZeroAmount);

        let share_a = (total * bps_a) / BPS_TOTAL;
        let share_b = (total * bps_b) / BPS_TOTAL;
        // Remainder goes to the third party to avoid dust from rounding.
        let share_c = total - share_a - share_b;

        let coin_a = coin::split(&mut payment, share_a, ctx);
        let coin_b = coin::split(&mut payment, share_b, ctx);
        // The remainder stays in `payment`.

        transfer::public_transfer(coin_a, addr_a);
        transfer::public_transfer(coin_b, addr_b);
        transfer::public_transfer(payment, addr_c);

        (share_a, share_b, share_c)
    }

    // ─── Distribution functions ───────────────────────────────

    /// Distribute revenue from a Drop purchase.
    public entry fun distribute_drop_revenue(
        config: &mut RevenueConfig,
        creator: address,
        payment: Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        let total = coin::value(&payment);
        let (cs, ps, os) = split_and_send(
            payment,
            creator,
            config.drop_creator_bps,
            config.platform_address,
            config.drop_platform_bps,
            config.community_address,
            config.drop_community_bps,
            ctx,
        );

        config.total_distributed = config.total_distributed + total;

        event::emit(RevenueDistributed {
            category: CATEGORY_DROP,
            total_amount: total,
            creator_share: cs,
            platform_share: ps,
            other_share: os,
        });
    }

    /// Distribute revenue from pixel-grid sales.
    public entry fun distribute_grid_revenue(
        config: &mut RevenueConfig,
        grid_admin: address,
        payment: Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        let total = coin::value(&payment);
        let (cs, ps, os) = split_and_send(
            payment,
            grid_admin,
            config.grid_admin_bps,
            config.platform_address,
            config.grid_platform_bps,
            config.community_address,
            config.grid_community_bps,
            ctx,
        );

        config.total_distributed = config.total_distributed + total;

        event::emit(RevenueDistributed {
            category: CATEGORY_GRID,
            total_amount: total,
            creator_share: cs,
            platform_share: ps,
            other_share: os,
        });
    }

    /// Distribute revenue from affiliate shop commissions.
    public entry fun distribute_shop_revenue(
        config: &mut RevenueConfig,
        creator: address,
        payment: Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        let total = coin::value(&payment);
        let (cs, ps, os) = split_and_send(
            payment,
            creator,
            config.shop_creator_bps,
            config.platform_address,
            config.shop_platform_bps,
            config.affiliate_address,
            config.shop_affiliate_bps,
            ctx,
        );

        config.total_distributed = config.total_distributed + total;

        event::emit(RevenueDistributed {
            category: CATEGORY_SHOP,
            total_amount: total,
            creator_share: cs,
            platform_share: ps,
            other_share: os,
        });
    }

    /// Distribute revenue from quest bounties.
    public entry fun distribute_quest_revenue(
        config: &mut RevenueConfig,
        creator: address,
        payment: Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        let total = coin::value(&payment);
        let (cs, ps, os) = split_and_send(
            payment,
            creator,
            config.quest_creator_bps,
            config.platform_address,
            config.quest_platform_bps,
            config.community_address,
            config.quest_community_bps,
            ctx,
        );

        config.total_distributed = config.total_distributed + total;

        event::emit(RevenueDistributed {
            category: CATEGORY_QUEST,
            total_amount: total,
            creator_share: cs,
            platform_share: ps,
            other_share: os,
        });
    }

    // ─── Accessors ────────────────────────────────────────────

    public fun total_distributed(config: &RevenueConfig): u64 { config.total_distributed }
    public fun admin(config: &RevenueConfig): address { config.admin }
}
