import { useState, useCallback } from 'react';
import { pipeline } from '@huggingface/transformers';

// Emotion categories supported by the model
export type EmotionType = 'happy' | 'sad' | 'angry' | 'anxious' | 'calm' | 'neutral';

export interface EmotionAnalysisResult {
  emotion: EmotionType;
  confidence: number;
  intent: string;
  summary: string;
  recommended_genres: string[];
}

// Map model labels to our emotion types
const normalizeEmotion = (label: string): EmotionType => {
  const lower = label.toLowerCase();
  if (lower.includes('joy') || lower.includes('happy') || lower.includes('positive')) return 'happy';
  if (lower.includes('sad') || lower.includes('sadness')) return 'sad';
  if (lower.includes('anger') || lower.includes('angry')) return 'angry';
  if (lower.includes('fear') || lower.includes('anxious') || lower.includes('anxiety')) return 'anxious';
  if (lower.includes('calm') || lower.includes('peace') || lower.includes('neutral')) return 'calm';
  return 'neutral';
};

// Map emotions to therapeutic intents
const mapEmotionToIntent = (emotion: EmotionType): string => {
  const intentMap: Record<EmotionType, string> = {
    happy: 'celebrate_success',
    sad: 'process_grief',
    angry: 'manage_anger',
    anxious: 'reduce_anxiety',
    calm: 'maintain_peace',
    neutral: 'general_reflection'
  };
  return intentMap[emotion];
};

// Get recommended movie genres based on emotion
const getRecommendedGenres = (emotion: EmotionType): string[] => {
  const genreMap: Record<EmotionType, string[]> = {
    happy: ['Comedy', 'Romance', 'Musical'],
    sad: ['Drama', 'Documentary', 'Romance'],
    angry: ['Action', 'Thriller', 'Sports'],
    anxious: ['Comedy', 'Animation', 'Family'],
    calm: ['Documentary', 'Drama', 'Romance'],
    neutral: ['Comedy', 'Drama', 'Action']
  };
  return genreMap[emotion];
};

// Generate empathetic summary
const generateSummary = (emotion: EmotionType, confidence: number): string => {
  const summaries: Record<EmotionType, string> = {
    happy: `You seem to be in a positive and joyful mood! It's wonderful to see you feeling good. Consider celebrating this moment with uplifting content.`,
    sad: `You appear to be experiencing sadness. It's okay to feel this way. Processing these emotions through reflection and supportive content can help.`,
    angry: `You seem to be feeling frustrated or angry. These emotions are valid. Channel this energy constructively through activities that help you release tension.`,
    anxious: `You appear to be experiencing anxiety or worry. Remember to breathe deeply. Calming content and relaxation techniques can help soothe your mind.`,
    calm: `You seem to be in a peaceful and balanced state. Maintain this tranquility with content that supports your inner peace.`,
    neutral: `Your emotional state appears balanced. This is a good time for general reflection and exploring diverse content.`
  };
  return summaries[emotion];
};

let classifierPromise: Promise<any> | null = null;

export const useEmotionAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const analyzeEmotion = useCallback(async (content: string): Promise<EmotionAnalysisResult> => {
    setIsAnalyzing(true);
    setIsModelLoading(true);

    try {
      // Initialize the sentiment analysis pipeline (cached after first load)
      if (!classifierPromise) {
        console.log('Loading emotion analysis model...');
        classifierPromise = pipeline(
          'text-classification',
          'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
          { device: 'wasm' }
        );
      }

      const classifier = await classifierPromise;
      setIsModelLoading(false);

      console.log('Analyzing emotion for content:', content.substring(0, 100));
      
      // Run sentiment analysis
      const result = await classifier(content, { topk: null });
      
      console.log('Raw model output:', result);

      // Find the highest confidence prediction
      const topPrediction = Array.isArray(result) && result.length > 0 
        ? result[0] 
        : result;

      const rawEmotion = topPrediction.label || 'neutral';
      const confidence = topPrediction.score || 0.5;

      // Normalize to our emotion types
      const emotion = normalizeEmotion(rawEmotion);
      const intent = mapEmotionToIntent(emotion);
      const summary = generateSummary(emotion, confidence);
      const recommended_genres = getRecommendedGenres(emotion);

      const analysisResult: EmotionAnalysisResult = {
        emotion,
        confidence,
        intent,
        summary,
        recommended_genres
      };

      console.log('Final analysis result:', analysisResult);

      return analysisResult;
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      // Return neutral emotion on error
      return {
        emotion: 'neutral',
        confidence: 0.5,
        intent: 'general_reflection',
        summary: 'Unable to analyze emotion at this time. Your feelings are valid regardless.',
        recommended_genres: ['Comedy', 'Drama', 'Action']
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    analyzeEmotion,
    isAnalyzing,
    isModelLoading
  };
};
