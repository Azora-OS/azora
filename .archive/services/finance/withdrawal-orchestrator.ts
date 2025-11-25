/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

export interface WithdrawalRequest {
  amountZAR: number;
  destination: 'bank' | 'luno';
  reference?: string;
}

export interface WithdrawalResult {
  success: boolean;
  provider: 'bank' | 'luno';
  txId?: string;
  message?: string;
}

export class WithdrawalOrchestrator {
  async initiate(req: WithdrawalRequest): Promise<WithdrawalResult> {
    if (req.destination === 'bank') {
      return this.initiateBankWithdrawal(req);
    }
    return this.initiateLunoWithdrawal(req);
  }

  private async initiateBankWithdrawal(req: WithdrawalRequest): Promise<WithdrawalResult> {
    try {
      // Dynamic import to avoid tight coupling with implementation details
      const mod = await import('../azora-mint/bank-integration.js').catch(async () => {
        return await import('../azora-mint/bank-integration.ts');
      });
      const api: any = mod.default || mod;
      if (!api || typeof api.initiateWithdrawal !== 'function') {
        return { success: false, provider: 'bank', message: 'Bank integration API not available' };
      }
      const tx = await api.initiateWithdrawal({ amountZAR: req.amountZAR, reference: req.reference });
      return { success: true, provider: 'bank', txId: tx?.id || tx?.txId, message: 'Bank withdrawal initiated' };
    } catch (err: any) {
      return { success: false, provider: 'bank', message: err?.message || 'Bank withdrawal failed' };
    }
  }

  private async initiateLunoWithdrawal(req: WithdrawalRequest): Promise<WithdrawalResult> {
    try {
      const mod = await import('../azora-mint/luno-integration.js').catch(async () => {
        return await import('../azora-mint/luno-integration.ts');
      });
      const api: any = mod.default || mod;
      if (!api || typeof api.createWithdrawal !== 'function') {
        return { success: false, provider: 'luno', message: 'Luno integration API not available' };
      }
      const tx = await api.createWithdrawal({ amountZAR: req.amountZAR, reference: req.reference });
      return { success: true, provider: 'luno', txId: tx?.id || tx?.txId, message: 'Luno withdrawal initiated' };
    } catch (err: any) {
      return { success: false, provider: 'luno', message: err?.message || 'Luno withdrawal failed' };
    }
  }
}

export const withdrawalOrchestrator = new WithdrawalOrchestrator();


