require('dotenv').config();

const config = {
  // Provider can be 'GEMINI', 'CLAUDE', 'OPENAI', 'MOCK'
  defaultProvider: process.env.AI_PROVIDER || 'GEMINI',

  providers: {
    GEMINI: {
      apiKey: process.env.GEMINI_API_KEY,
      defaultModel: 'gemini-2.5-flash',
    },
    CLAUDE: {
      apiKey: process.env.CLAUDE_API_KEY,
      defaultModel: 'claude-3-sonnet-20240229',
    },
    OPENAI: {
      apiKey: process.env.OPENAI_API_KEY,
      defaultModel: 'openai/gpt-4o-mini',
    },
  },

  features: {
    // Enable or disable specific AI features globally
    enableJobMatching: true,
    enableResumeAnalysis: true,
    enablePlacementPrediction: true,
    enableCareerRecommendation: true,
  },
};

module.exports = config;
