'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteUser } from '@/app/actions/adminActions'
import { useToast } from '@/hooks/use-toast'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function DeleteUserButton({ id, userName }: { id: string; userName: string }) {
    const [loading, setLoading] = useState(false)

    const { toast } = useToast()
    const [open, setOpen] = useState(false)

    async function handleDelete(e: React.MouseEvent) {
        e.preventDefault()
        setLoading(true)
        const res = await deleteUser(id)
        if (res.success) {
            toast({
                title: 'Berhasil',
                description: `Pengguna ${userName} telah dihapus.`,
            })
            setOpen(false)
        } else {
            toast({
                variant: 'destructive',
                title: 'Gagal Menghapus',
                description: res.error || 'Terjadi kesalahan saat menghapus pengguna.'
            })
        }
        setLoading(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Pengguna <strong>{userName}</strong> dan semua data akses yang terkait akan dihapus secara permanen dari sistem.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={loading} variant="destructive">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                        Hapus Permanen
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
