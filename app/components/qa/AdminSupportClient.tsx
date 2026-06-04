'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, MessageSquareReply } from 'lucide-react'
import { replyTicket } from '@/app/actions/supportActions'

export function AdminSupportClient({ tickets }: { tickets: any[] }) {
    const { toast } = useToast()
    const [open, setOpen] = useState<string | null>(null)
    const [reply, setReply] = useState('')
    const [loading, setLoading] = useState(false)

    const handleReply = async (ticketId: string) => {
        if (!reply.trim()) {
            toast({ title: 'Error', description: 'Balasan tidak boleh kosong', variant: 'destructive' })
            return
        }

        setLoading(true)
        const res = await replyTicket(ticketId, reply)
        setLoading(false)

        if (res.success) {
            toast({ title: 'Berhasil', description: 'Balasan telah dikirim ke mahasiswa.' })
            setOpen(null)
            setReply('')
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        }
    }

    return (
        <div className="overflow-x-auto border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[150px]">Mahasiswa</TableHead>
                        <TableHead className="min-w-[200px]">Subjek Keluhan</TableHead>
                        <TableHead className="w-[120px]">Tanggal</TableHead>
                        <TableHead className="w-[100px] text-center">Status</TableHead>
                        <TableHead className="text-right w-[150px]">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada tiket bantuan yang masuk.</TableCell>
                        </TableRow>
                    ) : (
                        tickets.map(ticket => (
                            <TableRow key={ticket.id} className={ticket.status === 'OPEN' ? 'bg-primary/5' : ''}>
                                <TableCell>
                                    <div className="font-semibold">{ticket.student?.name || 'Mahasiswa'}</div>
                                    <div className="text-xs text-muted-foreground">{ticket.student?.studentProfile?.nim || '-'}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-sm">{ticket.subject}</div>
                                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{ticket.message}</div>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {new Date(ticket.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={ticket.status === 'OPEN' ? 'default' : 'secondary'} className="text-[10px]">
                                        {ticket.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Dialog open={open === ticket.id} onOpenChange={(isOpen) => {
                                        setOpen(isOpen ? ticket.id : null)
                                        if (isOpen) setReply(ticket.replyMessage || '')
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button variant={ticket.status === 'OPEN' ? 'default' : 'outline'} size="sm" className="gap-1.5">
                                                <MessageSquareReply className="w-4 h-4" />
                                                {ticket.status === 'OPEN' ? 'Balas' : 'Lihat'}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Detail Tiket: {ticket.subject}</DialogTitle>
                                                <DialogDescription>Tiket dari {ticket.student?.name || 'Mahasiswa'}</DialogDescription>
                                            </DialogHeader>
                                            
                                            <div className="space-y-4 py-4">
                                                <div className="bg-muted p-4 rounded-lg space-y-2">
                                                    <h4 className="font-semibold text-sm">Pesan Mahasiswa:</h4>
                                                    <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <h4 className="font-semibold text-sm">Balasan Anda:</h4>
                                                    <Textarea 
                                                        placeholder="Tulis balasan untuk mahasiswa..."
                                                        value={reply}
                                                        onChange={(e) => setReply(e.target.value)}
                                                        disabled={ticket.status === 'CLOSED'}
                                                        className="min-h-[120px]"
                                                    />
                                                </div>
                                            </div>

                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setOpen(null)}>Tutup</Button>
                                                {ticket.status === 'OPEN' && (
                                                    <Button onClick={() => handleReply(ticket.id)} disabled={loading}>
                                                        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengirim...</> : 'Kirim Balasan & Tutup Tiket'}
                                                    </Button>
                                                )}
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
