// =============================================
// Tipos do SARA Portal
// =============================================

export interface Client {
  id: string;
  created_at: string;
  updated_at: string;
  auth_user_id: string | null;
  whatsapp_id: string | null;
  name: string;
  email: string | null;
  apelido: string | null;
  status: 'active' | 'inactive' | 'pending_whatsapp' | 'suspended';
  plan: string;
  
  // Limites do plano
  max_reminders: number;
  max_lists: number;
  max_list_items: number;
  max_transactions_month: number;
  max_rag_queries_month: number;
  max_documents: number;
  max_web_searches_month: number;
  
  // Contadores de uso
  reminders_count: number;
  lists_count: number;
  transactions_month: number;
  rag_queries_month: number;
  documents_count: number;
  web_searches_month: number;
  
  // Financeiro
  current_balance: number;
  balance_updated_at: string;
  
  // Configurações
  timezone: string;
  bot_name: string;
  bot_personality: string;
  morning_summary_enabled: boolean;
  
  // Onboarding
  onboarding_completed: boolean;
  onboarding_step: string;
}

export interface Transaction {
  id: number;
  client_id: string;
  date: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  payment_method: string | null;
  created_at: string;
}

export interface Reminder {
  id: number;
  client_id: string;
  title: string;
  description: string | null;
  remind_at: string;
  status: 'pending' | 'sent' | 'completed' | 'cancelled';
  priority: 'baixa' | 'media' | 'alta';
  type: 'unico' | 'diario' | 'semanal' | 'mensal';
  created_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  snooze_count: number;
}

export interface List {
  id: number;
  client_id: string;
  title: string;
  items: ListItem[];
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListItem {
  id: string;
  text: string;
  checked: boolean;
  created_at: string;
}

export interface Note {
  id: string;
  client_id: string;
  title: string;
  content: string | null;
  color: string;
  tags: string[];
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  client_id: string;
  titulo: string;
  conteudo: string;
  categoria: string;
  fonte: string;
  file_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  transaction_count: number;
}

export interface MonthlyReport {
  period: {
    year: number;
    month: number;
    month_name: string;
  };
  summary: FinanceSummary;
  by_category: CategorySummary[];
  top_expenses: Transaction[];
  daily_totals: DailyTotal[];
}

export interface CategorySummary {
  category: string;
  type: 'income' | 'expense';
  total: number;
  count: number;
}

export interface DailyTotal {
  date: string;
  income: number;
  expense: number;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  max_reminders: number;
  max_lists: number;
  max_list_items: number;
  max_transactions_month: number;
  max_rag_queries_month: number;
  max_documents: number;
  max_web_searches_month: number;
  features: string[];
  is_active: boolean;
}

export interface Session {
  id: string;
  client_id: string;
  auth_user_id: string;
  device_info: Record<string, any>;
  user_agent: string | null;
  ip_address: string | null;
  last_active_at: string;
  created_at: string;
  is_active: boolean;
}

export interface ActivityLog {
  id: number;
  client_id: string;
  action: string;
  details: Record<string, any>;
  source: 'portal' | 'whatsapp' | 'api' | 'system';
  ip_address: string | null;
  created_at: string;
}
