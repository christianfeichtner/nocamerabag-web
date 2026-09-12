#!/usr/bin/env python3
"""
convert.py - Squarespace to Hugo Markdown Converter

Reads 'export.xml' from Squarespace (WordPress WXR format) and converts
all blog posts into clean Hugo Markdown files with front-matter under 'content/blog/'.
"""

import sys
import os
import re
import html
import urllib.parse
import subprocess
from datetime import datetime

# ---------------------------------------------------------
# Ensure required dependencies are available
# ---------------------------------------------------------
VENDOR_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.vendor')
if os.path.exists(VENDOR_DIR) and VENDOR_DIR not in sys.path:
    sys.path.insert(0, VENDOR_DIR)

REQUIRED_PACKAGES = ['markdownify', 'yaml', 'bs4']
missing_packages = []
for pkg in REQUIRED_PACKAGES:
    try:
        __import__(pkg)
    except ImportError:
        missing_packages.append(pkg)

if missing_packages:
    pkg_map = {'bs4': 'beautifulsoup4', 'yaml': 'pyyaml', 'markdownify': 'markdownify'}
    to_install = [pkg_map.get(p, p) for p in missing_packages]
    print(f"Installing missing dependencies: {', '.join(to_install)}...")
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-t", VENDOR_DIR, *to_install
        ])
        if VENDOR_DIR not in sys.path:
            sys.path.insert(0, VENDOR_DIR)
    except Exception as e:
        print(f"Failed to install dependencies locally: {e}")
        subprocess.check_call([sys.executable, "-m", "pip", "install", *to_install])

import xml.etree.ElementTree as ET
import yaml
from bs4 import BeautifulSoup
from markdownify import markdownify as md


def clean_html_content(raw_html: str) -> str:
    """
    Cleans HTML content from Squarespace / WordPress export before markdown conversion.
    Handles [caption] shortcodes, embedded iframes/YouTube videos, scripts, and formatting.
    """
    if not raw_html:
        return ""

    content = raw_html

    # 1. Remove script and style tags (e.g. JSON-LD scripts or custom styling)
    content = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', content, flags=re.IGNORECASE | re.DOTALL)
    content = re.sub(r'<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>', '', content, flags=re.IGNORECASE | re.DOTALL)

    # 2. Convert YouTube / Embedly iframes into placeholders for clean shortcodes
    yt_replacements = {}
    def repl_iframe(match):
        iframe_html = match.group(0)
        unquoted = urllib.parse.unquote(iframe_html)
        yt_match = re.search(r'(?:youtube(?:-nocookie)?\.com/(?:embed/|watch\?v=)|youtu\.be/)([\w-]{11})', unquoted)
        if yt_match:
            video_id = yt_match.group(1)
            placeholder = f"HUGOPLACEHOLDERYOUTUBE{video_id}"
            yt_replacements[placeholder] = f"{{{{< youtube {video_id} >}}}}"
            return f"<p>{placeholder}</p>"
        return iframe_html

    content = re.sub(r'<iframe\b[^>]*>.*?</iframe>|<iframe\b[^>]*/>|<iframe\b[^>]*>', repl_iframe, content, flags=re.IGNORECASE | re.DOTALL)

    # 3. Handle [caption ...]...[/caption] shortcodes
    def repl_caption(match):
        inner_html = match.group(1).strip()
        soup = BeautifulSoup(inner_html, 'html.parser')
        img = soup.find('img')
        if not img:
            return inner_html

        src = img.get('src', '')
        alt = (img.get('alt') or '').strip()

        # Check if there is an enclosing <a> link
        a_tag = soup.find('a')
        link_href = a_tag.get('href', '').strip() if a_tag else ''

        # Decompose img & a to extract the pure caption text outside the image
        img.decompose()
        if a_tag:
            a_tag.decompose()

        caption_text = soup.get_text().strip()
        # Prefer uncorrupted caption text over alt attribute (which is often truncated in Squarespace exports)
        final_caption = caption_text if caption_text else alt
        final_caption = ' '.join(final_caption.split())

        # If image was wrapped in a real external/internal link
        if link_href and link_href != src and link_href != final_caption and link_href != 'null' and not link_href.startswith('null'):
            return f'<p><a href="{link_href}"><img src="{src}" alt="{final_caption}" /></a></p>'
        return f'<p><img src="{src}" alt="{final_caption}" /></p>'

    content = re.sub(r'\[caption[^\]]*\](.*?)\[/caption\]', repl_caption, content, flags=re.DOTALL | re.IGNORECASE)

    # 4. Convert HTML to clean Markdown
    markdown = md(
        content,
        heading_style='ATX',
        bullets='*',
        code_language='',
        autolinks=False
    )

    # 5. Restore YouTube shortcodes
    for placeholder, shortcode in yt_replacements.items():
        markdown = markdown.replace(placeholder, shortcode)

    # 6. Clean up duplicate newlines and trailing whitespace
    markdown = re.sub(r'\r\n', '\n', markdown)
    markdown = re.sub(r'[ \t]+$', '', markdown, flags=re.MULTILINE)
    markdown = re.sub(r'\n{3,}', '\n\n', markdown)

    return markdown.strip()


