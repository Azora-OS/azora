import { NextRequest, NextResponse } from 'next/server';
import SearchEngine from '@/services/azora-sapiens/src/search-engine';
import EmbeddingService from '@/services/azora-sapiens/src/embeddings';
import VectorStorageService from '@/services/azora-sapiens/src/vector-storage';
import NalediIntelligence from '@/services/azora-sapiens/src/intelligence/naledi';

// Initialize services
const embeddingService = new EmbeddingService(process.env.OPENAI_API_KEY || '');
const vectorStorage = new VectorStorageService(
  process.env.PINECONE_API_KEY || '',
  'azora-knowledge'
);
const searchEngine = new SearchEngine(embeddingService, vectorStorage);
const naledi = new NalediIntelligence(searchEngine);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { industry, location } = body;

    if (!industry) {
      return NextResponse.json({ error: 'Industry is required' }, { status: 400 });
    }

    const analysis = await naledi.analyzeMarket(industry, location);

    return NextResponse.json({
      success: true,
      industry,
      location: location || 'Global',
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Market analysis error:', error);
    return NextResponse.json(
      { error: 'Market analysis failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const industry = searchParams.get('industry');
  const location = searchParams.get('location');

  if (!industry) {
    return NextResponse.json({ error: 'Industry query parameter is required' }, { status: 400 });
  }

  try {
    const analysis = await naledi.analyzeMarket(industry, location || undefined);

    return NextResponse.json({
      success: true,
      industry,
      location: location || 'Global',
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Market analysis error:', error);
    return NextResponse.json(
      { error: 'Market analysis failed', details: String(error) },
      { status: 500 }
    );
  }
}
