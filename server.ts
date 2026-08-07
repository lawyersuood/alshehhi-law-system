import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// JSON Schema for AppSpec generation
const appSpecSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Catchy, memorable application title (1-3 words)' },
    tagline: { type: Type.STRING, description: 'Single line elevator pitch tagline' },
    description: { type: Type.STRING, description: 'Comprehensive 2-3 sentence overview of what the application achieves' },
    archetype: { type: Type.STRING, description: 'Category e.g. Productivity & Wellness, Creator Tool, SaaS Dashboard, FinTech, E-Commerce, Education' },
    targetAudience: { type: Type.STRING, description: 'Primary target users and use cases' },
    visualDesign: {
      type: Type.OBJECT,
      properties: {
        theme: { type: Type.STRING, description: '"light" or "dark"' },
        primaryColor: { type: Type.STRING, description: 'Primary hex color e.g. #0d9488' },
        accentColor: { type: Type.STRING, description: 'Accent hex color e.g. #f59e0b' },
        bgColor: { type: Type.STRING, description: 'Background hex color e.g. #f8fafc' },
        surfaceColor: { type: Type.STRING, description: 'Surface card background hex e.g. #ffffff' },
        textColor: { type: Type.STRING, description: 'Text main color e.g. #0f172a' },
        fontFamily: { type: Type.STRING, description: 'Font family suggestion e.g. Plus Jakarta Sans, Inter, Outfit, Space Grotesk' },
        borderRadius: { type: Type.STRING, description: 'Border radius style e.g. 12px or 16px' },
        styleName: { type: Type.STRING, description: 'Aesthetic theme name e.g. Clean Bio Teal, Cyber Dark, Minimal Slate' }
      },
      required: ['theme', 'primaryColor', 'accentColor', 'bgColor', 'surfaceColor', 'textColor', 'fontFamily', 'borderRadius', 'styleName']
    },
    features: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING, description: 'Feature name' },
          description: { type: Type.STRING, description: 'Feature function' },
          priority: { type: Type.STRING, description: '"core", "extended", or "nice-to-have"' },
          status: { type: Type.STRING, description: '"interactive", "designed", or "simulated"' }
        },
        required: ['id', 'name', 'description', 'priority', 'status']
      }
    },
    userStories: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 key user stories starting with "As a user..."'
    },
    dataSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          entity: { type: Type.STRING, description: 'Entity model name e.g. Task, Habit, Product' },
          description: { type: Type.STRING, description: 'Purpose of entity' },
          fields: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                description: { type: Type.STRING },
                required: { type: Type.BOOLEAN }
              },
              required: ['name', 'type', 'description', 'required']
            }
          },
          sampleRecordsJson: { type: Type.STRING, description: 'JSON string array of 3-4 realistic sample data objects' }
        },
        required: ['entity', 'description', 'fields', 'sampleRecordsJson']
      }
    },
    apiEndpoints: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          method: { type: Type.STRING, description: 'GET, POST, PUT, or DELETE' },
          path: { type: Type.STRING, description: 'Express route e.g. /api/tasks' },
          description: { type: Type.STRING, description: 'Route operation' },
          requestBody: { type: Type.STRING },
          responseBody: { type: Type.STRING }
        },
        required: ['method', 'path', 'description']
      }
    },
    codeFiles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Filename e.g. App.tsx, server.ts, types.ts' },
          path: { type: Type.STRING, description: 'File path e.g. /src/App.tsx' },
          language: { type: Type.STRING, description: 'tsx, typescript, json, css, sql' },
          content: { type: Type.STRING, description: 'Complete clean functional code snippet' },
          description: { type: Type.STRING, description: 'Short summary of file role' }
        },
        required: ['name', 'path', 'language', 'content', 'description']
      }
    },
    interactiveApp: {
      type: Type.OBJECT,
      properties: {
        tabs: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              icon: { type: Type.STRING, description: 'Lucide icon name e.g. CheckSquare, Sparkles, BarChart2, Package' },
              description: { type: Type.STRING }
            },
            required: ['id', 'name', 'icon', 'description']
          }
        },
        stats: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING },
              label: { type: Type.STRING },
              value: { type: Type.STRING },
              trend: { type: Type.STRING, description: '"up", "down", or "neutral"' },
              icon: { type: Type.STRING }
            },
            required: ['key', 'label', 'value']
          }
        },
        actions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              tabId: { type: Type.STRING },
              type: { type: Type.STRING, description: '"add", "filter", "toggle", "delete", "ai_generate"' },
              targetEntity: { type: Type.STRING },
              fieldsJson: { type: Type.STRING, description: 'JSON string array of field definitions' }
            },
            required: ['id', 'label', 'tabId', 'type']
          }
        }
      },
      required: ['tabs', 'stats', 'actions']
    }
  },
  required: ['title', 'tagline', 'description', 'archetype', 'targetAudience', 'visualDesign', 'features', 'userStories', 'dataSchema', 'apiEndpoints', 'codeFiles', 'interactiveApp']
};

