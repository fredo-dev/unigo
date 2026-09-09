import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Gift, ArrowRight, ExternalLink, Volume2, Info, X } from 'lucide-react';
import ProviderLogo from './ProviderLogo';

interface Ad {
  id: string;
  title: string;
  sponsor: string;
  description: string;
  ctaText: string;
  badge: string;
  bgGradient: string;
  accentColor: string;
  logoId: string;
  promoCode?: string;
  link?: string;
  imageUrl?: string;
}

const SPONSORED_ADS: Ad[] = [
  {
    id: 'wave-ad',
    sponsor: 'Wave Côte d\'Ivoire',
    title: 'Moins de frais, plus de sourires 🐧',
    description: 'Bénéficiez du taux unique de 1% sur tous vos transferts nationaux. Aucun frais de dépôt ni retrait dans toute la Côte d\'Ivoire !',
    ctaText: 'Recharger via Wave',
    badge: 'SPONSORISÉ • OFFRE RECOMMANDÉE',
    bgGradient: 'from-cyan-500/10 via-sky-500/5 to-transparent border-cyan-200/60',
    accentColor: 'text-cyan-600',
    logoId: 'wave',
    promoCode: 'WAVE1PERCENT',
    imageUrl: '/src/assets/images/ad_man_surprise_1782908204860.jpg'
  },
  {
    id: 'orange-ad',
    sponsor: 'Orange Money Côte d\'Ivoire',
    title: '10% de Bonus Crédit offert 🍊',
    description: 'Chaque mercredi et vendredi, rechargez votre compte Orange Money sur Unigo et gagnez instantanément +10% de bonus d\'appel gratuit !',
    ctaText: 'Obtenir mon Bonus',
    badge: 'PUBLICITÉ • PROMO FLASH',
    bgGradient: 'from-orange-500/10 via-amber-500/5 to-transparent border-orange-200/60',
    accentColor: 'text-orange-650',
    logoId: 'orange_money',
    promoCode: 'ORANGEPLUS',
    imageUrl: '/src/assets/images/ad_woman_phone_1782908174288.jpg'
  },
  {
    id: 'momo-ad',
    sponsor: 'MTN Mobile Money',
    title: 'Nouveaux forfaits MoMo Mix 💛',
    description: 'Achetez vos forfaits internet haut débit directement en ligne. Zéro tracas, validation instantanée sur votre numéro MTN Côte d\'Ivoire.',
    ctaText: 'Acheter Forfait MTN',
    badge: 'PUBLI-INFO • OFFRE PARTENAIRE',
    bgGradient: 'from-yellow-500/10 via-amber-400/5 to-transparent border-yellow-300/60',
    accentColor: 'text-amber-700',
    logoId: 'mtn_momo',
    promoCode: 'MOMOMIX225',
    imageUrl: '/src/assets/images/ad_woman_headset_1782908190493.jpg'
  },
  {
    id: 'moov-ad',
    sponsor: 'Moov Africa CI',
    title: 'Internet Ultra Data 28 Go ! 💙',
    description: 'Besoin de connexion à Abidjan ou à l\'intérieur ? Profitez du pack mensuel de 28 Go à 9,900 FCFA seulement. Réseau stable v3.',
    ctaText: 'Souscrire Moov Pro',
    badge: 'PUBLICITÉ • OFFRE EXCLUSIVE',
    bgGradient: 'from-blue-600/10 via-indigo-500/5 to-transparent border-blue-200/60',
    accentColor: 'text-blue-600',
    logoId: 'moov_money',
    promoCode: 'MOOVPRO',
    imageUrl: '/src/assets/images/ad_woman_phone_1782908174288.jpg'
  }
];

