import fs from 'fs';

// Helper to determine Emirate based on courtName or notes
function getEmirate(courtName, notes = "") {
  if (courtName.includes("أبوظبي") || courtName.includes("الوثبة") || courtName.includes("العين") || courtName.includes("الاتحادية العليا")) return "أبوظبي";
  if (courtName.includes("دبي")) return "دبي";
  if (courtName.includes("الشارقة") || courtName.includes("الذيد") || courtName.includes("خورفكان") || courtName.includes("كلباء")) return "الشارقة";
  if (courtName.includes("عجمان")) return "عجمان";
  if (courtName.includes("رأس الخيمة")) return "رأس الخيمة";
  if (courtName.includes("أم القيوين")) return "أم القيوين";
  if (courtName.includes("الفجيرة") || courtName.includes("دبا") || courtName.includes("مسافي")) return "الفجيرة";
  if (courtName.includes("وزارة العدل")) return "اتحادية";
  return "الإمارات";
}

export { getEmirate };
