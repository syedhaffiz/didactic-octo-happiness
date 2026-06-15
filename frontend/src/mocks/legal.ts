// Mirror of backend/src/mocks/legal.ts — kept in sync. The HTTP and mock API
// layers branch on USE_MOCK_DATA.

import type {
  CriticalCase,
  CriticalCasesResponse,
  CriticalIssue,
  CriticalIssuesResponse,
  LegalFilters,
  LegalSummary,
} from "../types/legal";

export const buildLegalSummary = (_f: LegalFilters = {}): LegalSummary => ({
  newCases: 2,
  totalCases: 16,
  newIssues: 2,
  totalIssues: 16,
});

const FIGMA_CASES: Omit<CriticalCase, "srNo">[] = [
  {
    caseNo: "EC/103/2022",
    category: "SEB",
    claimant: "(S. 34)\nWBPDCL\n(Execution)\nAEL",
    defendant: "(S. 34)\nAEL\n(Execution)\nWBPDCL",
    forum: "Calcutta High Court, Calcutta Bench (Hon'ble Justice Gaurang Kanth)",
    claim: "Rs. 25 Cr. Approx + Interest",
    costIncurred: "2.57Cr",
    lawyer: "",
    lastDate: "07.05.2026",
    nextDate: "Awaited",
    caseType: "Arbitration",
    title: "WBPDCL vs. AEL",
    briefFacts:
      "WBPDCL issued PO 14.08.2012 for coal supply to AEL. WBPDCL defaulted (delayed payments, short-closure). AEL initiated Arbitration; and Award 27.08.2021 passed in favour of AEL. WBPDCL filed S.34; AEL filed Execution. HC ordered (28.10.2022) WBPDCL to pay Rs. 32.34 Cr to AEL (Escrow). AEL filed opposition before HC; WBPDCL failed to deposit in time. Matter posted to Justice Gaurang.",
    currentStatus:
      "\"The Hon'ble HC through its Order dated 28.03.2023 ordered WBPDCL to pay Rs. 32.34 Cr to AEL in relation to Arbitration Award. This was duly received by AEL.\n\n  Later, as per the HC's Order dated 02.07.2024, we filed our opposition affidavit to the S.34 Petition filed by WBPDCL. They have not filed their reply to the same yet.\n\n  On 07.05.2026, our counsel mentioned the matter. However, it was notified by the opposite party's present counsels i.e. Fox and Mandal, that they might not continue to represent the Claimant in the matter pertaining to the change in govt. Hence, the Ld. Judge asked our counsel to mention the matter after 2 weeks.\"",
  },
  {
    caseNo: "AA 99/2022",
    category: "SEB",
    claimant: "MPPGCL",
    defendant: "AEL",
    forum:
      "Madhya Pradesh High Court, Jabalpur Bench (As per roster, to be listed before Just. Vivek Rusia and Just. Pradeep Mittal)",
    claim: "Rs. 89.61 Cr. + Interest",
    costIncurred: "1.15Cr",
    lawyer: "Mr. Naman Nagrath (Sr. Adv.) (assisted by Mr. Jubin Prasad (Adv.))",
    lastDate: "",
    nextDate: "03.01.2027",
    caseType: "Arbitration",
    title: "MPPGCL vs. AEL",
    briefFacts:
      "MPPGCL coal supply dispute regarding PO 2019; alleged short supply leading to claim of Rs. 89.61 Cr. Award is under challenge in MP High Court, Jabalpur Bench.",
    currentStatus:
      "Matter listed before the bench. Awaiting next date of hearing — counsel of record is Mr. Naman Nagrath, Sr. Adv.",
  },
  {
    caseNo: "EX AB 150/2025",
    category: "Private",
    claimant: "AEL",
    defendant: "MPPGCL",
    forum:
      "Arbitration before Sole Arbitrator Amit Chadha, Adv. (under Delhi International Arbitration centre)",
    claim: "Rs. 89.61 Cr. + Interest",
    costIncurred: "Stamp Duty payment of Rs 2.69 Cr. (approx)",
    lawyer: "Mrs. Yugandhara Pawar Jha (Adv.)",
    lastDate: "",
    nextDate: "11.08.2026",
    caseType: "Arbitration",
    title: "AEL vs. MPPGCL",
    briefFacts:
      "Cross-claim by AEL for execution of arbitral award. Filed before the Delhi International Arbitration Centre on 02.01.2025.",
    currentStatus:
      "Stamp duty of Rs. 2.69 Cr. has been paid. Awaiting next directions from the Sole Arbitrator.",
  },
  {
    caseNo: "Arbitration Case No. 17 of 2018",
    category: "Insurance",
    claimant: "MPPGCL",
    defendant: "AEL",
    forum: "Commercial Court, Jabalpur, MP (Ld. Judge Mr. Ajay Ramawat)",
    claim: "Rs 38.99 Cr. + Interest",
    costIncurred: "3.17Cr",
    lawyer: "Mrs. Yugandhara Pawar Jha (Adv.)",
    lastDate: "",
    nextDate: "23.04.2027",
    caseType: "Suit",
    title: "MPPGCL vs. AEL",
    briefFacts:
      "Insurance subrogation claim arising from the 2018 dispute. Currently before the Commercial Court, Jabalpur.",
    currentStatus:
      "Defendant has filed reply; matter is at the stage of admission/denial of documents.",
  },
  {
    caseNo: "MJC Arb. No. 108/23",
    category: "Shipping",
    claimant: "AEL",
    defendant: "MPPGCL",
    forum: "Commercial Court, Jabalpur, MP (Ld. Judge Mr. Ajay Ramawat)",
    claim: "Rs. 59.50 Cr. approx. + Interest",
    costIncurred: "3.17Cr",
    lawyer: "Mr. Naman Nagrath (Sr. Adv.) (assisted by Mr. Jubin Prasad (Adv.))",
    lastDate: "",
    nextDate: "19.09.2026",
    caseType: "Arbitration",
    title: "AEL vs. MPPGCL",
    briefFacts:
      "Maritime shipping demurrage dispute. AEL initiated arbitration seeking Rs. 59.50 Cr. as approximate claim plus interest.",
    currentStatus: "Hearing pending. Next listed for 19.09.2026.",
  },
];

