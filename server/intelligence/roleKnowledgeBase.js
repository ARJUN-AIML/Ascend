const roles = {
  "Frontend Engineer": {
    roleDefining: ["javascript", "react", "html", "css"],
    critical: ["javascript", "react", "html", "css", "typescript", "dom"],
    important: ["redux", "state management", "performance optimization", "webpack", "responsive design", "accessibility"],
    optional: ["graphql", "next.js", "tailwind", "figma", "node.js"],
    categoryMapping: { 
      "Core Tech": 0.30, 
      "Frameworks": 0.25, 
      "Architecture": 0.10, 
      "DevOps": 0.10, 
      "Soft Skills": 0.15,
      "Domain": 0.10
    },
    hardCaps: { 3: 50, 5: 35 } // e.g. missing 3 critical -> 50 cap
  },
  "Backend Engineer": {
    roleDefining: ["node.js", "sql", "databases", "api design"],
    critical: ["node.js", "sql", "databases", "api design", "rest"],
    important: ["python", "java", "docker", "caching", "redis", "postgresql", "system design", "microservices"],
    optional: ["kubernetes", "aws", "gcp", "graphql", "ci/cd"],
    categoryMapping: { 
      "Core Tech": 0.30, 
      "Architecture": 0.30, 
      "DevOps": 0.20, 
      "Frameworks": 0.10, 
      "Soft Skills": 0.10
    },
    hardCaps: { 3: 50, 5: 35 }
  },
  "Full Stack Engineer": {
    roleDefining: ["javascript", "react", "node.js", "sql"],
    critical: ["javascript", "react", "node.js", "sql", "api design"],
    important: ["typescript", "docker", "system design", "css", "postgresql", "aws", "html"],
    optional: ["kubernetes", "next.js", "redis", "ci/cd", "graphql"],
    categoryMapping: { 
      "Core Tech": 0.40, 
      "Frameworks": 0.20, 
      "Architecture": 0.20, 
      "DevOps": 0.10, 
      "Soft Skills": 0.10
    },
    hardCaps: { 3: 50, 5: 35 }
  },
  "Machine Learning Engineer": {
    roleDefining: ["python", "machine learning", "scikit-learn", "statistics"],
    critical: ["python", "machine learning", "scikit-learn", "statistics", "pandas", "numpy", "tensorflow", "pytorch", "docker", "mlops"],
    important: ["sql", "model deployment", "deep learning"],
    optional: ["aws", "gcp", "kubernetes", "c++"],
    categoryMapping: { 
      "Core Tech": 0.25, 
      "Frameworks": 0.25, 
      "Architecture": 0.15, 
      "DevOps": 0.15, 
      "Soft Skills": 0.10,
      "Domain": 0.10
    },
    hardCaps: { 3: 50, 5: 35 }
  },
  "Data Scientist": {
    roleDefining: ["python", "sql", "statistics", "pandas"],
    critical: ["python", "sql", "statistics", "data analysis", "pandas"],
    important: ["machine learning", "data visualization", "tableau", "numpy", "a/b testing", "scikit-learn"],
    optional: ["r", "bigquery", "spark", "hadoop", "deep learning"],
    categoryMapping: { 
      "Core Tech": 0.25, 
      "Math & Concepts": 0.25, 
      "Visualization": 0.20, 
      "ML": 0.15, 
      "Business": 0.15
    },
    hardCaps: { 3: 50, 5: 35 }
  },
  "Product Manager": {
    roleDefining: ["product strategy", "agile", "user research", "roadmap planning"],
    critical: ["product strategy", "agile", "user research", "roadmap planning", "communication"],
    important: ["data analysis", "jira", "sql", "a/b testing", "stakeholder management", "wireframing"],
    optional: ["figma", "python", "scrum master", "marketing", "go-to-market"],
    categoryMapping: { 
      "Soft Skills": 0.40, 
      "Domain": 0.30, 
      "Core Tech": 0.10, 
      "Architecture": 0.10, 
      "Frameworks": 0.10
    },
    hardCaps: { 3: 50, 5: 35 }
  }
};

module.exports = { roles };
