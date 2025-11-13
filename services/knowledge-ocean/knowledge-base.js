// Comprehensive Knowledge Base for Azora OS AI Systems
// This enables AI capabilities without external API dependencies

module.exports = {
  // EDUCATION & LEARNING
  education: {
    mathematics: {
      arithmetic: {
        addition: "Addition combines numbers. Example: 5 + 3 = 8. Properties: commutative (a+b=b+a), associative ((a+b)+c=a+(b+c)), identity (a+0=a)",
        subtraction: "Subtraction finds difference. Example: 10 - 4 = 6. Not commutative. Inverse of addition",
        multiplication: "Multiplication is repeated addition. 4 × 3 = 12 means 4 added 3 times. Properties: commutative, associative, distributive",
        division: "Division splits into equal parts. 12 ÷ 3 = 4. Inverse of multiplication. Cannot divide by zero"
      },
      algebra: {
        variables: "Variables represent unknown values. x, y, z commonly used. Example: x + 5 = 10, solve for x = 5",
        equations: "Equations show equality. Linear: ax + b = c. Quadratic: ax² + bx + c = 0. Solve by isolating variable",
        functions: "Functions map inputs to outputs. f(x) = 2x + 1. Domain is inputs, range is outputs"
      },
      geometry: {
        shapes: "Circle: πr². Square: s². Rectangle: l×w. Triangle: ½bh. Sphere: 4πr³/3. Cube: s³",
        angles: "Right angle: 90°. Straight: 180°. Full rotation: 360°. Complementary: sum to 90°. Supplementary: sum to 180°",
        theorems: "Pythagorean: a² + b² = c² for right triangles. Sum of angles in triangle: 180°"
      }
    },
    science: {
      physics: {
        motion: "Speed = distance/time. Acceleration = change in velocity/time. Newton's laws: 1) Inertia 2) F=ma 3) Action-reaction",
        energy: "Kinetic: ½mv². Potential: mgh. Conservation: energy cannot be created or destroyed, only transformed",
        electricity: "Voltage (V), Current (I), Resistance (R). Ohm's Law: V = IR. Power: P = VI"
      },
      chemistry: {
        atoms: "Protons (+), Neutrons (neutral), Electrons (-). Atomic number = protons. Mass number = protons + neutrons",
        molecules: "H2O (water), CO2 (carbon dioxide), O2 (oxygen), NaCl (salt). Chemical bonds: ionic, covalent, metallic",
        reactions: "Reactants → Products. Conservation of mass. Types: synthesis, decomposition, combustion, redox"
      },
      biology: {
        cells: "Basic unit of life. Prokaryotic (no nucleus) vs Eukaryotic (has nucleus). Organelles: nucleus, mitochondria, ribosomes",
        genetics: "DNA carries genetic info. A-T, G-C base pairs. Genes code for proteins. Inheritance: dominant/recessive traits",
        ecology: "Food chain: producers → consumers → decomposers. Ecosystems: biotic + abiotic factors. Energy flow, nutrient cycles"
      }
    },
    languages: {
      english: {
        grammar: "Parts of speech: noun, verb, adjective, adverb, pronoun, preposition, conjunction, interjection. Sentence: subject + predicate",
        writing: "Essay structure: introduction, body paragraphs, conclusion. Thesis statement guides argument. Evidence supports claims",
        literature: "Genres: fiction, non-fiction, poetry, drama. Elements: plot, character, setting, theme, conflict, resolution"
      },
      programming: {
        concepts: "Variables store data. Functions perform tasks. Loops repeat actions. Conditionals make decisions. Arrays hold lists",
        languages: "Python: easy syntax, versatile. JavaScript: web development. Java: object-oriented. C++: performance. SQL: databases",
        algorithms: "Sorting: bubble, merge, quick. Searching: linear, binary. Data structures: arrays, lists, trees, graphs, hash tables"
      }
    }
  },

  // TECHNOLOGY & COMPUTING
  technology: {
    webDevelopment: {
      html: "Structure: <html><head><title></title></head><body><h1>Heading</h1><p>Paragraph</p></body></html>. Semantic tags improve accessibility",
      css: "Styling: selectors {property: value;}. Box model: margin, border, padding, content. Flexbox and Grid for layouts",
      javascript: "Dynamic behavior. DOM manipulation. Events: click, submit, load. Async: promises, async/await. ES6+: arrow functions, destructuring"
    },
    databases: {
      sql: "SELECT * FROM table WHERE condition. INSERT INTO table VALUES. UPDATE table SET. DELETE FROM table. JOIN combines tables",
      nosql: "MongoDB: document store. Redis: key-value. Cassandra: wide-column. Neo4j: graph. Use cases vary by data structure needs",
      design: "Normalization reduces redundancy. Primary keys uniquely identify. Foreign keys create relationships. Indexes speed queries"
    },
    ai: {
      machineLearning: "Supervised: labeled data. Unsupervised: find patterns. Reinforcement: learn by rewards. Neural networks: layers of nodes",
      nlp: "Tokenization splits text. Embeddings represent words as vectors. Transformers: attention mechanism. Tasks: classification, generation, translation",
      applications: "Computer vision: image recognition. Speech: transcription, synthesis. Recommendation systems. Predictive analytics"
    }
  },

  // BUSINESS & FINANCE
  business: {
    economics: {
      basics: "Supply and demand determine price. Scarcity creates value. Opportunity cost: next best alternative. Markets allocate resources",
      macro: "GDP measures economy size. Inflation: rising prices. Unemployment types: frictional, structural, cyclical. Fiscal and monetary policy",
      micro: "Elasticity: price sensitivity. Market structures: perfect competition, monopoly, oligopoly. Profit = Revenue - Costs"
    },
    finance: {
      personal: "Budget: income - expenses. Emergency fund: 3-6 months expenses. Compound interest: A = P(1+r)^t. Diversify investments",
      investing: "Stocks: ownership shares. Bonds: loans to entities. ETFs: diversified funds. Risk vs return tradeoff. Long-term growth",
      accounting: "Assets = Liabilities + Equity. Income statement: revenues - expenses = profit. Cash flow: operating, investing, financing"
    },
    management: {
      leadership: "Vision, communication, delegation, motivation. Styles: autocratic, democratic, laissez-faire. Emotional intelligence matters",
      strategy: "SWOT: Strengths, Weaknesses, Opportunities, Threats. Porter's 5 Forces. Competitive advantage: cost leadership or differentiation",
      operations: "Efficiency: output/input. Quality control. Supply chain management. Lean principles: eliminate waste, continuous improvement"
    }
  },

  // HEALTH & WELLNESS
  health: {
    nutrition: {
      macros: "Carbs: 4 cal/g, energy source. Protein: 4 cal/g, builds tissue. Fats: 9 cal/g, hormones and energy. Balance all three",
      vitamins: "A: vision. B: energy. C: immune. D: bones. E: antioxidant. K: blood clotting. Water-soluble (B,C) vs fat-soluble (A,D,E,K)",
      hydration: "Water: 8 glasses/day guideline. More if active. Electrolytes: sodium, potassium. Dehydration affects performance"
    },
    fitness: {
      cardio: "Aerobic exercise. Strengthens heart. Burns calories. Examples: running, cycling, swimming. 150 min/week recommended",
      strength: "Resistance training builds muscle. Progressive overload. Major groups: chest, back, legs, shoulders, arms, core",
      flexibility: "Stretching improves range of motion. Static vs dynamic. Yoga combines strength and flexibility. Prevents injury"
    },
    mental: {
      stress: "Fight or flight response. Chronic stress harmful. Management: exercise, meditation, sleep, social support, time management",
      sleep: "7-9 hours for adults. REM and deep sleep stages. Circadian rhythm. Sleep hygiene: dark, cool, consistent schedule",
      mindfulness: "Present moment awareness. Meditation reduces anxiety. Deep breathing activates parasympathetic nervous system"
    }
  },

  // HISTORY & CULTURE
  history: {
    ancient: {
      civilizations: "Egypt: pyramids, pharaohs, Nile. Greece: democracy, philosophy, Olympics. Rome: republic, empire, law. China: dynasties, Great Wall",
      inventions: "Wheel: 3500 BCE. Writing: Sumerians 3200 BCE. Agriculture: 10000 BCE. Bronze: 3300 BCE. Iron: 1200 BCE",
      philosophy: "Socrates: know thyself. Plato: forms, ideal state. Aristotle: logic, ethics. Confucius: harmony, respect"
    },
    modern: {
      industrial: "1760-1840. Steam engine, factories, urbanization. Changed production, transportation, society. Child labor, pollution issues",
      world_wars: "WWI: 1914-1918, trench warfare, Treaty of Versailles. WWII: 1939-1945, Holocaust, atomic bombs, UN formed",
      digital: "1950s: computers. 1970s: personal computers. 1990s: internet. 2000s: smartphones. 2010s: AI, social media dominance"
    }
  },

  // PRACTICAL SKILLS
  skills: {
    communication: {
      speaking: "Clear articulation. Appropriate pace. Eye contact. Body language. Organize thoughts: intro, main points, conclusion",
      writing: "Clarity and conciseness. Active voice. Proofread. Structure: paragraphs with topic sentences. Audience awareness",
      listening: "Active listening: focus, don't interrupt. Paraphrase to confirm. Ask clarifying questions. Empathy and understanding"
    },
    problemSolving: {
      steps: "1) Define problem clearly. 2) Gather information. 3) Generate solutions. 4) Evaluate options. 5) Implement. 6) Review results",
      techniques: "Brainstorming: quantity over quality initially. Root cause analysis: 5 whys. SWOT analysis. Mind mapping. Break into smaller parts",
      critical: "Question assumptions. Evaluate evidence. Consider alternatives. Identify biases. Logic: deductive and inductive reasoning"
    },
    timeManagement: {
      prioritization: "Eisenhower matrix: urgent/important. Focus on important, not just urgent. 80/20 rule: 20% effort yields 80% results",
      planning: "Set SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound. Break into tasks. Schedule blocks. Review progress",
      productivity: "Pomodoro: 25 min work, 5 min break. Eliminate distractions. Batch similar tasks. Delegate when possible. Say no to non-essentials"
    }
  },

  // UBUNTU PHILOSOPHY & VALUES
  ubuntu: {
    principles: {
      core: "I am because we are. Humanity towards others. Collective prosperity. Individual sovereignty multiplied through community",
      values: "Compassion, respect, dignity, solidarity, cooperation. Success of one enables success of all. Shared humanity",
      practice: "Listen deeply. Share knowledge. Support others. Celebrate together. Resolve conflicts peacefully. Build consensus"
    },
    education: {
      approach: "Collaborative learning. Peer teaching. Knowledge as community resource. Success measured collectively. Mentorship culture",
      assessment: "Growth mindset. Learn from mistakes. Progress over perfection. Multiple intelligences. Holistic development"
    },
    economics: {
      model: "Proof-of-Knowledge rewards learning. Shared prosperity. Fair distribution. Community investment. Sustainable growth",
      currency: "AZR token. Earned through education. Circulates in ecosystem. Enables transactions. Rewards contribution"
    }
  },

  // AZORA ECOSYSTEM
  azora: {
    services: {
      education: "Azora Education: student management. Azora LMS: courses. Azora Sapiens: AI tutoring. Azora Assessment: testing",
      financial: "Azora Mint: wallet, mining. Azora Pay: payments. Billing: subscriptions. Lending: micro-loans. Exchange: currency conversion",
      marketplace: "Azora Forge: job matching. Skills marketplace. Career services. Project collaboration. Dispute resolution"
    },
    technology: {
      architecture: "Microservices. Event-driven. API gateway. Service mesh. Database per service. Prisma ORM. PostgreSQL",
      ai: "Elara: mother AI. Family system: 11 characters. Tutoring engine. Learning paths. Assessment generation. Context awareness",
      blockchain: "Proof-of-Knowledge. Certificate verification. Transaction ledger. Smart contracts. Decentralized governance"
    },
    identity: {
      gem: "Tri-unity crystal. Sapphire: technology. Emerald: education. Ruby: finance. Ubuntu core: unity",
      sankofa: "Return and get it. Learn from past. Build future. Collective intelligence. Prosperity circulation. Constitutional protection",
      family: "Elara, Sankofa, Themba, Naledi, Jabari, Amara, Kofi, Zola, Abeni, Thembo, Nexus. Each with unique personality and role"
    }
  },

  // QUICK REFERENCE
  quickRef: {
    formulas: {
      math: "Area circle: πr². Pythagorean: a²+b²=c². Quadratic: x=(-b±√(b²-4ac))/2a. Compound interest: A=P(1+r/n)^(nt)",
      physics: "F=ma. E=mc². v=d/t. KE=½mv². PE=mgh. P=W/t. V=IR. λf=c",
      chemistry: "PV=nRT. pH=-log[H+]. Molarity=mol/L. Avogadro: 6.02×10²³"
    },
    conversions: {
      length: "1 km = 1000 m = 0.621 mi. 1 m = 100 cm = 3.28 ft. 1 in = 2.54 cm",
      mass: "1 kg = 1000 g = 2.205 lb. 1 lb = 16 oz = 453.6 g",
      temperature: "C = (F-32)×5/9. F = C×9/5+32. K = C+273.15"
    },
    constants: {
      physics: "Speed of light: 3×10⁸ m/s. Gravity: 9.8 m/s². Planck: 6.626×10⁻³⁴ J·s",
      math: "π ≈ 3.14159. e ≈ 2.71828. φ ≈ 1.61803 (golden ratio)"
    }
  }
};
