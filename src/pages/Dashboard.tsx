import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import EmotionBadge from "@/components/EmotionBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenSquare, TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchEntries(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchEntries = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const emotionCounts = entries.reduce((acc: any, entry) => {
    acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
    return acc;
  }, {});

  const emotionColors = {
    happy: "hsl(var(--emotion-happy))",
    sad: "hsl(var(--emotion-sad))",
    anxious: "hsl(var(--emotion-anxious))",
    calm: "hsl(var(--emotion-calm))",
    angry: "hsl(var(--emotion-angry))",
    neutral: "hsl(var(--emotion-neutral))",
  };

  const chartData = entries.slice(0, 7).reverse().map((entry) => ({
    emotion: entry.emotion.charAt(0).toUpperCase() + entry.emotion.slice(1),
    score: entry.emotion_score ? Math.round(entry.emotion_score * 100) : 50,
    fill: emotionColors[entry.emotion.toLowerCase() as keyof typeof emotionColors] || emotionColors.neutral,
    date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const chartConfig = {
    score: {
      label: "Emotion Intensity",
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
            <p className="text-muted-foreground">
              How are you feeling today?
            </p>
          </div>
          <Button size="lg" onClick={() => navigate("/entry/new")}>
            <PenSquare className="mr-2 h-5 w-5" />
            New Entry
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Total Entries</CardTitle>
              <CardDescription>Your journaling streak</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-primary">
                {entries.length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Most Common Emotion</CardTitle>
              <CardDescription>This week</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(emotionCounts).length > 0 ? (
                <EmotionBadge
                  emotion={
                    Object.entries(emotionCounts).sort((a: any, b: any) => b[1] - a[1])[0][0]
                  }
                  size="lg"
                />
              ) : (
                <p className="text-muted-foreground">No entries yet</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Emotional Wellness</CardTitle>
              <CardDescription>Trending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-emotion-calm" />
                <p className="text-2xl font-bold">Improving</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mood Chart */}
        {chartData.length > 0 && (
          <Card className="mb-8 bg-white border shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Emotional Trends</CardTitle>
              <CardDescription className="text-base">Your mood patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="emotion" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                      label={{ value: 'Emotion Intensity (%)', angle: -90, position: 'insideLeft', style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 } }}
                      domain={[0, 100]}
                    />
                    <ChartTooltip 
                      content={
                        <ChartTooltipContent 
                          formatter={(value: any, name: any, props: any) => (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-foreground">
                                {props.payload.emotion}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {props.payload.date}
                              </span>
                              <span className="text-base font-bold" style={{ color: props.payload.fill }}>
                                {value}%
                              </span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      strokeWidth={3}
                      stroke="hsl(var(--primary))"
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={6}
                            fill={payload.fill}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                            className="animate-pulse"
                          />
                        );
                      }}
                      activeDot={{ r: 8, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent Entries */}
        <Card className="bg-white border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Recent Entries</CardTitle>
            <CardDescription className="text-base">Your latest journal entries</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : entries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No entries yet. Start your journey!
                </p>
                <Button onClick={() => navigate("/entry/new")}>
                  Write Your First Entry
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-5 border-2 border-border rounded-xl hover:bg-muted/50 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <EmotionBadge
                        emotion={entry.emotion}
                        score={entry.emotion_score}
                      />
                      <span className="text-sm font-medium text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-2">{entry.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
