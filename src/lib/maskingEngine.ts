import crypto from 'crypto';

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
  
  static identifyPII(text: string): string[] {
    const found: string[] = [];
    if (text.match(this.PHONE_REGEX)) found.push('phone');
    if (text.match(this.EMAIL_REGEX)) found.push('email');
    return found;
  }

  static maskPhone(phone: string): string {
    // Keep + and format, scramble numbers
    return phone.replace(/\d/g, (m, offset) => {
      // Keep first 3 digits of country code if it starts with +
      if (offset < 4 && phone.startsWith('+')) return m;
      return Math.floor(Math.random() * 10).toString();
    });
  }

  static maskEmail(email: string): string {
    const [local] = email.split('@');
    const hash = crypto.createHash('sha256').update(local).digest('hex').slice(0, 8);
    return `${hash}@anon-domain.internal`;
  }

  static maskName(name: string): string {
    const hash = crypto.createHash('sha256').update(name).digest('hex').slice(0, 8);
    return `X-AnonUser-${hash}`;
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

  static processPayload(payload: any): MaskedData {
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
          
          if (key.toLowerCase().includes('name')) {
            obj[key] = this.maskName(val);
            piiFound.push('name');
          } else if (key.toLowerCase().includes('email') || val.match(this.EMAIL_REGEX)) {
            obj[key] = this.maskEmail(val);
            piiFound.push('email');
          } else if (key.toLowerCase().includes('phone') || val.match(this.PHONE_REGEX)) {
            obj[key] = this.maskPhone(val);
            piiFound.push('phone');
          } else if (key.toLowerCase().includes('address')) {
            obj[key] = val.replace(/[0-9]/g, () => Math.floor(Math.random() * 10).toString());
            piiFound.push('address');
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
        riskScore: Math.max(0, 100 - entropyReduction * 2), // Mock risk score logic
        piiFound: Array.from(new Set(piiFound))
      }
    };
  }
}
