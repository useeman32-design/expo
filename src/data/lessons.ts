export interface GlossaryTerm {
  ha: string;
  en: string;
  meaning: string;
  example?: string;
}

/** Hausa financial vocabulary — surface one as "word of the day". */
export const GLOSSARY: GlossaryTerm[] = [
  {
    ha: 'Riba',
    en: 'Interest / usury',
    meaning:
      'Interest charged or paid on money. Forbidden in Islamic finance, which is why halal investors screen out conventional banks.',
    example: 'A conventional savings account pays riba — halal savers avoid it.',
  },
  {
    ha: 'Kasuwanci',
    en: 'Trade / business',
    meaning: 'Buying and selling, commerce, or the market in general.',
    example: 'Kasuwancin hannun jari = the stock market.',
  },
  {
    ha: 'Hannun jari',
    en: 'Shares / stock',
    meaning: 'A unit of ownership in a company. Owning one means you own a slice of the business.',
  },
  {
    ha: 'Bashi',
    en: 'Debt / loan',
    meaning: 'Money borrowed that must be repaid. Companies with heavy bashi often fail Sharia screens.',
  },
  {
    ha: 'Kudi',
    en: 'Money',
    meaning: 'Currency or cash — such as the Naira (Naira = kuɗin Nijeriya).',
  },
  {
    ha: 'Dukiya',
    en: 'Wealth',
    meaning: 'Accumulated money and assets; the goal of long-term investing.',
  },
  {
    ha: 'Riba / Tanadi',
    en: 'Savings',
    meaning: 'Setting money aside rather than spending it — the foundation of investing.',
  },
];

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  haTitle?: string;
  minutes: number;
  body: string[];
  takeaways: string[];
}

export interface Course {
  id: string;
  title: string;
  haTitle: string;
  subtitle: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  minutes: number;
  lessons: number;
  color: string;
  icon: string; // ionicon name
  description: string;
}

export const COURSES: Course[] = [
  {
    id: 'foundations',
    title: 'Stock Market Basics',
    haTitle: 'Tushen Kasuwar Hannun Jari',
    subtitle: 'Start here if you’re brand new',
    level: 'Beginner',
    minutes: 18,
    lessons: 4,
    color: '#22E59A',
    icon: 'seedling',
    description:
      'What a stock is, how the Nigerian Exchange works, and how ordinary people start investing from as little as ₦1,000.',
  },
  {
    id: 'sharia',
    title: 'Sharia-Compliant Investing',
    haTitle: 'Saka Hannun Jari Da Daidaituwa',
    subtitle: 'Invest without riba',
    level: 'Beginner',
    minutes: 15,
    lessons: 4,
    color: '#3DDC97',
    icon: 'shield-checkmark',
    description:
      'How to invest in a halal way: avoiding riba (interest), screening stocks, and purifying any small non-compliant income.',
  },
  {
    id: 'charts',
    title: 'Reading Stock Charts',
    haTitle: 'Karanta Zanen Kasuwa',
    subtitle: 'Understand price movement',
    level: 'Intermediate',
    minutes: 20,
    lessons: 4,
    color: '#7C5CFF',
    icon: 'analytics',
    description:
      'Candlesticks, trends, support and resistance — how to make sense of a stock’s price history before you buy.',
  },
  {
    id: 'portfolio',
    title: 'Building a Portfolio',
    haTitle: 'Gina Fayeda',
    subtitle: 'Diversify like a pro',
    level: 'Intermediate',
    minutes: 16,
    lessons: 3,
    color: '#F6A623',
    icon: 'pie-chart',
    description:
      'How to mix sectors and markets so a single bad stock can’t sink your whole dukiya (wealth).',
  },
  {
    id: 'risk',
    title: 'Risk & Mindset',
    haTitle: 'Kula Da Hadari',
    subtitle: 'Protect your capital',
    level: 'Advanced',
    minutes: 14,
    lessons: 3,
    color: '#FF6B6B',
    icon: 'warning',
    description:
      'Position sizing, avoiding panic, and the golden rules that keep investors alive when markets fall.',
  },
];

