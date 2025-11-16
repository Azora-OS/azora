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
    const { skills, interests, market } = body;

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: 'Skills array is required' }, { status: 400 });
    }

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json({ error: 'Interests array is required' }, { status: 400 });
    }

    const businessIdeas = await naledi.generateBusinessIdea(skills, interests, market);

    return NextResponse.json({
      success: true,
      skills,
      interests,
      market: market || 'General',
      ideaCount: businessIdeas.length,
      ideas: businessIdeas,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Business idea generation error:', error);
    return NextResponse.json(
      { error: 'Business idea generation failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const skillsParam = searchParams.get('skills');
  const interestsParam = searchParams.get('interests');
  const market = searchParams.get('market');

  if (!skillsParam || !interestsParam) {
    return NextResponse.json(
      { error: 'Skills and interests query parameters are required' },
      { status: 400 }
    );
  }

  try {
    const skills = skillsParam.split(',').map((s) => s.trim());
    const interests = interestsParam.split(',').map((i) => i.trim());

    const businessIdeas = await naledi.generateBusinessIdea(skills, interests, market || undefined);

    return NextResponse.json({
      success: true,
      skills,
      interests,
      market: market || 'General',
      ideaCount: businessIdeas.length,
      ideas: businessIdeas,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Business idea generation error:', error);
    return NextResponse.json(
      { error: 'Business idea generation failed', details: String(error) },
      { status: 500 }
    );
  }
}
