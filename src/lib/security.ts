/**
 * Unigo.ci Security & Device Responsiveness Module
 * Developed to protect the codebase against reverse engineering,
 * code theft, and local cache tampering while ensuring universal scaling.
 */

// Simple scrambling to obfuscate local databases in LocalStorage
export function scramble(text: string): string {
  try {
    const b64 = btoa(unescape(encodeURIComponent(text)));
    // Add a signature suffix and shift characters slightly to render it unreadable
    return 'unigo_secured_' + b64.split('').reverse().join('');
  } catch (e) {
    return text;
  }
}

export function unscramble(obfuscated: string): string {
  try {
    if (!obfuscated || !obfuscated.startsWith('unigo_secured_')) {
      return obfuscated;
    }
    const rawB64 = obfuscated.replace('unigo_secured_', '').split('').reverse().join('');
    return decodeURIComponent(escape(atob(rawB64)));
  } catch (e) {
    return obfuscated;
  }
}

// Secure localStorage proxy wrappers
export const secureStorage = {
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, scramble(value));
    } catch (e) {
      localStorage.setItem(key, value);
    }
  },
  
  getItem(key: string): string | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return unscramble(raw);
    } catch (e) {
      return localStorage.getItem(key);
    }
  },
  
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
};

/**
 * Activates front-end protection shields to block inspection, copy, and code duplication.
 */
export function activateSecurityShields() {
  if (typeof window === 'undefined') return;

  // 1. Disable context menu (right click)
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  }, { capture: true });

  // 2. Disable inspection keys
  window.addEventListener('keydown', (e) => {
    // Disable F12
    if (e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Disable Ctrl+Shift+I / Cmd+Opt+I (Developer Tools)
    if (
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
      (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Disable Ctrl+U / Cmd+Opt+U (View Source)
    if (
      (e.ctrlKey && (e.key === 'U' || e.key === 'u')) ||
      (e.metaKey && e.altKey && (e.key === 'U' || e.key === 'u'))
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Disable Ctrl+S / Cmd+S (Save page)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3. Clear console periodically and spam warning message to deter thieving script-kiddies
  const warningText = `
%c🔴 UNIGO.CI - PROTECTION DE CODE SOURCE ACTIVÉE 🔴
%cToute tentative d'ingénierie inverse ou d'inspection est surveillée et enregistrée.
Ce projet est la propriété intellectuelle exclusive d'Unigo Côte d'Ivoire.
  `;
  
  const printWarning = () => {
    console.clear();
    console.log(
      warningText, 
      'color: red; font-size: 22px; font-weight: bold;', 
      'color: orange; font-size: 14px; font-weight: 500;'
    );
  };

  printWarning();
  setInterval(printWarning, 4500);

  // 4. Inject visual anti-theft CSS (no selection, no highlight, no drag)
  try {
    const style = document.createElement('style');
    style.innerHTML = `
      /* Protect text content and layout elements from selection/inspection highlights */
      body, html {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      
      /* Ensure input fields and textareas remain fully usable by genuine users */
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      
      /* Disable default image dragging */
      img {
        -webkit-user-drag: none !important;
        user-drag: none !important;
      }
    `;
    document.head.appendChild(style);
  } catch (err) {
    console.error(err);
  }
}
