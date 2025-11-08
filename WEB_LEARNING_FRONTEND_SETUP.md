# Web Learning Tool - Frontend Setup

## Overview

The Web Learning Tool UI has been added to your Next.js app at the **Models** page (`/models`).

## Features

The UI includes 8 different tools:

1. **🌐 Scrape URL** - Scrape websites and extract content
2. **⚡ Analyze** - Comprehensive NLP analysis of text
3. **✨ Learning** - Extract structured learning data (definitions, facts, questions)
4. **🏷️ Entities** - Extract named entities (people, places, organizations)
5. **🔑 Keywords** - Extract important keywords from text
6. **📝 Summarize** - Generate summaries of long texts
7. **😊 Sentiment** - Analyze sentiment (positive/negative/neutral)
8. **⚖️ Compare** - Compare two texts for similarity

## Configuration

### Step 1: Set Environment Variable

Create or update `.env.local` in your frontend root directory:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, update to your backend URL:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Step 2: Start Backend Server

Make sure your Python backend is running:

```bash
cd allianceai-backend
python3 -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Step 3: Start Frontend

```bash
npm run dev
# or
yarn dev
```

### Step 4: Access the Tool

1. Navigate to `http://localhost:3000/models`
2. Click the "Try Web Learning Tool →" button
3. Start using the different tools!

## Usage Examples

### Example 1: Scrape a Website

1. Click the **Scrape URL** tab
2. Enter: `https://www.wikipedia.org`
3. Click "Scrape"
4. See extracted title, headings, paragraphs, and links

### Example 2: Extract Learning Data

1. Click the **Learning** tab
2. Paste educational content
3. Click "Extract Learning"
4. See definitions, facts, questions, and key terms extracted

### Example 3: Compare Texts

1. Click the **Compare** tab
2. Enter two texts to compare
3. Click "Compare"
4. See similarity score and common/unique entities

## Troubleshooting

### Issue: "Cannot reach API"

**Solution:** Make sure backend is running on port 8000:

```bash
python3 -m uvicorn server:app --reload --port 8000
```

### Issue: Module not found errors

**Solution:** Install backend dependencies:

```bash
cd allianceai-backend
pip install beautifulsoup4 spacy requests
python -m spacy download en_core_web_sm
```

### Issue: CORS errors

**Solution:** The backend already has CORS enabled, but check if the API URL in `.env.local` is correct.

## Component Structure

```
app/
├── models/page.tsx          # Models page with Web Learning toggle
├── components/
│   └── WebLearningTool.tsx  # Main web learning component
```

## Key Features of the Component

- **Real-time feedback** with loading states
- **Copy to clipboard** for JSON results
- **Dark mode support** for all UI elements
- **Responsive design** for mobile and desktop
- **Error handling** with clear error messages
- **Automatic API communication** with backend

## API Integration

The component communicates with these backend endpoints:

- `POST /web/scrape` - Scrape URLs
- `POST /web/analyze` - Analyze text
- `POST /web/extract-learning` - Extract learning data
- `POST /web/entities` - Extract entities
- `POST /web/keywords` - Extract keywords
- `POST /web/summarize` - Summarize text
- `POST /web/sentiment` - Analyze sentiment
- `POST /web/compare` - Compare texts

For detailed API documentation, see `../allianceai-backend/WEB_LEARNING.md`

## Customization

### Modify Tab Appearance

Edit `WebLearningTool.tsx` line ~220:

```typescript
const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  // Add or modify tabs here
];
```

### Change Colors

The component uses Tailwind classes. Update:

- `bg-blue-600` for primary button color
- `text-zinc-900` for text color
- `dark:` prefixed classes for dark mode

### Add New Features

1. Create new API endpoint in backend
2. Add new tab to the `tabs` array
3. Create handler function (e.g., `handleNewFeature`)
4. Add UI section for the new feature

## Performance Notes

- Scraping: 2-5 seconds per URL
- NLP Processing: 100ms - 2s depending on text size
- Results are cached in state (not persistent between page loads)

## Next Steps

1. ✅ Start the backend server
2. ✅ Set `NEXT_PUBLIC_API_URL` in `.env.local`
3. ✅ Visit `/models` page
4. ✅ Click "Try Web Learning Tool"
5. ✅ Start testing!

## Support

For issues with:

- **Backend/API**: See `../allianceai-backend/WEB_LEARNING.md`
- **Installation**: See `../allianceai-backend/WEB_LEARNING_QUICKSTART.md`
- **Integration**: See `../allianceai-backend/WEB_INTEGRATION_GUIDE.md`

---

Happy learning! 🚀
