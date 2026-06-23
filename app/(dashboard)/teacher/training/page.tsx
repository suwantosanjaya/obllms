import { getTrainingModules } from '@/app/actions/trainingActions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, FileText, MonitorPlay, Link as LinkIcon } from 'lucide-react'

export default async function TrainingPage() {
    const res = await getTrainingModules()
    const modules = res.success ? (res.modules || []) : []

    const getRandomColor = (name: string) => {
        const colors = [
            'bg-blue-100 text-blue-800',
            'bg-green-100 text-green-800',
            'bg-purple-100 text-purple-800',
            'bg-amber-100 text-amber-800',
            'bg-rose-100 text-rose-800',
            'bg-indigo-100 text-indigo-800'
        ]
        let sum = 0
        for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
        return colors[sum % colors.length]
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pusat Pelatihan Dosen (Faculty Training)</h1>
                <p className="text-muted-foreground mt-1">Tingkatkan pemahaman Anda tentang Outcome Learning dan penggunaan sistem OLIMS.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((m: any) => (
                    <Card key={m.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        {m.mediaType === 'VIDEO' && m.mediaUrl ? (
                            <div className="aspect-video w-full bg-slate-900">
                                <iframe 
                                    className="w-full h-full" 
                                    src={m.mediaUrl} 
                                    title={m.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : m.mediaType === 'PDF' && m.mediaUrl ? (
                            <div className="aspect-video w-full bg-rose-50 flex flex-col items-center justify-center border-b border-rose-100">
                                <FileText className="w-12 h-12 text-rose-300 mb-2" />
                                <span className="text-sm text-rose-600 font-medium">Dokumen PDF</span>
                            </div>
                        ) : m.mediaType === 'LINK' && m.mediaUrl ? (
                            <div className="aspect-video w-full bg-blue-50 flex flex-col items-center justify-center border-b border-blue-100">
                                <LinkIcon className="w-12 h-12 text-blue-300 mb-2" />
                                <span className="text-sm text-blue-600 font-medium">Tautan Eksternal</span>
                            </div>
                        ) : (
                            <div className="aspect-video w-full bg-slate-100 flex flex-col items-center justify-center border-b border-slate-200">
                                <MonitorPlay className="w-12 h-12 text-slate-300 mb-2" />
                                <span className="text-sm text-muted-foreground">Media tidak tersedia</span>
                            </div>
                        )}
                        <CardHeader className="pb-3 flex-grow">
                            <div className="mb-2">
                                <Badge className={m.category?.name ? getRandomColor(m.category.name) : 'bg-gray-100'} variant="secondary">
                                    {m.category?.name || 'Tanpa Kategori'}
                                </Badge>
                            </div>
                            <CardTitle className="text-lg leading-tight">{m.title}</CardTitle>
                            <CardDescription className="line-clamp-3 mt-2">{m.description}</CardDescription>
                        </CardHeader>
                        {(m.mediaType === 'PDF' || m.mediaType === 'LINK') && m.mediaUrl && (
                            <CardFooter className="pt-0">
                                <Button asChild variant="outline" className="w-full" size="sm">
                                    <a href={m.mediaUrl} target="_blank" rel="noopener noreferrer">
                                        Buka {m.mediaType === 'PDF' ? 'Dokumen' : 'Tautan'} <ExternalLink className="w-4 h-4 ml-2" />
                                    </a>
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    )
}
