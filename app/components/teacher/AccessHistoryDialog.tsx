'use client'

import { useState } from 'react'
import { History, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function AccessHistoryDialog({ requests }: { requests: any[] }) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-slate-50 dark:bg-slate-800">
                    <History className="mr-2 h-4 w-4" />
                    Riwayat Pengajuan
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Riwayat Pengajuan Akses Program Studi</DialogTitle>
                    <DialogDescription>
                        Status persetujuan untuk setiap permintaan akses mengajar lintas program studi yang pernah Anda ajukan.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2 mt-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Program Studi Tujuan</TableHead>
                                <TableHead>Universitas</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        Belum ada riwayat pengajuan akses.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell className="text-sm whitespace-nowrap">
                                            {new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {req.department?.name}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {req.department?.faculty?.university?.name || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {req.status === 'PENDING' && (
                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                                                    <Clock className="w-3 h-3 mr-1" /> Menunggu
                                                </Badge>
                                            )}
                                            {req.status === 'APPROVED' && (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Disetujui
                                                </Badge>
                                            )}
                                            {req.status === 'REJECTED' && (
                                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                                                    <XCircle className="w-3 h-3 mr-1" /> Ditolak
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}