const CATEGORIES = ["SEB", "Private", "Insurance", "Shipping"] as const;
const FORUMS = [
  "Delhi High Court, New Delhi",
  "Bombay High Court, Mumbai Bench",
  "NCLT, Mumbai",
  "Supreme Court of India",
];

const generatedCase = (idx: number): Omit<CriticalCase, "srNo"> => {
  const category = CATEGORIES[idx % CATEGORIES.length] ?? "SEB";
  const forum = FORUMS[idx % FORUMS.length] ?? FORUMS[0]!;
  const claim = `Rs. ${(20 + idx * 5).toFixed(2)} Cr. + Interest`;
  return {
    caseNo: `GEN/${100 + idx}/2025`,
    category,
    claimant: "AEL",
    defendant: "OPP",
    forum,
    claim,
    costIncurred: `${(idx * 0.4).toFixed(2)}Cr`,
    lawyer: "Mr. Counsel (Adv.)",
    lastDate: "01.06.2026",
    nextDate: "12.12.2026",
    caseType: "Suit",
    title: `AEL vs. OPP ${idx + 1}`,
    briefFacts: `Generated placeholder facts for case GEN/${100 + idx}/2025.`,
    currentStatus: "Matter pending. Generated placeholder status.",
  };
};

const ALL_CASES: Omit<CriticalCase, "srNo">[] = [
  ...FIGMA_CASES,
  ...Array.from({ length: 11 }, (_, i) => generatedCase(i)),
];

export const buildCriticalCases = (_f: LegalFilters = {}): CriticalCasesResponse => ({
  items: ALL_CASES.map((c, i) => ({ srNo: i + 1, ...c })),
});

const ISSUES: Omit<CriticalIssue, "srNo">[] = [
  {
    legalIssue:
      "A statutory notice under Section 91 Criminal Procedure Code/Section 94 Bhartiya Nagrak Suraksha Sanhita, 2023 for production of documents has been received from the State Economic Offences Investigation & Anti-Corruption Bureau (EOW/ACB), Raipur, Chhattisgarh dated 30 April 2026 addressed to AEL (Attn: Compliance Officer).\nThe said notice has been sent seeking documents/information from AEL, in relation to investigation of an ongoing Case No. 03/2024 (criminal investigation) which pertains to large scale illegal levy syndicate of coal and liquor in the state of Chhattisgarh.\n\nAs per the said Notice, certain documents are required to be submitted before the investigating authorities.",
    amountInvolved: "NA",
    currentStatus: "We are currently in the process of data/document collation.",
  },
];

export const buildCriticalIssues = (_f: LegalFilters = {}): CriticalIssuesResponse => ({
  items: ISSUES.map((c, i) => ({ srNo: i + 1, ...c })),
});
