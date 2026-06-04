'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { createTicket } from '@/app/actions/supportActions'
import { useToast } from '@/hooks/use-toast'

export function CreateTicketDialog() {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)
        const subject = formData.get('subject') as string
        const message = formData.get('message') as string

        const res = await createTicket(subject, message)
        setIsLoading(false)

        if (res.success) {
            toast({ title: 'Berhasil', description: 'Tiket bantuan berhasil dikirim!' })
            setOpen(false)
        } else {
            toast({ variant: 'destructive', title: 'Gagal', description: res.error })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Buat Tiket Baru</Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Buat Tiket Bantuan</DialogTitle>
                        <DialogDescription>
                            Sampaikan keluhan atau kendala teknis Anda. Tim kami akan segera merespons.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="subject">Subjek Keluhan</Label>
                            <Input id="subject" name="subject" required placeholder="misal: Gagal mengunggah tugas" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="message">Detail Kendala</Label>
                            <Textarea id="message" name="message" required placeholder="Deskripsikan kendala yang Anda alami secara detail..." rows={4} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>Batal</Button>
                        <Button type="submit" disabled={isLoading}>Kirim Tiket</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
