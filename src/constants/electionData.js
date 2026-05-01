export const ELECTION_STEPS = [
  {
    id: 'step-1',
    stepNumber: 1,
    title: 'Voter Registration',
    description: 'Register as a voter at your local election office or online portal before the deadline.',
    userAction: 'Visit the official voter registration portal and submit your ID proof and address details.',
  },
  {
    id: 'step-2',
    stepNumber: 2,
    title: 'Verification',
    description: 'Your registration is reviewed and verified by election authorities within 7–10 working days.',
    userAction: 'Check your registration status online using your reference number.',
  },
  {
    id: 'step-3',
    stepNumber: 3,
    title: 'Voting Process',
    description: 'On election day, visit your assigned polling booth with valid ID to cast your vote.',
    userAction: 'Locate your polling booth on the official site, carry valid ID, and cast your vote.',
  },
  {
    id: 'step-4',
    stepNumber: 4,
    title: 'Result Declaration',
    description: 'Votes are counted and results declared publicly by the election commission.',
    userAction: 'Follow official election commission channels for live result updates.',
  }
];

export const TIMELINE_EVENTS = [
  {
    id: 'event-1',
    label: 'Registration Deadline',
    date: 'Oct 15, 2025',
    description: 'Last day to register to vote for the upcoming election.',
    color: 'blue'
  },
  {
    id: 'event-2',
    label: 'Election Day',
    date: 'Nov 5, 2025',
    description: 'Cast your vote at your assigned polling location.',
    color: 'green'
  },
  {
    id: 'event-3',
    label: 'Result Declaration',
    date: 'Nov 8, 2025',
    description: 'Official election results are announced.',
    color: 'orange'
  }
];

export const GUIDANCE_MESSAGES = {
  0: "Start here → Complete your voter registration first.",
  1: "Step 2 → Wait for verification (7–10 days).",
  2: "Step 3 → Prepare your ID and locate your polling booth.",
  3: "Step 4 → Track live results on the official portal.",
  4: "✅ You're all set! Share DemocrAI with a first-time voter."
};
