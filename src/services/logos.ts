// Real company logos (downloaded to assets/logos). Statically imported so
// Metro bundles them. Companies without a clean logo fall back to initials.
import aapl from '@/assets/logos/aapl.png';
import airtelafri from '@/assets/logos/airtelafri.png';
import amzn from '@/assets/logos/amzn.png';
import buafoods from '@/assets/logos/buafoods.png';
import dangcem from '@/assets/logos/dangcem.png';
import geregu from '@/assets/logos/geregu.png';
import googl from '@/assets/logos/googl.png';
import gtco from '@/assets/logos/gtco.png';
import jaizbank from '@/assets/logos/jaizbank.png';
import msft from '@/assets/logos/msft.png';
import mtnn from '@/assets/logos/mtnn.png';
import nvda from '@/assets/logos/nvda.png';
import seplat from '@/assets/logos/seplat.png';
import tsla from '@/assets/logos/tsla.png';
import zenith from '@/assets/logos/zenith.png';

export const LOGOS: Record<string, unknown> = {
  aapl,
  airtelafri,
  amzn,
  buafoods,
  dangcem,
  geregu,
  googl,
  gtco,
  jaizbank,
  msft,
  mtnn,
  nvda,
  seplat,
  tsla,
  zenith,
};

export function getLogo(id: string): unknown | undefined {
  return LOGOS[id];
}
