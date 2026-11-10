/**
 * Inline script that runs before first paint: hides only the hero load-sequence elements so they
 * don't flash before their entrance. The Motion component releases it (html.motion-done), and a
 * CSS fallback in site.css reveals them anyway if scripts never run.
 */
export const motionGuardScript =
  "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')";

/**
 * Inline script, also run before the photos are parsed: if a photo fails to download (some
 * networks drop requests now and then), try it again up to 4 times, waiting a little longer each
 * time. The retry adds a `retry` query parameter so the browser makes a fresh request; the image
 * route and the Next.js image optimizer ignore it.
 */
export const imageRetryScript =
  "document.addEventListener('error',function(e){var i=e.target;if(!i||i.tagName!=='IMG')return;" +
  "var n=+(i.getAttribute('data-retry')||0);if(n>=4)return;i.setAttribute('data-retry',n+1);" +
  "setTimeout(function(){var s=i.currentSrc||i.src;if(!s)return;s=s.replace(/[?&]retry=\\d+/,'');" +
  "i.removeAttribute('srcset');i.src=s+(s.indexOf('?')<0?'?':'&')+'retry='+(n+1)},600*(n+1))},true)";
