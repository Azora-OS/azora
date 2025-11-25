import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ElaraContentGenerator } from './lesson-generator';
import { ElaraAudioGenerator } from './audio-generator';
import { ElaraVideoGenerator } from './video-generator';
import { CourseGenerationEngine } from './course-engine';
import { CoursePublisher } from './course-publisher';

dotenv.config();

const app = express();
const port = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

const generator = new ElaraContentGenerator();
const audioGenerator = new ElaraAudioGenerator();
const videoGenerator = new ElaraVideoGenerator();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'elara-content-generator' });
});

app.post('/api/generate/lesson', async (req, res) => {
  try {
    const { course, module, topic, duration, level } = req.body;
    const lesson = await generator.generateLesson({ course, module, topic, duration, level });
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate lesson' });
  }
});

app.post('/api/generate/course', async (req, res) => {
  try {
    const { outline } = req.body;
    const course = await generator.generateCourse(outline);
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate course' });
  }
});

// Audio generation endpoints
app.post('/api/generate/audio', async (req, res) => {
  try {
    const { text, lessonId, voiceId } = req.body;
    const audio = await audioGenerator.generateAudio({ text, lessonId, voiceId });
    res.json(audio);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

app.post('/api/generate/course-with-audio', async (req, res) => {
  try {
    const { outline } = req.body;

    // Generate course content
    const lessons = await generator.generateCourse(outline);

    // Generate audio for each lesson
    const lessonsWithAudio = await audioGenerator.generateAudioForCourse(lessons);

    res.json(lessonsWithAudio);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate course with audio' });
  }
});

// Video generation endpoints
app.post('/api/generate/video', async (req, res) => {
  try {
    const { lessonId, title, script, codeExamples, audioUrl, style } = req.body;
    const video = await videoGenerator.generateVideo({ lessonId, title, script, codeExamples, audioUrl, style });
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate video' });
  }
});

// Complete course generation with text, audio, and video
app.post('/api/generate/complete-course', async (req, res) => {
  try {
    const { outline } = req.body;

    console.log('Generating complete course with text, audio, and video...');

    // Step 1: Generate course content (text)
    console.log('Step 1: Generating lesson content...');
    const lessons = await generator.generateCourse(outline);

    // Step 2: Generate audio for each lesson
    console.log('Step 2: Generating audio narration...');
    const lessonsWithAudio = await audioGenerator.generateAudioForCourse(lessons);

    // Step 3: Generate videos
    console.log('Step 3: Generating video presentations...');
    const lessonsWithVideo = await videoGenerator.generateVideosForCourse(lessonsWithAudio);

    console.log('Complete course generated successfully!');
    res.json({
      success: true,
      lessons: lessonsWithVideo,
      message: 'Complete course generated with text, audio, and video'
    });
  } catch (error: any) {
    console.error('Error generating complete course:', error);
    res.status(500).json({ error: 'Failed to generate complete course', details: error.message });
  }
});

// 🚀 AUTOMATED COURSE GENERATION ENGINE
app.post('/api/generate/auto-course', async (req, res) => {
  try {
    const { outline } = req.body;

    if (!outline || !outline.title) {
      return res.status(400).json({
        success: false,
        error: 'Course outline is required with at least a title'
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('🤖 AUTOMATED COURSE GENERATION ENGINE');
    console.log('='.repeat(60));

    const startTime = Date.now();

    // Initialize engine and publisher
    const engine = new CourseGenerationEngine();
    const publisher = new CoursePublisher();

    // Generate complete course
    const generatedCourse = await engine.generateCompleteCourse(outline);

    // Publish to database
    const publishedCourse = await publisher.publishCourse(generatedCourse);

    const endTime = Date.now();
    const totalTime = Math.round((endTime - startTime) / 1000);

    console.log('='.repeat(60));
    console.log('✅ AUTOMATED COURSE GENERATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`   Total time: ${totalTime} seconds`);
    console.log(`   Course ID: ${publishedCourse.courseId}`);
    console.log(`   URL: ${publishedCourse.url}`);
    console.log('='.repeat(60) + '\n');

    res.json({
      success: true,
      course: publishedCourse,
      stats: {
        lessons: generatedCourse.lessonCount,
        modules: publishedCourse.moduleCount,
        duration: Math.round(generatedCourse.totalDuration / 60),
        generationTime: totalTime,
        price: generatedCourse.price
      },
      message: 'Course generated and published successfully! Pending admin review.'
    });
  } catch (error: any) {
    console.error('\n❌ AUTOMATED COURSE GENERATION FAILED:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate course automatically',
      details: error.message
    });
  }
});

// Course management endpoints
app.post('/api/courses/:courseId/publish', async (req, res) => {
  try {
    const { courseId } = req.params;
    const publisher = new CoursePublisher();
    await publisher.updateCourseStatus(courseId, true);
    res.json({ success: true, message: 'Course published successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/courses/:courseId/stats', async (req, res) => {
  try {
    const { courseId } = req.params;
    const publisher = new CoursePublisher();
    const stats = await publisher.getCourseStats(courseId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Elara Content Generator`);
  console.log(`${'='.repeat(60)}`);
  console.log(`   Port: ${port}`);
  console.log(`   Status: Running`);
  console.log(`   Features:`);
  console.log(`     ✅ Text Generation (OpenAI)`);
  console.log(`     ✅ Audio Generation (Edge TTS)`);
  console.log(`     ✅ Video Generation (Slides)`);
  console.log(`     ✅ Quiz Generation`);
  console.log(`     ✅ Automated Course Engine`);
  console.log(`${'='.repeat(60)}\n`);
});
