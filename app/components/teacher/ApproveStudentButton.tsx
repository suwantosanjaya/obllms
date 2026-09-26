'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'
import { approveEnrollment, rejectEnrollment } from '@/app/actions/courseActions'
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

export function ApproveStudentButton({ enrollmentId, studentName }: { enrollmentId: string, studentName: string }) {
    const [loadingApprove, setLoadingApprove] = useState(false)
    const [loadingReject, setLoadingReject] = useState(false)
    const [openReject, setOpenReject] = useState(false)
    const { toast } = useToast()

    async function handleApprove() {
        setLoadingApprove(true)
        const res = await approveEnrollment(enrollmentId)
        if (!res.success) {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        } else {
            toast({ title: 'Berhasil', description: `${studentName} telah disetujui.` })
        }
        setLoadingApprove(false)
    }

    async function handleReject() {
        setLoadingReject(true)
        const res = await rejectEnrollment(enrollmentId)
        if (!res.success) {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        } else {
            toast({ title: 'Berhasil', description: `Pendaftaran ${studentName} ditolak.` })
        }
        setLoadingReject(false)
        setOpenReject(false)
    }

    return (
        <div className="flex gap-2">
            <Button size="sm" variant="default" onClick={handleApprove} disabled={loadingApprove || loadingReject} className="bg-green-600 hover:bg-green-700 h-8">
                {loadingApprove ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                Terima
            </Button>
            
            <AlertDialog open={openReject} onOpenChange={setOpenReject}>
                <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" disabled={loadingApprove || loadingReject} className="h-8">
                        {loadingReject ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <X className="w-4 h-4 mr-1" />}
                        Tolak
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Penolakan</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tolak pendaftaran <strong>{studentName}</strong>? Mahasiswa akan dihapus dari daftar kelas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loadingReject}>Batal</AlertDialogCancel>
                        <Button variant="destructive" onClick={handleReject} disabled={loadingReject}>
                            {loadingReject ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Ya, Tolak
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
