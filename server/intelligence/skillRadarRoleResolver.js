const roleAliases = {
  "mern": "Full Stack MERN Developer",
  "full stack": "Full Stack MERN Developer",
  "fullstack": "Full Stack MERN Developer",
  "react": "Frontend Engineer",
  "frontend": "Frontend Engineer",
  "backend": "Backend Engineer",
  "node": "Backend Engineer",
  "aiml": "AIML Engineer",
  "ai": "AIML Engineer",
  "machine learning": "AIML Engineer",
  "data": "Data Engineer"
};

const resolveRoleAlias = (inputRole) => {
  if (!inputRole) return "Full Stack MERN Developer";
  const normalized = inputRole.toLowerCase().trim();
  
  if (roleAliases[normalized]) {
    return roleAliases[normalized];
  }

  for (const [alias, canonicalRole] of Object.entries(roleAliases)) {
    if (normalized.includes(alias)) {
      return canonicalRole;
    }
  }
  
  return "Full Stack MERN Developer";
};

module.exports = { resolveRoleAlias, roleAliases };
