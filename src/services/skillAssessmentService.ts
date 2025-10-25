/**
 * Skill Assessment Service
 * Manages skill assessments, questions, and progress tracking
 */

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  skills: Skill[];
  averageScore?: number;
  completed: boolean;
  marketDemand: number; // 1-100 scale
  salaryImpact: number; // percentage impact on salary
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: number; // in minutes
  questions: number;
  score?: number;
  completed: boolean;
  category: string;
  marketValue: number; // 1-100 scale
  prerequisites: string[];
  learningResources: LearningResource[];
}

export interface LearningResource {
  title: string;
  type: 'video' | 'article' | 'course' | 'documentation';
  url: string;
  duration?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  skillId: string;
  tags: string[];
}

export interface AssessmentResult {
  skillId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  completedAt: Date;
  weakAreas: string[];
  strengths: string[];
}

class SkillAssessmentService {
  private static instance: SkillAssessmentService;
  private assessmentResults: Map<string, AssessmentResult[]> = new Map();

  public static getInstance(): SkillAssessmentService {
    if (!SkillAssessmentService.instance) {
      SkillAssessmentService.instance = new SkillAssessmentService();
    }
    return SkillAssessmentService.instance;
  }

  // Get comprehensive skill categories with market data
  getSkillCategories(): SkillCategory[] {
    return [
      {
        id: 'frontend',
        name: 'Frontend Development',
        description: 'Modern web development technologies and frameworks',
        icon: 'Code',
        marketDemand: 95,
        salaryImpact: 25,
        completed: false,
        skills: [
          {
            id: 'react',
            name: 'React.js',
            description: 'Component-based UI library with hooks and state management',
            difficulty: 'Intermediate',
            estimatedTime: 25,
            questions: 20,
            completed: false,
            category: 'frontend',
            marketValue: 90,
            prerequisites: ['javascript', 'html', 'css'],
            learningResources: [
              {
                title: 'React Official Documentation',
                type: 'documentation',
                url: 'https://react.dev',
                difficulty: 'Intermediate'
              },
              {
                title: 'React Complete Course',
                type: 'course',
                url: '#',
                duration: '12 hours',
                difficulty: 'Beginner'
              }
            ]
          },
          {
            id: 'javascript',
            name: 'Modern JavaScript (ES6+)',
            description: 'Advanced JavaScript features and best practices',
            difficulty: 'Intermediate',
            estimatedTime: 20,
            questions: 15,
            completed: false,
            category: 'frontend',
            marketValue: 95,
            prerequisites: [],
            learningResources: [
              {
                title: 'JavaScript MDN Guide',
                type: 'documentation',
                url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
                difficulty: 'Beginner'
              }
            ]
          },
          {
            id: 'typescript',
            name: 'TypeScript',
            description: 'Static typing for JavaScript applications',
            difficulty: 'Advanced',
            estimatedTime: 30,
            questions: 25,
            completed: false,
            category: 'frontend',
            marketValue: 85,
            prerequisites: ['javascript'],
            learningResources: [
              {
                title: 'TypeScript Official Documentation',
                type: 'documentation',
                url: 'https://www.typescriptlang.org/docs/',
                difficulty: 'Beginner'
              },
              {
                title: 'TypeScript Handbook',
                type: 'documentation',
                url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
                difficulty: 'Intermediate'
              },
              {
                title: 'TypeScript Deep Dive',
                type: 'article',
                url: 'https://basarat.gitbook.io/typescript/',
                difficulty: 'Advanced'
              },
              {
                title: 'TypeScript Tutorial - Programming with Mosh',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=d56mG7DezGs',
                duration: '1h 48m',
                difficulty: 'Beginner'
              }
            ]
          }
        ]
      },
      {
        id: 'backend',
        name: 'Backend Development',
        description: 'Server-side development and API design',
        icon: 'Server',
        marketDemand: 90,
        salaryImpact: 30,
        completed: false,
        skills: [
          {
            id: 'nodejs',
            name: 'Node.js',
            description: 'Server-side JavaScript runtime and ecosystem',
            difficulty: 'Intermediate',
            estimatedTime: 25,
            questions: 20,
            completed: false,
            category: 'backend',
            marketValue: 88,
            prerequisites: ['javascript'],
            learningResources: [
              {
                title: 'Node.js Official Documentation',
                type: 'documentation',
                url: 'https://nodejs.org/en/docs/',
                difficulty: 'Beginner'
              },
              {
                title: 'Node.js Getting Started Guide',
                type: 'documentation',
                url: 'https://nodejs.org/en/docs/guides/getting-started-guide/',
                difficulty: 'Beginner'
              },
              {
                title: 'Express.js Official Guide',
                type: 'documentation',
                url: 'https://expressjs.com/en/guide/routing.html',
                difficulty: 'Intermediate'
              },
              {
                title: 'Node.js Complete Course - freeCodeCamp',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=RLtyhwFtXQA',
                duration: '8h 16m',
                difficulty: 'Beginner'
              }
            ]
          },
          {
            id: 'python',
            name: 'Python',
            description: 'Versatile programming language for web and data science',
            difficulty: 'Beginner',
            estimatedTime: 20,
            questions: 15,
            completed: false,
            category: 'backend',
            marketValue: 92,
            prerequisites: [],
            learningResources: [
              {
                title: 'Python Official Documentation',
                type: 'documentation',
                url: 'https://docs.python.org/3/',
                difficulty: 'Beginner'
              },
              {
                title: 'Python Tutorial - python.org',
                type: 'documentation',
                url: 'https://docs.python.org/3/tutorial/',
                difficulty: 'Beginner'
              },
              {
                title: 'Django Official Documentation',
                type: 'documentation',
                url: 'https://docs.djangoproject.com/en/stable/',
                difficulty: 'Intermediate'
              },
              {
                title: 'Python for Everybody - University of Michigan',
                type: 'course',
                url: 'https://www.coursera.org/specializations/python',
                difficulty: 'Beginner'
              }
            ]
          },
          {
            id: 'databases',
            name: 'Database Design',
            description: 'SQL, NoSQL, and database optimization',
            difficulty: 'Intermediate',
            estimatedTime: 30,
            questions: 25,
            completed: false,
            category: 'backend',
            marketValue: 80,
            prerequisites: [],
            learningResources: [
              {
                title: 'MySQL Official Documentation',
                type: 'documentation',
                url: 'https://dev.mysql.com/doc/',
                difficulty: 'Intermediate'
              },
              {
                title: 'PostgreSQL Documentation',
                type: 'documentation',
                url: 'https://www.postgresql.org/docs/',
                difficulty: 'Intermediate'
              },
              {
                title: 'MongoDB Manual',
                type: 'documentation',
                url: 'https://docs.mongodb.com/manual/',
                difficulty: 'Intermediate'
              },
              {
                title: 'SQL Tutorial - W3Schools',
                type: 'documentation',
                url: 'https://www.w3schools.com/sql/',
                difficulty: 'Beginner'
              }
            ]
          }
        ]
      },
      {
        id: 'devops',
        name: 'DevOps & Cloud',
        description: 'Deployment, monitoring, and cloud infrastructure',
        icon: 'Cloud',
        marketDemand: 85,
        salaryImpact: 35,
        completed: false,
        skills: [
          {
            id: 'aws',
            name: 'AWS Fundamentals',
            description: 'Amazon Web Services core services and concepts',
            difficulty: 'Intermediate',
            estimatedTime: 35,
            questions: 30,
            completed: false,
            category: 'devops',
            marketValue: 87,
            prerequisites: [],
            learningResources: [
              {
                title: 'AWS Official Documentation',
                type: 'documentation',
                url: 'https://docs.aws.amazon.com/',
                difficulty: 'Intermediate'
              },
              {
                title: 'AWS Getting Started Guide',
                type: 'documentation',
                url: 'https://aws.amazon.com/getting-started/',
                difficulty: 'Beginner'
              },
              {
                title: 'AWS EC2 User Guide',
                type: 'documentation',
                url: 'https://docs.aws.amazon.com/ec2/',
                difficulty: 'Intermediate'
              },
              {
                title: 'AWS Cloud Practitioner Essentials',
                type: 'course',
                url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/',
                difficulty: 'Beginner'
              }
            ]
          },
          {
            id: 'docker',
            name: 'Docker & Containers',
            description: 'Containerization and orchestration basics',
            difficulty: 'Intermediate',
            estimatedTime: 25,
            questions: 20,
            completed: false,
            category: 'devops',
            marketValue: 83,
            prerequisites: [],
            learningResources: [
              {
                title: 'Docker Official Documentation',
                type: 'documentation',
                url: 'https://docs.docker.com/',
                difficulty: 'Beginner'
              },
              {
                title: 'Docker Get Started Guide',
                type: 'documentation',
                url: 'https://docs.docker.com/get-started/',
                difficulty: 'Beginner'
              },
              {
                title: 'Docker Compose Documentation',
                type: 'documentation',
                url: 'https://docs.docker.com/compose/',
                difficulty: 'Intermediate'
              },
              {
                title: 'Docker Tutorial for Beginners - freeCodeCamp',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
                duration: '2h 10m',
                difficulty: 'Beginner'
              }
            ]
          }
        ]
      },
      {
        id: 'soft-skills',
        name: 'Professional Skills',
        description: 'Communication, leadership, and workplace skills',
        icon: 'Users',
        marketDemand: 100,
        salaryImpact: 20,
        completed: false,
        skills: [
          {
            id: 'communication',
            name: 'Technical Communication',
            description: 'Explaining technical concepts to different audiences',
            difficulty: 'Intermediate',
            estimatedTime: 15,
            questions: 12,
            completed: false,
            category: 'soft-skills',
            marketValue: 95,
            prerequisites: [],
            learningResources: []
          },
          {
            id: 'problem-solving',
            name: 'Problem Solving',
            description: 'Analytical thinking and systematic approach to problems',
            difficulty: 'Advanced',
            estimatedTime: 20,
            questions: 15,
            completed: false,
            category: 'soft-skills',
            marketValue: 90,
            prerequisites: [],
            learningResources: []
          }
        ]
      }
    ];
  }

