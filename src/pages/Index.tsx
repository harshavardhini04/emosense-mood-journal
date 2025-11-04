import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Sparkles, TrendingUp, Heart } from "lucide-react";
import heroBg from "@/assets/hero-bg-gradient.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        {/* Background image with overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/75 to-background/90 backdrop-blur-sm" />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="container relative mx-auto px-4 text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 text-primary animate-slide-up leading-tight">
            Your Emotions, <br />
            Understood & Guided
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-3xl mx-auto animate-slide-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
            Transform your emotions into insights with intelligent wellness guidance
          </p>
          <Button
            size="lg"
            className="text-lg px-12 py-8 bg-gradient-hero hover:shadow-glow text-white transition-smooth hover:scale-105 animate-slide-up rounded-2xl font-semibold"
            style={{ animationDelay: '0.4s' }}
            onClick={() => navigate("/auth")}
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        
        <div className="container relative mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-6 text-white">
            How EmoSense Works
          </h2>
          <p className="text-center text-muted-foreground mb-20 max-w-2xl mx-auto text-lg">
            Discover how our intelligent platform helps you understand and improve your emotional wellbeing
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="group glass-card p-10 hover:shadow-vibrant transition-smooth hover:-translate-y-2 animate-slide-up">
              <div className="bg-gradient-hero w-16 h-16 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-bounce shadow-emotion">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">Smart Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our advanced technology detects emotions in your journal entries, helping you
                understand your emotional patterns with precision and care
              </p>
            </div>

            <div className="group glass-card p-10 hover:shadow-vibrant transition-smooth hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-calm w-16 h-16 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-bounce shadow-emotion">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-secondary">Personalized Care</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get movie, music, and activity recommendations tailored to your current
                emotional state for optimal wellbeing
              </p>
            </div>

            <div className="group glass-card p-10 hover:shadow-vibrant transition-smooth hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="bg-gradient-energetic w-16 h-16 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-bounce shadow-emotion">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-accent">Track Progress</h3>
              <p className="text-muted-foreground leading-relaxed">
                Visualize your emotional journey over time with beautiful mood
                analytics, trends, and insightful metrics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-40 overflow-hidden bg-gradient-hero">
        <div className="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 animate-slide-up">
            Ready to understand yourself better?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-14 max-w-3xl mx-auto animate-slide-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
            Join thousands using EmoSense for emotional wellness and start your journey to better mental health today
          </p>
          <Button
            size="lg"
            className="text-lg px-14 py-8 bg-white text-primary hover:bg-white/95 shadow-vibrant hover:scale-105 transition-smooth font-semibold rounded-2xl animate-slide-up"
            style={{ animationDelay: '0.4s' }}
            onClick={() => navigate("/auth")}
          >
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