export const LESSONS: Lesson[] = [
  // Foundations
  {
    id: 'foundations-1',
    courseId: 'foundations',
    title: 'What is a stock?',
    haTitle: 'Mene ne hannun jari?',
    minutes: 4,
    body: [
      'A stock (hannun jari) is a small piece of ownership in a company. When you buy one share of MTN Nigeria, you literally own a tiny fraction of MTN — its towers, its subscribers, and its profits.',
      'Companies sell shares to raise money to grow. In return, shareholders may receive dividends (a share of profits) and benefit if the business becomes more valuable over time.',
      'On the Nigerian Exchange (NGX), you can buy shares in familiar names like Dangote Cement, Airtel Africa and Jaiz Bank, usually through a licensed app or broker.',
    ],
    takeaways: [
      'A share = a slice of company ownership.',
      'You can earn from price growth and dividends.',
      'In Nigeria you trade on the NGX through a licensed broker.',
    ],
  },
  {
    id: 'foundations-2',
    courseId: 'foundations',
    title: 'How the NGX works',
    haTitle: 'Yadda NGX ke aiki',
    minutes: 5,
    body: [
      'The Nigerian Exchange Group (NGX) is where shares of Nigerian companies are bought and sold. Prices move based on supply and demand — more buyers than sellers pushes the price up, and vice versa.',
      'Trading happens on weekdays during market hours. Apps like Albarka (concept) connect you to licensed brokers that execute your orders on the exchange.',
      'You can start small: many platforms let you buy fractional shares from about ₦1,000, so you don’t need to be rich to begin.',
    ],
    takeaways: [
      'The NGX matches buyers and sellers of Nigerian shares.',
      'Prices reflect supply and demand.',
      'You can begin investing with as little as ₦1,000.',
    ],
  },
  {
    id: 'foundations-3',
    courseId: 'foundations',
    title: 'Why prices go up and down',
    haTitle: 'Dalilin hauhawar farashin',
    minutes: 4,
    body: [
      'A share price moves when investors change their view of a company’s future. Strong profits, new products or a growing economy can push it up; weak results, debt or bad news can push it down.',
      'In the short term prices are noisy and emotional. Over years, they tend to follow how much profit the business actually earns.',
      'That’s why long-term investors focus on the business, not the daily noise.',
    ],
    takeaways: [
      'Prices reflect expectations about future profits.',
      'Short-term moves are often emotional; long-term moves follow earnings.',
      'Focus on the business, not the daily drama.',
    ],
  },
  {
    id: 'foundations-4',
    courseId: 'foundations',
    title: 'Your first trade',
    haTitle: 'Kasuwancinka na farko',
    minutes: 5,
    body: [
      'Before buying, fund your account, research the company, and decide how much to invest — never more than you can afford to leave invested for years.',
      'Place a buy order for the number of shares you want. Once filled, you’ll see the position in your portfolio with your average cost.',
      'Then be patient. The hardest part of investing isn’t clicking buy — it’s holding on when prices wobble.',
    ],
    takeaways: [
      'Research first, then size your order sensibly.',
      'Track your average cost in your portfolio.',
      'Patience is your edge.',
    ],
  },

  // Sharia
  {
    id: 'sharia-1',
    courseId: 'sharia',
    title: 'What is riba and why avoid it?',
    haTitle: 'Mene ne riba?',
    minutes: 4,
    body: [
      'Riba means interest — money charged simply for lending or borrowing money. Islamic finance forbids it because money should not itself be sold for more money; profit should come from real trade and risk-sharing.',
      'This is why a conventional bank account or bond (which pays fixed interest) is not considered halal, while owning a real business through shares can be.',
      'The good news: you can still invest and grow your dukiya (wealth) — just by choosing compliant companies.',
    ],
    takeaways: [
      'Riba = interest on money; forbidden in Islamic finance.',
      'Profit should come from real trade and risk, not lending.',
      'Halal investing is very possible through compliant shares.',
    ],
  },
  {
    id: 'sharia-2',
    courseId: 'sharia',
    title: 'How stocks are screened',
    haTitle: 'Yadda ake tantance hannun jari',
    minutes: 4,
    body: [
      'Scholars use standards (such as AAOIFI) to screen shares. Two things are checked: the business itself must be lawful, and the company’s finances must stay within certain limits.',
      'A business is filtered out if it deals in alcohol, gambling, pork, adult entertainment, or conventional interest-based banking.',
      'Financially, a compliant company should keep interest-bearing debt, interest income and impermissible assets below agreed thresholds. Jaiz Bank, for example, passes because it is a fully non-interest bank.',
    ],
    takeaways: [
      'Screens check both the business and the balance sheet.',
      'Haram sectors (alcohol, gambling, conventional banks) are excluded.',
      'Look for the green “Halal” badge on a stock in this app.',
    ],
  },
  {
    id: 'sharia-3',
    courseId: 'sharia',
    title: 'Purification & zakat',
    haTitle: 'Tsabtace riba da zakka',
    minutes: 4,
    body: [
      'Sometimes a mostly-compliant company earns a tiny amount of interest. Scholars allow holding it if you donate that small portion to charity — this is called purification.',
      'Separately, if your invested wealth passes the nisab threshold and you’ve held it for a lunar year, zakat (typically 2.5%) becomes due — a core pillar of giving.',
      'Apps can estimate both for you so you invest with a clear conscience.',
    ],
    takeaways: [
      'Purification = donating any small non-compliant income.',
      'Zakat (2.5%) applies to qualifying invested wealth.',
      'Tools can calculate both for you.',
    ],
  },
  {
    id: 'sharia-4',
    courseId: 'sharia',
    title: 'Building a halal portfolio',
    haTitle: 'Gina fayeda mai kyau',
    minutes: 3,
    body: [
      'A halal portfolio mixes compliant sectors — telecoms, industrials, agriculture, energy — so you’re diversified without touching riba.',
      'Use the Halal toggle in this app’s Markets tab to instantly filter to compliant stocks only.',
      'Over time, this builds dukiya (wealth) in a way that aligns with your values.',
    ],
    takeaways: [
      'Diversify across compliant sectors.',
      'Use the Halal toggle to filter instantly.',
      'Align your wealth-building with your faith.',
    ],
  },

  // Charts
  {
    id: 'charts-1',
    courseId: 'charts',
    title: 'Reading a price chart',
    minutes: 5,
    body: [
      'A price chart plots a stock’s price over time. The vertical axis is price, the horizontal axis is time. A line that climbs up-and-to-the-right shows a stock growing in value.',
      'Most apps default to a line chart of the closing price. Switching ranges (1D, 1W, 1M, 1Y) shows how the stock behaves over different horizons.',
      'Don’t stare at one-day moves. Zoom out to see the real trend.',
    ],
    takeaways: [
      'Up-and-to-the-right = growth over time.',
      'Use time ranges to compare short vs long trends.',
      'Zoom out before you react.',
    ],
  },
  {
    id: 'charts-2',
    courseId: 'charts',
    title: 'Trends, support & resistance',
    minutes: 5,
    body: [
      'A trend is the general direction: up, down, or sideways. “The trend is your friend” means it’s easier to invest with the prevailing direction than against it.',
      'Support is a price level where buyers tend to step in; resistance is where sellers tend to appear. Prices often bounce between them.',
      'These aren’t magic lines — they’re zones of human behaviour you can watch for clues.',
    ],
    takeaways: [
      'Trade with the trend, not against it.',
      'Support = buyers; resistance = sellers.',
      'They’re zones of behaviour, not guarantees.',
    ],
  },
  {
    id: 'charts-3',
    courseId: 'charts',
    title: 'Volume tells a story',
    minutes: 5,
    body: [
      'Volume is how many shares change hands. A price move on high volume is more meaningful — it shows real conviction behind it.',
      'A move on low volume can be fragile and easy to reverse.',
      'Pair price with volume and you’ll read the market far better than price alone.',
    ],
    takeaways: [
      'High volume = strong conviction.',
      'Low-volume moves are fragile.',
      'Always read price and volume together.',
    ],
  },
  {
    id: 'charts-4',
    courseId: 'charts',
    title: 'Don’t overthink the chart',
    minutes: 5,
    body: [
      'Charts are a tool, not a crystal ball. Endless indicators can make you feel smart while you lose money.',
      'For most long-term investors, a clean trend plus the company’s fundamentals is plenty.',
      'Keep it simple. Your future self will thank you.',
    ],
    takeaways: [
      'Charts guide, they don’t predict.',
      'Fundamentals matter more than fancy indicators.',
      'Simple beats complicated.',
    ],
  },

  // Portfolio
  {
    id: 'portfolio-1',
    courseId: 'portfolio',
    title: 'Why diversify?',
    minutes: 5,
    body: [
      'Diversification means spreading money across different companies, sectors and even markets (NGX + US) so one bad outcome can’t ruin you.',
      'If all your money is in a single bank stock and banking struggles, your whole portfolio falls. Spread across telecoms, industrials and agriculture and the risk is shared.',
      'Think of it as not putting all your eggs in one basket — a proverb as true for dukiya as for eggs.',
    ],
    takeaways: [
      'Spread across sectors and markets.',
      'Reduce the impact of any single failure.',
      'Don’t put all your eggs in one basket.',
    ],
  },
  {
    id: 'portfolio-2',
    courseId: 'portfolio',
    title: 'Allocation by goals',
    minutes: 6,
    body: [
      'How much goes to stocks depends on your goals and time horizon. Money you need soon should stay safe; money for years ahead can ride the market’s growth.',
      'A young investor saving for decades can hold more growth stocks; someone near a goal should dial down risk.',
      'There’s no perfect formula — only what lets you sleep at night and stay invested.',
    ],
    takeaways: [
      'Match risk to your time horizon.',
      'Soon-needed money stays safe; long-term money can grow.',
      'Choose allocation you can stick with.',
    ],
  },
  {
    id: 'portfolio-3',
    courseId: 'portfolio',
    title: 'Rebalancing',
    minutes: 5,
    body: [
      'Over time, some holdings grow and others shrink, throwing your plan off-balance. Rebalancing means trimming winners and adding to laggards to return to your target mix.',
      'Once or twice a year is usually enough. It forces a disciplined “buy low, sell high” rhythm.',
      'It’s how disciplined investors stay the course through every market mood.',
    ],
    takeaways: [
      'Markets drift your mix over time.',
      'Rebalance 1–2× per year back to target.',
      'It enforces buy-low, sell-high discipline.',
    ],
  },

  // Risk
  {
    id: 'risk-1',
    courseId: 'risk',
    title: 'Position sizing',
    minutes: 5,
    body: [
      'Never put your whole account into one stock. A simple rule: cap any single holding at a small share of your portfolio (say 5–10%) so one mistake can’t be fatal.',
      'Position sizing protects you from yourself — even a confident idea can be wrong.',
      'Survive long enough and the winners will carry you.',
    ],
    takeaways: [
      'Cap each holding at a small % of your portfolio.',
      'Protect against being wrong.',
      'Survival first, growth second.',
    ],
  },
  {
    id: 'risk-2',
    courseId: 'risk',
    title: 'Avoiding panic',
    minutes: 4,
    body: [
      'Markets fall — sometimes sharply. Selling in fear locks in losses and often happens near the bottom.',
      'Before the drop, decide what you’d do. Investors with a plan hold; investors without one panic.',
      'If your reasons for owning a stock haven’t changed, the price drop is usually noise, not news.',
    ],
    takeaways: [
      'Falling prices are normal, not fatal.',
      'Have a plan before the panic.',
      'Hold if your reasons haven’t changed.',
    ],
  },
  {
    id: 'risk-3',
    courseId: 'risk',
    title: 'Golden rules',
    minutes: 5,
    body: [
      'Invest money you won’t need soon. Understand what you buy. Diversify. Keep fees low. And think in years, not days.',
      'Boring? Yes. These rules have built more dukiya than any hot tip ever will.',
      'Master the basics and you’ll outperform most people chasing shortcuts.',
    ],
    takeaways: [
      'Only invest money you won’t need soon.',
      'Understand what you own.',
      'Patience and boring beats clever and reckless.',
    ],
  },
];

export function courseById(id: string) {
  return COURSES.find((c) => c.id === id);
}
export function lessonsForCourse(courseId: string) {
  return LESSONS.filter((l) => l.courseId === courseId);
}
export function lessonById(id: string) {
  return LESSONS.find((l) => l.id === id);
}
