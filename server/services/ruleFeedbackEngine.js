/**
 * ruleFeedbackEngine.js — Phase P17 Deterministic Rule-Based Feedback
 * ====================================================================
 * Generates specific, non-generic feedback BEFORE the LLM runs.
 * The LLM only gets to elaborate on what this engine has already concluded.
 *
 * Philosophy:
 *   - Every weakness is derived from a specific numeric trigger.
 *   - No "good attempt" or "promising start."
 *   - Feedback must be actionable and technically specific.
 */

// ── INTERVIEW RULE FEEDBACK ───────────────────────────────────────────────────
function generateInterviewFeedback(scores, penalties) {
  const feedback = {
    weaknesses: [],
    strengths: [],
    coachingDirectives: [],
  };

  const { technicalAccuracy, depth, communication, problemSolving, confidence } = scores;

  // ── TECHNICAL ACCURACY RULES ─────────────────────────────────
  if (technicalAccuracy < 40) {
    feedback.weaknesses.push(
      'Critical technical gap: answers demonstrate fundamental misunderstanding of core concepts. ' +
      'This is not a confidence issue — the underlying knowledge needs rebuilding.'
    );
    feedback.coachingDirectives.push({
      priority: 'CRITICAL',
      action: 'Rebuild fundamentals from scratch using structured resources (not YouTube tutorials). Study official documentation and implement projects from scratch.',
      effort: '4–8 weeks',
    });
  } else if (technicalAccuracy < 60) {
    feedback.weaknesses.push(
      'Technical accuracy is below passing threshold. Concepts are partially understood but ' +
      'answers consistently miss the production-critical details that interviewers test for.'
    );
    feedback.coachingDirectives.push({
      priority: 'HIGH',
      action: 'For each weak concept, build a working implementation from scratch — not just read about it.',
      effort: '2–4 weeks',
    });
  } else if (technicalAccuracy >= 80) {
    feedback.strengths.push(
      `Strong technical accuracy (${technicalAccuracy}/30). Demonstrates solid understanding of core concepts ` +
      `with production-relevant terminology.`
    );
  }

  // ── DEPTH RULES ───────────────────────────────────────────────
  if (depth < 40) {
    feedback.weaknesses.push(
      'Answers lack depth — only surface-level explanations with no tradeoff awareness. ' +
      'Senior engineers expect you to know WHY a solution is used, not just WHAT it is.'
    );
    feedback.coachingDirectives.push({
      priority: 'HIGH',
      action: 'Practice the "5 Whys" technique on every technical answer: after each statement, ask "why?" and add the explanation.',
      effort: '2 weeks',
    });
  } else if (depth < 60) {
    feedback.weaknesses.push(
      'Technical depth is shallow. Answers show familiarity but lack the nuance that distinguishes ' +
      'a candidate who has used something in production vs. read about it.'
    );
  } else if (depth >= 80) {
    feedback.strengths.push(
      `Excellent technical depth (${depth}/25). Answers consistently include tradeoffs, edge cases, and production considerations.`
    );
  }

  // ── COMMUNICATION RULES ───────────────────────────────────────
  if (communication < 40) {
    feedback.weaknesses.push(
      'Communication is critically poor — answers are unstructured, hard to follow, and would fail ' +
      'any behavioral screen. Interviewers need to understand your thinking process, not just your answer.'
    );
    feedback.coachingDirectives.push({
      priority: 'HIGH',
      action: 'Master the STAR format (Situation, Task, Action, Result) for behavioral questions. For technical questions, use the "Define → Approach → Tradeoffs → Conclusion" structure.',
      effort: '1–2 weeks',
    });
  } else if (communication < 60) {
    feedback.weaknesses.push(
      'Communication lacks structure — answers drift without clear organization. ' +
      'Filler words, hedging language, and repetition reduce perceived confidence significantly.'
    );
  } else if (communication >= 80) {
    feedback.strengths.push(
      `Clear, structured communication (${communication}/20). Answers follow logical progression with appropriate terminology.`
    );
  }

  // ── PROBLEM SOLVING RULES ─────────────────────────────────────
  if (problemSolving < 40) {
    feedback.weaknesses.push(
      'Problem-solving approach is reactive, not systematic. Answers jump to solutions without ' +
      'articulating constraints, edge cases, or trade-off considerations.'
    );
    feedback.coachingDirectives.push({
      priority: 'MEDIUM',
      action: 'Before answering any system design question, spend 30 seconds outlining: (1) requirements, (2) constraints, (3) assumptions. Practice this on every mock question.',
      effort: '3 weeks',
    });
  } else if (problemSolving >= 80) {
    feedback.strengths.push(
      `Strong problem-solving structure (${problemSolving}/15). Demonstrates systematic thinking with edge-case awareness.`
    );
  }

  // ── CONFIDENCE RULES ──────────────────────────────────────────
  if (confidence < 40) {
    feedback.weaknesses.push(
      'Confidence is dangerously low — excessive hedging ("I think", "maybe", "not sure") ' +
      'destroys credibility even when the technical content is correct. ' +
      'In a real interview, this signals lack of production experience.'
    );
    feedback.coachingDirectives.push({
      priority: 'MEDIUM',
      action: 'Record yourself answering 10 mock questions. Count hedging words. Replace "I think X might be..." with "The approach I would take is X because..."',
      effort: '1 week',
    });
  } else if (confidence >= 80) {
    feedback.strengths.push(
      `Confident delivery (${confidence}/10). Answers are presented assertively without excessive hedging.`
    );
  }

  // ── PENALTY-DERIVED FEEDBACK ──────────────────────────────────
  if (penalties && penalties.length > 0) {
    for (const p of penalties) {
      feedback.weaknesses.push(`[PENALTY ${p.id}] ${p.message}`);
    }
  }

  return feedback;
}

