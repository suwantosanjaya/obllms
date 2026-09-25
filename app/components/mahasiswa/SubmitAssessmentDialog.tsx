'use client'

import { useState } from 'react'
import { Upload, Plus, Trash2 } from 'lucide-react'
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
import { useRouter } from 'next/navigation'

export function SubmitAssessmentDialog({ assessmentId, courseId, studentId, isSubmitted, title, format = 'upload' }: { assessmentId: string, courseId: string, studentId: string, isSubmitted: boolean, title: string, format?: string }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [urls, setUrls] = useState<string[]>([''])

    const addUrlField = () => setUrls([...urls, ''])
    const removeUrlField = (index: number) => {
        const newUrls = [...urls]
        newUrls.splice(index, 1)
        setUrls(newUrls.length > 0 ? newUrls : [''])
    }
    const updateUrl = (index: number, value: string) => {
        const newUrls = [...urls]
        newUrls[index] = value
        setUrls(newUrls)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Filter empty urls
        const validUrls = urls.filter(url => url.trim() !== '')

        if (validUrls.length === 0) {
            setError('Masukkan setidaknya satu URL tugas')
            setLoading(false)
            return
        }

        const res = await submitAssessment(assessmentId, studentId, validUrls)

        if (res.success) {
            setOpen(false)
        } else {
            setError(res.error || 'Gagal mengirim tugas')
        }
        setLoading(false)
    }

    if (format === 'quiz') {
        return (
            <Button variant={isSubmitted ? "outline" : "default"} size="sm" onClick={() => router.push(`/student/course/${courseId}/assessment/${assessmentId}/take`)}>
                {isSubmitted ? 'Lihat Hasil Kuis' : 'Kerjakan Kuis Sekarang'}
            </Button>
        )
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (isOpen && urls.length === 0) setUrls([''])
        }}>
            <DialogTrigger asChild>
                <Button variant={isSubmitted ? "outline" : "default"} size="sm" className="w-full sm:w-auto">
                    <Upload className="mr-2 h-4 w-4" />
                    {isSubmitted ? 'Edit Pengumpulan' : 'Kumpul Tugas'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Kumpul Tugas: {title}</DialogTitle>
                        <DialogDescription>
                            Masukkan link URL dari dokumen atau repository tugas Anda. Anda dapat menambahkan lebih dari satu link.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 py-4">
                        {urls.map((url, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Label htmlFor={`fileUrl-${index}`} className="sr-only">
                                    URL Tugas {index + 1}
                                </Label>
                                <Input
                                    id={`fileUrl-${index}`}
                                    value={url}
                                    onChange={(e) => updateUrl(index, e.target.value)}
                                    placeholder="https://docs.google.com/..."
                                    className="flex-1"
                                    type="url"
                                    required={index === 0}
                                />
                                {urls.length > 1 && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeUrlField(index)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addUrlField} className="mt-2 w-fit">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Link Lainnya
                        </Button>
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
