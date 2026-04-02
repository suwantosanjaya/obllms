import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Construction } from 'lucide-react'

export default function PlaceholderPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Manajemen Hak Akses</h1>
                <p className="text-muted-foreground mt-1">Konfigurasi peran dan izin spesifik aplikasi.</p>
            </div>
            <Card>
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <Construction className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Fitur Sedang Dalam Pengembangan</CardTitle>
                    <CardDescription>
                        Modul ini belum tersedia pada versi Alpha.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground pt-4">
                    Silakan kembali pada pembaruan aplikasi berikutnya.
                </CardContent>
            </Card>
        </div>
    )
}
