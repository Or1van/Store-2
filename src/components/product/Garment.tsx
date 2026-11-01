import type { ReactNode } from "react";

export type GarmentKind = "TEE" | "LONGSLEEVE" | "HOODIE" | "SWEATSHIRT" | "BOMBER" | "COAT" | "PANTS" | "SHORTS";

export const GARMENT_LABEL: Record<GarmentKind, string> = {
  TEE: "Футболка",
  LONGSLEEVE: "Лонгслів",
  HOODIE: "Худі",
  SWEATSHIRT: "Світшот",
  BOMBER: "Бомбер",
  COAT: "Пальто",
  PANTS: "Штани",
  SHORTS: "Шорти",
};

/*
  Flat-lay drawings of each silhouette in a 400×400 box. A product without a photo is drawn
  in its own colour: the body is filled with the colour, a shading gradient is laid over it,
  and seams, folds and ribbing are stroked in a tone picked for light or dark fabric.

  Paths in `sidePanels`, `folds` and `seams` describe the garment's left half only and are
  drawn again mirrored around x = 200. Everything else is drawn once as written.
*/

type Shape = {
  /** Drawn first, behind the body (hood, inside of the back neck). */
  under?: string[];
  body: string;
  panels?: string[];
  sidePanels?: string[];
  /** Darker openings: neck holes, hood opening. */
  holes?: string[];
  folds?: string[];
  seams?: string[];
  center?: string[];
  extra?: (ink: string) => ReactNode;
};

const BACK_NECK = "M165 66 C182 76 218 76 235 66 L235 72 C218 80 182 80 165 72 Z";
const CREW_NECK = "M165 66 C182 76 218 76 235 66 C220 84 180 84 165 66 Z";
const CREW_RIB = "M158 64 C176 98 224 98 242 64 L235 66 C220 88 180 88 165 66 Z";
const TOP_HEM = "M131 326 C164 332 236 332 269 326";

