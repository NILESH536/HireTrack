const AIProvider = require('../contracts/AIProvider');
const axios = require('axios');
const ExplainableAIFramework = require('../services/ExplainableAIFramework');
const logger = require('../../../utils/logger');

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

class ClaudeProvider extends AIProvider {
  constructor(providerConfig) {
    super(providerConfig);
  }

  isConfigured() {
    return !!this.config.apiKey;
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

  async getCareerAdvice(studentContext, userMessage, conversationHistory = []) {
    if (!this.isConfigured()) {
      return 'AI Career Guide is not configured. Please set the CLAUDE_API_KEY environment variable to enable this feature.';
    }

    try {
      const systemPrompt = this.buildSystemPrompt(studentContext);

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
          model: this.config.defaultModel,
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        },
        {
          headers: {
            'x-api-key': this.config.apiKey,
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

  async matchJob(resumeText, jobDescription) {
    if (!this.isConfigured()) {
      return {
        matchScore: 0,
        explanation: ExplainableAIFramework.formatExplanation({
          explanation: { reasoningSummary: 'AI analysis is not configured. Please set the CLAUDE_API_KEY environment variable.' }
        })
      };
    }

    try {
      const response = await axios.post(
        CLAUDE_API_URL,
        {
          model: this.config.defaultModel,
          max_tokens: 1024,
          system: `You are a resume analyzer. Analyze the resume against the job description and return a JSON object with exactly these fields:
- matchScore: number 0-100 (overall match percentage)
- expectedShortlistingProbability: number 0-1 (e.g. 0.85)
${ExplainableAIFramework.getExplainabilityPrompt()}

Return ONLY valid JSON, no markdown formatting.`,
          messages: [{
            role: 'user',
            content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
          }],
        },
        {
          headers: {
            'x-api-key': this.config.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const text = response.data.content[0].text;
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

  async analyzeResumeATS(resumeText, studentContext, jobDescription = null) {
    if (!this.isConfigured()) {
      throw new Error('AI analysis is not configured. Please set the CLAUDE_API_KEY.');
    }

    try {
      const jdSection = jobDescription
        ? `\nJOB DESCRIPTION TO MATCH AGAINST:\n${jobDescription}`
        : '';

      const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume analyzer and career advisor.

Analyze the following resume thoroughly and return a JSON object with EXACTLY these fields:

1. "atsScore": number 0-100 (overall ATS compatibility score)
2. "formatScore": number 0-100 (how well-formatted for ATS parsing)
3. "contentScore": number 0-100 (quality of content, action verbs, quantified achievements)
4. "keywordScore": number 0-100 (relevant industry keyword density)
5. "matchingSkills": array of strings — skills found in the resume that are strong and relevant
6. "missingSkills": array of objects {skill: string, importance: "critical"|"important"|"nice-to-have"} — skills missing from the resume that are important for the target role
7. "futureSkills": array of objects {skill: string, reason: string, priority: "high"|"medium"|"low", resources: string} — skills the student should learn next for their career goal "${studentContext.careerGoal || 'Software Developer'}" considering their branch "${studentContext.branch || 'CS'}"
8. "formatIssues": array of strings — specific formatting problems that hurt ATS parsing
9. "strengths": array of strings — what the resume does well (max 5)
10. "suggestions": array of objects {category: "content"|"format"|"keywords"|"impact", suggestion: string, priority: "high"|"medium"|"low"} — actionable improvements
11. "summary": string — 2-3 sentence executive summary of the resume quality
12. "sectionAnalysis": object with keys "experience", "education", "skills", "projects" each having {score: number 0-100, feedback: string}
${jdSection ? '13. "jobMatchScore": number 0-100 — how well the resume matches the specific job description' : ''}
${ExplainableAIFramework.getExplainabilityPrompt()}

Return ONLY valid JSON, no markdown formatting.`;

      const response = await axios.post(
        CLAUDE_API_URL,
        {
          model: this.config.defaultModel,
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: `RESUME:\n${resumeText}\n${jdSection}`,
          }],
        },
        {
          headers: {
            'x-api-key': this.config.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const text = response.data.content[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch (error) {
      logger.error('Claude ATS analysis error:', error.response?.data || error.message);
      throw new Error('Failed to analyze resume. Please try again.');
    }
  }

  async deepAnalyzeResumeJD(resumeText, jobDescription) {
    if (!this.isConfigured()) {
      throw new Error('AI analysis is not configured. Please set the CLAUDE_API_KEY.');
    }

    try {
      const systemPrompt = `You are a Principal Technical Recruiter and Hiring Manager.
Deeply analyze the provided resume against the provided job description.
Return a JSON object with EXACTLY these fields:

1. "overallMatchScore": number 0-100
2. "technicalSkillsScore": number 0-100
3. "educationScore": number 0-100
4. "projectsScore": number 0-100
5. "certificationsScore": number 0-100
6. "missingKeywords": array of strings (keywords from the JD missing in the resume)
7. "missingSkills": array of strings (core skills required by the JD but missing)
8. "strongSections": array of strings (sections of the resume that perfectly match the JD)
9. "weakSections": array of strings (sections of the resume that are weak or irrelevant to the JD)
${ExplainableAIFramework.getExplainabilityPrompt()}

Ensure your AI Explanation specifically includes actionable recommendations on how the candidate can improve their resume for this exact JD.
Return ONLY valid JSON.`;

      const response = await axios.post(
        CLAUDE_API_URL,
        {
          model: this.config.defaultModel,
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
          }],
        },
        {
          headers: {
            'x-api-key': this.config.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const text = response.data.content[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch (error) {
      logger.error('Claude Resume-JD analysis error:', error.response?.data || error.message);
      throw new Error('Failed to deeply analyze resume against job description.');
    }
  }

  async predictPlacement(studentContext) {
    if (!this.isConfigured()) {
      throw new Error('AI analysis is not configured. Please set the CLAUDE_API_KEY.');
    }

    try {
      const systemPrompt = `You are a Principal Career Coach and Placement Analyst.
Analyze the provided student data and generate a holistic placement prediction.
Return a JSON object with EXACTLY these fields:

1. "readinessScore": number 0-100 (Overall placement readiness)
2. "hiringProbability": number 0.0-1.0 (Likelihood of securing a placement)
3. "careerReadiness": number 0-100
4. "technicalReadiness": number 0-100
5. "resumeReadiness": number 0-100
6. "interviewReadiness": number 0-100
7. "skillGaps": array of objects {skill: string, severity: "high"|"medium"|"low", reason: string}
8. "recommendedPath": array of strings (week-by-week actionable goals)
9. "recommendedCertifications": array of strings
10. "recommendedProjects": array of strings
11. "companyRecommendations": array of strings (types of companies they should target)
${ExplainableAIFramework.getExplainabilityPrompt()}

Ensure your AI Explanation justifies WHY you assigned the hiring probability, citing their CGPA, skills, and resume data.
Return ONLY valid JSON.`;

      const response = await axios.post(
        CLAUDE_API_URL,
        {
          model: this.config.defaultModel,
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: `STUDENT CONTEXT:\n${JSON.stringify(studentContext, null, 2)}`,
          }],
        },
        {
          headers: {
            'x-api-key': this.config.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const text = response.data.content[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch (error) {
      logger.error('Claude predictPlacement error:', error.response?.data || error.message);
      throw new Error('Failed to generate career prediction.');
    }
  }

  async evaluateCode(studentAnswer, questionType, content, testCases) {
    if (!this.isConfigured()) {
      throw new Error('AI analysis is not configured.');
    }

    try {
      const systemPrompt = `You are a Senior Software Engineer acting as a strict Code Evaluator.
Evaluate the following student submission for a ${questionType} question.
Return a JSON object with EXACTLY these fields:
1. "isCorrect": boolean (true if the code/query solves the problem fundamentally)
2. "scoreRatio": number 0.0 to 1.0 (How close it is to the perfect solution. 1.0 is perfect, 0.5 is partially correct, 0.0 is completely wrong)
3. "feedback": string (Explain the time/space complexity, any bugs found, or why test cases might fail. Be concise and constructive.)

DO NOT execute the code. Perform static analysis and semantic checking.
Return ONLY valid JSON.`;

      const promptData = {
        question: content,
        testCases: testCases || 'None provided',
        studentSubmission: studentAnswer,
      };

      const response = await axios.post(
        CLAUDE_API_URL,
        {
          model: this.config.defaultModel,
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: JSON.stringify(promptData, null, 2),
          }],
        },
        {
          headers: {
            'x-api-key': this.config.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const text = response.data.content[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch (error) {
      logger.error('Claude evaluateCode error:', error.message);
      return { isCorrect: false, scoreRatio: 0, feedback: 'AI Evaluation failed.' };
    }
  }

  async predictInstitutionalRisk(context) {
    if (!this.isConfigured()) {
      throw new Error('AI analysis is not configured.');
    }

    try {
      const systemPrompt = `You are a Principal Data Scientist and Placement Analyst for a university.
Analyze the provided institutional risk data.
Return a JSON object with EXACTLY these fields:
1. "riskLevel": string ("High", "Medium", "Low")
2. "primaryRiskFactors": array of strings
3. "recommendedInterventions": array of objects {action: string, impact: "High"|"Medium"|"Low", timeframe: string}
4. "skillFocusAreas": array of strings (what the university should focus on teaching)
${ExplainableAIFramework.getExplainabilityPrompt()}

DO NOT return markdown. Return ONLY valid JSON.`;

      const response = await axios.post(
        CLAUDE_API_URL,
        {
          model: this.config.defaultModel,
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: JSON.stringify(context, null, 2),
          }],
        },
        {
          headers: {
            'x-api-key': this.config.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const text = response.data.content[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch (error) {
      logger.error('Claude predictInstitutionalRisk error:', error.message);
      return { riskLevel: 'Unknown', primaryRiskFactors: [], recommendedInterventions: [] };
    }
  }
}

module.exports = ClaudeProvider;
