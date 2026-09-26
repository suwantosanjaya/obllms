'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'
import { approveEnrollment, rejectEnrollment } from '@/app/actions/courseActions'
import { useToast } from '@/hooks/use-toast'

export function ApproveStudentButton({ enrollmentId, studentName }: { enrollmentId: string, studentName: string }) {
    const [loadingApprove, setLoadingApprove] = useState(false)
    const [loadingReject, setLoadingReject] = useState(false)
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
        if (!confirm(`Tolak pendaftaran ${studentName}?`)) return
        setLoadingReject(true)
        const res = await rejectEnrollment(enrollmentId)
        if (!res.success) {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        } else {
            toast({ title: 'Berhasil', description: `Pendaftaran ${studentName} ditolak.` })
        }
        setLoadingReject(false)
    }

    return (
        <div className="flex gap-2">
            <Button size="sm" variant="default" onClick={handleApprove} disabled={loadingApprove || loadingReject} className="bg-green-600 hover:bg-green-700 h-8">
                {loadingApprove ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                Terima
            </Button>
            <Button size="sm" variant="destructive" onClick={handleReject} disabled={loadingApprove || loadingReject} className="h-8">
                {loadingReject ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <X className="w-4 h-4 mr-1" />}
                Tolak
            </Button>
        </div>
    )
}
