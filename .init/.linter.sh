#!/bin/bash
cd /home/kavia/workspace/code-generation/chatassist-qa-platform-3157-3167/qanda_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

