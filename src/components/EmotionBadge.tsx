import { Smile, Frown, AlertCircle, Heart, Flame, Meh } from "lucide-react";

interface EmotionBadgeProps {
  emotion: string;
  score?: number;
  size?: "sm" | "md" | "lg";
}

const emotionConfig = {
  happy: { icon: Smile, color: "emotion-happy", label: "Happy" },
  sad: { icon: Frown, color: "emotion-sad", label: "Sad" },
  anxious: { icon: AlertCircle, color: "emotion-anxious", label: "Anxious" },
  calm: { icon: Heart, color: "emotion-calm", label: "Calm" },
  angry: { icon: Flame, color: "emotion-angry", label: "Angry" },
  neutral: { icon: Meh, color: "emotion-neutral", label: "Neutral" },
};

const EmotionBadge = ({ emotion, score, size = "md" }: EmotionBadgeProps) => {
  const config = emotionConfig[emotion.toLowerCase() as keyof typeof emotionConfig] || emotionConfig.neutral;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: `hsl(var(--${config.color}) / 0.15)`,
        color: `hsl(var(--${config.color}))`,
        border: `1px solid hsl(var(--${config.color}) / 0.3)`,
      }}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="opacity-70">({Math.round(score * 100)}%)</span>
      )}
    </div>
  );
};

export default EmotionBadge;
