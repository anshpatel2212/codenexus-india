import { SensaMessage } from '@/types';

export const initialSensaMessages: SensaMessage[] = [
  {
    id: 'sm-1',
    sender: 'sensa',
    timestamp: 'Just now',
    content: `Hello. I'm SENSA, your brand assistant. I can help you check tone, claims, approved facts and brand guidance.

What would you like to review today?`,
  },
  {
    id: 'sm-2',
    sender: 'user',
    timestamp: '10:14 AM',
    content: 'Why was the statement “BrandSense guarantees a 100% elimination of all regulatory compliance fines within 30 days” flagged as Critical?',
  },
  {
    id: 'sm-3',
    sender: 'sensa',
    timestamp: '10:14 AM',
    content: `This claim was flagged as **Critical** because it makes an absolute guarantee that cannot be supported and conflicts with the approved brand voice.

The guidance asks for careful, evidence-based language instead of promises about outcomes.`,
    severity: 'Critical',
    category: 'Facts and Claims',
    confidence: 98,
    requiresHumanReview: true,
    citations: [
      {
        title: 'Global Legal & Regulatory Guardrails 2026.pdf',
        document: 'Legal Guardrails',
        section: 'Section 4.2 — Prohibited Performance Warranties',
        confidence: 99,
      },
      {
        title: 'FTC Guides Concerning the Use of Endorsements & Testimonials',
        document: 'Regulatory Rule 16 CFR § 255.2',
        section: 'Substantiation of Absolute Efficacy Metrics',
        confidence: 94,
      }
    ],
    suggestedFix:
      '“BrandSense is designed to reduce regulatory exposure and make governance workflows easier to manage.”',
  }
];

export interface SensaThread {
  id: string;
  title: string;
  preview: string;
  date: string;
  messages: SensaMessage[];
}

export const sensaThreads: SensaThread[] = [
  {
    id: 'conv-1',
    title: 'Why was the Q3 campaign claim flagged?',
    preview: 'Critical claim and a safer alternative',
    date: 'Today · 10:14 AM',
    messages: [
      {
        id: 'thread-1-user',
        sender: 'user',
        timestamp: '10:14 AM',
        content:
          'Why was the statement “BrandSense guarantees a 100% elimination of all regulatory compliance fines within 30 days” flagged as Critical?',
      },
      {
        id: 'thread-1-sensa',
        sender: 'sensa',
        timestamp: '10:14 AM',
        content: `This claim was flagged because it makes an absolute guarantee that cannot be supported and conflicts with the approved brand voice.

The guidance asks for careful, evidence-based language instead of promises about outcomes.`,
        severity: 'Critical',
        category: 'Facts and Claims',
        confidence: 98,
        requiresHumanReview: true,
        citations: [
          {
            title: 'Global Legal & Regulatory Guardrails 2026.pdf',
            document: 'Legal Guardrails',
            section: 'Section 4.2 — Prohibited performance warranties',
            confidence: 99,
          },
          {
            title: 'FTC Guides Concerning the Use of Endorsements & Testimonials',
            document: 'Regulatory Rule 16 CFR § 255.2',
            section: 'Substantiation of absolute efficacy metrics',
            confidence: 94,
          },
        ],
        suggestedFix:
          '“BrandSense is designed to reduce regulatory exposure and make governance workflows easier to manage.”',
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'Check the ISO dates in our security whitepaper',
    preview: 'Approved recertification dates',
    date: 'Yesterday',
    messages: [
      {
        id: 'thread-2-user',
        sender: 'user',
        timestamp: 'Yesterday',
        content:
          'Are the ISO 27001 and SOC 2 dates in our security whitepaper still current?',
      },
      {
        id: 'thread-2-sensa',
        sender: 'sensa',
        timestamp: 'Yesterday',
        content: `The dates in the whitepaper match the approved facts in your knowledge base.

- ISO 27001 recertification: 18 March 2026
- SOC 2 Type II report period: 1 October 2025 to 30 September 2026

No update is needed right now, but both entries should be reviewed after the next audit cycle.`,
        category: 'Facts and Claims',
        confidence: 96,
        requiresHumanReview: false,
        citations: [
          {
            title: 'Acme Security & Compliance Register',
            document: 'Governance knowledge base',
            section: 'Certifications — 2026 audit cycle',
            confidence: 97,
          },
        ],
      },
    ],
  },
  {
    id: 'conv-3',
    title: 'Make our partner email less hyperbolic',
    preview: 'Intent-preserving rewrite',
    date: 'Oct 31, 2026',
    messages: [
      {
        id: 'thread-3-user',
        sender: 'user',
        timestamp: 'Oct 31',
        content:
          'Can you make this partner email sound less hyperbolic without losing the offer?',
      },
      {
        id: 'thread-3-sensa',
        sender: 'sensa',
        timestamp: 'Oct 31',
        content: `Yes. The current draft leans on superlatives that are not supported by your approved claims.

This version keeps the partner offer and the confident tone, but removes the absolute language that would normally trigger a review.`,
        category: 'Tone and Voice',
        confidence: 94,
        requiresHumanReview: true,
        citations: [
          {
            title: 'Brand Voice & Lexicon Standard',
            document: 'Voice guidelines',
            section: 'Confident, not absolute',
            confidence: 96,
          },
        ],
        suggestedFix:
          '“This partnership gives your team a simpler way to keep every campaign aligned with the brand.”',
      },
    ],
  },
];

export const sensaPromptSuggestions = [
  {
    label: 'Check brand voice tone',
    prompt: 'Check brand voice: "Our enterprise platform accelerates publishing while safeguarding regulatory compliance."',
  },
  {
    label: 'Find approved facts',
    prompt: 'Find approved information and verified metrics about our SOC2 and ISO compliance.',
  },
  {
    label: 'Explain flagged claim',
    prompt: 'Explain why my promotional ROI statement was flagged for missing disclaimers.',
  },
  {
    label: 'Preserve intent rewrite',
    prompt: 'Rewrite this copy to eliminate banned hype words without changing the core marketing proposition.',
  },
  {
    label: 'Required disclaimers',
    prompt: 'Show our mandatory regulatory disclaimers for enterprise financial claims.',
  },
  {
    label: 'Analyze rejection',
    prompt: 'Why was the LifeSciences Medical Whitepaper review rejected by Legal?',
  },
];

