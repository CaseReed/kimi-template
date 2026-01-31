"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * ScreenReaderAnnouncer - Announces messages to screen readers
 * 
 * Accessibility features:
 * - Uses aria-live regions for announcements
 * - Supports both polite and assertive announcements
 * - Visually hidden but accessible to assistive technologies
 * 
 * @example
 * <ScreenReaderAnnouncer 
 *   message="Form submitted successfully" 
 *   priority="polite"
 * />
 */
interface ScreenReaderAnnouncerProps {
  message: string;
  priority?: "polite" | "assertive";
  clearAfter?: number; // ms to clear message (0 = never)
}

export function ScreenReaderAnnouncer({
  message,
  priority = "polite",
  clearAfter = 0,
}: ScreenReaderAnnouncerProps) {
  const [announcement, setAnnouncement] = useState(message);

  useEffect(() => {
    setAnnouncement(message);
    
    if (clearAfter > 0 && message) {
      const timer = setTimeout(() => {
        setAnnouncement("");
      }, clearAfter);
      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  if (!announcement) return null;

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

/**
 * Hook for managing screen reader announcements
 * 
 * @example
 * const { announce, Announcer } = useAnnouncer();
 * 
 * // In JSX:
 * <Announcer />
 * 
 * // Trigger announcement:
 * announce("Operation completed", "polite");
 */
export function useAnnouncer() {
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"polite" | "assertive">("polite");

  const announce = useCallback(
    (msg: string, prio: "polite" | "assertive" = "polite") => {
      setMessage("");
      // Small delay to ensure screen reader detects the change
      setTimeout(() => {
        setMessage(msg);
        setPriority(prio);
      }, 100);
    },
    []
  );

  const Announcer = useCallback(
    () => (
      <div
        role="status"
        aria-live={priority}
        aria-atomic="true"
        className="sr-only"
      >
        {message}
      </div>
    ),
    [message, priority]
  );

  return { announce, Announcer };
}

/**
 * FormStatusAnnouncer - Specialized announcer for form status changes
 * 
 * Automatically announces:
 * - Form submission in progress
 * - Success messages
 * - Error summaries
 */
interface FormStatusAnnouncerProps {
  isSubmitting: boolean;
  isSuccess?: boolean;
  successMessage?: string;
  errorCount?: number;
  submittingMessage?: string;
  errorMessage?: string;
}

export function FormStatusAnnouncer({
  isSubmitting,
  isSuccess = false,
  successMessage = "Form submitted successfully",
  errorCount = 0,
  submittingMessage = "Submitting form, please wait",
  errorMessage,
}: FormStatusAnnouncerProps) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (isSubmitting) {
      setAnnouncement(submittingMessage);
    } else if (isSuccess) {
      setAnnouncement(successMessage);
    } else if (errorCount > 0) {
      const defaultErrorMsg = `Form has ${errorCount} error${errorCount > 1 ? "s" : ""}. Please review and correct.`;
      setAnnouncement(errorMessage || defaultErrorMsg);
    } else {
      setAnnouncement("");
    }
  }, [
    isSubmitting,
    isSuccess,
    successMessage,
    errorCount,
    submittingMessage,
    errorMessage,
  ]);

  if (!announcement) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
