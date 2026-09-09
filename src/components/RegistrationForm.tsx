import React, { useState } from 'react';
import { RegisteredUser, NetworkId } from '../types';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, MapPin, 
  CheckCircle2, Sparkles, HelpCircle, ShieldCheck, 
  ChevronRight, Loader2, ArrowRight, X, UserCheck 
} from 'lucide-react';
import ProviderLogo from './ProviderLogo';
import { dbRegisterUser } from '../lib/supabase';
import { secureStorage } from '../lib/security';

const AVAILABLE_AVATARS = [
  { id: 'armand', emoji: '🧑‍💻', name: 'Armand (Tech)' },
  { id: 'awa', emoji: '👩‍🍳', name: 'Awa (Cuisine)' },
  { id: 'sekou', emoji: '🧑‍💼', name: 'Sékou (Pro)' },
  { id: 'mariam', emoji: '👩‍🎓', name: 'Mariam (Étudiante)' },
  { id: 'lion', emoji: '🦁', name: 'Akwaba Lion' },
  { id: 'elephant', emoji: '🐘', name: 'Éléphant' },
  { id: 'ananas', emoji: '🍍', name: 'Ananas' },
  { id: 'cacao', emoji: '🥥', name: 'Cacao' }
];

interface RegistrationFormProps {
  onClose: () => void;
  onSuccess: (user: RegisteredUser) => void;
}

