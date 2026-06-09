import crypto from 'crypto';

export interface MaskingConfig {
  maskNames: boolean;
  maskEmails: boolean;
  maskPhones: boolean;
  maskAddresses: boolean;
  maskFinancials: boolean;
}

export const DEFAULT_CONFIG: MaskingConfig = {
  maskNames: true,
  maskEmails: true,
  maskPhones: true,
  maskAddresses: true,
  maskFinancials: true,
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
  
  static identifyPII(text: string): string[] {
    const found: string[] = [];
    if (text.match(this.PHONE_REGEX)) found.push('phone');
    if (text.match(this.EMAIL_REGEX)) found.push('email');
    if (text.match(this.CC_REGEX)) found.push('credit_card');
    if (text.match(this.IBAN_REGEX)) found.push('iban');
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

  static maskFinancial(val: string): string {
    // Keep first 4 and last 4, mask middle
    if (val.length < 10) return "*******";
    const start = val.slice(0, 4);
    const end = val.slice(-4);
    const middle = val.slice(4, -4).replace(/[A-Z0-9]/g, 'X');
    return `${start}${middle}${end}`;
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
          const val = obj[key];
          
          if (config.maskNames && key.toLowerCase().includes('name')) {
            obj[key] = this.maskName(val);
            piiFound.push('name');
          } else if (config.maskEmails && (key.toLowerCase().includes('email') || val.match(this.EMAIL_REGEX))) {
            obj[key] = this.maskEmail(val);
            piiFound.push('email');
          } else if (config.maskPhones && (key.toLowerCase().includes('phone') || val.match(this.PHONE_REGEX))) {
            obj[key] = this.maskPhone(val);
            piiFound.push('phone');
          } else if (config.maskAddresses && key.toLowerCase().includes('address')) {
            obj[key] = val.replace(/[0-9]/g, () => Math.floor(Math.random() * 10).toString());
            piiFound.push('address');
          } else if (config.maskFinancials && (key.toLowerCase().match(/cc|card|iban|bank/) || val.match(this.CC_REGEX) || val.match(this.IBAN_REGEX))) {
            obj[key] = this.maskFinancial(val);
            piiFound.push('financial');
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
