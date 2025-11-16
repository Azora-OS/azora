import { NextRequest, NextResponse } from 'next/server';
import SearchEngine from '@/services/azora-sapiens/src/search-engine';
import EmbeddingService from '@/services/azora-sapiens/src/embeddings';
import VectorStorageService from '@/services/azora-sapiens/src/vector-storage';

// Initialize services
const embeddingService = new EmbeddingService(process.env.OPENAI_API_KEY || '');
const vectorStorage = new VectorStorageService(
  process.env.PINECONE_API_KEY || '',
  'azora-knowledge'
);
const searchEngine = new SearchEngine(embeddingService, vectorStorage);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, type = 'hybrid', topK = 10, filters } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    let results;

    switch (type) {
      case 'semantic':
        results = await searchEngine.semanticSearch(query, { topK, filters });
        break;
      case 'keyword':
        results = searchEngine.keywordSearch(query, { topK, filters });
        break;
      case 'hybrid':
      default:
        results = await searchEngine.hybridSearch(query, { topK, filters });
    }

    // Rank results
    const rankedResults = searchEngine.rankResults(results);

    return NextResponse.json({
      success: true,
      query,
      type,
      resultCount: rankedResults.length,
      results: rankedResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'hybrid';
  const topK = parseInt(searchParams.get('topK') || '10');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    let results;

    switch (type) {
      case 'semantic':
        results = await searchEngine.semanticSearch(query, { topK });
        break;
      case 'keyword':
        results = searchEngine.keywordSearch(query, { topK });
        break;
      case 'hybrid':
      default:
        results = await searchEngine.hybridSearch(query, { topK });
    }

    const rankedResults = searchEngine.rankResults(results);

    return NextResponse.json({
      success: true,
      query,
      type,
      resultCount: rankedResults.length,
      results: rankedResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: String(error) },
      { status: 500 }
    );
  }
}
