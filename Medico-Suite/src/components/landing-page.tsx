

'use client';

import Image from 'next/image';
import {
  HeartPulse,
  Bot,
  Stethoscope,
  ScanText,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface LandingPageProps {
  onGetStarted: () => void;
}

const features = [
  {
    icon: Bot,
    title: 'AI Symptom Checker',
    description: 'Get an AI-powered analysis of your symptoms in seconds.',
  },
  {
    icon: Stethoscope,
    title: 'Teleconsultation',
    description: 'Connect with doctors via video, audio, or chat.',
  },
  {
    icon: ScanText,
    title: 'Prescription Scanner',
    description: 'Digitize your prescriptions and find medicine availability.',
  },
  {
    icon: ClipboardList,
    title: 'Health Records',
    description: 'Keep all your medical records securely in one place.',
  },
];

const landingHeroImage = PlaceHolderImages.find((img) => img.id === 'landing-hero');

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground animate-in fade-in duration-1000">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <h1 className="text-2xl font-bold font-headline text-primary">
              Medico
            </h1>
          </div>
        </header>

        <main className="space-y-16 md:space-y-24 py-12 md:py-20">
          {/* Hero Section */}
          <section className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">
              Your Personal Health Companion
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Instant medical guidance, teleconsultations, and health management,
              all in one place. Built for you.
            </p>
            <Button size="lg" className="h-12 text-lg px-8" onClick={onGetStarted}>
              Get Started Now
            </Button>
            {landingHeroImage && (
              <div className="mt-12 w-full max-w-2xl mx-auto">
                 <Image
                    src={landingHeroImage.imageUrl}
                    alt={landingHeroImage.description}
                    width={600}
                    height={400}
                    className="rounded-xl shadow-2xl object-cover"
                    data-ai-hint={landingHeroImage.imageHint}
                />
              </div>
            )}
          </section>

          {/* Features Section */}
          <section className="space-y-12">
            <div className="text-center">
              <h3 className="text-3xl font-bold font-headline">
                Everything You Need for Better Health
              </h3>
              <p className="text-muted-foreground mt-2">
                Explore the powerful features of Medico.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="bg-card shadow-sm rounded-xl">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </main>

        <footer className="text-center py-8 border-t">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Medico. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
