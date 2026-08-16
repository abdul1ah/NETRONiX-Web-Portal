/**
 * Database types — mirrors supabase/schema.sql.
 *
 * Hand-written rather than generated so the repo has no dependency on the
 * Supabase CLI. If you change schema.sql, change this file to match.
 */

export type EventStatus = "coming_soon" | "live" | "past";

export type RegistrationStatus =
  | "pending"
  | "confirmed"
  | "waitlisted"
  | "rejected";

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  image_src: string | null;
  image_placeholder: string | null;
  accent_color: string;
  status: EventStatus;
  auto_live_at: string | null;
  auto_close_at: string | null;
  registration_open: boolean;
  max_registrations: number | null;
  form_intro: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type RegistrationRow = {
  id: string;
  event_id: string;
  full_name: string;
  registration_number: string;
  batch: number;
  email: string;
  phone: string;
  hostel: string;
  about_netronix: string;
  skills: string[];
  other_skill: string | null;
  status: RegistrationStatus;
  admin_notes: string | null;
  email_sent_at: string | null;
  created_at: string;
}

export type AdminUserRow = {
  id: string;
  username: string;
  password_hash: string;
  display_name: string | null;
  last_login_at: string | null;
  created_at: string;
}

export type EventInsert = Partial<EventRow> & Pick<EventRow, "slug" | "title">;
export type EventUpdate = Partial<Omit<EventRow, "id" | "created_at">>;

export type RegistrationInsert = Omit<
  RegistrationRow,
  "id" | "created_at" | "status" | "admin_notes" | "email_sent_at"
> &
  Partial<Pick<RegistrationRow, "status">>;

/**
 * The shape supabase-js expects. Every table needs a `Relationships` entry or
 * the client's generics collapse to `never` and every query loses its types.
 */
export type Database = {
  public: {
    Tables: {
      events: {
        Row: EventRow;
        Insert: EventInsert;
        Update: EventUpdate;
        Relationships: [];
      };
      registrations: {
        Row: RegistrationRow;
        Insert: RegistrationInsert;
        Update: Partial<Omit<RegistrationRow, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_users: {
        Row: AdminUserRow;
        Insert: Omit<AdminUserRow, "id" | "created_at" | "last_login_at"> &
          Partial<Pick<AdminUserRow, "last_login_at">>;
        Update: Partial<Omit<AdminUserRow, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      event_status: EventStatus;
      registration_status: RegistrationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
