const { roles } = require('./roleKnowledgeBase');
const { resolveRole } = require('./roleResolver');

function calculateAtsLens(matchScore, missingCritical, extractionQuality) {
  let verdict = "Borderline";
  if (matchScore > 80 && missingCritical.length === 0) verdict = "Pass";
  if (matchScore < 60 || missingCritical.length > 2) verdict = "Reject";

  const reasons = [];
  if (missingCritical.length > 0) {
    reasons.push(`Missing critical ATS keywords: ${missingCritical.join(', ')}`);
  } else {
    reasons.push(`Strong alignment with critical ATS keywords`);
  }
  
  if (extractionQuality < 50) {
    reasons.push(`Poor resume formatting detected (extraction success rate low)`);
  } else {
    reasons.push(`Standard resume formatting verified`);
  }

  const confidence = Math.max(50, extractionQuality);

  return { verdict, confidence, reasons };
}

function calculateRecruiterLens(matchScore, readinessTier, roleTitle, canonicalRole) {
  let verdict = "Moderate";
  if (readinessTier === "Strong Candidate" || readinessTier === "Mid Ready") verdict = "Strong";
  if (readinessTier === "Beginner" || readinessTier === "Internship Ready") verdict = "Weak";

  // Phase 4.5: Semantic equivalence trajectory patch
  const userResolved = resolveRole(roleTitle);
  
  let similarityScore = 40;
  if (userResolved.canonicalRole.toLowerCase() === canonicalRole.toLowerCase()) {
    similarityScore = userResolved.confidence; 
  } else if (userResolved.canonicalRole !== "Unknown") {
    // We could do a complex NLP similarity, but for our deterministic proof:
    // If it maps to a recognized role but not the target, it's a pivot/mismatch
    // A mapping from "AIML Engineer" will correctly resolve to "Machine Learning Engineer" with 90+ confidence
    similarityScore = 55; // Minor penalty for switching domains
  }

  const reasons = [];
  if (similarityScore >= 80) {
    reasons.push(`Direct title alignment for ${canonicalRole} (Similarity: ${similarityScore}%)`);
  } else if (similarityScore >= 60) {
    reasons.push(`Minor trajectory variance (Similarity: ${similarityScore}% - Acceptable pivot)`);
  } else {
    reasons.push(`Major career trajectory mismatch (Targeting ${canonicalRole} but titled ${roleTitle})`);
  }

  reasons.push(`General readiness evaluated as: ${readinessTier}`);

  if (matchScore < 60) {
    reasons.push(`High risk of immediate rejection by hiring managers based on skill gaps`);
  }

  const confidence = similarityScore;

  return { verdict, confidence, reasons };
}

function calculateHiringManagerLens(matchedCritical, missingImportant, readinessTier, evidenceMap) {
  let verdict = "Moderate";
  if (readinessTier === "Strong Candidate" || readinessTier === "Mid Ready") verdict = "Strong";
  if (readinessTier === "Beginner" || readinessTier === "Internship Ready") verdict = "Weak";

  const reasons = [];
  let tier3Count = 0;
  let tier2Count = 0;
  
  for (const [skill, tier] of Object.entries(evidenceMap)) {
    if (tier >= 3) tier3Count++;
    else if (tier === 2) tier2Count++;
  }

  if (tier3Count > 0) {
    reasons.push(`Proven production-grade impact detected in ${tier3Count} core technologies`);
  } else if (tier2Count > 0) {
    reasons.push(`Demonstrates practical project implementation, but lacks quantified production scaling`);
  } else {
    reasons.push(`Only baseline theoretical knowledge detected; no applied project architectures found`);
    verdict = "Weak"; 
  }

  if (missingImportant.length > 0) {
    reasons.push(`Missing standard industry tooling (${missingImportant.slice(0,2).join(', ')}), requiring immediate onboarding time`);
  } else {
    reasons.push(`Broad ecosystem mastery; minimal onboarding friction expected`);
  }

  const confidence = tier3Count > 0 || tier2Count > 0 ? 85 : 65;

  return { verdict, confidence, reasons };
}

function runRecruiterSimulation(matchScore, readinessTier, missingCritical, missingImportant, matchedCritical, extractionQuality, roleTitle, canonicalRole, evidenceMap) {
  const atsScanner = calculateAtsLens(matchScore, missingCritical, extractionQuality);
  const recruiterLens = calculateRecruiterLens(matchScore, readinessTier, roleTitle, canonicalRole);
  const hiringManagerLens = calculateHiringManagerLens(matchedCritical, missingImportant, readinessTier, evidenceMap);

  return { atsScanner, recruiterLens, hiringManagerLens };
}

module.exports = { runRecruiterSimulation };
