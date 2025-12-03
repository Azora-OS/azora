import React, { useState } from 'react';
import { 
  Course, 
  Module, 
  Lesson, 
  CourseMetadata, 
  LessonType,
  QuizQuestion,
  CodeExercise
} from '../../main/services/CourseBuilder';
import './CourseBuilder.css';

interface CourseBuilderProps {
  onSave?: (course: Course) => void;
  initialCourse?: Course;
}

export const CourseBuilder: React.FC<CourseBuilderProps> = ({ onSave, initialCourse }) => {
  const [course, setCourse] = useState<Course | null>(initialCourse || null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ type: 'module' | 'lesson'; index: number } | null>(null);

  // Create new course
  const handleCreateCourse = (metadata: CourseMetadata) => {
    const newCourse: Course = {
      id: generateId(),
      metadata,
      modules: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCourse(newCourse);
    setShowMetadataEditor(false);
  };

  // Add module
  const handleAddModule = () => {
    if (!course) return;
    
    const newModule: Module = {
      id: generateId(),
      title: `Module ${course.modules.length + 1}`,
      description: 'New module description',
      order: course.modules.length,
      lessons: [],
    };
    
    setCourse({
      ...course,
      modules: [...course.modules, newModule],
      updatedAt: new Date(),
    });
  };

  // Add lesson to module
  const handleAddLesson = (moduleId: string, type: LessonType) => {
    if (!course) return;
    
    const moduleIndex = course.modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) return;
    
    const module = course.modules[moduleIndex];
    const newLesson: Lesson = {
      id: generateId(),
      title: `Lesson ${module.lessons.length + 1}`,
      type,
      order: module.lessons.length,
    };
    
    const updatedModules = [...course.modules];
    updatedModules[moduleIndex] = {
      ...module,
      lessons: [...module.lessons, newLesson],
    };
    
    setCourse({
      ...course,
      modules: updatedModules,
      updatedAt: new Date(),
    });
  };

  // Update module
  const handleUpdateModule = (moduleId: string, updates: Partial<Module>) => {
    if (!course) return;
    
    const updatedModules = course.modules.map(m =>
      m.id === moduleId ? { ...m, ...updates } : m
    );
    
    setCourse({
      ...course,
      modules: updatedModules,
      updatedAt: new Date(),
    });
  };

  // Update lesson
  const handleUpdateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    if (!course) return;
    
    const updatedModules = course.modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.map(l =>
            l.id === lessonId ? { ...l, ...updates } : l
          ),
        };
      }
      return m;
    });
    
    setCourse({
      ...course,
      modules: updatedModules,
      updatedAt: new Date(),
    });
  };

  // Delete module
  const handleDeleteModule = (moduleId: string) => {
    if (!course) return;
    
    const updatedModules = course.modules
      .filter(m => m.id !== moduleId)
      .map((m, index) => ({ ...m, order: index }));
    
    setCourse({
      ...course,
      modules: updatedModules,
      updatedAt: new Date(),
    });
    
    if (selectedModule?.id === moduleId) {
      setSelectedModule(null);
    }
  };

  // Delete lesson
  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    if (!course) return;
    
    const updatedModules = course.modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons
            .filter(l => l.id !== lessonId)
            .map((l, index) => ({ ...l, order: index })),
        };
      }
      return m;
    });
    
    setCourse({
      ...course,
      modules: updatedModules,
      updatedAt: new Date(),
    });
    
    if (selectedLesson?.id === lessonId) {
      setSelectedLesson(null);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (type: 'module' | 'lesson', index: number) => {
    setDraggedItem({ type, index });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropModule = (toIndex: number) => {
    if (!course || !draggedItem || draggedItem.type !== 'module') return;
    
    const modules = [...course.modules];
    const [movedModule] = modules.splice(draggedItem.index, 1);
    modules.splice(toIndex, 0, movedModule);
    
    const updatedModules = modules.map((m, index) => ({ ...m, order: index }));
    
    setCourse({
      ...course,
      modules: updatedModules,
      updatedAt: new Date(),
    });
    
    setDraggedItem(null);
  };

  const handleDropLesson = (moduleId: string, toIndex: number) => {
    if (!course || !draggedItem || draggedItem.type !== 'lesson') return;
    
    const moduleIndex = course.modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) return;
    
    const module = course.modules[moduleIndex];
    const lessons = [...module.lessons];
    const [movedLesson] = lessons.splice(draggedItem.index, 1);
    lessons.splice(toIndex, 0, movedLesson);
    
    const updatedLessons = lessons.map((l, index) => ({ ...l, order: index }));
    
    const updatedModules = [...course.modules];
    updatedModules[moduleIndex] = {
      ...module,
      lessons: updatedLessons,
    };
    
    setCourse({
      ...course,
      modules: updatedModules,
      updatedAt: new Date(),
    });
    
    setDraggedItem(null);
  };

  // Save course
  const handleSave = () => {
    if (course && onSave) {
      onSave(course);
    }
  };

  if (!course) {
    return (
      <div className="course-builder">
        <div className="course-builder-empty">
          <h2>Create a New Course</h2>
          <button onClick={() => setShowMetadataEditor(true)} className="btn-primary">
            Start Building
          </button>
          {showMetadataEditor && (
            <MetadataEditor
              onSave={handleCreateCourse}
              onCancel={() => setShowMetadataEditor(false)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="course-builder">
      <div className="course-builder-header">
        <div>
          <h1>{course.metadata.title}</h1>
          <p>{course.metadata.description}</p>
        </div>
        <div className="course-builder-actions">
          <button onClick={() => setShowMetadataEditor(true)} className="btn-secondary">
            Edit Metadata
          </button>
          <button onClick={handleSave} className="btn-primary">
            Save Course
          </button>
        </div>
      </div>

      <div className="course-builder-content">
        <div className="course-structure">
          <div className="structure-header">
            <h2>Course Structure</h2>
            <button onClick={handleAddModule} className="btn-add">
              + Add Module
            </button>
          </div>

          <div className="modules-list">
            {course.modules.map((module, index) => (
              <div
                key={module.id}
                className={`module-item ${selectedModule?.id === module.id ? 'selected' : ''}`}
                draggable
                onDragStart={() => handleDragStart('module', index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDropModule(index)}
              >
                <div className="module-header">
                  <div className="module-drag-handle">⋮⋮</div>
                  <div className="module-info" onClick={() => setSelectedModule(module)}>
                    <h3>{module.title}</h3>
                    <p>{module.lessons.length} lessons</p>
                  </div>
                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    className="btn-delete"
                  >
                    ×
                  </button>
                </div>

                <div className="lessons-list">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id}
                      className={`lesson-item ${selectedLesson?.id === lesson.id ? 'selected' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart('lesson', lessonIndex)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropLesson(module.id, lessonIndex)}
                      onClick={() => {
                        setSelectedModule(module);
                        setSelectedLesson(lesson);
                      }}
                    >
                      <div className="lesson-drag-handle">⋮⋮</div>
                      <div className="lesson-info">
                        <span className="lesson-title">{lesson.title}</span>
                        <span className={`lesson-type lesson-type-${lesson.type}`}>
                          {lesson.type}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLesson(module.id, lesson.id);
                        }}
                        className="btn-delete-small"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  <div className="lesson-type-selector">
                    <span>Add lesson:</span>
                    <button onClick={() => handleAddLesson(module.id, 'video')}>Video</button>
                    <button onClick={() => handleAddLesson(module.id, 'text')}>Text</button>
                    <button onClick={() => handleAddLesson(module.id, 'quiz')}>Quiz</button>
                    <button onClick={() => handleAddLesson(module.id, 'code')}>Code</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="course-editor">
          {selectedLesson && selectedModule ? (
            <LessonEditor
              lesson={selectedLesson}
              onUpdate={(updates) => handleUpdateLesson(selectedModule.id, selectedLesson.id, updates)}
            />
          ) : selectedModule ? (
            <ModuleEditor
              module={selectedModule}
              onUpdate={(updates) => handleUpdateModule(selectedModule.id, updates)}
            />
          ) : (
            <div className="editor-empty">
              <p>Select a module or lesson to edit</p>
            </div>
          )}
        </div>
      </div>

      {showMetadataEditor && (
        <MetadataEditor
          metadata={course.metadata}
          onSave={(metadata) => {
            setCourse({ ...course, metadata, updatedAt: new Date() });
            setShowMetadataEditor(false);
          }}
          onCancel={() => setShowMetadataEditor(false)}
        />
      )}
    </div>
  );
};

// Metadata Editor Component
interface MetadataEditorProps {
  metadata?: CourseMetadata;
  onSave: (metadata: CourseMetadata) => void;
  onCancel: () => void;
}

const MetadataEditor: React.FC<MetadataEditorProps> = ({ metadata, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CourseMetadata>(
    metadata || {
      title: '',
      description: '',
      instructor: '',
      category: '',
      level: 'beginner',
      tags: [],
      prerequisites: [],
    }
  );
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content metadata-editor">
        <h2>{metadata ? 'Edit Course Metadata' : 'Create New Course'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Instructor *</label>
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Level *</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label>Estimated Duration (hours)</label>
              <input
                type="number"
                value={formData.estimatedDuration || ''}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || undefined })}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tag-input">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag and press Enter"
              />
              <button type="button" onClick={addTag}>Add</button>
            </div>
            <div className="tags-list">
              {formData.tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {metadata ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Module Editor Component
interface ModuleEditorProps {
  module: Module;
  onUpdate: (updates: Partial<Module>) => void;
}

const ModuleEditor: React.FC<ModuleEditorProps> = ({ module, onUpdate }) => {
  return (
    <div className="editor-panel">
      <h2>Edit Module</h2>
      <div className="form-group">
        <label>Module Title</label>
        <input
          type="text"
          value={module.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          value={module.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={6}
        />
      </div>
    </div>
  );
};

// Lesson Editor Component
interface LessonEditorProps {
  lesson: Lesson;
  onUpdate: (updates: Partial<Lesson>) => void;
}

const LessonEditor: React.FC<LessonEditorProps> = ({ lesson, onUpdate }) => {
  return (
    <div className="editor-panel">
      <h2>Edit Lesson</h2>
      <div className="form-group">
        <label>Lesson Title</label>
        <input
          type="text"
          value={lesson.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Lesson Type</label>
        <select
          value={lesson.type}
          onChange={(e) => onUpdate({ type: e.target.value as LessonType })}
        >
          <option value="video">Video</option>
          <option value="text">Text</option>
          <option value="quiz">Quiz</option>
          <option value="code">Code</option>
        </select>
      </div>

      <div className="form-group">
        <label>Duration (minutes)</label>
        <input
          type="number"
          value={lesson.duration || ''}
          onChange={(e) => onUpdate({ duration: parseInt(e.target.value) || undefined })}
          min="0"
        />
      </div>

      {lesson.type === 'video' && (
        <div className="form-group">
          <label>Video URL</label>
          <input
            type="url"
            value={lesson.videoUrl || ''}
            onChange={(e) => onUpdate({ videoUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>
      )}

      {(lesson.type === 'text' || lesson.type === 'video') && (
        <div className="form-group">
          <label>Content</label>
          <textarea
            value={lesson.content || ''}
            onChange={(e) => onUpdate({ content: e.target.value })}
            rows={10}
            placeholder="Enter lesson content..."
          />
        </div>
      )}

      {lesson.type === 'quiz' && (
        <div className="form-group">
          <label>Quiz Questions</label>
          <p className="form-hint">Quiz editor coming soon...</p>
        </div>
      )}

      {lesson.type === 'code' && (
        <div className="form-group">
          <label>Code Exercise</label>
          <p className="form-hint">Code exercise editor coming soon...</p>
        </div>
      )}
    </div>
  );
};

// Helper function
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}