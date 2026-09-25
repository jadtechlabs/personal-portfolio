/* Edit your links, photos, projects and events here. Use blank strings for links you haven't added yet. */
window.SITE_CONFIG = {
  linkedin: 'https://www.linkedin.com/in/jad-elahmad21/',
  medium: '', // Your full Medium profile URL. Also set MEDIUM_FEED_URL in Cloudflare.
  github: '',
  strava: '',
  email: '', // Optional public contact address; otherwise inquiries go to LinkedIn.
  apiBase: './api', // Cloudflare Pages Functions. GitHub Pages: set this to your separate API URL.
  photos: {
    portrait: 'assets/jad-portrait.webp',
    speaking: 'assets/jad-speaking.webp',
    running: '', // e.g. 'assets/running.webp'
    cycling: ''
  },
  projects: [
    /* { name: 'Your project', description: 'What it does and why you built it.',
         technologies: ['HTML', 'JavaScript'], image: 'assets/project.webp',
         imageAlt: 'Describe the project screenshot', github: '', demo: '', status: 'In progress' } */
  ],
  events: [
    /* { name: 'Event name', organization: 'Organization', topic: 'Your talk title',
         date: '2026-10-01', description: 'A short description.',
         image: 'assets/event.webp', imageAlt: 'Jad speaking at the event', url: '' } */
  ]
};
