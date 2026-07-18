import type { OwnerType } from "@/shared/lib";

export interface OwnerRequestFormValues {
  ownerType: OwnerType;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  companyName?: string;
  siret?: string;
  vatNumber?: string;
}
