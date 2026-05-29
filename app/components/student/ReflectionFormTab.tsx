'use client';

import { useState, useEffect } from 'react';
import { getStudentReflections, submitReflection } from '@/app/actions/reflectionActions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, BookOpen, Target, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ReflectionFormTab({ courseId }: { courseId: string }) {
    const [reflections, setReflections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [weekNumber, setWeekNumber] = useState<number>(1);
    const [content, setContent] = useState('');
    const [targetMet, setTargetMet] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        fetchReflections();
    }, [courseId]);

    async function fetchReflections() {
        setLoading(true);
        const res = await getStudentReflections(courseId);
        if (res.success && res.reflections) {
            setReflections(res.reflections);
            // Suggest the next week number
            if (res.reflections.length > 0) {
                const maxWeek = Math.max(...res.reflections.map((r: any) => r.weekNumber || 0));
                setWeekNumber(maxWeek + 1);
            }
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!content.trim()) return;

        setSubmitting(true);
        const res = await submitReflection(courseId, weekNumber, content, targetMet);
        setSubmitting(false);

        if (res.success) {
            toast({ title: 'Berhasil', description: 'Jurnal refleksi berhasil disimpan (+10 Poin).' });
            setContent('');
            setTargetMet(false);
            fetchReflections();
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' });
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Memuat Jurnal Refleksi...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Tulis Jurnal Refleksi
                        </CardTitle>
                        <CardDescription>
                            Evaluasi kemajuan belajar mandiri (Self-Regulated Learning) Anda setiap minggu.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Minggu Ke-</label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={weekNumber}
                                    onChange={(e) => setWeekNumber(Number(e.target.value))}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(w => (
                                        <option key={w} value={w} disabled={reflections.some(r => r.weekNumber === w)}>
                                            Minggu {w} {reflections.some(r => r.weekNumber === w) ? '(Sudah diisi)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Jurnal / Catatan Refleksi</label>
                                <Textarea 
                                    placeholder="Apa yang Anda pelajari minggu ini? Apa kesulitan yang dialami? Bagaimana strategi Anda minggu depan?"
                                    className="min-h-[150px]"
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex items-center space-x-2 bg-muted/30 p-4 rounded-lg border">
                                <Checkbox 
                                    id="targetMet" 
                                    checked={targetMet}
                                    onCheckedChange={(checked) => setTargetMet(checked as boolean)}
                                />
                                <label
                                    htmlFor="targetMet"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    Saya telah memenuhi target jam belajar mandiri saya untuk materi minggu ini.
                                </label>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Target className="w-4 h-4 mr-2" />}
                                Kirim Refleksi (+10 Poin)
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>

            <div className="md:col-span-1 space-y-4">
                <h3 className="font-semibold text-lg">Riwayat Jurnal Anda</h3>
                
                {reflections.length === 0 ? (
                    <div className="text-center p-6 border border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground">Belum ada jurnal yang ditulis.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reflections.map(r => (
                            <Card key={r.id} className="bg-muted/10 shadow-none border-dashed">
                                <CardContent className="p-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Badge variant="outline">Minggu {r.weekNumber}</Badge>
                                        {r.targetMet ? (
                                            <span className="flex items-center text-xs text-green-600 font-medium">
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> Target Tercapai
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground font-medium">
                                                Belum Tercapai
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-3 italic">
                                        "{r.content}"
                                    </p>
                                    <p className="text-[10px] text-muted-foreground text-right">
                                        {new Date(r.createdAt).toLocaleDateString('id-ID')}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
