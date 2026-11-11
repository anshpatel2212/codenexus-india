'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FilePlus2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Upload,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/services/api-client';
import { ContentType } from '@/types';

export default function CreatorNewReviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState<ContentType>('Social Media');
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const processingSteps = [
    'Parsing content syntax and promotional assertions...',
    'Matching against Master Lexicon and blacklisted terms...',
    'Cross-referencing RAG brand guidelines and tone spectrum...',
    'Verifying factual claims and mandatory disclaimers...',
    'Generating intent-preserving compliant rewrites...',
  ];

  const handleStartReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast('Please provide a title and content to review.', 'error');
      return;
    }

    setIsProcessing(true);
    setCurrentStep(0);

    for (let i = 0; i < processingSteps.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 450));
    }

    const orgId = user?.organizationId || 'org-demo-brandsense';
    try {
      const result = await apiClient.submitReview({
        title: title.trim(),
        contentType,
        brandProfile: 'Corporate Core (Global English)',
        content: content.trim(),
        instructions: 'Ensure full adherence to FTC claims substantiation and brand vocabulary rules.',
        orgId,
        authorId: user?.id,
        authorName: user?.name,
        authorEmail: user?.email,
      });

      setIsProcessing(false);

      if (!result || !result.id) {
        toast('Failed to obtain a valid review ID from server. Please try again.', 'error');
        return;
      }

      toast('AI Review complete! Findings and suggestions ready.');
      router.push(`/creator/content/${result.id}`);
    } catch (err: any) {
      setIsProcessing(false);
      toast(err?.message || 'Review submission failed. Please try again.', 'error');
    }
  };

  const handleLoadSampleDraft = () => {
    setTitle('Q3 Global LinkedIn Product Launch Copy');
    setContentType('Social Media');
    setContent(
      'BrandSense guarantees a 100% elimination of all regulatory compliance fines within 30 days. Our revolutionary platform completely solves governance. Clients typically see an instant 450% ROI in month one. Don’t miss out! Click the link below to get started.'
    );
    toast('Sample draft loaded.');
  };

  return (
    <RoleShell role="Creator" title="New AI Governance Review">
      <div className="max-w-3xl space-y-6">
        <div className="bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#C4D5E0]">
            <div>
              <h2 className="font-heading font-extrabold text-base text-[#20364A]">
                Submit Content for Pre-Publication Review
              </h2>
              <p className="text-xs text-[#4F6576] mt-0.5">
                AI will inspect vocabulary, check factual claims against verified database records, and highlight issues.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleLoadSampleDraft}>
              Load Sample Copy
            </Button>
          </div>

          <form onSubmit={handleStartReview} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[#20364A] block mb-1">Content Title / Campaign</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Global Product Announcement — LinkedIn Post"
                className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
              />
            </div>

            <div>
              <label className="font-bold text-[#20364A] block mb-1">Content Channel</label>
              <select
                value={contentType}
                onChange={(e: any) => setContentType(e.target.value)}
                className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]"
              >
                <option value="Social Media">Social Media Post (LinkedIn, X, Meta)</option>
                <option value="Advertisement">Paid Advertising / Performance Copy</option>
                <option value="Email">Customer Email Blast / Newsletter</option>
                <option value="Press Release">Press Release / Media Advisory</option>
                <option value="Blog">Blog Post / Thought Leadership</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#20364A] block mb-1">Content Text</label>
              <textarea
                required
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your draft text here to evaluate against active brand guidelines..."
                className="w-full px-3.5 py-2.5 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89] leading-relaxed"
              />
            </div>

            {isProcessing && (
              <div className="p-4 rounded-xl bg-[#F4F8FA] border border-[#C4D5E0] space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#20364A]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#416F89]" />
                  <span>{processingSteps[currentStep]}</span>
                </div>
                <div className="w-full bg-[#D5E3EC] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#416F89] h-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / processingSteps.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
                isLoading={isProcessing}
                leftIcon={<Sparkles className="w-4 h-4 text-[#F4D77B]" />}
              >
                Run AI Brand Governance Scan →
              </Button>
            </div>
          </form>
        </div>
      </div>
    </RoleShell>
  );
}

