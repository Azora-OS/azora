/**
 * Africa Expansion Module
 * Manages regional data sources and localization across African countries
 */

export type AfricanCountry =
  | 'south-africa'
  | 'nigeria'
  | 'kenya'
  | 'egypt'
  | 'ghana'
  | 'uganda'
  | 'ethiopia'
  | 'tanzania'
  | 'cameroon'
  | 'morocco'
  | 'algeria'
  | 'tunisia'
  | 'senegal'
  | 'ivory-coast'
  | 'rwanda';

export interface RegionalConfig {
  country: AfricanCountry;
  language: string;
  currency: string;
  timezone: string;
  dataSourcesEnabled: string[];
  marketDataProviders: string[];
  jobMarkets: string[];
  fundingSources: string[];
}

export interface AfricaExpansionConfig {
  regions: Map<AfricanCountry, RegionalConfig>;
  defaultLanguage: string;
  supportedLanguages: string[];
  currencyExchangeRates: Map<string, number>;
}

export class AfricaExpansionManager {
  private config: AfricaExpansionConfig;

  constructor() {
    this.config = this.initializeConfig();
  }

  /**
   * Initialize Africa expansion configuration
   */
  private initializeConfig(): AfricaExpansionConfig {
    const regions = new Map<AfricanCountry, RegionalConfig>();

    // South Africa
    regions.set('south-africa', {
      country: 'south-africa',
      language: 'en',
      currency: 'ZAR',
      timezone: 'Africa/Johannesburg',
      dataSourcesEnabled: ['news', 'market', 'research', 'sa-data', 'ecosystem'],
      marketDataProviders: ['jse', 'stats-sa', 'alpha-vantage'],
      jobMarkets: ['jse-careers', 'linkedin-sa', 'indeed-sa'],
      fundingSources: ['dti-grants', 'seda', 'venture-capital-sa', 'banks-sa'],
    });

    // Nigeria
    regions.set('nigeria', {
      country: 'nigeria',
      language: 'en',
      currency: 'NGN',
      timezone: 'Africa/Lagos',
      dataSourcesEnabled: ['news', 'market', 'research', 'ecosystem'],
      marketDataProviders: ['nse', 'alpha-vantage', 'cbdc-data'],
      jobMarkets: ['nse-careers', 'linkedin-ng', 'jobberman'],
      fundingSources: ['firs-grants', 'smedan', 'venture-capital-ng', 'banks-ng'],
    });

    // Kenya
    regions.set('kenya', {
      country: 'kenya',
      language: 'en',
      currency: 'KES',
      timezone: 'Africa/Nairobi',
      dataSourcesEnabled: ['news', 'market', 'research', 'ecosystem'],
      marketDataProviders: ['nse-kenya', 'alpha-vantage', 'cbr-data'],
      jobMarkets: ['nse-careers', 'linkedin-ke', 'brighter-monday'],
      fundingSources: ['icdc-grants', 'kra-incentives', 'venture-capital-ke', 'banks-ke'],
    });

    // Egypt
    regions.set('egypt', {
      country: 'egypt',
      language: 'ar',
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      dataSourcesEnabled: ['news', 'market', 'research', 'ecosystem'],
      marketDataProviders: ['egx', 'alpha-vantage', 'cbe-data'],
      jobMarkets: ['egx-careers', 'linkedin-eg', 'wuzzuf'],
      fundingSources: ['gfp-grants', 'sawirah', 'venture-capital-eg', 'banks-eg'],
    });

    // Ghana
    regions.set('ghana', {
      country: 'ghana',
      language: 'en',
      currency: 'GHS',
      timezone: 'Africa/Accra',
      dataSourcesEnabled: ['news', 'market', 'research', 'ecosystem'],
      marketDataProviders: ['gse', 'alpha-vantage', 'bog-data'],
      jobMarkets: ['gse-careers', 'linkedin-gh', 'jobberman-gh'],
      fundingSources: ['gedc-grants', 'ssnit', 'venture-capital-gh', 'banks-gh'],
    });

    // Uganda
    regions.set('uganda', {
      country: 'uganda',
      language: 'en',
      currency: 'UGX',
      timezone: 'Africa/Kampala',
      dataSourcesEnabled: ['news', 'market', 'research', 'ecosystem'],
      marketDataProviders: ['use', 'alpha-vantage', 'bou-data'],
      jobMarkets: ['use-careers', 'linkedin-ug', 'jobs-ug'],
      fundingSources: ['udbs-grants', 'ursb', 'venture-capital-ug', 'banks-ug'],
    });

    // Ethiopia
    regions.set('ethiopia', {
      country: 'ethiopia',
      language: 'am',
      currency: 'ETB',
      timezone: 'Africa/Addis_Ababa',
      dataSourcesEnabled: ['news', 'market', 'research', 'ecosystem'],
      marketDataProviders: ['ese', 'alpha-vantage', 'nbe-data'],
      jobMarkets: ['ese-careers', 'linkedin-et', 'jobs-et'],
      fundingSources: ['eca-grants', 'adb', 'venture-capital-et', 'banks-et'],
    });

    // Tanzania
    regions.set('tanzania', {
      country: 'tanzania',
      language: 'en',
      currency: 'TZS',
      timezone: 'Africa/Dar_es_Salaam',
      dataSourcesEnabled: ['news', 'market', 'research', 'ecosystem'],
      marketDataProviders: ['dse', 'alpha-vantage', 'bob-data'],
      jobMarkets: ['dse-careers', 'linkedin-tz', 'jobs-tz'],
      fundingSources: ['tdb-grants', 'tirdo', 'venture-capital-tz', 'banks-tz'],
    });

    // Cameroon
    regions.set('cameroon', {
      country: 'cameroon',
      language: 'fr',
      currency: 'XAF',
      timezone: 'Africa/Douala',
      dataSourcesEnabled: ['news', 'market', 'research', 'ecosystem'],
      marketDataProviders: ['douala-stock', 'alpha-vantage', 'beac-data'],
      jobMarkets: ['douala-careers', 'linkedin-cm', 'jobs-cm'],
      fundingSources: ['minpmeesa-grants', 'adb', 'venture-capital-cm', 'banks-cm'],
    });

    // Morocco
    regions.set('morocco', {
      country: 'morocco',
      language: 'ar',
      currency: 'MAD',
      timezone: 'Africa/Casablanca',
      dataSourcesEnabled: ['news', 'market', 'research', 'ecosystem'],
      marketDataProviders: ['casablanca-stock', 'alpha-vantage', 'bam-data'],
      jobMarkets: ['casablanca-careers', 'linkedin-ma', 'jobs-ma'],
      fundingSources: ['anapec-grants', 'adb', 'venture-capital-ma', 'banks-ma'],
    });

    // Algeria
    regions.set('algeria', {
      country: 'algeria',
      language: 'ar',
      currency: 'DZD',
      timezone: 'Africa/Algiers',
      dataSourcesEnabled: ['news', 'market', 'research', 'ecosystem'],
      marketDataProviders: ['algiers-stock', 'alpha-vantage', 'bank-algeria-data'],
      jobMarkets: ['algiers-careers', 'linkedin-dz', 'jobs-dz'],
      fundingSources: ['ansej-grants', 'adb', 'venture-capital-dz', 'banks-dz'],
    });

    // Tunisia
    regions.set('tunisia', {
      country: 'tunisia',
      language: 'ar',
      currency: 'TND',
      timezone: 'Africa/Tunis',
      dataSourcesEnabled: ['news', 'market', 'research', 'ecosystem'],
      marketDataProviders: ['tunis-stock', 'alpha-vantage', 'bct-data'],
      jobMarkets: ['tunis-careers', 'linkedin-tn', 'jobs-tn'],
      fundingSources: ['apia-grants', 'adb', 'venture-capital-tn', 'banks-tn'],
    });

    // Senegal
    regions.set('senegal', {
      country: 'senegal',
      language: 'fr',
      currency: 'XOF',
      timezone: 'Africa/Dakar',
      dataSourcesEnabled: ['news', 'market', 'research', 'ecosystem'],
      marketDataProviders: ['dakar-stock', 'alpha-vantage', 'bcao-data'],
      jobMarkets: ['dakar-careers', 'linkedin-sn', 'jobs-sn'],
      fundingSources: ['anpe-grants', 'adb', 'venture-capital-sn', 'banks-sn'],
    });

    // Ivory Coast
    regions.set('ivory-coast', {
      country: 'ivory-coast',
      language: 'fr',
      currency: 'XOF',
      timezone: 'Africa/Abidjan',
      dataSourcesEnabled: ['news', 'market', 'research', 'ecosystem'],
      marketDataProviders: ['abidjan-stock', 'alpha-vantage', 'bcao-data'],
      jobMarkets: ['abidjan-careers', 'linkedin-ci', 'jobs-ci'],
      fundingSources: ['agepe-grants', 'adb', 'venture-capital-ci', 'banks-ci'],
    });

    // Rwanda
    regions.set('rwanda', {
      country: 'rwanda',
      language: 'en',
      currency: 'RWF',
      timezone: 'Africa/Kigali',
      dataSourcesEnabled: ['news', 'market', 'research', 'ecosystem'],
      marketDataProviders: ['rse', 'alpha-vantage', 'bnr-data'],
      jobMarkets: ['rse-careers', 'linkedin-rw', 'jobs-rw'],
      fundingSources: ['rdb-grants', 'adb', 'venture-capital-rw', 'banks-rw'],
    });

    return {
      regions,
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'fr', 'ar', 'am', 'sw', 'yo', 'ig', 'zu', 'xh'],
      currencyExchangeRates: new Map([
        ['ZAR', 1.0],
        ['NGN', 0.0013],
        ['KES', 0.0077],
        ['EGP', 0.021],
        ['GHS', 0.065],
        ['UGX', 0.00027],
        ['ETB', 0.0185],
        ['TZS', 0.00039],
        ['XAF', 0.0017],
        ['MAD', 0.1],
        ['DZD', 0.0074],
        ['TND', 0.32],
        ['XOF', 0.0017],
        ['RWF', 0.00078],
      ]),
    };
  }

  /**
   * Get regional configuration
   */
  getRegionalConfig(country: AfricanCountry): RegionalConfig | undefined {
    return this.config.regions.get(country);
  }

  /**
   * Get all supported countries
   */
  getSupportedCountries(): AfricanCountry[] {
    return Array.from(this.config.regions.keys());
  }

  /**
   * Get currency exchange rate
   */
  getExchangeRate(currency: string): number {
    return this.config.currencyExchangeRates.get(currency) || 1.0;
  }

  /**
   * Convert currency
   */
  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    const fromRate = this.getExchangeRate(fromCurrency);
    const toRate = this.getExchangeRate(toCurrency);
    return (amount / fromRate) * toRate;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return this.config.supportedLanguages;
  }

  /**
   * Get default language for country
   */
  getCountryLanguage(country: AfricanCountry): string {
    const config = this.getRegionalConfig(country);
    return config?.language || this.config.defaultLanguage;
  }

  /**
   * Get timezone for country
   */
  getCountryTimezone(country: AfricanCountry): string {
    const config = this.getRegionalConfig(country);
    return config?.timezone || 'UTC';
  }

  /**
   * Get enabled data sources for country
   */
  getEnabledDataSources(country: AfricanCountry): string[] {
    const config = this.getRegionalConfig(country);
    return config?.dataSourcesEnabled || [];
  }

  /**
   * Get market data providers for country
   */
  getMarketDataProviders(country: AfricanCountry): string[] {
    const config = this.getRegionalConfig(country);
    return config?.marketDataProviders || [];
  }

  /**
   * Get job markets for country
   */
  getJobMarkets(country: AfricanCountry): string[] {
    const config = this.getRegionalConfig(country);
    return config?.jobMarkets || [];
  }

  /**
   * Get funding sources for country
   */
  getFundingSources(country: AfricanCountry): string[] {
    const config = this.getRegionalConfig(country);
    return config?.fundingSources || [];
  }

  /**
   * Get statistics for all regions
   */
  getRegionStats() {
    return {
      totalCountries: this.config.regions.size,
      supportedLanguages: this.config.supportedLanguages.length,
      supportedCurrencies: this.config.currencyExchangeRates.size,
      countries: Array.from(this.config.regions.keys()),
    };
  }
}

export default AfricaExpansionManager;
