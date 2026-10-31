'use client';

import { openPublishDialog } from './Shell';

/** Opens the shell's publish dialog (used outside the top bar, e.g. the overview's draft card). */
export function PublishButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return <button type="button" className={className} onClick={openPublishDialog}>{children}</button>;
}
