'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface QAAlignmentDetailDialogProps {
    row: any
}

export function QAAlignmentDetailDialog({ row }: QAAlignmentDetailDialogProps) {
    const details = row.mappingDetails || []

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">Detail</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detail Keselarasan: {row.code} - {row.title}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 mt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground font-medium mb-1">Dosen Pengampu</p>
                            <p>{row.instructors}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground font-medium mb-1">Status QA</p>
                            {row.status === 'Approved' ? (
                                <Badge className="bg-green-500">Approved</Badge>
                            ) : (
                                <Badge variant="outline" className="text-orange-500 border-orange-500">Review</Badge>
                            )}
                        </div>
                        <div>
                            <p className="text-muted-foreground font-medium mb-1">Total CLO Dipetakan</p>
                            <p>{row.mappedCloCount} dari {row.cloCount} CLO ({row.alignmentPercentage}%)</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3">Pemetaan CLO ke PLO</h4>
                        {details.length === 0 ? (
                            <div className="text-center py-8 border rounded-md text-muted-foreground bg-muted/20">
                                Belum ada pemetaan CLO ke PLO untuk mata kuliah ini.
                            </div>
                        ) : (
                            <div className="border rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="w-[100px]">Kode CLO</TableHead>
                                            <TableHead>Deskripsi CLO</TableHead>
                                            <TableHead className="w-[100px]">Kode PLO</TableHead>
                                            <TableHead>Deskripsi PLO</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {details.map((detail: any, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-semibold text-primary">{detail.cloCode}</TableCell>
                                                <TableCell className="text-sm">{detail.cloDescription}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                        {detail.ploCode}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">{detail.ploDescription}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
