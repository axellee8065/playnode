import { Router, Request, Response } from "express";
import { prisma } from "./db.js";

const router = Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pagination(query: { take?: string; skip?: string }) {
  const take = Math.min(Math.max(parseInt(query.take ?? "20", 10) || 20, 1), 100);
  const skip = Math.max(parseInt(query.skip ?? "0", 10) || 0, 0);
  return { take, skip };
}

/** Serialize BigInt values to strings so JSON.stringify doesn't throw. */
function serializeBigInt(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = serializeBigInt(value);
    }
    return result;
  }
  return obj;
}

function json(res: Response, data: unknown, status = 200) {
  res.status(status).json(serializeBigInt(data));
}

// ---------------------------------------------------------------------------
// Nodes
// ---------------------------------------------------------------------------

router.get("/api/nodes", async (req: Request, res: Response) => {
  try {
    const { take, skip } = pagination(req.query as Record<string, string>);
    const orderBy = req.query.sort === "views"
      ? { totalViews: "desc" as const }
      : req.query.sort === "earned"
        ? { totalEarned: "desc" as const }
        : { rank: "asc" as const };

    const [nodes, total] = await Promise.all([
      prisma.node.findMany({ take, skip, orderBy }),
      prisma.node.count(),
    ]);
    json(res, { data: nodes, total, take, skip });
  } catch (err) {
    console.error("GET /api/nodes error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/nodes/:id", async (req: Request, res: Response) => {
  try {
    const node = await prisma.node.findUnique({
      where: { id: req.params.id },
      include: { gameProfiles: true },
    });
    if (!node) return res.status(404).json({ error: "Node not found" });
    json(res, node);
  } catch (err) {
    console.error("GET /api/nodes/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/nodes/:id/drops", async (req: Request, res: Response) => {
  try {
    const { take, skip } = pagination(req.query as Record<string, string>);
    const [drops, total] = await Promise.all([
      prisma.drop.findMany({
        where: { nodeId: req.params.id },
        take,
        skip,
        orderBy: { createdAt: "desc" },
      }),
      prisma.drop.count({ where: { nodeId: req.params.id } }),
    ]);
    json(res, { data: drops, total, take, skip });
  } catch (err) {
    console.error("GET /api/nodes/:id/drops error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/nodes/:id/reviews", async (req: Request, res: Response) => {
  try {
    const { take, skip } = pagination(req.query as Record<string, string>);
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { nodeId: req.params.id },
        take,
        skip,
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count({ where: { nodeId: req.params.id } }),
    ]);
    json(res, { data: reviews, total, take, skip });
  } catch (err) {
    console.error("GET /api/nodes/:id/reviews error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/nodes/:id/revenue", async (req: Request, res: Response) => {
  try {
    const { take, skip } = pagination(req.query as Record<string, string>);
    const node = await prisma.node.findUnique({
      where: { id: req.params.id },
      select: { owner: true },
    });
    if (!node) return res.status(404).json({ error: "Node not found" });

    const [events, total] = await Promise.all([
      prisma.revenueEvent.findMany({
        where: { creatorAddr: node.owner },
        take,
        skip,
        orderBy: { createdAt: "desc" },
      }),
      prisma.revenueEvent.count({ where: { creatorAddr: node.owner } }),
    ]);
    json(res, { data: events, total, take, skip });
  } catch (err) {
    console.error("GET /api/nodes/:id/revenue error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Drops
// ---------------------------------------------------------------------------

router.get("/api/drops", async (req: Request, res: Response) => {
  try {
    const { take, skip } = pagination(req.query as Record<string, string>);
    const where: Record<string, unknown> = {};
    if (req.query.gameTag) where.gameTag = req.query.gameTag;
    if (req.query.category) where.category = parseInt(req.query.category as string, 10);
    if (req.query.author) where.author = req.query.author;

    const orderBy = req.query.sort === "views"
      ? { totalViews: "desc" as const }
      : req.query.sort === "earned"
        ? { totalEarned: "desc" as const }
        : { createdAt: "desc" as const };

    const [drops, total] = await Promise.all([
      prisma.drop.findMany({ where, take, skip, orderBy }),
      prisma.drop.count({ where }),
    ]);
    json(res, { data: drops, total, take, skip });
  } catch (err) {
    console.error("GET /api/drops error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/drops/:id", async (req: Request, res: Response) => {
  try {
    const drop = await prisma.drop.findUnique({
      where: { id: req.params.id },
      include: { node: true, pixelGrid: { include: { blocks: true } } },
    });
    if (!drop) return res.status(404).json({ error: "Drop not found" });
    json(res, drop);
  } catch (err) {
    console.error("GET /api/drops/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/api/drops/:id/view", async (req: Request, res: Response) => {
  try {
    const drop = await prisma.drop.findUnique({ where: { id: req.params.id } });
    if (!drop) return res.status(404).json({ error: "Drop not found" });

    await Promise.all([
      prisma.drop.update({
        where: { id: req.params.id },
        data: { totalViews: { increment: 1 } },
      }),
      prisma.node.update({
        where: { id: drop.nodeId },
        data: { totalViews: { increment: 1 } },
      }),
      prisma.pageView.create({
        data: {
          pageType: "drop",
          pageId: req.params.id,
          viewerAddr: (req.body?.viewerAddr as string) ?? null,
        },
      }),
    ]);
    json(res, { success: true });
  } catch (err) {
    console.error("POST /api/drops/:id/view error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

router.get("/api/reviews", async (req: Request, res: Response) => {
  try {
    const { take, skip } = pagination(req.query as Record<string, string>);
    const where: Record<string, unknown> = {};
    if (req.query.gameTag) where.gameTag = req.query.gameTag;
    if (req.query.author) where.author = req.query.author;
    if (req.query.minRating) where.rating = { gte: parseInt(req.query.minRating as string, 10) };

    const orderBy = req.query.sort === "helpful"
      ? { helpfulCount: "desc" as const }
      : req.query.sort === "rating"
        ? { rating: "desc" as const }
        : { createdAt: "desc" as const };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({ where, take, skip, orderBy }),
      prisma.review.count({ where }),
    ]);
    json(res, { data: reviews, total, take, skip });
  } catch (err) {
    console.error("GET /api/reviews error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/reviews/:id", async (req: Request, res: Response) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
      include: { node: true, pixelGrid: { include: { blocks: true } } },
    });
    if (!review) return res.status(404).json({ error: "Review not found" });
    json(res, review);
  } catch (err) {
    console.error("GET /api/reviews/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Games (aggregated by gameTag)
// ---------------------------------------------------------------------------

router.get("/api/games", async (req: Request, res: Response) => {
  try {
    const { take, skip } = pagination(req.query as Record<string, string>);

    const games = await prisma.drop.groupBy({
      by: ["gameTag"],
      _count: { id: true },
      _sum: { totalViews: true },
      orderBy: { _count: { id: "desc" } },
      take,
      skip,
    });

    const total = await prisma.drop.groupBy({
      by: ["gameTag"],
      _count: { id: true },
    });

    const data = games.map((g) => ({
      gameTag: g.gameTag,
      dropCount: g._count.id,
      totalViews: g._sum.totalViews?.toString() ?? "0",
    }));

    json(res, { data, total: total.length, take, skip });
  } catch (err) {
    console.error("GET /api/games error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/games/:slug", async (req: Request, res: Response) => {
  try {
    const gameTag = req.params.slug;

    const [dropCount, reviewCount, drops, reviews] = await Promise.all([
      prisma.drop.count({ where: { gameTag } }),
      prisma.review.count({ where: { gameTag } }),
      prisma.drop.aggregate({ where: { gameTag }, _sum: { totalViews: true } }),
      prisma.review.aggregate({ where: { gameTag }, _avg: { rating: true } }),
    ]);

    if (dropCount === 0 && reviewCount === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    json(res, {
      gameTag,
      dropCount,
      reviewCount,
      totalViews: drops._sum.totalViews?.toString() ?? "0",
      averageRating: reviews._avg.rating ?? 0,
    });
  } catch (err) {
    console.error("GET /api/games/:slug error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/games/:slug/drops", async (req: Request, res: Response) => {
  try {
    const { take, skip } = pagination(req.query as Record<string, string>);
    const gameTag = req.params.slug;
    const [drops, total] = await Promise.all([
      prisma.drop.findMany({
        where: { gameTag },
        take,
        skip,
        orderBy: { createdAt: "desc" },
        include: { node: { select: { id: true, displayName: true, avatarUrl: true } } },
      }),
      prisma.drop.count({ where: { gameTag } }),
    ]);
    json(res, { data: drops, total, take, skip });
  } catch (err) {
    console.error("GET /api/games/:slug/drops error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/games/:slug/reviews", async (req: Request, res: Response) => {
  try {
    const { take, skip } = pagination(req.query as Record<string, string>);
    const gameTag = req.params.slug;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { gameTag },
        take,
        skip,
        orderBy: { createdAt: "desc" },
        include: { node: { select: { id: true, displayName: true, avatarUrl: true } } },
      }),
      prisma.review.count({ where: { gameTag } }),
    ]);
    json(res, { data: reviews, total, take, skip });
  } catch (err) {
    console.error("GET /api/games/:slug/reviews error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Pixel Grids
// ---------------------------------------------------------------------------

router.get("/api/grids", async (req: Request, res: Response) => {
  try {
    const { take, skip } = pagination(req.query as Record<string, string>);
    const [grids, total] = await Promise.all([
      prisma.pixelGrid.findMany({ take, skip }),
      prisma.pixelGrid.count(),
    ]);
    json(res, { data: grids, total, take, skip });
  } catch (err) {
    console.error("GET /api/grids error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/grids/:id", async (req: Request, res: Response) => {
  try {
    const grid = await prisma.pixelGrid.findUnique({
      where: { id: req.params.id },
      include: { blocks: true },
    });
    if (!grid) return res.status(404).json({ error: "Grid not found" });
    json(res, grid);
  } catch (err) {
    console.error("GET /api/grids/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/grids/:id/price", async (req: Request, res: Response) => {
  try {
    const grid = await prisma.pixelGrid.findUnique({
      where: { id: req.params.id },
      select: { basePrice: true, soldPixels: true, totalPixels: true, monthlyViews: true },
    });
    if (!grid) return res.status(404).json({ error: "Grid not found" });

    // Dynamic pricing: base * (1 + soldRatio) * viewMultiplier
    const soldRatio = grid.totalPixels > 0 ? grid.soldPixels / grid.totalPixels : 0;
    const viewMultiplier = 1 + Math.log10(Math.max(Number(grid.monthlyViews), 1)) / 10;
    const currentPrice = BigInt(
      Math.ceil(Number(grid.basePrice) * (1 + soldRatio) * viewMultiplier)
    );

    json(res, {
      basePrice: grid.basePrice,
      currentPrice,
      soldPixels: grid.soldPixels,
      totalPixels: grid.totalPixels,
      soldRatio: Math.round(soldRatio * 10000) / 100,
    });
  } catch (err) {
    console.error("GET /api/grids/:id/price error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Quests
// ---------------------------------------------------------------------------

router.get("/api/quests", async (req: Request, res: Response) => {
  try {
    const { take, skip } = pagination(req.query as Record<string, string>);
    const where: Record<string, unknown> = {};
    if (req.query.gameTag) where.gameTag = req.query.gameTag;
    if (req.query.status) where.status = parseInt(req.query.status as string, 10);

    const [quests, total] = await Promise.all([
      prisma.quest.findMany({ where, take, skip, orderBy: { createdAt: "desc" } }),
      prisma.quest.count({ where }),
    ]);
    json(res, { data: quests, total, take, skip });
  } catch (err) {
    console.error("GET /api/quests error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/quests/:id", async (req: Request, res: Response) => {
  try {
    const quest = await prisma.quest.findUnique({ where: { id: req.params.id } });
    if (!quest) return res.status(404).json({ error: "Quest not found" });
    json(res, quest);
  } catch (err) {
    console.error("GET /api/quests/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Shop
// ---------------------------------------------------------------------------

router.get("/api/shop/links/:nodeId", async (req: Request, res: Response) => {
  try {
    const { take, skip } = pagination(req.query as Record<string, string>);
    const [links, total] = await Promise.all([
      prisma.shopLink.findMany({
        where: { nodeId: req.params.nodeId },
        take,
        skip,
      }),
      prisma.shopLink.count({ where: { nodeId: req.params.nodeId } }),
    ]);
    json(res, { data: links, total, take, skip });
  } catch (err) {
    console.error("GET /api/shop/links/:nodeId error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/shop/bundles", async (req: Request, res: Response) => {
  try {
    const { take, skip } = pagination(req.query as Record<string, string>);
    const gameId = req.query.gameId as string | undefined;
    const where = gameId ? { gameId } : {};

    const [links, total] = await Promise.all([
      prisma.shopLink.findMany({
        where,
        take,
        skip,
        orderBy: { totalClicks: "desc" },
      }),
      prisma.shopLink.count({ where }),
    ]);

    // Group by gameId for bundle presentation
    const bundleMap = new Map<string, typeof links>();
    for (const link of links) {
      const existing = bundleMap.get(link.gameId) ?? [];
      existing.push(link);
      bundleMap.set(link.gameId, existing);
    }

    const bundles = Array.from(bundleMap.entries()).map(([gameId, items]) => ({
      gameId,
      gameTitle: items[0]?.gameTitle ?? "",
      links: items,
    }));

    json(res, { data: bundles, total, take, skip });
  } catch (err) {
    console.error("GET /api/shop/bundles error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Revenue
// ---------------------------------------------------------------------------

router.get("/api/revenue/:address", async (req: Request, res: Response) => {
  try {
    const { take, skip } = pagination(req.query as Record<string, string>);
    const creatorAddr = req.params.address;

    const [events, total, aggregate] = await Promise.all([
      prisma.revenueEvent.findMany({
        where: { creatorAddr },
        take,
        skip,
        orderBy: { createdAt: "desc" },
      }),
      prisma.revenueEvent.count({ where: { creatorAddr } }),
      prisma.revenueEvent.aggregate({
        where: { creatorAddr },
        _sum: { creatorAmt: true },
      }),
    ]);

    json(res, {
      data: events,
      total,
      take,
      skip,
      totalEarned: aggregate._sum.creatorAmt ?? 0,
    });
  } catch (err) {
    console.error("GET /api/revenue/:address error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

router.get("/api/search", async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string)?.trim();
    if (!q) return res.status(400).json({ error: "Query parameter 'q' is required" });

    const { take } = pagination(req.query as Record<string, string>);
    const pattern = `%${q}%`;

    const [nodes, drops, reviews, quests] = await Promise.all([
      prisma.node.findMany({
        where: { displayName: { contains: q, mode: "insensitive" } },
        take,
      }),
      prisma.drop.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { gameTag: { contains: q, mode: "insensitive" } },
          ],
        },
        take,
      }),
      prisma.review.findMany({
        where: { gameTag: { contains: q, mode: "insensitive" } },
        take,
      }),
      prisma.quest.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { gameTag: { contains: q, mode: "insensitive" } },
          ],
        },
        take,
      }),
    ]);

    json(res, {
      nodes: nodes,
      drops: drops,
      reviews: reviews,
      quests: quests,
    });
  } catch (err) {
    console.error("GET /api/search error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
