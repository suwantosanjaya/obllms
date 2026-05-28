'use client'

import { useState } from 'react'
import { PlusCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { enrollStudent } from '@/app/actions/courseActions'
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

export function EnrollCourseButton({ studentId, courseId, courseTitle }: { studentId: string; courseId: string; courseTitle: string }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const { toast } = useToast()

    async function handleEnroll(e: React.MouseEvent) {
        e.preventDefault()
        setLoading(true)
        const res = await enrollStudent(studentId, courseId)
        if (!res.success) {
            toast({
                title: 'Gagal Mendaftar',
                description: res.error || 'Terjadi kesalahan sistem.',
                variant: 'destructive'
            })
            setLoading(false)
            setOpen(false)
        } else {
            toast({
                title: 'Berhasil Mendaftar',
                description: `Anda telah terdaftar di kelas ${courseTitle}.`
            })
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button size="sm" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    {loading ? 'Memproses...' : 'Daftar Kelas'}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Pendaftaran</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin mendaftar ke kelas <strong>{courseTitle}</strong>?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                    <Button onClick={handleEnroll} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Ya, Daftar
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
