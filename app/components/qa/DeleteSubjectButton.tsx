'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Trash2 } from 'lucide-react'
import { deleteSubject } from '@/app/actions/subjectActions'

interface DeleteSubjectButtonProps {
    id: string
    title: string
}

export function DeleteSubjectButton({ id, title }: DeleteSubjectButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const handleDelete = async () => {
        setIsLoading(true)
        const result = await deleteSubject(id)
        setIsLoading(false)

        if (result.success) {
            toast({
                title: 'Sukses',
                description: 'Mata kuliah berhasil dihapus.',
            })
            router.refresh()
        } else {
            toast({
                title: 'Error',
                description: result.error || 'Gagal menghapus mata kuliah.',
                variant: 'destructive',
            })
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Mata Kuliah?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus <strong>{title}</strong>? Tindakan ini tidak dapat dibatalkan.
                        Mata kuliah tidak dapat dihapus jika ada kelas aktif yang menggunakannya.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={isLoading}
                        variant="destructive"
                    >
                        {isLoading ? 'Menghapus...' : 'Hapus'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
