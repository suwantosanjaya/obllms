import { TableHead } from '@/components/ui/table'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type SortConfig = { key: string, direction: 'asc' | 'desc' } | null

interface SortableTableHeadProps {
    label: string
    sortKey: string
    currentSort: SortConfig
    onSort: (key: string) => void
    className?: string
    rowSpan?: number
}

export function SortableTableHead({ label, sortKey, currentSort, onSort, className = '', rowSpan }: SortableTableHeadProps) {
    const isActive = currentSort?.key === sortKey

    return (
        <TableHead className={className} rowSpan={rowSpan}>
            <Button
                variant="ghost"
                onClick={() => onSort(sortKey)}
                className="-ml-4 h-8 data-[state=open]:bg-accent hover:bg-transparent"
            >
                <span>{label}</span>
                {isActive ? (
                    currentSort.direction === 'asc' ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronDown className="ml-2 h-4 w-4" />
                    )
                ) : (
                    <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />
                )}
            </Button>
        </TableHead>
    )
}
