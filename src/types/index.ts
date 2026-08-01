export interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  text: string;
}

export interface Villa {
  id: string;
  name: string;
  slug: string;
  location: string;
  /** Destination name, denormalized for display. */
  destination: string;
  /** FK into destinations — needed by the admin form, unused by the public site. */
  destination_id?: string;
  description: string;
  price_per_night: number;
  weekend_price?: number;
  seasonal_price?: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  beds?: number;
  amenities: string[];
  full_amenities?: string[];
  images: string[];
  rating: number;
  review_count: number;
  is_superhost: boolean;
  owner_whatsapp: string;
  owner_name?: string;
  /** Optional. When set, the owner is emailed about new inquiries too. */
  owner_email?: string;
  host_since?: string;
  is_active: boolean;
  created_at: string;
  reviews?: Review[];
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  image: string;
  villa_count: number;
  meta_title?: string;
  meta_description?: string;
}

export interface BookingRequest {
  id: string;
  villa_id: string;
  user_id?: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  message?: string;
  admin_notes?: string;
  created_at: string;
}

/**
 * A booking request joined with the villa it's for. Used by the admin
 * bookings screens and by "My bookings" on the guest dashboard.
 */
export interface BookingRequestWithVilla extends BookingRequest {
  villa_name: string;
  villa_slug: string;
  villa_location: string;
  villa_image: string | null;
}

export type VillaSubmissionStatus =
  | "pending"
  | "reviewed"
  | "approved"
  | "rejected";

/** A property owner's submission from the public /list-your-villa form. */
export interface VillaSubmission {
  id: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  villa_name: string;
  location: string;
  destination?: string;
  bedrooms?: number;
  bathrooms?: number;
  max_guests?: number;
  description?: string;
  amenities: string[];
  price_per_night?: number;
  weekend_price?: number;
  message?: string;
  status: VillaSubmissionStatus;
  admin_notes?: string;
  created_at: string;
}

/** The signed-in guest's profile row. */
export interface Profile {
  id: string;
  full_name?: string;
  is_admin: boolean;
}
