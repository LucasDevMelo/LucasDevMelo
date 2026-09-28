import { browserStorage } from "@/lib/storage/browser-storage";

export type AnalyticsEvent =
  | "landing_view"
  | "create_started"
  | "template_selected"
  | "preview_viewed"
  | "checkout_started"
  | "purchase_completed"
  | "tribute_viewed"
  | "share_clicked"
  | "create_another_clicked";

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

interface StoredEvent {
  event: AnalyticsEvent;
  props?: AnalyticsProps;
  at: string;
}

/**
 * Analytics provider contract. Add GA4, Plausible, PostHog etc. later by
 * implementing this interface and registering it in `providers` below.
 * Never send personal content (names, messages, photos) as event props.
 */
export interface AnalyticsProvider {
  track(event: AnalyticsEvent, props?: AnalyticsProps): void;
}

const MAX_LOCAL_EVENTS = 200;

const localProvider: AnalyticsProvider = {
  track(event, props) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[analytics] ${event}`, props ?? {});
    }
    try {
      const events = browserStorage.read<StoredEvent[]>("analytics", []);
      events.push({ event, props, at: new Date().toISOString() });
      browserStorage.write("analytics", events.slice(-MAX_LOCAL_EVENTS));
    } catch {
      // Analytics must never break the product.
    }
  },
};

const providers: AnalyticsProvider[] = [localProvider];

export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (typeof window === "undefined") return;
  for (const provider of providers) provider.track(event, props);
}
