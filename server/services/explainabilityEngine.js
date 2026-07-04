/**
 * explainabilityEngine.js — Phase P18 Trust & Market Intelligence
 * ===============================================================
 * Generates transparent score breakdowns so users can see exactly
 * why a score was given. "Every score must be explainable."
 */

/**
 * Generate an explainability report for an interview answer.
 * @param {object} answerDetails - The result from interviewScoringEngine for a single answer.
 * @returns {object} - Explainability payload
 */
function explainInterviewAnswer(answerDetails) {
  if (!answerDetails) return null;

  return {
    dimensions: [
      {
        name: 'Technical Accuracy',
        score: answerDetails.breakdown.technicalAccuracy,
        maxScore: 30,
        matchedSignals: answerDetails.matchedConcepts || [],
        missingSignals: answerDetails.missingConcepts || [],
        reasons: answerDetails.reasons?.technicalAccuracy || [],
      },
      {
        name: 'Depth',
        score: answerDetails.breakdown.depth,
        maxScore: 25,
        matchedSignals: [], // Depth is word-count and term density based
        missingSignals: [],
        reasons: answerDetails.reasons?.depth || [],
      },
      {
        name: 'Communication',
        score: answerDetails.breakdown.communication,
        maxScore: 20,
        matchedSignals: [],
        missingSignals: [],
        reasons: answerDetails.reasons?.communication || [],
      },
      {
        name: 'Problem Solving',
        score: answerDetails.breakdown.problemSolving,
        maxScore: 15,
        matchedSignals: [],
        missingSignals: [],
        reasons: answerDetails.reasons?.problemSolving || [],
      },
      {
        name: 'Confidence',
        score: answerDetails.breakdown.confidence,
        maxScore: 10,
        matchedSignals: [],
        missingSignals: [],
        reasons: answerDetails.reasons?.confidence || [],
      },
    ],
    appliedPenalties: (answerDetails.appliedPenalties || []).map(p => ({
      type: p.type || p.dimension,
      message: p.message,
      deduction: p.deduction || 0,
    })),
    totalDeduction: answerDetails.penaltyDeduction || 0,
    rawScore: answerDetails.rawScore,
    finalScore: answerDetails.finalScore,
  };
}

/**
 * Generate an explainability report for a resume or JD match.
 * @param {object} engineResult - The result from resumeScoringEngine or jdMatchScoringEngine.
 * @returns {object} - Explainability payload
 */
function explainDocumentScore(engineResult) {
  if (!engineResult) return null;

  return {
    dimensions: (engineResult.scoringBreakdown || []).map(dim => ({
      name: dim.dimension,
      score: dim.earned,
      maxScore: dim.maxPts,
      matchedSignals: dim.matchedSignals || [],
      missingSignals: dim.missingSignals || [],
      reasons: dim.reasons || [],
    })),
    appliedPenalties: (engineResult.appliedPenalties || []).map(p => ({
      type: p.id,
      message: p.message,
      deduction: p.deduction,
    })),
    totalDeduction: engineResult.penaltyDeduction || 0,
    rawScore: engineResult.rawScore,
    finalScore: engineResult.totalScore,
  };
}

module.exports = {
  explainInterviewAnswer,
  explainDocumentScore,
};
