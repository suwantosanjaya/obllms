'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Star, StarHalf, MessageSquare, AlertTriangle } from 'lucide-react'

// Helper component for star rating visualization
const StarRating = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
        <div className="flex items-center gap-0.5">
            {[...Array(fullStars)].map((_, i) => (
                <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
            {hasHalfStar && <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
            {[...Array(emptyStars)].map((_, i) => (
                <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
            ))}
            <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
        </div>
    )
}

export function FeedbackDashboardClient({ 
    stats, 
    courseAggregates, 
    detailedFeedbacks 
}: { 
    stats: any, 
    courseAggregates: any[], 
    detailedFeedbacks: any[] 
}) {
    const [selectedSubject, setSelectedSubject] = useState<string>('ALL')
    const [ratingFilter, setRatingFilter] = useState<string>('ALL')

    const filteredFeedbacks = detailedFeedbacks.filter(fb => {
        if (selectedSubject !== 'ALL' && fb.subjectCode !== selectedSubject) return false
        if (ratingFilter !== 'ALL') {
            if (ratingFilter === 'CRITICAL' && fb.rating > 3) return false   // ≤ 3 = perlu perhatian
            if (ratingFilter === 'POSITIVE' && fb.rating < 4) return false   // ≥ 4 = positif
        }
        return true
    })

    const criticalCourses = courseAggregates.filter(c => c.averageRating < 3.5)

    return (
        <div className="space-y-6">
            {/* OVERVIEW CARDS */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rata-rata Kepuasan</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)} <span className="text-sm text-muted-foreground font-normal">/ 5.0</span></div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Secara keseluruhan pada periode ini
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Umpan Balik</CardTitle>
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalFeedback}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Mahasiswa berpartisipasi
                        </p>
                    </CardContent>
                </Card>
                <Card className={criticalCourses.length > 0 ? "border-orange-200 bg-orange-50/30" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mata Kuliah Perlu Evaluasi</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${criticalCourses.length > 0 ? 'text-orange-500' : 'text-green-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{criticalCourses.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Rating rata-rata di bawah 3.5
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* COURSE RANKING TABLE */}
            <Card>
                <CardHeader>
                    <CardTitle>Evaluasi Mata Kuliah</CardTitle>
                    <CardDescription>Peringkat kepuasan mahasiswa berdasarkan mata kuliah (diurutkan dari terendah).</CardDescription>
                </CardHeader>
                <CardContent>
                    {courseAggregates.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-sm">Belum ada umpan balik yang masuk.</div>
                    ) : (
                        <div className="border rounded-md overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mata Kuliah</TableHead>
                                        <TableHead>Total Umpan Balik</TableHead>
                                        <TableHead className="text-right">Rata-rata Rating</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {courseAggregates.map(agg => (
                                        <TableRow key={agg.subject.id} className={agg.averageRating < 3.5 ? 'bg-orange-50/50 hover:bg-orange-50' : ''}>
                                            <TableCell>
                                                <div className="font-medium">{agg.subject.code}</div>
                                                <div className="text-sm text-muted-foreground">{agg.subject.title}</div>
                                            </TableCell>
                                            <TableCell>{agg.totalFeedback} respons</TableCell>
                                            <TableCell className="text-right flex justify-end">
                                                <StarRating rating={agg.averageRating} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* DETAILED FEEDBACK FEED */}
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Rincian Komentar</CardTitle>
                        <CardDescription>Umpan balik langsung dari mahasiswa (identitas disamarkan).</CardDescription>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select value={ratingFilter} onValueChange={setRatingFilter}>
                            <SelectTrigger className="w-[190px]">
                                <SelectValue placeholder="Filter Rating" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Rating</SelectItem>
                                <SelectItem value="CRITICAL">Perlu Perhatian (≤3 ⭐)</SelectItem>
                                <SelectItem value="POSITIVE">Positif (≥4 ⭐)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredFeedbacks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm border rounded-md border-dashed">
                            Tidak ada komentar yang cocok dengan filter yang dipilih.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredFeedbacks.map(fb => (
                                <div key={fb.id} className="p-4 border rounded-lg bg-card hover:bg-accent/30 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">{fb.blurredName}</span>
                                                <Badge variant="outline" className="text-xs font-normal">Angkatan {fb.angkatan}</Badge>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {fb.subjectCode} - {fb.subjectTitle}
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm leading-relaxed mt-3">"{fb.content}"</p>
                                    <div className="text-[10px] text-muted-foreground mt-3 text-right">
                                        {new Date(fb.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
