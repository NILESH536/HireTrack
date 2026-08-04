const AIProvider = require('./AIProvider');

class PredictionProviderInterface extends AIProvider {
  /**
   * Predicts placement probability and generates a narrative.
   * @param {Object} studentContext - Background info about the student.
   * @returns {Promise<Object>} The prediction result { placementProbability, placementLabel, placementPredictionReport }
   */
  async predictPlacement(studentContext) {
    throw new Error("Method 'predictPlacement()' must be implemented.");
  }
}

module.exports = PredictionProviderInterface;
