import { normalizeCode } from '@/lib/utils';
import type { CurrencyOption } from '@/types/currency';

type CurrencyTuple = readonly [code: string, name: string, iso2: string];

/**
 * ISO 4217 currencies with a representative country/region for flag glyphs.
 * Names stay in English so codes remain unambiguous across locales.
 */
const RAW_CURRENCIES: readonly CurrencyTuple[] = [
  ['AED', 'UAE Dirham', 'AE'],
  ['AFN', 'Afghan Afghani', 'AF'],
  ['ALL', 'Albanian Lek', 'AL'],
  ['AMD', 'Armenian Dram', 'AM'],
  ['ANG', 'Netherlands Antillean Guilder', 'CW'],
  ['AOA', 'Angolan Kwanza', 'AO'],
  ['ARS', 'Argentine Peso', 'AR'],
  ['AUD', 'Australian Dollar', 'AU'],
  ['AWG', 'Aruban Florin', 'AW'],
  ['AZN', 'Azerbaijani Manat', 'AZ'],
  ['BAM', 'Bosnia-Herzegovina Convertible Mark', 'BA'],
  ['BBD', 'Barbadian Dollar', 'BB'],
  ['BDT', 'Bangladeshi Taka', 'BD'],
  ['BGN', 'Bulgarian Lev', 'BG'],
  ['BHD', 'Bahraini Dinar', 'BH'],
  ['BIF', 'Burundian Franc', 'BI'],
  ['BMD', 'Bermudian Dollar', 'BM'],
  ['BND', 'Brunei Dollar', 'BN'],
  ['BOB', 'Bolivian Boliviano', 'BO'],
  ['BRL', 'Brazilian Real', 'BR'],
  ['BSD', 'Bahamian Dollar', 'BS'],
  ['BTN', 'Bhutanese Ngultrum', 'BT'],
  ['BWP', 'Botswana Pula', 'BW'],
  ['BYN', 'Belarusian Ruble', 'BY'],
  ['BZD', 'Belize Dollar', 'BZ'],
  ['CAD', 'Canadian Dollar', 'CA'],
  ['CDF', 'Congolese Franc', 'CD'],
  ['CHF', 'Swiss Franc', 'CH'],
  ['CLP', 'Chilean Peso', 'CL'],
  ['CNY', 'Chinese Yuan', 'CN'],
  ['COP', 'Colombian Peso', 'CO'],
  ['CRC', 'Costa Rican Colón', 'CR'],
  ['CUP', 'Cuban Peso', 'CU'],
  ['CVE', 'Cape Verdean Escudo', 'CV'],
  ['CZK', 'Czech Koruna', 'CZ'],
  ['DJF', 'Djiboutian Franc', 'DJ'],
  ['DKK', 'Danish Krone', 'DK'],
  ['DOP', 'Dominican Peso', 'DO'],
  ['DZD', 'Algerian Dinar', 'DZ'],
  ['EGP', 'Egyptian Pound', 'EG'],
  ['ERN', 'Eritrean Nakfa', 'ER'],
  ['ETB', 'Ethiopian Birr', 'ET'],
  ['EUR', 'Euro', 'EU'],
  ['FJD', 'Fijian Dollar', 'FJ'],
  ['FKP', 'Falkland Islands Pound', 'FK'],
  ['GBP', 'British Pound Sterling', 'GB'],
  ['GEL', 'Georgian Lari', 'GE'],
  ['GHS', 'Ghanaian Cedi', 'GH'],
  ['GIP', 'Gibraltar Pound', 'GI'],
  ['GMD', 'Gambian Dalasi', 'GM'],
  ['GNF', 'Guinean Franc', 'GN'],
  ['GTQ', 'Guatemalan Quetzal', 'GT'],
  ['GYD', 'Guyanese Dollar', 'GY'],
  ['HKD', 'Hong Kong Dollar', 'HK'],
  ['HNL', 'Honduran Lempira', 'HN'],
  ['HTG', 'Haitian Gourde', 'HT'],
  ['HUF', 'Hungarian Forint', 'HU'],
  ['IDR', 'Indonesian Rupiah', 'ID'],
  ['ILS', 'Israeli New Shekel', 'IL'],
  ['INR', 'Indian Rupee', 'IN'],
  ['IQD', 'Iraqi Dinar', 'IQ'],
  ['IRR', 'Iranian Rial', 'IR'],
  ['ISK', 'Icelandic Króna', 'IS'],
  ['JMD', 'Jamaican Dollar', 'JM'],
  ['JOD', 'Jordanian Dinar', 'JO'],
  ['JPY', 'Japanese Yen', 'JP'],
  ['KES', 'Kenyan Shilling', 'KE'],
  ['KGS', 'Kyrgyzstani Som', 'KG'],
  ['KHR', 'Cambodian Riel', 'KH'],
  ['KMF', 'Comorian Franc', 'KM'],
  ['KRW', 'South Korean Won', 'KR'],
  ['KWD', 'Kuwaiti Dinar', 'KW'],
  ['KYD', 'Cayman Islands Dollar', 'KY'],
  ['KZT', 'Kazakhstani Tenge', 'KZ'],
  ['LAK', 'Lao Kip', 'LA'],
  ['LBP', 'Lebanese Pound', 'LB'],
  ['LKR', 'Sri Lankan Rupee', 'LK'],
  ['LRD', 'Liberian Dollar', 'LR'],
  ['LSL', 'Lesotho Loti', 'LS'],
  ['LYD', 'Libyan Dinar', 'LY'],
  ['MAD', 'Moroccan Dirham', 'MA'],
  ['MDL', 'Moldovan Leu', 'MD'],
  ['MGA', 'Malagasy Ariary', 'MG'],
  ['MKD', 'Macedonian Denar', 'MK'],
  ['MMK', 'Myanmar Kyat', 'MM'],
  ['MNT', 'Mongolian Tögrög', 'MN'],
  ['MOP', 'Macanese Pataca', 'MO'],
  ['MRU', 'Mauritanian Ouguiya', 'MR'],
  ['MUR', 'Mauritian Rupee', 'MU'],
  ['MVR', 'Maldivian Rufiyaa', 'MV'],
  ['MWK', 'Malawian Kwacha', 'MW'],
  ['MXN', 'Mexican Peso', 'MX'],
  ['MYR', 'Malaysian Ringgit', 'MY'],
  ['MZN', 'Mozambican Metical', 'MZ'],
  ['NAD', 'Namibian Dollar', 'NA'],
  ['NGN', 'Nigerian Naira', 'NG'],
  ['NIO', 'Nicaraguan Córdoba', 'NI'],
  ['NOK', 'Norwegian Krone', 'NO'],
  ['NPR', 'Nepalese Rupee', 'NP'],
  ['NZD', 'New Zealand Dollar', 'NZ'],
  ['OMR', 'Omani Rial', 'OM'],
  ['PAB', 'Panamanian Balboa', 'PA'],
  ['PEN', 'Peruvian Sol', 'PE'],
  ['PGK', 'Papua New Guinean Kina', 'PG'],
  ['PHP', 'Philippine Peso', 'PH'],
  ['PKR', 'Pakistani Rupee', 'PK'],
  ['PLN', 'Polish Złoty', 'PL'],
  ['PYG', 'Paraguayan Guaraní', 'PY'],
  ['QAR', 'Qatari Riyal', 'QA'],
  ['RON', 'Romanian Leu', 'RO'],
  ['RSD', 'Serbian Dinar', 'RS'],
  ['RUB', 'Russian Ruble', 'RU'],
  ['RWF', 'Rwandan Franc', 'RW'],
  ['SAR', 'Saudi Riyal', 'SA'],
  ['SBD', 'Solomon Islands Dollar', 'SB'],
  ['SCR', 'Seychellois Rupee', 'SC'],
  ['SDG', 'Sudanese Pound', 'SD'],
  ['SEK', 'Swedish Krona', 'SE'],
  ['SGD', 'Singapore Dollar', 'SG'],
  ['SHP', 'Saint Helena Pound', 'SH'],
  ['SLE', 'Sierra Leonean Leone', 'SL'],
  ['SOS', 'Somali Shilling', 'SO'],
  ['SRD', 'Surinamese Dollar', 'SR'],
  ['SSP', 'South Sudanese Pound', 'SS'],
  ['STN', 'São Tomé and Príncipe Dobra', 'ST'],
  ['SYP', 'Syrian Pound', 'SY'],
  ['SZL', 'Swazi Lilangeni', 'SZ'],
  ['THB', 'Thai Baht', 'TH'],
  ['TJS', 'Tajikistani Somoni', 'TJ'],
  ['TMT', 'Turkmenistani Manat', 'TM'],
  ['TND', 'Tunisian Dinar', 'TN'],
  ['TOP', 'Tongan Paʻanga', 'TO'],
  ['TRY', 'Turkish Lira', 'TR'],
  ['TTD', 'Trinidad and Tobago Dollar', 'TT'],
  ['TWD', 'New Taiwan Dollar', 'TW'],
  ['TZS', 'Tanzanian Shilling', 'TZ'],
  ['UAH', 'Ukrainian Hryvnia', 'UA'],
  ['UGX', 'Ugandan Shilling', 'UG'],
  ['USD', 'United States Dollar', 'US'],
  ['UYU', 'Uruguayan Peso', 'UY'],
  ['UZS', 'Uzbekistani Som', 'UZ'],
  ['VES', 'Venezuelan Bolívar Soberano', 'VE'],
  ['VND', 'Vietnamese Đồng', 'VN'],
  ['VUV', 'Vanuatu Vatu', 'VU'],
  ['WST', 'Samoan Tala', 'WS'],
  ['XAF', 'Central African CFA Franc', 'CM'],
  ['XCD', 'East Caribbean Dollar', 'AG'],
  ['XOF', 'West African CFA Franc', 'SN'],
  ['XPF', 'CFP Franc', 'PF'],
  ['YER', 'Yemeni Rial', 'YE'],
  ['ZAR', 'South African Rand', 'ZA'],
  ['ZMW', 'Zambian Kwacha', 'ZM'],
  ['ZWG', 'Zimbabwean Gold', 'ZW'],
  ['CNH', 'Chinese Yuan (Offshore)', 'CN'],
  ['CUC', 'Cuban Convertible Peso', 'CU'],
  ['GGP', 'Guernsey Pound', 'GG'],
  ['IMP', 'Isle of Man Pound', 'IM'],
  ['JEP', 'Jersey Pound', 'JE'],
  ['KPW', 'North Korean Won', 'KP'],
  ['SLL', 'Sierra Leonean Leone (old)', 'SL'],
  ['SVC', 'Salvadoran Colón', 'SV'],
  ['TVD', 'Tuvaluan Dollar', 'TV'],
  ['FOK', 'Faroese Króna', 'FO'],
  ['KID', 'Kiribati Dollar', 'KI'],
  ['XDR', 'IMF Special Drawing Rights', 'UN'],
  ['XAU', 'Gold (troy ounce)', 'UN'],
  ['XAG', 'Silver (troy ounce)', 'UN'],
  ['XPT', 'Platinum (troy ounce)', 'UN'],
  ['XPD', 'Palladium (troy ounce)', 'UN'],
  ['HRK', 'Croatian Kuna (legacy)', 'HR'],
  ['BOV', 'Bolivian Mvdol', 'BO'],
  ['CLF', 'Unidad de Fomento', 'CL'],
];

