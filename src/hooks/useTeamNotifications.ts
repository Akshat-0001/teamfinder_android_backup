import { supabase } from '@/integrations/supabase/client';
import { createNotification, notifyTeamOwner, notifyTeamMembers, notifyUser } from '@/utils/notifications';

// Hook to create team-related notifications
export const useTeamNotifications = () => {
  
  const notifyOnApplication = async (teamId: string, applicantName: string, teamTitle: string) => {
    await notifyTeamOwner(
      teamId,
      'New Team Application',
      `${applicantName} applied to join your team '${teamTitle}'`
    );
  };

  const notifyOnAcceptance = async (applicantId: string, teamTitle: string) => {
    await notifyUser(
      applicantId,
      'Application Accepted',
      `You've been accepted into the team '${teamTitle}'`
    );
  };

  const notifyOnRejection = async (applicantId: string, teamTitle: string) => {
    await notifyUser(
      applicantId,
      'Application Rejected',
      `Your request to join '${teamTitle}' was rejected`
    );
  };

  const notifyOnLeave = async (teamId: string, memberName: string, teamTitle: string) => {
    await notifyTeamOwner(
      teamId,
      'Member Left Team',
      `${memberName} left your team '${teamTitle}'`
    );
  };

  const notifyOnRemoval = async (removedUserId: string, teamTitle: string) => {
    await notifyUser(
      removedUserId,
      'Removed from Team',
      `You were removed from the team '${teamTitle}'`
    );
  };

  const notifyOnTeamDeletion = async (teamId: string, teamTitle: string) => {
    await notifyTeamMembers(
      teamId,
      'Team Deleted',
      `Your team '${teamTitle}' was deleted`
    );
  };

  const notifyOnNewMember = async (teamId: string, newMemberName: string, teamTitle: string) => {
    await notifyTeamMembers(
      teamId,
      'New Team Member',
      `${newMemberName} joined your team '${teamTitle}'`
    );
  };

  return {
    notifyOnApplication,
    notifyOnAcceptance,
    notifyOnRejection,
    notifyOnLeave,
    notifyOnRemoval,
    notifyOnTeamDeletion,
    notifyOnNewMember
  };
};