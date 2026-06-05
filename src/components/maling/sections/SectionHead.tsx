import type { ReactNode } from "react";

/**
 * Felles nummerert seksjonshode. `headingId` kobles til seksjonens
 * aria-labelledby for landemerke-navigasjon.
 */
export function SectionHead({
  num,
  headingId,
  title,
  children,
}: {
  num: number;
  headingId: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mal__sec-head">
      <span className="mal__sec-num" aria-hidden>
        {num}
      </span>
      <div>
        <h2 className="mal__h2" id={headingId}>
          {title}
        </h2>
        {children ? <p className="mal__sec-sub">{children}</p> : null}
      </div>
    </div>
  );
}
