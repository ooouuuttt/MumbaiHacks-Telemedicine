
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Loader2, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useToast } from '@/hooks/use-toast';
import { getDoctorProfile, updateUserProfile, type UserProfile } from '@/services/doctorService';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Checkbox } from '@/components/ui/checkbox';

const defaultAvailability = {
  monday: '09:00-17:00',
  tuesday: '09:00-17:00',
  wednesday: '09:00-17:00',
  thursday: '09:00-17:00',
  friday: '09:00-17:00',
  saturday: '',
  sunday: '',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        setIsLoading(true);
        const userProfile = await getDoctorProfile(user.uid);

        if (userProfile) {
          setProfile(userProfile);
        } else {
           const defaultProfile = await createDoctorProfile(user, { name: user.displayName || 'Dr. User' });
           setProfile(defaultProfile);
        }
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [user]);
  
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    
    setIsLoading(true);
    try {
      await updateUserProfile(user.uid, profile);

      if (auth.currentUser && auth.currentUser.displayName !== profile.name) {
        await updateProfile(auth.currentUser, { displayName: profile.name });
      }

      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
      });
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
      });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (profile) {
      setProfile(prev => ({...prev!, [id]: value}));
    }
  }
  
  const handleFeeChange = (type: 'video' | 'audio' | 'chat', value: string) => {
    if (profile) {
      setProfile(prev => ({
        ...prev!,
        consultationFee: {
          ...prev!.consultationFee,
          [type]: Number(value) || 0,
        }
      }))
    }
  }

  const handleConsultationTypeChange = (type: 'video' | 'audio' | 'chat', checked: boolean) => {
    if (profile) {
        const currentTypes = profile.consultationTypes || [];
        const newTypes = checked
            ? [...currentTypes, type]
            : currentTypes.filter(t => t !== type);
        setProfile(prev => ({ ...prev!, consultationTypes: newTypes }));
    }
  };


  if (isLoading || !profile) {
    return (
       <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>
              Update your personal and professional information.
            </CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={handleEditClick}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form className="grid gap-8" onSubmit={handleSaveClick}>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar} alt={`Dr. ${profile.name}`} data-ai-hint="doctor portrait" />
                <AvatarFallback className="text-2xl">{profile.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button variant="outline" disabled={!isEditing}>Change Photo</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={profile.name} onChange={handleInputChange} disabled={!isEditing} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" value={profile.specialization} onChange={handleInputChange} disabled={!isEditing} />
              </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profile.email} onChange={handleInputChange} disabled={true} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input id="experience" type="number" value={profile.experience} onChange={handleInputChange} disabled={!isEditing} />
                </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">About Me</Label>
              <Textarea id="bio" placeholder="Tell us a little bit about yourself" value={profile.bio} onChange={handleInputChange} disabled={!isEditing} />
            </div>

            <div className="grid gap-4">
                <Label className="font-semibold">Consultation Types</Label>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="video" checked={profile.consultationTypes.includes('video')} onCheckedChange={(checked) => handleConsultationTypeChange('video', !!checked)} disabled={!isEditing}/>
                        <Label htmlFor="video">Video</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="audio" checked={profile.consultationTypes.includes('audio')} onCheckedChange={(checked) => handleConsultationTypeChange('audio', !!checked)} disabled={!isEditing}/>
                        <Label htmlFor="audio">Audio</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="chat" checked={profile.consultationTypes.includes('chat')} onCheckedChange={(checked) => handleConsultationTypeChange('chat', !!checked)} disabled={!isEditing}/>
                        <Label htmlFor="chat">Chat</Label>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                <Label className="font-semibold">Consultation Fees (INR)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="fee-video">Video</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                            <Input id="fee-video" type="number" value={profile.consultationFee.video} onChange={(e) => handleFeeChange('video', e.target.value)} disabled={!isEditing} className="pl-8"/>
                        </div>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="fee-audio">Audio</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                            <Input id="fee-audio" type="number" value={profile.consultationFee.audio} onChange={(e) => handleFeeChange('audio', e.target.value)} disabled={!isEditing} className="pl-8"/>
                        </div>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="fee-chat">Chat</Label>
                         <div className="relative">
                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                            <Input id="fee-chat" type="number" value={profile.consultationFee.chat} onChange={(e) => handleFeeChange('chat', e.target.value)} disabled={!isEditing} className="pl-8"/>
                        </div>
                    </div>
                </div>
            </div>

             <div className="grid gap-2">
              <Label htmlFor="license">Medical License</Label>
              <Input id="license" value={profile.license} disabled={!isEditing} onChange={handleInputChange} />
            </div>

            {isEditing && (
              <Button type="submit" className="w-full md:w-auto justify-self-start" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
