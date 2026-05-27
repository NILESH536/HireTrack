const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
  }

  init() {
    if (!this.genAI && process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
  }

  isConfigured() {
    return !!process.env.GEMINI_API_KEY;
  }

  buildSystemPrompt(context) {
    return `You are a friendly, professional career advisor for HireTrack, a campus placement platform.

Student Profile:
- Name: ${context.name}
- Branch: ${context.branch}
- CGPA: ${context.cgpa}/10
- Skills: ${context.skills?.length ? context.skills.join(', ') : 'Not specified yet'}
- Career Goal: ${context.careerGoal || 'Not specified yet'}
- Placement Status: ${context.placed ? '✅ Placed' : '🔍 Actively looking'}
- Total Applications: ${context.applicationCount || 0}
- Shortlisted: ${context.shortlistedCount || 0} times
- Most frequent rejection stage: ${context.frequentRejectionStage || 'N/A'}

Your Guidelines:
1. Greet the student by name on first interaction
2. Provide personalized, actionable advice based on their specific profile
3. If they've been rejected at certain stages, focus on improving for those stages
4. Suggest specific resources, courses, and practice platforms
5. Generate week-by-week study plans when asked
6. Analyze job descriptions pasted by the student
7. Be encouraging but honest about areas needing improvement
8. Keep responses concise and structured with bullet points
9. Use emojis sparingly for warmth
10. Use markdown formatting for better readability (bold, lists, headers)`;
  }

  async getCareerAdvice(studentContext, userMessage, conversationHistory = []) {
    if (!this.isConfigured()) {
      return 'AI Career Guide is not configured. Please set the GEMINI_API_KEY environment variable to enable this feature.';
    }

    try {
      const systemPrompt = this.buildSystemPrompt(studentContext);

      // Build conversation history for Gemini
      const history = conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.message }],
      }));

      this.init();
      const chat = this.model.startChat({
        history,
        systemInstruction: systemPrompt,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(userMessage);
      const response = result.response;
      return response.text();
    } catch (error) {
      logger.error('Gemini API error:', error.message || error);
      if (error.message?.includes('API_KEY')) {
        return 'AI service authentication failed. Please check your Gemini API key.';
      }
      return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
    }
  }

  async analyzeResumeFit(resumeText, jobDescription) {
    if (!this.isConfigured()) {
      return {
        matchScore: 0,
        matchingSkills: [],
        missingSkills: [],
        suggestions: ['AI analysis is not configured. Please set the GEMINI_API_KEY environment variable.'],
      };
    }

    try {
      const prompt = `You are a resume analyzer. Analyze the resume against the job description and return a JSON object with exactly these fields:
- matchScore: number 0-100
- matchingSkills: array of skill strings that match
- missingSkills: array of {skill: string, importance: "critical"|"nice-to-have"}
- suggestions: array of actionable improvement strings

Return ONLY valid JSON, no markdown formatting.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

      this.init();
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();

      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch (error) {
      logger.error('Resume analysis error:', error.message || error);
      throw new Error('Failed to analyze resume fit');
    }
  }
}

module.exports = new GeminiService();
