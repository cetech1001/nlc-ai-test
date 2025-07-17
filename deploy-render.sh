#!/usr/bin/env bash
set -euo pipefail

# ← replace with your Docker Hub username
DOCKERHUB_USER="cetech"

# ← replace with your Render API key
RENDER_API_KEY="${RENDER_API_KEY:-}"

# Try to load from .env file if key not set
if [ -z "$RENDER_API_KEY" ] && [ -f ".env" ]; then
  echo "📁 Loading environment variables from .env file..."
  set -a  # automatically export all variables
  source .env
  set +a
fi

if [ -z "$RENDER_API_KEY" ]; then
  echo "❌ Error: RENDER_API_KEY not set"
  echo "Options:"
  echo "  1. Set environment variable: export RENDER_API_KEY='your-key'"
  echo "  2. Create .env file with: RENDER_API_KEY=your-key"
  echo "  3. Pass inline: RENDER_API_KEY='your-key' ./deploy-render.sh"
  echo ""
  echo "Get your API key from: https://dashboard.render.com/account/api-keys"
  exit 1
fi

# ← map your services to their Render service IDs
declare -A SERVICE_IDS=(
  ["admin"]="srv-d18bvh0gjchc73ep13tg"  # ← replace with actual service ID
  # ["web"]="srv-d18avebuibrs73dv2ae0"
  # ["api"]="srv-d1mege2li9vc739f97rg"
  # ["coach"]="srv-d18bujgdl3ps73bujg9g"
)

# Function to trigger deployment
deploy_service() {
  local service=$1
  local service_id=$2
  local image="$DOCKERHUB_USER/nlc-ai-$service:latest"

  echo "=== Deploying $service (ID: $service_id) with image $image ==="

  # Trigger deployment via Render API
  response=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"clearCache\": \"clear\"}" \
    "https://api.render.com/v1/services/$service_id/deploys")

  # Split response and http code (macOS-compatible)
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')  # Remove last line instead of head -n -1

  if [ "$http_code" -eq 201 ]; then
    deploy_id=$(echo "$body" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo "✅ Deployment started for $service (Deploy ID: $deploy_id)"
  else
    echo "❌ Failed to deploy $service (HTTP $http_code)"
    echo "$body"
    return 1
  fi
}

# Function to check deployment status
check_deployment() {
  local service=$1
  local service_id=$2

  echo "=== Checking latest deployment status for $service ==="

  response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    "https://api.render.com/v1/services/$service_id/deploys?limit=1")

  # Split response and http code (macOS-compatible)
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')  # Remove last line instead of head -n -1

  if [ "$http_code" -eq 200 ]; then
    status=$(echo "$body" | grep -o '"status":"[^"]*' | cut -d'"' -f4 | head -n1)
    echo "📊 $service status: $status"
  else
    echo "❌ Failed to check status for $service"
  fi
}

# Deploy all services
echo "🚀 Starting deployment to Render..."
echo ""

failed_services=()

# Check if we have any services to deploy
if [ ${#SERVICE_IDS[@]} -eq 0 ]; then
  echo "❌ No services configured for deployment"
  exit 1
fi

for service in "${!SERVICE_IDS[@]}"; do
  service_id="${SERVICE_IDS[$service]}"

  if deploy_service "$service" "$service_id"; then
    echo ""
  else
    failed_services+=("$service")
    echo ""
  fi
done

# Wait a bit for deployments to start
echo "⏳ Waiting 10 seconds for deployments to initialize..."
sleep 10

# Check status of all deployments
echo ""
echo "📊 Checking deployment status..."
for service in "${!SERVICE_IDS[@]}"; do
  service_id="${SERVICE_IDS[$service]}"
  check_deployment "$service" "$service_id"
done

# Summary
echo ""
if [ ${#failed_services[@]} -eq 0 ]; then
  echo "✅ All deployments initiated successfully!"
  echo "💡 Monitor progress at: https://dashboard.render.com/"
else
  echo "❌ Some deployments failed:"
  printf '%s\n' "${failed_services[@]}"
  exit 1
fi
