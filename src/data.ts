/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TelecomNetwork, TelecomBundle, PaymentOperator } from './types';

export const TELECOM_NETWORKS: TelecomNetwork[] = [
  {
    id: 'orange',
    name: 'Orange Côte d\'Ivoire',
    color: 'from-orange-500 to-orange-600',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    logo: 'orange',
    prefixes: ['07', '08', '09', '070', '071', '072', '073', '074', '075', '076', '077', '078', '079'],
    ussdCode: '#144#'
  },
  {
    id: 'mtn',
    name: 'MTN Côte d\'Ivoire',
    color: 'from-yellow-400 to-amber-500',
    borderColor: 'border-yellow-500',
    textColor: 'text-amber-800',
    bgColor: 'bg-yellow-50',
    logo: 'mtn',
    prefixes: ['05', '04', '06', '050', '051', '052', '053', '054', '055', '056', '057', '058', '059'],
    ussdCode: '*105#'
  },
  {
    id: 'moov',
    name: 'Moov Africa CI',
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    logo: 'moov',
    prefixes: ['01', '02', '03', '010', '011', '012', '013', '014', '015', '016', '017', '018', '019'],
    ussdCode: '*303#'
  }
];

export const TELECOM_BUNDLES: TelecomBundle[] = [
  // --- ORANGE ---
  {
    id: 'org-pass-200',
    networkId: 'orange',
    name: 'Passe Internet 200F',
    price: 200,
    dataVolume: '220 Mo',
    validity: '24 Heures',
    tag: 'internet',
    description: "Passe internet économique Orange offrant 220 Mo d'internet.",
    ussdCode: '#111#'
  },
  {
    id: 'org-pass-500',
    networkId: 'orange',
    name: 'Pass Jour 500F',
    price: 500,
    dataVolume: '500 Mo',
    minutesVolume: '30 Min',
    validity: '24 Heures',
    tag: 'mixte',
    description: "Pass Journalier équilibré avec appels nationaux et internet mobile.",
    ussdCode: '#111#'
  },
  {
    id: 'org-pass-mix-2000',
    networkId: 'orange',
    name: 'Pass Mix 2000F',
    price: 2000,
    dataVolume: '4 Go',
    minutesVolume: '120 Min',
    validity: '30 Jours',
    tag: 'mixte',
    description: "Forfait Mix mensuel avec appels et internet haut débit Orange.",
    ussdCode: '#111#'
  },
  {
    id: 'org-pass-mix-5000',
    networkId: 'orange',
    name: 'Pass Mix 5000F',
    price: 5000,
    dataVolume: '12 Go',
    minutesVolume: '300 Min',
    validity: '30 Jours',
    tag: 'mixte',
    description: "Le forfait mensuel ultime d'Orange CI avec 12 Go d'internet et 5h d'appels.",
    ussdCode: '#111#'
  },

  // --- MTN ---
  {
    id: 'mtn-std-200',
    networkId: 'mtn',
    name: 'Pack standard Internet 200F',
    price: 200,
    dataVolume: '220 Mo',
    validity: '2 Jours',
    tag: 'internet',
    description: "Pack standard internet MTN valable 2 jours via le code d'accès *300#.",
    ussdCode: '*105*1# ou *300#'
  },
  {
    id: 'mtn-std-500',
    networkId: 'mtn',
    name: 'Pack standard Internet 500F',
    price: 500,
    dataVolume: '450 Mo',
    validity: '3 Jours',
    tag: 'internet',
    description: "Pack standard internet MTN valable 3 jours via le code d'accès *450#.",
    ussdCode: '*105*1# ou *450#'
  },
  {
    id: 'mtn-illimit-1500',
    networkId: 'mtn',
    name: 'Packs IllimiT 1500F',
    price: 1500,
    dataVolume: '2 Go',
    minutesVolume: '150 Min',
    validity: '3 Jours',
    tag: 'mixte',
    description: "Forfait voix et data IllimiT MTN à partir de 1 500 F valable 3 jours.",
    ussdCode: '*105*1# ou MyMTN'
  },
  {
    id: 'mtn-illimit-3000',
    networkId: 'mtn',
    name: 'Packs IllimiT 3000F',
    price: 3000,
    dataVolume: '5 Go',
    minutesVolume: '350 Min',
    validity: '7 Jours',
    tag: 'mixte',
    description: "Offre hebdomadaire MTN IllimiT comprenant appels nationaux et 5 Go d'internet.",
    ussdCode: '*105*1# ou MyMTN'
  },

  // --- MOOV ---
  {
    id: 'moov-folie-200',
    networkId: 'moov',
    name: 'Moov Folie 200F',
    price: 200,
    dataVolume: '400 Mo',
    validity: '24 Heures',
    tag: 'internet',
    description: "Forfait internet Moov Folie offrant un excellent volume de 400 Mo.",
    ussdCode: '*303*2*2#'
  },
  {
    id: 'moov-folie-500',
    networkId: 'moov',
    name: 'Moov Folie 500F',
    price: 500,
    dataVolume: '1 Go',
    validity: '24 Heures',
    tag: 'internet',
    description: "L'offre Moov Folie par excellence : 1 Go d'internet haut débit à seulement 500 F.",
    ussdCode: '*303*2*2#'
  },
  {
    id: 'moov-folie-mix-1500',
    networkId: 'moov',
    name: 'Moov Folie Mixte 1500F',
    price: 1500,
    dataVolume: '3 Go',
    minutesVolume: '100 Min',
    validity: '7 Jours',
    tag: 'mixte',
    description: "Packs Moov Folie hebdomadaire mixte pour surfer et appeler sans limite.",
    ussdCode: '*303*2# ou *303*5#'
  }
];

