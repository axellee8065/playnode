/// PlayNode: Creator Node — the profile hub for every creator on the platform.
/// Each creator mints exactly one Node object that serves as their on-chain identity.
/// Game profiles (Steam, Riot, etc.) are attached via dynamic fields.
module playnode::node {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::dynamic_field;
    use sui::event;
    use std::string::String;

    // ─── Errors ───────────────────────────────────────────────
    const ENotOwner: u64 = 0;
    const EProfileAlreadyExists: u64 = 1;
    const EProfileNotFound: u64 = 2;

    // ─── Objects ──────────────────────────────────────────────

    /// The primary creator identity object. Owned by the creator's address.
    public struct Node has key {
        id: UID,
        owner: address,
        display_name: String,
        bio: String,
        avatar_url: String,
        banner_url: String,
        /// Rank tier encoded as u8 (0=Bronze … 4=Master).
        rank: u8,
        reputation: u64,
        total_drops: u64,
        total_reviews: u64,
        total_views: u64,
        /// Lifetime earnings in USDC minor units.
        total_earned: u64,
        created_at: u64,
    }

    /// A game-platform identity attached to a Node via dynamic field.
    /// Key for the dynamic field is the platform String.
    public struct GameProfile has store, drop {
        platform: String,
        username: String,
        verified: bool,
        verification_hash: vector<u8>,
        verified_at: u64,
    }

    // ─── Events ───────────────────────────────────────────────

    public struct NodeCreated has copy, drop {
        node_id: ID,
        owner: address,
        display_name: String,
    }

    public struct NodeUpdated has copy, drop {
        node_id: ID,
        display_name: String,
    }

    public struct GameProfileAdded has copy, drop {
        node_id: ID,
        platform: String,
    }

    public struct GameProfileVerified has copy, drop {
        node_id: ID,
        platform: String,
    }

    // ─── Public entry functions ───────────────────────────────

    /// Mint a new creator Node. The sender becomes the owner and the object
    /// is transferred to them.
    public entry fun create_node(
        display_name: String,
        bio: String,
        avatar_url: String,
        banner_url: String,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let uid = object::new(ctx);
        let node_id = object::uid_to_inner(&uid);

        let node = Node {
            id: uid,
            owner: sender,
            display_name,
            bio,
            avatar_url,
            banner_url,
            rank: 0, // Bronze by default
            reputation: 0,
            total_drops: 0,
            total_reviews: 0,
            total_views: 0,
            total_earned: 0,
            created_at: tx_context::epoch(ctx),
        };

        event::emit(NodeCreated {
            node_id,
            owner: sender,
            display_name: node.display_name,
        });

        transfer::transfer(node, sender);
    }

    /// Update the mutable profile fields of a Node. Only the owner may call.
    public entry fun update_node(
        node: &mut Node,
        display_name: String,
        bio: String,
        avatar_url: String,
        banner_url: String,
        ctx: &mut TxContext,
    ) {
        assert!(node.owner == tx_context::sender(ctx), ENotOwner);

        node.display_name = display_name;
        node.bio = bio;
        node.avatar_url = avatar_url;
        node.banner_url = banner_url;

        event::emit(NodeUpdated {
            node_id: object::uid_to_inner(&node.id),
            display_name: node.display_name,
        });
    }

    /// Attach a game-platform profile to the Node (unverified initially).
    public entry fun add_game_profile(
        node: &mut Node,
        platform: String,
        username: String,
        ctx: &mut TxContext,
    ) {
        assert!(node.owner == tx_context::sender(ctx), ENotOwner);
        // Prevent duplicate platform entries.
        assert!(!dynamic_field::exists_(&node.id, platform), EProfileAlreadyExists);

        let profile = GameProfile {
            platform,
            username,
            verified: false,
            verification_hash: vector::empty<u8>(),
            verified_at: 0,
        };

        event::emit(GameProfileAdded {
            node_id: object::uid_to_inner(&node.id),
            platform: profile.platform,
        });

        dynamic_field::add(&mut node.id, platform, profile);
    }

    /// Mark a previously-added game profile as verified (oracle / backend call).
    /// In production this would be restricted to a trusted verifier capability;
    /// here the owner triggers it after off-chain verification.
    public entry fun verify_game_profile(
        node: &mut Node,
        platform: String,
        verification_hash: vector<u8>,
        ctx: &mut TxContext,
    ) {
        assert!(node.owner == tx_context::sender(ctx), ENotOwner);
        assert!(dynamic_field::exists_(&node.id, platform), EProfileNotFound);

        let profile: &mut GameProfile = dynamic_field::borrow_mut(&mut node.id, platform);
        profile.verified = true;
        profile.verification_hash = verification_hash;
        profile.verified_at = tx_context::epoch(ctx);

        event::emit(GameProfileVerified {
            node_id: object::uid_to_inner(&node.id),
            platform,
        });
    }

    // ─── Accessors (used by other modules in the package) ─────

    public fun owner(node: &Node): address { node.owner }
    public fun display_name(node: &Node): &String { &node.display_name }
    public fun rank(node: &Node): u8 { node.rank }
    public fun reputation(node: &Node): u64 { node.reputation }
    public fun total_drops(node: &Node): u64 { node.total_drops }
    public fun total_reviews(node: &Node): u64 { node.total_reviews }
    public fun total_views(node: &Node): u64 { node.total_views }
    public fun total_earned(node: &Node): u64 { node.total_earned }

    // ─── Package-internal mutators ────────────────────────────

    public(package) fun increment_drops(node: &mut Node) {
        node.total_drops = node.total_drops + 1;
    }

    public(package) fun increment_reviews(node: &mut Node) {
        node.total_reviews = node.total_reviews + 1;
    }

    public(package) fun add_views(node: &mut Node, count: u64) {
        node.total_views = node.total_views + count;
    }

    public(package) fun add_earned(node: &mut Node, amount: u64) {
        node.total_earned = node.total_earned + amount;
    }

    public(package) fun set_rank(node: &mut Node, new_rank: u8) {
        node.rank = new_rank;
    }

    public(package) fun add_reputation(node: &mut Node, amount: u64) {
        node.reputation = node.reputation + amount;
    }
}
