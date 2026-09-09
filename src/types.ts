/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NetworkId = 'orange' | 'mtn' | 'moov';

export type ServiceType = 'airtime' | 'bundle';

export type PaymentMethodId = 'wave' | 'orange_money' | 'mtn_momo' | 'moov_money' | 'cash' | 'wallet';

export interface TelecomNetwork {
  id: NetworkId;
  name: string;
  color: string;
  borderColor: string;
  textColor: string;
  bgColor: string;
  logo: string; // Brief description or placeholder
  prefixes: string[]; // Standard 10-digit prefixes in Côte d'Ivoire (Orange: 07/08/09/47 etc., MTN: 05/45 etc., Moov: 01/41 etc.)
  ussdCode: string;
}

export interface TelecomBundle {
  id: string;
  networkId: NetworkId;
  name: string;
  price: number;
  dataVolume: string; // e.g., "5 Go", "20 Go", "Non-limité"
  minutesVolume?: string; // e.g., "120 Min", "Illimité"
  smsVolume?: string; // e.g., "200 SMS"
  validity: string; // e.g., "24H", "7 Jours", "30 Jours"
  tag: 'internet' | 'calls' | 'mixte' | 'promo';
  description: string;
  ussdCode: string; // Traditional USSD code used for reference in Côte d'Ivoire
}

export interface PaymentOperator {
  id: PaymentMethodId;
  name: string;
  logoColor: string;
  bgColor: string;
  textColor: string;
  iconName: string;
  feePercent: number; // typical fee in %
}

export interface Transaction {
  id: string;
  date: string;
  phone: string;
  amount: number;
  fee: number;
  total: number;
  networkId: NetworkId;
  serviceType: ServiceType;
  bundleId?: string;
  bundleName?: string;
  paymentMethod: PaymentMethodId;
  reference: string;
  status: 'pending' | 'success' | 'failed';
  errorMessage?: string;
}

export interface SimulationAgent {
  name: string;
  balance: number;
  earnings: number;
  commissionRate: number; // e.g., 0.04 (4%)
}

export interface RegisteredUser {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
  accountType: 'standard' | 'agent';
  city: string;
  password?: string;
  balance: number; // Custom simulated wallet balance in FCFA
  avatar?: string; // Avatar ID or emoji
  savedBeneficiaries: { name: string; phone: string; network: NetworkId }[];
  dateJoined: string;
}
