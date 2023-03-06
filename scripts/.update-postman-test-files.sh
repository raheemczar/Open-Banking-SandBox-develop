#!/usr/bin/env bash
#Remove oldest one files from developer-portal.
#Add new files
set -e
echo "Delete previous zip file"
rm -f developer-portal-ui/src/assets/files/postman-tests.zip
zip -j developer-portal-ui/src/assets/files/postman-tests.zip postman/postman_collection.json postman/postman_environment_local.json postman/postman_global_variable.json