/**
 * Converts an ISO 3166-1 alpha-2 code into a flag emoji.
 */
export function flagFromIso2(iso2: string): string {
  const code = iso2.toUpperCase();
  if (code.length !== 2) {
    return '🏳️';
  }
  return String.fromCodePoint(...[...code].map((char) => 0x1f1e6 - 65 + char.charCodeAt(0)));
}

function toOption(tuple: CurrencyTuple): CurrencyOption {
  return { code: tuple[0], name: tuple[1], flag: flagFromIso2(tuple[2]) };
}

const unique = new Map<string, CurrencyOption>();
for (const tuple of RAW_CURRENCIES) {
  unique.set(tuple[0], toOption(tuple));
}

export const CURRENCIES: CurrencyOption[] = [...unique.values()].sort((a, b) =>
  a.code.localeCompare(b.code),
);

const CURRENCY_MAP = new Map(CURRENCIES.map((item) => [item.code, item]));

export const CURRENCY_CODES = new Set(CURRENCIES.map((item) => item.code));

/** Currencies available from the Frankfurter (ECB) historical API. */
export const FRANKFURTER_CURRENCIES = new Set([
  'AUD',
  'BGN',
  'BRL',
  'CAD',
  'CHF',
  'CNY',
  'CZK',
  'DKK',
  'EUR',
  'GBP',
  'HKD',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'ISK',
  'JPY',
  'KRW',
  'MXN',
  'MYR',
  'NOK',
  'NZD',
  'PHP',
  'PLN',
  'RON',
  'SEK',
  'SGD',
  'THB',
  'TRY',
  'USD',
  'ZAR',
]);

