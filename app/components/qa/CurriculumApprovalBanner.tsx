'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { setDepartmentCurriculumStatus } from '@/app/actions/obeActions'
import { Lock, Unlock, AlertCircle } from 'lucide-react'

interface CurriculumApprovalBannerProps {
    departmentId?: string
    curriculumYearId?: string
    status: string
    activeRole: string
    activeHeadId?: string
    userId?: string
}

export function CurriculumApprovalBanner({ departmentId, curriculumYearId, status, activeRole, activeHeadId, userId }: CurriculumApprovalBannerProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    if (!departmentId) {
        return (
            <div className="bg-slate-50 border border-slate-200 text-slate-800 p-4 rounded-md flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 text-slate-500" />
                <div>
                    <h4 className="font-semibold">Pilih Program Studi</h4>
                    <p className="text-sm">Silakan pilih Program Studi (Program Studi) di pojok kanan atas untuk melihat dan mengajukan kurikulum.</p>
                </div>
            </div>
        )
    }

    if (!curriculumYearId) return null

    const isHod = activeRole === 'head_of_department'
    const isQa = activeRole === 'qa'
    const isApproved = status === 'APPROVED'
    const isSubmitted = status === 'SUBMITTED'
    const currentStatus = status || 'DRAFT'

    async function handleStatusChange(newStatus: string) {
        setLoading(true)
        const res = await setDepartmentCurriculumStatus(departmentId!, curriculumYearId!, newStatus, userId)
        if (res.success) {
            toast({ title: "Status Berhasil Diubah", description: `Kurikulum kini berstatus ${newStatus}` })
        } else {
            toast({ title: "Gagal", description: res.error, variant: "destructive" })
        }
        setLoading(false)
    }

    if (isApproved) {
        return (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-green-600" />
                    <div>
                        <h4 className="font-semibold text-green-900">Kurikulum Disetujui</h4>
                        <p className="text-sm">Kurikulum ini telah disetujui dan bersifat Read-Only.</p>
                    </div>
                </div>
                {isHod && userId === activeHeadId && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange('REVISION')} disabled={loading} className="border-green-600 text-green-700 hover:bg-green-100">
                        <Unlock className="w-4 h-4 mr-2" />
                        Buka Mode Revisi
                    </Button>
                )}
                {isHod && userId !== activeHeadId && (
                    <div className="text-sm font-medium text-red-600 italic">Hanya Ketua Aktif yang dapat membatalkan persetujuan.</div>
                )}
            </div>
        )
    }

    return (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                    <h4 className="font-semibold text-yellow-900">Status: {currentStatus}</h4>
                    <p className="text-sm">
                        {currentStatus === 'SUBMITTED' 
                            ? 'Kurikulum telah diajukan dan menunggu persetujuan Ketua Program Studi.'
                            : 'Kurikulum ini sedang dalam proses penyusunan dan belum disetujui.'}
                    </p>
                </div>
            </div>
            
            <div className="flex gap-2">
                {isQa && (currentStatus === 'DRAFT' || currentStatus === 'REVISION') && (
                    <Button variant="default" size="sm" onClick={() => handleStatusChange('SUBMITTED')} disabled={loading} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                        Ajukan Kurikulum
                    </Button>
                )}
                {isQa && currentStatus === 'SUBMITTED' && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange('DRAFT')} disabled={loading} className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                        Batalkan Pengajuan
                    </Button>
                )}
                
                {isHod && currentStatus === 'SUBMITTED' && userId === activeHeadId && (
                    <>
                        <Button variant="outline" size="sm" onClick={() => handleStatusChange('REVISION')} disabled={loading} className="border-red-600 text-red-700 hover:bg-red-50">
                            Tolak (Revisi)
                        </Button>
                        <Button variant="default" size="sm" onClick={() => handleStatusChange('APPROVED')} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                            <Lock className="w-4 h-4 mr-2" />
                            Setujui Kurikulum
                        </Button>
                    </>
                )}
                {isHod && currentStatus === 'SUBMITTED' && userId !== activeHeadId && (
                    <div className="text-sm font-medium text-red-600 italic mt-1">Anda tidak dapat menyetujui karena Admin belum menetapkan Anda sebagai Ketua Aktif.</div>
                )}
            </div>
        </div>
    )
}
