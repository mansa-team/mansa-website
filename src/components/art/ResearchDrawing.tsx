/** Distinct conceptual drawings for the three existing research areas. */
export default function ResearchDrawing({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 180 132" fill="none" aria-hidden="true">
      {index === 0 ? (
        <>
          {[0, 1, 2].map((n) => (
            <g key={n} transform={`translate(${n * 22} ${-n * 13})`}>
              <path d="M22 55L85 35L124 58L61 79Z" fill="var(--paper)" stroke="currentColor" />
              <path d="M22 55V91L61 113L124 92V58M61 79V113" stroke="currentColor" />
              <path d="M34 70L49 79M34 80L49 89" stroke="currentColor" opacity=".4" />
            </g>
          ))}
        </>
      ) : index === 1 ? (
        <>
          <path
            d="M30 35L91 24L149 61L123 112L49 99Z M30 35L123 112M91 24L49 99M149 61L49 99"
            stroke="currentColor"
            opacity=".45"
          />
          <circle cx="91" cy="65" r="23" fill="var(--accent)" stroke="currentColor" />
          {[
            [30, 35],
            [91, 24],
            [149, 61],
            [123, 112],
            [49, 99],
          ].map(([x, y]) => (
            <g key={x}>
              <path d={`M${x} ${y}L91 65`} stroke="currentColor" />
              <circle cx={x} cy={y} r="6" fill="var(--paper)" stroke="currentColor" />
            </g>
          ))}
          <circle cx="91" cy="65" r="4" fill="currentColor" />
        </>
      ) : (
        <>
          <circle cx="86" cy="68" r="49" stroke="currentColor" />
          <circle cx="86" cy="68" r="33" stroke="currentColor" opacity=".25" />
          <path d="M86 68V19A49 49 0 0 1 128 93Z" fill="var(--accent)" stroke="currentColor" />
          <path d="M86 68L42 90M86 68L82 117" stroke="currentColor" />
          <path d="M136 25H169M145 34H169M141 106H169" stroke="currentColor" opacity=".45" />
          <circle cx="86" cy="68" r="6" fill="var(--paper)" stroke="currentColor" />
        </>
      )}
    </svg>
  );
}
