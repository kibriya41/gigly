'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createTask } from '@/lib/actions/tasks';
import { useSession } from '@/lib/auth-client';
import {
  Loader2,
  Plus,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  Type,
  Briefcase,
  Zap,
  Trash2
} from 'lucide-react';

const CATEGORIES = ['Design', 'Writing', 'Development', 'Marketing', 'Other'];
const SUGGESTED_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'Figma', 'UI/UX', 'Node.js',
  'Python', 'SEO', 'Content Writing', 'Logo Design', 'Branding',
  'Social Media', 'WordPress', 'Shopify', 'Illustration', '3D Modeling'
];

const MIN_DESCRIPTION_LENGTH = 30;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_TITLE_LENGTH = 100;
const AUTO_SAVE_DELAY = 2000;

// Theme colors matching your project
const THEME = {
  primary: '#2c7c74',
  primaryHover: '#236b64',
  primaryLight: '#e8f4f2',
  primaryMuted: '#7cb4ac',
  sageBg: '#f4f8f6',
  cardBg: '#ffffff',
  textPrimary: '#1a1f2e',
  textSecondary: '#5a6578',
  textMuted: '#94a3b8',
  border: '#e2e8e0',
  borderFocus: '#2c7c74',
  error: '#dc2626',
  errorBg: '#fef2f2',
  success: '#2c7c74',
  shadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
  shadowHover: '0 4px 12px rgba(44,124,116,0.08)',
};

