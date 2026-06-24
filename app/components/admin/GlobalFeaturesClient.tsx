'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { setSystemSetting } from '@/app/actions/systemSettingActions'

export function GlobalFeaturesClient({
    universityId,
    initialSrl,
    initialGamification,
    initialEws
}: {
    universityId?: string | null,
    initialSrl: boolean,
    initialGamification: boolean,
    initialEws: boolean
}) {
    const { toast } = useToast()
    const [srl, setSrl] = useState(initialSrl)
    const [gamification, setGamification] = useState(initialGamification)
    const [ews, setEws] = useState(initialEws)
    const [loading, setLoading] = useState(false)

    async function handleToggle(key: string, currentValue: boolean, setter: (val: boolean) => void) {
        setLoading(true)
        const newValue = !currentValue
        // Optimistic UI update
        setter(newValue)

        const res = await setSystemSetting(key, newValue ? 'true' : 'false', universityId)
        
        if (!res.success) {
            // Revert on failure
            setter(currentValue)
            toast({ title: 'Gagal', description: 'Gagal menyimpan pengaturan fitur.', variant: 'destructive' })
        } else {
            toast({ title: 'Berhasil', description: 'Pengaturan fitur berhasil diperbarui.' })
        }
        setLoading(false)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Konfigurasi Fitur Global</CardTitle>
                <CardDescription>Mengaktifkan atau menonaktifkan elemen LMS secara global berdasarkan 30 elemen OBL.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base">Modul Self-Regulated Learning (SRL)</Label>
                        <p className="text-sm text-muted-foreground">Aktifkan fitur penetapan tujuan & refleksi mandiri.</p>
                    </div>
                    <Switch 
                        checked={srl} 
                        onCheckedChange={() => handleToggle('FEATURE_SRL', srl, setSrl)}
                        disabled={loading}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base">Gamifikasi & Progress Analytics</Label>
                        <p className="text-sm text-muted-foreground">Tampilkan lencana dan leaderboard.</p>
                    </div>
                    <Switch 
                        checked={gamification} 
                        onCheckedChange={() => handleToggle('FEATURE_GAMIFICATION', gamification, setGamification)}
                        disabled={loading}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base">Sistem Peringatan Dini (Intervensi)</Label>
                        <p className="text-sm text-muted-foreground">Analitik untuk mahasiswa berisiko (At-Risk).</p>
                    </div>
                    <Switch 
                        checked={ews} 
                        onCheckedChange={() => handleToggle('FEATURE_EWS', ews, setEws)}
                        disabled={loading}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
