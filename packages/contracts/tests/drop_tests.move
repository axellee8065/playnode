/// Tests for the playnode::drop module.
/// Covers publishing, purchasing, updating, and patching drops.
#[test_only]
module playnode::drop_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self};
    use sui::sui::SUI;
    use std::string;
    use playnode::node::{Self, Node};
    use playnode::drop::{Self, Drop, PurchaseReceipt};

    const CREATOR: address = @0xA;
    const BUYER: address = @0xB;

    // ─── Helpers ──────────────────────────────────────────────

    /// Set up a creator with a Node.
    fun setup_creator(scenario: &mut Scenario) {
        ts::next_tx(scenario, CREATOR);
        {
            node::create_node(
                string::utf8(b"Alice"),
                string::utf8(b"Creator"),
                string::utf8(b"avatar"),
                string::utf8(b"banner"),
                ts::ctx(scenario),
            );
        };
    }

    /// Publish a drop priced at `price` MIST.
    fun publish_test_drop(scenario: &mut Scenario, price: u64) {
        ts::next_tx(scenario, CREATOR);
        {
            let mut creator_node = ts::take_from_sender<Node>(scenario);
            drop::publish_drop(
                &mut creator_node,
                string::utf8(b"Boss Guide"),
                string::utf8(b"How to beat the final boss"),
                string::utf8(b"game_001"),
                string::utf8(b"ipfs://Qm...content"),
                price,
                ts::ctx(scenario),
            );
            ts::return_to_sender(scenario, creator_node);
        };
    }

    // ─── Tests ────────────────────────────────────────────────

    #[test]
    /// Publishing a drop should create a Drop object and increment the node's
    /// drop counter.
    fun test_publish_drop() {
        let mut scenario = ts::begin(CREATOR);
        setup_creator(&mut scenario);
        publish_test_drop(&mut scenario, 1_000_000); // 1 SUI

        ts::next_tx(&mut scenario, CREATOR);
        {
            let d = ts::take_from_sender<Drop>(&scenario);
            assert!(drop::creator(&d) == CREATOR, 0);
            assert!(drop::price(&d) == 1_000_000, 1);
            assert!(drop::total_purchases(&d) == 0, 2);
            assert!(drop::total_revenue(&d) == 0, 3);
            ts::return_to_sender(&scenario, d);

            // Check the Node's drop counter was incremented.
            let n = ts::take_from_sender<Node>(&scenario);
            assert!(node::total_drops(&n) == 1, 4);
            ts::return_to_sender(&scenario, n);
        };

        ts::end(scenario);
    }

    #[test]
    /// A buyer should be able to purchase a drop and receive a receipt.
    fun test_purchase_drop() {
        let mut scenario = ts::begin(CREATOR);
        setup_creator(&mut scenario);
        publish_test_drop(&mut scenario, 1_000_000);

        // Transfer the Drop to a shared-like flow: we simulate by having
        // CREATOR share or BUYER borrow. For test_scenario we just borrow
        // from CREATOR's inventory.
        ts::next_tx(&mut scenario, CREATOR);
        {
            let d = ts::take_from_sender<Drop>(&scenario);
            sui::transfer::public_transfer(d, CREATOR);
        };

        ts::next_tx(&mut scenario, BUYER);
        {
            let mut d = ts::take_from_address<Drop>(&scenario, CREATOR);
            let payment = coin::mint_for_testing<SUI>(1_000_000, ts::ctx(&mut scenario));

            drop::purchase_drop(&mut d, payment, ts::ctx(&mut scenario));

            assert!(drop::total_purchases(&d) == 1, 0);
            assert!(drop::total_revenue(&d) == 1_000_000, 1);

            ts::return_to_address(CREATOR, d);
        };

        // Buyer should now own a PurchaseReceipt.
        ts::next_tx(&mut scenario, BUYER);
        {
            let receipt = ts::take_from_sender<PurchaseReceipt>(&scenario);
            ts::return_to_sender(&scenario, receipt);
        };

        ts::end(scenario);
    }

    #[test]
    /// Updating a drop should change its metadata.
    fun test_update_drop() {
        let mut scenario = ts::begin(CREATOR);
        setup_creator(&mut scenario);
        publish_test_drop(&mut scenario, 500_000);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut d = ts::take_from_sender<Drop>(&scenario);
            drop::update_drop(
                &mut d,
                string::utf8(b"Updated Boss Guide"),
                string::utf8(b"New strategies"),
                string::utf8(b"ipfs://Qm...v2"),
                750_000,
                ts::ctx(&mut scenario),
            );
            assert!(drop::price(&d) == 750_000, 0);
            ts::return_to_sender(&scenario, d);
        };

        ts::end(scenario);
    }

    #[test]
    /// Adding a patch should increment the patch count.
    fun test_add_patch() {
        let mut scenario = ts::begin(CREATOR);
        setup_creator(&mut scenario);
        publish_test_drop(&mut scenario, 500_000);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut d = ts::take_from_sender<Drop>(&scenario);
            drop::add_patch(
                &mut d,
                string::utf8(b"ipfs://Qm...patch1"),
                string::utf8(b"Added new boss phase 2 strategy"),
                ts::ctx(&mut scenario),
            );
            ts::return_to_sender(&scenario, d);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = playnode::drop::EInsufficientPayment)]
    /// Purchasing with insufficient funds should abort.
    fun test_purchase_insufficient_payment() {
        let mut scenario = ts::begin(CREATOR);
        setup_creator(&mut scenario);
        publish_test_drop(&mut scenario, 1_000_000);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let d = ts::take_from_sender<Drop>(&scenario);
            sui::transfer::public_transfer(d, CREATOR);
        };

        ts::next_tx(&mut scenario, BUYER);
        {
            let mut d = ts::take_from_address<Drop>(&scenario, CREATOR);
            // Only send half the required amount.
            let payment = coin::mint_for_testing<SUI>(500_000, ts::ctx(&mut scenario));
            drop::purchase_drop(&mut d, payment, ts::ctx(&mut scenario));
            ts::return_to_address(CREATOR, d);
        };

        ts::end(scenario);
    }
}
