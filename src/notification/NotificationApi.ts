import type { NotificationItem } from "./NotificationTypes";

const BASE_URL = "/notification";

type ReadResponse = {
  success?: boolean;
};

export async function markAsRead(id: number) {
  try {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const data = (await res.json().catch(() => ({}))) as ReadResponse;
    if (res.ok && data.success) {
      console.log(`[${id}] marked as read`);
    } else {
      console.warn(`[${id}] failed to mark as read`, data);
    }
  } catch (err) {
    console.error(`[${id}] mark as read error`, err);
  }
}

export function connectSSE(
  receiver: string,
  onMessage: (data: NotificationItem | string) => void,
  onError?: (error: unknown) => void,
): EventSource {
  const url = `${BASE_URL}/sse/subscribe?receiver=${receiver}`;
  const eventSource = new EventSource(url);

  const normalizeData = (raw: string): NotificationItem | string => {
    try {
      let fixed = raw
        .trim()
        .replace(/^\(|\)$/g, "{")
        .replace(/\)\s*$/, "}");
      fixed = fixed.replace(/([a-zA-Z0-9_]+):/g, '"$1":');
      return JSON.parse(fixed) as NotificationItem;
    } catch {
      console.warn("failed to parse notification payload", raw);
      return raw;
    }
  };

  eventSource.onopen = (e) => {
    console.log("[SSE] connected", e);
  };

  eventSource.onmessage = (e) => {
    onMessage(normalizeData(e.data));
  };

  eventSource.addEventListener("notification", (e: MessageEvent) => {
    onMessage(normalizeData(e.data));
  });

  eventSource.onerror = (e) => {
    console.error("[SSE] error", e);
    onError?.(e);
    if (eventSource.readyState === EventSource.CLOSED) {
      eventSource.close();
      setTimeout(() => connectSSE(receiver, onMessage, onError), 5000);
    }
  };

  window.addEventListener("beforeunload", () => {
    eventSource.close();
  });

  return eventSource;
}

