#!/usr/bin/env bash
# Downloads the WT Vehicle Data SQLite database from GitHub releases
# Source: https://github.com/Sgambe33/WT-Vehicle-Data-Extract

set -euo pipefail

RELEASE_TAG="2.51.0.17"
DOWNLOAD_URL="https://github.com/Sgambe33/WT-Vehicle-Data-Extract/releases/download/${RELEASE_TAG}/fulldump.zip"
DATA_DIR="$(cd "$(dirname "$0")/.." && pwd)/data"
ZIP_PATH="${DATA_DIR}/fulldump.zip"
DB_PATH="${DATA_DIR}/vehiclesdb.sqlite3"

mkdir -p "$DATA_DIR"

if [ -f "$DB_PATH" ]; then
  echo "Database already exists at ${DB_PATH}"
  echo "Delete it first if you want to re-download."
  exit 0
fi

echo "Downloading fulldump.zip from release ${RELEASE_TAG}..."
curl -L --progress-bar -o "$ZIP_PATH" "$DOWNLOAD_URL"

echo "Extracting vehiclesdb.sqlite3..."
unzip -o "$ZIP_PATH" vehiclesdb.sqlite3 -d "$DATA_DIR"

echo "Cleaning up zip..."
rm -f "$ZIP_PATH"

echo "Done! Database saved to ${DB_PATH}"
ls -lh "$DB_PATH"
