// Experience and skills reflect the supplied CV. Certifications reflect the LinkedIn profile.

export type FigureId = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09';
export type ChapterId = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
export type Month = `${number}-${string}`; // 'YYYY-MM'

export const person = {
  name: 'Firat Adem Bilge',
  short: 'Adem Bilge',
  role: 'AI Engineer',
  tagline:
    'I build intelligent applications by combining machine learning and AI agents with experience in software engineering.',
  coverIntro:
    'My name comes into focus as you scroll. So does my story, through the things I’ve built and the questions I’m still working on.',
  based: 'Milan, Italy',
  studying: 'Politecnico di Milano',
  focus: 'AI engineering, intelligent systems & applied ML',
  statement: 'Complex systems. Clear thinking.',
  interest: 'I’m interested in the whole application, from how a model learns to how the software runs.',
};

export const about = [
  'I’m Adem, an AI engineer in Milan, studying Computer Science at Politecnico di Milano. I like building software that can answer questions, use tools, and do something useful with the result. Getting all three to happen reliably keeps me occupied.',
  'My work has taken me from spotting unusual network traffic at ULAK to fingerprint models and large-scale video analytics at HAVELSAN. More recently, I built a Telegram support agent at Entervia that could retrieve session information and handle booking tasks. Somewhere along that route, 600 TB started sounding like a reasonable amount of data.',
  'These days, I’m most interested in AI agents and the software around them. I enjoy following a problem from the model through the API to the deployment, including the bits that stubbornly refuse to behave. My computer vision research also led to Tinysign, published in 2024.',
];

export const headline = [
  { value: 600, suffix: '+ TB', label: 'Data processed with Dask', kind: 'bar' as const },
  { value: 300, suffix: '+ nodes', label: 'Kubernetes in production', kind: 'nodes' as const },
  { value: 86, suffix: '% IoU', label: 'Fingerprint segmentation', kind: 'overlap' as const },
];

export type Role = {
  id: string;
  company: string;
  title: string;
  start: Month;
  end: Month;
  type: string;
  context: string;
  location: string;
  url: string;
  lede: string;
  summary: string[];
  contributions: string[];
  stack: string[];
  figure: FigureId;
};

