import { NextRequest, NextResponse } from "next/server";

const PUBSUBHUBBUB_HUB = "https://pubsubhubbub.appspot.com/subscribe";

// ─── GET: Subscribe/Renew YouTube WebSub Subscription ────────────────────────
// Called by Vercel Cron (weekly) or manually to subscribe to YouTube channel feed.
// YouTube will then push notifications to /api/webhook/youtube when new videos are uploaded.
export async function GET(req: NextRequest) {
  // ── Auth Check ──
  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  // Manual trigger via: ?secret=<CRON_SECRET>
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    const querySecret = new URL(req.url).searchParams.get("secret");
    const bearerToken = authHeader?.replace("Bearer ", "");

    if (bearerToken !== cronSecret && querySecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // ── Validate Environment ──
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  const websubSecret = process.env.WEBSUB_SECRET;
  const baseUrl = process.env.NEXTAUTH_URL;

  if (!channelId) {
    return NextResponse.json(
      { error: "YOUTUBE_CHANNEL_ID is not configured" },
      { status: 500 }
    );
  }

  if (!baseUrl) {
    return NextResponse.json(
      { error: "NEXTAUTH_URL is not configured" },
      { status: 500 }
    );
  }

  const callbackUrl = `${baseUrl.replace(/\/+$/, "")}/api/webhook/youtube`;
  const topicUrl = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`;

  // ── Subscribe to PubSubHubbub Hub ──
  const formData = new URLSearchParams({
    "hub.callback": callbackUrl,
    "hub.topic": topicUrl,
    "hub.mode": "subscribe",
    "hub.verify": "async",
    ...(websubSecret ? { "hub.secret": websubSecret } : {}),
  });

  try {
    const response = await fetch(PUBSUBHUBBUB_HUB, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (response.ok || response.status === 202) {
      console.log(`[WebSub] ✅ Subscription request accepted`);
      console.log(`[WebSub]    Callback: ${callbackUrl}`);
      console.log(`[WebSub]    Topic:    ${topicUrl}`);

      return NextResponse.json({
        status: "ok",
        message: "Subscription request sent to PubSubHubbub hub",
        callback: callbackUrl,
        topic: topicUrl,
      });
    } else {
      const errorText = await response.text();
      console.error(`[WebSub] ❌ Hub returned ${response.status}: ${errorText}`);

      return NextResponse.json(
        {
          error: "Hub rejected subscription",
          hubStatus: response.status,
          hubResponse: errorText,
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("[WebSub] ❌ Failed to contact hub:", error);
    return NextResponse.json(
      { error: "Failed to contact PubSubHubbub hub" },
      { status: 500 }
    );
  }
}
