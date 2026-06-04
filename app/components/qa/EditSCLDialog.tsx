'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Settings } from 'lucide-react'
import { updateCurriculumSubjectSCL } from '@/app/actions/curriculumSubjectActions'

export function EditSCLDialog({ 
    curriculumSubject,
    subjectTitle,
    departmentId,
    curriculumYearId,
    isLocked
}: { 
    curriculumSubject: any,
    subjectTitle: string,
    departmentId: string,
    curriculumYearId: string,
    isLocked?: boolean 
}) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    // Form state
    const [sclMethod, setSclMethod] = useState(curriculumSubject.sclMethod || 'NONE')
    const [isEntrepreneurshipEnabled, setIsEntrepreneurshipEnabled] = useState(curriculumSubject.isEntrepreneurshipEnabled ?? false)
    const [isLeadershipEnabled, setIsLeadershipEnabled] = useState(curriculumSubject.isLeadershipEnabled ?? false)
    const [isIndustrySkillEnabled, setIsIndustrySkillEnabled] = useState(curriculumSubject.isIndustrySkillEnabled ?? false)
    const [isEmployabilitySkillEnabled, setIsEmployabilitySkillEnabled] = useState(curriculumSubject.isEmployabilitySkillEnabled ?? false)

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (isLocked) return

        setIsLoading(true)

        const result = await updateCurriculumSubjectSCL(
            curriculumSubject.id,
            departmentId,
            curriculumYearId,
            {
                sclMethod,
                isEntrepreneurshipEnabled,
                isLeadershipEnabled,
                isIndustrySkillEnabled,
                isEmployabilitySkillEnabled
            }
        )

        setIsLoading(false)

        if (result.success) {
            toast({ title: 'Sukses', description: 'Pengaturan SCL berhasil diperbarui.' })
            setOpen(false)
        } else {
            toast({ title: 'Error', description: result.error || 'Terjadi kesalahan', variant: 'destructive' })
        }
    }

    // Reset when dialog opens
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            setSclMethod(curriculumSubject.sclMethod || 'NONE')
            setIsEntrepreneurshipEnabled(curriculumSubject.isEntrepreneurshipEnabled ?? false)
            setIsLeadershipEnabled(curriculumSubject.isLeadershipEnabled ?? false)
            setIsIndustrySkillEnabled(curriculumSubject.isIndustrySkillEnabled ?? false)
            setIsEmployabilitySkillEnabled(curriculumSubject.isEmployabilitySkillEnabled ?? false)
        }
        setOpen(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5" disabled={isLocked}>
                    <Settings className="w-3.5 h-3.5" />
                    Atur SCL
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Pengaturan SCL Mata Kuliah</DialogTitle>
                        <DialogDescription>
                            Atur metode SCL dan kriteria Soft Skills untuk mata kuliah <strong>{subjectTitle}</strong> di kurikulum ini.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-6 py-6">
                        {/* SCL Method Dropdown */}
                        <div className="space-y-3">
                            <div>
                                <Label className="text-base font-semibold">Metode Pembelajaran SCL</Label>
                                <p className="text-sm text-muted-foreground mt-1">Pilih metode utama Student Centered Learning.</p>
                            </div>
                            <Select disabled={isLocked} value={sclMethod} onValueChange={setSclMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih metode SCL" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NONE">Tidak Ada (Metode Reguler)</SelectItem>
                                    <SelectItem value="CASE_METHOD">Case Method (Pemecahan Kasus)</SelectItem>
                                    <SelectItem value="PROJECT_BASED">Project Based Learning (PjBL)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="h-px bg-border my-2" />

                        {/* SCL Skills Switches */}
                        <div className="space-y-4">
                            <div>
                                <Label className="text-base font-semibold">Komponen Penilaian Soft Skills</Label>
                                <p className="text-sm text-muted-foreground mt-1">Aktifkan soft skills yang diwajibkan untuk dinilai dosen di mata kuliah ini.</p>
                            </div>
                            
                            <div className="grid gap-4 bg-muted/30 p-4 rounded-xl border">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Kewirausahaan (Entrepreneurship)</Label>
                                        <p className="text-xs text-muted-foreground">Kreativitas dan inovasi</p>
                                    </div>
                                    <Switch disabled={isLocked} checked={isEntrepreneurshipEnabled} onCheckedChange={setIsEntrepreneurshipEnabled} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Kepemimpinan (Leadership)</Label>
                                        <p className="text-xs text-muted-foreground">Kemampuan memimpin dan kolaborasi</p>
                                    </div>
                                    <Switch disabled={isLocked} checked={isLeadershipEnabled} onCheckedChange={setIsLeadershipEnabled} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Wawasan Industri (Industry Knowledge)</Label>
                                        <p className="text-xs text-muted-foreground">Pemahaman praktik industri nyata</p>
                                    </div>
                                    <Switch disabled={isLocked} checked={isIndustrySkillEnabled} onCheckedChange={setIsIndustrySkillEnabled} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Kesiapan Kerja (Employability)</Label>
                                        <p className="text-xs text-muted-foreground">Profesionalisme dan etika kerja</p>
                                    </div>
                                    <Switch disabled={isLocked} checked={isEmployabilitySkillEnabled} onCheckedChange={setIsEmployabilitySkillEnabled} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={isLoading || isLocked}>
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : 'Simpan Peraturan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
