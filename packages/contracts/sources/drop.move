/// PlayNode: Drop — Guide / Walkthrough publication.
/// Creators publish Drops (game guides, walkthroughs, tips) that users can
/// purchase. Patches (updates) are appended via dynamic fields.
module playnode::drop {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::dynamic_field;
    use sui::event;
    use std::string::String;
    use playnode::node::{Self, Node};

    // ─── Errors ───────────────────────────────────────────────
    const ENotOwner: u64 = 0;
    const EInsufficientPayment: u64 = 1;
    const EDropNotActive: u64 = 2;

    // ─── Status constants ─────────────────────────────────────
    const STATUS_ACTIVE: u8 = 0;
    const STATUS_PAUSED: u8 = 1;
    const STATUS_ARCHIVED: u8 = 2;

    // ─── Objects ──────────────────────────────────────────────

    /// A published guide/walkthrough. Owned by the creator.
    public struct Drop has key, store {
        id: UID,
        creator: address,
        node_id: ID,
        title: String,
        description: String,
        game_id: String,
        /// Content URI (IPFS / Arweave hash).
        content_uri: String,
        /// Price in SUI minor units (MIST). 0 = free.
        price: u64,
        status: u8,
        total_purchases: u64,
        total_revenue: u64,
        total_views: u64,
        patch_count: u64,
        created_at: u64,
        updated_at: u64,
    }

    /// A content patch appended to a Drop via dynamic field.
    /// Key is the patch index (u64).
    public struct Patch has store, drop {
        content_uri: String,
        description: String,
        created_at: u64,
    }

    /// Receipt given to purchasers as proof of access.
    public struct PurchaseReceipt has key, store {
        id: UID,
        drop_id: ID,
        buyer: address,
        amount_paid: u64,
        purchased_at: u64,
    }

    // ─── Events ───────────────────────────────────────────────

    public struct DropPublished has copy, drop {
        drop_id: ID,
        creator: address,
        title: String,
        price: u64,
    }

    public struct DropPurchased has copy, drop {
        drop_id: ID,
        buyer: address,
        amount: u64,
    }

    public struct DropUpdated has copy, drop {
        drop_id: ID,
        title: String,
    }

    public struct PatchAdded has copy, drop {
        drop_id: ID,
        patch_index: u64,
    }

    // ─── Public entry functions ───────────────────────────────

    /// Publish a new Drop. The creator must pass their Node so we can update
    /// lifetime stats.
    public entry fun publish_drop(
        creator_node: &mut Node,
        title: String,
        description: String,
        game_id: String,
        content_uri: String,
        price: u64,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(node::owner(creator_node) == sender, ENotOwner);

        let uid = object::new(ctx);
        let drop_id = object::uid_to_inner(&uid);
        let now = tx_context::epoch(ctx);

        let new_drop = Drop {
            id: uid,
            creator: sender,
            node_id: object::id(creator_node),
            title,
            description,
            game_id,
            content_uri,
            price,
            status: STATUS_ACTIVE,
            total_purchases: 0,
            total_revenue: 0,
            total_views: 0,
            patch_count: 0,
            created_at: now,
            updated_at: now,
        };

        // Increment drop counter on the creator's Node.
        node::increment_drops(creator_node);

        event::emit(DropPublished {
            drop_id,
            creator: sender,
            title: new_drop.title,
            price,
        });

        transfer::transfer(new_drop, sender);
    }

    /// Purchase access to a Drop by paying the listed price.
    /// Payment goes to the creator; a PurchaseReceipt is minted for the buyer.
    public entry fun purchase_drop(
        drop: &mut Drop,
        payment: Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        assert!(drop.status == STATUS_ACTIVE, EDropNotActive);
        let paid = coin::value(&payment);
        assert!(paid >= drop.price, EInsufficientPayment);

        // Transfer payment to the creator.
        transfer::public_transfer(payment, drop.creator);

        drop.total_purchases = drop.total_purchases + 1;
        drop.total_revenue = drop.total_revenue + paid;

        let buyer = tx_context::sender(ctx);

        event::emit(DropPurchased {
            drop_id: object::uid_to_inner(&drop.id),
            buyer,
            amount: paid,
        });

        // Mint a receipt for the buyer.
        let receipt = PurchaseReceipt {
            id: object::new(ctx),
            drop_id: object::uid_to_inner(&drop.id),
            buyer,
            amount_paid: paid,
            purchased_at: tx_context::epoch(ctx),
        };
        transfer::transfer(receipt, buyer);
    }

    /// Update metadata of an existing Drop (owner only).
    public entry fun update_drop(
        drop: &mut Drop,
        title: String,
        description: String,
        content_uri: String,
        price: u64,
        ctx: &mut TxContext,
    ) {
        assert!(drop.creator == tx_context::sender(ctx), ENotOwner);

        drop.title = title;
        drop.description = description;
        drop.content_uri = content_uri;
        drop.price = price;
        drop.updated_at = tx_context::epoch(ctx);

        event::emit(DropUpdated {
            drop_id: object::uid_to_inner(&drop.id),
            title: drop.title,
        });
    }

    /// Append a content patch (e.g. updated strategies after a game patch).
    public entry fun add_patch(
        drop: &mut Drop,
        content_uri: String,
        description: String,
        ctx: &mut TxContext,
    ) {
        assert!(drop.creator == tx_context::sender(ctx), ENotOwner);

        let patch_index = drop.patch_count;
        let patch = Patch {
            content_uri,
            description,
            created_at: tx_context::epoch(ctx),
        };

        dynamic_field::add(&mut drop.id, patch_index, patch);
        drop.patch_count = drop.patch_count + 1;
        drop.updated_at = tx_context::epoch(ctx);

        event::emit(PatchAdded {
            drop_id: object::uid_to_inner(&drop.id),
            patch_index,
        });
    }

    // ─── Accessors ────────────────────────────────────────────

    public fun creator(drop: &Drop): address { drop.creator }
    public fun price(drop: &Drop): u64 { drop.price }
    public fun total_revenue(drop: &Drop): u64 { drop.total_revenue }
    public fun total_purchases(drop: &Drop): u64 { drop.total_purchases }
    public fun status(drop: &Drop): u8 { drop.status }
}
