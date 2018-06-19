#!/usr/bin/with-contenv bash
# ==============================================================================
#
# Community Hass.io Add-ons: Example
#
# Example add-on for Hass.io.
# This add-on displays a random quote every X seconds.
#
# ==============================================================================
set -o errexit  # Exit script when a command exits with non-zero status
set -o errtrace # Exit on error inside any functions or sub-shells
set -o nounset  # Exit script on use of an undefined variable
set -o pipefail # Return exit status of the last command in the pipe that failed

# shellcheck disable=SC1091
source /usr/lib/hassio-addons/base.sh

# ------------------------------------------------------------------------------
# Get a random quote from quotationspage.com
#
# Arguments:
#   None
# Returns:
#   String with the quote
# ------------------------------------------------------------------------------
cp 
pm2 status
npm install /usr/bin/sonoff
echo "Sonoff Server Start"
pm2 start /usr/bin/sonoff/sonoff.server.js
pm2 logs sonoff.server

