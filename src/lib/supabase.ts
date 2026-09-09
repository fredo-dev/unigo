import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Transaction, RegisteredUser } from '../types';

// Read configuration from env variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  // Verify credentials exist and are not placeholders
  const isValidUrl = supabaseUrl && supabaseUrl.startsWith('https://');
  const isValidKey = supabaseAnonKey && supabaseAnonKey.length > 20;

  if (isValidUrl && isValidKey) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
      console.log('Supabase initialized successfully.');
      return supabaseInstance;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
    }
  }
  return null;
}

export function isSupabaseConfigured(): boolean {
  const supabase = getSupabase();
  return supabase !== null;
}

/**
 * PRODUCTION-READY SUPABASE DATABASE APIS
 * These functions write directly to Supabase if configured,
 * and fall back to local storage if they aren't, ensuring zero friction.
 */

// Transactions
export async function dbGetTransactions(): Promise<Transaction[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('unigo_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        return data.map((t: any) => ({
          id: t.id,
          date: new Date(t.created_at).toLocaleString('fr-FR'),
          phone: t.phone,
          amount: Number(t.amount),
          fee: Number(t.fee),
          total: Number(t.total),
          networkId: t.network_id,
          serviceType: t.service_type,
          bundleId: t.bundle_id || undefined,
          bundleName: t.bundle_name || undefined,
          paymentMethod: t.payment_method,
          reference: t.reference,
          status: t.status
        }));
      }
    } catch (err) {
      console.error('Supabase get transactions error, falling back to local:', err);
    }
  }

  // Fallback
  try {
    const saved = localStorage.getItem('unigo_transactions');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export async function dbSaveTransaction(tx: Transaction): Promise<Transaction> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('unigo_transactions')
        .insert({
          id: tx.id,
          phone: tx.phone,
          amount: tx.amount,
          fee: tx.fee,
          total: tx.total,
          network_id: tx.networkId,
          service_type: tx.serviceType,
          bundle_id: tx.bundleId || null,
          bundle_name: tx.bundleName || null,
          payment_method: tx.paymentMethod,
          reference: tx.reference,
          status: tx.status
        })
        .select()
        .single();

      if (error) throw error;
      console.log('Transaction saved to Supabase');
    } catch (err) {
      console.error('Supabase save transaction error, saving locally:', err);
    }
  }

  // Local storage save
  try {
    const saved = localStorage.getItem('unigo_transactions');
    const list: Transaction[] = saved ? JSON.parse(saved) : [];
    const newList = [tx, ...list];
    localStorage.setItem('unigo_transactions', JSON.stringify(newList));
  } catch (e) {
    console.error(e);
  }

  return tx;
}

// User Profile / Authentication
export async function dbRegisterUser(user: RegisteredUser): Promise<RegisteredUser> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      // Create user entry in custom profile table
      const { error } = await supabase
        .from('unigo_users')
        .insert({
          id: user.id,
          phone_number: user.phone,
          full_name: user.fullName,
          city: user.city,
          account_type: user.accountType,
          balance: user.balance,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      console.log('User profile registered in Supabase');
    } catch (err) {
      console.error('Supabase user register error, using local:', err);
    }
  }

  // Local save
  localStorage.setItem('unigo_user', JSON.stringify(user));
  return user;
}

export async function dbUpdateUserBalance(userId: string, newBalance: number): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('unigo_users')
        .update({ balance: newBalance })
        .eq('id', userId);

      if (error) throw error;
      console.log('User balance updated on Supabase');
    } catch (err) {
      console.error('Supabase balance update error:', err);
    }
  }

  // Local sync
  try {
    const saved = localStorage.getItem('unigo_user');
    if (saved) {
      const user = JSON.parse(saved);
      if (user.id === userId) {
        user.balance = newBalance;
        localStorage.setItem('unigo_user', JSON.stringify(user));
      }
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * Returns instructions to help the developer configure Supabase tables.
 */
export const SUPABASE_SETUP_SQL = `-- CRÉATION DES TABLES POUR UNIGO SUR SUPABASE

-- 1. Table des utilisateurs / profils
CREATE TABLE IF NOT EXISTS public.unigo_users (
    id TEXT PRIMARY KEY,
    phone_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    city TEXT NOT NULL,
    account_type TEXT NOT NULL,
    balance NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Activez RLS
ALTER TABLE public.unigo_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Accès public" ON public.unigo_users FOR ALL USING (true);

-- 2. Table des transactions
CREATE TABLE IF NOT EXISTS public.unigo_transactions (
    id TEXT PRIMARY KEY,
    phone TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    fee NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    network_id TEXT NOT NULL,
    service_type TEXT NOT NULL,
    bundle_id TEXT,
    bundle_name TEXT,
    payment_method TEXT NOT NULL,
    reference TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Activez RLS
ALTER TABLE public.unigo_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Accès public" ON public.unigo_transactions FOR ALL USING (true);
`;
