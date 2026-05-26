import { getSessionUser } from '@/app/actions/userActions'
import { redirect } from 'next/navigation'
import { DepartmentSelector } from './DepartmentSelector'
import { GraduationCap } from 'lucide-react'

export default async function SelectProdiPage() {
    const user = await getSessionUser()

    if (!user) {
        redirect('/')
    }

    if (!user.departments || user.departments.length === 0) {
        // No department attached, just go to role dashboard directly
        redirect(`/${user.activeRole}`)
    }

    if (user.departments.length === 1) {
        // Only one department, active is auto-set in login or getSessionUser
        redirect(`/${user.activeRole}`)
    }

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-8 bg-muted/10 py-12 px-4">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">Pilih Konteks Department</h1>
                <p className="text-lg text-muted-foreground">Akun Anda terdaftar pada lebih dari satu Program Studi. Silakan pilih salah satu untuk sesi ini.</p>
            </div>
            <DepartmentSelector departments={user.departments} role={user.activeRole || ''} />
        </div>
    )
}
