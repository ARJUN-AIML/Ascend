/**
 * projectQualityEngine.js — Phase P17.1
 * =======================================
 * Score extracted project signals by:
 *   - Complexity (architecture, integrations)
 *   - Stack Depth (how many tech categories covered)
 *   - Production Readiness (deployment, CI/CD, monitoring)
 *   - Real-World Impact (users, revenue, scale metrics)
 *
 * Output: quality tier + per-project scores
 */

const { ontology } = require('../intelligence/skillOntology');

// ── COMPLEXITY SIGNALS ────────────────────────────────────────────────────────
const COMPLEXITY_SIGNALS = {
  low: [
    'crud', 'todo', 'todo app', 'to-do', 'calculator', 'weather app',
    'static site', 'landing page', 'portfolio', 'clone',
    'tutorial', 'basic app', 'simple app', 'beginner',
  ],
  medium: [
    'authentication', 'auth', 'oauth', 'jwt', 'stripe', 'payment',
    'real-time', 'websocket', 'dashboard', 'rest api', 'rest',
    'full-stack', 'fullstack', 'database', 'admin panel', 'crud api',
    'file upload', 's3', 'email', 'notifications', 'scheduled',
  ],
  high: [
    'microservices', 'distributed', 'kafka', 'event-driven', 'pub-sub',
    'machine learning', 'ai', 'nlp', 'recommendation', 'scaling',
    'kubernetes', 'terraform', 'infrastructure', 'load balancer',
    'multi-tenant', 'saas', 'platform', 'real-time collaborative',
    'blockchain', 'computer vision', 'mlops', 'data pipeline',
    'production ai', 'streaming', 'sharding', 'rate limiting at scale',
  ],
};

// ── DEPLOYMENT SIGNALS ────────────────────────────────────────────────────────
const DEPLOYMENT_SIGNALS = [
  'deployed', 'production', 'live', 'heroku', 'vercel', 'netlify',
  'aws', 'gcp', 'azure', 'digitalocean', 'railway', 'render',
  'docker', 'kubernetes', 'ci/cd', 'github actions', 'jenkins',
  'nginx', 'ec2', 'lambda', 'cloud run', 'app engine',
];

// ── REAL-WORLD IMPACT SIGNALS ─────────────────────────────────────────────────
const IMPACT_SIGNALS = [
  /\d[\d,]*\s*(users?|customers?|clients?)/i,
  /\$[\d,]+[km]?/i,
  /\d+%\s*(reduction|improvement|increase|faster|accuracy)/i,
  /\d+\s*(requests?|rps|queries)\s*(per\s*second|\/s)/i,
  /[\d,]+\s*(daily|monthly|active)/i,
  /open.?source/i,
  /\d+\s*stars?/i,
  /internship|freelance|client\s*project/i,
  /revenue|profit|sales/i,
];

// ── STACK DEPTH CALCULATOR ────────────────────────────────────────────────────
const TECH_CATEGORIES = ['language', 'framework', 'database', 'platform', 'technology', 'tool'];

