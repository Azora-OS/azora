# Elara Content Generator - Automated Course Engine 🤖

## Overview

The Elara Content Generator is a fully automated course creation engine that transforms a simple course outline into a complete, production-ready course with:

- ✅ **Text Content**: AI-generated lesson scripts
- ✅ **Audio Narration**: Professional text-to-speech
- ✅ **Video Lessons**: Slide-based presentations
- ✅ **Quizzes**: Auto-generated assessments
- ✅ **Database Integration**: Ready for students

## Features

### 🎯 Automated Course Generation
- Input: Simple YAML outline
- Output: Complete published course
- Time: ~30 minutes per course
- Cost: $0-$1 per course

### 🎨 Components
1. **Content Generator** - Creates lesson scripts using OpenAI GPT-4
2. **Audio Generator** - Converts scripts to speech using Edge TTS
3. **Slide Generator** - Creates visual presentations
4. **Video Renderer** - Combines slides with audio
5. **Quiz Generator** - Creates assessments
6. **Course Publisher** - Uploads to database

## Installation

```bash
cd services/elara-content-generator
npm install
```

## Configuration

Create a `.env` file:

```env
PORT=3004
OPENAI_API_KEY=sk-your-key-here  # Optional (uses mock if not provided)
ELEVENLABS_API_KEY=your-key-here  # Optional (uses Edge TTS if not provided)
DATABASE_URL=file:../../azora-education/prisma/dev.db
```

## Usage

### 1. Start the Service

```bash
npm run dev
```

The service will start on `http://localhost:3004`

### 2. Create a Course Outline

Create a YAML file (e.g., `my-course.yaml`):

```yaml
title: "Python Programming Masterclass"
description: "Learn Python from scratch"
level: "beginner"
category: "Programming"
price: 499

modules:
  - title: "Python Basics"
    lessons:
      - title: "Introduction to Python"
        duration: 20
        topics:
          - "What is Python?"
          - "Installing Python"
        hands_on:
          - "Write your first program"
```

### 3. Generate the Course

**Option A: Using the Test Script**

```bash
npm run test-course examples/python-course.yaml
```

**Option B: Using the API**

```bash
curl -X POST http://localhost:3004/api/generate/auto-course \
  -H "Content-Type: application/json" \
  -d @my-course.yaml
```

**Option C: From Admin Dashboard**

Use the "Generate with AI" button in the admin courses page.

### 4. Review and Publish

1. Course is created with status "pending_review"
2. Admin reviews the course
3. Publish via API:

```bash
curl -X POST http://localhost:3004/api/courses/{courseId}/publish
```

## API Endpoints

### Course Generation

**POST** `/api/generate/auto-course`
- Generates complete course from outline
- Returns course ID and stats

**POST** `/api/generate/lesson`
- Generates single lesson content

**POST** `/api/generate/audio`
- Generates audio for text

**POST** `/api/generate/video`
- Generates video from slides

### Course Management

**POST** `/api/courses/:courseId/publish`
- Publishes a course

**GET** `/api/courses/:courseId/stats`
- Gets course statistics

**GET** `/health`
- Health check

## Course Outline Format

```yaml
# Required fields
title: string              # Course title
description: string        # Course description
level: string             # beginner | intermediate | advanced
category: string          # Programming | Business | Design | etc.
price: number            # Price in ZAR

# Modules and lessons
modules:
  - title: string        # Module title
    lessons:
      - title: string    # Lesson title
        duration: number # Duration in minutes
        topics:          # List of topics to cover
          - string
        hands_on:        # Optional hands-on exercises
          - string
```

## Generation Pipeline

```
1. Content Generation (AI)
   ├─ Parse course outline
   ├─ Generate lesson scripts
   ├─ Create code examples
   └─ Generate exercises

2. Audio Generation (TTS)
   ├─ Convert scripts to speech
   ├─ Use professional voice
   └─ Calculate duration

3. Slide Generation
   ├─ Create title slides
   ├─ Generate content slides
   ├─ Add code slides
   └─ Create summary slides

4. Video Rendering
   ├─ Combine slides with audio
   ├─ Add transitions
   └─ Export as MP4

5. Quiz Generation (AI)
   ├─ Analyze lesson content
   ├─ Generate questions
   └─ Create explanations

6. Database Publishing
   ├─ Create course record
   ├─ Upload modules
   ├─ Store lesson data
   └─ Set status to pending
```

## Cost Analysis

### FREE Tools (R0/course)
- Content: ChatGPT Free (web interface)
- Audio: Edge TTS (unlimited)
- Video: Self-rendered (local)
- Total: **R0**

### PAID Tools (R17/course)
- Content: OpenAI API ($0.90)
- Audio: Edge TTS (free)
- Video: Self-rendered (free)
- Total: **~R17** ($0.90)

## Performance

- **1 Course (12 lessons)**: ~30 minutes
- **10 Courses**: ~5 hours (sequential)
- **10 Courses**: ~1.5 hours (parallel)
- **100 Courses**: ~50 hours (2 days)

## Examples

See `examples/` directory for sample course outlines:
- `python-course.yaml` - Python programming course
- `web-dev-course.yaml` - Web development course
- `marketing-course.yaml` - Digital marketing course

## Troubleshooting

### No OpenAI API Key
- Engine will use mock content generation
- Quality will be lower but functional
- Good for testing

### Database Connection Error
- Check `DATABASE_URL` in `.env`
- Ensure Prisma is set up in azora-education service
- Run `npx prisma generate` if needed

### Audio Generation Fails
- Edge TTS requires internet connection
- Check if `edge-tts` is installed
- Fallback to mock audio if needed

## Development

### Adding New Features

1. **Custom Voices**: Edit `audio-generator.ts`
2. **Custom Slides**: Edit `course-engine.ts` (SlideGenerator)
3. **Custom Quizzes**: Edit `course-engine.ts` (QuizGenerator)
4. **Custom Publishing**: Edit `course-publisher.ts`

### Testing

```bash
# Test single lesson generation
curl -X POST http://localhost:3004/api/generate/lesson \
  -H "Content-Type: application/json" \
  -d '{"course":"Test","module":"M1","topic":"Intro","duration":20,"level":"beginner"}'

# Test audio generation
curl -X POST http://localhost:3004/api/generate/audio \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","lessonId":"test"}'

# Test full course
npm run test-course examples/python-course.yaml
```

## Future Enhancements

- [ ] Parallel lesson generation
- [ ] Real video rendering with avatars (HeyGen)
- [ ] Advanced slide templates
- [ ] Multi-language support
- [ ] Custom branding
- [ ] Progress tracking UI
- [ ] Batch course generation
- [ ] Course templates library

## Support

For issues or questions:
1. Check the logs in the terminal
2. Review the course outline format
3. Verify environment variables
4. Check database connection

## License

Proprietary - Azora ES (Pty) Ltd

---

**Built with ❤️ by the Azora Team**
