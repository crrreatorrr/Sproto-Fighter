#!/bin/zsh
# Double-click in Finder. Runs only on this Mac; keep this Terminal window open.
cd -- "${0:A:h}" || exit 1
GAME_URL='http://127.0.0.1:5173/'
if /usr/bin/curl -fsS --max-time 2 "$GAME_URL" | /usr/bin/grep -q 'Sproto Arena'; then
  print 'Sproto Arena is already running.'
  /usr/bin/open "$GAME_URL"
  exit 0
fi
GAME_NODE="$(command -v node 2>/dev/null)"
if [[ -z "$GAME_NODE" && -x "$HOME/.local/bin/node" ]]; then
  GAME_NODE="$HOME/.local/bin/node"
fi
if [[ -z "$GAME_NODE" ]]; then
  print 'Node.js was not found. Install Node.js 22+, then run this launcher again.'
  read '?Press Return to close.'
  exit 1
fi
print 'Starting Sproto Arena at http://127.0.0.1:5173/'
print 'Keep this window open while playing. Control-C stops the server.'
"$GAME_NODE" node_modules/vite/bin/vite.js . --host 127.0.0.1 --port 5173 --strictPort --open
if [[ $? -ne 0 ]]; then
  print 'Startup failed. Check the message above (port 5173 may already be occupied).'
  read '?Press Return to close.'
fi
