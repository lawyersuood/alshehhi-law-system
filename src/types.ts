export interface DesignSystem {
  theme: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  surfaceColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  styleName: string;
}

export interface AppFeature {
  id: string;
  name: string;
  description: string;
  priority: 'core' | 'extended' | 'nice-to-have';
  status: 'interactive' | 'designed' | 'simulated';
  icon?: string;
}

export interface SchemaField {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface EntitySchema {
  entity: string;
  description: string;
  fields: SchemaField[];
  sampleRecords: Record<string, any>[];
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  requestBody?: string;
  responseBody?: string;
}

export interface GeneratedCodeFile {
  name: string;
  path: string;
  language: 'typescript' | 'tsx' | 'json' | 'css' | 'sql';
  content: string;
  description: string;
}

export interface InteractiveActionField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'textarea';
  options?: string[];
  placeholder?: string;
  defaultValue?: any;
}

export interface InteractiveAction {
  id: string;
  label: string;
  tabId: string;
  type: 'add' | 'filter' | 'toggle' | 'delete' | 'ai_generate';
  targetEntity?: string;
  fields?: InteractiveActionField[];
}

export interface InteractiveStat {
  key: string;
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}

export interface InteractiveAppConfig {
  tabs: Array<{ id: string; name: string; icon: string; description: string }>;
  initialState: Record<string, any>;
  actions: InteractiveAction[];
  stats: InteractiveStat[];
}

export interface AppSpec {
  id: string;
  title: string;
  tagline: string;
  description: string;
  archetype: string;
  targetAudience: string;
  visualDesign: DesignSystem;
  features: AppFeature[];
  userStories: string[];
  dataSchema: EntitySchema[];
  apiEndpoints: ApiEndpoint[];
  codeFiles: GeneratedCodeFile[];
  interactiveApp: InteractiveAppConfig;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: number;
  summaryOfChanges?: string;
}
