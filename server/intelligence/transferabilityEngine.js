const transferBonuses = {
  "Data Analyst": {
    "Data Scientist": 8,
    "Machine Learning Engineer": 5,
    "Product Manager": 4
  },
  "Frontend Engineer": {
    "Full Stack Engineer": 12,
    "Backend Engineer": 6,
    "Product Manager": 3
  },
  "Backend Engineer": {
    "Full Stack Engineer": 12,
    "Data Scientist": 5,
    "Machine Learning Engineer": 6
  },
  "Full Stack Engineer": {
    "Frontend Engineer": 10,
    "Backend Engineer": 10,
    "Product Manager": 4
  },
  "Machine Learning Engineer": {
    "Data Scientist": 10,
    "Backend Engineer": 6
  },
  "Data Scientist": {
    "Machine Learning Engineer": 10,
    "Data Analyst": 10,
    "Product Manager": 3
  }
};

function getTransferabilityBonus(currentRole, targetRole) {
  if (!currentRole || !targetRole) return 0;
  
  const current = currentRole.trim();
  const target = targetRole.trim();
  
  if (transferBonuses[current] && transferBonuses[current][target]) {
    return transferBonuses[current][target];
  }
  
  return 0;
}

module.exports = { getTransferabilityBonus };
