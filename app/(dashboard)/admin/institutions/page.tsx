import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUniversityList, getFacultyList, getDepartmentList } from '@/app/actions/institutionActions'
import { getHeadOfDepartmentCandidates, getDeanCandidates, getRectorCandidates } from '@/app/actions/adminActions'
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

    const candidatesMap: Record<string, any[]> = {}
    for (const dep of departments) {
        candidatesMap[dep.id] = await getHeadOfDepartmentCandidates(dep.id)
    }

    const deanCandidatesMap: Record<string, any[]> = {}
    for (const fac of faculties) {
        deanCandidatesMap[fac.id] = await getDeanCandidates(fac.id)
    }

    const rectorCandidatesMap: Record<string, any[]> = {}
    for (const uni of universities) {
        rectorCandidatesMap[uni.id] = await getRectorCandidates(uni.id)
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Institusi</h1>
                    <p className="text-muted-foreground mt-1">Kelola data Universitas, Fakultas, dan Program Studi.</p>
                </div>
            </div>

            <Tabs defaultValue="universities" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="universities"><Library className="w-4 h-4 mr-2" />Universitas</TabsTrigger>
                    <TabsTrigger value="faculties"><Building2 className="w-4 h-4 mr-2" />Fakultas</TabsTrigger>
                    <TabsTrigger value="departments"><GraduationCap className="w-4 h-4 mr-2" />Program Studi</TabsTrigger>
                </TabsList>

                {/* Universities Tab */}
                <TabsContent value="universities">
                    <UniversityTableClient universities={universities} candidatesMap={rectorCandidatesMap} />
                </TabsContent>

                {/* Faculties Tab */}
                <TabsContent value="faculties">
                    <FacultyTableClient faculties={faculties} universities={universities} candidatesMap={deanCandidatesMap} />
                </TabsContent>

                {/* Departments Tab */}
                <TabsContent value="departments">
                    <DepartmentTableClient 
                        departments={departments} 
                        faculties={faculties.map(f => ({ id: f.id, code: f.code, name: f.name }))} 
                        candidatesMap={candidatesMap}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
