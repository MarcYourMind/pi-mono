#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check for --no-env flag
NO_ENV=false
NO_OLLAMA=false
NO_GROQ=false
ARGS=()
HAS_PROVIDER=false

for arg in "$@"; do
  if [[ "$arg" == "--no-env" ]]; then
    NO_ENV=true
  elif [[ "$arg" == "--no-ollama" ]]; then
    NO_OLLAMA=true
  elif [[ "$arg" == "--no-groq" ]]; then
    NO_GROQ=true
  elif [[ "$arg" == "--provider" ]]; then
    HAS_PROVIDER=true
    ARGS+=("$arg")
  else
    ARGS+=("$arg")
  fi
done

if [[ "$NO_ENV" == "true" ]]; then
  # Unset API keys (see packages/ai/src/env-api-keys.ts)
  unset ANTHROPIC_API_KEY
  unset ANTHROPIC_OAUTH_TOKEN
  unset OPENAI_API_KEY
  unset GEMINI_API_KEY
  unset GROQ_API_KEY
  unset CEREBRAS_API_KEY
  unset XAI_API_KEY
  unset OPENROUTER_API_KEY
  unset ZAI_API_KEY
  unset MISTRAL_API_KEY
  unset MINIMAX_API_KEY
  unset MINIMAX_CN_API_KEY
  unset AI_GATEWAY_API_KEY
  unset OPENCODE_API_KEY
  unset COPILOT_GITHUB_TOKEN
  unset GH_TOKEN
  unset GITHUB_TOKEN
  unset GOOGLE_APPLICATION_CREDENTIALS
  unset GOOGLE_CLOUD_PROJECT
  unset GCLOUD_PROJECT
  unset GOOGLE_CLOUD_LOCATION
  unset AWS_PROFILE
  unset AWS_ACCESS_KEY_ID
  unset AWS_SECRET_ACCESS_KEY
  unset AWS_SESSION_TOKEN
  unset AWS_REGION
  unset AWS_DEFAULT_REGION
  unset AWS_BEARER_TOKEN_BEDROCK
  unset AWS_CONTAINER_CREDENTIALS_RELATIVE_URI
  unset AWS_CONTAINER_CREDENTIALS_FULL_URI
  unset AWS_WEB_IDENTITY_TOKEN_FILE
  unset AZURE_OPENAI_API_KEY
  unset AZURE_OPENAI_BASE_URL
  unset AZURE_OPENAI_RESOURCE_NAME
  echo "Running without API keys..."
fi

# Setup local models (Ollama + Groq configs)
bash "${SCRIPT_DIR}/setup-ollama.sh" || true

# If no provider specified, auto-detect best available
if [[ "$HAS_PROVIDER" != "true" ]]; then
  GROQ_AVAILABLE=false
  OLLAMA_AVAILABLE=false
  
  # Check if Groq API key is set
  if [[ "$NO_GROQ" != "true" ]] && [[ -n "${GROQ_API_KEY:-}" ]]; then
    GROQ_AVAILABLE=true
  fi
  
  # Check if Ollama server is running
  if [[ "$NO_OLLAMA" != "true" ]] && curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    OLLAMA_AVAILABLE=true
  fi
  
  # Select best available option
  if [[ "$GROQ_AVAILABLE" == "true" ]]; then
    echo "Groq API detected - using Llama 3.3 70B"
    ARGS+=("--provider" "groq" "--model" "llama-3.3-70b-versatile")
  elif [[ "$OLLAMA_AVAILABLE" == "true" ]]; then
    echo "Ollama detected - using Mistral 7B"
    ARGS+=("--provider" "ollama" "--model" "mistral")
  fi
fi

npx tsx "$SCRIPT_DIR/packages/coding-agent/src/cli.ts" ${ARGS[@]+"${ARGS[@]}"}

