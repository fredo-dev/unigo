/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NetworkId, PaymentMethodId, TelecomBundle, Transaction, RegisteredUser } from './types';
import { TELECOM_NETWORKS, TELECOM_BUNDLES, PAYMENT_OPERATORS, MOCK_TESTIMONIALS, FAQ_ITEMS } from './data';
import PaymentModal from './components/PaymentModal';
import Receipt from './components/Receipt';
import FeeCalculator from './components/FeeCalculator';
import RegistrationForm from './components/RegistrationForm';
import ProviderLogo from './components/ProviderLogo';
import AdBanners from './components/AdBanners';
import MobileAppModal from './components/MobileAppModal';
import SettingsModal from './components/SettingsModal';
import CadeauQuizModal from './components/CadeauQuizModal';
import UnigoQRCard from './components/UnigoQRCard';
import VoiceAssistantBot from './components/VoiceAssistantBot';
import { 
  dbGetTransactions, 
  dbSaveTransaction, 
  dbRegisterUser, 
  dbUpdateUserBalance, 
  isSupabaseConfigured,
  SUPABASE_SETUP_SQL 
} from './lib/supabase';
import { secureStorage, activateSecurityShields } from './lib/security';

import { 
  Smartphone, Check, Wifi, PhoneCall, ArrowRight, History, 
  Sparkles, Search, Briefcase, ChevronRight, Code, LogOut, UserCheck,
  ShieldCheck, TrendingUp, HelpCircle, Apple, Play, Download, ExternalLink, Info, Database,
  Settings
} from 'lucide-react';

