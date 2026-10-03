// Ciridae's constellation mark: a centre diamond with four points at N/S/W/E,
// drawn as thin Pure White strokes. The reference implementation builds it from
// five empty <span>s; this is SVG so the centre can actually draw itself on
// entrance (stroke-dashoffset), which a bordered box cannot do.
//
// The four-point geometry is the system's motif, and it is reused at chip
// scale as .chip-dot — the same diamond, 6px, rotating on hover.
export default function Mark({ size = 76, className = '' }) {
  const c = size / 2;
  const core = size * 0.17;
  const pt = size * 0.085;
  const arm = size * 0.37;

  // A square rotated 45° about its own centre, expressed as a path so the
  // whole mark is one coordinate system and the strokes stay hairlines.
  const diamond = (cx, cy, r) =>
    `M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`;

  return (
    <svg
      className={`cir-mark ${className}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path className="cir-mark__core" d={diamond(c, c, core)} stroke="currentColor" strokeWidth="1" />
      <path className="cir-mark__pt" style={{ '--i': 0 }} d={diamond(c, c - arm, pt)} stroke="currentColor" strokeWidth="1" />
      <path className="cir-mark__pt" style={{ '--i': 1 }} d={diamond(c + arm, c, pt)} stroke="currentColor" strokeWidth="1" />
      <path className="cir-mark__pt" style={{ '--i': 2 }} d={diamond(c, c + arm, pt)} stroke="currentColor" strokeWidth="1" />
      <path className="cir-mark__pt" style={{ '--i': 3 }} d={diamond(c - arm, c, pt)} stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
