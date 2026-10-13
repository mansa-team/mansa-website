const descriptions = [
  'Uma empresa vista em relação aos seus fundamentos, contexto e histórico.',
  'Uma sequência de intervalos iguais representa a continuidade dos aportes ao longo do tempo, sem representar retornos.',
  'Um detalhe é destacado de um conjunto de informações e recebe uma explicação.',
];

/** Conceptual illustrations: no market data, predictions or simulated returns. */
export default function AtlasDiagram({ index }: { index: number }) {
  return (
    <svg
      className={`atlas-diagram atlas-diagram--${index}`}
      viewBox="0 0 560 500"
      fill="none"
      role="img"
      aria-label={descriptions[index]}
    >
      <path className="atlas-grid" d="M40 80H520M40 420H520M80 40V460M480 40V460" />
      {index === 0 && (
        <>
          <path
            data-atlas-step="0.5,0.95"
            data-atlas-kind="fade"
            className="atlas-orbit"
            d="M91 245C91 123 427 101 463 229C501 361 155 397 91 245Z"
          />
          <path
            data-atlas-step="0.5,0.95"
            data-atlas-kind="fade"
            className="atlas-orbit"
            d="M161 100C263 27 433 341 328 400C220 461 71 167 161 100Z"
          />
          <path
            data-atlas-step="0.18,0.65"
            data-atlas-kind="draw"
            pathLength="1"
            className="atlas-fine"
            d="M276 241L177 116M276 241L446 194M276 241L356 382M276 241L82 315"
          />
          <g data-atlas-step="0,0.25" data-atlas-kind="lift">
            <path className="atlas-sheet-back" d="M188 153L365 180L341 351L164 324Z" />
            <path className="atlas-sheet-mid" d="M184 170L362 154L377 325L199 341Z" />
            <path className="atlas-sheet-front" d="M193 178H365V329H193Z" />
            <path className="atlas-fine" d="M211 201H246M211 215H238M211 296H347" />
          </g>
          <text className="atlas-word" x="211" y="261">
            Empresa
          </text>
          <circle className="atlas-point" cx="177" cy="116" r="5" />
          <circle className="atlas-point" cx="446" cy="194" r="5" />
          <circle className="atlas-point" cx="356" cy="382" r="5" />
          <circle className="atlas-point" cx="82" cy="315" r="5" />
          <text className="atlas-label" x="124" y="88">
            Fundamentos
          </text>
          <text className="atlas-label" x="419" y="171">
            Contexto
          </text>
          <text className="atlas-label" x="332" y="412">
            Histórico
          </text>
          <path className="atlas-fine" d="M82 322V367H145" />
          <text className="atlas-small" x="82" y="389">
            Relações que
          </text>
          <text className="atlas-small" x="82" y="406">
            ampliam o olhar.
          </text>
        </>
      )}
      {index === 1 && (
        <>
          <text className="atlas-small" x="53" y="110">
            Um intervalo.
          </text>
          <text className="atlas-small" x="53" y="129">
            Depois, o próximo.
          </text>
          <path className="atlas-fine" d="M53 151H139V184" />
          {Array.from({ length: 7 }, (_, i) => (
            <g
              key={i}
              className="atlas-period"
              data-atlas-step={`${i / 8},${(i + 1) / 8}`}
              data-atlas-kind="lift"
            >
              <path className="atlas-sheet-back" d={`M${64 + i * 64} 198h40v132h-40z`} />
              <path className="atlas-sheet-front" d={`M${55 + i * 64} 189h40v132h-40z`} />
              <path className="atlas-fine" d={`M${64 + i * 64} 204h15M${64 + i * 64} 211h10`} />
              <circle className="atlas-period-point" cx={75 + i * 64} cy="291" r="6" />
              <path className="atlas-fine" d={`M${75 + i * 64} 339v25`} />
            </g>
          ))}
          <path className="atlas-axis" d="M55 351H503" />
          <text className="atlas-label" x="55" y="393">
            Aportes periódicos
          </text>
          <text className="atlas-small" x="55" y="416">
            Continuidade, ao longo do tempo.
          </text>
          <path
            className="atlas-fine"
            d="M75 161v-8h64v8M139 153h64v8M203 153h64v8M267 153h64v8M331 153h64v8M395 153h64v8"
          />
        </>
      )}
      {index === 2 && (
        <>
          <path className="atlas-sheet-back" d="M77 114H295V397H77Z" />
          <path className="atlas-sheet-front" d="M63 100H281V383H63Z" />
          <text className="atlas-label" x="84" y="133">
            Informação
          </text>
          <path
            className="atlas-fine"
            d="M84 153H260M84 181H175M84 193H241M84 205H222M84 278H235M84 290H247M84 302H205M84 338H160M84 350H218"
          />
          <path
            data-atlas-step="0,0.3"
            data-atlas-kind="fade"
            className="atlas-highlight"
            d="M80 220H264V259H80Z"
          />
          <path className="atlas-dark-line" d="M93 234H216M93 246H185" />
          <path
            data-atlas-step="0.25,0.65"
            data-atlas-kind="draw"
            pathLength="1"
            className="atlas-connector"
            d="M264 239H313V190H334"
          />
          <circle className="atlas-point" cx="264" cy="239" r="4" />
          <g data-atlas-step="0.6,0.95" data-atlas-kind="lift">
            <path className="atlas-callout" d="M327 156H508V320H327Z" />
            <path className="atlas-highlight" d="M327 156H331V320H327Z" />
          </g>
          <text className="atlas-word atlas-word--small" x="349" y="198">
            O que isso
          </text>
          <text className="atlas-word atlas-word--small" x="349" y="228">
            significa?
          </text>
          <path className="atlas-fine" d="M349 254H484" />
          <text className="atlas-small" x="349" y="278">
            Dar sentido
          </text>
          <text className="atlas-small" x="349" y="297">
            a cada detalhe.
          </text>
          <path className="atlas-fine" d="M419 332V373H352" />
          <text className="atlas-label" x="327" y="399">
            Compreensão
          </text>
        </>
      )}
    </svg>
  );
}
