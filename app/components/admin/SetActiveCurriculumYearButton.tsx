'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setActiveCurriculumYear } from '@/app/actions/adminActions'

export function SetActiveCurriculumYearButton({ id, name }: { id: string, name: string }) {
    const [loading, setLoading] = useState(false)

    async function handleSetActive() {
        if (!confirm(`Apakah Anda yakin ingin mengaktifkan tahun kurikulum ${name}?`)) return
        
        setLoading(true)
        const res = await setActiveCurriculumYear(id)
        if (!res.success) {
            alert(res.error || 'Gagal mengaktifkan tahun kurikulum')
        }
        setLoading(false)
    }

    return (
        <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSetActive} 
            disabled={loading}
        >
            <CheckCircle className="mr-2 h-4 w-4" />
            Set Aktif
        </Button>
    )
}
