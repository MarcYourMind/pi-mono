# Using Ollama and Groq with Pi

This guide explains how to use local Ollama models and cloud-based Groq models with the pi coding agent.

## Quick Start

### Option 1: Groq (Cloud, Fastest) ⭐ Recommended

**1. Get Free Groq API Key**

```bash
# Visit https://console.groq.com/keys
# Sign up (no credit card required)
# Copy your API key

export GROQ_API_KEY=your_key_here
```

**2. Run Pi**

```bash
./pi-test.sh
# Auto-detects Groq and uses Mixtral 8x7B
```

### Option 2: Ollama (Local, Always Free)

**1. Start Ollama Server**

```bash
ollama serve
```

**2. Pull Models**

```bash
ollama pull mistral          # 7B - best for tool calling
ollama pull phi3:mini        # 3.8B - lightweight
```

**3. Run Pi**

```bash
./pi-test.sh
# Auto-detects Ollama and uses Mistral
```

### Option 3: Both (Groq Primary, Ollama Fallback)

```bash
export GROQ_API_KEY=your_key_here
ollama serve  # In another terminal

./pi-test.sh
# Uses Groq (faster), falls back to Ollama if Groq is unavailable
```

## How It Works

The setup is automatic:

1. **setup-ollama.sh** - Copies Ollama model configuration to `~/.pi/agent/models.json`
2. **pi-test.sh** - Detects Ollama server and auto-selects Mistral as the default provider
3. **ollama-models.json** - Defines available local models with their properties

## Model Recommendations

### Cloud: Groq (Free, Fastest) ⭐
**Pros:** Super fast ⚡, excellent quality, free tier generous, instant setup

```bash
export GROQ_API_KEY=gsk_your_key_here
./pi-test.sh --provider groq --model llama-3.3-70b-versatile
```

| Model | Context | Best For |
|-------|---------|----------|
| **llama-3.3-70b-versatile** ⭐ | 131K tokens | Coding, complex reasoning, general tasks |
| deepseek-r1-distill-llama-70b | 131K tokens | Advanced reasoning, research |
| llama-3.1-8b-instant | 131K tokens | Lightweight, fast inference |

### Local: Ollama (Free Forever)
**Pros:** Privacy, offline-capable, no internet needed

| Model | Speed | Tools | Memory | Best For |
|-------|-------|-------|--------|----------|
| **mistral** | Good | ✅ | 4.5GB | Coding, tool calling |
| phi3:mini | Very fast | ❌ | 2.5GB | Lightweight tasks |
| neural-chat | Very fast | ✅ | 4GB | Chat, coding |

```bash
ollama serve
./pi-test.sh --provider ollama --model mistral
```

## Configuration

Models are auto-configured from:
- **groq-models.json** - Cloud Groq models
- **ollama-models.json** - Local Ollama models
- **~/.pi/agent/models.json** - Merged config (auto-created)

## Troubleshooting

### "Cannot access Groq"
- Check your internet connection
- Verify GROQ_API_KEY is set: `echo $GROQ_API_KEY`
- Get a new key: https://console.groq.com/keys

### "Cannot connect to Ollama"
- Ensure `ollama serve` is running in another terminal
- Verify the server is at `http://localhost:11434`

### "Tool calling not working"
- You're using Phi-3 Mini, which doesn't support tools
- Switch to Mistral: `./pi-test.sh --provider ollama --model mistral`

### "Out of Memory errors"
- Your GPU doesn't have enough VRAM for the model
- Try Phi-3 Mini (uses ~2.5GB) instead of Mistral (uses ~4.5GB)

### Custom Ollama Base URL
If Ollama is running on a different host/port, edit `~/.pi/agent/models.json`:

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://your-host:11434/v1",
      "apiKey": "ollama",
      "models": [...]
    }
  }
}
```

## Environment Variables

```bash
# Groq (Cloud)
export GROQ_API_KEY=gsk_your_key_here

# Ollama (Local, usually no vars needed)
# Optional: override base URL
export OLLAMA_BASE_URL=http://localhost:11434/v1
```

## Uninstall / Disable

```bash
# Skip Groq auto-setup
./pi-test.sh --no-groq

# Skip Ollama auto-setup
./pi-test.sh --no-ollama

# Remove models from pi config
rm ~/.pi/agent/models.json
```

## Choosing Between Groq and Ollama

| Factor | Groq | Ollama |
|--------|------|--------|
| Speed | ⚡⚡⚡ Extremely fast | ⚡ Moderate |
| Privacy | Cloud (shared) | 100% Local |
| Offline | ❌ Needs internet | ✅ Works offline |
| Setup | 2 minutes | 5-10 minutes |
| Cost | Free (generous) | Free (local hardware) |
| Quality | Excellent | Good |

**Use Groq** for fast iteration and production builds

**Use Ollama** for privacy or offline environments

## Performance Notes

Ollama performance on your 4GB VRAM:

| Model | Speed | Memory |
|-------|-------|--------|
| Groq Mixtral (cloud) | ⚡⚡⚡ ~100-200ms | N/A |
| Mistral (Ollama) | ⚡ 2-3s/token | 4.5GB |
| Phi-3 Mini (Ollama) | ⚡⚡ 1-2s/token | 2.5GB |

| 4GB VRAM | Phi-3 Mini | Acceptable | 2.5GB |

## What's Next?

- See [README.md](./README.md) for pi documentation
- Use Mistral for agentic workflows with tool calling
- Use Phi-3 Mini for quick, lightweight tasks
- Modify tools, skills, and extensions to customize pi

## Testing

The repo includes test files to verify Ollama integration:

```bash
# Test Mistral with tool calling
npx tsx packages/ai/test/mistral-local.test.ts

# Test Phi-3 Mini (no tools)
npx tsx packages/ai/test/phi3-local.test.ts
```
