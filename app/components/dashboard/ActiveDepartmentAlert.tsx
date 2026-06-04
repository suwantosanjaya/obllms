import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Building2 } from 'lucide-react'

interface DepartmentInfo {
    name: string
    code?: string
}

export function ActiveDepartmentAlert({ department }: { department?: DepartmentInfo | null }) {
    if (!department) return null

    return (
        <Alert className="mb-6 bg-primary/10 border-primary/20 text-primary">
            <Building2 className="h-5 w-5 !text-primary" />
            <AlertTitle className="font-semibold text-primary">
                Program Studi Aktif: {department.name} {department.code ? `(${department.code})` : ''}
            </AlertTitle>
            <AlertDescription className="text-primary/80">
                Informasi dan data yang ditampilkan pada halaman ini dikhususkan untuk program studi yang sedang Anda kelola saat ini.
            </AlertDescription>
        </Alert>
    )
}
