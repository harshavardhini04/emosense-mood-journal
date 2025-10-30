import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import EmotionBadge from "@/components/EmotionBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

const NewEntry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [content, setContent] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emotion, setEmotion] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  const analyzeEmotion = async () => {
    if (!content.trim()) {
      toast({
        title: "Empty entry",
        description: "Please write something first",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-emotion", {
        body: { content },
      });

      if (error) throw error;

      setEmotion(data);
      
      // Get recommendations
      const { data: recs, error: recError } = await supabase.functions.invoke(
        "get-recommendations",
        { body: { emotion: data.emotion } }
      );

      if (recError) throw recError;
      setRecommendations(recs);

      toast({
        title: "Analysis complete!",
        description: data.summary,
      });
    } catch (error: any) {
      toast({
        title: "Error analyzing emotion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const saveEntry = async () => {
    if (!emotion || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        content,
        emotion: emotion.emotion,
        emotion_score: emotion.score,
      });

      if (error) throw error;

      toast({
        title: "Entry saved!",
        description: "Your journal entry has been saved successfully.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error saving entry",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">New Journal Entry</h1>
        <p className="text-muted-foreground mb-8">
          Express your thoughts and feelings freely
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How are you feeling today?</CardTitle>
            <CardDescription>
              Write about your day, thoughts, or anything on your mind
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Dear journal, today I..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] text-base"
            />

            <div className="flex gap-4 mt-4">
              <Button
                onClick={analyzeEmotion}
                disabled={analyzing || !content.trim()}
                className="flex-1"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Emotion
                  </>
                )}
              </Button>

              {emotion && (
                <Button
                  onClick={saveEntry}
                  disabled={saving}
                  variant="secondary"
                  className="flex-1"
                >
                  {saving ? "Saving..." : "Save Entry"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {emotion && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Detected Emotion</CardTitle>
                <CardDescription>{emotion.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <EmotionBadge
                  emotion={emotion.emotion}
                  score={emotion.score}
                  size="lg"
                />
              </CardContent>
            </Card>

            {recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations for You</CardTitle>
                  <CardDescription>
                    Based on your current emotional state
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Movies to Watch</h3>
                    <div className="flex flex-wrap gap-2">
                      {recommendations.movies.map((movie: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-muted rounded-lg text-sm"
                        >
                          {movie}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Activities to Try</h3>
                    <div className="flex flex-wrap gap-2">
                      {recommendations.activities.map((activity: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-muted rounded-lg text-sm"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewEntry;
