
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Edit, Activity } from 'lucide-react';
import { User } from 'firebase/auth';
import { getUserProfile, updateUserProfile, UserProfile } from '@/lib/user-service';
import { Skeleton } from './ui/skeleton';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  age: z.coerce
    .number({ invalid_type_error: 'Age must be a number' })
    .min(1, 'Age must be greater than 0.')
    .max(120),
  gender: z.string().nonempty('Please select a gender.'),
  contact: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit contact number.'),
  village: z.string().min(2, 'Village name is required.'),
  healthRecords: z.string().optional(),
   vitals: z.object({
    bloodPressure: z.string().optional(),
    heartRate: z.string().optional(),
    temperature: z.string().optional(),
    respiratoryRate: z.string().optional(),
  }).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

interface ProfileProps {
  user: User;
}

const Profile = ({ user }: ProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [originalValues, setOriginalValues] = useState<Partial<UserProfile>>({});
  const { toast } = useToast();
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      age: 0,
      gender: '',
      contact: '',
      village: '',
      healthRecords: '',
      vitals: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        respiratoryRate: '',
      },
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const profileData = await getUserProfile(user);
      if (profileData) {
        form.reset(profileData);
        setOriginalValues(profileData);
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, [user, form]);

  async function onSubmit(values: ProfileFormData) {
    setIsLoading(true);
    try {
      const updatedProfile: Partial<UserProfile> = {
          ...originalValues,
          ...values,
          vitals: {
            ...originalValues?.vitals,
            ...values.vitals,
          }
      };
      await updateUserProfile(user.uid, updatedProfile);
      setOriginalValues(updatedProfile);
      toast({
        title: 'Profile Updated',
        description: 'Your details have been saved successfully.',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not save your profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCancel = () => {
    if (originalValues) {
      form.reset(originalValues);
    }
    setIsEditing(false);
  };

  if (isLoading && !originalValues) {
    return <ProfileSkeleton />;
  }
  
  const watchedName = form.watch('name');
  const watchedVillage = form.watch('village');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex flex-col items-center space-y-4">
        <div className="relative">
            <Image
              src={user.photoURL || userAvatar?.imageUrl || ''}
              alt={user.displayName || 'User Avatar'}
              data-ai-hint={userAvatar?.imageHint}
              width={100}
              height={100}
              className="rounded-full border-4 border-primary/50 shadow-lg object-cover"
            />
          <Button size="icon" variant="outline" className="absolute bottom-0 right-0 h-8 w-8 rounded-full" onClick={() => setIsEditing(true)} disabled={isEditing || isLoading}>
            <Edit className="h-4 w-4"/>
          </Button>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold font-headline">{watchedName}</h2>
          <p className="text-muted-foreground">{watchedVillage}</p>
        </div>
      </div>


      <Card className='rounded-xl'>
        <CardHeader>
          <CardTitle>Your Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} disabled={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Your age" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} disabled={!isEditing}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!isEditing}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="10-digit mobile number" {...field} disabled={!isEditing}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="village"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Village/Town</FormLabel>
                    <FormControl>
                      <Input placeholder="Your village or town" {...field} disabled={!isEditing}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="healthRecords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical History</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., allergies, chronic conditions"
                        {...field}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               {isEditing && (
                 <>
                    <CardTitle className="text-lg pt-4">Vitals</CardTitle>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="vitals.bloodPressure" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blood Pressure</FormLabel>
                            <FormControl><Input placeholder="e.g. 120/80 mmHg" {...field} disabled={!isEditing}/></FormControl>
                          </FormItem>
                        )}
                      />
                       <FormField control={form.control} name="vitals.heartRate" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Heart Rate</FormLabel>
                            <FormControl><Input placeholder="e.g. 72 bpm" {...field} disabled={!isEditing}/></FormControl>
                          </FormItem>
                        )}
                      />
                       <FormField control={form.control} name="vitals.temperature" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Temperature</FormLabel>
                            <FormControl><Input placeholder="e.g. 98.6°F" {...field} disabled={!isEditing}/></FormControl>
                          </FormItem>
                        )}
                      />
                       <FormField control={form.control} name="vitals.respiratoryRate" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Respiratory Rate</FormLabel>
                            <FormControl><Input placeholder="e.g. 16 breaths/min" {...field} disabled={!isEditing}/></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                </>
              )}
              {isEditing ? (
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <><Activity className="animate-spin mr-2"/> Saving...</> : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel} className="w-full" disabled={isLoading}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)} className="w-full" disabled={isLoading}>
                    Edit Profile
                  </Button>
                )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

const ProfileSkeleton = () => (
   <div className="space-y-6">
    <div className="flex flex-col items-center space-y-4">
      <Skeleton className="h-[100px] w-[100px] rounded-full" />
      <div className="text-center space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
    <Card className='rounded-xl'>
      <CardHeader>
        <CardTitle>Your Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Skeleton className="h-5 w-16" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-5 w-16" /><Skeleton className="h-10 w-full" /></div>
        </div>
        <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>
        <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>
        <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>
        <Skeleton className="h-10 w-full mt-4" />
      </CardContent>
    </Card>
  </div>
);


export default Profile;
