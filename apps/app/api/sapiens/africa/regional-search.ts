import { NextRequest, NextResponse } from 'next/server';
import SearchEngine from '@/services/azora-sapiens/src/search-engine';
import EmbeddingService from '@/services/azora-sapiens/src/embeddings';
import VectorStorageService from '@/services/azora-sapiens/src/vector-storage';
import AfricaExpansionManager from '@/services/azora-sapiens/src/regions/africa-expansion';
import LanguageService from '@/services/azora-sapiens/src/localization/language-service';

// Initialize services
const embeddingService = new EmbeddingService(process.env.OPENAI_API_KEY || '');
const vectorStorage = new VectorStorageService(
  process.env.PINECONE_API_KEY || '',
  'azora-knowledge'
);
const searchEngine = new SearchEngine(embeddingService, vectorStorage);
const africaManager = new AfricaExpansionManager();
const languageService = new LanguageService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, country, language, type = 'hybrid', topK = 10 } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (!country) {
      return NextResponse.json({ error: 'Country is required' }, { status: 400 });
    }

    // Get regional configuration
    const regionConfig = africaManager.getRegionalConfig(country);
    if (!regionConfig) {
      return NextResponse.json({ error: 'Country not supported' }, { status: 400 });
    }

    // Set language
    if (language) {
      languageService.setLanguage(language);
    } else {
      languageService.setLanguage(regionConfig.language as any);
    }

    // Get enabled data sources for this region
    const enabledSources = africaManager.getEnabledDataSources(country);

    // Perform search with regional filters
    let results;
    switch (type) {
      case 'semantic':
        results = await searchEngine.semanticSearch(query, {
          topK,
          filters: { country, sources: enabledSources },
        });
        break;
      case 'keyword':
        results = searchEngine.keywordSearch(query, {
          topK,
          filters: { country, sources: enabledSources },
        });
        break;
      case 'hybrid':
      default:
        results = await searchEngine.hybridSearch(query, {
          topK,
          filters: { country, sources: enabledSources },
        });
    }

    // Rank results
    const rankedResults = searchEngine.rankResults(results);

    // Format response with localization
    return NextResponse.json({
      success: true,
      query,
      country,
      language: languageService.getCurrentLanguage(),
      type,
      resultCount: rankedResults.length,
      results: rankedResults.map((result) => ({
        ...result,
        title: result.metadata.title,
        source: result.metadata.source,
        url: result.metadata.url,
      })),
      regionInfo: {
        currency: regionConfig.currency,
        timezone: regionConfig.timezone,
        language: regionConfig.language,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Regional search error:', error);
    return NextResponse.json(
      { error: 'Regional search failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const country = searchParams.get('country');
  const language = searchParams.get('language');
  const type = searchParams.get('type') || 'hybrid';
  const topK = parseInt(searchParams.get('topK') || '10');

  if (!query || !country) {
    return NextResponse.json(
      { error: 'Query and country parameters are required' },
      { status: 400 }
    );
  }

  try {
    const regionConfig = africaManager.getRegionalConfig(country as any);
    if (!regionConfig) {
      return NextResponse.json({ error: 'Country not supported' }, { status: 400 });
    }

    if (language) {
      languageService.setLanguage(language as any);
    } else {
      languageService.setLanguage(regionConfig.language as any);
    }

    const enabledSources = africaManager.getEnabledDataSources(country as any);

    let results;
    switch (type) {
      case 'semantic':
        results = await searchEngine.semanticSearch(query, {
          topK,
          filters: { country, sources: enabledSources },
        });
        break;
      case 'keyword':
        results = searchEngine.keywordSearch(query, { topK });
        break;
      case 'hybrid':
      default:
        results = await searchEngine.hybridSearch(query, {
          topK,
          filters: { country, sources: enabledSources },
        });
    }

    const rankedResults = searchEngine.rankResults(results);

    return NextResponse.json({
      success: true,
      query,
      country,
      language: languageService.getCurrentLanguage(),
      type,
      resultCount: rankedResults.length,
      results: rankedResults,
      regionInfo: {
        currency: regionConfig.currency,
        timezone: regionConfig.timezone,
        language: regionConfig.language,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Regional search error:', error);
    return NextResponse.json(
      { error: 'Regional search failed', details: String(error) },
      { status: 500 }
    );
  }
}
