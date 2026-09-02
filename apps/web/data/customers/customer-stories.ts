// apps/web/data/customers/customer-stories.ts

export interface CustomerStory {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  image?: string;
  verified: boolean;
  approvedForPublicUse: boolean;
}

export const customerStories: CustomerStory[] = [
  // Set approvedForPublicUse to true only when real verified permissions are acquired.
  // Currently set to empty or unverified to prevent placeholder fabrication.
];