export default function PostTaskForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const autoSaveTimerRef = useRef(null);
  const titleInputRef = useRef(null);
  const skillInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    budget: '',
    deadline: '',
    skills: [],
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);

  // Load draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('task_draft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...draft }));
      } catch (e) {
        console.error('Failed to load draft');
      }
    }
    setTimeout(() => titleInputRef.current?.focus(), 100);
  }, []);

  // Auto-save draft
  const autoSave = useCallback(() => {
    setIsAutoSaving(true);
    localStorage.setItem('task_draft', JSON.stringify(formData));
    setTimeout(() => {
      setIsAutoSaving(false);
      setLastSaved(new Date());
    }, 500);
  }, [formData]);

  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(autoSave, AUTO_SAVE_DELAY);
    return () => clearTimeout(autoSaveTimerRef.current);
  }, [formData, autoSave]);

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Task title is required';
        if (value.length < 5) return 'Title must be at least 5 characters';
        if (value.length > MAX_TITLE_LENGTH) return `Title must be under ${MAX_TITLE_LENGTH} characters`;
        return '';
      case 'category':
        return !value ? 'Please select a category' : '';
      case 'description':
        if (!value.trim()) return 'Description is required';
        if (value.length < MIN_DESCRIPTION_LENGTH) return `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`;
        if (value.length > MAX_DESCRIPTION_LENGTH) return `Description must be under ${MAX_DESCRIPTION_LENGTH} characters`;
        return '';
      case 'budget':
        if (!value) return 'Budget is required';
        if (parseFloat(value) < 5) return 'Minimum budget is $5';
        if (parseFloat(value) > 100000) return 'Budget seems too high';
        return '';
      case 'deadline':
        if (!value) return 'Deadline is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate <= today) return 'Deadline must be in the future';
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);
        if (selectedDate > maxDate) return 'Deadline must be within 1 year';
        return '';
      case 'skills':
        if (value.length === 0) return 'At least one skill is recommended';
        if (value.length > 10) return 'Maximum 10 skills allowed';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Skills functionality
  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setSkillInput(value);
    if (value.trim()) {
      const filtered = SUGGESTED_SKILLS.filter(
        skill =>
          skill.toLowerCase().includes(value.toLowerCase()) &&
          !formData.skills.includes(skill)
      ).slice(0, 5);
      setSkillSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed || formData.skills.includes(trimmed)) return;
    if (formData.skills.length >= 10) {
      setErrors(prev => ({ ...prev, skills: 'Maximum 10 skills allowed' }));
      return;
    }
    const newSkills = [...formData.skills, trimmed];
    setFormData(prev => ({ ...prev, skills: newSkills }));
    setSkillInput('');
    setShowSuggestions(false);
    setErrors(prev => ({ ...prev, skills: validateField('skills', newSkills) }));
    skillInputRef.current?.focus();
  };

  const removeSkill = (skillToRemove) => {
    const newSkills = formData.skills.filter(s => s !== skillToRemove);
    setFormData(prev => ({ ...prev, skills: newSkills }));
    setErrors(prev => ({ ...prev, skills: validateField('skills', newSkills) }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === 'Backspace' && !skillInput && formData.skills.length > 0) {
      removeSkill(formData.skills[formData.skills.length - 1]);
    }
  };

  const clearDraft = () => {
    if (confirm('Are you sure you want to clear all fields?')) {
      setFormData({ title: '', category: '', description: '', budget: '', deadline: '', skills: [] });
      setErrors({});
      setTouched({});
      localStorage.removeItem('task_draft');
      setLastSaved(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ title: true, category: true, description: true, budget: true, deadline: true, skills: true });

    if (!validateForm()) {
      const firstError = document.querySelector('[data-error="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setSubmitProgress(prev => Math.min(prev + 20, 80));
      }, 200);

      
      const taskData = {
        ...formData,
        buyerEmail: session?.user?.email || 'test@example.com',
        buyerName: session?.user?.name || 'Anonymous Client',
        buyerImage: session?.user?.image || '',
        status: 'Open',
        createdAt: new Date().toISOString(),
      };
      
      const result = await createTask(taskData);
      clearInterval(progressInterval);
      setSubmitProgress(100);

      if (result.success) {
        localStorage.removeItem('task_draft');
        router.push('/dashboard/client/my-tasks');
      } else {
        alert(result.message || 'Failed to post task');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const getFieldStatus = (fieldName) => {
    if (!touched[fieldName]) return 'neutral';
    return errors[fieldName] ? 'error' : 'success';
  };

  const completionPercentage = () => {
    const fields = ['title', 'category', 'description', 'budget', 'deadline'];
    const filled = fields.filter(f => {
      if (f === 'description') return formData[f].length >= MIN_DESCRIPTION_LENGTH;
      return formData[f];
    }).length;
    return Math.round((filled / fields.length) * 100);
  };

  const getInputClasses = (fieldName, extra = '') => {
    const status = getFieldStatus(fieldName);
    const base = `w-full px-4 py-3.5 rounded-xl transition-all duration-200 bg-white dark:bg-[#131c2b] outline-none text-sm`;
    const border = status === 'error'
      ? 'border-2 border-red-300 focus:border-red-500 bg-red-50/50'
      : status === 'success'
        ? 'border-2 border-emerald-300 focus:border-emerald-500'
        : 'border border-gray-200 focus:border-[#2c7c74] focus:ring-2 focus:ring-[#2c7c74]/10';
    return `${base} ${border} ${extra}`;
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: THEME.sageBg }}>
      <div className="max-w-2xl mx-auto">

        {/* Header Card */}
        <div className="mb-6 rounded-2xl p-6 bg-white dark:bg-[#131c2b]" style={{ boxShadow: THEME.shadow }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: THEME.primaryLight }}>
                <Briefcase className="w-5 h-5" style={{ color: THEME.primary }} />
              </div>
              <div>
                <h1 className="text-lg font-semibold" style={{ color: THEME.textPrimary }}>Post a New Task</h1>
                <p className="text-xs" style={{ color: THEME.textMuted }}>Fill in the details below to find skilled freelancers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-xs flex items-center gap-1" style={{ color: THEME.textMuted }}>
                  <Save className="w-3 h-3" />
                  Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {isAutoSaving && (
                <span className="text-xs flex items-center gap-1" style={{ color: THEME.primary }}>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              )}
              <button
                type="button"
                onClick={clearDraft}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Clear draft"
              >
                <Trash2 className="w-4 h-4" style={{ color: THEME.textMuted }} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${completionPercentage()}%`,
                backgroundColor: completionPercentage() === 100 ? THEME.primary : THEME.primaryMuted
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs" style={{ color: THEME.textMuted }}>
              {completionPercentage()}% complete
            </span>
            <span className="text-xs" style={{ color: completionPercentage() === 100 ? THEME.primary : THEME.textMuted }}>
              {completionPercentage() === 100 ? 'Ready to post!' : `${5 - Math.round((completionPercentage() / 100) * 5)} fields remaining`}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Task Title */}
          <div className="rounded-2xl p-6 bg-white dark:bg-[#131c2b]" style={{ boxShadow: THEME.shadow }} data-error={!!errors.title}>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: THEME.textPrimary }}>
              <Type className="w-4 h-4" style={{ color: THEME.primary }} />
              Task Title <span style={{ color: THEME.error }}>*</span>
              <span className="ml-auto text-xs font-normal" style={{ color: THEME.textMuted }}>
                {formData.title.length}/{MAX_TITLE_LENGTH}
              </span>
            </label>
            <div className="relative">
              <input
                ref={titleInputRef}
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Design a modern logo for my startup"
                maxLength={MAX_TITLE_LENGTH}
                className={getInputClasses('title')}
                disabled={isSubmitting}
              />
              {getFieldStatus('title') === 'success' && (
                <CheckCircle2 className="absolute right-3 top-3.5 w-5 h-5 text-emerald-500" />
              )}
              {getFieldStatus('title') === 'error' && (
                <AlertCircle className="absolute right-3 top-3.5 w-5 h-5 text-red-500" />
              )}
            </div>
            {errors.title && <p className="mt-2 text-sm flex items-center gap-1" style={{ color: THEME.error }}>{errors.title}</p>}
          </div>

          {/* Category & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl p-6 bg-white dark:bg-[#131c2b]" style={{ boxShadow: THEME.shadow }} data-error={!!errors.category}>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: THEME.textPrimary }}>
                <Tag className="w-4 h-4" style={{ color: THEME.primary }} />
                Category <span style={{ color: THEME.error }}>*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClasses('category', 'appearance-none cursor-pointer')}
                disabled={isSubmitting}
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="mt-2 text-sm" style={{ color: THEME.error }}>{errors.category}</p>}
            </div>

            <div className="rounded-2xl p-6 bg-white dark:bg-[#131c2b]" style={{ boxShadow: THEME.shadow }} data-error={!!errors.budget}>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: THEME.textPrimary }}>
                <DollarSign className="w-4 h-4" style={{ color: THEME.primary }} />
                Budget (USD) <span style={{ color: THEME.error }}>*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-sm font-medium" style={{ color: THEME.textMuted }}>$</span>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min="5"
                  step="0.01"
                  placeholder="50.00"
                  className={getInputClasses('budget', 'pl-8')}
                  disabled={isSubmitting}
                />
              </div>
              {errors.budget && <p className="mt-2 text-sm" style={{ color: THEME.error }}>{errors.budget}</p>}
            </div>
          </div>

          {/* Skills Input */}
          <div className="rounded-2xl p-6 bg-white dark:bg-[#131c2b]" style={{ boxShadow: THEME.shadow }} data-error={!!errors.skills}>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: THEME.textPrimary }}>
              <Zap className="w-4 h-4" style={{ color: THEME.primary }} />
              Required Skills
              <span className="text-xs font-normal ml-1" style={{ color: THEME.textMuted }}>(press Enter to add)</span>
              <span className="ml-auto text-xs font-normal" style={{ color: THEME.textMuted }}>
                {formData.skills.length}/10
              </span>
            </label>
            <div className={`relative border-2 rounded-xl p-2.5 transition-all duration-200 bg-white dark:bg-[#131c2b]
              ${getFieldStatus('skills') === 'error' ? 'border-red-300' :
                getFieldStatus('skills') === 'success' ? 'border-emerald-300' :
                  'border-gray-200 focus-within:border-[#2c7c74] focus-within:ring-2 focus-within:ring-[#2c7c74]/10'}`}>
              <div className="flex flex-wrap gap-2 items-center">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium animate-in fade-in zoom-in duration-200"
                    style={{ backgroundColor: THEME.primaryLight, color: THEME.primary }}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:bg-white dark:bg-[#131c2b]/50 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  ref={skillInputRef}
                  type="text"
                  value={skillInput}
                  onChange={handleSkillInputChange}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder={formData.skills.length === 0 ? "e.g. React, Figma, SEO..." : "Add more..."}
                  className="flex-1 min-w-[120px] px-2 py-1.5 bg-transparent outline-none text-sm"
                  style={{ color: THEME.textPrimary }}
                  disabled={isSubmitting || formData.skills.length >= 10}
                />
              </div>

              {showSuggestions && skillSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#131c2b] border rounded-xl shadow-lg z-10 overflow-hidden" style={{ borderColor: THEME.border }}>
                  {skillSuggestions.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                      style={{ color: THEME.textPrimary }}
                    >
                      <Plus className="w-3 h-3" style={{ color: THEME.primary }} />
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.skills && <p className="mt-2 text-sm" style={{ color: THEME.error }}>{errors.skills}</p>}

            {formData.skills.length < 10 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-xs mr-1" style={{ color: THEME.textMuted }}>Popular:</span>
                {SUGGESTED_SKILLS.filter(s => !formData.skills.includes(s)).slice(0, 6).map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="text-xs px-2.5 py-1 rounded-md transition-colors hover:opacity-80"
                    style={{ backgroundColor: '#f1f5f4', color: THEME.textSecondary }}
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Deadline */}
          <div className="rounded-2xl p-6 bg-white dark:bg-[#131c2b]" style={{ boxShadow: THEME.shadow }} data-error={!!errors.deadline}>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: THEME.textPrimary }}>
              <Calendar className="w-4 h-4" style={{ color: THEME.primary }} />
              Deadline <span style={{ color: THEME.error }}>*</span>
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              onBlur={handleBlur}
              min={new Date().toISOString().split('T')[0]}
              className={getInputClasses('deadline')}
              disabled={isSubmitting}
            />
            {errors.deadline && <p className="mt-2 text-sm" style={{ color: THEME.error }}>{errors.deadline}</p>}
          </div>

          {/* Description */}
          <div className="rounded-2xl p-6 bg-white dark:bg-[#131c2b]" style={{ boxShadow: THEME.shadow }} data-error={!!errors.description}>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium flex items-center gap-2" style={{ color: THEME.textPrimary }}>
                <FileText className="w-4 h-4" style={{ color: THEME.primary }} />
                Description <span style={{ color: THEME.error }}>*</span>
              </label>
              <span className={`text-xs font-medium ${formData.description.length >= MIN_DESCRIPTION_LENGTH ? 'text-emerald-600' : ''}`} style={{ color: formData.description.length < MIN_DESCRIPTION_LENGTH ? THEME.textMuted : undefined }}>
                {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <div className="relative">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={(e) => { handleBlur(e); setDescriptionFocused(false); }}
                onFocus={() => setDescriptionFocused(true)}
                rows={6}
                maxLength={MAX_DESCRIPTION_LENGTH}
                placeholder="Describe your task in detail. Include requirements, expected deliverables, and any specific instructions..."
                className={`${getInputClasses('description', 'resize-y')} ${descriptionFocused ? 'ring-2 ring-[#2c7c74]/10' : ''}`}
                disabled={isSubmitting}
              />
              {getFieldStatus('description') === 'success' && (
                <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-emerald-500" />
              )}
            </div>

            <div className="mt-3">
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((formData.description.length / MAX_DESCRIPTION_LENGTH) * 100, 100)}%`,
                    backgroundColor: formData.description.length < MIN_DESCRIPTION_LENGTH ? '#cbd5e1' :
                      formData.description.length < MAX_DESCRIPTION_LENGTH * 0.8 ? '#2c7c74' : '#f59e0b'
                  }}
                />
              </div>
            </div>
            {errors.description && <p className="mt-2 text-sm" style={{ color: THEME.error }}>{errors.description}</p>}
          </div>

          {/* Submit Section */}
          <div className="rounded-2xl p-6 bg-white dark:bg-[#131c2b]" style={{ boxShadow: THEME.shadow }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98]"
              style={{
                backgroundColor: isSubmitting ? '#94a3b8' : THEME.primary,
                boxShadow: isSubmitting ? 'none' : `0 4px 14px ${THEME.primary}40`
              }}
              onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = THEME.primaryHover)}
              onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = THEME.primary)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {submitProgress < 100 ? `Posting... ${submitProgress}%` : 'Finalizing...'}
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Post Task
                </>
              )}
            </button>

            {isSubmitting && (
              <div className="mt-3 w-full bg-gray-100 rounded-full h-1">
                <div
                  className="bg-white dark:bg-[#131c2b]/50 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${submitProgress}%` }}
                />
              </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-6 text-xs" style={{ color: THEME.textMuted }}>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" style={{ color: THEME.primary }} />
                Free to post
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" style={{ color: THEME.primary }} />
                Edit until proposal accepted
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" style={{ color: THEME.primary }} />
                Secure payments
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}