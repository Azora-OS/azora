import { NextRequest, NextResponse } from 'next/server';
import SearchEngine from '@/services/azora-sapiens/src/search-engine';
import EmbeddingService from '@/services/azora-sapiens/src/embeddings';
import VectorStorageService from '@/services/azora-sapiens/src/vector-storage';
import KofiIntelligence from '@/services/azora-sapiens/src/intelligence/kofi';

// Initialize services
const embeddingService = new EmbeddingService(process.env.OPENAI_API_KEY || '');
const vectorStorage = new VectorStorageService(
  process.env.PINECONE_API_KEY || '',
  'azora-knowledge'
);
const searchEngine = new SearchEngine(embeddingService, vectorStorage);
const kofi = new KofiIntelligence(searchEngine);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessType, requiredAmount, location } = body;

    if (!businessType) {
      return NextResponse.json({ error: 'Business type is required' }, { status: 400 });
    }

    if (!requiredAmount || requiredAmount <= 0) {
      return NextResponse.json({ error: 'Valid required amount is required' }, { status: 400 });
    }

    const opportunities = await kofi.findFundingOpportunities(
      businessType,
      requiredAmount,
      location
    );

    return NextResponse.json({
      success: true,
      businessType,
      requiredAmount,
      location: location || 'South Africa',
      opportunityCount: opportunities.length,
      opportunities,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Funding opportunities error:', error);
    return NextResponse.json(
      { error: 'Funding opportunities search failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const businessType = searchParams.get('businessType');
  const requiredAmount = searchParams.get('requiredAmount');
  const location = searchParams.get('location');

  if (!businessType) {
    return NextResponse.json(
      { error: 'Business type query parameter is required' },
      { status: 400 }
    );
  }

  if (!requiredAmount) {
    return NextResponse.json(
      { error: 'Required amount query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const amount = parseInt(requiredAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Valid required amount is required' }, { status: 400 });
    }

    const opportunities = await kofi.findFundingOpportunities(
      businessType,
      amount,
      location || undefined
    );

    return NextResponse.json({
      success: true,
      businessType,
      requiredAmount: amount,
      location: location || 'South Africa',
      opportunityCount: opportunities.length,
      opportunities,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Funding opportunities error:', error);
    return NextResponse.json(
      { error: 'Funding opportunities search failed', details: String(error) },
      { status: 500 }
    );
  }
}
