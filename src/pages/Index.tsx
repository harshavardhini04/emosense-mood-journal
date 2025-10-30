import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Sparkles, TrendingUp, Heart } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

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
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />

        <div className="container relative mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            Your Emotions, <br />
            Understood & Guided
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            EmoSense uses AI to understand how you feel and provides personalized
            recommendations to nurture your emotional wellbeing
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-6 shadow-emotion"
            onClick={() => navigate("/auth")}
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How EmoSense Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl shadow-soft">
              <div className="bg-gradient-hero w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI-Powered Analysis</h3>
              <p className="text-muted-foreground">
                Our advanced AI detects emotions in your journal entries, helping you
                understand your emotional patterns
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-soft">
              <div className="bg-gradient-hero w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Personalized Care</h3>
              <p className="text-muted-foreground">
                Get movie, music, and activity recommendations tailored to your current
                emotional state
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-soft">
              <div className="bg-gradient-hero w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Track Progress</h3>
              <p className="text-muted-foreground">
                Visualize your emotional journey over time with beautiful mood
                analytics and trends
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">
            Ready to understand yourself better?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands using EmoSense for emotional wellness
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-6"
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
