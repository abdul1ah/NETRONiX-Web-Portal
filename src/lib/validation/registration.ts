/**
 * Registration form schema — the single validation contract.
 *
 * Imported by the client form (instant feedback) and by the API route
 * (the check that actually counts, since anything can POST to the API).
 * The database CHECK constraints in schema.sql are the third and final layer.
 */

import { z } from "zod";
import { BATCH_OPTIONS, SKILL_VALUES } from "@/lib/events";

const BATCH_VALUES = BATCH_OPTIONS.map(String) as [string, ...string[]];

export const RegistrationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Please enter your full name")
      .max(100, "That name is too long"),

    registrationNumber: z
      .string()
      .trim()
      .min(4, "Please enter your registration number")
      .max(30, "That registration number is too long")
      // GIKI format is like 2023388, but batches vary — stay permissive and
      // only reject characters that clearly are not part of a reg number.
      .regex(
        /^[A-Za-z0-9\-/]+$/,
        "Use letters, numbers, dashes and slashes only"
      ),

    batch: z.enum(BATCH_VALUES, { message: "Select your batch" }),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Please enter your email")
      .max(150, "That email is too long")
      .email("Enter a valid email address"),

    phone: z
      .string()
      .trim()
      .min(7, "Please enter your phone number")
      .max(20, "That phone number is too long")
      .regex(/^[0-9+\-\s()]+$/, "Use digits, spaces, +, - and () only"),

    hostel: z
      .string()
      .trim()
      .min(1, "Please enter your hostel and room number")
      .max(60, "That is too long"),

    skills: z
      .array(z.enum(SKILL_VALUES as [string, ...string[]]))
      .min(1, "Pick at least one skill")
      .max(SKILL_VALUES.length, "Too many skills selected"),

    otherSkill: z
      .string()
      .trim()
      .max(200, "Keep this under 200 characters")
      .optional()
      .or(z.literal("")),

    aboutNetronix: z
      .string()
      .trim()
      .min(10, "Tell us a little more — at least 10 characters")
      .max(2000, "Keep this under 2000 characters"),
  })
  // If they tick "Other", they have to say what it is.
  .refine(
    (data) => !data.skills.includes("other") || Boolean(data.otherSkill?.trim()),
    {
      message: "You ticked Other — tell us what that skill is",
      path: ["otherSkill"],
    }
  );

export type RegistrationInput = z.infer<typeof RegistrationSchema>;

/** Empty form state, so the client form has a typed starting point. */
export const EMPTY_REGISTRATION: RegistrationInput = {
  fullName: "",
  registrationNumber: "",
  batch: "36",
  email: "",
  phone: "",
  hostel: "",
  skills: [],
  otherSkill: "",
  aboutNetronix: "",
};
