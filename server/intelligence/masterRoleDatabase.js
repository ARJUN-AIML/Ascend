const masterRoleDatabase = {
  // ============================================
  // SOFTWARE ENGINEERING
  // ============================================
  "Frontend Engineer": {
    category: "Software Engineering",
    domains: {
      core: { weight: 40, skills: { javascript: 10, typescript: 8, react: 10, html: 5, css: 5 } },
      frameworks: { weight: 25, skills: { nextjs: 10, vuejs: 8, angular: 8 } },
      styling: { weight: 15, skills: { tailwind: 8, sass: 5, "framer motion": 4 } },
      tools: { weight: 10, skills: { webpack: 5, vite: 5, jest: 5, cypress: 5 } },
      advanced: { weight: 10, skills: { "core web vitals": 5, accessibility: 5, graphql: 4 } }
    },
    seniority: {
      Fresher: { requiredWeight: 30, focus: ["core"] },
      Junior: { requiredWeight: 50, focus: ["core", "frameworks"] },
      Mid: { requiredWeight: 70, focus: ["core", "frameworks", "tools", "styling"] },
      Senior: { requiredWeight: 85, focus: ["core", "frameworks", "advanced", "tools"] }
    }
  },
  "Backend Engineer": {
    category: "Software Engineering",
    domains: {
      core: { weight: 35, skills: { nodejs: 10, python: 10, java: 10, go: 10, "rest api": 8 } },
      database: { weight: 25, skills: { postgresql: 10, mongodb: 8, mysql: 8, redis: 7 } },
      architecture: { weight: 20, skills: { microservices: 10, "event driven architecture": 8, graphql: 6 } },
      devops: { weight: 10, skills: { docker: 8, aws: 7 } },
      advanced: { weight: 10, skills: { kafka: 8, kubernetes: 7, caching: 6, "system design": 10 } }
    },
    seniority: {
      Fresher: { requiredWeight: 30, focus: ["core", "database"] },
      Junior: { requiredWeight: 50, focus: ["core", "database"] },
      Mid: { requiredWeight: 70, focus: ["core", "database", "architecture", "devops"] },
      Senior: { requiredWeight: 85, focus: ["core", "database", "architecture", "advanced"] }
    }
  },
  "Full Stack Engineer": {
    category: "Software Engineering",
    domains: {
      frontend: { weight: 25, skills: { javascript: 10, react: 10, typescript: 8, html: 5, css: 5 } },
      backend: { weight: 25, skills: { nodejs: 10, python: 8, java: 8, "rest api": 8 } },
      database: { weight: 20, skills: { postgresql: 10, mongodb: 8, redis: 5 } },
      devops: { weight: 15, skills: { docker: 8, aws: 7, "ci/cd": 6 } },
      systemDesign: { weight: 15, skills: { microservices: 8, caching: 5 } }
    },
    seniority: {
      Fresher: { requiredWeight: 35, focus: ["frontend", "backend", "database"] },
      Junior: { requiredWeight: 55, focus: ["frontend", "backend", "database"] },
      Mid: { requiredWeight: 75, focus: ["frontend", "backend", "database", "devops"] },
      Senior: { requiredWeight: 85, focus: ["frontend", "backend", "database", "devops", "systemDesign"] }
    }
  },
  "MERN Developer": {
    category: "Software Engineering",
    domains: {
      frontend: { weight: 30, skills: { react: 15, javascript: 10, tailwind: 5 } },
      backend: { weight: 30, skills: { nodejs: 15, express: 10, "rest api": 5 } },
      database: { weight: 20, skills: { mongodb: 12, mongoose: 8 } },
      tools: { weight: 20, skills: { git: 5, docker: 5, aws: 5, "ci/cd": 5 } }
    },
    seniority: {
      Fresher: { requiredWeight: 30, focus: ["frontend", "backend", "database"] },
      Junior: { requiredWeight: 55, focus: ["frontend", "backend", "database"] },
      Mid: { requiredWeight: 75, focus: ["frontend", "backend", "database", "tools"] },
      Senior: { requiredWeight: 90, focus: ["frontend", "backend", "database", "tools"] }
    }
  },
  "Java Developer": {
    category: "Software Engineering",
    domains: {
      core: { weight: 35, skills: { java: 15, "spring boot": 12, hibernate: 8 } },
      database: { weight: 25, skills: { postgresql: 10, mysql: 10, oracle: 8 } },
      architecture: { weight: 20, skills: { microservices: 10, "rest api": 8, kafka: 7 } },
      tools: { weight: 20, skills: { maven: 5, gradle: 5, docker: 5, junit: 5 } }
    },
    seniority: {
      Fresher: { requiredWeight: 35, focus: ["core", "database"] },
      Junior: { requiredWeight: 55, focus: ["core", "database"] },
      Mid: { requiredWeight: 75, focus: ["core", "database", "architecture", "tools"] },
      Senior: { requiredWeight: 90, focus: ["core", "database", "architecture", "tools"] }
    }
  },
  "Python Developer": {
    category: "Software Engineering",
    domains: {
      core: { weight: 35, skills: { python: 15, django: 10, fastapi: 8, flask: 7 } },
      database: { weight: 25, skills: { postgresql: 10, redis: 8, mongodb: 5 } },
      architecture: { weight: 20, skills: { "rest api": 10, celery: 7, microservices: 7 } },
      tools: { weight: 20, skills: { docker: 8, pytest: 6, aws: 6 } }
    },
    seniority: {
      Fresher: { requiredWeight: 30, focus: ["core", "database"] },
      Junior: { requiredWeight: 55, focus: ["core", "database"] },
      Mid: { requiredWeight: 75, focus: ["core", "database", "architecture"] },
      Senior: { requiredWeight: 90, focus: ["core", "database", "architecture", "tools"] }
    }
  },

  // ============================================
  // AI / ML / DATA
  // ============================================
  "AIML Engineer": {
    category: "AI / ML / Data",
    domains: {
      core: { weight: 25, skills: { python: 12, mathematics: 8, "data structures": 5 } },
      ml: { weight: 30, skills: { pytorch: 12, tensorflow: 10, "scikit-learn": 8 } },
      nlp_cv: { weight: 25, skills: { llms: 10, transformers: 10, "computer vision": 8, opencv: 5 } },
      mlops: { weight: 20, skills: { docker: 7, mlflow: 6, aws: 5, fastapi: 5 } }
    },
    seniority: {
      Fresher: { requiredWeight: 30, focus: ["core", "ml"] },
      Junior: { requiredWeight: 50, focus: ["core", "ml"] },
      Mid: { requiredWeight: 75, focus: ["core", "ml", "nlp_cv", "mlops"] },
      Senior: { requiredWeight: 90, focus: ["core", "ml", "nlp_cv", "mlops"] }
    }
  },
  "ML Engineer": {
    category: "AI / ML / Data",
    domains: {
      core: { weight: 25, skills: { python: 12, sql: 8, "c++": 5 } },
      ml: { weight: 30, skills: { pytorch: 12, tensorflow: 10, "scikit-learn": 8 } },
      deployment: { weight: 25, skills: { docker: 8, kubernetes: 8, fastapi: 5, triton: 4 } },
      mlops: { weight: 20, skills: { mlflow: 7, kubeflow: 7, aws: 6 } }
    },
    seniority: {
      Fresher: { requiredWeight: 30, focus: ["core", "ml"] },
      Junior: { requiredWeight: 50, focus: ["core", "ml", "deployment"] },
      Mid: { requiredWeight: 75, focus: ["core", "ml", "deployment", "mlops"] },
      Senior: { requiredWeight: 90, focus: ["core", "ml", "deployment", "mlops"] }
    }
  },
  "Data Scientist": {
    category: "AI / ML / Data",
    domains: {
      math: { weight: 25, skills: { statistics: 12, probability: 8, "linear algebra": 5 } },
      programming: { weight: 25, skills: { python: 12, r: 8, sql: 8 } },
      analysis: { weight: 25, skills: { pandas: 10, numpy: 8, matplotlib: 5, seaborn: 4 } },
      ml: { weight: 25, skills: { "scikit-learn": 10, xgboost: 8, "feature engineering": 7 } }
    },
    seniority: {
      Fresher: { requiredWeight: 35, focus: ["math", "programming", "analysis"] },
      Junior: { requiredWeight: 55, focus: ["math", "programming", "analysis", "ml"] },
      Mid: { requiredWeight: 75, focus: ["math", "programming", "analysis", "ml"] },
      Senior: { requiredWeight: 90, focus: ["math", "programming", "analysis", "ml"] }
    }
  },
  "Data Analyst": {
    category: "AI / ML / Data",
    domains: {
      sql: { weight: 35, skills: { sql: 15, postgresql: 10, mysql: 5 } },
      viz: { weight: 30, skills: { tableau: 12, powerbi: 12, looker: 6 } },
      tools: { weight: 20, skills: { excel: 10, python: 8, pandas: 5 } },
      business: { weight: 15, skills: { "ab testing": 8, "data storytelling": 7 } }
    },
    seniority: {
      Fresher: { requiredWeight: 35, focus: ["sql", "tools"] },
      Junior: { requiredWeight: 55, focus: ["sql", "viz", "tools"] },
      Mid: { requiredWeight: 75, focus: ["sql", "viz", "tools", "business"] },
      Senior: { requiredWeight: 85, focus: ["sql", "viz", "tools", "business"] }
    }
  },
  "Data Engineer": {
    category: "AI / ML / Data",
    domains: {
      core: { weight: 25, skills: { python: 10, scala: 8, java: 6, sql: 10 } },
      bigdata: { weight: 25, skills: { spark: 12, hadoop: 8, kafka: 7 } },
      warehousing: { weight: 25, skills: { snowflake: 10, bigquery: 8, redshift: 8 } },
      pipelines: { weight: 25, skills: { airflow: 10, dbt: 8, "ci/cd": 5, aws: 5 } }
    },
    seniority: {
      Fresher: { requiredWeight: 35, focus: ["core", "warehousing"] },
      Junior: { requiredWeight: 55, focus: ["core", "warehousing", "pipelines"] },
      Mid: { requiredWeight: 75, focus: ["core", "bigdata", "warehousing", "pipelines"] },
      Senior: { requiredWeight: 90, focus: ["core", "bigdata", "warehousing", "pipelines"] }
    }
  },
  "MLOps Engineer": {
    category: "AI / ML / Data",
    domains: {
      devops: { weight: 30, skills: { docker: 10, kubernetes: 10, "ci/cd": 8, terraform: 5 } },
      ml: { weight: 25, skills: { python: 10, pytorch: 8, tensorflow: 8 } },
      pipelines: { weight: 25, skills: { mlflow: 10, kubeflow: 8, airflow: 5 } },
      cloud: { weight: 20, skills: { aws: 10, gcp: 8, azure: 6 } }
    },
    seniority: {
      Fresher: { requiredWeight: 35, focus: ["devops", "ml"] },
      Junior: { requiredWeight: 55, focus: ["devops", "ml", "pipelines"] },
      Mid: { requiredWeight: 75, focus: ["devops", "ml", "pipelines", "cloud"] },
      Senior: { requiredWeight: 90, focus: ["devops", "ml", "pipelines", "cloud"] }
    }
  },

  // ============================================
  // CLOUD / INFRA
  // ============================================
  "DevOps Engineer": {
    category: "Cloud / Infra",
    domains: {
      ci_cd: { weight: 25, skills: { jenkins: 10, "github actions": 8, gitlab: 6 } },
      containers: { weight: 25, skills: { docker: 12, kubernetes: 12 } },
      iac: { weight: 25, skills: { terraform: 12, ansible: 10, cloudformation: 5 } },
      cloud_monitoring: { weight: 25, skills: { aws: 10, prometheus: 8, grafana: 6, linux: 8 } }
    },
    seniority: {
      Fresher: { requiredWeight: 35, focus: ["cloud_monitoring", "ci_cd"] },
      Junior: { requiredWeight: 55, focus: ["cloud_monitoring", "ci_cd", "containers"] },
      Mid: { requiredWeight: 75, focus: ["cloud_monitoring", "ci_cd", "containers", "iac"] },
      Senior: { requiredWeight: 90, focus: ["cloud_monitoring", "ci_cd", "containers", "iac"] }
    }
  },
  "Cloud Engineer": {
    category: "Cloud / Infra",
    domains: {
      providers: { weight: 40, skills: { aws: 15, gcp: 10, azure: 10 } },
      networking: { weight: 20, skills: { vpc: 8, dns: 5, "load balancing": 5, linux: 5 } },
      iac: { weight: 20, skills: { terraform: 12, cloudformation: 8 } },
      security: { weight: 20, skills: { iam: 10, kms: 5, security: 5 } }
    },
    seniority: {
      Fresher: { requiredWeight: 35, focus: ["providers", "networking"] },
      Junior: { requiredWeight: 55, focus: ["providers", "networking", "security"] },
      Mid: { requiredWeight: 75, focus: ["providers", "networking", "security", "iac"] },
      Senior: { requiredWeight: 85, focus: ["providers", "networking", "security", "iac"] }
    }
  },
  "Site Reliability Engineer": {
    category: "Cloud / Infra",
    domains: {
      coding: { weight: 25, skills: { python: 10, go: 10, bash: 8 } },
      systems: { weight: 25, skills: { linux: 12, networking: 8, "operating systems": 5 } },
      observability: { weight: 25, skills: { prometheus: 10, grafana: 8, datadog: 8, elk: 5 } },
      resilience: { weight: 25, skills: { kubernetes: 10, terraform: 8, "incident management": 8 } }
    },
    seniority: {
      Fresher: { requiredWeight: 40, focus: ["coding", "systems"] },
      Junior: { requiredWeight: 60, focus: ["coding", "systems", "observability"] },
      Mid: { requiredWeight: 80, focus: ["coding", "systems", "observability", "resilience"] },
      Senior: { requiredWeight: 95, focus: ["coding", "systems", "observability", "resilience"] }
    }
  },
  "Platform Engineer": {
    category: "Cloud / Infra",
    domains: {
      coding: { weight: 30, skills: { go: 12, python: 10, rust: 5 } },
      orchestration: { weight: 30, skills: { kubernetes: 15, helm: 10, argocd: 5 } },
      iac: { weight: 25, skills: { terraform: 12, crossplane: 8 } },
      cloud: { weight: 15, skills: { aws: 10, gcp: 5 } }
    },
    seniority: {
      Fresher: { requiredWeight: 40, focus: ["coding", "cloud"] },
      Junior: { requiredWeight: 60, focus: ["coding", "orchestration", "cloud"] },
      Mid: { requiredWeight: 80, focus: ["coding", "orchestration", "iac", "cloud"] },
      Senior: { requiredWeight: 95, focus: ["coding", "orchestration", "iac", "cloud"] }
    }
  },

  // ============================================
  // SECURITY
  // ============================================
  "Security Analyst": {
    category: "Security",
    domains: {
      monitoring: { weight: 35, skills: { splunk: 12, siem: 10, wireshark: 8 } },
      threat: { weight: 30, skills: { "threat hunting": 10, "incident response": 10, malware: 5 } },
      networks: { weight: 20, skills: { tcpip: 8, firewalls: 8, linux: 5 } },
      compliance: { weight: 15, skills: { iso27001: 5, soc2: 5, nist: 5 } }
    },
    seniority: {
      Fresher: { requiredWeight: 35, focus: ["monitoring", "networks"] },
      Junior: { requiredWeight: 55, focus: ["monitoring", "networks", "threat"] },
      Mid: { requiredWeight: 75, focus: ["monitoring", "networks", "threat"] },
      Senior: { requiredWeight: 85, focus: ["monitoring", "networks", "threat", "compliance"] }
    }
  },
  "Security Engineer": {
    category: "Security",
    domains: {
      appsec: { weight: 35, skills: { owasp: 12, sast: 8, dast: 8, cryptography: 5 } },
      cloudsec: { weight: 25, skills: { "aws security": 10, iam: 10, cspm: 5 } },
      automation: { weight: 20, skills: { python: 10, bash: 8, "ci/cd security": 5 } },
      infra: { weight: 20, skills: { linux: 8, kubernetes: 8, network: 5 } }
    },
    seniority: {
      Fresher: { requiredWeight: 40, focus: ["appsec", "infra"] },
      Junior: { requiredWeight: 60, focus: ["appsec", "infra", "automation"] },
      Mid: { requiredWeight: 80, focus: ["appsec", "infra", "automation", "cloudsec"] },
      Senior: { requiredWeight: 95, focus: ["appsec", "infra", "automation", "cloudsec"] }
    }
  },
  "Penetration Tester": {
    category: "Security",
    domains: {
      offensive: { weight: 35, skills: { kali: 10, metasploit: 10, burpsuite: 10 } },
      recon: { weight: 25, skills: { nmap: 10, osint: 8, wireshark: 5 } },
      scripting: { weight: 20, skills: { python: 10, bash: 8, powershell: 5 } },
      exploitation: { weight: 20, skills: { "web exploitation": 10, "network exploitation": 8, "privilege escalation": 5 } }
    },
    seniority: {
      Fresher: { requiredWeight: 40, focus: ["offensive", "recon"] },
      Junior: { requiredWeight: 60, focus: ["offensive", "recon", "scripting"] },
      Mid: { requiredWeight: 80, focus: ["offensive", "recon", "scripting", "exploitation"] },
      Senior: { requiredWeight: 95, focus: ["offensive", "recon", "scripting", "exploitation"] }
    }
  },

  // ============================================
  // MOBILE
  // ============================================
  "Android Developer": {
    category: "Mobile",
    domains: {
      core: { weight: 40, skills: { kotlin: 15, java: 10, "android sdk": 15 } },
      ui: { weight: 25, skills: { "jetpack compose": 12, xml: 8, "material design": 5 } },
      architecture: { weight: 20, skills: { mvvm: 10, dagger: 5, hilt: 5, coroutines: 5 } },
      tools: { weight: 15, skills: { gradle: 8, retrofit: 8, room: 5 } }
    },
    seniority: {
      Fresher: { requiredWeight: 35, focus: ["core", "ui"] },
      Junior: { requiredWeight: 55, focus: ["core", "ui", "tools"] },
      Mid: { requiredWeight: 75, focus: ["core", "ui", "tools", "architecture"] },
      Senior: { requiredWeight: 90, focus: ["core", "ui", "tools", "architecture"] }
    }
  },
  "iOS Developer": {
    category: "Mobile",
    domains: {
      core: { weight: 40, skills: { swift: 15, objectivec: 5, "ios sdk": 15 } },
      ui: { weight: 25, skills: { swiftui: 15, uikit: 10 } },
      architecture: { weight: 20, skills: { mvvm: 10, combine: 8, coredata: 5 } },
      tools: { weight: 15, skills: { xcode: 10, cocoapods: 5, fastlane: 5 } }
    },
    seniority: {
      Fresher: { requiredWeight: 35, focus: ["core", "ui"] },
      Junior: { requiredWeight: 55, focus: ["core", "ui", "tools"] },
      Mid: { requiredWeight: 75, focus: ["core", "ui", "tools", "architecture"] },
      Senior: { requiredWeight: 90, focus: ["core", "ui", "tools", "architecture"] }
    }
  },
  "Flutter Developer": {
    category: "Mobile",
    domains: {
      core: { weight: 45, skills: { flutter: 20, dart: 15 } },
      state: { weight: 25, skills: { provider: 8, bloc: 10, riverpod: 8 } },
      backend: { weight: 15, skills: { firebase: 10, "rest api": 5 } },
      tools: { weight: 15, skills: { "ci/cd": 5, git: 5, testing: 5 } }
    },
    seniority: {
      Fresher: { requiredWeight: 35, focus: ["core"] },
      Junior: { requiredWeight: 55, focus: ["core", "state"] },
      Mid: { requiredWeight: 75, focus: ["core", "state", "backend"] },
      Senior: { requiredWeight: 90, focus: ["core", "state", "backend", "tools"] }
    }
  },
  "React Native Developer": {
    category: "Mobile",
    domains: {
      core: { weight: 40, skills: { "react native": 15, javascript: 10, typescript: 10 } },
      state: { weight: 25, skills: { redux: 10, context: 5, zustand: 5 } },
      native: { weight: 20, skills: { ios: 8, android: 8, expo: 5 } },
      tools: { weight: 15, skills: { "rest api": 8, firebase: 5, "ci/cd": 5 } }
    },
    seniority: {
      Fresher: { requiredWeight: 35, focus: ["core"] },
      Junior: { requiredWeight: 55, focus: ["core", "state"] },
      Mid: { requiredWeight: 75, focus: ["core", "state", "native"] },
      Senior: { requiredWeight: 90, focus: ["core", "state", "native", "tools"] }
    }
  }
};

module.exports = { masterRoleDatabase };
