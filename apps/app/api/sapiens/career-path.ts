import { NextRequest, NextResponse } from 'next/server';
import SearchEngine from '@/services/azora-sapiens/src/search-engine';
import EmbeddingService from '@/services/azora-sapiens/src/embeddings';
import VectorStorageService from '@/services/azora-sapiens/src/vector-storage';
import ThembaIntelligence from '@/services/azora-sapiens/src/intelligence/themba';

// Initialize services
const embeddingService = new EmbeddingService(process.env.OPENAI_API_KEY || '');
const vectorStorage = new VectorStorageService(
  process.env.PINECONE_API_KEY || '',
  'azora-knowledge'
);
const searchEngine = new SearchEngine(embeddingService, vectorStorage);
const themba = new ThembaIntelligence(searchEngine);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skills, interests } = body;

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: 'Skills array is required' }, { status: 400 });
    }

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json({ error: 'Interests array is required' }, { status: 400 });
    }

    const careerPaths = await themba.generateCareerPath(skills, interests);

    return NextResponse.json({
      success: true,
      skills,
      interests,
      pathCount: careerPaths.length,
      paths: careerPaths,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Career path generation error:', error);
    return NextResponse.json(
      { error: 'Career path generation failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const skillsParam = searchParams.get('skills');
  const interestsParam = searchParams.get('interests');

  if (!skillsParam || !interestsParam) {
    return NextResponse.json(
      { error: 'Skills and interests query parameters are required' },
      { status: 400 }
    );
  }

  try {
    const skills = skillsParam.split(',').map((s) => s.trim());
    const interests = interestsParam.split(',').map((i) => i.trim());

    const careerPaths = await themba.generateCareerPath(skills, interests);

    return NextResponse.json({
      success: true,
      skills,
      interests,
      pathCount: careerPaths.length,
      paths: careerPaths,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Career path generation error:', error);
    return NextResponse.json(
      { error: 'Career path generation failed', details: String(error) },
      { status: 500 }
    );
  }
}