export default function AdBanners({ 
  onSelectMethod, 
  onSelectNetwork 
}: { 
  onSelectMethod?: (method: 'wave' | 'orange_money' | 'mtn_momo' | 'moov_money') => void;
  onSelectNetwork?: (network: 'orange' | 'mtn' | 'moov') => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [clickedPromo, setClickedPromo] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SPONSORED_ADS.length);
    }, 8000); // Auto rotate every 8 seconds
    return () => clearInterval(timer);
  }, []);

  const activeAd = SPONSORED_ADS[currentIndex];

  const handleApplyPromo = (ad: Ad) => {
    setClickedPromo(ad.promoCode || null);
    
    // Auto configure filters to reflect advertisement
    if (ad.id === 'wave-ad' && onSelectMethod) {
      onSelectMethod('wave');
    } else if (ad.id === 'orange-ad' && onSelectMethod && onSelectNetwork) {
      onSelectNetwork('orange');
      onSelectMethod('orange_money');
    } else if (ad.id === 'momo-ad' && onSelectMethod && onSelectNetwork) {
      onSelectNetwork('mtn');
      onSelectMethod('mtn_momo');
    } else if (ad.id === 'moov-ad' && onSelectMethod && onSelectNetwork) {
      onSelectNetwork('moov');
      onSelectMethod('moov_money');
    }

    // Reset indicator after some seconds
    setTimeout(() => {
      setClickedPromo(null);
    }, 4500);
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 text-zinc-900">
          <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500 animate-pulse" />
          <h3 className="font-bold text-xs uppercase tracking-wider font-display">Offres Spéciales & Publicités</h3>
        </div>
        <div className="flex space-x-1.5 items-center">
          {SPONSORED_ADS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-4 bg-zinc-800' : 'w-1.5 bg-zinc-300 hover:bg-zinc-400'
              }`}
              aria-label={`Aller au slide de pub ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Main interactive Banner body */}
      <div className={`p-5 rounded-xl border relative transition-all duration-500 overflow-hidden bg-white ${activeAd.bgGradient} geometric-card-shadow`}>
        
        {/* Floating SPONSOR badge */}
        <span className="absolute top-4 right-4 text-[7.5px] font-bold font-mono text-zinc-400 bg-zinc-100 hover:bg-zinc-200 transition-colors px-2 py-0.5 rounded border border-zinc-200 uppercase tracking-widest pointer-events-none select-none">
          {activeAd.badge}
        </span>

        <div className="flex flex-col md:flex-row gap-5 items-stretch">
          <div className="flex items-start space-x-4 flex-1">
            <div className="shrink-0 p-1 bg-white rounded-xl shadow-xs border border-zinc-150">
              <ProviderLogo id={activeAd.logoId} className="w-12 h-12 rounded-lg" />
            </div>

            <div className="space-y-1.5 text-left flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-mono font-black tracking-wider text-zinc-400">{activeAd.sponsor}</span>
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              </div>
              
              <h4 className="font-extrabold text-sm text-zinc-900 leading-tight font-display pr-12">
                {activeAd.title}
              </h4>
              
              <p className="text-[11px] text-zinc-500 leading-relaxed pr-2">
                {activeAd.description}
              </p>

              <div className="pt-2 flex flex-wrap gap-2.5 items-center">
                <button
                  onClick={() => handleApplyPromo(activeAd)}
                  className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-850 text-white rounded font-bold font-display uppercase tracking-wider text-[10px] transition-all flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <span>{activeAd.ctaText}</span>
                  <ArrowRight className="h-3 w-3 stroke-[2]" />
                </button>

                {activeAd.promoCode && (
                  <div className="bg-zinc-100 hover:bg-zinc-200/70 border border-zinc-200 rounded px-2.5 py-1 text-[10px] font-mono text-zinc-600 font-bold select-all flex items-center space-x-1 cursor-help" title="Cliquez pour copier le code partenaire">
                    <span>CODE :</span>
                    <span className="text-zinc-900 underline decoration-dashed">{activeAd.promoCode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {activeAd.imageUrl && (
            <div className="w-full md:w-32 h-28 md:h-auto rounded-xl overflow-hidden shadow-sm relative shrink-0 border border-zinc-150">
              <img 
                src={activeAd.imageUrl} 
                alt={activeAd.title}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
            </div>
          )}
        </div>

        {/* Dynamic applied callback alert popup */}
        {clickedPromo && (
          <div className="absolute inset-0 bg-zinc-900/95 text-white flex flex-col items-center justify-center text-center p-4 animate-fade-in z-10">
            <Gift className="h-8 w-8 text-amber-400 animate-bounce mb-1" />
            <h5 className="font-bold text-xs uppercase font-display tracking-wider text-white">Promotion Activée avec succès !</h5>
            <p className="text-[10px] text-zinc-300 mt-1 max-w-sm">
              Code de réduction <strong className="font-mono text-amber-300 font-bold text-xs">{clickedPromo}</strong> appliqué ! L'opérateur et le mode de facturation ont été pré-configurés.
            </p>
          </div>
        )}
      </div>

      {/* Secondary mini Sponsor banner */}
      <div className="p-3 bg-gradient-to-r from-teal-550/5 via-emerald-500/5 to-transparent border border-emerald-100/60 rounded-lg flex items-center justify-between text-left text-xs text-emerald-800 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded select-none">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase font-display leading-tight tracking-wide text-emerald-950">Agréé par la Banque Centrale (BCEAO)</p>
            <p className="text-[9px] text-emerald-600 mt-0.5 leading-none">Transactions cryptées de bout en bout conforme SAR-256 de l'UEMOA.</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[8px] uppercase tracking-widest font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
            SECURE
          </span>
        </div>
      </div>
    </div>
  );
}
