import React, { useState } from 'react';
import { 
  X, Settings, Moon, Sun, RefreshCw, LogOut, Check, 
  Shield, Volume2, Smartphone, HelpCircle, BellRing, Sparkles, UserCheck 
} from 'lucide-react';
import { RegisteredUser } from '../types';
import { secureStorage } from '../lib/security';

export const AVAILABLE_AVATARS = [
  { id: 'armand', emoji: '🧑‍💻', name: 'Armand (Tech)' },
  { id: 'awa', emoji: '👩‍🍳', name: 'Awa (Cuisine)' },
  { id: 'sekou', emoji: '🧑‍💼', name: 'Sékou (Pro)' },
  { id: 'mariam', emoji: '👩‍🎓', name: 'Mariam (Étudiante)' },
  { id: 'lion', emoji: '🦁', name: 'Akwaba Lion' },
  { id: 'elephant', emoji: '🐘', name: 'Éléphant' },
  { id: 'ananas', emoji: '🍍', name: 'Ananas' },
  { id: 'cacao', emoji: '🥥', name: 'Cacao' }
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser: RegisteredUser | null;
  onLogout: () => void;
  onUpdateUser?: (user: RegisteredUser) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  isDarkMode,
  onToggleDarkMode,
  currentUser,
  onLogout,
  onUpdateUser
}: SettingsModalProps) {
  // Account preferences states
  const [prefSms, setPrefSms] = useState(true);
  const [prefSound, setPrefSound] = useState(true);
  const [prefSpeed, setPrefSpeed] = useState<'instant' | 'simulated'>('simulated');
  
  // Update check states
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'uptodate'>('idle');
  const [updateLogs, setUpdateLogs] = useState<string[]>([]);
  const [activeLogIndex, setActiveLogIndex] = useState(-1);

  if (!isOpen) return null;

  const handleSelectAvatar = (avatarId: string) => {
    if (currentUser && onUpdateUser) {
      const updated = {
        ...currentUser,
        avatar: avatarId
      };
      secureStorage.setItem('unigo_user', JSON.stringify(updated));
      const dbRaw = secureStorage.getItem('unigo_stored_users_db');
      if (dbRaw) {
        try {
          const list = JSON.parse(dbRaw);
          const updatedList = list.map((u: any) => u.email === currentUser.email ? { ...u, avatar: avatarId } : u);
          secureStorage.setItem('unigo_stored_users_db', JSON.stringify(updatedList));
        } catch (e) {
          console.error(e);
        }
      }
      onUpdateUser(updated);
    }
  };

  const handleCheckUpdates = () => {
    setUpdateStatus('checking');
    setUpdateLogs([]);
    setActiveLogIndex(-1);

    const steps = [
      "Initialisation de la connexion sécurisée SSL...",
      "Analyse de l'intégrité de l'application Unigo...",
      "Comparaison de la build locale (v1.2.0-stable) avec l'index distant...",
      "Authentification de la signature numérique du développeur...",
      "Succès : Votre application Unigo est entièrement à jour ! (v1.2.0 stable)"
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < steps.length) {
        setUpdateLogs(prev => [...prev, steps[index]]);
        setActiveLogIndex(index);
        index++;
      } else {
        clearInterval(interval);
        setUpdateStatus('uptodate');
      }
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className={`w-full max-w-lg rounded-2xl overflow-hidden border transition-all duration-300 shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-scale-up font-sans ${
        isDarkMode 
          ? 'bg-zinc-900 border-zinc-800 text-zinc-100' 
          : 'bg-white border-zinc-200 text-zinc-800'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${
          isDarkMode ? 'border-zinc-800 bg-zinc-950/40' : 'border-zinc-100 bg-zinc-50/50'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl text-white shadow-md">
              <Settings className="h-5 w-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider font-display">Paramètres Unigo</h3>
              <p className="text-[10px] text-zinc-400 font-medium leading-none mt-0.5">Ajustements, thèmes et mises à jour du compte</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDarkMode ? 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300' : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* USER CONTEXT BLOCK */}
          {currentUser ? (
            <div className={`p-4 rounded-xl border space-y-4 ${
              isDarkMode ? 'bg-zinc-950/30 border-zinc-800' : 'bg-zinc-50 border-zinc-150'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-left">
                  {/* Glowing active avatar preview */}
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center text-2xl shadow-md border-2 border-white dark:border-zinc-800 relative">
                    <span className="relative z-10">
                      {AVAILABLE_AVATARS.find(a => a.id === currentUser.avatar)?.emoji || '👤'}
                    </span>
                    <span className="absolute inset-0 bg-orange-500/10 rounded-full animate-ping pointer-events-none" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-400 font-semibold block">Compte Actif</span>
                    <p className="text-xs font-extrabold font-display">{currentUser.fullName}</p>
                    <p className="text-[10px] text-zinc-450 font-mono">{currentUser.phone} &bull; {currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg text-[10px] font-bold font-display uppercase tracking-wider transition-all flex items-center space-x-1 border border-rose-500/20 cursor-pointer active:scale-95 shrink-0"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Déconnexion</span>
                </button>
              </div>

              {/* Avatar Catalog Selector inside account parameters */}
              <div className="border-t border-zinc-200/60 dark:border-zinc-800/60 pt-3 text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                  <span>Choisir un nouvel Avatar Ivoirien</span>
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_AVATARS.map((av) => {
                    const isSelected = currentUser.avatar === av.id;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => handleSelectAvatar(av.id)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 active:scale-95 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-zinc-950 dark:text-amber-400 font-bold scale-102 ring-1 ring-amber-500/30'
                            : isDarkMode
                            ? 'bg-zinc-950 border-zinc-850 hover:bg-zinc-850 text-zinc-300 hover:border-zinc-750'
                            : 'bg-zinc-50 border-zinc-150 hover:bg-zinc-100 text-zinc-700'
                        }`}
                        title={av.name}
                      >
                        <span className="text-xl">{av.emoji}</span>
                        <span className="text-[8px] font-sans text-zinc-400 truncate w-full block">{av.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-xl border text-center space-y-2 ${
              isDarkMode ? 'bg-zinc-950/20 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-150 text-zinc-500'
            }`}>
              <p className="text-xs">Vous êtes actuellement connecté en mode invité anonyme.</p>
              <p className="text-[10px] text-zinc-400">Inscrivez-vous pour débloquer votre portefeuille et sauvegarder votre historique.</p>
            </div>
          )}

          {/* THEME TOGGLE (MODE SOMBRE & JOUR) */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-400 font-display">Ajustement Visuel</h4>
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              isDarkMode ? 'bg-zinc-950/10 border-zinc-800' : 'bg-zinc-50/20 border-zinc-150'
            }`}>
              <div className="space-y-0.5">
                <p className="text-xs font-bold leading-none">Thème de l'application</p>
                <p className="text-[10px] text-zinc-400">Basculez entre le mode Jour protecteur et le mode Sombre élégant.</p>
              </div>

              <button
                onClick={onToggleDarkMode}
                className={`px-4 py-2 rounded-lg text-xs font-bold font-display uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer active:scale-95 ${
                  isDarkMode 
                    ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/10' 
                    : 'bg-zinc-900 text-white shadow-md'
                }`}
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '12s' }} />
                    <span>Mode Jour</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5" />
                    <span>Mode Sombre</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* MISES A JOUR LOGIQUE */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-400 font-display">Mises à Jour Systèmes</h4>
            <div className={`p-4 rounded-xl border space-y-3.5 ${
              isDarkMode ? 'bg-zinc-950/10 border-zinc-800' : 'bg-zinc-50/20 border-zinc-150'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold leading-none">Version Actuelle : v1.2.0 (Stable)</p>
                  <p className="text-[10px] text-zinc-400">Canal de déploiement officiel Côte d'Ivoire.</p>
                </div>

                <button
                  onClick={handleCheckUpdates}
                  disabled={updateStatus === 'checking'}
                  className={`px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold font-display uppercase tracking-wider transition-all flex items-center space-x-2 border border-zinc-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700' : ''
                  }`}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${updateStatus === 'checking' ? 'animate-spin' : ''}`} />
                  <span>{updateStatus === 'checking' ? 'Recherche...' : 'Vérifier la version'}</span>
                </button>
              </div>

              {/* Animated simulator display logs */}
              {updateLogs.length > 0 && (
                <div className={`p-3 rounded-lg border font-mono text-[9.5px] space-y-1.5 text-left leading-relaxed max-h-[140px] overflow-y-auto ${
                  isDarkMode ? 'bg-black/40 border-zinc-800 text-zinc-300' : 'bg-zinc-900 text-zinc-200 border-zinc-950'
                }`}>
                  {updateLogs.map((log, lidx) => (
                    <div 
                      key={lidx} 
                      className={`flex items-start space-x-1.5 transition-opacity duration-350 ${
                        lidx === activeLogIndex ? 'animate-pulse text-amber-400 font-bold' : 'opacity-85'
                      }`}
                    >
                      <span className="text-amber-500 font-black shrink-0">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {updateStatus === 'checking' && (
                    <div className="h-1.5 w-12 bg-amber-500 rounded animate-pulse mt-2" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SIMULATION PREFERENCES */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-400 font-display">Réglages du Simulateur</h4>
            <div className={`p-4 rounded-xl border space-y-4 ${
              isDarkMode ? 'bg-zinc-950/10 border-zinc-800' : 'bg-zinc-50/20 border-zinc-150'
            }`}>
              {/* Option A: Sound feedback */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <Volume2 className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Retour Sonore</span>
                  </p>
                  <p className="text-[9.5px] text-zinc-400">Jouer une mélodie discrète lors d'une transaction réussie.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefSound(!prefSound)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    prefSound ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    prefSound ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Option B: SMS simulation */}
              <div className="flex items-center justify-between border-t border-zinc-100/10 pt-4">
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <BellRing className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Rapports SMS / Email</span>
                  </p>
                  <p className="text-[9.5px] text-zinc-400">Simuler la réception instantanée d'un SMS après l'envoi de crédit.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefSms(!prefSms)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    prefSms ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    prefSms ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Option C: Simulation speed settings */}
              <div className="space-y-2 border-t border-zinc-100/10 pt-4">
                <div className="flex items-center justify-between text-left">
                  <div>
                    <p className="text-xs font-bold">Vitesse de Traitement Réseau</p>
                    <p className="text-[9.5px] text-zinc-400">Réglez le délai d'authentification bancaire et d'attribution.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPrefSpeed('instant')}
                    className={`py-1.5 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                      prefSpeed === 'instant' 
                        ? 'bg-zinc-950 text-white dark:bg-zinc-800' 
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    Instantané (0s)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrefSpeed('simulated')}
                    className={`py-1.5 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                      prefSpeed === 'simulated' 
                        ? 'bg-zinc-950 text-white dark:bg-zinc-800' 
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    Réaliste (3s)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* APPLICATION APPROVAL SECURITY BADGE */}
          <div className="p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10.5px] leading-relaxed flex items-start space-x-2.5 text-left">
            <Shield className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Cryptage de bout en bout (AES-256)</strong> actif. Toutes les données d'inscription et de transactions sont cryptées et protégées conformément aux exigences de l'ARTCI (Régulation Télécom Côte d'Ivoire).
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-end ${
          isDarkMode ? 'border-zinc-800 bg-zinc-950/40' : 'border-zinc-100 bg-zinc-50/50'
        }`}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer active:scale-95"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
