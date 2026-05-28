'use client'

import { useState } from 'react'
import { KeyRound, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { adminResetPassword } from '@/app/actions/authActions'
import { useToast } from '@/hooks/use-toast'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export function ResetPasswordButton({ id, userName }: { id: string; userName: string }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const { toast } = useToast()

    async function handleReset() {
        setLoading(true)
        const res = await adminResetPassword(id)
        if (res.success) {
            toast({
                title: 'Password Direset',
                description: `Password untuk ${userName} berhasil dikembalikan ke default.`,
            })
            setOpen(false)
        } else {
            toast({
                title: 'Gagal mereset password',
                description: res.error,
                variant: 'destructive'
            })
        }
        setLoading(false)
    }

    return (
        <>
            <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setOpen(true)} 
                disabled={loading}
                title="Reset Password ke 123456"
                className="h-8 w-8"
            >
                <KeyRound className="h-4 w-4" />
                <span className="sr-only">Reset Password</span>
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Reset Password</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin mereset password untuk <strong>{userName}</strong>?
                            <br /><br />
                            Password akan dikembalikan ke <strong>"123456"</strong> dan pengguna akan diwajibkan untuk menggantinya pada saat login berikutnya.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Batal</Button>
                        <Button variant="destructive" onClick={handleReset} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Ya, Reset Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
