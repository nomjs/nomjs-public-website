#!/bin/bash

echo "Current directory: "$(pwd)""
ls -alsrth
cd public && find . -type f -exec curl -u ${AZURE_WA_SITE}\\${AZURE_WA_USERNAME}:${AZURE_WA_PASSWORD} --ftp-create-dirs -T {} ${AZURE_WA_FTP_SITE}/{} \;
