// Kerala Postal Divisions & India Pincode Verification Utility

export interface PincodeInfo {
  valid: boolean;
  pincode: string;
  district?: string;
  state?: string;
  postOffice?: string;
  isKerala: boolean;
  deliveryDays: string;
  shippingCharge: string;
  message: string;
}

// Comprehensive Kerala District mapping based on postal prefixes and series
const KERALA_PREFIX_MAP: Array<{
  match: (pin: number) => boolean;
  district: string;
}> = [
  // Kasaragod: 671xxx
  { match: (p) => p >= 671000 && p <= 671999, district: "Kasaragod" },
  // Kannur: 670xxx
  { match: (p) => p >= 670000 && p <= 670999, district: "Kannur" },
  // Wayanad: specific ranges in 673xxx (e.g., Kalpetta 673121-124, Mananthavady 673571-579, Sulthan Bathery 673591-596)
  {
    match: (p) =>
      (p >= 673121 && p <= 673124) ||
      (p >= 673571 && p <= 673579) ||
      (p >= 673591 && p <= 673596),
    district: "Wayanad",
  },
  // Kozhikode: 673xxx
  { match: (p) => p >= 673000 && p <= 673999, district: "Kozhikode" },
  // Malappuram: 676xxx, 6793xx
  {
    match: (p) =>
      (p >= 676000 && p <= 676999) ||
      (p >= 679300 && p <= 679399),
    district: "Malappuram",
  },
  // Palakkad: 678xxx, 6791xx, 6792xx, 6795xx
  {
    match: (p) =>
      (p >= 678000 && p <= 678999) ||
      (p >= 679000 && p <= 679299) ||
      (p >= 679400 && p <= 679999),
    district: "Palakkad",
  },
  // Thrissur: 680xxx
  { match: (p) => p >= 680000 && p <= 680999, district: "Thrissur" },
  // Ernakulam: 682xxx (Kochi urban), 683xxx (Aluva / Angamaly / Perumbavoor)
  {
    match: (p) =>
      (p >= 682000 && p <= 682999) ||
      (p >= 683000 && p <= 683999),
    district: "Ernakulam",
  },
  // Idukki: 685xxx
  { match: (p) => p >= 685000 && p <= 685999, district: "Idukki" },
  // Kottayam: 686xxx
  { match: (p) => p >= 686000 && p <= 686999, district: "Kottayam" },
  // Alappuzha: 688xxx, 690xxx (Kayamkulam, Mavelikkara)
  {
    match: (p) =>
      (p >= 688000 && p <= 688999) ||
      (p >= 690100 && p <= 690599),
    district: "Alappuzha",
  },
  // Pathanamthitta: 689xxx
  { match: (p) => p >= 689000 && p <= 689999, district: "Pathanamthitta" },
  // Kollam: 691xxx
  { match: (p) => p >= 691000 && p <= 691999, district: "Kollam" },
  // Thiruvananthapuram: 695xxx
  { match: (p) => p >= 695000 && p <= 695999, district: "Thiruvananthapuram" },
];

/**
 * Fast synchronous offline lookup for Kerala District by pincode
 */
export function getLocalKeralaDistrict(pincode: string): string | null {
  const pinNum = parseInt(pincode, 10);
  if (isNaN(pinNum) || pincode.length !== 6) return null;

  for (const entry of KERALA_PREFIX_MAP) {
    if (entry.match(pinNum)) {
      return entry.district;
    }
  }

  // Any remaining 67xxxx, 68xxxx, 69xxxx belongs to Kerala postal circle
  if (pinNum >= 670000 && pinNum <= 695999) {
    return "Kerala";
  }

  return null;
}

/**
 * Verify pincode with India Post API + instant offline Kerala fallback
 */
export async function verifyPincode(rawPin: string): Promise<PincodeInfo> {
  const pin = rawPin.trim().replace(/\D/g, "");

  if (pin.length !== 6) {
    return {
      valid: false,
      pincode: pin,
      isKerala: false,
      deliveryDays: "",
      shippingCharge: "",
      message: "Please enter a valid 6-digit Indian PIN code.",
    };
  }

  // 1. Check local Kerala lookup immediately
  const localDistrict = getLocalKeralaDistrict(pin);
  const isLikelyKerala = Boolean(localDistrict || (pin.startsWith("67") || pin.startsWith("68") || pin.startsWith("69")));

  // 2. Try online India Post API for exact Post Office / Area details (with 2.5s timeout)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const district = po.District || localDistrict || "Kerala";
        const state = po.State || (isLikelyKerala ? "Kerala" : "India");
        const postOffice = po.Name;
        const isKeralaState = state.toLowerCase().includes("kerala") || isLikelyKerala;

        return {
          valid: true,
          pincode: pin,
          district,
          state,
          postOffice,
          isKerala: isKeralaState,
          deliveryDays: isKeralaState ? "2 - 3 business days" : "4 - 6 business days",
          shippingCharge: "FREE Express Delivery",
          message: isKeralaState
            ? `Delivery available to ${postOffice ? `${postOffice}, ` : ""}${district}, Kerala.`
            : `All-India delivery available to ${postOffice ? `${postOffice}, ` : ""}${district}, ${state}.`,
        };
      }
    }
  } catch {
    // API timed out or network failed, fallback gracefully to offline logic
  }

  // 3. Graceful offline fallback
  if (isLikelyKerala) {
    const districtName = localDistrict || "Kerala";
    return {
      valid: true,
      pincode: pin,
      district: districtName,
      state: "Kerala",
      isKerala: true,
      deliveryDays: "2 - 3 business days",
      shippingCharge: "FREE Express Delivery",
      message: `Delivery available to ${districtName}, Kerala.`,
    };
  }

  // Valid Indian PIN code format (PIN codes start with digits 1-8)
  const firstDigit = parseInt(pin[0], 10);
  if (firstDigit >= 1 && firstDigit <= 8) {
    return {
      valid: true,
      pincode: pin,
      state: "India",
      isKerala: false,
      deliveryDays: "4 - 6 business days",
      shippingCharge: "FREE Express Delivery",
      message: `Pan-India delivery available to PIN code ${pin}.`,
    };
  }

  return {
    valid: false,
    pincode: pin,
    isKerala: false,
    deliveryDays: "",
    shippingCharge: "",
    message: "Invalid Indian PIN code. Please check and try again.",
  };
}
