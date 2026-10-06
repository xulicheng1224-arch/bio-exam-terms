"""Inserts classes.dex at the root of an APK.

Git for Windows ships no zip binary, and d8 writes the dex to its own output
directory rather than into the archive, so the dex is merged in here.

Usage: python tools/apk_add_dex.py <apk_path> <dex_path>
"""

import shutil
import sys
import zipfile
from pathlib import Path

DEX_ENTRY_NAME = "classes.dex"


def add_dex(apk_path: Path, dex_path: Path) -> None:
    """Rewrite the APK with classes.dex included, replacing any previous entry."""
    if not apk_path.is_file():
        raise SystemExit(f"APK not found: {apk_path}")
    if not dex_path.is_file():
        raise SystemExit(f"dex not found: {dex_path}")

    temp_path = apk_path.with_suffix(apk_path.suffix + ".tmp")
    with zipfile.ZipFile(apk_path, "r") as source:
        entries = [(item, source.read(item.filename)) for item in source.infolist()]

    with zipfile.ZipFile(temp_path, "w", zipfile.ZIP_DEFLATED) as target:
        for item, data in entries:
            if item.filename == DEX_ENTRY_NAME:
                continue
            target.writestr(item, data)
        target.write(dex_path, DEX_ENTRY_NAME)

    shutil.move(str(temp_path), str(apk_path))
    print(f"added {DEX_ENTRY_NAME} to {apk_path.name}")


def main() -> int:
    """Entry point."""
    if len(sys.argv) != 3:
        print("usage: python tools/apk_add_dex.py <apk_path> <dex_path>")
        return 2
    add_dex(Path(sys.argv[1]), Path(sys.argv[2]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
