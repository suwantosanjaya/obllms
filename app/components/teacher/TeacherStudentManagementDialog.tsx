'use client'

import { useState, useRef } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { bulkEnrollStudents } from '@/app/actions/userActions'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function TeacherStudentManagementDialog({ courseId, departmentId }: { courseId: string, departmentId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [importResult, setImportResult] = useState<any>(null)
    
    // Manual Input State
    const [manualName, setManualName] = useState('')
    const [manualNim, setManualNim] = useState('')
    const [manualEmail, setManualEmail] = useState('')
    
    // File State
    const [file, setFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const { toast } = useToast()
    const router = useRouter()

    const downloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,Nama,NIM,Email\nBudi Santoso,12345678,budi@example.com\nSiti Aminah,87654321,siti@example.com"
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "Template_Import_Mahasiswa.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                toast({
                    title: "Format tidak didukung",
                    description: "Silakan unggah file berformat CSV.",
                    variant: "destructive"
                })
                setFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
                return
            }
            setFile(selectedFile)
            setImportResult(null)
        }
    }

    const parseCSV = (text: string) => {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
        if (lines.length < 2) return [] // Need at least header + 1 row
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        const nameIdx = headers.findIndex(h => h.includes('nama'))
        const nimIdx = headers.findIndex(h => h.includes('nim'))
        const emailIdx = headers.findIndex(h => h.includes('email'))
        
        if (nameIdx === -1 || nimIdx === -1 || emailIdx === -1) {
            throw new Error("Format CSV tidak valid. Pastikan kolom Nama, NIM, dan Email ada di baris pertama.")
        }

        const students = []
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim())
            if (cols.length >= 3) {
                if (cols[nameIdx] && cols[nimIdx] && cols[emailIdx]) {
                    students.push({
                        name: cols[nameIdx],
                        nim: cols[nimIdx],
                        email: cols[emailIdx]
                    })
                }
            }
        }
        return students
    }

    const handleImportSubmit = async () => {
        if (!file) return
        setIsLoading(true)
        setImportResult(null)
        
        try {
            const text = await file.text()
            const students = parseCSV(text)
            
            if (students.length === 0) {
                toast({
                    title: "File Kosong",
                    description: "Tidak ada data mahasiswa valid yang ditemukan dalam file CSV.",
                    variant: "destructive"
                })
                setIsLoading(false)
                return
            }

            const res = await bulkEnrollStudents(courseId, students, departmentId)
            if (res.success) {
                setImportResult(res)
                router.refresh()
                toast({
                    title: "Import Berhasil",
                    description: `${res.newUsersCount} ditambahkan, ${res.existingUsersEnrolledCount} didaftarkan.`
                })
            } else {
                toast({
                    title: "Gagal Mengimpor",
                    description: res.error || "Terjadi kesalahan yang tidak diketahui.",
                    variant: "destructive"
                })
            }
        } catch (error: any) {
            toast({
                title: "Gagal Mengimpor",
                description: error.message || "Terjadi kesalahan saat memproses file.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!manualName || !manualNim || !manualEmail) return
        
        setIsLoading(true)
        setImportResult(null)
        try {
            const students = [{ name: manualName, nim: manualNim, email: manualEmail }]
            const res = await bulkEnrollStudents(courseId, students, departmentId)
            
            if (res.success) {
                setManualName('')
                setManualNim('')
                setManualEmail('')
                setImportResult(res)
                router.refresh()
                toast({
                    title: "Berhasil ditambahkan",
                    description: "Data mahasiswa berhasil disimpan."
                })
            } else {
                toast({
                    title: "Gagal",
                    description: res.error,
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Terjadi kesalahan jaringan.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const resetDialog = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setImportResult(null)
            setFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={resetDialog}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <Users className="w-4 h-4" />
                    Tambah Mahasiswa
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Kelola Peserta Kelas</DialogTitle>
                    <DialogDescription>
                        Tambahkan mahasiswa ke kelas Anda. Jika akun belum terdaftar di sistem, sistem akan otomatis membuatkannya.
                    </DialogDescription>
                </DialogHeader>

                {importResult ? (
                    <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Proses Selesai</h3>
                            <p className="text-sm text-muted-foreground mt-1">Data telah berhasil diproses.</p>
                        </div>
                        <div className="w-full bg-muted/50 p-4 rounded-lg space-y-2 text-sm text-left">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Akun Baru Dibuat & Enrolled:</span>
                                <span className="font-semibold text-green-600">{importResult.newUsersCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Akun Lama Enrolled ke Kelas Ini:</span>
                                <span className="font-semibold text-blue-600">{importResult.existingUsersEnrolledCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Sudah Pernah Enrolled Sebelumnya:</span>
                                <span className="font-semibold">{importResult.existingUsersAlreadyEnrolledCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Gagal Diproses:</span>
                                <span className="font-semibold text-red-600">{importResult.errorCount}</span>
                            </div>
                        </div>
                        {importResult.errorDetails && importResult.errorDetails.length > 0 && (
                            <Alert variant="destructive" className="text-left mt-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Detail Error</AlertTitle>
                                <AlertDescription>
                                    <ul className="list-disc pl-4 mt-2 max-h-[100px] overflow-y-auto text-xs">
                                        {importResult.errorDetails.map((err: string, i: number) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                        <Button className="w-full mt-4" onClick={() => resetDialog(false)}>Tutup</Button>
                    </div>
                ) : (
                    <Tabs defaultValue="import" className="mt-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="import">Import CSV (Banyak)</TabsTrigger>
                            <TabsTrigger value="manual">Input Manual (Satu)</TabsTrigger>
                        </TabsList>

                        <TabsContent value="import" className="space-y-4 pt-4">
                            <div className="rounded-lg border border-dashed p-6 text-center">
                                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                                <h3 className="font-medium">Pilih File CSV</h3>
                                <p className="text-xs text-muted-foreground mt-1 mb-4">
                                    Format file harus CSV dengan header (Nama, NIM, Email). Password default otomatis diset sama dengan NIM.
                                </p>
                                <div className="flex justify-center">
                                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                                        Browse File
                                    </Button>
                                    <input 
                                        type="file" 
                                        accept=".csv" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                </div>
                                {file && (
                                    <div className="mt-4 p-2 bg-muted/50 rounded flex justify-between items-center text-sm">
                                        <span className="truncate max-w-[250px]">{file.name}</span>
                                        <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center mt-6">
                                <Button variant="ghost" size="sm" onClick={downloadTemplate} disabled={isLoading}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Template
                                </Button>
                                <Button onClick={handleImportSubmit} disabled={!file || isLoading}>
                                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Mulai Import
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="manual" className="pt-4">
                            <form onSubmit={handleManualSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nama">Nama Lengkap</Label>
                                    <Input id="nama" placeholder="Cth: Budi Santoso" value={manualName} onChange={e => setManualName(e.target.value)} required disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nim">NIM</Label>
                                    <Input id="nim" placeholder="Cth: 1301201234" value={manualNim} onChange={e => setManualNim(e.target.value)} required disabled={isLoading} />
                                    <p className="text-xs text-muted-foreground">Password default akan diatur sama dengan NIM.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="budi@example.com" value={manualEmail} onChange={e => setManualEmail(e.target.value)} required disabled={isLoading} />
                                </div>
                                <div className="flex justify-end mt-6">
                                    <Button type="submit" disabled={!manualName || !manualNim || !manualEmail || isLoading}>
                                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                        Tambah ke Kelas
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    )
}
