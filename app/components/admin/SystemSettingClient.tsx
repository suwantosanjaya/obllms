'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { setSystemSetting } from '@/app/actions/systemSettingActions'

export function AchievementThresholdClient({ initialPass, initialModerate }: { initialPass: string, initialModerate: string }) {
    const { toast } = useToast()
    const [passThreshold, setPassThreshold] = useState(initialPass)
    const [moderateThreshold, setModerateThreshold] = useState(initialModerate)
    const [loading, setLoading] = useState(false)

    async function handleSave() {
        setLoading(true)
        const res1 = await setSystemSetting('PASS_THRESHOLD', passThreshold)
        const res2 = await setSystemSetting('MODERATE_THRESHOLD', moderateThreshold)
        setLoading(false)

        if (res1.success && res2.success) {
            toast({ title: 'Berhasil', description: 'Rentang nilai capaian berhasil disimpan.' })
        } else {
            toast({ title: 'Gagal', description: 'Gagal menyimpan pengaturan.', variant: 'destructive' })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Batas Status Capaian Lulusan (PLO/CLO)</CardTitle>
                <CardDescription>
                    Atur batas minimum untuk menentukan apakah capaian pembelajaran berstatus &quot;Tercapai&quot; atau &quot;Sedang&quot;. Nilai di bawah status sedang akan dianggap &quot;Kurang&quot;.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Batas Nilai Tercapai (Lulus)</Label>
                        <Input 
                            type="number" 
                            step="0.01" 
                            value={passThreshold} 
                            onChange={e => setPassThreshold(e.target.value)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Batas Nilai Sedang</Label>
                        <Input 
                            type="number" 
                            step="0.01" 
                            value={moderateThreshold} 
                            onChange={e => setModerateThreshold(e.target.value)} 
                        />
                    </div>
                </div>
                <div className="flex justify-end pt-2">
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Simpan Pengaturan Capaian'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