  // Get questions for a specific skill
  getQuestionsForSkill(skillId: string): AssessmentQuestion[] {
    // Sample questions - in real app, this would come from a database
    const questionBank: { [key: string]: AssessmentQuestion[] } = {
      javascript: [
        {
          id: 'js-1',
          question: 'What is the output of: console.log(typeof null)?',
          options: ['null', 'undefined', 'object', 'boolean'],
          correctAnswer: 2,
          explanation: 'typeof null returns "object" due to a legacy bug in JavaScript.',
          difficulty: 'Medium',
          skillId: 'javascript',
          tags: ['data-types', 'fundamentals']
        },
        {
          id: 'js-2',
          question: 'Which method is used to convert a string to an integer?',
          options: ['parseInt()', 'parseFloat()', 'Number()', 'All of the above'],
          correctAnswer: 0,
          explanation: 'parseInt() specifically converts strings to integers.',
          difficulty: 'Easy',
          skillId: 'javascript',
          tags: ['data-types', 'conversion']
        },
        {
          id: 'js-3',
          question: 'What is a closure in JavaScript?',
          options: [
            'A function that has access to outer scope variables',
            'A way to close browser windows',
            'A method to end function execution',
            'A type of loop'
          ],
          correctAnswer: 0,
          explanation: 'A closure is a function that has access to variables in its outer (enclosing) scope.',
          difficulty: 'Hard',
          skillId: 'javascript',
          tags: ['closures', 'scope', 'advanced']
        },
        {
          id: 'js-4',
          question: 'What is the difference between var, let, and const?',
          options: [
            'No difference',
            'var is function-scoped, let and const are block-scoped',
            'const is fastest',
            'let is deprecated'
          ],
          correctAnswer: 1,
          explanation: 'var is function-scoped and can be redeclared, let is block-scoped and mutable, const is block-scoped and immutable.',
          difficulty: 'Medium',
          skillId: 'javascript',
          tags: ['variables', 'scope', 'declarations']
        },
        {
          id: 'js-5',
          question: 'What is event bubbling in JavaScript?',
          options: [
            'Events moving from child to parent elements',
            'Creating new events',
            'Deleting events',
            'Event animation'
          ],
          correctAnswer: 0,
          explanation: 'Event bubbling is when an event starts from the target element and bubbles up to parent elements.',
          difficulty: 'Medium',
          skillId: 'javascript',
          tags: ['events', 'dom', 'bubbling']
        },
        {
          id: 'js-6',
          question: 'What is the difference between == and === in JavaScript?',
          options: [
            'No difference',
            '== allows type coercion, === requires same type',
            '=== is faster',
            '== is stricter'
          ],
          correctAnswer: 1,
          explanation: '== performs type coercion before comparison, while === requires both value and type to be identical.',
          difficulty: 'Medium',
          skillId: 'javascript',
          tags: ['comparison', 'operators', 'type-coercion']
        },
        {
          id: 'js-7',
          question: 'What is a Promise in JavaScript?',
          options: [
            'A guarantee that code will work',
            'An object representing eventual completion of an async operation',
            'A type of function',
            'A variable declaration'
          ],
          correctAnswer: 1,
          explanation: 'A Promise represents the eventual completion (or failure) of an asynchronous operation and its resulting value.',
          difficulty: 'Hard',
          skillId: 'javascript',
          tags: ['promises', 'async', 'advanced']
        },
        {
          id: 'js-8',
          question: 'What is the difference between function declaration and function expression?',
          options: [
            'No difference',
            'Declarations are hoisted, expressions are not',
            'Expressions are faster',
            'Declarations are deprecated'
          ],
          correctAnswer: 1,
          explanation: 'Function declarations are fully hoisted and can be called before definition, while function expressions are not hoisted.',
          difficulty: 'Medium',
          skillId: 'javascript',
          tags: ['functions', 'hoisting', 'declarations']
        },
        {
          id: 'js-9',
          question: 'What is the "this" keyword in JavaScript?',
          options: [
            'Refers to the current function',
            'Refers to the execution context',
            'Refers to the global object',
            'A reserved keyword with no purpose'
          ],
          correctAnswer: 1,
          explanation: 'The "this" keyword refers to the object that is executing the current function, depending on how the function is called.',
          difficulty: 'Hard',
          skillId: 'javascript',
          tags: ['this', 'context', 'advanced']
        },
        {
          id: 'js-10',
          question: 'What is destructuring in JavaScript?',
          options: [
            'Breaking objects permanently',
            'Extracting values from arrays or objects into variables',
            'Deleting properties',
            'Creating new objects'
          ],
          correctAnswer: 1,
          explanation: 'Destructuring allows extracting values from arrays or properties from objects into distinct variables.',
          difficulty: 'Medium',
          skillId: 'javascript',
          tags: ['destructuring', 'es6', 'syntax']
        }
      ],
      react: [
        {
          id: 'react-1',
          question: 'What is JSX?',
          options: [
            'A separate templating language',
            'JavaScript XML syntax extension',
            'A CSS framework',
            'A database query language'
          ],
          correctAnswer: 1,
          explanation: 'JSX is a syntax extension for JavaScript that allows writing HTML-like code.',
          difficulty: 'Easy',
          skillId: 'react',
          tags: ['jsx', 'fundamentals']
        },
        {
          id: 'react-2',
          question: 'Which hook is used for side effects in functional components?',
          options: ['useState', 'useEffect', 'useContext', 'useReducer'],
          correctAnswer: 1,
          explanation: 'useEffect is used to perform side effects in functional components.',
          difficulty: 'Medium',
          skillId: 'react',
          tags: ['hooks', 'useEffect']
        },
        {
          id: 'react-3',
          question: 'What is the purpose of useState hook?',
          options: [
            'To manage component state',
            'To handle side effects',
            'To access context',
            'To optimize performance'
          ],
          correctAnswer: 0,
          explanation: 'useState hook allows functional components to have and manage local state.',
          difficulty: 'Easy',
          skillId: 'react',
          tags: ['hooks', 'useState', 'state']
        },
        {
          id: 'react-4',
          question: 'What is prop drilling in React?',
          options: [
            'Creating new props',
            'Passing props through multiple component levels',
            'Deleting props',
            'Validating props'
          ],
          correctAnswer: 1,
          explanation: 'Prop drilling occurs when you pass props through multiple component levels to reach a deeply nested component.',
          difficulty: 'Medium',
          skillId: 'react',
          tags: ['props', 'architecture', 'drilling']
        },
        {
          id: 'react-5',
          question: 'What is the Virtual DOM in React?',
          options: [
            'A real DOM element',
            'A JavaScript representation of the real DOM',
            'A browser API',
            'A CSS framework'
          ],
          correctAnswer: 1,
          explanation: 'Virtual DOM is a JavaScript representation of the real DOM that React uses for efficient updates.',
          difficulty: 'Medium',
          skillId: 'react',
          tags: ['virtual-dom', 'performance', 'architecture']
        },
        {
          id: 'react-6',
          question: 'What is React Context?',
          options: [
            'A way to pass data through component tree without props',
            'A debugging tool',
            'A styling solution',
            'A routing library'
          ],
          correctAnswer: 0,
          explanation: 'React Context provides a way to pass data through the component tree without having to pass props down manually.',
          difficulty: 'Hard',
          skillId: 'react',
          tags: ['context', 'state-management', 'advanced']
        },
        {
          id: 'react-7',
          question: 'What is the difference between controlled and uncontrolled components?',
          options: [
            'No difference',
            'Controlled components have React-managed state, uncontrolled use DOM state',
            'Uncontrolled are faster',
            'Controlled are deprecated'
          ],
          correctAnswer: 1,
          explanation: 'Controlled components have their state managed by React, while uncontrolled components manage their own state internally.',
          difficulty: 'Medium',
          skillId: 'react',
          tags: ['forms', 'controlled', 'uncontrolled']
        },
        {
          id: 'react-8',
          question: 'What is useReducer hook used for?',
          options: [
            'Reducing bundle size',
            'Managing complex state logic',
            'Optimizing renders',
            'Handling side effects'
          ],
          correctAnswer: 1,
          explanation: 'useReducer is used for managing complex state logic, especially when state updates depend on previous state.',
          difficulty: 'Hard',
          skillId: 'react',
          tags: ['hooks', 'useReducer', 'state-management']
        },
        {
          id: 'react-9',
          question: 'What is React.memo()?',
          options: [
            'A memory management tool',
            'A higher-order component for performance optimization',
            'A state management solution',
            'A routing component'
          ],
          correctAnswer: 1,
          explanation: 'React.memo() is a higher-order component that memoizes the result and skips re-rendering if props haven\'t changed.',
          difficulty: 'Hard',
          skillId: 'react',
          tags: ['memo', 'performance', 'optimization']
        },
        {
          id: 'react-10',
          question: 'What is the useCallback hook used for?',
          options: [
            'Calling functions',
            'Memoizing functions to prevent unnecessary re-renders',
            'Creating callbacks',
            'Handling events'
          ],
          correctAnswer: 1,
          explanation: 'useCallback returns a memoized callback function that only changes if one of its dependencies has changed.',
          difficulty: 'Hard',
          skillId: 'react',
          tags: ['useCallback', 'performance', 'memoization']
        }
      ],
      typescript: [
        {
          id: 'ts-1',
          question: 'What is the correct way to define an interface in TypeScript?',
          options: [
            'interface User { name: string; }',
            'type User = { name: string; }',
            'class User { name: string; }',
            'const User = { name: string; }'
          ],
          correctAnswer: 0,
          explanation: 'Interfaces in TypeScript are defined using the "interface" keyword followed by the interface name and body.',
          difficulty: 'Easy',
          skillId: 'typescript',
          tags: ['interface', 'types']
        },
        {
          id: 'ts-2',
          question: 'What does the "?" symbol mean in TypeScript property definitions?',
          options: [
            'Makes the property required',
            'Makes the property optional',
            'Makes the property nullable',
            'Makes the property readonly'
          ],
          correctAnswer: 1,
          explanation: 'The "?" symbol makes a property optional, meaning it may or may not be present.',
          difficulty: 'Easy',
          skillId: 'typescript',
          tags: ['optional', 'properties']
        },
        {
          id: 'ts-3',
          question: 'What is a union type in TypeScript?',
          options: [
            'A type that can be one of several types',
            'A type that combines multiple interfaces',
            'A type that extends another type',
            'A type that represents an array'
          ],
          correctAnswer: 0,
          explanation: 'A union type allows a variable to be one of several types, defined with the | operator.',
          difficulty: 'Medium',
          skillId: 'typescript',
          tags: ['union', 'types']
        },
        {
          id: 'ts-4',
          question: 'How do you define a generic function in TypeScript?',
          options: [
            'function myFunc<T>(arg: T): T',
            'function myFunc(arg: generic): generic',
            'function myFunc<generic>(arg: generic): generic',
            'function myFunc[T](arg: T): T'
          ],
          correctAnswer: 0,
          explanation: 'Generic functions use angle brackets <T> to define type parameters.',
          difficulty: 'Medium',
          skillId: 'typescript',
          tags: ['generics', 'functions']
        },
        {
          id: 'ts-5',
          question: 'What is the difference between "interface" and "type" in TypeScript?',
          options: [
            'No difference, they are identical',
            'Interfaces can be extended, types cannot',
            'Types are for primitives, interfaces for objects',
            'Interfaces can be extended and merged, types are more flexible for unions'
          ],
          correctAnswer: 3,
          explanation: 'Interfaces can be extended and declaration merged, while types are more flexible for unions, intersections, and computed types.',
          difficulty: 'Hard',
          skillId: 'typescript',
          tags: ['interface', 'type', 'advanced']
        },
        {
          id: 'ts-6',
          question: 'What is the "keyof" operator used for in TypeScript?',
          options: [
            'To get the keys of an object type',
            'To create new objects',
            'To delete object properties',
            'To check if a property exists'
          ],
          correctAnswer: 0,
          explanation: 'The keyof operator creates a union type of all property names of a given type.',
          difficulty: 'Medium',
          skillId: 'typescript',
          tags: ['keyof', 'utility-types']
        },
        {
          id: 'ts-7',
          question: 'How do you make all properties of an interface optional in TypeScript?',
          options: [
            'Use Partial<T>',
            'Use Optional<T>',
            'Use Nullable<T>',
            'Use Maybe<T>'
          ],
          correctAnswer: 0,
          explanation: 'Partial<T> is a utility type that makes all properties of type T optional.',
          difficulty: 'Medium',
          skillId: 'typescript',
          tags: ['utility-types', 'partial']
        },
        {
          id: 'ts-8',
          question: 'What does the "never" type represent in TypeScript?',
          options: [
            'A type that can be null',
            'A type that represents values that never occur',
            'A type for empty objects',
            'A type for undefined values'
          ],
          correctAnswer: 1,
          explanation: 'The never type represents values that never occur, like functions that always throw or infinite loops.',
          difficulty: 'Hard',
          skillId: 'typescript',
          tags: ['never', 'advanced-types']
        },
        {
          id: 'ts-9',
          question: 'How do you create a readonly array in TypeScript?',
          options: [
            'ReadonlyArray<T> or readonly T[]',
            'ImmutableArray<T>',
            'ConstArray<T>',
            'StaticArray<T>'
          ],
          correctAnswer: 0,
          explanation: 'ReadonlyArray<T> or readonly T[] creates an array that cannot be modified after creation.',
          difficulty: 'Medium',
          skillId: 'typescript',
          tags: ['readonly', 'arrays']
        },
        {
          id: 'ts-10',
          question: 'What is type assertion in TypeScript?',
          options: [
            'A way to convert types at runtime',
            'A way to tell the compiler about the type of a value',
            'A way to create new types',
            'A way to validate types'
          ],
          correctAnswer: 1,
          explanation: 'Type assertion is a way to tell the TypeScript compiler that you know the type of a value better than it does.',
          difficulty: 'Medium',
          skillId: 'typescript',
          tags: ['type-assertion', 'casting']
        },
        {
          id: 'ts-11',
          question: 'What is a mapped type in TypeScript?',
          options: [
            'A type that maps over properties of another type',
            'A type for Map objects',
            'A type for geographical data',
            'A type for function mapping'
          ],
          correctAnswer: 0,
          explanation: 'Mapped types create new types by transforming properties in an existing type.',
          difficulty: 'Hard',
          skillId: 'typescript',
          tags: ['mapped-types', 'advanced']
        },
        {
          id: 'ts-12',
          question: 'How do you define a conditional type in TypeScript?',
          options: [
            'T extends U ? X : Y',
            'if T is U then X else Y',
            'T instanceof U ? X : Y',
            'condition T, U => X | Y'
          ],
          correctAnswer: 0,
          explanation: 'Conditional types use the syntax T extends U ? X : Y to select types based on conditions.',
          difficulty: 'Hard',
          skillId: 'typescript',
          tags: ['conditional-types', 'advanced']
        }
      ],
      nodejs: [
        {
          id: 'node-1',
          question: 'What is Node.js?',
          options: [
            'A JavaScript framework',
            'A JavaScript runtime built on Chrome\'s V8 engine',
            'A database management system',
            'A web browser'
          ],
          correctAnswer: 1,
          explanation: 'Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine for server-side development.',
          difficulty: 'Easy',
          skillId: 'nodejs',
          tags: ['fundamentals', 'runtime']
        },
        {
          id: 'node-2',
          question: 'Which module is used to create a web server in Node.js?',
          options: ['fs', 'path', 'http', 'url'],
          correctAnswer: 2,
          explanation: 'The http module is used to create HTTP servers and clients in Node.js.',
          difficulty: 'Easy',
          skillId: 'nodejs',
          tags: ['http', 'server']
        },
        {
          id: 'node-3',
          question: 'What is npm?',
          options: [
            'Node Package Manager',
            'Node Programming Model',
            'Node Process Manager',
            'Node Project Manager'
          ],
          correctAnswer: 0,
          explanation: 'npm stands for Node Package Manager and is used to manage Node.js packages and dependencies.',
          difficulty: 'Easy',
          skillId: 'nodejs',
          tags: ['npm', 'packages']
        },
        {
          id: 'node-4',
          question: 'How do you handle asynchronous operations in Node.js?',
          options: [
            'Only with callbacks',
            'Only with promises',
            'Callbacks, promises, and async/await',
            'Only with async/await'
          ],
          correctAnswer: 2,
          explanation: 'Node.js supports multiple ways to handle async operations: callbacks, promises, and async/await.',
          difficulty: 'Medium',
          skillId: 'nodejs',
          tags: ['async', 'callbacks', 'promises']
        },
        {
          id: 'node-5',
          question: 'What is the event loop in Node.js?',
          options: [
            'A loop that handles user events',
            'The mechanism that handles asynchronous operations',
            'A loop that processes HTTP requests',
            'A debugging tool'
          ],
          correctAnswer: 1,
          explanation: 'The event loop is the mechanism that allows Node.js to perform non-blocking I/O operations.',
          difficulty: 'Hard',
          skillId: 'nodejs',
          tags: ['event-loop', 'async', 'advanced']
        },
        {
          id: 'node-6',
          question: 'Which module is used to read files in Node.js?',
          options: ['http', 'fs', 'path', 'url'],
          correctAnswer: 1,
          explanation: 'The fs (file system) module provides APIs for interacting with the file system.',
          difficulty: 'Easy',
          skillId: 'nodejs',
          tags: ['fs', 'file-system']
        },
        {
          id: 'node-7',
          question: 'What is middleware in Express.js?',
          options: [
            'Functions that execute during the request-response cycle',
            'Database connection layers',
            'Frontend components',
            'Error handling mechanisms'
          ],
          correctAnswer: 0,
          explanation: 'Middleware functions are functions that have access to the request, response, and next middleware function.',
          difficulty: 'Medium',
          skillId: 'nodejs',
          tags: ['express', 'middleware']
        },
        {
          id: 'node-8',
          question: 'How do you handle errors in Node.js?',
          options: [
            'Using try-catch blocks only',
            'Using error events and try-catch',
            'Errors are handled automatically',
            'Using console.log'
          ],
          correctAnswer: 1,
          explanation: 'Node.js uses both error events for asynchronous operations and try-catch for synchronous operations.',
          difficulty: 'Medium',
          skillId: 'nodejs',
          tags: ['error-handling', 'events']
        },
        {
          id: 'node-9',
          question: 'What is the purpose of package.json?',
          options: [
            'To store application data',
            'To define project metadata and dependencies',
            'To configure the web server',
            'To store user credentials'
          ],
          correctAnswer: 1,
          explanation: 'package.json contains metadata about the project and its dependencies, scripts, and other configuration.',
          difficulty: 'Easy',
          skillId: 'nodejs',
          tags: ['package-json', 'dependencies']
        },
        {
          id: 'node-10',
          question: 'What is clustering in Node.js?',
          options: [
            'Grouping related modules',
            'Creating multiple worker processes',
            'Database clustering',
            'Code organization technique'
          ],
          correctAnswer: 1,
          explanation: 'Clustering allows you to create child processes that share server ports to take advantage of multi-core systems.',
          difficulty: 'Hard',
          skillId: 'nodejs',
          tags: ['cluster', 'performance', 'scalability']
        },
        {
          id: 'node-11',
          question: 'What is the Buffer class in Node.js?',
          options: [
            'A class for handling binary data',
            'A class for caching data',
            'A class for network operations',
            'A class for file operations'
          ],
          correctAnswer: 0,
          explanation: 'Buffer is a global class for handling raw binary data, similar to arrays of integers.',
          difficulty: 'Medium',
          skillId: 'nodejs',
          tags: ['buffer', 'binary-data']
        },
        {
          id: 'node-12',
          question: 'What is the difference between process.nextTick() and setImmediate()?',
          options: [
            'No difference',
            'nextTick executes before I/O events, setImmediate after',
            'setImmediate is faster',
            'nextTick is deprecated'
          ],
          correctAnswer: 1,
          explanation: 'process.nextTick() executes before I/O events in the same phase, while setImmediate() executes after I/O events.',
          difficulty: 'Hard',
          skillId: 'nodejs',
          tags: ['event-loop', 'timing', 'advanced']
        }
      ],
      python: [
        {
          id: 'py-1',
          question: 'What is Python?',
          options: [
            'A compiled programming language',
            'An interpreted, high-level programming language',
            'A database management system',
            'A web framework'
          ],
          correctAnswer: 1,
          explanation: 'Python is an interpreted, high-level, general-purpose programming language.',
          difficulty: 'Easy',
          skillId: 'python',
          tags: ['fundamentals', 'language']
        },
        {
          id: 'py-2',
          question: 'Which of the following is used to define a function in Python?',
          options: ['function', 'def', 'func', 'define'],
          correctAnswer: 1,
          explanation: 'The "def" keyword is used to define functions in Python.',
          difficulty: 'Easy',
          skillId: 'python',
          tags: ['functions', 'syntax']
        },
        {
          id: 'py-3',
          question: 'What is a list comprehension in Python?',
          options: [
            'A way to create lists based on existing lists',
            'A method to sort lists',
            'A function to find list length',
            'A way to delete list items'
          ],
          correctAnswer: 0,
          explanation: 'List comprehensions provide a concise way to create lists based on existing lists or other iterables.',
          difficulty: 'Medium',
          skillId: 'python',
          tags: ['list-comprehension', 'lists']
        },
        {
          id: 'py-4',
          question: 'What is the difference between a list and a tuple in Python?',
          options: [
            'No difference',
            'Lists are mutable, tuples are immutable',
            'Tuples are mutable, lists are immutable',
            'Lists store numbers, tuples store strings'
          ],
          correctAnswer: 1,
          explanation: 'Lists are mutable (can be changed after creation) while tuples are immutable (cannot be changed).',
          difficulty: 'Medium',
          skillId: 'python',
          tags: ['lists', 'tuples', 'data-types']
        },
        {
          id: 'py-5',
          question: 'What is a decorator in Python?',
          options: [
            'A function that modifies another function',
            'A way to add comments to code',
            'A method to create classes',
            'A type of loop'
          ],
          correctAnswer: 0,
          explanation: 'Decorators are functions that modify the functionality of other functions or classes.',
          difficulty: 'Hard',
          skillId: 'python',
          tags: ['decorators', 'advanced', 'functions']
        },
        {
          id: 'py-6',
          question: 'What is the difference between == and is in Python?',
          options: [
            'No difference',
            '== compares values, is compares identity',
            'is compares values, == compares identity',
            'Both compare identity'
          ],
          correctAnswer: 1,
          explanation: '== compares values for equality, while is compares object identity (whether they are the same object).',
          difficulty: 'Medium',
          skillId: 'python',
          tags: ['operators', 'identity', 'comparison']
        },
        {
          id: 'py-7',
          question: 'What is a generator in Python?',
          options: [
            'A function that returns an iterator',
            'A class for creating objects',
            'A module for generating numbers',
            'A tool for code generation'
          ],
          correctAnswer: 0,
          explanation: 'A generator is a function that returns an iterator object which we can iterate over (one value at a time).',
          difficulty: 'Medium',
          skillId: 'python',
          tags: ['generators', 'iterators']
        },
        {
          id: 'py-8',
          question: 'What is the purpose of __init__ method in Python?',
          options: [
            'To delete objects',
            'To initialize object attributes',
            'To define class methods',
            'To import modules'
          ],
          correctAnswer: 1,
          explanation: 'The __init__ method is called when an object is created and is used to initialize object attributes.',
          difficulty: 'Easy',
          skillId: 'python',
          tags: ['classes', 'constructor', 'oop']
        },
        {
          id: 'py-9',
          question: 'What is a lambda function in Python?',
          options: [
            'A named function',
            'An anonymous function',
            'A class method',
            'A built-in function'
          ],
          correctAnswer: 1,
          explanation: 'Lambda functions are anonymous functions that can have any number of arguments but can only have one expression.',
          difficulty: 'Medium',
          skillId: 'python',
          tags: ['lambda', 'functions', 'anonymous']
        },
        {
          id: 'py-10',
          question: 'What is the Global Interpreter Lock (GIL) in Python?',
          options: [
            'A security feature',
            'A mutex that protects access to Python objects',
            'A performance optimization',
            'A debugging tool'
          ],
          correctAnswer: 1,
          explanation: 'The GIL is a mutex that protects access to Python objects, preventing multiple threads from executing Python code simultaneously.',
          difficulty: 'Hard',
          skillId: 'python',
          tags: ['gil', 'threading', 'advanced']
        },
        {
          id: 'py-11',
          question: 'What is the difference between deep copy and shallow copy?',
          options: [
            'No difference',
            'Deep copy creates new objects for nested elements, shallow copy doesn\'t',
            'Shallow copy is faster',
            'Deep copy uses less memory'
          ],
          correctAnswer: 1,
          explanation: 'Deep copy creates new objects for all nested elements, while shallow copy creates a new object but references to nested objects remain the same.',
          difficulty: 'Medium',
          skillId: 'python',
          tags: ['copy', 'objects', 'memory']
        },
        {
          id: 'py-12',
          question: 'What is a context manager in Python?',
          options: [
            'A way to manage application context',
            'An object that defines runtime context for executing code blocks',
            'A database connection manager',
            'A memory management tool'
          ],
          correctAnswer: 1,
          explanation: 'Context managers define runtime context for executing code blocks, commonly used with the "with" statement.',
          difficulty: 'Hard',
          skillId: 'python',
          tags: ['context-manager', 'with-statement', 'advanced']
        }
      ],
      databases: [
        {
          id: 'db-1',
          question: 'What does SQL stand for?',
          options: [
            'Structured Query Language',
            'Simple Query Language',
            'Standard Query Language',
            'Sequential Query Language'
          ],
          correctAnswer: 0,
          explanation: 'SQL stands for Structured Query Language, used for managing relational databases.',
          difficulty: 'Easy',
          skillId: 'databases',
          tags: ['sql', 'fundamentals']
        },
        {
          id: 'db-2',
          question: 'Which SQL command is used to retrieve data from a database?',
          options: ['GET', 'FETCH', 'SELECT', 'RETRIEVE'],
          correctAnswer: 2,
          explanation: 'The SELECT command is used to query and retrieve data from database tables.',
          difficulty: 'Easy',
          skillId: 'databases',
          tags: ['sql', 'select', 'queries']
        },
        {
          id: 'db-3',
          question: 'What is a primary key in a database?',
          options: [
            'The first column in a table',
            'A unique identifier for each row',
            'The most important data in a table',
            'A password for the database'
          ],
          correctAnswer: 1,
          explanation: 'A primary key is a unique identifier that ensures each row in a table can be uniquely identified.',
          difficulty: 'Medium',
          skillId: 'databases',
          tags: ['primary-key', 'database-design']
        },
        {
          id: 'db-4',
          question: 'What is the difference between SQL and NoSQL databases?',
          options: [
            'No difference',
            'SQL uses tables, NoSQL uses flexible data models',
            'NoSQL is newer than SQL',
            'SQL is faster than NoSQL'
          ],
          correctAnswer: 1,
          explanation: 'SQL databases use structured tables with fixed schemas, while NoSQL databases use flexible data models like documents, key-value pairs, etc.',
          difficulty: 'Medium',
          skillId: 'databases',
          tags: ['sql', 'nosql', 'database-types']
        },
        {
          id: 'db-5',
          question: 'What is database normalization?',
          options: [
            'Making database faster',
            'Organizing data to reduce redundancy',
            'Creating database backups',
            'Encrypting database data'
          ],
          correctAnswer: 1,
          explanation: 'Database normalization is the process of organizing data to minimize redundancy and improve data integrity.',
          difficulty: 'Hard',
          skillId: 'databases',
          tags: ['normalization', 'database-design', 'advanced']
        },
        {
          id: 'db-6',
          question: 'What is a foreign key?',
          options: [
            'A key from another country',
            'A field that links to the primary key of another table',
            'A backup key',
            'An encrypted key'
          ],
          correctAnswer: 1,
          explanation: 'A foreign key is a field that refers to the primary key in another table, establishing relationships between tables.',
          difficulty: 'Easy',
          skillId: 'databases',
          tags: ['foreign-key', 'relationships']
        },
        {
          id: 'db-7',
          question: 'What is an index in a database?',
          options: [
            'A table of contents',
            'A data structure that improves query performance',
            'A backup mechanism',
            'A security feature'
          ],
          correctAnswer: 1,
          explanation: 'An index is a data structure that improves the speed of data retrieval operations on a database table.',
          difficulty: 'Medium',
          skillId: 'databases',
          tags: ['index', 'performance', 'optimization']
        },
        {
          id: 'db-8',
          question: 'What is ACID in database transactions?',
          options: [
            'A type of database',
            'Atomicity, Consistency, Isolation, Durability',
            'A query language',
            'A backup method'
          ],
          correctAnswer: 1,
          explanation: 'ACID represents four properties of database transactions: Atomicity, Consistency, Isolation, and Durability.',
          difficulty: 'Medium',
          skillId: 'databases',
          tags: ['acid', 'transactions', 'properties']
        },
        {
          id: 'db-9',
          question: 'What is a JOIN in SQL?',
          options: [
            'A way to combine rows from multiple tables',
            'A way to add new columns',
            'A way to delete data',
            'A way to create tables'
          ],
          correctAnswer: 0,
          explanation: 'JOIN is used to combine rows from two or more tables based on a related column between them.',
          difficulty: 'Medium',
          skillId: 'databases',
          tags: ['join', 'sql', 'relationships']
        },
        {
          id: 'db-10',
          question: 'What is the difference between INNER JOIN and LEFT JOIN?',
          options: [
            'No difference',
            'INNER JOIN returns only matching rows, LEFT JOIN returns all left table rows',
            'LEFT JOIN is faster',
            'INNER JOIN includes null values'
          ],
          correctAnswer: 1,
          explanation: 'INNER JOIN returns only rows with matches in both tables, while LEFT JOIN returns all rows from the left table and matching rows from the right.',
          difficulty: 'Medium',
          skillId: 'databases',
          tags: ['joins', 'inner-join', 'left-join']
        },
        {
          id: 'db-11',
          question: 'What is a stored procedure?',
          options: [
            'A precompiled collection of SQL statements',
            'A backup procedure',
            'A security protocol',
            'A data validation method'
          ],
          correctAnswer: 0,
          explanation: 'A stored procedure is a precompiled collection of SQL statements that can be executed as a single unit.',
          difficulty: 'Hard',
          skillId: 'databases',
          tags: ['stored-procedures', 'sql', 'performance']
        },
        {
          id: 'db-12',
          question: 'What is database sharding?',
          options: [
            'Breaking database into smaller pieces',
            'Encrypting database data',
            'Creating database backups',
            'Optimizing queries'
          ],
          correctAnswer: 0,
          explanation: 'Sharding is a database architecture pattern that divides a database into smaller, more manageable pieces called shards.',
          difficulty: 'Hard',
          skillId: 'databases',
          tags: ['sharding', 'scalability', 'architecture']
        }
      ],
      aws: [
        {
          id: 'aws-1',
          question: 'What does AWS stand for?',
          options: [
            'Amazon Web Services',
            'Advanced Web Solutions',
            'Automated Web Systems',
            'Amazon Website Services'
          ],
          correctAnswer: 0,
          explanation: 'AWS stands for Amazon Web Services, Amazon\'s cloud computing platform.',
          difficulty: 'Easy',
          skillId: 'aws',
          tags: ['fundamentals', 'cloud']
        },
        {
          id: 'aws-2',
          question: 'Which AWS service is used for virtual servers?',
          options: ['S3', 'EC2', 'RDS', 'Lambda'],
          correctAnswer: 1,
          explanation: 'EC2 (Elastic Compute Cloud) provides virtual servers in the AWS cloud.',
          difficulty: 'Easy',
          skillId: 'aws',
          tags: ['ec2', 'compute']
        },
        {
          id: 'aws-3',
          question: 'What is Amazon S3 used for?',
          options: [
            'Virtual servers',
            'Object storage',
            'Database management',
            'Load balancing'
          ],
          correctAnswer: 1,
          explanation: 'Amazon S3 (Simple Storage Service) is used for object storage with high durability and availability.',
          difficulty: 'Easy',
          skillId: 'aws',
          tags: ['s3', 'storage']
        },
        {
          id: 'aws-4',
          question: 'What is AWS Lambda?',
          options: [
            'A database service',
            'A serverless compute service',
            'A storage service',
            'A networking service'
          ],
          correctAnswer: 1,
          explanation: 'AWS Lambda is a serverless compute service that runs code without provisioning servers.',
          difficulty: 'Medium',
          skillId: 'aws',
          tags: ['lambda', 'serverless']
        },
        {
          id: 'aws-5',
          question: 'What is the AWS Well-Architected Framework?',
          options: [
            'A building design standard',
            'A set of best practices for cloud architecture',
            'A programming framework',
            'A database design pattern'
          ],
          correctAnswer: 1,
          explanation: 'The AWS Well-Architected Framework provides best practices for designing secure, high-performing, resilient, and efficient infrastructure.',
          difficulty: 'Hard',
          skillId: 'aws',
          tags: ['architecture', 'best-practices', 'advanced']
        },
        {
          id: 'aws-6',
          question: 'What is Amazon RDS?',
          options: [
            'A storage service',
            'A relational database service',
            'A compute service',
            'A networking service'
          ],
          correctAnswer: 1,
          explanation: 'Amazon RDS (Relational Database Service) makes it easy to set up, operate, and scale relational databases in the cloud.',
          difficulty: 'Easy',
          skillId: 'aws',
          tags: ['rds', 'database', 'managed-service']
        },
        {
          id: 'aws-7',
          question: 'What is Amazon VPC?',
          options: [
            'Virtual Private Cloud - isolated cloud resources',
            'Virtual Processing Center',
            'Variable Pricing Calculator',
            'Verified Partner Certification'
          ],
          correctAnswer: 0,
          explanation: 'Amazon VPC lets you provision a logically isolated section of the AWS cloud where you can launch AWS resources.',
          difficulty: 'Medium',
          skillId: 'aws',
          tags: ['vpc', 'networking', 'security']
        },
        {
          id: 'aws-8',
          question: 'What is Auto Scaling in AWS?',
          options: [
            'Automatic price adjustment',
            'Automatic resource scaling based on demand',
            'Automatic backup creation',
            'Automatic security updates'
          ],
          correctAnswer: 1,
          explanation: 'Auto Scaling automatically adjusts the number of EC2 instances based on demand to maintain performance and minimize costs.',
          difficulty: 'Medium',
          skillId: 'aws',
          tags: ['auto-scaling', 'performance', 'cost-optimization']
        },
        {
          id: 'aws-9',
          question: 'What is Amazon CloudFront?',
          options: [
            'A content delivery network (CDN)',
            'A cloud storage service',
            'A monitoring service',
            'A security service'
          ],
          correctAnswer: 0,
          explanation: 'CloudFront is a fast content delivery network (CDN) service that delivers data, videos, applications globally with low latency.',
          difficulty: 'Medium',
          skillId: 'aws',
          tags: ['cloudfront', 'cdn', 'performance']
        },
        {
          id: 'aws-10',
          question: 'What is AWS IAM?',
          options: [
            'Identity and Access Management',
            'Infrastructure Administration Module',
            'Internet Application Manager',
            'Integrated Analytics Manager'
          ],
          correctAnswer: 0,
          explanation: 'AWS IAM enables you to manage access to AWS services and resources securely by controlling authentication and authorization.',
          difficulty: 'Medium',
          skillId: 'aws',
          tags: ['iam', 'security', 'access-management']
        },
        {
          id: 'aws-11',
          question: 'What is Amazon ELB?',
          options: [
            'Elastic Load Balancing',
            'Enhanced Log Backup',
            'Extended License Bundle',
            'Encrypted Local Block'
          ],
          correctAnswer: 0,
          explanation: 'Elastic Load Balancing automatically distributes incoming application traffic across multiple targets like EC2 instances.',
          difficulty: 'Medium',
          skillId: 'aws',
          tags: ['elb', 'load-balancing', 'high-availability']
        },
        {
          id: 'aws-12',
          question: 'What is the difference between horizontal and vertical scaling?',
          options: [
            'No difference',
            'Horizontal adds more instances, vertical increases instance power',
            'Vertical adds more instances, horizontal increases instance power',
            'Both are the same in AWS'
          ],
          correctAnswer: 1,
          explanation: 'Horizontal scaling adds more instances to handle load, while vertical scaling increases the power (CPU, RAM) of existing instances.',
          difficulty: 'Hard',
          skillId: 'aws',
          tags: ['scaling', 'architecture', 'performance']
        }
      ],
      docker: [
        {
          id: 'docker-1',
          question: 'What is Docker?',
          options: [
            'A programming language',
            'A containerization platform',
            'A database system',
            'A web framework'
          ],
          correctAnswer: 1,
          explanation: 'Docker is a containerization platform that packages applications and their dependencies into containers.',
          difficulty: 'Easy',
          skillId: 'docker',
          tags: ['fundamentals', 'containers']
        },
        {
          id: 'docker-2',
          question: 'What is a Docker container?',
          options: [
            'A virtual machine',
            'A lightweight, portable execution environment',
            'A type of database',
            'A web server'
          ],
          correctAnswer: 1,
          explanation: 'A Docker container is a lightweight, portable execution environment that includes everything needed to run an application.',
          difficulty: 'Easy',
          skillId: 'docker',
          tags: ['containers', 'fundamentals']
        },
        {
          id: 'docker-3',
          question: 'What is a Dockerfile?',
          options: [
            'A configuration file for creating Docker images',
            'A log file for Docker',
            'A database file',
            'A backup file'
          ],
          correctAnswer: 0,
          explanation: 'A Dockerfile is a text file that contains instructions for building Docker images.',
          difficulty: 'Medium',
          skillId: 'docker',
          tags: ['dockerfile', 'images']
        },
        {
          id: 'docker-4',
          question: 'What command is used to build a Docker image?',
          options: [
            'docker create',
            'docker make',
            'docker build',
            'docker compile'
          ],
          correctAnswer: 2,
          explanation: 'The "docker build" command is used to build Docker images from a Dockerfile.',
          difficulty: 'Medium',
          skillId: 'docker',
          tags: ['commands', 'build']
        },
        {
          id: 'docker-5',
          question: 'What is Docker Compose?',
          options: [
            'A tool for defining multi-container applications',
            'A code editor for Docker',
            'A monitoring tool',
            'A security scanner'
          ],
          correctAnswer: 0,
          explanation: 'Docker Compose is a tool for defining and running multi-container Docker applications using YAML files.',
          difficulty: 'Hard',
          skillId: 'docker',
          tags: ['compose', 'multi-container', 'orchestration']
        },
        {
          id: 'docker-6',
          question: 'What is the difference between Docker image and container?',
          options: [
            'No difference',
            'Image is a template, container is a running instance',
            'Container is larger than image',
            'Image runs code, container stores code'
          ],
          correctAnswer: 1,
          explanation: 'A Docker image is a read-only template, while a container is a running instance of an image.',
          difficulty: 'Medium',
          skillId: 'docker',
          tags: ['images', 'containers', 'fundamentals']
        },
        {
          id: 'docker-7',
          question: 'What command is used to run a Docker container?',
          options: [
            'docker start',
            'docker run',
            'docker execute',
            'docker launch'
          ],
          correctAnswer: 1,
          explanation: 'The "docker run" command creates and starts a new container from a Docker image.',
          difficulty: 'Easy',
          skillId: 'docker',
          tags: ['commands', 'run', 'basics']
        },
        {
          id: 'docker-8',
          question: 'What is a Docker registry?',
          options: [
            'A configuration file',
            'A repository for Docker images',
            'A monitoring tool',
            'A security feature'
          ],
          correctAnswer: 1,
          explanation: 'A Docker registry is a repository for storing and distributing Docker images, like Docker Hub.',
          difficulty: 'Medium',
          skillId: 'docker',
          tags: ['registry', 'images', 'distribution']
        },
        {
          id: 'docker-9',
          question: 'What is Docker volume used for?',
          options: [
            'Managing container networking',
            'Persistent data storage',
            'Container security',
            'Image compression'
          ],
          correctAnswer: 1,
          explanation: 'Docker volumes provide persistent data storage that survives container restarts and can be shared between containers.',
          difficulty: 'Medium',
          skillId: 'docker',
          tags: ['volumes', 'storage', 'persistence']
        },
        {
          id: 'docker-10',
          question: 'What is the purpose of .dockerignore file?',
          options: [
            'To ignore Docker commands',
            'To specify files to exclude from build context',
            'To hide containers',
            'To disable Docker features'
          ],
          correctAnswer: 1,
          explanation: '.dockerignore file specifies which files and directories should be excluded from the Docker build context.',
          difficulty: 'Medium',
          skillId: 'docker',
          tags: ['dockerignore', 'build-context', 'optimization']
        },
        {
          id: 'docker-11',
          question: 'What is Docker Swarm?',
          options: [
            'A container orchestration tool',
            'A security scanner',
            'A monitoring tool',
            'A image builder'
          ],
          correctAnswer: 0,
          explanation: 'Docker Swarm is Docker\'s native clustering and orchestration tool for managing multiple Docker containers across multiple hosts.',
          difficulty: 'Hard',
          skillId: 'docker',
          tags: ['swarm', 'orchestration', 'clustering']
        },
        {
          id: 'docker-12',
          question: 'What is the difference between ADD and COPY in Dockerfile?',
          options: [
            'No difference',
            'COPY is simpler, ADD has additional features like URL download',
            'ADD is faster',
            'COPY works with images only'
          ],
          correctAnswer: 1,
          explanation: 'COPY simply copies files/folders, while ADD has additional features like downloading from URLs and extracting archives.',
          difficulty: 'Hard',
          skillId: 'docker',
          tags: ['dockerfile', 'copy', 'add', 'advanced']
        }
      ]
    };

    return questionBank[skillId] || [];
  }

