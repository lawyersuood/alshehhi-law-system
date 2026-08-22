import fs from 'fs';
import { records1to150 } from './records1to150.js';
import { records151to300 } from './records151to300.js';
import { records301to450 } from './records301to450.js';
import { records451toEnd } from './records451toEnd.js';

const allRaw = [
  ...records1to150,
  ...records151to300,
  ...records301to450,
  ...records451toEnd
];

console.log(`Total raw records combined: ${allRaw.length}`);

// Map to CourtContact schema with numeric id
const courtContacts = allRaw.map((rec, index) => {
  return {
    id: index + 1,
    courtName: rec.court.trim(),
    emirate: rec.em.trim() || "غير محدد",
    department: rec.dept.trim() || "",
    titleOrEmployee: rec.name.trim() || "",
    phone: rec.phone.trim() || "",
    extOrSeal: "",
    email: rec.email.trim() || "",
    operatingHours: rec.hours.trim() || "",
    location: rec.loc.trim() || "",
    notes: rec.source ? `المصدر: ${rec.source}` : ""
  };
});

const fileContent = `// Court and Entity directory contacts seeded from verified official directory list
export interface CourtContact {
  id: number;
  courtName: string;
  emirate: string;
  department: string;
  titleOrEmployee: string;
  phone: string;
  extOrSeal: string;
  email: string;
  operatingHours: string;
  location: string;
  notes: string;
}

export const seedCourtContacts: CourtContact[] = ${JSON.stringify(courtContacts, null, 2)};
`;

fs.writeFileSync('./src/courtContactsData.ts', fileContent, 'utf-8');
console.log(`Successfully wrote ${courtContacts.length} contacts with numeric IDs to ./src/courtContactsData.ts`);
