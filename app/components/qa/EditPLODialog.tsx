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
import { updatePLO } from '@/app/actions/obeActions'

export function EditPLODialog({ 
    plo, 
    graduateProfiles 
}: { 
    plo: { id: string, code: string, description: string, graduateProfiles: { id: string }[] },
    graduateProfiles: { id: string, code: string, title: string }[] 
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        code: plo.code,
        description: plo.description
    })
    
    // Initialize selected GPs based on the passed PLO data
    const initialGPs = plo.graduateProfiles ? plo.graduateProfiles.map(gp => gp.id) : []
    const [selectedGPs, setSelectedGPs] = useState<string[]>(initialGPs)

    const toggleGP = (id: string) => {
        setSelectedGPs(prev => 
            prev.includes(id) ? prev.filter(gpId => gpId !== id) : [...prev, id]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            ...formData,
            graduateProfileIds: selectedGPs
        }

        const result = await updatePLO(plo.id, payload)

        if (result.success) {
            toast({ title: 'Success', description: 'Program Learning Outcome (PLO) updated successfully.' })
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
                        <DialogTitle>Edit Program Learning Outcome</DialogTitle>
                        <DialogDescription>
                            Update the PLO information and its alignment to Graduate Profiles.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Code</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Alignment (Graduate Profiles)</Label>
                            <div className="flex flex-col gap-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                                {graduateProfiles.length === 0 && (
                                    <span className="text-sm text-muted-foreground">No graduate profiles available.</span>
                                )}
                                {graduateProfiles.map(gp => (
                                    <div key={gp.id} className="flex flex-row items-start space-x-2">
                                        <Checkbox 
                                            id={`edit-gp-${gp.id}`} 
                                            checked={selectedGPs.includes(gp.id)}
                                            onCheckedChange={() => toggleGP(gp.id)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor={`edit-gp-${gp.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {gp.code} - {gp.title}
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
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
                            {loading ? 'Menyimpan...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
