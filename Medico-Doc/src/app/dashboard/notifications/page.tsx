
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { markAllNotificationsAsRead } from '@/services/notificationService';
import type { Notification } from '@/lib/types';
import { listenToNotifications } from '@/services/notificationListener';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellRing, Loader2, MailCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function NotificationsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            const unsubscribe = listenToNotifications(user.uid, (fetchedNotifications) => {
                setNotifications(fetchedNotifications);
                setIsLoading(false);
            });

            // Cleanup listener on component unmount
            return () => unsubscribe();
        }
    }, [user]);
    
    const handleMarkAllAsRead = async () => {
        if (!user) return;

        const result = await markAllNotificationsAsRead(user.uid);
        if (result.success) {
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            toast({
                title: 'Success',
                description: 'All notifications marked as read.',
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: result.error || 'Could not mark notifications as read.',
            });
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>View all your recent alerts and updates in real-time.</CardDescription>
                </div>
                 <Button size="sm" variant="outline" onClick={handleMarkAllAsRead} disabled={notifications.every(n => n.read) || notifications.length === 0}>
                    <MailCheck className="mr-2 h-4 w-4"/> Mark all as read
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map(notification => (
                            <div key={notification.id} className={cn(
                                "flex items-start gap-4 p-4 rounded-lg border",
                                !notification.read && "bg-primary/5 border-primary/20"
                            )}>
                                <div className={cn("mt-1", !notification.read && "text-primary")}>
                                    <BellRing className="h-5 w-5"/>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{notification.title}</p>
                                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <div className="w-2 h-2 mt-2 rounded-full bg-primary" aria-label="Unread"/>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-muted-foreground">
                        <BellRing className="mx-auto h-12 w-12 mb-4" />
                        <h3 className="text-lg font-semibold">No notifications yet</h3>
                        <p className="text-sm">We'll let you know when something important happens.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
