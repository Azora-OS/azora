import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';

interface JobFormData {
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'contract' | 'freelance';
  salary: string;
  skills: string[];
  description: string;
  requirements: string[];
  benefits: string[];
}

const JobPosting: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    salary: '',
    skills: [],
    description: '',
    requirements: [],
    benefits: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          ...formData,
          employerId: user?.id,
          postedAt: new Date().toISOString(),
          status: 'active'
        })
      });

      if (response.ok) {
        alert('Job posted successfully! 🎉');
        // Reset form
        setFormData({
          title: '', company: '', location: '', type: 'full-time',
          salary: '', skills: [], description: '', requirements: [], benefits: []
        });
      }
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput.trim()]
      }));
      setRequirementInput('');
    }
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefitInput.trim()]
      }));
      setBenefitInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          📝 Post a Job
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Find the perfect talent for your Ubuntu-aligned opportunity
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Senior React Developer"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Company *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Ubuntu Tech Solutions"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Location *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Remote / Cape Town / Hybrid"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Job Type *
            </label>
            <select
              required
              className="w-full px-4 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
            >
              <option value="full-time">Full-time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Salary Range
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="R50,000 - R80,000 / month"
              value={formData.salary}
              onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
            />
          </div>
        </div>

        {/* Skills */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Required Skills
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              className="flex-1 px-4 py-2 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Add a skill (e.g., React, TypeScript)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-medium flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Job Description *
          </label>
          <textarea
            required
            rows={6}
            className="w-full px-4 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            placeholder="Describe the role, responsibilities, and what makes this opportunity special..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        {/* Requirements */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Requirements
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              className="flex-1 px-4 py-2 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Add a requirement"
              value={requirementInput}
              onChange={(e) => setRequirementInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
            />
            <button
              type="button"
              onClick={addRequirement}
              className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {formData.requirements.map((req, index) => (
              <li key={index} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="text-green-500">•</span>
                {req}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    requirements: prev.requirements.filter((_, i) => i !== index)
                  }))}
                  className="text-red-500 hover:text-red-700 ml-auto"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Benefits */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Benefits & Perks
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              className="flex-1 px-4 py-2 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Add a benefit"
              value={benefitInput}
              onChange={(e) => setBenefitInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
            />
            <button
              type="button"
              onClick={addBenefit}
              className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {formData.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="text-purple-500">✓</span>
                {benefit}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    benefits: prev.benefits.filter((_, i) => i !== index)
                  }))}
                  className="text-red-500 hover:text-red-700 ml-auto"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 font-medium disabled:opacity-50"
          >
            {isSubmitting ? '⏳ Posting Job...' : '🚀 Post Job'}
          </button>
          <button
            type="button"
            className="px-6 py-3 bg-white/70 dark:bg-slate-700/70 backdrop-blur-xl border border-white/20 dark:border-slate-600/50 rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-slate-900 dark:text-white"
          >
            💾 Save Draft
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobPosting;