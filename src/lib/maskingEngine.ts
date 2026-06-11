import crypto from 'crypto';

export interface MaskingConfig {
  maskNames: boolean;
  maskEmails: boolean;
  maskPhones: boolean;
  maskAddresses: boolean;
  maskCreditCard: boolean;
  maskIBAN: boolean;
  maskNationalIDs: boolean;
}

export const DEFAULT_CONFIG: MaskingConfig = {
  maskNames: true,
  maskEmails: true,
  maskPhones: true,
  maskAddresses: true,
  maskCreditCard: true,
  maskIBAN: true,
  maskNationalIDs: true,
};

export interface MaskedData {
  masked: any;
  original: any;
  metadata: {
    latencies: number;
    entropyReduction: number;
    riskScore: number;
    piiFound: string[];
  };
}

export class MaskingEngine {
  private static readonly PHONE_REGEX = /(\+[\d]{1,3}[- ]?)?\(?[\d]{3}\)?[- ]?[\d]{3}[- ]?[\d]{4}/g;
  private static readonly EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  private static readonly CC_REGEX = /\b(?:\d[ -]?){13,16}\b/g;
  private static readonly IBAN_REGEX = /[A-Z]{2}\d{2}[A-Z0-9]{11,30}/g;
  private static readonly EMIRATES_ID_REGEX = /784-\d{4}-\d{7}-\d/g;
  private static readonly SAUDI_ID_REGEX = /\b[12]\d{9}\b/g;
  
  static identifyPII(text: string): string[] {
    const found: string[] = [];
    if (text.match(this.PHONE_REGEX)) found.push('phone');
    if (text.match(this.EMAIL_REGEX)) found.push('email');
    if (text.match(this.CC_REGEX)) found.push('credit_card');
    if (text.match(this.IBAN_REGEX)) found.push('iban');
    if (text.match(this.EMIRATES_ID_REGEX) || text.match(this.SAUDI_ID_REGEX)) found.push('national_id');
    return found;
  }

  static maskPhone(phone: string): string {
    return phone.replace(/\d/g, (m, offset) => {
      if (offset < 4 && phone.startsWith('+')) return m;
      return Math.floor(Math.random() * 10).toString();
    });
  }

  static maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const hash = crypto.createHash('sha256').update(local).digest('hex').slice(0, 8);
    return `${hash}@anon-${domain || 'internal'}`;
  }

  static maskName(name: string): string {
    const hash = crypto.createHash('sha256').update(name).digest('hex').slice(0, 8);
    return `X-AnonUser-${hash}`;
  }

  static maskCreditCard(val: string): string {
    const clean = val.replace(/[ -]/g, '');
    if (clean.length < 8) return "*******";
    const start = clean.slice(0, 4);
    const end = clean.slice(-4);
    return `${start} XXXX XXXX ${end}`;
  }

  static maskIBAN(val: string): string {
    if (val.length < 10) return "*******";
    const countryCode = val.slice(0, 2);
    const lastFour = val.slice(-4);
    return `${countryCode}** **** **** ${lastFour}`;
  }

  static maskNationalID(val: string): string {
    if (val.match(this.EMIRATES_ID_REGEX)) {
      return "784-XXXX-XXXXXXX-X";
    }
    return `X-ID-${crypto.createHash('sha256').update(val).digest('hex').slice(0, 6)}`;
  }

  static calculateEntropy(text: string): number {
    const len = text.length;
    if (len === 0) return 0;
    const freq: Record<string, number> = {};
    for (const char of text) {
      freq[char] = (freq[char] || 0) + 1;
    }
    let entropy = 0;
    for (const char in freq) {
      const p = freq[char] / len;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  }

  static processPayload(payload: any, config: MaskingConfig = DEFAULT_CONFIG): MaskedData {
    const startTime = performance.now();
    const original = JSON.parse(JSON.stringify(payload));
    const masked = JSON.parse(JSON.stringify(payload));
    const piiFound: string[] = [];

    const rawString = JSON.stringify(payload);
    const initialEntropy = this.calculateEntropy(rawString);

    // Deep walk and mask
    const walk = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          const val = obj[key] as string;
          const lowerKey = key.toLowerCase();
          
          // 1. Identification / National IDs (Most specific)
          if (config.maskNationalIDs && (lowerKey.match(/id|national|passport|emirates/) || val.match(this.EMIRATES_ID_REGEX) || val.match(this.SAUDI_ID_REGEX))) {
            obj[key] = this.maskNationalID(val);
            piiFound.push('national_id');
            continue;
          }

          // 2. Financials (Specific patterns)
          if (config.maskIBAN && (lowerKey.match(/iban|bank/) || val.match(this.IBAN_REGEX))) {
            obj[key] = this.maskIBAN(val);
            piiFound.push('iban');
            continue;
          }

          if (config.maskCreditCard && (lowerKey.match(/cc|card/) || (val.replace(/[ -]/g, '').match(/^\d{13,16}$/) && val.match(this.CC_REGEX)))) {
            obj[key] = this.maskCreditCard(val);
            piiFound.push('credit_card');
            continue;
          }

          // 3. Contact Info
          if (config.maskEmails && (lowerKey.includes('email') || val.match(this.EMAIL_REGEX))) {
            obj[key] = this.maskEmail(val);
            piiFound.push('email');
            continue;
          }

          if (config.maskPhones && (lowerKey.includes('phone') || val.match(this.PHONE_REGEX))) {
            obj[key] = this.maskPhone(val);
            piiFound.push('phone');
            continue;
          }

          // 4. Names and Addresses (Generic key matching)
          if (config.maskNames && lowerKey.includes('name')) {
            obj[key] = this.maskName(val);
            piiFound.push('name');
            continue;
          }

          if (config.maskAddresses && lowerKey.includes('address')) {
            obj[key] = val.replace(/[0-9]/g, () => Math.floor(Math.random() * 10).toString());
            piiFound.push('address');
            continue;
          }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          walk(obj[key]);
        }
      }
    };

    walk(masked);

    const maskedString = JSON.stringify(masked);
    const maskedEntropy = this.calculateEntropy(maskedString);
    const entropyReduction = ((initialEntropy - maskedEntropy) / initialEntropy) * 100;

    return {
      masked,
      original,
      metadata: {
        latencies: performance.now() - startTime,
        entropyReduction: Math.max(0, entropyReduction),
        riskScore: Math.max(0, 100 - (piiFound.length * 15 + entropyReduction)), 
        piiFound: Array.from(new Set(piiFound))
      }
    };
  }
}
