import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiX, FiTrash2, FiChevronDown, FiZap, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { chatService } from '../../services/api';
import toast from 'react-hot-toast';

/* ── Simple markdown renderer ── */
const renderMarkdown = (text) => {
  if (!text) return '';

  let html = text
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Unordered lists
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  // Wrap consecutive li elements in ul
  html = html.replace(/(<li>.*?<\/li>(\s*<br\/>)?)+/g, (match) => {
    return '<ul>' + match.replace(/<br\/>/g, '') + '</ul>';
  });

  return '<p>' + html + '</p>';
};

/* ── Suggested quick chips ── */
const quickChips = [
  { label: '🎯 Career Roadmap', msg: 'Create a personalized career roadmap for me based on my skills and goal.' },
  { label: '📝 Resume Tips', msg: 'Review my profile and give me resume improvement tips.' },
  { label: '💻 DSA Prep Plan', msg: 'Create a 4-week DSA preparation plan for placement interviews.' },
  { label: '🎤 Interview Tips', msg: 'Give me interview preparation tips for my most frequent rejection stage.' },
  { label: '📊 Skill Analysis', msg: 'Analyze my current skills vs market demand and suggest improvements.' },
];

const CareerGuide = ({ student, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  // Load history on first open
  useEffect(() => {
    if (isOpen && !historyLoaded) {
      chatService.getHistory()
        .then(res => { setMessages(res.data || []); setHistoryLoaded(true); })
        .catch(() => {});
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, historyLoaded]);

  // Auto scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setMessages(p => [...p, { sender: 'user', message: msg, id: Date.now() }]);
    setInput('');
    setLoading(true);
    try {
      const res = await chatService.sendMessage(msg);
      setMessages(p => [...p, { sender: 'bot', message: res.data.reply, id: Date.now() + 1 }]);
    } catch {
      toast.error('Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = async () => {
    try {
      await chatService.clearHistory();
      setMessages([]);
      toast.success('Chat cleared');
    } catch {
      toast.error('Failed to clear');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:bg-transparent md:backdrop-blur-0 md:pointer-events-none"
          />

          {/* Chat Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] md:w-[420px] h-[600px] max-h-[85vh] flex flex-col glass-premium overflow-hidden shadow-2xl"
            style={{ boxShadow: '0 20px 80px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.1)' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-navy-900/40">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-electric via-cyan to-violet flex items-center justify-center">
                    <FiZap className="w-5 h-5 text-white" />
                  </div>
                  <motion.div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-navy-900"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-sm">Career Assistant</h2>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    Powered by <span className="text-cyan font-semibold">Gemini AI</span>
                    <span className="inline-block w-1 h-1 rounded-full bg-green-500" />
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Clear chat"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-r from-electric/20 via-cyan/20 to-violet/20 flex items-center justify-center mb-4"
                  >
                    <FiZap className="w-7 h-7 text-electric" />
                  </motion.div>
                  <h3 className="font-heading font-semibold text-white mb-1">Hey {student?.user?.name || 'there'}! 👋</h3>
                  <p className="text-xs text-gray-400 mb-6 max-w-[280px]">
                    I'm your AI career guide. Ask me about career planning, interview prep, skill development, or anything placement-related!
                  </p>

                  {/* Quick action chips */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {quickChips.map(chip => (
                      <motion.button
                        key={chip.label}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSend(chip.msg)}
                        className="px-3 py-1.5 rounded-full bg-navy-800/60 border border-white/5 text-xs text-gray-400 hover:text-electric hover:border-electric/20 transition-all"
                      >
                        {chip.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}`}>
                    {msg.sender === 'user' ? (
                      <p className="whitespace-pre-wrap text-blue-100">{msg.message}</p>
                    ) : (
                      <div
                        className="markdown-body"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.message) }}
                      />
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="chat-bubble-bot flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 150, 300].map(d => (
                        <motion.div
                          key={d}
                          className="w-2 h-2 bg-electric rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, delay: d / 1000, repeat: Infinity, repeatDelay: 0.2 }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">Gemini is thinking...</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Suggested chips when there are messages */}
            {messages.length > 0 && messages.length < 6 && !loading && (
              <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-none">
                {quickChips.slice(0, 3).map(chip => (
                  <button
                    key={chip.label}
                    onClick={() => handleSend(chip.msg)}
                    className="px-2.5 py-1 rounded-full bg-navy-800/40 border border-white/5 text-[10px] text-gray-500 hover:text-electric hover:border-electric/20 transition-all whitespace-nowrap flex-shrink-0"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/5 bg-navy-900/30">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about career, skills..."
                  className="flex-1 bg-navy-800/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-electric/30 transition-all"
                  disabled={loading}
                />
                <motion.button
                  type="submit"
                  disabled={loading || !input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2.5 bg-gradient-to-r from-electric to-cyan rounded-xl disabled:opacity-30 transition-all shadow-lg shadow-electric/20 disabled:shadow-none"
                >
                  <FiSend className="w-4 h-4 text-white" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CareerGuide;
