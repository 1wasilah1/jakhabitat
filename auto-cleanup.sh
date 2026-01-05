#!/bin/bash

# Auto cleanup script
JAKARTA_REPO="https://sourcecode.jakarta.go.id/dprkp-pusdatin/pusdatin-team-si/galeri-huni/main.git"

# Remove folders
rm -rf server/
rm -rf pages/

# Git operations
git add .
git commit -m "Auto cleanup: Remove server and pages folders"

# Push to Jakarta repo
git remote add jakarta $JAKARTA_REPO 2>/dev/null || true
git push jakarta main --force

echo "Cleanup and push completed"