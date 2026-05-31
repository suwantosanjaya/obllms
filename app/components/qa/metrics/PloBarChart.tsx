'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'

export default function PloBarChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Rata-rata Capaian PLO</CardTitle>
                    <CardDescription>Belum ada data PLO pada rentang yang dipilih.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const getColor = (average: number) => {
        if (average < 50) return '#ef4444' // red-500
        if (average >= 70) return '#22c55e' // green-500
        return '#f59e0b' // amber-500
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const ploData = payload[0].payload
            return (
                <div className="bg-white border p-3 rounded-lg shadow-lg">
                    <p className="font-bold text-sm mb-1">{ploData.code}</p>
                    <p className="text-xs text-gray-500 max-w-xs mb-2">{ploData.description}</p>
                    <p className="text-sm">
                        Rata-rata: <span className="font-bold">{ploData.average}</span>
                    </p>
                    <p className={`text-xs mt-1 ${ploData.average < 50 ? 'text-red-600' : ploData.average >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                        Status: {ploData.status}
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Rata-rata Capaian PLO</CardTitle>
                <CardDescription>Tingkat capaian agregat seluruh mahasiswa.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="code" tick={{ fontSize: 12 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Batas Kritis (50)', fill: '#ef4444', fontSize: 12 }} />
                            <ReferenceLine y={70} stroke="#22c55e" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Batas Aman (70)', fill: '#22c55e', fontSize: 12 }} />
                            <Bar dataKey="average" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getColor(entry.average || 0)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
