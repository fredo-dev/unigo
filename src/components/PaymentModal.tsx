/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NetworkId, PaymentMethodId, TelecomBundle } from '../types';
import { PAYMENT_OPERATORS } from '../data';
import { Smartphone, ShieldCheck, X, Check, Loader2, Sparkles, Info, Key, Lock } from 'lucide-react';
import ProviderLogo from './ProviderLogo';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  amount: number;
  fee: number;
  total: number;
  networkName: string;
  networkId: NetworkId;
  serviceType: 'airtime' | 'bundle';
  bundle?: TelecomBundle;
  paymentMethodId: PaymentMethodId;
  onPaymentSuccess: (reference: string) => void;
  onPaymentFailed: (reason: string) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  phone,
  amount,
  fee,
  total,
  networkId,
  serviceType,
  bundle,
  paymentMethodId,
  onPaymentSuccess,
  onPaymentFailed
}: PaymentModalProps) {
  const [step, setStep] = useState<'init' | 'processing' | 'otp' | 'success' | 'failed'>('init');
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [pinCode, setPinCode] = useState('');
  const [isSimulatingNetwork, setIsSimulatingNetwork] = useState(false);

  const operator = paymentMethodId === 'wallet' ? {
    id: 'wallet' as const,
    name: 'Portefeuille Unigo',
    logoColor: 'bg-zinc-950',
    bgColor: 'bg-zinc-900',
    textColor: 'text-amber-400',
    iconName: 'wallet',
    feePercent: 0
  } : (PAYMENT_OPERATORS.find(op => op.id === paymentMethodId) || PAYMENT_OPERATORS[0]);

  useEffect(() => {
    if (!isOpen) {
      setStep('init');
      setOtpCode('');
      setPinCode('');
      return;
    }

    // Auto trigger simulations
    if (step === 'processing') {
      const timer = setTimeout(() => {
        if (paymentMethodId === 'orange_money') {
          setStep('otp'); // Orange money uses OTP in CI (*144*82# flow)
        } else if (paymentMethodId === 'wave' || paymentMethodId === 'mtn_momo' || paymentMethodId === 'moov_money') {
          // Direct USSD push or QR approval
          setStep('otp'); // we can reuse OTP/PIN screen as confirmation
        } else {
          // cash or other
          handleCompleteSuccess();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, step, paymentMethodId]);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleStartPayment = () => {
    setStep('processing');
  };

  const handleVerifyOtpOrPin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulatingNetwork(true);
    
    setTimeout(() => {
      setIsSimulatingNetwork(false);
      // Let's decide success based on a dummy check (default succeeds, unless specific pattern)
      if (paymentMethodId === 'orange_money' && otpCode.length < 4) {
        onPaymentFailed("Le code de validation à 4 chiffres est incomplet.");
        setStep('failed');
      } else if ((paymentMethodId === 'mtn_momo' || paymentMethodId === 'moov_money') && pinCode.length < 4) {
        onPaymentFailed("Le code PIN secret est requis.");
        setStep('failed');
      } else {
        handleCompleteSuccess();
      }
    }, 1800);
  };

  const handleCompleteSuccess = () => {
    const randomRef = 'UG-' + Math.floor(100000 + Math.random() * 900000) + '-' + networkId.toUpperCase().slice(0, 3);
    setStep('success');
    setTimeout(() => {
      onPaymentSuccess(randomRef);
    }, 1500);
  };

  return (
    <div id="payment-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in text-slate-800">
      <div id="payment-modal-card" className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between ${operator.logoColor}`}>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📱</span>
            <div>
              <h2 className="font-semibold text-lg tracking-tight">Portail de Paiement Unigo</h2>
              <p className="text-xs text-white/80">Transaction sécurisée en Côte d'Ivoire</p>
            </div>
          </div>
          <button 
            id="close-payment-modal-btn"
            onClick={onClose} 
            className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* content */}
        <div className="p-6 flex-1">
          {step === 'init' && (
            <div className="space-y-6">
              {/* Summary of what they are buying */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Récapitulatif de la commande</p>
                
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 uppercase mr-2">
                      {networkId}
                    </span>
                    <span className="text-sm font-medium text-slate-700">
                      {serviceType === 'airtime' ? 'Recharge de Crédit Direct' : bundle?.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {amount.toLocaleString()} FCFA
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Bénéficiaire :</span>
                  <span className="font-mono font-semibold">{phone}</span>
                </div>

                <hr className="my-3 border-dashed border-slate-200" />

                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Mode de Paiement :</span>
                  <span className="font-semibold text-slate-700">{operator.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                  <span>Frais de réseau (1%) :</span>
                  <span>{fee.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between items-center font-bold text-slate-900 mt-2 text-base pt-2 border-t border-slate-200">
                  <span>Montant Total à Payer :</span>
                  <span className="text-emerald-600">{total.toLocaleString()} FCFA</span>
                </div>
              </div>

              {/* Payment instructions */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3 text-sm text-slate-600">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                  <p>
                    Veuillez cliquer sur le bouton ci-dessous pour déclencher le prélèvement sécurisé sur votre portefeuille de paiement <strong>{operator.name}</strong>.
                  </p>
                </div>
                
                {paymentMethodId === 'wave' && (
                  <div className="border border-cyan-200 bg-cyan-50/50 rounded-lg p-3 text-xs text-cyan-800 flex items-start space-x-2">
                    <Info className="h-4 w-4 shrink-0 text-cyan-600 mt-0.5" />
                    <span><strong>Wave Côte d'Ivoire :</strong> Une notification push de validation sera envoyée sur votre compte Wave lié ou un code QR s'affichera.</span>
                  </div>
                )}
                {paymentMethodId === 'orange_money' && (
                  <div className="border border-orange-200 bg-orange-50 rounded-lg p-3 text-xs text-orange-800 flex items-start space-x-2">
                    <Key className="h-4 w-4 shrink-0 text-orange-650 mt-0.5" />
                    <span><strong>Orange Money :</strong> Générez votre code temporaire à 4 chiffres en composant le <code className="bg-orange-100 px-1 py-0.5 rounded font-bold">#144*82#</code> sur votre mobile avant de valider.</span>
                  </div>
                )}
                {paymentMethodId === 'mtn_momo' && (
                  <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 text-xs text-amber-800 flex items-start space-x-2">
                    <Lock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <span><strong>MTN MoMo :</strong> Vous recevrez une invitation de saisie de votre code PIN secret à 5 chiffres de manière sécurisée sur votre mobile.</span>
                  </div>
                )}
              </div>

              <button
                id="trigger-simulation-btn"
                onClick={handleStartPayment}
                className="w-full py-3.5 px-4 bg-slate-900 text-white rounded-xl font-medium tracking-wide hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
              >
                <span>Valider et Payer {total.toLocaleString()} FCFA</span>
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="h-12 w-12 text-slate-800 animate-spin" />
              <div>
                <h3 className="font-semibold text-lg text-slate-900">Communication avec {operator.name}...</h3>
                <p className="text-sm text-slate-500 mt-1">Envoi de la demande de facturation en direct à Abidjan</p>
              </div>
              <p className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                Protocole sécurisé TLS v1.3
              </p>
            </div>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtpOrPin} className="space-y-6">
              {paymentMethodId === 'orange_money' ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <ProviderLogo id="orange_money" className="w-12 h-12 mx-auto" />
                    <h3 className="font-semibold text-lg text-slate-900 mt-2">Saisie du Code de Validation</h3>
                    <p className="text-sm text-slate-500">
                      Entrez le code temporaire obtenu via <span className="font-bold text-orange-600">#144*82#</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider block">Code secret à 4 chiffres</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Ex: 5821"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center text-2xl tracking-widest font-mono py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="mb-3 flex justify-center">
                      <ProviderLogo id={paymentMethodId} className="w-14 h-14 rounded-xl shadow-md shrink-0" />
                    </div>
                    <h3 className="font-semibold text-lg text-slate-900">Demande d'autorisation reçue</h3>
                    <p className="text-sm text-slate-500">
                      {paymentMethodId === 'wave' 
                        ? "Veuillez confirmer en entrant le code PIN de validation (4 chiffres)"
                        : "Saisissez votre code PIN secret de portefeuille pour valider le débit"
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider block">Code PIN de Validation</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center text-2xl tracking-widest font-mono py-3 border-2 border-slate-200 rounded-xl focus:border-slate-800 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <span>Expiration de la session</span>
                <span className="font-mono text-slate-700 font-semibold">{countdown}s</span>
              </div>

              <button
                type="submit"
                disabled={isSimulatingNetwork}
                className="w-full py-3.5 px-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSimulatingNetwork ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Communication bancaire en cours...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Confirmer et Autoriser le Paiement</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('init')}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 transition-colors text-center font-medium block"
              >
                Retour aux options de règlement
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4 animate-scale-up">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border-4 border-emerald-50">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900">Paiement Validé !</h3>
                <p className="text-sm text-slate-500 mt-1">Le prélèvement de {total.toLocaleString()} FCFA a bien été effectué.</p>
              </div>
              <p className="text-xs text-slate-400 animate-pulse font-medium">
                Génération immédiate du crédit / forfait réseaux...
              </p>
            </div>
          )}

          {step === 'failed' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center border-4 border-rose-50">
                <X className="h-8 w-8 stroke-[3]" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Échec du Paiement</h3>
                <p className="text-sm text-rose-600 mt-1">Données incorrectes ou solde insuffisant.</p>
              </div>
              <button
                onClick={() => setStep('init')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
              >
                Réessayer la transaction
              </button>

              <div className="pt-2 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed space-y-1.5 border-t border-slate-100 w-full">
                <p>Besoin d'aide ? Contactez notre assistance WhatsApp :</p>
                <a 
                  href="https://wa.me/2250596742870?text=Bonjour,%20j'ai%20rencontr%C3%A9%20un%20probl%C3%A8me%20avec%20un%20transfert%20sur%20Unigo."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-xs shadow-sm mt-1 hover:scale-103"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.13-1.347a9.96 9.96 0 0 0 4.88 1.274h.005c5.505 0 9.99-4.478 9.99-9.985 0-2.67-1.037-5.18-2.92-7.062C17.201 3.002 14.69 2 12.012 2zm5.727 14.043c-.315.885-1.543 1.623-2.11 1.734-.51.1-1.173.166-3.37-.745-2.808-1.164-4.604-4.015-4.744-4.202-.14-.187-1.137-1.513-1.137-2.885 0-1.372.715-2.046 1.012-2.35.253-.258.68-.386 1.082-.386.13 0 .247.006.347.01.296.012.443.028.638.497.243.585.83 2.02.9 2.162.071.14.119.305.027.49-.092.185-.138.303-.276.463-.137.16-.29.356-.413.477-.138.136-.282.285-.12.564.163.28.72 1.183 1.544 1.916.824.73 1.517.954 1.791 1.092.274.137.433.114.594-.07.16-.184.68-.79.863-1.063.183-.273.366-.228.617-.137.25.09 1.59.748 1.864.885.275.137.458.206.527.32.068.114.068.663-.247 1.548z" />
                  </svg>
                  <span>WhatsApp : +225 05 96 74 28 70</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Brand footer inside modal */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Partenaire certifié APis Côte d'Ivoire</span>
          <span className="font-mono">Unigo Secure Layer</span>
        </div>
      </div>
    </div>
  );
}