export const roles: Role[] = [
  {
    id: 'entervia',
    company: 'Entervia',
    title: 'AI Engineer',
    start: '2025-12',
    end: '2026-08',
    type: 'Full-time',
    context: 'Early-stage startup',
    location: 'Milan, Italy',
    url: 'https://www.entervia.com.tr/',
    lede: "A Telegram support agent that resolved 50% of support queries and reached 96% retrieval accuracy.",
    summary: [
      '“Did my payment go through?” is a short question with a lot behind it. At Entervia, the Telegram agent had to find the right session or FAQ, then check the payment before it could answer. I built that path with LangChain and the OpenAI API. Hybrid search in pgvector found likely matches, reranking put the best ones first, and FastAPI tools handled booking checks, payment verification, and secure invitations.',
      'I used LangSmith and pytest to check retrieval accuracy, tool calls, and failure handling across 87 cases. If a case went wrong, I could see where the agent had lost the thread. The suite reached a 94% pass rate.',
      'I set up CI/CD for the agent on AWS ECS and RDS and kept LangSmith tracing on in production. The service maintained 99.9% uptime, and the agent resolved half of incoming support queries.',
    ],
    contributions: [
      "Built a LangChain Telegram agent with the OpenAI API that resolved 50% of support queries.",
      "Built hybrid pgvector retrieval with reranking over sessions and FAQs, reaching 96% retrieval accuracy.",
      "Integrated FastAPI tools for booking checks, payment verification, and secure invitations.",
      "Evaluated RAG accuracy, tool calls, and failure handling on 87 cases with LangSmith and pytest, achieving a 94% pass rate.",
      "Deployed the agent on AWS ECS and RDS with LangSmith tracing and CI/CD, maintaining 99.9% uptime.",
    ],
    stack: ['Python', 'LangChain', 'OpenAI API', 'RAG', 'PostgreSQL', 'pgvector', 'FastAPI', 'LangSmith', 'pytest', 'AWS ECS', 'RDS', 'CI/CD'],
    figure: '07',
  },
  {
    id: 'havelsan-swe',
    company: 'HAVELSAN',
    title: 'Software Engineer',
    start: '2023-06',
    end: '2025-03',
    type: 'Full-time',
    context: 'Defense & IT — EyeMiner video analytics platform',
    location: 'Ankara, Turkey',
    url: 'https://www.havelsan.com/en/products/eyeminer-video-analytic-system-iot',
    lede: "Video analytics across 600+ TB of data, with 400+ Dask workers and 300K+ requests a day.",
    summary: [
      'At HAVELSAN, I worked on EyeMiner, where the video archive ran to more than 600 TB. I split the analytics workload across 400+ Dask workers on Linux so it could run in parallel. The Docker services went out as Helm charts to a Kubernetes cluster of more than 300 nodes.',
      'A request could pass through a Kafka queue and one of five Python gRPC services, with its metadata in PostgreSQL. At 300K+ requests a day, figuring out where a job had stalled was part of keeping the system running. I used Prometheus and Grafana to see how the system was behaving, and Elasticsearch and diagnostic tools to look into individual problems.',
      'A cluster dashboard could tell me that work was slowing down. To see what was happening to one job, I had to follow it from the queue to the service handling it and check what the system had recorded along the way. That was the part of the work where the monitoring tools earned their place.',
    ],
    contributions: [
      "Built a Dask platform on Linux that processed 600+ TB of video data across 400+ workers.",
      "Packaged Docker services with Helm and deployed them to a 300+ node Kubernetes cluster.",
      "Developed five Python gRPC microservices with PostgreSQL metadata storage.",
      "Implemented Kafka queues and partitions for parallel video analytics, handling 300K+ requests a day.",
      "Deployed Prometheus, Grafana, and Elasticsearch on cluster nodes and built monitoring and diagnostic tools.",
    ],
    stack: ['Python', 'Dask', 'Linux', 'Docker', 'Helm', 'Kubernetes', 'gRPC', 'PostgreSQL', 'Apache Kafka', 'Prometheus', 'Grafana', 'Elasticsearch'],
    figure: '04',
  },
  {
    id: 'havelsan-mle',
    company: 'HAVELSAN',
    title: 'Machine Learning Engineer',
    start: '2022-06',
    end: '2023-06',
    type: 'Full-time',
    context: 'AFIS fingerprint recognition system',
    location: 'Ankara, Turkey',
    url: 'https://www.havelsan.com/en/solutions/security-systems/ministry-interior-fingerprint-recognition-system-afis',
    lede: "Fingerprint segmentation at 86% IoU on a dataset of more than 10,000 clean and latent prints.",
    summary: [
      'On a clean fingerprint, the ridges are easy to pick out. On a faint latent print, even deciding where the fingerprint ends can be hard. I worked with more than 10,000 clean and latent prints at HAVELSAN, using OpenCV morphology to isolate the fingerprint regions and setting aside difficult examples to include in training.',
      'I compared five PyTorch segmentation architectures on how closely their masks matched the reference masks. U-Net came out ahead at 82% IoU. That gave me a model to work with. Fine-tuning it with a pretrained encoder, Dice loss, and data augmentation brought the score to 86%.',
      'An individual mask makes that score easier to picture. On a faint print, a mask that stops too early can leave out ridges, while one that reaches too far can pick up marks from the surrounding surface. Both errors count against IoU, which gives the comparison a concrete meaning.',
    ],
    contributions: [
      "Built a PyTorch segmentation model on 10,000+ clean and latent fingerprints, reaching 86% IoU.",
      "Compared five architectures and selected U-Net after it reached 82% IoU.",
      "Used OpenCV morphology to isolate fingerprint regions and curated hard latent prints.",
      "Fine-tuned U-Net with Dice loss, a pretrained encoder, and augmentation, improving IoU by four percentage points.",
    ],
    stack: ['Python', 'PyTorch', 'OpenCV', 'U-Net', 'Dice loss', 'Data augmentation'],
    figure: '01',
  },
  {
    id: 'ulak',
    company: 'ULAK Haberlesme',
    title: 'Machine Learning Engineer',
    start: '2020-06',
    end: '2020-10',
    type: 'Internship',
    context: 'National telecom infrastructure company',
    location: 'Istanbul, Turkey',
    url: 'https://www.ulakhaberlesme.com.tr/en/urun/sd-wan-en/',
    lede: 'A PyTorch autoencoder for detecting unusual traffic in an SD-WAN monitoring system.',
    summary: [
      'An unusually long connection can be ordinary traffic. During my ULAK internship, I worked with SD-WAN logs to give the monitoring system more context. I built Pandas pipelines to clean the logs and describe each connection by its packet count, byte rate, and duration. Those features became the inputs to a PyTorch autoencoder for detecting unusual traffic.',
      'Precision, recall, and F1 gave me a view of how the model performed across the data. I also went back to individual flows it had flagged by mistake. Looking at those false positives alongside the input features helped me understand where the detector needed work.',
    ],
    contributions: [
      'Built a PyTorch autoencoder to detect unusual network traffic in an SD-WAN monitoring system.',
      'Built Pandas pipelines to clean logs and extract packet counts, byte rates, and flow durations for training.',
      'Evaluated the autoencoder with precision, recall, and F1, then analyzed false positives to improve detection.',
    ],
    stack: ['Python', 'PyTorch', 'Autoencoder', 'Pandas', 'Feature engineering', 'Precision', 'Recall', 'F1'],
    figure: '03',
  },
];

