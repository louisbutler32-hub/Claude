#!/usr/bin/env bash
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
[ -f .env ] || { cp .env.example .env; echo "Created .env - add your ANTHROPIC_API_KEY, then run again."; exit 0; }
node server/index.js
