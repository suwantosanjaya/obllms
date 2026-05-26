import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUniversityList, getFacultyList, getDepartmentList } from '@/app/actions/institutionActions'
import {
    CreateUniversityDialog, EditUniversityDialog, DeleteUniversityDialog,
    CreateFacultyDialog, EditFacultyDialog, DeleteFacultyDialog,
    CreateDepartmentDialog, EditDepartmentDialog, DeleteDepartmentDialog
} from '@/app/components/admin/InstitutionDialogs'
import { Building2, GraduationCap, Library } from 'lucide-react'

export default async function AdminInstitutionsPage() {
    const uniRes = await getUniversityList()
    const universities = uniRes.success && uniRes.universityList ? uniRes.universityList : []

    const facRes = await getFacultyList()
    const faculties = facRes.success && facRes.facultyList ? facRes.facultyList : []

    const depRes = await getDepartmentList()
    const departments = depRes.success && depRes.departmentList ? depRes.departmentList : []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Institution Management</h1>
                    <p className="text-muted-foreground mt-1">Manage Universities, Faculties, and Departments.</p>
                </div>
            </div>

            <Tabs defaultValue="universities" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="universities"><Library className="w-4 h-4 mr-2" />Universities</TabsTrigger>
                    <TabsTrigger value="faculties"><Building2 className="w-4 h-4 mr-2" />Faculties</TabsTrigger>
                    <TabsTrigger value="departments"><GraduationCap className="w-4 h-4 mr-2" />Departments</TabsTrigger>
                </TabsList>

                {/* Universities Tab */}
                <TabsContent value="universities">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Universities</CardTitle>
                                <CardDescription>List of all universities in the system.</CardDescription>
                            </div>
                            <CreateUniversityDialog />
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Faculties Count</TableHead>
                                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {universities.map(u => (
                                        <TableRow key={u.id}>
                                            <TableCell className="font-medium">{u.code}</TableCell>
                                            <TableCell>{u.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{u.faculties?.length || 0} Faculties</Badge>
                                            </TableCell>
                                            <TableCell className="text-right flex justify-end gap-2">
                                                <EditUniversityDialog university={u} />
                                                <DeleteUniversityDialog id={u.id} name={u.name} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {universities.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No universities found. Please add one.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Faculties Tab */}
                <TabsContent value="faculties">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Faculties</CardTitle>
                                <CardDescription>Manage faculties and their university association.</CardDescription>
                            </div>
                            <CreateFacultyDialog universities={universities} />
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Code</TableHead>
                                        <TableHead>Faculty Name</TableHead>
                                        <TableHead>University</TableHead>
                                        <TableHead>Departments Count</TableHead>
                                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {faculties.map(f => (
                                        <TableRow key={f.id}>
                                            <TableCell className="font-medium">{f.code}</TableCell>
                                            <TableCell>{f.name}</TableCell>
                                            <TableCell>
                                                {f.university ? (
                                                    <span className="text-sm">{f.university.code} - {f.university.name}</span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic">None</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{f.departments?.length || 0} Departments</Badge>
                                            </TableCell>
                                            <TableCell className="text-right flex justify-end gap-2">
                                                <EditFacultyDialog faculty={f} universities={universities} />
                                                <DeleteFacultyDialog id={f.id} name={f.name} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {faculties.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No faculties found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Departments Tab */}
                <TabsContent value="departments">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Departments (Departemen)</CardTitle>
                                <CardDescription>Manage departments and their faculty association.</CardDescription>
                            </div>
                            <CreateDepartmentDialog faculties={faculties.map(f => ({ id: f.id, code: f.code, name: f.name }))} />
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Code</TableHead>
                                        <TableHead>Department Name</TableHead>
                                        <TableHead>Faculty</TableHead>
                                        <TableHead>University</TableHead>
                                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {departments.map(d => (
                                        <TableRow key={d.id}>
                                            <TableCell className="font-medium">{d.code}</TableCell>
                                            <TableCell>{d.name}</TableCell>
                                            <TableCell>
                                                {d.faculty ? (
                                                    <Badge variant="outline">{d.faculty.code}</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground italic">None</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {d.faculty?.university?.name || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right flex justify-end gap-2">
                                                <EditDepartmentDialog department={d} faculties={faculties.map(f => ({ id: f.id, code: f.code, name: f.name }))} />
                                                <DeleteDepartmentDialog id={d.id} name={d.name} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {departments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No departments found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
