'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X, Loader2, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { setSystemSetting } from '@/app/actions/systemSettingActions'

export function AcademicYearSettingsClient({ initialYears }: { initialYears: string[] }) {
    const [years, setYears] = useState<string[]>(initialYears)
    const [newYear, setNewYear] = useState('')
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleAdd = () => {
        if (!newYear) return
        if (years.includes(newYear)) {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Tahun ajaran ini sudah ada.' })
            return
        }
        
        // Basic validation format (e.g., 2025/2026)
        if (!/^\d{4}\/\d{4}$/.test(newYear)) {
            toast({ variant: 'destructive', title: 'Format Tidak Valid', description: 'Gunakan format YYYY/YYYY (contoh: 2025/2026)' })
            return
        }

        setYears([...years, newYear].sort())
        setNewYear('')
    }

    const handleRemove = (yearToRemove: string) => {
        setYears(years.filter(y => y !== yearToRemove))
    }

    const handleSave = async () => {
        setLoading(true)
        const res = await setSystemSetting('ACADEMIC_YEARS', JSON.stringify(years))
        setLoading(false)

        if (res.success) {
            toast({ title: 'Berhasil', description: 'Daftar Tahun Ajaran berhasil disimpan.' })
        } else {
            toast({ variant: 'destructive', title: 'Gagal', description: res.error || 'Terjadi kesalahan sistem.' })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Master Data Tahun Ajaran</CardTitle>
                <CardDescription>Kelola daftar tahun ajaran yang akan muncul di dropdown (contoh: saat Buka Kelas Baru).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-2 items-end max-w-sm">
                    <div className="space-y-1 flex-1">
                        <Label htmlFor="newYear">Tambah Tahun Ajaran</Label>
                        <Input 
                            id="newYear" 
                            placeholder="Contoh: 2025/2026" 
                            value={newYear}
                            onChange={(e) => setNewYear(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                    </div>
                    <Button type="button" onClick={handleAdd} variant="secondary">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah
                    </Button>
                </div>

                <div className="border rounded-md p-4">
                    <Label className="text-muted-foreground mb-3 block">Daftar Tahun Ajaran Tersimpan:</Label>
                    <div className="flex flex-wrap gap-2">
                        {years.map(year => (
                            <div key={year} className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full text-sm font-medium">
                                {year}
                                <button type="button" onClick={() => handleRemove(year)} className="text-muted-foreground hover:text-destructive transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                        {years.length === 0 && <span className="text-sm text-muted-foreground italic">Belum ada data.</span>}
                    </div>
                </div>

                <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Simpan Perubahan
                </Button>
            </CardContent>
        </Card>
    )
}
