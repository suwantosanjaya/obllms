'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function CurriculumYearSelector({ 
    years, 
    activeYearId 
}: { 
    years: { id: string, name: string }[], 
    activeYearId: string | null 
}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const currentYearId = searchParams.get('yearId') || activeYearId || ''

    const handleChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set('yearId', value)
        } else {
            params.delete('yearId')
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Tahun Kurikulum:</span>
            <Select value={currentYearId} onValueChange={handleChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                    {years.map(year => (
                        <SelectItem key={year.id} value={year.id}>
                            {year.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
