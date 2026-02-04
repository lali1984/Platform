#!/bin/sh
if wget -q -O- http://localhost:9100/metrics > /dev/null 2>&1; then
  exit 0
else
  exit 1
fi