  // Calculate skill-based recommendations
  getPersonalizedRecommendations(userSkills: string[], completedAssessments: AssessmentResult[]): Skill[] {
    const allSkills = this.getSkillCategories().flatMap(cat => cat.skills);
    const incompleteSkills = allSkills.filter(skill => 
      !completedAssessments.some(result => result.skillId === skill.id)
    );

    // Sort by market value and prerequisites met
    return incompleteSkills
      .filter(skill => 
        skill.prerequisites.every(prereq => 
          userSkills.includes(prereq) || 
          completedAssessments.some(result => result.skillId === prereq && result.score >= 70)
        )
      )
      .sort((a, b) => b.marketValue - a.marketValue)
      .slice(0, 5);
  }

  // Calculate skill gap analysis
  getSkillGapAnalysis(userSkills: Skill[], targetRole: string): {
    missing: Skill[];
    developing: Skill[];
    strong: Skill[];
  } {
    const roleRequirements = this.getRoleRequirements(targetRole);
    const userSkillMap = new Map(userSkills.map(skill => [skill.id, skill]));

    const missing = roleRequirements.filter(req => !userSkillMap.has(req.id));
    const developing = roleRequirements.filter(req => {
      const userSkill = userSkillMap.get(req.id);
      return userSkill && (userSkill.score || 0) < 70;
    });
    const strong = roleRequirements.filter(req => {
      const userSkill = userSkillMap.get(req.id);
      return userSkill && (userSkill.score || 0) >= 70;
    });

    return { missing, developing, strong };
  }

