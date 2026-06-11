#!/usr/bin/env python3
import json
import os
import re
import shutil
from pathlib import Path
from urllib.parse import quote


SOURCE = Path("/Users/Zhuanz/Desktop/资料整理")
ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "projects"
DATA = ROOT / "data.json"
DATA_JS = ROOT / "data.js"

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
VIDEO_EXTS = {".mp4", ".mov", ".m4v"}
AUDIO_EXTS = {".mp3", ".wav", ".m4a"}
DOC_EXTS = {".pdf", ".ppt", ".pptx", ".doc", ".docx", ".xls", ".xlsx", ".ai", ".key"}
SKIP_PREFIXES = (".", ".~", "~$")


def slug(value):
    text = re.sub(r"\s+", "-", value.strip())
    text = re.sub(r"[^\w\-\u4e00-\u9fff]+", "", text)
    return text or "item"


def rel_asset_path(path):
    return path.relative_to(ROOT).as_posix()


def copy_asset(src, year, project, project_root):
    relative_parent = src.parent.relative_to(project_root)
    target_dir = ASSETS / year / slug(project)
    for part in relative_parent.parts:
        target_dir = target_dir / slug(part)
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / src.name
    if not target.exists() or target.stat().st_size != src.stat().st_size:
        shutil.copy2(src, target)
    return rel_asset_path(target)


def file_url(path):
    return "file://" + quote(str(path))


def visible_files(folder):
    for path in sorted(folder.rglob("*")):
        if not path.is_file():
            continue
        if path.name.startswith(SKIP_PREFIXES):
            continue
        yield path


def classify_project(name):
    lower = name.lower()
    rules = [
        ("医图生科", "医疗科技", ["医疗科技", "内容运营", "品牌协同"]),
        ("waic", "科技大会", ["人工智能", "会展", "行业大会"]),
        ("人工智能", "科技大会", ["人工智能", "会展", "行业大会"]),
        ("世博", "城市文旅", ["城市传播", "政府活动", "文旅"]),
        ("苏州日", "城市文旅", ["城市传播", "政府活动", "文旅"]),
        ("非遗", "文旅活动", ["非遗", "城市文化", "活动策划"]),
        ("花市", "文旅活动", ["节庆市集", "城市文化", "活动视觉"]),
        ("太湖", "文旅活动", ["文旅", "城市度假", "内容传播"]),
        ("地名", "城市文旅", ["城市文化", "文旅传播", "内容策划"]),
        ("城市漫步", "城市文旅", ["城市漫步", "文旅传播", "社群活动"]),
        ("太保", "企业会务", ["保险金融", "企业会务", "活动视觉"]),
        ("太平洋", "企业会务", ["保险金融", "企业会务", "活动视觉"]),
        ("康养", "企业会务", ["康养", "财富规划", "企业活动"]),
        ("医院", "医疗健康", ["医疗健康", "发布会", "品牌传播"]),
        ("edc", "商业活动", ["商业空间", "发布会", "视觉传播"]),
        ("金鹰", "商业活动", ["商业开业", "商场活动", "品牌传播"]),
        ("天街", "商业活动", ["商业空间", "IP活动", "品牌传播"]),
        ("跨年", "商业活动", ["城市商业", "节庆活动", "传播素材"]),
        ("ibis", "商业活动", ["酒店品牌", "巡演活动", "线下传播"]),
    ]
    for key, category, tags in rules:
        if key.lower() in lower:
            return category, tags
    return "综合项目", ["项目经历", "活动执行", "内容呈现"]


def infer_role(category):
    if "文旅" in category or "城市" in category:
        return "城市传播 / 活动内容 / 视觉资料整理"
    if "企业" in category or "商业" in category or "品牌" in category:
        return "品牌活动 / 会务执行 / 传播素材整理"
    if "医疗" in category or "科技" in category:
        return "品牌建设 / 内容运营 / 商务材料协同"
    return "项目执行 / 内容整理 / 视觉呈现"


def build_standard_project(year, folder):
    images = []
    docs = []
    media = []
    cover = None
    for path in visible_files(folder):
        ext = path.suffix.lower()
        if ext in IMAGE_EXTS:
            copied = copy_asset(path, year, folder.name, folder)
            item = {"name": path.name, "src": copied}
            images.append(item)
            if path.stem.lower() == "cover":
                cover = copied
        elif ext in VIDEO_EXTS or ext in AUDIO_EXTS:
            copied = copy_asset(path, year, folder.name, folder)
            media_kind = "audio" if ext in AUDIO_EXTS else "video"
            media.append({"name": path.name, "src": copied, "url": file_url(path), "kind": media_kind, "type": ext[1:].upper()})
        elif ext in DOC_EXTS:
            docs.append({"name": path.name, "url": file_url(path), "type": ext[1:].upper()})

    if cover is None and images:
        cover = images[0]["src"]

    category, tags = classify_project(folder.name)
    return {
        "id": f"{year}-{slug(folder.name)}",
        "year": year,
        "title": folder.name,
        "category": category,
        "tags": tags,
        "role": infer_role(category),
        "cover": cover,
        "images": images,
        "docs": docs,
        "media": media,
        "featured": False,
        "summary": make_summary(folder.name, category),
    }


