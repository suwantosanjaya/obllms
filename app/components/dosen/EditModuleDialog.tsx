'use client'

import { useState, useEffect } from 'react'
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
import { Pencil, Loader2, CheckSquare, Square } from 'lucide-react'
import { updateCourseModule } from '@/app/actions/courseActions'
import { Badge } from '@/components/ui/badge'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

interface Clo { id: string; code: string; description?: string }
interface Module {
    id: string;
    title: string;
    content?: string | null;
    weekNumber?: number | null;
    moduleClos?: { id: string; clo: Clo }[];
    clo?: Clo | null;
}

export function EditModuleDialog({
    courseId,
    module,
    clos
}: {
    courseId: string;
    module: Module;
    clos: Clo[];
}) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [weekNumber, setWeekNumber] = useState(1)
    const [selectedClos, setSelectedClos] = useState<string[]>([])
    const [cloError, setCloError] = useState(false)

    useEffect(() => {
        if (open) {
            setTitle(module.title || '')
            setContent(module.content || '')
            setWeekNumber(module.weekNumber ?? 1)
            // Pre-fill selected CLOs from moduleClos junction or legacy cloId
            const existing = module.moduleClos && module.moduleClos.length > 0
                ? module.moduleClos.map(mc => mc.clo.id)
                : module.clo ? [module.clo.id] : []
            setSelectedClos(existing)
            setCloError(false)
        }
    }, [open, module])

    function toggleClo(id: string) {
        setCloError(false)
        setSelectedClos(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()

        if (selectedClos.length === 0) {
            setCloError(true)
            return
        }

        setIsLoading(true)
        const res = await updateCourseModule({
            moduleId: module.id,
            courseId,
            title,
            content,
            weekNumber,
            cloIds: selectedClos,
        })

        if (res.success) {
            setOpen(false)
        } else {
            alert(res.error || 'Gagal menyimpan perubahan')
        }
        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setCloError(false) }}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSave}>
                    <DialogHeader>
                        <DialogTitle>Edit Topik Mingguan</DialogTitle>
                        <DialogDescription>
                            Perbarui detail materi dan pemetaan CLO.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-week" className="text-right text-sm">Minggu Ke-</Label>
                            <Input
                                id="edit-week"
                                type="number"
                                min={1} max={16}
                                value={weekNumber}
                                onChange={e => setWeekNumber(parseInt(e.target.value))}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-title" className="text-right text-sm">Topik Materi</Label>
                            <Input
                                id="edit-title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="edit-content" className="text-right mt-3 text-sm">Deskripsi / Link Video</Label>
                            <div className="col-span-3">
                                <RichTextEditor 
                                    value={content}
                                    onChange={setContent}
                                    placeholder="Link presentasi, youtube, atau instruksi singkat..."
                                />
                            </div>
                        </div>

                        {/* Multi-select CLO */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right mt-1 text-sm">
                                Pemetaan CLO <span className="text-red-500">*</span>
                            </Label>
                            <div className="col-span-3 space-y-2">
                                {clos.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">Belum ada CLO yang tersedia.</p>
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
                                {cloError && <p className="text-xs text-red-500">Harap pilih minimal satu CLO.</p>}
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
                            Simpan Perubahan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