  // Get role-specific skill requirements
  private getRoleRequirements(role: string): Skill[] {
    const roleMap: { [key: string]: string[] } = {
      'frontend-developer': ['javascript', 'react', 'html', 'css', 'typescript'],
      'backend-developer': ['python', 'nodejs', 'databases', 'apis'],
      'fullstack-developer': ['javascript', 'react', 'nodejs', 'databases', 'aws'],
      'devops-engineer': ['aws', 'docker', 'linux', 'monitoring'],
    };

    const requiredSkillIds = roleMap[role] || [];
    const allSkills = this.getSkillCategories().flatMap(cat => cat.skills);
    
    return allSkills.filter(skill => requiredSkillIds.includes(skill.id));
  }

  // Store assessment result
  storeAssessmentResult(userId: string, result: AssessmentResult): void {
    if (!this.assessmentResults.has(userId)) {
      this.assessmentResults.set(userId, []);
    }
    this.assessmentResults.get(userId)!.push(result);
  }

  // Get user's assessment history
  getUserAssessmentHistory(userId: string): AssessmentResult[] {
    return this.assessmentResults.get(userId) || [];
  }

  // Calculate overall skill score
  calculateOverallSkillScore(userId: string): number {
    const results = this.getUserAssessmentHistory(userId);
    if (results.length === 0) return 0;

    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / results.length);
  }

  // Get skill improvement suggestions
  getImprovementSuggestions(skillId: string, score: number): string[] {
    if (score >= 80) {
      return [
        'Excellent work! Consider mentoring others in this skill.',
        'Look into advanced topics and edge cases.',
        'Contribute to open source projects using this skill.'
      ];
    } else if (score >= 60) {
      return [
        'Good foundation! Focus on practical projects to improve.',
        'Review areas where you lost points.',
        'Practice with real-world scenarios.'
      ];
    } else {
      return [
        'Review the fundamentals of this topic.',
        'Start with beginner-friendly tutorials.',
        'Practice basic concepts before moving to advanced topics.',
        'Consider taking a structured course.'
      ];
    }
  }
}

export const skillAssessmentService = SkillAssessmentService.getInstance();
export default SkillAssessmentService;