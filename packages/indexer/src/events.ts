import { SuiClient, SuiEvent } from "@mysten/sui/client";
import { prisma } from "./db.js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SUI_RPC_URL = process.env.SUI_RPC_URL ?? "https://fullnode.testnet.sui.io:443";
const PACKAGE_ID = process.env.PLAYNODE_PACKAGE_ID ?? "";

const client = new SuiClient({ url: SUI_RPC_URL });

// ---------------------------------------------------------------------------
// Event types emitted by PlayNode Move contracts
// ---------------------------------------------------------------------------

const EVENT_TYPES = {
  NODE_CREATED: `${PACKAGE_ID}::node::NodeCreated`,
  NODE_UPDATED: `${PACKAGE_ID}::node::NodeUpdated`,
  DROP_CREATED: `${PACKAGE_ID}::drop::DropCreated`,
  DROP_UPDATED: `${PACKAGE_ID}::drop::DropUpdated`,
  REVIEW_CREATED: `${PACKAGE_ID}::review::ReviewCreated`,
  SHOP_LINK_CREATED: `${PACKAGE_ID}::shop::ShopLinkCreated`,
  PIXEL_BLOCK_PURCHASED: `${PACKAGE_ID}::pixel_grid::PixelBlockPurchased`,
  SUBSCRIPTION_CREATED: `${PACKAGE_ID}::subscription::SubscriptionCreated`,
  QUEST_CREATED: `${PACKAGE_ID}::quest::QuestCreated`,
  QUEST_UPDATED: `${PACKAGE_ID}::quest::QuestUpdated`,
  PURCHASE_COMPLETED: `${PACKAGE_ID}::drop::PurchaseCompleted`,
  REVENUE_DISTRIBUTED: `${PACKAGE_ID}::revenue::RevenueDistributed`,
} as const;

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleNodeCreated(event: SuiEvent) {
  const data = event.parsedJson as Record<string, unknown>;
  await prisma.node.upsert({
    where: { id: data.id as string },
    create: {
      id: data.id as string,
      owner: data.owner as string,
      displayName: data.display_name as string,
      bio: (data.bio as string) ?? null,
      avatarUrl: (data.avatar_url as string) ?? null,
      bannerUrl: (data.banner_url as string) ?? null,
      createdAt: new Date(Number(data.created_at ?? Date.now())),
    },
    update: {
      owner: data.owner as string,
      displayName: data.display_name as string,
    },
  });
  console.log(`[events] Node created: ${data.id}`);
}

async function handleNodeUpdated(event: SuiEvent) {
  const data = event.parsedJson as Record<string, unknown>;
  await prisma.node.update({
    where: { id: data.id as string },
    data: {
      displayName: (data.display_name as string) ?? undefined,
      bio: data.bio as string | null,
      avatarUrl: data.avatar_url as string | null,
      bannerUrl: data.banner_url as string | null,
      rank: data.rank !== undefined ? Number(data.rank) : undefined,
      reputation: data.reputation !== undefined ? Number(data.reputation) : undefined,
    },
  });
  console.log(`[events] Node updated: ${data.id}`);
}

async function handleDropCreated(event: SuiEvent) {
  const data = event.parsedJson as Record<string, unknown>;
  await prisma.drop.upsert({
    where: { id: data.id as string },
    create: {
      id: data.id as string,
      nodeId: data.node_id as string,
      author: data.author as string,
      title: data.title as string,
      contentHash: data.content_hash as string,
      walrusBlobId: data.walrus_blob_id as string,
      category: Number(data.category ?? 0),
      gameTag: data.game_tag as string,
      price: BigInt(data.price as string ?? "0"),
      isPremium: Boolean(data.is_premium ?? false),
      createdAt: new Date(Number(data.created_at ?? Date.now())),
    },
    update: {},
  });

  await prisma.node.update({
    where: { id: data.node_id as string },
    data: { totalDrops: { increment: 1 } },
  });

  console.log(`[events] Drop created: ${data.id}`);
}

async function handleDropUpdated(event: SuiEvent) {
  const data = event.parsedJson as Record<string, unknown>;
  await prisma.drop.update({
    where: { id: data.id as string },
    data: {
      title: data.title as string | undefined,
      contentHash: data.content_hash as string | undefined,
      walrusBlobId: data.walrus_blob_id as string | undefined,
      price: data.price !== undefined ? BigInt(data.price as string) : undefined,
      version: data.version !== undefined ? Number(data.version) : undefined,
    },
  });
  console.log(`[events] Drop updated: ${data.id}`);
}

