#!/bin/bash -x
# Stop all node services
pkill "^node"
pkill "^ng "
pkill "^npm "
# This should be a replaced by a system-unit (one for every service),
# and every service should have its log, and log rotation.
# But for PoC this should suffice.
