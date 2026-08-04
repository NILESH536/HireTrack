import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiSave, FiTrash2, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import MatrixGridBackground from '../components/backgrounds/MatrixGridBackground';
import { assessmentService } from '../services/api';

const AssessmentBuilder = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState([{ type: 'MULTIPLE_CHOICE', text: '', options: ['', ''], correctOption: 0, marks: 1 }]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { type: 'MULTIPLE_CHOICE', text: '', options: ['', ''], correctOption: 0, marks: 1 }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push('');
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!title) return toast.error('Title is required');
    if (questions.some(q => !q.text)) return toast.error('All questions must have text');

    setSaving(true);
    try {
      // 1. Create Assessment
      const res = await assessmentService.createAssessment({ title, description, durationMinutes: duration });
      const assessmentId = res.data.assessment.id;
      
      // 2. Add Questions
      const formattedQuestions = questions.map(q => ({
        ...q,
        options: q.type === 'MULTIPLE_CHOICE' ? q.options : [],
      }));
      await assessmentService.addQuestions(assessmentId, { questions: formattedQuestions });

      toast.success('Assessment created successfully!');
      navigate('/company/dashboard');
    } catch (error) {
      toast.error('Failed to create assessment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 relative">
      <MatrixGridBackground />
      <Navbar />
      <main className="relative max-w-4xl mx-auto px-4 py-8 pt-24">
        <button onClick={() => navigate('/company/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-electric transition-colors mb-6">
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-violet/10 rounded-xl text-violet">
            <FiFileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-white">Assessment Builder</h1>
            <p className="text-gray-400 mt-1">Create custom tests for your drives.</p>
          </div>
        </div>

        <div className="glass-premium p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Assessment Title</label>
              <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. React Frontend Assessment" />
            </div>
            <div>
              <label className="input-label">Duration (Minutes)</label>
              <input type="number" className="input-field" value={duration} onChange={e => setDuration(parseInt(e.target.value))} min={10} max={180} />
            </div>
            <div className="md:col-span-2">
              <label className="input-label">Description</label>
              <textarea className="input-field min-h-[80px]" value={description} onChange={e => setDescription(e.target.value)} placeholder="Briefly describe the assessment goals" />
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          {questions.map((q, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-premium p-6 border border-white/5 relative">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-white">Question {index + 1}</h3>
                {questions.length > 1 && (
                  <button onClick={() => setQuestions(questions.filter((_, i) => i !== index))} className="text-gray-500 hover:text-red-400">
                    <FiTrash2 />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="input-label">Question Text</label>
                  <textarea className="input-field" value={q.text} onChange={e => updateQuestion(index, 'text', e.target.value)} />
                </div>
                <div>
                  <label className="input-label">Type</label>
                  <select className="select-field" value={q.type} onChange={e => updateQuestion(index, 'type', e.target.value)}>
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="CODING">Coding</option>
                    <option value="TEXT">Text Answer</option>
                  </select>
                </div>
              </div>

              {q.type === 'MULTIPLE_CHOICE' && (
                <div className="bg-navy-900/50 p-4 rounded-xl border border-white/5 space-y-3">
                  <label className="input-label">Options</label>
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name={`correct-${index}`} 
                        checked={q.correctOption === oIndex} 
                        onChange={() => updateQuestion(index, 'correctOption', oIndex)}
                        className="text-electric focus:ring-electric" 
                      />
                      <input 
                        type="text" 
                        className="input-field flex-1 !py-1.5" 
                        value={opt} 
                        onChange={e => updateOption(index, oIndex, e.target.value)} 
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                  <button onClick={() => addOption(index)} className="text-xs text-electric hover:text-electric-light mt-2">+ Add Option</button>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <button onClick={addQuestion} className="btn-secondary">
            <FiPlus className="w-4 h-4 mr-2 inline" /> Add Question
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : <><FiSave className="w-4 h-4 mr-2 inline" /> Save Assessment</>}
          </button>
        </div>
      </main>
    </div>
  );
};

export default AssessmentBuilder;
