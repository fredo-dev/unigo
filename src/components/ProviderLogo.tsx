import { Smartphone } from 'lucide-react';
import { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 1. Orange Côte d'Ivoire official logo
 */
export function OrangeLogo({ className = "w-8 h-8" }: LogoProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div 
        className={`relative bg-[#FF6600] rounded-lg flex items-center justify-center overflow-hidden shadow-sm select-none ${className}`}
        style={{ aspectRatio: '1/1' }}
      >
        <span className="text-[10px] font-sans font-black tracking-tighter text-white lowercase leading-none">
          orange
        </span>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg flex items-center justify-center overflow-hidden shadow-sm select-none ${className}`} style={{ aspectRatio: '1/1' }}>
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg" 
        alt="Orange CI" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
      />
    </div>
  );
}

/**
 * 2. MTN Côte d'Ivoire official logo
 */
export function MtnLogo({ className = "w-8 h-8" }: LogoProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div 
        className={`bg-[#FFCC00] border border-black/5 rounded-lg flex items-center justify-center overflow-hidden shadow-sm relative select-none ${className}`}
        style={{ aspectRatio: '1/1' }}
      >
        <div className="w-[85%] h-[60%] rounded-full border-[1.2px] border-neutral-900 flex items-center justify-center bg-[#FFCC00] shadow-sm">
          <span className="text-[10px] font-black text-neutral-950 tracking-tighter leading-none">MTN</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-[#FFCC00] rounded-lg flex items-center justify-center overflow-hidden shadow-sm select-none p-1.5 ${className}`} style={{ aspectRatio: '1/1' }}>
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.svg" 
        alt="MTN CI" 
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
      />
    </div>
  );
}

/**
 * 3. Moov Africa official logo
 */
export function MoovLogo({ className = "w-8 h-8" }: LogoProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div 
        className={`bg-[#005CA9] rounded-lg flex flex-col items-center justify-center overflow-hidden shadow-sm relative select-none ${className}`}
        style={{ aspectRatio: '1/1' }}
      >
        <div className="flex flex-col items-center justify-center leading-none">
          <span className="text-[9px] font-black text-white tracking-widest leading-none">moov</span>
          <span className="text-[6px] font-bold text-amber-300 tracking-widest leading-none mt-0.5 scale-90">AFRICA</span>
        </div>
        <div className="absolute bottom-1 w-6 h-[2px] bg-[#FF6600] rounded-full opacity-90"></div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white border border-zinc-150 rounded-lg flex items-center justify-center overflow-hidden shadow-sm select-none p-1 ${className}`} style={{ aspectRatio: '1/1' }}>
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/e/ec/Moov_Africa_Logo.png" 
        alt="Moov Africa CI" 
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
      />
    </div>
  );
}

/**
 * 4. Wave (Famous blue circle with white minimal penguin)
 */
export function WaveLogo({ className = "w-8 h-8" }: LogoProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`relative bg-[#00C2F4] rounded-lg flex items-center justify-center overflow-hidden shadow-sm select-none p-1 ${className}`} style={{ aspectRatio: '1/1' }}>
        <svg 
          viewBox="0 0 100 100" 
          className="w-4/5 h-4/5 text-white" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized high-quality fallback penguin shape for Wave */}
          <circle cx="50" cy="50" r="45" fill="#00C2F4" />
          <ellipse cx="50" cy="55" rx="25" ry="30" fill="white" />
          <ellipse cx="50" cy="55" rx="18" ry="22" fill="#00C2F4" />
          <ellipse cx="50" cy="53" rx="12" ry="15" fill="white" />
          <circle cx="43" cy="45" r="3" fill="black" />
          <circle cx="57" cy="45" r="3" fill="black" />
          <path d="M50 48L44 54H56L50 48Z" fill="#F97316" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative bg-[#00C2F4] rounded-lg flex items-center justify-center overflow-hidden shadow-sm select-none p-0.5 ${className}`} style={{ aspectRatio: '1/1' }}>
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/e/e5/Wave_logo.svg" 
        alt="Wave CI" 
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
      />
    </div>
  );
}

/**
 * 5. Orange Money official logo combo
 */
export function OrangeMoneyLogo({ className = "w-8 h-8" }: LogoProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div 
        className={`relative bg-[#FF6600] rounded-lg flex flex-col items-center justify-center overflow-hidden shadow-sm select-none ${className}`}
        style={{ aspectRatio: '1/1' }}
      >
        <span className="text-[5.5px] font-sans font-black tracking-widest text-white uppercase leading-none mb-0.5 opacity-90 select-none">
          ORANGE
        </span>
        <span className="text-[8px] font-sans font-extrabold leading-none text-zinc-950 uppercase py-0.5 px-1 bg-white rounded-sm select-none shadow-xs scale-90">
          money
        </span>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg flex flex-col items-center justify-center overflow-hidden shadow-sm select-none p-0.5 ${className}`} style={{ aspectRatio: '1/1' }}>
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/2/23/Orange_Money_logo.svg" 
        alt="Orange Money" 
        className="w-full h-full object-contain bg-black"
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
      />
    </div>
  );
}

/**
 * 6. MTN MoMo official logo combo
 */
export function MtnMomoLogo({ className = "w-8 h-8" }: LogoProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div 
        className={`bg-[#FFCC00] border border-black/5 rounded-lg flex flex-col items-center justify-center overflow-hidden shadow-sm relative select-none ${className}`}
        style={{ aspectRatio: '1/1' }}
      >
        <span className="text-[6px] font-sans font-extrabold text-neutral-900 tracking-wider uppercase leading-none mb-0.5">
          MTN
        </span>
        <div className="bg-[#005CA9] text-white px-1.5 py-0.5 rounded-full flex items-center justify-center leading-none shadow-xs">
          <span className="text-[7.5px] font-black italic tracking-tighter lowercase leading-none">momo</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-[#FFCC00] rounded-lg flex flex-col items-center justify-center overflow-hidden shadow-sm select-none p-1 ${className}`} style={{ aspectRatio: '1/1' }}>
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/a/ae/MTN_Mobile_Money_logo.png" 
        alt="MTN MoMo" 
        className="w-[90%] h-[90%] object-contain rounded"
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
      />
    </div>
  );
}

/**
 * 7. Moov Money official logo combo
 */
export function MoovMoneyLogo({ className = "w-8 h-8" }: LogoProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div 
        className={`bg-[#005CA9] rounded-lg flex flex-col items-center justify-center overflow-hidden shadow-sm relative select-none ${className}`}
        style={{ aspectRatio: '1/1' }}
      >
        <span className="text-[7.5px] font-black text-white tracking-widest leading-none mb-0.5">
          moov
        </span>
        <div className="bg-[#78B833] text-white px-1 py-0.5 rounded-sm flex items-center justify-center leading-none scale-90 shadow-xs">
          <span className="text-[7px] font-extrabold tracking-tight uppercase leading-none text-white">MONEY</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white border border-zinc-150 rounded-lg flex flex-col items-center justify-center overflow-hidden shadow-sm select-none p-0.5 ${className}`} style={{ aspectRatio: '1/1' }}>
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/e/ec/Moov_Africa_Logo.png" 
        alt="Moov Money" 
        className="w-full h-3/5 object-contain"
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
      />
      <div className="w-full bg-[#78B833] text-white text-[6.5px] font-extrabold py-0.5 rounded-b text-center tracking-tight leading-none mt-auto select-none uppercase">
        Money
      </div>
    </div>
  );
}

/**
 * 8. Cash (En Agence) logo representing a bank note
 */
export function CashLogo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <div 
      className={`bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex flex-col items-center justify-center overflow-hidden shadow-sm relative select-none p-1 ${className}`}
      style={{ aspectRatio: '1/1' }}
    >
      <div className="border border-white/20 w-full h-full rounded flex flex-col items-center justify-center">
        <span className="text-[7px] font-mono leading-none font-bold text-emerald-100">$ F</span>
        <div className="w-4 h-[1px] bg-white/40 my-0.5 rounded"></div>
        <span className="text-[6px] font-bold text-white uppercase leading-none scale-90">CASH</span>
      </div>
    </div>
  );
}

/**
 * 9. Unigo Wallet logo representing client-side balance
 */
export function WalletLogo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <div 
      className={`bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col items-center justify-center overflow-hidden shadow-sm relative select-none ${className}`}
      style={{ aspectRatio: '1/1' }}
    >
      <span className="text-[8px] font-mono font-bold text-amber-400">UG</span>
      <span className="text-[5px] font-bold text-zinc-500 tracking-wider uppercase mt-0.5">UNIGO</span>
    </div>
  );
}

/**
 * General helper component that gets the logo for both networks & payment operators
 */
export default function ProviderLogo({ 
  id, 
  className = "w-8 h-8" 
}: { 
  id: string; 
  className?: string; 
}) {
  switch (id) {
    // Networks
    case 'orange':
      return <OrangeLogo className={className} />;
    case 'mtn':
      return <MtnLogo className={className} />;
    case 'moov':
      return <MoovLogo className={className} />;
    
    // Payment Methods
    case 'wave':
      return <WaveLogo className={className} />;
    case 'orange_money':
      return <OrangeMoneyLogo className={className} />;
    case 'mtn_momo':
      return <MtnMomoLogo className={className} />;
    case 'moov_money':
      return <MoovMoneyLogo className={className} />;
    case 'cash':
      return <CashLogo className={className} />;
    case 'wallet':
      return <WalletLogo className={className} />;
    
    default:
      return (
        <div className={`bg-zinc-100 rounded-lg flex items-center justify-center border border-zinc-200 ${className}`}>
          <Smartphone className="h-4 w-4 text-zinc-400" />
        </div>
      );
  }
}
