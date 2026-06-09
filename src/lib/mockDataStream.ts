export const GCC_NAMES = [
  "Mohammed Al-Saud", "Fatima Al-Rashid", "Ahmed Ibrahim", "Sara Al-Maktoum",
  "Khalid Bin Salman", "Noora Al-Hashemi", "Omar Al-Fayed", "Layla Al-Amiri",
  "Yousef Al-Zayani", "Mariam Al-Qasimi"
];

export const CITIES = [
  "Riyadh, Saudi Arabia", "Dubai, UAE", "Abu Dhabi, UAE", "Jeddah, KSA",
  "Doha, Qatar", "Kuwait City, Kuwait", "Manama, Bahrain", "Muscat, Oman"
];

export const DB_TARGETS = [
  "Iceberg:finance_ops", "Iceberg:customer_360", "Iceberg:bnpl_ledger", 
  "Snowflake:marketing_prod", "Delta:risk_analysis"
];

export const generateTransaction = () => {
  const name = GCC_NAMES[Math.floor(Math.random() * GCC_NAMES.length)];
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const isKSA = city.includes("KSA") || city.includes("Saudi");
  const phonePrefix = isKSA ? "+966" : "+971";
  
  const randomDigits = (n: number) => Array.from({length: n}, () => Math.floor(Math.random() * 10)).join('');
  const email = `${name.toLowerCase().replace(/ /g, '.')}@example.${isKSA ? 'sa' : 'ae'}`;

  return {
    order_id: `TXN-${Math.random().toString(36).toUpperCase().slice(2, 10)}`,
    target_db: DB_TARGETS[Math.floor(Math.random() * DB_TARGETS.length)],
    timestamp: new Date().toISOString(),
    amount: (Math.random() * 5000 + 100).toFixed(2),
    currency: isKSA ? "SAR" : "AED",
    customer: {
      name,
      email,
      phone: `${phonePrefix} 5${Math.floor(Math.random() * 9)} ${randomDigits(7)}`,
      address: `${Math.floor(Math.random() * 900) + 100} Al-Wasl Road, ${city}`,
      credit_card: `4${randomDigits(3)} ${randomDigits(4)} ${randomDigits(4)} ${randomDigits(4)}`,
    },
    items: [
      { id: "p-101", name: "Premium BNPL Installment", price: 250.00 },
      { id: "p-202", name: "High-Frequency Trade Gas", price: 12.50 }
    ],
    status: "processing"
  };
};

export function* transactionStream() {
  while (true) {
    yield generateTransaction();
  }
}
