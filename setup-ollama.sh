#!/usr/bin/env bash
set -euo pipefail

# Setup script to configure Ollama and Groq models for pi
# Merges ollama-models.json and groq-models.json into ~/.pi/agent/models.json

PI_CONFIG_DIR="${HOME}/.pi"
PI_AGENT_DIR="${PI_CONFIG_DIR}/agent"
MODELS_JSON="${PI_AGENT_DIR}/models.json"

# Create directories if they don't exist
mkdir -p "${PI_AGENT_DIR}"

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OLLAMA_MODELS="${SCRIPT_DIR}/packages/coding-agent/ollama-models.json"
GROQ_MODELS="${SCRIPT_DIR}/packages/coding-agent/groq-models.json"

# Function to merge two JSON provider configs
create_merged_config() {
  # Start with empty providers object
  cat > "${MODELS_JSON}" << 'EOF'
{"providers":{}}
EOF

  # If jq is available, use it for proper JSON merging
  if command -v jq &> /dev/null; then
    # Build up the merged config
    local config='{"providers":{}}'
    
    if [[ -f "${OLLAMA_MODELS}" ]]; then
      config=$(echo "$config" | jq --slurpfile ollama "${OLLAMA_MODELS}" '.providers += $ollama[0].providers')
    fi
    
    if [[ -f "${GROQ_MODELS}" ]]; then
      config=$(echo "$config" | jq --slurpfile groq "${GROQ_MODELS}" '.providers += $groq[0].providers')
    fi
    
    echo "$config" | jq '.' > "${MODELS_JSON}"
  else
    # Fallback without jq: use Python if available, otherwise do simple concatenation
    if command -v python3 &> /dev/null; then
      python3 << 'PYTHON_EOF'
import json
import sys
import os

merged = {"providers": {}}

ollama_file = os.environ.get("OLLAMA_MODELS")
groq_file = os.environ.get("GROQ_MODELS")

if ollama_file and os.path.exists(ollama_file):
    with open(ollama_file) as f:
        ollama_config = json.load(f)
        merged["providers"].update(ollama_config.get("providers", {}))

if groq_file and os.path.exists(groq_file):
    with open(groq_file) as f:
        groq_config = json.load(f)
        merged["providers"].update(groq_config.get("providers", {}))

models_json = os.environ.get("MODELS_JSON")
with open(models_json, 'w') as f:
    json.dump(merged, f, indent=2)

PYTHON_EOF
    elif [[ -f "${OLLAMA_MODELS}" ]]; then
      # Simple fallback: just use Ollama config if available
      cp "${OLLAMA_MODELS}" "${MODELS_JSON}"
    fi
  fi
}

# Only regenerate if source files have changed
if [[ -f "${MODELS_JSON}" ]]; then
  NEEDS_UPDATE=false
  
  if [[ -f "${OLLAMA_MODELS}" ]]; then
    if [[ "${OLLAMA_MODELS}" -nt "${MODELS_JSON}" ]]; then
      NEEDS_UPDATE=true
    fi
  fi
  
  if [[ -f "${GROQ_MODELS}" && "$NEEDS_UPDATE" != "true" ]]; then
    if [[ "${GROQ_MODELS}" -nt "${MODELS_JSON}" ]]; then
      NEEDS_UPDATE=true
    fi
  fi
  
  if [[ "$NEEDS_UPDATE" != "true" ]]; then
    exit 0  # Already up-to-date
  fi
fi

# Create or update merged config
export OLLAMA_MODELS GROQ_MODELS MODELS_JSON
create_merged_config

echo "Local models configured at ${MODELS_JSON}"
[[ -f "${OLLAMA_MODELS}" ]] && echo "✓ Ollama: Mistral, Phi-3 Mini"
[[ -f "${GROQ_MODELS}" ]] && echo "✓ Groq: Mixtral, Llama 2, Gemma"


