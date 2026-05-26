import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getSubjects } from '@/app/actions/courseActions'
import { CreateSubjectDialog } from '@/app/components/qa/CreateSubjectDialog'
import { EditSubjectDialog } from '@/app/components/qa/EditSubjectDialog'
import { DeleteSubjectButton } from '@/app/components/qa/DeleteSubjectButton'
import { BookOpen, GraduationCap, Building2, University } from 'lucide-react'

const SCOPE_LABELS: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    universitas: { label: 'Universitas', icon: University, className: 'bg-purple-100 text-purple-800 border-purple-300' },
    faculty: { label: 'Faculty', icon: Building2, className: 'bg-blue-100 text-blue-800 border-blue-300' },
    department: { label: 'Department', icon: GraduationCap, className: 'bg-green-100 text-green-800 border-green-300' },
}

import { getSessionUser } from '@/app/actions/userActions'

export default async function AdminSubjectsPage() {
    const user = await getSessionUser()
    const departmentId = user?.activeDepartmentId || undefined
    
    const res = await getSubjects(departmentId)
    const subjects = res.success ? (res.subjects ?? []) : []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subject Catalog</h1>
                    <p className="text-muted-foreground mt-1">Manage the master subjects available in the program study.</p>
                </div>
                <CreateSubjectDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Subject List</CardTitle>
                    <CardDescription>
                        This data is used as a reference when instructors create new classes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[130px]">Code</TableHead>
                                <TableHead>Subject Name</TableHead>
                                <TableHead className="w-[100px]">Type</TableHead>
                                <TableHead className="w-[80px]">Credits</TableHead>
                                <TableHead className="w-[130px]">Scope</TableHead>
                                <TableHead className="hidden md:table-cell">Program Study / Faculty</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subjects.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <BookOpen className="h-8 w-8 opacity-40" />
                                            <span>No subjects in catalog yet.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                subjects.map((subject) => {
                                    const scopeInfo = SCOPE_LABELS[subject.scope] ?? SCOPE_LABELS.department
                                    const ScopeIcon = scopeInfo.icon

                                    // Determine the unit label
                                    let unitLabel = '-'
                                    if (subject.scope === 'department' && subject.department) {
                                        unitLabel = `${subject.department.name} (${subject.department.faculty.code})`
                                    } else if (subject.scope === 'faculty' && subject.faculty) {
                                        unitLabel = subject.faculty.name
                                    } else if (subject.scope === 'universitas') {
                                        unitLabel = 'Semua Department'
                                    }

                                    return (
                                        <TableRow key={subject.id}>
                                            <TableCell>
                                                <Badge variant="outline" className="font-medium bg-slate-100 text-slate-800 border-slate-300">
                                                    {subject.code}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-700">
                                                {subject.title}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={subject.type === 'wajib'
                                                        ? 'bg-red-50 text-red-700 border-red-200'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }
                                                >
                                                    {subject.type === 'wajib' ? 'Wajib' : 'Pilihan'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {subject.credits} Credits
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`flex items-center gap-1 w-fit ${scopeInfo.className}`}>
                                                    <ScopeIcon className="h-3 w-3" />
                                                    {scopeInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                                {unitLabel}
                                            </TableCell>
                                            <TableCell className="text-right flex items-center justify-end gap-2">
                                                <EditSubjectDialog subject={subject} />
                                                <DeleteSubjectButton id={subject.id} title={subject.title} />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
