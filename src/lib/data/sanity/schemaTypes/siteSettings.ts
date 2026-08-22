import { defineField, defineType } from 'sanity';

export const siteSettingsSchema = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identity', default: true },
    { name: 'home', title: 'Homepage' },
    { name: 'about', title: 'About' },
    { name: 'contact', title: 'Contact' }
  ],
  initialValue: {
    name: 'Mr. Developer',
    role: 'Full-Stack Engineer',
    location: 'Kolkata, India',
    email: 'example@gmail.com',
    github: 'https://github.com/',
    linkedin: 'https://www.linkedin.com/',
    whatsappNumber: '910001112223',
    whatsappDisplay: '+91 00011 12223',
    whatsappMessage: 'Hi, I found your engineering notebook.',
    availability: 'Open to opportunities',
    footerCopyright: '© 2026 Mr. Developer',
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
      { _type: 'skillGroup', _key: 'frontend', label: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Zustand'] },
      { _type: 'skillGroup', _key: 'backend', label: 'Backend', items: ['Node.js', 'Express', 'REST APIs', 'JWT', 'BullMQ'] },
      { _type: 'skillGroup', _key: 'realtime', label: 'Real-time', items: ['WebRTC', 'Socket.IO', 'WebSockets'] },
      { _type: 'skillGroup', _key: 'ai', label: 'AI', items: ['Groq', 'Deepgram', 'LLM integration', 'Prompt engineering'] },
      { _type: 'skillGroup', _key: 'infrastructure', label: 'Infrastructure', items: ['MongoDB', 'MySQL', 'AWS S3', 'Vercel', 'Render'] }
    ],
    aboutTitle: 'Systems,\nnot screens.',
    aboutHeadline: 'I build reliable products where interaction, infrastructure, and product judgment meet.',
    aboutIntro: 'Full-stack developer experienced in real-time and AI-powered web applications. I focus on scalable frontend experiences, secure backend systems, asynchronous workflows, and production-ready architectures.',
    education: [
      { _type: 'education', _key: 'btech', period: '2020—2023', institution: 'Graduate University', qualification: 'Bachelor of Technology in Electrical Engineering', detail: 'CGPA 7.76' },
      { _type: 'education', _key: 'diploma', period: '2015—2018', institution: 'Diploma College', qualification: 'Diploma in Electrical Engineering', detail: 'CGPA 7.9' }
    ],
    certifications: [
      { _type: 'certification', _key: 'fullstack', name: 'Full-Stack Web Development', issuer: 'Udemy' },
      { _type: 'certification', _key: 'python', name: 'Python Programming', issuer: 'Kaggle' }
    ],
    contactTitle: 'Get in touch',
    contactHeadline: 'Open to collaboration, complex architecture challenges, and new opportunities.',
    contactIntro: 'Available for freelance, contract work, and full-time technical challenges.',
    responseTime: 'Usually under 12 hours // Direct dispatch pipeline.',
    timezone: 'GMT+5:30 (Kolkata) // Open to global collaboration.'
  },
  fields: [
    defineField({ name: 'name', type: 'string', group: 'identity', validation: (Rule) => Rule.required() }),
    defineField({ name: 'role', type: 'string', group: 'identity', validation: (Rule) => Rule.required() }),
    defineField({ name: 'location', type: 'string', group: 'identity', validation: (Rule) => Rule.required() }),
    defineField({ name: 'email', type: 'email', group: 'identity', validation: (Rule) => Rule.required() }),
    defineField({ name: 'github', type: 'url', group: 'identity', validation: (Rule) => Rule.required() }),
    defineField({ name: 'linkedin', type: 'url', group: 'identity', validation: (Rule) => Rule.required() }),
    defineField({ name: 'whatsappNumber', title: 'WhatsApp number (international digits only)', type: 'string', group: 'identity', validation: (Rule) => Rule.required().regex(/^\d+$/) }),
    defineField({ name: 'whatsappDisplay', title: 'WhatsApp display number', type: 'string', group: 'identity', validation: (Rule) => Rule.required() }),
    defineField({ name: 'whatsappMessage', title: 'WhatsApp prefilled message', type: 'text', rows: 2, group: 'identity', validation: (Rule) => Rule.required() }),
    defineField({ name: 'availability', type: 'string', group: 'identity', validation: (Rule) => Rule.required() }),
    defineField({ name: 'profileImage', title: 'Profile portrait', type: 'image', group: 'identity', options: { hotspot: true }, description: 'Optional. The local editorial placeholder is used until an image is uploaded.' }),
    defineField({ name: 'resumeFile', title: 'Résumé PDF', type: 'file', group: 'identity', options: { accept: 'application/pdf' } }),
    defineField({ name: 'resumeUrl', title: 'External résumé URL', type: 'url', group: 'identity', description: 'Used only when no PDF is uploaded.' }),
    defineField({ name: 'footerCopyright', type: 'string', group: 'identity', validation: (Rule) => Rule.required() }),

    defineField({ name: 'heroHeadline', type: 'text', rows: 2, group: 'home', validation: (Rule) => Rule.required() }),
    defineField({ name: 'heroDescription', type: 'text', rows: 3, group: 'home', validation: (Rule) => Rule.required() }),
    defineField({ name: 'coreFocus', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' }, group: 'home', validation: (Rule) => Rule.required() }),
    defineField({ name: 'homeCtaLabel', title: 'Hero CTA label', type: 'string', group: 'home', validation: (Rule) => Rule.required() }),
    defineField({ name: 'homeCtaButtonLabel', title: 'Contact CTA button label', type: 'string', group: 'home', validation: (Rule) => Rule.required() }),
    defineField({ name: 'intellectualApproach', type: 'text', rows: 4, group: 'home', validation: (Rule) => Rule.required() }),
    defineField({ name: 'workTitle', type: 'string', group: 'home', validation: (Rule) => Rule.required() }),
    defineField({ name: 'workIntro', type: 'text', rows: 3, group: 'home', validation: (Rule) => Rule.required() }),
    defineField({ name: 'journalTitle', type: 'string', group: 'home', validation: (Rule) => Rule.required() }),
    defineField({ name: 'journalIntro', type: 'text', rows: 3, group: 'home', validation: (Rule) => Rule.required() }),
    defineField({ name: 'skillGroups', type: 'array', of: [{ type: 'skillGroup' }], group: 'home', validation: (Rule) => Rule.required() }),

    defineField({ name: 'aboutTitle', type: 'text', rows: 2, group: 'about', validation: (Rule) => Rule.required() }),
    defineField({ name: 'aboutHeadline', type: 'text', rows: 3, group: 'about', validation: (Rule) => Rule.required() }),
    defineField({ name: 'aboutIntro', type: 'text', rows: 5, group: 'about', validation: (Rule) => Rule.required() }),
    defineField({ name: 'education', type: 'array', of: [{ type: 'education' }], group: 'about', validation: (Rule) => Rule.required() }),
    defineField({ name: 'certifications', type: 'array', of: [{ type: 'certification' }], group: 'about' }),

    defineField({ name: 'contactTitle', type: 'string', group: 'contact', validation: (Rule) => Rule.required() }),
    defineField({ name: 'contactHeadline', type: 'text', rows: 3, group: 'contact', validation: (Rule) => Rule.required() }),
    defineField({ name: 'contactIntro', title: 'Availability statement', type: 'text', rows: 3, group: 'contact', validation: (Rule) => Rule.required() }),
    defineField({ name: 'responseTime', type: 'string', group: 'contact', validation: (Rule) => Rule.required() }),
    defineField({ name: 'timezone', type: 'string', group: 'contact', validation: (Rule) => Rule.required() })
  ],
  preview: { prepare: () => ({ title: 'Portfolio site settings' }) }
});
