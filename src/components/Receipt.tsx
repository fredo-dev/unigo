/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction } from '../types';
import { TELECOM_NETWORKS } from '../data';
import { Printer, Check, PhoneCall, RefreshCw, Layers, Award, ShieldCheck, Mail, FileSpreadsheet, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import ProviderLogo from './ProviderLogo';
import { googleSignIn, getAccessToken } from '../lib/googleAuth';
import { sendGmailReceipt, createGoogleSheetExport } from '../lib/workspace';

interface ReceiptProps {
  transaction: Transaction;
  onNewTransaction: () => void;
}

export default function Receipt({ transaction, onNewTransaction }: ReceiptProps) {
  const network = TELECOM_NETWORKS.find(n => n.id === transaction.networkId);
  const [isGmailSending, setIsGmailSending] = useState(false);
  const [isSheetsExporting, setIsSheetsExporting] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [recipientEmailInput, setRecipientEmailInput] = useState('');
  
  // Custom USSD balance checker for Ivory Coast
  const getBalanceUssd = () => {
    switch (transaction.networkId) {
      case 'orange': return '*122# (Portefeuille) ou *149# (Forfaits)';
      case 'mtn': return '*100# (Crédit) ou *105# (Forfaits)';
      case 'moov': return '*130# (Solde) ou *303# (Forfaits)';
      default: return '*100#';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const confirmAndSendGmail = async () => {
    setShowGmailModal(false);
    setIsGmailSending(true);
    setGmailStatus(null);

    try {
      let token = getAccessToken();
      let emailToUse = recipientEmailInput;

      if (!token) {
        const authRes = await googleSignIn();
        if (authRes) {
          token = authRes.accessToken;
          if (!emailToUse) emailToUse = authRes.user.email || '';
        }
      }

      if (!token) throw new Error('Authentification Google requise.');
      if (!emailToUse) throw new Error('Veuillez spécifier une adresse email valide.');

      await sendGmailReceipt(
        token,
        emailToUse,
        `Unigo.ci - Reçu de Transaction ${transaction.reference}`,
        {
          id: transaction.id || transaction.reference,
          type: transaction.serviceType,
          operator: network?.name || transaction.networkId,
          phone: transaction.phone,
          amount: transaction.amount,
          date: transaction.date || new Date().toLocaleDateString('fr-FR'),
          status: transaction.status,
        }
      );

      setGmailStatus(`Reçu envoyé par Gmail à ${emailToUse} !`);
    } catch (err: any) {
      console.error('Gmail send error:', err);
      alert(`Erreur Gmail : ${err.message || 'Échec de l\'envoi'}`);
    } finally {
      setIsGmailSending(false);
    }
  };

  const confirmAndExportSheets = async () => {
    setShowSheetsModal(false);
    setIsSheetsExporting(true);
    setSheetUrl(null);

    try {
      let token = getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        if (authRes) token = authRes.accessToken;
      }

      if (!token) throw new Error('Authentification Google requise.');

      const result = await createGoogleSheetExport(
        token,
        `Unigo - Ticket ${transaction.reference}`,
        [
          {
            id: transaction.id || transaction.reference,
            type: transaction.serviceType,
            operator: network?.name || transaction.networkId,
            phone: transaction.phone,
            amount: transaction.amount,
            date: transaction.date || new Date().toLocaleDateString('fr-FR'),
            status: transaction.status,
          },
        ]
      );

      setSheetUrl(result.spreadsheetUrl);
    } catch (err: any) {
      console.error('Sheets export error:', err);
      alert(`Erreur Google Sheets : ${err.message || 'Échec de l\'exportation'}`);
    } finally {
      setIsSheetsExporting(false);
    }
  };

  return (
    <div id="receipt-container" className="max-w-md mx-auto bg-white rounded-lg border border-zinc-200/85 flex flex-col my-8 animate-scale-up text-zinc-900 geometric-card-shadow">
      {/* Upper Ticket Part */}
      <div className="relative p-6 pt-8 pb-4 text-center border-b border-dashed border-zinc-200 bg-zinc-50/50">
        <div className="mx-auto w-10 h-10 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-200">
          <Check className="h-5 w-5 stroke-[3]" />
        </div>
        
        <h3 className="font-bold text-sm font-display uppercase tracking-wider text-zinc-900">Souscription Réussie</h3>
        <p className="text-[11px] text-zinc-400 mt-1">Le transfert de crédit a été effectué avec succès.</p>

        <div className="mt-4 inline-block px-3 py-1 bg-white border border-zinc-200 rounded text-[10px] font-mono font-bold text-zinc-650 tracking-wide">
          REF: <span className="text-zinc-950 font-black">{transaction.reference}</span>
        </div>

        {/* Brand logo tag */}
        <div className="absolute top-4 right-4 text-[10px] font-bold font-mono text-zinc-300">
          unigo.ci
        </div>
        
        {/* Left/Right punch holes for realistic ticket effect */}
        <div className="absolute -bottom-3.5 -left-3.5 w-7 h-7 bg-zinc-100 rounded-full border border-zinc-200"></div>
        <div className="absolute -bottom-3.5 -right-3.5 w-7 h-7 bg-zinc-100 rounded-full border border-zinc-200"></div>
      </div>

      {/* Ticket Details Body */}
      <div className="p-6 space-y-5 flex-1 select-all font-sans">
        <div className="space-y-3">
          {/* Main Price Accent */}
          <div className="text-center py-2 border-b border-zinc-100 pb-4">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-display block">MONTANT DE RECHARGE CRÉDITÉ</span>
            <span className="text-3xl font-extrabold text-zinc-900 tracking-tight font-mono">
              {transaction.amount.toLocaleString()} <span className="text-lg">FCFA</span>
            </span>
          </div>

          <div className="divide-y divide-zinc-100 text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-zinc-400 font-sans">Réseau Télécom</span>
              <span className="font-bold font-display text-zinc-850 flex items-center space-x-2">
                <ProviderLogo id={transaction.networkId} className="w-5 h-5 rounded-sm shrink-0" />
                <span>{network?.name}</span>
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-zinc-400 font-sans">Numéro Bénéficiaire</span>
              <span className="font-mono font-bold text-zinc-805">{transaction.phone}</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-zinc-400 font-sans">Type de Service</span>
              <span className="font-bold text-zinc-800 uppercase text-[9px] tracking-wider px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200/50 font-display">
                {transaction.serviceType === 'airtime' ? 'Recharge d\'unités' : 'Achat de forfait'}
              </span>
            </div>

            {transaction.bundleName && (
              <div className="py-2.5 flex justify-between items-center bg-zinc-50 px-2 rounded border border-zinc-200/75">
                <span className="text-zinc-500 text-[10px] font-bold uppercase font-display">Forfait Choisi :</span>
                <span className="font-bold text-zinc-950 text-xs truncate max-w-[200px]">
                  {transaction.bundleName}
                </span>
              </div>
            )}

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-zinc-400 font-sans">Moyen de Paiement</span>
              <span className="font-bold font-display text-zinc-805 flex items-center space-x-1.5 capitalize">
                <ProviderLogo id={transaction.paymentMethod} className="w-5 h-5 rounded-sm shrink-0" />
                <span>{transaction.paymentMethod.replace('_', ' ')}</span>
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center font-mono text-zinc-650">
              <span className="text-zinc-400 font-sans">Frais d'Opérateur (1%)</span>
              <span className="font-bold">+{transaction.fee.toLocaleString()} FCFA</span>
            </div>

            <div className="py-3 flex justify-between items-center text-sm pt-3 border-t border-zinc-200">
              <span className="font-bold font-display uppercase tracking-wide text-zinc-900">Total payé</span>
              <span className="font-bold text-emerald-600 font-mono text-base">{transaction.total.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        {/* Action USSD codes helper */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-1.5 text-xs text-zinc-650">
          <div className="flex items-center space-x-2 font-bold font-display uppercase text-zinc-900">
            <Layers className="h-4 w-4 text-zinc-600" />
            <span>Comment vérifier votre solde ?</span>
          </div>
          <p className="leading-relaxed font-sans">
            Un SMS officiel de confirmation vous a été envoyé par {network?.name}. Pour vérifier manuellement, composez sur votre mobile :
          </p>
          <div className="mt-2 text-center bg-white border border-zinc-200 py-1.5 rounded font-mono font-bold text-[13px] text-zinc-900 select-all">
            {getBalanceUssd()}
          </div>
        </div>

        {/* Workspace Notifications Status */}
        {gmailStatus && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{gmailStatus}</span>
          </div>
        )}

        {sheetUrl && (
          <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-lg text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Exporté vers Google Sheets !</span>
            </div>
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded text-[10px] hover:bg-blue-700 transition-colors uppercase tracking-wider"
            >
              Ouvrir
            </a>
          </div>
        )}

        {/* Workspace Integration Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1 font-display uppercase tracking-wider text-[10px]">
          <button
            type="button"
            onClick={() => setShowGmailModal(true)}
            disabled={isGmailSending}
            className="py-2.5 px-3 border border-red-200 bg-red-50/50 hover:bg-red-100/50 text-red-700 rounded-lg font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {isGmailSending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Mail className="h-3.5 w-3.5 text-red-600" />
            )}
            <span>Reçu par Gmail</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSheetsModal(true)}
            disabled={isSheetsExporting}
            className="py-2.5 px-3 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-700 rounded-lg font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSheetsExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            )}
            <span>Export Sheets</span>
          </button>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5 pt-1 font-display uppercase tracking-wider text-[10px]">
          <button
            id="print-receipt-btn"
            onClick={handlePrint}
            className="w-full py-2.5 border border-zinc-200 hover:border-zinc-350 rounded-lg font-bold text-zinc-750 hover:bg-zinc-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Printer className="h-4 w-4 text-zinc-500" />
            <span>Imprimer / Exporter le Ticket</span>
          </button>

          <button
            id="new-transaction-btn"
            onClick={onNewTransaction}
            className="w-full py-3.5 bg-zinc-900 text-white hover:bg-zinc-850 rounded-lg font-bold text-xs transition-all shadow flex items-center justify-center space-x-2 cursor-pointer font-display"
          >
            <span>Faire un Autre Transfert</span>
          </button>
        </div>

        {/* Modal Gmail Confirmation */}
        {showGmailModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 text-left border border-zinc-200 shadow-2xl animate-scale-up">
              <div className="flex items-center space-x-2 text-red-600">
                <Mail className="h-5 w-5" />
                <h4 className="font-bold text-base font-display">Envoyer le Reçu via Gmail</h4>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Voulez-vous envoyer ce reçu de transaction officiel directement à votre boîte Gmail ?
              </p>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                  Adresse email du destinataire
                </label>
                <input
                  type="email"
                  value={recipientEmailInput}
                  onChange={(e) => setRecipientEmailInput(e.target.value)}
                  placeholder="exemple@gmail.com"
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowGmailModal(false)}
                  className="px-4 py-2 border border-zinc-200 rounded hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmAndSendGmail}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer transition-colors"
                >
                  Confirmer et Envoyer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Sheets Confirmation */}
        {showSheetsModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 text-left border border-zinc-200 shadow-2xl animate-scale-up">
              <div className="flex items-center space-x-2 text-emerald-600">
                <FileSpreadsheet className="h-5 w-5" />
                <h4 className="font-bold text-base font-display">Créer un Google Sheet</h4>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Voulez-vous exporter cette transaction vers une nouvelle feuille de calcul Google Sheets dans votre Google Drive ?
              </p>
              <div className="flex justify-end space-x-2 pt-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowSheetsModal(false)}
                  className="px-4 py-2 border border-zinc-200 rounded hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmAndExportSheets}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer transition-colors"
                >
                  Confirmer et Exporter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Safety message */}
      <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 text-center text-[10px] text-zinc-400 flex items-center justify-center space-x-1.5 font-mono uppercase tracking-wide">
        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
        <span>Garantie Unigo : Expédié instantanément sous protocole SSL.</span>
      </div>
    </div>
  );
}
