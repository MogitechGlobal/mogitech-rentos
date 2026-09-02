// apps/web/data/faq/faqs.ts

export type FAQCategory =
  | "tenants"
  | "landlords"
  | "property-management"
  | "agents"
  | "billing"
  | "maintenance"
  | "security"
  | "features"
  | "marketplace"
  | "pricing"
  | "all";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  audience: (
    | "tenant"
    | "landlord"
    | "property-manager"
    | "agent"
    | "owner"
  )[];
  keywords: string[];
  relatedLinks?: {
    label: string;
    href: string;
  }[];
}

export const faqCategories: { id: FAQCategory; label: string; description: string }[] = [
  { id: 'all', label: 'All Questions', description: 'Explore our complete support library.' },
  { id: 'tenants', label: 'For Tenants', description: 'Finding homes, viewings, and tenant portals.' },
  { id: 'landlords', label: 'For Landlords', description: 'Managing properties, leases, and portfolios.' },
  { id: 'property-management', label: 'Property Managers', description: 'Staff permissions, landlord statements, and multi-building control.' },
  { id: 'agents', label: 'Real Estate Agents', description: 'Listing management and lead pipelines.' },
  { id: 'billing', label: 'Rent & M-Pesa', description: 'Automated collection, arrears, and receipts.' },
  { id: 'maintenance', label: 'Maintenance', description: 'Ticketing and vendor dispatch.' },
  { id: 'security', label: 'Security & Data', description: 'Data protection and ownership.' },
  { id: 'pricing', label: 'Pricing & Getting Started', description: 'Migration, setup, and onboarding.' }
];

