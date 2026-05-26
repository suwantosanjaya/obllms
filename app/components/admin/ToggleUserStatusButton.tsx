'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleUserStatus } from '@/app/actions/adminActions'
import { useToast } from '@/hooks/use-toast'

export function ToggleUserStatusButton({ id, isActive, userName }: { id: string, isActive: boolean, userName: string }) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleToggle = async () => {
        setLoading(true)
        try {
            const res = await toggleUserStatus(id)
            if (res.success) {
                toast({
                    title: 'Berhasil',
                    description: `Status akun ${userName} berhasil diperbarui.`,
                })
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Gagal',
                    description: res.error || 'Terjadi kesalahan sistem.',
                })
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Gagal mengubah status akun.',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button 
            variant={isActive ? 'destructive' : 'default'} 
            size="sm" 
            onClick={handleToggle}
            disabled={loading}
        >
            {loading ? 'Proses...' : isActive ? 'Nonaktifkan' : 'Aktifkan'}
        </Button>
    )
}
