import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper: deterministic fake Sui object ID
function suiId(n: number): string {
  return "0x" + n.toString(16).padStart(64, "0");
}

// Helper: USDC amount (6 decimals)
function usdc(dollars: number): bigint {
  return BigInt(Math.round(dollars * 1_000_000));
}

// Helper: recent date within last N days
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log("Seeding PlayNode database...");

  // ── Nodes (Creators) ──────────────────────────────────────────────

  const node1 = await prisma.node.upsert({
    where: { id: suiId(1) },
    update: {},
    create: {
      id: suiId(1),
      owner: suiId(1001),
      displayName: "GameMaster_KR",
      bio: "Monster Hunter & Souls-like specialist creator. Charge Blade artisan.",
      avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=GameMasterKR",
      bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200",
      rank: 4, // Diamond
      reputation: 9200,
      totalDrops: 47,
      totalReviews: 12,
      totalViews: BigInt(284000),
      totalEarned: usdc(4280),
      createdAt: daysAgo(120),
    },
  });

  const node2 = await prisma.node.upsert({
    where: { id: suiId(2) },
    update: {},
    create: {
      id: suiId(2),
      owner: suiId(1002),
      displayName: "StellarGuide",
      bio: "Stellar Blade & Final Fantasy series walkthrough specialist.",
      avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=StellarGuide",
      bannerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200",
      rank: 3, // Gold
      reputation: 5800,
      totalDrops: 23,
      totalReviews: 8,
      totalViews: BigInt(156000),
      totalEarned: usdc(2140),
      createdAt: daysAgo(90),
    },
  });

  const node3 = await prisma.node.upsert({
    where: { id: suiId(3) },
    update: {},
    create: {
      id: suiId(3),
      owner: suiId(1003),
      displayName: "IndieHunter_99",
      bio: "Indie game discovery & review specialist. Finding hidden gems for you.",
      avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=IndieHunter99",
      bannerUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200",
      rank: 2, // Silver
      reputation: 3100,
      totalDrops: 15,
      totalReviews: 22,
      totalViews: BigInt(89000),
      totalEarned: usdc(920),
      createdAt: daysAgo(60),
    },
  });

  console.log("  ✓ 3 Nodes created");

  // ── Drops (Guides) ────────────────────────────────────────────────

  const drops = await Promise.all([
    prisma.drop.upsert({
      where: { id: suiId(101) },
      update: {},
      create: {
        id: suiId(101),
        nodeId: node1.id,
        author: node1.owner,
        title: "Monster Hunter Wilds: Charge Blade Master Guide",
        contentHash: "QmFakeHash101",
        walrusBlobId: "walrus_blob_101",
        category: 0, // boss
        gameTag: "monster-hunter-wilds",
        price: usdc(3.99),
        isPremium: true,
        totalViews: BigInt(24300),
        totalPurchases: 842,
        totalEarned: usdc(3.99 * 842),
        version: 3,
        createdAt: daysAgo(28),
      },
    }),
    prisma.drop.upsert({
      where: { id: suiId(102) },
      update: {},
      create: {
        id: suiId(102),
        nodeId: node1.id,
        author: node1.owner,
        title: "Elden Ring DLC: Shadow of the Erdtree Boss Guide",
        contentHash: "QmFakeHash102",
        walrusBlobId: "walrus_blob_102",
        category: 0,
        gameTag: "elden-ring",
        price: usdc(4.99),
        isPremium: true,
        totalViews: BigInt(18700),
        totalPurchases: 623,
        totalEarned: usdc(4.99 * 623),
        version: 2,
        createdAt: daysAgo(21),
      },
    }),
    prisma.drop.upsert({
      where: { id: suiId(103) },
      update: {},
      create: {
        id: suiId(103),
        nodeId: node1.id,
        author: node1.owner,
        title: "Monster Hunter Wilds: Bow Build Guide Season 2",
        contentHash: "QmFakeHash103",
        walrusBlobId: "walrus_blob_103",
        category: 1, // build
        gameTag: "monster-hunter-wilds",
        price: usdc(2.99),
        isPremium: true,
        totalViews: BigInt(12100),
        totalPurchases: 401,
        totalEarned: usdc(2.99 * 401),
        version: 1,
        createdAt: daysAgo(14),
      },
    }),
    prisma.drop.upsert({
      where: { id: suiId(104) },
      update: {},
      create: {
        id: suiId(104),
        nodeId: node2.id,
        author: node2.owner,
        title: "Stellar Blade: All Bosses No-Hit Guide",
        contentHash: "QmFakeHash104",
        walrusBlobId: "walrus_blob_104",
        category: 0,
        gameTag: "stellar-blade",
        price: usdc(3.49),
        isPremium: true,
        totalViews: BigInt(8400),
        totalPurchases: 241,
        totalEarned: usdc(3.49 * 241),
        version: 1,
        createdAt: daysAgo(18),
      },
    }),
    prisma.drop.upsert({
      where: { id: suiId(105) },
      update: {},
      create: {
        id: suiId(105),
        nodeId: node2.id,
        author: node2.owner,
        title: "FF7 Rebirth: Hard Mode Complete Walkthrough",
        contentHash: "QmFakeHash105",
        walrusBlobId: "walrus_blob_105",
        category: 5, // general
        gameTag: "ff7-rebirth",
        price: BigInt(0),
        isPremium: false,
        totalViews: BigInt(15200),
        totalPurchases: 0,
        totalEarned: BigInt(0),
        version: 1,
        createdAt: daysAgo(25),
      },
    }),
    prisma.drop.upsert({
      where: { id: suiId(106) },
      update: {},
      create: {
        id: suiId(106),
        nodeId: node3.id,
        author: node3.owner,
        title: "Palworld: Best Pal Tier List v3",
        contentHash: "QmFakeHash106",
        walrusBlobId: "walrus_blob_106",
        category: 3, // tier_list
        gameTag: "palworld",
        price: BigInt(0),
        isPremium: false,
        totalViews: BigInt(22800),
        totalPurchases: 0,
        totalEarned: BigInt(0),
        version: 3,
        createdAt: daysAgo(10),
      },
    }),
    prisma.drop.upsert({
      where: { id: suiId(107) },
      update: {},
      create: {
        id: suiId(107),
        nodeId: node3.id,
        author: node3.owner,
        title: "Hollow Knight: Silksong Hidden Boss Guide",
        contentHash: "QmFakeHash107",
        walrusBlobId: "walrus_blob_107",
        category: 0,
        gameTag: "hollow-knight-silksong",
        price: usdc(1.99),
        isPremium: true,
        totalViews: BigInt(6300),
        totalPurchases: 316,
        totalEarned: usdc(1.99 * 316),
        version: 1,
        createdAt: daysAgo(7),
      },
    }),
    prisma.drop.upsert({
      where: { id: suiId(108) },
      update: {},
      create: {
        id: suiId(108),
        nodeId: node1.id,
        author: node1.owner,
        title: "GTA VI: 100% Mission Complete Guide",
        contentHash: "QmFakeHash108",
        walrusBlobId: "walrus_blob_108",
        category: 2, // quest
        gameTag: "gta-vi",
        price: usdc(5.99),
        isPremium: true,
        totalViews: BigInt(31200),
        totalPurchases: 1087,
        totalEarned: usdc(5.99 * 1087),
        version: 1,
        createdAt: daysAgo(3),
      },
    }),
  ]);

  console.log("  ✓ 8 Drops created");

  // ── Reviews ───────────────────────────────────────────────────────

  await Promise.all([
    prisma.review.upsert({
      where: { id: suiId(201) },
      update: {},
      create: {
        id: suiId(201),
        nodeId: node1.id,
        author: node1.owner,
        gameTag: "elden-ring",
        rating: 87,
        categoryRatings: { gameplay: 90, graphics: 85, story: 82, sound: 88, value: 90 },
        contentHash: "QmFakeReview201",
        walrusBlobId: "walrus_review_201",
        verifiedPlaytimeHours: 842,
        verificationLevel: 3, // Expert
        helpfulCount: 234,
        totalViews: BigInt(4200),
        totalEarned: usdc(12.5),
        createdAt: daysAgo(20),
      },
    }),
    prisma.review.upsert({
      where: { id: suiId(202) },
      update: {},
      create: {
        id: suiId(202),
        nodeId: node1.id,
        author: node1.owner,
        gameTag: "monster-hunter-wilds",
        rating: 92,
        categoryRatings: { gameplay: 95, graphics: 88, story: 80, sound: 92, value: 95 },
        contentHash: "QmFakeReview202",
        walrusBlobId: "walrus_review_202",
        verifiedPlaytimeHours: 1240,
        verificationLevel: 4, // Master
        helpfulCount: 567,
        totalViews: BigInt(8900),
        totalEarned: usdc(28.0),
        createdAt: daysAgo(15),
      },
    }),
    prisma.review.upsert({
      where: { id: suiId(203) },
      update: {},
      create: {
        id: suiId(203),
        nodeId: node2.id,
        author: node2.owner,
        gameTag: "stellar-blade",
        rating: 78,
        categoryRatings: { gameplay: 82, graphics: 90, story: 65, sound: 78, value: 75 },
        contentHash: "QmFakeReview203",
        walrusBlobId: "walrus_review_203",
        verifiedPlaytimeHours: 120,
        verificationLevel: 2, // Experienced
        helpfulCount: 89,
        totalViews: BigInt(2100),
        totalEarned: usdc(5.0),
        createdAt: daysAgo(18),
      },
    }),
    prisma.review.upsert({
      where: { id: suiId(204) },
      update: {},
      create: {
        id: suiId(204),
        nodeId: node2.id,
        author: node2.owner,
        gameTag: "ff7-rebirth",
        rating: 85,
        categoryRatings: { gameplay: 88, graphics: 92, story: 90, sound: 85, value: 80 },
        contentHash: "QmFakeReview204",
        walrusBlobId: "walrus_review_204",
        verifiedPlaytimeHours: 95,
        verificationLevel: 2,
        helpfulCount: 156,
        totalViews: BigInt(3400),
        totalEarned: usdc(8.0),
        createdAt: daysAgo(22),
      },
    }),
    prisma.review.upsert({
      where: { id: suiId(205) },
      update: {},
      create: {
        id: suiId(205),
        nodeId: node3.id,
        author: node3.owner,
        gameTag: "hollow-knight-silksong",
        rating: 95,
        categoryRatings: { gameplay: 97, graphics: 90, story: 95, sound: 96, value: 98 },
        contentHash: "QmFakeReview205",
        walrusBlobId: "walrus_review_205",
        verifiedPlaytimeHours: 280,
        verificationLevel: 3,
        helpfulCount: 412,
        totalViews: BigInt(5600),
        totalEarned: usdc(15.0),
        createdAt: daysAgo(12),
      },
    }),
    prisma.review.upsert({
      where: { id: suiId(206) },
      update: {},
      create: {
        id: suiId(206),
        nodeId: node3.id,
        author: node3.owner,
        gameTag: "hades-2",
        rating: 88,
        categoryRatings: { gameplay: 92, graphics: 85, story: 88, sound: 90, value: 85 },
        contentHash: "QmFakeReview206",
        walrusBlobId: "walrus_review_206",
        verifiedPlaytimeHours: 160,
        verificationLevel: 3,
        helpfulCount: 198,
        totalViews: BigInt(3800),
        totalEarned: usdc(10.0),
        createdAt: daysAgo(8),
      },
    }),
  ]);

  console.log("  ✓ 6 Reviews created");

  // ── ShopLinks ─────────────────────────────────────────────────────

  await Promise.all([
    prisma.shopLink.upsert({
      where: { id: suiId(301) },
      update: {},
      create: {
        id: suiId(301),
        nodeId: node1.id,
        dropId: drops[0].id, // MH Wilds guide
        creator: node1.owner,
        gameId: "steam-2246340",
        gameTitle: "Monster Hunter Wilds",
        store: 0, // Steam
        affiliateUrl: "https://store.steampowered.com/app/2246340?ref=playnode_gm",
        commissionRateBps: 500, // 5%
        totalClicks: 1823,
        totalConversions: 142,
        totalEarned: usdc(59.99 * 142 * 0.05),
      },
    }),
    prisma.shopLink.upsert({
      where: { id: suiId(302) },
      update: {},
      create: {
        id: suiId(302),
        nodeId: node1.id,
        dropId: drops[1].id, // Elden Ring guide
        creator: node1.owner,
        gameId: "steam-1245620",
        gameTitle: "Elden Ring",
        store: 0,
        affiliateUrl: "https://store.steampowered.com/app/1245620?ref=playnode_gm",
        commissionRateBps: 500,
        totalClicks: 945,
        totalConversions: 78,
        totalEarned: usdc(39.99 * 78 * 0.05),
      },
    }),
    prisma.shopLink.upsert({
      where: { id: suiId(303) },
      update: {},
      create: {
        id: suiId(303),
        nodeId: node2.id,
        dropId: drops[3].id, // Stellar Blade guide
        creator: node2.owner,
        gameId: "ps-stellar-blade",
        gameTitle: "Stellar Blade",
        store: 3, // Direct (PS Store)
        affiliateUrl: "https://store.playstation.com/stellar-blade?ref=playnode_sg",
        commissionRateBps: 300, // 3%
        totalClicks: 512,
        totalConversions: 34,
        totalEarned: usdc(69.99 * 34 * 0.03),
      },
    }),
    prisma.shopLink.upsert({
      where: { id: suiId(304) },
      update: {},
      create: {
        id: suiId(304),
        nodeId: node3.id,
        dropId: drops[6].id, // Hollow Knight guide
        creator: node3.owner,
        gameId: "steam-hollow-knight-silksong",
        gameTitle: "Hollow Knight: Silksong",
        store: 0,
        affiliateUrl: "https://store.steampowered.com/app/silksong?ref=playnode_ih",
        commissionRateBps: 500,
        totalClicks: 287,
        totalConversions: 21,
        totalEarned: usdc(29.99 * 21 * 0.05),
      },
    }),
  ]);

  console.log("  ✓ 4 ShopLinks created");

  // ── Quests ────────────────────────────────────────────────────────

  await Promise.all([
    prisma.quest.upsert({
      where: { id: suiId(401) },
      update: {},
      create: {
        id: suiId(401),
        creator: suiId(2001),
        title: "Write a MH Wilds Charge Blade Guide",
        description:
          "Write a Charge Blade weapon master guide for Monster Hunter Wilds. Cover beginner to advanced techniques. Video content required.",
        gameTag: "monster-hunter-wilds",
        rewardAmount: usdc(200),
        escrowBalance: usdc(200),
        minRank: 3, // Gold+
        deadline: new Date("2026-04-30"),
        status: 0, // Open
        createdAt: daysAgo(5),
      },
    }),
    prisma.quest.upsert({
      where: { id: suiId(402) },
      update: {},
      create: {
        id: suiId(402),
        creator: suiId(2002),
        title: "Elden Ring DLC Boss Guide Translation",
        description:
          "Translate the Shadow of the Erdtree DLC boss walkthrough guide. Original in English, minimum 5000 words.",
        gameTag: "elden-ring",
        rewardAmount: usdc(150),
        escrowBalance: usdc(150),
        minRank: 2, // Silver+
        deadline: new Date("2026-04-20"),
        status: 0,
        createdAt: daysAgo(3),
      },
    }),
    prisma.quest.upsert({
      where: { id: suiId(403) },
      update: {},
      create: {
        id: suiId(403),
        creator: suiId(2003),
        title: "Create an Indie Game Curation Bundle",
        description:
          "Create a curated bundle of the TOP 10 indie games for H1 2026. Include a mini review for each game.",
        gameTag: "indie-games",
        rewardAmount: usdc(100),
        escrowBalance: usdc(100),
        minRank: 1, // Bronze+
        deadline: new Date("2026-05-15"),
        status: 1, // InProgress
        assignedTo: node3.owner,
        createdAt: daysAgo(10),
      },
    }),
  ]);

  console.log("  ✓ 3 Quests created");

  // ── PixelGrids & Blocks ───────────────────────────────────────────

  const grid1 = await prisma.pixelGrid.upsert({
    where: { id: suiId(501) },
    update: {},
    create: {
      id: suiId(501),
      parentType: 0, // Node
      parentId: node1.id,
      nodeId: node1.id,
      width: 20,
      height: 10,
      totalPixels: 200,
      soldPixels: 70, // 35%
      basePrice: usdc(0.5),
      monthlyViews: BigInt(42000),
      totalRevenue: usdc(35),
    },
  });

  const grid2 = await prisma.pixelGrid.upsert({
    where: { id: suiId(502) },
    update: {},
    create: {
      id: suiId(502),
      parentType: 1, // Drop
      parentId: drops[0].id,
      dropId: drops[0].id,
      width: 20,
      height: 10,
      totalPixels: 200,
      soldPixels: 24,
      basePrice: usdc(0.25),
      monthlyViews: BigInt(24300),
      totalRevenue: usdc(6),
    },
  });

  // Pixel blocks for grid1 (GameMaster_KR's node)
  await Promise.all([
    prisma.pixelBlock.upsert({
      where: { id: suiId(601) },
      update: {},
      create: {
        id: suiId(601),
        gridId: grid1.id,
        owner: suiId(3001),
        x: 0,
        y: 0,
        width: 5,
        height: 4,
        pixelCount: 20,
        imageUrl: "https://example.com/ads/razer-banner.png",
        linkUrl: "https://razer.com",
        pricePaid: usdc(10),
        expiresAt: new Date("2026-05-04"),
        autoRenew: true,
        deposit: usdc(10),
        status: 0,
        createdAt: daysAgo(25),
      },
    }),
    prisma.pixelBlock.upsert({
      where: { id: suiId(602) },
      update: {},
      create: {
        id: suiId(602),
        gridId: grid1.id,
        owner: suiId(3002),
        x: 5,
        y: 0,
        width: 5,
        height: 5,
        pixelCount: 25,
        imageUrl: "https://example.com/ads/steelseries-banner.png",
        linkUrl: "https://steelseries.com",
        pricePaid: usdc(12.5),
        expiresAt: new Date("2026-04-20"),
        autoRenew: false,
        deposit: BigInt(0),
        status: 0,
        createdAt: daysAgo(20),
      },
    }),
    prisma.pixelBlock.upsert({
      where: { id: suiId(603) },
      update: {},
      create: {
        id: suiId(603),
        gridId: grid1.id,
        owner: suiId(3003),
        x: 10,
        y: 0,
        width: 5,
        height: 5,
        pixelCount: 25,
        imageUrl: "https://example.com/ads/logitech-banner.png",
        linkUrl: "https://logitech.com",
        pricePaid: usdc(12.5),
        expiresAt: new Date("2026-05-10"),
        autoRenew: true,
        deposit: usdc(12.5),
        status: 0,
        createdAt: daysAgo(15),
      },
    }),
    // Block for grid2 (MH Wilds drop)
    prisma.pixelBlock.upsert({
      where: { id: suiId(604) },
      update: {},
      create: {
        id: suiId(604),
        gridId: grid2.id,
        owner: suiId(3004),
        x: 0,
        y: 0,
        width: 6,
        height: 4,
        pixelCount: 24,
        imageUrl: "https://example.com/ads/capcom-mhwilds.png",
        linkUrl: "https://monsterhunter.com",
        pricePaid: usdc(6),
        expiresAt: new Date("2026-04-28"),
        autoRenew: true,
        deposit: usdc(6),
        status: 0,
        createdAt: daysAgo(12),
      },
    }),
  ]);

  console.log("  ✓ 2 PixelGrids + 4 PixelBlocks created");

  // ── RevenueEvents ─────────────────────────────────────────────────

  await Promise.all([
    prisma.revenueEvent.create({
      data: {
        source: "drop_purchase",
        sourceId: drops[0].id,
        amount: usdc(3.99),
        creatorAddr: node1.owner,
        creatorAmt: usdc(3.99 * 0.9),
        protocolAmt: usdc(3.99 * 0.1),
        txDigest: "tx_digest_rv001",
        createdAt: daysAgo(2),
      },
    }),
    prisma.revenueEvent.create({
      data: {
        source: "drop_purchase",
        sourceId: drops[7].id, // GTA VI
        amount: usdc(5.99),
        creatorAddr: node1.owner,
        creatorAmt: usdc(5.99 * 0.9),
        protocolAmt: usdc(5.99 * 0.1),
        txDigest: "tx_digest_rv002",
        createdAt: daysAgo(1),
      },
    }),
    prisma.revenueEvent.create({
      data: {
        source: "shop_commission",
        sourceId: suiId(301),
        amount: usdc(59.99 * 0.05),
        creatorAddr: node1.owner,
        creatorAmt: usdc(59.99 * 0.05 * 0.8),
        protocolAmt: usdc(59.99 * 0.05 * 0.2),
        txDigest: "tx_digest_rv003",
        createdAt: daysAgo(1),
      },
    }),
    prisma.revenueEvent.create({
      data: {
        source: "pixel_ad",
        sourceId: grid1.id,
        amount: usdc(10),
        creatorAddr: node1.owner,
        creatorAmt: usdc(10 * 0.85),
        protocolAmt: usdc(10 * 0.15),
        txDigest: "tx_digest_rv004",
        createdAt: daysAgo(3),
      },
    }),
    prisma.revenueEvent.create({
      data: {
        source: "drop_purchase",
        sourceId: drops[3].id, // Stellar Blade
        amount: usdc(3.49),
        creatorAddr: node2.owner,
        creatorAmt: usdc(3.49 * 0.9),
        protocolAmt: usdc(3.49 * 0.1),
        referralAddr: node1.owner,
        referralAmt: usdc(3.49 * 0.05),
        txDigest: "tx_digest_rv005",
        createdAt: daysAgo(0),
      },
    }),
  ]);

  console.log("  ✓ 5 RevenueEvents created");

  // ── GameProfiles ──────────────────────────────────────────────────

  await Promise.all([
    prisma.gameProfile.create({
      data: {
        nodeId: node1.id,
        platform: "steam",
        username: "GameMaster_KR",
        verified: true,
        verificationHash: "steam_verify_hash_001",
        verifiedAt: daysAgo(100),
      },
    }),
    prisma.gameProfile.create({
      data: {
        nodeId: node2.id,
        platform: "steam",
        username: "StellarGuide_",
        verified: true,
        verificationHash: "steam_verify_hash_002",
        verifiedAt: daysAgo(80),
      },
    }),
    prisma.gameProfile.create({
      data: {
        nodeId: node3.id,
        platform: "riot",
        username: "IndieHunter#KR1",
        verified: true,
        verificationHash: "riot_verify_hash_003",
        verifiedAt: daysAgo(50),
      },
    }),
  ]);

  console.log("  ✓ 3 GameProfiles created");

  // ── PageViews ─────────────────────────────────────────────────────

  const pageViewData = [
    { pageType: "node", pageId: node1.id, viewerAddr: suiId(4001), createdAt: daysAgo(0) },
    { pageType: "node", pageId: node1.id, viewerAddr: suiId(4002), createdAt: daysAgo(0) },
    { pageType: "drop", pageId: drops[0].id, viewerAddr: suiId(4001), createdAt: daysAgo(0) },
    { pageType: "drop", pageId: drops[0].id, viewerAddr: suiId(4003), createdAt: daysAgo(1) },
    { pageType: "drop", pageId: drops[7].id, viewerAddr: suiId(4002), createdAt: daysAgo(1) },
    { pageType: "drop", pageId: drops[7].id, viewerAddr: null, createdAt: daysAgo(1) },
    { pageType: "node", pageId: node2.id, viewerAddr: suiId(4004), createdAt: daysAgo(2) },
    { pageType: "drop", pageId: drops[3].id, viewerAddr: suiId(4005), createdAt: daysAgo(2) },
    { pageType: "node", pageId: node3.id, viewerAddr: null, createdAt: daysAgo(3) },
    { pageType: "drop", pageId: drops[6].id, viewerAddr: suiId(4001), createdAt: daysAgo(3) },
  ];

  for (const pv of pageViewData) {
    await prisma.pageView.create({ data: pv });
  }

  console.log("  ✓ 10 PageViews created");

  console.log("\nSeed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
