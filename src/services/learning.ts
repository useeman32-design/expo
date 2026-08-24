import type { Course, GlossaryTerm, Lesson } from '@/types';

export const LEARN_CATEGORIES = [
  'All',
  'Beginner',
  'Investing',
  'Trading',
  'Nigerian Market',
  'Risk Management',
] as const;

export const COURSES: Course[] = [
  {
    id: 'c-basics',
    title: 'Basics of Investing',
    category: 'Beginner',
    level: 'Beginner',
    minutes: 18,
    progress: 60,
    color: '#0E8A57',
    icon: 'leaf',
    blurb: 'What investing is and how anyone in Nigeria can start — even with ₦1,000.',
  },
  {
    id: 'c-what-is-stock',
    title: 'What is a Stock?',
    category: 'Beginner',
    level: 'Beginner',
    minutes: 5,
    readTime: '5 min read',
    progress: 0,
    color: '#11A06B',
    icon: 'cube',
    blurb: 'Understand what a share really is and what you own when you buy one.',
  },
  {
    id: 'c-ngx-how',
    title: 'How the Nigerian Stock Market Works',
    category: 'Nigerian Market',
    level: 'Beginner',
    minutes: 8,
    readTime: '8 min read',
    progress: 0,
    color: '#0E8A57',
    icon: 'business',
    blurb: 'A simple tour of the NGX and how shares are bought and sold in Nigeria.',
  },
  {
    id: 'c-first-stock',
    title: 'How to Buy Your First Stock',
    category: 'Investing',
    level: 'Beginner',
    minutes: 10,
    readTime: '10 min read',
    progress: 25,
    color: '#3DDC97',
    icon: 'cart',
    blurb: 'A step-by-step walkthrough of placing your very first trade.',
  },
  {
    id: 'c-dividends',
    title: 'What Are Dividends?',
    category: 'Investing',
    level: 'Beginner',
    minutes: 6,
    readTime: '6 min read',
    progress: 0,
    color: '#F6A623',
    icon: 'cash',
    blurb: 'How companies share profits with investors — and what to expect.',
  },
  {
    id: 'c-charts',
    title: 'How to Read a Stock Chart',
    category: 'Trading',
    level: 'Intermediate',
    minutes: 8,
    readTime: '8 min read',
    progress: 0,
    color: '#7C5CFF',
    icon: 'analytics',
    blurb: 'Make sense of price charts, trends and ranges without the jargon.',
  },
  {
    id: 'c-risk',
    title: 'Understanding Investment Risk',
    category: 'Risk Management',
    level: 'Intermediate',
    minutes: 7,
    readTime: '7 min read',
    progress: 0,
    color: '#DD4B3E',
    icon: 'shield',
    blurb: 'Protect your money: position sizing, diversification and avoiding panic.',
  },
];

