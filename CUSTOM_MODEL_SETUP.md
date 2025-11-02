# Custom ML Model Integration for EMOSENSE

## Overview
The `analyze-emotion-custom` edge function is configured to use your custom ML model for emotion analysis instead of the Lovable AI Gateway.

## Setup Instructions

### Option 1: HuggingFace Inference API
If your model is hosted on HuggingFace:

1. **Add secrets** to your Lovable Cloud environment:
   - `CUSTOM_MODEL_ENDPOINT`: Your HuggingFace model URL
     - Example: `https://api-inference.huggingface.co/models/your-username/your-emotion-model`
   - `CUSTOM_MODEL_API_KEY`: Your HuggingFace API token (optional but recommended)

2. **Model Output Format**:
   Your model should return one of these formats:
   
   ```json
   // Format 1: Classification array (HuggingFace standard)
   [
     { "label": "happy", "score": 0.95 },
     { "label": "sad", "score": 0.03 }
   ]
   
   // Format 2: Structured object
   {
     "emotion": "happy",
     "confidence": 0.95,
     "intent": "celebrate_success",
     "summary": "User is expressing joy",
     "recommended_genres": ["Comedy", "Romance"]
   }
   ```

### Option 2: Custom Deployed Model
If you have a custom API endpoint:

1. **Deploy your model** with an HTTP API endpoint that accepts:
   ```json
   {
     "inputs": "your text content here",
     "parameters": {}
   }
   ```

2. **Add secrets**:
   - `CUSTOM_MODEL_ENDPOINT`: Your API URL (e.g., `https://your-api.com/predict`)
   - `CUSTOM_MODEL_API_KEY`: Your API authentication key (if required)

3. **Ensure your endpoint returns** emotion predictions in a supported format (see above)

### Option 3: Local Development
For local testing:

1. Run your model server locally (e.g., on port 8000)
2. Set environment variable:
   ```bash
   CUSTOM_MODEL_ENDPOINT=http://localhost:8000/predict
   ```

## Supported Emotions

The system recognizes these base emotions:
- `happy` / `happiness` / `joy`
- `sad` / `sadness`
- `angry` / `anger`
- `anxious` / `anxiety` / `fear`
- `calm` / `peace`
- `neutral`

Your model should output one of these labels (case-insensitive).

## Intent Mapping

The system automatically maps emotions to therapeutic intents:
- `happy` → `celebrate_success`
- `sad` → `process_grief`
- `angry` → `manage_anger`
- `anxious` → `reduce_anxiety`
- `calm` → `maintain_peace`
- `neutral` → `general_reflection`

## Testing Your Model

1. Create a journal entry in EMOSENSE
2. Click "Analyze Emotion"
3. Check the browser console and edge function logs for model responses
4. Verify the emotion badge displays correctly

## Recommended Model Architectures

For multilingual emotion classification (English + Indian languages):

1. **IndicBERT** - Pre-trained on Indian languages
2. **XLM-RoBERTa** - Multilingual BERT variant
3. **mBERT** - Multilingual BERT
4. **Custom fine-tuned models** on emotion datasets

## Example Model Training

If you're building a custom model, consider:

1. **Datasets**:
   - GoEmotions (English, 27 emotions)
   - EmoContext (Contextual emotions)
   - Indian language emotion datasets

2. **Fine-tuning approach**:
   ```python
   from transformers import AutoModelForSequenceClassification
   
   model = AutoModelForSequenceClassification.from_pretrained(
       "ai4bharat/indic-bert",
       num_labels=6  # happy, sad, angry, anxious, calm, neutral
   )
   # Train on your emotion dataset
   ```

3. **Deploy to HuggingFace**:
   ```bash
   huggingface-cli login
   huggingface-cli repo create emotion-classifier-multilingual
   # Push your model
   ```

## Troubleshooting

### Model not responding
- Check `CUSTOM_MODEL_ENDPOINT` is correctly set
- Verify your model API is accessible
- Check edge function logs for detailed errors

### Wrong emotion detected
- Ensure your model outputs recognized emotion labels
- Check the `normalizeEmotion()` function in the edge function
- Add custom mappings if needed

### Authentication errors
- Verify `CUSTOM_MODEL_API_KEY` is set correctly
- Check your model API's authentication requirements

## Fallback Behavior

If the custom model fails:
- The system returns a neutral emotion with low confidence
- Users can still save their journal entries
- Error details are logged for debugging

## Next Steps

1. Configure your model endpoint secrets
2. Test with sample journal entries
3. Monitor edge function logs for performance
4. Adjust emotion/intent mappings as needed
5. Consider A/B testing with the original AI Gateway model

## Support

For issues with:
- **Model integration**: Check edge function logs in Lovable Cloud
- **Model training**: Refer to HuggingFace documentation
- **API deployment**: Consult your hosting provider's docs