export default function App() {
  // Navigation tabs - locked to client-only in production
  const viewMode = 'client';

  // Activate advanced security code protection shields and responsive layout scaling on mount
  useEffect(() => {
    activateSecurityShields();
  }, []);

  // User session & simulated balance states
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(() => {
    try {
      const saved = secureStorage.getItem('unigo_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  
  // Client mode state
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkId>('orange');
  const [serviceType, setServiceType] = useState<'airtime' | 'bundle'>('airtime');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [airtimeAmount, setAirtimeAmount] = useState('');
  const [selectedBundle, setSelectedBundle] = useState<TelecomBundle | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('wave');
  const [phoneError, setPhoneError] = useState('');
  
  // Bundle filters
  const [bundleTag, setBundleTag] = useState<'all' | 'internet' | 'calls' | 'mixte'>('all');
  const [bundleSearch, setBundleSearch] = useState('');

  // Payment popup state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [isMobileAppModalOpen, setIsMobileAppModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCadeauQuizOpen, setIsCadeauQuizOpen] = useState(false);
  const [lastSubscriptionAmount, setLastSubscriptionAmount] = useState<number>(1000);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return secureStorage.getItem('unigo_dark_mode') === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      secureStorage.setItem('unigo_dark_mode', String(next));
      return next;
    });
  };

  // Local storage & Supabase transaction database
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const data = await dbGetTransactions();
      if (data && data.length > 0) {
        setTransactions(data);
      } else {
        // Seed default history items for visual showcase on first launch
        const defaultTxs: Transaction[] = [
          {
            id: 'UG-849102-ORA',
            date: new Date(Date.now() - 3600000 * 2).toLocaleString('fr-FR'),
            phone: '07 58 49 10 32',
            amount: 2000,
            fee: 20,
            total: 2020,
            networkId: 'orange',
            serviceType: 'bundle',
            bundleId: 'org-hebdo-1',
            bundleName: 'Maxi Mixte Hebdo',
            paymentMethod: 'wave',
            reference: 'UG-849102-ORA',
            status: 'success'
          },
          {
            id: 'UG-109284-MTN',
            date: new Date(Date.now() - 3600000 * 24).toLocaleString('fr-FR'),
            phone: '05 06 45 12 99',
            amount: 5000,
            fee: 50,
            total: 5050,
            networkId: 'mtn',
            serviceType: 'airtime',
            paymentMethod: 'mtn_momo',
            reference: 'UG-109284-MTN',
            status: 'success'
          }
        ];
        setTransactions(defaultTxs);
        secureStorage.setItem('unigo_transactions', JSON.stringify(defaultTxs));
      }
    };
    fetchTransactions();
  }, []);

  // Synchronise phone number and autoselect network when user logs in
  useEffect(() => {
    if (currentUser && currentUser.phone) {
      const cleanPhone = currentUser.phone.replace(/\D/g, '');
      setPhoneNumber(cleanPhone);
      
      if (cleanPhone.length >= 2) {
        const prefix2 = cleanPhone.substring(0, 2);
        if (['07', '08', '09'].includes(prefix2)) {
          setSelectedNetwork('orange');
        } else if (['05', '04', '06'].includes(prefix2)) {
          setSelectedNetwork('mtn');
        } else if (['01', '02', '03'].includes(prefix2)) {
          setSelectedNetwork('moov');
        }
      }
    }
  }, [currentUser]);

  // Network prefix automatic matching
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Format numeric input
    const cleanPhone = rawVal.replace(/\D/g, '');
    setPhoneNumber(cleanPhone);

    if (cleanPhone.length >= 2) {
      const prefix2 = cleanPhone.substring(0, 2);
      if (['07', '08', '09'].includes(prefix2)) {
        setSelectedNetwork('orange');
        setPhoneError('');
      } else if (['05', '04', '06'].includes(prefix2)) {
        setSelectedNetwork('mtn');
        setPhoneError('');
      } else if (['01', '02', '03'].includes(prefix2)) {
        setSelectedNetwork('moov');
        setPhoneError('');
      } else {
        setPhoneError("Préfixe inconnu. En Côte d'Ivoire: Orange commence par 07/08/09, MTN par 05/04/06, Moov par 01/02/03.");
      }
    } else {
      setPhoneError('');
    }
  };

  // Switch network reset
  const handleNetworkSelect = (networkId: NetworkId) => {
    setSelectedNetwork(networkId);
    setSelectedBundle(null);
    
    // Auto populate realistic placeholder prefix to guide user
    const samplePrefix = networkId === 'orange' ? '07' : networkId === 'mtn' ? '05' : '01';
    if (phoneNumber.length < 2) {
      setPhoneNumber(samplePrefix);
    }
  };

  const handleBundleSelect = (bundle: TelecomBundle) => {
    setSelectedBundle(bundle);
  };

  // Calculation parameters
  const getTransferAmount = () => {
    if (serviceType === 'bundle') {
      return selectedBundle ? selectedBundle.price : 0;
    }
    return Math.max(0, parseInt(airtimeAmount) || 0);
  };

  const getTransferFee = () => {
    if (paymentMethod === 'wallet') return 0;
    // 1% typical operator billing standard on payment platforms in Côte d'Ivoire
    return Math.round(getTransferAmount() * 0.01);
  };

  const getTransferTotal = () => {
    return getTransferAmount() + getTransferFee();
  };

  // Format Helper for Phone Numbers Display
  const formatPhoneSpacing = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.length === 10) {
      return `${clean.substring(0, 2)} ${clean.substring(2, 4)} ${clean.substring(4, 6)} ${clean.substring(6, 8)} ${clean.substring(8, 10)}`;
    }
    return num;
  };

  // Order submission validation
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    // Validation du numéro de téléphone ivoirien (10 chiffres)
    if (phoneNumber.length !== 10) {
      setPhoneError("Un numéro valide en Côte d'Ivoire doit comporter exactement 10 chiffres.");
      return;
    }

    // Validation du montant
    const finalAmount = getTransferAmount();
    if (finalAmount <= 0) {
      setPhoneError(serviceType === 'airtime'
        ? "Veuillez spécifier un montant de crédit valide."
        : "Veuillez sélectionner un forfait télécom dans le catalogue ci-dessous."
      );
      return;
    }

    if (serviceType === 'airtime' && finalAmount < 100) {
      setPhoneError("Le montant minimum d'envoi d'unités est de 100 FCFA.");
      return;
    }

    if (paymentMethod === 'wallet') {
      if (!currentUser) {
        setPhoneError("Veuillez vous inscrire ou vous connecter pour régler via votre portefeuille Unigo.");
        return;
      }
      if (currentUser.balance < getTransferTotal()) {
        setPhoneError(`Solde insuffisant dans votre portefeuille Unigo. Requis: ${getTransferTotal().toLocaleString()} FCFA, Disponible: ${currentUser.balance.toLocaleString()} FCFA.`);
        return;
      }
    }

    // Si tout est valide, on ouvre la fenêtre de paiement
    setIsPaymentOpen(true);
  };

  // Gestion du succès du paiement après validation de la modale
  const handlePaymentSuccess = async (reference: string) => {
    setIsPaymentOpen(false);
    
    // Initialisation simple et séquentielle pour éviter les conflits d'accolades à la ligne 271-282
    let targetBundleId = '';
    let targetBundleName = '';

    if (serviceType === 'bundle') {
      targetBundleId = selectedBundle?.id || '';
      targetBundleName = selectedBundle?.name || '';
    }

