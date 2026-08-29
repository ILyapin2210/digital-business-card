import { gql } from '@apollo/client';

export const GET_PROFILE = gql`
  query GetProfile {
    profile {
      name
      headline
      description
      location
      availability
      githubUrl
      telegramUrl
      contactEmail
      resumeUrl
      experience
      highlights
      skills {
        name
        category
      }
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      name
      headline
      description
      location
      availability
      githubUrl
      telegramUrl
      contactEmail
      resumeUrl
      experience
      highlights
      skills {
        name
        category
      }
    }
  }
`;

export const SKILL_CATEGORIES = [
  'BACKEND',
  'DATA',
  'INTEGRATIONS',
  'INFRASTRUCTURE',
  'FRONTEND',
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export type Skill = {
  name: string;
  category: SkillCategory;
};

export type SkillInput = {
  name: string;
  category: SkillCategory;
};

export type Profile = {
  name: string;
  headline: string;
  description: string;
  location: string;
  availability: string;
  githubUrl: string;
  telegramUrl: string;
  contactEmail: string;
  resumeUrl: string;
  experience: string;
  highlights: string;
  skills: Skill[];
};

export type ProfileInput = Omit<Profile, 'skills'> & {
  skills: SkillInput[];
};

export type GetProfileData = {
  profile: Profile;
};

export type UpdateProfileData = {
  updateProfile: Profile;
};

export type UpdateProfileVariables = {
  input: ProfileInput;
};
