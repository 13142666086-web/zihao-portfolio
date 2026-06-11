import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Mail } from "lucide-react";
import BorderGlow from "./BorderGlow";
import DotField from "./DotField";
import PillNav from "./PillNav";
import "./styles.css";

type MediaItem = {
  name: string;
  src?: string;
  url?: string;
  kind?: "audio" | "video";
  type: string;
};

type Project = {
  id: string;
  year: string;
  title: string;
  category: string;
  tags: string[];
  cover?: string;
  images: { name: string; src: string; section?: string }[];
  media: MediaItem[];
  summary: string;
  links?: { title: string; note: string; url: string }[];
  videos?: { title: string; note: string; src: string }[];
  caseStudy?: {
    intro: string;
    highlights: { title: string; text: string }[];
  };
};

type PortfolioData = {
  projects: Project[];
};

declare global {
  interface Window {
    PORTFOLIO_DATA: PortfolioData;
  }
}

const portfolio = window.PORTFOLIO_DATA;
const avatar = "assets/generated/designer-avatar-head.png";
const priority = ["医疗科技", "城市文旅", "文旅活动", "企业会务", "商业活动", "科技大会", "医疗健康"];

const medAssets = {
  logo: "assets/curated/med/logo.png",
  poster: "assets/curated/med/quantum-poster.png",
  modelFront: "assets/curated/med/quantum-model-front.jpg",
  modelAngle: "assets/curated/med/quantum-model-angle.jpg",
  countdown: "assets/curated/med/countdown.png",
  event: "assets/curated/med/2050-event.png",
  recruit: "assets/curated/med/recruit.png",
  partnership: "assets/curated/med/partnership.png",
  xhsPlatform: "assets/curated/med/xhs-platform.png",
  xhsGsk: "assets/curated/med/xhs-gsk.png",
  flashVideo: "assets/curated/med/2050-flash.mp4",
  recapVideo: "assets/curated/med/2050-recap.mp4",
};

const zhuoruProject: Project = {
  id: "2026-zhuoru-xiaohongshu",
  year: "2026",
  title: "琢如小红书图文策划",
  category: "内容策划",
  tags: ["小红书图文", "内容策划", "品牌传播", "内容视觉协同"],
  cover: "assets/curated/zhuoru/breakthrough.png",
  images: [
    { name: "breakthrough.png", src: "assets/curated/zhuoru/breakthrough.png", section: "小红书图文" },
    { name: "mask.png", src: "assets/curated/zhuoru/mask.png", section: "小红书图文" },
    { name: "healing.png", src: "assets/curated/zhuoru/healing.png", section: "小红书图文" },
    { name: "womens-day.png", src: "assets/curated/zhuoru/womens-day.png", section: "节日内容" },
    { name: "travel.png", src: "assets/curated/zhuoru/travel.png", section: "场景内容" },
    { name: "serum.png", src: "assets/curated/zhuoru/serum.png", section: "产品内容" },
  ],
  media: [],
  summary: "围绕琢如护肤产品和品牌调性进行小红书图文选题、文案方向与视觉内容协同，形成可用于社媒发布的内容素材。",
};

