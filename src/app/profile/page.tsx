
'use client';

import { useEffect, useState } from 'react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

import Header from '@/components/layout/header';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/types';
import { getUserProfile, updateUserProfile } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const profileFormSchema = z.object({
  name: z.string().max(50).optional(),
  location: z.string().max(100).optional(),
  phoneNumber: z.string().max(20).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

function ProfilePageSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      location: '',
      phoneNumber: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        setLoading(true);
        try {
          const idToken = await user.getIdToken();
          const userProfile = await getUserProfile(idToken);
          setProfile(userProfile);
          if (userProfile) {
            form.reset({
              name: userProfile.name || '',
              location: userProfile.location || '',
              phoneNumber: userProfile.phoneNumber || '',
            });
          }
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Failed to fetch profile',
            description: 'Could not load your profile data. Please try again.',
          });
        } finally {
          setLoading(false);
        }
      }
    }
    fetchProfile();
  }, [user, toast, form]);

  async function onSubmit(values: ProfileFormValues) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to update your profile.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const idToken = await user.getIdToken();
      const result = await updateUserProfile(values, idToken);
      if (result.success) {
        toast({
          title: 'Profile Updated',
          description: 'Your information has been successfully saved.',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Could not update your profile. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <ProfilePageSkeleton />
        </main>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect is handled by useEffect
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">My Profile</CardTitle>
            <CardDescription>
              Update your personal information here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="cursor-not-allowed bg-muted/50"
                    />
                  </FormControl>
                </FormItem>
                 <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., San Francisco, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
