/**
 * Bill payments catalogue (Nigeria): airtime, data bundles, electricity
 * and TV subscriptions. Static provider lists for now — the payment itself
 * debits the wallet through `payBill` in the store; live aggregator
 * wiring (PrestaPay / vTPass-style) happens on the backend later.
 */

import airtelLogo from '@/assets/bills/airtel.png';
import dstvLogo from '@/assets/bills/dstv.png';
import gotvLogo from '@/assets/bills/gotv.png';
import ibedcLogo from '@/assets/bills/ibedc.png';
import aedcLogo from '@/assets/bills/aedc.png';
import ekoLogo from '@/assets/bills/eko.png';
import gloLogo from '@/assets/bills/glo.png';
import ikejaLogo from '@/assets/bills/ikeja.png';
import kedcoLogo from '@/assets/bills/kedco.png';
import mtnLogo from '@/assets/bills/mtn.png';
import phedLogo from '@/assets/bills/phed.png';
import showmaxLogo from '@/assets/bills/showmax.png';
import startimesLogo from '@/assets/bills/startimes.png';
import nmobileLogo from '@/assets/bills/9mobile.png';

export type BillCategory = 'airtime' | 'data' | 'electricity' | 'tv';

export interface BillProvider {
  id: string;
  name: string;
  /** short hint under the provider name (network colour, coverage…) */
  tag?: string;
  /** brand logo (bundled asset) */
  logo?: unknown;
}

export interface BillCategoryMeta {
  id: BillCategory;
  label: string;
  /** title of this category's dedicated screen */
  screenTitle: string;
  tagline: string;
  icon: string;
  accent: string;
  /** the account identifier this category needs (phone, meter, smartcard) */
  fieldLabel: string;
  fieldPlaceholder: string;
  fieldIcon: string;
  /** minimum digits for the field to count as valid */
  fieldMinDigits: number;
  presets: number[];
  min: number;
  providers: BillProvider[];
}

const TELCOS: BillProvider[] = [
  { id: 'mtn', name: 'MTN', tag: 'Yellow network', logo: mtnLogo },
  { id: 'airtel', name: 'Airtel', tag: 'Smart red', logo: airtelLogo },
  { id: 'glo', name: 'Glo', tag: 'Grand data', logo: gloLogo },
  { id: '9mobile', name: '9mobile', tag: 'Care network', logo: nmobileLogo },
];

export const BILL_CATEGORIES: BillCategoryMeta[] = [
  {
    id: 'airtime',
    label: 'Airtime',
    screenTitle: 'Buy Airtime',
    tagline: 'Top up any line, instantly',
    icon: 'phone-portrait-outline',
    accent: '#1F7AE0',
    fieldLabel: 'Phone number',
    fieldPlaceholder: 'e.g. 0803 123 4567',
    fieldIcon: 'call-outline',
    fieldMinDigits: 11,
    presets: [100, 200, 500, 1000, 2000],
    min: 50,
    providers: TELCOS,
  },
  {
    id: 'data',
    label: 'Data',
    screenTitle: 'Buy Data',
    tagline: 'Bundles for browsing',
    icon: 'globe-outline',
    accent: '#7C5CFF',
    fieldLabel: 'Phone number',
    fieldPlaceholder: 'e.g. 0803 123 4567',
    fieldIcon: 'call-outline',
    fieldMinDigits: 11,
    presets: [500, 1000, 2000, 5000, 10000],
    min: 100,
    providers: TELCOS,
  },
  {
    id: 'electricity',
    label: 'Electricity',
    screenTitle: 'Pay Electricity',
    tagline: 'Pay your disco meter',
    icon: 'flash-outline',
    accent: '#F6A623',
    fieldLabel: 'Meter number',
    fieldPlaceholder: 'e.g. 4530 118 223',
    fieldIcon: 'flash-outline',
    fieldMinDigits: 8,
    presets: [1000, 2000, 5000, 10000, 20000],
    min: 500,
    providers: [
      { id: 'aedc', name: 'Abuja Electric', tag: 'AEDC', logo: aedcLogo },
      { id: 'ikedc', name: 'Ikeja Electric', tag: 'IKEDC', logo: ikejaLogo },
      { id: 'ekedc', name: 'Eko Electric', tag: 'EKEDC', logo: ekoLogo },
      { id: 'phed', name: 'Port Harcourt', tag: 'PHED', logo: phedLogo },
      { id: 'kaedco', name: 'Kano Electric', tag: 'KEDCO', logo: kedcoLogo },
      { id: 'ibedc', name: 'Ibadan Electric', tag: 'IBEDC', logo: ibedcLogo },
    ],
  },
  {
    id: 'tv',
    label: 'TV',
    screenTitle: 'TV Subscription',
    tagline: 'DStv, GOtv & more',
    icon: 'tv-outline',
    accent: '#E0483E',
    fieldLabel: 'Smartcard / account no.',
    fieldPlaceholder: 'e.g. 7043 118 221',
    fieldIcon: 'tv-outline',
    fieldMinDigits: 7,
    presets: [2000, 5000, 10000, 15000, 25000],
    min: 500,
    providers: [
      { id: 'dstv', name: 'DStv', tag: 'MultiChoice', logo: dstvLogo },
      { id: 'gotv', name: 'GOtv', tag: 'MultiChoice', logo: gotvLogo },
      { id: 'startimes', name: 'Startimes', tag: 'Digital TV', logo: startimesLogo },
      { id: 'showmax', name: 'Showmax', tag: 'Streaming', logo: showmaxLogo },
    ],
  },
];

export function getBillCategory(id: string | undefined | null): BillCategoryMeta {
  return BILL_CATEGORIES.find((c) => c.id === id) ?? BILL_CATEGORIES[0];
}
