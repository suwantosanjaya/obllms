'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { deleteCLO } from '@/app/actions/obeActions'

export function DeleteCLOButton({ id, code }: { id: string, code: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        setLoading(true)
        const res = await deleteCLO(id)
        if (res.success) {
            setOpen(false)
        } else {
            alert(res.error || 'Gagal menghapus CPMK')
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Hapus CPMK?</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus {code}? Aksi ini bersifat permanen dan tidak dapat dibatalkan.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Batal</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading ? 'Menghapus...' : 'Hapus'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
