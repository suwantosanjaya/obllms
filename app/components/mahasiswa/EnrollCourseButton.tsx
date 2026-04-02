'use client'

import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { enrollStudent } from '@/app/actions/courseActions'

export function EnrollCourseButton({ studentId, courseId, courseTitle }: { studentId: string; courseId: string; courseTitle: string }) {
    const [loading, setLoading] = useState(false)

    async function handleEnroll() {
        if (!confirm(`Apakah Anda yakin ingin mendaftar di kelas ${courseTitle}?`)) return

        setLoading(true)
        const res = await enrollStudent(studentId, courseId)
        if (!res.success) {
            alert(res.error || 'Gagal mendaftar')
        }
        setLoading(false)
    }

    return (
        <Button size="sm" onClick={handleEnroll} disabled={loading}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {loading ? 'Memproses...' : 'Daftar Kelas'}
        </Button>
    )
}
