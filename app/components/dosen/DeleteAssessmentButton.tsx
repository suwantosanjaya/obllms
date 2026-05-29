'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteAssessment } from '@/app/actions/assessmentActions'
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
} from "@/components/ui/alert-dialog"

export function DeleteAssessmentButton({ assessmentId, assessmentTitle, isPublished }: { assessmentId: string, assessmentTitle: string, isPublished: boolean }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    async function handleDelete() {
        setLoading(true)
        const res = await deleteAssessment(assessmentId)
        if (res.success) {
            setOpen(false)
        } else {
            setErrorMsg(res.error || 'Terjadi kesalahan saat menghapus.')
        }
        setLoading(false)
    }

    if (isPublished) return null

    return (
        <>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Penugasan</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus <b>{assessmentTitle}</b>? Tindakan ini tidak dapat dibatalkan dan akan <b>menghapus seluruh data pengumpulan beserta nilai mahasiswa</b> yang terkait dengan tugas ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {errorMsg && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                            {errorMsg}
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }} 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={loading}
                        >
                            {loading ? 'Menghapus...' : 'Ya, Hapus Permanen'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
