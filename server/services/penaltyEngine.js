/**
 * penaltyEngine.js — Phase P17 Hard Penalty Engine
 * ==================================================
 * Applies brutal, hard deductions for critical mistakes.
 * These run AFTER base scoring and can override soft scores.
 *
 * Philosophy:
 *   - Penalties are non-negotiable.
 *   - A penalty is not a soft deduction — it's a hard cap or deduction.
 *   - The LLM cannot reverse or soften a penalty.
 */

// ── RESUME PENALTIES ──────────────────────────────────────────────────────────
const RESUME_PENALTY_RULES = [
  {
    id: 'RP-001',
    name: 'Resume Over Length (Fresher)',
    condition: (features) => features.estimatedPages > 2 && features.experienceYears < 3,
    deduction: 12,
    message: 'Resume exceeds 2 pages for a candidate with <3 years experience. Recruiters stop reading after page 2.',
  },
  {
    id: 'RP-002',
    name: 'No Projects Section',
    condition: (features) => !features.formatting.hasSections.projects && features.experienceYears < 4,
    deduction: 15,
    message: 'No projects section detected. For early-career candidates, projects ARE your experience. This is an automatic red flag.',
  },
  {
    id: 'RP-003',
    name: 'Zero Quantified Metrics',
    condition: (features) => features.metricCount === 0,
    deduction: 12,
    message: 'Zero quantified achievements detected. Every bullet point without a number is a missed opportunity. "Improved performance" means nothing without "by 40%".',
  },
  {
    id: 'RP-004',
    name: 'Missing Contact Info',
    condition: (features) => !features.formatting.hasEmail,
    deduction: 10,
    message: 'No email address detected. A resume without contact information is unpublishable.',
  },
  {
    id: 'RP-005',
    name: 'No GitHub or Portfolio',
    condition: (features) => !features.formatting.hasGitHub && !features.formatting.hasLinkedIn && features.experienceYears < 5,
    deduction: 8,
    message: 'No GitHub or LinkedIn detected. For tech candidates, social proof is non-negotiable in 2024.',
  },
  {
    id: 'RP-006',
    name: 'Weak Action Verb Quality',
    condition: (features) => features.actionVerbs.quality === 'poor',
    deduction: 8,
    message: 'Action verbs are passive or absent ("responsible for", "helped with"). Replace with impact verbs: "engineered", "reduced", "scaled".',
  },
  {
    id: 'RP-007',
    name: 'No Skills Section',
    condition: (features) => !features.formatting.hasSections.skills,
    deduction: 10,
    message: 'No dedicated skills section detected. ATS systems first scan for skill keywords — without a skills section, you fail before a human sees your resume.',
  },
  {
    id: 'RP-008',
    name: 'Too Short (Incomplete Resume)',
    condition: (features) => features.wordCount < 200,
    deduction: 20,
    message: 'Resume is critically under-developed. Less than 200 words detected. Minimum viable resume requires 400+ words.',
  },
];

// ── INTERVIEW PENALTIES ───────────────────────────────────────────────────────
const INTERVIEW_PENALTY_RULES = [
  {
    id: 'IP-001',
    name: 'Penalty Trigger Detected',
    // Applied per-answer when penaltyTriggers match answer text
    condition: (answerText, question) => {
      if (!question.penaltyTriggers || question.penaltyTriggers.length === 0) return false;
      const lower = answerText.toLowerCase();
      return question.penaltyTriggers.some(trigger => lower.includes(trigger.toLowerCase()));
    },
    deduction: 20,
    generateMessage: (question, trigger) =>
      `Demonstrated fundamental misunderstanding: "${trigger}". This signals a critical gap that would fail a real technical interview.`,
  },
  {
    id: 'IP-002',
    name: 'Missing All Critical Concepts',
    condition: (answerText, question) => {
      if (!question.criticalConcepts || question.criticalConcepts.length === 0) return false;
      const lower = answerText.toLowerCase();
      const matched = question.criticalConcepts.filter(c => lower.includes(c.toLowerCase()));
      return matched.length === 0 && question.type === 'System Design';
    },
    deduction: 15,
    generateMessage: (question) =>
      `Answer shows surface-level knowledge but completely missed the production-critical concepts for this question type. A hiring manager would immediately escalate this as a gap.`,
  },
  {
    id: 'IP-003',
    name: 'Extremely Short Answer',
    condition: (answerText, question) => {
      const wordCount = answerText.trim().split(/\s+/).length;
      return wordCount < 30 && question.type !== 'HR';
    },
    deduction: 18,
    generateMessage: () =>
      `Answer is critically short (<30 words) for a technical question. In a real interview, this reads as "I don't know." Elaborate even if unsure.`,
  },
  {
    id: 'IP-004',
    name: 'Hedging Overload (Confidence Killer)',
    condition: (answerText) => {
      const hedges = ['i think', 'maybe', 'i guess', 'not sure', 'probably', 'might be', 'i believe'];
      const lower = answerText.toLowerCase();
      const count = hedges.filter(h => lower.includes(h)).length;
      return count >= 3;
    },
    deduction: 8,
    generateMessage: () =>
      `Answer contains excessive hedging language (3+ instances of "I think", "maybe", "probably"). Even when uncertain, confident framing is critical. Say "One approach would be..." not "I think maybe..."`,
  },
];

