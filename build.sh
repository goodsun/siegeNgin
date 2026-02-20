#!/bin/bash
# siegeNgin - Build extension zip
cd "$(dirname "$0")"
rm -f app/extension.zip
zip -r app/extension.zip extension/ -x "extension/.*"
echo "🏰 extension.zip updated"