export const experienceIntro =
  '3+ years of engineering experience across AI agents, distributed systems, computer vision, and backend development.';

export type Project = {
  id: string;
  name: string;
  line: string;
  description: string;
  overview?: string;
  sections: { title: string; body: string[] }[];
  stack: string[];
  links: { label: string; href: string }[];
  figure: FigureId;
};

export const projectsIntro =
  'Three projects in administrative guidance, document retrieval, and encrypted messaging.';

export const projects: Project[] = [
  {
    id: 'practicamia',
    name: 'PracticaMIA',
    line: 'An AI assistant for navigating administrative procedures.',
    description:
      'PracticaMIA is designed to help people navigate Italian administrative procedures through an English–Italian workspace and an AI agent. Beginning with changes of registered residence in Milan, it brings questions, official guidance, documents, and case progress together in one place.',
    overview: 'The intended experience starts with a simple description of a situation. The assistant will identify the information it needs, explain the relevant steps using reviewed official sources, and help prepare a case that the user can revisit and review before continuing to the official channel.',
    sections: [
      {
        title: 'Case guidance',
        body: [
          'The AI agent will turn a resident’s goal into a saved case. It will ask focused questions, look up guidance, and update the next steps when an answer changes. Residents will be able to resume with their confirmed answers in place.',
        ],
      },
      {
        title: 'Evidence behind the answer',
        body: [
          'Retrieval-augmented generation (RAG) will combine semantic and keyword search to find reviewed municipal guidance and cite specific versions of its sources. A separate rules engine will match approved requirements to the facts of each case.',
        ],
      },
      {
        title: 'Documents and preparation',
        body: [
          'PracticaMIA will extract fields from supported documents for the resident to confirm and flag discrepancies against their answers. A checklist will track missing information and materials before the resident reviews the case and continues to the official submission channel.',
        ],
      },
      {
        title: 'Architecture and evaluation',
        body: [
          'The Next.js and TypeScript interface uses Auth0 for sign-in. A Python FastAPI backend verifies case ownership and accesses PostgreSQL through SQLAlchemy. LangChain and pgvector will support the AI workflow, with evaluation focused on retrieval quality, tool selection, and citation accuracy.',
        ],
      },
    ],
    stack: ['Next.js', 'TypeScript', 'Python', 'FastAPI', 'LangChain', 'RAG', 'pgvector', 'Auth0', 'PostgreSQL', 'SQLAlchemy'],
    links: [
      { label: 'Repository', href: 'https://github.com/adembilge/PracticaMIA' },
      { label: 'Visit PracticaMIA', href: 'https://practicamia.vercel.app' },
    ],
    figure: '09',
  },
  {
    id: 'cognify',
    name: 'Cognify',
    line: 'Personal knowledge, made searchable.',
    description:
      'A second brain that reads your documents. An asynchronous pipeline extracts, summarizes, classifies, and embeds files, with semantic search and cited answers across your vault.',
    overview: 'A scan, a photo, and a plain-text note can all end up in the same vault. Cognify extracts the text and indexes it by meaning, so you can find a passage even when you remember the idea but have forgotten the exact wording. If you ask a question, the answer cites the passages it draws from so you can go back to the source.',
    sections: [
      {
        title: 'Document intelligence',
        body: [
          'Cognify is a full-stack personal knowledge management system — a second brain that reads your documents. Scanned PDFs, images, and plain-text files enter an asynchronous Celery worker pipeline.',
          'OpenCV preprocessing and Tesseract OCR extract text. DistilBART summarizes it, a zero-shot MNLI classifier tags topics, and Sentence-BERT creates semantic embeddings for search and analysis.',
        ],
      },
      {
        title: 'A workspace for knowledge',
        body: [
          'The Next.js 16 dashboard brings together a knowledge vault, Recharts analytics, and browser-native PDF tools to split, merge, and reorder documents.',
          'Document versioning preserves parent-child lineage. Sensitive mode, soft-delete recovery, collections, annotations, bookmarks, and notes keep documents and quotations organized.',
        ],
      },
      {
        title: 'Retrieval & answers',
        body: [
          'Cosine similarity search finds meaning across documents rather than relying only on keyword matches. In the global RAG chat, RoBERTa generates cited answers from the most relevant chunks in the vault.',
        ],
      },
      {
        title: 'Access & operations',
        body: [
          'The Django REST backend enforces JWT authentication, user-scoped data isolation on every query, and audit logging for every action.',
          '35 automated tests, Docker Compose orchestration, and Prometheus worker-latency metrics support the implementation. MIT licensed.',
        ],
      },
    ],
    stack: ['Python', 'Django', 'Next.js', 'Celery', 'Transformers', 'Sentence-BERT', 'Docker', 'Prometheus'],
    links: [{ label: 'Repository', href: 'https://github.com/adembilge/Cognify' }],
    figure: '06',
  },
  {
    id: 'cryptme',
    name: 'CryptMe',
    line: 'A closer look at encrypted communication.',
    description:
      'A Java client-server messaging project exploring symmetric encryption, TCP sockets, and local encryption and decryption in a Swing desktop client.',
    sections: [
      {
        title: 'Real-time messaging',
        body: [
          'CryptMe is a client-server messaging application built entirely in Java. Users register unique usernames, connect to a central server, and join a shared chat room.',
          'TCP sockets carry encrypted payloads between connected clients. The server manages connections, message routing, and disconnects without reading plaintext.',
        ],
      },
      {
        title: 'Encryption in the client',
        body: [
          'The Swing GUI performs encryption and decryption locally. Users can switch at runtime between AES (128-bit) with a 16-byte initialization vector and DES (56-bit) with an 8-byte IV.',
          'Selecting a method generates a fresh secret key and IV for the session and distributes them to participants.',
        ],
      },
      {
        title: 'Implementation notes',
        body: [
          'This learning project demonstrates symmetric cryptography in a multi-user chat. Its original implementation includes DES and a persistent log of generated session keys and IVs for auditability.',
        ],
      },
    ],
    stack: ['Java', 'AES', 'DES', 'Socket Programming', 'Swing GUI'],
    links: [{ label: 'Repository', href: 'https://github.com/adembilge/CryptMe' }],
    figure: '05',
  },
];

