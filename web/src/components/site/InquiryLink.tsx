'use client';

import type { InquiryType } from '@/content/types';

export const INQUIRY_EVENT = 'gheras:inquiry-type';

/** Scrolls to #contact and pre-selects the inquiry type in the form. Without JS it is a plain anchor. */
export function InquiryLink({ type, className, children }: { type: InquiryType; className?: string; children: React.ReactNode }) {
  return (
    <a
      href="#contact"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent<InquiryType>(INQUIRY_EVENT, { detail: type }))}
    >
      {children}
    </a>
  );
}
