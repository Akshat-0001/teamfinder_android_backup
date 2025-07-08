import { supabase } from '@/integrations/supabase/client';

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: string = 'info'
) => {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message,
      type
    });

  if (error) {
    console.error('Error creating notification:', error);
  }
};

export const notifyTeamOwner = async (teamId: string, title: string, message: string) => {
  const { data: team } = await supabase
    .from('teams')
    .select('created_by')
    .eq('id', teamId)
    .single();

  if (team) {
    await createNotification(team.created_by, title, message, 'team');
  }
};

export const notifyTeamMembers = async (teamId: string, title: string, message: string) => {
  const { data: members } = await supabase
    .from('team_applicants')
    .select('user_id')
    .eq('team_id', teamId)
    .eq('status', 'accepted');

  if (members) {
    for (const member of members) {
      await createNotification(member.user_id, title, message, 'team');
    }
  }
};

export const notifyUser = async (userId: string, title: string, message: string) => {
  await createNotification(userId, title, message, 'team');
};