'use client';

import React, { useEffect, useState } from 'react';
import {
  Languages,
  Plus,
  Search,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/services/api-client';
import { KnowledgeItem } from '@/types';

export default function AdminTerminologyPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'terminology' | 'banned' | 'disclaimer'>('banned');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [replacement, setReplacement] = useState('');

  const fetchItems = async () => {
    if (!user?.organizationId) return;
    setLoading(true);
    try {
      const all = await apiClient.getKnowledgeBase(user.organizationId);
      const filtered = (all || []).filter((i: KnowledgeItem) =>
        ['terminology', 'banned', 'disclaimer', 'phrase'].includes(i.type)
      );
      setItems(filtered);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user?.organizationId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user?.organizationId) return;

    try {
      await apiClient.createKnowledgeItem(user.organizationId, {
        type: activeSubTab,
        title: title.trim(),
        content: content.trim() || title.trim(),
        replacement: replacement.trim() || undefined,
        status: 'Active',
        updatedBy: user.name,
      });
      toast(`Rule '${title}' saved.`);
      setTitle('');
      setContent('');
      setReplacement('');
      setShowModal(false);
      fetchItems();
    } catch {
      toast('Failed to save rule.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.organizationId) return;
    try {
      await apiClient.deleteKnowledgeItem(user.organizationId, id);
      toast('Item removed.');
      fetchItems();
    } catch {
      toast('Failed to delete item.', 'error');
    }
  };

  const currentItems = items.filter((i) => {
    if (activeSubTab === 'banned') return i.type === 'banned';
    if (activeSubTab === 'terminology') return i.type === 'terminology' || i.type === 'phrase';
    if (activeSubTab === 'disclaimer') return i.type === 'disclaimer';
    return true;
  }).filter((i) =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RoleShell role="Admin" title="Terminology &amp; Banned Vocabulary Rules">
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div className="flex items-center gap-2 border-b sm:border-b-0 pb-2 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveSubTab('banned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeSubTab === 'banned'
                  ? 'bg-[#A94842] text-white'
                  : 'text-[#4F6576] hover:bg-[#F4F8FA]'
              }`}
            >
              Banned Words &amp; Hyperbole
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('terminology')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeSubTab === 'terminology'
                  ? 'bg-[#416F89] text-white'
                  : 'text-[#4F6576] hover:bg-[#F4F8FA]'
              }`}
            >
              Approved Terminology
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('disclaimer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeSubTab === 'disclaimer'
                  ? 'bg-[#B77938] text-white'
                  : 'text-[#4F6576] hover:bg-[#F4F8FA]'
              }`}
            >
              Required Disclaimers
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Rule
          </Button>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 py-12 text-center text-xs text-[#4F6576]">
              Loading vocabulary rules...
            </div>
          ) : currentItems.length === 0 ? (
            <div className="col-span-3 p-12 text-center text-xs text-[#4F6576] bg-white rounded-xl border border-[#C4D5E0]">
              <Languages className="w-8 h-8 text-[#416F89]/40 mx-auto mb-2" />
              <p className="font-bold text-[#20364A]">No Vocabulary Rules Configured</p>
              <p className="text-[11px] mt-1 max-w-xs mx-auto">
                Configure terms to trigger automatic deterministic warnings or auto-replace suggestions.
              </p>
            </div>
          ) : (
            currentItems.map((item) => (
              <div key={item.id} className="p-4 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase border ${
                        item.type === 'banned'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : item.type === 'disclaimer'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {item.type}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-[#4F6576] hover:text-[#A94842] p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-heading font-bold text-sm text-[#20364A] mt-2">{item.title}</h4>
                  <p className="text-xs text-[#4F6576] mt-1">{item.content}</p>

                  {item.replacement && (
                    <div className="mt-3 p-2 bg-[#F4F8FA] rounded-md text-[11px] border border-[#C4D5E0]">
                      <span className="text-[#4F6576] font-bold">Recommended Replacement: </span>
                      <span className="text-[#1F7560] font-bold">{item.replacement}</span>
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t border-[#C4D5E0]/60 text-[10px] text-[#4F6576] flex justify-between">
                  <span>Deterministic Flag</span>
                  <span className="text-[#1F7560] font-bold">Enforced</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#20364A]/50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-elevated border border-[#C4D5E0] space-y-4">
              <h3 className="font-heading font-bold text-base text-[#20364A]">
                Add {activeSubTab === 'banned' ? 'Banned Term' : activeSubTab === 'disclaimer' ? 'Disclaimer' : 'Terminology Rule'}
              </h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#20364A] block mb-1">
                    {activeSubTab === 'banned' ? 'Blacklisted Phrase / Word' : 'Term or Requirement'}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={activeSubTab === 'banned' ? 'e.g. Revolutionary, 100% Guaranteed, Flawless' : 'e.g. AI-Powered Brand Governance'}
                    className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                  />
                </div>

                {activeSubTab === 'banned' && (
                  <div>
                    <label className="text-xs font-bold text-[#20364A] block mb-1">
                      Safe Alternative / Replacement
                    </label>
                    <input
                      type="text"
                      value={replacement}
                      onChange={(e) => setReplacement(e.target.value)}
                      placeholder="e.g. Advanced, Proven, Verified"
                      className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-[#20364A] block mb-1">Compliance Explanation &amp; Rationale</label>
                  <textarea
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Why this rule is enforced across publication copy..."
                    className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Rule
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

