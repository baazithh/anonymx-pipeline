import re
import hashlib
import random
import time
from typing import Dict, List, Any, Optional
from pydantic import BaseModel

class MaskingConfig(BaseModel):
    maskNames: bool = True
    maskEmails: bool = True
    maskPhones: bool = True
    maskAddresses: bool = True
    maskCreditCard: bool = True
    maskIBAN: bool = True
    maskNationalIDs: bool = True

class MaskingResult(BaseModel):
    masked: Any
    original: Any
    metadata: Dict[str, Any]

class MaskingEngine:
    PHONE_REGEX = re.compile(r"(\+[\d]{1,3}[- ]?)?\(?[\d]{3}\)?[- ]?[\d]{3}[- ]?[\d]{4}")
    EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
    CC_REGEX = re.compile(r"\b(?:\d[ -]?){13,16}\b")
    IBAN_REGEX = re.compile(r"[A-Z]{2}\d{2}[A-Z0-9]{11,30}")
    EMIRATES_ID_REGEX = re.compile(r"784-\d{4}-\d{7}-\d")
    SAUDI_ID_REGEX = re.compile(r"\b[12]\d{9}\b")

    def __init__(self):
        self.token_vault = {} # In-memory token mapping for simulation

    def calculate_entropy(self, text: str) -> float:
        if not text:
            return 0.0
        freq = {}
        for char in text:
            freq[char] = freq.get(char, 0) + 1
        
        entropy = 0.0
        length = len(text)
        import math
        for f in freq.values():
            p = f / length
            entropy -= p * math.log2(p)
        return entropy

    def fpe_mask_digits(self, text: str) -> str:
        """Format-Preserving Encryption lite: keeps digits as digits, but changes them."""
        return re.sub(r'\d', lambda m: str(random.randint(0, 9)), text)

    def mask_name(self, name: str) -> str:
        h = hashlib.sha256(name.encode()).hexdigest()[:8]
        return f"X-AnonUser-{h.upper()}"

    def mask_email(self, email: str) -> str:
        local, domain = email.split('@') if '@' in email else (email, "unknown")
        h = hashlib.sha256(local.encode()).hexdigest()[:8]
        return f"{h}@anon-{domain}"

    def mask_phone(self, phone: str) -> str:
        # Keep prefix if starts with +
        if phone.startswith('+'):
            prefix_match = re.match(r'(\+\d{1,3}[- ]?)', phone)
            if prefix_match:
                prefix = prefix_match.group(1)
                rest = phone[len(prefix):]
                return prefix + self.fpe_mask_digits(rest)
        return self.fpe_mask_digits(phone)

    def mask_cc(self, cc: str) -> str:
        clean = re.sub(r'[^0-9]', '', cc)
        if len(clean) < 8: return "****"
        return f"{clean[:4]} XXXX XXXX {clean[-4:]}"

    def mask_iban(self, iban: str) -> str:
        if len(iban) < 10: return "****"
        return f"{iban[:2]}XX XXXX XXXX {iban[-4:]}"

    def process_payload(self, payload: Any, config: MaskingConfig) -> MaskingResult:
        start_time = time.perf_counter()
        original = payload
        import copy
        masked = copy.deepcopy(payload)
        pii_found = []

        initial_raw = str(payload)
        initial_entropy = self.calculate_entropy(initial_raw)

        def walk(obj):
            if isinstance(obj, dict):
                for k, v in obj.items():
                    lower_k = k.lower()
                    if isinstance(v, str):
                        # National IDs
                        if config.maskNationalIDs and (any(x in lower_k for x in ['id', 'national', 'emirates']) or self.EMIRATES_ID_REGEX.search(v) or self.SAUDI_ID_REGEX.search(v)):
                            obj[k] = f"ID-TOKEN-{hashlib.sha256(v.encode()).hexdigest()[:6].upper()}"
                            pii_found.append('national_id')
                        # Financials
                        elif config.maskIBAN and (any(x in lower_k for x in ['iban', 'bank']) or self.IBAN_REGEX.search(v)):
                            obj[k] = self.mask_iban(v)
                            pii_found.append('iban')
                        elif config.maskCreditCard and (any(x in lower_k for x in ['cc', 'card']) or self.CC_REGEX.search(v)):
                            obj[k] = self.mask_cc(v)
                            pii_found.append('credit_card')
                        # PII
                        elif config.maskEmails and ( 'email' in lower_k or self.EMAIL_REGEX.search(v)):
                            obj[k] = self.mask_email(v)
                            pii_found.append('email')
                        elif config.maskPhones and ('phone' in lower_k or self.PHONE_REGEX.search(v)):
                            obj[k] = self.mask_phone(v)
                            pii_found.append('phone')
                        elif config.maskNames and 'name' in lower_k:
                            obj[k] = self.mask_name(v)
                            pii_found.append('name')
                        elif config.maskAddresses and 'address' in lower_k:
                            obj[k] = self.fpe_mask_digits(v)
                            pii_found.append('address')
                    else:
                        walk(v)
            elif isinstance(obj, list):
                for item in obj:
                    walk(item)

        walk(masked)
        
        masked_raw = str(masked)
        masked_entropy = self.calculate_entropy(masked_raw)
        entropy_reduction = ((initial_entropy - masked_entropy) / initial_entropy * 100) if initial_entropy > 0 else 0

        latency_ms = (time.perf_counter() - start_time) * 1000

        return MaskingResult(
            masked=masked,
            original=original,
            metadata={
                "latencies": latency_ms,
                "entropyReduction": max(0, entropy_reduction),
                "riskScore": max(0, 100 - (len(set(pii_found)) * 12 + entropy_reduction)),
                "piiFound": list(set(pii_found)),
                "engine": "AnonymX-Python-v2"
            }
        )