// ── RESUME RULE FEEDBACK ──────────────────────────────────────────────────────
function generateResumeFeedback(breakdown, features, penalties) {
  const feedback = {
    sectionWeaknesses: [],
    exactImprovements: [],
    strengths: [],
  };

  const { ats, keywords, projects, experience, impact, structure } = breakdown;

  // ATS
  if (ats < 12) {
    feedback.sectionWeaknesses.push(
      'ATS Compatibility: Critical failure. Resume will be filtered before a human sees it. ' +
      'Missing sections, poor formatting density, or unreadable structure detected.'
    );
    feedback.exactImprovements.push(
      'Add explicit section headers: "EXPERIENCE", "PROJECTS", "SKILLS", "EDUCATION" in standard formatting. ' +
      'Avoid tables, columns, or graphics — ATS systems cannot parse them.'
    );
  } else if (ats < 16) {
    feedback.sectionWeaknesses.push('ATS Compatibility: Below threshold. Some standard sections are missing or poorly structured.');
    feedback.exactImprovements.push('Add a dedicated "Technical Skills" section with comma-separated keywords.');
  } else if (ats >= 18) {
    feedback.strengths.push('Strong ATS compatibility — resume structure meets modern ATS requirements.');
  }

  // Keywords
  if (keywords < 12) {
    feedback.sectionWeaknesses.push(
      'Keyword Match: Critically low overlap with job requirements. ' +
      'Resume is optimized for no specific role — generic resumes fail 90% of ATS screens.'
    );
    feedback.exactImprovements.push(
      'Mirror 5–8 exact keywords from the job description in your experience bullets and skills section. ' +
      '"Used React" → "Developed production React applications with hooks and context API".'
    );
  } else if (keywords < 18) {
    feedback.sectionWeaknesses.push('Keyword Match: Moderate. Missing several role-specific keywords that ATS systems prioritize.');
  } else if (keywords >= 20) {
    feedback.strengths.push('Strong keyword density aligned with role requirements.');
  }

  // Projects
  if (projects < 8) {
    feedback.sectionWeaknesses.push(
      'Project Strength: Projects section is weak or missing. ' +
      `Only ${features.projectCount} project(s) detected. For a strong profile, 2–4 substantial projects are expected.`
    );
    feedback.exactImprovements.push(
      'Each project bullet should follow: [Action Verb] + [Technology] + [Specific Feature] + [Measurable Outcome]. ' +
      'Example: "Built a real-time chat system using Socket.io, serving 500+ concurrent users with <50ms latency."'
    );
  } else if (projects >= 16) {
    feedback.strengths.push('Strong project portfolio — demonstrates practical application of skills.');
  }

  // Impact
  if (impact < 5) {
    feedback.sectionWeaknesses.push(
      `Impact Strength: Only ${features.metricCount} quantified metrics detected. ` +
      'Every work experience bullet should include a number. "Improved API performance" is meaningless without a metric.'
    );
    feedback.exactImprovements.push(
      'Go through every experience bullet and ask: "By how much? How many? How fast?" ' +
      'Minimum: 3 quantified metrics per role. Examples: "reduced load time by 35%", "handled 10K API calls/day", "cut CI build time from 8min to 2min".'
    );
  } else if (impact >= 8) {
    feedback.strengths.push(`Good impact quantification — ${features.metricCount} metrics detected across the resume.`);
  }

  // Structure
  if (structure < 5) {
    feedback.sectionWeaknesses.push(
      'Structure Quality: Resume structure is below professional standard. ' +
      `${!features.formatting.hasBullets ? 'No bullet points detected — unreadable wall of text. ' : ''}` +
      `${!features.formatting.hasGitHub ? 'No GitHub/portfolio link. ' : ''}`
    );
  } else if (structure >= 8) {
    feedback.strengths.push('Clean resume structure with consistent formatting and proper contact information.');
  }

  // Penalties
  if (penalties && penalties.length > 0) {
    for (const p of penalties) {
      feedback.sectionWeaknesses.push(`[CRITICAL PENALTY] ${p.message}`);
    }
  }

  return feedback;
}