/** Eight high-traffic pairs shown as click-to-fill cards. */
export const POPULAR_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['USD', 'EUR'],
  ['USD', 'GBP'],
  ['USD', 'JPY'],
  ['USD', 'INR'],
  ['EUR', 'GBP'],
  ['USD', 'CAD'],
  ['USD', 'AUD'],
  ['EUR', 'JPY'],
];

/** Top 50 pairs statically generated for SEO landing pages. */
export const TOP_SEO_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['USD', 'EUR'],
  ['USD', 'GBP'],
  ['USD', 'JPY'],
  ['USD', 'INR'],
  ['USD', 'AUD'],
  ['USD', 'CAD'],
  ['USD', 'CHF'],
  ['USD', 'CNY'],
  ['USD', 'HKD'],
  ['USD', 'NZD'],
  ['USD', 'SGD'],
  ['USD', 'MXN'],
  ['USD', 'BRL'],
  ['USD', 'ZAR'],
  ['USD', 'KRW'],
  ['USD', 'SEK'],
  ['USD', 'NOK'],
  ['USD', 'DKK'],
  ['USD', 'PLN'],
  ['USD', 'TRY'],
  ['EUR', 'USD'],
  ['EUR', 'GBP'],
  ['EUR', 'JPY'],
  ['EUR', 'CHF'],
  ['EUR', 'AUD'],
  ['EUR', 'CAD'],
  ['EUR', 'INR'],
  ['EUR', 'CNY'],
  ['EUR', 'SEK'],
  ['EUR', 'NOK'],
  ['EUR', 'PLN'],
  ['GBP', 'USD'],
  ['GBP', 'EUR'],
  ['GBP', 'JPY'],
  ['GBP', 'AUD'],
  ['GBP', 'CAD'],
  ['GBP', 'INR'],
  ['GBP', 'CHF'],
  ['GBP', 'NZD'],
  ['AUD', 'USD'],
  ['AUD', 'JPY'],
  ['AUD', 'NZD'],
  ['AUD', 'CAD'],
  ['CAD', 'USD'],
  ['CAD', 'JPY'],
  ['NZD', 'JPY'],
  ['USD', 'AED'],
  ['USD', 'THB'],
  ['USD', 'PHP'],
  ['USD', 'IDR'],
];

