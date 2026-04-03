/// PlayNode: Pixel Grid — Advertising grid.
/// A shared PixelGrid contains blocks that advertisers purchase and renew.
/// An optional auction mechanism allows competitive bidding on premium slots.
module playnode::pixel_grid {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::dynamic_field;
    use sui::event;
    use std::string::String;

    // ─── Errors ───────────────────────────────────────────────
    const ENotOwner: u64 = 0;
    const EBlockAlreadyOwned: u64 = 1;
    const EInsufficientPayment: u64 = 2;
    const EBlockNotOwned: u64 = 3;
    const EAuctionNotActive: u64 = 4;
    const EBidTooLow: u64 = 5;
    const EAuctionNotEnded: u64 = 6;
    const EInvalidCoordinates: u64 = 7;

    // ─── Objects ──────────────────────────────────────────────

    /// The shared grid object. One per game page or global.
    public struct PixelGrid has key {
        id: UID,
        admin: address,
        /// Grid dimensions.
        width: u64,
        height: u64,
        /// Price per pixel-block in MIST.
        base_price: u64,
        /// Duration of one rental period (in epochs).
        rental_period: u64,
        total_revenue: u64,
        created_at: u64,
    }

    /// A purchased rectangular block on the grid.
    /// Stored as a dynamic field on PixelGrid keyed by (x, y) tuple encoded
    /// as a u128: (x << 64) | y.
    public struct PixelBlock has store, drop {
        owner: address,
        x: u64,
        y: u64,
        width: u64,
        height: u64,
        image_url: String,
        link_url: String,
        expires_at: u64,
    }

    /// An auction for a specific pixel-block coordinate.
    public struct Auction has key {
        id: UID,
        grid_id: ID,
        x: u64,
        y: u64,
        width: u64,
        height: u64,
        /// Current highest bidder.
        highest_bidder: address,
        highest_bid: u64,
        end_epoch: u64,
        active: bool,
    }

    // ─── Events ───────────────────────────────────────────────

    public struct GridCreated has copy, drop {
        grid_id: ID,
        admin: address,
        width: u64,
        height: u64,
    }

    public struct PixelsPurchased has copy, drop {
        grid_id: ID,
        buyer: address,
        x: u64,
        y: u64,
        width: u64,
        height: u64,
        amount: u64,
    }

    public struct PixelsRenewed has copy, drop {
        grid_id: ID,
        owner: address,
        x: u64,
        y: u64,
    }

    public struct AuctionStarted has copy, drop {
        auction_id: ID,
        grid_id: ID,
        x: u64,
        y: u64,
    }

    public struct AuctionClaimed has copy, drop {
        auction_id: ID,
        winner: address,
        amount: u64,
    }

    // ─── Helpers ──────────────────────────────────────────────

    /// Encode (x, y) into a single u128 key for dynamic field storage.
    fun coord_key(x: u64, y: u64): u128 {
        ((x as u128) << 64) | (y as u128)
    }

    // ─── Public entry functions ───────────────────────────────

    /// Create a new pixel grid (admin only — typically the platform address).
    public entry fun create_grid(
        width: u64,
        height: u64,
        base_price: u64,
        rental_period: u64,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let uid = object::new(ctx);
        let grid_id = object::uid_to_inner(&uid);

        let grid = PixelGrid {
            id: uid,
            admin: sender,
            width,
            height,
            base_price,
            rental_period,
            total_revenue: 0,
            created_at: tx_context::epoch(ctx),
        };

        event::emit(GridCreated {
            grid_id,
            admin: sender,
            width,
            height,
        });

        // Shared so anyone can purchase pixels.
        transfer::share_object(grid);
    }