export const faqs: FAQ[] = [
  {
    id: "find-house-mogirent",
    question: "How do I find a house to rent using MogiRent?",
    answer: "You can browse verified apartments, houses, and commercial spaces directly on the MogiRent marketplace. Listings include detailed pricing, high-resolution photo galleries, and exact neighborhood data with zero broker fees.",
    category: "tenants",
    audience: ["tenant"],
    keywords: ["houses to rent in Nairobi", "apartments to rent in Nairobi", "find home"],
    relatedLinks: [{ label: "Explore Marketplace", href: "/marketplace" }, { label: "Tenant Guides", href: "/blog" }]
  },
  {
    id: "schedule-property-viewing",
    question: "Can I schedule a property viewing online?",
    answer: "Yes, once you find a property listing of interest on the marketplace, you can securely submit a viewing request inquiry. The property manager or landlord will coordinate directly with you.",
    category: "tenants",
    audience: ["tenant"],
    keywords: ["house viewing", "schedule inspection"]
  },
  {
    id: "tenant-portal-access",
    question: "Do tenants need to download a separate mobile app?",
    answer: "No app store download is required. The Tenant Portal is a lightweight Progressive Web App (PWA) accessible via any smartphone browser, allowing you to view leases, download payment receipts, and submit maintenance tickets instantly.",
    category: "tenants",
    audience: ["tenant"],
    keywords: ["tenant portal", "pwa app"]
  },
  {
    id: "manage-multiple-properties",
    question: "Can I manage multiple properties and units as a landlord?",
    answer: "Yes. MogiRentOS is built to handle portfolios ranging from single residential buildings to sprawling multi-unit apartment complexes. You can track occupied and vacant units, view tenant balances, and generate financial reports from a unified dashboard.",
    category: "landlords",
    audience: ["landlord", "owner"],
    keywords: ["property management software Kenya", "landlord software Kenya", "manage rental properties"],
    relatedLinks: [{ label: "View Pricing Plans", href: "/pricing" }]
  },
  {
    id: "track-rental-arrears",
    question: "How can I track rental arrears and unpaid rent?",
    answer: "The platform features real-time ledger tracking. When rent is overdue, the system automatically flags defaulting units, updates tenant balances, and allows you to dispatch automated payment reminders.",
    category: "landlords",
    audience: ["landlord", "property-manager"],
    keywords: ["track rental arrears", "rent collection software Kenya", "unpaid rent"]
  },
  {
    id: "digital-lease-agreements",
    question: "Can I manage and sign tenant leases digitally?",
    answer: "Yes. You can deploy dynamic lease templates, include custom clauses, and invite tenants to securely sign agreements online with verifiable digital audit trails.",
    category: "landlords",
    audience: ["landlord", "property-manager", "agent"],
    keywords: ["digital lease agreements", "tenant management software"]
  },
  {
    id: "property-manager-permissions",
    question: "Can staff members have different role-based permissions?",
    answer: "Yes. MogiRentOS supports Role-Based Access Control (RBAC), enabling you to restrict caretakers, accountants, or leasing agents so they only access the specific buildings or reports relevant to their responsibilities.",
    category: "property-management",
    audience: ["property-manager"],
    keywords: ["staff permissions", "property management system Kenya"]
  },
  {
    id: "generate-landlord-statements",
    question: "Can I generate financial statements for individual landlords?",
    answer: "Yes. Professional property managers overseeing portfolios for multiple property owners can generate itemized income, expense, and commission statements per landlord.",
    category: "property-management",
    audience: ["property-manager", "agent"],
    keywords: ["landlord statements", "property performance reports"]
  },
  {
    id: "agents-manage-listings",
    question: "Can real estate agents manage property listings and leads?",
    answer: "Agents can publish vacant units to the marketplace, manage incoming prospect inquiries through an integrated CRM pipeline, and track portfolio availability across multiple buildings.",
    category: "agents",
    audience: ["agent"],
    keywords: ["property management software for agents", "real estate agency software Kenya", "lead pipeline"]
  },
  {
    id: "mpesa-rent-collection",
    question: "How does MogiRent support rent payment tracking?",
    answer: "MogiRent helps record and track rent payments efficiently. Incoming collections are matched against tenant invoices to keep financial ledgers clear and up to date.",
    category: "billing",
    audience: ["landlord", "property-manager", "tenant"],
    keywords: ["M-Pesa rent collection", "automated rent collection Kenya", "rent collection system Kenya"],
    relatedLinks: [{ label: "Read M-Pesa Guide", href: "/blog/automate-mpesa-rent-collection" }]
  },
  {
    id: "partial-rent-payment",
    question: "Can tenants make partial rent payments?",
    answer: "Yes. The system fully supports partial payments, automatically calculating the remaining balance and updating invoice statuses to reflect outstanding arrears.",
    category: "billing",
    audience: ["landlord", "tenant"],
    keywords: ["partial rent payment", "tenant balances"]
  },
  {
    id: "maintenance-requests",
    question: "How do tenants submit maintenance requests?",
    answer: "Tenants log into their portal, select an issue category (such as plumbing or electrical), attach photo evidence, and submit a ticket that routes directly to your dashboard and assigned maintenance staff.",
    category: "maintenance",
    audience: ["tenant", "landlord", "property-manager"],
    keywords: ["maintenance request", "track maintenance", "repair tickets"]
  },
  {
    id: "tenant-data-security",
    question: "Is my tenant and property information secure?",
    answer: "We employ strict data security protocols, encryption standards, and Role-Based Access Control to ensure your operational files, leases, and financial ledgers remain confidential.",
    category: "security",
    audience: ["landlord", "property-manager", "owner"],
    keywords: ["tenant data security", "property data protection"]
  },
  {
    id: "data-ownership-export",
    question: "Who owns the property data, and can I export it?",
    answer: "You retain 100% ownership of your portfolio data. You can export your tenant lists, invoices, and ledgers into CSV or PDF formats at any time.",
    category: "security",
    audience: ["landlord", "property-manager"],
    keywords: ["export data", "property records"]
  },
  {
    id: "getting-started-mogirent",
    question: "How do I get started with MogiRent?",
    answer: "You can explore our flexible pricing plans or register an account to begin setting up your properties, inviting tenants, and streamlining your rental operations.",
    category: "pricing",
    audience: ["landlord", "property-manager", "agent"],
    keywords: ["pricing", "getting started", "onboarding"],
    relatedLinks: [{ label: "View Pricing", href: "/pricing" }, { label: "Contact Sales", href: "/contact" }]
  }
];