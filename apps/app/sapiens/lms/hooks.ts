/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/
import { useState, useEffect } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

// =======================================================================
// GraphQL Queries & Mutations
// =======================================================================

const GET_MY_COURSES = gql`
  query GetMyCourses {
    myCourses {
      id
      title
      description
      instructor {
        profile {
          firstName
          lastName
        }
      }
      modules {
        id
        title
      }
      pivcTarget
      constitutionalScore
    }
  }
`;

const GET_MY_PROGRESS = gql`
  query GetMyProgress($courseId: ID!) {
    myProgress(courseId: $courseId) {
      completionRate
      pivcEarned
      currentModule {
        id
        title
      }
      nextModule {
        id
        title
      }
    }
  }
`;

const GET_PIVC_LEADERBOARD = gql`
  query GetPIVCLeaderboard($timeframe: String!) {
    pivcLeaderboard(timeframe: $timeframe) {
      rank
      user {
        username
        profile {
          avatar
        }
      }
      score
      stars
    }
  }
`;

export const GET_PROJECTS = gql`
  query GetProjects($limit: Int, $offset: Int) {
    projects(limit: $limit, offset: $offset) {
      id
      title
      description
      status
      pivcReward
      requiredSkills
      deadline
    }
  }
`;

export const GET_COURSES = gql`
  query GetCourses($limit: Int, $offset: Int) {
    courses(limit: $limit, offset: $offset) {
      id
      title
      description
      instructor {
        id
        profile {
          firstName
          lastName
        }
      }
      enrollments
      pivcTarget
    }
  }
`;

export const useProjects = (limit: number, offset: number) => {
  const { data, loading, error } = useQuery(GET_PROJECTS, {
    variables: { limit, offset },
  });
  return { projects: data?.projects, loading, error };
};

export const useCourses = (limit: number, offset: number) => {
  const { data, loading, error } = useQuery(GET_COURSES, {
    variables: { limit, offset },
  });
  return { courses: data?.courses, loading, error };
};

export const GET_MY_PORTFOLIO = gql`
  query GetMyPortfolio {
    myPortfolio {
      id
      title
      description
      status
      pivcReward
      requiredSkills
      deadline
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      username
      profile {
        firstName
        lastName
        avatar
        pivcScore
        constitutionalAlignment
      }
    }
  }
`;

const ENROLL_COURSE = gql`
  mutation EnrollCourse($courseId: ID!) {
    enrollCourse(courseId: $courseId) {
      id
    }
  }
`;

const COMPLETE_MODULE = gql`
  mutation CompleteModule($moduleId: ID!, $courseId: ID!) {
    completeModule(moduleId: $moduleId, courseId: $courseId) {
      completionRate
    }
  }
`;

// =======================================================================
// Data-Fetching Hooks
// =======================================================================

export function useMyCourses() {
  const { data, loading, error } = useQuery(GET_MY_COURSES);
  return {
    courses: data?.myCourses,
    loading,
    error,
  };
}

export function useMyProgress(courseId: string) {
  const { data, loading, error } = useQuery(GET_MY_PROGRESS, {
    variables: { courseId },
    skip: !courseId,
  });
  return {
    progress: data?.myProgress,
    loading,
    error,
  };
}

export function usePIVCLeaderboard(timeframe: string) {
  return useQuery(GET_PIVC_LEADERBOARD, { variables: { timeframe } });
}

export function useProjects(limit: number = 10, offset: number = 0) {
  return useQuery(GET_PROJECTS, { variables: { limit, offset } });
}

export function useMyPortfolio() {
  return useQuery(GET_MY_PORTFOLIO);
}

export function useMe() {
  return useQuery(GET_ME);
}

export function useEnrollCourse() {
  const [enroll, { data, loading, error }] = useMutation(ENROLL_COURSE, {
    refetchQueries: [{ query: GET_MY_COURSES }],
  });
  return {
    enroll,
    data,
    loading,
    error,
  };
}

export function useCompleteModule() {
  const [complete, { data, loading, error }] = useMutation(COMPLETE_MODULE);
  return {
    complete,
    data,
    loading,
    error,
  };
}

export const GET_LEADERBOARD = gql`
  query GetLeaderboard($limit: Int, $offset: Int) {
    leaderboard(limit: $limit, offset: $offset) {
      rank
      user {
        id
        username
        profile {
          avatar
          pivcScore
        }
      }
      score
    }
  }
`;

export const GET_MENTORS = gql`
  query GetMentors($limit: Int, $offset: Int) {
    mentors(limit: $limit, offset: $offset) {
      id
      username
      profile {
        firstName
        lastName
        avatar
        bio
      }
    }
  }
`;

export const GET_STUDY_GROUPS = gql`
  query GetStudyGroups($limit: Int, $offset: Int) {
    studyGroups(limit: $limit, offset: $offset) {
      id
      name
      description
      members {
        id
        username
        profile {
          avatar
        }
      }
      course {
        id
        title
      }
    }
  }
`;

export const useLeaderboard = (limit: number, offset: number) => {
  const { data, loading, error } = useQuery(GET_LEADERBOARD, {
    variables: { limit, offset },
  });
  return { data, loading, error, fetchMore };
};

export const useMentors = (limit: number, offset: number) => {
  const { data, loading, error, fetchMore } = useQuery(GET_MENTORS, {
    variables: { limit, offset },
  });
  return { data, loading, error, fetchMore };
};

export const useStudyGroups = (limit: number, offset: number) => {
  const { data, loading, error, fetchMore } = useQuery(GET_STUDY_GROUPS, {
    variables: { limit, offset },
  });
  return { data, loading, error, fetchMore };
};

