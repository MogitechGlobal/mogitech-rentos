// apps/web/app/blog/blogData.ts
export interface FAQItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categoryId: string;
  audience: "tenant" | "landlord" | "agent" | "general";
  author: string;
  datePublished: string;
  dateModified?: string;
  readTime: string;
  image: string;
  imageAlt: string;
  socialImage?: string;
  featured?: boolean;
  trending?: boolean;
  location?: string;
  keywords?: string[];
  content: string;
  keyTakeaways?: string[];
  faq?: FAQItem[];
}

export const blogCategories = [
  { id: 'all', label: 'All Insights' },
  { id: 'home', label: 'Find a Home' },
  { id: 'renting', label: 'Renting in Kenya' },
  { id: 'landlords', label: 'For Landlords' },
  { id: 'agents', label: 'For Property Agents' },
  { id: 'management', label: 'Property Management' },
  { id: 'mpesa', label: 'M-Pesa & Rent Collection' },
  { id: 'tech', label: 'Property Technology' },
  { id: 'market', label: 'Kenya Property Market' },
];

export const popularSearches = [
  "Houses to Rent in Nairobi",
  "Apartments to Rent in Nairobi",
  "1 Bedroom Apartments in Nairobi",
  "2 Bedroom Apartments in Nairobi",
  "Affordable Houses in Nairobi",
  "Houses to Rent in Kiambu",
  "Apartments in Kilimani",
  "Apartments in Westlands",
  "Property Management Software Kenya",
  "Rent Collection Software Kenya",
  "M-Pesa Rent Collection",
  "Property Management System Kenya"
];

