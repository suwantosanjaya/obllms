'use client';

import { useState, useEffect } from 'react';
import { getThreadsByCourse, createThread, createReply } from '@/app/actions/forumActions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, PlusCircle, User, Clock, Reply } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function ForumTab({ courseId, isStudent }: { courseId: string, isStudent?: boolean }) {
    const [threads, setThreads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // New Thread State
    const [openNew, setOpenNew] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    // Reply State
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const { toast } = useToast();

    useEffect(() => {
        fetchThreads();
    }, [courseId]);

    async function fetchThreads() {
        setLoading(true);
        const res = await getThreadsByCourse(courseId);
        if (res.success && res.threads) {
            setThreads(res.threads);
        }
        setLoading(false);
    }

    async function handleCreateThread(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        const res = await createThread(courseId, title, content);
        setSubmitting(false);

        if (res.success) {
            toast({ title: 'Berhasil', description: 'Topik diskusi berhasil dibuat.' });
            setOpenNew(false);
            setTitle('');
            setContent('');
            fetchThreads();
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' });
        }
    }

    async function handleCreateReply(threadId: string) {
        if (!replyContent.trim()) return;
        setSubmitting(true);
        const res = await createReply(threadId, courseId, replyContent);
        setSubmitting(false);

        if (res.success) {
            toast({ title: 'Berhasil', description: 'Balasan terkirim.' });
            setReplyingTo(null);
            setReplyContent('');
            fetchThreads();
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' });
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Memuat Forum Diskusi...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Forum Diskusi
                    </h3>
                    <p className="text-sm text-muted-foreground">Ruang diskusi interaktif antara dosen dan mahasiswa.</p>
                </div>
                <Dialog open={openNew} onOpenChange={setOpenNew}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Buat Topik Baru
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleCreateThread}>
                            <DialogHeader>
                                <DialogTitle>Buat Topik Diskusi Baru</DialogTitle>
                                <DialogDescription>Mulai diskusi baru untuk dibahas bersama di kelas ini.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Judul Topik</label>
                                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Contoh: Pertanyaan tentang materi pertemuan 1" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Isi Diskusi</label>
                                    <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Jelaskan pertanyaan atau topik diskusi Anda secara detail..." className="min-h-[150px]" required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpenNew(false)} disabled={submitting}>Batal</Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Posting Diskusi
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {threads.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <MessageSquare className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <h3 className="font-semibold text-lg text-muted-foreground">Belum ada diskusi</h3>
                        <p className="text-sm text-muted-foreground">Jadilah yang pertama memulai diskusi di kelas ini.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {threads.map((thread) => (
                        <Card key={thread.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{thread.title}</CardTitle>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {thread.author?.name || 'User'} 
                                                {thread.author?.role === 'teacher' && <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">Dosen</Badge>}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(thread.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    {thread.clo && (
                                        <Badge variant="outline">{thread.clo.code}</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <p className="whitespace-pre-wrap text-sm">{thread.content}</p>
                                
                                {/* Replies Section */}
                                {thread.replies && thread.replies.length > 0 && (
                                    <div className="mt-6 space-y-3 pl-4 border-l-2 border-primary/20">
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Balasan ({thread.replies.length})</h4>
                                        {thread.replies.map((reply: any) => (
                                            <div key={reply.id} className="bg-muted/30 p-3 rounded-md">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-semibold flex items-center gap-1">
                                                        {reply.author?.name || 'User'}
                                                        {reply.author?.role === 'teacher' && <Badge variant="secondary" className="text-[10px] h-4 px-1">Dosen</Badge>}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {new Date(reply.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm">{reply.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-muted/10 pt-4">
                                {replyingTo === thread.id ? (
                                    <div className="w-full space-y-3">
                                        <Textarea 
                                            placeholder="Tulis balasan Anda..." 
                                            value={replyContent}
                                            onChange={e => setReplyContent(e.target.value)}
                                            className="min-h-[80px]"
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => { setReplyingTo(null); setReplyContent(''); }}>Batal</Button>
                                            <Button size="sm" onClick={() => handleCreateReply(thread.id)} disabled={submitting || !replyContent.trim()}>
                                                {submitting ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Reply className="w-3 h-3 mr-2" />}
                                                Kirim Balasan
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button variant="ghost" size="sm" className="text-primary" onClick={() => setReplyingTo(thread.id)}>
                                        <Reply className="w-4 h-4 mr-2" />
                                        Balas Diskusi
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
