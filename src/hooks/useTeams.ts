import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Team, CreateTeamData, TeamApplicant } from '@/types';

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

  return useMutation({
    mutationFn: async (teamId: string) => {
      // Get all accepted members
      const { data: members } = await supabase
        .from('team_applicants')
        .select('user_id')
        .eq('team_id', teamId)
        .eq('status', 'accepted');
      // Get team info
      const { data: team } = await supabase
        .from('teams')
        .select('id, title')
        .eq('id', teamId)
        .single();
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

  return useMutation({
    mutationFn: async (teamId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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

      // Fetch team to get owner
      const { data: team } = await supabase
        .from('teams')
        .select('id, title, created_by')
        .eq('id', teamId)
        .single();
      if (team && team.created_by) {
        // Notify owner
        // await notifyViaEdge({
        //   user_id: team.created_by,
        //   type: 'info',
        //   title: 'New Team Application',
        //   message: `${user.user_metadata?.full_name || 'A user'} applied to join your team "${team.title}"`,
        //   data: { teamId }
        // });
      }
      return application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    }
  });
};

export const useManageApplication = () => {
  const queryClient = useQueryClient();

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

      // Fetch applicant and team
      const { data: applicant } = await supabase
        .from('team_applicants')
        .select('user_id, team_id')
        .eq('id', applicationId)
        .single();
      const { data: team } = await supabase
        .from('teams')
        .select('id, title')
        .eq('id', applicant.team_id)
        .single();
      // Notify applicant
      if (applicant && team) {
        // await notifyViaEdge({
        //   user_id: applicant.user_id,
        //   type: status === 'accepted' ? 'success' : 'error',
        //   title: `Application ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
        //   message: `Your application to join "${team.title}" was ${status}.`,
        //   data: { teamId: team.id }
        // });
      }
      // If accepted, notify all team members (except new member)
      if (status === 'accepted' && applicant && team) {
        // Get all accepted members except the new one
        const { data: members } = await supabase
          .from('team_applicants')
          .select('user_id')
          .eq('team_id', team.id)
          .eq('status', 'accepted');
        if (members && Array.isArray(members)) {
          const notifyIds = members.map(m => m.user_id).filter(id => id !== applicant.user_id);
          for (const memberId of notifyIds) {
            // await notifyViaEdge({
            //   user_id: memberId,
            //   type: 'info',
            //   title: 'New Team Member',
            //   message: `A new member joined your team "${team.title}"!`,
            //   data: { teamId: team.id }
            // });
          }
        }
      }
      return application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
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

  return useMutation({
    mutationFn: async (teamId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      // Remove user from team_applicants
      const { error } = await supabase
        .from('team_applicants')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .eq('status', 'accepted');
      if (error) throw error;
      // Get team info
      const { data: team } = await supabase
        .from('teams')
        .select('id, title, created_by')
        .eq('id', teamId)
        .single();
      // Notify owner
      if (team && team.created_by) {
        // await notifyViaEdge({
        //   user_id: team.created_by,
        //   type: 'warning',
        //   title: 'Member Left Team',
        //   message: `${user.user_metadata?.full_name || 'A user'} left your team "${team.title}"`,
        //   data: { teamId }
        // });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
    }
  });
};

export const useKickMember = () => {
  const queryClient = useQueryClient();

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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
    }
  });
};