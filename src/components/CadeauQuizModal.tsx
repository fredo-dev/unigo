import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Sparkles, AlertCircle, CheckCircle, HelpCircle, ArrowRight,
  BookOpen, Compass, Award, Percent, RefreshCw, X, Coins, MapPin, Coffee
} from 'lucide-react';
import { RegisteredUser } from '../types';

interface Question {
  id: string;
  category: 'math' | 'culture' | 'history';
  categoryLabel: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 'math1',
    category: 'math',
    categoryLabel: '📐 Logique & Mathématiques',
    questionText: "Si 3 bouteilles de gnamakou (jus de gingembre) coûtent 450 FCFA, combien coûtent 5 bouteilles ?",
    options: ["600 FCFA", "750 FCFA", "800 FCFA", "900 FCFA"],
    correctIndex: 1,
    explanation: "Chaque bouteille coûte 150 FCFA (450 / 3). Donc 5 bouteilles coûtent 150 * 5 = 750 FCFA."
  },
  {
    id: 'math2',
    category: 'math',
    categoryLabel: '📐 Logique & Mathématiques',
    questionText: "Quel théorème célèbre énonce que dans un triangle rectangle, le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés ?",
    options: ["Théorème de Thalès", "Théorème de Pythagore", "Théorème d'Al-Kashi", "Règle de Trois"],
    correctIndex: 1,
    explanation: "C'est le Théorème de Pythagore, incontournable du programme de mathématiques de Côte d'Ivoire !"
  },
  {
    id: 'math3',
    category: 'math',
    categoryLabel: '📐 Logique & Mathématiques',
    questionText: "Un marchand d'Adjamé double le prix d'un article à 1500 FCFA, puis applique une réduction de 20%. Quel est le prix final ?",
    options: ["2000 FCFA", "2400 FCFA", "2500 FCFA", "3000 FCFA"],
    correctIndex: 1,
    explanation: "Le prix doublé est de 3000 FCFA. Une réduction de 20% retire 600 FCFA (3000 * 0.2), le prix final est de 2400 FCFA."
  },
  {
    id: 'math4',
    category: 'math',
    categoryLabel: '📐 Logique & Mathématiques',
    questionText: "Quelle est la valeur de x dans l'équation simple : 3x - 12 = 48 ?",
    options: ["x = 15", "x = 18", "x = 20", "x = 24"],
    correctIndex: 2,
    explanation: "3x = 48 + 12 = 60, donc x = 60 / 3 = 20."
  },
  {
    id: 'culture1',
    category: 'culture',
    categoryLabel: '🍲 Mets & Culture Ivoiriens',
    questionText: "Quel type de poisson accompagne traditionnellement le célèbre plat national ivoirien, le Garba ?",
    options: ["Le Capitaine", "La Carpe", "Le Thon frit", "Le Maquereau"],
    correctIndex: 2,
    explanation: "Le Garba authentique de Côte d'Ivoire est toujours accompagné de thon frit émietté avec du piment frais et de l'oignon."
  },
  {
    id: 'culture2',
    category: 'culture',
    categoryLabel: '🍲 Mets & Culture Ivoiriens',
    questionText: "À base de quel tubercule fabrique-t-on l'Attiéké, la célèbre semoule de Côte d'Ivoire ?",
    options: ["La Pomme de terre", "L'Igname", "Le Manioc", "Le Taro"],
    correctIndex: 2,
    explanation: "L'Attiéké est une spécialité culinaire ivoirienne faite à base de manioc fermenté et râpé."
  },
  {
    id: 'culture3',
    category: 'culture',
    categoryLabel: '🍲 Mets & Culture Ivoiriens',
    questionText: "Quel plat ivoirien est cuit à l'étouffée, traditionnellement dans un canari en argile sur du charbon de bois ?",
    options: ["Le Kedjenou", "Le Placali", "Le Foutou", "Le Garba"],
    correctIndex: 0,
    explanation: "Le Kedjenou est une recette de ragoût de poulet ou de gibier cuit à l'étouffée dans un canari de terre hermétiquement fermé."
  },
  {
    id: 'culture4',
    category: 'culture',
    categoryLabel: '🍲 Mets & Culture Ivoiriens',
    questionText: "De quel tubercule est fait principalement le Foutou banane ?",
    options: ["Uniquement de la Banane mûre", "Un mélange de Banane et de Manioc", "De l'Igname", "Du Maïs"],
    correctIndex: 1,
    explanation: "Le Foutou banane est préparé en pilant des bananes plantains bouillies avec du manioc pour l'élasticité."
  },
  {
    id: 'history1',
    category: 'history',
    categoryLabel: '🇨🇮 Histoire de la Côte d\'Ivoire',
    questionText: "En quelle année la Côte d'Ivoire a-t-elle proclamé son indépendance vis-à-vis de la France ?",
    options: ["1958", "1960", "1962", "1965"],
    correctIndex: 1,
    explanation: "La Côte d'Ivoire a proclamé son indépendance le 7 août 1960."
  },
  {
    id: 'history2',
    category: 'history',
    categoryLabel: '🇨🇮 Histoire de la Côte d\'Ivoire',
    questionText: "Qui est le premier président de la République de Côte d'Ivoire, affectueusement appelé le 'Vieux' ?",
    options: ["Félix Houphouët-Boigny", "Henri Konan Bédié", "Laurent Gbagbo", "Robert Guéï"],
    correctIndex: 0,
    explanation: "Félix Houphouët-Boigny est le père fondateur de la nation et premier président de 1960 à 1993."
  },
  {
    id: 'history3',
    category: 'history',
    categoryLabel: '🇨🇮 Histoire de la Côte d\'Ivoire',
    questionText: "Quelle ville est devenue la capitale politique officielle de la Côte d'Ivoire en 1983 ?",
    options: ["Abidjan", "Bouaké", "Yamoussoukro", "San-Pédro"],
    correctIndex: 2,
    explanation: "Yamoussoukro, village natal du président Houphouët-Boigny, est devenue la capitale politique et administrative en 1983."
  },
  {
    id: 'history4',
    category: 'history',
    categoryLabel: '🇨🇮 Histoire de la Côte d\'Ivoire',
    questionText: "Quel édifice religieux colossal de Yamoussoukro est reconnu comme l'un des plus grands au monde ?",
    options: ["La Mosquée de Kong", "La Cathédrale Saint-Paul", "La Basilique Notre-Dame de la Paix", "Le Temple de l'Amour"],
    correctIndex: 2,
    explanation: "La Basilique Notre-Dame de la Paix de Yamoussoukro a été consacrée par le Pape Jean-Paul II en 1990."
  }
];

