"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SectionWrapper, SectionItem } from "@/components/ui/section-wrapper";
import {
  submitComplaint,
  getComplaintStatus,
  type ComplaintPayload,
  type ComplaintStatus,
} from "@/lib/api/complaints";

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  name:        z.string().min(2, "Name must be at least 2 characters"),
  location:    z.string().min(2, "Please enter your room / block"),
  issueType:   z.enum(["network", "wifi", "lan", "other"]),
  description: z.string().min(10, "Please describe the issue in at least 10 characters"),
});

const trackSchema = z.object({
  ticketId: z.string().min(1, "Please enter a ticket ID"),
});

type FormData = z.infer<typeof schema>;
type TrackFormData = z.infer<typeof trackSchema>;

// ─── Process Steps ────────────────────────────────────────────────────────────

const STEPS: { id: ComplaintStatus; label: string }[] = [
  { id: "reported",    label: "Issue Reported" },
  { id: "assigned",    label: "Assigned"       },
  { id: "in_progress", label: "In Progress"    },
  { id: "resolved",    label: "Resolved"       },
];

const STATUS_INDEX: Record<ComplaintStatus, number> = {
  reported:    0,
  assigned:    1,
  in_progress: 2,
  resolved:    3,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ComplaintPortal() {
  const [activeTab,    setActiveTab]    = useState<"report" | "track">("report");
  const [submitted,    setSubmitted]    = useState(false);
  const [complaintId,  setComplaintId]  = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<ComplaintStatus>("reported");
  const [submitError,  setSubmitError]  = useState<string | null>(null);
  // Track ticket lookup state
  const [trackError,   setTrackError]   = useState<string | null>(null);
  const [trackedId,    setTrackedId]    = useState<string | null>(null);
  const [trackedStatus, setTrackedStatus] = useState<ComplaintStatus | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const {
    register: registerTrack,
    handleSubmit: handleTrackSubmit,
    formState: { errors: trackErrors, isSubmitting: isTracking },
  } = useForm<TrackFormData>({ resolver: zodResolver(trackSchema) });

  const descriptionValue = watch("description", "");


  // ── Poll status after submission ─────────────────────────────────────────
  useEffect(() => {
    if (!complaintId) return;
    const interval = setInterval(async () => {
      try {
        const res = await getComplaintStatus(complaintId);
        setCurrentStatus(res.status);
        if (res.status === "resolved") clearInterval(interval);
      } catch { /* silently ignore */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [complaintId]);

  // ── Form submit ──────────────────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      const res = await submitComplaint(data as ComplaintPayload);
      setComplaintId(res.id);
      setSubmitted(true);
      reset();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  // ── Track ticket submit ─────────────────────────────────────────────────
  const onTrackSubmit = async (data: TrackFormData) => {
    setTrackError(null);
    setTrackedId(null);
    setTrackedStatus(null);
    try {
      const res = await getComplaintStatus(data.ticketId);
      setTrackedId(data.ticketId);
      setTrackedStatus(res.status);
    } catch {
      setTrackError("Ticket not found. Please check the ID and try again.");
    }
  };

  const activeStep = STATUS_INDEX[currentStatus];

  return (
    <section
      id="portal"
      aria-labelledby="portal-heading"
      className="section-padding px-4 md:px-8 max-w-7xl mx-auto w-full"
    >
      <SectionWrapper className="flex flex-col gap-16" delay={0.05}>

        {/* ── Heading ─────────────────────────────────────────────────────── */}
        <SectionItem className="max-w-2xl">
          <p
            className="font-mono text-xs uppercase tracking-widest mb-5"
            style={{ color: "#E11D2E", letterSpacing: "0.12em" }}
          >
            Network Operations
          </p>
          <h2
            id="portal-heading"
            className="font-heading font-semibold mb-4"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.75rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
            }}
          >
            Report Network Issue
          </h2>
          <p style={{ color: "#B3B3B3" }} className="text-base leading-relaxed">
            Our team monitors every report. Issues are triaged and addressed around the clock.
          </p>
        </SectionItem>

        {/* ── Tab switcher ─────────────────────────────────────────────── */}
        <SectionItem>
          <div className="inline-flex rounded-full border p-1" style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#141414" }} role="tablist" aria-label="Portal mode">
            {(["report", "track"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-[250ms]"
                style={{
                  backgroundColor: activeTab === tab ? "#E11D2E" : "transparent",
                  color:           activeTab === tab ? "#FFFFFF" : "#666666",
                }}
              >
                {tab === "report" ? "Report Issue" : "Track Ticket"}
              </button>
            ))}
          </div>
        </SectionItem>

        {/* ── Process Visualization — only shown when reporting ─────────── */}
        {activeTab === "report" && (
        <SectionItem aria-label="Complaint process stages">
          <div className="relative overflow-hidden">
            {/* Track */}
            <div className="relative flex items-center">
              {/* SVG track line + animated dot */}
              <svg
                viewBox="0 0 780 4"
                className="absolute top-1/2 -translate-y-1/2 left-0 right-0 w-full"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {/* Base track */}
                <line
                  x1="0" y1="2" x2="780" y2="2"
                  stroke="rgba(255,255,255,0.08)" strokeWidth="2"
                />
                {/* Progress fill — initial x2="0" is required for Framer Motion to interpolate */}
                <motion.line
                  x1="0" y1="2" y2="2"
                  stroke="#E11D2E" strokeWidth="2"
                  initial={{ x2: 0 }}
                  animate={{ x2: (activeStep / (STEPS.length - 1)) * 780 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
                {/* Animated signal dot — use transform on a group for SVG-safe animation */}
                <motion.g
                  initial={{ x: 0, opacity: 0 }}
                  animate={{
                    x:       [0, 780],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration:    3,
                    ease:        "easeInOut",
                    repeat:      Infinity,
                    repeatDelay: 1,
                    times:       [0, 0.08, 0.92, 1],
                  }}
                >
                  <circle
                    cx="0" cy="2" r="4"
                    fill="#FF3B4D"
                    style={{ filter: "drop-shadow(0 0 4px #FF3B4D)" }}
                  />
                </motion.g>

              </svg>

              {/* Step nodes */}
              <div className="relative flex justify-between w-full z-10">
                {STEPS.map((step, i) => {
                  const isActive   = i <= activeStep;
                  const isCurrent  = i === activeStep;
                  return (
                    <div key={step.id} className="flex flex-col items-center gap-3">
                      {/* Node */}
                      <motion.div
                        className="w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-mono font-medium"
                        animate={{
                          backgroundColor: isActive ? "#E11D2E" : "#141414",
                          borderColor:     isActive ? "#E11D2E" : "rgba(255,255,255,0.12)",
                          color:           isActive ? "#FFFFFF" : "#666666",
                          boxShadow:       isCurrent
                            ? "0 0 16px rgba(225,29,46,0.5)"
                            : "none",
                        }}
                        transition={{ duration: 0.5 }}
                        aria-label={`${step.label} — ${isActive ? "complete" : "pending"}`}
                      >
                        {i + 1}
                      </motion.div>

                      {/* Label */}
                      <span
                        className="text-xs font-medium text-center hidden sm:block"
                        style={{ color: isActive ? "#FFFFFF" : "#666666", maxWidth: "6rem" }}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionItem>
        )}

        {/* ── Form / Status ─────────────────────────────────────────────── */}
        <SectionItem>
          <AnimatePresence mode="wait">
            {activeTab === "track" ? (
              /* ── Track Ticket ────────────────────────────────────────── */
              <motion.div
                key="track"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border p-6 md:p-8 flex flex-col gap-6"
                style={{ backgroundColor: "#141414", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <p className="text-sm" style={{ color: "#B3B3B3" }}>
                  Enter your Ticket ID to check its current status.
                </p>
                <form
                  onSubmit={handleTrackSubmit(onTrackSubmit)}
                  className="flex flex-col sm:flex-row gap-3"
                  aria-label="Track existing ticket"
                >
                  <div className="flex-1">
                    <label htmlFor="track-ticket-id" className="sr-only">Ticket ID</label>
                    <input
                      id="track-ticket-id"
                      type="text"
                      placeholder="e.g. NTX-20260801-XXXX"
                      {...registerTrack("ticketId")}
                      className="form-input"
                    />
                    {trackErrors.ticketId && (
                      <p className="text-xs mt-1" style={{ color: "#FF3B4D" }} role="alert">
                        {trackErrors.ticketId.message}
                      </p>
                    )}
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isTracking}
                    className="px-6 py-3 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-50 shrink-0"
                    style={{ backgroundColor: "#E11D2E" }}
                    whileHover={{ backgroundColor: "#FF3B4D", scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {isTracking ? "Looking up…" : "Look Up"}
                  </motion.button>
                </form>

                {trackError && (
                  <p className="text-sm" style={{ color: "#FF3B4D" }} role="alert">{trackError}</p>
                )}

                {trackedId && trackedStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col gap-3 p-4 rounded-xl"
                    style={{ backgroundColor: "#0D0D0D" }}
                  >
                    <p className="text-xs font-mono" style={{ color: "#B3B3B3" }}>
                      Ticket:{" "}
                      <span style={{ color: "#FFFFFF" }}>{trackedId}</span>
                    </p>
                    <div className="font-mono text-sm">
                      Status:{" "}
                      <span style={{ color: "#E11D2E" }}>
                        {trackedStatus.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    {/* Mini step progress */}
                    <div className="flex gap-2 mt-2">
                      {STEPS.map((step, i) => (
                        <div
                          key={step.id}
                          className="flex-1 h-1 rounded-full"
                          style={{
                            backgroundColor: i <= STATUS_INDEX[trackedStatus]
                              ? "#E11D2E"
                              : "rgba(255,255,255,0.08)",
                          }}
                          title={step.label}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : submitted ? (
              /* ── Success state ───────────────────────────────────────── */
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border p-8 flex flex-col gap-6"
                style={{ backgroundColor: "#141414", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full animate-pulse-red"
                    style={{ backgroundColor: "#E11D2E" }}
                    aria-hidden="true"
                  />
                  <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "#E11D2E", letterSpacing: "0.12em" }}>
                    Report Submitted
                  </p>
                </div>

                <div>
                  <p className="font-heading font-semibold text-xl mb-1">
                    Your issue has been received.
                  </p>
                  <p style={{ color: "#B3B3B3" }} className="text-sm">
                    Ticket ID:{" "}
                    <span className="font-mono" style={{ color: "#FFFFFF" }}>
                      {complaintId}
                    </span>
                  </p>
                </div>

                <div className="font-mono text-sm p-4 rounded-lg" style={{ backgroundColor: "#0D0D0D", color: "#B3B3B3" }}>
                  Status:{" "}
                  <span style={{ color: "#E11D2E" }}>
                    {currentStatus.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setComplaintId(null); setCurrentStatus("reported"); }}
                  className="text-sm underline text-left"
                  style={{ color: "#B3B3B3" }}
                >
                  Submit another report
                </button>
              </motion.div>
            ) : (
              /* ── Form ────────────────────────────────────────────────── */
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-2xl border p-6 md:p-8"
                style={{ backgroundColor: "#141414", borderColor: "rgba(255,255,255,0.08)" }}
                aria-label="Network issue report form"
              >
                {/* Name */}
                <Field label="Full Name" id="field-name" error={errors.name?.message}>
                  <input
                    id="field-name"
                    type="text"
                    placeholder="Your name"
                    autoComplete="name"
                    required
                    aria-required="true"
                    {...register("name")}
                    className="form-input"
                  />
                </Field>

                {/* Location */}
                <Field label="Room / Block" id="field-location" error={errors.location?.message}>
                  <input
                    id="field-location"
                    type="text"
                    placeholder="e.g. Block A, Room 204"
                    required
                    aria-required="true"
                    {...register("location")}
                    className="form-input"
                  />
                </Field>

                {/* Issue Type */}
                <Field label="Issue Type" id="field-issue-type" error={errors.issueType?.message} className="md:col-span-2">
                  <select
                    id="field-issue-type"
                    {...register("issueType")}
                    className="form-input"
                    required
                    aria-required="true"
                    defaultValue=""
                  >
                    <option value="" disabled>Select issue type</option>
                    <option value="network">Network / General</option>
                    <option value="wifi">WiFi</option>
                    <option value="lan">LAN / Ethernet</option>
                    <option value="other">Other</option>
                  </select>
                </Field>

                {/* Description */}
                <Field label="Description" id="field-description" error={errors.description?.message} className="md:col-span-2">
                  <textarea
                    id="field-description"
                    placeholder="Describe the issue in detail…"
                    rows={4}
                    required
                    aria-required="true"
                    aria-describedby="desc-counter"
                    {...register("description")}
                    className="form-input resize-none"
                  />
                  <p
                    id="desc-counter"
                    className="text-xs mt-1"
                    style={{
                      color: (descriptionValue?.length ?? 0) >= 10
                        ? "#4ade80"
                        : "#666666",
                    }}
                    aria-live="polite"
                  >
                    {descriptionValue?.length ?? 0} chars
                    {(descriptionValue?.length ?? 0) < 10 && " (10 minimum)"}
                  </p>
                </Field>

                {/* Error */}
                {submitError && (
                  <p className="md:col-span-2 text-sm" style={{ color: "#FF3B4D" }}>
                    {submitError}
                  </p>
                )}

                {/* Submit */}
                <div className="md:col-span-2">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-50"
                    style={{ backgroundColor: "#E11D2E" }}
                    whileHover={{ backgroundColor: "#FF3B4D", scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    aria-label="Submit network issue report"
                  >
                    {isSubmitting ? "Submitting…" : "Submit Report"}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </SectionItem>

      </SectionWrapper>
    </section>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  id,
  error,
  children,
  className = "",
}: {
  label:     string;
  id:        string;
  error?:    string;
  children:  React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: "#B3B3B3", letterSpacing: "0.08em" }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs" style={{ color: "#FF3B4D" }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
