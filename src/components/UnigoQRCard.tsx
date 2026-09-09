import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, Camera, Check, Copy, Download, Share2, Users, 
  Smartphone, CreditCard, RefreshCw, Sparkles, ArrowRightLeft,
  Info, ShieldCheck, HelpCircle, UserCheck, CheckCircle2
} from 'lucide-react';
import { RegisteredUser } from '../types';

interface UnigoQRCardProps {
  currentUser: RegisteredUser | null;
  isDarkMode: boolean;
  onSelectRecipient: (phone: string, operator: 'orange' | 'mtn' | 'moov' | 'wave', name: string) => void;
  triggerRegistration: () => void;
}

// Demo Unigo users in Ivory Coast that can be scanned for testing
const DEMO_CONTACTS = [
  { name: "Koffi Kouadio Armand", phone: "0708451296", operator: "orange" as const, location: "Abidjan, Cocody" },
  { name: "Mariam Diarrassouba", phone: "0544891230", operator: "mtn" as const, location: "Bouaké, Air France" },
  { name: "Sékou Touré", phone: "0102654879", operator: "moov" as const, location: "San-Pédro, Bardot" },
  { name: "Awa Koné", phone: "0755123456", operator: "wave" as const, location: "Yamoussoukro, Assabou" }
];

export default function UnigoQRCard({
  currentUser,
  isDarkMode,
  onSelectRecipient,
  triggerRegistration
}: UnigoQRCardProps) {
  const [activeTab, setActiveTab] = useState<'card' | 'scanner' | 'share'>('card');
  const [selectedOperator, setSelectedOperator] = useState<'orange' | 'mtn' | 'moov' | 'wave'>('orange');
  const [copied, setCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [scannedUser, setScannedUser] = useState<typeof DEMO_CONTACTS[0] | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Dynamic values based on registered user or default guest
  const cardHolderName = currentUser ? currentUser.fullName : "COMPTE INVITÉ";
  const cardPhone = currentUser ? currentUser.phone : "0700000000";
  const cardBalance = currentUser ? currentUser.balance : 0;
  const cardId = currentUser ? `UNI-${currentUser.phone.substring(currentUser.phone.length - 4)}-CIV` : "UNI-GUEST-CIV";

  // Simulate copy payment link
  const handleCopyLink = () => {
    const paymentLink = `https://unigo.ci/pay?to=${cardPhone}&op=${selectedOperator}&name=${encodeURIComponent(cardHolderName)}`;
    navigator.clipboard.writeText(paymentLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Turn on/off camera stream for standard scanning (if permitted by the iframe environment)
  const startCamera = async () => {
    setCameraActive(true);
    setIsScanning(true);
    setScanSuccess(null);
    setScannedUser(null);
    
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } else {
        console.warn("Camera API not supported in this browser/iframe context.");
      }
    } catch (err) {
      console.warn("Could not acquire camera stream:", err);
      // Fallback is handled gracefully by showing a gorgeous simulation overlay
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle a scanned contact (either via camera simulation or manual demo picker)
  const handleScanContact = (contact: typeof DEMO_CONTACTS[0]) => {
    stopCamera();
    setIsScanning(false);
    setScannedUser(contact);
    setScanSuccess(`Félicitations ! Code QR de ${contact.name} décodé avec succès.`);
    
    // Auto-fill recipient in main App
    onSelectRecipient(contact.phone, contact.operator, contact.name);

    // Play feedback tone
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch (e) {}
  };

  return (
    <div className={`rounded-xl border p-6 space-y-6 text-left geometric-card-shadow ${
      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-800'
    }`}>
      
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-lg">
            <CreditCard className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider font-display flex items-center gap-1.5">
              Carte Unigo QR & Transferts
              <span className="text-[8px] bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/10 animate-pulse">Nouveau</span>
            </h4>
            <p className="text-[10px] text-zinc-400">Envoyez et recevez des fonds instantanément entre vous</p>
          </div>
        </div>

        {/* Small Navigation Pill */}
        <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200/50 dark:border-zinc-850">
          <button
            onClick={() => { stopCamera(); setActiveTab('card'); }}
            className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'card' 
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold' 
                : 'text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300'
            }`}
          >
            Ma Carte
          </button>
          <button
            onClick={() => { startCamera(); setActiveTab('scanner'); }}
            className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1 ${
              activeTab === 'scanner' 
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold' 
                : 'text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300'
            }`}
          >
            <Camera className="h-3 w-3" />
            <span>Scanner QR</span>
          </button>
        </div>
      </div>

      {/* Main Body Tabs */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: DISPLAY MY DIGITAL CARD & QR */}
        {activeTab === 'card' && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-5"
          >
            {/* Metallic Unigo Card Visual representation */}
            <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-neutral-900 border-2 border-zinc-850 rounded-2xl p-5 text-white overflow-hidden shadow-xl min-h-[190px] flex flex-col justify-between">
              
              {/* Operator specific shining highlight backgrounds */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
              
              {/* Côte d'Ivoire subtle flag-line on the side */}
              <div className="absolute top-0 left-0 w-1.5 h-full flex flex-col">
                <div className="flex-1 bg-[#f77f00]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#fcbf49]" />
                <div className="flex-1 bg-[#003049]" />
              </div>

              {/* Top part of the card */}
              <div className="flex items-start justify-between relative pl-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-sm uppercase tracking-wider font-display bg-gradient-to-r from-orange-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
                      Unigo Card
                    </span>
                    <span className="text-[7.5px] font-mono text-zinc-500 border border-zinc-800 px-1.5 py-0.2 rounded uppercase">
                      CIV-PAY
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-450 font-mono tracking-widest">{cardId}</p>
                </div>

                {/* Microchip representation */}
                <div className="w-9 h-7 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 rounded-lg border border-yellow-250 shadow-inner relative flex flex-col justify-around p-1 overflow-hidden shrink-0">
                  <div className="w-full h-[1px] bg-yellow-950/20" />
                  <div className="w-full h-[1px] bg-yellow-950/20" />
                  <div className="flex justify-between w-full">
                    <div className="w-[1px] h-3 bg-yellow-950/20" />
                    <div className="w-[1px] h-3 bg-yellow-950/20" />
                  </div>
                </div>
              </div>

              {/* Middle Card Details */}
              <div className="relative pl-2 py-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[8.5px] text-zinc-500 uppercase tracking-wider font-mono">Titulaire du compte</p>
                    <p className="text-sm font-extrabold font-display uppercase tracking-wider text-zinc-100 truncate">{cardHolderName}</p>
                  </div>
                  {currentUser && currentUser.avatar && (
                    <div className="h-10 w-10 rounded-full bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-xl shadow-md shrink-0 mr-1 select-none animate-fade-in">
                      {currentUser.avatar === 'armand' && '🧑‍💻'}
                      {currentUser.avatar === 'awa' && '👩‍🍳'}
                      {currentUser.avatar === 'sekou' && '🧑‍💼'}
                      {currentUser.avatar === 'mariam' && '👩‍🎓'}
                      {currentUser.avatar === 'lion' && '🦁'}
                      {currentUser.avatar === 'elephant' && '🐘'}
                      {currentUser.avatar === 'ananas' && '🍍'}
                      {currentUser.avatar === 'cacao' && '🥥'}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 mt-2 font-mono">
                  <div>
                    <p className="text-[8px] text-zinc-500 uppercase tracking-wider">Téléphone</p>
                    <p className="text-xs font-bold text-zinc-200">
                      {cardPhone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')}
                    </p>
                  </div>
                  <div className="border-l border-zinc-800 pl-4">
                    <p className="text-[8px] text-zinc-500 uppercase tracking-wider">Solde Principal</p>
                    <p className="text-xs font-bold text-amber-400">
                      {cardBalance.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Card Area */}
              <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2.5 mt-2 text-[10px] relative pl-2">
                <div className="text-[9px] text-zinc-450 flex items-center space-x-1.5">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  <span>Sécurisé par les opérateurs</span>
                </div>

                {/* Operator selector representation (Active Badge on Card) */}
                <div className="flex items-center space-x-1">
                  <span className="text-[8px] text-zinc-500 uppercase mr-1">Lien direct :</span>
                  {selectedOperator === 'orange' && <span className="text-[9px] font-black px-2 py-0.5 rounded bg-orange-600 text-white">Orange</span>}
                  {selectedOperator === 'mtn' && <span className="text-[9px] font-black px-2 py-0.5 rounded bg-yellow-500 text-zinc-950">MTN</span>}
                  {selectedOperator === 'moov' && <span className="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-600 text-white">Moov</span>}
                  {selectedOperator === 'wave' && <span className="text-[9px] font-black px-2 py-0.5 rounded bg-sky-500 text-white">Wave</span>}
                </div>
              </div>
            </div>

            {/* Interactive Selector to Choose payment Operator */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <span>🔗 Opérateur Récepteur Associé</span>
                <Info className="h-3 w-3 text-zinc-400 cursor-help" title="Choisissez l'opérateur sur lequel vous recevrez les fonds quand quelqu'un scannera votre code QR" />
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['orange', 'mtn', 'moov', 'wave'] as const).map((op) => (
                  <button
                    key={op}
                    onClick={() => setSelectedOperator(op)}
                    className={`py-2 px-1 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 active:scale-95 ${
                      selectedOperator === op
                        ? op === 'orange'
                          ? 'bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                          : op === 'mtn'
                          ? 'bg-yellow-500/10 border-yellow-500 text-yellow-600 dark:text-yellow-400 font-bold'
                          : op === 'moov'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400 font-bold'
                        : isDarkMode
                        ? 'border-zinc-800 bg-zinc-950 hover:bg-zinc-850 text-zinc-400'
                        : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-tight">{op}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Expandable QR Code Display Section */}
            <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-5 ${
              isDarkMode ? 'bg-zinc-950/40 border-zinc-850' : 'bg-zinc-50 border-zinc-150'
            }`}>
              
              {/* Dynamic QR Code Canvas Render */}
              <div className="shrink-0 bg-white p-3.5 rounded-xl shadow-md border border-zinc-200 relative group flex flex-col items-center justify-center">
                <div className="relative w-28 h-28 flex flex-wrap p-0.5">
                  
                  {/* Decorative High Fidelity Custom SVG QR Pattern */}
                  <svg className="w-full h-full text-zinc-900" viewBox="0 0 100 100" fill="currentColor">
                    {/* Top Left Finder pattern */}
                    <rect x="0" y="0" width="30" height="30" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="10" y="10" width="10" height="10" />
                    
                    {/* Top Right Finder pattern */}
                    <rect x="70" y="0" width="30" height="30" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="80" y="10" width="10" height="10" />

                    {/* Bottom Left Finder pattern */}
                    <rect x="0" y="70" width="30" height="30" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="10" y="80" width="10" height="10" />

                    {/* Dynamic micro QR bits simulation */}
                    <rect x="40" y="5" width="6" height="6" />
                    <rect x="55" y="12" width="6" height="6" />
                    <rect x="45" y="20" width="12" height="6" />
                    <rect x="50" y="2" width="6" height="6" />
                    
                    <rect x="5" y="40" width="6" height="12" />
                    <rect x="20" y="45" width="6" height="6" />
                    <rect x="12" y="55" width="12" height="6" />
                    
                    {/* Center details */}
                    <rect x="35" y="35" width="30" height="30" />
                    {/* White cutout for the Unigo badge */}
                    <rect x="42" y="42" width="16" height="16" fill="white" rx="3" />

                    {/* Lower Right bits */}
                    <rect x="70" y="40" width="12" height="6" />
                    <rect x="85" y="45" width="10" height="12" />
                    <rect x="75" y="58" width="8" height="6" />
                    
                    <rect x="40" y="70" width="12" height="12" />
                    <rect x="55" y="85" width="10" height="8" />
                    <rect x="45" y="90" width="12" height="6" />
                    
                    <rect x="75" y="80" width="12" height="6" />
                    <rect x="85" y="70" width="8" height="12" />
                    <rect x="90" y="90" width="10" height="10" />
                  </svg>

                  {/* Central Operator/Unigo Badge Overlay */}
                  <div className="absolute inset-0 m-auto h-7 w-7 rounded-md shadow flex items-center justify-center border font-bold text-[8px] bg-zinc-950 text-white border-zinc-800">
                    <span className="text-amber-500 uppercase text-[7px]">UNI</span>
                  </div>
                </div>
                
                {/* Visual scanning overlay lines on hover */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-500 opacity-0 group-hover:opacity-100 group-hover:animate-bounce pointer-events-none" />
              </div>

              {/* QR Explanations and Actions */}
              <div className="space-y-4 flex-1 text-center sm:text-left">
                <div>
                  <h5 className="font-extrabold text-xs uppercase tracking-tight text-zinc-850 dark:text-zinc-200">
                    Votre QR Code de Paiement
                  </h5>
                  <p className="text-[10.5px] text-zinc-400 mt-1 leading-relaxed">
                    Faites scanner ce code par un autre membre Unigo pour qu'il puisse vous envoyer de l'argent instantanément sur votre compte <span className="font-bold text-amber-500 capitalize">{selectedOperator}</span>.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    onClick={handleCopyLink}
                    className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-colors ${
                      copied 
                        ? 'bg-emerald-500 text-white border-emerald-650' 
                        : 'bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-transparent'
                    }`}
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Lien Copié' : 'Copier le lien'}</span>
                  </button>

                  <button
                    onClick={() => {
                      alert("Téléchargement du QR Code Unigo configuré pour " + selectedOperator.toUpperCase() + ".\nEnregistré dans vos téléchargements.");
                    }}
                    className="px-3 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 cursor-pointer border border-transparent"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Télécharger</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Security Guarantee Banner */}
            <div className={`p-3 rounded-lg border flex items-start space-x-2.5 ${
              isDarkMode ? 'bg-zinc-950/20 border-zinc-850' : 'bg-amber-500/5 border-amber-500/10'
            }`}>
              <ShieldCheck className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-[10px] text-zinc-450 leading-relaxed">
                <span className="font-bold text-zinc-750 dark:text-zinc-300">Paiements Directs Sécurisés :</span>
                <p>
                  Les codes QR Unigo sont compatibles avec toutes les passerelles nationales (Orange Money, MTN MoMo, Moov Money et Wave) pour garantir des transactions 100% officielles.
                </p>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: INTERACTIVE CAMERA / SCANNER MODAL */}
        {activeTab === 'scanner' && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-5"
          >
            
            {/* Camera scanner visual framing */}
            <div className="relative aspect-video w-full rounded-2xl bg-zinc-950 overflow-hidden border border-zinc-800 flex flex-col items-center justify-center">
              
              {/* Actual Video tag for real-time camera if available */}
              {cameraActive && (
                <video 
                  ref={videoRef} 
                  className="absolute inset-0 w-full h-full object-cover z-0"
                  playsInline
                  muted
                />
              )}

              {/* Scanning laser line animation */}
              {isScanning && !scanSuccess && (
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-lg shadow-amber-500 animate-pulse z-10" style={{
                  animation: 'bounce 2.5s infinite ease-in-out'
                }} />
              )}

              {/* Scanning targets corners */}
              <div className="absolute inset-10 border-2 border-transparent z-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-amber-500 rounded-tl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-amber-500 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-amber-500 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-amber-500 rounded-br" />
              </div>

              {/* Camera Simulation Overlay when camera not active or blocked inside iframe */}
              <div className="absolute inset-0 bg-zinc-950/80 flex flex-col items-center justify-center text-center p-4 space-y-4 z-10 pointer-events-none select-none">
                <QrCode className="h-10 w-10 text-amber-500 animate-pulse" />
                <div className="space-y-1">
                  <p className="text-[11.5px] font-bold text-zinc-100">Simulateur de Caméra Unigo</p>
                  <p className="text-[9.5px] text-zinc-400 max-w-xs">
                    (Les permissions de caméra réelles peuvent être restreintes par le cadre de prévisualisation sécurisé.)
                  </p>
                </div>
              </div>

              {/* Scan Complete Card Overlay */}
              {scanSuccess && scannedUser && (
                <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center text-center p-6 space-y-4 z-20 animate-scale-up">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                    <UserCheck className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-wider text-emerald-500">Destinataire Détecté</p>
                    <p className="text-sm font-extrabold text-white">{scannedUser.name}</p>
                    <p className="text-xs text-zinc-400 font-mono">
                      {scannedUser.phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')} &bull; {scannedUser.location}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-mono uppercase bg-zinc-800 text-amber-400 px-2 py-0.5 rounded border border-zinc-700">
                      Lien direct : {scannedUser.operator.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-400/90 font-sans max-w-xs">
                    Le formulaire de transfert d'unités/forfaits a été configuré avec les coordonnées de {scannedUser.name}.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Demo Scan selector for simulation - critical fallback */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
                  <Users className="h-3.5 w-3.5 text-amber-500" />
                  <span>Simuler le Scan d'un Contact Ivoirien</span>
                </span>
                
                {scannedUser && (
                  <button 
                    onClick={() => { setScanSuccess(null); setScannedUser(null); startCamera(); }}
                    className="text-[9px] font-bold uppercase text-amber-500 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} />
                    Réinitialiser
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {DEMO_CONTACTS.map((contact, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleScanContact(contact)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between active:scale-95 hover:border-amber-500/40 relative overflow-hidden ${
                      scannedUser?.phone === contact.phone
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-650 dark:text-emerald-400'
                        : isDarkMode
                        ? 'bg-zinc-950 border-zinc-850 hover:bg-zinc-850 text-zinc-300'
                        : 'bg-zinc-50 border-zinc-150 hover:bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-extrabold truncate">{contact.name}</p>
                      <p className="text-[9px] text-zinc-400 font-mono">{contact.phone}</p>
                    </div>
                    
                    <div className="flex items-center justify-between w-full mt-2 pt-1 border-t border-zinc-250/30 dark:border-zinc-800/60">
                      <span className="text-[8px] text-zinc-400 font-sans truncate">{contact.location}</span>
                      <span className={`text-[8px] font-mono px-1 rounded uppercase ${
                        contact.operator === 'orange' ? 'bg-orange-500 text-white' :
                        contact.operator === 'mtn' ? 'bg-yellow-500 text-zinc-950' :
                        contact.operator === 'moov' ? 'bg-emerald-600 text-white' : 'bg-sky-500 text-white'
                      }`}>
                        {contact.operator}
                      </span>
                    </div>

                    {scannedUser?.phone === contact.phone && (
                      <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white rounded-full p-0.5">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Final feedback routing button */}
            {scannedUser && (
              <button
                onClick={() => {
                  // Scroll user back to main formulation form
                  const targetElement = document.getElementById('transfer-section');
                  if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold font-display rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer border-0 flex items-center justify-center space-x-1.5"
              >
                <span>Remplir le formulaire & Transférer</span>
                <ArrowRightLeft className="h-4 w-4" />
              </button>
            )}

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
