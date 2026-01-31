#!/usr/bin/env bash
# Run on EC2 after syncing dist/ and package.json. Installs prod deps and restarts the app.

set -e
cd "$(dirname "$0")/.."
APP_NAME="${APP_NAME:-recharge-earn-be}"

echo "Installing production dependencies..."
npm ci --omit=dev 2>/dev/null || npm install --omit=dev

echo "Restarting application..."
if command -v pm2 &>/dev/null; then
  pm2 restart "$APP_NAME" --update-env 2>/dev/null || pm2 start dist/app.js --name "$APP_NAME"
else
  echo "PM2 not found. Restart your process manually, e.g.:"
  echo "  systemctl restart $APP_NAME"
  echo "  or: nohup node dist/app.js &"
fi

echo "Deploy finished."
