#!/bin/bash
set -euo pipefail

export KNOWLEDGE_VERSION=$(git describe --tags --dirty --always)
export FRONTEND_CONTAINER="$DOSTACK_REGISTRY/$DOSTACK_PREFIX/opensecret-frontend:$DOSTACK_TAG"

# apt-get update && apt-get install -y wget gnupg2 unzip git
# wget -O- https://deb.nodesource.com/setup_8.x | bash  # security what?
# apt-get install -y nodejs
# npm install -g npm@5.5.1
# npm install --global bower@1.3
# echo '{ "allow_root": true }' > ~/.bowerrc
# npm install && npm install inject-loader expose-loader scripts-loader

# npm run build
# pushd dist
docker run --rm "$FRONTEND_CONTAINER" tar -j -C /app -c -O dist/ > ./release-dist-${KNOWLEDGE_VERSION}.tar.gz
docker image rm "$FRONTEND_CONTAINER"
#tar czvf "../release-dist-${KNOWLEDGE_VERSION}.tar.gz" ./*
