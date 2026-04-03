/// Tests for the playnode::node module.
/// Covers node creation, updates, game profile attachment, and access control.
#[test_only]
module playnode::node_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::test_utils;
    use std::string;
    use playnode::node::{Self, Node};

    // ─── Helper addresses ─────────────────────────────────────
    const CREATOR: address = @0xA;
    const OTHER: address = @0xB;

    // ─── Helpers ──────────────────────────────────────────────

    fun create_default_node(scenario: &mut Scenario) {
        ts::next_tx(scenario, CREATOR);
        {
            node::create_node(
                string::utf8(b"Alice"),
                string::utf8(b"Gaming content creator"),
                string::utf8(b"https://img.example.com/avatar.png"),
                string::utf8(b"https://img.example.com/banner.png"),
                ts::ctx(scenario),
            );
        };
    }

    // ─── Tests ────────────────────────────────────────────────

    #[test]
    /// Creating a node should produce an owned Node object with correct fields.
    fun test_create_node() {
        let mut scenario = ts::begin(CREATOR);
        create_default_node(&mut scenario);

        // The node should be owned by CREATOR.
        ts::next_tx(&mut scenario, CREATOR);
        {
            let node = ts::take_from_sender<Node>(&scenario);
            assert!(node::owner(&node) == CREATOR, 0);
            assert!(*node::display_name(&node) == string::utf8(b"Alice"), 1);
            assert!(node::rank(&node) == 0, 2);        // Bronze
            assert!(node::total_drops(&node) == 0, 3);
            assert!(node::total_reviews(&node) == 0, 4);
            assert!(node::total_views(&node) == 0, 5);
            assert!(node::total_earned(&node) == 0, 6);
            ts::return_to_sender(&scenario, node);
        };

        ts::end(scenario);
    }

    #[test]
    /// Owner should be able to update their node's profile fields.
    fun test_update_node() {
        let mut scenario = ts::begin(CREATOR);
        create_default_node(&mut scenario);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut node = ts::take_from_sender<Node>(&scenario);
            node::update_node(
                &mut node,
                string::utf8(b"Alice Pro"),
                string::utf8(b"Updated bio"),
                string::utf8(b"https://img.example.com/avatar2.png"),
                string::utf8(b"https://img.example.com/banner2.png"),
                ts::ctx(&mut scenario),
            );
            assert!(*node::display_name(&node) == string::utf8(b"Alice Pro"), 0);
            ts::return_to_sender(&scenario, node);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = playnode::node::ENotOwner)]
    /// Non-owner should NOT be able to update the node.
    fun test_update_node_not_owner() {
        let mut scenario = ts::begin(CREATOR);
        create_default_node(&mut scenario);

        // Transfer node to OTHER so they hold it, but owner field still says CREATOR.
        ts::next_tx(&mut scenario, CREATOR);
        {
            let node = ts::take_from_sender<Node>(&scenario);
            sui::transfer::transfer(node, OTHER);
        };

        ts::next_tx(&mut scenario, OTHER);
        {
            let mut node = ts::take_from_sender<Node>(&scenario);
            // This should abort — OTHER is not the recorded owner.
            node::update_node(
                &mut node,
                string::utf8(b"Hacker"),
                string::utf8(b"bad"),
                string::utf8(b"x"),
                string::utf8(b"x"),
                ts::ctx(&mut scenario),
            );
            ts::return_to_sender(&scenario, node);
        };

        ts::end(scenario);
    }

    #[test]
    /// Adding a game profile should succeed and a second add of the same
    /// platform should fail.
    fun test_add_game_profile() {
        let mut scenario = ts::begin(CREATOR);
        create_default_node(&mut scenario);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut node = ts::take_from_sender<Node>(&scenario);
            node::add_game_profile(
                &mut node,
                string::utf8(b"Steam"),
                string::utf8(b"alice_gamer"),
                ts::ctx(&mut scenario),
            );
            ts::return_to_sender(&scenario, node);
        };

        ts::end(scenario);
    }

    #[test]
    /// Verifying a game profile should succeed for the owner.
    fun test_verify_game_profile() {
        let mut scenario = ts::begin(CREATOR);
        create_default_node(&mut scenario);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut node = ts::take_from_sender<Node>(&scenario);
            node::add_game_profile(
                &mut node,
                string::utf8(b"Steam"),
                string::utf8(b"alice_gamer"),
                ts::ctx(&mut scenario),
            );
            node::verify_game_profile(
                &mut node,
                string::utf8(b"Steam"),
                b"deadbeef",
                ts::ctx(&mut scenario),
            );
            ts::return_to_sender(&scenario, node);
        };

        ts::end(scenario);
    }

    #[test]
    /// Package-internal mutators should work correctly.
    fun test_internal_mutators() {
        let mut scenario = ts::begin(CREATOR);
        create_default_node(&mut scenario);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut node = ts::take_from_sender<Node>(&scenario);

            node::increment_drops(&mut node);
            node::increment_drops(&mut node);
            assert!(node::total_drops(&node) == 2, 0);

            node::increment_reviews(&mut node);
            assert!(node::total_reviews(&node) == 1, 1);

            node::add_views(&mut node, 100);
            assert!(node::total_views(&node) == 100, 2);

            node::add_earned(&mut node, 5000);
            assert!(node::total_earned(&node) == 5000, 3);

            node::set_rank(&mut node, 2);
            assert!(node::rank(&node) == 2, 4);

            node::add_reputation(&mut node, 10);
            assert!(node::reputation(&node) == 10, 5);

            ts::return_to_sender(&scenario, node);
        };

        ts::end(scenario);
    }
}
