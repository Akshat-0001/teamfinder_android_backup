import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useMobile } from '@/hooks/useMobile';
import ClickableAvatar from '@/components/ClickableAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Users, Search, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const TeamChat = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Use mobile hook for keyboard handling
  useMobile();

  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      if (!teamId) throw new Error('Team ID required');
      
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          creator:profiles!teams_created_by_fkey(*),
          applicants:team_applicants(*, user:profiles(*))
        `)
        .eq('id', teamId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { messages, isLoading, sendMessage, isSending } = useChat(teamId || '');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]); // Always scroll when messages change

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(newMessage.trim());
    setNewMessage('');
    // Keep input focused after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups).sort(([a], [b]) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
  };

  if (!teamId) {
    navigate('/my-teams');
    return null;
  }

  const acceptedMembers = team?.applicants?.filter((app: any) => app.status === 'accepted') || [];
  const isCreator = team && user && team.created_by === user.id;
  const isMember = acceptedMembers.some((app: any) => app.user_id === user?.id);
  const hasAccess = isCreator || isMember;

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You need to be a member of this team to access the chat.
          </p>
          <Button onClick={() => navigate('/my-teams')}>
            Back to My Teams
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col bg-background min-h-0 h-full allow-copy allow-drag" style={{ minHeight: 0, height: '100dvh', maxHeight: '100dvh' }}>
      {/* TeamFinder App Top Bar (copied from Layout) */}
      <header className="mobile-header bg-card/80 backdrop-blur-lg border-b border-border/50 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="flex items-center space-x-2 focus:outline-none">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img
                src="https://res.cloudinary.com/dmz1x7at4/image/upload/cropped_circle_image-min_xiyyo5.png"
                alt="TeamFinder Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-xl text-foreground">TeamFinder</span>
          </button>
          <div className="flex items-center space-x-2">
            {/* Optionally add search or other icons here if needed */}
          </div>
        </div>
      </header>

      {/* Chat Header (below app top bar) */}
      <div className="bg-card/80 backdrop-blur-lg border-b border-border/50 px-4 py-3 safe-area-top">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="touch-target"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">{team?.title}</h1>
            <p className="text-sm text-muted-foreground">
              {acceptedMembers.length + 1} members
            </p>
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {team?.category}
          </Badge>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="touch-target" aria-label="Search messages">
                <Search className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 bg-card/90 backdrop-blur-lg border border-border/50 rounded-xl shadow-lg">
              <div className="flex items-center px-4 py-2 border-b border-border/30">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search messages..."
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && setSearchQuery('')}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="ml-2 text-muted-foreground hover:text-foreground focus:outline-none">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 mobile-scroll" style={{ minHeight: 0 }}>
        {messageGroups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Welcome to the team chat!</h3>
            <p className="text-muted-foreground">
              This is the beginning of your team's conversation. Say hello!
            </p>
          </div>
        ) : (
          messageGroups.map(([date, dayMessages]) => {
            // Filter messages by search query
            const filteredMessages = searchQuery
              ? dayMessages.filter(m => m.message.toLowerCase().includes(searchQuery.toLowerCase()) || (m.sender?.full_name && m.sender.full_name.toLowerCase().includes(searchQuery.toLowerCase())))
              : dayMessages;
            if (filteredMessages.length === 0) return null;
            return (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-6">
                  <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                    {formatDate(date)}
                  </div>
                </div>

                {/* Messages for this date */}
                <div className="space-y-4">
                  {filteredMessages.map((message, index) => {
                    const isCurrentUser = message.sender_id === user?.id;
                    const showAvatar = index === 0 || 
                      filteredMessages[index - 1]?.sender_id !== message.sender_id;

                    return (
                      <div
                        key={message.id}
                        className={`flex gap-2 sm:gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-start`}
                      >
                        {/* Avatar column: always reserve space */}
                        <div className="w-8 sm:w-10 flex-shrink-0 flex flex-col items-center">
                          {showAvatar ? (
                            message.sender && (
                              <ClickableAvatar 
                                profile={message.sender} 
                                size="sm" 
                              />
                            )
                          ) : null}
                        </div>

                        {/* Message bubble, always aligned */}
                        <div className={`flex-1 max-w-xs sm:max-w-md ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                          {showAvatar && (
                            <div className={`text-xs text-muted-foreground mb-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                              {isCurrentUser ? 'You' : message.sender?.full_name}
                            </div>
                          )}
                          <div
                            className={`inline-block px-3 py-2 rounded-2xl ${
                              isCurrentUser
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.message}</p>
                            <p className={`text-xs mt-1 opacity-70 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed position to handle keyboard */}
      <div className="bg-card/90 backdrop-blur-lg border-t border-border/50 px-4 pt-3 pb-2" style={{ position: 'relative' }}>
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 mt-4">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
            className="flex-1"
            disabled={isSending}
            inputMode="text"
          />
          <Button type="submit" className="btn-gradient" disabled={isSending || !newMessage.trim()}>
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TeamChat;