import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
}

export interface TTSOptions {
  voiceId: string;
  text: string;
  modelId?: string;
  stability?: number; // 0-1
  similarityBoost?: number; // 0-1
  style?: number; // 0-1
  useSpeakerBoost?: boolean;
}

export interface AudioGenerationResult {
  audioPath: string;
  duration: number; // in seconds
  size: number; // in bytes
  format: string;
}

export interface AudioPreview {
  url: string;
  voiceId: string;
  voiceName: string;
}

export class TextToSpeechService {
  private apiKey: string;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';
  private outputDir: string;

  constructor(apiKey: string, outputDir: string = './audio-output') {
    this.apiKey = apiKey;
    this.outputDir = outputDir;
    this.ensureOutputDir();
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getVoices(): Promise<Voice[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      return response.data.voices.map((voice: any) => ({
        voice_id: voice.voice_id,
        name: voice.name,
        category: voice.category || 'general',
        description: voice.description,
        preview_url: voice.preview_url,
      }));
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      return this.getDefaultVoices();
    }
  }

  /**
   * Generate audio from text using ElevenLabs
   */
  async generateAudio(options: TTSOptions): Promise<AudioGenerationResult> {
    const {
      voiceId,
      text,
      modelId = 'eleven_monolingual_v1',
      stability = 0.5,
      similarityBoost = 0.75,
      style = 0,
      useSpeakerBoost = true,
    } = options;

    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: useSpeakerBoost,
          },
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          responseType: 'arraybuffer',
        }
      );

      // Save audio file
      const filename = `audio-${Date.now()}.mp3`;
      const audioPath = path.join(this.outputDir, filename);
      
      fs.writeFileSync(audioPath, Buffer.from(response.data));

      // Get file stats
      const stats = fs.statSync(audioPath);
      
      // Estimate duration (rough estimate: 1 second per 15 characters)
      const estimatedDuration = Math.ceil(text.length / 15);

      return {
        audioPath,
        duration: estimatedDuration,
        size: stats.size,
        format: 'mp3',
      };
    } catch (error: any) {
      console.error('Failed to generate audio:', error.response?.data || error.message);
      throw new Error(`Audio generation failed: ${error.message}`);
    }
  }

  /**
   * Generate audio for multiple text segments
   */
  async generateMultipleAudio(
    segments: { text: string; name: string }[],
    voiceId: string
  ): Promise<AudioGenerationResult[]> {
    const results: AudioGenerationResult[] = [];

    for (const segment of segments) {
      try {
        const result = await this.generateAudio({
          voiceId,
          text: segment.text,
        });

        // Rename file to match segment name
        const newPath = path.join(
          this.outputDir,
          `${this.sanitizeFilename(segment.name)}.mp3`
        );
        fs.renameSync(result.audioPath, newPath);

        results.push({
          ...result,
          audioPath: newPath,
        });

        // Rate limiting: wait 1 second between requests
        await this.sleep(1000);
      } catch (error) {
        console.error(`Failed to generate audio for "${segment.name}":`, error);
      }
    }

    return results;
  }

  /**
   * Generate audio from lesson script
   */
  async generateLessonAudio(
    script: {
      introduction: string;
      mainContent: string[];
      summary: string;
    },
    voiceId: string,
    lessonName: string
  ): Promise<AudioGenerationResult[]> {
    const segments = [
      { text: script.introduction, name: `${lessonName}-intro` },
      ...script.mainContent.map((content, index) => ({
        text: content,
        name: `${lessonName}-part${index + 1}`,
      })),
      { text: script.summary, name: `${lessonName}-summary` },
    ];

    return this.generateMultipleAudio(segments, voiceId);
  }

  /**
   * Get audio preview for a voice
   */
  async getVoicePreview(voiceId: string): Promise<AudioPreview | null> {
    try {
      const voices = await this.getVoices();
      const voice = voices.find(v => v.voice_id === voiceId);
      
      if (voice && voice.preview_url) {
        return {
          url: voice.preview_url,
          voiceId: voice.voice_id,
          voiceName: voice.name,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get voice preview:', error);
      return null;
    }
  }

  /**
   * Combine multiple audio files into one
   */
  async combineAudioFiles(
    audioPaths: string[],
    outputName: string
  ): Promise<string> {
    // Note: This is a placeholder. In a real implementation, you would use
    // a library like ffmpeg to concatenate audio files
    const combinedPath = path.join(this.outputDir, `${outputName}.mp3`);
    
    // For now, just copy the first file
    if (audioPaths.length > 0) {
      fs.copyFileSync(audioPaths[0], combinedPath);
    }
    
    return combinedPath;
  }

  /**
   * Delete audio file
   */
  deleteAudio(audioPath: string): void {
    try {
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    } catch (error) {
      console.error('Failed to delete audio file:', error);
    }
  }

  /**
   * Get audio file info
   */
  getAudioInfo(audioPath: string): { size: number; exists: boolean } {
    try {
      if (fs.existsSync(audioPath)) {
        const stats = fs.statSync(audioPath);
        return {
          size: stats.size,
          exists: true,
        };
      }
    } catch (error) {
      console.error('Failed to get audio info:', error);
    }
    
    return {
      size: 0,
      exists: false,
    };
  }

  /**
   * Estimate audio generation cost
   */
  estimateCost(textLength: number): number {
    // ElevenLabs pricing: approximately $0.30 per 1000 characters
    const charactersPerDollar = 1000 / 0.30;
    return textLength / charactersPerDollar;
  }

  /**
   * Validate text for TTS
   */
  validateText(text: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!text || text.trim().length === 0) {
      issues.push('Text is empty');
    }
    
    if (text.length > 5000) {
      issues.push('Text exceeds maximum length of 5000 characters');
    }
    
    // Check for unsupported characters
    const unsupportedChars = text.match(/[^\x00-\x7F\u00A0-\u024F\u1E00-\u1EFF]/g);
    if (unsupportedChars && unsupportedChars.length > 10) {
      issues.push('Text contains many unsupported characters');
    }
    
    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get recommended voice settings for different content types
   */
  getRecommendedSettings(contentType: 'educational' | 'narrative' | 'conversational'): {
    stability: number;
    similarityBoost: number;
    style: number;
  } {
    switch (contentType) {
      case 'educational':
        return {
          stability: 0.7,
          similarityBoost: 0.8,
          style: 0.3,
        };
      case 'narrative':
        return {
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0.6,
        };
      case 'conversational':
        return {
          stability: 0.4,
          similarityBoost: 0.7,
          style: 0.5,
        };
      default:
        return {
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0,
        };
    }
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Sanitize filename
   */
  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-z0-9-_]/gi, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get default voices (fallback)
   */
  private getDefaultVoices(): Voice[] {
    return [
      {
        voice_id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Sarah',
        category: 'premade',
        description: 'Professional female voice',
      },
      {
        voice_id: 'VR6AewLTigWG4xSOukaG',
        name: 'Arnold',
        category: 'premade',
        description: 'Professional male voice',
      },
      {
        voice_id: 'pNInz6obpgDQGcFmaJgB',
        name: 'Adam',
        category: 'premade',
        description: 'Deep male voice',
      },
      {
        voice_id: 'ThT5KcBeYPX3keUQqHPh',
        name: 'Dorothy',
        category: 'premade',
        description: 'Pleasant female voice',
      },
    ];
  }
}
