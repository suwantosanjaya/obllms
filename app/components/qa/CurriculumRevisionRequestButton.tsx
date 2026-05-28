'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { requestCurriculumRevision } from '@/app/actions/obeActions'
import { Pencil, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface CurriculumRevisionRequestButtonProps {
    departmentId: string
    yearId: string
    userId: string
}

export function CurriculumRevisionRequestButton({ departmentId, yearId, userId }: CurriculumRevisionRequestButtonProps) {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [note, setNote] = useState('')

    async function handleSubmit() {
        if (!note.trim()) {
            toast({ title: 'Catatan diperlukan', description: 'Mohon isi alasan permintaan revisi.', variant: 'destructive' })
            return
        }
        setLoading(true)
        const res = await requestCurriculumRevision(departmentId, yearId, userId, note.trim())
        if (res.success) {
            toast({
                title: '📨 Permintaan Revisi Terkirim',
                description: 'Ketua Departemen akan menerima permintaan Anda dan memberikan keputusan.',
            })
            setOpen(false)
            setNote('')
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 border-amber-400 text-amber-700 hover:bg-amber-50 text-xs px-2">
                    <Pencil className="w-4 h-4 mr-2" />
                    Ajukan Permintaan Revisi
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Ajukan Permintaan Revisi Kurikulum</DialogTitle>
                    <DialogDescription>
                        Kurikulum ini sudah <strong>disetujui</strong>. Permintaan Anda akan dikirimkan ke Ketua Departemen untuk diputuskan.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                    <Label htmlFor="revision-note" className="font-medium">
                        Alasan Permintaan Revisi <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="revision-note"
                        placeholder="Contoh: Terdapat perubahan kurikulum nasional yang perlu disesuaikan dengan standar terbaru..."
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        rows={4}
                        className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        Catatan ini akan ditampilkan kepada Ketua Departemen saat mempertimbangkan permintaan Anda.
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Batal</Button>
                    <Button onClick={handleSubmit} disabled={loading || !note.trim()} className="bg-amber-600 hover:bg-amber-700 text-white">
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Pencil className="w-4 h-4 mr-2" />}
                        Kirim Permintaan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
