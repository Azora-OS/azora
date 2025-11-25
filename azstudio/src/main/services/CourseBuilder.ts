import { FileChange } from './ChangesetManager';
import * as path from 'path';

export type LessonType = 'video' | 'text' | 'quiz' | 'code';

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  order: number;
  content?: string;
  duration?: number; // in minutes
  videoUrl?: string;
  quizQuestions?: QuizQuestion[];
  codeExercise?: CodeExercise;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface CodeExercise {
  id: string;
  description: string;
  starterCode: string;
  solution: string;
  testCases: string[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface CourseMetadata {
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  thumbnail?: string;
  estimatedDuration?: number; // in hours
  prerequisites?: string[];
}

export interface Course {
  id: string;
  metadata: CourseMetadata;
  modules: Module[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseStructure {
  course: Course;
  outputDir: string;
}

export class CourseBuilder {
  /**
   * Create a new course structure
   */
  createCourse(metadata: CourseMetadata): Course {
    return {
      id: this.generateId(),
      metadata,
      modules: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Add a module to a course
   */
  addModule(course: Course, moduleData: Omit<Module, 'id' | 'order'>): Module {
    const module: Module = {
      id: this.generateId(),
      order: course.modules.length,
      ...moduleData,
    };
    
    course.modules.push(module);
    course.updatedAt = new Date();
    
    return module;
  }

  /**
   * Add a lesson to a module
   */
  addLesson(module: Module, lessonData: Omit<Lesson, 'id' | 'order'>): Lesson {
    const lesson: Lesson = {
      id: this.generateId(),
      order: module.lessons.length,
      ...lessonData,
    };
    
    module.lessons.push(lesson);
    
    return lesson;
  }

  /**
   * Reorder lessons within a module using drag-and-drop
   */
  reorderLessons(module: Module, fromIndex: number, toIndex: number): void {
    const lessons = [...module.lessons];
    const [movedLesson] = lessons.splice(fromIndex, 1);
    lessons.splice(toIndex, 0, movedLesson);
    
    // Update order property
    lessons.forEach((lesson, index) => {
      lesson.order = index;
    });
    
    module.lessons = lessons;
  }

  /**
   * Reorder modules within a course
   */
  reorderModules(course: Course, fromIndex: number, toIndex: number): void {
    const modules = [...course.modules];
    const [movedModule] = modules.splice(fromIndex, 1);
    modules.splice(toIndex, 0, movedModule);
    
    // Update order property
    modules.forEach((module, index) => {
      module.order = index;
    });
    
    course.modules = modules;
    course.updatedAt = new Date();
  }

  /**
   * Update course metadata
   */
  updateMetadata(course: Course, metadata: Partial<CourseMetadata>): void {
    course.metadata = {
      ...course.metadata,
      ...metadata,
    };
    course.updatedAt = new Date();
  }

  /**
   * Update a lesson
   */
  updateLesson(module: Module, lessonId: string, updates: Partial<Lesson>): Lesson | null {
    const lesson = module.lessons.find(l => l.id === lessonId);
    if (!lesson) return null;
    
    Object.assign(lesson, updates);
    return lesson;
  }

  /**
   * Delete a lesson from a module
   */
  deleteLesson(module: Module, lessonId: string): boolean {
    const index = module.lessons.findIndex(l => l.id === lessonId);
    if (index === -1) return false;
    
    module.lessons.splice(index, 1);
    
    // Reorder remaining lessons
    module.lessons.forEach((lesson, idx) => {
      lesson.order = idx;
    });
    
    return true;
  }

  /**
   * Delete a module from a course
   */
  deleteModule(course: Course, moduleId: string): boolean {
    const index = course.modules.findIndex(m => m.id === moduleId);
    if (index === -1) return false;
    
    course.modules.splice(index, 1);
    
    // Reorder remaining modules
    course.modules.forEach((module, idx) => {
      module.order = idx;
    });
    
    course.updatedAt = new Date();
    return true;
  }

  /**
   * Export course structure to JSON
   */
  exportCourse(course: Course): string {
    return JSON.stringify(course, null, 2);
  }

  /**
   * Import course structure from JSON
   */
  importCourse(json: string): Course {
    const data = JSON.parse(json);
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  /**
   * Generate course files for the education platform
   */
  generateCourseFiles(course: Course, outputDir: string): FileChange[] {
    const changes: FileChange[] = [];
    
    // Generate course data JSON
    const courseDataPath = path.join(outputDir, 'data', 'courses', `${this.toKebabCase(course.metadata.title)}.json`);
    changes.push({
      path: courseDataPath,
      type: 'create',
      content: this.exportCourse(course),
    });
    
    // Generate course page component
    const coursePagePath = path.join(
      outputDir,
      'app',
      'courses',
      this.toKebabCase(course.metadata.title),
      'page.tsx'
    );
    changes.push({
      path: coursePagePath,
      type: 'create',
      content: this.generateCoursePage(course),
    });
    
    // Generate module pages
    course.modules.forEach(module => {
      const modulePath = path.join(
        outputDir,
        'app',
        'courses',
        this.toKebabCase(course.metadata.title),
        'modules',
        this.toKebabCase(module.title),
        'page.tsx'
      );
      changes.push({
        path: modulePath,
        type: 'create',
        content: this.generateModulePage(course, module),
      });
      
      // Generate lesson pages
      module.lessons.forEach(lesson => {
        const lessonPath = path.join(
          outputDir,
          'app',
          'courses',
          this.toKebabCase(course.metadata.title),
          'modules',
          this.toKebabCase(module.title),
          'lessons',
          this.toKebabCase(lesson.title),
          'page.tsx'
        );
        changes.push({
          path: lessonPath,
          type: 'create',
          content: this.generateLessonPage(course, module, lesson),
        });
      });
    });
    
    return changes;
  }

  /**
   * Generate course overview page
   */
  private generateCoursePage(course: Course): string {
    return `import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: '${course.metadata.title}',
  description: '${course.metadata.description}',
};

export default function CoursePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">${course.metadata.title}</h1>
          <p className="text-lg text-gray-700 mb-6">${course.metadata.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Instructor</p>
              <p className="text-lg font-semibold text-gray-900">${course.metadata.instructor}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Level</p>
              <p className="text-lg font-semibold text-gray-900">${course.metadata.level}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-lg font-semibold text-gray-900">${course.metadata.estimatedDuration || 'N/A'} hours</p>
            </div>
          </div>
          
          ${course.metadata.tags.length > 0 ? `
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              ${course.metadata.tags.map(tag => `<span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">${tag}</span>`).join('\n              ')}
            </div>
          </div>
          ` : ''}
        </div>
        
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Course Modules</h2>
          ${course.modules.map((module, idx) => `
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Module ${idx + 1}: ${module.title}
            </h3>
            <p className="text-gray-700 mb-4">${module.description}</p>
            <div className="space-y-2">
              ${module.lessons.map((lesson, lessonIdx) => `
              <Link 
                href="/courses/${this.toKebabCase(course.metadata.title)}/modules/${this.toKebabCase(module.title)}/lessons/${this.toKebabCase(lesson.title)}"
                className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">Lesson ${lessonIdx + 1}: ${lesson.title}</span>
                  <span className="text-sm text-gray-600">${lesson.type}</span>
                </div>
              </Link>
              `).join('')}
            </div>
          </div>
          `).join('')}
        </div>
      </div>
    </div>
  );
}
`;
  }

  /**
   * Generate module page
   */
  private generateModulePage(course: Course, module: Module): string {
    return `import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: '${module.title} - ${course.metadata.title}',
  description: '${module.description}',
};

export default function ModulePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/courses/${this.toKebabCase(course.metadata.title)}"
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Course
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">${module.title}</h1>
          <p className="text-lg text-gray-700">${module.description}</p>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Lessons</h2>
          ${module.lessons.map((lesson, idx) => `
          <Link 
            href="/courses/${this.toKebabCase(course.metadata.title)}/modules/${this.toKebabCase(module.title)}/lessons/${this.toKebabCase(lesson.title)}"
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Lesson ${idx + 1}: ${lesson.title}
                </h3>
                ${lesson.duration ? `<p className="text-sm text-gray-600">${lesson.duration} minutes</p>` : ''}
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                ${lesson.type}
              </span>
            </div>
          </Link>
          `).join('')}
        </div>
      </div>
    </div>
  );
}
`;
  }

  /**
   * Generate lesson page based on lesson type
   */
  private generateLessonPage(course: Course, module: Module, lesson: Lesson): string {
    const baseImports = `import React from 'react';
import Link from 'next/link';`;

    const metadata = `
export const metadata = {
  title: '${lesson.title} - ${module.title}',
  description: 'Lesson content for ${lesson.title}',
};`;

    const navigation = `
        <div className="mb-4">
          <Link 
            href="/courses/${this.toKebabCase(course.metadata.title)}/modules/${this.toKebabCase(module.title)}"
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Module
          </Link>
        </div>`;

    switch (lesson.type) {
      case 'video':
        return `${baseImports}
${metadata}

export default function LessonPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        ${navigation}
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">${lesson.title}</h1>
          
          <div className="aspect-video bg-gray-900 rounded-lg mb-6">
            ${lesson.videoUrl ? `
            <video controls className="w-full h-full rounded-lg">
              <source src="${lesson.videoUrl}" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            ` : `
            <div className="flex items-center justify-center h-full text-white">
              Video content will be displayed here
            </div>
            `}
          </div>
          
          ${lesson.content ? `
          <div className="prose max-w-none">
            <p className="text-gray-700">${lesson.content}</p>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  );
}
`;

      case 'text':
        return `${baseImports}
${metadata}

export default function LessonPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        ${navigation}
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">${lesson.title}</h1>
          
          <div className="prose max-w-none">
            ${lesson.content ? `<p className="text-gray-700 leading-relaxed">${lesson.content}</p>` : '<p className="text-gray-500">Lesson content will be added here.</p>'}
          </div>
        </div>
      </div>
    </div>
  );
}
`;

      case 'quiz':
        return `${baseImports}
'use client';

import { useState } from 'react';
${metadata}

export default function LessonPage() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const questions = ${JSON.stringify(lesson.quizQuestions || [], null, 2)};

  const handleSubmit = () => {
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        ${navigation}
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">${lesson.title}</h1>
          
          <div className="space-y-6">
            {questions.map((q: any, idx: number) => (
              <div key={q.id} className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Question {idx + 1}: {q.question}
                </h3>
                <div className="space-y-2">
                  {q.options.map((option: string, optIdx: number) => (
                    <label
                      key={optIdx}
                      className={\`flex items-center p-3 rounded-md cursor-pointer transition-colors \${
                        showResults
                          ? optIdx === q.correctAnswer
                            ? 'bg-green-100 border-2 border-green-500'
                            : selectedAnswers[q.id] === optIdx
                            ? 'bg-red-100 border-2 border-red-500'
                            : 'bg-gray-50'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }\`}
                    >
                      <input
                        type="radio"
                        name={\`question-\${q.id}\`}
                        value={optIdx}
                        checked={selectedAnswers[q.id] === optIdx}
                        onChange={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: optIdx })}
                        disabled={showResults}
                        className="mr-3"
                      />
                      <span className="text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
                {showResults && q.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-900">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {!showResults && (
            <button
              onClick={handleSubmit}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Submit Quiz
            </button>
          )}
          
          {showResults && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-lg font-semibold text-green-900">
                Quiz completed! Review your answers above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;

      case 'code':
        return `${baseImports}
'use client';

import { useState } from 'react';
${metadata}

export default function LessonPage() {
  const [code, setCode] = useState(\`${lesson.codeExercise?.starterCode || '// Write your code here'}\`);
  const [output, setOutput] = useState('');

  const exercise = ${JSON.stringify(lesson.codeExercise || {}, null, 2)};

  const runCode = () => {
    // In a real implementation, this would execute the code safely
    setOutput('Code execution would happen here');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        ${navigation}
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">${lesson.title}</h1>
          
          ${lesson.codeExercise ? `
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Exercise</h2>
            <p className="text-gray-700">{exercise.description}</p>
          </div>
          ` : ''}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Code</h3>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-green-400 rounded-lg"
                spellCheck={false}
              />
              <button
                onClick={runCode}
                className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Run Code
              </button>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Output</h3>
              <div className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-white rounded-lg overflow-auto">
                {output || 'Run your code to see output'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

      default:
        return `${baseImports}
${metadata}

export default function LessonPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        ${navigation}
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">${lesson.title}</h1>
          <p className="text-gray-700">Lesson content will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}
`;
    }
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert string to kebab-case
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }
}
