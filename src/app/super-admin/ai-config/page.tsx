'use client';

import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Sparkles,
  Sliders,
  Save,
  CheckCircle2,
  Shield,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { authClient } from '@/services/auth-client';

export default function SuperAdminAiConfigPage() {
  const { toast } = useToast();
  const [provider, setProvider] = useState('google-gemini');
  const [modelName, setModelName] = useState('gemini-1.5-pro');
  const [fallbackModel, setFallbackModel] = useState('gemini-1.5-flash');
  const [temperature, setTemperature] = useState(0.2);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.85);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [strictMode, setStrictMode] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      const token = authClient.getToken();
      try {
        const resp = await fetch('/api/v1/super-admin/ai-config', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (resp.ok) {
          const cfg = await resp.json();
          if (cfg.provider) setProvider(cfg.provider);
          if (cfg.model_name) setModelName(cfg.model_name);
          if (cfg.fallback_model) setFallbackModel(cfg.fallback_model);
          if (cfg.temperature !== undefined) setTemperature(cfg.temperature);
          if (cfg.similarity_threshold !== undefined) setSimilarityThreshold(cfg.similarity_threshold);
          if (cfg.max_tokens) setMaxTokens(cfg.max_tokens);
          if (cfg.strict_mode !== undefined) setStrictMode(Boolean(cfg.strict_mode));
        }
      } catch {
        // Fallback default
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = authClient.getToken();
    try {
      const resp = await fetch('/api/v1/super-admin/ai-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          provider,
          model_name: modelName,
          fallback_model: fallbackModel,
          temperature,
          similarity_threshold: similarityThreshold,
          max_tokens: maxTokens,
          strict_mode: strictMode,
        }),
      });

      if (resp.ok) {
        toast('Global AI engine configuration saved successfully.');
      } else {
        toast('Failed to save AI configuration.', 'error');
      }
    } catch {
      toast('Network error saving AI configuration.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <RoleShell role="Super Admin" title="AI Governance Engine &amp; Model Orchestration">
      <div className="max-w-4xl space-y-6">
        <div className="bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div className="flex items-center gap-3 pb-4 border-b border-[#C4D5E0]">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-700">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base text-[#20364A]">
                Global AI Model Runtime Settings
              </h2>
              <p className="text-xs text-[#4F6576]">
                Configure foundational LLM routing, safety thresholds, and vector similarity baselines applied to all reviews.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#20364A] block mb-1.5">
                  Primary Model Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                >
                  <option value="google-gemini">Google Gemini AI Engine</option>
                  <option value="anthropic">Anthropic Claude</option>
                  <option value="openai">OpenAI Enterprise</option>
                  <option value="local-vllm">Self-Hosted vLLM / Ollama</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#20364A] block mb-1.5">
                  Primary Governance Model
                </label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                >
                  <option value="gemini-1.5-pro">gemini-1.5-pro (High Precision Deep Reasoning)</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Low-Latency Fast Triage)</option>
                  <option value="claude-3-5-sonnet">claude-3-5-sonnet-20241022</option>
                  <option value="gpt-4o">gpt-4o-2024-08-06</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#20364A] block mb-1.5">
                  Failover Fallback Model
                </label>
                <select
                  value={fallbackModel}
                  onChange={(e) => setFallbackModel(e.target.value)}
                  className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                >
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Recommended Failover)</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                  <option value="gpt-4o-mini">gpt-4o-mini</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#20364A] block mb-1.5">
                  Max Output Tokens Ceiling
                </label>
                <input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  min={512}
                  max={8192}
                  step={256}
                  className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                />
              </div>
            </div>

            <div className="p-4 bg-[#F4F8FA] rounded-xl border border-[#C4D5E0] space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-[#20364A]">Model Temperature: {temperature}</span>
                  <span className="text-[#4F6576] font-mono text-[11px]">Strict Factuality (0.0 – 1.0)</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-[#416F89]"
                />
                <p className="text-[11px] text-[#4F6576] mt-1">
                  Lower values (0.1–0.3) enforce deterministic adherence to brand rules and eliminate hallucinations.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-[#20364A]">RAG Cosine Similarity Threshold: {similarityThreshold}</span>
                  <span className="text-[#4F6576] font-mono text-[11px]">Vector Match Filter</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                  className="w-full accent-[#416F89]"
                />
                <p className="text-[11px] text-[#4F6576] mt-1">
                  Higher threshold (0.85+) ensures only high-relevance brand guidelines and facts are retrieved into context.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="strict-guardrails"
                  checked={strictMode}
                  onChange={(e) => setStrictMode(e.target.checked)}
                  className="rounded text-[#416F89] focus:ring-[#416F89]"
                />
                <label htmlFor="strict-guardrails" className="text-xs font-bold text-[#20364A]">
                  Enforce Zero-Tolerance Hallucination Gatekeeper (Auto-reject unsubstantiated statistical claims)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Apply Engine Configuration
              </Button>
            </div>
          </form>
        </div>
      </div>
    </RoleShell>
  );
}

