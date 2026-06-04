import { getSessionUser } from '@/app/actions/userActions'
import { getAllTickets } from '@/app/actions/supportActions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { AdminSupportClient } from '@/app/components/qa/AdminSupportClient'

export default async function QaSupportPage() {
    const user = await getSessionUser()
    if (!user || user.activeRole !== 'qa') {
        redirect('/login')
    }

    const ticketsRes = await getAllTickets(user.activeDepartmentId || undefined)
    const tickets = ticketsRes.success ? (ticketsRes.tickets || []) : []

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pusat Dukungan (Helpdesk)</h1>
                <p className="text-muted-foreground mt-2">Daftar keluhan dan pertanyaan dari mahasiswa Program Studi.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Tiket Bantuan</CardTitle>
                    <CardDescription>Balas tiket mahasiswa untuk membantu menyelesaikan kendala mereka.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AdminSupportClient tickets={tickets} />
                </CardContent>
            </Card>
        </div>
    )
}
