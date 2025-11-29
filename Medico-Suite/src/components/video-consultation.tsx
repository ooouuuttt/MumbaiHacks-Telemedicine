'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Doctor } from '@/lib/dummy-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { formatDoctorName } from '@/lib/utils';

interface VideoConsultationProps {
  doctor: Doctor;
  onEnd: () => void;
}

const VideoConsultation = ({ doctor, onEnd }: VideoConsultationProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const doctorAvatar = PlaceHolderImages.find(
    (img) => img.id === `doctor-avatar-${doctor.id}`
  );

    useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
         setHasCameraPermission(false);
         toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [toast]);


  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => track.enabled = !isMuted);
      stream.getVideoTracks().forEach(track => track.enabled = !isVideoOff);
    }
  }, [isMuted, isVideoOff]);


  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 p-4 space-y-4">
      <h2 className="text-xl font-bold text-center">
        Video Call with {formatDoctorName(doctor.name)}
      </h2>
      <Card className="flex-grow relative overflow-hidden rounded-xl">
        {doctorAvatar && (
            <Image
              src={doctorAvatar.imageUrl}
              alt={doctorAvatar.description}
              fill
              className="object-cover"
              data-ai-hint={doctorAvatar.imageHint}
            />
        )}
         <div className="absolute bottom-4 right-4 w-1/3 aspect-[3/4] rounded-lg overflow-hidden border-2 border-white/50">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        </div>
      </Card>

      { !hasCameraPermission && (
          <Alert variant="destructive">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access to use this feature.
              </AlertDescription>
         </Alert>
      )}

      <Card>
        <CardContent className="p-4 flex justify-center items-center gap-3">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <MicOff /> : <Mic />}
          </Button>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={() => setIsVideoOff(!isVideoOff)}>
            {isVideoOff ? <VideoOff /> : <Video />}
          </Button>
          <Button variant="destructive" size="icon" className="h-12 w-12 rounded-full" onClick={onEnd}>
            <PhoneOff />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoConsultation;
