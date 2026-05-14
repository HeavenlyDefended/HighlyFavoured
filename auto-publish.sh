#!/bin/bash
cd ~/automaton

# Generate products
node src/generateProduct.js batch

# Publish newest ebook
LATEST_EBOOK=$(ls -t output/ebooks/*.md | head -1)
if [ -f "$LATEST_EBOOK" ]; then
    node src/publishToGumroad.js "$LATEST_EBOOK" "Daily AI Ebook" "Fresh AI-generated content" 4.99
fi

# Publish newest HTML tool
LATEST_HTML=$(ls -t output/web-tools/*.html | head -1)
if [ -f "$LATEST_HTML" ]; then
    node src/publishToGumroad.js "$LATEST_HTML" "Daily AI Tool" "Interactive web tool" 9.99
fi

echo "✅ Auto-publish completed at $(date)"