export const researchIntro = 'Computer vision and the reliability of AI-led scientific analysis.';

export const tinysign = {
  id: 'tinysign',
  name: 'Tinysign',
  title: 'Sign Language Recognition in Low-Resolution Settings',
  kicker: 'Low-resolution sign language recognition',
  role: 'Co-author',
  blurb:
    'Co-author of research on recognizing sign language when video quality and bandwidth are limited. Published in Signal, Image and Video Processing, Springer Nature.',
  venue: 'Signal, Image and Video Processing',
  publisher: 'Springer Nature',
  citation: 'SIViP 18, 6881–6890',
  date: 'June 2024',
  place: 'London, United Kingdom',
  doi: '10.1007/s11760-024-03358-z',
  abstract:
    'In Tinysign, we studied sign language recognition in low-resolution video, including privacy-sensitive settings such as healthcare. We introduced the first benchmark for this setting and developed a pose-conditioned super-resolution module and I3D classifier. The system reached 47.5% test accuracy against a 25.5% baseline. I co-authored the paper, published in Signal, Image and Video Processing in 2024.',
  highlights: [
    'Introduced the first benchmark for low-resolution sign language recognition.',
    'Addressed recognition in privacy-sensitive and low-bandwidth video scenarios.',
    'Developed a pose-conditioned super-resolution module and I3D classifier for low-resolution sign language recognition.',
    'Reached 47.5% test accuracy against a 25.5% baseline.',
  ],
  accuracy: 47.5,
  baseline: 25.5,
  links: [
    { label: 'DOI', href: 'https://doi.org/10.1007/s11760-024-03358-z' },
    { label: 'Springer', href: 'https://link.springer.com/article/10.1007/s11760-024-03358-z' },
    {
      label: 'Google Scholar',
      href: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=qxDWiIQAAAAJ&citation_for_view=qxDWiIQAAAAJ:u5HHmVD_uO8C',
    },
  ],
  figure: '02' as FigureId,
};

