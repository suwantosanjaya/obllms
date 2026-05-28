import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUniversityList, getFacultyList, getDepartmentList } from '@/app/actions/institutionActions'
import { Building2, GraduationCap, Library } from 'lucide-react'
import { 
    UniversityTableClient, 
    FacultyTableClient, 
    DepartmentTableClient 
} from '@/app/components/admin/InstitutionTableClient'

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
                    <UniversityTableClient universities={universities} />
                </TabsContent>

                {/* Faculties Tab */}
                <TabsContent value="faculties">
                    <FacultyTableClient faculties={faculties} universities={universities} />
                </TabsContent>

                {/* Departments Tab */}
                <TabsContent value="departments">
                    <DepartmentTableClient departments={departments} faculties={faculties.map(f => ({ id: f.id, code: f.code, name: f.name }))} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
