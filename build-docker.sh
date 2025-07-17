#!/usr/bin/env bash
set -euo pipefail

# ← replace with your Docker Hub username
DOCKERHUB_USER="cetech"

# Build-time environment variables
# Set defaults or load from environment/file
NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-}"
NEXT_PUBLIC_ENV="${NEXT_PUBLIC_ENV:-production}"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:-}"

# Load environment-specific file
ENV_FILE=".env.${ENVIRONMENT:-production}"

# Try to load from .env file if variables not set
if [ -f "$ENV_FILE" ]; then
  echo "📁 Loading environment variables from .env file..."
  set -a  # automatically export all variables
  source .env
  set +a
fi

# Validate required variables
if [ -z "$NEXT_PUBLIC_API_URL" ]; then
  echo "❌ Error: NEXT_PUBLIC_API_URL not set"
  echo "Set it via environment variable or .env file"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" ]; then
  echo "❌ Error: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not set"
  echo "Set it via environment variable or .env file"
  exit 1
fi

# ← list the directories/services you want to build
SERVICES=(
#  web
#  api
  admin
#  coach
)

for SERVICE in "${SERVICES[@]}"; do
  IMAGE="$DOCKERHUB_USER/nlc-ai-$SERVICE:latest"
  CONTEXT="./apps/$SERVICE"

  echo "=== Building $IMAGE from $CONTEXT ==="
  echo "Using API URL: $NEXT_PUBLIC_API_URL"
  echo "Using ENV: $NEXT_PUBLIC_ENV"

  docker buildx build \
    --platform "linux/amd64" \
    --file "$CONTEXT/Dockerfile" \
    --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
    --build-arg NEXT_PUBLIC_ENV="$NEXT_PUBLIC_ENV" \
    --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" \
    --tag  "$IMAGE" \
    "."

  echo "=== Pushing $IMAGE ==="
  docker push "$IMAGE"
done

echo "✅ All done!"
