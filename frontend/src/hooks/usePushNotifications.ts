/**
 * usePushNotifications
 *
 * Manages browser push notification permission and subscription lifecycle.
 *
 * Usage:
 *   const { supported, permission, subscribe, unsubscribe } = usePushNotifications();
 */

import { useState, useEffect, useCallback } from 'react';

export type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported';

interface UsePushNotificationsResult {
  supported: boolean;
  permission: PushPermission;
  isSubscribed: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

async function fetchVapidKey(): Promise<string | null> {
  try {
    const res = await fetch('/api/push/vapid-public-key', { credentials: 'same-origin' });
    if (!res.ok) return null;
    const data = await res.json() as { publicKey?: string };
    return data.publicKey ?? null;
  } catch {
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications(): UsePushNotificationsResult {
  const supported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  const [permission, setPermission] = useState<PushPermission>(
    supported ? (Notification.permission as PushPermission) : 'unsupported'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Check existing subscription on mount
  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setIsSubscribed(sub !== null))
      .catch(() => {});
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!supported) return;

    const vapidKey = await fetchVapidKey();
    if (!vapidKey) {
      console.warn('[Push] VAPID key not available — push notifications not configured on server');
      return;
    }

    let perm = Notification.permission;
    if (perm === 'default') {
      perm = await Notification.requestPermission();
    }
    setPermission(perm as PushPermission);

    if (perm !== 'granted') return;

    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const { endpoint, keys } = subscription.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      await fetch('/api/push/subscribe', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, keys }),
      });

      setIsSubscribed(true);
    } catch (err) {
      console.error('[Push] Subscription failed:', err);
    }
  }, [supported]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return;

      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });

      await sub.unsubscribe();
      setIsSubscribed(false);
    } catch (err) {
      console.error('[Push] Unsubscribe failed:', err);
    }
  }, [supported]);

  return { supported, permission, isSubscribed, subscribe, unsubscribe };
}
