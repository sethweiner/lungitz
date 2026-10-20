#!/bin/sh
# Build the double-click offline copy of Lungitz into static-site/offline/
# (see README.md "Offline copy"). Run AFTER publishing in Webflow, like publish.sh.
# Until v94 is promoted, the offline copy ships sandbox/v94.js (the first build with
# the file:// route helpers); after the promote, drop the LZ_SCRIPT line.
set -e
cd "$(dirname "$0")"
LZ_OFFLINE=1 LZ_SCRIPT=../sandbox/v94.js node export.mjs