def make_summary(title, category):
    if "医图生科" in title:
        return "围绕医疗科技品牌内容、路演材料、会务物料与视频传播形成的综合项目档案。"
    if "政府" in category or "文旅" in category:
        return "围绕城市文化、活动现场和传播内容形成的项目记录，适合展示文旅策划与视觉整理能力。"
    if "企业" in category:
        return "企业会务与品牌活动项目，集中体现线下执行、内容物料和活动视觉管理。"
    if "商业" in category or "品牌" in category:
        return "商业空间、品牌活动和传播素材的项目记录，突出活动氛围与视觉产出。"
    if "医疗" in category or "科技" in category:
        return "医疗科技与行业传播相关项目，强调资料整理、内容表达和项目协同。"
    return "项目现场、视觉素材与成果文件的整理展示。"


MED_GROUPS = {
    "pitchbook": ("融资路演", "中英文 pitchbook、公司介绍和技术方案材料。"),
    "PPT模板": ("视觉模板", "PPT 版式、目录页、封面视觉和演示规范。"),
    "月报": ("月报复盘", "阶段性工作月报、复盘文档和进展记录。"),
    "名片": ("品牌触点", "名片设计和对外商务触点。"),
    "大会": ("会务物料", "大会海报、预算、礼品、音频和现场传播素材。"),
    "甘特图": ("项目管理", "年度品牌营销规划和项目排期。"),
    "vi设计": ("视觉资料协同", "品牌视觉资料、签名档和视觉规范材料的协同整理。"),
    "展会推荐": ("行业展会", "会议调研和展会推荐资料。"),
    "视频": ("视频传播", "活动回顾、快闪视频和访谈切片。"),
    "logo": ("Logo资产", "不同颜色、用途和格式的 logo 文件。"),
    "账号搭建和风格设计": ("内容运营", "公众号排版、账号风格和内容视觉规范。"),
    "新春海报": ("节日物料", "节日传播海报与视觉物料协同。"),
    "品牌定位": ("品牌策略", "品牌定位与传播策略材料。"),
    "公司介绍": ("公司资料", "中英文公司介绍、平台能力和管线介绍。"),
    "宣传视频": ("宣传内容", "宣传脚本、平台界面、管线图和对标视频。"),
    "手册设计": ("宣传手册", "公司 brochure、封面封底和印刷物料。"),
}


def build_med_project(year, folder):
    sections = {}
    all_images = []
    docs = []
    media = []
    cover = None

    for child in sorted(folder.iterdir()):
        if not child.is_dir() or child.name.startswith("."):
            continue
        section_title, section_note = MED_GROUPS.get(child.name, (child.name, "相关材料。"))
        section = {"source": child.name, "title": section_title, "note": section_note, "images": [], "docs": [], "media": []}
        for path in visible_files(child):
            ext = path.suffix.lower()
            if ext in IMAGE_EXTS:
                copied = copy_asset(path, year, folder.name, folder)
                image = {"name": path.name, "src": copied, "section": section_title}
                section["images"].append(image)
                all_images.append(image)
                if cover is None and child.name in {"logo", "公司介绍", "品牌定位", "大会"}:
                    cover = copied
            elif ext in VIDEO_EXTS or ext in AUDIO_EXTS:
                copied = copy_asset(path, year, folder.name, folder)
                media_kind = "audio" if ext in AUDIO_EXTS else "video"
                item = {"name": path.name, "src": copied, "url": file_url(path), "kind": media_kind, "type": ext[1:].upper(), "section": section_title}
                section["media"].append(item)
                media.append(item)
            elif ext in DOC_EXTS:
                item = {"name": path.name, "url": file_url(path), "type": ext[1:].upper(), "section": section_title}
                section["docs"].append(item)
                docs.append(item)
        sections[child.name] = section

    if cover is None and all_images:
        cover = all_images[0]["src"]

    return {
        "id": f"{year}-{slug(folder.name)}",
        "year": year,
        "title": folder.name,
        "category": "医疗科技",
        "tags": ["医疗科技", "品牌策略", "内容运营", "商务材料"],
        "role": "品牌体系搭建 / 内容运营 / 路演与会务材料协同",
        "cover": cover,
        "images": all_images,
        "docs": docs,
        "media": media,
        "sections": list(sections.values()),
        "featured": True,
        "summary": make_summary(folder.name, "医疗科技"),
    }


def build():
    projects = []
    for year_dir in sorted(SOURCE.iterdir(), reverse=True):
        if not year_dir.is_dir() or not year_dir.name.isdigit():
            continue
        for project_dir in sorted(year_dir.iterdir()):
            if not project_dir.is_dir() or project_dir.name.startswith("."):
                continue
            if project_dir.name == "医图生科":
                projects.append(build_med_project(year_dir.name, project_dir))
            else:
                projects.append(build_standard_project(year_dir.name, project_dir))

    payload = {
        "profile": {
            "name": "Zhuanz",
            "title": "品牌活动 / 城市文旅 / 医疗科技内容项目",
            "location": "Suzhou / Shanghai",
            "intro": "把线下活动、品牌资料和内容产出整理成可浏览、可回看、可证明的项目档案。",
            "keywords": ["活动执行", "品牌传播", "文旅内容", "企业会务", "医疗科技"],
        },
        "projects": projects,
        "stats": {
            "projects": len(projects),
            "years": sorted({p["year"] for p in projects}, reverse=True),
            "images": sum(len(p["images"]) for p in projects),
            "docs": sum(len(p["docs"]) for p in projects),
            "media": sum(len(p["media"]) for p in projects),
        },
    }
    json_text = json.dumps(payload, ensure_ascii=False, indent=2)
    DATA.write_text(json_text, encoding="utf-8")
    DATA_JS.write_text(f"window.PORTFOLIO_DATA = {json_text};\n", encoding="utf-8")


if __name__ == "__main__":
    build()