async function handleReviewCreated(event: SuiEvent) {
  const data = event.parsedJson as Record<string, unknown>;
  await prisma.review.upsert({
    where: { id: data.id as string },
    create: {
      id: data.id as string,
      nodeId: data.node_id as string,
      author: data.author as string,
      gameTag: data.game_tag as string,
      rating: Number(data.rating ?? 0),
      categoryRatings: data.category_ratings ?? {},
      contentHash: data.content_hash as string,
      walrusBlobId: data.walrus_blob_id as string,
      verifiedPlaytimeHours: Number(data.verified_playtime_hours ?? 0),
      verificationLevel: Number(data.verification_level ?? 0),
      verificationHash: (data.verification_hash as string) ?? null,
      createdAt: new Date(Number(data.created_at ?? Date.now())),
    },
    update: {},
  });

  await prisma.node.update({
    where: { id: data.node_id as string },
    data: { totalReviews: { increment: 1 } },
  });

  console.log(`[events] Review created: ${data.id}`);
}

async function handleShopLinkCreated(event: SuiEvent) {
  const data = event.parsedJson as Record<string, unknown>;
  await prisma.shopLink.upsert({
    where: { id: data.id as string },
    create: {
      id: data.id as string,
      nodeId: data.node_id as string,
      dropId: (data.drop_id as string) ?? null,
      creator: data.creator as string,
      gameId: data.game_id as string,
      gameTitle: data.game_title as string,
      store: Number(data.store ?? 0),
      affiliateUrl: data.affiliate_url as string,
      commissionRateBps: Number(data.commission_rate_bps ?? 0),
    },
    update: {},
  });
  console.log(`[events] ShopLink created: ${data.id}`);
}

async function handlePixelBlockPurchased(event: SuiEvent) {
  const data = event.parsedJson as Record<string, unknown>;
  await prisma.pixelBlock.upsert({
    where: { id: data.id as string },
    create: {
      id: data.id as string,
      gridId: data.grid_id as string,
      owner: data.owner as string,
      x: Number(data.x ?? 0),
      y: Number(data.y ?? 0),
      width: Number(data.width ?? 1),
      height: Number(data.height ?? 1),
      pixelCount: Number(data.pixel_count ?? 1),
      imageUrl: data.image_url as string,
      linkUrl: data.link_url as string,
      pricePaid: BigInt(data.price_paid as string ?? "0"),
      expiresAt: new Date(Number(data.expires_at ?? Date.now())),
      createdAt: new Date(Number(data.created_at ?? Date.now())),
    },
    update: {},
  });

  await prisma.pixelGrid.update({
    where: { id: data.grid_id as string },
    data: {
      soldPixels: { increment: Number(data.pixel_count ?? 1) },
      totalRevenue: { increment: BigInt(data.price_paid as string ?? "0") },
    },
  });

  console.log(`[events] PixelBlock purchased: ${data.id}`);
}

async function handleSubscriptionCreated(event: SuiEvent) {
  const data = event.parsedJson as Record<string, unknown>;
  await prisma.subscription.upsert({
    where: { id: data.id as string },
    create: {
      id: data.id as string,
      subscriber: data.subscriber as string,
      nodeId: data.node_id as string,
      pricePerMonth: BigInt(data.price_per_month as string ?? "0"),
      startedAt: new Date(Number(data.started_at ?? Date.now())),
      expiresAt: new Date(Number(data.expires_at ?? Date.now())),
      autoRenew: Boolean(data.auto_renew ?? true),
    },
    update: {},
  });
  console.log(`[events] Subscription created: ${data.id}`);
}

async function handleQuestCreated(event: SuiEvent) {
  const data = event.parsedJson as Record<string, unknown>;
  await prisma.quest.upsert({
    where: { id: data.id as string },
    create: {
      id: data.id as string,
      creator: data.creator as string,
      title: data.title as string,
      description: data.description as string,
      gameTag: data.game_tag as string,
      rewardAmount: BigInt(data.reward_amount as string ?? "0"),
      escrowBalance: BigInt(data.escrow_balance as string ?? "0"),
      minRank: Number(data.min_rank ?? 1),
      deadline: new Date(Number(data.deadline ?? Date.now())),
      createdAt: new Date(Number(data.created_at ?? Date.now())),
    },
    update: {},
  });
  console.log(`[events] Quest created: ${data.id}`);
}

async function handleQuestUpdated(event: SuiEvent) {
  const data = event.parsedJson as Record<string, unknown>;
  await prisma.quest.update({
    where: { id: data.id as string },
    data: {
      status: data.status !== undefined ? Number(data.status) : undefined,
      assignedTo: (data.assigned_to as string) ?? undefined,
      resultDropId: (data.result_drop_id as string) ?? undefined,
      escrowBalance: data.escrow_balance !== undefined
        ? BigInt(data.escrow_balance as string)
        : undefined,
    },
  });
  console.log(`[events] Quest updated: ${data.id}`);
}

