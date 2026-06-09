export const GCC_NAMES = [
  "Mohammed Al-Saud", "Fatima Al-Rashid", "Ahmed Ibrahim", "Sara Al-Maktoum",
  "Khalid Bin Salman", "Noora Al-Hashemi", "Omar Al-Fayed", "Layla Al-Amiri",
  "Yousef Al-Zayani", "Mariam Al-Qasimi"
];

export const CITIES = [
  "Riyadh, Saudi Arabia", "Dubai, UAE", "Abu Dhabi, UAE", "Jeddah, KSA",
  "Doha, Qatar", "Kuwait City, Kuwait", "Manama, Bahrain", "Muscat, Oman"
];

export const generateTransaction = () => {
  const name = GCC_NAMES[Math.floor(Math.random() * GCC_NAMES.length)];
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const isKSA = city.includes("KSA") || city.includes("Saudi");
  const phonePrefix = isKSA ? "+966" : "+971";
  
  const randomDigits = () => Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  const email = `${name.toLowerCase().replace(/ /g, '.')}@example.${isKSA ? 'sa' : 'ae'}`;

  return {
    order_id: `TXN-${Math.random().toString(36).toUpperCase().slice(2, 10)}`,
    timestamp: new Date().toISOString(),
    amount: (Math.random() * 5000 + 100).toFixed(2),
    currency: isKSA ? "SAR" : "AED",
    customer: {
      name,
      email,
      phone: `${phonePrefix} 5${Math.floor(Math.random() * 9)} ${randomDigits()}`,
      address: `${Math.floor(Math.random() * 900) + 100} Al-Wasl Road, ${city}`,
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
