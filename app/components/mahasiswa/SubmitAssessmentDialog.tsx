'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitAssessment } from '@/app/actions/assessmentActions'

export function SubmitAssessmentDialog({ assessmentId, studentId, isSubmitted, title }: { assessmentId: string, studentId: string, isSubmitted: boolean, title: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const fileUrl = formData.get('fileUrl') as string

        const res = await submitAssessment(assessmentId, studentId, fileUrl)

        if (res.success) {
            setOpen(false)
        } else {
            setError(res.error || 'Gagal mengirim tugas')
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={isSubmitted ? "outline" : "default"} size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    {isSubmitted ? 'Edit Pengumpulan' : 'Kumpul Tugas'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Kumpul Tugas: {title}</DialogTitle>
                        <DialogDescription>
                            Masukkan link URL dari dokumen atau repository tugas Anda.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="fileUrl" className="text-right">
                                URL Tugas
                            </Label>
                            <Input
                                id="fileUrl"
                                name="fileUrl"
                                placeholder="https://docs.google.com/..."
                                className="col-span-3"
                                type="url"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Menyimpan...' : (isSubmitted ? 'Perbarui Tugas' : 'Kumpul Tugas')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
