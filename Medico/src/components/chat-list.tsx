
'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { getChats, Chat } from '@/lib/chat-service';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { MessageSquare } from 'lucide-react';
import type { Tab } from './app-shell';
import { formatDistanceToNow } from 'date-fns';
import { formatDoctorName } from '@/lib/utils';

interface ChatListProps {
  user: User;
  setActiveTab: (tab: Tab, state?: any) => void;
}

const ChatList = ({ user, setActiveTab }: ChatListProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = getChats(user.uid, (data) => {
      setChats(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleChatSelect = (chat: Chat) => {
    setActiveTab('chat', {
        chatId: chat.id,
        doctorName: chat.doctorName,
        doctorAvatar: chat.doctorAvatar,
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-headline">Your Chats</h2>
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full space-y-4 p-4 animate-in fade-in duration-500">
        <MessageSquare className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold font-headline">No Chats Found</h2>
        <p className="text-muted-foreground">
          Your conversations with doctors will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold font-headline">Your Chats</h2>
      {chats.map((chat) => (
        <Card key={chat.id} className="shadow-sm rounded-xl hover:bg-muted/50 cursor-pointer" onClick={() => handleChatSelect(chat)}>
          <CardContent className="p-4 flex items-center gap-4">
            <Avatar className="h-12 w-12 border">
              <AvatarImage src={chat.doctorAvatar} alt={chat.doctorName} className="object-cover"/>
              <AvatarFallback>{chat.doctorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold">{formatDoctorName(chat.doctorName)}</h3>
                <p className="text-xs text-muted-foreground">
                    {chat.lastMessageTimestamp && formatDistanceToNow(chat.lastMessageTimestamp.toDate(), { addSuffix: true })}
                </p>
              </div>
              <p className="text-sm text-muted-foreground truncate">{chat.lastMessageText}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ChatList;
