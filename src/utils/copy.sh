#!/bin/sh
cd /Users/zj/code/node-blog/origin-blog/logs
cp access.log $(date +%Y-%m-%d).access.log
echo "" > access.log
