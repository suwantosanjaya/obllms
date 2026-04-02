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
import { Plus, Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { createCourseModule } from '@/app/actions/courseActions'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function CreateModuleDialog({ courseId, clos }: { courseId: string, clos: { id: string, code: string }[] }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedClo, setSelectedClo] = useState<string>('')

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
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
            cloId: selectedClo === 'none' ? undefined : selectedClo
        })

        if (res.success) {
            setOpen(false)
            setSelectedClo('')
        } else {
            alert(res.error || "Gagal membuat modul")
        }

        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Tambah Topik/Minggu Baru</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
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
                            <Textarea
                                id="content"
                                name="content"
                                placeholder="Link presentasi, youtube, atau instruksi singkat..."
                                className="col-span-3 min-h-[80px]"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-sm">Pemetaan CLO</Label>
                            <div className="col-span-3">
                                <Select value={selectedClo} onValueChange={setSelectedClo}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih target capaian..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- Tanpa Pemetaan --</SelectItem>
                                        {clos.map(clo => (
                                            <SelectItem key={clo.id} value={clo.id}>
                                                {clo.code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                    </div>
                    <DialogFooter>
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
