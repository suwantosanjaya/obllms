'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { setDepartmentCurriculumStatus, respondCurriculumRevisionRequest } from '@/app/actions/obeActions'
import { CheckCircle, XCircle, Eye, ArrowRight, Loader2, FileEdit } from 'lucide-react'
import Link from 'next/link'
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

interface CurriculumApprovalCardActionsProps {
    departmentId: string
    yearId: string
    status: string
    activeRole: string
    activeHeadId?: string
    userId?: string
}

export function CurriculumApprovalCardActions({
    departmentId,
    yearId,
    status,
    activeRole,
    activeHeadId,
    userId,
}: CurriculumApprovalCardActionsProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const isHod = activeRole === 'head_of_department'
    const isActiveHead = userId === activeHeadId
    const isSubmitted = status === 'SUBMITTED'
    const isApproved = status === 'APPROVED'
    const isRevisionRequested = status === 'REVISION_REQUESTED'

    async function handleAction(newStatus: string) {
        setLoading(true)
        const res = await setDepartmentCurriculumStatus(departmentId, yearId, newStatus, userId)
        if (res.success) {
            toast({
                title: newStatus === 'APPROVED' ? '✅ Kurikulum Disetujui!' : '🔄 Kurikulum Dikembalikan',
                description: newStatus === 'APPROVED'
                    ? 'Kurikulum telah resmi disetujui dan dikunci.'
                    : 'Kurikulum dikembalikan untuk direvisi oleh tim QA.',
            })
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        }
        setLoading(false)
    }

    async function handleRevisionResponse(approve: boolean) {
        if (!userId) return
        setLoading(true)
        const res = await respondCurriculumRevisionRequest(departmentId, yearId, userId, approve)
        if (res.success) {
            toast({
                title: approve ? '✅ Revisi Diizinkan' : '🔒 Permintaan Ditolak',
                description: approve
                    ? 'QA kini dapat melakukan revisi pada kurikulum ini.'
                    : 'Kurikulum tetap dikunci. Permintaan revisi ditolak.',
            })
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        }
        setLoading(false)
    }

    // HEAD OF DEPARTMENT view
    if (isHod) {
        // --- REVISION_REQUESTED: QA has asked for permission to revise ---
        if (isRevisionRequested && isActiveHead) {
            return (
                <div className="flex flex-col gap-2 w-full">
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-2.5">
                        <p className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                            <FileEdit className="w-3.5 h-3.5" /> QA Mengajukan Permintaan Revisi
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {/* Tolak Permintaan */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-1 border-red-400 text-red-600 hover:bg-red-50" disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
                                    Tolak
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Tolak Permintaan Revisi?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Kurikulum akan tetap <strong>APPROVED</strong> dan terkunci. Tim QA tidak dapat melakukan revisi.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <Button variant="destructive" className="font-semibold" onClick={() => handleRevisionResponse(false)}>
                                        Ya, Tolak Permintaan
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        {/* Izinkan Revisi */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white" disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                                    Izinkan
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Izinkan Revisi Kurikulum?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Status kurikulum akan berubah ke <strong>REVISION</strong> dan tim QA dapat melakukan perubahan. Kurikulum perlu diajukan ulang setelah revisi selesai.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <Button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold" onClick={() => handleRevisionResponse(true)}>
                                        Ya, Izinkan Revisi
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground" asChild>
                        <Link href={`/qa/curriculum/builder?yearId=${yearId}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Tinjau Detail Kurikulum
                        </Link>
                    </Button>
                </div>
            )
        }

        if (isRevisionRequested && !isActiveHead) {
            return (
                <div className="flex flex-col gap-2 w-full">
                    <p className="text-xs text-center text-amber-600 bg-amber-50 p-2 rounded-md">
                        Ada permintaan revisi. Hanya Ketua Departemen aktif yang dapat merespons.
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href={`/qa/curriculum/builder?yearId=${yearId}`}>
                            <Eye className="w-4 h-4 mr-2" />Lihat Kurikulum
                        </Link>
                    </Button>
                </div>
            )
        }
        if (isSubmitted && isActiveHead) {
            return (
                <div className="flex flex-col gap-2 w-full">
                    <p className="text-xs text-center text-muted-foreground mb-1">
                        Kurikulum menunggu persetujuan Anda.
                    </p>
                    <div className="flex gap-2">
                        {/* Tolak */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-1 border-red-400 text-red-600 hover:bg-red-50" disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
                                    Tolak
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Tolak & Kembalikan untuk Revisi?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Kurikulum ini akan dikembalikan ke tim QA dengan status <strong>REVISION</strong> untuk diperbaiki. Tindakan ini tidak dapat dibatalkan secara langsung.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <Button
                                        variant="destructive"
                                        className="font-semibold"
                                        onClick={() => handleAction('REVISION')}
                                    >
                                        Ya, Tolak & Revisi
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        {/* Setujui */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                                    Setujui
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Setujui Kurikulum Ini?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Kurikulum akan resmi disetujui dan dikunci (<strong>APPROVED</strong>). Tim QA tidak dapat mengubahnya tanpa persetujuan Anda untuk membuka revisi.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <Button
                                        className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                                        onClick={() => handleAction('APPROVED')}
                                    >
                                        Ya, Setujui
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground" asChild>
                        <Link href={`/qa/curriculum/builder?yearId=${yearId}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Tinjau Detail Kurikulum
                        </Link>
                    </Button>
                </div>
            )
        }

        if (isSubmitted && !isActiveHead) {
            return (
                <div className="flex flex-col gap-2 w-full">
                    <p className="text-xs text-center text-amber-600 bg-amber-50 p-2 rounded-md">
                        Hanya Ketua Departemen aktif yang dapat menyetujui.
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href={`/qa/curriculum/builder?yearId=${yearId}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Lihat Kurikulum
                        </Link>
                    </Button>
                </div>
            )
        }

        // For all other statuses (DRAFT, REVISION, APPROVED) — HoD can only view
        return (
            <Button variant="outline" className="w-full" asChild>
                <Link href={`/qa/curriculum/builder?yearId=${yearId}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    {isApproved ? 'Lihat Kurikulum' : 'Tinjau Kurikulum'}
                    <ArrowRight className="w-4 h-4 ml-auto" />
                </Link>
            </Button>
        )
    }

    // QA / Other roles — use the builder link (original behavior handled by parent)
    return null
}
