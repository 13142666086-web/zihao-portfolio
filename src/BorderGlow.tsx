import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import "./BorderGlow.css";

interface BorderGlowProps {
  children?: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
}

function parseHSL(hslStr: string) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 198, s: 75, l: 74 };
  return { h: Number.parseFloat(match[1]), s: Number.parseFloat(match[2]), l: Number.parseFloat(match[3]) };
}

function buildGlowVars(glowColor: string, intensity: number): Record<string, string> {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ["", "-60", "-50", "-40", "-30", "-20", "-10"];
  const vars: Record<string, string> = {};
  opacities.forEach((opacity, index) => {
    vars[`--glow-color${keys[index]}`] = `hsl(${base} / ${Math.min(opacity * intensity, 100)}%)`;
  });
  return vars;
}

const positions = ["80% 55%", "69% 34%", "8% 6%", "41% 38%", "86% 85%", "82% 18%", "51% 4%"];
const keys = ["--gradient-one", "--gradient-two", "--gradient-three", "--gradient-four", "--gradient-five", "--gradient-six", "--gradient-seven"];
const colorMap = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors: string[]): Record<string, string> {
  const vars: Record<string, string> = {};
  for (let i = 0; i < 7; i++) {
    vars[keys[i]] = `radial-gradient(at ${positions[i]}, ${colors[Math.min(colorMap[i], colors.length - 1)]} 0px, transparent 50%)`;
  }
  vars["--gradient-base"] = `linear-gradient(${colors[0]} 0 100%)`;
  return vars;
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

function easeInCubic(x: number) {
  return x * x * x;
}

function animateValue({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd,
}: {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (t: number) => number;
  onUpdate: (v: number) => void;
  onEnd?: () => void;
}) {
  const t0 = performance.now() + delay;
  function tick() {
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) requestAnimationFrame(tick);
    else onEnd?.();
  }
  setTimeout(() => requestAnimationFrame(tick), delay);
}

function BorderGlow({
  children,
  className = "",
  edgeSensitivity = 24,
  glowColor = "198 75 74",
  backgroundColor = "#0c0c0c",
  borderRadius = 32,
  glowRadius = 36,
  glowIntensity = 1,
  coneSpread = 24,
  animated = false,
  colors = ["#8bd8ff", "#c084fc", "#f472b6"],
  fillOpacity = 0.26,
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const getCenter = useCallback((el: HTMLElement) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  }, []);

  const getEdge = useCallback((el: HTMLElement, x: number, y: number) => {
    const [cx, cy] = getCenter(el);
    const dx = x - cx;
    const dy = y - cy;
    const kx = dx === 0 ? Infinity : cx / Math.abs(dx);
    const ky = dy === 0 ? Infinity : cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }, [getCenter]);

  const getAngle = useCallback((el: HTMLElement, x: number, y: number) => {
    const [cx, cy] = getCenter(el);
    const dx = x - cx;
    const dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    const degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    return degrees < 0 ? degrees + 360 : degrees;
  }, [getCenter]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    card.style.setProperty("--edge-proximity", `${(getEdge(card, x, y) * 100).toFixed(3)}`);
    card.style.setProperty("--cursor-angle", `${getAngle(card, x, y).toFixed(3)}deg`);
  }, [getAngle, getEdge]);

  useEffect(() => {
    if (!animated || !cardRef.current) return;
    const card = cardRef.current;
    const angleStart = 110;
    const angleEnd = 465;
    card.classList.add("sweep-active");
    card.style.setProperty("--cursor-angle", `${angleStart}deg`);
    animateValue({ duration: 500, onUpdate: (v) => card.style.setProperty("--edge-proximity", `${v}`) });
    animateValue({ ease: easeInCubic, duration: 1500, end: 50, onUpdate: (v) => card.style.setProperty("--cursor-angle", `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`) });
    animateValue({ ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: (v) => card.style.setProperty("--cursor-angle", `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`) });
    animateValue({ ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0, onUpdate: (v) => card.style.setProperty("--edge-proximity", `${v}`), onEnd: () => card.classList.remove("sweep-active") });
  }, [animated]);

  return (
    <div
      ref={cardRef}
      className={`border-glow-card ${className}`}
      onPointerMove={handlePointerMove}
      style={{
        "--card-bg": backgroundColor,
        "--edge-sensitivity": edgeSensitivity,
        "--border-radius": `${borderRadius}px`,
        "--glow-padding": `${glowRadius}px`,
        "--cone-spread": coneSpread,
        "--fill-opacity": fillOpacity,
        ...buildGlowVars(glowColor, glowIntensity),
        ...buildGradientVars(colors),
      } as CSSProperties}
    >
      <span className="edge-light" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}

export default BorderGlow;
