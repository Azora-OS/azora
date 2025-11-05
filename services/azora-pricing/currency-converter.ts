/**
 * AZORA CURRENCY CONVERTER
 * 
 * Real-time currency conversion with proper formatting for all countries
 */

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  symbolBefore: boolean; // true = $100, false = 100 KSh
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

// ============================================================================
// CURRENCY DATABASE
// ============================================================================

export const CURRENCIES: Record<string, Currency> = {
  // North America
  'USD': { 
    code: 'USD', 
    symbol: '$', 
    name: 'US Dollar',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'CAD': { 
    code: 'CAD', 
    symbol: 'C$', 
    name: 'Canadian Dollar',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'MXN': { 
    code: 'MXN', 
    symbol: '$', 
    name: 'Mexican Peso',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  
  // Europe
  'EUR': { 
    code: 'EUR', 
    symbol: '€', 
    name: 'Euro',
    symbolBefore: false,
    decimalPlaces: 2,
    thousandsSeparator: '.',
    decimalSeparator: ','
  },
  'GBP': { 
    code: 'GBP', 
    symbol: '£', 
    name: 'British Pound',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'CHF': { 
    code: 'CHF', 
    symbol: 'CHF', 
    name: 'Swiss Franc',
    symbolBefore: false,
    decimalPlaces: 2,
    thousandsSeparator: "'",
    decimalSeparator: '.'
  },
  
  // Africa - Southern
  'ZAR': { 
    code: 'ZAR', 
    symbol: 'R', 
    name: 'South African Rand',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'BWP': { 
    code: 'BWP', 
    symbol: 'P', 
    name: 'Botswana Pula',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'NAD': { 
    code: 'NAD', 
    symbol: 'N$', 
    name: 'Namibian Dollar',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  
  // Africa - East
  'KES': { 
    code: 'KES', 
    symbol: 'KSh', 
    name: 'Kenyan Shilling',
    symbolBefore: false,
    decimalPlaces: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'TZS': { 
    code: 'TZS', 
    symbol: 'TSh', 
    name: 'Tanzanian Shilling',
    symbolBefore: false,
    decimalPlaces: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'UGX': { 
    code: 'UGX', 
    symbol: 'USh', 
    name: 'Ugandan Shilling',
    symbolBefore: false,
    decimalPlaces: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'RWF': { 
    code: 'RWF', 
    symbol: 'FRw', 
    name: 'Rwandan Franc',
    symbolBefore: false,
    decimalPlaces: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'ETB': { 
    code: 'ETB', 
    symbol: 'Br', 
    name: 'Ethiopian Birr',
    symbolBefore: false,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  
  // Africa - West
  'NGN': { 
    code: 'NGN', 
    symbol: '₦', 
    name: 'Nigerian Naira',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'GHS': { 
    code: 'GHS', 
    symbol: 'GH₵', 
    name: 'Ghanaian Cedi',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'XOF': { 
    code: 'XOF', 
    symbol: 'CFA', 
    name: 'West African CFA Franc',
    symbolBefore: false,
    decimalPlaces: 0,
    thousandsSeparator: ' ',
    decimalSeparator: ','
  },
  
  // Africa - North
  'EGP': { 
    code: 'EGP', 
    symbol: 'E£', 
    name: 'Egyptian Pound',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'MAD': { 
    code: 'MAD', 
    symbol: 'DH', 
    name: 'Moroccan Dirham',
    symbolBefore: false,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  
  // Asia
  'INR': { 
    code: 'INR', 
    symbol: '₹', 
    name: 'Indian Rupee',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'CNY': { 
    code: 'CNY', 
    symbol: '¥', 
    name: 'Chinese Yuan',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'JPY': { 
    code: 'JPY', 
    symbol: '¥', 
    name: 'Japanese Yen',
    symbolBefore: true,
    decimalPlaces: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'KRW': { 
    code: 'KRW', 
    symbol: '₩', 
    name: 'South Korean Won',
    symbolBefore: true,
    decimalPlaces: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'SGD': { 
    code: 'SGD', 
    symbol: 'S$', 
    name: 'Singapore Dollar',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'THB': { 
    code: 'THB', 
    symbol: '฿', 
    name: 'Thai Baht',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'MYR': { 
    code: 'MYR', 
    symbol: 'RM', 
    name: 'Malaysian Ringgit',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'PHP': { 
    code: 'PHP', 
    symbol: '₱', 
    name: 'Philippine Peso',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'IDR': { 
    code: 'IDR', 
    symbol: 'Rp', 
    name: 'Indonesian Rupiah',
    symbolBefore: true,
    decimalPlaces: 0,
    thousandsSeparator: '.',
    decimalSeparator: ','
  },
  'VND': { 
    code: 'VND', 
    symbol: '₫', 
    name: 'Vietnamese Dong',
    symbolBefore: false,
    decimalPlaces: 0,
    thousandsSeparator: '.',
    decimalSeparator: ','
  },
  'PKR': { 
    code: 'PKR', 
    symbol: 'Rs', 
    name: 'Pakistani Rupee',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'BDT': { 
    code: 'BDT', 
    symbol: '৳', 
    name: 'Bangladeshi Taka',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  
  // South America
  'BRL': { 
    code: 'BRL', 
    symbol: 'R$', 
    name: 'Brazilian Real',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: '.',
    decimalSeparator: ','
  },
  'ARS': { 
    code: 'ARS', 
    symbol: '$', 
    name: 'Argentine Peso',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: '.',
    decimalSeparator: ','
  },
  'CLP': { 
    code: 'CLP', 
    symbol: '$', 
    name: 'Chilean Peso',
    symbolBefore: true,
    decimalPlaces: 0,
    thousandsSeparator: '.',
    decimalSeparator: ','
  },
  'COP': { 
    code: 'COP', 
    symbol: '$', 
    name: 'Colombian Peso',
    symbolBefore: true,
    decimalPlaces: 0,
    thousandsSeparator: '.',
    decimalSeparator: ','
  },
  'PEN': { 
    code: 'PEN', 
    symbol: 'S/', 
    name: 'Peruvian Sol',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  
  // Oceania
  'AUD': { 
    code: 'AUD', 
    symbol: 'A$', 
    name: 'Australian Dollar',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'NZD': { 
    code: 'NZD', 
    symbol: 'NZ$', 
    name: 'New Zealand Dollar',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  
  // Middle East
  'SAR': { 
    code: 'SAR', 
    symbol: 'SR', 
    name: 'Saudi Riyal',
    symbolBefore: false,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'AED': { 
    code: 'AED', 
    symbol: 'AED', 
    name: 'UAE Dirham',
    symbolBefore: false,
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  'TRY': { 
    code: 'TRY', 
    symbol: '₺', 
    name: 'Turkish Lira',
    symbolBefore: true,
    decimalPlaces: 2,
    thousandsSeparator: '.',
    decimalSeparator: ','
  },
};

// ============================================================================
// EXCHANGE RATES (Real-time + Fallback)
// ============================================================================

/**
 * Get real-time exchange rates from USD
 */
export async function getExchangeRates(): Promise<Record<string, number>> {
  try {
    // Try primary API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    
    if (data.rates) {
      return data.rates;
    }
  } catch (error) {
    console.warn('Primary exchange rate API failed, trying backup...');
  }
  
  try {
    // Try backup API
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    
    if (data.rates) {
      return data.rates;
    }
  } catch (error) {
    console.warn('Backup exchange rate API failed, using static rates...');
  }
  
  // Fallback to static rates (updated periodically)
  return STATIC_EXCHANGE_RATES;
}

/**
 * Static exchange rates (fallback) - Updated: 2025-11-05
 */
const STATIC_EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.00,
  'EUR': 0.92,
  'GBP': 0.79,
  'CAD': 1.35,
  'AUD': 1.52,
  'NZD': 1.65,
  'CHF': 0.88,
  
  // Africa
  'ZAR': 18.50,
  'NGN': 780.00,
  'KES': 130.00,
  'GHS': 12.00,
  'TZS': 2500.00,
  'UGX': 3700.00,
  'EGP': 30.90,
  'MAD': 10.00,
  'ETB': 55.00,
  'RWF': 1300.00,
  'BWP': 13.50,
  'NAD': 18.50,
  'XOF': 600.00,
  
  // Asia
  'INR': 83.00,
  'CNY': 7.20,
  'JPY': 150.00,
  'KRW': 1320.00,
  'SGD': 1.34,
  'THB': 35.00,
  'MYR': 4.70,
  'PHP': 56.00,
  'IDR': 15700.00,
  'VND': 24000.00,
  'PKR': 278.00,
  'BDT': 110.00,
  
  // South America
  'BRL': 5.00,
  'MXN': 17.00,
  'ARS': 350.00,
  'CLP': 900.00,
  'COP': 4000.00,
  'PEN': 3.75,
  
  // Middle East
  'SAR': 3.75,
  'AED': 3.67,
  'TRY': 28.50
};

// ============================================================================
// CURRENCY CONVERSION
// ============================================================================

/**
 * Convert USD amount to target currency
 */
export async function convertUSDTo(
  amountUSD: number, 
  targetCurrency: string
): Promise<number> {
  const rates = await getExchangeRates();
  const rate = rates[targetCurrency] || 1;
  
  const converted = amountUSD * rate;
  
  // Round based on currency decimal places
  const currency = CURRENCIES[targetCurrency];
  if (!currency) return converted;
  
  if (currency.decimalPlaces === 0) {
    return Math.round(converted);
  } else {
    return Math.round(converted * 100) / 100;
  }
}

/**
 * Convert from any currency to USD
 */
export async function convertToUSD(
  amount: number, 
  fromCurrency: string
): Promise<number> {
  const rates = await getExchangeRates();
  const rate = rates[fromCurrency] || 1;
  return amount / rate;
}

/**
 * Convert between any two currencies
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  const rates = await getExchangeRates();
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  const converted = usdAmount * toRate;
  
  const currency = CURRENCIES[toCurrency];
  if (!currency) return converted;
  
  if (currency.decimalPlaces === 0) {
    return Math.round(converted);
  } else {
    return Math.round(converted * 100) / 100;
  }
}

// ============================================================================
// PRICE FORMATTING
// ============================================================================

/**
 * Format number with thousands separators
 */
function formatNumber(
  value: number,
  decimalPlaces: number,
  thousandsSeparator: string,
  decimalSeparator: string
): string {
  // Round to decimal places
  const rounded = decimalPlaces === 0 
    ? Math.round(value)
    : Math.round(value * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
  
  // Split into integer and decimal parts
  const parts = rounded.toFixed(decimalPlaces).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Add thousands separators
  const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  
  // Combine with decimal part if needed
  if (decimalPlaces > 0 && decimalPart) {
    return `${withSeparators}${decimalSeparator}${decimalPart}`;
  }
  
  return withSeparators;
}

/**
 * Format price in specific currency
 */
export function formatPrice(amount: number, currencyCode: string): string {
  const currency = CURRENCIES[currencyCode];
  
  if (!currency) {
    // Fallback formatting
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
  
  const formattedNumber = formatNumber(
    amount,
    currency.decimalPlaces,
    currency.thousandsSeparator,
    currency.decimalSeparator
  );
  
  if (currency.symbolBefore) {
    return `${currency.symbol}${formattedNumber}`;
  } else {
    return `${formattedNumber} ${currency.symbol}`;
  }
}

/**
 * Format price with both original USD and local currency
 */
export async function formatPriceWithBoth(
  amountUSD: number,
  localCurrency: string
): Promise<string> {
  const localAmount = await convertUSDTo(amountUSD, localCurrency);
  const localFormatted = formatPrice(localAmount, localCurrency);
  const usdFormatted = formatPrice(amountUSD, 'USD');
  
  if (localCurrency === 'USD') {
    return usdFormatted;
  }
  
  return `${localFormatted} (${usdFormatted})`;
}

// ============================================================================
// PRICING DISPLAY EXAMPLES
// ============================================================================

/**
 * Get pricing examples for different countries
 */
export async function getPricingExamples(): Promise<Record<string, any>> {
  const studentPriceUSD = 49;
  
  const examples: Record<string, any> = {};
  
  const sampleCountries = [
    { code: 'USD', country: 'United States' },
    { code: 'ZAR', country: 'South Africa' },
    { code: 'NGN', country: 'Nigeria' },
    { code: 'KES', country: 'Kenya' },
    { code: 'GBP', country: 'United Kingdom' },
    { code: 'EUR', country: 'Germany' },
    { code: 'INR', country: 'India' },
    { code: 'BRL', country: 'Brazil' }
  ];
  
  for (const { code, country } of sampleCountries) {
    const localPrice = await convertUSDTo(studentPriceUSD, code);
    const formatted = formatPrice(localPrice, code);
    
    examples[country] = {
      currencyCode: code,
      priceUSD: studentPriceUSD,
      priceLocal: localPrice,
      formatted: formatted,
      currency: CURRENCIES[code]
    };
  }
  
  return examples;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  CURRENCIES,
  getExchangeRates,
  convertUSDTo,
  convertToUSD,
  convertCurrency,
  formatPrice,
  formatPriceWithBoth,
  getPricingExamples
};
