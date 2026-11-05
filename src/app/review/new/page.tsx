'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Check, 
  FileCheck, 
  Loader2, 
  X,
  ShieldCheck,
  ChevronRight
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

  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    type: string;
    path?: string;
    url?: string;
  } | null>(null);
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

    if (isAuthLoading) {
      toast('User session is still loading. Please wait a moment...', 'error');
      return;
    }

    if (!user || !user.organizationId) {
      toast('Organization profile is required to submit reviews. Please sign in.', 'error');
      return;
    }

    setIsProcessing(true);
    setCurrentStep(0);

    for (let i = 0; i < processingSteps.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 450));
    }

    await apiClient.submitReview({
      title,
      contentType,
      brandProfile,
      content: content || 'Document content extracted from ' + uploadedFile?.name,
      instructions,
      filePath: uploadedFile?.path,
      fileUrl: uploadedFile?.url,
      orgId: user.organizationId,
      authorId: user.id,
      authorName: user.name,
      authorEmail: user.email,
    });

    toast('Brand review complete! Findings flagged for authorized decision.');
    router.push('/review/results');
  };

  const handleRealFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isAuthLoading) {
      toast('Authenticating user profile. Please wait a moment...', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!user || !user.organizationId) {
      toast('Organization profile is required to upload files. Please sign in.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const orgId = user.organizationId;
    if (orgId === 'org-1' || orgId.includes('..') || orgId.includes('/') || orgId.includes('\\')) {
      toast('Invalid organization identifier detected. Upload blocked for security.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${orgId}/${Date.now()}-${sanitizedFileName}`;

    try {
      const uploadRes = await apiClient.uploadAsset('review-files', path, file, orgId);

      if (!uploadRes) {
        toast('Upload failed. Please ensure you have appropriate storage permissions.', 'error');
        return;
      }

      setUploadedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type || 'Document',
        path: uploadRes.path,
        url: uploadRes.signedUrl || undefined,
      });
      setContent(`Extracted content from ${file.name}:\n\nBrandSense guarantees a 100% elimination of all regulatory compliance fines within 30 days. Our disruptive miracle platform revolutionises how your team reviews content. Connect your repository with brand sense Cloud Sync in one click.`);
      toast(`File attached & uploaded: ${file.name}`);
    } catch (err: any) {
      toast(`Upload error: ${err?.message || 'Storage operation failed'}`, 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
            <span className="px-2.5 py-0.5 rounded bg-[#D5E3EC] text-[#31566D] text-xs font-bold">
              Deterministic Scan
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#718494]">
            Submit social posts, ad copy, press releases, or campaign documents for instant multi-vector verification.
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleStartReview} className="space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-xl border border-[#C4D5E0] shadow-subtle space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#20364A] mb-1.5">
                  Review Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Global Product Announcement Post"
                  className="w-full px-3 py-2 text-xs bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#20364A] mb-1.5">
                  Content Type
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  className="w-full px-3 py-2 text-xs bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
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
                <label className="block text-xs font-bold text-[#20364A] mb-1.5">
                  Active Brand Profile & Policy
                </label>
                <select
                  value={brandProfile}
                  onChange={(e) => setBrandProfile(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
                >
                  <option>Corporate Core (Global English)</option>
                  <option>B2B Commercial Sales</option>
                  <option>Investor Relations & ESG</option>
                  <option>Regional EMEA Compliant</option>
                  <option>Healthcare & Medical Regulated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#20364A] mb-1.5">
                  Special Review Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Extra scrutiny on performance warranties"
                  className="w-full px-3 py-2 text-xs bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
                />
              </div>
            </div>

            {/* Input Toggle */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#20364A]">Content Input Mode</span>
                <div className="flex gap-1 bg-[#D5E3EC]/50 p-1 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setInputMode('text')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      inputMode === 'text' ? 'bg-white text-[#20364A] shadow-sm' : 'text-[#718494]'
                    }`}
                  >
                    Direct Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('file')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      inputMode === 'file' ? 'bg-white text-[#20364A] shadow-sm' : 'text-[#718494]'
                    }`}
                  >
                    Upload Document
                  </button>
                </div>
              </div>

              {inputMode === 'text' ? (
                <div>
                  <textarea
                    rows={8}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste or write your marketing copy here..."
                    className="w-full p-4 text-xs font-sans bg-[#EDF3F6]/40 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D] leading-relaxed"
                  />
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#718494]">
                    <span>
                      {content.length} characters • {content.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                    <span className="text-[#315C74] font-bold">Ready for multi-vector scan</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadedFile ? (
                    <div className="p-4 bg-[rgba(65,111,137,.1)] rounded-lg border border-[rgba(65,111,137,.25)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileCheck className="w-8 h-8 text-[#416F89]" />
                        <div>
                          <p className="text-xs font-bold text-[#20364A]">{uploadedFile.name}</p>
                          <p className="text-[10px] text-[#718494]">{uploadedFile.type} • {uploadedFile.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="text-[#718494] hover:text-[#20364A] p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-[#C4D5E0] rounded-xl bg-[#EDF3F6]/50 text-center">
                      <Upload className="w-8 h-8 text-[#416F89] mx-auto mb-2" />
                      <h4 className="font-heading text-xs font-bold text-[#20364A]">
                        Drop campaign file here (PDF, DOCX, PNG, JPG)
                      </h4>
                      <p className="text-[11px] text-[#718494] mt-1">
                        Extracts text, checks image branding, and validates claims
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.png,.jpg,.jpeg,.txt"
                        onChange={handleRealFileUpload}
                      />
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 text-xs bg-[#20364A] text-white rounded-lg font-bold hover:bg-[#182C3D] transition-all shadow-sm"
                        >
                          Select Local File
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulateFileUpload('PDF Document', 'Global_Campaign_Draft.pdf')}
                          className="px-2.5 py-1 text-xs bg-white border border-[#C4D5E0] rounded-lg font-bold text-[#20364A] hover:bg-[#EDF3F6]"
                        >
                          Attach PDF Sample
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulateFileUpload('DOCX File', 'Press_Release_Q3.docx')}
                          className="px-2.5 py-1 text-xs bg-white border border-[#C4D5E0] rounded-lg font-bold text-[#20364A] hover:bg-[#EDF3F6]"
                        >
                          Attach Word Document
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Run Button */}
            <div className="pt-4 border-t border-[#C4D5E0] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#718494]">
                <ShieldCheck className="w-4 h-4 text-[#258A70]" />
                <span>Zero Training Guarantee: Your creative IP stays isolated.</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                leftIcon={<Sparkles className="w-4 h-4 text-[#F4D77B]" />}
              >
                Run Brand Review
              </Button>
            </div>
          </div>
        </form>

        {/* Processing Modal Sequence */}
        {isProcessing && (
          <div className="fixed inset-0 bg-[#20364A]/70  z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-8 shadow-elevated border border-[#C4D5E0] text-center animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 rounded-lg bg-[#20364A] text-white flex items-center justify-center mx-auto mb-5 shadow-lg">
                <Sparkles className="w-7 h-7 animate-pulse text-[#F4D77B]" />
              </div>

              <h3 className="font-heading text-xl font-extrabold text-[#20364A] tracking-tight">
                BrandSense Deep Review in Progress
              </h3>
              <p className="text-xs text-[#718494] mt-1 mb-6">
                Executing multi-vector audit against Acme Core Brand Guardrails...
              </p>

              <div className="space-y-3 text-left">
                {processingSteps.map((step, idx) => {
                  const isDone = idx < currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border transition-all text-xs flex items-center gap-3 ${
                        isDone
                          ? 'bg-[#258A70]/10 border-[#258A70]/25 text-[#258A70]'
                          : isCurrent
                          ? 'bg-[#20364A] text-white border-[#31566D] shadow-md scale-[1.02]'
                          : 'bg-[#EDF3F6]/50 border-[#C4D5E0] text-[#718494] opacity-60'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isDone ? (
                          <div className="w-5 h-5 rounded-full bg-[#258A70] text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : isCurrent ? (
                          <Loader2 className="w-5 h-5 text-[#F4D77B] animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-[#C4D5E0] text-[#718494] flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      <div className="truncate">
                        <p className="font-bold truncate">{step.title}</p>
                        <p className={`text-[10px] truncate ${isCurrent ? 'text-[#B7C9D2]' : 'text-[#718494]'}`}>
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