// ── JD MATCH RULE FEEDBACK ────────────────────────────────────────────────────
function generateJDMatchFeedback(breakdown, intersection, penalties) {
  const feedback = {
    gaps: [],
    strengths: [],
    rejectionReasons: [],
  };

  const { skillMatch, expMatch, eduMatch, toolMatch, bonus } = breakdown;

  if (skillMatch < 16) {
    feedback.gaps.push(
      `Critical skill gap: Only ${intersection.sharedSkills.length} of ${intersection.sharedSkills.length + intersection.missingSkills.length} required skills matched. ` +
      `Missing critical skills: ${intersection.missingSkills.slice(0, 3).join(', ') || 'none detected'}.`
    );
    feedback.rejectionReasons.push(`Skill coverage below 40% — automatic ATS rejection risk`);
  } else if (skillMatch >= 30) {
    feedback.strengths.push(`Strong skill alignment — matches ${intersection.sharedSkills.length} required skills.`);
  }

  if (toolMatch < 6) {
    feedback.gaps.push(
      `Tool/technology mismatch: Missing ${intersection.missingTools.slice(0, 3).join(', ')}. ` +
      'Companies hire for specific stacks — missing core tools is a hard filter for most technical teams.'
    );
    feedback.rejectionReasons.push('Tool stack mismatch detected');
  }

  if (expMatch < 10) {
    feedback.gaps.push('Experience level mismatch — either significantly over or under-qualified for this specific role.');
  } else if (expMatch >= 20) {
    feedback.strengths.push('Experience level aligns well with role requirements.');
  }

  if (bonus >= 6) {
    feedback.strengths.push(`Candidate brings ${intersection.bonusSkills.slice(0, 3).join(', ')} as differentiating bonus skills not explicitly required.`);
  }

  if (penalties && penalties.length > 0) {
    for (const p of penalties) {
      feedback.rejectionReasons.push(p.message);
    }
  }

  return feedback;
}

module.exports = {
  generateInterviewFeedback,
  generateResumeFeedback,
  generateJDMatchFeedback,
};
