const domains = {
  "SaaS": {
    weightModifiers: {
      critical: 1.1,
      important: 1.0,
      optional: 1.0
    },
    benchmarkThresholds: { fresher: 40, junior: 60, mid: 75, senior: 85 },
    skillBoosts: ["react", "node.js", "aws", "docker", "agile", "ci/cd"]
  },
  "FinTech": {
    weightModifiers: {
      critical: 1.3,
      important: 1.1,
      optional: 0.8
    },
    benchmarkThresholds: { fresher: 50, junior: 65, mid: 80, senior: 90 },
    skillBoosts: ["java", "c++", "sql", "postgresql", "statistics", "kubernetes"]
  },
  "Healthcare": {
    weightModifiers: {
      critical: 1.2,
      important: 1.0,
      optional: 1.0
    },
    benchmarkThresholds: { fresher: 45, junior: 60, mid: 75, senior: 85 },
    skillBoosts: ["python", "data analysis", "sql", "machine learning"]
  },
  "E-commerce": {
    weightModifiers: {
      critical: 1.0,
      important: 1.0,
      optional: 1.2
    },
    benchmarkThresholds: { fresher: 40, junior: 55, mid: 70, senior: 80 },
    skillBoosts: ["javascript", "react", "caching", "redis", "seo"]
  },
  "Enterprise": {
    weightModifiers: {
      critical: 1.2,
      important: 1.2,
      optional: 1.0
    },
    benchmarkThresholds: { fresher: 50, junior: 65, mid: 80, senior: 90 },
    skillBoosts: ["java", "c#", "kubernetes", "system design", "microservices", "docker"]
  },
  "Gaming": {
    weightModifiers: {
      critical: 1.1,
      important: 1.0,
      optional: 1.0
    },
    benchmarkThresholds: { fresher: 45, junior: 60, mid: 75, senior: 85 },
    skillBoosts: ["c++", "c#", "performance optimization", "mathematics"]
  }
};

function getDomainContext(domainStr) {
  if (!domainStr) return domains["SaaS"]; 
  
  const normalized = domainStr.toLowerCase().trim();
  const matchedKey = Object.keys(domains).find(k => k.toLowerCase() === normalized);
  
  if (matchedKey) return domains[matchedKey];
  return domains["SaaS"];
}

module.exports = { getDomainContext, domains };
