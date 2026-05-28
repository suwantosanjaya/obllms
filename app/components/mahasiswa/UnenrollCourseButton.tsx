'use client'

import { useState } from 'react'
import { MinusCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { unenrollStudent } from '@/app/actions/courseActions'
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

export function UnenrollCourseButton({ studentId, courseId, courseTitle }: { studentId: string; courseId: string; courseTitle: string }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const { toast } = useToast()

    async function handleUnenroll(e: React.MouseEvent) {
        e.preventDefault() // prevent alert dialog from closing instantly
        setLoading(true)
        const res = await unenrollStudent(studentId, courseId)
        if (!res.success) {
            toast({
                title: 'Gagal Membatalkan',
                description: res.error || 'Terjadi kesalahan sistem.',
                variant: 'destructive'
            })
            setLoading(false)
            setOpen(false)
        } else {
            toast({
                title: 'Berhasil Dibatalkan',
                description: `Pendaftaran Anda di kelas ${courseTitle} telah dihapus.`
            })
            // no need to setLoading(false) or close dialog here since the component unmounts upon revalidation
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={loading} className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MinusCircle className="mr-2 h-4 w-4" />}
                    {loading ? 'Memproses...' : 'Batal Daftar'}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Pembatalan</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin membatalkan pendaftaran kelas <strong>{courseTitle}</strong>? 
                        Seluruh data aktivitas Anda di kelas ini mungkin akan dihapus dan tidak dapat dikembalikan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Kembali</AlertDialogCancel>
                    <Button variant="destructive" onClick={handleUnenroll} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Ya, Batal Daftar
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
