
'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import {
  Bot,
  Stethoscope,
  Pill,
  Newspaper,
  Calendar,
  AlertTriangle,
  ScanText,
  Bell,
  BarChart3,
  HeartPulse,
} from 'lucide-react';
import type { Tab } from '@/components/app-shell';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getHealthNewsSummary } from '@/ai/flows/health-news-summaries';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/context/i18n';
import { Separator } from './ui/separator';
import { getNotifications, Notification } from '@/lib/notification-service';
import { useAuth } from '@/hooks/use-auth';

interface DashboardProps {
  setActiveTab: (tab: Tab) => void;
}

const iconMap: { [key: string]: React.ElementType } = {
  appointment: Calendar,
  medicine: Pill,
  alert: AlertTriangle,
  news: Newspaper,
  trends: BarChart3,
};

const Dashboard: FC<DashboardProps> = ({ setActiveTab }) => {
  const [newsSummary, setNewsSummary] = useState('');
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const { t } = useTranslation();
  const user = useAuth();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoadingNews(true);
        const { summary } = await getHealthNewsSummary({ query: 'latest health news for rural India' });
        setNewsSummary(summary);
      } catch (error) {
        console.error('Failed to fetch health news:', error);
        setNewsSummary('The health news service is currently busy. Please try again in a few moments.');
      } finally {
        setIsLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    if (user?.uid) {
      setIsLoadingNotifications(true);
      const unsubscribe = getNotifications(user.uid, (newNotifications) => {
        setNotifications(newNotifications);
        setIsLoadingNotifications(false);
      });
      return () => unsubscribe();
    } else {
        setIsLoadingNotifications(false);
    }
  }, [user]);

  const quickAccessItems = [
    { title: t('symptom_checker'), icon: Bot, tab: 'symptoms' },
    { title: t('book_consultation'), icon: Stethoscope, tab: 'consult' },
    { title: t('scan_prescription'), icon: ScanText, tab: 'scan-prescription' },
    { title: t('order_medicines'), icon: Pill, tab: 'medical' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-3 text-center">
        {quickAccessItems.map((item) => (
          <div key={item.title}>
            <Button
              variant="outline"
              className="bg-card h-24 w-full flex flex-col justify-center items-center gap-2 rounded-xl shadow-sm hover:bg-primary/5"
              onClick={() => setActiveTab(item.tab as Tab)}
            >
              <item.icon className="h-8 w-8 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                {item.title}
              </span>
            </Button>
          </div>
        ))}
      </div>

       <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center space-y-0 p-4 bg-primary/10">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg ml-2">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-0 text-sm">
          <div className='max-h-48 overflow-y-auto'>
          {isLoadingNotifications ? (
            <div className='p-4 space-y-3'>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification, index) => {
              const Icon = iconMap[notification.type] || Bell;
              return (
                <div key={notification.id} className="flex flex-col">
                    <div className="flex items-start gap-3 p-4">
                      <div className="bg-secondary p-2 rounded-full mt-1">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{notification.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(notification.createdAt.toDate()).toLocaleString()}
                        </p>
                        <p className='mt-1'>{notification.description}</p>
                      </div>
                    </div>
                     {index < notifications.length - 1 && <Separator />}
                </div>
              );
            })
          ) : (
            <p className='text-center text-muted-foreground p-4'>No new notifications.</p>
          )}
          </div>
        </CardContent>
        <CardFooter className='p-2 bg-secondary/30'>
            <Button variant="ghost" size="sm" className='w-full' onClick={() => setActiveTab('notifications')}>View All Notifications</Button>
        </CardFooter>
      </Card>
      
      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center space-y-0 p-4 bg-primary/10">
          <HeartPulse className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg ml-2">{t('health_records')}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
            <p className="text-muted-foreground text-sm mb-4">{t('view_your_history')}</p>
            <Button className='w-full' onClick={() => setActiveTab('records')}>Go to Health Records</Button>
        </CardContent>
      </Card>


      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center space-y-0 p-4 bg-primary/10">
          <Newspaper className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg ml-2">{t('health_news')}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-sm">
          {isLoadingNews ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <p className="text-muted-foreground leading-relaxed">{newsSummary}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