def parse_date(date_str: str, pub_date_str: str = None) -> str:
    """
    Parses post_date and converts it to ISO 8601 string for Hugo front-matter.
    """
    if date_str and date_str != '0000-00-00 00:00:00':
        try:
            dt = datetime.strptime(date_str.strip(), "%Y-%m-%d %H:%M:%S")
            return dt.strftime("%Y-%m-%dT%H:%M:%S")
        except ValueError:
            pass

    if pub_date_str:
        try:
            dt = datetime.strptime(pub_date_str.strip(), "%a, %d %b %Y %H:%M:%S %z")
            return dt.strftime("%Y-%m-%dT%H:%M:%S%z")
        except ValueError:
            pass

    return date_str or ""


def dump_frontmatter(data: dict) -> str:
    """
    Formats dictionary as YAML front-matter with clean string representation.
    """
    clean_data = {}
    for k, v in data.items():
        if v is not None and v != "" and v != []:
            clean_data[k] = v

    yaml_text = yaml.dump(
        clean_data,
        sort_keys=False,
        allow_unicode=True,
        default_flow_style=False
    ).strip()
    return f"---\n{yaml_text}\n---\n\n"


def convert_export(xml_file: str = "export.xml", output_dir: str = "content/blog"):
    """
    Main conversion routine.
    """
    if not os.path.exists(xml_file):
        print(f"Error: XML file '{xml_file}' not found.")
        sys.exit(1)

    os.makedirs(output_dir, exist_ok=True)

    print(f"Reading '{xml_file}'...")
    tree = ET.parse(xml_file)
    root = tree.getroot()
    channel = root.find('channel')
    if channel is None:
        print("Error: Invalid RSS/WordPress XML structure (missing <channel>).")
        sys.exit(1)

    wp_ns = "{http://wordpress.org/export/1.2/}"
    content_ns = "{http://purl.org/rss/1.0/modules/content/}"
    excerpt_ns = "{http://wordpress.org/export/1.2/excerpt/}"
    dc_ns = "{http://purl.org/dc/elements/1.1/}"

    items = channel.findall('item')
    print(f"Found {len(items)} total items in export.")

    # 1. Index attachments (featured images / thumbnails)
    attachments = {}
    for item in items:
        pt_el = item.find(f'{wp_ns}post_type')
        if pt_el is not None and pt_el.text == 'attachment':
            post_id_el = item.find(f'{wp_ns}post_id')
            post_id = post_id_el.text if post_id_el is not None else None
            att_url_el = item.find(f'{wp_ns}attachment_url')
            url = att_url_el.text if att_url_el is not None else None
            if not url:
                guid_el = item.find('guid')
                url = guid_el.text if guid_el is not None else None
            if post_id and url:
                attachments[post_id] = url.strip()

    # 2. Filter blog posts
    posts = [
        item for item in items
        if item.find(f'{wp_ns}post_type') is not None
        and item.find(f'{wp_ns}post_type').text == 'post'
    ]

    print(f"Found {len(posts)} blog posts to convert.\n")

    converted_count = 0
    for idx, post in enumerate(posts, 1):
        # Extract title
        title_el = post.find('title')
        raw_title = title_el.text if title_el is not None and title_el.text else 'Untitled'
        title = html.unescape(raw_title).strip()

        # Extract slug / post_name
        slug_el = post.find(f'{wp_ns}post_name')
        slug = slug_el.text.strip() if slug_el is not None and slug_el.text else ""

        # Extract link
        link_el = post.find('link')
        link = link_el.text.strip() if link_el is not None and link_el.text else ""

        # Fallback for slug
        if not slug and link:
            slug = link.strip('/').split('/')[-1]
        if not slug:
            slug = re.sub(r'[^a-zA-Z0-9]+', '-', title.lower()).strip('-')

        # Extract dates
        post_date_el = post.find(f'{wp_ns}post_date')
        post_date_str = post_date_el.text if post_date_el is not None else None
        pub_date_el = post.find('pubDate')
        pub_date_str = pub_date_el.text if pub_date_el is not None else None
        date_iso = parse_date(post_date_str, pub_date_str)

        # Status & Draft
        status_el = post.find(f'{wp_ns}status')
        status = status_el.text.strip() if status_el is not None and status_el.text else 'publish'
        draft = (status != 'publish')

        # Author
        author_el = post.find(f'{dc_ns}creator')
        author = author_el.text.strip() if author_el is not None and author_el.text else ""
        if author in ('ChrisFeichtner', 'cfe@me.com', 'hello@nocamerabag.com') or not author:
            author = 'Chris Feichtner'

        # Excerpt / Description
        excerpt_el = post.find(f'{excerpt_ns}encoded')
        excerpt = ""
        if excerpt_el is not None and excerpt_el.text:
            excerpt = clean_html_content(excerpt_el.text)
            excerpt = ' '.join(excerpt.split())

        # Categories & Tags
        categories = []
        tags = []
        for cat_el in post.findall('category'):
            domain = cat_el.attrib.get('domain')
            text = cat_el.text.strip() if cat_el.text else ""
            if not text:
                continue
            if domain == 'category':
                if text not in categories:
                    categories.append(text)
            elif domain == 'post_tag':
                if text not in tags:
                    tags.append(text)

        # Featured Thumbnail / Cover Image
        cover_image = None
        for pm in post.findall(f'{wp_ns}postmeta'):
            k = pm.find(f'{wp_ns}meta_key')
            v = pm.find(f'{wp_ns}meta_value')
            if k is not None and k.text == '_thumbnail_id' and v is not None and v.text:
                thumb_id = v.text.strip()
                if thumb_id in attachments:
                    cover_image = attachments[thumb_id]
                break

        # Aliases (Preserve old URLs for Hugo)
        aliases = []
        if link:
            clean_link = '/' + link.strip('/')
            if clean_link not in aliases:
                aliases.append(clean_link)

        # Front-matter dict
        frontmatter = {
            'title': title,
            'date': date_iso,
            'slug': slug,
            'aliases': aliases,
            'draft': draft,
        }

        if author:
            frontmatter['author'] = author
        if categories:
            frontmatter['categories'] = categories
        if tags:
            frontmatter['tags'] = tags
        if excerpt:
            frontmatter['description'] = excerpt
        if cover_image:
            frontmatter['cover'] = {
                'image': cover_image,
                'alt': title,
            }

        # Post Content HTML -> Markdown
        content_el = post.find(f'{content_ns}encoded')
        raw_content = content_el.text if content_el is not None and content_el.text else ""
        body_markdown = clean_html_content(raw_content)

        # Combine Front-Matter and Body
        full_content = dump_frontmatter(frontmatter) + body_markdown + "\n"

        # Output filepath
        filename = f"{slug}.md"
        filepath = os.path.join(output_dir, filename)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(full_content)

        converted_count += 1
        print(f"[{converted_count}/{len(posts)}] Created: {filepath} ({title[:50]})")

    print(f"\nSuccessfully converted {converted_count} blog posts to '{output_dir}/'.")


if __name__ == '__main__':
    xml_path = sys.argv[1] if len(sys.argv) > 1 else "export.xml"
    out_path = sys.argv[2] if len(sys.argv) > 2 else "content/blog"
    convert_export(xml_path, out_path)
