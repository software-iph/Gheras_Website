/**
 * Inline script that runs before first paint: hides only the hero load-sequence elements so they
 * don't flash before their entrance. The Motion component releases it (html.motion-done), and a
 * CSS fallback in site.css reveals them anyway if scripts never run.
 */
export const motionGuardScript =
  "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')";
