#!/usr/bin/env python3
"""
generate_page_ids.py

Generates unique 10-character NanoIDs for Hugo blog posts and inserts them
into the YAML frontmatter under the field `page_id`.

Usage:
    python3 tools/generate_page_ids.py [--dry-run] [--target-dir content/blog]
"""

import os
import re
import sys
import secrets
import argparse

# Standard URL-safe NanoID alphabet (64 characters)
NANOID_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"
ID_LENGTH = 10


def generate_nanoid(length=ID_LENGTH, existing_ids=None):
    """Generate a cryptographically secure, unique NanoID."""
    while True:
        nid = "".join(secrets.choice(NANOID_ALPHABET) for _ in range(length))
        if existing_ids is None or nid not in existing_ids:
            if existing_ids is not None:
                existing_ids.add(nid)
            return nid


def parse_frontmatter(content):
    """
    Splits markdown content into (prefix, frontmatter, body).
    Returns (None, None, content) if no valid YAML frontmatter is found.
    """
    if not content.startswith("---"):
        return None, None, content

    match = re.search(r"^---\s*$", content[3:], flags=re.MULTILINE)
    if not match:
        return None, None, content

    end_idx = 3 + match.start()
    frontmatter = content[3:end_idx].strip("\r\n")
    body = content[end_idx + len(match.group(0)) :]
    return "---", frontmatter, body


def insert_page_id(frontmatter, page_id):
    """
    Inserts `page_id: "<id>"` into the YAML frontmatter.
    Places it cleanly after `date:`, `title:`, or at the beginning.
    """
    lines = frontmatter.splitlines()
    new_line = f'page_id: "{page_id}"'

    for line in lines:
        if re.match(r"^page_id\s*:", line.strip()):
            return frontmatter

    insert_idx = -1

    for idx, line in enumerate(lines):
        if re.match(r"^date\s*:", line):
            insert_idx = idx + 1
            break

    if insert_idx == -1:
        for idx, line in enumerate(lines):
            if re.match(r"^title\s*:", line):
                insert_idx = idx + 1
                break

    if insert_idx == -1:
        insert_idx = 0

    lines.insert(insert_idx, new_line)
    return "\n".join(lines)


def process_directory(target_dir="content/blog", dry_run=False):
    print(f"[*] Processing directory: {target_dir}", flush=True)

    if not os.path.exists(target_dir):
        print(f"[!] Directory not found: {target_dir}", flush=True)
        return

    filenames = sorted([
        f for f in os.listdir(target_dir)
        if f.endswith(".md") and not f.startswith(".") and f != "_index.md"
    ])

    print(f"[*] Found {len(filenames)} markdown posts in {target_dir}", flush=True)

    existing_ids = set()
    files_to_update = []
    skipped_count = 0
    error_count = 0

    # 1. Read files and check existing page_ids
    for f in filenames:
        fpath = os.path.join(target_dir, f)
        try:
            sz = os.path.getsize(fpath)
            if sz == 0:
                print(f"[!] Skipping empty 0-byte file: {f}", flush=True)
                skipped_count += 1
                continue

            with open(fpath, "r", encoding="utf-8") as fp:
                content = fp.read()

            delimiter, frontmatter, body = parse_frontmatter(content)
            if not frontmatter:
                print(f"[!] Warning: No YAML frontmatter found in {f}", flush=True)
                error_count += 1
                continue

            has_page_id = False
            for line in frontmatter.splitlines():
                m = re.match(r'^page_id\s*:\s*["\']?([^"\']+)["\']?', line.strip())
                if m:
                    existing_ids.add(m.group(1))
                    has_page_id = True
                    break

            if has_page_id:
                skipped_count += 1
            else:
                files_to_update.append((fpath, f, frontmatter, body))

        except Exception as e:
            print(f"[ERROR] Failed reading {f}: {e}", flush=True)
            error_count += 1

    print(f"[*] Posts already having page_id: {skipped_count}", flush=True)
    print(f"[*] Posts requiring new page_id: {len(files_to_update)}", flush=True)

    # 2. Update files
    updated_count = 0
    for fpath, fname, frontmatter, body in files_to_update:
        new_id = generate_nanoid(ID_LENGTH, existing_ids)
        updated_fm = insert_page_id(frontmatter, new_id)
        new_content = f"---\n{updated_fm}\n---{body}"

        if dry_run:
            print(f"[DRY-RUN] page_id: \"{new_id}\" -> {fname}", flush=True)
            updated_count += 1
        else:
            try:
                with open(fpath, "w", encoding="utf-8") as fp:
                    fp.write(new_content)
                print(f"[OK] Added page_id: \"{new_id}\" -> {fname}", flush=True)
                updated_count += 1
            except Exception as e:
                print(f"[ERROR] Failed writing {fname}: {e}", flush=True)
                error_count += 1

    mode_str = "[DRY-RUN SUMMARY]" if dry_run else "[MIGRATION SUMMARY]"
    print("\n" + "=" * 50, flush=True)
    print(mode_str, flush=True)
    print(f"  Target directory : {target_dir}", flush=True)
    print(f"  Total posts      : {len(filenames)}", flush=True)
    print(f"  Updated          : {updated_count}", flush=True)
    print(f"  Already had ID   : {skipped_count}", flush=True)
    print(f"  Errors/Warnings  : {error_count}", flush=True)
    print("=" * 50, flush=True)


def main():
    parser = argparse.ArgumentParser(description="Generate and insert NanoIDs into Hugo markdown frontmatter.")
    parser.add_argument(
        "--target-dir",
        default="content/blog",
        help="Directory containing markdown posts to process (default: content/blog)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate the migration without writing changes to files.",
    )

    args = parser.parse_args()
    process_directory(args.target_dir, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
