/**
 * INCOME-BASED PRICING
 * 
 * Allows students to select pricing based on their income level
 */

export type IncomeLevel = 'NO_INCOME' | 'LOW_INCOME' | 'STANDARD';

export interface IncomeBracket {
  level: IncomeLevel;
  label: string;
  description: string;
  verificationRequired: boolean;
  verificationMethods: string[];
}

export const INCOME_BRACKETS: Record<IncomeLevel, IncomeBracket> = {
  NO_INCOME: {
    level: 'NO_INCOME',
    label: 'No Income',
    description: 'Unemployed, student, or no regular income',
    verificationRequired: true,
    verificationMethods: ['STUDENT_ID', 'UNEMPLOYMENT_LETTER', 'SELF_DECLARATION']
  },
  LOW_INCOME: {
    level: 'LOW_INCOME',
    label: 'Low Income',
    description: 'Part-time work or limited income',
    verificationRequired: true,
    verificationMethods: ['PAYSLIP', 'BANK_STATEMENT', 'TAX_RETURN', 'SELF_DECLARATION']
  },
  STANDARD: {
    level: 'STANDARD',
    label: 'Standard',
    description: 'Regular income or employed',
    verificationRequired: false,
    verificationMethods: []
  }
};

/**
 * Get price for income level
 */
export function getPriceForIncomeLevel(
  basePrice: number,
  incomeOptions: { noIncome: number; lowIncome: number; standard: number } | undefined,
  incomeLevel: IncomeLevel,
  currencyRate: number
): number {
  if (!incomeOptions) {
    return Math.round(basePrice * currencyRate);
  }

  const usdPrice = {
    NO_INCOME: incomeOptions.noIncome,
    LOW_INCOME: incomeOptions.lowIncome,
    STANDARD: incomeOptions.standard
  }[incomeLevel];

  return Math.round(usdPrice * currencyRate);
}

/**
 * Get all income-based pricing options
 */
export function getIncomePricingOptions(
  incomeOptions: { noIncome: number; lowIncome: number; standard: number } | undefined,
  currencyRate: number,
  currencySymbol: string
) {
  if (!incomeOptions) return null;

  return {
    noIncome: {
      price: Math.round(incomeOptions.noIncome * currencyRate),
      formatted: formatPrice(Math.round(incomeOptions.noIncome * currencyRate), currencySymbol)
    },
    lowIncome: {
      price: Math.round(incomeOptions.lowIncome * currencyRate),
      formatted: formatPrice(Math.round(incomeOptions.lowIncome * currencyRate), currencySymbol)
    },
    standard: {
      price: Math.round(incomeOptions.standard * currencyRate),
      formatted: formatPrice(Math.round(incomeOptions.standard * currencyRate), currencySymbol)
    }
  };
}

function formatPrice(amount: number, symbol: string): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  return ['$', '£', '€', 'R'].includes(symbol) 
    ? `${symbol}${formatted}` 
    : `${formatted} ${symbol}`;
}

export type VerificationMethod = 
  | 'STUDENT_ID'
  | 'UNEMPLOYMENT_LETTER'
  | 'PAYSLIP'
  | 'BANK_STATEMENT'
  | 'TAX_RETURN'
  | 'SELF_DECLARATION';

export interface IncomeVerification {
  userId: string;
  incomeLevel: IncomeLevel;
  method: VerificationMethod;
  documentUrl?: string;
  selfDeclaration?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  expiresAt: Date;
  notes?: string;
}

/**
 * Validate income verification submission
 */
export function validateVerification(
  incomeLevel: IncomeLevel,
  method: VerificationMethod,
  documentUrl?: string,
  selfDeclaration?: string
): { valid: boolean; error?: string } {
  const bracket = INCOME_BRACKETS[incomeLevel];
  
  if (!bracket.verificationRequired) {
    return { valid: true };
  }
  
  if (!bracket.verificationMethods.includes(method)) {
    return { valid: false, error: 'Invalid verification method for this income level' };
  }
  
  if (method === 'SELF_DECLARATION') {
    if (!selfDeclaration || selfDeclaration.length < 50) {
      return { valid: false, error: 'Self-declaration must be at least 50 characters' };
    }
  } else {
    if (!documentUrl) {
      return { valid: false, error: 'Document upload required for this verification method' };
    }
  }
  
  return { valid: true };
}

/**
 * Create income verification record
 */
export function createVerification(
  userId: string,
  incomeLevel: IncomeLevel,
  method: VerificationMethod,
  documentUrl?: string,
  selfDeclaration?: string
): IncomeVerification {
  return {
    userId,
    incomeLevel,
    method,
    documentUrl,
    selfDeclaration,
    status: 'PENDING',
    submittedAt: new Date(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  };
}

export default {
  INCOME_BRACKETS,
  getPriceForIncomeLevel,
  getIncomePricingOptions,
  validateVerification,
  createVerification
};}
