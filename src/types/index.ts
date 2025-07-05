export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  university?: string;
  interests: string[];
  skills: string[];
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
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
  skills: string[];
  bio?: string;
  avatar_url?: string;
}

export const TEAM_CATEGORIES = [
  'Hackathon',
  'Project',
  'Research',
  'Startup',
  'Competition',
  'Study Group',
  'Open Source',
  'AI/ML',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Design',
  'Other'
] as const;

export const COMMON_SKILLS = [
  'React', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust',
  'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'PostgreSQL', 'MongoDB',
  'AWS', 'Docker', 'Kubernetes', 'Git', 'GraphQL', 'REST API', 'Machine Learning',
  'Data Analysis', 'UI/UX Design', 'Figma', 'Photoshop', 'Product Management',
  'Marketing', 'DevOps', 'Cybersecurity', 'Blockchain', 'Mobile Development',
  'Flutter', 'React Native', 'Swift', 'Kotlin', 'Unity', 'Game Development'
] as const;

export const UNIVERSITIES = [

  // Indian Institutes of Technology (IITs)
  'IIT Bombay', 'IIT Delhi', 'IIT Kanpur', 'IIT Madras', 'IIT Kharagpur',
  'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad', 'IIT BHU', 'IIT Dhanbad',

  // Indian Institutes of Information Technology (IIITs)
  'IIIT Hyderabad', 'IIIT Delhi', 'IIIT Bangalore', 'IIIT Allahabad', 'IIIT Gwalior',

  // National Institutes of Technology (NITs)
  'NIT Trichy', 'NIT Surathkal', 'NIT Warangal', 'NIT Rourkela', 'NIT Calicut',

  // Central and public universities
  'Delhi University', 'JNU', 'Jamia Millia Islamia', 'AMU', 'BHU', 'IISc Bangalore',

  // Top Private Universities
  'BITS Pilani', 'BITS Goa', 'BITS Hyderabad', 'VIT Vellore', 'SRM University',
  'Manipal University', 'Amity University', 'Shiv Nadar University',
  'Ashoka University', 'Chandigarh University', 'Chitkara University',
  'LNCT Bhopal', 'Galgotias University', 'Graphic Era University', 'Christ University',
  
  // Top U.S. Universities
  'MIT', 'Stanford University', 'Harvard University', 'UC Berkeley', 'Carnegie Mellon',
  'Caltech', 'University of Washington', 'Georgia Tech', 'University of Illinois',
  'Cornell University', 'Princeton University', 'Yale University', 'Columbia University',
  'University of Michigan', 'UC San Diego', 'UT Austin', 'University of Pennsylvania',
  'Duke University', 'Northwestern University', 'Johns Hopkins University',

  // Other or unknown
  'Other'
] as const;
