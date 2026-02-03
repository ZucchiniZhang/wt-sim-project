# Phase 6: Ollama Integration Design

**Date:** 2026-02-03
**Status:** Ready for implementation

---

## Overview

Replace OpenAI SDK with native Ollama API for local AI generation using qwen3:30b-a3b model on M1 Max MacBook Pro.

## Goals

1. Switch from OpenAI to local Ollama for AI generation
2. Remove OpenAI SDK dependency (~50KB bundle savings)
3. Test AI content quality with new model
4. Maintain all existing functionality (tactical guides, matchup playbooks)

## Technical Approach

### Model Selection

- **Model:** `qwen3:30b-a3b` (Q4_K_M quantization, 18GB)
- **Hardware:** M1 Max, 64GB unified memory
- **Expected speed:** ~20-30 tokens/sec (~30-45 seconds per tactical guide)

### API Integration

**Endpoint:** `POST http://localhost:11434/api/generate`

**Request format:**
```json
{
  "model": "qwen3:30b-a3b",
  "prompt": "...",
  "stream": false,
  "format": { /* JSON schema */ },
  "options": {
    "temperature": 0.7,
    "num_predict": 2000
  }
}
```

**Response format:**
```json
{
  "model": "qwen3:30b-a3b",
  "response": "{ ... JSON content ... }",
  "done": true
}
```

### Structured Output

Ollama's `format` parameter enforces JSON schema compliance. Schemas will match existing TypeScript types in `src/types/curated.ts`.

### Environment Variables

```env
VITE_AI_ENABLE_GENERATION=true
VITE_AI_OLLAMA_URL=http://localhost:11434
VITE_AI_MODEL=qwen3:30b-a3b
VITE_AI_CACHE_VERSION=v2.0
```

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/ai-service.ts` | Complete rewrite for Ollama API |
| `.env.example` | Update env var names |
| `.env.local` | Update for Ollama |
| `package.json` | Remove `openai` dependency |

## Files Unchanged

- `src/lib/ai-cache.ts` — IndexedDB caching stays the same
- `src/hooks/useAIContent.ts` — Hooks stay the same (same function signatures)
- All UI components — No changes needed

## Implementation Tasks

1. Rewrite `ai-service.ts` for Ollama native API
2. Add JSON schemas for structured output
3. Update environment variables
4. Remove OpenAI SDK from package.json
5. Test with 5-10 aircraft to verify quality
6. Bump cache version to v2.0

## Risk Mitigation

- **Ollama not running:** Check connection before generation, show helpful error
- **Schema violations:** Ollama enforces schema, but add fallback JSON.parse try/catch
- **Slow generation:** Show progress indicator (already exists)

## Success Criteria

- [ ] Tactical guides generate successfully with qwen3
- [ ] Matchup playbooks generate successfully
- [ ] Content quality is comparable to GPT-4o-mini
- [ ] OpenAI SDK removed from bundle
- [ ] Cache invalidation works (v2.0 forces regeneration)
