import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (shared concept with deck route)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

const ARCHIDEKT_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'Shortfall/1.0 (MTG deck conflict checker)',
};

/**
 * GET /api/archidekt/collection?collectionId=832552
 *          OR
 *     /api/archidekt/collection?username=USERNAME
 *
 * Proxies requests to the Archidekt collection API.
 *
 * Collection-ID path (shared link):
 *   1. Fetch /api/collection/v2/{id}/ to get the owner's userId.
 *   2. Page through all cards via /api/collection/cards/?owner={userId}.
 *
 * Username path:
 *   1. Resolve username → userId via the users search endpoint.
 *   2. Page through all collection cards.
 */
export async function GET(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  const collectionId = request.nextUrl.searchParams.get('collectionId')?.trim();
  const username = request.nextUrl.searchParams.get('username')?.trim();

  if (!collectionId && !username) {
    return NextResponse.json(
      { error: 'Provide either a collectionId or username parameter' },
      { status: 400 },
    );
  }

  try {
    let userId: number;
    let resolvedUsername: string;

    if (collectionId) {
      // --- Collection-ID path ---
      if (!/^\d+$/.test(collectionId)) {
        return NextResponse.json({ error: 'Invalid collection ID' }, { status: 400 });
      }

      const colMetaRes = await fetch(
        `https://archidekt.com/api/collection/v2/${collectionId}/`,
        { headers: ARCHIDEKT_HEADERS },
      );

      if (!colMetaRes.ok) {
        if (colMetaRes.status === 404) {
          return NextResponse.json(
            { error: 'Collection not found. Make sure the link is correct and the collection is public.' },
            { status: 404 },
          );
        }
        if (colMetaRes.status === 403) {
          return NextResponse.json(
            { error: 'This collection is private. Make it public on Archidekt to import it here.' },
            { status: 403 },
          );
        }
        return NextResponse.json(
          { error: `Archidekt API returned ${colMetaRes.status}` },
          { status: colMetaRes.status },
        );
      }

      const colMeta = await colMetaRes.json();
      // The v2 collection object has an `owner` field with `{ id, username }`
      userId = colMeta?.owner?.id ?? colMeta?.user?.id;
      resolvedUsername = colMeta?.owner?.username ?? colMeta?.user?.username ?? `collection-${collectionId}`;

      if (!userId) {
        return NextResponse.json(
          { error: 'Could not determine collection owner from Archidekt response.' },
          { status: 502 },
        );
      }
    } else {
      // --- Username path ---
      if (!/^[A-Za-z0-9_\-]{1,64}$/.test(username!)) {
        return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
      }

      const userRes = await fetch(
        `https://archidekt.com/api/users/?username=${encodeURIComponent(username!)}`,
        { headers: ARCHIDEKT_HEADERS },
      );

      if (!userRes.ok) {
        return NextResponse.json(
          { error: `Could not look up user "${username}" (HTTP ${userRes.status})` },
          { status: userRes.status },
        );
      }

      const userData = await userRes.json();
      const users: Array<{ id: number; username: string }> = userData?.results ?? [];
      const matchedUser = users.find(
        (u) => u.username.toLowerCase() === username!.toLowerCase(),
      );

      if (!matchedUser) {
        return NextResponse.json(
          { error: `User "${username}" not found on Archidekt. Make sure the username is correct and your collection is public.` },
          { status: 404 },
        );
      }

      userId = matchedUser.id;
      resolvedUsername = matchedUser.username;
    }

    // Step 2: Page through all collection cards
    const PAGE_SIZE = 200;
    let page = 1;
    let allCards: unknown[] = [];
    let hasMore = true;

    while (hasMore) {
      const colRes = await fetch(
        `https://archidekt.com/api/collection/cards/?owner=${userId}&pageSize=${PAGE_SIZE}&page=${page}`,
        { headers: ARCHIDEKT_HEADERS },
      );

      if (!colRes.ok) {
        if (colRes.status === 403) {
          return NextResponse.json(
            {
              error: `This collection is private. Make it public on Archidekt to import it here.`,
            },
            { status: 403 },
          );
        }
        return NextResponse.json(
          { error: `Failed to fetch collection (HTTP ${colRes.status})` },
          { status: colRes.status },
        );
      }

      const colData = await colRes.json();
      const results: unknown[] = colData?.results ?? [];
      allCards = allCards.concat(results);

      // If we got fewer results than PAGE_SIZE, we're done
      hasMore = results.length === PAGE_SIZE && allCards.length < 10_000;
      page++;
    }

    return NextResponse.json({
      username: resolvedUsername,
      count: allCards.length,
      cards: allCards,
    });
  } catch (error) {
    console.error('Error proxying Archidekt collection request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection from Archidekt' },
      { status: 502 },
    );
  }
}
