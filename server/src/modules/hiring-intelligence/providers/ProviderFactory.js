const config = require('../config');
const GeminiProvider = require('./GeminiProvider');
const ClaudeProvider = require('./ClaudeProvider');
const OpenAIProvider = require('./OpenAIProvider');
const logger = require('../../../utils/logger');

class ProviderFactory {
  static getProvider(providerName = config.defaultProvider) {
    switch (providerName.toUpperCase()) {
      case 'GEMINI':
        return new GeminiProvider(config.providers.GEMINI);
      case 'CLAUDE':
        return new ClaudeProvider(config.providers.CLAUDE);
      case 'OPENAI':
        return new OpenAIProvider(config.providers.OPENAI);
      default:
        logger.warn(`AI Provider '${providerName}' not found, falling back to GEMINI`);
        return new GeminiProvider(config.providers.GEMINI);
    }
  }
}

module.exports = ProviderFactory;