async function handlePurchaseCompleted(event: SuiEvent) {
  const data = event.parsedJson as Record<string, unknown>;
  await prisma.purchase.create({
    data: {
      dropId: data.drop_id as string,
      buyer: data.buyer as string,
      pricePaid: BigInt(data.price_paid as string ?? "0"),
      txDigest: event.id.txDigest,
    },
  });

  await prisma.drop.update({
    where: { id: data.drop_id as string },
    data: {
      totalPurchases: { increment: 1 },
      totalEarned: { increment: BigInt(data.price_paid as string ?? "0") },
    },
  });

  console.log(`[events] Purchase completed for drop: ${data.drop_id}`);
}

async function handleRevenueDistributed(event: SuiEvent) {
  const data = event.parsedJson as Record<string, unknown>;
  await prisma.revenueEvent.create({
    data: {
      source: data.source as string,
      sourceId: data.source_id as string,
      amount: BigInt(data.amount as string ?? "0"),
      creatorAddr: data.creator_addr as string,
      creatorAmt: BigInt(data.creator_amt as string ?? "0"),
      protocolAmt: BigInt(data.protocol_amt as string ?? "0"),
      referralAddr: (data.referral_addr as string) ?? null,
      referralAmt: data.referral_amt ? BigInt(data.referral_amt as string) : null,
      txDigest: event.id.txDigest,
    },
  });

  // Update the creator node's totalEarned
  const node = await prisma.node.findFirst({
    where: { owner: data.creator_addr as string },
  });
  if (node) {
    await prisma.node.update({
      where: { id: node.id },
      data: { totalEarned: { increment: BigInt(data.creator_amt as string ?? "0") } },
    });
  }

  console.log(`[events] Revenue distributed: ${data.amount} for ${data.source}`);
}

// ---------------------------------------------------------------------------
// Event router
// ---------------------------------------------------------------------------

async function routeEvent(event: SuiEvent) {
  const type = event.type;

  try {
    if (type === EVENT_TYPES.NODE_CREATED) await handleNodeCreated(event);
    else if (type === EVENT_TYPES.NODE_UPDATED) await handleNodeUpdated(event);
    else if (type === EVENT_TYPES.DROP_CREATED) await handleDropCreated(event);
    else if (type === EVENT_TYPES.DROP_UPDATED) await handleDropUpdated(event);
    else if (type === EVENT_TYPES.REVIEW_CREATED) await handleReviewCreated(event);
    else if (type === EVENT_TYPES.SHOP_LINK_CREATED) await handleShopLinkCreated(event);
    else if (type === EVENT_TYPES.PIXEL_BLOCK_PURCHASED) await handlePixelBlockPurchased(event);
    else if (type === EVENT_TYPES.SUBSCRIPTION_CREATED) await handleSubscriptionCreated(event);
    else if (type === EVENT_TYPES.QUEST_CREATED) await handleQuestCreated(event);
    else if (type === EVENT_TYPES.QUEST_UPDATED) await handleQuestUpdated(event);
    else if (type === EVENT_TYPES.PURCHASE_COMPLETED) await handlePurchaseCompleted(event);
    else if (type === EVENT_TYPES.REVENUE_DISTRIBUTED) await handleRevenueDistributed(event);
    else console.log(`[events] Unhandled event type: ${type}`);
  } catch (err) {
    console.error(`[events] Error handling event ${type}:`, err);
  }
}

// ---------------------------------------------------------------------------
// Subscription loop
// ---------------------------------------------------------------------------

let cursor: { txDigest: string; eventSeq: string } | null = null;
let running = false;

async function pollEvents() {
  if (!PACKAGE_ID) {
    console.warn("[events] PLAYNODE_PACKAGE_ID not set, skipping event polling");
    return;
  }

  try {
    const result = await client.queryEvents({
      query: { MoveModule: { package: PACKAGE_ID, module: "node" } },
      cursor: cursor ?? undefined,
      limit: 50,
      order: "ascending",
    });

    for (const event of result.data) {
      await routeEvent(event);
    }

    if (result.hasNextPage && result.nextCursor) {
      cursor = result.nextCursor;
    }
  } catch (err) {
    console.error("[events] Polling error:", err);
  }
}

export async function startEventListener() {
  if (!PACKAGE_ID) {
    console.warn("[events] PLAYNODE_PACKAGE_ID not set. Event listener disabled.");
    console.warn("[events] Set PLAYNODE_PACKAGE_ID env var to enable on-chain indexing.");
    return;
  }

  console.log(`[events] Starting event listener for package ${PACKAGE_ID}`);
  console.log(`[events] RPC: ${SUI_RPC_URL}`);
  running = true;

  const poll = async () => {
    while (running) {
      await pollEvents();
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  };

  // Run in background, don't block server startup
  poll().catch((err) => {
    console.error("[events] Fatal polling error:", err);
    running = false;
  });
}

export function stopEventListener() {
  running = false;
  console.log("[events] Event listener stopped");
}
