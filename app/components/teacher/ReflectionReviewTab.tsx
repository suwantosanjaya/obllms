'use client';

import { useState, useEffect } from 'react';
import { getCourseReflections } from '@/app/actions/reflectionActions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, CheckCircle2, XCircle } from 'lucide-react';

export function ReflectionReviewTab({ courseId }: { courseId: string }) {
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReflections() {
            setLoading(true);
            const res = await getCourseReflections(courseId);
            if (res.success && res.enrollments) {
                setEnrollments(res.enrollments);
            }
            setLoading(false);
        }
        fetchReflections();
    }, [courseId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Memuat Data Refleksi Mahasiswa...</p>
            </div>
        );
    }

    const studentsWithReflections = enrollments.filter(e => e.reflections && e.reflections.length > 0);

    if (studentsWithReflections.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <h3 className="font-semibold text-lg text-muted-foreground">Belum ada jurnal</h3>
                    <p className="text-sm text-muted-foreground">Belum ada mahasiswa yang mengumpulkan jurnal refleksi.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Tinjauan Jurnal Refleksi
                    </h3>
                    <p className="text-sm text-muted-foreground">Pantau kemajuan SRL (Self-Regulated Learning) mahasiswa secara mandiri.</p>
                </div>
            </div>

            <div className="space-y-6">
                {studentsWithReflections.map((enrollment) => (
                    <Card key={enrollment.id}>
                        <CardHeader className="bg-muted/30 pb-4 py-4">
                            <CardTitle className="text-base flex items-center justify-between">
                                <span>{enrollment.student.name}</span>
                                <Badge variant="secondary">{enrollment.reflections.length} Jurnal</Badge>
                            </CardTitle>
                            <CardDescription>{enrollment.student.email}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                {enrollment.reflections.map((r: any) => (
                                    <div key={r.id} className="border rounded-md p-4 bg-background">
                                        <div className="flex justify-between items-center mb-3">
                                            <Badge variant="outline" className="font-semibold">Minggu Ke-{r.weekNumber}</Badge>
                                            
                                            <div className="flex items-center gap-4 text-xs">
                                                <span className="text-muted-foreground">
                                                    {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                {r.targetMet ? (
                                                    <span className="flex items-center text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Target SRL Tercapai
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                                                        <XCircle className="w-3 h-3 mr-1" /> Target Belum Tercapai
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground whitespace-pre-wrap">"{r.content}"</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