function calculateStackDepth(projectText) {
  const lower = projectText.toLowerCase();
  const categoriesCovered = new Set();
  const techFound = [];

  for (const [canonical, data] of Object.entries(ontology)) {
    if (!TECH_CATEGORIES.includes(data.type)) continue;
    const toCheck = [canonical, ...(data.aliases || [])].slice(0, 5);
    for (const term of toCheck) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(?<![a-z])${escaped}(?![a-z])`, 'i');
      if (re.test(lower)) {
        categoriesCovered.add(data.category);
        techFound.push(canonical);
        break;
      }
    }
  }

  return { depth: categoriesCovered.size, categories: [...categoriesCovered], techFound };
}

// ── SCORE A SINGLE PROJECT TEXT BLOCK ────────────────────────────────────────
/**
 * Score a single project description string.
 * @param {string} text
 * @returns {ProjectScore}
 */
function scoreProject(text) {
  if (!text || text.length < 10) return null;
  const lower = text.toLowerCase();
  const reasons = [];
  let totalScore = 0;

  // ── Complexity (0–30) ──────────────────────────────────────────
  let complexityScore = 10; // default: unknown / average
  let complexityTier  = 'unknown';

  const hasHigh   = COMPLEXITY_SIGNALS.high.some(s => lower.includes(s));
  const hasMedium = COMPLEXITY_SIGNALS.medium.some(s => lower.includes(s));
  const hasLow    = COMPLEXITY_SIGNALS.low.some(s => lower.includes(s));

  if (hasHigh)        { complexityScore = 30; complexityTier = 'high';   reasons.push('High-complexity architecture signals (+30)'); }
  else if (hasMedium) { complexityScore = 20; complexityTier = 'medium'; reasons.push('Medium-complexity project (+20)'); }
  else if (hasLow)    { complexityScore =  5; complexityTier = 'low';    reasons.push('Low-complexity / tutorial-level project (+5)'); }
  else                { reasons.push('Complexity undetermined (default +10)'); }

  totalScore += complexityScore;

  // ── Stack Depth (0–25) ─────────────────────────────────────────
  const stackData = calculateStackDepth(text);
  let stackPts;
  if (stackData.depth >= 4)      { stackPts = 25; reasons.push(`${stackData.depth} tech categories (excellent stack depth, +25)`); }
  else if (stackData.depth === 3) { stackPts = 18; reasons.push(`${stackData.depth} tech categories (+18)`); }
  else if (stackData.depth === 2) { stackPts = 12; reasons.push(`${stackData.depth} tech categories (+12)`); }
  else if (stackData.depth === 1) { stackPts = 6;  reasons.push('1 tech category (shallow stack, +6)'); }
  else                            { stackPts = 0;  reasons.push('No recognizable tech stack (+0)'); }
  totalScore += stackPts;

  // ── Production Readiness (0–25) ────────────────────────────────
  const depSignals = DEPLOYMENT_SIGNALS.filter(s => lower.includes(s));
  let deployPts;
  if (depSignals.length >= 4)      { deployPts = 25; reasons.push(`Strong deployment indicators: ${depSignals.slice(0,3).join(', ')} (+25)`); }
  else if (depSignals.length >= 2)  { deployPts = 15; reasons.push(`Deployment signals: ${depSignals.join(', ')} (+15)`); }
  else if (depSignals.length === 1) { deployPts = 8;  reasons.push(`Partial deployment: ${depSignals[0]} (+8)`); }
  else                              { deployPts = 0;  reasons.push('No deployment or production signals detected (+0)'); }
  totalScore += deployPts;

  // ── Real-World Impact (0–20) ───────────────────────────────────
  const impactMatches = IMPACT_SIGNALS.filter(re => re.test(text));
  let impactPts;
  if (impactMatches.length >= 3)      { impactPts = 20; reasons.push('Strong real-world impact evidence (+20)'); }
  else if (impactMatches.length >= 2)  { impactPts = 14; reasons.push('Moderate real-world impact (+14)'); }
  else if (impactMatches.length === 1) { impactPts = 7;  reasons.push('Minimal impact signal (+7)'); }
  else                                 { impactPts = 0;  reasons.push('No real-world impact signals (+0)'); }
  totalScore += impactPts;

  const finalScore = Math.min(100, totalScore);

  // ── Quality Tier ───────────────────────────────────────────────
  let tier, tierLabel;
  if (finalScore >= 70)      { tier = 'production'; tierLabel = 'Production-Grade'; }
  else if (finalScore >= 50) { tier = 'intermediate'; tierLabel = 'Intermediate'; }
  else if (finalScore >= 30) { tier = 'basic'; tierLabel = 'Basic'; }
  else                       { tier = 'low'; tierLabel = 'Tutorial / CRUD'; }

  return {
    score: finalScore,
    tier,
    tierLabel,
    complexityTier,
    stackDepth: stackData.depth,
    techFound:  stackData.techFound.slice(0, 8),
    reasons,
  };
}

// ── SCORE ALL PROJECTS FROM RESUME TEXT ──────────────────────────────────────
/**
 * Extract and score all project blocks from resume text.
 * Uses heuristics to split projects if multiple detected.
 */
function scoreProjects(resumeText) {
  // Split by common project delimiters
  const projectBlocks = splitIntoProjects(resumeText);

  if (projectBlocks.length === 0) {
    return {
      projectCount: 0,
      avgScore: 0,
      topScore: 0,
      overallTier: 'none',
      projects: [],
      portfolioStrength: 'No projects detected',
    };
  }

  const scored = projectBlocks
    .map(block => scoreProject(block))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  const avgScore = Math.round(scored.reduce((s, p) => s + p.score, 0) / scored.length);
  const topScore = scored[0]?.score || 0;

  // Overall portfolio tier (based on top project + avg)
  const portfolioScore = Math.round(topScore * 0.6 + avgScore * 0.4);
  let overallTier;
  if (portfolioScore >= 65)      overallTier = 'strong';
  else if (portfolioScore >= 45) overallTier = 'moderate';
  else if (portfolioScore >= 25) overallTier = 'weak';
  else                           overallTier = 'minimal';

  const tierDescriptions = {
    strong:   'Strong portfolio — includes production-grade or deployed projects with measurable impact.',
    moderate: 'Moderate portfolio — some complexity but lacks real-world deployment or impact signals.',
    weak:     'Weak portfolio — projects appear tutorial-level with limited stack depth.',
    minimal:  'Minimal portfolio — insufficient project evidence for evaluation.',
  };

  return {
    projectCount: scored.length,
    avgScore,
    topScore,
    overallTier,
    portfolioStrength: tierDescriptions[overallTier],
    projects: scored,
  };
}

// ── SPLIT RESUME INTO PROJECT BLOCKS ─────────────────────────────────────────
function splitIntoProjects(text) {
  // Try to find a "Projects" section first
  const projectsSection = text.match(/projects?\s*[:\n]([\s\S]{50,2000}?)(?=\n[A-Z][A-Z\s]{3,}:|$)/i);
  const source = projectsSection ? projectsSection[1] : text;

  // Split on patterns: bullet points, numbered items, project headers
  const blocks = source
    .split(/\n(?=[\•\-\*▸►]|\d+[.)]\s|[A-Z][A-Za-z\s]{2,30}(?:\s\||\s[-–]|\s\(|\:))/)
    .map(b => b.trim())
    .filter(b => b.length > 40); // Minimum viable project description

  return blocks.slice(0, 8); // max 8 projects
}

module.exports = { scoreProjects, scoreProject, calculateStackDepth };
