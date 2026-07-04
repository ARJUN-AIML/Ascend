const { masterRoleDatabase } = require('./masterRoleDatabase');

const roleAliases = {
  // Software Engineering
  "mern": "MERN Developer",
  "full stack": "Full Stack Engineer",
  "fullstack": "Full Stack Engineer",
  "frontend": "Frontend Engineer",
  "front-end": "Frontend Engineer",
  "ui dev": "Frontend Engineer",
  "backend": "Backend Engineer",
  "back-end": "Backend Engineer",
  "node": "Backend Engineer",
  "java": "Java Developer",
  "python dev": "Python Developer",
  "django dev": "Python Developer",

  // AI / ML / Data
  "ai": "AIML Engineer",
  "artificial intelligence": "AIML Engineer",
  "aiml": "AIML Engineer",
  "machine learning": "ML Engineer",
  "ml engineer": "ML Engineer",
  "data scientist": "Data Scientist",
  "data science": "Data Scientist",
  "data analyst": "Data Analyst",
  "data engineer": "Data Engineer",
  "big data": "Data Engineer",
  "mlops": "MLOps Engineer",

  // Cloud / Infra
  "devops": "DevOps Engineer",
  "cloud": "Cloud Engineer",
  "aws engineer": "Cloud Engineer",
  "sre": "Site Reliability Engineer",
  "site reliability": "Site Reliability Engineer",
  "platform": "Platform Engineer",
  "infra": "Cloud Engineer",

  // Security
  "security analyst": "Security Analyst",
  "soc analyst": "Security Analyst",
  "security engineer": "Security Engineer",
  "cybersecurity": "Security Engineer",
  "infosec": "Security Engineer",
  "pentester": "Penetration Tester",
  "penetration tester": "Penetration Tester",
  "ethical hacker": "Penetration Tester",

  // Mobile
  "android": "Android Developer",
  "ios": "iOS Developer",
  "swift": "iOS Developer",
  "flutter": "Flutter Developer",
  "react native": "React Native Developer",
  "mobile": "Android Developer" // Fallback for generic mobile
};

const resolveRoleAndSeniority = (inputRole) => {
  if (!inputRole) return { canonicalRole: "Full Stack Engineer", seniority: "Mid" };
  
  const normalized = inputRole.toLowerCase().trim();
  
  // 1. Detect Seniority
  let seniority = "Mid";
  if (normalized.includes("fresher") || normalized.includes("intern") || normalized.includes("entry")) {
    seniority = "Fresher";
  } else if (normalized.includes("junior") || normalized.includes("jr")) {
    seniority = "Junior";
  } else if (normalized.includes("senior") || normalized.includes("sr") || normalized.includes("lead") || normalized.includes("staff")) {
    seniority = "Senior";
  }

  // 2. Resolve Role
  let canonicalRole = null;

  // Direct exact match checking actual DB keys
  const dbKeys = Object.keys(masterRoleDatabase);
  for (const key of dbKeys) {
    if (normalized.includes(key.toLowerCase())) {
      canonicalRole = key;
      break;
    }
  }

  // Check aliases
  if (!canonicalRole) {
    for (const [alias, roleName] of Object.entries(roleAliases)) {
      if (normalized.includes(alias)) {
        canonicalRole = roleName;
        break;
      }
    }
  }
  
  // Fallback
  if (!canonicalRole) {
    canonicalRole = "Full Stack Engineer";
  }

  return { canonicalRole, seniority };
};

module.exports = { resolveRoleAndSeniority, roleAliases };
