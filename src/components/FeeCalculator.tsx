/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PAYMENT_OPERATORS } from '../data';
import { Calculator, TrendingUp, Info, HelpCircle } from 'lucide-react';
import ProviderLogo from './ProviderLogo';

export default function FeeCalculator() {
  const [calculateAmount, setCalculateAmount] = useState<string>('5000');

  const getFeesForOperator = (operatorId: string, amount: number) => {
    // Wave has 1% fee flat. Orange, MTN and Moov money standard fees can vary,
    // but in recent years competition has pushed pricing to be around 1% for transfers as well.
    // Let's model a realistic breakdown:
    if (amount <= 0) return 0;
    switch (operatorId) {
      case 'wave':
        return Math.round(amount * 0.01); // 1%
      case 'orange_money':
        return Math.round(amount * 0.011); // 1.1%
      case 'mtn_momo':
        return Math.round(amount * 0.012); // 1.2%
      case 'moov_money':
        return Math.round(amount * 0.009); // Moov sometimes has promotions at 0.9%
      default:
        return 0;
    }
  };

  const amountVal = parseFloat(calculateAmount) || 0;

  return (
    <div id="fee-calculator-card" className="bg-white rounded-xl p-6 border border-zinc-200/85 space-y-5 text-zinc-805 geometric-card-shadow">
      <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg text-white border border-orange-400 shadow-sm shadow-orange-500/10">
          <Calculator className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-sm font-display uppercase tracking-wider text-zinc-900">Calculateur Unigo</h3>
          <p className="text-[11px] text-zinc-400">Estimez les frais de transfert et comparez les solutions d'un clic</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Input */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Montant de la recharge (FCFA)</label>
          <div className="relative">
            <input
              type="number"
              value={calculateAmount}
              onChange={(e) => setCalculateAmount(e.target.value)}
              placeholder="Saisissez un montant (ex: 2000)"
              className="w-full text-base font-mono font-bold bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400 text-xs font-mono">FCFA</span>
          </div>
        </div>

        {/* Comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {PAYMENT_OPERATORS.filter(op => op.id !== 'cash').map(op => {
            const calculatedFee = getFeesForOperator(op.id, amountVal);
            const totalWithFee = amountVal + calculatedFee;
            return (
              <div key={op.id} className="p-4 rounded-lg border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 flex items-center space-x-2 font-display">
                    <ProviderLogo id={op.id} className="w-5 h-5 rounded-sm shrink-0" />
                    <span>{op.name}</span>
                  </span>
                  <span className="text-[8px] bg-zinc-200 text-zinc-650 px-1.5 py-0.2 rounded font-mono font-bold uppercase">
                    {op.id === 'wave' ? '1% Flat' : 'Std'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1 font-mono text-xs">
                  <span className="text-[11px] text-zinc-400 uppercase font-sans">Frais :</span>
                  <span className="text-zinc-800 font-bold">
                    +{calculatedFee} F
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1 border-t border-zinc-200/50 font-bold text-xs text-zinc-900">
                  <span className="text-[10px] uppercase font-sans font-bold text-zinc-500">Total :</span>
                  <span className="font-mono text-zinc-900 font-extrabold">
                    {totalWithFee.toLocaleString()} F
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-zinc-50 rounded-lg flex items-start space-x-2 text-[10px] text-zinc-500 leading-relaxed border border-zinc-200 text-left font-sans">
          <Info className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
          <p>
            Les frais affichés sont calculés selon les grilles de l'ARTCI (Autorité de Régulation de Côte d'Ivoire). Unigo.ci vous fait bénéficier d'un tarif optimisé à 1% sur l'ensemble de ses intégrations.
          </p>
        </div>
      </div>
    </div>
  );
}
