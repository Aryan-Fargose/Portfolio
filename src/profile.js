/**
 * Aryan Fargose - Personal Profile & Content Configuration
 * 
 * Edit this configuration file to update personal details, projects,
 * links, skills, and certifications without touching the animation engine.
 */

export const profile = {
  personal: {
    name: "Aryan Fargose",
    fullName: "Aryan Anand Fargose",
    tagline: "IT ENGINEERING STUDENT · BUILDER · CREATOR · TECHNOLOGY ENTHUSIAST",
    headline: "Transforming ambitious ideas into clean, cinematic, and functional digital reality.",
    college: "Dwarkadas J. Sanghvi College of Engineering",
    collegeShort: "DJSCE, Mumbai",
    degree: "B.Tech in Information Technology",
    year: "B.Tech IT",
    graduationYear: "2029",
    location: "Mumbai, India",
    phone: "+91 83698 94256",
    bio: "I am a B.Tech Information Technology student (2025 — 2029) at Dwarkadas J. Sanghvi College of Engineering (DJSCE) with a strong foundation in C, Java, and Python. Passionate about engineering high-performance software, sleek interactive interfaces, and student-first utility platforms. I love dissecting complex technical problems down to first principles and turning creative concepts into production code.",
    motto: "BUILD • LEARN • EXPLORE • REPEAT"
  },

  socials: {
    github: "https://github.com/Aryan-Fargose",
    linkedin: "https://www.linkedin.com/in/aryan-fargose-b99330387",
    email: "aryanfargose@gmail.com",
    collegeEmail: "aryan.fargose@djsce.ac.in",
    phone: "+91 83698 94256"
  },

  resume: {
    downloadUrl: "/Aryan_Fargose_Resume.pdf",
    filename: "Aryan_Fargose_Resume.pdf",
    lastUpdated: "April 2026",
    cgpa: "8.79",
    cetPercentile: "98.4901 Percentile",
    hsc: "St. Rocks Jr. College, Mumbai (2023–2025)",
    school: "Notre Dame School, Mumbai (2023)",
    certification: "Python Programming Fundamentals (Microsoft / Coursera · April 2026)",
    competitiveProgramming: "CodeChef (Beginner Division)"
  },

  education: {
    institution: "Dwarkadas J. Sanghvi College of Engineering",
    degree: "Bachelor of Technology — Information Technology",
    timeline: "2025 — 2029 (Undergraduate)",
    cgpa: "8.79",
    cetPercentile: "98.4901 Percentile",
    priorEducation: [
      { institution: "St. Rocks Jr. College, Mumbai", degree: "HSC (PCM)", timeline: "2023 — 2025" },
      { institution: "Notre Dame School, Mumbai", degree: "CBSE Class X", timeline: "2023" }
    ],
    location: "Vile Parle, Mumbai",
    status: "Active Undergraduate",
    coursework: [
      "Data Structures & Algorithms",
      "Object Oriented Programming (Java/C++)",
      "Database Management Systems",
      "Computer Networks",
      "Operating Systems & Systems Architecture",
      "Discrete Mathematics & Logic"
    ],
    highlights: [
      "Core focus on algorithmic problem solving and web systems engineering",
      "Active contributor to student tech projects and campus platforms",
      "Building practical software solutions for everyday college workflows"
    ]
  },

  projects: [
    {
      id: "campushub",
      title: "CAMPUSHUB",
      subtitle: "Flagship Ongoing Project",
      tagline: "A magical all-in-one campus companion platform for students.",
      description: "A student-focused platform engineered specifically around daily college life at DJSCE. CampusHub unifies academic resources, social interactions, campus utilities, and recreational breaks into one seamless, responsive digital hub.",
      featured: true,
      badge: "FEATURED & ACTIVE",
      status: "Actively Developing",
      technologies: ["React", "Node.js", "Vite", "Modern CSS", "RESTful APIs", "LocalStorage"],
      features: [
        { name: "Canteen Menus", detail: "Real-time, interactive college cafeteria menus and daily specials" },
        { name: "Attendance Calculator", detail: "Smart 75% attendance projection and bunks-left forecasting" },
        { name: "Anonymous Confessions", detail: "Safe, moderated campus confession wall for student voices" },
        { name: "Game Zone", detail: "Instant browser mini-games for casual breaks between lectures" },
        { name: "Study Material Hub", detail: "Organized notes, pyqs, and semester syllabus repository" },
        { name: "Student Utilities", detail: "GPA calculators, timetable viewer, and campus survival tools" }
      ],
      github: "https://github.com/Aryan-Fargose/CampusHub",
      liveDemo: "https://campus-hub-delta-green.vercel.app/",
      color: "#38bdf8"
    },
    {
      id: "gitsearch",
      title: "GITSEARCH",
      subtitle: "GitHub Intelligence Engine",
      tagline: "Instant developer profile analysis, repository exploration, and stats discovery.",
      description: "A high-performance web application built using React + Vite, engineered with a sharp focus on clean minimalist UI, instant responsiveness, and buttery-smooth user experience for querying GitHub developer ecosystems.",
      featured: true,
      badge: "PRODUCTION READY",
      status: "Completed",
      technologies: ["React", "Vite", "JavaScript (ES6+)", "GitHub REST API", "CSS3 Flex/Grid"],
      features: [
        { name: "Instant Profile Lookup", detail: "Real-time user intelligence, bio, follower ratios, and badges" },
        { name: "Repository Breakdown", detail: "Live language distribution, star metrics, and fork telemetry" },
        { name: "Fluid Dark Experience", detail: "Engineered with modern glassmorphic surfaces and zero lag" },
        { name: "Deep Link Navigation", detail: "Instant one-click traversal into public source repositories" }
      ],
      github: "https://github.com/Aryan-Fargose/GitSearch",
      liveDemo: "https://git-search-rouge.vercel.app/",
      color: "#60a5fa"
    },
    {
      id: "coding-practice",
      title: "ALGORITHMS & DSA PRACTICE",
      subtitle: "Problem Solving Repository",
      tagline: "Algorithmic thinking, data structures, and computational patterns.",
      description: "A continuous repository of competitive programming challenges, algorithmic implementations, and data structures coded in C, Java, and Python.",
      featured: false,
      badge: "CONTINUOUS",
      status: "Ongoing",
      technologies: ["C", "Java", "Python", "Data Structures", "Algorithms"],
      features: [
        { name: "Core DSA", detail: "Trees, Graphs, Dynamic Programming, Sorting & Searching" },
        { name: "Time/Space Optimization", detail: "High-efficiency implementations with low asymptotic complexity" }
      ],
      github: "https://github.com/Aryan-Fargose/coding-practice",
      liveDemo: null,
      color: "#a78bfa"
    }
  ],

  skills: {
    categories: [
      {
        name: "PROGRAMMING",
        description: "Core computational foundations and languages",
        skills: ["C", "Java", "Python", "JavaScript (ES6+)", "Data Structures & Algorithms"]
      },
      {
        name: "WEB DEVELOPMENT",
        description: "Modern frontend and interface engineering",
        skills: ["HTML5", "CSS3 / Modern CSS", "React", "Vite", "RESTful APIs", "Responsive Design"]
      },
      {
        name: "AI & CREATIVE TECH",
        description: "Emerging intelligence and interactive tooling",
        skills: ["Prompt Engineering", "AI Coding Assistants", "Creative Code", "Workflow Automation"]
      },
      {
        name: "DESIGN & AESTHETICS",
        description: "Visual balance, typography, and UX",
        skills: ["UI/UX Principles", "Cinematic Dark Modes", "Glassmorphism", "Micro-animations", "Visual Hierarchy"]
      },
      {
        name: "ANIMATION & GRAPHICS",
        description: "High-framerate rendering and interaction",
        skills: ["HTML5 Canvas", "Scroll-Scrubbed Image Sequences", "requestAnimationFrame", "Anime.js", "CSS Transitions"]
      },
      {
        name: "DEVELOPMENT TOOLS",
        description: "Developer environment and version control",
        skills: ["Git", "GitHub", "Visual Studio Code", "Node.js / npm", "PowerShell", "Browser DevTools"]
      }
    ]
  },

  componentMetaphors: [
    {
      component: "CPU",
      label: "Central Processing Unit",
      metaphor: "Problem Solving & Algorithmic Logic",
      description: "Breaking down complex real-world challenges into pure computational logic, systematic data structures, and optimized step-by-step algorithms.",
      metric: "High Clock Speed • Multithreaded Thinking"
    },
    {
      component: "GPU",
      label: "Graphics Processing Unit",
      metaphor: "Creativity & Visual Computing",
      description: "Rendering beautiful interactive interfaces, cinematic color palettes, and rich visual aesthetics with high-performance execution.",
      metric: "Parallel Innovation • Pixel Precision"
    },
    {
      component: "RAM",
      label: "System Memory",
      metaphor: "High-Bandwidth Multitasking",
      description: "Effortlessly juggling academics, project development, sports, creative hobbies, and continuous tech exploration without bottlenecks.",
      metric: "Zero Latency • Dynamic Context Switching"
    },
    {
      component: "SSD",
      label: "Solid State Drive",
      metaphor: "Projects & Persistent Knowledge",
      description: "Storing architectural insights, codebases, learned principles, and project memories with instant read/write retrieval.",
      metric: "Durable Knowledge • High-Throughput Storage"
    },
    {
      component: "Motherboard",
      label: "Logic Board",
      metaphor: "Interconnected Systems Architecture",
      description: "Connecting design, logic, backend APIs, data structures, and user experience into one unified, cohesive digital experience.",
      metric: "Universal Bus • Seamless Integration"
    },
    {
      component: "Keyboard",
      label: "Input System",
      metaphor: "Ideas Becoming Production Code",
      description: "The physical tactile conduit where mental models and innovative concepts are typed into living, functional software.",
      metric: "Precision Keystrokes • Tactile Execution"
    },
    {
      component: "Display",
      label: "Retina Panel",
      metaphor: "Cinema & Visual Storytelling",
      description: "A deep appreciation for cinematic lighting, artistic framing, visual narrative pacing, and presentation craft.",
      metric: "Color Calibrated • High Contrast"
    },
    {
      component: "Speakers",
      label: "Acoustic Chambers",
      metaphor: "Rhythm, Flow State & Music",
      description: "Music fuels my locked-in programming rhythm. Soundwaves keep focus razor-sharp during deep late-night coding sprints.",
      metric: "Acoustic Resonance • Steady Cadence"
    },
    {
      component: "Cooling System",
      label: "Dual Fans & Heat Pipes",
      metaphor: "Staying Composed Under Pressure",
      description: "Remaining calm, collected, and analytically clear under tight hackathon deadlines, exam weeks, and demanding bug hunts.",
      metric: "Thermal Equilibrium • Quiet Resilience"
    },
    {
      component: "Battery",
      label: "Lithium Polymer Cells",
      metaphor: "Persistence & Relentless Drive",
      description: "The enduring energy to iterate, refactor, debug, and push projects across the finish line no matter the obstacles.",
      metric: "Long-Range Endurance • Unstoppable Momentum"
    },
    {
      component: "IDEA CORE",
      label: "The Creative Nucleus",
      metaphor: "IDEA → CODE → DESIGN → BUILD → SHIP",
      description: "The conceptual spark at the center of everything. Where curiosity meets technical rigor to forge things that didn't exist before.",
      metric: "Continuous Genesis • Pure Innovation"
    }
  ],

  interests: [
    {
      title: "MUSIC",
      tagline: "The Soundtrack to Deep Work",
      description: "Music is integral to my daily rhythm. Whether powering through complex algorithmic logic or crafting fluid CSS animations, high-focus beats, soundtracks, and melodic rhythm anchor my concentration.",
      badge: "FLOW STATE ENGINE",
      icon: "waveform"
    },
    {
      title: "MOVIES / CINEMA",
      tagline: "Visual Storytelling & Direction",
      description: "A keen passion for cinema — studying visual pacing, dramatic lighting, framing, sound design, and emotional resonance. I translate that cinematic visual care directly into modern web design.",
      badge: "VISUAL INSPIRATION",
      icon: "film"
    },
    {
      title: "CRICKET",
      tagline: "Strategy, Precision & Team Dynamics",
      description: "Playing cricket sharpens tactical patience, reading game momentum, split-second reflexes, and working in tight harmony with teammates.",
      badge: "TEAM SPORT",
      icon: "cricket"
    },
    {
      title: "FOOTBALL",
      tagline: "Pace, Spatial Awareness & Fluidity",
      description: "Football teaches rapid spatial orientation, off-the-ball positioning, endurance, and decisive passing under tight pressure.",
      badge: "AGILITY & PACE",
      icon: "football"
    },
    {
      title: "RUNNING & FITNESS",
      tagline: "Endurance & Physical Discipline",
      description: "Regular running grounds my daily routine, builds mental toughness, and clears mental clutter for creative engineering breakthroughs.",
      badge: "DAILY DISCIPLINE",
      icon: "run"
    },
    {
      title: "CREATIVE TECH EXPERIMENTS",
      tagline: "Prototyping What's Next",
      description: "Constantly playing with new tools, exploring bleeding-edge web APIs, testing AI capabilities, and tinkering with hardware-inspired interfaces.",
      badge: "CONTINUOUS CURIOSITY",
      icon: "cpu"
    }
  ],

  certifications: [
    {
      title: "B.Tech Information Technology (Undergraduate)",
      issuer: "Dwarkadas J. Sanghvi College of Engineering",
      date: "2023 — Present",
      credentialUrl: "https://www.djsce.ac.in",
      verified: true
    },
    {
      title: "Data Structures & Software Development Track",
      issuer: "Academic Engineering Curriculum",
      date: "2024",
      credentialUrl: "#", // Editable placeholder
      verified: true
    },
    {
      title: "Modern Full-Stack & Web Engineering",
      issuer: "Self-Directed Projects & Repositories",
      date: "2024",
      credentialUrl: "https://github.com/Aryan-Fargose",
      verified: true
    }
  ],

  aspirations: {
    title: "WHAT'S NEXT?",
    statement: "I am driven to grow into a world-class IT and software engineer. My goal is to build impactful, robust digital products that bridge technical engineering excellence with unforgettable interactive design.",
    pillars: [
      {
        heading: "Engineered for Real Impact",
        body: "Building practical software like CampusHub that simplifies daily life for students and communities."
      },
      {
        heading: "Combining Tech & Cinematic Art",
        body: "Proving that developer portfolios and web applications can feel as breathtaking and immersive as high-budget cinema."
      },
      {
        heading: "Mastering Emerging Systems",
        body: "Diving deeper into AI agents, scalable cloud architectures, and next-generation interactive computing."
      },
      {
        heading: "Relentless Lifelong Learning",
        body: "Embracing curiosity, learning from every bug, and continually shipping projects with pride."
      }
    ]
  },

  contact: {
    heading: "LET'S BUILD SOMETHING.",
    subheading: "Whether you have an ambitious project idea, an internship opportunity, or just want to connect over technology, cricket, or cinema — my inbox is always open.",
    callToAction: "Reach Out Directly"
  }
};
