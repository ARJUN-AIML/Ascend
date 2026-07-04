/**
 * featureExtractor.js — Phase P17.1 Upgraded (Semantic Extraction)
 * =================================================================
 * Upgrade: semantic synonym groups replace raw string matching.
 * "event driven" ≈ "pub-sub" ≈ "kafka" — all resolve to the same concept.
 */

const { normalizeSkill, ontology } = require('./skillOntology');

// ── SEMANTIC SYNONYM GROUPS ────────────────────────────────────────────────────
// Each entry maps a canonical concept to its semantic equivalents.
// Any match in a group resolves to the canonical concept.
const SEMANTIC_GROUPS = [
  // Architecture patterns
  { canonical: 'event-driven',          synonyms: ['pub-sub', 'event driven', 'event bus', 'message broker', 'asynchronous messaging', 'async events'] },
  { canonical: 'pub-sub',               synonyms: ['publish subscribe', 'pubsub', 'event-driven', 'topics', 'fan-out'] },
  { canonical: 'microservices',         synonyms: ['micro services', 'service oriented', 'soa', 'distributed services', 'service mesh'] },
  { canonical: 'caching',               synonyms: ['cache', 'memoization', 'in-memory store', 'redis', 'memcached'] },
  { canonical: 'load balancing',        synonyms: ['load balancer', 'haproxy', 'nginx load', 'round robin', 'traffic distribution'] },
  { canonical: 'rate limiting',         synonyms: ['throttling', 'api throttle', 'request limiting', 'token bucket', 'leaky bucket'] },
  { canonical: 'circuit breaker',       synonyms: ['circuit breaking', 'bulkhead', 'fault tolerance pattern', 'resilience4j', 'hystrix'] },
  { canonical: 'horizontal scaling',    synonyms: ['scale out', 'scaling out', 'add instances', 'auto scaling', 'elastic scaling'] },
  { canonical: 'vertical scaling',      synonyms: ['scale up', 'scaling up', 'bigger machine', 'more ram', 'more cpu'] },

  // ML / AI concepts
  { canonical: 'machine learning',      synonyms: ['ml', 'model training', 'predictive modeling', 'supervised learning', 'unsupervised learning', 'reinforcement learning'] },
  { canonical: 'deep learning',         synonyms: ['neural networks', 'neural net', 'backpropagation', 'cnn', 'rnn', 'lstm', 'transformer model'] },
  { canonical: 'nlp',                   synonyms: ['natural language', 'text processing', 'language model', 'llm', 'gpt', 'bert', 'tokenization'] },
  { canonical: 'model deployment',      synonyms: ['serving model', 'model serving', 'inference api', 'deploying model', 'model in production'] },
  { canonical: 'feature engineering',   synonyms: ['feature extraction', 'feature selection', 'data preprocessing', 'feature store'] },

  // Data concepts
  { canonical: 'data pipeline',         synonyms: ['etl', 'elt', 'data flow', 'data ingestion', 'batch processing', 'stream processing'] },
  { canonical: 'data warehousing',      synonyms: ['data warehouse', 'olap', 'dimensional model', 'star schema', 'snowflake schema'] },

  // Security
  { canonical: 'authentication',        synonyms: ['auth', 'login', 'identity', 'jwt auth', 'oauth', 'sso', 'session management'] },
  { canonical: 'authorization',         synonyms: ['rbac', 'access control', 'permissions', 'role based', 'policy enforcement'] },

  // Frontend
  { canonical: 'state management',      synonyms: ['redux', 'zustand', 'context api', 'global state', 'application state', 'vuex', 'pinia'] },
  { canonical: 'server side rendering', synonyms: ['ssr', 'next.js', 'server rendering', 'pre-rendering', 'isomorphic'] },
  { canonical: 'web performance',       synonyms: ['performance optimization', 'lazy loading', 'code splitting', 'tree shaking', 'lighthouse', 'core web vitals', 'lcp', 'fcp'] },
  { canonical: 'component architecture', synonyms: ['component based', 'reusable components', 'atomic design', 'design system', 'compound components'] },

  // DevOps
  { canonical: 'containerization',      synonyms: ['docker', 'containers', 'container orchestration', 'dockerfile', 'docker-compose'] },
  { canonical: 'infrastructure as code', synonyms: ['iac', 'terraform', 'cloudformation', 'pulumi', 'ansible', 'declarative infrastructure'] },
  { canonical: 'ci/cd',                 synonyms: ['continuous integration', 'continuous deployment', 'continuous delivery', 'github actions', 'jenkins', 'gitlab ci', 'pipeline'] },
  { canonical: 'observability',         synonyms: ['monitoring', 'tracing', 'logging', 'metrics', 'datadog', 'prometheus', 'grafana', 'alerting'] },

  // Databases
  { canonical: 'database indexing',     synonyms: ['indexing', 'b-tree index', 'composite index', 'covering index', 'query optimization', 'explain plan'] },
  { canonical: 'database sharding',     synonyms: ['sharding', 'partitioning', 'horizontal partitioning', 'shard key', 'consistent hashing'] },
  { canonical: 'transactions',          synonyms: ['acid', 'atomicity', 'consistency', 'isolation', 'durability', 'two-phase commit', 'rollback'] },
];

