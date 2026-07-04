const ontology = {
  // --- Languages ---
  "python": { aliases: ["py", "python3", "python2"], category: "Core Tech", children: ["django", "flask", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "fastapi"], parent: null, type: "language" },
  "javascript": { aliases: ["js", "ecmascript", "es6", "vanilla js"], category: "Core Tech", children: ["react", "node.js", "typescript", "angular", "vue"], parent: null, type: "language" },
  "typescript": { aliases: ["ts", "type script"], category: "Core Tech", children: [], parent: "javascript", type: "language" },
  "java": { aliases: ["java 8", "java 11", "java 17", "core java"], category: "Core Tech", children: ["spring boot", "spring", "hibernate", "maven"], parent: null, type: "language" },
  "c++": { aliases: ["cpp", "c plus plus"], category: "Core Tech", children: [], parent: null, type: "language" },
  "c#": { aliases: ["csharp", ".net", "dotnet", "c-sharp"], category: "Core Tech", children: ["asp.net", "entity framework"], parent: null, type: "language" },
  "go": { aliases: ["golang", "go lang"], category: "Core Tech", children: ["gin"], parent: null, type: "language" },
  "rust": { aliases: ["rustlang"], category: "Core Tech", children: ["cargo"], parent: null, type: "language" },
  "ruby": { aliases: ["ruby on rails", "rails"], category: "Core Tech", children: ["rails"], parent: null, type: "language" },
  "php": { aliases: ["php7", "php8"], category: "Core Tech", children: ["laravel", "symfony", "wordpress"], parent: null, type: "language" },
  "swift": { aliases: ["ios development"], category: "Core Tech", children: ["ios", "uikit", "swiftui"], parent: null, type: "language" },
  "kotlin": { aliases: ["android development"], category: "Core Tech", children: ["android"], parent: null, type: "language" },
  "html": { aliases: ["html5", "markup"], category: "Core Tech", children: ["dom"], parent: null, type: "language" },
  "css": { aliases: ["css3", "styles"], category: "Core Tech", children: ["sass", "less", "tailwind", "bootstrap"], parent: null, type: "language" },
  "bash": { aliases: ["shell", "sh", "zsh", "shell scripting"], category: "Core Tech", children: [], parent: "linux", type: "language" },
  "sql": { aliases: ["structured query language", "mysql", "postgresql", "t-sql", "pl/sql"], category: "Core Tech", children: ["postgresql", "mysql"], parent: null, type: "language" },
  "r": { aliases: ["rlang", "r language"], category: "Core Tech", children: ["shiny"], parent: null, type: "language" },
  "scala": { aliases: [], category: "Core Tech", children: ["spark"], parent: null, type: "language" },

  // --- Frameworks & Libraries (Frontend) ---
  "react": { aliases: ["react.js", "reactjs", "react js"], category: "Frameworks", children: ["hooks", "redux", "context api", "next.js"], parent: "javascript", type: "technology" },
  "angular": { aliases: ["angularjs", "angular 2+", "angular 14"], category: "Frameworks", children: ["rxjs"], parent: "javascript", type: "framework" },
  "vue": { aliases: ["vue.js", "vuejs", "vue 3"], category: "Frameworks", children: ["vuex", "pinia", "nuxt.js"], parent: "javascript", type: "framework" },
  "next.js": { aliases: ["nextjs", "next"], category: "Frameworks", children: [], parent: "react", type: "framework" },
  "nuxt.js": { aliases: ["nuxtjs", "nuxt"], category: "Frameworks", children: [], parent: "vue", type: "framework" },
  "svelte": { aliases: ["svelte.js", "sveltekit"], category: "Frameworks", children: [], parent: "javascript", type: "framework" },
  "tailwind": { aliases: ["tailwindcss", "tailwind css"], category: "Frameworks", children: [], parent: "css", type: "framework" },
  "bootstrap": { aliases: ["twitter bootstrap"], category: "Frameworks", children: [], parent: "css", type: "framework" },
  "sass": { aliases: ["scss"], category: "Core Tech", children: [], parent: "css", type: "language" },
  "material ui": { aliases: ["mui", "material-ui"], category: "Frameworks", children: [], parent: "react", type: "library" },
  "hooks": { aliases: ["react hooks", "useeffect", "usestate", "usecontext"], category: "Frameworks", children: [], parent: "react", type: "concept" },
  "redux": { aliases: ["react-redux", "redux toolkit"], category: "Frameworks", children: [], parent: "react", type: "library" },
  "context api": { aliases: ["react context"], category: "Frameworks", children: [], parent: "react", type: "concept" },
  "rxjs": { aliases: ["reactive extensions"], category: "Frameworks", children: [], parent: "angular", type: "library" },

  // --- Frameworks & Libraries (Backend) ---
  "node.js": { aliases: ["node", "nodejs"], category: "Frameworks", children: ["express", "nest.js"], parent: "javascript", type: "technology" },
  "express": { aliases: ["express.js", "expressjs"], category: "Frameworks", children: [], parent: "node.js", type: "framework" },
  "nest.js": { aliases: ["nestjs"], category: "Frameworks", children: [], parent: "node.js", type: "framework" },
  "django": { aliases: ["django framework"], category: "Frameworks", children: ["django rest framework"], parent: "python", type: "framework" },
  "flask": { aliases: ["flask framework"], category: "Frameworks", children: [], parent: "python", type: "framework" },
  "fastapi": { aliases: ["fast api"], category: "Frameworks", children: [], parent: "python", type: "framework" },
  "spring boot": { aliases: ["spring", "springboot"], category: "Frameworks", children: [], parent: "java", type: "framework" },
  "hibernate": { aliases: ["jpa"], category: "Frameworks", children: [], parent: "java", type: "framework" },
  "laravel": { aliases: ["laravel framework"], category: "Frameworks", children: [], parent: "php", type: "framework" },
  "asp.net": { aliases: ["asp.net core", "aspnet"], category: "Frameworks", children: [], parent: "c#", type: "framework" },
  "entity framework": { aliases: ["ef core"], category: "Frameworks", children: [], parent: "c#", type: "framework" },
  "gin": { aliases: ["gin framework"], category: "Frameworks", children: [], parent: "go", type: "framework" },
  "graphql": { aliases: ["gql"], category: "Architecture", children: ["apollo"], parent: null, type: "technology" },
  "apollo": { aliases: ["apollo server", "apollo client"], category: "Frameworks", children: [], parent: "graphql", type: "library" },
  "grpc": { aliases: ["g-rpc"], category: "Architecture", children: ["protobuf"], parent: null, type: "technology" },
  "rest": { aliases: ["restful api", "api design", "rest api"], category: "Architecture", children: [], parent: null, type: "concept" },

  // --- Databases & Streaming ---
  "databases": { aliases: ["dbms", "database", "rdbms"], category: "Core Tech", children: ["sql", "nosql"], parent: null, type: "concept" },
  "postgresql": { aliases: ["postgres", "psql"], category: "Core Tech", children: [], parent: "sql", type: "database" },
  "mysql": { aliases: ["my sql"], category: "Core Tech", children: [], parent: "sql", type: "database" },
  "mongodb": { aliases: ["mongo", "nosql"], category: "Core Tech", children: [], parent: "nosql", type: "database" },
  "redis": { aliases: ["redis cache", "ioredis"], category: "Architecture", children: [], parent: "caching", type: "database" },
  "elasticsearch": { aliases: ["elastic search", "elk"], category: "Architecture", children: [], parent: null, type: "database" },
  "cassandra": { aliases: ["apache cassandra"], category: "Core Tech", children: [], parent: "nosql", type: "database" },
  "dynamodb": { aliases: ["aws dynamodb", "amazon dynamodb"], category: "Core Tech", children: [], parent: "aws", type: "database" },
  "kafka": { aliases: ["apache kafka", "event streaming"], category: "Architecture", children: [], parent: "system design", type: "technology" },
  "rabbitmq": { aliases: ["rabbit mq", "message queue"], category: "Architecture", children: [], parent: "system design", type: "technology" },
  "caching": { aliases: ["memcached"], category: "Architecture", children: ["redis"], parent: "system design", type: "concept" },

  // --- Cloud & DevOps ---
  "cloud": { aliases: ["cloud computing"], category: "DevOps", children: ["aws", "gcp", "azure"], parent: null, type: "concept" },
  "aws": { aliases: ["amazon web services"], category: "DevOps", children: ["ec2", "s3", "lambda", "rds", "dynamodb"], parent: "cloud", type: "platform" },
  "gcp": { aliases: ["google cloud", "google cloud platform"], category: "DevOps", children: ["bigquery"], parent: "cloud", type: "platform" },
  "azure": { aliases: ["microsoft azure"], category: "DevOps", children: [], parent: "cloud", type: "platform" },
  "docker": { aliases: ["containerization", "containers"], category: "DevOps", children: ["docker-compose"], parent: null, type: "technology" },
  "kubernetes": { aliases: ["k8s", "k3s", "kubectl"], category: "DevOps", children: ["helm"], parent: null, type: "technology" },
  "terraform": { aliases: ["iac", "infrastructure as code", "hashicorp terraform"], category: "DevOps", children: [], parent: "cloud", type: "tool" },
  "ansible": { aliases: ["chef", "puppet"], category: "DevOps", children: [], parent: "linux", type: "tool" },
  "ci/cd": { aliases: ["continuous integration", "continuous deployment", "github actions", "jenkins", "gitlab ci"], category: "DevOps", children: ["jenkins", "github actions"], parent: null, type: "concept" },
  "jenkins": { aliases: ["jenkins ci"], category: "DevOps", children: [], parent: "ci/cd", type: "tool" },
  "github actions": { aliases: ["actions"], category: "DevOps", children: [], parent: "ci/cd", type: "tool" },
  "linux": { aliases: ["unix", "ubuntu", "debian", "centos"], category: "Core Tech", children: ["bash", "shell scripting"], parent: null, type: "concept" },
  "model deployment": { aliases: ["deploying models", "model serving"], category: "DevOps", children: ["mlops"], parent: "machine learning", type: "concept" },
  "mlops": { aliases: ["machine learning operations"], category: "DevOps", children: ["kubeflow"], parent: "machine learning", type: "concept" },
  "kubeflow": { aliases: [], category: "DevOps", children: [], parent: "mlops", type: "tool" },
  "airflow": { aliases: ["apache airflow"], category: "DevOps", children: [], parent: "data engineering", type: "tool" },
  "spark": { aliases: ["apache spark", "pyspark"], category: "Core Tech", children: [], parent: "big data", type: "tool" },
  "hadoop": { aliases: ["apache hadoop", "hdfs"], category: "Core Tech", children: [], parent: "big data", type: "tool" },
  "big data": { aliases: ["big data analytics"], category: "Domain", children: ["spark", "hadoop"], parent: null, type: "concept" },
  "bigquery": { aliases: ["google bigquery"], category: "Core Tech", children: [], parent: "gcp", type: "database" },

  // --- Data Science & Machine Learning ---
  "machine learning": { aliases: ["ml", "machine-learning", "predictive modeling"], category: "Domain", children: ["deep learning", "scikit-learn", "tensorflow", "pytorch", "xgboost"], parent: null, type: "concept" },
  "deep learning": { aliases: ["dl", "neural networks", "cnn", "rnn"], category: "Domain", children: ["tensorflow", "pytorch", "keras"], parent: "machine learning", type: "concept" },
  "scikit-learn": { aliases: ["sklearn"], category: "Frameworks", children: [], parent: "machine learning", type: "library" },
  "tensorflow": { aliases: ["tf"], category: "Frameworks", children: ["keras"], parent: "deep learning", type: "library" },
  "pytorch": { aliases: ["torch"], category: "Frameworks", children: [], parent: "deep learning", type: "library" },
  "keras": { aliases: [], category: "Frameworks", children: [], parent: "tensorflow", type: "library" },
  "xgboost": { aliases: ["gradient boosting", "lightgbm"], category: "Frameworks", children: [], parent: "machine learning", type: "library" },
  "pandas": { aliases: ["pandas library", "dataframes"], category: "Frameworks", children: [], parent: "python", type: "library" },
  "numpy": { aliases: ["num py", "arrays"], category: "Frameworks", children: [], parent: "python", type: "library" },
  "statistics": { aliases: ["stats", "probability", "hypothesis testing"], category: "Domain", children: ["a/b testing"], parent: null, type: "concept" },
  "data analysis": { aliases: ["data analytics", "eda"], category: "Domain", children: ["sql", "excel", "tableau"], parent: null, type: "concept" },
  "data engineering": { aliases: ["etl", "data pipelines"], category: "Domain", children: ["airflow", "spark"], parent: null, type: "concept" },
  "data visualization": { aliases: ["dataviz", "plotting"], category: "Domain", children: ["tableau", "powerbi", "matplotlib", "seaborn"], parent: "data analysis", type: "concept" },
  "tableau": { aliases: ["tableau software"], category: "Domain", children: [], parent: "data visualization", type: "tool" },
  "powerbi": { aliases: ["power bi", "microsoft power bi"], category: "Domain", children: [], parent: "data visualization", type: "tool" },
  "matplotlib": { aliases: ["pyplot"], category: "Domain", children: [], parent: "data visualization", type: "library" },
  "seaborn": { aliases: [], category: "Domain", children: [], parent: "data visualization", type: "library" },
  "computer vision": { aliases: ["cv", "opencv", "image processing"], category: "Domain", children: [], parent: "machine learning", type: "concept" },
  "nlp": { aliases: ["natural language processing", "text mining", "llms", "bert", "gpt"], category: "Domain", children: [], parent: "machine learning", type: "concept" },

  // --- Architecture & Concepts ---
  "system design": { aliases: ["architecture", "software design", "high level design"], category: "Architecture", children: ["microservices", "caching", "kafka"], parent: null, type: "concept" },
  "microservices": { aliases: ["microservice architecture", "distributed systems"], category: "Architecture", children: [], parent: "system design", type: "concept" },
  "dom": { aliases: ["document object model"], category: "Core Tech", children: [], parent: "html", type: "concept" },
  "state management": { aliases: ["state-management", "flux"], category: "Architecture", children: ["redux", "context api"], parent: null, type: "concept" },
  "performance optimization": { aliases: ["optimization", "web performance", "profiling"], category: "Architecture", children: [], parent: null, type: "concept" },
  "responsive design": { aliases: ["mobile-first", "media queries", "adaptive design"], category: "Architecture", children: [], parent: "css", type: "concept" },
  "accessibility": { aliases: ["a11y", "wcag"], category: "Architecture", children: [], parent: "html", type: "concept" },
  "seo": { aliases: ["search engine optimization"], category: "Architecture", children: [], parent: null, type: "concept" },
  "design patterns": { aliases: ["oop patterns", "gang of four"], category: "Architecture", children: [], parent: null, type: "concept" },
  "tdd": { aliases: ["test driven development", "unit testing", "jest", "mocha", "cypress"], category: "DevOps", children: [], parent: null, type: "concept" },

  // --- Tooling & Soft Skills ---
  "agile": { aliases: ["agile methodology", "scrum", "sprints"], category: "Soft Skills", children: ["scrum master", "kanban"], parent: null, type: "concept" },
  "scrum master": { aliases: ["certified scrum master", "csm"], category: "Soft Skills", children: [], parent: "agile", type: "skill" },
  "kanban": { aliases: ["kanban board"], category: "Soft Skills", children: [], parent: "agile", type: "concept" },
  "communication": { aliases: ["verbal communication", "written communication", "presentation skills"], category: "Soft Skills", children: ["stakeholder management"], parent: null, type: "skill" },
  "problem solving": { aliases: ["problem-solving", "analytical skills", "troubleshooting"], category: "Soft Skills", children: [], parent: null, type: "skill" },
  "leadership": { aliases: ["team lead", "mentoring", "managing"], category: "Soft Skills", children: [], parent: null, type: "skill" },
  "teamwork": { aliases: ["collaboration", "cross-functional teams"], category: "Soft Skills", children: [], parent: null, type: "skill" },
  "stakeholder management": { aliases: ["stakeholder communication", "client facing"], category: "Soft Skills", children: [], parent: "communication", type: "skill" },
  "time management": { aliases: ["prioritization"], category: "Soft Skills", children: [], parent: null, type: "skill" },
  "jira": { aliases: ["atlassian jira", "confluence"], category: "Tooling", children: [], parent: "agile", type: "tool" },
  "figma": { aliases: ["ui design", "ux design", "sketch"], category: "Tooling", children: [], parent: null, type: "tool" },
  "git": { aliases: ["github", "gitlab", "bitbucket", "version control"], category: "Tooling", children: [], parent: null, type: "tool" },
  "webpack": { aliases: ["module bundler", "vite", "rollup"], category: "Tooling", children: [], parent: null, type: "tool" },
  "product strategy": { aliases: ["product vision", "product sense"], category: "Domain", children: ["roadmap planning"], parent: null, type: "concept" },
  "user research": { aliases: ["ux research", "customer discovery", "user interviews"], category: "Domain", children: [], parent: null, type: "concept" },
  "roadmap planning": { aliases: ["roadmapping", "product roadmap"], category: "Domain", children: [], parent: "product strategy", type: "concept" },
  "a/b testing": { aliases: ["split testing", "ab testing", "experimentation"], category: "Domain", children: ["experimentation"], parent: "statistics", type: "concept" },
  "experimentation": { aliases: ["multivariate testing"], category: "Domain", children: [], parent: "a/b testing", type: "concept" },
  "marketing": { aliases: ["digital marketing", "growth"], category: "Domain", children: ["go-to-market"], parent: null, type: "concept" },
  "go-to-market": { aliases: ["gtm", "launch strategy"], category: "Domain", children: [], parent: "marketing", type: "concept" },
  "business intelligence": { aliases: ["bi", "looker"], category: "Domain", children: [], parent: "data analysis", type: "concept" },
  "jest": { aliases: ["jestjs", "jest framework"], category: "Tooling", children: [], parent: "tdd", type: "tool" },
  "mocha": { aliases: ["mocha.js", "mochajs"], category: "Tooling", children: [], parent: "tdd", type: "tool" },
  "cypress": { aliases: ["cypress.io", "cypress testing"], category: "Tooling", children: [], parent: "tdd", type: "tool" },
  "selenium": { aliases: ["selenium webdriver", "selenium testing"], category: "Tooling", children: [], parent: "tdd", type: "tool" },
  "vite": { aliases: ["vitejs"], category: "Tooling", children: [], parent: null, type: "tool" },
  "rollup": { aliases: ["rollup.js"], category: "Tooling", children: [], parent: null, type: "tool" },
  "npm": { aliases: ["node package manager"], category: "Tooling", children: [], parent: "node.js", type: "tool" },
  "yarn": { aliases: ["yarnpkg"], category: "Tooling", children: [], parent: "node.js", type: "tool" },
  "pnpm": { aliases: ["performant npm"], category: "Tooling", children: [], parent: "node.js", type: "tool" },
  "tcp/ip": { aliases: ["tcp", "networking", "ip"], category: "Architecture", children: [], parent: null, type: "concept" },
  "http": { aliases: ["http/1.1", "http/2", "http/3"], category: "Architecture", children: [], parent: null, type: "concept" },
  "websockets": { aliases: ["ws", "socket.io"], category: "Architecture", children: [], parent: null, type: "concept" },
  "webrtc": { aliases: ["real time communication", "rtc"], category: "Architecture", children: [], parent: null, type: "concept" },
  "oauth": { aliases: ["oauth2", "oauth 2.0"], category: "Architecture", children: [], parent: "security", type: "concept" },
  "jwt": { aliases: ["json web tokens", "jwts"], category: "Architecture", children: [], parent: "security", type: "concept" },
  "saml": { aliases: ["sso", "single sign on", "saml 2.0"], category: "Architecture", children: [], parent: "security", type: "concept" },
  "security": { aliases: ["cybersecurity", "infosec", "owasp"], category: "Domain", children: ["oauth", "jwt", "saml"], parent: null, type: "concept" },
  "protobuf": { aliases: ["protocol buffers"], category: "Architecture", children: [], parent: "grpc", type: "technology" },
  "celery": { aliases: ["celery task queue", "celery queue"], category: "Architecture", children: [], parent: "python", type: "library" },
  "splunk": { aliases: ["splunk logging"], category: "DevOps", children: [], parent: "observability", type: "tool" },
  "datadog": { aliases: ["data dog"], category: "DevOps", children: [], parent: "observability", type: "tool" },
  "new relic": { aliases: ["newrelic"], category: "DevOps", children: [], parent: "observability", type: "tool" },
  "prometheus": { aliases: ["prometheus monitoring"], category: "DevOps", children: [], parent: "observability", type: "tool" },
  "grafana": { aliases: ["grafana dashboards"], category: "DevOps", children: [], parent: "observability", type: "tool" },
  "observability": { aliases: ["monitoring", "telemetry", "tracing"], category: "DevOps", children: ["datadog", "new relic", "prometheus", "grafana", "splunk"], parent: null, type: "concept" },
  "elk stack": { aliases: ["elk", "elastic stack"], category: "DevOps", children: ["elasticsearch", "logstash", "kibana"], parent: "observability", type: "tool" },
  "kibana": { aliases: ["kibana dashboard"], category: "DevOps", children: [], parent: "elk stack", type: "tool" },
  "logstash": { aliases: ["logstash pipeline"], category: "DevOps", children: [], parent: "elk stack", type: "tool" },
  "nginx": { aliases: ["ngin-x", "reverse proxy"], category: "DevOps", children: [], parent: "linux", type: "tool" },
  "apache": { aliases: ["httpd", "apache server"], category: "DevOps", children: [], parent: "linux", type: "tool" },
  "haproxy": { aliases: ["ha proxy", "load balancing", "load balancer"], category: "DevOps", children: [], parent: "linux", type: "tool" },
  "cloudflare": { aliases: ["cdn", "content delivery network"], category: "DevOps", children: [], parent: null, type: "tool" }
};

function normalizeSkill(skillName) {
  if (!skillName) return null;
  const lower = skillName.toLowerCase().trim();
  
  if (ontology[lower]) return lower;
  
  for (const [canonical, data] of Object.entries(ontology)) {
    if (data.aliases.includes(lower)) {
      return canonical;
    }
  }
  return lower; 
}

function getSkillPrerequisites(skillName) {
  const normalized = normalizeSkill(skillName);
  if (!normalized || !ontology[normalized]) return [];
  const parent = ontology[normalized].parent;
  return parent ? [parent] : [];
}

module.exports = { ontology, normalizeSkill, getSkillPrerequisites };
