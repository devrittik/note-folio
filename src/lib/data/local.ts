import { JournalSchema, ProjectSchema, SiteSettingsSchema } from './types';

export const settings = SiteSettingsSchema.parse({
  name: 'Mr. Developer',
  role: 'Full-Stack Engineer',
  location: 'Kolkata, India',
  email: 'example@gmail.com',
  github: '#',
  linkedin: '#',
  whatsappNumber: '910001112223',
  whatsappDisplay: '+91 00011 12223',
  whatsappMessage: 'Hi, I found your engineering notebook.',
  availability: 'Open to opportunities',
  profileImageUrl: '/portrait-placeholder.jpg',
  heroHeadline: 'Full-stack developer building real-time & intelligent products.',
  heroDescription: 'I design and build full-stack products involving real-time communication, AI-powered workflows, and browser-native experiences.',
  coreFocus: ['Full-stack', 'Real-time', 'AI'],
  homeCtaLabel: 'Start a Conversation ↓',
  homeCtaButtonLabel: 'Open Contact Gateway ↗',
  intellectualApproach: 'I build tools that connect people and systems in real time. My work sits at the intersection of product engineering and infrastructure — where reliability meets interactivity.',
  workTitle: 'Selected Work',
  workIntro: 'Production systems engineered across real-time, AI, and browser-native environments.',
  journalTitle: 'Journal',
  journalIntro: 'Engineering insights, systems architecture, and lessons learned building the web.',
  skillGroups: [
    { label: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Zustand'] },
    { label: 'Backend', items: ['Node.js', 'Express', 'REST APIs', 'JWT', 'BullMQ'] },
    { label: 'Real-time', items: ['WebRTC', 'Socket.IO', 'WebSockets'] },
    { label: 'AI', items: ['Groq', 'Deepgram', 'LLM integration', 'Prompt engineering'] },
    { label: 'Infrastructure', items: ['MongoDB', 'MySQL', 'AWS S3', 'Vercel', 'Render'] }
  ],
  aboutTitle: 'Systems,\nnot screens.',
  aboutHeadline: 'I build reliable products where interaction, infrastructure, and product judgment meet.',
  aboutIntro: 'Full-stack developer experienced in real-time and AI-powered web applications. I focus on scalable frontend experiences, secure backend systems, asynchronous workflows, and production-ready architectures.',
  education: [
    { period: '2020—2023', institution: 'Graduate University', qualification: 'Bachelor of Technology in Electrical Engineering', detail: 'CGPA 7.76' },
    { period: '2015—2018', institution: 'Diploma College', qualification: 'Diploma in Electrical Engineering', detail: 'CGPA 7.9' }
  ],
  certifications: [
    { name: 'Full-Stack Web Development', issuer: 'Udemy' },
    { name: 'Python Programming', issuer: 'Kaggle' }
  ],
  contactTitle: 'Get in touch',
  contactHeadline: 'Open to collaboration, complex architecture challenges, and new opportunities.',
  contactIntro: 'Available for freelance, contract work, and full-time technical challenges.',
  responseTime: 'Usually under 12 hours // Direct dispatch pipeline.',
  timezone: 'GMT+5:30 (Kolkata) // Open to global collaboration.',
  resumeUrl: '/resume.pdf',
  footerCopyright: '© 2026 Mr. Developer'
});

export const projects = ProjectSchema.array().parse([
{slug:'p2pvideo',title:'P2PVideo',status:'live',year:2026,oneLiner:'Real-time video conferencing infrastructure for browser-based meetings with reliable multi-peer communication.',techStack:['WebRTC','Socket.IO','React','Node.js','MongoDB'],problem:'Browser meetings need reliable peer coordination, secure room state, and graceful handling of changing networks without native plugins.',system:[{title:'React SPA',sub:'Client interface'},{title:'WebRTC / Socket.IO',sub:'Real-time transport'},{title:'Node.js',sub:'Signaling & state'},{title:'MongoDB',sub:'Persistent records'}],buildFeatures:['4+ concurrent participants per room','12+ real-time system flows and socket event handlers','Screen sharing, chat, file sharing and host moderation','JWT authentication and duplicate-session protection','Sub-second peer connection setup','Deployed across Vercel, Render and MongoDB Atlas'],notes:[{challenge:'Synchronizing real-time room state across multiple peers.',decision:'Server-authoritative Socket.IO event architecture.',tradeoff:'Small signaling overhead for predictable consistency.'},{challenge:'Keeping calls usable across changing network conditions.',decision:'WebRTC negotiation with STUN/TURN fallback.',tradeoff:'Relay bandwidth cost in return for higher connectivity.'}],metrics:['4+ peers','12+ flows','99.9% uptime']},
{slug:'ai-interview',title:'AI Video Interview Platform',status:'built',year:2026,oneLiner:'Automated interviews with live voice interaction, transcript capture, and AI-generated candidate feedback.',techStack:['Deepgram','Groq','Socket.IO','BullMQ','MongoDB','AWS S3'],problem:'Live interview media, transcription, analysis and recruiter review have different latency and reliability requirements and cannot share one blocking workflow.',system:[{title:'React',sub:'Candidate & recruiter UI'},{title:'Socket.IO',sub:'Live session transport'},{title:'BullMQ',sub:'Async processing'},{title:'S3 / MongoDB',sub:'Media & records'}],buildFeatures:['Live voice interaction and transcript capture','Chunked video streaming with retry mechanisms','AI-generated candidate feedback','Recruiter dashboards and interview templates','Real-time proctoring with 9 flags','Cloud playback and review workflow'],notes:[{challenge:'Processing long media without blocking live sessions.',decision:'Separate ingest from asynchronous BullMQ workers.',tradeoff:'Eventual results instead of immediate evaluation.'}],metrics:['9 proctor flags','Async retry','Cloud media']},
{slug:'browser-ide',title:'Browser IDE',status:'live',year:2026,oneLiner:'A sandboxed, browser-native development environment with code execution, terminal, preview, and persistence.',techStack:['WebContainers','Monaco Editor','xterm.js','Zustand','MongoDB'],problem:'A credible IDE in the browser must keep editor state, a virtual filesystem, terminal sessions and persistent project state synchronized.',system:[{title:'Monaco',sub:'Editor surface'},{title:'WebContainers',sub:'Node runtime'},{title:'Zustand',sub:'Client state'},{title:'MongoDB',sub:'Persistence'}],buildFeatures:['13 reusable React components','3 focused Zustand stores','File and folder CRUD with multi-file tabs','Terminal tabs, live preview and panel resizing','Automatic project save and runtime restoration','4 REST API endpoints'],notes:[{challenge:'Synchronizing three sources of project truth.',decision:'Centralized store actions bridge UI, WebContainer FS and API.',tradeoff:'More explicit orchestration for deterministic state.'}],metrics:['13 components','3 stores','4 APIs']},
{slug:'expert-booking',title:'Expert Booking System',status:'live',year:2026,oneLiner:'A real-time booking platform with live slot synchronization, admin operations, and race-safe writes.',techStack:['React','Node.js','Socket.IO','React Query','MongoDB'],problem:'Concurrent users selecting the same expert slot creates race conditions while all clients still expect instant availability updates.',system:[{title:'React Query',sub:'Client cache'},{title:'Socket.IO',sub:'Live updates'},{title:'Express',sub:'Validated APIs'},{title:'MongoDB',sub:'Indexed bookings'}],buildFeatures:['Race-condition-safe booking creation','Duplicate booking prevention','Live slot synchronization under one second','Four-stage status tracking','React Query cache invalidation','Client and server validation'],notes:[{challenge:'Preventing two users from reserving one slot.',decision:'Atomic database constraints plus server-confirmed socket events.',tradeoff:'Optimistic UI waits for authoritative confirmation.'}],metrics:['<1s sync','4 stages','99.9% uptime']}
]);
export const journals = JournalSchema.array().parse([
{slug:'real-time-systems',title:'Building Real-Time Systems That Scale',date:'2026-08-01',readTime:8,excerpt:'Architecture decisions behind reliable, high-concurrency WebSocket systems.',tags:['Real-time','Architecture','WebSockets'],featured:true,body:['Real-time scale is less about one transport choice and more about controlling state ownership, failure domains, and backpressure.','I start with explicit event contracts, server-authoritative state, and observable connection lifecycles. Horizontal scale then becomes a routing problem instead of a rewrite.','Reliability comes from designing reconnects, idempotency, and stale-session cleanup as first-class flows—not exceptions.']},
{slug:'webcontainers-over-docker',title:'Why I Chose WebContainers Over Docker for Browser IDEs',date:'2026-06-01',readTime:6,excerpt:'Comparing sandboxed execution environments for browser-native development tools.',tags:['Devtools','WebContainers','Infrastructure'],featured:false,body:['Browser-native execution removes local setup and shortens the feedback loop from idea to running code.','WebContainers fit this product because the runtime, terminal, files and preview live close to the editor state. The tradeoff is a narrower runtime surface than remote Docker.']},
{slug:'ai-interview-pipelines',title:'Designing AI Interview Pipelines with Async Media Processing',date:'2026-04-01',readTime:7,excerpt:'Combining live transcription, background processing, and automated feedback.',tags:['AI','Deepgram','BullMQ','System design'],featured:false,body:['Media pipelines combine work with very different timing constraints. Live transcription must feel immediate; archival video and scoring can be eventually consistent.','Separating those paths makes retries safer and keeps a slow model call from interrupting an interview.']},
{slug:'booking-race-conditions',title:'Race Conditions in Real-Time Booking Systems',date:'2026-02-01',readTime:5,excerpt:'Practical strategies for handling concurrent writes in collaborative scheduling.',tags:['Concurrency','MongoDB','Real-time'],featured:false,body:['A green slot in the interface is only a hint. The database must be the final authority when several users act together.','Atomic constraints prevent duplicates; socket events then distribute the confirmed state to connected clients.']}
]).sort((a,b)=>b.date.localeCompare(a.date));
