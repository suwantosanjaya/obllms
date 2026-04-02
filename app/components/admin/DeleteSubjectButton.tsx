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
                title: 'Berhasil',
                description: 'Mata Kuliah telah dihapus.',
            })
            router.refresh()
        } else {
            toast({
                title: 'Gagal',
                description: result.error || 'Gagal menghapus Mata Kuliah.',
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
                        Mata kuliah tidak akan bisa dihapus jika masih ada kelas aktif yang menggunakannya.
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
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isLoading ? 'Menghapus...' : 'Hapus'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