export const blogPosts: BlogPost[] = [
  {
    id: 'automate-mpesa-rent-collection',
    slug: 'automate-mpesa-rent-collection',
    title: "How to Automate M-Pesa Rent Collection for Multiple Properties in Kenya",
    excerpt: "Stop hunting for transaction codes. Discover how modern Kenyan landlords are using zero-touch STK pushes and auto-reconciled ledgers to collect rent faster and eliminate manual data entry.",
    category: "M-Pesa & Rent Collection",
    categoryId: "mpesa",
    audience: "landlord",
    author: "Mogitech Research",
    datePublished: "April 20, 2026",
    dateModified: "September 2, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "M-Pesa automated rent collection mobile interface in Kenya",
    featured: true,
    trending: true,
    keywords: ["M-Pesa rent collection", "rent collection software Kenya", "M-Pesa rent automation"],
    keyTakeaways: [
      "Automating rent collection eliminates the need to manually sort through thousands of M-Pesa text messages.",
      "Direct STK push integrations allow tenants to pay with a single prompt on their phone.",
      "Auto-reconciled ledgers instantly update unit balances and flag defaults in real-time.",
      "Centralized record-keeping protects portfolio cash flow and simplifies financial reporting."
    ],
    content: `
      <h2 id="introduction">Introduction to Digital Rent Collection</h2>
      <p>The property management landscape in East Africa is undergoing a massive transformation. For decades, landlords and agencies relied heavily on manual ledger books, Excel spreadsheets, and endless WhatsApp threads to manage their rental portfolios. In 2026, this approach is no longer just inefficient—it's actively costing businesses money through delayed reconciliation and unspotted arrears.</p>
      
      <h2 id="the-end-of-excel">The End of the Excel Era</h2>
      <p>As portfolios grow past single-digit units, tracking M-Pesa payments, generating physical paper receipts, and manually cross-referencing bank statements becomes a logistical nightmare. Top property agencies in Nairobi, Mombasa, and Kisumu are now abandoning these legacy systems in favor of cloud-based property management software tailored specifically for the Kenyan market.</p>
      
      <h2 id="how-mpesa-automation-works">How M-Pesa STK Push Automation Works</h2>
      <p>Automation isn't just about saving administrative time; it's about accuracy and tenant satisfaction. Modern proptech platforms like Mogirent streamline collections through:</p>
      <ul>
        <li><strong>Automated STK Push Links:</strong> Dispatched securely via SMS directly to the tenant's mobile phone on the rental due date.</li>
        <li><strong>Algorithmic Payment Matching:</strong> Incoming M-Pesa transaction receipts are instantly mapped to the correct tenant ledger and unit.</li>
        <li><strong>Instant Digital Receipts:</strong> Verified receipts are generated and dispatched immediately upon clearance.</li>
      </ul>
      
      <h2 id="choosing-software">Choosing the Right Property Management System</h2>
      <p>When selecting property software in Kenya, ensure it supports local integrations such as Safaricom M-Pesa Paybills/Tills, automated SMS reminders, and KRA eTIMS invoicing compliance.</p>
    `,
    faq: [
      {
        question: "Can landlords collect rent through M-Pesa automatically?",
        answer: "Yes. By integrating your M-Pesa Paybill or Till number with a property management system like Mogirent, incoming payments are automatically matched to tenant accounts without manual intervention."
      },
      {
        question: "What happens if a tenant makes a partial rent payment?",
        answer: "Advanced property software automatically calculates the remaining balance, updates the tenant ledger, and reflects the outstanding arrears on the landlord dashboard."
      }
    ]
  },
  {
    id: 'legal-guide-digital-lease-kenya',
    slug: 'legal-guide-digital-lease-kenya',
    title: "The Legal Guide to Digital Lease Agreements in Kenya",
    excerpt: "Navigating digital contracts can be confusing. Learn what makes an e-signature legally binding for your next tenant lease under Kenyan law.",
    category: "Property Technology",
    categoryId: "tech",
    audience: "general",
    author: "Legal Team",
    datePublished: "April 15, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Digital lease agreement signed on a tablet",
    keyTakeaways: [
      "Electronic signatures hold equal legal standing to wet-ink signatures under Kenyan law.",
      "The Kenya Information and Communications Act provides the legal framework for digital contracts.",
      "Verifiable audit trails (IP logs and timestamps) are essential for tribunal enforceability."
    ],
    content: `
      <h2 id="introduction">Digital Leases Under Kenyan Law</h2>
      <p>Navigating digital contracts can be confusing for property owners. However, under the Kenya Information and Communications Act, electronic signatures hold the exact same legal weight as traditional wet-ink signatures, provided certain security and consent criteria are met.</p>
      
      <h2 id="making-esignatures-binding">Making E-Signatures Binding</h2>
      <p>When executing leases digitally, platforms must capture clear intent to sign from both landlord and tenant. Automated logging of IP addresses, device signatures, and secure timestamps creates an immutable audit trail, ensuring your lease agreement is fully enforceable in the Rent Restriction Tribunal.</p>
    `,
    faq: [
      {
        question: "Are digital lease agreements legally binding in Kenya?",
        answer: "Yes, electronic signatures are legally recognized and enforceable in Kenya under the Kenya Information and Communications Act (KICA)."
      }
    ]
  },
  {
    id: 'top-reasons-tenants-pay-late',
    slug: 'top-reasons-tenants-pay-late',
    title: "Top 5 Reasons Your Tenants Are Paying Late (And How to Fix It)",
    excerpt: "Stop chasing arrears. Discover the psychological and systemic reasons behind late rent, and the automated SMS reminder tools to solve them.",
    category: "Property Management",
    categoryId: "management",
    audience: "landlord",
    author: "Faith Wanjiku",
    datePublished: "April 10, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Financial calculation and rental arrears management",
    keyTakeaways: [
      "Friction in payment methods is a primary driver of accidental late rent payments.",
      "Automated SMS reminders sent 3 days before the due date reduce defaults significantly.",
      "Transparent ledger access encourages tenants to prioritize rent clearance."
    ],
    content: `
      <h2 id="introduction">The Arrears Challenge</h2>
      <p>Tenant turnover and late payments are the hidden killers of real estate ROI. Every time a unit sits empty or rent is delayed by weeks, your operating cash flow suffers.</p>
      
      <h2 id="friction-in-payments">1. Friction in Payment Channels</h2>
      <p>Nobody wants to walk to a bank branch or queue at an agent to deposit rent. Offering frictionless, integrated M-Pesa STK push links directly through a tenant portal drastically improves on-time compliance.</p>
      
      <h2 id="forgotten-deadlines">2. Simple Forgetfulness</h2>
      <p>Busy professionals often lose track of calendar dates. Implementing an automated multi-channel reminder schedule (SMS and Email) ensures rent remains top-of-mind.</p>
    `,
    faq: [
      {
        question: "How can I reduce rental arrears without constant phone calls?",
        answer: "By setting up automated SMS payment reminders and providing instant online M-Pesa payment links, landlords can automate the collection follow-up process."
      }
    ]
  },
  {
    id: 'excel-vs-property-software',
    slug: 'excel-vs-property-software',
    title: "Excel vs. Property Management Software: When is it time to upgrade?",
    excerpt: "Spreadsheets work until they don't. Here are the 5 undeniable signs your real estate portfolio has outgrown manual tracking and needs an ERP.",
    category: "Property Technology",
    categoryId: "tech",
    audience: "landlord",
    author: "Peter Kamau",
    datePublished: "April 5, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Property management analytics dashboard vs spreadsheets",
    keyTakeaways: [
      "Spreadsheets become error-prone and time-consuming once a portfolio exceeds 10 units.",
      "Manual bank reconciliation eats up valuable hours every month.",
      "Cloud property software provides role-based access for caretakers and accountants."
    ],
    content: `
      <h2 id="introduction">The Spreadsheet Limit</h2>
      <p>Spreadsheets work brilliantly when you manage 2 or 3 residential units. But once your portfolio expands across multiple properties and crosses the 10-unit mark, Excel turns into an administrative bottleneck.</p>
      
      <h2 id="signs-you-need-software">Signs You Need to Upgrade</h2>
      <p>If you spend more than 5 hours a month cross-referencing bank transaction codes with tenant names, or if you struggle to generate instant P&L statements for stakeholders, your business has outgrown manual tracking.</p>
    `
  },
  {
    id: 'houses-to-rent-nairobi-2026-guide',
    slug: 'houses-to-rent-nairobi-2026-guide',
    title: "Houses to Rent in Nairobi: Complete 2026 Guide",
    excerpt: "Looking for a home in Nairobi? Explore verified neighbourhoods, current rental pricing trends, viewing checklists, and how to bypass expensive broker fees.",
    category: "Find a Home",
    categoryId: "home",
    audience: "tenant",
    author: "Faith Wanjiku",
    datePublished: "April 18, 2026",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Modern residential house in Nairobi suburbs",
    trending: true,
    location: "Nairobi",
    keywords: ["houses to rent in Nairobi", "apartments to rent in Nairobi"],
    keyTakeaways: [
      "Nairobi's rental market spans diverse suburbs, from leafy Kilimani and Westlands to family-friendly Kasarani and Ruiru.",
      "Always inspect water pressure, security infrastructure, and token meter setups before paying a deposit.",
      "Using verified direct platforms like Mogirent helps tenants bypass extortionate broker viewing fees."
    ],
    content: `
      <h2 id="introduction">Navigating Nairobi's Rental Market</h2>
      <p>Finding a home in Nairobi can feel overwhelming. With dozens of neighborhoods offering different lifestyles, commutes, and pricing structures, house hunters need reliable market intelligence.</p>
      
      <h2 id="top-neighborhoods">Top Neighborhoods to Consider</h2>
      <p>Whether you're looking for high-rise apartments in Kilimani, secure gated townhouses in Karen, or affordable family houses along Thika Road, understanding local price points is key.</p>
    `,
    faq: [
      {
        question: "How can I avoid rental scams when searching for houses in Nairobi?",
        answer: "Never pay a deposit or viewing fee before physically visiting the property and verifying the landlord's identity or ownership documents."
      }
    ]
  }
];

export function getPostById(id: string): BlogPost | undefined {
  return blogPosts.find(p => p.id === id || p.slug === id);
}

export function getRelatedPosts(currentPost: BlogPost, limit = 3): BlogPost[] {
  return blogPosts
    .filter(p => p.id !== currentPost.id && (p.categoryId === currentPost.categoryId || p.audience === currentPost.audience))
    .slice(0, limit);
}