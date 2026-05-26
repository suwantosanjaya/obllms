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
import { createPLO } from '@/app/actions/obeActions'

export function CreatePLODialog({ graduateProfiles, selectedYearId, departmentId }: { graduateProfiles: { id: string, code: string, title: string }[], selectedYearId?: string, departmentId?: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        code: '',
        description: ''
    })
    
    const [selectedGPs, setSelectedGPs] = useState<string[]>([])

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
            graduateProfileIds: selectedGPs,
            curriculumYearId: selectedYearId,
            departmentId: departmentId
        }

        const result = await createPLO(payload)

        if (result.success) {
            toast({ title: 'Success', description: 'Program Learning Outcome (PLO) created successfully.' })
            setOpen(false)
            setFormData({ code: '', description: '' })
            setSelectedGPs([])
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' })
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> Add PLO</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Program Learning Outcome</DialogTitle>
                        <DialogDescription>
                            Create a new PLO and link it to Graduate Profiles.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Code</Label>
                            <Input
                                id="code"
                                placeholder="e.g., PLO-1"
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
                                            id={`gp-${gp.id}`} 
                                            checked={selectedGPs.includes(gp.id)}
                                            onCheckedChange={() => toggleGP(gp.id)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor={`gp-${gp.id}`}
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
                                placeholder="Description of the PLO..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