// API Endpoint to generate an app spec with Gemini
app.post('/api/generate-app', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'App description prompt is required.' });
    }

    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const systemInstruction = `You are the master AI Application Architect.
Given an app description prompt, produce a fully thought-out, highly detailed, production-grade application spec and interactive prototype schema.
Make sure the color palette, typography, user stories, data schemas, code files, and interactive components are directly tailored to the user's specific request.
For sampleRecordsJson and fieldsJson, return valid JSON strings.
In sampleRecordsJson, include 3-4 realistic records matching the primary entity.
In codeFiles, provide clean, idiomatic, fully formed React TypeScript components and Express routes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Design and architect a complete application based on this prompt: "${prompt}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: appSpecSchema
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('No content returned from Gemini.');
    }

    const rawResult = JSON.parse(text);

    // Process sampleRecordsJson and fieldsJson into actual JS arrays
    const dataSchema = (rawResult.dataSchema || []).map((schema: any) => {
      let sampleRecords = [];
      try {
        if (schema.sampleRecordsJson) {
          sampleRecords = JSON.parse(schema.sampleRecordsJson);
        }
      } catch (e) {
        sampleRecords = [];
      }
      return {
        entity: schema.entity,
        description: schema.description,
        fields: schema.fields,
        sampleRecords
      };
    });

    const actions = (rawResult.interactiveApp?.actions || []).map((action: any) => {
      let fields = [];
      try {
        if (action.fieldsJson) {
          fields = JSON.parse(action.fieldsJson);
        }
      } catch (e) {
        fields = [];
      }
      return {
        id: action.id,
        label: action.label,
        tabId: action.tabId,
        type: action.type,
        targetEntity: action.targetEntity,
        fields
      };
    });

    // Extract initial state from the first entity sample records
    const primaryEntityName = dataSchema[0]?.entity?.toLowerCase() || 'items';
    const primarySampleRecords = dataSchema[0]?.sampleRecords || [];
    const initialState: Record<string, any> = {};
    initialState[primaryEntityName] = primarySampleRecords;

    const processedSpec = {
      id: 'gen-' + Date.now(),
      title: rawResult.title,
      tagline: rawResult.tagline,
      description: rawResult.description,
      archetype: rawResult.archetype,
      targetAudience: rawResult.targetAudience,
      visualDesign: rawResult.visualDesign,
      features: rawResult.features,
      userStories: rawResult.userStories,
      dataSchema,
      apiEndpoints: rawResult.apiEndpoints,
      codeFiles: rawResult.codeFiles,
      interactiveApp: {
        tabs: rawResult.interactiveApp?.tabs || [{ id: 'main', name: 'Main View', icon: 'Layout', description: 'Primary Dashboard' }],
        stats: rawResult.interactiveApp?.stats || [],
        actions,
        initialState
      },
      createdAt: Date.now()
    };

    res.json(processedSpec);
  } catch (error: any) {
    console.error('Error generating app:', error);
    res.status(500).json({ error: error.message || 'Failed to generate application spec.' });
  }
});

// API Endpoint to refine or update an app spec with Gemini
app.post('/api/refine-app', async (req, res) => {
  try {
    const { currentSpec, refinementPrompt } = req.body;
    if (!currentSpec || !refinementPrompt) {
      return res.status(400).json({ error: 'currentSpec and refinementPrompt are required.' });
    }

    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const prompt = `You are updating an existing application spec based on user feedback.
