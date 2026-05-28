'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { removeStudentFromCourse } from '@/app/actions/courseActions'
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
} from "@/components/ui/alert-dialog"

export function RemoveStudentButton({ studentId, courseId, studentName }: { studentId: string; courseId: string; studentName: string }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const { toast } = useToast()

    async function handleRemove(e: React.MouseEvent) {
        e.preventDefault()
        setLoading(true)
        const res = await removeStudentFromCourse(studentId, courseId)
        if (!res.success) {
            toast({
                title: 'Gagal',
                description: res.error || 'Terjadi kesalahan sistem.',
                variant: 'destructive'
            })
            setLoading(false)
            setOpen(false)
        } else {
            toast({
                title: 'Berhasil Dikeluarkan',
                description: `Mahasiswa ${studentName} telah dikeluarkan dari kelas.`
            })
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" disabled={loading} className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" title="Keluarkan Mahasiswa">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    <span className="sr-only">Keluarkan Mahasiswa</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Keluarkan Mahasiswa</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin mengeluarkan <strong>{studentName}</strong> dari kelas ini?
                        Seluruh data historis nilai dan aktivitasnya di kelas ini mungkin akan terhapus.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                    <Button variant="destructive" onClick={handleRemove} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Ya, Keluarkan
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
