'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Doctor } from '@/lib/dummy-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';
import { PhoneOff, Mic, MicOff } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { formatDoctorName } from '@/lib/utils';

interface AudioConsultationProps {
  doctor: Doctor;
  onEnd: () => void;
}

const AudioConsultation = ({ doctor, onEnd }: AudioConsultationProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const doctorAvatar = PlaceHolderImages.find(
    (img) => img.id === `doctor-avatar-${doctor.id}`
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex flex-col h-full items-center justify-center animate-in fade-in duration-500 p-4 space-y-6">
      <div className='text-center space-y-2'>
        <p className="text-muted-foreground">Audio Call with</p>
        <h2 className="text-2xl font-bold">
            {formatDoctorName(doctor.name)}
        </h2>
      </div>

      <div className="relative">
        {doctorAvatar && (
            <Image
              src={doctorAvatar.imageUrl}
              alt={doctorAvatar.description}
              width={160}
              height={160}
              className="rounded-full border-4 border-primary/50 shadow-lg"
              data-ai-hint={doctorAvatar.imageHint}
            />
        )}
      </div>

       <p className="text-2xl font-mono">{formatDuration(callDuration)}</p>

      <Card className="w-full max-w-sm">
        <CardContent className="p-4 flex justify-center items-center gap-4">
          <Button variant={isMuted ? 'secondary' : 'outline'} size="icon" className="h-16 w-16 rounded-full" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <MicOff size={28}/> : <Mic size={28}/>}
          </Button>
          <Button variant="destructive" size="icon" className="h-16 w-16 rounded-full" onClick={onEnd}>
            <PhoneOff size={28}/>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioConsultation;
