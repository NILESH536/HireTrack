const axios = require('axios');
const logger = require('../utils/logger');

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

class ClaudeService {
  isConfigured() {
    return !!CLAUDE_API_KEY;
  }

  async getCareerAdvice(studentContext, userMessage, conversationHistory = []) {
    if (!this.isConfigured()) {
      return 'AI Career Guide is not configured. Please set the CLAUDE_API_KEY environment variable to enable this feature.';
    }

    try {
      const systemPrompt = this.buildSystemPrompt(studentContext);

      // Build messages array with history
      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.message,
        })),
        { role: 'user', content: userMessage },
      ];

      const response = await axios.post(
        CLAUDE_API_URL,
        {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        },
        {
          headers: {
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      logger.error('Claude API error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return 'AI service authentication failed. Please check your API key.';
      }
      return 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.';
    }
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
9. Use emojis sparingly for warmth`;
  }

  async analyzeResumeFit(resumeText, jobDescription) {
    if (!this.isConfigured()) {
      return {
        matchScore: 0,
        matchingSkills: [],
        missingSkills: [],
        suggestions: ['AI analysis is not configured. Please set the CLAUDE_API_KEY environment variable.'],
      };
    }

    try {
      const response = await axios.post(
        CLAUDE_API_URL,
        {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1024,
          system: `You are a resume analyzer. Analyze the resume against the job description and return a JSON object with exactly these fields:
- matchScore: number 0-100
- matchingSkills: array of skill strings that match
- missingSkills: array of {skill: string, importance: "critical"|"nice-to-have"} 
- suggestions: array of actionable improvement strings

Return ONLY valid JSON, no markdown formatting.`,
          messages: [{
            role: 'user',
            content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
          }],
        },
        {
          headers: {
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const text = response.data.content[0].text;
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch (error) {
      logger.error('Resume analysis error:', error.response?.data || error.message);
      throw new Error('Failed to analyze resume fit');
    }
  }
}

module.exports = new ClaudeService();