export const TABLE_CURRENCIES = [
  'EUR',
  'GBP',
  'JPY',
  'AUD',
  'CAD',
  'CHF',
  'CNY',
  'INR',
  'MXN',
  'BRL',
];

/**
 * Looks up a currency option by ISO code.
 */
export function getCurrency(code: string): CurrencyOption | undefined {
  return CURRENCY_MAP.get(normalizeCode(code));
}

/**
 * Returns true when `code` is in the supported whitelist.
 */
export function isValidCurrencyCode(code: string): boolean {
  return CURRENCY_CODES.has(normalizeCode(code));
}

/**
 * Throws if `code` is not a supported ISO currency.
 */
export function assertCurrencyCode(code: string): string {
  const normalized = normalizeCode(code);
  if (!CURRENCY_CODES.has(normalized)) {
    throw new Error(`Unsupported currency code: ${code}`);
  }
  return normalized;
}

/**
 * Suggests related pair pages for internal linking.
 */
export function getRelatedPairs(from: string, to: string): Array<[string, string]> {
  const popular = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'CHF', 'CNY'];
  const related: Array<[string, string]> = [];
  const seen = new Set<string>([`${from}-${to}`]);
  for (const quote of popular) {
    if (quote !== from) {
      const key = `${from}-${quote}`;
      if (!seen.has(key)) {
        related.push([from, quote]);
        seen.add(key);
      }
    }
    if (related.length >= 5) {
      return related;
    }
  }
  for (const base of popular) {
    if (base !== to) {
      const key = `${base}-${to}`;
      if (!seen.has(key)) {
        related.push([base, to]);
        seen.add(key);
      }
    }
    if (related.length >= 5) {
      return related;
    }
  }
  return related;
}
