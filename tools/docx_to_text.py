"""Convert .docx exam papers to plain text so the term list can be curated from them.

Usage: python tools/docx_to_text.py <input_dir> <output_dir>
"""

import pathlib
import re
import sys
import zipfile

PARAGRAPH_BREAK = "</w:p>"
LINE_BREAK = "<w:br"
TAB = "<w:tab"


def extract_docx_text(docx_path: pathlib.Path) -> str:
    """Return the concatenated text of every paragraph in a .docx file."""
    with zipfile.ZipFile(docx_path) as archive:
        document_xml = archive.read("word/document.xml").decode("utf-8")
    with_breaks = document_xml.replace(PARAGRAPH_BREAK, "\n")
    with_breaks = with_breaks.replace(LINE_BREAK, "\n")
    with_breaks = with_breaks.replace(TAB, "\t")
    without_tags = re.sub(r"<[^>]+>", "", with_breaks)
    without_entities = (
        without_tags.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    )
    collapsed = re.sub(r"\n{3,}", "\n\n", without_entities)
    return collapsed.strip()


def main() -> int:
    """Convert every .docx in the input directory into a sibling .txt file."""
    if len(sys.argv) != 3:
        print("usage: python tools/docx_to_text.py <input_dir> <output_dir>")
        return 2
    input_dir = pathlib.Path(sys.argv[1])
    output_dir = pathlib.Path(sys.argv[2])
    output_dir.mkdir(parents=True, exist_ok=True)
    docx_files = sorted(input_dir.glob("*.docx"))
    if not docx_files:
        print(f"no .docx files found in {input_dir}")
        return 1
    for docx_path in docx_files:
        text = extract_docx_text(docx_path)
        target = output_dir / f"{docx_path.stem}.txt"
        target.write_text(text, encoding="utf-8")
        print(f"{docx_path.name} -> {target.name} ({len(text)} chars)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
