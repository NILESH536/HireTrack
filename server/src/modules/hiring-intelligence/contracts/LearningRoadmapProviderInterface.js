class LearningRoadmapProviderInterface {
  /**
   * Generates a personalized learning roadmap.
   * @param {string} resumeText 
   * @param {number} assessmentScore 
   * @param {object} careerIntel - e.g., target roles, weak areas
   * @param {number} weeks - Number of weeks to plan
   * @returns {Promise<Array<{ week: number, goals: string[], topics: string[], resources: string[] }>>}
   */
  async generateLearningRoadmap(resumeText, assessmentScore, careerIntel, weeks = 3) {
    throw new Error('Not implemented');
  }
}

module.exports = LearningRoadmapProviderInterface;
