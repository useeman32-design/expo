/**
 * Legal documents (mock content).
 * Production: fetched from /api/legal so wording can be updated by counsel
 * without an app release. These drafts must be reviewed by a Nigerian lawyer
 * before launch.
 */

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  updated: string;
  sections: LegalSection[];
}

export const LEGAL_DOCS: LegalDoc[] = [
  {
    id: 'terms',
    title: 'Terms of Service',
    subtitle: 'The agreement between you and StocksX',
    icon: 'document-text-outline',
    color: '#0E8A57',
    updated: 'August 2026',
    sections: [
      {
        heading: '1. About these terms',
        body: [
          'These Terms govern your use of the StocksX app operated by StocksX Technologies Ltd (RC 0000000), a company incorporated in Nigeria. By creating an account you accept these Terms, our Privacy Policy and our Risk Disclosure.',
          'StocksX provides technology that connects you to a sponsoring broker/dealer licensed by the Securities and Exchange Commission (SEC). Orders to buy or sell securities are executed by the sponsoring broker; StocksX does not hold client funds or securities directly.',
        ],
      },
      {
        heading: '2. Your account',
        body: [
          'You must be at least 18 years old, provide accurate KYC information (BVN, NIN and valid identification) and keep your login credentials confidential. You are responsible for all activity under your account.',
          'We may suspend accounts where we detect fraud, market abuse, sanctions exposure or a breach of these Terms.',
        ],
      },
      {
        heading: '3. Trading and settlement',
        body: [
          'Orders are routed to the Nigerian Exchange (NGX) through our sponsoring broker during market hours. Trades settle on the T+3 cycle. Prices shown in the app are indicative; the price you receive is the price at which your order executes on the exchange.',
          'You may cancel an order only while it is still pending execution. Executed trades cannot be reversed.',
        ],
      },
      {
        heading: '4. Fees',
        body: [
          'You agree to pay the fees shown in our Fee Schedule, including brokerage commission and applicable statutory charges (SEC, NGX, CSCS, NSC, stamp duty). Fees are disclosed before you confirm every order.',
        ],
      },
      {
        heading: '5. Liability',
        body: [
          'Investing carries risk. StocksX is not liable for losses caused by market movements, exchange outages, or decisions you make based on educational content in the Learn section. Our maximum aggregate liability is limited to the fees you paid us in the preceding 12 months.',
        ],
      },
      {
        heading: '6. Governing law',
        body: [
          'These Terms are governed by the laws of the Federal Republic of Nigeria. Disputes are subject to arbitration in Lagos under the Arbitration and Mediation Act.',
        ],
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'How we handle your data (NDPR compliant)',
    icon: 'lock-closed-outline',
    color: '#1F7AE0',
    updated: 'August 2026',
    sections: [
      {
        heading: '1. Data we collect',
        body: [
          'Identity data: name, email, phone number, BVN, NIN, ID document images and selfie. Financial data: bank accounts, wallet balances, orders and transactions. Device data: device model, IP address and app usage events.',
        ],
      },
      {
        heading: '2. Why we collect it',
        body: [
          'To verify your identity as required by SEC and CBN regulations, to execute and settle your orders, to keep your account secure, and to improve the product. We do not sell your personal data.',
        ],
      },
      {
        heading: '3. Who we share it with',
        body: [
          'Our sponsoring broker (to execute trades and hold securities in your CSCS account), KYC/identity verification providers, payment processors (Paystack, Flutterwave, Monnify), regulators when legally required, and cloud infrastructure providers bound by confidentiality agreements.',
        ],
      },
      {
        heading: '4. Your rights',
        body: [
          'Under the Nigeria Data Protection Regulation you may request access to your data, correction of inaccurate data, deletion of your account (subject to regulatory retention rules — transaction records are kept for at least 5 years), and withdrawal of consent for optional processing.',
        ],
      },
      {
        heading: '5. Security & retention',
        body: [
          'Data is encrypted in transit (TLS 1.2+) and at rest. Access is role-based and audited. Verification documents are retained for the period required by SEC/AML rules and then securely deleted.',
        ],
      },
    ],
  },
  {
    id: 'risk',
    title: 'Risk Disclosure',
    subtitle: 'Investing involves risk — read before trading',
    icon: 'warning-outline',
    color: '#DD4B3E',
    updated: 'August 2026',
    sections: [
      {
        heading: '1. Capital at risk',
        body: [
          'The value of investments can fall as well as rise. You may get back less than you invested. Past performance — including any figures shown in this app — does not guarantee future results.',
        ],
      },
      {
        heading: '2. No guarantee of orders',
        body: [
          'Orders are subject to market conditions. During volatility or exchange outages, orders may be delayed, partially filled or rejected at no fault of StocksX. Limit orders may never execute.',
        ],
      },
      {
        heading: '3. Naira and liquidity risk',
        body: [
          'NGX-listed securities are priced in Naira. Currency movements, exchange trading suspensions and low liquidity in some tickers can affect your ability to sell at the price you expect.',
        ],
      },
      {
        heading: '4. Sharia screening limitations',
        body: [
          'Halal screening follows AAOIFI Standard 21 as interpreted by our data providers. A compliance badge is a screening result, not a religious ruling. Please consult a qualified scholar for personal guidance.',
        ],
      },
      {
        heading: '5. Educational content',
        body: [
          'Lessons in the Learn section are educational only and do not constitute investment advice or a solicitation to buy any security. StocksX does not provide personalised investment advice.',
        ],
      },
    ],
  },
  {
    id: 'fees',
    title: 'Fee Schedule',
    subtitle: 'Every cost, shown before you trade',
    icon: 'receipt-outline',
    color: '#F6A623',
    updated: 'August 2026',
    sections: [
      {
        heading: '1. Trading fees (NGX)',
        body: [
          'Commission: 1.35% of trade value (minimum ₦1,500 per order), inclusive of: SEC fee 0.3%, NGX fee 0.3%, CSCS trade alert ₦4.33, stamp duty 0.08% (buy only), transfer fee 0.06%. The total is displayed on the confirmation screen before you place any order.',
        ],
      },
      {
        heading: '2. Deposits',
        body: [
          'Bank transfer to your dedicated account number: free. USSD: 0.5% + ₦50 (gateway fee). Debit card: 1.5% + ₦100 capped at ₦2,000 (gateway fee, waived under ₦2,500).',
        ],
      },
      {
        heading: '3. Withdrawals',
        body: [
          'First withdrawal each calendar month: free. Subsequent withdrawals: ₦100 per transfer (interbank fee). Payouts only to bank accounts in your own verified name.',
        ],
      },
      {
        heading: '4. Other',
        body: [
          'Account maintenance: free. Inactivity: free. Dividend processing: free (withholding tax of 10% is deducted at source by the registrar as required by law).',
        ],
      },
    ],
  },
];

export function getLegalDoc(id: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((d) => d.id === id);
}
