/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

export type CardStatus = 'active' | 'frozen' | 'terminated';

export interface VirtualCard {
  id: string;
  maskedPan: string;
  last4: string;
  brand: 'VISA' | 'MASTERCARD';
  currency: 'ZAR' | 'USD' | 'EUR';
  status: CardStatus;
  spendLimitZAR?: number;
  metadata?: Record<string, string>;
}

export class VirtualCardService {
  private cards = new Map<string, VirtualCard>();

  create(currency: 'ZAR' | 'USD' | 'EUR' = 'ZAR', brand: 'VISA' | 'MASTERCARD' = 'VISA', spendLimitZAR?: number, metadata?: Record<string, string>): VirtualCard {
    const id = `card_${Math.random().toString(36).slice(2, 10)}`;
    const last4 = `${Math.floor(1000 + Math.random() * 9000)}`;
    const maskedPan = `**** **** **** ${last4}`;
    const card: VirtualCard = { id, maskedPan, last4, brand, currency, status: 'active', spendLimitZAR, metadata };
    this.cards.set(id, card);
    return card;
  }

  get(id: string): VirtualCard | undefined {
    return this.cards.get(id);
  }

  list(): VirtualCard[] {
    return Array.from(this.cards.values());
  }

  setStatus(id: string, status: CardStatus): VirtualCard | undefined {
    const c = this.cards.get(id);
    if (!c) return undefined;
    c.status = status;
    return c;
  }

  setSpendLimit(id: string, limitZAR?: number): VirtualCard | undefined {
    const c = this.cards.get(id);
    if (!c) return undefined;
    c.spendLimitZAR = limitZAR;
    return c;
  }
}

export const virtualCardService = new VirtualCardService();


