import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { pathOf, forkDef, type ContentIndex, type ExplorerId, type GameState, type NodeType, type Outcome, type PlayerState, type Viewport } from '../engine';
import { useI18n } from '../i18n/react';
import { fitAspect, geo, lineThrough, nodePoint } from './geometry';
import { INK } from './theme';

export interface Reveal {
  target?: string;
  clicked?: string;
  click?: [number, number];
  outcome?: Outcome;
}

interface Props {
  ix: ContentIndex;
  view: GameState;
  focus: Viewport;
  clickable: boolean;
  onMapClick?: (x: number, y: number) => void;
  reveal?: Reveal | null;
  hint?: { x: number; y: number; r: number } | null;
  activePlayer: number | null;
}

const THREAT_GLYPH: Record<ExplorerId, string> = { polo: '🌪', magellan: '⛵', livingstone: '🦟', amundsen: '❄' };

// ------------------------------------------------------------------ static base map

const BaseMap = memo(function BaseMap({ ix }: { ix: ContentIndex }) {
  const g = geo(ix);
  const ranges = ix.map.features.filter((f) => f.id.startsWith('range.'));
  const deserts = ix.map.features.filter((f) => f.id.startsWith('desert.'));
  return (
    <g>
      <path d={ix.map.sphere} className="m-sphere" />
      <path d={ix.map.graticule} className="m-graticule" />
      <g className="m-land">
        {ix.map.countries.map((c) => <path key={c.id} d={g.countryPaths.get(c.id)} />)}
      </g>
      <g className="m-desert">{deserts.map((f) => <path key={f.id} d={g.featurePaths.get(f.id)} />)}</g>
      <g className="m-range">{ranges.map((f) => <path key={f.id} d={g.featurePaths.get(f.id)} />)}</g>
      <path d={ix.map.decor.lakes} className="m-lakes" />
      <path d={ix.map.decor.rivers} className="m-rivers" />
      {ix.map.countries.filter((c) => c.small).map((c) => (
        <circle key={c.id} cx={c.centroid[0]} cy={c.centroid[1]} r={2.2} className="m-small" />
      ))}
    </g>
  );
});

// ------------------------------------------------------------------ helpers

function useStepped(target: number, delay = 220): number {
  const [shown, setShown] = useState(target);
  useEffect(() => {
    if (shown === target) return;
    const diff = target - shown;
    const far = Math.abs(diff) > 6;
    const step = far ? Math.sign(diff) * Math.min(Math.abs(diff), 3) : Math.sign(diff);
    const id = setTimeout(() => setShown((v) => v + step), far ? 60 : delay);
    return () => clearTimeout(id);
  }, [shown, target, delay]);
  return shown;
}

function useAnimatedBox(target: Viewport): Viewport {
  const [box, setBox] = useState(target);
  const key = target.map((v) => v.toFixed(1)).join(',');
  useEffect(() => {
    const start = performance.now();
    const a = box;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - start) / 650));
      const e = 1 - Math.pow(1 - t, 3);
      setBox(a.map((v, i) => v + (target[i] - v) * e) as Viewport);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return box;
}

