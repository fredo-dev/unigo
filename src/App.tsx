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

  // Order submission validation
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    // CI Phone plan validate (Exactly 10 digits as of 2021 update)
    if (phoneNumber.length !== 10) {
      setPhoneError("Un numéro valide en Côte d'Ivoire doit comporter exactement 10 chiffres.");
      return;
    }

    // Amount validate
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

    // Fire payment modal simulation
    setIsPaymentOpen(true);
  };

  // Handle Simulated success callback from payments
  const handlePaymentSuccess = async (ref: string) => {
    setIsPaymentOpen(false);
    
    const newTx: Transaction = {
      id: ref,
      date: new Date().toLocaleString('fr-FR'),
      phone: formatPhoneSpacing(phoneNumber),
      amount: getTransferAmount(),
      fee: getTransferFee(),
      total: getTransferTotal(),
      networkId: selectedNetwork,
      serviceType: serviceType,
      bundleId: serviceType === 'bundle' ? selectedBundle?.id : undefined,
      bundleName: serviceType === 'bundle' ? selectedBundle?.name : undefined,
      paymentMethod: paymentMethod,
      reference: ref,
      status: 'success'
    };

    if (paymentMethod === 'wallet' && currentUser) {
      const newBal = Math.max(0, currentUser.balance - getTransferTotal());
      const updatedUser = {
        ...currentUser,
        balance: newBal
      };
      localStorage.setItem('unigo_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      await dbUpdateUserBalance(currentUser.id, newBal);
    }

    // Save transaction via DB api (automatically syncs with Supabase if configured)
    await dbSaveTransaction(newTx);
    
    // Reload transaction list
    const updatedList = await dbGetTransactions();
    setTransactions(updatedList);
    setActiveReceipt(newTx);
    
    // Set dynamic last subscription amount & trigger the Cadeau Quiz Modal
    setLastSubscriptionAmount(getTransferAmount());
    setIsCadeauQuizOpen(true);
    
    // Clear form fields
    if (serviceType === 'airtime') {
      setAirtimeAmount('');
    }
  };

  const handleRewardWon = async (rewardAmount: number) => {
    if (currentUser) {
      const newBal = currentUser.balance + rewardAmount;
      const updatedUser = {
        ...currentUser,
        balance: newBal
      };
      secureStorage.setItem('unigo_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      await dbUpdateUserBalance(currentUser.id, newBal);
    }
  };

  const handlePaymentFailed = (reason: string) => {
    console.error("Échec du paiement :", reason);
  };

  const handleSelectRecipient = (phone: string, operator: 'orange' | 'mtn' | 'moov' | 'wave', name: string) => {
    setPhoneNumber(phone);
    if (operator === 'orange' || operator === 'mtn' || operator === 'moov') {
      setSelectedNetwork(operator);
    } else if (operator === 'wave') {
      setSelectedNetwork('orange');
    }
    
    // Auto-select corresponding payment method
    if (operator === 'orange') setPaymentMethod('orange_money');
    else if (operator === 'mtn') setPaymentMethod('mtn_momo');
    else if (operator === 'moov') setPaymentMethod('moov_money');
    else if (operator === 'wave') setPaymentMethod('wave');
  };

  // Helpers for displaying formatting
  const formatPhoneSpacing = (str: string) => {
    const raw = str.replace(/\D/g, '');
    if (raw.length === 10) {
      return `${raw.substring(0, 2)} ${raw.substring(2, 4)} ${raw.substring(4, 6)} ${raw.substring(6, 8)} ${raw.substring(8, 10)}`;
    }
    return str;
  };

  // Filtered list of bundles based on selected network & filters
  const filteredBundles = TELECOM_BUNDLES.filter(bundle => {
    if (bundle.networkId !== selectedNetwork) return false;
    
    if (bundleTag !== 'all' && bundle.tag !== bundleTag) return false;
    
    if (bundleSearch) {
      const q = bundleSearch.toLowerCase();
      return bundle.name.toLowerCase().includes(q) || 
             bundle.dataVolume.toLowerCase().includes(q) || 
             bundle.description.toLowerCase().includes(q) ||
             bundle.price.toString().includes(q);
    }
    return true;
  });

  const activeNetworkInfo = TELECOM_NETWORKS.find(n => n.id === selectedNetwork);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50/40 via-zinc-50 to-amber-50/40 geometric-grid font-sans text-zinc-900 flex flex-col antialiased transition-colors duration-300 ${isDarkMode ? 'dark-mode-container bg-zinc-950 text-zinc-100' : ''}`}>
      {/* Dynamic Header Banner Bar (Geometric Balance architecture) */}
      <header className="bg-zinc-900 border-b-2 border-orange-500 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveReceipt(null)}>
            <div className="relative logo-box h-11 w-11 bg-gradient-to-br from-zinc-900 via-zinc-950 to-neutral-900 border border-zinc-800 flex items-center justify-center rounded-xl shadow-[3px_3px_0px_0px_rgba(249,115,22,1)] transform hover:translate-y-[1px] transition-all overflow-hidden shrink-0">
              {/* Côte d'Ivoire flag top accent */}
              <div className="absolute top-0 inset-x-0 h-[3.5px] flex">
                <div className="w-1/3 bg-[#f77f00]" />
                <div className="w-1/3 bg-white" />
                <div className="w-1/3 bg-[#2ec4b6]" />
              </div>
              <span className="text-amber-400 font-extrabold text-sm font-display tracking-wider mt-[2px]">CI</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-white tracking-tight flex items-baseline">
                unigo<span className="text-amber-400 font-black">.ci</span>
              </h1>
              <span className="text-[10px] text-zinc-400 font-semibold font-mono block uppercase tracking-wider">
                Recharges Côte d'Ivoire
              </span>
            </div>
          </div>

          {/* User Account or Registration button */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Paramètres Settings Cog */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-amber-400 rounded-xl border border-zinc-800 transition-all flex items-center justify-center cursor-pointer shadow-md active:scale-95"
              title="Paramètres & Réglages Unigo"
            >
              <Settings className="h-4.5 w-4.5 animate-spin" style={{ animationDuration: '20s' }} />
            </button>

            {currentUser ? (
              <div id="logged-user-hud" className="flex items-center space-x-3 bg-zinc-950 p-[5px] pl-3 pr-2.5 rounded-xl border border-zinc-855">
                <div className="flex flex-col text-right">
                  <span className="text-[11px] font-bold text-white leading-normal font-display">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[9px] text-amber-400 font-mono font-bold leading-none mt-0.5">
                    {currentUser.accountType === 'agent' ? '💼 REVENDEUR' : '👤 COMPTE'} &bull; {currentUser.balance.toLocaleString()} F
                  </span>
                </div>
                <div 
                  className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-base cursor-pointer hover:scale-105 transition-all shadow-md shrink-0 select-none" 
                  onClick={() => setIsSettingsOpen(true)}
                  title="Modifier mon profil & mon avatar"
                >
                  {currentUser.avatar === 'armand' && '🧑‍💻'}
                  {currentUser.avatar === 'awa' && '👩‍🍳'}
                  {currentUser.avatar === 'sekou' && '🧑‍💼'}
                  {currentUser.avatar === 'mariam' && '👩‍🎓'}
                  {currentUser.avatar === 'lion' && '🦁'}
                  {currentUser.avatar === 'elephant' && '🐘'}
                  {currentUser.avatar === 'ananas' && '🍍'}
                  {currentUser.avatar === 'cacao' && '🥥'}
                  {!currentUser.avatar && currentUser.fullName.substring(0, 2).toUpperCase()}
                </div>
                <button 
                  onClick={() => {
                    secureStorage.removeItem('unigo_user');
                    setCurrentUser(null);
                    setPaymentMethod('wave');
                  }}
                  className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 rounded transition-colors cursor-pointer"
                  title="Déconnexion"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-open-register"
                onClick={() => setIsRegistrationOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 hover:from-amber-305 hover:to-amber-400 font-bold font-display tracking-wide text-xs rounded-xl transition-all flex items-center space-x-1.5 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)] hover:scale-102 cursor-pointer"
              >
                <UserCheck className="h-3.5 w-3.5 shrink-0" />
                <span>S'inscrire</span>
              </button>
            )}

            {/* Quick status (Abidjan local time indicator) */}
            <div className="hidden lg:flex items-center space-x-2 text-[9px] font-mono text-zinc-400 uppercase tracking-wider bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>CI &bull; Actif</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Visual Accent Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-zinc-950 to-orange-950 text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden flex-none border-b border-orange-500/20">
        <div className="absolute inset-0 opacity-[0.04] space-y-4 geometric-grid pointer-events-none"></div>
        {/* Glowing visual blobs for high color vibrancy */}
        <div className="absolute -top-12 -left-12 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative max-w-4xl mx-auto space-y-5">
          <div className="inline-flex items-center space-x-2 bg-zinc-900/90 rounded-full py-1.5 px-3 border border-orange-500/30 text-[11px] text-zinc-200 font-mono shadow-sm">
            {isSupabaseConfigured() ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="uppercase tracking-wider">Base de données Supabase Connectée</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                <span className="uppercase tracking-wider">Mode Production (Persistance Locale Active)</span>
              </>
            )}
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight leading-none text-white uppercase">
            Vos transferts télécoms <br /> En Côte d’Ivoire, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 font-black">Instantanés</span>
          </h2>
          
          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Achetez du crédit de communication ou vos forfaits internet Orange, MTN et Moov en quelques secondes. Payez en toute sécurité par Wave ou Mobile Money.
          </p>

          {/* App Store & Google Play download links */}
          <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
            <button 
              onClick={() => setIsMobileAppModalOpen(true)}
              className="hover:scale-105 active:scale-95 transition-all cursor-pointer select-none duration-250 shrink-0"
              aria-label="Télécharger Unigo sur l'App Store"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                alt="Télécharger dans l'App Store" 
                className="h-[42px] object-contain rounded-lg shadow-md"
                referrerPolicy="no-referrer"
              />
            </button>
            
            <button 
              onClick={() => setIsMobileAppModalOpen(true)}
              className="hover:scale-105 active:scale-95 transition-all cursor-pointer select-none duration-250 shrink-0"
              aria-label="Disponible sur Google Play"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                alt="Disponible sur Google Play" 
                className="h-[42px] object-contain rounded-lg shadow-md"
                referrerPolicy="no-referrer"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="space-y-12">

            {/* Dynamic Welcome & Registration CTA block */}
            {!currentUser && (
              <div id="registration-alert-banner" className="bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 border border-zinc-950 text-white rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
                <div className="space-y-2 text-left relative z-10 max-w-xl">
                  <div className="inline-flex items-center space-x-1.5 bg-amber-400 text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-display">
                    <Sparkles className="h-3 w-3" />
                    <span>Offre Akwaba 2026</span>
                  </div>
                  <h3 className="text-base md:text-lg font-bold font-display tracking-tight text-zinc-100 uppercase">
                    Obtenez <span className="text-amber-400">200 FCFA Offerts</span> sur votre premier envoi !
                  </h3>
                  <p className="text-xs text-zinc-400 leading-normal">
                    Inscrivez-vous gratuitement pour activer votre portefeuille virtuel Unigo, sauvegarder vos contacts favoris et éviter les frais d’opérateurs supplémentaires en Côte d'Ivoire.
                  </p>
                </div>
                
                <button
                  onClick={() => setIsRegistrationOpen(true)}
                  className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold font-display tracking-wider text-xs rounded-xl shadow-lg hover:scale-103 transition-all cursor-pointer whitespace-nowrap col-span-1 border-0"
                >
                  Créer mon Compte maintenant
                </button>
              </div>
            )}

            {currentUser && (
              <div id="user-welcome-hud" className="bg-white border border-zinc-200 rounded-2xl p-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm text-left">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 bg-zinc-900 text-amber-400 border border-zinc-800 flex items-center justify-center rounded-lg font-bold font-mono">
                    {currentUser.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 font-display flex items-center gap-1.5">
                      <span>Ravi de vous revoir, {currentUser.fullName} !</span>
                      <span className="text-xs font-normal text-zinc-400 font-sans italic bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                        {currentUser.accountType === 'agent' ? '💼 Revendeur Pro' : '👤 Client Premium'}
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Ville de résidence : <strong>{currentUser.city}</strong> &bull; Membre depuis le {currentUser.dateJoined}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-semibold block">Votre Portefeuille</span>
                    <span className="font-mono font-black text-zinc-900 text-base">{currentUser.balance.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* If an active receipt is being displayed, show it prominently */}
            {activeReceipt ? (
              <div className="space-y-4">
                <div className="max-w-md mx-auto flex items-center justify-between px-4">
                  <span className="text-xs text-slate-500">Reçu de transaction Unigo</span>
                  <button 
                    id="close-receipt-view"
                    onClick={() => setActiveReceipt(null)} 
                    className="text-xs font-bold text-slate-800 hover:underline flex items-center space-x-1"
                  >
                    <span>&larr; Retour au formulaire</span>
                  </button>
                </div>
                <Receipt 
                  transaction={activeReceipt} 
                  onNewTransaction={() => setActiveReceipt(null)} 
                />
              </div>
            ) : (
              <div className="space-y-8 animate-scale-up">
                {/* PUBLICITÉS INTERACTIVES TYPE FINTECH (WAVE, ORANGE, MTN, MOOV) */}
                <AdBanners 
                  onSelectMethod={(method) => setPaymentMethod(method)} 
                  onSelectNetwork={(network) => setSelectedNetwork(network)} 
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT: Central formulation & selector tool - occupies 7 cols */}
                {!currentUser ? (
                  <div className="lg:col-span-7 bg-white rounded-2xl p-8 md:p-10 border border-zinc-200/85 relative overflow-hidden flex flex-col items-center justify-center text-center space-y-6 min-h-[520px] geometric-card-shadow">
                    <div className="absolute top-0 right-0 p-3.5 bg-amber-500/10 border-b border-l border-amber-500/20 rounded-bl-xl text-amber-500 font-bold uppercase text-[9px] font-mono flex items-center space-x-1">
                      <span className="h-2 w-2 bg-amber-500 rounded-full animate-ping"></span>
                      <span>Accès Restreint</span>
                    </div>

                    <div className="p-5 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 shadow-md animate-bounce">
                      <ShieldCheck className="h-10 w-10" />
                    </div>

                    <div className="space-y-3.5 max-w-md">
                      <h3 className="text-xl font-extrabold text-zinc-900 uppercase font-display tracking-tight leading-tight">Inscription Requise</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Pour effectuer des demandes de transfert d'unités ou souscrire à des forfaits Orange, MTN et Moov sur Unigo, vous devez d'abord vous inscrire ou vous connecter.
                      </p>
                      <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl text-left text-zinc-500 space-y-2 font-sans leading-relaxed">
                        <div>
                          <p className="text-[11.5px] font-bold text-zinc-850 flex items-center gap-1.5">
                            <span className="text-amber-500">🎁</span> Bonus d'Akwaba de Bienvenue :
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            Inscrivez-vous maintenant et recevez automatiquement <strong>200 FCFA</strong> offerts sur votre solde de départ !
                          </p>
                        </div>
                        <div className="border-t border-zinc-200/60 pt-2">
                          <p className="text-[11.5px] font-bold text-zinc-850 flex items-center gap-1.5">
                            <span className="text-orange-500">🧠</span> Quiz Cadeaux de Fidélité :
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            Après chaque achat, répondez à une question amusante de maths, cuisine ivoirienne ou histoire de la Côte d'Ivoire pour gagner jusqu'à <strong>500 FCFA</strong> de cash direct !
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm pt-2">
                      <button
                        onClick={() => setIsRegistrationOpen(true)}
                        className="flex-1 py-3.5 bg-zinc-950 hover:bg-zinc-850 text-white rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 border-0"
                      >
                        Créer un Compte
                      </button>
                      <button
                        onClick={() => setIsRegistrationOpen(true)}
                        className="flex-1 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer border border-zinc-200 active:scale-95"
                      >
                        Se Connecter
                      </button>
                    </div>
                  </div>
                ) : (
                  <div id="transfer-section" className="lg:col-span-7 bg-white rounded-xl p-6 md:p-8 border border-zinc-200/85 space-y-8 flex flex-col justify-between geometric-card-shadow">
                  
                  {/* Phase header */}
                  <div className="space-y-1 text-left border-b border-zinc-100 pb-5">
                    <h3 className="text-lg font-bold font-display text-zinc-900 tracking-tight flex items-center space-x-2">
                      <span className={`text-xs py-1 px-2.5 rounded font-black font-mono text-white transition-all duration-300 ${
                        selectedNetwork === 'orange' ? 'bg-orange-500' : selectedNetwork === 'mtn' ? 'bg-amber-500' : selectedNetwork === 'moov' ? 'bg-emerald-500' : 'bg-zinc-900'
                      }`}>01</span>
                      <span className="uppercase tracking-wide">Formulaire d'Envoi</span>
                    </h3>
                    <p className="text-xs text-zinc-400">Sélectionnez le réseau mobile local, composez le numéro 10 chiffres et complétez les détails.</p>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    
                    {/* A. Selector of telecom providers (Orange / MTN / Moov with official colours and logs) */}
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider block text-left">01. Réseau Mobile Télécom</label>
                      <div className="grid grid-cols-3 gap-3">
                        {TELECOM_NETWORKS.map((net) => {
                          const isActive = selectedNetwork === net.id;
                          let activeClasses = "";
                          if (net.id === 'orange') activeClasses = "border-orange-500 bg-orange-50/80 text-orange-950 shadow-lg ring-2 ring-orange-500/40";
                          else if (net.id === 'mtn') activeClasses = "border-amber-500 bg-amber-50/80 text-amber-950 shadow-lg ring-2 ring-amber-500/40";
                          else if (net.id === 'moov') activeClasses = "border-emerald-500 bg-emerald-50/80 text-emerald-950 shadow-lg ring-2 ring-emerald-500/40";

                          return (
                            <button
                              id={`net-select-${net.id}`}
                              key={net.id}
                              type="button"
                              onClick={() => handleNetworkSelect(net.id)}
                              className={`p-4 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center space-y-2 relative focus:outline-none transform hover:scale-102 duration-200 ${
                                isActive 
                                  ? activeClasses 
                                  : 'border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50/80 hover:border-zinc-200 text-zinc-650 hover:text-zinc-900'
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                                <ProviderLogo id={net.id} className="w-12 h-12" />
                              </div>
                              <span className="text-xs font-black font-display leading-tight">{net.name}</span>
                              
                              {/* Checkmark icon to reflect active */}
                              {isActive && (
                                <span className={`absolute -top-1.5 -right-1.5 h-6 w-6 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md ${
                                  net.id === 'orange' ? 'bg-orange-500' : net.id === 'mtn' ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}>
                                  <Check className="h-3.5 w-3.5 stroke-[3.5]" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* B. Service Toggle: Airtime Units vs Bunldes */}
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider block text-left">02. Type de Recharge</label>
                      <div className="grid grid-cols-2 gap-1.5 bg-zinc-150 bg-zinc-100 p-1.5 rounded-xl border border-zinc-200">
                        <button
                          id="toggle-service-airtime"
                          type="button"
                          onClick={() => setServiceType('airtime')}
                          className={`py-2.5 px-3 rounded-lg text-xs font-black font-display transition-all flex items-center justify-center space-x-1.5 ${
                            serviceType === 'airtime' 
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md border border-orange-400' 
                              : 'text-zinc-650 hover:text-zinc-950 font-bold'
                          }`}
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                          <span>Crédit d'appel (Unités)</span>
                        </button>

                        <button
                          id="toggle-service-bundle"
                          type="button"
                          onClick={() => setServiceType('bundle')}
                          className={`py-2.5 px-3 rounded-lg text-xs font-black font-display transition-all flex items-center justify-center space-x-1.5 ${
                            serviceType === 'bundle' 
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md border border-orange-400' 
                              : 'text-zinc-650 hover:text-zinc-950 font-bold'
                          }`}
                        >
                          <Wifi className="h-3.5 w-3.5" />
                          <span>Souscription Forfaits</span>
                        </button>
                      </div>
                    </div>

                    {/* C. Phone Number widget with local Ivory Coast prefix detect notifications */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider text-left block">
                          03. Numéro Bénéficiaire Côte d'Ivoire
                        </label>
                        <span className="text-[10px] text-zinc-400 font-mono">10 chiffres</span>
                      </div>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-semibold font-mono">
                          🇨🇮 +225
                        </span>
                        
                        <input
                          id="input-phone-number"
                          type="tel"
                          placeholder="Ex: 07 48 59 10 32"
                          maxLength={10}
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          className="w-full text-base font-mono font-bold pl-16 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 focus:bg-white text-zinc-900 transition-all placeholder:font-sans placeholder:font-normal"
                          required
                        />

                        {phoneNumber.length >= 2 && !phoneError && activeNetworkInfo && (
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-900 capitalize flex items-center space-x-1.5 bg-zinc-100 p-1 pr-2 rounded border border-zinc-200">
                            <ProviderLogo id={selectedNetwork} className="w-5 h-5 rounded-sm" />
                            <span className="text-[10px] text-zinc-650 font-display font-bold">{selectedNetwork}</span>
                          </span>
                        )}
                      </div>

                      {/* Display validation assistance or warnings */}
                      {phoneError ? (
                        <p id="phone-error-alert" className="text-xs text-rose-500 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg text-left font-medium">
                          ⚠️ {phoneError}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 text-left">
                          Le système détecte le bon opérateur selon le préfixe. Saisissez <strong>07</strong> pour Orange, <strong>05</strong> pour MTN, ou <strong>01</strong> pour Moov.
                        </p>
                      )}
                    </div>

                    {/* D1. IF AIRTIME -> show direct amount inputs */}
                    {serviceType === 'airtime' && (
                      <div className="space-y-4 text-left">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider block">04. Montant du Transfert (FCFA)</label>
                          <div className="relative">
                            <input
                              id="input-airtime-amount"
                              type="number"
                              min={100}
                              max={100000}
                              placeholder="Entrez le montant de crédit"
                              value={airtimeAmount}
                              onChange={(e) => setAirtimeAmount(e.target.value)}
                              className="w-full text-base font-mono font-bold bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-900 focus:bg-white text-zinc-900 placeholder:text-sm placeholder:font-normal"
                              required={serviceType === 'airtime'}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400 text-xs font-mono">
                              FCFA
                            </span>
                          </div>
                        </div>

                        {/* Quick preset chips */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] text-zinc-400 font-medium block">Raccourcis de recharge d'unités :</span>
                          <div className="flex flex-wrap gap-2">
                            {[200, 500, 1000, 2000, 5000].map(pkgAmt => (
                              <button
                                key={pkgAmt}
                                type="button"
                                onClick={() => setAirtimeAmount(pkgAmt.toString())}
                                className="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded text-xs font-mono font-bold text-zinc-700 transition-colors"
                              >
                                {pkgAmt} FCFA
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* D2. IF BUNDLE -> show selected bundle card preview and direct selector */}
                    {serviceType === 'bundle' && (
                      <div className="space-y-4 text-left">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider block">04. Choix du Forfait Mobile ({activeNetworkInfo?.name})</label>
                          
                          <select
                            id="select-bundle-dropdown"
                            value={selectedBundle?.id || ''}
                            onChange={(e) => {
                              const b = TELECOM_BUNDLES.find(x => x.id === e.target.value);
                              setSelectedBundle(b || null);
                            }}
                            className="w-full text-sm font-medium bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-900 focus:bg-white text-zinc-900 transition-all cursor-pointer"
                          >
                            <option value="">-- Sélectionnez un forfait directement ici --</option>
                            {TELECOM_BUNDLES.filter(b => b.networkId === selectedNetwork).map(b => (
                              <option key={b.id} value={b.id}>
                                {b.name} — {b.price.toLocaleString()} FCFA ({b.dataVolume || b.minutesVolume} | {b.validity})
                              </option>
                            ))}
                          </select>

                          {selectedBundle ? (
                            <div className="p-4 bg-zinc-950 text-white border border-zinc-900 rounded-lg flex items-center justify-between relative shadow mt-3 animate-scale-up">
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold text-amber-400 font-mono tracking-wider bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                                  {selectedBundle.tag} &bull; {selectedBundle.validity}
                                </span>
                                <h4 className="font-bold text-sm text-zinc-100 font-display mt-1">{selectedBundle.name}</h4>
                                <p className="text-[11px] text-zinc-400 truncate max-w-[250px] sm:max-w-[320px]">
                                  {selectedBundle.description}
                                </p>
                              </div>
                              
                              <div className="text-right pl-4">
                                <span className="text-sm font-extrabold text-white block font-mono">
                                  {selectedBundle.price.toLocaleString()} F
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedBundle(null)}
                                  className="text-[10px] text-rose-400 hover:text-rose-300 underline font-semibold mt-1"
                                >
                                  Retirer
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="outline-dashed outline-1 outline-zinc-300 rounded-lg bg-zinc-50/50 p-4 text-center text-zinc-400 flex flex-col items-center justify-center space-y-1">
                              <span className="text-xs font-medium">Ou cliquez sur un forfait dans le catalogue ci-dessous 👇</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* E. Selection of payment system operator (Wave, Orange, MTN, Moov) */}
                    <div className="space-y-2.5 pt-1 text-left">
                      <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider block">
                        05. Mode de Facturation (Paiement Mobile)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentUser && (
                          <button
                            id="pay-operator-wallet"
                            type="button"
                            onClick={() => setPaymentMethod('wallet')}
                            className={`col-span-1 sm:col-span-2 p-3 rounded-lg border-2 flex items-center justify-between transition-all ${
                              paymentMethod === 'wallet'
                                ? 'border-zinc-950 bg-zinc-50 shadow-sm ring-1 ring-zinc-950'
                                : 'border-zinc-100 bg-zinc-50/40 hover:bg-zinc-50'
                            }`}
                          >
                            <span className="flex items-center space-x-2.5">
                              <ProviderLogo id="wallet" className="w-6 h-6 rounded-md" />
                              <span className="text-xs font-bold font-display text-zinc-805">Portefeuille Unigo ({currentUser.balance.toLocaleString()} FCFA)</span>
                            </span>
                            <span className="text-[10px] text-emerald-600 font-mono font-bold">
                              Frais : 0%
                            </span>
                          </button>
                        )}
                        {PAYMENT_OPERATORS.map((op) => (
                          <button
                            id={`pay-operator-${op.id}`}
                            key={op.id}
                            type="button"
                            onClick={() => setPaymentMethod(op.id)}
                            className={`p-3 rounded-lg border-2 flex items-center justify-between transition-all ${
                              paymentMethod === op.id
                                ? 'border-zinc-950 bg-zinc-50 shadow-sm ring-1 ring-zinc-950'
                                : 'border-zinc-100 bg-zinc-50/40 hover:bg-zinc-50'
                            }`}
                          >
                            <span className="flex items-center space-x-2.5">
                              <ProviderLogo id={op.id} className="w-6 h-6 rounded-md shrink-0" />
                              <span className="text-xs font-bold font-display text-zinc-800">{op.name}</span>
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono font-medium">
                              Frais : 1%
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* F. Summary panel of totals */}
                    {getTransferAmount() > 0 && (
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2 text-xs text-zinc-650 text-left animate-fade-in font-sans">
                        <div className="flex justify-between items-center text-zinc-500">
                          <span>Montant brut crédit :</span>
                          <span className="font-mono font-bold text-zinc-800">{getTransferAmount().toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between items-center text-zinc-500">
                          <span>Frais de passerelle (1%) :</span>
                          <span className="font-mono text-zinc-800">+{getTransferFee().toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-zinc-900 border-t border-zinc-200 pt-2 text-sm">
                          <span>TOTAL DE LA RECHARGE :</span>
                          <span className="text-emerald-600 font-extrabold font-mono">{getTransferTotal().toLocaleString()} FCFA</span>
                        </div>
                      </div>
                    )}

                    {/* Submit checkout activation */}
                    <button
                      id="submit-checkout-btn"
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-extrabold uppercase tracking-widest text-xs shadow-md shadow-orange-500/10 flex items-center justify-center space-x-2 transition-all cursor-pointer font-display hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <span>Simuler l'Envoi Immédiat</span>
                      <ArrowRight className="h-4 w-4 text-white" />
                    </button>

                  </form>
                </div>
              )}

              {/* RIGHT: Auxiliary sections - Fees info, Quick tools and live logs - 5 cols */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-8 flex flex-col justify-between h-full bg-transparent">
                  
                  {/* Fee Calculator Widget */}
                  <FeeCalculator />

                  {/* Unigo Card QR component */}
                  <UnigoQRCard
                    currentUser={currentUser}
                    isDarkMode={isDarkMode}
                    onSelectRecipient={handleSelectRecipient}
                    triggerRegistration={() => setIsRegistrationOpen(true)}
                  />

                  {/* DYNAMIC & PERSUASIVE UNIGO APP DOWNLOAD CAMPAIGN CARD */}
                  <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-neutral-950 border-2 border-amber-500/80 rounded-2xl p-6 text-left relative overflow-hidden text-white shadow-xl geometric-card-shadow">
                    {/* Glowing visual assets */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-500/15 to-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
                    
                    {/* Tiny Côte d'Ivoire decorative flag line on top-left of app card */}
                    <div className="absolute top-0 left-0 w-full h-[3px] flex">
                      <div className="w-1/3 bg-[#f77f00]" />
                      <div className="w-1/3 bg-white" />
                      <div className="w-1/3 bg-[#2ec4b6]" />
                    </div>

                    <div className="space-y-4 relative z-10">
                      {/* Interactive Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-mono tracking-widest text-amber-400 font-extrabold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 inline-block">
                            ⭐ Application Recommandée
                          </span>
                          <h4 className="text-base font-black font-display uppercase tracking-tight text-zinc-100 mt-1">
                            Unigo dans votre Poche !
                          </h4>
                        </div>

                        {/* Interactive floating visual of a phone chip logo */}
                        <div className="shrink-0 h-11 w-11 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center relative shadow-inner animate-pulse">
                          <Smartphone className="h-5 w-5 text-amber-500" />
                          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                        </div>
                      </div>

                      <p className="text-[11.5px] text-zinc-350 leading-relaxed font-sans">
                        Fini la saisie manuelle de longs codes USSD ! Transférez des forfaits et des crédits <strong>Orange, MTN, Moov et Wave</strong> en 5 secondes chrono avec notre application officielle.
                      </p>

                      {/* Engaging Key Value Propositions */}
                      <div className="grid grid-cols-1 gap-2.5 pt-1 text-zinc-300">
                        <div className="flex items-center space-x-2 text-[10.5px]">
                          <div className="p-1 rounded-md bg-emerald-500/15 text-emerald-400">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span><strong>0% Frais Additionnels</strong> - Tarifs officiels garantis</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10.5px]">
                          <div className="p-1 rounded-md bg-amber-500/15 text-amber-400">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span><strong>Suivi SMS Direct</strong> - Notifications instantanées sur chaque achat</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10.5px]">
                          <div className="p-1 rounded-md bg-sky-500/15 text-sky-400">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span><strong>Mode Hors-Ligne</strong> - Vos bénéficiaires enregistrés même sans internet</span>
                        </div>
                      </div>

                      {/* Interactive Visual QR code mockup to invite direct scan-to-install */}
                      <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/85 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="text-[10.5px] font-bold text-white flex items-center gap-1">
                            <span>📱 Installation Ultra-Simple</span>
                          </p>
                          <p className="text-[9.5px] text-zinc-400 leading-normal">
                            Installez comme une PWA ou téléchargez l'APK Android sécurisé en un instant.
                          </p>
                        </div>
                        <div 
                          onClick={() => setIsMobileAppModalOpen(true)}
                          className="shrink-0 bg-white p-1 rounded-lg border border-zinc-700 cursor-pointer hover:scale-105 transition-transform"
                          title="Cliquez pour scanner ou installer"
                        >
                          {/* Mini visual QR pattern for scanning simulation */}
                          <svg className="w-9 h-9 text-zinc-950" viewBox="0 0 100 100" fill="currentColor">
                            <rect x="0" y="0" width="30" height="30" />
                            <rect x="5" y="5" width="20" height="20" fill="white" />
                            <rect x="10" y="10" width="10" height="10" />
                            <rect x="70" y="0" width="30" height="30" />
                            <rect x="75" y="5" width="20" height="20" fill="white" />
                            <rect x="80" y="10" width="10" height="10" />
                            <rect x="0" y="70" width="30" height="30" />
                            <rect x="5" y="75" width="20" height="20" fill="white" />
                            <rect x="10" y="80" width="10" height="10" />
                            <rect x="40" y="40" width="20" height="20" />
                            <rect x="45" y="45" width="10" height="10" fill="white" />
                            {/* Tiny dots */}
                            <rect x="40" y="10" width="10" height="10" />
                            <rect x="10" y="40" width="10" height="10" />
                            <rect x="80" y="80" width="20" height="20" />
                          </svg>
                        </div>
                      </div>

                      <hr className="border-zinc-800/60 my-1" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                        <div className="text-[9.5px] text-zinc-400 font-mono">
                          Statut : <span className="text-emerald-500 font-bold">Disponible</span> &bull; v1.2.0 stable (CIV)
                        </div>

                        <button
                          onClick={() => setIsMobileAppModalOpen(true)}
                          className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-[10.5px] font-extrabold font-display uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-orange-500/10 active:scale-95 cursor-pointer border-0"
                        >
                          <Download className="h-4 w-4 animate-bounce" />
                          <span>Installer Unigo</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Ledger Logs of transaction History */}
                  <div className="bg-white rounded-xl p-6 border border-zinc-200/85 space-y-4 text-left geometric-card-shadow">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                      <div className="flex items-center space-x-2 text-zinc-900">
                        <History className="h-4 w-4 text-zinc-500" />
                        <h3 className="font-bold text-xs uppercase tracking-wider font-display">Historique des transactions</h3>
                      </div>
                      <span className="text-[10px] bg-zinc-100 font-bold px-2 py-0.5 rounded font-mono text-zinc-555 border border-zinc-200/50">
                        {transactions.length} TOTAL
                      </span>
                    </div>

                    {transactions.length === 0 ? (
                      <p className="text-xs text-zinc-400 py-6 text-center font-medium">
                        Aucun transfert n'a encore été effectué. Vos transactions apparaîtront ici.
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-2">
                        {transactions.map(tx => {
                          const net = TELECOM_NETWORKS.find(n => n.id === tx.networkId);
                          return (
                            <div 
                              key={tx.id} 
                              onClick={() => setActiveReceipt(tx)}
                              className="group p-3 bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-100 hover:border-zinc-200 rounded-lg flex items-center justify-between cursor-pointer transition-all"
                            >
                              <div className="space-y-1">
                                <span className="font-mono text-xs font-bold text-zinc-900 leading-none">
                                  {tx.phone}
                                </span>
                                <div className="text-[10px] text-zinc-400 flex items-center space-x-1.5 font-mono uppercase">
                                  <ProviderLogo id={tx.networkId} className="w-3.5 h-3.5 rounded-sm shrink-0" />
                                  <span className="font-display font-black text-zinc-600">{tx.networkId}</span>
                                  <span>&bull;</span>
                                  <span>{tx.date.split(' ')[0]}</span>
                                </div>
                              </div>

                              <div className="text-right flex items-center space-x-2.5">
                                <div>
                                  <span className="text-xs font-extrabold text-zinc-900 block font-mono">
                                    {tx.amount.toLocaleString()} F
                                  </span>
                                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1 py-0.2 rounded font-mono font-bold uppercase tracking-wider block text-center">
                                    {tx.status}
                                  </span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div> {/* Close col split grid */}

              {/* LOWER PORTION: Curated interactive bundles catalog (for serviceType = 'bundle') */}
              {!activeReceipt && (
              <div id="bundles-catalog-section" className="pt-8 space-y-6 text-left border-t border-zinc-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold font-display uppercase tracking-tight text-zinc-900">Catalogue des Forfaits Côte d'Ivoire</h3>
                    <p className="text-xs text-zinc-400">Cliquez sur un forfait pour l'ajouter au formulaire de paiement ci-dessus.</p>
                  </div>

                  {/* Search input to easily search packages */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Rechercher (ex: Giga, Promo)..."
                      value={bundleSearch}
                      onChange={(e) => setBundleSearch(e.target.value)}
                      className="bg-white border border-zinc-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-zinc-950 text-zinc-950 w-full sm:w-64 font-medium"
                    />
                  </div>
                </div>

                {/* Sub-tag filters */}
                <div className="flex flex-wrap gap-1 bg-zinc-100 p-1 rounded-lg w-fit border border-zinc-200/50">
                  {[
                    { id: 'all', title: 'Tous les forfaits' },
                    { id: 'internet', title: 'Data Internet' },
                    { id: 'mixte', title: 'Formules Mixtes (Appel+Data)' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setBundleTag(f.id as any)}
                      className={`px-3.5 py-1.5 rounded text-xs font-bold font-display tracking-wide transition-all ${
                        bundleTag === f.id
                          ? 'bg-zinc-900 text-white shadow-sm border border-zinc-950'
                          : 'text-zinc-505 text-zinc-500 hover:text-zinc-900'
                      }`}
                    >
                      {f.title}
                    </button>
                  ))}
                </div>

                {/* Grid list of catalog packages filtered */}
                {filteredBundles.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-lg border border-zinc-200/80 shadow-sm text-zinc-400 space-y-2">
                    <div className="flex justify-center mb-1">
                      <Search className="h-8 w-8 text-zinc-300" />
                    </div>
                    <p className="text-xs font-semibold">Aucun forfait ne correspond à vos filtres sur le réseau {selectedNetwork}.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBundles.map(bundle => (
                      <div 
                        key={bundle.id}
                        onClick={() => {
                          setServiceType('bundle');
                          handleBundleSelect(bundle);
                          // Smooth scroll back to form
                          document.getElementById('input-phone-number')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`p-5 rounded-lg border-2 cursor-pointer text-left transition-all relative flex flex-col justify-between h-56 geometric-card-shadow-hover ${
                          selectedBundle?.id === bundle.id
                            ? `${activeNetworkInfo?.borderColor} bg-white ring-1 ring-zinc-950 shadow-sm`
                            : 'border-zinc-200 bg-white shadow-sm'
                        }`}
                      >
                        {/* Upper line metadata */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded border border-zinc-200/50">
                              {bundle.validity}
                            </span>
                            <ProviderLogo id={selectedNetwork} className="w-5 h-5 rounded-sm shrink-0" />
                          </div>

                          <h4 className="font-bold text-zinc-900 text-sm font-display leading-tight line-clamp-1">{bundle.name}</h4>
                          <p className="text-xs text-zinc-400 leading-normal line-clamp-2">{bundle.description}</p>
                        </div>

                        {/* Middle detailed attributes */}
                        <div className="py-2 flex items-center gap-3 text-xs text-zinc-650 font-medium font-mono border-t border-zinc-100 mt-2">
                          {bundle.dataVolume && (
                            <span className="flex items-center space-x-1">
                              <span className="text-emerald-650 font-bold">&#10003;</span>
                              <span>{bundle.dataVolume} Web</span>
                            </span>
                          )}
                          {bundle.minutesVolume && (
                            <span className="flex items-center space-x-1">
                              <span className="text-amber-500 font-bold">&#10003;</span>
                              <span>{bundle.minutesVolume} Appel</span>
                            </span>
                          )}
                        </div>

                        {/* Bottom line containing price */}
                        <div className="flex justify-between items-center pt-3 border-t border-zinc-100 mt-2">
                          <span className="text-[9px] text-zinc-400 font-mono">CODE: {bundle.ussdCode}</span>
                          <span className="font-bold text-zinc-900 text-sm font-mono">
                            {bundle.price.toLocaleString()} FCFA
                          </span>
                        </div>

                        {/* Selected badge overlay */}
                        {selectedBundle?.id === bundle.id && (
                          <div className="absolute top-3 right-3 h-5 w-5 bg-zinc-950 text-white rounded-full flex items-center justify-center shadow">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

            {/* L'AVAL INTÉGRATEUR (Features banner checklist) */}
            <section id="marketing-benefits" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left">
              <div className="p-5 bg-white border border-zinc-200 rounded-lg flex items-start space-x-3.5 geometric-card-shadow">
                <span className="p-2 bg-zinc-100 text-zinc-90 w-10 h-10 flex items-center justify-center text-zinc-950 rounded border border-zinc-200">
                  <ShieldCheck className="h-5 w-5 stroke-[2]" />
                </span>
                <div>
                  <h4 className="font-bold text-xs uppercase font-display tracking-wider text-zinc-900">Passerelle de Secours</h4>
                  <p className="text-[11px] text-zinc-500 mt-1">Si le service USSD d'un opérateur s'interrompt, Unigo route automatiquement sur le second grossiste certifié d'Abidjan.</p>
                </div>
              </div>
              
              <div className="p-5 bg-white border border-zinc-200 rounded-lg flex items-start space-x-3.5 geometric-card-shadow">
                <span className="p-2 bg-zinc-100 text-zinc-90 w-10 h-10 flex items-center justify-center text-zinc-950 rounded border border-zinc-200">
                  <PhoneCall className="h-5 w-5 stroke-[2]" />
                </span>
                <div>
                  <h4 className="font-bold text-xs uppercase font-display tracking-wider text-zinc-900">Rapatriement instantané</h4>
                  <p className="text-[11px] text-zinc-500 mt-1">Validation immédiate du crédit d'appel avec un rappel automatique par callback HTTP après virement.</p>
                </div>
              </div>

              <div className="p-5 bg-white border border-zinc-200 rounded-lg flex items-start space-x-3.5 geometric-card-shadow">
                <span className="p-2 bg-zinc-100 text-zinc-90 w-10 h-10 flex items-center justify-center text-zinc-950 rounded border border-zinc-200">
                  <TrendingUp className="h-5 w-5 stroke-[2]" />
                </span>
                <div>
                  <h4 className="font-bold text-xs uppercase font-display tracking-wider text-zinc-900">Gains Grossistes</h4>
                  <p className="text-[11px] text-zinc-500 mt-1">Vous obtenez jusqu'à 4.5% de ristournes mensuelles accumulées sur le volume global de rechargements.</p>
                </div>
              </div>
            </section>

          </div>

      </main>

      {/* REVIEWS & FAQ PANELS */}
      <section className="bg-white border-t border-zinc-200/80 py-16 text-left flex-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Testimonials grid */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold font-display uppercase text-zinc-900 tracking-tight">Utilisateurs Côte d'Ivoire</h3>
              <p className="text-xs text-zinc-400">Ce qu'ils pensent de notre service de recharge de forfaits à Abidjan et Bouaké</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOCK_TESTIMONIALS.map(t => (
                <div key={t.id} className="p-6 bg-zinc-50 rounded-lg border border-zinc-200 space-y-4 flex flex-col justify-between geometric-card-shadow">
                  <p className="text-xs text-zinc-600 leading-relaxed italic">
                    "{t.comment}"
                  </p>
                  <div className="flex items-center space-x-3 pt-3.5 border-t border-zinc-200">
                    <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white text-[11px] font-bold font-display select-none shrink-0 shadow-sm">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold font-display text-xs text-zinc-900">{t.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">{t.role} &bull; {t.city}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Accordion container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-12 border-t border-zinc-200">
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block font-mono">02. Aide & FAQ</span>
              <h3 className="text-2xl font-bold font-display uppercase text-zinc-900 leading-tight">Questions fréquentes Unigo.ci</h3>
              <p className="text-xs text-zinc-500 leading-relaxed text-left">
                Nous avons réuni ici les interrogations les plus fréquentes des internautes de Côte d'Ivoire concernant l'achat de crédit d'appel, de forfaits internet et l'usage de notre plateforme.
              </p>
            </div>

            <div className="lg:col-span-7 divide-y divide-zinc-250 bg-zinc-50 border border-zinc-200 rounded-lg p-6 md:p-8 geometric-card-shadow">
              {FAQ_ITEMS.map((faq, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0">
                  <h4 className="font-bold text-sm text-zinc-900 flex items-center space-x-2 font-display">
                    <HelpCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>{faq.question}</span>
                  </h4>
                  <p className="text-xs text-zinc-500 mt-2 pl-6 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Footer copyright */}
      <footer className="bg-zinc-950 border-t border-zinc-900 text-white py-12 px-4 sm:px-6 lg:px-8 text-center flex-none">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="h-8 w-8 bg-black border border-zinc-800 flex items-center justify-center rounded shadow-[2px_2px_0px_0px_rgba(245,158,11,1)]">
              <span className="text-white font-extrabold text-xs font-display">UG</span>
            </div>
            <span className="text-base font-bold tracking-tight font-display">unigo.ci</span>
          </div>

          <p className="text-[11px] text-zinc-400 max-w-lg mx-auto leading-relaxed">
            &copy; 2026 Unigo Côte d'Ivoire. Tous droits réservés. <br />
            Conçu et développé par <strong className="text-zinc-200">Esso Latte Frédéric</strong>. <br />
            Plateforme d'automatisation sécurisée pour le transfert d'unités de téléphonie mobile et de forfaits internet (Orange CI, MTN CI, Moov Africa).
          </p>

          <div className="flex justify-center space-x-4 text-xs font-semibold text-zinc-400 font-display uppercase tracking-wider">
            <a href="#bundles-catalog-section" className="hover:text-amber-400 transition-colors">Forfaits Populaires</a>
            <span>&bull;</span>
            <a href="#fee-calculator-card" className="hover:text-amber-400 transition-colors">Grille Tarifaire</a>
          </div>
        </div>
      </footer>

      {/* Secure Ivorian payment overlay window */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        phone={formatPhoneSpacing(phoneNumber)}
        amount={getTransferAmount()}
        fee={getTransferFee()}
        total={getTransferTotal()}
        networkName={activeNetworkInfo?.name || ''}
        networkId={selectedNetwork}
        serviceType={serviceType}
        bundle={selectedBundle || undefined}
        paymentMethodId={paymentMethod}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailed={handlePaymentFailed}
      />

      {/* Registration/Auth Modal Overlay */}
      {isRegistrationOpen && (
        <RegistrationForm
          onClose={() => setIsRegistrationOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            setIsRegistrationOpen(false);
          }}
        />
      )}

      {/* Mobile App & PWA Download Modal Portal */}
      <MobileAppModal
        isOpen={isMobileAppModalOpen}
        onClose={() => setIsMobileAppModalOpen(false)}
      />

      {/* Account Settings & Theme Settings Modal Portal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        currentUser={currentUser}
        onLogout={() => {
          secureStorage.removeItem('unigo_user');
          setCurrentUser(null);
          setPaymentMethod('wave');
        }}
        onUpdateUser={setCurrentUser}
      />

      {/* Gamified Cadeau Quiz Modal Overlay */}
      <CadeauQuizModal
        isOpen={isCadeauQuizOpen}
        onClose={() => setIsCadeauQuizOpen(false)}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        onRewardWon={handleRewardWon}
        triggerRegistration={() => setIsRegistrationOpen(true)}
        lastSubscriptionAmount={lastSubscriptionAmount}
      />

      {/* Interactive Unigo Voice Assistant Agent Bot */}
      <VoiceAssistantBot 
        currentUser={currentUser}
        isDarkMode={isDarkMode}
      />

      {/* WhatsApp floating button in case of issues/questions */}
      <a
        href="https://wa.me/2250596742870?text=Bonjour,%20j'ai%20rencontr%C3%A9%20un%20probl%C3%A8me%20ou%20une%20erreur%20avec%20un%20transfert%20sur%20Unigo."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-[0_4px_25px_rgba(16,185,129,0.45)] flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 group border border-emerald-400/20 cursor-pointer"
        title="Assistance WhatsApp : +225 05 96 74 28 70"
      >
        <svg className="w-6 h-6 fill-current shrink-0 animate-pulse" viewBox="0 0 24 24">
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.13-1.347a9.96 9.96 0 0 0 4.88 1.274h.005c5.505 0 9.99-4.478 9.99-9.985 0-2.67-1.037-5.18-2.92-7.062C17.201 3.002 14.69 2 12.012 2zm5.727 14.043c-.315.885-1.543 1.623-2.11 1.734-.51.1-1.173.166-3.37-.745-2.808-1.164-4.604-4.015-4.744-4.202-.14-.187-1.137-1.513-1.137-2.885 0-1.372.715-2.046 1.012-2.35.253-.258.68-.386 1.082-.386.13 0 .247.006.347.01.296.012.443.028.638.497.243.585.83 2.02.9 2.162.071.14.119.305.027.49-.092.185-.138.303-.276.463-.137.16-.29.356-.413.477-.138.136-.282.285-.12.564.163.28.72 1.183 1.544 1.916.824.73 1.517.954 1.791 1.092.274.137.433.114.594-.07.16-.184.68-.79.863-1.063.183-.273.366-.228.617-.137.25.09 1.59.748 1.864.885.275.137.458.206.527.32.068.114.068.663-.247 1.548z" />
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-[150px] transition-all duration-300 ease-out font-bold text-xs whitespace-nowrap font-display">
          Aide WhatsApp
        </span>
      </a>
    </div>
  );
}
