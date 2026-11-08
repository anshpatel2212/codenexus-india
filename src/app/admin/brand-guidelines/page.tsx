'use client';

import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/services/api-client';
import { KnowledgeItem } from '@/types';

export default function AdminBrandGuidelinesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [guidelines, setGuidelines] = useState<KnowledgeItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Voice & Tone');

  const fetchGuidelines = async () => {
    if (!user?.organizationId) return;
    setLoading(true);
    try {
      const items = await apiClient.getKnowledgeBase(user.organizationId);
      const filtered = (items || []).filter((i: KnowledgeItem) => i.type === 'guideline');
      setGuidelines(filtered);
    } catch {
      setGuidelines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidelines();
  }, [user?.organizationId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user?.organizationId) return;

    try {
      await apiClient.createKnowledgeItem(user.organizationId, {
        type: 'guideline',
        title: title.trim(),
        content: content.trim(),
        category,
        status: 'Active',
        updatedBy: user.name,
      });
      toast(`Brand guideline '${title}' successfully created.`);
      setTitle('');
      setContent('');
      setShowModal(false);
      fetchGuidelines();
    } catch {
      toast('Failed to create guideline.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.organizationId) return;
    try {
      await apiClient.deleteKnowledgeItem(user.organizationId, id);
      toast('Guideline removed.');
      fetchGuidelines();
    } catch {
      toast('Failed to delete guideline.', 'error');
    }
  };

  const filtered = guidelines.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RoleShell role="Admin" title="Brand Guidelines &amp; Tone of Voice">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4F6576]" />
            <input
              type="text"
              placeholder="Search brand guidelines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#C4D5E0] text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Brand Guideline
          </Button>
        </div>

        {/* Guidelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 py-12 text-center text-xs text-[#4F6576]">
              Loading active brand guidelines...
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-2 p-12 text-center text-xs text-[#4F6576] bg-white rounded-xl border border-[#C4D5E0]">
              <BookOpen className="w-8 h-8 text-[#416F89]/40 mx-auto mb-2" />
              <p className="font-bold text-[#20364A]">No Brand Guidelines Found</p>
              <p className="text-[11px] mt-1 max-w-xs mx-auto">
                Define your corporate tone, voice principles, and writing style standards for AI validation.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="p-5 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      {item.category || 'Guideline'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-[#4F6576] hover:text-[#A94842] p-1"
                      aria-label="Delete guideline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-[#20364A] mt-2">{item.title}</h3>
                  <p className="text-xs text-[#4F6576] mt-2 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                </div>
                <div className="pt-3 border-t border-[#C4D5E0]/60 flex items-center justify-between text-[11px] text-[#4F6576]">
                  <span>Updated by: {item.updatedBy || 'Brand Admin'}</span>
                  <span className="text-emerald-700 font-bold">Active in AI RAG</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#20364A]/50">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-elevated border border-[#C4D5E0] space-y-4">
              <h3 className="font-heading font-bold text-base text-[#20364A]">Create Brand Guideline</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#20364A] block mb-1">Guideline Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Tone of Voice — Direct, Empowering, and Factual"
                    className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#20364A] block mb-1">Pillar Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                  >
                    <option value="Voice & Tone">Voice & Tone</option>
                    <option value="Promotional Claims">Promotional Claims</option>
                    <option value="Visual & Formatting">Visual & Formatting</option>
                    <option value="Social Media Standards">Social Media Standards</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#20364A] block mb-1">Rule Definition &amp; Evidence Requirements</label>
                  <textarea
                    required
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe how content creators must adhere to this guideline..."
                    className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Guideline
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleShell>
  );
}