function enrichProjects(projects: Project[]) {
  const next = projects.map((project) => {
    if (project.title !== "医图生科") return project;
    return {
      ...project,
      cover: medAssets.poster,
      images: [
        { name: "logo.png", src: medAssets.logo, section: "Logo" },
        { name: "quantum-poster.png", src: medAssets.poster, section: "活动海报" },
        { name: "countdown.png", src: medAssets.countdown, section: "2050传播图" },
        { name: "2050-event.png", src: medAssets.event, section: "2050传播图" },
        { name: "recruit.png", src: medAssets.recruit, section: "2050传播图" },
        { name: "partnership.png", src: medAssets.partnership, section: "合作新闻图" },
        { name: "quantum-model-front.jpg", src: medAssets.modelFront, section: "量子计算机积木模型" },
        { name: "quantum-model-angle.jpg", src: medAssets.modelAngle, section: "量子计算机积木模型" },
        { name: "xhs-platform.png", src: medAssets.xhsPlatform, section: "小红书图文" },
        { name: "xhs-gsk.png", src: medAssets.xhsGsk, section: "小红书图文" },
      ],
      tags: ["医疗科技", "B2B内容运营", "项目管理", "会务物料", "小红书策划", "视频拍摄剪辑"],
      summary:
        "围绕医图生科 QureGenAI 的品牌内容运营与项目协同，包括官网对接、公众号文章、小红书图文策划、2050大会传播物料、量子计算机积木模型供应商沟通，以及活动视频拍摄剪辑。",
      links: [
        { title: "医图生科官网", note: "对接设计供应商完成的网站项目", url: "http://www.acemapai.com" },
        {
          title: "重磅 BD 交易！医图生科与国富量子(00290.HK)达成研发平台与药物管线BD合作，Quantum AIDD正式进入国际产业化快车道",
          note: "公众号文章 / 发布顺序 01",
          url: "https://mp.weixin.qq.com/s/eY6cPSoCUWzQVDN_bKUzQA",
        },
        {
          title: "医图生科亮相2050未来大会：用量子比特重写生命密码",
          note: "公众号文章 / 发布顺序 03",
          url: "https://mp.weixin.qq.com/s/MD8XhqGc1VjRfy0qIWsuqQ",
        },
        {
          title: "倒计时 7 天 | 医图生科 × 2050：量子AI+创新药，用量子比特重写生命密码",
          note: "公众号文章 / 发布顺序 04",
          url: "https://mp.weixin.qq.com/s/yM8E3k6g_K-Qoa_WvIraMQ",
        },
        {
          title: "2050大会前沿探索招募·杭州｜一起玩量子计算的“小龙虾”！",
          note: "公众号文章 / 发布顺序 02",
          url: "https://mp.weixin.qq.com/s/aTpe1_Qs3HYQL8OhcU6bRQ",
        },
      ],
      videos: [
        { title: "2050 活动文字快闪", note: "活动传播视频，负责拍摄剪辑。", src: medAssets.flashVideo },
        { title: "2050 活动全流程演讲", note: "活动全流程记录视频，负责拍摄剪辑。", src: medAssets.recapVideo },
      ],
      caseStudy: {
        intro: "基于简历中的品牌内容运营与内容项目管理经历，项目重点展示策划、选题、推进与供应商协同。",
        highlights: [
          { title: "策划统筹", text: "围绕 2050 大会、官网、小红书和公众号内容拆解传播主题，形成选题、物料和内容排期。" },
          { title: "内容选题", text: "参与公众号快讯、行业选题、靶点/BD话题和小红书图文方向，将专业资料转化为可发布内容。" },
          { title: "项目推进", text: "跟进客户需求、页面资料、会务物料和视频交付，协调排期、反馈与验收。" },
          { title: "供应商协同", text: "对接官网设计团队与积木厂家，推进官网呈现和量子计算机积木模型等物料呈现。" },
        ],
      },
    };
  });
  return next.some((project) => project.title.includes("琢如")) ? next : [...next, zhuoruProject];
}

function pickProjects(projects: Project[], limit = 10) {
  const byCategory = new Map<string, Project>();
  projects.forEach((project) => {
    if (project.cover && !byCategory.has(project.category)) byCategory.set(project.category, project);
  });

  const picked = priority.map((category) => byCategory.get(category)).filter(Boolean) as Project[];
  projects.forEach((project) => {
    if (picked.length >= limit) return;
    if (project.cover && !picked.includes(project)) picked.push(project);
  });
  return picked.slice(0, limit);
}

function projectImages(project: Project, limit = 8) {
  if (project.title === "医图生科") {
    return project.images.slice(0, limit).map((image) => image.src).filter(Boolean);
  }
  const seen = new Set<string>();
  const images = [project.cover, ...project.images.map((image) => image.src)].filter(Boolean) as string[];
  return images.filter((src) => {
    if (seen.has(src)) return false;
    seen.add(src);
    return true;
  }).slice(0, limit);
}

function App() {
  const projects = useMemo(() => enrichProjects(portfolio.projects), []);
  const featured = useMemo(() => pickProjects(projects, 10), [projects]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <>
      <div className="site-background" aria-hidden="true">
        <DotField
          dotRadius={2.1}
          dotSpacing={15}
          cursorRadius={520}
          bulgeStrength={72}
          glowRadius={340}
          gradientFrom="rgba(126, 216, 255, 0.38)"
          gradientTo="rgba(209, 114, 255, 0.34)"
          glowColor="rgba(163, 78, 255, 0.48)"
          sparkle
          waveAmplitude={1.1}
        />
      </div>
      <main className="main-shell">
        <HeroSection />
        <MarqueeSection projects={featured} />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection projects={projects} onOpen={setActiveProject} />
        <ContactSection />
        {activeProject && <ProjectDetail project={activeProject} onClose={() => setActiveProject(null)} />}
      </main>
    </>
  );
}