export default function RegistrationForm({ onClose, onSuccess }: RegistrationFormProps) {
  const [isLoginTab, setIsLoginTab] = useState(false);
  
  // Registration States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Abidjan');
  const [accountType, setAccountType] = useState<'standard' | 'agent'>('standard');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  
  // Custom states for Avatar and Captcha Protection
  const [selectedAvatar, setSelectedAvatar] = useState('armand');
  const [captchaNumA, setCaptchaNumA] = useState(() => Math.floor(Math.random() * 8) + 2);
  const [captchaNumB, setCaptchaNumB] = useState(() => Math.floor(Math.random() * 8) + 2);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  
  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // UX UI UI-states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [stepsProgress, setStepsProgress] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [successCreatedUser, setSuccessCreatedUser] = useState<RegisteredUser | null>(null);

  // Ivory Coast network detector based on prefix
  const getPhoneNetwork = (num: string): { name: string; logo: string; color: string } | null => {
    const digits = num.replace(/\D/g, '');
    if (digits.length >= 2) {
      const prefix = digits.substring(0, 2);
      if (['07', '08', '09'].includes(prefix)) {
        return { name: 'Orange', logo: '', color: 'border-orange-500 text-orange-600 bg-orange-50/50' };
      } else if (['05', '04', '06'].includes(prefix)) {
        return { name: 'MTN', logo: '', color: 'border-yellow-400 text-yellow-600 bg-yellow-50/50' };
      } else if (['01', '02', '03'].includes(prefix)) {
        return { name: 'Moov', logo: '', color: 'border-blue-500 text-blue-600 bg-blue-50/50' };
      }
    }
    return null;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= 10) {
      setPhone(raw);
    }
  };

  const detectedNetwork = getPhoneNetwork(phone);

  const formatPhone = (num: string) => {
    const raw = num.replace(/\D/g, '');
    if (raw.length === 10) {
      return `${raw.substring(0, 2)} ${raw.substring(2, 4)} ${raw.substring(4, 6)} ${raw.substring(6, 8)} ${raw.substring(8, 10)}`;
    }
    return num;
  };

  // Submit flow
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Pre-validation
    if (!fullName.trim()) {
      setFormError("Veuillez saisir votre nom complet.");
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError("Veuillez entrer une adresse e-mail valide.");
      return;
    }
    if (phone.length !== 10) {
      setFormError("Votre numéro de téléphone Côte d'Ivoire doit comporter exactement 10 chiffres.");
      return;
    }
    if (!detectedNetwork) {
      setFormError("Préfixe de numéro invalide. Côte d'Ivoire: Orange (07/08/09), MTN (05/04/06), Moov (01/02/03).");
      return;
    }
    if (password.length < 6) {
      setFormError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!agreedToTerms) {
      setFormError("Vous devez accepter les conditions d'utilisation d'Unigo.ci.");
      return;
    }

    // Human vs Robot verification check
    const expectedAnswer = captchaNumA + captchaNumB;
    if (parseInt(captchaAnswer.trim()) !== expectedAnswer) {
      setFormError(`Contrôle Anti-Robot échoué : ${captchaNumA} + ${captchaNumB} ne fait pas ${captchaAnswer || 'vide'}. Veuillez calculer la somme exacte pour valider la création du compte.`);
      setCaptchaNumA(Math.floor(Math.random() * 8) + 2);
      setCaptchaNumB(Math.floor(Math.random() * 8) + 2);
      setCaptchaAnswer('');
      return;
    }

    // Launch simulation
    runSimulationSteps();
  };

  const runSimulationSteps = () => {
    setIsSimulating(true);
    const steps = [
      "Vérification de l'unicité de l'e-mail...",
      "Cryptage sha256 des identifiants d'accès...",
      "Génération du portefeuille Unigo Côte d'Ivoire...",
      "Attribution de la prime de bienvenue de 2,000 FCFA...",
      "Finalisation de votre profil de sécurité..."
    ];
    setStepsProgress([]);
    setCurrentStepIndex(0);

    let progressIndex = 0;
    const interval = setInterval(() => {
      if (progressIndex < steps.length) {
        setStepsProgress(prev => [...prev, steps[progressIndex]]);
        setCurrentStepIndex(progressIndex);
        progressIndex++;
      } else {
        clearInterval(interval);
        
        // Finalize state
        const generatedId = 'usr_' + Math.random().toString(36).substring(2, 11);
        const completeUser: RegisteredUser = {
          id: generatedId,
          fullName: fullName.trim(),
          phone: formatPhone(phone),
          email: email.trim().toLowerCase(),
          accountType: accountType,
          city: city,
          avatar: selectedAvatar, // Chosen avatar icon ID
          balance: accountType === 'agent' ? 50000 : 200, // Agents get 50,000 F trial float, standards get 200 F gift
          savedBeneficiaries: [
            { name: "Famille Abidjan", phone: formatPhone(phone), network: phone.substring(0, 2) === '07' ? 'orange' : phone.substring(0, 2) === '05' ? 'mtn' : 'moov' as NetworkId }
          ],
          dateJoined: new Date().toLocaleDateString('fr-FR')
        };

        // Persist to localStorage and Supabase users table
        dbRegisterUser(completeUser);
        
        // Save to users database list for login simulation
        const existingUsersRaw = secureStorage.getItem('unigo_stored_users_db');
        const usersList: RegisteredUser[] = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];
        
        // Avoid duplicate emails
        const filteredList = usersList.filter(u => u.email !== completeUser.email);
        filteredList.push({ ...completeUser, password }); // keep password for login sim
        secureStorage.setItem('unigo_stored_users_db', JSON.stringify(filteredList));

        setSuccessCreatedUser(completeUser);
        setIsSimulating(false);
      }
    }, 850);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setFormError("Veuillez remplir tous les champs.");
      return;
    }

    // Check localStorage user database
    const existingUsersRaw = secureStorage.getItem('unigo_stored_users_db');
    const usersList: any[] = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];
    
    // Find matching user
    const found = usersList.find(u => u.email === loginEmail.trim().toLowerCase());
    
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      if (found && found.password === loginPassword) {
        // Log in
        const loggedUser: RegisteredUser = {
          fullName: found.fullName,
          phone: found.phone,
          email: found.email,
          accountType: found.accountType,
          city: found.city,
          balance: found.balance || 200,
          savedBeneficiaries: found.savedBeneficiaries || [],
          dateJoined: found.dateJoined || new Date().toLocaleDateString('fr-FR')
        };
        secureStorage.setItem('unigo_user', JSON.stringify(loggedUser));
        onSuccess(loggedUser);
      } else if (loginEmail.toLowerCase() === 'test@unigo.ci' && loginPassword === 'unigo123') {
        // Fallback default demo account
        const demoUser: RegisteredUser = {
          fullName: "Esso Latte Frédéric",
          phone: "07 48 59 10 32",
          email: "test@unigo.ci",
          accountType: 'standard',
          city: 'Yamoussoukro',
          balance: 3500,
          savedBeneficiaries: [
            { name: "Mère (Orange)", phone: "07 08 09 10 32", network: 'orange' },
            { name: "Frère (MTN)", phone: "05 45 61 22 91", network: 'mtn' }
          ],
          dateJoined: "18/06/2026"
        };
        secureStorage.setItem('unigo_user', JSON.stringify(demoUser));
        onSuccess(demoUser);
      } else {
        setFormError("Adresse e-mail ou mot de passe incorrect. Pour tester, utilisez test@unigo.ci / unigo123 ou inscrivez-vous !");
      }
    }, 1200);
  };

  const handleDone = () => {
    if (successCreatedUser) {
      onSuccess(successCreatedUser);
    }
  };

  return (
    <div id="registration-overlay" className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="registration-card" 
        className="bg-white rounded-xl border border-zinc-200 w-full max-w-lg overflow-hidden flex flex-col relative animate-scale-up text-zinc-900 geometric-card-shadow max-h-[90vh]"
      >
        {/* Close Button unless simulating progress */}
        {!isSimulating && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 transition-colors z-10 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Modal Header */}
        <div className="p-6 bg-zinc-900 text-white text-left border-b border-zinc-950 flex items-center space-x-3 shrink-0">
          <div className="h-9 w-9 bg-zinc-950 border border-zinc-800 flex items-center justify-center rounded shadow-[2px_2px_0px_0px_rgba(245,158,11,1)]">
            <UserCheck className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider font-display">
              {successCreatedUser ? "Inscription Réussie" : isLoginTab ? "Connexion Espace Membre" : "Inscription Unigo.ci"}
            </h3>
            <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
              {successCreatedUser ? "Compte créé et crédité de bonus" : isLoginTab ? "Accédez à votre portefeuille et tarifs optimisés" : "Rejoignez le réseau n°1 de transfert d'unités en CI"}
            </p>
          </div>
        </div>

        {/* Success Screen */}
        {successCreatedUser ? (
          <div className="p-6 space-y-6 text-center overflow-y-auto flex-1 font-sans">
            <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-250 animate-bounce">
              <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-bold font-display text-zinc-900 uppercase tracking-tight">Akwaba, {successCreatedUser.fullName} !</h4>
              <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                Votre compte premium Unigo a été configuré avec succès depuis la ville de <strong>{successCreatedUser.city}</strong>.
              </p>
            </div>

            {/* Gift Wallet presentation banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 text-left space-y-3 max-w-sm mx-auto">
              <div className="flex items-center space-x-2 text-amber-800 font-bold font-display uppercase text-[10px] tracking-wider">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Cadeau de Bienvenue Activé</span>
              </div>
              <p className="text-[11px] text-zinc-650 leading-relaxed">
                Pour vous souhaiter la bienvenue en Côte d'Ivoire, nous avons alimenté votre portefeuille virtuel d'une prime de :
              </p>
              <div className="text-2xl font-black text-zinc-950 font-mono tracking-tight bg-white px-3 py-2 rounded border border-amber-200/60 inline-block">
                {successCreatedUser.balance.toLocaleString()} <span className="text-xs text-amber-600 font-bold uppercase font-sans">FCFA OFFERTS</span>
              </div>
              <p className="text-[10px] text-zinc-400 italic">
                Ce solde est immédiatement utilisable pour tester des transferts d'unités d'appel ou internet sans débiter votre véritable compte mobile money !
              </p>
            </div>

            <div className="pt-2">
              <button 
                onClick={handleDone}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg font-bold font-display uppercase tracking-wider text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow"
              >
                <span>Démarrer l'Expédition d'Unités</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : isSimulating ? (
          /* Custom interactive progress loader */
          <div className="p-10 text-center space-y-6 overflow-y-auto flex-1 font-sans">
            <div className="relative mx-auto w-12 h-12 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-display">Simulation d'intégration</p>
              <p className="text-sm font-extrabold text-zinc-900">Patientez pendant que notre passerelle API s'initialise...</p>
            </div>

            {/* Steps log tracker */}
            <div className="bg-zinc-50 border border-zinc-250 py-4 px-5 rounded-lg text-left max-w-sm mx-auto space-y-2.5 font-mono text-[11px]">
              {stepsProgress.map((step, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-zinc-800 animate-fade-in">
                  <span className="text-emerald-500 font-bold font-sans">✓</span>
                  <span>{step}</span>
                </div>
              ))}
              {currentStepIndex >= 0 && currentStepIndex < stepsProgress.length && (
                <div className="flex items-center space-x-2 text-zinc-400 animate-pulse">
                  <Loader2 className="h-3 w-3 text-amber-500 animate-spin" />
                  <span>Exécution en cours...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Normal forms (Login/Signup toggles) */
          <div className="overflow-y-auto flex-1 p-6">
            
            {/* Form Toggle Slider */}
            <div className="grid grid-cols-2 gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200/60 mb-6 shrink-0 font-display">
              <button
                type="button"
                onClick={() => { setIsLoginTab(false); setFormError(''); }}
                className={`py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                  !isLoginTab ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-950'
                }`}
              >
                S'inscrire (Nouveau)
              </button>
              <button
                type="button"
                onClick={() => { setIsLoginTab(true); setFormError(''); }}
                className={`py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                  isLoginTab ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-950'
                }`}
              >
                Se Connecter
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-xs font-medium text-left">
                ⚠️ {formError}
              </div>
            )}

            {isLoginTab ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left font-sans">
                <div className="space-y-1.5 font-sans">
                  <label className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider">Adresse Email</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      placeholder="Ex: frederic@unigo.ci"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full text-sm pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-zinc-900 focus:bg-white text-zinc-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 font-sans">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider">Mot de Passe</label>
                    <span className="text-[10px] text-zinc-400 italic">Démo: unigo123</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Votre mot de passe"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full text-sm pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-zinc-900 focus:bg-white text-zinc-900"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800 p-1 rounded"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 text-zinc-400 text-[10px] leading-relaxed italic bg-zinc-50/70 p-3 rounded border border-zinc-200 text-center">
                  💡 Pour un accès rapide de test, saisissez l'identifiant démo pré-généré : <strong className="text-zinc-650">test@unigo.ci</strong> et mot de passe <strong className="text-zinc-650">unigo123</strong>.
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg font-bold font-display uppercase tracking-wider text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow"
                >
                  <span>S'authentifier sur le Compte</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left font-sans">
                
                {/* Account type block */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider block">Type de Compte Unigo</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountType('standard')}
                      className={`p-3 rounded border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        accountType === 'standard' 
                          ? 'border-zinc-900 bg-zinc-50 text-zinc-900 ring-1 ring-zinc-950' 
                          : 'border-zinc-200 hover:bg-zinc-50/50 text-zinc-500'
                      }`}
                    >
                      <span className="font-bold text-xs uppercase tracking-wider font-display block">Client Standard</span>
                      <span className="text-[10px] text-zinc-400 mt-0.5">Pour recharger sa famille (frais à 1% optimisés, bonus fidélité).</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountType('agent')}
                      className={`p-3 rounded border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        accountType === 'agent' 
                          ? 'border-zinc-900 bg-zinc-50 text-zinc-900 ring-1 ring-zinc-950' 
                          : 'border-zinc-200 hover:bg-zinc-50/50 text-zinc-500'
                      }`}
                    >
                      <span className="font-bold text-xs uppercase tracking-wider font-display block">Revendeur B2B (Grossiste)</span>
                      <span className="text-[10px] text-zinc-400 mt-0.5">Pour boutiques physiques. (0% frais, commissions 4% sur reventes).</span>
                    </button>
                  </div>
                </div>

                {/* Custom Avatar Selector Block */}
                <div className="space-y-2 border-t border-zinc-150 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider block">Choisissez votre Avatar Unigo</label>
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded">Personnalisation</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {AVAILABLE_AVATARS.map((av) => {
                      const isSelected = selectedAvatar === av.id;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setSelectedAvatar(av.id)}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 active:scale-95 ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 text-amber-800 font-bold ring-1 ring-amber-500/25 scale-[1.01]'
                              : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100/80 text-zinc-750'
                          }`}
                        >
                          <span className="text-2xl">{av.emoji}</span>
                          <span className="text-[8.5px] font-medium text-zinc-500 truncate w-full block">{av.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Common Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider block">Nom & Prénoms</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="Ex: Frédéric Latte"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full text-xs pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-zinc-900 focus:bg-white text-zinc-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider block">Adresse Email</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        type="email"
                        placeholder="Ex: latte@unigo.ci"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-zinc-900 focus:bg-white text-zinc-900"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider">Téléphone Principal (CI)</label>
                      <span className="text-[10px] text-zinc-400 font-mono">10 Chiffres</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-zinc-500">🇨🇮 +225</span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="Ex: 07 58 49 10 32"
                        value={phone}
                        onChange={handlePhoneChange}
                        className="w-full text-xs pl-16 pr-8 py-2.5 bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-zinc-900 focus:bg-white text-zinc-900 font-mono font-bold"
                        required
                      />
                      
                      {/* Detect indicator badge */}
                      {detectedNetwork && (
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1 p-0.5 pr-1.5 bg-zinc-100 rounded border border-zinc-200">
                          <ProviderLogo id={detectedNetwork.name.toLowerCase()} className="w-4 h-4 rounded-sm shrink-0" />
                          <span className="text-[9px] text-zinc-500 font-bold uppercase select-none">{detectedNetwork.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider block">Ville de Résidence</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full text-xs pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-zinc-900 focus:bg-white text-zinc-900"
                      >
                        {["Abidjan", "Bouaké", "Yamoussoukro", "San-Pédro", "Korhogo", "Daloa", "Man", "Gagnoa", "Abengourou", "Grand-Bassam"].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Password line */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider block">Mot de Passe</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 6 caractères"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-xs pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-zinc-900 focus:bg-white text-zinc-900"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800 p-1 rounded"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider block">Confirmation</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Retapez le mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full text-xs pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-zinc-900 focus:bg-white text-zinc-900"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800 p-1 rounded"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Robot vs Human Verification Protection Card */}
                <div className="p-3.5 bg-orange-500/5 border border-orange-500/15 rounded-xl space-y-3 text-left">
                  <div className="flex items-center space-x-2 text-orange-600 font-bold uppercase text-[10.5px] tracking-wider">
                    <ShieldCheck className="h-4.5 w-4.5 text-orange-500 shrink-0" />
                    <span>Sécurité Unigo : Test de Présence Humaine</span>
                  </div>
                  
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    Afin d'éviter la création de comptes automatisés par des robots, veuillez résoudre cette addition rapide :
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-amber-400 font-mono text-sm font-black rounded-lg select-none tracking-wider shadow">
                      {captchaNumA} + {captchaNumB} = ?
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Réponse"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs py-2.5 px-3 bg-white border border-zinc-200 rounded focus:outline-none focus:border-zinc-900 text-zinc-900 font-mono font-bold"
                        required
                      />
                    </div>
                    {/* Instant verification hint icon */}
                    {parseInt(captchaAnswer) === (captchaNumA + captchaNumB) ? (
                      <span className="text-emerald-600 text-xs font-black bg-emerald-500/10 px-2 py-1.5 rounded border border-emerald-500/15 shrink-0 flex items-center gap-1 select-none animate-bounce">
                        ✓ Humain
                      </span>
                    ) : captchaAnswer ? (
                      <span className="text-rose-600 text-xs font-black bg-rose-500/10 px-2 py-1.5 rounded border border-rose-500/15 shrink-0 flex items-center gap-1 select-none">
                        ✗ Erreur
                      </span>
                    ) : (
                      <span className="text-amber-600 text-[10px] font-bold bg-amber-500/10 px-2 py-1.5 rounded border border-amber-500/15 shrink-0 flex items-center gap-1 select-none">
                        Calcul requis
                      </span>
                    )}
                  </div>
                </div>

                {/* TOS option */}
                <div className="flex items-start space-x-2 pt-2 text-left">
                  <input
                    id="tos-check"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 rounded text-zinc-900 focus:ring-zinc-900 h-4 w-4"
                  />
                  <label htmlFor="tos-check" className="text-[11px] text-zinc-500 leading-normal">
                    J'autorise Unigo à mémoriser de manière cryptée et sécurisée mes bénéficiaires favoris et j'accepte la politique de confidentialité d'Unigo.ci relative aux transferts télécoms en Côte d'Ivoire.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-4 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg font-bold font-display uppercase tracking-wider text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow"
                >
                  <span>Créer mon Compte Gratuit</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* Form Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 text-center shrink-0 flex items-center justify-center space-x-1 text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>Sécurisé de bout en bout en Côte d'Ivoire &bull; SSL v3</span>
        </div>
      </div>
    </div>
  );
}
