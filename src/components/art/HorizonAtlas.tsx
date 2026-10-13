/** A conceptual field of relationships. No financial data or WebGL dependency. */
export default function HorizonAtlas() {
  return (
    <svg
      className="horizon-atlas"
      viewBox="0 0 1400 390"
      fill="none"
      role="img"
      aria-labelledby="horizon-title horizon-desc"
    >
      <title id="horizon-title">Um olhar de conjunto</title>
      <desc id="horizon-desc">
        Linhas conectam empresas, fundamentos e contexto em um campo de perspectiva. Representação
        conceitual, sem dados financeiros.
      </desc>
      <defs>
        <pattern id="atlas-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".85" fill="currentColor" opacity=".18" />
        </pattern>
        <clipPath id="atlas-frame">
          <rect width="1400" height="390" />
        </clipPath>
        <clipPath id="atlas-lens">
          <ellipse cx="907" cy="194" rx="205" ry="143" transform="rotate(-18 907 194)" />
        </clipPath>
      </defs>
      <g clipPath="url(#atlas-frame)">
        <rect width="1400" height="390" fill="url(#atlas-grid)" />
        <path d="M0 325H1400M0 65H1400" stroke="currentColor" opacity=".09" />
        <g className="atlas-field-lines" stroke="currentColor" strokeWidth=".7" opacity=".38">
          {Array.from({ length: 32 }, (_, i) => {
            const y = -140 + i * 22;
            return (
              <path
                key={i}
                d={`M-60 ${y} C310 ${y + 90} 462 ${380 - i * 7} 722 ${280 - i * 5} S1060 ${-130 + i * 18} 1480 ${-150 + i * 25}`}
              />
            );
          })}
        </g>
        <g data-hero-lens>
          <g data-hero-lens-reveal>
            <ellipse
              className="atlas-lens-surface"
              cx="907"
              cy="194"
              rx="205"
              ry="143"
              transform="rotate(-18 907 194)"
            />
            <g clipPath="url(#atlas-lens)" stroke="currentColor" strokeWidth="1.15">
              {Array.from({ length: 26 }, (_, i) => (
                <path key={i} d={`M600 ${20 + i * 16} Q910 ${370 - i * 9} 1200 ${-120 + i * 24}`} />
              ))}
            </g>
            <ellipse
              cx="907"
              cy="194"
              rx="205"
              ry="143"
              transform="rotate(-18 907 194)"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </g>
        </g>
        <path
          data-hero-connection
          d="M260 193H550L720 121M1086 250H1268"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <g fill="currentColor">
          <circle cx="260" cy="193" r="4" />
          <circle cx="720" cy="121" r="4" />
          <circle cx="1086" cy="250" r="4" />
        </g>
        <g data-hero-labels className="atlas-map-label" fill="currentColor">
          <text x="260" y="173">
            Empresas
          </text>
          <text x="581" y="102">
            Fundamentos
          </text>
          <text x="1156" y="234">
            Contexto
          </text>
        </g>
        <path
          d="M40 25V45M30 35H50M1350 345V365M1340 355H1360"
          stroke="currentColor"
          opacity=".6"
        />
      </g>
    </svg>
  );
}
