// Mock data for Vital Signs

export interface Story {
  id: string;
  title: string;
  preview: string;
  body: string;
  tags: string[];
  authorName: string | null;
  isAnonymous: boolean;
  university?: string;
  hasContentWarning: boolean;
  publishedAt: string;
  isFeatured: boolean;
}

export interface Tag {
  id: string;
  name: string;
  count: number;
}

export interface AdminStory extends Story {
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  authorEmail: string;
}

export const HEALTH_TAGS: Tag[] = [
  { id: '1', name: 'Mental Health', count: 3 },
  { id: '2', name: 'Chronic Illness', count: 1 },
  { id: '3', name: 'Caregiving', count: 1 },
  { id: '4', name: 'Addiction & Recovery', count: 1 },
];

export const UNIVERSITIES = [
  'University of Toronto',
  'McGill University',
  'University of British Columbia',
  'McMaster University',
  'Queen\'s University',
  'Western University',
  'University of Alberta',
  'University of Waterloo',
  'University of Ottawa',
  'Dalhousie University',
  'Other',
];

export const FEATURED_STORIES: Story[] = [
  {
    id: '1',
    title: 'Learning to Live with Uncertainty',
    preview: 'After three years of unexplained symptoms and countless appointments, I finally received a diagnosis. But that was just the beginning of a different kind of journey.',
    body: `After three years of unexplained symptoms and countless appointments, I finally received a diagnosis. But that was just the beginning of a different kind of journey.\n\nI remember sitting in the neurologist's office, watching her lips move as she explained what the test results meant. The words seemed to float somewhere above my head, refusing to land. Multiple sclerosis. Two words that would reshape everything I thought I knew about my future.\n\nThe first few months were the hardest. Not because of the symptoms\u2014though those were challenging enough\u2014but because of the uncertainty. Would I be able to finish my degree? Would I be able to work? Would I be the same person in five years, ten years, twenty?\n\nWhat I've learned since then is that uncertainty isn't something you conquer. It's something you learn to sit with. Some days it feels heavier than others. Some days I almost forget it's there. But it's always present, a quiet companion on this journey.\n\nI'm sharing this because I wish someone had told me earlier: you don't have to have it all figured out. You don't have to be brave or strong or inspirational. You just have to keep showing up, one day at a time.\n\nAnd if you're reading this and you're in the middle of your own uncertainty, I want you to know that you're not alone. None of us are.`,
    tags: ['Chronic Illness', 'Mental Health'],
    authorName: 'Sarah M.',
    isAnonymous: false,
    university: 'University of Toronto',
    hasContentWarning: false,
    publishedAt: '2024-01-15',
    isFeatured: true,
  },
  {
    id: '2',
    title: 'The Weight of Being a Student Caregiver',
    preview: 'Nobody tells you how to balance organic chemistry with feeding tubes, or how to explain to your professor why you missed another exam.',
    body: `Nobody tells you how to balance organic chemistry with feeding tubes, or how to explain to your professor why you missed another exam.\n\nMy mom was diagnosed with early-onset Alzheimer's when I was nineteen. I was in my second year of pre-med, full of plans and ambitions. Within six months, I had become her primary caregiver.\n\nThere's a particular kind of loneliness that comes with being a young caregiver. Your friends are going to parties, dating, making memories. You're learning how to manage medications and navigate insurance claims. You're watching your parent become someone you don't recognize.\n\nI dropped out twice. Came back twice. Switched majors. Took incompletes. Failed classes. Graduated five years later than I'd planned with a completely different degree than I'd started with.\n\nAnd you know what? I'm proud of every single credit I earned.\n\nWhat I want other student caregivers to know is this: your path doesn't have to look like everyone else's. Your timeline is your own. The skills you're learning\u2014patience, resilience, compassion, crisis management\u2014those are real skills. They count.\n\nYou are doing something incredibly hard. And you're still here. That matters.`,
    tags: ['Caregiving', 'Mental Health'],
    authorName: null,
    isAnonymous: true,
    university: 'McGill University',
    hasContentWarning: false,
    publishedAt: '2024-01-12',
    isFeatured: true,
  },
  {
    id: '3',
    title: 'Recovery Isn\'t Linear (And That\'s Okay)',
    preview: 'Two years sober, I relapsed. It felt like the end of the world. Now I know it was just another chapter.',
    body: `Two years sober, I relapsed. It felt like the end of the world. Now I know it was just another chapter.\n\nWe talk a lot about rock bottom in recovery communities. The dramatic moment of clarity that sets you on the path to healing. What we don't talk about enough is what happens after. The quiet relapses. The shame spirals. The starting over, again and again.\n\nI got sober at twenty-two. Made it through two years of meetings, therapy, and the slow rebuilding of trust with my family. Then I went to a party. One drink became many. Days became weeks.\n\nWhen I finally told my sponsor what happened, I couldn't meet her eyes. I expected disappointment. What I got was a hug and these words: \u201cWelcome back. Now let's get started.\u201d\n\nThat was three years ago. I've been sober since, but I carry that relapse with me not as a shame, but as a reminder. Recovery isn't about perfection. It's about persistence.\n\nIf you're reading this and you've stumbled, please hear me: you are not your worst moment. You are not your relapse. You are every single moment you've chosen to try again.\n\nAnd that choice? That's everything.`,
    tags: ['Addiction & Recovery', 'Mental Health'],
    authorName: 'Marcus',
    isAnonymous: false,
    hasContentWarning: true,
    publishedAt: '2024-01-10',
    isFeatured: true,
  },
];

export const ALL_STORIES: Story[] = [
  ...FEATURED_STORIES,
];

export const ADMIN_STORIES: AdminStory[] = [
  {
    ...ALL_STORIES[0],
    status: 'approved',
    submittedAt: '2024-01-14',
    authorEmail: 'sarah.m@mail.utoronto.ca',
  },
  {
    ...ALL_STORIES[1],
    status: 'approved',
    submittedAt: '2024-01-11',
    authorEmail: 'anonymous.user@mcgill.ca',
  },
  {
    id: 'pending-1',
    title: 'My Journey with ADHD in Graduate School',
    preview: 'Getting diagnosed at 27 changed everything about how I understood my struggles.',
    body: 'Full story content here...',
    tags: ['Mental Health'],
    authorName: 'Alex T.',
    isAnonymous: false,
    university: 'University of Waterloo',
    hasContentWarning: false,
    publishedAt: '',
    isFeatured: false,
    status: 'pending',
    submittedAt: '2024-01-16',
    authorEmail: 'alex.t@uwaterloo.ca',
  },
  {
    id: 'rejected-1',
    title: 'Test Story',
    preview: 'This was a test submission.',
    body: 'Test content...',
    tags: ['Other'],
    authorName: 'Test User',
    isAnonymous: false,
    hasContentWarning: false,
    publishedAt: '',
    isFeatured: false,
    status: 'rejected',
    submittedAt: '2024-01-10',
    authorEmail: 'test@test.com',
  },
];

export const ADMIN_STATS = {
  totalSubmitted: 4,
  approved: 2,
  pending: 1,
  rejected: 1,
};
