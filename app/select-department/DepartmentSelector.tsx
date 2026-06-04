'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { setActiveProdiCookie } from '@/app/actions/userActions'
import { useUserStore } from '@/lib/store/useUserStore'
import { GraduationCap, Loader2 } from 'lucide-react'

export function DepartmentSelector({ departments, role }: { departments: any[], role: string }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const router = useRouter()

    const handleSelect = async (departmentId: string) => {
        setLoadingId(departmentId)
        await setActiveProdiCookie(departmentId)
        useUserStore.getState().setActiveDepartmentId(departmentId)
        router.push(`/${role}`)
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
            {departments.map(dept => (
                <Card key={dept.id} className="hover:border-primary transition-colors cursor-pointer flex flex-col h-full" onClick={() => handleSelect(dept.id)}>
                    <CardHeader>
                        <div className="p-3 bg-primary/10 w-fit rounded-lg mb-4">
                            <GraduationCap className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{dept.name}</CardTitle>
                        <CardDescription>Kode: {dept.code}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-6">
                        <Button 
                            className="w-full" 
                            variant="default"
                            disabled={loadingId !== null}
                        >
                            {loadingId === dept.id ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Masuk...</>
                            ) : (
                                'Masuk sebagai ' + role.toUpperCase()
                            )}
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