    /// Purchase a rectangular block of pixels on the grid.
    public entry fun purchase_pixels(
        grid: &mut PixelGrid,
        x: u64,
        y: u64,
        width: u64,
        height: u64,
        image_url: String,
        link_url: String,
        payment: Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        // Validate coordinates are within grid bounds.
        assert!(x + width <= grid.width && y + height <= grid.height, EInvalidCoordinates);

        let key = coord_key(x, y);
        assert!(!dynamic_field::exists_(&grid.id, key), EBlockAlreadyOwned);

        let cost = grid.base_price * width * height;
        assert!(coin::value(&payment) >= cost, EInsufficientPayment);

        let buyer = tx_context::sender(ctx);
        let now = tx_context::epoch(ctx);

        let block = PixelBlock {
            owner: buyer,
            x,
            y,
            width,
            height,
            image_url,
            link_url,
            expires_at: now + grid.rental_period,
        };

        dynamic_field::add(&mut grid.id, key, block);
        grid.total_revenue = grid.total_revenue + coin::value(&payment);

        event::emit(PixelsPurchased {
            grid_id: object::uid_to_inner(&grid.id),
            buyer,
            x,
            y,
            width,
            height,
            amount: coin::value(&payment),
        });

        // Send payment to the grid admin.
        transfer::public_transfer(payment, grid.admin);
    }

    /// Renew an existing pixel block for another rental period.
    public entry fun renew_pixels(
        grid: &mut PixelGrid,
        x: u64,
        y: u64,
        payment: Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        let key = coord_key(x, y);
        assert!(dynamic_field::exists_(&grid.id, key), EBlockNotOwned);

        let block: &mut PixelBlock = dynamic_field::borrow_mut(&mut grid.id, key);
        assert!(block.owner == tx_context::sender(ctx), ENotOwner);

        let cost = grid.base_price * block.width * block.height;
        assert!(coin::value(&payment) >= cost, EInsufficientPayment);

        block.expires_at = block.expires_at + grid.rental_period;
        let block_owner = block.owner;
        // Drop the mutable borrow before borrowing grid.id immutably
        grid.total_revenue = grid.total_revenue + coin::value(&payment);

        let grid_id = object::uid_to_inner(&grid.id);
        event::emit(PixelsRenewed {
            grid_id,
            owner: block_owner,
            x,
            y,
        });

        transfer::public_transfer(payment, grid.admin);
    }

    /// Start an auction for a specific pixel-block slot.
    public entry fun start_auction(
        grid: &PixelGrid,
        x: u64,
        y: u64,
        width: u64,
        height: u64,
        duration_epochs: u64,
        ctx: &mut TxContext,
    ) {
        assert!(grid.admin == tx_context::sender(ctx), ENotOwner);
        assert!(x + width <= grid.width && y + height <= grid.height, EInvalidCoordinates);

        let uid = object::new(ctx);
        let auction_id = object::uid_to_inner(&uid);
        let grid_id = object::uid_to_inner(&grid.id);

        let auction = Auction {
            id: uid,
            grid_id,
            x,
            y,
            width,
            height,
            highest_bidder: tx_context::sender(ctx),
            highest_bid: 0,
            end_epoch: tx_context::epoch(ctx) + duration_epochs,
            active: true,
        };

        event::emit(AuctionStarted {
            auction_id,
            grid_id,
            x,
            y,
        });

        transfer::share_object(auction);
    }

    /// Claim an ended auction — the winner gets the pixel block allocated.
    public entry fun claim_auction(
        grid: &mut PixelGrid,
        auction: &mut Auction,
        image_url: String,
        link_url: String,
        ctx: &mut TxContext,
    ) {
        assert!(auction.active, EAuctionNotActive);
        assert!(tx_context::epoch(ctx) >= auction.end_epoch, EAuctionNotEnded);

        let key = coord_key(auction.x, auction.y);
        let block = PixelBlock {
            owner: auction.highest_bidder,
            x: auction.x,
            y: auction.y,
            width: auction.width,
            height: auction.height,
            image_url,
            link_url,
            expires_at: tx_context::epoch(ctx) + grid.rental_period,
        };

        dynamic_field::add(&mut grid.id, key, block);
        auction.active = false;

        event::emit(AuctionClaimed {
            auction_id: object::uid_to_inner(&auction.id),
            winner: auction.highest_bidder,
            amount: auction.highest_bid,
        });
    }

    // ─── Accessors ────────────────────────────────────────────

    public fun admin(grid: &PixelGrid): address { grid.admin }
    public fun total_revenue(grid: &PixelGrid): u64 { grid.total_revenue }
    public fun base_price(grid: &PixelGrid): u64 { grid.base_price }
}
