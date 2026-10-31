import { z } from 'zod';
import { INQUIRY_TYPES, LANGS, type InquiryType, type Lang } from '@/content/types';
import { EMAIL_RE } from './shared';

export const inquiryInput = z.object({
  name: z.string().trim().min(1).max(200),
  organisation: z.string().trim().max(200).default(''),
  email: z.string().trim().max(320).regex(EMAIL_RE),
  phone: z.string().trim().max(60).default(''),
  type: z.enum(INQUIRY_TYPES as [InquiryType, ...InquiryType[]]),
  message: z.string().trim().min(1).max(5000),
  pageLang: z.enum(LANGS),
  // Honeypot: humans never see or fill this.
  website: z.string().default(''),
});
export type InquiryInput = z.input<typeof inquiryInput>;

export type Inquiry = {
  id: string;
  name: string;
  organisation: string;
  email: string;
  phone: string | null;
  type: InquiryType;
  message: string;
  pageLang: Lang;
  status: 'new' | 'replied' | 'archived';
  /** Opened in the dashboard at least once (drives the unread dot and badge). */
  read: boolean;
  notes: string;
  createdAt: string;
};

