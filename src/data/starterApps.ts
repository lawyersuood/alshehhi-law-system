import { AppSpec } from '../types';

export const STARTER_APPS: AppSpec[] = [
  {
    id: 'law-firm-uae',
    title: 'سعود أحمد الشحي للمحاماة والاستشارات القانونية',
    tagline: 'منصة شؤون القضايا والجلسات والموكلين والفواتير والوكالات',
    description: 'نظام متكامل ومخصص لمكتب سعود أحمد الشحي للمحاماة والاستشارات القانونية في دولة الإمارات العربية المتحدة، يشمل إدارة القضايا والمحاكم الإماراتية، جدول الجلسات، حساب ضريبة القيمة المضافة (5%)، إدارة الموكلين، والوكالات القانونية.',
    archetype: 'Legal Tech & Firm Management',
    targetAudience: 'المحامون، المكاتب القانونية، والمستشارون في الإمارات العربية المتحدة.',
    visualDesign: {
      theme: 'light',
      primaryColor: '#d97706',
      accentColor: '#0f172a',
      bgColor: '#f5f5f4',
      surfaceColor: '#ffffff',
      textColor: '#1e293b',
      fontFamily: 'IBM Plex Sans Arabic, Tajawal, sans-serif',
      borderRadius: '16px',
      styleName: 'UAE Legal Gold & Slate'
    },
    features: [
      { id: 'f1', name: 'إدارة القضايا والمحاكم الإماراتية', description: 'تتبع كافة القضايا في محاكم دبي، أبوظبي، الشارقة، وDIFC.', priority: 'core', status: 'interactive' },
      { id: 'f2', name: 'جدول الجلسات والتنبيهات', description: 'تنبيهات فورية بالجلسات القادمة مع تحديد القاعات والتواريخ.', priority: 'core', status: 'interactive' },
      { id: 'f3', name: 'الفواتير وضريبة القيمة المضافة (5%)', description: 'حساب تلقائي لضريبة VAT 5% وحالات تحصيل الأتعاب.', priority: 'core', status: 'interactive' },
      { id: 'f4', name: 'إدارة الوكالات والمستندات', description: 'تنبيهات انتهاء صلاحية الوكالات القانونية الصادرة من كاتب العدل.', priority: 'extended', status: 'interactive' }
    ],
    userStories: [
      'بصفتي محاميًا، أريد تسجيل قضية جديدة وتحديد المحكمة والخصم والأتعاب المتفق عليها.',
      'بصفتي مديرًا إداريًا، أريد إضافة جلسات قادمة ومتابعة مهام فريق العمل.',
      'بصفتي موظف حسابات، أريد إصدار فواتير أتعاب شاملة ضريبة القيمة المضافة 5%.'
    ],
    dataSchema: [
      {
        entity: 'Case',
        description: 'ملف القضية المسجلة لدى المحاكم.',
        fields: [
          { name: 'id', type: 'number', description: 'المعرّف', required: true },
          { name: 'number', type: 'string', description: 'رقم القضية', required: true },
          { name: 'clientId', type: 'number', description: 'الموكل', required: true },
          { name: 'opponent', type: 'string', description: 'الخصم', required: true },
          { name: 'type', type: 'string', description: 'تجاري، مدني، عمالي، إلخ', required: true },
          { name: 'court', type: 'string', description: 'اسم المحكمة', required: true },
          { name: 'status', type: 'string', description: 'حالة القضية', required: true },
          { name: 'fee', type: 'number', description: 'الأتعاب', required: true }
        ],
        sampleRecords: [
          { id: 1, number: '1245/2026 تجاري كلي', clientId: 1, opponent: 'شركة الاتحاد للتطوير', type: 'تجاري', court: 'محاكم دبي', status: 'متداولة', fee: 120000 }
        ]
      }
    ],
    apiEndpoints: [
      { method: 'GET', path: '/api/law/cases', description: 'جلب قائمة كافة القضايا والمستندات والجلسات.' },
      { method: 'POST', path: '/api/law/cases', description: 'قيد قضية جديدة لدى المحكمة المختصة.' },
      { method: 'POST', path: '/api/law/invoices', description: 'إصدار فاتورة أتعاب محسوبة مع ضريبة 5%.' }
    ],
    codeFiles: [
      {
        name: 'LawFirmUAE.tsx',
        path: '/src/components/LawFirmUAE.tsx',
        language: 'tsx',
        description: 'مكوّن شامل لإدارة مكتب المحاماة في الإمارات مع دعم RTL ورسوم Recharts.',
        content: `// LawFirmUAE complete React component with RTL & UAE Legal Features`
      }
    ],
    interactiveApp: {
      tabs: [
        { id: 'dashboard', name: 'لوحة التحكم', icon: 'LayoutDashboard', description: 'نظرة عامة وإحصائيات' },
        { id: 'cases', name: 'القضايا', icon: 'Briefcase', description: 'إدارة القضايا' },
        { id: 'hearings', name: 'الجلسات', icon: 'CalendarDays', description: 'جدول الجلسات' },
        { id: 'invoices', name: 'الفواتير', icon: 'Receipt', description: 'الفواتير والضريبة' }
      ],
      initialState: {},
      stats: [],
      actions: []
    },
    createdAt: Date.now()
  },
  {
    id: 'habit-pulse',
    title: 'HabitPulse Pro',
    tagline: 'Micro-Habit Tracker with Daily Streaks & AI Motivation',
    description: 'A slick, high-converting daily micro-habit builder designed for atomic growth, streak protection, weekly analytical heatmaps, and AI habit coaching.',
    archetype: 'Productivity & Wellness',
    targetAudience: 'High performers, students, and professionals building sustainable daily routines.',
    visualDesign: {
      theme: 'light',
      primaryColor: '#0d9488', // Teal 600
      accentColor: '#f59e0b', // Amber 500
      bgColor: '#f8fafc', // Slate 50
      surfaceColor: '#ffffff',
      textColor: '#0f172a',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      borderRadius: '16px',
      styleName: 'Modern Bio-Clean Teal'
    },
    features: [
      { id: 'f1', name: 'Atomic Habit Logger', description: 'One-tap daily completion tracking with animated celebration particles.', priority: 'core', status: 'interactive' },
      { id: 'f2', name: 'Streak Guard System', description: 'Auto-calculates current streaks and provides freeze tokens for busy days.', priority: 'core', status: 'interactive' },
      { id: 'f3', name: 'Weekly Heatmap Visualizer', description: 'Visual GitHub-style grid showing consistency scores across the week.', priority: 'core', status: 'interactive' },
      { id: 'f4', name: 'Gemini Habit AI Coach', description: 'Generates personalized micro-tips based on habit completion bottlenecks.', priority: 'extended', status: 'interactive' }
    ],
    userStories: [
      'As a user, I want to quickly add new daily habits with targeted time of day.',
      'As a user, I want to mark habits complete and see my daily streak count jump.',
      'As a user, I want an AI coach to give me a 1-sentence motivation boost for my longest streak.'
    ],
    dataSchema: [
      {
        entity: 'Habit',
        description: 'Core micro-habit record tracked daily by user.',
        fields: [
          { name: 'id', type: 'string', description: 'Unique ID', required: true },
          { name: 'title', type: 'string', description: 'Name of the habit', required: true },
          { name: 'category', type: 'string', description: 'Health, Mind, Career, Fitness', required: true },
          { name: 'streak', type: 'number', description: 'Current consecutive days streak', required: true },
          { name: 'targetTime', type: 'string', description: 'Morning, Afternoon, Evening', required: true },
          { name: 'completedToday', type: 'boolean', description: 'Today completion status', required: true }
        ],
        sampleRecords: [
          { id: 'h1', title: 'Hydrate 1 Liter Morning Water', category: 'Health', streak: 12, targetTime: 'Morning', completedToday: true },
          { id: 'h2', title: '15 Min Mindful Journaling', category: 'Mind', streak: 5, targetTime: 'Evening', completedToday: false },
          { id: 'h3', title: 'Read 10 Pages Tech Book', category: 'Career', streak: 8, targetTime: 'Evening', completedToday: true },
          { id: 'h4', title: '30 Deep Core Pushups', category: 'Fitness', streak: 3, targetTime: 'Afternoon', completedToday: false }
        ]
      }
    ],
    apiEndpoints: [
      { method: 'GET', path: '/api/habits', description: 'Fetch all active habits with current streak counts and today status.' },
      { method: 'POST', path: '/api/habits', description: 'Create a new daily habit record.', requestBody: '{"title": "Meditate 5 mins", "category": "Mind", "targetTime": "Morning"}' },
      { method: 'POST', path: '/api/habits/:id/toggle', description: 'Toggle habit completion status for today.' },
      { method: 'POST', path: '/api/habits/coach', description: 'Call Gemini AI to generate customized motivation tip based on current habit trends.' }
    ],
    codeFiles: [
      {
        name: 'App.tsx',
        path: '/src/App.tsx',
        language: 'tsx',
        description: 'Main React application entry rendering HabitPulse dashboard and streak trackers.',
        content: `import React, { useState } from 'react';
import { CheckCircle2, Circle, Flame, Plus, Sparkles, Trophy } from 'lucide-react';

export default function App() {
  const [habits, setHabits] = useState([
    { id: '1', title: 'Hydrate 1L Morning Water', streak: 12, category: 'Health', done: true },
    { id: '2', title: '15 Min Mindful Journaling', streak: 5, category: 'Mind', done: false },
    { id: '3', title: 'Read 10 Pages Book', streak: 8, category: 'Career', done: true },
  ]);

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => h.id === id ? { ...h, done: !h.done, streak: h.done ? h.streak - 1 : h.streak + 1 } : h));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <header className="max-w-4xl mx-auto flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-teal-800">HabitPulse Pro</h1>
          <p className="text-slate-500 text-sm">Build momentum through atomic consistency</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full border border-amber-200">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span className="font-semibold text-sm">25 Day Total Streak</span>
        </div>
      </header>
    </div>
  );
}`
      },
      {
        name: 'server.ts',
        path: '/server.ts',
        language: 'typescript',
        description: 'Express server endpoint handlers proxying Gemini AI coaching requests.',
        content: `import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

app.post('/api/habits/coach', async (req, res) => {
  const { habits } = req.body;
  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: \`Given these habits: \${JSON.stringify(habits)}, provide a 2-sentence highly energizing habit coach advice.\`
  });
  res.json({ advice: response.text });
});`
      }
    ],
    interactiveApp: {
      tabs: [
        { id: 'habits', name: 'Today Habits', icon: 'CheckSquare', description: 'Daily habits completion list' },
        { id: 'analytics', name: 'Weekly Analytics', icon: 'BarChart2', description: 'Streak history & heatmaps' },
        { id: 'ai_coach', name: 'Gemini Coach', icon: 'Sparkles', description: 'AI motivation & advice' }
      ],
      initialState: {
        habits: [
          { id: 'h1', title: 'Hydrate 1 Liter Morning Water', category: 'Health', streak: 12, targetTime: 'Morning', completedToday: true },
          { id: 'h2', title: '15 Min Mindful Journaling', category: 'Mind', streak: 5, targetTime: 'Evening', completedToday: false },
          { id: 'h3', title: 'Read 10 Pages Tech Book', category: 'Career', streak: 8, targetTime: 'Evening', completedToday: true },
          { id: 'h4', title: '30 Deep Core Pushups', category: 'Fitness', streak: 3, targetTime: 'Afternoon', completedToday: false }
        ],
        coachTip: 'Consistency beats intensity every single time! Complete your Mindful Journaling tonight to keep your 5-day streak blazing! 🔥'
      },
      stats: [
        { key: 'total_habits', label: 'Active Habits', value: 4, icon: 'ListCheck' },
        { key: 'completed_today', label: 'Completed Today', value: '2 / 4 (50%)', trend: 'up', icon: 'CheckCircle' },
        { key: 'longest_streak', label: 'Longest Streak', value: '12 Days 🔥', trend: 'up', icon: 'Flame' },
        { key: 'weekly_score', label: 'Weekly Score', value: '88%', trend: 'up', icon: 'Trophy' }
      ],
      actions: [
        {
          id: 'add_habit',
          label: 'Add New Habit',
          tabId: 'habits',
          type: 'add',
          targetEntity: 'habits',
          fields: [
            { key: 'title', label: 'Habit Title', type: 'text', placeholder: 'e.g., 10 min morning walk' },
            { key: 'category', label: 'Category', type: 'select', options: ['Health', 'Mind', 'Career', 'Fitness', 'Finance'] },
            { key: 'targetTime', label: 'Time of Day', type: 'select', options: ['Morning', 'Afternoon', 'Evening'] }
          ]
        },
        {
          id: 'ai_coach_refresh',
          label: 'Generate New AI Advice',
          tabId: 'ai_coach',
          type: 'ai_generate'
        }
      ]
    },
    createdAt: Date.now()
  },
  {
    id: 'nutri-plan',
    title: 'NutriPlan AI',
    tagline: 'Smart Pantry Tracker & Zero-Waste Meal Planner',
    description: 'Transform ingredients sitting in your fridge into instant gourmet recipes with macros breakdown, shopping list generation, and weekly meal schedules.',
    archetype: 'Food & Culinary AI',
    targetAudience: 'Home cooks, fitness enthusiasts, and budget-conscious food lovers looking to save time and prevent food waste.',
    visualDesign: {
      theme: 'light',
      primaryColor: '#16a34a', // Emerald 600
      accentColor: '#ea580c', // Orange 600
      bgColor: '#fdfbf7', // Soft warm cream
      surfaceColor: '#ffffff',
      textColor: '#1c1917',
      fontFamily: 'Outfit, sans-serif',
      borderRadius: '12px',
      styleName: 'Warm Culinary Emerald'
    },
    features: [
      { id: 'f1', name: 'Interactive Pantry Inventory', description: 'Log current fridge and pantry items with expiration date badges.', priority: 'core', status: 'interactive' },
      { id: 'f2', name: 'Gemini Recipe Synthesizer', description: 'Generates 3 customized recipes matching only available pantry items.', priority: 'core', status: 'interactive' },
      { id: 'f3', name: 'Macro & Nutrition Summary', description: 'Calculates calories, protein, carbs, and fats per serving.', priority: 'core', status: 'interactive' },
      { id: 'f4', name: 'Smart Grocery Auto-List', description: 'Automatically identifies missing ingredients and exports shopping checklist.', priority: 'extended', status: 'interactive' }
    ],
    userStories: [
      'As a user, I want to add ingredients I have in my kitchen to my digital pantry.',
      'As a user, I want Gemini to generate 15-minute recipes using strictly my ingredients.',
      'As a user, I want to click "Add Missing to Grocery List" so I know what to buy.'
    ],
    dataSchema: [
      {
        entity: 'PantryItem',
        description: 'Available ingredient stored in user kitchen.',
        fields: [
          { name: 'id', type: 'string', description: 'Unique ID', required: true },
          { name: 'name', type: 'string', description: 'Ingredient name', required: true },
          { name: 'quantity', type: 'string', description: 'e.g. 500g, 4 items', required: true },
          { name: 'category', type: 'string', description: 'Produce, Protein, Dairy, Pantry', required: true },
          { name: 'expiresInDays', type: 'number', description: 'Days until expiration', required: true }
        ],
        sampleRecords: [
          { id: 'p1', name: 'Fresh Chicken Breast', quantity: '400g', category: 'Protein', expiresInDays: 2 },
          { id: 'p2', name: 'Avocado', quantity: '2 items', category: 'Produce', expiresInDays: 1 },
          { id: 'p3', name: 'Greek Yogurt', quantity: '250g', category: 'Dairy', expiresInDays: 4 },
          { id: 'p4', name: 'Brown Rice', quantity: '1kg', category: 'Pantry', expiresInDays: 60 }
        ]
      }
    ],
    apiEndpoints: [
      { method: 'GET', path: '/api/pantry', description: 'List all current pantry inventory items.' },
      { method: 'POST', path: '/api/pantry', description: 'Add new pantry item.' },
      { method: 'POST', path: '/api/recipes/generate', description: 'Generate AI recipes based on selected pantry items.' }
    ],
    codeFiles: [
      {
        name: 'App.tsx',
        path: '/src/App.tsx',
        language: 'tsx',
        description: 'NutriPlan application UI component.',
        content: `// NutriPlan AI React Entry Point`
      }
    ],
    interactiveApp: {
      tabs: [
        { id: 'pantry', name: 'My Pantry', icon: 'Refrigerator', description: 'Current ingredients in stock' },
        { id: 'recipes', name: 'AI Recipes', icon: 'ChefHat', description: 'Generated recipes from pantry' },
        { id: 'grocery', name: 'Grocery List', icon: 'ShoppingBag', description: 'Needed items for recipes' }
      ],
      initialState: {
        pantry: [
          { id: 'p1', name: 'Fresh Chicken Breast', quantity: '400g', category: 'Protein', expiresInDays: 2 },
          { id: 'p2', name: 'Avocado', quantity: '2 items', category: 'Produce', expiresInDays: 1 },
          { id: 'p3', name: 'Greek Yogurt', quantity: '250g', category: 'Dairy', expiresInDays: 4 },
          { id: 'p4', name: 'Brown Rice', quantity: '1kg', category: 'Pantry', expiresInDays: 60 }
        ],
        recipes: [
          { id: 'r1', title: 'Creamy Avocado Chicken Rice Bowl', prepTime: '20 mins', calories: 520, protein: '42g', ingredientsUsed: ['Chicken', 'Avocado', 'Brown Rice', 'Greek Yogurt'], difficulty: 'Easy' },
          { id: 'r2', title: 'High-Protein Garlic Chicken Skillet', prepTime: '15 mins', calories: 410, protein: '48g', ingredientsUsed: ['Chicken', 'Greek Yogurt'], difficulty: 'Quick' }
        ],
        grocery: [
          { id: 'g1', name: 'Fresh Lime', category: 'Produce', bought: false },
          { id: 'g2', name: 'Garlic Powder', category: 'Spices', bought: true }
        ]
      },
      stats: [
        { key: 'pantry_items', label: 'Ingredients Stocked', value: 4, icon: 'Package' },
        { key: 'expiring_soon', label: 'Expiring in 48 hrs', value: '2 items ⚠️', trend: 'down', icon: 'Clock' },
        { key: 'recipes_ready', label: 'AI Recipes Ready', value: '2 Dishes', trend: 'up', icon: 'Utensils' }
      ],
      actions: [
        {
          id: 'add_pantry_item',
          label: 'Add Ingredient to Pantry',
          tabId: 'pantry',
          type: 'add',
          targetEntity: 'pantry',
          fields: [
            { key: 'name', label: 'Ingredient Name', type: 'text', placeholder: 'e.g., Spinach, Eggs, Milk' },
            { key: 'quantity', label: 'Quantity / Weight', type: 'text', placeholder: 'e.g., 500g or 6 eggs' },
            { key: 'category', label: 'Category', type: 'select', options: ['Produce', 'Protein', 'Dairy', 'Pantry', 'Spices'] }
          ]
        },
        {
          id: 'ai_generate_recipe',
          label: 'Generate AI Gourmet Recipe',
          tabId: 'recipes',
          type: 'ai_generate'
        }
      ]
    },
    createdAt: Date.now()
  },
  {
    id: 'kanban-flow',
    title: 'KanbanFlow AI',
    tagline: 'Agile Project Board with Automated AI Sprint Summaries',
    description: 'A developer and product management kanban workspace featuring column drag state, priority tags, estimate trackers, and Gemini release notes generator.',
    archetype: 'Developer & PM SaaS',
    targetAudience: 'Software teams, solo founders, and product managers managing agile feature sprints.',
    visualDesign: {
      theme: 'light',
      primaryColor: '#2563eb', // Royal Blue
      accentColor: '#8b5cf6', // Violet
      bgColor: '#f8fafc',
      surfaceColor: '#ffffff',
      textColor: '#020617',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '8px',
      styleName: 'Agile Slate Blue'
    },
    features: [
      { id: 'f1', name: '4-Column Kanban Pipeline', description: 'Backlog, In Progress, Review, and Done column boards.', priority: 'core', status: 'interactive' },
      { id: 'f2', name: 'Task Card Detail & Priority', description: 'High/Medium/Low priority tags with estimated story points.', priority: 'core', status: 'interactive' },
      { id: 'f3', name: 'Gemini Release Notes Generator', description: 'Summarizes all items in Done column into release notes markdown.', priority: 'extended', status: 'interactive' }
    ],
    userStories: [
      'As a developer, I want to create new task cards with tags and estimates.',
      'As a PM, I want to move tasks between In Progress and Done.',
      'As a team lead, I want Gemini to compile Done tasks into a polished changelog.'
    ],
    dataSchema: [
      {
        entity: 'Task',
        description: 'Agile sprint story card.',
        fields: [
          { name: 'id', type: 'string', description: 'Unique ID', required: true },
          { name: 'title', type: 'string', description: 'Task title', required: true },
          { name: 'status', type: 'string', description: 'Backlog, In Progress, Review, Done', required: true },
          { name: 'priority', type: 'string', description: 'High, Medium, Low', required: true },
          { name: 'points', type: 'number', description: 'Fibonacci story points', required: true }
        ],
        sampleRecords: [
          { id: 't1', title: 'Implement Express API Proxy for Gemini', status: 'In Progress', priority: 'High', points: 5 },
          { id: 't2', title: 'Design Responsive Mobile Navigation Bar', status: 'Done', priority: 'Medium', points: 3 },
          { id: 't3', title: 'Setup Firestore Security Rules Audit', status: 'Backlog', priority: 'Low', points: 2 },
          { id: 't4', title: 'Add Dark Mode High-Contrast Theme Switch', status: 'Done', priority: 'Medium', points: 2 }
        ]
      }
    ],
    apiEndpoints: [
      { method: 'GET', path: '/api/tasks', description: 'Fetch all kanban tasks grouped by column.' },
      { method: 'POST', path: '/api/tasks', description: 'Create task card.' },
      { method: 'POST', path: '/api/tasks/release-notes', description: 'Generate AI release changelog.' }
    ],
    codeFiles: [
      { name: 'App.tsx', path: '/src/App.tsx', language: 'tsx', description: 'Kanban React UI', content: '// Kanban UI code' }
    ],
    interactiveApp: {
      tabs: [
        { id: 'board', name: 'Kanban Board', icon: 'LayoutKanban', description: 'Visual agile board' },
        { id: 'release_notes', name: 'AI Release Notes', icon: 'FileText', description: 'Generated changelogs' }
      ],
      initialState: {
        tasks: [
          { id: 't1', title: 'Implement Express API Proxy for Gemini', status: 'In Progress', priority: 'High', points: 5 },
          { id: 't2', title: 'Design Responsive Mobile Navigation Bar', status: 'Done', priority: 'Medium', points: 3 },
          { id: 't3', title: 'Setup Firestore Security Rules Audit', status: 'Backlog', priority: 'Low', points: 2 },
          { id: 't4', title: 'Add Dark Mode High-Contrast Theme Switch', status: 'Done', priority: 'Medium', points: 2 }
        ],
        releaseNotesText: '## 🚀 Sprint Release v1.4.0\n\n### ✨ Completed Features:\n- **Design Responsive Mobile Navigation Bar** (3 pts)\n- **Add Dark Mode High-Contrast Theme Switch** (2 pts)\n\nTotal Story Points Delivered: **5 Points**'
      },
      stats: [
        { key: 'total_tasks', label: 'Total Tasks', value: 4, icon: 'CheckSquare' },
        { key: 'in_progress', label: 'In Progress', value: 1, trend: 'neutral', icon: 'Clock' },
        { key: 'done_count', label: 'Done Sprint Tasks', value: 2, trend: 'up', icon: 'CheckCircle' },
        { key: 'velocity', label: 'Sprint Velocity', value: '5 / 12 pts', trend: 'up', icon: 'Zap' }
      ],
      actions: [
        {
          id: 'add_task',
          label: 'Create Sprint Task',
          tabId: 'board',
          type: 'add',
          targetEntity: 'tasks',
          fields: [
            { key: 'title', label: 'Task Title', type: 'text', placeholder: 'e.g., Integrate Auth0 OAuth Flow' },
            { key: 'status', label: 'Column Status', type: 'select', options: ['Backlog', 'In Progress', 'Review', 'Done'] },
            { key: 'priority', label: 'Priority Tag', type: 'select', options: ['High', 'Medium', 'Low'] },
            { key: 'points', label: 'Story Points', type: 'number', placeholder: '1, 2, 3, 5, 8' }
          ]
        },
        {
          id: 'generate_changelog',
          label: 'Generate AI Changelog',
          tabId: 'release_notes',
          type: 'ai_generate'
        }
      ]
    },
    createdAt: Date.now()
  },
  {
    id: 'coin-metric',
    title: 'CoinMetric Analytics',
    tagline: 'Real-Time Crypto Portfolio Tracker & AI Sentiment Signal',
    description: 'Track crypto holdings across BTC, ETH, and SOL with live P&L calculators, portfolio distribution charts, and Gemini news sentiment analysis.',
    archetype: 'Financial Tech',
    targetAudience: 'Crypto investors, traders, and web3 enthusiasts keeping track of digital assets.',
    visualDesign: {
      theme: 'dark',
      primaryColor: '#6366f1', // Indigo
      accentColor: '#10b981', // Emerald green profit
      bgColor: '#0f172a', // Slate 900 dark
      surfaceColor: '#1e293b',
      textColor: '#f8fafc',
      fontFamily: 'Space Grotesk, sans-serif',
      borderRadius: '12px',
      styleName: 'Dark Cyber Finance'
    },
    features: [
      { id: 'f1', name: 'Live Asset Holdings Table', description: 'Displays token balance, buy price, current market rate, and total ROI.', priority: 'core', status: 'interactive' },
      { id: 'f2', name: 'Portfolio Allocation Split', description: 'Calculates percentage share per token.', priority: 'core', status: 'interactive' },
      { id: 'f3', name: 'AI Sentiment Radar', description: 'Gemini analyzes market sentiment and risk factors for held tokens.', priority: 'extended', status: 'interactive' }
    ],
    userStories: [
      'As an investor, I want to log my buy entries and see live profit/loss percentages.',
      'As a trader, I want an AI overview of sentiment for my crypto assets.'
    ],
    dataSchema: [
      {
        entity: 'Holding',
        description: 'Crypto token entry in user portfolio.',
        fields: [
          { name: 'symbol', type: 'string', description: 'BTC, ETH, SOL', required: true },
          { name: 'name', type: 'string', description: 'Bitcoin, Ethereum, Solana', required: true },
          { name: 'amount', type: 'number', description: 'Quantity owned', required: true },
          { name: 'buyPriceUSD', type: 'number', description: 'Average buy price', required: true },
          { name: 'currentPriceUSD', type: 'number', description: 'Live market price', required: true }
        ],
        sampleRecords: [
          { symbol: 'BTC', name: 'Bitcoin', amount: 0.42, buyPriceUSD: 62000, currentPriceUSD: 68500 },
          { symbol: 'ETH', name: 'Ethereum', amount: 3.5, buyPriceUSD: 2900, currentPriceUSD: 3450 },
          { symbol: 'SOL', name: 'Solana', amount: 28, buyPriceUSD: 140, currentPriceUSD: 182 }
        ]
      }
    ],
    apiEndpoints: [
      { method: 'GET', path: '/api/portfolio', description: 'Get user portfolio balances and current value.' },
      { method: 'POST', path: '/api/portfolio/sentiment', description: 'Request Gemini AI sentiment report.' }
    ],
    codeFiles: [
      { name: 'App.tsx', path: '/src/App.tsx', language: 'tsx', description: 'CoinMetric UI', content: '// Crypto UI code' }
    ],
    interactiveApp: {
      tabs: [
        { id: 'portfolio', name: 'Portfolio Overview', icon: 'Coins', description: 'Holdings and ROI breakdown' },
        { id: 'sentiment', name: 'AI Market Signals', icon: 'TrendingUp', description: 'Gemini market sentiment analysis' }
      ],
      initialState: {
        holdings: [
          { id: 'h1', symbol: 'BTC', name: 'Bitcoin', amount: 0.42, buyPriceUSD: 62000, currentPriceUSD: 68500 },
          { id: 'h2', symbol: 'ETH', name: 'Ethereum', amount: 3.5, buyPriceUSD: 2900, currentPriceUSD: 3450 },
          { id: 'h3', symbol: 'SOL', name: 'Solana', amount: 28, buyPriceUSD: 140, currentPriceUSD: 182 }
        ],
        aiSignal: '🟢 **Bullish Momentum Identified**: Solana (+30% gain) and Ethereum are experiencing strong DEX volume. Recommended: Set trailing stop-losses at $170 for SOL.'
      },
      stats: [
        { key: 'total_val', label: 'Portfolio Net Worth', value: '$45,941.00', trend: 'up', icon: 'DollarSign' },
        { key: 'total_profit', label: 'Total Unrealized P&L', value: '+$5,831.00 (+14.5%)', trend: 'up', icon: 'TrendingUp' },
        { key: 'best_performer', label: 'Top Performer', value: 'SOL (+30.0%)', trend: 'up', icon: 'Zap' }
      ],
      actions: [
        {
          id: 'add_holding',
          label: 'Add Crypto Holding',
          tabId: 'portfolio',
          type: 'add',
          targetEntity: 'holdings',
          fields: [
            { key: 'symbol', label: 'Symbol', type: 'text', placeholder: 'e.g., BTC, ETH, NEAR' },
            { key: 'name', label: 'Token Name', type: 'text', placeholder: 'e.g., Bitcoin' },
            { key: 'amount', label: 'Amount Held', type: 'number', placeholder: 'e.g., 1.5' },
            { key: 'buyPriceUSD', label: 'Buy Price ($)', type: 'number', placeholder: 'e.g., 2500' },
            { key: 'currentPriceUSD', label: 'Current Market Price ($)', type: 'number', placeholder: 'e.g., 2800' }
          ]
        },
        {
          id: 'refresh_sentiment',
          label: 'Run AI Market Analysis',
          tabId: 'sentiment',
          type: 'ai_generate'
        }
      ]
    },
    createdAt: Date.now()
  },
  {
    id: 'brain-spark',
    title: 'BrainSpark Flashcards',
    tagline: 'AI Spaced Repetition & Study Deck Generator',
    description: 'Master any topic faster with AI-generated flashcard decks, active recall quiz mode, mastery progress bars, and spaced-repetition schedules.',
    archetype: 'Education & Learning',
    targetAudience: 'Students, medical/legal candidates, and language learners studying complex subjects.',
    visualDesign: {
      theme: 'light',
      primaryColor: '#7c3aed', // Purple 600
      accentColor: '#ec4899', // Pink 500
      bgColor: '#faf5ff',
      surfaceColor: '#ffffff',
      textColor: '#1e1b4b',
      fontFamily: 'Outfit, sans-serif',
      borderRadius: '16px',
      styleName: 'Vibrant Academic Purple'
    },
    features: [
      { id: 'f1', name: 'Interactive Card Flip Studio', description: 'Study mode with 3D flip effect and answer confidence ratings.', priority: 'core', status: 'interactive' },
      { id: 'f2', name: 'Gemini Auto Deck Generator', description: 'Enter any topic (e.g., "Neuroanatomy") to generate 5 instant cards.', priority: 'core', status: 'interactive' },
      { id: 'f3', name: 'Mastery Tracker', description: 'Calculates memory retention score per deck.', priority: 'core', status: 'interactive' }
    ],
    userStories: [
      'As a student, I want to generate a 5-card flashcard deck on any subject instantly using AI.',
      'As a learner, I want to click to flip cards and mark whether I remembered the answer.'
    ],
    dataSchema: [
      {
        entity: 'Flashcard',
        description: 'Question and answer flashcard.',
        fields: [
          { name: 'id', type: 'string', description: 'Unique ID', required: true },
          { name: 'question', type: 'string', description: 'Front side question', required: true },
          { name: 'answer', type: 'string', description: 'Back side answer', required: true },
          { name: 'mastered', type: 'boolean', description: 'Mastery state', required: true }
        ],
        sampleRecords: [
          { id: 'c1', question: 'What is the function of Mitochondria in eukaryotic cells?', answer: 'Generates ATP energy via cellular respiration (Powerhouse of the cell).', mastered: true },
          { id: 'c2', question: 'What is the difference between let and const in JS?', answer: 'let allows re-assignment; const enforces immutable variable references.', mastered: false },
          { id: 'c3', question: 'Explain standard deviation in simple terms.', answer: 'Measures how spread out numbers are around the mean average value.', mastered: true }
        ]
      }
    ],
    apiEndpoints: [
      { method: 'GET', path: '/api/flashcards', description: 'Fetch all flashcard cards in current study deck.' },
      { method: 'POST', path: '/api/flashcards/generate', description: 'Generate flashcard deck on topic via Gemini.' }
    ],
    codeFiles: [
      { name: 'App.tsx', path: '/src/App.tsx', language: 'tsx', description: 'Flashcard UI', content: '// Flashcards React Code' }
    ],
    interactiveApp: {
      tabs: [
        { id: 'deck', name: 'Study Deck', icon: 'Brain', description: 'Interactive active recall cards' },
        { id: 'ai_generator', name: 'AI Deck Creator', icon: 'Sparkles', description: 'Generate decks on any topic' }
      ],
      initialState: {
        flashcards: [
          { id: 'c1', question: 'What is the function of Mitochondria in eukaryotic cells?', answer: 'Generates ATP energy via cellular respiration (Powerhouse of the cell).', mastered: true },
          { id: 'c2', question: 'What is the difference between let and const in JS?', answer: 'let allows re-assignment; const enforces immutable variable references.', mastered: false },
          { id: 'c3', question: 'Explain standard deviation in simple terms.', answer: 'Measures how spread out numbers are around the mean average value.', mastered: true },
          { id: 'c4', question: 'What is the HTTP 429 status code?', answer: 'Too Many Requests (Rate limit exceeded).', mastered: false }
        ]
      },
      stats: [
        { key: 'total_cards', label: 'Total Cards in Deck', value: 4, icon: 'Layers' },
        { key: 'mastered_count', label: 'Mastered Cards', value: '2 / 4 (50%)', trend: 'up', icon: 'CheckCircle' },
        { key: 'retention_rate', label: 'Retention Score', value: '78%', trend: 'up', icon: 'Award' }
      ],
      actions: [
        {
          id: 'add_flashcard',
          label: 'Add Manual Flashcard',
          tabId: 'deck',
          type: 'add',
          targetEntity: 'flashcards',
          fields: [
            { key: 'question', label: 'Front Question / Concept', type: 'text', placeholder: 'e.g., What is photosynthesis?' },
            { key: 'answer', label: 'Back Explanation / Answer', type: 'textarea', placeholder: 'e.g., Process plants convert sunlight into glucose' }
          ]
        },
        {
          id: 'ai_generate_deck',
          label: 'Generate Deck with Gemini AI',
          tabId: 'ai_generator',
          type: 'ai_generate'
        }
      ]
    },
    createdAt: Date.now()
  },
  {
    id: 'invoicely-app',
    title: 'Invoicely AI',
    tagline: 'Freelancer Invoice Studio & Expense Categorizer',
    description: 'Generate client invoices in seconds with automated line-item calculations, tax rates, exportable previews, and Gemini expense receipt auto-tagging.',
    archetype: 'Freelance & Business Ops',
    targetAudience: 'Freelancers, consultants, and agencies issuing professional invoices to clients.',
    visualDesign: {
      theme: 'light',
      primaryColor: '#0284c7', // Sky 600
      accentColor: '#10b981', // Emerald green paid badge
      bgColor: '#f0f9ff',
      surfaceColor: '#ffffff',
      textColor: '#0c4a6e',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      borderRadius: '12px',
      styleName: 'Clean Corporate Sky'
    },
    features: [
      { id: 'f1', name: 'Invoice Builder', description: 'Client details, line items, hourly rate calculations, and total tax.', priority: 'core', status: 'interactive' },
      { id: 'f2', name: 'Status Lifecycle Tracker', description: 'Track Draft, Sent, Paid, and Overdue invoices.', priority: 'core', status: 'interactive' },
      { id: 'f3', name: 'AI Client Email Writer', description: 'Gemini drafts polite payment reminder emails for overdue items.', priority: 'extended', status: 'interactive' }
    ],
    userStories: [
      'As a freelancer, I want to create a new client invoice with line items and due dates.',
      'As a contractor, I want to mark an invoice as Paid and update my monthly revenue total.'
    ],
    dataSchema: [
      {
        entity: 'Invoice',
        description: 'Client bill statement.',
        fields: [
          { name: 'id', type: 'string', description: 'Unique invoice number', required: true },
          { name: 'clientName', type: 'string', description: 'Client business name', required: true },
          { name: 'amountUSD', type: 'number', description: 'Total dollar value', required: true },
          { name: 'status', type: 'string', description: 'Paid, Pending, Overdue', required: true },
          { name: 'dueDate', type: 'string', description: 'Date due', required: true }
        ],
        sampleRecords: [
          { id: 'INV-1001', clientName: 'Acme Design Corp', amountUSD: 2450, status: 'Paid', dueDate: '2026-07-28' },
          { id: 'INV-1002', clientName: 'Starlight Tech Inc', amountUSD: 1800, status: 'Pending', dueDate: '2026-08-10' },
          { id: 'INV-1003', clientName: 'Apex Capital', amountUSD: 3200, status: 'Overdue', dueDate: '2026-07-15' }
        ]
      }
    ],
    apiEndpoints: [
      { method: 'GET', path: '/api/invoices', description: 'List all client invoices.' },
      { method: 'POST', path: '/api/invoices', description: 'Create new invoice record.' }
    ],
    codeFiles: [
      { name: 'App.tsx', path: '/src/App.tsx', language: 'tsx', description: 'Invoicely UI', content: '// Invoice React UI' }
    ],
    interactiveApp: {
      tabs: [
        { id: 'invoices', name: 'All Invoices', icon: 'FileText', description: 'Manage client billing records' },
        { id: 'ai_reminder', name: 'AI Email Draft', icon: 'Mail', description: 'Generate polite payment reminders' }
      ],
      initialState: {
        invoices: [
          { id: 'INV-1001', clientName: 'Acme Design Corp', amountUSD: 2450, status: 'Paid', dueDate: '2026-07-28' },
          { id: 'INV-1002', clientName: 'Starlight Tech Inc', amountUSD: 1800, status: 'Pending', dueDate: '2026-08-10' },
          { id: 'INV-1003', clientName: 'Apex Capital', amountUSD: 3200, status: 'Overdue', dueDate: '2026-07-15' }
        ],
        aiEmailDraft: 'Subject: Friendly Follow-up: Invoice INV-1003 for Apex Capital\n\nDear Apex Capital Team,\n\nI hope you are having a wonderful week! This is a quick note regarding Invoice INV-1003 ($3,200.00) which was due on July 15.\n\nPlease let me know if you need another copy of the invoice or payment link.\n\nBest regards,\nYour Name'
      },
      stats: [
        { key: 'total_billed', label: 'Total Billed This Month', value: '$7,450.00', trend: 'up', icon: 'DollarSign' },
        { key: 'paid_rev', label: 'Collected Revenue', value: '$2,450.00', trend: 'up', icon: 'CheckCircle' },
        { key: 'overdue_val', label: 'Overdue Balance', value: '$3,200.00 ⚠️', trend: 'down', icon: 'AlertTriangle' }
      ],
      actions: [
        {
          id: 'add_invoice',
          label: 'Create Client Invoice',
          tabId: 'invoices',
          type: 'add',
          targetEntity: 'invoices',
          fields: [
            { key: 'id', label: 'Invoice Number', type: 'text', placeholder: 'INV-1004' },
            { key: 'clientName', label: 'Client Company Name', type: 'text', placeholder: 'e.g., Nexus Digital' },
            { key: 'amountUSD', label: 'Invoice Amount ($)', type: 'number', placeholder: '1500' },
            { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Paid', 'Overdue'] },
            { key: 'dueDate', label: 'Due Date', type: 'text', placeholder: '2026-08-20' }
          ]
        },
        {
          id: 'ai_draft_reminder',
          label: 'Generate Reminder Email with Gemini',
          tabId: 'ai_reminder',
          type: 'ai_generate'
        }
      ]
    },
    createdAt: Date.now()
  }
];
