// apps/web/data/pricing/plans.ts

export interface PricingPlan {
  id: string;
  name: string;
  price: number | null;
  currency: string;
  billingPeriod?: string;
  description: string;
  portfolioLimit: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  popular?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 1500,
    currency: "KSh",
    billingPeriod: "month",
    description: "For individual landlords getting started with digital property management.",
    portfolioLimit: "1 property · Up to 30 units",
    features: [
      "Property & unit management",
      "Tenant records & lease history",
      "Rent tracking & invoices",
      "Arrears visibility",
      "Maintenance request logs",
      "Tenant portal access",
      "Standard support"
    ],
    ctaLabel: "Get Started",
    ctaHref: "/register?plan=starter",
    popular: false
  },
  {
    id: "basic",
    name: "Basic",
    price: 2500,
    currency: "KSh",
    billingPeriod: "month",
    description: "The essential tools for growing property portfolios.",
    portfolioLimit: "Up to 3 properties · Up to 50 units",
    features: [
      "Property & unit management",
      "Tenant records & lease history",
      "Rent tracking & invoices",
      "Arrears visibility",
      "Maintenance request logs",
      "Tenant portal access",
      "Standard support"
    ],
    ctaLabel: "Get Started",
    ctaHref: "/register?plan=basic",
    popular: false
  },
  {
    id: "standard",
    name: "Standard",
    price: 4500,
    currency: "KSh",
    billingPeriod: "month",
    description: "Designed for established property managers and agencies.",
    portfolioLimit: "Up to 5 properties · Up to 100 units",
    features: [
      "Property & unit management",
      "Tenant records & lease history",
      "Rent tracking & invoices",
      "Arrears visibility",
      "Maintenance request logs",
      "Tenant portal access",
      "Team access & staff permissions",
      "Advanced reporting",
      "Priority support"
    ],
    ctaLabel: "Get Started",
    ctaHref: "/register?plan=standard",
    popular: true
  },
  {
    id: "professional",
    name: "Professional",
    price: 6500,
    currency: "KSh",
    billingPeriod: "month",
    description: "The complete operating system for larger property operations.",
    portfolioLimit: "Unlimited properties & units",
    features: [
      "Property & unit management",
      "Tenant records & lease history",
      "Rent tracking & invoices",
      "Arrears visibility",
      "Maintenance request logs",
      "Tenant portal access",
      "Team access & staff permissions",
      "Advanced reporting",
      "Priority support"
    ],
    ctaLabel: "Get Started",
    ctaHref: "/register?plan=pro",
    popular: false
  }
];