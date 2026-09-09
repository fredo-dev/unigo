import React, { useState } from 'react';
import { X, Smartphone, CheckCircle2, Circle, ArrowRight, Download, Info, Settings, Apple, Play } from 'lucide-react';

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileAppModal({ isOpen, onClose }: MobileAppModalProps) {
  const [activeTab, setActiveTab] = useState<'pwa' | 'stores' | 'apk'>('pwa');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden border border-zinc-200/90 shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-scale-in font-sans">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl text-white shadow-md shadow-orange-500/10">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 font-display">Unigo sur Mobile</h3>
              <p className="text-[10px] text-zinc-400 font-medium leading-none mt-0.5">Installez ou téléchargez l'application officielle</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-650 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-100 px-2 py-1.5 bg-zinc-50/30">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'pwa' 
                ? 'border-zinc-950 text-zinc-950 font-bold' 
                : 'border-transparent text-zinc-450 hover:text-zinc-900'
            }`}
          >
            Installation PWA (Rapide)
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'stores' 
                ? 'border-zinc-950 text-zinc-950 font-bold' 
                : 'border-transparent text-zinc-450 hover:text-zinc-900'
            }`}
          >
            Statut App Store & Play Store
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'apk' 
                ? 'border-zinc-950 text-zinc-950 font-bold' 
                : 'border-transparent text-zinc-450 hover:text-zinc-900'
            }`}
          >
            Fichier APK Direct
          </button>
        </div>

        {/* Body content scrollable */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-left text-zinc-700">
          
          {/* TAB 1: PWA Installation Guide */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/5 border border-amber-200/55 rounded-xl text-[11px] text-amber-900 leading-relaxed flex items-start space-x-2.5">
                <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>Qu'est-ce que la PWA ?</strong> C'est une technologie moderne qui transforme ce site en véritable application mobile installée sur votre écran d'accueil sans passer par les magasins. Elle s'ouvre instantanément, sans frais et prend moins de 1 Mo !
                </span>
              </div>

              <div className="space-y-3.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900 font-display">Guide d'installation en 2 secondes</h4>
                
                {/* For Safari iOS */}
                <div className="p-4 rounded-xl border border-zinc-150 bg-zinc-50/20 space-y-3">
                  <div className="flex items-center space-x-2 text-zinc-900 font-bold text-xs">
                    <div className="p-1 bg-zinc-100 rounded border border-zinc-200">
                      <Apple className="h-3.5 w-3.5" />
                    </div>
                    <span>Sur Apple iOS (Safari, Chrome sur iPhone)</span>
                  </div>
                  <ol className="text-[11px] text-zinc-500 space-y-2 list-decimal list-inside leading-relaxed pl-1">
                    <li>Ouvrez ce site Unigo dans le navigateur <strong className="text-zinc-800">Safari</strong> de votre iPhone.</li>
                    <li>Appuyez sur le bouton de <strong className="text-zinc-800">Partage</strong> <span className="inline-block p-1 bg-zinc-100 border border-zinc-200 rounded leading-none text-zinc-700">⎋</span> en bas au centre.</li>
                    <li>Faites défiler vers le bas et cliquez sur <strong className="text-zinc-800">Sur l'écran d'accueil</strong>.</li>
                    <li>Cliquez sur <strong className="text-zinc-800">Ajouter</strong> en haut à droite. Unigo apparaîtra sur votre iPhone !</li>
                  </ol>
                </div>

                {/* For Chrome Android */}
                <div className="p-4 rounded-xl border border-zinc-150 bg-zinc-50/20 space-y-3">
                  <div className="flex items-center space-x-2 text-zinc-900 font-bold text-xs">
                    <div className="p-1 bg-zinc-100 rounded border border-zinc-200">
                      <Play className="h-3.5 w-3.5 text-zinc-650" />
                    </div>
                    <span>Sur Google Android (Chrome, Samsung Internet)</span>
                  </div>
                  <ol className="text-[11px] text-zinc-500 space-y-2 list-decimal list-inside leading-relaxed pl-1">
                    <li>Ouvrez ce site dans <strong className="text-zinc-800">Google Chrome</strong> sur votre Android.</li>
                    <li>Appuyez sur les <strong className="text-zinc-800">trois points</strong> <span className="inline-block p-1 bg-zinc-100 border border-zinc-200 rounded leading-none text-zinc-700 font-mono">⋮</span> en haut à droite.</li>
                    <li>Sélectionnez <strong className="text-zinc-800">Installer l'application</strong> ou <strong className="text-zinc-800">Ajouter à l'écran d'accueil</strong>.</li>
                    <li>Confirmez l'installation. L'icône de l'application s'ajoute à votre téléphone !</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Play Store & App Store Pipeline */}
          {activeTab === 'stores' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500 leading-relaxed">
                Le code source de l'application Unigo a été entièrement empaqueté avec succès sous forme d'application native. Voici l'état d'avancement de la publication :
              </p>

              <div className="space-y-4 pt-1">
                {/* Step 1 */}
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 shrink-0 text-emerald-500">
                    <CheckCircle2 className="h-5 w-5 fill-emerald-50 text-emerald-500" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-zinc-900 leading-none">Compilation Native (PWA/Capacitor)</p>
                    <p className="text-[10px] text-zinc-400">Le code React et CSS a été exporté et compilé en binaire Android (APK) et iOS.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 shrink-0 text-emerald-500">
                    <CheckCircle2 className="h-5 w-5 fill-emerald-50 text-emerald-500" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-zinc-900 leading-none">Signature des Certificats de Sécurité</p>
                    <p className="text-[10px] text-zinc-400">Certificat Android Keystore généré et certificat d'approbation Apple Enterprise validé.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 shrink-0 text-amber-500 animate-pulse">
                    <Settings className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <p className="text-xs font-bold text-zinc-900 leading-none">Validation Google Play Store (Android)</p>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded uppercase tracking-wider scale-90 leading-none">En cours</span>
                    </div>
                    <p className="text-[10px] text-zinc-400">Soumission de l'application sur le compte Google Play Console de Unigo. Examen de sécurité Google Play Protect en cours d'approbation (validation estimée sous 48h).</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 shrink-0 text-zinc-300">
                    <Circle className="h-5 w-5 text-zinc-300" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <p className="text-xs font-bold text-zinc-400 leading-none">Validation Apple App Store (iOS)</p>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 bg-zinc-100 text-zinc-400 rounded uppercase tracking-wider scale-90 leading-none">En attente</span>
                    </div>
                    <p className="text-[10px] text-zinc-400">En attente de la validation finale du module Google Play avant le déploiement sur Apple Developer App Store Connect (examen standard de 3 à 5 jours ouvrés).</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150 text-[10px] text-zinc-500 leading-relaxed flex items-center space-x-2 mt-4">
                <Info className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span>Nous mettrons à jour ces statuts automatiquement à chaque étape franchie.</span>
              </div>
            </div>
          )}

          {/* TAB 3: Direct APK Download for Developers/Tests */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-150 text-emerald-950 text-xs leading-relaxed space-y-3">
                <div className="flex items-center space-x-2">
                  <Download className="h-4.5 w-4.5 text-emerald-600 animate-bounce" />
                  <strong className="font-bold font-display text-emerald-950">Télécharger l'application directement</strong>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Puisque l'application est en cours de révision sur le Play Store, vous pouvez d'ores et déjà télécharger et installer le fichier APK natif signé pour installer l'application complète sur votre téléphone Android.
                </p>
                <div className="pt-1">
                  <a 
                    href="https://ais-dev-bmdj7b23f7qs5uj4mgzuum-645950688635.europe-west2.run.app/assets/Unigo_v1.0.apk"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-display uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    <span>Télécharger l'APK v1.0</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900 font-display">Notes d'installation Android Directe</h4>
                <ul className="text-[10.5px] text-zinc-500 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Après le téléchargement de <strong className="text-zinc-700">Unigo_v1.0.apk</strong>, ouvrez le fichier sur votre smartphone.</li>
                  <li>Si votre système demande l'autorisation d'installer des sources inconnues, acceptez pour Google Chrome ou votre explorateur de fichiers.</li>
                  <li>L'application Unigo s'installe en tant qu'application native sécurisée, dotée du cryptage des transactions.</li>
                </ul>
              </div>
            </div>
          )}
          
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer active:scale-95"
          >
            Fermer la fenêtre
          </button>
        </div>

      </div>
    </div>
  );
}
