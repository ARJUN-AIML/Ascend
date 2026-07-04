const roleProfiles = {
  "Full Stack MERN Developer": {
    frontend: {
      weight: 20,
      skills: { react: 8, nextjs: 5, redux: 4, tailwind: 3 }
    },
    backend: {
      weight: 25,
      skills: { nodejs: 10, express: 8, "rest api": 5, graphql: 2 }
    },
    database: {
      weight: 20,
      skills: { mongodb: 10, mongoose: 6, redis: 4 }
    },
    systemDesign: {
      weight: 15,
      skills: { caching: 5, "load balancing": 5, microservices: 5 }
    },
    devops: {
      weight: 15,
      skills: { docker: 6, aws: 5, "ci/cd": 4 }
    },
    testing: {
      weight: 5,
      skills: { jest: 3, cypress: 2 }
    }
  },
  "Frontend Engineer": {
    coreFrontend: {
      weight: 35,
      skills: { react: 15, javascript: 10, html: 5, css: 5 }
    },
    advancedUI: {
      weight: 20,
      skills: { nextjs: 8, tailwind: 7, "framer motion": 5 }
    },
    stateManagement: {
      weight: 20,
      skills: { redux: 10, zustand: 5, context: 5 }
    },
    performance: {
      weight: 15,
      skills: { webpack: 6, vite: 5, "core web vitals": 4 }
    },
    testing: {
      weight: 10,
      skills: { jest: 5, cypress: 5 }
    }
  },
  "Backend Engineer": {
    coreBackend: {
      weight: 30,
      skills: { nodejs: 15, express: 10, nestjs: 5 }
    },
    database: {
      weight: 25,
      skills: { postgresql: 10, mongodb: 8, redis: 7 }
    },
    systemDesign: {
      weight: 25,
      skills: { microservices: 10, kafka: 8, "event driven architecture": 7 }
    },
    devops: {
      weight: 15,
      skills: { docker: 6, kubernetes: 5, aws: 4 }
    },
    security: {
      weight: 5,
      skills: { jwt: 2, oauth: 2, helmet: 1 }
    }
  },
  "AIML Engineer": {
    foundations: {
      weight: 20,
      skills: { python: 12, mathematics: 8 }
    },
    dataProcessing: {
      weight: 20,
      skills: { pandas: 8, numpy: 7, sql: 5 }
    },
    machineLearning: {
      weight: 25,
      skills: { "scikit-learn": 10, xgboost: 8, "feature engineering": 7 }
    },
    deepLearning: {
      weight: 25,
      skills: { pytorch: 10, tensorflow: 10, transformers: 5 }
    },
    mlops: {
      weight: 10,
      skills: { mlflow: 4, docker: 3, fastapi: 3 }
    }
  },
  "Data Engineer": {
    coreProgramming: {
      weight: 20,
      skills: { python: 12, scala: 5, java: 3 }
    },
    databases: {
      weight: 25,
      skills: { sql: 10, postgresql: 8, snowflake: 7 }
    },
    bigData: {
      weight: 25,
      skills: { spark: 10, hadoop: 8, kafka: 7 }
    },
    pipelines: {
      weight: 20,
      skills: { airflow: 10, dbt: 6, etl: 4 }
    },
    cloud: {
      weight: 10,
      skills: { aws: 5, gcp: 5 }
    }
  }
};

module.exports = { roleProfiles };
