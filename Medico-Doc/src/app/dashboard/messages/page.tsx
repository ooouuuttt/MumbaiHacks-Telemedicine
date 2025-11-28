
'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SendHorizonal, Search, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { Conversation, Message } from '@/services/chatService';
import { listenToMessages } from '@/services/chatService';
import { getConversationsForDoctor, sendMessage } from '@/services/chatActions';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchConversations() {
      if (user) {
        setIsLoading(true);
        const fetchedConversations = await getConversationsForDoctor(user.uid);
        setConversations(fetchedConversations);
        if (fetchedConversations.length > 0) {
          handleSelectConversation(fetchedConversations[0]);
        }
        setIsLoading(false);
      }
    }
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation?.id) {
      setIsMessagesLoading(true);
      const unsubscribe = listenToMessages(selectedConversation.id, (newMessages) => {
        setMessages(newMessages);
        setIsMessagesLoading(false);
        // Scroll to bottom after messages load
        setTimeout(() => {
            if (scrollAreaRef.current) {
                const viewport = scrollAreaRef.current.querySelector('div');
                if (viewport) viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
      });
      
      // Cleanup listener on component unmount or when conversation changes
      return () => unsubscribe();
    }
  }, [selectedConversation]);


  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessages([]); // Clear previous messages
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedConversation || !user) return;

    const messageToSend = {
      text: newMessage.trim(),
      senderId: user.uid,
    };
    
    setNewMessage('');
    await sendMessage(selectedConversation.id, messageToSend);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
      <Card className="md:col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
           <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="w-full appearance-none bg-background pl-8 shadow-none"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-grow">
          <ScrollArea className="h-full">
            {isLoading ? (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary"/>
                </div>
            ) : (
                <div className="flex flex-col">
                {conversations.map((convo) => (
                    <button
                    key={convo.id}
                    onClick={() => handleSelectConversation(convo)}
                    className={cn(
                        'flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors w-full border-b',
                        selectedConversation?.id === convo.id && 'bg-muted'
                    )}
                    >
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={convo.patientAvatar} alt={convo.patientName} data-ai-hint="person portrait"/>
                        <AvatarFallback>{convo.patientName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow overflow-hidden">
                        <p className="font-semibold">{convo.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                            {convo.lastMessageText || 'No messages yet'}
                        </p>
                    </div>
                     {convo.lastMessageTimestamp && (
                        <p className="text-xs text-muted-foreground self-start">
                            {formatDistanceToNow(convo.lastMessageTimestamp, { addSuffix: true })}
                        </p>
                    )}
                    </button>
                ))}
                </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 flex flex-col h-full">
        {selectedConversation ? (
          <>
            <CardHeader className="flex flex-row items-center gap-3 border-b">
              <Avatar>
                <AvatarImage src={selectedConversation.patientAvatar} alt={selectedConversation.patientName} data-ai-hint="person portrait"/>
                <AvatarFallback>{selectedConversation.patientName.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle className="m-0">{selectedConversation.patientName}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-y-auto">
                <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
                     {isMessagesLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin text-primary"/>
                        </div>
                     ) : (
                        <div className="flex flex-col gap-4">
                            {messages.length > 0 ? messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                'flex items-end gap-2 max-w-xs',
                                message.senderId === user?.uid ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                )}
                            >
                                <div
                                className={cn(
                                    'rounded-lg px-4 py-2',
                                    message.senderId === user?.uid
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                )}
                                >
                                <p>{message.text}</p>
                                <p className="text-xs text-right opacity-70 mt-1">
                                    {message.timestamp ? formatDistanceToNow(message.timestamp, { addSuffix: true }) : 'Sending...'}
                                </p>
                                </div>
                            </div>
                            )) : (
                                <div className="text-center text-muted-foreground pt-10">
                                    No messages in this conversation yet.
                                </div>
                            )}
                        </div>
                     )}
                </ScrollArea>
            </CardContent>
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  autoComplete="off"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <SendHorizonal className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <p>Select a conversation to start chatting.</p>}
          </div>
        )}
      </Card>
    </div>
  );
}
