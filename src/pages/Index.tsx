import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Heart } from "lucide-react";

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-black/80 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-primary/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-20 w-[350px] h-[350px] bg-accent/30 rounded-full blur-[100px]" />
      </div>

      {/* Main container */}
      <div className="relative min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-6xl bg-card/40 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/10">
          
          {/* Navigation */}
          <nav className="flex justify-center gap-4 mb-16">
            <Button 
              variant="ghost" 
              className="text-foreground/80 hover:text-foreground hover:bg-white/10"
              onClick={() => navigate("/")}
            >
              Home
            </Button>
            <Button 
              variant="ghost" 
              className="text-foreground/80 hover:text-foreground hover:bg-white/10"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              className="text-foreground/80 hover:text-foreground hover:bg-white/10"
              onClick={() => navigate("/entry/new")}
            >
              Journal
            </Button>
            <Button 
              className="bg-primary/80 hover:bg-primary text-primary-foreground backdrop-blur-sm"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
          </nav>

          {/* Hero content */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-8 leading-tight">
              A Quiet Space for Your{" "}
              <span className="text-primary">Loudest Thoughts</span>
            </h1>
            
            <p className="text-lg md:text-xl text-foreground/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              In the hustle and bustle of daily life, your loudest thoughts can easily get drowned out even by you.
            </p>

            {/* Feature cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-20">
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                <div className="bg-primary/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">AI Analysis</h3>
                <p className="text-sm text-foreground/70">
                  Understand your emotional patterns with advanced AI
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                <div className="bg-secondary/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Heart className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Personal Care</h3>
                <p className="text-sm text-foreground/70">
                  Get recommendations tailored to your emotions
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                <div className="bg-accent/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Track Progress</h3>
                <p className="text-sm text-foreground/70">
                  Visualize your emotional journey over time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
