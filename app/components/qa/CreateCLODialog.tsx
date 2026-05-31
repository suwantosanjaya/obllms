'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { createCLO } from '@/app/actions/obeActions'

export function CreateCLODialog({ 
    plos,
    departmentId,
    selectedYearId
}: { 
    plos: { id: string, code: string }[],
    departmentId?: string,
    selectedYearId?: string
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        code: '',
        description: ''
    })
    
    const [selectedPLOs, setSelectedPLOs] = useState<string[]>([])

    const togglePLO = (id: string) => {
        setSelectedPLOs(prev => 
            prev.includes(id) ? prev.filter(ploId => ploId !== id) : [...prev, id]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            ...formData,
            ploIds: selectedPLOs,
            departmentId: departmentId,
            curriculumYearId: selectedYearId
        }

        const result = await createCLO(payload)

        if (result.success) {
            toast({ title: 'Success', description: 'Course Learning Outcome (CLO) berhasil dibuat.' })
            setOpen(false)
            setFormData({ code: '', description: '' })
            setSelectedPLOs([])
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' })
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> Tambah CLO</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Tambah Course Learning Outcome</DialogTitle>
                        <DialogDescription>
                            Buat CLO baru dan petakan ke PLO.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Kode</Label>
                            <Input
                                id="code"
                                placeholder="misal: CLO-1"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Penyelarasan (PLO)</Label>
                            <div className="flex flex-col gap-2 border rounded-md p-3 max-h-32 overflow-y-auto">
                                {plos.length === 0 && (
                                    <span className="text-sm text-muted-foreground">Data PLO tidak tersedia.</span>
                                )}
                                {plos.map(plo => (
                                    <div key={plo.id} className="flex flex-row items-start space-x-2">
                                        <Checkbox 
                                            id={`plo-${plo.id}`} 
                                            checked={selectedPLOs.includes(plo.id)}
                                            onCheckedChange={() => togglePLO(plo.id)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor={`plo-${plo.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {plo.code}
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                placeholder="Deskripsi CLO..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