export const sycoscience = {
  id: 'sycoscience',
  name: 'Sycoscience',
  title: 'Testing Hypothesis-Driven Bias in Agentic Data Science',
  status: 'Master’s thesis · In progress',
  expected: 'April 2027',
  body: [
    'My current Master’s thesis at Politecnico di Milano investigates whether a user’s preferred hypothesis can influence a data-science agent’s statistical choices and conclusions, even when the dataset stays the same.',
    'I’m developing a reproducible evaluation framework with controlled synthetic datasets, neutral and opposing prompts, and logged Python workflows. The aim is to distinguish valid differences in analysis from unsupported conclusions, selective data use, or methods chosen to support a desired answer.',
  ],
  figure: '08' as FigureId,
};

export type School = {
  id: string;
  name: string;
  degree: string;
  detail?: string;
  start: Month;
  end: Month;
  city: string;
  url: string;
  body: string[];
  coursework: string[];
};

export const educationIntro =
  'A foundation in computer science. A continuing interest in how research becomes useful software.';

export const education: School[] = [
  {
    id: 'polimi',
    name: 'Politecnico di Milano',
    degree: 'Master of Science — Computer Science and Engineering',
    start: '2025-04',
    end: '2027-04',
    city: 'Milan, Italy',
    url: 'https://www.polimi.it/en/',
    body: [
      'My Master’s at Politecnico di Milano brings together advanced AI techniques and the engineering behind applications that use them. I’m particularly interested in language models that can retrieve information and act through software tools.',
      'Computing Platforms for AI and Software Engineering 2 connect that work to questions I’ve run into on the job, from where a workload runs to how a service is built and maintained.',
    ],
    coursework: [
      'Advanced AI Techniques',
      'Computing Platforms for AI',
      'Engineering AI-Enabled Software Systems',
      'Software Engineering 2',
      'From LLMs to Agentic AI',
    ],
  },
  {
    id: 'hacettepe',
    name: 'Hacettepe University',
    degree: 'Bachelor of Science — Computer Science',
    detail: 'GPA 3.33/4 · Honor Student',
    start: '2017-10',
    end: '2022-05',
    city: 'Ankara, Turkey',
    url: 'https://www.hacettepe.edu.tr/english',
    body: [
      'I studied Computer Science at Hacettepe University, graduating with a GPA of 3.33/4 as an Honor Student. Algorithms, data structures, databases, and software engineering formed the foundation of my degree. As I progressed, I became more interested in machine learning and computer vision, and took courses in those areas alongside deep learning.',
      'My thesis was in computer vision and later became Tinysign, a paper I co-authored that was published in 2024. Working on it gave me experience with developing an idea, testing it, and explaining the results in a research paper. That combination of programming, experimentation, and evaluation still shapes how I approach machine learning work.',
    ],
    coursework: ['Algorithms and Data Structures', 'Software Engineering', 'Databases', 'Deep Learning', 'Machine Learning', 'Computer Vision'],
  },
  {
    id: 'czestochowa',
    name: 'Częstochowa University of Technology',
    degree: 'Erasmus+ Exchange Program',
    detail: 'International exchange semester',
    start: '2019-09',
    end: '2020-02',
    city: 'Częstochowa, Poland',
    url: 'https://www.pcz.pl/en/',
    body: [
      'I spent an Erasmus+ semester at Czestochowa University of Technology in Poland, studying applications of AI, machine learning, and computer vision. I wanted to explore these subjects in a different academic environment. Working in international project teams also gave me practice in explaining technical ideas across different languages and working styles, and helped me become more comfortable studying and collaborating abroad.',
    ],
    coursework: ['Applications of Artificial Intelligence', 'Machine Learning', 'Computer Vision'],
  },
];

