import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, LogOut } from "lucide-react";

interface NavbarProps {
  user?: any;
}

const Navbar = ({ user }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <Brain className="h-7 w-7 text-primary group-hover:scale-110 transition-bounce" />
          <span 
            className="text-xl font-bold"
            style={{
              background: 'linear-gradient(135deg, hsl(262 52% 47%) 0%, hsl(210 60% 60%) 50%, hsl(340 75% 65%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            EmoSense
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="hover-lift rounded-xl">Dashboard</Button>
              </Link>
              <Link to="/entry/new">
                <Button variant="default" className="bg-gradient-hero hover:shadow-glow text-white rounded-xl">New Entry</Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="hover-lift rounded-xl">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" className="bg-gradient-hero hover:shadow-glow text-white rounded-xl">Get Started</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