function sortProjectsByTime(projects: Project[]) {
  return [...projects].sort((a, b) => {
    const yearDiff = Number.parseInt(b.year, 10) - Number.parseInt(a.year, 10);
    if (yearDiff !== 0) return yearDiff;
    if (a.title === "医图生科") return -1;
    if (b.title === "医图生科") return 1;
    return a.title.localeCompare(b.title, "zh-CN");
  });
}

function groupProjectsByYear(projects: Project[]) {
  return sortProjectsByTime(projects).reduce<Array<{ year: string; projects: Project[] }>>((groups, project) => {
    const group = groups.find((item) => item.year === project.year);
    if (group) group.projects.push(project);
    else groups.push({ year: project.year, projects: [project] });
    return groups;
  }, []);
}

function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Magnet({
  children,
  padding = 150,
  strength = 3,
  className = "",
}: {
  children: ReactNode;
  padding?: number;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("translate3d(0,0,0)");
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const element = ref.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const inside =
        event.clientX > rect.left - padding &&
        event.clientX < rect.right + padding &&
        event.clientY > rect.top - padding &&
        event.clientY < rect.bottom + padding;

      if (!inside) {
        setActive(false);
        setTransform("translate3d(0,0,0)");
        return;
      }

      setActive(true);
      const x = (event.clientX - (rect.left + rect.width / 2)) / strength;
      const y = (event.clientY - (rect.top + rect.height / 2)) / strength;
      setTransform(`translate3d(${x}px, ${y}px, 0)`);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [padding, strength]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform,
        transition: active ? "transform 0.3s ease-out" : "transform 0.6s ease-in-out",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

function ContactButton() {
  return (
    <a className="contact-button" href="#contact">
      联系我
    </a>
  );
}

function ViewProjectButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="live-button" onClick={onClick} type="button">
      查看项目
    </button>
  );
}

function HeroSection() {
  const directions = ["内容策划", "品牌内容运营", "内容项目管理", "活动执行"];

  return (
    <section className="hero-section" id="hero">
      <FadeIn delay={0} y={-20}>
        <PillNav
          logo={avatar}
          logoAlt="刘子豪头像"
          items={[
            { label: "关于", href: "#about" },
            { label: "能力", href: "#services" },
            { label: "项目", href: "#projects" },
            { label: "联系", href: "#contact" },
          ]}
          activeHref="#hero"
          baseColor="#d7e2ea"
          pillColor="#0b0c0e"
          hoveredPillTextColor="#0b0c0e"
          pillTextColor="#d7e2ea"
        />
      </FadeIn>

      <FadeIn delay={0.15} y={40} className="hero-title-wrap">
        <h1 className="hero-heading hero-title">Hi, i&apos;m Zihao</h1>
      </FadeIn>

      <FadeIn delay={0.6} y={30}>
        <div className="hero-portrait">
          <Magnet className="hero-magnet">
            <img src={avatar} alt="刘子豪 3D 卡通头像" />
          </Magnet>
        </div>
      </FadeIn>

      <div className="hero-bottom">
        <FadeIn delay={0.35} y={20}>
          <div className="hero-role-block">
            <span>岗位方向</span>
            <div className="role-chip-list">
              {directions.map((item) => (
                <strong key={item}>{item}</strong>
              ))}
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.5} y={20}>
          <ContactButton />
        </FadeIn>
      </div>
    </section>
  );
}

function MarqueeSection({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);
  const images = projects.flatMap((project) => [project.cover, ...project.images.slice(0, 1).map((image) => image.src)]).filter(Boolean) as string[];
  const rowOne = images.slice(0, Math.ceil(images.length / 2));
  const rowTwo = images.slice(Math.ceil(images.length / 2));

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const sectionTop = ref.current.offsetTop;
      setOffset((window.scrollY - sectionTop + window.innerHeight) * 0.3);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="marquee-section" ref={ref}>
      <div className="marquee-row" style={{ transform: `translateX(${offset - 200}px)` }}>
        {[...rowOne, ...rowOne, ...rowOne].map((src, index) => <img src={src} alt="" loading="lazy" key={`${src}-${index}`} />)}
      </div>
      <div className="marquee-row" style={{ transform: `translateX(${-offset + 200}px)` }}>
        {[...rowTwo, ...rowTwo, ...rowTwo].map((src, index) => <img src={src} alt="" loading="lazy" key={`${src}-${index}`} />)}
      </div>
    </section>
  );
}

function AnimatedText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.2"] });

  return (
    <p className="animated-text" ref={ref}>
      {text.split("").map((char, index) => (
        <AnimatedChar
          char={char}
          index={index}
          total={text.length}
          progress={scrollYProgress}
          key={`${char}-${index}`}
        />
      ))}
    </p>
  );
}