// ── BUILD FAST LOOKUP MAP ──────────────────────────────────────────────────────
const semanticLookup = new Map();
for (const group of SEMANTIC_GROUPS) {
  semanticLookup.set(group.canonical.toLowerCase(), group.canonical);
  for (const syn of group.synonyms) {
    semanticLookup.set(syn.toLowerCase(), group.canonical);
  }
}

/**
 * Resolve a term to its canonical semantic concept.
 * Returns the canonical name or null if not in any semantic group.
 */
function resolveSemanticConcept(term) {
  return semanticLookup.get(term.toLowerCase()) || null;
}

/**
 * Extract all semantic concepts from text using synonym groups.
 * Returns deduplicated canonical concept names.
 */
function extractSemanticConcepts(text) {
  const lower = text.toLowerCase();
  const found = new Set();

  for (const [synonym, canonical] of semanticLookup.entries()) {
    const escaped = synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Word-boundary aware
    const re = new RegExp(`(?<![a-z-])${escaped}(?![a-z-])`, 'i');
    if (re.test(lower)) {
      found.add(canonical);
    }
  }

  return [...found];
}

/**
 * Check if two concepts are semantically equivalent.
 * e.g. isSemanticallyEquivalent("event driven", "pub-sub") → true
 */
function isSemanticallyEquivalent(termA, termB) {
  const canonA = resolveSemanticConcept(termA) || termA.toLowerCase();
  const canonB = resolveSemanticConcept(termB) || termB.toLowerCase();
  return canonA === canonB;
}

/**
 * Check if a text contains a concept, considering semantic equivalents.
 * More powerful than simple `text.includes(concept)`.
 */
function textContainsConcept(text, concept) {
  const lower = text.toLowerCase();
  const targetCanon = resolveSemanticConcept(concept) || concept.toLowerCase();

  // Direct match
  if (lower.includes(concept.toLowerCase())) return true;

  // Semantic match: check if text contains any synonym of the target concept
  const group = SEMANTIC_GROUPS.find(g =>
    g.canonical.toLowerCase() === targetCanon ||
    g.synonyms.some(s => s.toLowerCase() === targetCanon)
  );

  if (group) {
    const allTerms = [group.canonical, ...group.synonyms];
    return allTerms.some(t => lower.includes(t.toLowerCase()));
  }

  return false;
}

// ── ACTION VERBS (Quality tiers) ─────────────────────────────────────────────
const TIER1_VERBS = ['architected', 'designed', 'led', 'built', 'founded', 'launched',
  'scaled', 'optimized', 'reduced', 'increased', 'improved', 'automated',
  'deployed', 'implemented', 'engineered', 'developed', 'created', 'delivered'];

const TIER2_VERBS = ['contributed', 'assisted', 'helped', 'supported', 'worked',
  'collaborated', 'participated', 'involved', 'managed', 'coordinated'];

// ── METRIC PATTERNS ──────────────────────────────────────────────────────────
const METRIC_PATTERNS = [
  /\d+%/g,                          // percentages: "reduced by 40%"
  /\$[\d,]+[km]?/gi,                // money: "$50k", "$1.2M"
  /[\d,]+\s*(users?|customers?)/gi, // scale: "10,000 users"
  /\d+x\s*(faster|improvement)/gi, // multipliers: "3x faster"
  /\d+\s*(ms|seconds?|hrs?)/gi,    // time: "200ms", "3 seconds"
  /reduced\s+by\s+\d+/gi,          // reductions: "reduced by 30"
  /increased\s+by\s+\d+/gi,        // increases: "increased by 25"
  /saved\s+\d+/gi,                  // savings: "saved 200 hours"
];

