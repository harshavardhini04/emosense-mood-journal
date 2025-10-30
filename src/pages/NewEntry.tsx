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
  const [entryLanguage, setEntryLanguage] = useState("english");
  const [movieLanguage, setMovieLanguage] = useState("english");
  const [selectedGenre, setSelectedGenre] = useState("");

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
      
      // For happy emotion, ask for genre first
      if (data.emotion.toLowerCase() === 'happy') {
        setRecommendations(null);
        setSelectedGenre("");
      } else {
        // Get recommendations for other emotions
        const { data: recs, error: recError } = await supabase.functions.invoke(
          "get-recommendations",
          { body: { emotion: data.emotion, language: movieLanguage } }
        );

        if (recError) throw recError;
        setRecommendations(recs);
      }

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
        language: entryLanguage,
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
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Entry Language</label>
              <select
                value={entryLanguage}
                onChange={(e) => setEntryLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="english">English</option>
                <option value="tamil">தமிழ் (Tamil)</option>
                <option value="hindi">हिन्दी (Hindi)</option>
                <option value="malayalam">മലയാളം (Malayalam)</option>
                <option value="telugu">తెలుగు (Telugu)</option>
              </select>
            </div>
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

            {emotion?.emotion.toLowerCase() === 'happy' && !recommendations && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Choose Your Movie Genre</CardTitle>
                  <CardDescription>
                    Since you're feeling great, what type of movie would you like to watch?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block">Select Genre</label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Choose a genre...</option>
                      <option value="action">Action</option>
                      <option value="comedy">Comedy</option>
                      <option value="romance">Romance</option>
                      <option value="thriller">Thriller</option>
                      <option value="drama">Drama</option>
                    </select>
                  </div>
                  <Button
                    onClick={async () => {
                      if (!selectedGenre) {
                        toast({
                          title: "Select a genre",
                          description: "Please choose a movie genre first",
                          variant: "destructive"
                        });
                        return;
                      }
                      const { data: recs, error: recError } = await supabase.functions.invoke(
                        "get-recommendations",
                        { body: { emotion: emotion.emotion, language: movieLanguage, genre: selectedGenre } }
                      );
                      if (recError) {
                        toast({
                          title: "Error",
                          description: recError.message,
                          variant: "destructive"
                        });
                        return;
                      }
                      setRecommendations(recs);
                    }}
                    disabled={!selectedGenre}
                    className="w-full"
                  >
                    Get Recommendations
                  </Button>
                </CardContent>
              </Card>
            )}

            {recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations for You</CardTitle>
                  <CardDescription>
                    {emotion?.emotion.toLowerCase() === 'happy' 
                      ? `${selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1)} movies to enjoy`
                      : "Based on your current emotional state"}
                  </CardDescription>
                  <div className="mt-4">
                    <label className="text-sm font-medium mb-2 block">Movie Language</label>
                    <select
                      value={movieLanguage}
                      onChange={(e) => {
                        setMovieLanguage(e.target.value);
                        // Re-fetch recommendations with new language
                        if (emotion) {
                          const body = emotion.emotion.toLowerCase() === 'happy' && selectedGenre
                            ? { emotion: emotion.emotion, language: e.target.value, genre: selectedGenre }
                            : { emotion: emotion.emotion, language: e.target.value };
                          
                          supabase.functions.invoke("get-recommendations", { body }).then(({ data }) => {
                            if (data) setRecommendations(data);
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="english">English</option>
                      <option value="tamil">தமிழ் (Tamil)</option>
                      <option value="hindi">हिन्दी (Hindi)</option>
                      <option value="malayalam">മലയാളം (Malayalam)</option>
                      <option value="telugu">తెలుగు (Telugu)</option>
                    </select>
                  </div>
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
