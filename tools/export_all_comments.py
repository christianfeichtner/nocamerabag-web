#!/usr/bin/env python3
"""
export_all_comments.py

Exports all existing comments from Squarespace/WordPress export and/or live site,
matches them with local Hugo content files to retrieve `page_id`, and generates
a Cloudflare D1 compatible SQL file.

Usage:
    python3 tools/export_all_comments.py
"""

import os
import re
import ssl
import html
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime

SITEMAP_URL = "https://nocamerabag.com/sitemap.xml"
EXPORT_XML = "export.xml"
CONTENT_DIR = "content/blog"
OUTPUT_SQL = "workers/comments-api/blog-comments-2026-09-08.sql"

NAMESPACES = {
    "content": "http://purl.org/rss/1.0/modules/content/",
    "wp": "http://wordpress.org/export/1.2/",
    "dc": "http://purl.org/dc/elements/1.1/",
    "sm": "http://www.sitemaps.org/schemas/sitemap/0.9",
}


def clean_html_content(raw_html: str) -> str:
    """Clean HTML content into plain text with preserved line breaks."""
    if not raw_html:
        return ""
    
    text = raw_html
    # Replace paragraph breaks and line breaks with newline
    text = re.sub(r'</p>\s*<p[^>]*>', '\n\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<p[^>]*>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'</p>', '\n', text, flags=re.IGNORECASE)
    
    # Strip any remaining HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Unescape entities
    text = html.unescape(text)
    
    # Normalize consecutive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def sql_escape(text: str) -> str:
    """Escape single quotes for SQL literals."""
    if text is None:
        return ""
    return text.replace("'", "''")


def fetch_sitemap_urls():
    """Fetch blog post URLs from sitemap.xml."""
    print(f"[*] Fetching sitemap: {SITEMAP_URL}...", flush=True)
    ctx = ssl._create_unverified_context()
    req = urllib.request.Request(
        SITEMAP_URL,
        headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"},
    )
    blog_urls = []
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            xml_data = resp.read()
        root = ET.fromstring(xml_data)
        for loc in root.findall(".//sm:loc", NAMESPACES):
            u = loc.text.strip()
            if "/blog/" in u and not any(
                x in u for x in ["/tag/", "/category/", "/page/", "/tags/", "/categories/"]
            ):
                blog_urls.append(u)
        print(f"[OK] Found {len(blog_urls)} blog URLs in live sitemap.", flush=True)
    except Exception as e:
        print(f"[!] Warning: Could not fetch sitemap directly ({e}). Proceeding with local content.", flush=True)
    return blog_urls


def load_local_posts(content_dir=CONTENT_DIR):
    """
    Scans local markdown files and returns mapping of slugs/filenames to
    frontmatter metadata (page_id, slug, title, filename).
    """
    print(f"[*] Scanning local Hugo content in '{content_dir}'...", flush=True)
    posts = {}
    if not os.path.exists(content_dir):
        print(f"[!] Directory not found: {content_dir}", flush=True)
        return posts

    filenames = [
        f for f in os.listdir(content_dir)
        if f.endswith(".md") and not f.startswith(".") and f != "_index.md"
    ]

    for fname in filenames:
        fpath = os.path.join(content_dir, fname)
        base_name = fname[:-3]
        page_id = base_name
        slug = base_name
        title = ""

        try:
            with open(fpath, "r", encoding="utf-8") as fp:
                first_line = fp.readline()
                if first_line.startswith("---"):
                    fm_lines = []
                    for line in fp:
                        if line.startswith("---"):
                            break
                        fm_lines.append(line)
                    fm_text = "".join(fm_lines)
                    
                    pid_m = re.search(r'^page_id:\s*["\']?([^"\']+)["\']?', fm_text, re.MULTILINE)
                    if pid_m:
                        page_id = pid_m.group(1).strip()

                    title_m = re.search(r'^title:\s*["\']?([^"\']+)["\']?', fm_text, re.MULTILINE)
                    if title_m:
                        title = title_m.group(1).strip()

                    slug_m = re.search(r'^slug:\s*["\']?([^"\']+)["\']?', fm_text, re.MULTILINE)
                    if slug_m:
                        slug = slug_m.group(1).strip()

                    url_m = re.search(r'^url:\s*["\']?([^"\']+)["\']?', fm_text, re.MULTILINE)
                    if url_m:
                        u = url_m.group(1).strip().strip("/")
                        slug = u.split("/")[-1] if "/" in u else u
        except Exception as e:
            print(f"[!] Warning reading {fname}: {e}", flush=True)

        post_info = {
            "filename": fname,
            "base_name": base_name,
            "page_id": page_id,
            "slug": slug,
            "title": title,
        }

        posts[base_name] = post_info
        posts[slug] = post_info
        posts[base_name.lower()] = post_info
        posts[slug.lower()] = post_info
        if title:
            norm_title = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
            posts[norm_title] = post_info

    unique_count = len(set(p['filename'] for p in posts.values()))
    print(f"[OK] Indexed {unique_count} local markdown posts.", flush=True)
    return posts


def parse_comments_from_export(export_path=EXPORT_XML):
    """
    Parses export.xml and extracts all items with comments.
    """
    if not os.path.exists(export_path):
        raise FileNotFoundError(f"{export_path} not found.")

    print(f"[*] Parsing WXR export '{export_path}'...", flush=True)
    tree = ET.parse(export_path)
    root = tree.getroot()
    channel = root.find("channel")
    if channel is None:
        raise ValueError("Invalid export.xml: no channel element found.")

    items_data = []

    for item in channel.findall("item"):
        comments = []
        for c in item.findall("wp:comment", NAMESPACES):
            approved_el = c.find("wp:comment_approved", NAMESPACES)
            approved = approved_el.text.strip() if approved_el is not None and approved_el.text else "0"
            if approved != "1":
                continue

            c_id_el = c.find("wp:comment_id", NAMESPACES)
            c_id = int(c_id_el.text.strip()) if c_id_el is not None and c_id_el.text else None

            parent_el = c.find("wp:comment_parent", NAMESPACES)
            parent_id = int(parent_el.text.strip()) if parent_el is not None and parent_el.text else 0
            if parent_id == 0:
                parent_id = None

            author_el = c.find("wp:comment_author", NAMESPACES)
            author = author_el.text.strip() if author_el is not None and author_el.text else "Anonymous"

            email_el = c.find("wp:comment_author_email", NAMESPACES)
            email = email_el.text.strip() if email_el is not None and email_el.text else "imported@nocamerabag.com"
            if not email:
                email = "imported@nocamerabag.com"

            ip_el = c.find("wp:comment_author_IP", NAMESPACES)
            ip = ip_el.text.strip() if ip_el is not None and ip_el.text else "127.0.0.1"

            content_el = c.find("wp:comment_content", NAMESPACES)
            raw_content = content_el.text if content_el is not None and content_el.text else ""
            clean_content = clean_html_content(raw_content)

            date_el = c.find("wp:comment_date_gmt", NAMESPACES)
            if date_el is None or not date_el.text or date_el.text == "0000-00-00 00:00:00":
                date_el = c.find("wp:comment_date", NAMESPACES)
            created_at = date_el.text.strip() if date_el is not None and date_el.text else datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

            if c_id and clean_content:
                comments.append({
                    "orig_id": c_id,
                    "orig_parent_id": parent_id,
                    "author_name": author,
                    "author_email": email,
                    "author_ip": ip,
                    "content": clean_content,
                    "status": "approved",
                    "created_at": created_at,
                })

        if comments:
            title_el = item.find("title")
            title = title_el.text.strip() if title_el is not None and title_el.text else ""

            link_el = item.find("link")
            link = link_el.text.strip() if link_el is not None and link_el.text else ""

            post_name_el = item.find("wp:post_name", NAMESPACES)
            post_name = post_name_el.text.strip() if post_name_el is not None and post_name_el.text else ""

            derived_slug = post_name
            if not derived_slug and link:
                derived_slug = link.rstrip("/").split("/")[-1]

            items_data.append({
                "title": title,
                "link": link,
                "slug": derived_slug,
                "comments": comments,
            })

    print(f"[OK] Found {len(items_data)} posts with approved comments in export.xml.", flush=True)
    return items_data


def generate_migration_sql():
    # 1. Fetch live sitemap
    sitemap_urls = fetch_sitemap_urls()

    # 2. Index local markdown files
    local_posts = load_local_posts(CONTENT_DIR)

    # 3. Parse export.xml
    export_items = parse_comments_from_export(EXPORT_XML)

    # 4. Match items and build topological comment tree
    os.makedirs(os.path.dirname(OUTPUT_SQL), exist_ok=True)

    matched_posts_count = 0
    unmatched_posts_count = 0
    total_comments_count = 0
    top_level_count = 0
    reply_count = 0

    sql_statements = []
    sql_statements.append("-- =============================================================================")
    sql_statements.append(f"-- Blog Comments Migration for Cloudflare D1")
    sql_statements.append(f"-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    sql_statements.append(f"-- Target table: comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)")
    sql_statements.append("-- =============================================================================\n")

    current_new_id = 1

    for item in export_items:
        slug = item["slug"]
        title = item["title"]
        raw_link = item["link"]

        # Match local post
        matched_local = None
        for candidate in [slug, slug.lower(), raw_link.rstrip("/").split("/")[-1]]:
            if candidate and candidate in local_posts:
                matched_local = local_posts[candidate]
                break

        if not matched_local and title:
            norm_title = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
            if norm_title in local_posts:
                matched_local = local_posts[norm_title]

        if matched_local:
            page_id = matched_local["page_id"]
            matched_posts_count += 1
        else:
            page_id = slug if slug else raw_link.rstrip("/").split("/")[-1]
            unmatched_posts_count += 1
            print(f"[!] Notice: Post '{title}' ({slug}) not in local content/blog. Fallback page_id='{page_id}'.", flush=True)

        page_url = f"https://nocamerabag.com/blog/{slug}" if slug else raw_link

        post_comments = item["comments"]
        post_comments.sort(key=lambda x: (x["created_at"], x["orig_id"]))

        orig_to_new_id = {}
        all_orig_ids = set(x["orig_id"] for x in post_comments)
        top_levels = [c for c in post_comments if c["orig_parent_id"] is None or c["orig_parent_id"] not in all_orig_ids]

        def get_children(parent_orig_id):
            return [c for c in post_comments if c["orig_parent_id"] == parent_orig_id]

        ordered_comments = []
        visited = set()

        def add_comment_and_subtree(c):
            if c["orig_id"] in visited:
                return
            visited.add(c["orig_id"])
            ordered_comments.append(c)
            for child in get_children(c["orig_id"]):
                add_comment_and_subtree(child)

        for tl in top_levels:
            add_comment_and_subtree(tl)

        for rem in post_comments:
            if rem["orig_id"] not in visited:
                add_comment_and_subtree(rem)

        sql_statements.append(f"-- -----------------------------------------------------------------------------")
        sql_statements.append(f"-- Post: {title or slug}")
        sql_statements.append(f"-- Page ID: {page_id} | Page URL: {page_url}")
        sql_statements.append(f"-- Comments count: {len(ordered_comments)}")
        sql_statements.append(f"-- -----------------------------------------------------------------------------")

        for c in ordered_comments:
            new_id = current_new_id
            current_new_id += 1
            orig_to_new_id[c["orig_id"]] = new_id

            if c["orig_parent_id"] is not None and c["orig_parent_id"] in orig_to_new_id:
                new_parent_id = str(orig_to_new_id[c["orig_parent_id"]])
                reply_count += 1
            else:
                new_parent_id = "NULL"
                top_level_count += 1

            total_comments_count += 1

            esc_page_id = sql_escape(page_id)
            esc_page_url = sql_escape(page_url)
            esc_author = sql_escape(c["author_name"])
            esc_email = sql_escape(c["author_email"])
            esc_ip = sql_escape(c["author_ip"])
            esc_content = sql_escape(c["content"])
            created_at = c["created_at"]

            stmt = (
                f"INSERT INTO comments (id, parent_id, page_id, page_url, author_name, author_email, author_ip, content, status, created_at)\n"
                f"VALUES ({new_id}, {new_parent_id}, '{esc_page_id}', '{esc_page_url}', '{esc_author}', '{esc_email}', '{esc_ip}', '{esc_content}', 'approved', '{created_at}');\n"
            )
            sql_statements.append(stmt)

    with open(OUTPUT_SQL, "w", encoding="utf-8") as fp:
        fp.write("\n".join(sql_statements))

    print("\n" + "=" * 65, flush=True)
    print("MIGRATION STATISTICS", flush=True)
    print("=" * 65, flush=True)
    print(f"  Live sitemap scanned articles : {len(sitemap_urls)}", flush=True)
    print(f"  Local posts indexed           : {len(set(p['filename'] for p in local_posts.values()))}", flush=True)
    print(f"  Posts with comments           : {len(export_items)}", flush=True)
    print(f"  Matched local articles        : {matched_posts_count}", flush=True)
    print(f"  Fallback un-matched articles  : {unmatched_posts_count}", flush=True)
    print(f"  Total comments exported       : {total_comments_count}", flush=True)
    print(f"    - Top-Level comments        : {top_level_count}", flush=True)
    print(f"    - Thread Replies            : {reply_count}", flush=True)
    print(f"  Output SQL file               : {OUTPUT_SQL}", flush=True)
    print("=" * 65, flush=True)


if __name__ == "__main__":
    generate_migration_sql()
