#!/bin/sh
# Publish Lungitz to lungitz.com: re-export the published Webflow site, then deploy.
# Run AFTER publishing in Webflow (the export reads lungitz.webflow.io).
set -e
cd "$(dirname "$0")"
node export.mjs
netlify deploy --prod --dir dist --message "${1:-re-export from Webflow}"
