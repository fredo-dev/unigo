import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Volume2, VolumeX, X, Bot, Play, Square, Sparkles, HelpCircle, ArrowRight, CornerDownLeft, Send 
} from 'lucide-react';
import { RegisteredUser } from '../types';

interface VoiceAssistantBotProps {
  currentUser: RegisteredUser | null;
  isDarkMode: boolean;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  isSpeaking?: boolean;
}

const PRESET_QUESTIONS = [
  { text: "Quels opérateurs supportez-vous ?", keywords: ["operateur", "reseau", "orange", "mtn", "moov"] },
  { text: "Quels sont les frais de transfert ?", keywords: ["frais", "gratuit", "tarif", "payant"] },
  { text: "Combien de temps prend la recharge ?", keywords: ["temps", "duree", "rapide", "instant"] },
  { text: "J'ai fait une erreur de numéro, que faire ?", keywords: ["erreur", "probleme", "aide", "service", "support", "contact"] },
];

export default function VoiceAssistantBot({ currentUser, isDarkMode }: VoiceAssistantBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Akwaba ! Je suis votre Assistant Vocal Unigo. Vous pouvez me poser vos questions de vive voix en cliquant sur le micro, ou en m'écrivant directement."
    }
  ]);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto scroll messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Set up Speech Recognition on mount if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'fr-CIV'; // Target Ivorian/French context
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleUserQuery(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setRecognitionError("Microphone bloqué par le navigateur (veuillez autoriser l'accès).");
        } else {
          setRecognitionError(`Erreur : ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setRecognitionError("Reconnaissance vocale non supportée sur ce navigateur.");
    }

    // Cleanup speech synthesis on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text To Speech logic
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;

    // Stop current speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    if (!soundEnabled) return;

    // Filter out some symbols for pronunciation
    const cleanSpeech = text
      .replace(/Unigo\.ci/gi, "Unigo point cé i")
      .replace(/%/g, " pour cent")
      .replace(/\+225/g, "plus deux cent vingt-cinq")
      .replace(/FCFA/g, "francs c f a");

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.08; // Clear energetic speed
    utterance.pitch = 1.28; // Higher pitch ("voix de mademoiselle aiguë")

    // Try to find a high quality French female voice
    const voices = window.speechSynthesis.getVoices();
    const frFemaleVoice = voices.find(v => 
      v.lang.startsWith('fr') && 
      (v.name.toLowerCase().includes('female') || 
       v.name.toLowerCase().includes('google') || 
       v.name.toLowerCase().includes('hortense') || 
       v.name.toLowerCase().includes('julie') || 
       v.name.toLowerCase().includes('marie') || 
       v.name.toLowerCase().includes('virginie') || 
       v.name.toLowerCase().includes('amelie') || 
       v.name.toLowerCase().includes('sandra'))
    ) || voices.find(v => v.lang.startsWith('fr'));

    if (frFemaleVoice) {
      utterance.voice = frFemaleVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    activeUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      stopSpeaking();
      try {
        recognitionRef.current?.start();
      } catch (e) {
        // Fallback if already running
        console.error(e);
      }
    }
  };

  // Natural Language Matcher
  const getBotResponse = (query: string): string => {
    const q = query.toLowerCase();

    // 1. Greeting
    if (q.includes('salut') || q.includes('bonjour') || q.includes('bonsoir') || q.includes('akwaba') || q.includes('hello') || q.includes('hey')) {
      const namePart = currentUser ? `, cher ${currentUser.fullName}` : "";
      return `Akwaba${namePart} ! Je suis l'assistant vocal intelligent de Unigo Côte d'Ivoire. Demandez-moi comment faire un transfert, la grille des frais, ou la gestion des pannes !`;
    }

    // 2. Operators / Networks
    if (q.includes('reseau') || q.includes('réseau') || q.includes('operateur') || q.includes('opérateur') || q.includes('orange') || q.includes('mtn') || q.includes('moov')) {
      return "Nous couvrons l'ensemble des réseaux ivoiriens : Orange Côte d'Ivoire, MTN Côte d'Ivoire et Moov Africa. Vous pouvez envoyer des crédits d'appels ou souscrire directement à des forfaits internet et mixtes.";
    }

    // 3. Fees / Pricing
    if (q.includes('frais') || q.includes('tarif') || q.includes('gratuit') || q.includes('taxe') || q.includes('coute') || q.includes('coûte')) {
      return "Chez Unigo, la transparence est reine. Nous ne prélevons aucuns frais additionnels cachés. Seuls les frais réglementaires standard de un pour cent appliqués par Wave ou votre compte Mobile Money sont prélevés lors du règlement.";
    }

    // 4. Delay / Duration
    if (q.includes('temps') || q.includes('rapide') || q.includes('delai') || q.includes('délai') || q.includes('instan') || q.includes('combien de minute') || q.includes('dure') || q.includes('duré')) {
      return "Nos transferts sont ultra-rapides et entièrement automatisés. Dès que votre paiement par Wave ou Mobile Money est validé, la souscription est créditée sur le numéro bénéficiaire en moins de cinq secondes.";
    }

    // 5. Errors / Support
    if (q.includes('erreur') || q.includes('probleme') || q.includes('problème') || q.includes('echoue') || q.includes('échoué') || q.includes('marche pas') || q.includes('aide') || q.includes('support') || q.includes('contact') || q.includes('whatsapp') || q.includes('numero')) {
      return "Pas d'inquiétude ! En cas de mauvaise saisie ou si un forfait tarde à s'activer, notre équipe de support technique est disponible vingt-quatre heures sur vingt-quatre. Écrivez-nous sur WhatsApp au +225 05 96 74 28 70 et nous résoudrons cela immédiatement.";
    }

    // 6. Wave specific
    if (q.includes('wave')) {
      return "Wave est notre partenaire privilégié pour les règlements instantanés. Payer avec Wave sur Unigo garantit un traitement sécurisé immédiat avec seulement un pour cent de frais de réseau.";
    }

    // 7. Developer
    if (q.includes('frederic') || q.includes('frédéric') || q.includes('cree') || q.includes('créé') || q.includes('developpeur') || q.includes('développeur')) {
      return "L'application Unigo.ci a été conçue et développée de bout en bout par l'ingénieur ivoirien Esso Latte Frédéric, afin de simplifier la vie de millions de mobinautes en Côte d'Ivoire !";
    }

    // 8. How to use / Tutorial
    if (q.includes('comment') || q.includes('marche') || q.includes('utilisation') || q.includes('faire') || q.includes('recharger') || q.includes('transfert')) {
      return "C'est un jeu d'enfant : un, sélectionnez le réseau Orange, MTN ou Moov. Deux, entrez le numéro. Trois, choisissez de l'airtime ou un forfait. Quatre, réglez avec Wave ou Mobile Money. C'est fait !";
    }

    // Fallback
    return "Je comprends ! Pour vous aider au mieux, sachez que je gère toutes les questions sur les forfaits Orange, MTN et Moov, nos tarifs transparents de un pour cent de frais, ou la façon de contacter l'assistance en cas d'erreur.";
  };

  const handleUserQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Generate Bot response
    setTimeout(() => {
      const replyText = getBotResponse(queryText);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        isSpeaking: true
      };

      setMessages(prev => [...prev, botMsg]);
      speakText(replyText);
    }, 600);
  };

  const handlePresetClick = (qText: string) => {
    stopSpeaking();
    handleUserQuery(qText);
  };

  return (
    <>
      {/* Floating Animated Widget Trigger Button */}
      <div className="fixed bottom-24 right-6 z-40">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            stopSpeaking();
          }}
          className="relative h-12 w-12 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white flex items-center justify-center shadow-[0_8px_30px_rgb(249,115,22,0.35)] active:scale-95 transition-all cursor-pointer border border-white/10 group overflow-visible"
          title="Assistant Vocal Unigo"
        >
          {/* Pulsing Outer Radiance */}
          <span className="absolute -inset-1.5 rounded-full bg-orange-500/10 animate-ping pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="bot"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center relative"
              >
                <Bot className="h-5.5 w-5.5 animate-bounce" />
                {/* Micro badge indicator */}
                <span className="absolute -bottom-1 -right-1 bg-zinc-950 text-emerald-400 text-[8px] px-1 rounded border border-emerald-500/20 font-black">VOX</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Interactive Support Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className={`fixed bottom-40 right-6 z-40 w-85 sm:w-96 rounded-2xl border shadow-2xl flex flex-col overflow-hidden leading-relaxed ${
              isDarkMode 
                ? 'bg-zinc-950/95 border-zinc-800 text-white backdrop-blur-md' 
                : 'bg-white/95 border-zinc-200 text-zinc-900 backdrop-blur-md'
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="h-9 w-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-white relative">
                  <Bot className="h-5 w-5" />
                  {isSpeaking && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black font-display uppercase tracking-wider text-zinc-100 flex items-center gap-1.5">
                    <span>Support Vocal Unigo</span>
                    <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold">BETA</span>
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-medium">Posez vos questions de vive voix</p>
                </div>
              </div>

              {/* Sound Controls */}
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    if (!next) stopSpeaking();
                  }}
                  className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                    soundEnabled 
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                  title={soundEnabled ? "Muter l'assistant" : "Activer la voix"}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    stopSpeaking();
                  }}
                  className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-md transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Conversation Messages Stage */}
            <div className={`p-4 flex-1 h-64 overflow-y-auto space-y-3.5 scrollbar-thin ${
              isDarkMode ? 'bg-zinc-950/45' : 'bg-zinc-50/50'
            }`}>
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-2.5 text-left ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}
                  >
                    <div className={`h-7.5 w-7.5 rounded-full flex items-center justify-center shrink-0 text-sm select-none shadow-sm ${
                      isBot 
                        ? 'bg-zinc-900 text-amber-500 border border-zinc-800' 
                        : 'bg-amber-500 text-white'
                    }`}>
                      {isBot ? '🤖' : (currentUser?.avatar ? '🧑‍💻' : '👤')}
                    </div>
                    <div className="space-y-1 max-w-[80%]">
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed font-sans shadow-sm border ${
                        isBot
                          ? isDarkMode
                            ? 'bg-zinc-900/90 border-zinc-850 text-zinc-200'
                            : 'bg-white border-zinc-200 text-zinc-850'
                          : 'bg-gradient-to-tr from-orange-500 to-amber-500 border-orange-500/20 text-white'
                      }`}>
                        {msg.text}
                      </div>

                      {/* Speaking state helper controls for bot messages */}
                      {isBot && soundEnabled && (
                        <div className="flex items-center space-x-2 pl-1">
                          <button
                            type="button"
                            onClick={() => speakText(msg.text)}
                            className="text-[9px] font-bold font-mono text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="h-2 w-2 fill-current" /> Réécouter
                          </button>
                          {isSpeaking && (
                            <button
                              type="button"
                              onClick={stopSpeaking}
                              className="text-[9px] font-bold font-mono text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Square className="h-2 w-2 fill-current" /> Arrêter
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Simulated Animated Vocal Soundwave Indicator when active */}
            <AnimatePresence>
              {(isSpeaking || isListening) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-zinc-900/95 border-y border-zinc-850 py-2.5 px-4 flex items-center justify-between"
                >
                  <span className="text-[10px] font-bold font-mono text-zinc-350 tracking-wider flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isListening ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isListening ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    </span>
                    <span>{isListening ? 'L\'ASSISTANT ÉCOUTE...' : 'L\'ASSISTANT PARLE...'}</span>
                  </span>

                  {/* Dynamic sound wave ticks */}
                  <div className="flex items-center space-x-1.5 h-4">
                    {[...Array(6)].map((_, i) => (
                      <motion.span
                        key={i}
                        animate={{
                          height: isListening 
                            ? [4, 16, 4] 
                            : [4, 12, 6, 16, 4]
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeInOut"
                        }}
                        className={`w-0.75 rounded-full ${
                          isListening ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preset Helpful Quick Questions */}
            <div className={`p-3 border-t text-left ${
              isDarkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Questions Fréquentes (Vocalisées)</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetClick(q.text)}
                    className={`text-[9.5px] font-medium px-2.5 py-1.5 rounded-lg border transition-all text-left active:scale-95 cursor-pointer max-w-full truncate ${
                      isDarkMode
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    {q.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input & Mic Control Footer */}
            <div className={`p-3 border-t flex items-center space-x-2 ${
              isDarkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-150'
            }`}>
              {/* Floating micro activator trigger */}
              <button
                type="button"
                onClick={toggleListening}
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-all active:scale-95 cursor-pointer relative ${
                  isListening
                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
                title="Parler au micro"
              >
                {isListening ? <Mic className="h-5 w-5 animate-pulse" /> : <MicOff className="h-5 w-5" />}
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Posez votre question par écrit..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUserQuery(inputText);
                    }
                  }}
                  className={`w-full text-xs py-2.5 pl-3 pr-10 rounded-xl focus:outline-none focus:ring-1 border transition-all ${
                    isDarkMode
                      ? 'bg-zinc-900 border-zinc-800 text-white focus:border-amber-500/50 focus:ring-amber-500/20'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-850 focus:border-zinc-900 focus:ring-zinc-900/10'
                  }`}
                />
                
                <button
                  type="button"
                  onClick={() => handleUserQuery(inputText)}
                  disabled={!inputText.trim()}
                  className={`absolute right-1.5 top-1.5 p-1.5 rounded-lg transition-all ${
                    inputText.trim() 
                      ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white cursor-pointer hover:scale-105 active:scale-95' 
                      : 'text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Error notifications */}
            {recognitionError && (
              <div className="bg-rose-500/10 text-rose-500 border-t border-rose-500/10 text-[9px] px-3 py-1.5 font-sans font-semibold tracking-wide text-left">
                ⚠️ {recognitionError}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
