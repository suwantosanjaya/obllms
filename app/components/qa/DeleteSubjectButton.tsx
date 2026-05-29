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
                title: 'Success',
                description: 'Subject deleted successfully.',
            })
            router.refresh()
        } else {
            toast({
                title: 'Error',
                description: result.error || 'Failed to delete Subject.',
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
                    <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete <strong>{title}</strong>? This action cannot be undone.
                        The subject cannot be deleted if there are active classes using it.
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
