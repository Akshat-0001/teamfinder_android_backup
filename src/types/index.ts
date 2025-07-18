export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  university?: string;
  interests: string[];
  bio?: string;
  roles: string[];
  skills: string[];
  avatar_url?: string;
  github_url?: string;
  linkedin_url?: string;
  leetcode_url?: string;
  codeforces_url?: string;
  geeksforgeeks_url?: string;
  codingame_url?: string;
  portfolio_url?: string;
  created_at: string;
  updated_at: string;
  gender?: string;
}

export interface Team {
  id: string;
  title: string;
  category: string;
  description: string;
  required_skills: string[];
  team_size: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  members?: Profile[];
  applicants?: TeamApplicant[];
}

export interface TeamApplicant {
  id: string;
  team_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  user?: Profile;
}

export interface ChatMessage {
  id: string;
  team_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: Profile;
}

export interface CreateTeamData {
  title: string;
  category: string;
  description: string;
  required_skills: string[];
  team_size: number;
}

export interface UpdateProfileData {
  full_name: string;
  university?: string;
  interests: string[];
  bio?: string;
  roles: string[];
  skills: string[];
  avatar_url?: string;
  github_url?: string;
  linkedin_url?: string;
  leetcode_url?: string;
  codeforces_url?: string;
  geeksforgeeks_url?: string;
  codingame_url?: string;
  portfolio_url?: string;
  gender?: string;
}

export const TEAM_CATEGORIES = [
  'Hackathon',
  'Project',
  'Startup',
  'Research',
  'Study Group',
  'Event',
  'Competition',
  'Art & Design',
  'Sports',
  'NGO & Social Impact',
  'Job Prep',
  'Open Source',
  'Other',
] as const;

export const COMMON_SKILLS = [
  'Accounting',
  'AI/ML Engineer',
  'Animator',
  'App Developer',
  'Artist',
  'AWS',
  'Blogger',
  'Blockchain',
  'Blockchain Developer',
  'Business Analyst',
  'Chef',
  'Cloud Architect',
  'Community Outreach',
  'Consultant',
  'Content Creation',
  'Cooking',
  'Cybersecurity',
  'Cybersecurity Specialist',
  'Data Analysis',
  'Data Scientist',
  'Debate',
  'DevOps',
  'DevOps Engineer',
  'Django',
  'Docker',
  'Entrepreneurship',
  'Event Management',
  'Event Manager',
  'Figma',
  'Finance',
  'Flutter',
  'Fundraiser',
  'Game Development',
  'Game Developer',
  'Git',
  'Go',
  'Graphic Design',
  'Graphic Designer',
  'GRE',
  'Java',
  'JavaScript',
  'Kotlin',
  'Language Expert',
  'Language Learning',
  'Leadership',
  'Machine Learning',
  'Marketer',
  'Marketing',
  'Mentor',
  'Mobile Development',
  'MongoDB',
  'Music',
  'NGO Coordinator',
  'Node.js',
  'Operations Manager',
  'Photography',
  'Photographer',
  'Photoshop',
  'PostgreSQL',
  'Product Management',
  'Product Manager',
  'Project Management',
  'Project Manager',
  'Public Relations',
  'Public Speaker',
  'Python',
  'React',
  'React Native',
  'Researcher',
  'REST API',
  'Rust',
  'Sales',
  'Salesperson',
  'Social Media',
  'Social Media Manager',
  'Software Engineer',
  'Sports',
  'Sports Coach',
  'Spring Boot',
  'Study Group Leader',
  'Swift',
  'Teacher',
  'Tutor',
  'TypeScript',
  'UI/UX Design',
  'Unity',
  'UPSC',
  'Video Editor',
  'Voice Artist',
  'Volunteer',
  'Web Developer',
  'Web Development',
  'Workshop Facilitator',
  'Writer',
] as const;

export const COMMON_ROLES = [
  'Accountant',
  'AI/ML Engineer',
  'Animator',
  'App Developer',
  'Artist',
  'Blogger',
  'Blockchain Developer',
  'Business Analyst',
  'Cloud Architect',
  'Coach',
  'Community Manager',
  'Consultant',
  'Content Creator',
  'Data Scientist',
  'Dancer',
  'DevOps Engineer',
  'Entrepreneur',
  'Event Manager',
  'Exam Coach',
  'Finance',
  'Fundraiser',
  'Game Developer',
  'Graphic Designer',
  'HR Manager',
  'Language Expert',
  'Leader',
  'Mentor',
  'Marketer',
  'Musician',
  'NGO Coordinator',
  'Operations Manager',
  'Organizer',
  'Photographer',
  'Product Manager',
  'Project Manager',
  'Public Speaker',
  'Researcher',
  'Salesperson',
  'Social Media Manager',
  'Software Engineer',
  'Sports Coach',
  'Study Group Leader',
  'Teacher',
  'Tutor',
  'Video Editor',
  'Voice Artist',
  'Volunteer',
  'Web Developer',
  'Workshop Facilitator',
  'Writer',
] as const;

export const UNIVERSITIES = [
  'AMU',
  'Amity University',
  'Ashoka University',
  'BITS Goa',
  'BITS Hyderabad',
  'BITS Pilani',
  'BHU',
  'Caltech',
  'Carnegie Mellon',
  'Chandigarh University',
  'Chitkara University',
  'Christ University',
  'Columbia University',
  'Cornell University',
  'Delhi University',
  'Duke University',
  'Galgotias University',
  'Georgia Tech',
  'Graphic Era University',
  'Harvard University',
  'IISc Bangalore',
  'IIIT Allahabad',
  'IIIT Bangalore',
  'IIIT Delhi',
  'IIIT Gwalior',
  'IIIT Hyderabad',
  'IIT BHU',
  'IIT Bombay',
  'IIT Delhi',
  'IIT Dhanbad',
  'IIT Guwahati',
  'IIT Hyderabad',
  'IIT Kanpur',
  'IIT Kharagpur',
  'IIT Madras',
  'IIT Roorkee',
  'Jamia Millia Islamia',
  'JNU',
  'Johns Hopkins University',
  'LNCT Bhopal',
  'Manipal University',
  'MIT',
  'NIT Calicut',
  'NIT Rourkela',
  'NIT Surathkal',
  'NIT Trichy',
  'NIT Warangal',
  'Northwestern University',
  'Princeton University',
  'Shiv Nadar University',
  'SRM University',
  'Stanford University',
  'UC Berkeley',
  'UC San Diego',
  'University of Illinois',
  'University of Michigan',
  'University of Pennsylvania',
  'University of Washington',
  'UT Austin',
  'VIT Vellore',
  'Yale University',
  'Other',
] as const;
