
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Send, ArrowLeft } from 'lucide-react';
import { CardContent, CardFooter, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User } from 'firebase/auth';
import { getMessages, sendMessage, Message, updateDoc, doc } from '@/lib/chat-service';
import { Skeleton } from './ui/skeleton';
import { formatDoctorName } from '@/lib/utils';

interface ChatConsultationProps {
  chatId: string;
  doctorName: string;
  doctorAvatar: string;
  user: User;
  onEnd: () => void;
}

const ChatConsultation = ({ chatId, doctorName, doctorAvatar, user, onEnd }: ChatConsultationProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = getMessages(chatId, (newMessages) => {
            setMessages(newMessages);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user) return;

        const messageContent = newMessage;
        setNewMessage('');

        await sendMessage(chatId, user.uid, messageContent);
    };


  return (
    <div className="flex flex-col h-[calc(100vh-200px)] animate-in fade-in duration-500 bg-card rounded-xl shadow-lg">
      <CardHeader className='flex-row items-center justify-between p-3 border-b'>
         <div className='flex items-center gap-3'>
            <Button variant="ghost" size="icon" onClick={onEnd} className="h-8 w-8">
                <ArrowLeft />
            </Button>
            <Avatar>
                <AvatarImage src={doctorAvatar} alt={formatDoctorName(doctorName)} className="object-cover" />
                <AvatarFallback>{doctorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <h2 className="font-semibold text-lg">
                    {formatDoctorName(doctorName)}
                </h2>
                <p className="text-sm text-green-500">Online</p>
            </div>
         </div>
      </CardHeader>

      <CardContent className="flex-grow p-4 space-y-4 overflow-y-auto">
        {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-12 w-3/4 rounded-lg" />
                <Skeleton className="h-16 w-1/2 rounded-lg self-end" />
                <Skeleton className="h-12 w-3/4 rounded-lg" />
            </div>
        ) : (
            messages.map((msg) => (
                <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                    {msg.senderId !== user.uid && (
                         <Avatar className='h-8 w-8'>
                            <AvatarImage src={doctorAvatar} className="object-cover"/>
                            <AvatarFallback>{doctorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={`rounded-lg px-3 py-2 max-w-[80%] ${msg.senderId === user.uid ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.senderId === user.uid ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                           {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                     {msg.senderId === user.uid && user.photoURL && (
                         <Avatar className='h-8 w-8'>
                            <AvatarImage src={user.photoURL} className="object-cover" />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                    )}
                </div>
            ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className='p-2 border-t'>
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
            <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                autoComplete='off'
            />
            <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
            </Button>
        </form>
      </CardFooter>
    </div>
  );
};

export default ChatConsultation;
