import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import "./PillNav.css";

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

interface PillNavProps {
  logo: string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  initialLoadAnimation?: boolean;
}

function PillNav({
  logo,
  logoAlt = "Logo",
  items,
  activeHref,
  className = "",
  ease = "power3.out",
  baseColor = "#d7e2ea",
  pillColor = "#0c0c0c",
  hoveredPillTextColor = "#0c0c0c",
  pillTextColor,
  initialLoadAnimation = true,
}: PillNavProps) {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;
        const pill = circle.parentElement as HTMLElement;
        const { width: w, height: h } = pill.getBoundingClientRect();
        const radius = ((w * w) / 4 + h * h) / (2 * h);
        const diameter = Math.ceil(2 * radius) + 2;
        const delta = Math.ceil(radius - Math.sqrt(Math.max(0, radius * radius - (w * w) / 4))) + 1;
        const originY = diameter - delta;

        circle.style.width = `${diameter}px`;
        circle.style.height = `${diameter}px`;
        circle.style.bottom = `-${delta}px`;
        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

        const label = pill.querySelector<HTMLElement>(".pill-label");
        const hover = pill.querySelector<HTMLElement>(".pill-label-hover");
        if (label) gsap.set(label, { y: 0 });
        if (hover) gsap.set(hover, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" }, 0);
        if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: "auto" }, 0);
        if (hover) {
          gsap.set(hover, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(hover, { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" }, 0);
        }
        tlRefs.current[index] = tl;
      });
    };

    layout();
    window.addEventListener("resize", layout);
    document.fonts?.ready.then(layout).catch(() => undefined);
    if (mobileMenuRef.current) gsap.set(mobileMenuRef.current, { visibility: "hidden", opacity: 0 });

    if (initialLoadAnimation) {
      if (logoRef.current) {
        gsap.set(logoRef.current, { scale: 0 });
        gsap.to(logoRef.current, { scale: 1, duration: 0.6, ease });
      }
      if (navItemsRef.current) {
        gsap.set(navItemsRef.current, { width: 0, overflow: "hidden" });
        gsap.to(navItemsRef.current, { width: "auto", duration: 0.6, ease });
      }
    }

    return () => window.removeEventListener("resize", layout);
  }, [ease, initialLoadAnimation, items]);

  const handleEnter = (index: number) => {
    const tl = tlRefs.current[index];
    if (!tl) return;
    activeTweenRefs.current[index]?.kill();
    activeTweenRefs.current[index] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: "auto" });
  };

  const handleLeave = (index: number) => {
    const tl = tlRefs.current[index];
    if (!tl) return;
    activeTweenRefs.current[index]?.kill();
    activeTweenRefs.current[index] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: "auto" });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, { rotate: 360, duration: 0.35, ease, overwrite: "auto" });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const lines = hamburgerRef.current?.querySelectorAll(".hamburger-line");
    if (lines) {
      gsap.to(lines[0], { rotation: newState ? 45 : 0, y: newState ? 3 : 0, duration: 0.3, ease });
      gsap.to(lines[1], { rotation: newState ? -45 : 0, y: newState ? -3 : 0, duration: 0.3, ease });
    }

    const menu = mobileMenuRef.current;
    if (!menu) return;
    if (newState) {
      gsap.set(menu, { visibility: "visible" });
      gsap.fromTo(menu, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease, transformOrigin: "top center" });
    } else {
      gsap.to(menu, {
        opacity: 0,
        y: 10,
        duration: 0.2,
        ease,
        transformOrigin: "top center",
        onComplete: () => gsap.set(menu, { visibility: "hidden" }),
      });
    }
  };

  const cssVars = {
    "--base": baseColor,
    "--pill-bg": pillColor,
    "--hover-text": hoveredPillTextColor,
    "--pill-text": resolvedPillTextColor,
  } as CSSProperties;

  return (
    <div className="pill-nav-container">
      <nav className={`pill-nav ${className}`} aria-label="Primary" style={cssVars}>
        <a className="pill-logo" href="#hero" aria-label="返回首页" onMouseEnter={handleLogoEnter} ref={logoRef}>
          <img src={logo} alt={logoAlt} ref={logoImgRef} />
        </a>
        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {items.map((item, index) => (
              <li key={item.href} role="none">
                <a
                  role="menuitem"
                  href={item.href}
                  className={`pill${activeHref === item.href ? " is-active" : ""}`}
                  aria-label={item.ariaLabel || item.label}
                  onMouseEnter={() => handleEnter(index)}
                  onMouseLeave={() => handleLeave(index)}
                >
                  <span className="hover-circle" aria-hidden="true" ref={(el) => { circleRefs.current[index] = el; }} />
                  <span className="label-stack">
                    <span className="pill-label">{item.label}</span>
                    <span className="pill-label-hover" aria-hidden="true">{item.label}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <button className="mobile-menu-button mobile-only" onClick={toggleMobileMenu} aria-label="打开导航" ref={hamburgerRef} type="button">
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>
      <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef} style={cssVars}>
        <ul className="mobile-menu-list">
          {items.map((item) => (
            <li key={item.href}>
              <a href={item.href} className={`mobile-menu-link${activeHref === item.href ? " is-active" : ""}`} onClick={() => setIsMobileMenuOpen(false)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PillNav;
