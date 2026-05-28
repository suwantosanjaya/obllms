import { useState, useMemo } from 'react'

export type SortConfig = { key: string, direction: 'asc' | 'desc' } | null

// Default sort function using standard string/number comparison
const defaultSortFn = (a: any, b: any, key: string, direction: 'asc' | 'desc') => {
    // Navigate nested properties like "subject.code" or "department.name"
    const getValue = (obj: any, path: string) => path.split('.').reduce((acc, part) => acc && acc[part], obj);
    
    let aValue = getValue(a, key);
    let bValue = getValue(b, key);

    if (aValue === bValue) return 0;
    if (aValue == null) return direction === 'asc' ? -1 : 1;
    if (bValue == null) return direction === 'asc' ? 1 : -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
    }
    
    return direction === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
};

export function useClientTable<T>(
    data: T[],
    searchKeyFn: (item: T) => string,
    initialPageSize: number = 10
) {
    const [searchQuery, setSearchQuery] = useState('')
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(initialPageSize)
    const [sortConfig, setSortConfig] = useState<SortConfig>(null)

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            setSortConfig(null)
            return
        }
        setSortConfig({ key, direction })
    }

    // Reset to page 0 when search changes
    const handleSearch = (query: string) => {
        setSearchQuery(query)
        setPageIndex(0)
    }

    const filteredData = useMemo(() => {
        let result = data;
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase()
            result = result.filter(item => 
                searchKeyFn(item).toLowerCase().includes(lowerQuery)
            )
        }

        if (sortConfig) {
            result = [...result].sort((a, b) => defaultSortFn(a, b, sortConfig.key, sortConfig.direction));
        }

        return result;
    }, [data, searchQuery, searchKeyFn, sortConfig])

    const paginatedData = useMemo(() => {
        const start = pageIndex * pageSize
        return filteredData.slice(start, start + pageSize)
    }, [filteredData, pageIndex, pageSize])

    return {
        searchQuery,
        setSearchQuery: handleSearch,
        pageIndex,
        setPageIndex,
        pageSize,
        setPageSize: (size: number) => {
            setPageSize(size)
            setPageIndex(0)
        },
        sortConfig,
        handleSort,
        filteredData,
        paginatedData,
        totalItems: filteredData.length
    }
}
