'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Search,
  Trash2,
  Sparkles,
  Database,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/services/api-client';
import { KnowledgeItem } from '@/types';

export default function AdminApprovedFactsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [facts, setFacts] = useState<KnowledgeItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Corporate Metrics');

  const fetchFacts = async () => {
    if (!user?.organizationId) return;
    setLoading(true);
    try {
      const items = await apiClient.getKnowledgeBase(user.organizationId);
      const filtered = (items || []).filter((i: KnowledgeItem) => i.type === 'fact');
      setFacts(filtered);
    } catch {
      setFacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacts();
  }, [user?.organizationId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user?.organizationId) return;

    try {
      await apiClient.createKnowledgeItem(user.organizationId, {
        type: 'fact',
        title: title.trim(),
        content: content.trim(),
        category,
        status: 'Active',
        updatedBy: user.name,
      });
      toast(`Verified fact '${title}' added to knowledge base.`);
      setTitle('');
      setContent('');
      setShowModal(false);
      fetchFacts();
    } catch {
      toast('Failed to save approved fact.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.organizationId) return;
    try {
      await apiClient.deleteKnowledgeItem(user.organizationId, id);
      toast('Fact removed.');
      fetchFacts();
    } catch {
      toast('Failed to delete fact.', 'error');
    }
  };

  const filtered = facts.filter(
    (f) =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RoleShell role="Admin" title="Approved Corporate Facts &amp; Data Claims">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4F6576]" />
            <input
              type="text"
              placeholder="Search approved facts and verified claims..."
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
            Add Approved Fact
          </Button>
        </div>

        {/* Facts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 py-12 text-center text-xs text-[#4F6576]">
              Loading verified corporate facts...
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-2 p-12 text-center text-xs text-[#4F6576] bg-white rounded-xl border border-[#C4D5E0]">
              <CheckCircle2 className="w-8 h-8 text-[#1F7560]/40 mx-auto mb-2" />
              <p className="font-bold text-[#20364A]">No Approved Facts In Record</p>
              <p className="text-[11px] mt-1 max-w-xs mx-auto">
                Add verified statistics, customer numbers, benchmarks, and product capabilities to safeguard your copy.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="p-5 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                      {item.category || 'Verified Fact'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-[#4F6576] hover:text-[#A94842] p-1"
                      aria-label="Delete fact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-[#20364A] mt-2">{item.title}</h3>
                  <p className="text-xs text-[#4F6576] mt-2 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                </div>
                <div className="pt-3 border-t border-[#C4D5E0]/60 flex items-center justify-between text-[11px] text-[#4F6576]">
                  <span className="font-mono text-[10px]">Verification Date: {new Date(item.lastUpdated).toLocaleDateString()}</span>
                  <span className="text-[#1F7560] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified &amp; RAG Indexed
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#20364A]/50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-elevated border border-[#C4D5E0] space-y-4">
              <h3 className="font-heading font-bold text-base text-[#20364A]">Record Approved Fact</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#20364A] block mb-1">Claim Title / Fact Header</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 99.99% Guaranteed Cloud SLA Uptime"
                    className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#20364A] block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                  >
                    <option value="Corporate Metrics">Corporate Metrics &amp; Financials</option>
                    <option value="Product Performance">Product Performance Benchmarks</option>
                    <option value="Customer Traction">Customer Traction &amp; Testimonials</option>
                    <option value="Certifications">Compliance &amp; Certifications</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#20364A] block mb-1">Approved Statement &amp; Source Reference</label>
                  <textarea
                    required
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Exact permissible wording with supporting document citation..."
                    className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Verified Fact
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