/** Where each course visibly shows up later. Refs are figure ids or entry ids. */
export const courseLinks: Record<string, string[]> = {
  'Advanced AI Techniques': ['08'],
  'Computing Platforms for AI': ['04'],
  'Engineering AI-Enabled Software Systems': ['07', '06'],
  'Software Engineering 2': ['06', '07'],
  'From LLMs to Agentic AI': ['07', '08'],
  'Algorithms and Data Structures': ['03'],
  'Software Engineering': ['06', '05'],
  Databases: ['06', '07'],
  'Deep Learning': ['01', '02'],
  'Machine Learning': ['03', '01'],
  'Computer Vision': ['02', '01'],
  'Applications of Artificial Intelligence': ['03'],
};

/** Route stops in time order (real coordinates). */
export const route = [
  { city: 'Ankara', year: 2017, what: 'Hacettepe University, BSc', lat: 39.9334, lon: 32.8597 },
  { city: 'Częstochowa', year: 2019, what: 'Erasmus+ semester', lat: 50.8118, lon: 19.1203 },
  { city: 'Istanbul', year: 2020, what: 'ULAK internship', lat: 41.0082, lon: 28.9784 },
  { city: 'Ankara', year: 2022, what: 'HAVELSAN', lat: 39.9334, lon: 32.8597 },
  { city: 'Milan', year: 2025, what: 'Politecnico di Milano, then Entervia', lat: 45.4642, lon: 9.19 },
];

