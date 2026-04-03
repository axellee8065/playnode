/// Tests for the playnode::revenue module.
/// Verifies that revenue splits are calculated correctly per the PRD
/// basis-point rates.
#[test_only]
module playnode::revenue_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self};
    use sui::sui::SUI;
    use playnode::revenue::{Self, RevenueConfig};

    const ADMIN: address = @0xA;
    const CREATOR: address = @0xB;
    const PLATFORM: address = @0xC;
    const COMMUNITY: address = @0xD;
    const AFFILIATE: address = @0xE;

    // ─── Helpers ──────────────────────────────────────────────

    fun setup_config(scenario: &mut Scenario) {
        ts::next_tx(scenario, ADMIN);
        {
            revenue::create_config(
                PLATFORM,
                COMMUNITY,
                AFFILIATE,
                ts::ctx(scenario),
            );
        };
    }

    // ─── Tests ────────────────────────────────────────────────

    #[test]
    /// Creating a revenue config should produce a shared object.
    fun test_create_config() {
        let mut scenario = ts::begin(ADMIN);
        setup_config(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let config = ts::take_shared<RevenueConfig>(&scenario);
            assert!(revenue::admin(&config) == ADMIN, 0);
            assert!(revenue::total_distributed(&config) == 0, 1);
            ts::return_shared(config);
        };

        ts::end(scenario);
    }

    #[test]
    /// Drop revenue split: Creator 85%, Platform 10%, Community 5%.
    /// With 10,000 MIST input the split should be 8500 / 1000 / 500.
    fun test_distribute_drop_revenue() {
        let mut scenario = ts::begin(ADMIN);
        setup_config(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<RevenueConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(10_000, ts::ctx(&mut scenario));

            revenue::distribute_drop_revenue(
                &mut config,
                CREATOR,
                payment,
                ts::ctx(&mut scenario),
            );

            assert!(revenue::total_distributed(&config) == 10_000, 0);
            ts::return_shared(config);
        };

        // Verify CREATOR received 8500.
        ts::next_tx(&mut scenario, CREATOR);
        {
            let coin = ts::take_from_sender<sui::coin::Coin<SUI>>(&scenario);
            assert!(coin::value(&coin) == 8_500, 1);
            ts::return_to_sender(&scenario, coin);
        };

        // Verify PLATFORM received 1000.
        ts::next_tx(&mut scenario, PLATFORM);
        {
            let coin = ts::take_from_sender<sui::coin::Coin<SUI>>(&scenario);
            assert!(coin::value(&coin) == 1_000, 2);
            ts::return_to_sender(&scenario, coin);
        };

        // Verify COMMUNITY received 500.
        ts::next_tx(&mut scenario, COMMUNITY);
        {
            let coin = ts::take_from_sender<sui::coin::Coin<SUI>>(&scenario);
            assert!(coin::value(&coin) == 500, 3);
            ts::return_to_sender(&scenario, coin);
        };

        ts::end(scenario);
    }

    #[test]
    /// Grid revenue split: Admin 70%, Platform 20%, Community 10%.
    fun test_distribute_grid_revenue() {
        let mut scenario = ts::begin(ADMIN);
        setup_config(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<RevenueConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(10_000, ts::ctx(&mut scenario));

            revenue::distribute_grid_revenue(
                &mut config,
                CREATOR, // grid admin
                payment,
                ts::ctx(&mut scenario),
            );

            assert!(revenue::total_distributed(&config) == 10_000, 0);
            ts::return_shared(config);
        };

        // Grid admin (CREATOR) gets 7000.
        ts::next_tx(&mut scenario, CREATOR);
        {
            let coin = ts::take_from_sender<sui::coin::Coin<SUI>>(&scenario);
            assert!(coin::value(&coin) == 7_000, 1);
            ts::return_to_sender(&scenario, coin);
        };

        // Platform gets 2000.
        ts::next_tx(&mut scenario, PLATFORM);
        {
            let coin = ts::take_from_sender<sui::coin::Coin<SUI>>(&scenario);
            assert!(coin::value(&coin) == 2_000, 2);
            ts::return_to_sender(&scenario, coin);
        };

        // Community gets 1000.
        ts::next_tx(&mut scenario, COMMUNITY);
        {
            let coin = ts::take_from_sender<sui::coin::Coin<SUI>>(&scenario);
            assert!(coin::value(&coin) == 1_000, 3);
            ts::return_to_sender(&scenario, coin);
        };

        ts::end(scenario);
    }

    #[test]
    /// Shop revenue split: Creator 70%, Platform 15%, Affiliate 15%.
    fun test_distribute_shop_revenue() {
        let mut scenario = ts::begin(ADMIN);
        setup_config(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<RevenueConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(10_000, ts::ctx(&mut scenario));

            revenue::distribute_shop_revenue(
                &mut config,
                CREATOR,
                payment,
                ts::ctx(&mut scenario),
            );

            ts::return_shared(config);
        };

        // Creator gets 7000.
        ts::next_tx(&mut scenario, CREATOR);
        {
            let coin = ts::take_from_sender<sui::coin::Coin<SUI>>(&scenario);
            assert!(coin::value(&coin) == 7_000, 0);
            ts::return_to_sender(&scenario, coin);
        };

        // Platform gets 1500.
        ts::next_tx(&mut scenario, PLATFORM);
        {
            let coin = ts::take_from_sender<sui::coin::Coin<SUI>>(&scenario);
            assert!(coin::value(&coin) == 1_500, 1);
            ts::return_to_sender(&scenario, coin);
        };

        // Affiliate gets remainder = 1500.
        ts::next_tx(&mut scenario, AFFILIATE);
        {
            let coin = ts::take_from_sender<sui::coin::Coin<SUI>>(&scenario);
            assert!(coin::value(&coin) == 1_500, 2);
            ts::return_to_sender(&scenario, coin);
        };

        ts::end(scenario);
    }

    #[test]
    /// Quest revenue split: Creator 80%, Platform 15%, Community 5%.
    fun test_distribute_quest_revenue() {
        let mut scenario = ts::begin(ADMIN);
        setup_config(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<RevenueConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(10_000, ts::ctx(&mut scenario));

            revenue::distribute_quest_revenue(
                &mut config,
                CREATOR,
                payment,
                ts::ctx(&mut scenario),
            );

            ts::return_shared(config);
        };

        // Creator gets 8000.
        ts::next_tx(&mut scenario, CREATOR);
        {
            let coin = ts::take_from_sender<sui::coin::Coin<SUI>>(&scenario);
            assert!(coin::value(&coin) == 8_000, 0);
            ts::return_to_sender(&scenario, coin);
        };

        // Platform gets 1500.
        ts::next_tx(&mut scenario, PLATFORM);
        {
            let coin = ts::take_from_sender<sui::coin::Coin<SUI>>(&scenario);
            assert!(coin::value(&coin) == 1_500, 1);
            ts::return_to_sender(&scenario, coin);
        };

        // Community gets 500.
        ts::next_tx(&mut scenario, COMMUNITY);
        {
            let coin = ts::take_from_sender<sui::coin::Coin<SUI>>(&scenario);
            assert!(coin::value(&coin) == 500, 2);
            ts::return_to_sender(&scenario, coin);
        };

        ts::end(scenario);
    }

    #[test]
    /// Rounding test: with an odd amount the remainder should go to the
    /// third recipient (community/affiliate).
    fun test_rounding_remainder() {
        let mut scenario = ts::begin(ADMIN);
        setup_config(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut config = ts::take_shared<RevenueConfig>(&scenario);
            // Use 9999 to test rounding. Drop: 85% = 8499, 10% = 999,
            // remainder = 9999 - 8499 - 999 = 501.
            let payment = coin::mint_for_testing<SUI>(9_999, ts::ctx(&mut scenario));
            revenue::distribute_drop_revenue(
                &mut config,
                CREATOR,
                payment,
                ts::ctx(&mut scenario),
            );
            ts::return_shared(config);
        };

        ts::next_tx(&mut scenario, CREATOR);
        {
            let coin = ts::take_from_sender<sui::coin::Coin<SUI>>(&scenario);
            // 9999 * 8500 / 10000 = 8499 (integer division)
            assert!(coin::value(&coin) == 8_499, 0);
            ts::return_to_sender(&scenario, coin);
        };

        ts::next_tx(&mut scenario, PLATFORM);
        {
            let coin = ts::take_from_sender<sui::coin::Coin<SUI>>(&scenario);
            // 9999 * 1000 / 10000 = 999
            assert!(coin::value(&coin) == 999, 1);
            ts::return_to_sender(&scenario, coin);
        };

        ts::next_tx(&mut scenario, COMMUNITY);
        {
            let coin = ts::take_from_sender<sui::coin::Coin<SUI>>(&scenario);
            // remainder: 9999 - 8499 - 999 = 501
            assert!(coin::value(&coin) == 501, 2);
            ts::return_to_sender(&scenario, coin);
        };

        ts::end(scenario);
    }
}
