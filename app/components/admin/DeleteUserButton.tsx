'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteUser } from '@/app/actions/adminActions'

export function DeleteUserButton({ id, userName }: { id: string; userName: string }) {
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        if (!confirm(`Apakah Anda yakin ingin menghapus pengguna ${userName}?`)) return

        setLoading(true)
        const res = await deleteUser(id)
        if (!res.success) {
            alert(res.error || 'Gagal menghapus pengguna')
        }
        setLoading(false)
    }

    return (
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={loading} className="text-red-500 hover:text-red-700 hover:bg-red-100">
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
