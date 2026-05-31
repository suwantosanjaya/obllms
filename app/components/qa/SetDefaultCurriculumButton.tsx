'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { setActiveCurriculum } from '@/app/actions/obeActions'
import { useToast } from '@/hooks/use-toast'

export function SetDefaultCurriculumButton({ yearId, departmentId, isActive }: { yearId: string, departmentId: string, isActive: boolean }) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const handleSetDefault = async () => {
        setIsLoading(true)
        const res = await setActiveCurriculum(yearId, departmentId)
        setIsLoading(false)
        if (res.success) {
            toast({ title: 'Berhasil', description: 'Kurikulum berhasil diatur sebagai default.' })
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        }
    }

    if (isActive) return null

    return (
        <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
            onClick={handleSetDefault}
            disabled={isLoading}
        >
            <Star className="w-4 h-4 mr-2" />
            Jadikan Default
        </Button>
    )
}
