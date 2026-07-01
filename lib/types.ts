// The three data "components" that admins can place on onboarding pages 2 and 3.
export type ComponentKey = "about_me" | "address" | "birthdate";

export const ALL_COMPONENTS: ComponentKey[] = [
  "about_me",
  "address",
  "birthdate",
];

export const COMPONENT_LABELS: Record<ComponentKey, string> = {
  about_me: "About Me",
  address: "Address",
  birthdate: "Birthdate",
};

// Page config maps an onboarding page number (2 or 3) to the components shown.
export type PageConfig = {
  page2: ComponentKey[];
  page3: ComponentKey[];
};

// Default configuration used on first load / when nothing is saved yet.
// Every page must have at least one component; this satisfies that rule.
export const DEFAULT_CONFIG: PageConfig = {
  page2: ["about_me", "birthdate"],
  page3: ["address"],
};

export type UserRecord = {
  id: string;
  email: string;
  about_me: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  birthdate: string | null;
  current_step: number;
  created_at: string;
};
