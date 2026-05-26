'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { updateCLO } from '@/app/actions/obeActions'

export function EditCLODialog({ 
    clo,
    plos 
}: { 
    clo: { id: string, code: string, description: string, plos: { id: string }[] },
    plos: { id: string, code: string }[] 
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        code: clo.code,
        description: clo.description,
    })

    const initialPLOs = clo.plos ? clo.plos.map(plo => plo.id) : []
    const [selectedPLOs, setSelectedPLOs] = useState<string[]>(initialPLOs)

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
        }

        const result = await updateCLO(clo.id, payload)

        if (result.success) {
            toast({ title: 'Success', description: 'CLO berhasil diperbarui.' })
            setOpen(false)
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' })
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><Pencil className="w-4 h-4 text-blue-600" /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit CLO</DialogTitle>
                        <DialogDescription>
                            Perbarui kode, deskripsi, dan relasi PLO. Bobot diatur di tab Pemetaan CLO-Subject.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Kode</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Alignment (PLOs)</Label>
                            <div className="flex flex-col gap-2 border rounded-md p-3 max-h-32 overflow-y-auto">
                                {plos.length === 0 && (
                                    <span className="text-sm text-muted-foreground">No PLOs available.</span>
                                )}
                                {plos.map(plo => (
                                    <div key={plo.id} className="flex flex-row items-start space-x-2">
                                        <Checkbox 
                                            id={`edit-plo-${plo.id}`} 
                                            checked={selectedPLOs.includes(plo.id)}
                                            onCheckedChange={() => togglePLO(plo.id)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor={`edit-plo-${plo.id}`}
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