const SHAPES: Record<GarmentKind, Shape> = {
  TEE: {
    under: [BACK_NECK],
    body: "M165 66 C180 88 220 88 235 66 L282 82 L340 152 L305 176 L272 158 L272 336 C240 343 160 343 128 336 L128 158 L95 176 L60 152 L118 82 Z",
    panels: [CREW_RIB],
    holes: [CREW_NECK],
    folds: ["M152 196 C162 240 156 286 166 330", "M120 96 C124 118 126 138 128 156"],
    seams: ["M68 145 L102 168", "M118 82 L128 158"],
    center: [TOP_HEM],
  },
  LONGSLEEVE: {
    under: [BACK_NECK],
    body: "M165 66 C180 88 220 88 235 66 L282 82 C304 122 322 222 336 318 L302 324 C292 254 282 204 272 166 L272 336 C240 343 160 343 128 336 L128 166 C118 204 108 254 98 324 L64 318 C78 222 96 122 118 82 Z",
    panels: [CREW_RIB],
    sidePanels: ["M67 298 L101 304 L98 324 L64 318 Z"],
    holes: [CREW_NECK],
    folds: ["M152 196 C162 240 156 286 166 330", "M92 170 C98 200 96 236 102 270"],
    seams: ["M118 82 C122 110 126 140 128 166"],
    center: [TOP_HEM],
  },
  HOODIE: {
    under: ["M138 96 C118 44 156 16 200 16 C244 16 282 44 262 96 Z"],
    body: "M148 70 C176 60 224 60 252 70 L290 88 C312 128 330 226 342 314 L306 320 C296 252 286 204 278 172 L278 316 L272 346 C240 352 160 352 128 346 L122 316 L122 172 C114 204 104 252 94 320 L58 314 C70 226 88 128 110 88 Z",
    panels: ["M122 316 L278 316 L272 346 C240 352 160 352 128 346 Z", "M150 246 L250 246 L266 312 L134 312 Z"],
    sidePanels: ["M60 296 L97 302 L94 320 L58 314 Z"],
    holes: ["M163 82 C162 46 238 46 237 82 C226 112 174 112 163 82 Z"],
    folds: ["M146 168 C154 200 150 222 154 244", "M88 172 C96 204 94 240 100 272"],
    seams: ["M152 252 L166 306", "M110 88 C116 116 120 146 122 172"],
    extra: (ink) => (
      <g stroke={ink} strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M186 104 C184 128 186 150 182 172" />
        <path d="M214 104 C216 128 214 150 218 170" />
      </g>
    ),
  },
  SWEATSHIRT: {
    under: [BACK_NECK],
    body: "M165 66 C180 86 220 86 235 66 L286 82 C308 124 326 224 340 316 L304 322 C294 254 284 206 276 170 L276 314 L272 342 C240 348 160 348 128 342 L124 314 L124 170 C116 206 106 254 96 322 L60 316 C74 224 92 124 114 82 Z",
    panels: [CREW_RIB, "M190 90 L210 90 L200 106 Z", "M124 314 L276 314 L272 342 C240 348 160 348 128 342 Z"],
    sidePanels: ["M63 296 L99 302 L96 322 L60 316 Z"],
    holes: [CREW_NECK],
    folds: ["M150 190 C160 236 152 270 162 310", "M90 176 C98 206 96 240 102 274"],
    seams: ["M114 82 C120 112 122 144 124 170"],
  },
  BOMBER: {
    body: "M160 62 C178 72 222 72 240 62 L294 84 C318 126 334 222 344 300 L308 308 C298 246 288 204 280 176 L280 296 L276 326 C240 334 160 334 124 326 L120 296 L120 176 C112 204 102 246 92 308 L56 300 C66 222 82 126 106 84 Z",
    panels: [
      "M150 56 C170 82 230 82 250 56 L240 62 C222 74 178 74 160 62 Z",
      "M120 296 L280 296 L276 326 C240 334 160 334 124 326 Z",
      "M84 150 L110 154 L106 182 L80 178 Z",
    ],
    sidePanels: ["M58 282 L95 289 L92 308 L56 300 Z"],
    folds: ["M150 140 C162 180 150 230 158 290", "M84 196 C92 226 92 254 96 280"],
    seams: ["M106 84 C112 116 118 150 120 176", "M146 206 L176 206"],
    extra: (ink) => (
      <g>
        <path d="M200 74 L200 326" stroke={ink} strokeWidth="3" />
        <rect x="195" y="88" width="10" height="20" rx="2" fill={ink} />
      </g>
    ),
  },
  COAT: {
    body: "M164 54 L236 54 L290 76 C312 124 326 234 336 332 L302 338 C294 266 286 214 278 182 L284 384 C236 392 164 392 116 384 L122 182 C114 214 106 266 98 338 L64 332 C74 234 88 124 110 76 Z",
    sidePanels: ["M164 54 L150 66 L146 112 L184 196 L200 214 L190 128 Z", "M132 268 L174 268 L174 280 L132 280 Z"],
    holes: ["M164 54 L236 54 L210 128 L200 214 L190 128 Z"],
    folds: ["M144 200 C152 260 144 320 152 380", "M92 190 C98 236 96 286 100 318"],
    seams: ["M110 76 C116 116 120 150 122 182", "M70 316 L101 322"],
    center: ["M200 214 L200 386"],
    extra: (ink) => (
      <g fill={ink}>
        <circle cx="214" cy="236" r="5" />
        <circle cx="214" cy="286" r="5" />
        <circle cx="214" cy="336" r="5" />
      </g>
    ),
  },
  PANTS: {
    body: "M132 40 L268 40 L272 64 C280 170 284 280 288 378 L216 382 L204 164 L196 164 L184 382 L112 378 C116 280 120 170 128 64 Z",
    panels: ["M132 40 L268 40 L270 62 L130 62 Z"],
    sidePanels: ["M126 204 L172 202 L174 262 L124 264 Z"],
    folds: ["M150 100 C156 150 150 190 154 200", "M140 290 C146 320 142 350 148 376"],
    seams: ["M126 214 L172 212", "M114 362 L184 366"],
    center: ["M200 62 C200 100 204 132 200 164"],
    extra: (ink) => (
      <g fill={ink}>
        <rect x="150" y="38" width="6" height="26" rx="1" />
        <rect x="244" y="38" width="6" height="26" rx="1" />
      </g>
    ),
  },
  SHORTS: {
    body: "M130 92 L270 92 L274 116 C278 170 284 220 290 272 L214 284 L204 196 L196 196 L186 284 L110 272 C116 220 122 170 126 116 Z",
    panels: ["M130 92 L270 92 L272 120 L128 120 Z"],
    folds: ["M148 140 C152 180 148 220 150 268", "M168 128 C174 150 170 170 176 186"],
    seams: ["M114 258 L186 270", "M136 134 C150 150 166 156 178 156"],
    center: ["M200 120 C200 150 204 176 200 196"],
    extra: (ink) => (
      <g stroke={ink} strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M194 112 C188 128 184 140 180 152" />
        <path d="M206 112 C212 128 216 140 220 152" />
      </g>
    ),
  },
};

