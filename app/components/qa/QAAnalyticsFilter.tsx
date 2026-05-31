'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function QAAnalyticsFilter({ curriculumYears, angkatanList, activeCurriculumId, activeAngkatan }: { curriculumYears: any[], angkatanList: number[], activeCurriculumId?: string, activeAngkatan?: number }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const currentAngkatan = activeAngkatan ? activeAngkatan.toString() : (angkatanList.length > 0 ? angkatanList[0].toString() : '')

    const handleCurriculumChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('curriculumId', val)
        router.push(`?${params.toString()}`)
    }

    const handleAngkatanChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('angkatan', val)
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter Kurikulum:</span>
                <Select value={activeCurriculumId || ''} onValueChange={handleCurriculumChange}>
                    <SelectTrigger className="w-[180px] bg-white">
                        <SelectValue placeholder="Pilih Kurikulum" />
                    </SelectTrigger>
                    <SelectContent>
                        {curriculumYears.map(cy => (
                            <SelectItem key={cy.id} value={cy.id}>{cy.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            {angkatanList.length > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter Angkatan:</span>
                    <Select value={currentAngkatan} onValueChange={handleAngkatanChange}>
                        <SelectTrigger className="w-[150px] bg-white">
                            <SelectValue placeholder="Pilih Angkatan" />
                        </SelectTrigger>
                        <SelectContent>
                            {angkatanList.map(angkatan => (
                                <SelectItem key={angkatan} value={angkatan.toString()}>{angkatan}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    )
}
