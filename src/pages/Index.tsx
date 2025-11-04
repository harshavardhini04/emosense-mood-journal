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
      <section className="relative pt-32 pb-32 overflow-hidden">
        {/* Background image with overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background/80" />

        <div className="container relative mx-auto px-4 text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 text-primary animate-fade-in leading-tight">
            Your Emotions, <br />
            Understood & Guided
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-3xl mx-auto animate-fade-in leading-relaxed">
            Transform your emotions into insights with intelligent wellness guidance
          </p>
          <Button
            size="lg"
            className="text-lg px-10 py-7 bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-vibrant hover:shadow-emotion hover:scale-105 animate-fade-in"
            onClick={() => navigate("/auth")}
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-background/50" />
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-primary">
            How EmoSense Works
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Discover how our intelligent platform helps you understand and improve your emotional wellbeing
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-card/50 backdrop-blur-sm p-8 rounded-3xl shadow-soft hover:shadow-vibrant transition-all duration-300 border border-primary/10 hover:border-primary/30 hover:-translate-y-2">
              <div className="bg-primary w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-emotion">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">Smart Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our advanced technology detects emotions in your journal entries, helping you
                understand your emotional patterns with precision and care
              </p>
            </div>

            <div className="group bg-card/50 backdrop-blur-sm p-8 rounded-3xl shadow-soft hover:shadow-vibrant transition-all duration-300 border border-secondary/10 hover:border-secondary/30 hover:-translate-y-2">
              <div className="bg-secondary w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-emotion">
                <Heart className="h-7 w-7 text-secondary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-secondary">Personalized Care</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get movie, music, and activity recommendations tailored to your current
                emotional state for optimal wellbeing
              </p>
            </div>

            <div className="group bg-card/50 backdrop-blur-sm p-8 rounded-3xl shadow-soft hover:shadow-vibrant transition-all duration-300 border border-accent/10 hover:border-accent/30 hover:-translate-y-2">
              <div className="bg-accent w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-emotion">
                <TrendingUp className="h-7 w-7 text-accent-foreground" />
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
      <section className="relative py-32 overflow-hidden bg-primary">
        <div className="absolute top-10 left-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in">
            Ready to understand yourself better?
          </h2>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 max-w-3xl mx-auto animate-fade-in leading-relaxed">
            Join thousands using EmoSense for emotional wellness and start your journey to better mental health today
          </p>
          <Button
            size="lg"
            className="text-lg px-12 py-7 bg-white text-primary hover:bg-white/90 shadow-vibrant hover:scale-105 transition-all font-semibold animate-fade-in"
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
