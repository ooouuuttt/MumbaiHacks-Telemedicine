
'use client';

import { useParams, notFound } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { appointments } from '@/lib/data'; // Using mock data for now
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ConsultationPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const { user } = useAuth();
    
    // In a real app, you'd fetch this from your service
    const appointment = appointments.find(app => app.id === id);

    if (!appointment) {
        notFound();
    }
    
    // Mock state for controls
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);

    return (
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Video Consultation</CardTitle>
                        <CardDescription>Appointment with {appointment.patientName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <p className="text-muted-foreground">Patient video feed</p>
                            <div className="absolute bottom-4 right-4 h-24 w-40 bg-background rounded-lg border flex items-center justify-center">
                                <p className="text-xs text-muted-foreground">Doctor video feed</p>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-center items-center gap-4">
                            <Button variant={isMicOn ? 'outline' : 'destructive'} size="icon" className="rounded-full h-12 w-12" onClick={() => setIsMicOn(!isMicOn)}>
                                {isMicOn ? <Mic/> : <MicOff/>}
                            </Button>
                             <Button variant={isCamOn ? 'outline' : 'destructive'} size="icon" className="rounded-full h-12 w-12" onClick={() => setIsCamOn(!isCamOn)}>
                                {isCamOn ? <Video/> : <VideoOff/>}
                            </Button>
                            <Button variant="destructive" size="icon" className="rounded-full h-12 w-12">
                                <PhoneOff/>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={appointment.patientAvatar} alt={appointment.patientName}/>
                                <AvatarFallback>{appointment.patientName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{appointment.patientName}</CardTitle>
                                <CardDescription>Patient Details</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="text-sm space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Type</span>
                            <Badge variant="outline" className="capitalize">{appointment.type}</Badge>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Time</span>
                            <span>{appointment.time}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Date</span>
                            <span>{appointment.date}</span>
                        </div>
                        <Separator/>
                        <Button className="w-full"><MessageSquare className="mr-2 h-4 w-4"/> Open Chat</Button>
                         <Button className="w-full" variant="outline">View Full Records</Button>
                    </CardContent>
                 </Card>
            </div>
        </div>
    )
}
