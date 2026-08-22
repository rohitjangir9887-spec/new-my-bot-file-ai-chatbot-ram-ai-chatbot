import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Upload, Search, X, Trash2, 
  ChevronLeft, Info, File, Clock, AlertCircle, 
  ExternalLink, Download, Eye, MoreVertical,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { uploadFile, MAX_FILE_SIZE } from '@/lib/chat/storage';

export const Route = createFileRoute('/analyze-files/')({
  component: AnalyzeFilesPage,
});

function AnalyzeFilesPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchFiles(user.id);
    });
  }, []);

  const fetchFiles = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFiles(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch files");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      await uploadFile(file, user.id);
      toast.success("File uploaded successfully");
      fetchFiles(user.id);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string, path: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    try {
      const { error: dbError } = await supabase
        .from('user_files')
        .delete()
        .eq('id', id);
      
      if (dbError) throw dbError;

      await supabase.storage.from('user-files').remove([path]);
      
      setFiles(files.filter(f => f.id !== id));
      toast.success("File deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete file");
    }
  };

  const filteredFiles = files.filter(f => 
    f.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0a0a0f] text-foreground overflow-hidden selection:bg-primary/30 pb-safe">
      <header className="h-16 flex items-center px-4 sm:px-6 z-20 sticky top-0 bg-background/30 backdrop-blur-xl border-b border-white/5 shrink-0">
        <button 
          onClick={() => navigate({ to: '/' })} 
          className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-all active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col ml-2">
          <h1 className="text-lg font-bold tracking-tight">File Intelligence</h1>
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Analyze & Manage Documents</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 animate-rise-in">
          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col items-center justify-center gap-3 p-8 glass-strong rounded-[2.5rem] border border-white/10 hover:bg-white/5 transition-all cursor-pointer group border-dashed border-2">
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
              </div>
              <div className="text-center">
                <span className="font-bold text-base block">Upload Document</span>
                <span className="text-xs text-muted-foreground/60">PDF, PNG, JPG, MD (Max 10MB)</span>
              </div>
            </label>

            <div className="p-8 glass-strong rounded-[2.5rem] border border-white/10 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-emerald-400 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm uppercase tracking-widest">Active Analysis</span>
              </div>
              <p className="text-sm text-muted-foreground/60 leading-relaxed">
                Connect your files to Ramaibot for deep semantic search and context-aware responses.
              </p>
              <div className="mt-4 flex gap-2">
                 <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[60%]" />
                 </div>
              </div>
            </div>
          </div>

          {/* Search & Stats */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your documents..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
              />
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-2">
               <span>{files.length} Files</span>
               <div className="w-1 h-1 rounded-full bg-white/10" />
               <span>{(files.reduce((acc, f) => acc + f.size_bytes, 0) / (1024 * 1024)).toFixed(1)} MB Used</span>
            </div>
          </div>

          {/* File List */}
          <div className="space-y-3">
            {isLoading ? (
              [1,2,3].map(i => (
                <div key={i} className="h-20 glass rounded-3xl animate-pulse" />
              ))
            ) : filteredFiles.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center text-muted-foreground/10">
                  <FileText className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">No documents found</h3>
                  <p className="text-sm text-muted-foreground/60">Upload your first file to begin analysis.</p>
                </div>
              </div>
            ) : (
              filteredFiles.map(file => (
                <div 
                  key={file.id} 
                  className="group flex items-center gap-4 p-4 glass hover:bg-white/5 rounded-[2rem] border border-white/5 transition-all press cursor-default"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                    {file.mime_type.includes('image') ? (
                      <ImageIcon className="w-6 h-6 text-sky-400" />
                    ) : file.mime_type.includes('pdf') ? (
                      <FileText className="w-6 h-6 text-rose-400" />
                    ) : (
                      <File className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{file.filename}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                        {(file.size_bytes / 1024).toFixed(0)} KB
                      </span>
                      <div className="w-1 h-1 rounded-full bg-white/5" />
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                        {new Date(file.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-white/10 rounded-xl text-muted-foreground hover:text-foreground">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(file.id, file.storage_path)}
                      className="p-2 hover:bg-rose-500/10 rounded-xl text-rose-500/60 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
