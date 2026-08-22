import React, { useState } from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { Paperclip, Send } from "lucide-react";
import { toast } from "sonner";

export function ReportBugPage({ onBack }: { onBack: () => void }) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("UI/UX");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!description.trim()) {
        toast.error("Please describe the issue.");
        return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
        setIsSubmitting(false);
        toast.success("Bug report submitted. Thank you!");
        onBack();
    }, 1500);
  };

  return (
    <SettingsLayout title="Report a Bug" onBack={onBack}>
      <div className="px-2 space-y-6">
        <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2">Category</label>
            <div className="flex flex-wrap gap-2">
                {["UI/UX", "AI Logic", "Performance", "Tools", "Other"].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all press ${
                            category === cat ? "bg-primary text-primary-foreground shadow-lg" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2">Description</label>
            <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What happened? How can we reproduce it?"
                className="w-full h-40 bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 text-sm resize-none focus:ring-1 focus:ring-primary/40 outline-none scrollbar-hide"
            />
        </div>

        <SettingsGroup>
            <SettingsRow 
                icon={<Paperclip className="w-4 h-4" />}
                title="Attach Screenshot"
                comingSoon
            />
        </SettingsGroup>

        <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-[2rem] text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl press disabled:opacity-50"
        >
            {isSubmitting ? "Submitting..." : <><Send className="w-4 h-4" /> Submit Report</>}
        </button>
      </div>
    </SettingsLayout>
  );
}
