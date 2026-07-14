// Resolves a brand name to a real company logo.
//
// NOTE: this used to call Clearbit's free logo API (logo.clearbit.com),
// but Clearbit permanently shut that service down in December 2025.
// It now uses CompanyEnrich's free Logo API instead, which works the
// same way (no API key, no signup): https://api.companyenrich.com/logo/<domain>
//
// For brands with a domain that doesn't match a simple guess, add an
// override below. Anything unmapped still gets a best-effort guess
// (brand name -> "brandname.com"), and the <img> in CouponCard/
// CouponDetailPage falls back to the colored gradient banner if the
// logo request fails.

const DOMAIN_OVERRIDES = {
  swiggy: 'swiggy.com',
  zomato: 'zomato.com',
  amazon: 'amazon.in',
  flipkart: 'flipkart.com',
  bookmyshow: 'bookmyshow.com',
  makemytrip: 'makemytrip.com',
  myntra: 'myntra.com',
  nykaa: 'nykaa.com',
  bigbasket: 'bigbasket.com',
  uber: 'uber.com',
  pharmeasy: 'pharmeasy.in',
  cleartrip: 'cleartrip.com',
  puma: 'puma.com',
  ola: 'olacabs.com',
  ajio: 'ajio.com',
  netflix: 'netflix.com',
  spotify: 'spotify.com',
  'domino\'s': 'dominos.co.in',
  dominos: 'dominos.co.in',
  mcdonalds: 'mcdonaldsindia.com',
  'mcdonald\'s': 'mcdonaldsindia.com',
  starbucks: 'starbucks.in',
  adidas: 'adidas.co.in',
  nike: 'nike.com',
  ikea: 'ikea.com',
  'h&m': 'hm.com',
  croma: 'croma.com',
  airtel: 'airtel.in',
  jio: 'jio.com',
  paytm: 'paytm.com',
  phonepe: 'phonepe.com',
  google: 'google.com',
  apple: 'apple.com',
  samsung: 'samsung.com',
  sony: 'sony.co.in',
  lg: 'lg.com',
  decathlon: 'decathlon.in',
  lenskart: 'lenskart.com',
  firstcry: 'firstcry.com',
  'urban company': 'urbancompany.com',
  dunzo: 'dunzo.com',
  blinkit: 'blinkit.com',
  zepto: 'zeptonow.com',
  swiggyinstamart: 'swiggy.com',
  bookmyshow_events: 'bookmyshow.com',
  vistara: 'airvistara.com',
  indigo: 'goindigo.in',
  irctc: 'irctc.co.in',
  redbus: 'redbus.in',
  oyo: 'oyorooms.com',
  zerodha: 'zerodha.com',
  swiggygenie: 'swiggy.com',
  minimalist: 'beminimalist.co',
  mamaearth: 'mamaearth.in',
  giva: 'giva.co',
  sudathi: 'sudathi.com',
};

function slugify(brand) {
  return brand.trim().toLowerCase();
}

export function getBrandLogoUrl(brand) {
  if (!brand) return null;
  const key = slugify(brand);
  const domain = DOMAIN_OVERRIDES[key] || `${key.replace(/[^a-z0-9]/g, '')}.com`;
  return `https://api.companyenrich.com/logo/${domain}`;
}