export const LESSONS: Lesson[] = [
  {
    id: 'l-basics',
    courseId: 'c-basics',
    title: 'Basics of Investing',
    minutes: 18,
    body: [
      'Investing means putting your money to work so it can grow over time — instead of letting it sit idle. In Nigeria, anyone can start investing in real companies from as little as ₦1,000.',
      'There are two main ways your money grows: the price of what you own can rise, and some companies pay you a share of their profits called dividends.',
      'The secret is time and consistency. Start small, keep learning, and let your money compound. This is how ordinary people build lasting wealth (dukiya).',
    ],
    takeaways: [
      'Investing puts your money to work to grow.',
      'You can grow from price rises and dividends.',
      'Start small and stay consistent — time is your ally.',
    ],
  },
  {
    id: 'l-what-is-stock',
    courseId: 'c-what-is-stock',
    title: 'What is a Stock?',
    minutes: 5,
    body: [
      'A stock (or share) is a small piece of ownership in a company. When you buy one share of MTN Nigeria, you literally own a tiny fraction of MTN.',
      'Companies sell shares to raise money to grow. In return, shareholders may receive dividends (a share of profits) and benefit if the business becomes more valuable over time.',
      'On the Nigerian Exchange (NGX), you can buy shares in familiar names like MTN, Dangote Cement and Airtel Africa through a licensed app or broker.',
    ],
    takeaways: [
      'A share = a slice of company ownership.',
      'You can earn from price growth and dividends.',
      'In Nigeria you trade on the NGX through a licensed broker.',
    ],
  },
  {
    id: 'l-ngx-how',
    courseId: 'c-ngx-how',
    title: 'How the Nigerian Stock Market Works',
    minutes: 8,
    body: [
      'The Nigerian Exchange Group (NGX) is where shares of Nigerian companies are bought and sold. Prices move based on supply and demand.',
      'Apps connect you to licensed brokers that execute your orders on the exchange during market hours on weekdays.',
      'You can start small — many platforms let you buy shares from around ₦1,000, so you don’t need to be rich to begin.',
    ],
    takeaways: [
      'The NGX matches buyers and sellers of Nigerian shares.',
      'Prices reflect supply and demand.',
      'You can begin investing with as little as ₦1,000.',
    ],
  },
  {
    id: 'l-first-stock',
    courseId: 'c-first-stock',
    title: 'How to Buy Your First Stock',
    minutes: 10,
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
  {
    id: 'l-dividends',
    courseId: 'c-dividends',
    title: 'What Are Dividends?',
    minutes: 6,
    body: [
      'A dividend is a portion of a company’s profits paid back to shareholders — usually in cash — as a thank-you for investing.',
      'Not all companies pay dividends. Fast-growing firms often reinvest profits instead, while mature Nigerian banks and telcos frequently pay generous dividends.',
      'Dividend yield (annual dividend ÷ share price) helps you compare how much income a stock pays.',
    ],
    takeaways: [
      'Dividends = your share of company profits.',
      'Mature companies tend to pay more.',
      'Dividend yield compares income across stocks.',
    ],
  },
  {
    id: 'l-charts',
    courseId: 'c-charts',
    title: 'How to Read a Stock Chart',
    minutes: 8,
    body: [
      'A price chart plots a stock’s price over time. A line climbing up-and-to-the-right shows a stock growing in value.',
      'Switching time ranges (1D, 1W, 1M, 1Y) shows how the stock behaves over different horizons. Don’t stare at one-day moves — zoom out to see the real trend.',
      'Green means gains, red means losses. Pair price with volume (how many shares traded) and you’ll read the market far better.',
    ],
    takeaways: [
      'Up-and-to-the-right = growth over time.',
      'Use time ranges to compare short vs long trends.',
      'Read price and volume together.',
    ],
  },
  {
    id: 'l-risk',
    courseId: 'c-risk',
    title: 'Understanding Investment Risk',
    minutes: 7,
    body: [
      'Markets fall — sometimes sharply. Selling in fear locks in losses and often happens near the bottom.',
      'Never put your whole account into one stock. Cap any single holding at a small share of your portfolio so one mistake can’t be fatal.',
      'Diversify across sectors and markets, invest only money you won’t need soon, and think in years — not days.',
    ],
    takeaways: [
      'Only invest money you won’t need soon.',
      'Cap each holding and diversify.',
      'Patience and boring beats clever and reckless.',
    ],
  },
];

export const GLOSSARY: GlossaryTerm[] = [
  {
    ha: 'Hannun jari',
    en: 'Shares / stock',
    meaning: 'A unit of ownership in a company.',
  },
  {
    ha: 'Riba',
    en: 'Interest / usury',
    meaning: 'Interest on money, avoided by halal investors.',
  },
  {
    ha: 'Kasuwanci',
    en: 'Trade / market',
    meaning: 'Buying, selling and commerce.',
  },
  {
    ha: 'Kudi',
    en: 'Money',
    meaning: 'Currency such as the Naira (₦).',
  },
  {
    ha: 'Dukiya',
    en: 'Wealth',
    meaning: 'Accumulated money and assets.',
  },
];

export function getCourses(category: string = 'All'): Course[] {
  if (category === 'All') return COURSES;
  return COURSES.filter((c) => c.category === category);
}
export function getCourse(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}
export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
export function getLessonByCourse(courseId: string): Lesson | undefined {
  return LESSONS.find((l) => l.courseId === courseId);
}
export function getContinueLearning(): Course {
  return COURSES.find((c) => c.progress > 0 && c.progress < 100) ?? COURSES[0];
}
export function overallProgress(): number {
  return Math.round(
    COURSES.reduce((a, c) => a + c.progress, 0) / COURSES.length,
  );
}