export const competencies = [
  {
    id: 'ai',
    name: 'Generative & Agentic AI',
    body: 'I build agents that retrieve information, call backend tools, and answer support questions. I evaluate retrieval, tool calls, and failure handling.',
    tools: ['LLMs', 'RAG', 'Tool Calling', 'LangChain', 'LangSmith', 'LLM Evaluation', 'MCP', 'pgvector', 'OpenAI API'],
  },
  {
    id: 'ml',
    name: 'Machine Learning & Data Engineering',
    body: 'I train computer vision models and build data pipelines for workloads ranging from fingerprint segmentation to large-scale video analytics.',
    tools: ['PyTorch', 'OpenCV', 'Pandas', 'Dask', 'Apache Kafka'],
  },
  {
    id: 'swe',
    name: 'Programming, Backend & Databases',
    body: 'I build Python APIs and gRPC services, store application data in PostgreSQL, and use Elasticsearch for diagnostics.',
    tools: ['Python', 'FastAPI', 'gRPC', 'PostgreSQL', 'Elasticsearch'],
  },
  {
    id: 'ops',
    name: 'Cloud & DevOps',
    body: 'I deploy services on AWS and Kubernetes, automate releases with CI/CD, and test behavior with pytest.',
    tools: ['AWS (S3, Lambda, ECS, RDS, Bedrock, SageMaker)', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Git', 'Linux', 'pytest'],
  },
];

export const competencyIntro =
  'I build and evaluate AI agents, develop backend services, and run machine learning workloads in production.';

export const skillGroups = competencies.map(({ name, tools }) => ({ name, items: tools }));

/**
 * Back-of-book index: term -> where the evidence is.
 * Refs are figure ids ('04'), entry ids ('cert-linux') or a competency id ('§ai') when the site lists the skill without a specific project.
 */
export const skillIndex: Record<string, string[]> = {
  'AI Agents': ['07', '08', '09'],
  Auth0: ['09'],
  'Apache Kafka': ['04'],
  AWS: ['§ops'],
  Autoencoder: ['03'],
  'AWS ECS': ['07'],
  'AWS Lambda': ['§ops'],
  'Amazon RDS': ['07'],
  'Amazon S3': ['§ops'],
  'Amazon Bedrock': ['§ops'],
  'Amazon SageMaker': ['§ops'],
  AES: ['05'],
  'CI/CD': ['07'],
  Celery: ['06'],
  Dask: ['04'],
  DES: ['05'],
  Django: ['06'],
  'Dice loss': ['01'],
  Docker: ['04', '06'],
  Elasticsearch: ['04'],
  FastAPI: ['07', '09'],
  Git: ['§ops'],
  Grafana: ['04'],
  gRPC: ['04'],
  Helm: ['04'],
  'Hybrid Search': ['07', '09'],
  I3D: ['02'],
  'Isolation Forest': ['03'],
  Java: ['05'],
  Jenkins: ['§ops'],
  Kubernetes: ['04'],
  LangChain: ['07', '09'],
  LangSmith: ['07'],
  'LLM Evaluation': ['07'],
  Linux: ['04'],
  LLMs: ['07', '08'],
  MCP: ['cert-linux'],
  'Next.js': ['06', '09'],
  'OpenAI API': ['07'],
  OpenCV: ['01', '06'],
  Pandas: ['03'],
  pgvector: ['07', '09'],
  PostgreSQL: ['07', '04', '09'],
  Prometheus: ['04', '06'],
  pytest: ['07'],
  Python: ['07', '04', '01', '03', '06', '09'],
  PyTorch: ['01', '02', '03'],
  RAG: ['07', '06', '09'],
  Reranking: ['07'],
  'REST APIs': ['07', '06'],
  'Sentence-BERT': ['06'],
  'Socket Programming': ['05'],
  SQL: ['07', '04'],
  SQLAlchemy: ['09'],
  'Super-resolution': ['02'],
  'Swing GUI': ['05'],
  'Tool Calling': ['07'],
  Transformers: ['06'],
  TypeScript: ['09'],
  'U-Net': ['01'],
};

export type Language = { name: string; level: string; weight: number; body: string[] };

export const languages: Language[] = [
  {
    name: 'Turkish',
    level: 'Native',
    weight: 1,
    body: [
      'Turkish is my native language and the one I grew up speaking. I use it naturally in everyday life, with family and friends, and in professional conversations.',
    ],
  },
  {
    name: 'English',
    level: 'C1 · Professional',
    weight: 0.8,
    body: [
      'English is a language I use comfortably for both my studies and professional work. I use it to read technical documentation and research papers, discuss engineering problems, and explain my ideas. I’m comfortable going into detail, asking questions, and working through a problem with other people in English.',
      'Studying and collaborating in international environments has made it a natural part of how I communicate. I can take part in technical meetings, write documentation, and talk about my work without needing to switch languages. I describe my level as C1, with the confidence to use English throughout a professional conversation.',
    ],
  },
  {
    name: 'Italian',
    level: 'B1 · Intermediate',
    weight: 0.5,
    body: [
      'I’m learning Italian while living in Milan, and I try to use it in everyday conversations. I can talk about familiar topics, explain what I need, and handle simple interactions in daily life. I’m still building my vocabulary and fluency, so regular practice matters to me.',
      'At B1, I can also manage simple business conversations when the topic is familiar and the discussion is straightforward. For a detailed technical discussion, I’m more confident in English. My aim is to become more comfortable using Italian in professional settings as I keep learning and speaking it day to day.',
    ],
  },
];

export const certificationsIntro =
  'Building my knowledge of AI, intelligent agents, and the tools to put them into practice.';

export const certifications: {
  id: string;
  issuer: string;
  title: string;
  body?: string;
  date: string;
  href: string;
  featured?: boolean;
}[] = [
  {
    id: 'cert-datacamp-ai-engineer',
    issuer: 'DataCamp',
    title: 'AI Engineer for Developers Associate',
    body: 'Putting language models to work in Python applications, from connecting a model to shaping its responses through prompt engineering.',
    date: 'November 2026',
    href: 'https://www.datacamp.com/certificate/AIEDA0015684168987',
    featured: true,
  },
  {
    id: 'cert-datacamp-eu-ai-act',
    issuer: 'DataCamp',
    title: 'EU AI Act Literacy',
    body: 'Understanding the risks behind AI systems and the responsibilities that come with using them under the EU AI Act.',
    date: 'November 2026',
    href: 'https://www.datacamp.com/skill-verification/EU0020332624740',
  },
  {
    id: 'cert-linux',
    issuer: 'The Linux Foundation',
    title: 'Secure AI/ML-Driven Software Development',
    body: 'Secure use of AI coding assistants, code review, and MCP server development.',
    date: 'October 2026',
    href: 'https://www.credly.com/badges/4634a117-e2d3-4133-8bfa-6886bfe5d98b/linked_in_profile',
  },
  {
    id: 'cert-databricks',
    issuer: 'Databricks',
    title: 'Building Agentic Applications on Databricks',
    body: 'Knowledge badge covering agent tools, multi-agent systems, and MLflow tracing.',
    date: 'October 2026',
    href: 'https://credentials.databricks.com/17d43d2c-8be1-4c74-a20a-dea404682ce5',
  },
];

export const contact = {
  source: 'https://github.com/adembilge/portfolio',
  heading: 'Let’s build what’s next.',
  lede: 'Have a role, a challenging problem, or an idea worth exploring? I’d like to hear about it.',
  emails: ['firatadem.bilge@gmail.com', 'firatadem.bilge@mail.polimi.it'],
  cv: `${import.meta.env.BASE_URL}firat-adem-bilge-cv.pdf`,
  links: [
    { label: 'GitHub', href: 'https://github.com/adembilge' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/adembilge/' },
    { label: 'Google Scholar', href: 'https://scholar.google.com/citations?user=qxDWiIQAAAAJ&hl=en' },
  ],
};

export type FigureMeta = {
  id: FigureId;
  title: string;
  source: string;
  chapter: ChapterId;
  year: number;
  entry: string;
  signal: string;
};

/** The weak signal each figure is about. */
export const figures: FigureMeta[] = [
  { id: '01', title: 'Ridge', source: 'HAVELSAN · AFIS', chapter: 'II', year: 2022, entry: 'havelsan-mle', signal: 'a smudged fingerprint' },
  { id: '02', title: 'Sixteen pixels', source: 'Tinysign', chapter: 'IV', year: 2024, entry: 'tinysign', signal: 'a sign in a 16-pixel video' },
  { id: '03', title: 'The odd packet', source: 'ULAK · SD-WAN', chapter: 'II', year: 2020, entry: 'ulak', signal: 'one packet that does not belong' },
  { id: '04', title: '600 TB', source: 'HAVELSAN · EyeMiner', chapter: 'II', year: 2023, entry: 'havelsan-swe', signal: 'a haystack of video' },
  // Project years come from the GitHub repo creation dates; the site lists none.
  { id: '05', title: 'Cipher', source: 'CryptMe', chapter: 'III', year: 2023, entry: 'cryptme', signal: 'a message the server cannot read' },
  { id: '06', title: 'Vault', source: 'Cognify', chapter: 'III', year: 2026, entry: 'cognify', signal: 'a scanned page' },
  { id: '07', title: 'You’re booked.', source: 'Entervia', chapter: 'II', year: 2025, entry: 'entervia', signal: 'a question that must end in a real booking' },
  { id: '08', title: 'The leading question', source: 'Sycoscience', chapter: 'IV', year: 2026, entry: 'sycoscience', signal: 'a prompt that wants an answer' },
  { id: '09', title: 'A move through Milan', source: 'PracticaMIA', chapter: 'III', year: 2026, entry: 'practicamia', signal: 'one answer that changes the route' },
];

export const chapters: { id: ChapterId; title: string; subject: string; anchor: string }[] = [
  { id: 'I', title: 'The Author', subject: 'About', anchor: 'author' },
  { id: 'II', title: 'Field Work', subject: 'Experience', anchor: 'field-work' },
  { id: 'III', title: 'Specimens', subject: 'Projects', anchor: 'specimens' },
  { id: 'IV', title: 'Publications', subject: 'Research', anchor: 'publications' },
  { id: 'V', title: 'Schooling', subject: 'Education', anchor: 'schooling' },
  { id: 'VI', title: 'Index', subject: 'Skills, languages, certifications', anchor: 'index' },
];

export const figureById = Object.fromEntries(figures.map((f) => [f.id, f])) as Record<FigureId, FigureMeta>;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function fmtMonth(m: Month): string {
  const [y, mo] = m.split('-');
  return `${MONTHS[Number(mo) - 1]} ${y}`;
}
export function monthIndex(m: Month): number {
  const [y, mo] = m.split('-');
  return Number(y) * 12 + Number(mo) - 1;
}