// ── JD MATCH PENALTIES ────────────────────────────────────────────────────────
const JD_MATCH_PENALTY_RULES = [
  {
    id: 'JP-001',
    name: 'Missing All Role-Defining Skills',
    condition: (sharedSkills, roleDefiningSkills) => {
      const matchedDefining = roleDefiningSkills.filter(s => sharedSkills.includes(s));
      return matchedDefining.length === 0 && roleDefiningSkills.length > 0;
    },
    deduction: 30,
    message: 'Candidate matches zero role-defining skills. This application will be auto-rejected by every modern ATS system before a human reviews it.',
  },
  {
    id: 'JP-002',
    name: 'Experience Level Mismatch (Overqualified)',
    condition: (resumeYears, jdRequiredYears) => resumeYears > jdRequiredYears + 5,
    deduction: 5, // mild penalty — overqualification is less severe
    message: 'Candidate appears significantly overqualified for this role. May indicate a strategic mismatch or the resume fails to target the specific role.',
  },
  {
    id: 'JP-003',
    name: 'Experience Level Mismatch (Underqualified)',
    condition: (resumeYears, jdRequiredYears) => {
      const diff = jdRequiredYears - resumeYears;
      return diff >= 3;
    },
    deduction: 20,
    message: 'Candidate has significantly less experience than the role requires. Rejection risk is high for this specific position.',
  },
];

// ── APPLY FUNCTIONS ───────────────────────────────────────────────────────────

/**
 * Apply resume penalties to a features object.
 * Returns { totalDeduction, appliedPenalties }
 */
function applyResumePenalties(features) {
  const applied = [];
  let totalDeduction = 0;

  for (const rule of RESUME_PENALTY_RULES) {
    if (rule.condition(features)) {
      applied.push({
        id:        rule.id,
        name:      rule.name,
        deduction: rule.deduction,
        message:   rule.message,
      });
      totalDeduction += rule.deduction;
    }
  }

  return { totalDeduction, appliedPenalties: applied };
}

/**
 * Apply per-answer interview penalties.
 * Returns { deduction, appliedPenalties } for a single answer.
 */
function applyInterviewPenalties(answerText, question) {
  const applied = [];
  let deduction = 0;

  for (const rule of INTERVIEW_PENALTY_RULES) {
    let triggered = false;
    let msg = '';

    if (rule.id === 'IP-001') {
      // Special: find the specific trigger that matched
      const lower = answerText.toLowerCase();
      const trigger = (question.penaltyTriggers || []).find(t => lower.includes(t.toLowerCase()));
      if (trigger && rule.condition(answerText, question)) {
        triggered = true;
        msg = rule.generateMessage(question, trigger);
      }
    } else {
      triggered = rule.condition(answerText, question);
      msg = typeof rule.generateMessage === 'function'
        ? rule.generateMessage(question)
        : rule.message || '';
    }

    if (triggered) {
      applied.push({ id: rule.id, name: rule.name, deduction: rule.deduction, message: msg });
      deduction += rule.deduction;
    }
  }

  return { deduction, appliedPenalties: applied };
}

/**
 * Apply JD match penalties.
 */
function applyJDMatchPenalties(intersection, roleDefiningSkills, resumeYears, jdRequiredYears) {
  const applied = [];
  let totalDeduction = 0;

  const sharedSkills = intersection.sharedSkills || [];

  for (const rule of JD_MATCH_PENALTY_RULES) {
    let triggered = false;

    if (rule.id === 'JP-001') {
      triggered = rule.condition(sharedSkills, roleDefiningSkills || []);
    } else if (rule.id === 'JP-002') {
      triggered = rule.condition(resumeYears || 0, jdRequiredYears || 0);
    } else if (rule.id === 'JP-003') {
      triggered = rule.condition(resumeYears || 0, jdRequiredYears || 0);
    }

    if (triggered) {
      applied.push({ id: rule.id, name: rule.name, deduction: rule.deduction, message: rule.message });
      totalDeduction += rule.deduction;
    }
  }

  return { totalDeduction, appliedPenalties: applied };
}

module.exports = {
  applyResumePenalties,
  applyInterviewPenalties,
  applyJDMatchPenalties,
  RESUME_PENALTY_RULES,
  INTERVIEW_PENALTY_RULES,
  JD_MATCH_PENALTY_RULES,
};
