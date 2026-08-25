import type { NotificationItem } from '@/types';

/**
 * Mock notification feed. Swap this out for a real push/in-app notification
 * service (e.g. Expo Notifications + backend) without touching the UI layer.
 */
const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    kind: 'price',
    icon: 'trending-up',
    color: '#0E9F5E',
    title: 'Price alert triggered',
    body: 'MTNN crossed ₦265.00 — up 3.2% today.',
    time: '2m ago',
    read: false,
    ticker: 'MTNN',
  },
  {
    id: 'n2',
    kind: 'order',
    icon: 'checkmark-done',
    color: '#0E8A57',
    title: 'Order filled',
    body: 'Your Buy order for 10 AAPL @ $231.40 was executed.',
    time: '1h ago',
    read: false,
    ticker: 'AAPL',
  },
  {
    id: 'n3',
    kind: 'news',
    icon: 'newspaper',
    color: '#1F7AE0',
    title: 'Breaking: Seplat announces interim dividend',
    body: 'SEPLAT declares ₦9.00 interim dividend; ex-date Friday.',
    time: '3h ago',
    read: false,
    ticker: 'SEPLAT',
  },
  {
    id: 'n4',
    kind: 'system',
    icon: 'shield-checkmark',
    color: '#7A52C9',
    title: 'Sharia compliance updated',
    body: 'JAAZBANK marked compliant in your watchlist.',
    time: 'Yesterday',
    read: true,
    ticker: 'JAAZBANK',
  },
  {
    id: 'n5',
    kind: 'order',
    icon: 'swap-vertical',
    color: '#0E8A57',
    title: 'Deposit successful',
    body: '₦50,000 added to your StocksX wallet via Bank Transfer.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n6',
    kind: 'news',
    icon: 'newspaper',
    color: '#1F7AE0',
    title: 'NGX closes in the green',
    body: 'All Share Index up 0.8% as banking stocks rally.',
    time: '2d ago',
    read: true,
  },
  {
    id: 'n7',
    kind: 'price',
    icon: 'trending-down',
    color: '#DD4B3E',
    title: 'Watchlist mover',
    body: 'DANGCEM down 2.1% — now below your alert threshold.',
    time: '3d ago',
    read: true,
    ticker: 'DANGCEM',
  },
];

export function getNotifications(): NotificationItem[] {
  return NOTIFICATIONS;
}

export function getUnreadCount(): number {
  return NOTIFICATIONS.filter((n) => !n.read).length;
}
