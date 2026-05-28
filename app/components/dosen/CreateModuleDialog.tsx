'use client'

import { useState } from 'react'
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
import { Plus, Loader2, CheckSquare, Square } from 'lucide-react'
import { createCourseModule } from '@/app/actions/courseActions'
import { Badge } from '@/components/ui/badge'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

export function CreateModuleDialog({ courseId, clos }: { courseId: string, clos: { id: string, code: string, description?: string }[] }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedClos, setSelectedClos] = useState<string[]>([])
    const [cloError, setCloError] = useState(false)
    const [content, setContent] = useState('')

    function toggleClo(id: string) {
        setCloError(false)
        setSelectedClos(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (selectedClos.length === 0) {
            setCloError(true)
            return
        }

        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const title = formData.get('title') as string
        const content = formData.get('content') as string
        const weekNumber = parseInt(formData.get('weekNumber') as string, 10)

        const res = await createCourseModule({
            courseId,
            title,
            content,
            weekNumber,
            cloIds: selectedClos
        })

        if (res.success) {
            setOpen(false)
            setSelectedClos([])
            setContent('')
            setCloError(false)
        } else {
            alert(res.error || "Gagal membuat modul")
        }

        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) { setSelectedClos([]); setContent(''); setCloError(false) } }}>
            <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Tambah Topik/Minggu Baru</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Buat Topik Mingguan</DialogTitle>
                        <DialogDescription>
                            Tambahkan materi dan petakan ke capaian pembelajaran (CLO).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="weekNumber" className="text-right text-sm">
                                Minggu Ke-
                            </Label>
                            <Input
                                id="weekNumber"
                                name="weekNumber"
                                type="number"
                                min={1}
                                max={16}
                                defaultValue={1}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right text-sm">
                                Topik Materi
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Misal: Pengenalan HTML & CSS"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="content" className="text-right mt-3 text-sm">
                                Deskripsi / Link Video
                            </Label>
                            <div className="col-span-3">
                                <RichTextEditor 
                                    value={content}
                                    onChange={setContent}
                                    placeholder="Link presentasi, youtube, atau instruksi singkat..."
                                />
                                <input type="hidden" name="content" value={content} />
                            </div>
                        </div>

                        {/* Multi-select CLO */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right mt-1 text-sm">
                                Pemetaan CLO <span className="text-red-500">*</span>
                            </Label>
                            <div className="col-span-3 space-y-2">
                                {clos.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">Belum ada CLO yang tersedia untuk kelas ini.</p>
                                ) : (
                                    <div className={`border rounded-md p-2 space-y-1 ${cloError ? 'border-red-500 bg-red-50' : ''}`}>
                                        {clos.map(clo => {
                                            const isSelected = selectedClos.includes(clo.id)
                                            return (
                                                <button
                                                    key={clo.id}
                                                    type="button"
                                                    onClick={() => toggleClo(clo.id)}
                                                    className={`w-full flex items-start gap-2 px-2 py-2 rounded text-sm transition-colors text-left
                                                        ${isSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                                                >
                                                    {isSelected
                                                        ? <CheckSquare className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                                                        : <Square className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />
                                                    }
                                                    <span className="flex flex-col">
                                                        <span className="font-semibold">{clo.code}</span>
                                                        {clo.description && (
                                                            <span className={`text-xs leading-snug ${isSelected ? 'text-primary/80' : 'text-muted-foreground'}`}>
                                                                {clo.description}
                                                            </span>
                                                        )}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                                {cloError && (
                                    <p className="text-xs text-red-500">Harap pilih minimal satu CLO.</p>
                                )}
                                {selectedClos.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedClos.map(id => {
                                            const clo = clos.find(c => c.id === id)
                                            return clo ? <Badge key={id} variant="secondary" className="text-xs">{clo.code}</Badge> : null
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>Batal</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Simpan Modul
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