function AnimatedChar({ char, index, total, progress }: { char: string; index: number; total: number; progress: MotionValue<number> }) {
  const start = index / total;
  const end = Math.min(1, start + 0.18);
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  return <motion.span style={{ opacity }}>{char}</motion.span>;
}

function AboutSection() {
  const highlights = [
    ["内容策划", "公众号快讯、行业选题、靶点调研、小红书图文与视频脚本。"],
    ["项目推进", "需求拆解、排期管理、客户反馈、供应商协调与交付验收。"],
    ["活动执行", "商业、企业、政府活动落地，物料统筹与现场协调。"],
  ];

  return (
    <section className="about-section" id="about">
      <div className="about-panel">
        <FadeIn delay={0} y={30} className="about-title-block">
          <span>ABOUT</span>
          <h2 className="hero-heading mega-heading">关于我</h2>
          <p>刘子豪 / 江苏·苏州</p>
        </FadeIn>

        <FadeIn delay={0.1} y={30} className="about-copy">
          <p>
            近3年活动策划执行经验，半年B2B品牌内容运营与项目管理经验。熟悉客户需求沟通、项目排期推进、供应商协调与内容交付管理。
          </p>
          <p>
            现阶段主要服务AI制药、生物科技类客户，参与品牌内容、官网、公众号快讯、靶点调研、小红书选题、视频脚本与展会物料协同等工作。
          </p>
          <div className="about-highlights">
            {highlights.map(([title, text]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <ContactButton />
        </FadeIn>
      </div>
    </section>
  );
}

function ServicesSection() {
  const services = [
    ["01", "内容策划", "公众号快讯、行业选题、小红书图文、视频脚本与活动传播主题策划。"],
    ["02", "品牌内容运营", "围绕B2B客户进行官网内容、公众号文章、社媒内容与品牌资料整理。"],
    ["03", "内容项目管理", "客户汇报、需求拆解、排期推进、反馈收敛、供应商协调与交付验收。"],
    ["04", "活动执行", "商业、企业、政府活动落地，物料统筹、现场协调与活动复盘。"],
    ["05", "AI工具应用", "专业资料整理、初稿生成、报告结构搭建与人工审校优化。"],
    ["06", "视觉与物料协同", "基础平面工具、短视频拍摄剪辑学习中，可对接设计与制作供应商推进交付。"],
  ];

  return (
    <section className="services-section" id="services">
      <FadeIn>
        <h2>能力</h2>
      </FadeIn>
      <div className="service-list">
        {services.map(([number, title, text], index) => (
          <FadeIn delay={index * 0.1} key={number}>
            <article className="service-item">
              <strong>{number}</strong>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function ProjectsSection({ projects, onOpen }: { projects: Project[]; onOpen: (project: Project) => void }) {
  const groups = useMemo(() => groupProjectsByYear(projects), [projects]);
  const [openYear, setOpenYear] = useState(groups[0]?.year || "");

  return (
    <section className="projects-section" id="projects">
      <FadeIn>
        <h2 className="hero-heading mega-heading">项目</h2>
      </FadeIn>
      <div className="year-stack">
        {groups.map((group) => {
          const isOpen = openYear === group.year;
          return (
            <FadeIn key={group.year}>
              <BorderGlow className={`year-card-glow ${isOpen ? "open" : ""}`} borderRadius={52} animated={group.year === groups[0]?.year}>
                <article className="year-card">
                  <button className="year-card-head" type="button" onClick={() => setOpenYear(isOpen ? "" : group.year)}>
                    <strong>{group.year}</strong>
                    <span>项目经历 / 内容归档</span>
                    <em>{isOpen ? "收起" : "展开"}</em>
                  </button>
                  {isOpen && (
                    <div className="year-projects">
                      {group.projects.map((project, index) => (
                        <ProjectCard project={project} index={index} onOpen={onOpen} key={project.id} />
                      ))}
                    </div>
                  )}
                </article>
              </BorderGlow>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}

function ProjectCard({ project, index, onOpen }: { project: Project; index: number; onOpen: (project: Project) => void }) {
  const images = projectImages(project, 3);
  const hasSideImages = images.length > 1;

  return (
    <FadeIn delay={Math.min(index * 0.04, 0.3)}>
      <BorderGlow className="project-card-glow" borderRadius={48} glowRadius={32} fillOpacity={0.2}>
        <article className="project-card">
          <div className="project-card-top">
            <strong>{String(index + 1).padStart(2, "0")}</strong>
            <span>{project.category}</span>
            <h3>{project.title}</h3>
            <ViewProjectButton onClick={() => onOpen(project)} />
          </div>
          <button className={`project-image-grid ${hasSideImages ? "" : "single-image"}`} type="button" onClick={() => onOpen(project)}>
            {hasSideImages && (
              <div>
                <img src={images[1]} alt={`${project.title} 辅图`} />
                {images[2] && <img src={images[2]} alt={`${project.title} 辅图`} />}
              </div>
            )}
            <img src={images[0]} alt={project.title} />
          </button>
        </article>
      </BorderGlow>
    </FadeIn>
  );
}

function ContactSection() {
  return (
    <section className="contact-section" id="contact">
      <div className="resume-close">
        <p className="resume-location">江苏·苏州 / 可联系合作与项目沟通</p>
        <h2 className="hero-heading">LET&apos;S TALK</h2>
        <p className="resume-summary">品牌内容运营、内容项目管理、活动执行与新媒体内容策划相关项目，可通过邮箱或电话联系。</p>
        <div className="contact-methods">
          <a href="mailto:879400092@qq.com"><Mail size={18} /><span>邮箱</span><strong>879400092@qq.com</strong></a>
          <a href="tel:13142666086"><span>电话</span><strong>13142666086</strong></a>
        </div>
      </div>
    </section>
  );
}

function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  const images = projectImages(project, 8);
  const sideImages = images.slice(1, 3);
  const galleryImages = images.slice(3);

  return (
    <motion.div className="detail-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div
        className="detail-card-shell"
        onClick={(event) => event.stopPropagation()}
        initial={{ y: 60, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <BorderGlow className="detail-card-glow" borderRadius={54} glowRadius={46} animated>
          <article className="detail-card">
            <button className="detail-close" onClick={onClose} type="button">关闭</button>
            <div className="detail-head">
              <strong>{project.year}</strong>
              <div>
                <span>{project.category}</span>
                <h3>{project.title}</h3>
              </div>
            </div>
            <div className="detail-media-layout">
              {sideImages.length > 0 && (
                <div className="detail-side-images">
                  {sideImages.map((src, index) => (
                    <img src={src} alt={`${project.title} 辅图 ${index + 1}`} key={`${src}-${index}`} />
                  ))}
                </div>
              )}
              <img className="detail-main-image" src={images[0]} alt={`${project.title} 主图`} />
            </div>
            <p className="detail-summary">{project.summary}</p>
            <div className="detail-tags">
              {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            {galleryImages.length > 0 && (
              <div className="detail-gallery">
                {galleryImages.map((src, index) => (
                  <img src={src} alt={`${project.title} 更多图片 ${index + 1}`} key={`${src}-${index}`} />
                ))}
              </div>
            )}
            {project.caseStudy && <CaseStudyBlock project={project} />}
            {project.links && project.links.length > 0 && <ProjectLinks links={project.links} />}
            {project.videos && project.videos.length > 0 && <ProjectVideos videos={project.videos} />}
          </article>
        </BorderGlow>
      </motion.div>
    </motion.div>
  );
}

function GlowMiniCard({ children }: { children: ReactNode }) {
  return (
    <BorderGlow className="mini-card-glow" borderRadius={18} glowRadius={22} fillOpacity={0.18}>
      {children}
    </BorderGlow>
  );
}

function CaseStudyBlock({ project }: { project: Project }) {
  if (!project.caseStudy) return null;
  return (
    <section className="case-study">
      <h4>项目职责</h4>
      <div className="case-grid">
        {project.caseStudy.highlights.map((item) => (
          <GlowMiniCard key={item.title}>
            <article>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </article>
          </GlowMiniCard>
        ))}
      </div>
    </section>
  );
}

function ProjectLinks({ links }: { links: NonNullable<Project["links"]> }) {
  return (
    <section className="project-links">
      <h4>相关链接</h4>
      <div>
        {links.map((link) => (
          <GlowMiniCard key={link.url}>
            <a href={link.url} target="_blank" rel="noreferrer">
              <strong>{link.title}</strong>
              <span>{link.note}</span>
            </a>
          </GlowMiniCard>
        ))}
      </div>
    </section>
  );
}

function ProjectVideos({ videos }: { videos: NonNullable<Project["videos"]> }) {
  return (
    <section className="project-videos">
      <h4>视频记录</h4>
      <div>
        {videos.map((video) => (
          <GlowMiniCard key={video.src}>
            <article>
              <video src={video.src} controls playsInline preload="metadata" />
              <h5>{video.title}</h5>
              <p>{video.note}</p>
            </article>
          </GlowMiniCard>
        ))}
      </div>
    </section>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