export const PAYMENT_OPERATORS: PaymentOperator[] = [
  {
    id: 'wave',
    name: 'Wave Côte d\'Ivoire',
    logoColor: 'bg-cyan-500',
    bgColor: 'bg-cyan-50 hover:bg-cyan-100/70',
    textColor: 'text-cyan-700',
    iconName: 'wave',
    feePercent: 1.0 // Wave is famous in CI for its flat 1% fee
  },
  {
    id: 'orange_money',
    name: 'Orange Money',
    logoColor: 'bg-orange-500',
    bgColor: 'bg-orange-50 hover:bg-orange-100/70',
    textColor: 'text-orange-700',
    iconName: 'orange',
    feePercent: 1.0
  },
  {
    id: 'mtn_momo',
    name: 'MTN Mobile Money',
    logoColor: 'bg-amber-400',
    bgColor: 'bg-amber-50 hover:bg-amber-100/70',
    textColor: 'text-amber-800',
    iconName: 'momo',
    feePercent: 1.0
  },
  {
    id: 'moov_money',
    name: 'Moov Money',
    logoColor: 'bg-emerald-500',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100/70',
    textColor: 'text-emerald-700',
    iconName: 'moov',
    feePercent: 1.0
  },
  {
    id: 'cash',
    name: 'Espèces (En Agence)',
    logoColor: 'bg-slate-500',
    bgColor: 'bg-slate-50 hover:bg-slate-100/70',
    textColor: 'text-slate-700',
    iconName: 'cash',
    feePercent: 0.0
  }
];

export const MOCK_TESTIMONIALS = [
  {
    id: '1',
    name: 'Koffi Kouassi Ange',
    role: 'Étudiant à l\'INPHB',
    avatar: '👨‍🎓',
    comment: 'Unigo.ci est d\'une rapidité incroyable ! J\'achète mes forfaits Orange en moins de 30 secondes pour mes révisions.',
    rating: 5,
    city: 'Yamoussoukro'
  },
  {
    id: '2',
    name: 'Mariam Diarrassouba',
    role: 'Commerçante au grand marché',
    avatar: '👩‍💼',
    comment: 'Fini les cartes de recharge à gratter. Avec Unigo, je recharge les téléphones de mes clients directement par Wave ou MTN Momo.',
    rating: 5,
    city: 'Adjamé, Abidjan'
  },
  {
    id: '3',
    name: 'Esso Latte Frédéric',
    role: 'Développeur et Freelance',
    avatar: '👨‍💻',
    comment: 'L\'interface est simplifiée au maximum. Je recommande l\'usage d\'Unigo pour tous ceux qui veulent un service fiable.',
    rating: 4.8,
    city: 'Marcory, Abidjan'
  }
];

export const FAQ_ITEMS = [
  {
    question: 'Quels sont les réseaux mobiles supportés ?',
    answer: 'Unigo.ci prend en charge tous les réseaux de téléphonie mobile majeurs en Côte d\'Ivoire : Orange Côte d\'Ivoire (07), MTN Côte d\'Ivoire (05) et Moov Africa CI (01).'
  },
  {
    question: 'Y a-t-il des frais supplémentaires cachés ?',
    answer: 'Absolument aucun ! Les frais affichés sont transparents. Par exemple, avec un paiement mobile (Wave, MTN, Orange, Moov), les frais réglementaires d\'opérateur sont de seulement 1% de la valeur de votre transaction, et nous vous indiquons le montant total avant transfert.'
  },
  {
    question: 'Combien de temps prend le transfert ?',
    answer: 'Les souscriptions d\'unités et forfaits internet sont instantanées. Dès que le paiement mobile est validé, vous recevez un SMS de confirmation de l\'opérateur directement sur le numéro rechargé.'
  },
  {
    question: 'Que faire en cas d\'erreur de numéro ?',
    answer: 'La validation en direct d\'Unigo vérifie si le préfixe correspond au bon réseau avant d\'autoriser le paiement. En cas d\'erreur de saisie de votre part sur un numéro valide, contactez immédiatement notre service client disponible par WhatsApp et e-mail (support@unigo.ci) muni de votre référence réseau.'
  }
];
