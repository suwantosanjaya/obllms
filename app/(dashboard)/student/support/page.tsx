import { getStudentTickets } from '@/app/actions/supportActions'
import { CreateTicketDialog } from '@/app/components/student/CreateTicketDialog'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'
export default async function SupportPage() {
    const res = await getStudentTickets()
    console.log("SupportPage res:", res)
    const tickets = res.success ? (res.tickets || []) : []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pusat Dukungan (Helpdesk)</h1>
                    <p className="text-muted-foreground mt-1">Layanan bantuan mahasiswa untuk kendala akademik dan teknis.</p>
                </div>
                <CreateTicketDialog />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Subjek Keluhan</TableHead>
                            <TableHead>Tanggal Dibuat</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Balasan</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Belum ada tiket bantuan yang dibuat.</TableCell>
                            </TableRow>
                        ) : tickets.map((t: any) => (
                            <TableRow key={t.id}>
                                <TableCell className="font-medium">{t.subject}</TableCell>
                                <TableCell>{format(new Date(t.createdAt), 'dd MMM yyyy HH:mm')}</TableCell>
                                <TableCell>
                                    <Badge variant={t.status === 'OPEN' ? 'default' : t.status === 'IN_PROGRESS' ? 'secondary' : 'outline'}>
                                        {t.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {t.replyMessage ? (
                                        <div className="flex flex-col gap-1 max-w-[300px]">
                                            <span className="text-sm text-green-600 font-medium truncate">{t.replyMessage}</span>
                                            {t.replier && (
                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                    Dibalas oleh: {t.replier.name}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">Belum ada balasan</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
