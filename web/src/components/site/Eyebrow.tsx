/** Gold Rule + eyebrow. Opens every section. `ruleAfter` adds the trailing rule used on centred headings. */
export function Eyebrow({ children, dark = false, ruleAfter = false, motion }: {
  children: React.ReactNode;
  dark?: boolean;
  ruleAfter?: boolean;
  motion?: string;
}) {
  return (
    <div className="eyebrow-row" data-m={motion}>
      <span className="rule" data-rule="lead" aria-hidden="true" />
      <span className={dark ? 'eyebrow eyebrow--dark' : 'eyebrow'}>{children}</span>
      {ruleAfter && <span className="rule" data-rule="trail" aria-hidden="true" />}
    </div>
  );
}
