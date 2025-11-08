# Auto Training UI Guide

## Where to Find It

Navigate to **Models Page**: `http://localhost:3000/models`

You'll see three main sections:

1. **AI Model Gallery** - Select predefined models
2. **🤖 Auto Training** ← Your new tool!
3. **🌐 Web Learning Tool** - Manual web learning

---

## How to Use Auto Training

### Step 1: Click "Start Auto Training →"

You'll see the Auto Training interface with these fields:

### Step 2: Enter Your Topic

```
📚 What topic do you want to train on?
[____________________]
Example: "haircut line detection"
```

**Tips:**

- Be descriptive: "haircut line detection" is better than just "haircut"
- Include what you want to detect: "parking space detection", "road lane detection"
- The system will search the web for this exact topic

### Step 3: Configure Training Parameters

**Model Type** (🧠)

- UNet (default) - Good general-purpose segmentation
- RNU - Recurrent Neural Network, good for sequences

**Detection Type** (🎯)

- line_detection (default)
- haircut
- parking
- custom (for custom types)

**Synthetic Images** (🎨)
Use the slider to select (10-500):

- 20-50: Quick testing
- 50-100: Good for most tasks
- 100-500: High-quality models (slower)

**Epochs** (⏱️)
Use the slider to select (5-100):

- 5-10: Quick training
- 10-20: Recommended for balance
- 30-100: Better accuracy (takes longer)

### Step 4: Click "🚀 Start Auto Training"

The system will:

```
🔍 Searching web for content...
  ↓
📚 Learning from websites...
  ↓
🎨 Generating 50 synthetic images...
  ↓
🤖 Training your model...
  ↓
✓ Training complete!
```

This takes **2-5 minutes** depending on settings.

---

## Real-Time Progress

You'll see the current step while training:

```
🔄 🔍 Searching web for content...
This may take 2-5 minutes...
```

---

## Results Page

After training completes, you'll see:

### Summary

```
✓ Training Complete!

Topic: haircut line detection
Duration: 145.2 seconds
```

### Steps Breakdown

```
✓ Learning from Web
  Processed 5 URLs

✓ Generating Training Data
  Generated 50 synthetic images

✓ Training Model
  Saved: model_UNET_HAIRCUT.pth
```

### Next Steps

```
Next Steps:
✓ Your model has been trained and saved
✓ Go to "Mask Creator" to test predictions
✓ Upload an image to see your model in action!
```

---

## Examples

### Example 1: Basic Training

**Input:**

```
Topic: "haircut detection"
Model: UNet
Detection Type: haircut
Synthetic Images: 50
Epochs: 10
```

**What happens:**

- Searches for "haircut detection" online
- Learns key concepts (haircut, lines, boundaries, etc.)
- Generates 50 synthetic images with haircut-like patterns
- Trains model for 10 epochs
- Saves as `model_UNET_HAIRCUT.pth`

### Example 2: Advanced Training

**Input:**

```
Topic: "parking space detection and segmentation"
Model: UNet
Detection Type: parking
Synthetic Images: 200
Epochs: 20
```

**What happens:**

- Deep web search for parking concepts
- Learns about parking lot structure
- Generates 200 high-quality synthetic images
- Trains with 20 epochs for better accuracy
- Saves as `model_UNET_PARKING.pth`

---

## Tips for Best Results

### 1. **Be Specific with Topics**

❌ Bad: "detection"
✅ Good: "parking space line detection"

### 2. **Match Detection Type to Topic**

```
Topic: "haircut line detection"   →  Type: haircut
Topic: "parking area detection"   →  Type: parking
Topic: "object recognition"       →  Type: custom
```

### 3. **Adjust for Your Needs**

- Quick test? 20 images, 5 epochs
- Production? 100-200 images, 15-30 epochs

### 4. **Use Descriptive Types**

The system will create folders based on your detection type:

- `images_UNET_HAIRCUT/`
- `masks_UNET_HAIRCUT/`
- `model_UNET_HAIRCUT.pth`

---

## Troubleshooting

### Issue: Training starts but seems stuck

**Solution:** This is normal! Auto-training takes 2-5 minutes:

1. Scraping (30-60 seconds)
2. Learning (10-20 seconds)
3. Generating data (5-15 seconds)
4. Training (60-180 seconds)

Just wait for completion.

### Issue: "Please enter a topic"

**Solution:** Make sure you entered a topic in the text field before clicking start.

### Issue: API connection error

**Solution:** Make sure backend is running:

```bash
python3 -m uvicorn server:app --reload --port 8000
```

### Issue: Backend returns error during learning

**Solution:** The web might be unavailable for that topic. Try:

- Different topic name
- More specific topic
- Check internet connection

---

## After Training

Once your model is trained:

### 1. Test It

- Go to **Mask Creator**
- Select your detection type
- Upload an image
- See your model predictions!

### 2. Improve It

- Create more training data
- Retrain with more epochs
- Auto-train again with a different topic

### 3. Use It

- Integrate into your application
- Make predictions via API
- Share with team

---

## Integration with Other Tools

### After Auto-Training, You Can:

**Use Web Learning Tool** to:

- Learn more about the topic
- Extract additional concepts
- Add to knowledge base

**Use Mask Creator** to:

- Create more training data
- Manually refine predictions
- Improve model with corrections

**Use Model Gallery** to:

- Select different base models
- Train multiple models
- Compare models

---

## Technical Details

### What Auto-Training Does

1. **Search Phase**

   - Generates search URLs for topic
   - Searches Wikipedia, courses, tutorials

2. **Learning Phase**

   - Scrapes content from URLs
   - Extracts entities, keywords, definitions
   - Saves to knowledge base

3. **Generation Phase**

   - Uses learned concepts
   - Creates synthetic images with shapes/patterns
   - Creates corresponding masks
   - Saves to training folders

4. **Training Phase**
   - Runs standard training script
   - Uses generated images and masks
   - Trains for specified epochs
   - Saves model file

---

## Settings Reference

| Parameter        | Min | Max | Default | Notes                    |
| ---------------- | --- | --- | ------- | ------------------------ |
| Synthetic Images | 10  | 500 | 50      | More = better but slower |
| Epochs           | 5   | 100 | 10      | More = better accuracy   |

---

## Next Steps

1. ✅ Go to `/models` page
2. ✅ Click "Start Auto Training →"
3. ✅ Enter a topic (e.g., "haircut detection")
4. ✅ Click "🚀 Start Auto Training"
5. ✅ Wait for completion (2-5 min)
6. ✅ View results
7. ✅ Test in Mask Creator!

---

**Happy automated training!** 🚀
