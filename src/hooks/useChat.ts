import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types';

export const useChat = (teamId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const queryClient = useQueryClient();

  // Fetch initial messages
  const { data: initialMessages, isLoading } = useQuery({
    queryKey: ['chat', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_chat')
        .select(`
          *,
          sender:profiles!team_chat_sender_id_fkey(*)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as (ChatMessage & { sender: any })[];
    }
  });

  // Set up real-time subscription
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }

    const channel = supabase
      .channel('team-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_chat',
          filter: `team_id=eq.${teamId}`
        },
        async (payload) => {
          // Fetch the complete message with sender info
          const { data: newMessage } = await supabase
            .from('team_chat')
            .select(`
              *,
              sender:profiles!team_chat_sender_id_fkey(*)
            `)
            .eq('id', payload.new.id)
            .single();

          if (newMessage) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, initialMessages]);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('team_chat')
        .insert({
          team_id: teamId,
          sender_id: user.id,
          message
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  });

  return {
    messages,
    isLoading,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending
  };
};