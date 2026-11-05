'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { 
  Upload, 
  Sparkles, 
  Check, 
  FileCheck, 
  Loader2, 
  X,
  ShieldCheck,
} from 'lucide-react';
import { ContentType } from '@/types';
import { apiClient } from '@/services/api-client';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/components/auth/AuthProvider';

export default function NewReviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [title, setTitle] = useState('Q3 Enterprise Product Launch — Global LinkedIn Campaign');
  const [contentType, setContentType] = useState<ContentType>('Social Media');
  const [brandProfile, setBrandProfile] = useState('Corporate Core (Global English)');
  const [instructions, setInstructions] = useState('Ensure claims align with 2026 FTC guidelines and zero unapproved superlatives.');
  const [content, setContent] = useState(`BrandSense guarantees a 100% elimination of all regulatory compliance fines within 30 days. Our disruptive miracle platform revolutionises how your team reviews content. Connect your repository with brand sense Cloud Sync in one click. 

Clients typically see an instant 450% ROI on their enterprise license in quarter one. Don’t be a dinosaur! Grab your license today before your competitors leave you in the dust! Click the green button on the right side of the screen to download.`);

  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string; path?: string; url?: string; } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const processingSteps = [
    { title: 'Extracting content and structure', sub: 'Parsing semantic entities and formatting elements' },
    { title: 'Checking terminology and trademarks', sub: 'Auditing nomenclature against Master Lexicon v4.2' },
    { title: 'Retrieving brand guidelines and persona rules', sub: 'Comparing tone spectrum against institutional B2B pillars' },
    { title: 'Verifying claims and factual substantiation', sub: 'Checking statistical assertions and legal disclaimer bindings' },
    { title: 'Analysing tone, visuals, and accessibility cues', sub: 'Scanning WCAG 2.2 contrast and directional phrasing' },
    { title: 'Synthesizing evidence and intent-preserving fixes', sub: 'Compiling interactive findings for human sign-off' },
  ];

  const handleStartReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !uploadedFile) {
      toast('Please enter text or upload a creative asset', 'error');
      return;
    }

    setIsProcessing(true);
    setCurrentStep(0);

    for (let i = 0; i < processingSteps.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 650));
    }

    const result = await apiClient.submitReview({
      title,
      contentType,
      brandProfile,
      content: content || 'Document content extracted from ' + uploadedFile?.name,
      instructions,
      filePath: uploadedFile?.path,
      fileUrl: uploadedFile?.url,
      orgId: user?.organizationId || 'org-demo',
      authorId: user?.id,
      authorName: user?.name,
      authorEmail: user?.email,
    });

    if (typeof window !== 'undefined' && result) {
      localStorage.setItem('brandsense_current_review', JSON.stringify(result));
    }

    toast('Brand review complete! Evidentiary findings flagged for authorized decision.');
    router.push('/review/results');
  };

  const handleSimulateFileUpload = (type: string, name: string) => {
    setUploadedFile({
      name,
      size: '2.8 MB',
      type,
    });
    setContent(`Extracted from ${name}:\n\nBrandSense guarantees a 100% elimination of all regulatory compliance fines within 30 days. Our disruptive miracle platform revolutionises how your team reviews content.`);
    toast(`File attached: ${name}`);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 font-sans">
        {/* Title Card */}
        <div className="bg-white p-6 sm:p-7 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <span className="bs-eyebrow block mb-1.5">New review</span>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#20364A] tracking-tight">
              Submit Content for Pre-Publication Review
            </h1>
            <span className="px-2.5 py-0.5 rounded bg-[#D5E3EC] text-[#20364A] text-xs font-bold">
              Deterministic Scan
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#4F6576]">
            Submit social posts, ad copy, press releases, or campaign documents for instant multi-vector verification.
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleStartReview} className="space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-xl border border-[#C4D5E0] shadow-subtle space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="review-title" className="block text-xs font-bold text-[#20364A] mb-1.5">
                  Review Title <span className="text-[#A94842]" aria-hidden="true">*</span>
                </label>
                <input
                  type="text"
                  id="review-title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Global Product Announcement Post"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A]"
                />
              </div>

              <div>
                <label htmlFor="content-type" className="block text-xs font-bold text-[#20364A] mb-1.5">
                  Content Type <span className="text-[#A94842]" aria-hidden="true">*</span>
                </label>
                <select
                  id="content-type"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A]"
                >
                  <option>Social Media</option>
                  <option>Advertisement</option>
                  <option>Email</option>
                  <option>Press Release</option>
                  <option>Blog</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="brand-profile" className="block text-xs font-bold text-[#20364A] mb-1.5">
                  Active Brand Profile &amp; Policy <span className="text-[#A94842]" aria-hidden="true">*</span>
                </label>
                <select
                  id="brand-profile"
                  value={brandProfile}
                  onChange={(e) => setBrandProfile(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A]"
                >
                  <option>Corporate Core (Global English)</option>
                  <option>B2B Commercial Sales</option>
                  <option>Investor Relations &amp; ESG</option>
                  <option>Regional EMEA Compliant</option>
                  <option>Healthcare &amp; Medical Regulated</option>
                </select>
              </div>

              <div>
                <label htmlFor="special-instructions" className="block text-xs font-bold text-[#20364A] mb-1.5">
                  Special Review Instructions (Optional)
                </label>
                <input
                  type="text"
                  id="special-instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Extra scrutiny on performance warranties"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A]"
                />
              </div>
            </div>

            {/* Input Toggle */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#20364A]" id="input-mode-label">Content Input Mode</span>
                <div className="flex gap-1 bg-[#D5E3EC]/60 p-1 rounded-lg text-xs" role="toolbar" aria-labelledby="input-mode-label">
                  <button
                    type="button"
                    onClick={() => setInputMode('text')}
                    aria-pressed={inputMode === 'text'}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] ${
                      inputMode === 'text' ? 'bg-white text-[#20364A] shadow-sm' : 'text-[#4F6576] hover:text-[#20364A]'
                    }`}
                  >
                    Direct Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('file')}
                    aria-pressed={inputMode === 'file'}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] ${
                      inputMode === 'file' ? 'bg-white text-[#20364A] shadow-sm' : 'text-[#4F6576] hover:text-[#20364A]'
                    }`}
                  >
                    Upload Document
                  </button>
                </div>
              </div>

              {inputMode === 'text' ? (
                <div>
                  <label htmlFor="review-content" className="sr-only">
                    Marketing content to review
                  </label>
                  <textarea
                    id="review-content"
                    rows={8}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste or write your marketing copy here..."
                    aria-describedby="char-word-counter"
                    className="w-full p-4 text-xs sm:text-sm font-sans bg-[#EDF3F6]/40 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A] leading-relaxed"
                  />
                  <div id="char-word-counter" className="mt-2 flex items-center justify-between text-xs text-[#4F6576]">
                    <span>
                      {content.length} characters • {content.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                    <span className="text-[#315C74] font-bold">Ready for multi-vector scan</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadedFile ? (
                    <div className="p-4 bg-[#416F89]/10 rounded-lg border border-[#416F89]/25 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileCheck className="w-8 h-8 text-[#416F89]" aria-hidden="true" />
                        <div>
                          <p className="text-xs font-bold text-[#20364A]">{uploadedFile.name}</p>
                          <p className="text-xs text-[#4F6576]">{uploadedFile.type} • {uploadedFile.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="text-[#4F6576] hover:text-[#20364A] p-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
                        aria-label="Remove uploaded file"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-[#C4D5E0] rounded-xl bg-[#EDF3F6]/50 text-center">
                      <Upload className="w-8 h-8 text-[#416F89] mx-auto mb-2" aria-hidden="true" />
                      <h2 className="font-heading text-xs sm:text-sm font-bold text-[#20364A]">
                        Drop campaign file here (PDF, DOCX, PNG, JPG)
                      </h2>
                      <p className="text-xs text-[#4F6576] mt-1">
                        Extracts text, checks image branding, and validates claims
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSimulateFileUpload('PDF Document', 'Global_Campaign_Draft.pdf')}
                        >
                          Attach PDF Sample
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSimulateFileUpload('DOCX File', 'Press_Release_Q3.docx')}
                        >
                          Attach Word Document
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Run Button */}
            <div className="pt-4 border-t border-[#C4D5E0] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#4F6576]">
                <ShieldCheck className="w-4 h-4 text-[#1F7560]" aria-hidden="true" />
                <span>Zero Training Guarantee: Your creative IP stays isolated.</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                leftIcon={<Sparkles className="w-4 h-4 text-[#F4D77B]" aria-hidden="true" />}
              >
                Run Brand Review
              </Button>
            </div>
          </div>
        </form>

        {/* Processing Modal Sequence */}
        {isProcessing && (
          <div
            className="fixed inset-0 bg-[#20364A]/70 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="processing-modal-title"
          >
            <div className="bg-white rounded-xl max-w-lg w-full p-8 shadow-elevated border border-[#C4D5E0] text-center animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 rounded-lg bg-[#20364A] text-white flex items-center justify-center mx-auto mb-5 shadow-lg" aria-hidden="true">
                <Sparkles className="w-7 h-7 animate-pulse text-[#F4D77B]" />
              </div>

              <h2 id="processing-modal-title" className="font-heading text-xl font-extrabold text-[#20364A] tracking-tight">
                BrandSense Deep Review in Progress
              </h2>
              <p className="text-xs text-[#4F6576] mt-1 mb-6">
                Executing multi-vector audit against Acme Core Brand Guardrails...
              </p>

              <div className="space-y-3 text-left" aria-live="polite">
                {processingSteps.map((step, idx) => {
                  const isDone = idx < currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border transition-all text-xs flex items-center gap-3 ${
                        isDone
                          ? 'bg-[#1F7560]/10 border-[#1F7560]/25 text-[#1F7560]'
                          : isCurrent
                          ? 'bg-[#20364A] text-white border-[#31566D] shadow-md scale-[1.02]'
                          : 'bg-[#EDF3F6]/50 border-[#C4D5E0] text-[#4F6576] opacity-60'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isDone ? (
                          <div className="w-5 h-5 rounded-full bg-[#1F7560] text-white flex items-center justify-center" aria-hidden="true">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : isCurrent ? (
                          <Loader2 className="w-5 h-5 text-[#F4D77B] animate-spin" aria-hidden="true" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-[#C4D5E0] text-[#4F6576] flex items-center justify-center text-xs" aria-hidden="true">
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      <div className="truncate">
                        <p className="font-bold truncate">{step.title}</p>
                        <p className={`text-xs truncate ${isCurrent ? 'text-[#D5E3EC]' : 'text-[#4F6576]'}`}>
                          {step.sub}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