function NodeMark({ type, x, y, k, color, faint, title }: { type: NodeType; x: number; y: number; k: number; color: string; faint?: boolean; title: string }) {
  const r = 4.2 * k;
  const common = { className: `node node-${type}${faint ? ' faint' : ''}` };
  let shape: ReactNode;
  switch (type) {
    case 'start':
    case 'finish':
      shape = (
        <g {...common}>
          <circle cx={x} cy={y} r={r * 1.3} fill="var(--paper)" stroke={color} strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
          <path d={`M${x - r * 0.4},${y + r * 0.7}V${y - r * 0.9}l${r},${r * 0.35}l${-r},${r * 0.35}`} fill={color} stroke={color} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </g>
      );
      break;
    case 'checkpoint':
      shape = <rect {...common} x={x - r} y={y - r} width={r * 2} height={r * 2} fill="var(--paper)" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />;
      break;
    case 'landmark': {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const rr = i % 2 ? r * 0.55 : r * 1.35;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`;
      }).join(' ');
      shape = <polygon {...common} points={pts} fill="var(--gold)" stroke={color} strokeWidth={1} vectorEffect="non-scaling-stroke" />;
      break;
    }
    case 'hazard':
      shape = <polygon {...common} points={`${x},${y - r * 1.3} ${x + r * 1.2},${y + r * 0.9} ${x - r * 1.2},${y + r * 0.9}`} fill="var(--hazard)" stroke={color} strokeWidth={1} vectorEffect="non-scaling-stroke" />;
      break;
    case 'discovery':
      shape = (
        <g {...common}>
          <circle cx={x} cy={y} r={r * 1.1} fill="var(--paper)" stroke={color} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <path d={`M${x},${y - r * 1.5}L${x + r * 0.35},${y}L${x},${y + r * 1.5}L${x - r * 0.35},${y}Z M${x - r * 1.5},${y}L${x},${y - r * 0.35}L${x + r * 1.5},${y}L${x},${y + r * 0.35}Z`} fill={color} />
        </g>
      );
      break;
    default:
      shape = <circle {...common} cx={x} cy={y} r={r * 0.55} fill={color} />;
  }
  return <g><title>{title}</title>{shape}</g>;
}

// ------------------------------------------------------------------ routes, tokens

function RouteLayer({ ix, p, k, inset, active }: { ix: ContentIndex; p: PlayerState; k: number; inset: boolean; active: boolean }) {
  const { t, date } = useI18n();
  const ink = INK[p.explorer];
  const path = pathOf(ix, p);
  const route = ix.route.get(p.explorer)!;
  const isInset = (id: string) => !!ix.node.get(`${p.explorer}.${id}`)!.inset;
  // nodes drawn in this view (the inset also shows the last main-map node to connect the line)
  const firstInset = path.nodes.findIndex(isInset);
  const inView = (i: number) => {
    const ins = isInset(path.nodes[i]);
    if (inset) return ins || (firstInset > 0 && i === firstInset - 1);
    return !ins;
  };
  const idx = path.nodes.map((_, i) => i).filter(inView);
  if (!idx.length) return null;
  const done = idx.filter((i) => i <= p.position).map((i) => path.nodes[i]);
  const todo = idx.filter((i) => i >= p.position).map((i) => path.nodes[i]);
  // unchosen branches, drawn faint
  const alternatives: string[][] = [];
  for (const [fork, at] of Object.entries(path.forkAt)) {
    const def = forkDef(route, fork)!;
    const seqIdx = route.sequence.findIndex((x) => typeof x !== 'string' && x.fork === fork);
    const rejoin = route.sequence[seqIdx + 1] as string;
    for (const b of def.branches) {
      if (path.chosen[fork] ? b.id === path.chosen[fork] : b.historical) continue;
      const seq = [path.nodes[at], ...b.nodes, rejoin];
      if (b.nodes.every((id) => isInset(id) === inset)) alternatives.push(seq);
    }
  }
  const nodeTitle = (id: string) => {
    const n = ix.node.get(`${p.explorer}.${id}`)!;
    const d = date(n.date, n.approx);
    return `${t(`node.${p.explorer}.${id}.name`)}${d ? ` · ${d}` : ''}\n${t(`node.${p.explorer}.${id}.note`)}`;
  };
  return (
    <g className={`route${active ? ' active' : ''}`}>
      {alternatives.map((seq, i) => (
        <g key={i} opacity={0.55}>
          <path d={lineThrough(ix, p.explorer, seq, inset)} fill="none" stroke={ink.color} strokeWidth={1.2} strokeDasharray="1 4" vectorEffect="non-scaling-stroke" />
          {seq.slice(1, -1).map((id) => {
            const pt = nodePoint(ix, p.explorer, id);
            const n = ix.node.get(`${p.explorer}.${id}`)!;
            return <NodeMark key={id} type={n.type} x={pt.x} y={pt.y} k={k * 0.8} color={ink.color} faint title={nodeTitle(id)} />;
          })}
        </g>
      ))}
      <path d={lineThrough(ix, p.explorer, todo, inset)} fill="none" stroke={ink.color} strokeOpacity={0.55} strokeWidth={active ? 2 : 1.4} strokeDasharray={ink.dash || '5 4'} vectorEffect="non-scaling-stroke" />
      <path d={lineThrough(ix, p.explorer, done, inset)} fill="none" stroke={ink.color} strokeWidth={active ? 3.2 : 2.4} vectorEffect="non-scaling-stroke" />
      {idx.map((i) => {
        const id = path.nodes[i];
        const pt = nodePoint(ix, p.explorer, id);
        const n = ix.node.get(`${p.explorer}.${id}`)!;
        const unlocked = n.type === 'checkpoint' && p.unlocked.includes(id);
        return (
          <g key={id}>
            <NodeMark type={n.type} x={pt.x} y={pt.y} k={k} color={ink.color} title={nodeTitle(id)} />
            {unlocked && <circle cx={pt.x} cy={pt.y} r={2.2 * k} fill={ink.color} />}
          </g>
        );
      })}
    </g>
  );
}

function Token({ ix, p, k, inset, offset }: { ix: ContentIndex; p: PlayerState; k: number; inset: boolean; offset: number }) {
  const { t } = useI18n();
  const path = pathOf(ix, p);
  const shown = useStepped(p.position);
  const threatShown = useStepped(p.threat, 300);
  const ink = INK[p.explorer];
  const at = (i: number) => nodePoint(ix, p.explorer, path.nodes[Math.max(0, Math.min(i, path.nodes.length - 1))]);
  const pt = at(shown);
  const tp = at(threatShown);
  const off = (offset - 1.5) * 7 * k;
  const r = 11 * k;
  const out: ReactNode[] = [];
  if (tp.inset === inset) {
    const offBoard = threatShown < 0;
    out.push(
      <g key="threat" className="threat-token" opacity={offBoard ? 0.55 : 1} transform={`translate(${tp.x - r * (offBoard ? 2.2 : 1.1) + off},${tp.y + r * 1.2})`}>
        <title>{t(`threat.${p.explorer}.name`)}</title>
        <circle r={r * 0.95} fill="var(--threat-bg)" stroke={ink.color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        <text fontSize={r * 1.15} textAnchor="middle" dominantBaseline="central">{THREAT_GLYPH[p.explorer]}</text>
      </g>,
    );
  }
  if (pt.inset === inset) {
    out.push(
      <g key="token" className="player-token" transform={`translate(${pt.x + off},${pt.y - r * 1.25})`}>
        <title>{p.name} · {t(`explorer.${p.explorer}.name`)}</title>
        <path d={`M0,${r * 1.25} L${-r * 0.55},${r * 0.45} A${r},${r} 0 1 1 ${r * 0.55},${r * 0.45} Z`} fill={ink.color} stroke="var(--paper)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        <text y={-r * 0.05} fontSize={r * 1.05} textAnchor="middle" dominantBaseline="central" fill="var(--paper)" fontWeight={700}>
          {t(`explorer.${p.explorer}.name`).charAt(0)}
        </text>
      </g>,
    );
  }
  return <>{out}</>;
}

// ------------------------------------------------------------------ main component

export function WorldMap({ ix, view, focus, clickable, onMapClick, reveal, hint, activePlayer }: Props) {
  const { t } = useI18n();
  const g = geo(ix);
  const wrap = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 1000, h: 520 });
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth || 1000, h: el.clientHeight || 520 }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const world: Viewport = [0, 0, ix.map.width, ix.map.height];
  const target = useMemo(() => fitAspect(focus, size.w / size.h, world), [focus.join(), size.w, size.h]); // eslint-disable-line react-hooks/exhaustive-deps
  const box = useAnimatedBox(target);
  const k = (box[2] - box[0]) / size.w; // map units per screen pixel

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!clickable || !onMapClick || !svg.current) return;
    const pt = svg.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = svg.current.getScreenCTM();
    if (!m) return;
    const p = pt.matrixTransform(m.inverse());
    onMapClick(p.x, p.y);
  };

  const players = view.players;
  const charted = useMemo(() => {
    const owner = new Map<string, ExplorerId>();
    for (const p of players) for (const c of p.charted) owner.set(c, p.explorer);
    return owner;
  }, [players]);
  const amundsen = players.find((p) => p.explorer === 'amundsen');
  const labelSize = 11 * k;

  const revealShape = (id: string | undefined, cls: string) => {
    if (!id) return null;
    const d = id.startsWith('country.') ? g.countryPaths.get(id.slice(8)) : g.featurePaths.get(id);
    if (!d) return null;
    const isLine = !id.startsWith('country.') && ix.featureShape.get(id)?.kind === 'line';
    return <path d={d} className={`${cls}${isLine ? ' line' : ''}`} vectorEffect="non-scaling-stroke" />;
  };

  return (
    <div className={`map-wrap${clickable ? ' clickable' : ''}`} ref={wrap}>
      <svg
        ref={svg}
        className="world-map"
        viewBox={`${box[0]} ${box[1]} ${box[2] - box[0]} ${box[3] - box[1]}`}
        preserveAspectRatio="xMidYMid meet"
        onClick={handleClick}
        role="img"
        aria-label={t('map.label')}
      >
        <defs>
          <pattern id="hatch" width={5 * k} height={5 * k} patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2={5 * k} stroke="var(--ink-soft)" strokeWidth={0.6 * k} strokeOpacity={0.6} />
          </pattern>
          <pattern id="stipple" width={7 * k} height={7 * k} patternUnits="userSpaceOnUse">
            <circle cx={1.5 * k} cy={1.5 * k} r={0.7 * k} fill="var(--sand)" />
            <circle cx={5 * k} cy={5 * k} r={0.7 * k} fill="var(--sand)" />
          </pattern>
        </defs>
        <BaseMap ix={ix} />
        <g className="m-charted">
          {[...charted].filter(([id]) => id.startsWith('country.')).map(([id, ex]) => (
            <path key={id} d={g.countryPaths.get(id.slice(8))} fill={INK[ex].soft} />
          ))}
        </g>
        {revealShape(reveal?.clicked && reveal.clicked !== reveal.target ? reveal.clicked : undefined, 'reveal-clicked')}
        {revealShape(reveal?.target, `reveal-target ${reveal?.outcome ?? ''}`)}
        <g className="m-labels" fontSize={labelSize}>
          {[...charted].map(([id]) => {
            const c = id.startsWith('country.') ? ix.countryShape.get(id.slice(8))?.centroid : ix.featureShape.get(id)?.centroid;
            if (!c) return null;
            return <text key={id} x={c[0]} y={c[1]} textAnchor="middle">{t(`place.${id}`)}</text>;
          })}
        </g>
        {players.map((p) => <RouteLayer key={p.id} ix={ix} p={p} k={k} inset={false} active={p.id === activePlayer} />)}
        {players.map((p, i) => <Token key={p.id} ix={ix} p={p} k={k} inset={false} offset={i} />)}
        {hint && <circle cx={hint.x} cy={hint.y} r={hint.r} className="hint-circle" vectorEffect="non-scaling-stroke" />}
        {reveal?.click && (
          <g className="click-mark" transform={`translate(${reveal.click[0]},${reveal.click[1]})`}>
            <path d={`M${-5 * k},${-5 * k}L${5 * k},${5 * k}M${-5 * k},${5 * k}L${5 * k},${-5 * k}`} vectorEffect="non-scaling-stroke" />
          </g>
        )}
      </svg>
      <Cartouche />
      {amundsen && <AntarcticInset ix={ix} p={amundsen} active={amundsen.id === activePlayer} />}
    </div>
  );
}

function Cartouche() {
  const { t } = useI18n();
  return (
    <div className="cartouche" aria-hidden>
      <svg viewBox="0 0 100 100" className="compass-rose">
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="22" fill="none" stroke="currentColor" strokeWidth="0.4" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (Math.PI / 4) * i;
          const long = i % 2 === 0;
          const R = long ? 46 : 32;
          const w = long ? 6 : 4;
          const x = 50 + Math.sin(a) * R, y = 50 - Math.cos(a) * R;
          const lx = 50 + Math.sin(a + Math.PI / 2) * w, ly = 50 - Math.cos(a + Math.PI / 2) * w;
          const rx = 50 + Math.sin(a - Math.PI / 2) * w, ry = 50 - Math.cos(a - Math.PI / 2) * w;
          return <polygon key={i} points={`${x},${y} ${lx},${ly} 50,50 ${rx},${ry}`} fill={i % 2 ? 'none' : 'currentColor'} stroke="currentColor" strokeWidth="0.6" />;
        })}
        <text x="50" y="7" textAnchor="middle" fontSize="8" fill="currentColor">N</text>
      </svg>
      <span>{t('map.cartouche')}</span>
    </div>
  );
}

function AntarcticInset({ ix, p, active }: { ix: ContentIndex; p: PlayerState; active: boolean }) {
  const { t } = useI18n();
  const s = ix.map.inset.size;
  const k = s / 190;
  return (
    <div className={`inset${active ? ' active' : ''}`}>
      <svg viewBox={`0 0 ${s} ${s}`}>
        <path d={ix.map.inset.outline} className="i-ocean" />
        <path d={ix.map.inset.graticule} className="m-graticule" />
        <path d={ix.map.inset.southernLand} className="i-land" />
        <path d={ix.map.inset.land} className="i-ice-land" />
        <path d={ix.map.inset.ice} className="i-shelf" />
        <RouteLayer ix={ix} p={p} k={k} inset active={active} />
        <Token ix={ix} p={p} k={k} inset offset={1.5} />
      </svg>
      <span className="inset-label">{t('map.inset')}</span>
    </div>
  );
}
