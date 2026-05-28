'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
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
        <div className="flex items-center space-x-2">
            <Switch 
                id={`status-switch-${id}`} 
                checked={isActive}
                disabled={loading}
                onCheckedChange={handleToggle}
            />
            <Label htmlFor={`status-switch-${id}`} className={`min-w-[70px] text-left cursor-pointer ${isActive ? 'text-green-600' : 'text-muted-foreground'}`}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : (isActive ? 'Aktif' : 'Nonaktif')}
            </Label>
        </div>
    )
}