// ── SECTION DETECTORS ────────────────────────────────────────────────────────
const SECTION_PATTERNS = {
  experience:   /\b(experience|work history|employment|professional background)\b/i,
  education:    /\b(education|academic|degree|university|college|gpa|cgpa)\b/i,
  projects:     /\b(projects?|personal projects?|academic projects?|side projects?)\b/i,
  skills:       /\b(skills?|technical skills?|core competencies|proficiencies)\b/i,
  summary:      /\b(summary|objective|profile|about me|overview)\b/i,
  achievements: /\b(achievements?|accomplishments?|awards?|certifications?)\b/i,
};

// ── EXPERIENCE YEAR EXTRACTOR ─────────────────────────────────────────────────
function extractExperienceYears(text) {
  // Pattern: "3+ years", "2 years of experience", "2018–2022"
  const explicitMatch = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
  if (explicitMatch) return parseInt(explicitMatch[1]);

  // Date range extraction: "Jan 2020 – Mar 2023" → 3 years
  const dateRanges = [...text.matchAll(/(\d{4})\s*[–\-–]\s*(present|\d{4})/gi)];
  if (dateRanges.length > 0) {
    let totalMonths = 0;
    const now = new Date();
    for (const m of dateRanges) {
      const start = parseInt(m[1]);
      const end = m[2].toLowerCase() === 'present' ? now.getFullYear() : parseInt(m[2]);
      if (end >= start && start > 1990 && end <= now.getFullYear() + 1) {
        totalMonths += (end - start) * 12;
      }
    }
    return Math.min(Math.round(totalMonths / 12), 20);
  }

  return 0;
}

// ── PAGE COUNT ESTIMATOR ──────────────────────────────────────────────────────
function estimatePageCount(text) {
  // Approximate: ~400 words per page, ~5 chars per word
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / 400));
}

// ── TOOL EXTRACTION ───────────────────────────────────────────────────────────
function extractTools(text) {
  const lower = text.toLowerCase();
  const tools = [];

  // Walk ontology for all tool-type entries
  for (const [canonical, data] of Object.entries(ontology)) {
    if (['tool', 'platform', 'database', 'library', 'framework', 'technology'].includes(data.type)) {
      const toCheck = [canonical, ...(data.aliases || [])];
      for (const term of toCheck) {
        if (lower.includes(term.toLowerCase())) {
          if (!tools.includes(canonical)) tools.push(canonical);
          break;
        }
      }
    }
  }
  return tools;
}

