import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Team, CreateTeamData, TeamApplicant } from '@/types';
import { useTeamNotifications } from '@/hooks/useTeamNotifications';

export const useTeams = (filters?: {
  category?: string;
  skills?: string[];
  myInterests?: boolean;
  myUniversity?: boolean;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['teams', filters],
    queryFn: async () => {
      let query = supabase
        .from('teams')
        .select(`
          *,
          creator:profiles!teams_created_by_fkey(*),
          applicants:team_applicants(*, user:profiles(*))
        `)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (Team & { creator: any; applicants: any[] })[];
    }
  });
};

export const useMyTeams = () => {
  return useQuery({
    queryKey: ['my-teams'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get teams I created
      const { data: createdTeams, error: createdError } = await supabase
        .from('teams')
        .select(`
          *,
          creator:profiles!teams_created_by_fkey(*),
          applicants:team_applicants(*, user:profiles(*))
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (createdError) throw createdError;

      // Get teams I'm a member of
      const { data: applications, error: applicationsError } = await supabase
        .from('team_applicants')
        .select(`
          *,
          team:teams(
            *,
            creator:profiles!teams_created_by_fkey(*),
            applicants:team_applicants(*, user:profiles(*))
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (applicationsError) throw applicationsError;

      const joinedTeams = applications?.map(app => app.team).filter(Boolean) || [];

      return {
        created: createdTeams || [],
        joined: joinedTeams || []
      };
    }
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamData: CreateTeamData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('teams')
        .insert({
          ...teamData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
    }
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateTeamData> }) => {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
    }
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  const { notifyOnTeamDeletion } = useTeamNotifications();

  return useMutation({
    mutationFn: async (teamId: string) => {
      // Get team info first
      const { data: team } = await supabase
        .from('teams')
        .select('id, title')
        .eq('id', teamId)
        .single();
      
      if (team) {
        // Notify all team members before deletion
        await notifyOnTeamDeletion(teamId, team.title);
      }
      
      // Delete team
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
    }
  });
};

export const useApplyToTeam = () => {
  const queryClient = useQueryClient();
  const { notifyOnApplication } = useTeamNotifications();

  return useMutation({
    mutationFn: async (teamId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      // Insert application
      const { data: application, error } = await supabase
        .from('team_applicants')
        .insert({
          team_id: teamId,
          user_id: user.id
        })
        .select()
        .single();
      if (error) throw error;

      // Fetch team to get title and notify owner
      const { data: team } = await supabase
        .from('teams')
        .select('id, title, created_by')
        .eq('id', teamId)
        .single();
      
      if (team) {
        await notifyOnApplication(teamId, profile?.full_name || 'Someone', team.title);
      }
      
      return application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['team'] });
    }
  });
};

export const useManageApplication = () => {
  const queryClient = useQueryClient();
  const { notifyOnAcceptance, notifyOnRejection, notifyOnNewMember } = useTeamNotifications();

  return useMutation({
    mutationFn: async ({ 
      applicationId, 
      status 
    }: { 
      applicationId: string; 
      status: 'accepted' | 'rejected' 
    }) => {
      // Update application status
      const { data: application, error } = await supabase
        .from('team_applicants')
        .update({ status })
        .eq('id', applicationId)
        .select()
        .single();
      if (error) throw error;

      // Fetch applicant, team, and user profile
      const { data: applicant } = await supabase
        .from('team_applicants')
        .select('user_id, team_id')
        .eq('id', applicationId)
        .single();
      
      const { data: team } = await supabase
        .from('teams')
        .select('id, title')
        .eq('id', applicant?.team_id)
        .single();

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', applicant?.user_id)
        .single();
      
      if (applicant && team) {
        // Notify applicant about status change
        if (status === 'accepted') {
          await notifyOnAcceptance(applicant.user_id, team.title);
          // Also notify existing team members about new member
          await notifyOnNewMember(team.id, profile?.full_name || 'Someone', team.title);
        } else {
          await notifyOnRejection(applicant.user_id, team.title);
        }
      }
      
      return application;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
      // Invalidate specific team query for instant UI update
      queryClient.invalidateQueries({ queryKey: ['team'] });
    }
  });
};

export const useMyApplications = () => {
  return useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('team_applicants')
        .select(`
          *,
          team:teams(
            *,
            creator:profiles!teams_created_by_fkey(*)
          )
        `)
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
};

export const useLeaveTeam = () => {
  const queryClient = useQueryClient();
  const { notifyOnLeave } = useTeamNotifications();

  return useMutation({
    mutationFn: async (teamId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Get user profile and team info
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();
        
      const { data: team } = await supabase
        .from('teams')
        .select('id, title, created_by')
        .eq('id', teamId)
        .single();
      
      // Remove user from team_applicants
      const { error } = await supabase
        .from('team_applicants')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .eq('status', 'accepted');
      if (error) throw error;
      
      // Notify team owner
      if (team) {
        await notifyOnLeave(teamId, profile?.full_name || 'Someone', team.title);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
      queryClient.invalidateQueries({ queryKey: ['team'] });
    }
  });
};

export const useKickMember = () => {
  const queryClient = useQueryClient();
  const { notifyOnRemoval } = useTeamNotifications();

  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      // Get team info and check ownership
      const { data: team } = await supabase
        .from('teams')
        .select('id, title, created_by')
        .eq('id', teamId)
        .single();
      if (!team || team.created_by !== currentUser.id) throw new Error('Only the team owner can remove members');
      
      // Remove member
      const { error } = await supabase
        .from('team_applicants')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .eq('status', 'accepted');
      if (error) throw error;
      
      // Notify the removed user
      await notifyOnRemoval(userId, team.title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
      queryClient.invalidateQueries({ queryKey: ['team'] });
    }
  });
};