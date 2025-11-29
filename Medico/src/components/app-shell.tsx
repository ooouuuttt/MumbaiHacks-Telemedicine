
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Home, Stethoscope, ClipboardList, User as UserIcon, LogOut, CalendarCheck, Languages, ChevronDown, FileText, MessageSquare, ShoppingBag, Mic, MicOff, Activity } from 'lucide-react';
import { cn, formatDoctorName } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Dashboard from '@/components/dashboard';
import SymptomChecker from '@/components/symptom-checker';
import Teleconsultation from '@/components/teleconsultation';
import HealthRecords from '@/components/health-records';
import Profile from '@/components/profile';
import { Logo } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Medical from './medical';
import PrescriptionReader from './prescription-reader';
import { User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Appointments from './appointments';
import { useTranslation } from '@/context/i18n';
import Prescriptions from './prescriptions';
import { Medication } from '@/lib/user-service';
import ChatList from './chat-list';
import ChatConsultation from './chat-consultation';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { createNotification } from '@/lib/notification-service';
import { Prescription } from '@/lib/prescription-service';
import { Pharmacy } from '@/lib/pharmacy-service';
import OrderHistory from './order-history';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { interpretCommand } from '@/ai/flows/voice-command-interpreter';
import Notifications from './notifications';

export type Tab = 'home' | 'symptoms' | 'consult' | 'records' | 'profile' | 'medical' | 'scan-prescription' | 'appointments' | 'prescriptions' | 'chats' | 'chat' | 'order-history' | 'notifications';

export interface MedicalTabState {
  pharmacy?: Pharmacy;
  medicineName?: string;
  medicinesToFind?: string[]; // For finding all medicines in a prescription
  prescriptionToBill?: Prescription; // For viewing a bill for a prescription
  prescriptionToSend?: { doctorName: string; date: string, medications: Medication[] }; // For sending a prescription
}

export interface ChatTabState {
    chatId: string;
    doctorName: string;
    doctorAvatar: string;
}

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

interface AppShellProps {
  user: User;
}

const languageNames: {[key: string]: string} = {
  en: 'English',
  hi: 'हिन्दी',
  pa: 'ਪੰਜਾਬੀ',
};

export default function AppShell({ user }: AppShellProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [medicalTabState, setMedicalTabState] = useState<MedicalTabState>({});
  const [chatTabState, setChatTabState] = useState<ChatTabState | undefined>();
  const { toast } = useToast();
  const { language, t, setLanguage } = useTranslation();
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // Client-side check for voice recognition support
    if (typeof window !== 'undefined') {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setVoiceSupported(!!SpeechRecognition);
    }
  }, []);


  const handleCommand = async (command: string) => {
    if (!command) return;
    setIsProcessingCommand(true);
    try {
      const { intent } = await interpretCommand({ command });
      if (intent && intent !== 'unknown') {
        setActiveTab(intent as Tab);
        toast({
            title: "Navigating...",
            description: `Switching to ${intent.replace('-', ' ')}.`,
        });
      } else {
        toast({
            variant: "destructive",
            title: "Command not understood",
            description: "Sorry, I didn't understand that. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error interpreting command:", error);
       toast({
            variant: "destructive",
            title: "Voice Error",
            description: "Could not process the voice command.",
        });
    } finally {
        setIsProcessingCommand(false);
    }
  };

  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition({
      onTranscriptReady: handleCommand
  });


  useEffect(() => {
    if (!user) return;

    const q = query(
        collection(db, "appointments"),
        where('patientId', '==', user.uid),
        where('status', '==', 'upcoming')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.forEach((doc) => {
            const appointment = doc.data();
            // Handle different date formats: Timestamp, Date, or string
            let appointmentTime: Date;
            if (appointment.date instanceof Timestamp) {
              appointmentTime = appointment.date.toDate();
            } else if (appointment.date instanceof Date) {
              appointmentTime = appointment.date;
            } else if (typeof appointment.date === 'string') {
              appointmentTime = new Date(appointment.date);
            } else {
              return; // Skip if date is invalid
            }
            const now = new Date();
            const fiveMinutesInMs = 5 * 60 * 1000;

            if (appointmentTime.getTime() > now.getTime() && appointmentTime.getTime() - now.getTime() < fiveMinutesInMs) {
                // Check if a notification for this appointment has already been sent
                const notificationSent = sessionStorage.getItem(`notif_${doc.id}`);
                if (!notificationSent) {
                    createNotification(user.uid, {
                        title: 'Appointment Reminder',
                        description: `Your appointment with ${formatDoctorName(appointment.doctorName)} is in less than 5 minutes.`,
                        type: 'appointment'
                    });
                    // Mark that notification has been sent for this session
                    sessionStorage.setItem(`notif_${doc.id}`, 'true');
                }
            }
        });
    });

    const interval = setInterval(() => {
      // Re-run the check every minute
      // This is a simple client-side solution. A robust solution would use server-side push notifications.
      const now = new Date();
       const q = query(
          collection(db, "appointments"),
          where('patientId', '==', user.uid),
          where('status', '==', 'upcoming')
      );
      onSnapshot(q, (snapshot) => {
        snapshot.forEach((doc) => {
            const appointment = doc.data();
            // Handle different date formats: Timestamp, Date, or string
            let appointmentTime: Date;
            if (appointment.date instanceof Timestamp) {
              appointmentTime = appointment.date.toDate();
            } else if (appointment.date instanceof Date) {
              appointmentTime = appointment.date;
            } else if (typeof appointment.date === 'string') {
              appointmentTime = new Date(appointment.date);
            } else {
              return; // Skip if date is invalid
            }
            const fiveMinutesInMs = 5 * 60 * 1000;
             if (appointmentTime.getTime() > now.getTime() && appointmentTime.getTime() - now.getTime() < fiveMinutesInMs) {
                 const notificationSent = sessionStorage.getItem(`notif_${doc.id}`);
                 if (!notificationSent) {
                    createNotification(user.uid, {
                        title: 'Appointment Reminder',
                        description: `Your appointment with ${formatDoctorName(appointment.doctorName)} is starting soon.`,
                        type: 'appointment'
                    });
                    sessionStorage.setItem(`notif_${doc.id}`, 'true');
                 }
            }
        })
      })
    }, 60000); // every minute


    return () => {
        unsubscribe();
        clearInterval(interval);
    }
  }, [user]);


  const handleSetActiveTab = (tab: Tab, state?: any) => {
    setMedicalTabState({});
    setChatTabState(undefined);

    if (tab === 'medical' && state) {
      setMedicalTabState(state);
    } 
    if (tab === 'chat' && state) {
        setChatTabState(state);
    }
    
    setActiveTab(tab);
  };

  const handleSignOut = async () => {
    await auth.signOut();
    toast({ title: 'Signed out successfully.'});
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard setActiveTab={handleSetActiveTab} />;
      case 'symptoms':
        return <SymptomChecker />;
      case 'consult':
        return <Teleconsultation user={user} setActiveTab={handleSetActiveTab} />;
      case 'records':
        return <HealthRecords user={user} />;
      case 'appointments':
        return <Appointments user={user} setActiveTab={handleSetActiveTab} />;
      case 'order-history':
        return <OrderHistory user={user} setActiveTab={handleSetActiveTab} />;
      case 'medical':
        return <Medical initialState={medicalTabState} setActiveTab={handleSetActiveTab} user={user} />;
      case 'scan-prescription':
        return <PrescriptionReader user={user} setActiveTab={handleSetActiveTab} />;
      case 'prescriptions':
        return <Prescriptions user={user} setActiveTab={handleSetActiveTab} />;
      case 'chats':
        return <ChatList user={user} setActiveTab={handleSetActiveTab} />;
      case 'chat':
        if (!chatTabState) return <ChatList user={user} setActiveTab={handleSetActiveTab} />;
        return <ChatConsultation chatId={chatTabState.chatId} doctorName={chatTabState.doctorName} doctorAvatar={chatTabState.doctorAvatar} user={user} onEnd={() => setActiveTab('chats')} />;
      case 'notifications':
        return <Notifications user={user} setActiveTab={handleSetActiveTab} />;
      case 'profile':
        return <Profile user={user} />;
      default:
        return <Dashboard setActiveTab={handleSetActiveTab} />;
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: t('home') },
    { id: 'consult', icon: Stethoscope, label: t('consult') },
    { id: 'chats', icon: MessageSquare, label: 'Chats' },
    { id: 'prescriptions', icon: FileText, label: t('prescriptions')},
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto bg-card shadow-2xl flex flex-col min-h-screen">
        <header className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <h1 className="text-xl font-bold font-headline text-primary">
              Medico
            </h1>
          </div>
          <div className="flex items-center gap-2">
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 h-auto text-sm bg-primary/10 hover:bg-primary/20">
                      <Languages className="w-5 h-5 text-primary"/>
                      <span>{languageNames[language]}</span>
                      <ChevronDown className="w-4 h-4 text-primary/80"/>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('hi')}>हिन्दी</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('pa')}>ਪੰਜਾਬੀ</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-0 h-auto rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
                    aria-label="Open user menu"
                  >
                    <Image
                      src={user.photoURL || userAvatar?.imageUrl || ''}
                      alt={user.displayName || 'User Avatar'}
                      data-ai-hint={userAvatar?.imageHint}
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-primary/50 object-cover"
                    />
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('my_account')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab('profile')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>{t('profile')}</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setActiveTab('appointments')}>
                  <CalendarCheck className="mr-2 h-4 w-4" />
                  <span>{t('appointments')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('records')}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  <span>{t('records')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('order-history')}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  <span>Order History</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('log_out')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
          {renderContent()}
        </main>

        <footer className="sticky bottom-0 bg-card border-t border-border mt-auto">
          <nav className="relative flex justify-around items-center p-1 h-[60px]">
            {navItems.slice(0, 2).map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  'flex flex-col h-auto items-center justify-center gap-1 p-2 w-full rounded-lg transition-colors duration-200',
                  activeTab === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground'
                )}
                onClick={() => setActiveTab(item.id as Tab)}
                aria-label={item.label}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            ))}

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%+15px)]">
              {voiceSupported && (
                <Button
                  variant="default"
                  size="icon"
                  onClick={isListening ? stopListening : startListening}
                  className={cn(
                    'h-16 w-16 rounded-full shadow-lg bg-primary hover:bg-primary/90',
                    isListening && 'bg-destructive/80 text-destructive-foreground animate-pulse'
                  )}
                >
                  {isProcessingCommand ? <Activity className="h-7 w-7 animate-spin" /> : <Mic className="h-7 w-7"/>}
                </Button>
              )}
            </div>

            {navItems.slice(2).map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  'flex flex-col h-auto items-center justify-center gap-1 p-2 w-full rounded-lg transition-colors duration-200',
                  activeTab === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground'
                )}
                onClick={() => setActiveTab(item.id as Tab)}
                aria-label={item.label}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            ))}
          </nav>
        </footer>
      </div>
    </div>
  );
}