Current App Title: "${currentSpec.title}"
Current Description: "${currentSpec.description}"
User Refinement Request: "${refinementPrompt}"

Apply the user's requested changes (e.g. adding dark mode, adding export features, adding a new entity/tab, modifying colors) and output the complete updated app spec JSON matching the provided schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: appSpecSchema
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response from Gemini.');
    }

    const rawResult = JSON.parse(text);

    const dataSchema = (rawResult.dataSchema || []).map((schema: any) => {
      let sampleRecords = [];
      try {
        if (schema.sampleRecordsJson) sampleRecords = JSON.parse(schema.sampleRecordsJson);
      } catch (e) {
        sampleRecords = [];
      }
      return { entity: schema.entity, description: schema.description, fields: schema.fields, sampleRecords };
    });

    const actions = (rawResult.interactiveApp?.actions || []).map((action: any) => {
      let fields = [];
      try {
        if (action.fieldsJson) fields = JSON.parse(action.fieldsJson);
      } catch (e) {
        fields = [];
      }
      return { id: action.id, label: action.label, tabId: action.tabId, type: action.type, targetEntity: action.targetEntity, fields };
    });

    const primaryEntityName = dataSchema[0]?.entity?.toLowerCase() || 'items';
    const primarySampleRecords = dataSchema[0]?.sampleRecords || [];
    const initialState: Record<string, any> = { ...currentSpec.interactiveApp?.initialState };
    if (primarySampleRecords.length > 0) {
      initialState[primaryEntityName] = primarySampleRecords;
    }

    const updatedSpec = {
      ...currentSpec,
      title: rawResult.title || currentSpec.title,
      tagline: rawResult.tagline || currentSpec.tagline,
      description: rawResult.description || currentSpec.description,
      visualDesign: rawResult.visualDesign || currentSpec.visualDesign,
      features: rawResult.features || currentSpec.features,
      dataSchema: dataSchema.length > 0 ? dataSchema : currentSpec.dataSchema,
      apiEndpoints: rawResult.apiEndpoints || currentSpec.apiEndpoints,
      codeFiles: rawResult.codeFiles || currentSpec.codeFiles,
      interactiveApp: {
        tabs: rawResult.interactiveApp?.tabs || currentSpec.interactiveApp.tabs,
        stats: rawResult.interactiveApp?.stats || currentSpec.interactiveApp.stats,
        actions: actions.length > 0 ? actions : currentSpec.interactiveApp.actions,
        initialState
      }
    };

    res.json({ updatedSpec, summary: `Updated app with: ${refinementPrompt}` });
  } catch (error: any) {
    console.error('Error refining app:', error);
    res.status(500).json({ error: error.message || 'Failed to refine application spec.' });
  }
});

// API Endpoint for dynamic in-app AI features (e.g. Gemini AI button inside prototype)
app.post('/api/simulated-ai-action', async (req, res) => {
  try {
    const { appTitle, actionId, currentData, promptExtra } = req.body;
    if (!ai) {
      return res.json({ result: 'Gemini AI response simulated in live preview mode.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `You are the embedded AI engine for the user application "${appTitle}".
Action requested: "${actionId}".
Current live app state: ${JSON.stringify(currentData)}.
Extra user instruction: "${promptExtra || 'Provide helpful insights'}".
Return a concise, creative, high-value 1-3 sentence result or item snippet.`
    });

    res.json({ result: response.text });
  } catch (error: any) {
    res.json({ result: 'Gemini AI generated fresh insight for your app state!' });
  }
});

// Start Express and integrate Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
