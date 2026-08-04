class ExplainableAIFramework {
  /**
   * Generates the standardized explainability prompt section to append to any AI instruction.
   * @returns {string} The prompt extension instructing the AI to output an explainability object.
   */
  static getExplainabilityPrompt() {
    return `
Additionally, you MUST provide an explainability object within your JSON response.
This object provides a structured, human-readable explanation for your reasoning.
The explainability object MUST have the following schema EXACTLY:
"explanation": {
  "positiveFactors": ["string"],
  "negativeFactors": ["string"],
  "missingSkills": ["string"],
  "missingRequirements": ["string"],
  "recommendations": ["string"],
  "confidenceScore": "High" | "Medium" | "Low",
  "reasoningSummary": "string"
}
`;
  }

  /**
   * Safely extracts and formats the explanation from the AI JSON response.
   * Ensures all fields exist even if the AI hallucinates missing ones.
   * @param {Object} aiResponseObject The raw parsed JSON response from the LLM.
   * @returns {Object} The guaranteed explanation object.
   */
  static formatExplanation(aiResponseObject) {
    const rawExp = aiResponseObject.explanation || {};
    
    return {
      positiveFactors: Array.isArray(rawExp.positiveFactors) ? rawExp.positiveFactors : [],
      negativeFactors: Array.isArray(rawExp.negativeFactors) ? rawExp.negativeFactors : [],
      missingSkills: Array.isArray(rawExp.missingSkills) ? rawExp.missingSkills : [],
      missingRequirements: Array.isArray(rawExp.missingRequirements) ? rawExp.missingRequirements : [],
      recommendations: Array.isArray(rawExp.recommendations) ? rawExp.recommendations : [],
      confidenceScore: ['High', 'Medium', 'Low'].includes(rawExp.confidenceScore) ? rawExp.confidenceScore : 'Medium',
      reasoningSummary: typeof rawExp.reasoningSummary === 'string' ? rawExp.reasoningSummary : 'No detailed reasoning provided.',
    };
  }
}

module.exports = ExplainableAIFramework;