function luminance(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Draws each path as written and again reflected around the vertical centre line. */
function both(paths: string[] | undefined, render: (d: string, key: string) => ReactNode) {
  if (!paths?.length) return null;
  return (
    <>
      {paths.map((d, i) => render(d, `l${i}`))}
      <g transform="matrix(-1 0 0 1 400 0)">{paths.map((d, i) => render(d, `r${i}`))}</g>
    </>
  );
}

type Props = {
  kind: GarmentKind;
  color: string;
  className?: string;
  /** Accessible name; omit when the product name is already next to the drawing. */
  title?: string;
};

export function Garment({ kind, color, className, title }: Props) {
  const shape = SHAPES[kind];
  const hex = /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : "#9b9c99";
  const dark = luminance(hex) < 0.12;
  const ink = dark ? "rgb(255 255 255 / 0.18)" : "rgb(0 0 0 / 0.22)";
  const fold = dark ? "rgb(255 255 255 / 0.06)" : "rgb(0 0 0 / 0.08)";
  const panel = { fill: dark ? "#fff" : "#000", opacity: dark ? 0.05 : 0.06 };
  // Ids repeat when the same garment appears twice on a page; the gradients are identical then.
  const id = `g${kind}${hex.slice(1)}`;

  const panelPath = (d: string, key: string) => <path key={key} d={d} {...panel} stroke={ink} strokeWidth="1" />;
  const seamPath = (d: string, key: string) => (
    <path key={key} d={d} fill="none" stroke={ink} strokeWidth="1.4" strokeDasharray="4 4" />
  );

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={dark ? 0.12 : 0.24} />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={dark ? 0.32 : 0.16} />
        </linearGradient>
        <radialGradient id={`${id}f`}>
          <stop offset="0" stopColor="#000" stopOpacity="0.2" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="200" cy="392" rx="150" ry="8" fill={`url(#${id}f)`} />

      {shape.under?.map((d, i) => (
        <g key={`u${i}`}>
          <path d={d} fill={hex} />
          <path d={d} fill="#000" opacity={dark ? 0.35 : 0.18} />
        </g>
      ))}

      <path d={shape.body} fill={hex} />
      <path d={shape.body} fill={`url(#${id}s)`} />

      {shape.panels?.map((d, i) => panelPath(d, `p${i}`))}
      {both(shape.sidePanels, panelPath)}
      {shape.holes?.map((d, i) => (
        <path key={`h${i}`} d={d} fill="#000" opacity={dark ? 0.45 : 0.3} />
      ))}
      {both(shape.folds, (d, key) => (
        <path key={key} d={d} fill="none" stroke={fold} strokeWidth="6" strokeLinecap="round" />
      ))}
      {both(shape.seams, seamPath)}
      {shape.center?.map((d, i) => seamPath(d, `c${i}`))}
      {shape.extra?.(ink)}
    </svg>
  );
}
