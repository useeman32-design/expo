import cashbackImg from '@/assets/promo/cashback.png';
import referralImg from '@/assets/promo/referral.png';
import learnImg from '@/assets/promo/learn.png';

/**
 * In-app promotional campaigns (OPay-style): a carousel of banners on the
 * Home screen, each opening a dedicated campaign page with details, steps
 * and a call-to-action.
 *
 * Production: served from the backend (/api/campaigns) with scheduling,
 * targeting and impression tracking; the CTA routes into real flows
 * (referral credit, cashback ledger entries).
 */

export interface PromoStep {
  title: string;
  sub: string;
}

export interface Promotion {
  id: string;
  /** small pill on the banner, e.g. CAMPAIGN / NEW / CASHBACK */
  badge: string;
  badgeColor: string;
  /** banner copy */
  title: string;
  subtitle: string;
  cta: string;
  image: unknown;
  /** scrim tint behind banner text (image has a dark left zone already) */
  tint: string;
  /** dedicated page content */
  page: {
    headline: string;
    description: string;
    steps: PromoStep[];
    terms: string[];
    expiry: string;
  };
  /** optional in-app route the CTA jumps to (besides the toast) */
  actionRoute?: '/referral' | '/learn' | '/markets' | '/wallet';
  actionLabel?: string;
}

export const PROMOTIONS: Promotion[] = [
  {
    id: 'trade-and-earn',
    badge: 'CASHBACK',
    badgeColor: '#F6A623',
    title: 'Trade & Earn 2% cashback',
    subtitle: 'Get 2% back on every commission you pay this month',
    cta: 'Activate offer',
    image: cashbackImg,
    tint: 'rgba(7,60,38,0.55)',
    page: {
      headline: 'Trade & Earn — 2% cashback on commissions',
      description:
        'Every completed buy or sell order this month earns you 2% of the commission back, credited to your wallet every night. The more disciplined you trade, the more you earn back — automatically.',
      steps: [
        { title: 'Trade any NGX stock', sub: 'Market or limit orders — both count towards cashback.' },
        { title: 'We tally your commissions', sub: 'Every night at 11 PM we sum the fees you paid that day.' },
        { title: 'Cashback lands in your wallet', sub: '2% is credited automatically. No minimum, withdraw anytime.' },
      ],
      terms: [
        'Cashback is calculated on brokerage commission and NGX fees, excluding CSCS and stamp duties.',
        'Cancelled and expired orders do not qualify.',
        'Offer runs this calendar month; credits are applied within 24 hours of each trading day.',
        'StocksX may withdraw or extend the campaign at any time.',
      ],
      expiry: 'Ends 31 August',
    },
    actionRoute: '/markets',
    actionLabel: 'Start trading',
  },
  {
    id: 'invite-friends',
    badge: 'REFERRAL',
    badgeColor: '#1F7AE0',
    title: 'Invite friends, get ₦1,000',
    subtitle: '₦1,000 for you · ₦1,000 for them on their first trade',
    cta: 'Invite now',
    image: referralImg,
    tint: 'rgba(6,52,44,0.55)',
    page: {
      headline: 'Invite friends — ₦1,000 for each of you',
      description:
        'Share your referral link and earn ₦1,000 in brokerage credit for every friend who signs up and completes their first trade. They get ₦1,000 too — a win-win.',
      steps: [
        { title: 'Share your link', sub: 'WhatsApp, X, anywhere — one tap copies your invite.' },
        { title: 'Friend signs up & trades', sub: 'They register with your link and place any order.' },
        { title: 'You both get ₦1,000', sub: 'Credit lands in both wallets within 24 hours.' },
      ],
      terms: [
        'Referral credit is paid after the friend’s first completed order.',
        'Self-referrals and duplicate accounts are disqualified.',
        'Maximum 20 referral payouts per user per month.',
      ],
      expiry: 'Ongoing campaign',
    },
    actionRoute: '/referral',
    actionLabel: 'Open referral centre',
  },
  {
    id: 'learn-and-earn',
    badge: 'NEW',
    badgeColor: '#11A06B',
    title: 'Learn & Earn ₦500',
    subtitle: 'Finish 3 lessons this week and get brokerage credit',
    cta: 'Start learning',
    image: learnImg,
    tint: 'rgba(6,50,34,0.55)',
    page: {
      headline: 'Learn & Earn — ₦500 for 3 lessons',
      description:
        'Investing knowledge pays. Complete any three lessons in the Learn tab this week and we drop ₦500 of brokerage credit into your account. Lessons take about 4 minutes each.',
      steps: [
        { title: 'Open the Learn tab', sub: 'Pick any course — basics, trading or the Nigerian market.' },
        { title: 'Finish 3 lessons', sub: 'Short reads with key takeaways; progress is saved automatically.' },
        { title: 'Claim ₦500 credit', sub: 'Credit is applied to your account on Sunday night.' },
      ],
      terms: [
        'Only lessons completed this calendar week count.',
        'Brokerage credit cannot be withdrawn — it offsets trading commissions.',
        'One payout per user per week.',
      ],
      expiry: 'New every week',
    },
    actionRoute: '/learn',
    actionLabel: 'Open Learn tab',
  },
];

export function getPromotion(id: string): Promotion | undefined {
  return PROMOTIONS.find((p) => p.id === id);
}