interface CadeauQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: RegisteredUser | null;
  isDarkMode: boolean;
  onRewardWon: (amount: number) => void;
  triggerRegistration: () => void;
  lastSubscriptionAmount: number;
}

export default function CadeauQuizModal({
  isOpen,
  onClose,
  currentUser,
  isDarkMode,
  onRewardWon,
  triggerRegistration,
  lastSubscriptionAmount
}: CadeauQuizModalProps) {
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'revealing_success' | 'revealing_failure'>('lobby');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [rewardAmount, setRewardAmount] = useState<number>(100);
  const [claimed, setClaimed] = useState(false);
  
  // Custom confetti particle array
  const [confetti, setConfetti] = useState<{ x: number; y: number; color: string; size: number; delay: number }[]>([]);

  useEffect(() => {
    if (isOpen) {
      setGameState('lobby');
      setSelectedOption(null);
      setClaimed(false);
      
      // Select random question
      const randomQ = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
      setCurrentQuestion(randomQ);

      // Determine dynamic gift reward based on subscription cost
      // (10% cashback simulation, min 50 F, max 500 F)
      const calculatedReward = Math.min(500, Math.max(50, Math.round((lastSubscriptionAmount || 1000) * 0.1)));
      setRewardAmount(calculatedReward);

      // Build random confetti parameters
      const colors = ['#f59e0b', '#f97316', '#10b981', '#3b82f6', '#ec4899', '#ffffff'];
      const particles = Array.from({ length: 45 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * -50,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        delay: Math.random() * 2
      }));
      setConfetti(particles);
    }
  }, [isOpen, lastSubscriptionAmount]);

  if (!isOpen) return null;

  // Synthesize custom retro sound sequence for correct/incorrect responses
  const playSoundEffect = (isCorrect: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isCorrect) {
        // High pitch happy chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.2); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } else {
        // Low buzzer warning sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        osc.frequency.setValueAtTime(140, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      }
    } catch (e) {
      console.warn("Audio Context error ignored:", e);
    }
  };

  const handleStartGame = () => {
    setGameState('playing');
    setSelectedOption(null);
  };

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null || !currentQuestion) return;
    
    setSelectedOption(idx);
    
    const isCorrect = idx === currentQuestion.correctIndex;
    playSoundEffect(isCorrect);

    setTimeout(() => {
      if (isCorrect) {
        setGameState('revealing_success');
        onRewardWon(rewardAmount);
      } else {
        setGameState('revealing_failure');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Confetti falling layer on successful reward */}
      {gameState === 'revealing_success' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {confetti.map((c, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-fall"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                backgroundColor: c.color,
                width: `${c.size}px`,
                height: `${c.size}px`,
                animationDelay: `${c.delay}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                opacity: 0.8
              }}
            />
          ))}
        </div>
      )}

      {/* Modal Container */}
      <div className={`w-full max-w-lg rounded-2xl overflow-hidden border transition-all duration-300 shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-scale-up font-sans ${
        isDarkMode 
          ? 'bg-zinc-900 border-zinc-800 text-zinc-100' 
          : 'bg-white border-zinc-200 text-zinc-800'
      }`}>
        
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500 shrink-0 w-full" />

        {/* Top Header Controls */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${
          isDarkMode ? 'border-zinc-800 bg-zinc-950/20' : 'border-zinc-100 bg-zinc-50/50'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider font-display">Cadeau Quiz Unigo</h3>
              <p className="text-[9.5px] text-zinc-400">Gagnez des bonus réels à chaque souscription</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDarkMode ? 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300' : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700'
            }`}
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-center flex flex-col justify-center">

          {/* LOBBY STATE (Introduction Box) */}
          {gameState === 'lobby' && (
            <div className="space-y-6 py-4">
              {/* Giant Present Icon */}
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-2xl rotate-6 opacity-30 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl -rotate-3 opacity-20" />
                <div className="relative h-20 w-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg text-white">
                  <Trophy className="h-10 w-10 animate-bounce" style={{ animationDuration: '3s' }} />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-extrabold font-display uppercase tracking-tight">
                  🎁 Un Cadeau Vous Attend !
                </h2>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Unigo récompense votre fidélité après chaque forfait ou crédit souscrit ! Pour débloquer votre cadeau, répondez correctement à notre quiz culturel.
                </p>
              </div>

              {/* Reward estimation bubble */}
              <div className={`p-4 rounded-xl border max-w-sm mx-auto flex items-center space-x-3 text-left ${
                isDarkMode ? 'bg-zinc-950/30 border-zinc-800' : 'bg-orange-50/40 border-orange-100'
              }`}>
                <Coins className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-zinc-850 dark:text-zinc-200">Cagnotte de quiz en jeu :</p>
                  <p className="text-lg font-black text-amber-500 leading-none">+{rewardAmount} FCFA</p>
                  <p className="text-[9px] text-zinc-400 mt-1">Crédités instantanément sur votre solde en cas de bonne réponse.</p>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartGame}
                className="w-full max-w-sm py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold font-display rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer border-0 inline-flex items-center justify-center space-x-2"
              >
                <span>Débloquer la question</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-[10px] text-zinc-400">
                Catégories : Mathématiques, Gastronomy & Mets Ivoiriens, Histoire de la CIV.
              </p>
            </div>
          )}

          {/* PLAYING STATE (Question formulation & options) */}
          {gameState === 'playing' && currentQuestion && (
            <div className="space-y-6 py-2 text-left">
              {/* Category indicator */}
              <div className="flex items-center justify-between">
                <span className={`text-[9.5px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                  currentQuestion.category === 'math' 
                    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                    : currentQuestion.category === 'culture'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                }`}>
                  {currentQuestion.category === 'math' && <Award className="h-3 w-3 inline mr-1.5 -mt-0.5" />}
                  {currentQuestion.category === 'culture' && <Coffee className="h-3 w-3 inline mr-1.5 -mt-0.5" />}
                  {currentQuestion.category === 'history' && <MapPin className="h-3 w-3 inline mr-1.5 -mt-0.5" />}
                  {currentQuestion.categoryLabel}
                </span>

                <span className="text-[10px] font-mono text-zinc-400 font-bold">
                  Bonus : +{rewardAmount} F
                </span>
              </div>

              {/* Question bubble */}
              <div className={`p-5 rounded-2xl border text-center ${
                isDarkMode ? 'bg-zinc-950/40 border-zinc-800' : 'bg-zinc-50 border-zinc-150'
              }`}>
                <p className="text-sm font-bold text-zinc-850 dark:text-zinc-100 leading-relaxed">
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectAnswer = idx === currentQuestion.correctIndex;
                  
                  let btnStyle = isDarkMode 
                    ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-200' 
                    : 'bg-white border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-750';
                  
                  if (selectedOption !== null) {
                    if (isSelected) {
                      btnStyle = isCorrectAnswer 
                        ? 'bg-emerald-500 text-white border-emerald-600 scale-101' 
                        : 'bg-rose-500 text-white border-rose-600 scale-101';
                    } else if (isCorrectAnswer) {
                      btnStyle = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400';
                    } else {
                      btnStyle = 'opacity-40 border-zinc-250 cursor-not-allowed';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={selectedOption !== null}
                      className={`w-full py-4 px-5 rounded-xl border text-xs font-semibold text-left transition-all duration-350 flex items-center justify-between active:scale-98 ${btnStyle} ${
                        selectedOption === null ? 'cursor-pointer' : ''
                      }`}
                    >
                      <span className="flex items-center space-x-3">
                        <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold text-[11px] border font-mono ${
                          isSelected 
                            ? 'bg-white/20 text-white border-transparent' 
                            : isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-250'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </span>

                      {selectedOption !== null && isSelected && (
                        <span>
                          {isCorrectAnswer ? '✅' : '❌'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Wait transition loader */}
              {selectedOption !== null && (
                <div className="flex items-center justify-center space-x-2 text-xs text-zinc-400 pt-2 animate-pulse">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Vérification de la réponse...</span>
                </div>
              )}
            </div>
          )}

          {/* REVEALING SUCCESS STATE (Correct trivia response) */}
          {gameState === 'revealing_success' && currentQuestion && (
            <div className="space-y-6 py-4 animate-scale-up">
              <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border-4 border-emerald-500/20 mx-auto">
                <CheckCircle className="h-8 w-8 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-emerald-500 uppercase font-display tracking-tight">
                  🎉 Superbe ! Bonne Réponse !
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Félicitations, vous connaissez parfaitement vos classiques. Votre cadeau vous est octroyé immédiatement !
                </p>
              </div>

              {/* Gift revealed card */}
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-5 max-w-sm mx-auto relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                  <Trophy className="h-24 w-24 text-amber-500" />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-amber-500 font-extrabold bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full inline-block">
                    Cadeau Unigo Débloqué
                  </span>
                  <p className="text-2xl font-black text-amber-500 font-display mt-2">+{rewardAmount} FCFA</p>
                  <p className="text-[10px] text-zinc-400 leading-tight">
                    {currentUser 
                      ? "Crédit ajouté directement à votre portefeuille Unigo !" 
                      : "Réservez vos gains en créant votre compte de paiement maintenant."
                    }
                  </p>
                </div>
              </div>

              {/* Explanatory Trivia text box */}
              <div className={`p-4 rounded-xl border text-left space-y-1 ${
                isDarkMode ? 'bg-zinc-950/20 border-zinc-800' : 'bg-slate-50 border-slate-150'
              }`}>
                <div className="flex items-center space-x-1.5 text-[10.5px] font-bold text-zinc-800 dark:text-zinc-200">
                  <BookOpen className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <span>Le Saviez-Vous ?</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>

              {/* Claim / Continue Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {!currentUser ? (
                  <>
                    <button
                      onClick={() => {
                        triggerRegistration();
                        onClose();
                      }}
                      className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold font-display rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer border-0"
                    >
                      Créer un compte & Réclamer
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 py-3.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold font-display rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer border border-zinc-250 dark:border-zinc-750"
                    >
                      Terminer
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onClose}
                    className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold font-display rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer border-0"
                  >
                    Super, Merci !
                  </button>
                )}
              </div>
            </div>
          )}

          {/* REVEALING FAILURE STATE (Incorrect trivia response) */}
          {gameState === 'revealing_failure' && currentQuestion && (
            <div className="space-y-6 py-4 animate-scale-up">
              <div className="h-16 w-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center border-4 border-rose-500/20 mx-auto">
                <AlertCircle className="h-8 w-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-rose-500 uppercase font-display tracking-tight">
                  Ah, Mauvaise Réponse !
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  La bonne réponse était : <strong className="text-emerald-500">{currentQuestion.options[currentQuestion.correctIndex]}</strong>.
                </p>
              </div>

              {/* Explanatory Trivia text box */}
              <div className={`p-4 rounded-xl border text-left space-y-1 ${
                isDarkMode ? 'bg-zinc-950/20 border-zinc-800' : 'bg-slate-50 border-slate-150'
              }`}>
                <div className="flex items-center space-x-1.5 text-[10.5px] font-bold text-zinc-800 dark:text-zinc-200">
                  <BookOpen className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <span>Explications :</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>

              <div className="space-y-1 pt-2">
                <p className="text-[10px] text-zinc-400 leading-tight">
                  Ne vous inquiétez pas ! Chaque rechargement ou souscription de forfait sur Unigo vous offre une nouvelle chance de débloquer des cadeaux.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold font-display rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer border-0"
              >
                Continuer
              </button>
            </div>
          )}

        </div>

        {/* Brand footer inside modal */}
        <div className="bg-zinc-950/40 px-6 py-3.5 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 shrink-0">
          <span>Unigo Ludo-Éducatif Côte d'Ivoire</span>
          <span className="font-mono">Fidélité Approuvée</span>
        </div>
      </div>
    </div>
  );
}
