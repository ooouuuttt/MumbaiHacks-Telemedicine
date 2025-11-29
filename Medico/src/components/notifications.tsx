
'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { getNotifications, Notification } from '@/lib/notification-service';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Bell, Calendar, Pill, AlertTriangle, Newspaper, BarChart3 } from 'lucide-react';
import type { Tab } from './app-shell';
import { Separator } from './ui/separator';

interface NotificationsProps {
  user: User;
  setActiveTab: (tab: Tab) => void;
}

const iconMap: { [key: string]: React.ElementType } = {
  appointment: Calendar,
  medicine: Pill,
  alert: AlertTriangle,
  news: Newspaper,
  trends: BarChart3,
};

const Notifications = ({ user, setActiveTab }: NotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = getNotifications(user.uid, (data) => {
      setNotifications(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-headline">All Notifications</h2>
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full space-y-4 p-4 animate-in fade-in duration-500">
        <Bell className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold font-headline">No Notifications</h2>
        <p className="text-muted-foreground">
          Important updates and reminders will appear here.
        </p>
      </div>
    );
  }

  const handleNotificationClick = (notification: Notification) => {
    if (notification.url) {
      window.open(notification.url, '_blank');
    } else if (notification.type === 'appointment') {
      setActiveTab('appointments');
    } else if (notification.type === 'medicine') {
        setActiveTab('order-history');
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold font-headline">All Notifications</h2>
      <Card>
        <CardContent className="p-0">
          {notifications.map((notification, index) => {
            const Icon = iconMap[notification.type] || Bell;
            return (
              <div key={notification.id} className="flex flex-col">
                <div
                  className="flex items-start gap-4 p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="bg-secondary p-3 rounded-full mt-1">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold">{notification.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-2">
                      {new Date(notification.createdAt.toDate()).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                {index < notifications.length - 1 && <Separator />}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
