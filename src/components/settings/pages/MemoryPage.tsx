import React, { useEffect, useState } from 'react';
import { SettingsLayout } from '../shared/SettingsLayout';
import { SettingsGroup } from '../shared/SettingsGroup';
import { SettingsRow } from '../shared/SettingsRow';
import { Toggle } from '../shared/Controls';
import { MemoryVisual } from '../shared/AbstractVisuals';
import { useSettingsStore } from '@/lib/settings/store';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MemoryRecord { id: string; content: string; created_at: string; }

export function MemoryPage({ onBack }: { onBack: () => void }) {
  const { memoryEnabled, setMemoryEnabled } = useSettingsStore();
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadMemories = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    try {
      const response = await fetch('/api/memory', { headers: { Authorization: `Bearer ${session.access_token}` } });
      const body = await response.json().catch(() => null);
      if (response.ok) setMemories(body?.memories || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { void loadMemories(); }, []);

  const addMemory = async () => {
    const content = draft.trim();
    if (!content || saving) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setSaving(true);
    try {
      const response = await fetch('/api/memory', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error();
      setDraft('');
      await loadMemories();
      toast.success('Memory saved');
    } catch { toast.error('Memory could not be saved.'); }
    finally { setSaving(false); }
  };

  const removeMemory = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const response = await fetch('/api/memory', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ id }) });
    if (response.ok) setMemories(current => current.filter(memory => memory.id !== id));
    else toast.error('Memory could not be deleted.');
  };

  const clearAll = async () => {
    if (!confirm('Are you sure you want to clear all memories? This cannot be undone.')) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const response = await fetch('/api/memory', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ id: crypto.randomUUID(), all: true }) });
    if (response.ok) { setMemories([]); toast.success('All memories cleared'); }
    else toast.error('Memories could not be cleared.');
  };

  return (
    <SettingsLayout title="Memory" onBack={onBack} description="Ramaibot can use saved memories to make future conversations more relevant.">
      <MemoryVisual />
      <SettingsGroup>
        <SettingsRow title="Enable Memory" subtitle="Allow saved memories to be used in future chats." rightElement={<Toggle active={memoryEnabled} onToggle={setMemoryEnabled} />} />
      </SettingsGroup>
      <SettingsGroup title="Add a memory">
        <div className="p-4 space-y-3">
          <textarea value={draft} onChange={e => setDraft(e.target.value)} maxLength={8000} placeholder="Example: I prefer concise technical answers." className="w-full min-h-24 rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none focus:border-primary/40 resize-y" aria-label="Memory text" />
          <button onClick={addMemory} disabled={!draft.trim() || saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium disabled:opacity-40"><Plus className="h-4 w-4" />{saving ? 'Saving…' : 'Save memory'}</button>
        </div>
      </SettingsGroup>
      <SettingsGroup title="What Ramaibot remembers">
        {loading ? <div className="p-6 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div> : memories.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground/60">No memories saved yet.</div> : memories.map(memory => (
          <SettingsRow key={memory.id} title={memory.content} rightElement={<button onClick={() => removeMemory(memory.id)} className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-400" aria-label="Delete memory"><Trash2 className="w-4 h-4" /></button>} />
        ))}
      </SettingsGroup>
      <SettingsGroup>
        <SettingsRow variant="danger" title="Clear All Memories" onClick={clearAll} />
      </SettingsGroup>
    </SettingsLayout>
  );
}
