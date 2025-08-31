import {LeadQuestion} from "../types";

export const questions: LeadQuestion[] = [
  {
    id: 1,
    text: "What industry are you in?",
    textOnly: true,
  },
  {
    id: 2,
    text: "How many clients do you currently have?",
    options: [
      { text: "0 - 10", value: "under10", disqualifies: true },
      { text: "10 - 25", value: "10-25", qualifies: true },
      { text: "25 - 50", value: "25-50", qualifies: true },
      { text: "50+", value: "50+", qualifies: true }
    ]
  },
  {
    id: 3,
    text: "Which platform do you host your course on?",
    options: [
      { text: "Skool", value: "skool", qualifies: true },
      { text: "Kajabi", value: "kajabi", qualifies: true },
      { text: "Teachable", value: "teachable", qualifies: true },
      { text: "Thinkific", value: "thinkific", qualifies: true },
      { text: "Other", value: "other", qualifies: true }
    ]
  },
  {
    id: 4,
    text: "What's your average monthly revenue from coaching and digital products?",
    options: [
      { text: "Less than $5K", value: "under5k", disqualifies: true },
      { text: "$5K - $15K", value: "5k-15k", disqualifies: true },
      { text: "$20K - $50K", value: "20k-50k", qualifies: true },
      { text: "$50K - $100K", value: "50k-100k", qualifies: true },
      { text: "$100K+/month", value: "100k+", qualifies: true }
    ]
  },
  {
    id: 5,
    text: "Which best describes your current role?",
    options: [
      { text: "I'm the sole decision-maker in my coaching business", value: "sole_decision", qualifies: true },
      { text: "I'm a co-founder", value: "leadership", qualifies: true },
      { text: "I work under a coach/founder as support staff", value: "support_staff", disqualifies: true },
      { text: "I'm a freelancer or assistant evaluating tools", value: "freelancer", disqualifies: true }
    ]
  },
  {
    id: 6,
    text: "Which of these problems within your business do you most relate to?",
    options: [
      { text: "I fall behind on replying to client emails", value: "email_behind", points: 1 },
      { text: "I lose track of client engagement and drop-offs", value: "lose_track", points: 1 },
      { text: "I forget to follow up with leads who ghosted", value: "no_followup", points: 1 },
      { text: "I post inconsistently because content creation burns me out", value: "content_burnout", points: 1 },
      { text: "None of these. My systems are running smoothly", value: "no_problems", disqualifies: true }
    ],
    multiSelect: true
  },
  {
    id: 7,
    text: "What's your biggest focus over the next 90 days?",
    options: [
      { text: "Scaling without burning out", value: "scale_revenue", qualifies: true },
      { text: "Hiring more team members", value: "hire_team", qualifies: true },
      { text: "Fixing client fulfillment & retention", value: "fix_retention", qualifies: true },
      { text: "Getting more leads", value: "get_leads", qualifies: true },
      { text: "Just maintaining what I have", value: "maintain", disqualifies: true }
    ]
  },
  {
    id: 8,
    text: "Which system do you need most right now?",
    options: [
      { text: "A system to reply to client emails", value: "client_email" },
      { text: "A system to follow up with leads", value: "lead_followup" },
      { text: "A system to check in with clients and keep them engaged", value: "retention_agent" },
      { text: "A system to send me content ideas that perform", value: "content_agent" },
      { text: "A system to capture leads & book calls on autopilot", value: "coach_assistant" },
    ],
    multiSelect: true
  },
  {
    id: 9,
    text: "If we could help you plug in AI agents that save 10+ hours/week and improve client retention without hiring another VA, how interested would you be?",
    options: [
      { text: "Very Interested", value: "very", points: 2 },
      { text: "Somewhat Interested", value: "somewhat", points: 1 },
      { text: "Not Interested", value: "not_interested", disqualifies: true },
    ]
  }
];
