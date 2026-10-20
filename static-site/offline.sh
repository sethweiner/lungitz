#!/bin/sh
# Build the double-click offline copy of Lungitz into static-site/offline/
# (see README.md "Offline copy"). Run AFTER publishing in Webflow, like publish.sh.
# Ships the production script (v94+ carries the file:// route helpers).
set -e
cd "$(dirname "$0")"
LZ_OFFLINE=1 node export.mjs
