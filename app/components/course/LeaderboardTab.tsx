'use client';

import { useState, useEffect } from 'react';
import { getLeaderboard, convertGamificationToScore } from '@/app/actions/gamificationActions';
import { getAssessmentsForCourse } from '@/app/actions/assessmentActions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Medal, Award, Loader2, Wand2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export function LeaderboardTab({ courseId }: { courseId: string }) {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [assessments, setAssessments] = useState<any[]>([]);
    
    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
    const [maxPoints, setMaxPoints] = useState("100");
    const [overwriteExisting, setOverwriteExisting] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    
    const { toast } = useToast();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [leadRes, assessRes] = await Promise.all([
                getLeaderboard(courseId),
                getAssessmentsForCourse(courseId)
            ]);
            
            if (leadRes.success && leadRes.leaderboard) {
                setLeaderboard(leadRes.leaderboard);
            }
            if (assessRes.success && assessRes.assessments) {
                setAssessments(assessRes.assessments);
            }
            setLoading(false);
        }
        fetchData();
    }, [courseId]);

    const handleConvert = async () => {
        if (!selectedAssessmentId) {
            toast({ title: "Gagal", description: "Pilih tugas tujuan terlebih dahulu.", variant: "destructive" });
            return;
        }
        const targetPts = parseInt(maxPoints);
        if (isNaN(targetPts) || targetPts <= 0) {
            toast({ title: "Gagal", description: "Target poin harus berupa angka lebih dari 0.", variant: "destructive" });
            return;
        }

        setIsConverting(true);
        const res = await convertGamificationToScore(courseId, selectedAssessmentId, targetPts, overwriteExisting);
        setIsConverting(false);

        if (res.success) {
            toast({ title: "Berhasil", description: res.message });
            setIsDialogOpen(false);
        } else {
            toast({ title: "Gagal", description: res.error || "Terjadi kesalahan.", variant: "destructive" });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Memuat Papan Peringkat...</p>
            </div>
        );
    }

    if (leaderboard.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Trophy className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <h3 className="font-semibold text-lg text-muted-foreground">Belum ada data</h3>
                    <p className="text-sm text-muted-foreground">Belum ada aktivitas gamifikasi di kelas ini.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 border-b">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Papan Peringkat (Leaderboard)
                    </CardTitle>
                    <CardDescription className="mt-1">
                        Peringkat mahasiswa berdasarkan poin keaktifan dan pencapaian.
                    </CardDescription>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50 gap-2">
                    <Wand2 className="w-4 h-4" />
                    Konversi ke Nilai OBE
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {leaderboard.map((student, index) => {
                        let Icon = Award;
                        let iconColor = "text-slate-400";
                        if (index === 0) { Icon = Trophy; iconColor = "text-amber-500"; }
                        else if (index === 1) { Icon = Medal; iconColor = "text-slate-400"; }
                        else if (index === 2) { Icon = Medal; iconColor = "text-amber-700"; }

                        return (
                            <div key={student.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-muted/50 ${index < 3 ? 'shadow-sm' : ''}`}>
                                        {index < 3 ? <Icon className={`w-6 h-6 ${iconColor}`} /> : <span className="font-bold text-muted-foreground">#{index + 1}</span>}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{student.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="bg-primary/5 text-primary">Level {student.level}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary">{student.points}</p>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Poin</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Wand2 className="w-5 h-5 text-amber-500" />
                            Konversi Poin ke Nilai OBE
                        </DialogTitle>
                        <DialogDescription>
                            Ubah poin gamifikasi menjadi skor (0-100) dan masukkan ke rekapan nilai mahasiswa.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Pilih Tugas Tujuan</Label>
                            <Select value={selectedAssessmentId} onValueChange={setSelectedAssessmentId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih wadah nilai partisipasi..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {assessments.map(a => (
                                        <SelectItem key={a.id} value={a.id}>
                                            {a.title} ({a.type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Pilih tugas yang sebelumnya sudah Anda buat untuk menampung nilai keaktifan ini.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Target Poin Maksimal (Nilai 100)</Label>
                            <Input type="number" value={maxPoints} onChange={(e) => setMaxPoints(e.target.value)} />
                            <p className="text-xs text-muted-foreground">Mahasiswa yang mencapai poin ini akan mendapat skor 100.</p>
                        </div>
                        <div className="flex items-start space-x-3 bg-muted/30 p-3 rounded-lg border border-border mt-2">
                            <Checkbox 
                                id="overwrite" 
                                checked={overwriteExisting} 
                                onCheckedChange={(checked) => setOverwriteExisting(checked === true)}
                            />
                            <div className="space-y-1 leading-none">
                                <Label htmlFor="overwrite" className="font-semibold text-destructive cursor-pointer">
                                    Timpa Nilai Lama (Berbahaya)
                                </Label>
                                <p className="text-xs text-muted-foreground leading-snug">
                                    Jika tidak dicentang (aman), sistem <b>akan melewati</b> mahasiswa yang sudah memiliki nilai di tugas ini. Jika dicentang, seluruh nilai lama di tugas ini akan tergantikan permanen.
                                </p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isConverting}>Batal</Button>
                        <Button onClick={handleConvert} disabled={isConverting} className="bg-amber-600 hover:bg-amber-700">
                            {isConverting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Konversi Sekarang
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
