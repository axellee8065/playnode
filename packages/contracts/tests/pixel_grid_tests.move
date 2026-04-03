/// Tests for the playnode::pixel_grid module.
/// Covers grid creation, pixel purchases, renewals, and validation checks.
#[test_only]
module playnode::pixel_grid_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self};
    use sui::sui::SUI;
    use std::string;
    use playnode::pixel_grid::{Self, PixelGrid};

    const ADMIN: address = @0xA;
    const BUYER: address = @0xB;

    // Grid parameters for tests.
    const GRID_WIDTH: u64 = 100;
    const GRID_HEIGHT: u64 = 100;
    const BASE_PRICE: u64 = 1_000; // 1000 MIST per pixel block
    const RENTAL_PERIOD: u64 = 30; // 30 epochs

    // ─── Helpers ──────────────────────────────────────────────

    fun setup_grid(scenario: &mut Scenario) {
        ts::next_tx(scenario, ADMIN);
        {
            pixel_grid::create_grid(
                GRID_WIDTH,
                GRID_HEIGHT,
                BASE_PRICE,
                RENTAL_PERIOD,
                ts::ctx(scenario),
            );
        };
    }

    // ─── Tests ────────────────────────────────────────────────

    #[test]
    /// Creating a grid should produce a shared PixelGrid object.
    fun test_create_grid() {
        let mut scenario = ts::begin(ADMIN);
        setup_grid(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let grid = ts::take_shared<PixelGrid>(&scenario);
            assert!(pixel_grid::admin(&grid) == ADMIN, 0);
            assert!(pixel_grid::total_revenue(&grid) == 0, 1);
            assert!(pixel_grid::base_price(&grid) == BASE_PRICE, 2);
            ts::return_shared(grid);
        };

        ts::end(scenario);
    }

    #[test]
    /// Purchasing a 2x3 block should cost base_price * 2 * 3 = 6000 MIST.
    fun test_purchase_pixels() {
        let mut scenario = ts::begin(ADMIN);
        setup_grid(&mut scenario);

        ts::next_tx(&mut scenario, BUYER);
        {
            let mut grid = ts::take_shared<PixelGrid>(&scenario);
            // 2x3 block => cost = 1000 * 2 * 3 = 6000
            let payment = coin::mint_for_testing<SUI>(6_000, ts::ctx(&mut scenario));

            pixel_grid::purchase_pixels(
                &mut grid,
                10, 20,  // x, y
                2, 3,    // width, height
                string::utf8(b"https://img.example.com/ad.png"),
                string::utf8(b"https://example.com/product"),
                payment,
                ts::ctx(&mut scenario),
            );

            assert!(pixel_grid::total_revenue(&grid) == 6_000, 0);
            ts::return_shared(grid);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = playnode::pixel_grid::EInsufficientPayment)]
    /// Purchasing with insufficient payment should abort.
    fun test_purchase_pixels_insufficient_payment() {
        let mut scenario = ts::begin(ADMIN);
        setup_grid(&mut scenario);

        ts::next_tx(&mut scenario, BUYER);
        {
            let mut grid = ts::take_shared<PixelGrid>(&scenario);
            // 2x3 block needs 6000 but we only send 3000.
            let payment = coin::mint_for_testing<SUI>(3_000, ts::ctx(&mut scenario));

            pixel_grid::purchase_pixels(
                &mut grid,
                10, 20,
                2, 3,
                string::utf8(b"ad.png"),
                string::utf8(b"link"),
                payment,
                ts::ctx(&mut scenario),
            );

            ts::return_shared(grid);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = playnode::pixel_grid::EInvalidCoordinates)]
    /// Purchasing outside grid bounds should abort.
    fun test_purchase_pixels_out_of_bounds() {
        let mut scenario = ts::begin(ADMIN);
        setup_grid(&mut scenario);

        ts::next_tx(&mut scenario, BUYER);
        {
            let mut grid = ts::take_shared<PixelGrid>(&scenario);
            // x=99, width=2 => 99+2=101 > 100, out of bounds.
            let payment = coin::mint_for_testing<SUI>(2_000, ts::ctx(&mut scenario));

            pixel_grid::purchase_pixels(
                &mut grid,
                99, 0,
                2, 1,
                string::utf8(b"ad.png"),
                string::utf8(b"link"),
                payment,
                ts::ctx(&mut scenario),
            );

            ts::return_shared(grid);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = playnode::pixel_grid::EBlockAlreadyOwned)]
    /// Purchasing the same block twice should abort.
    fun test_purchase_pixels_already_owned() {
        let mut scenario = ts::begin(ADMIN);
        setup_grid(&mut scenario);

        // First purchase succeeds.
        ts::next_tx(&mut scenario, BUYER);
        {
            let mut grid = ts::take_shared<PixelGrid>(&scenario);
            let payment = coin::mint_for_testing<SUI>(1_000, ts::ctx(&mut scenario));
            pixel_grid::purchase_pixels(
                &mut grid,
                5, 5, 1, 1,
                string::utf8(b"ad.png"),
                string::utf8(b"link"),
                payment,
                ts::ctx(&mut scenario),
            );
            ts::return_shared(grid);
        };

        // Second purchase at same (x,y) should fail.
        ts::next_tx(&mut scenario, BUYER);
        {
            let mut grid = ts::take_shared<PixelGrid>(&scenario);
            let payment = coin::mint_for_testing<SUI>(1_000, ts::ctx(&mut scenario));
            pixel_grid::purchase_pixels(
                &mut grid,
                5, 5, 1, 1,
                string::utf8(b"ad2.png"),
                string::utf8(b"link2"),
                payment,
                ts::ctx(&mut scenario),
            );
            ts::return_shared(grid);
        };

        ts::end(scenario);
    }

    #[test]
    /// Renewing pixels should extend the expiry and add to total revenue.
    fun test_renew_pixels() {
        let mut scenario = ts::begin(ADMIN);
        setup_grid(&mut scenario);

        // Purchase first.
        ts::next_tx(&mut scenario, BUYER);
        {
            let mut grid = ts::take_shared<PixelGrid>(&scenario);
            let payment = coin::mint_for_testing<SUI>(1_000, ts::ctx(&mut scenario));
            pixel_grid::purchase_pixels(
                &mut grid,
                0, 0, 1, 1,
                string::utf8(b"ad.png"),
                string::utf8(b"link"),
                payment,
                ts::ctx(&mut scenario),
            );
            ts::return_shared(grid);
        };

        // Renew.
        ts::next_tx(&mut scenario, BUYER);
        {
            let mut grid = ts::take_shared<PixelGrid>(&scenario);
            let payment = coin::mint_for_testing<SUI>(1_000, ts::ctx(&mut scenario));
            pixel_grid::renew_pixels(
                &mut grid,
                0, 0,
                payment,
                ts::ctx(&mut scenario),
            );
            // Total revenue should now be 2000 (purchase + renewal).
            assert!(pixel_grid::total_revenue(&grid) == 2_000, 0);
            ts::return_shared(grid);
        };

        ts::end(scenario);
    }

    #[test]
    /// Starting an auction should create a shared Auction object.
    fun test_start_auction() {
        let mut scenario = ts::begin(ADMIN);
        setup_grid(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let grid = ts::take_shared<PixelGrid>(&scenario);
            pixel_grid::start_auction(
                &grid,
                50, 50,  // x, y
                5, 5,    // width, height
                10,      // duration in epochs
                ts::ctx(&mut scenario),
            );
            ts::return_shared(grid);
        };

        ts::end(scenario);
    }
}
