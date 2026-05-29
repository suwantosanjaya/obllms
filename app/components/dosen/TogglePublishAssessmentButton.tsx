'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { togglePublishAssessment } from '@/app/actions/assessmentActions'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogCancel
} from "@/components/ui/alert-dialog"

export function TogglePublishAssessmentButton({ assessmentId, initialStatus }: { assessmentId: string, initialStatus: boolean }) {
    const [isPublished, setIsPublished] = useState(initialStatus)
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [warningMsg, setWarningMsg] = useState<string | null>(null)

    async function handleToggle(checked: boolean, force: boolean = false) {
        setLoading(true)
        const res = await togglePublishAssessment(assessmentId, checked, force)
        if (res.success) {
            setIsPublished(checked)
            setWarningMsg(null)
        } else if (res.warning) {
            setWarningMsg(res.error || 'Peringatan konfirmasi')
        } else {
            setErrorMsg(res.error || 'Terjadi kesalahan')
        }
        setLoading(false)
    }

    return (
        <div className="flex items-center space-x-2">
            <Switch 
                id={`publish-${assessmentId}`} 
                checked={isPublished} 
                onCheckedChange={handleToggle}
                disabled={loading}
            />
            <Label htmlFor={`publish-${assessmentId}`} className="text-xs text-muted-foreground font-medium cursor-pointer">
                {loading ? 'Menyimpan...' : (isPublished ? 'Published' : 'Draft')}
            </Label>

            <AlertDialog open={errorMsg !== null} onOpenChange={(open) => !open && setErrorMsg(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Gagal Menyimpan</AlertDialogTitle>
                        <AlertDialogDescription>
                            {errorMsg}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setErrorMsg(null)}>OK Mengerti</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={warningMsg !== null} onOpenChange={(open) => !open && setWarningMsg(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-orange-600">Peringatan</AlertDialogTitle>
                        <AlertDialogDescription>
                            {warningMsg}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setWarningMsg(null)}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleToggle(false, true)} className="bg-orange-600 hover:bg-orange-700">Ya, Unpublish</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