// ── SKILL EXTRACTION ──────────────────────────────────────────────────────────
function extractSkills(text) {
  const lower = text.toLowerCase();
  const skills = new Set();

  for (const [canonical, data] of Object.entries(ontology)) {
    const toCheck = [canonical, ...(data.aliases || [])];
    for (const term of toCheck) {
      // Use word-boundary style matching to avoid false positives
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(?<![a-z])${escaped}(?![a-z])`, 'i');
      if (re.test(lower)) {
        skills.add(canonical);
        break;
      }
    }
  }
  return [...skills];
}

// ── PROJECT COUNT ─────────────────────────────────────────────────────────────
function extractProjectCount(text) {
  // Count distinct project headers
  const patterns = [
    /\b(project\s*\d+|project[:\s]+\w)/gi,
    /github\.com\/\S+/gi,
    /\b(built|developed|created|engineered)\s+\w+.*?(app|service|system|platform|tool|api|bot|dashboard)/gi,
  ];

  let count = 0;
  const seen = new Set();

  for (const p of patterns) {
    const matches = text.match(p) || [];
    for (const m of matches) {
      const key = m.toLowerCase().slice(0, 40);
      if (!seen.has(key)) {
        seen.add(key);
        count++;
      }
    }
  }

  return Math.min(count, 10);
}

// ── METRIC COUNT ──────────────────────────────────────────────────────────────
function extractMetricCount(text) {
  let total = 0;
  for (const pattern of METRIC_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) total += matches.length;
  }
  return total;
}

// ── ACTION VERB DENSITY ───────────────────────────────────────────────────────
function extractActionVerbDensity(text) {
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  if (wordCount === 0) return { tier1: 0, tier2: 0, density: 0, quality: 'poor' };

  const tier1Count = words.filter(w => TIER1_VERBS.includes(w)).length;
  const tier2Count = words.filter(w => TIER2_VERBS.includes(w)).length;

  const density = ((tier1Count * 2 + tier2Count) / wordCount) * 100;

  let quality = 'poor';
  if (density >= 3) quality = 'strong';
  else if (density >= 1.5) quality = 'moderate';
  else if (density >= 0.5) quality = 'weak';

  return { tier1: tier1Count, tier2: tier2Count, density: parseFloat(density.toFixed(2)), quality };
}

// ── FORMATTING SIGNALS ────────────────────────────────────────────────────────
function extractFormattingSignals(text) {
  return {
    hasSections: Object.entries(SECTION_PATTERNS).reduce((acc, [key, re]) => {
      acc[key] = re.test(text);
      return acc;
    }, {}),
    hasBullets:        /^[\s]*[•\-\*>◦▸]/m.test(text),
    hasEmail:          /[\w.+-]+@[\w-]+\.\w{2,}/i.test(text),
    hasPhone:          /(\+?\d[\d\s\-().]{7,}\d)/.test(text),
    hasGitHub:         /github\.com\/\w+/i.test(text),
    hasLinkedIn:       /linkedin\.com\/in\/\w+/i.test(text),
    wordCount:         text.split(/\s+/).filter(Boolean).length,
    lineCount:         text.split('\n').length,
    avgLineLength:     Math.round(text.length / Math.max(1, text.split('\n').length)),
  };
}

// ── EDUCATION EXTRACTION ──────────────────────────────────────────────────────
function extractEducation(text) {
  const hasDegree    = /\b(b\.?tech|b\.?e|b\.?s\.?c|bachelor|m\.?tech|m\.?s|master|phd|doctorate|mba)\b/i.test(text);
  const hasGPA       = /\b(gpa|cgpa|grade)\s*[:\-]?\s*[\d.]+/i.test(text);
  const isTier1      = /\b(iit|nit|bits|iiit|vit|srm|manipal|mit|stanford|cmu|berkeley)\b/i.test(text);

  return { hasDegree, hasGPA, isTier1 };
}

// ── MAIN EXTRACTOR ────────────────────────────────────────────────────────────
/**
 * Extract all signals from a text document (resume, JD, answer).
 * @param {string} text - Raw text content
 * @param {'resume'|'jd'|'answer'} type - Context type
 * @returns {FeatureMap} Structured signal object
 */
function extractFeatures(text, type = 'resume') {
  if (!text || typeof text !== 'string') {
    return { error: 'Invalid text input', skills: [], tools: [], metrics: 0 };
  }

  const skills           = extractSkills(text);
  const tools            = extractTools(text);
  const projectCount     = extractProjectCount(text);
  const metricCount      = extractMetricCount(text);
  const actionVerbs      = extractActionVerbDensity(text);
  const experienceYears  = extractExperienceYears(text);
  const formatting       = extractFormattingSignals(text);
  const education        = extractEducation(text);
  const estimatedPages   = estimatePageCount(text);

  return {
    // Core skill signals
    skills,
    tools,
    skillCount: skills.length,
    toolCount:  tools.length,

    // Strength signals
    projectCount,
    metricCount,
    actionVerbs,
    experienceYears,
    estimatedPages,

    // Structure signals
    formatting,
    education,

    // Metadata
    charCount:  text.length,
    wordCount:  formatting.wordCount,
    type,
  };
}

/**
 * Extract features from BOTH resume and JD simultaneously.
 * Returns an enriched map with intersection analysis.
 */
function extractPair(resumeText, jdText) {
  const resumeFeatures = extractFeatures(resumeText, 'resume');
  const jdFeatures     = extractFeatures(jdText, 'jd');

  const sharedSkills   = resumeFeatures.skills.filter(s => jdFeatures.skills.includes(s));
  const missingSkills  = jdFeatures.skills.filter(s => !resumeFeatures.skills.includes(s));
  const bonusSkills    = resumeFeatures.skills.filter(s => !jdFeatures.skills.includes(s));
  const sharedTools    = resumeFeatures.tools.filter(t => jdFeatures.tools.includes(t));
  const missingTools   = jdFeatures.tools.filter(t => !resumeFeatures.tools.includes(t));

  return {
    resume: resumeFeatures,
    jd:     jdFeatures,
    intersection: {
      sharedSkills,
      missingSkills,
      bonusSkills,
      sharedTools,
      missingTools,
      skillCoverage: jdFeatures.skillCount > 0
        ? Math.round((sharedSkills.length / jdFeatures.skillCount) * 100)
        : 0,
      toolCoverage: jdFeatures.toolCount > 0
        ? Math.round((sharedTools.length / jdFeatures.toolCount) * 100)
        : 0,
    },
  };
}

module.exports = {
  extractFeatures,
  extractPair,
  extractSkills,
  extractTools,
  // P17.1 Semantic layer
  extractSemanticConcepts,
  resolveSemanticConcept,
  isSemanticallyEquivalent,
  textContainsConcept,
  SEMANTIC_GROUPS,
};
