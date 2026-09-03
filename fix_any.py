import re

file_path = "/mnt/DATA_EXT4/BU-PIPIT/my-app/app/components/course/CourseGradebookTab.tsx"
with open(file_path, "r") as f:
    content = f.read()

types = """import { ExportExcelButton } from './ExportExcelButton'

type CourseGradebookResponse = Exclude<Awaited<ReturnType<typeof getCourseGradebookData>>, { success: false }>
type GradebookCourse = NonNullable<CourseGradebookResponse['course']>
type GradebookSubjectCLO = NonNullable<CourseGradebookResponse['subjectClos']>[number]
type GradebookPLO = GradebookSubjectCLO['plo']
type GradebookTechnique = GradebookSubjectCLO['techniques'][number]
type GradebookEnrollment = GradebookCourse['enrollments'][number]
type GradebookAssessment = GradebookCourse['assessments'][number]
type GradebookSubmission = NonNullable<CourseGradebookResponse['submissions']>[number]
type GradebookCLOScore = GradebookSubmission['cloScores'][number]
"""

content = content.replace("import { ExportExcelButton } from './ExportExcelButton'", types)

# Replace the specific 'any' occurrences based on what they represent.
content = content.replace("    // eslint-disable-next-line @typescript-eslint/no-explicit-any\n", "")
content = content.replace("    const subject = dataRes.course?.subject as any\n", "    const subject = dataRes.course?.subject\n")

content = content.replace("{clos.map((sc: any) => {", "{clos.map((sc: GradebookSubjectCLO) => {")
content = content.replace("{clos.map((sc: any) => (", "{clos.map((sc: GradebookSubjectCLO) => (")
content = content.replace("{plos.map(([id, plo]: any) => (", "{plos.map(([id, plo]: [string, GradebookPLO]) => (")
content = content.replace("{plos.map(([id, plo]: any) => {", "{plos.map(([id, plo]: [string, GradebookPLO]) => {")
content = content.replace("{plos.map(([ploId, plo]: any) => {", "{plos.map(([ploId, plo]: [string, GradebookPLO]) => {")
content = content.replace("const relatedClos = clos.filter((sc: any) =>", "const relatedClos = clos.filter((sc: GradebookSubjectCLO) =>")

content = content.replace("techniques.map((t: any, idx: number) => {", "techniques.map((t: GradebookTechnique, idx: number) => {")
content = content.replace("techniques.map((t: any) => (", "techniques.map((t: GradebookTechnique) => (")
content = content.replace("techniques.reduce((acc: number, t: any) =>", "techniques.reduce((acc: number, t: GradebookTechnique) =>")
content = content.replace("techniques.map((t: any) => {", "techniques.map((t: GradebookTechnique) => {")
content = content.replace("techStatus.map((t: any) => (", "techStatus.map((t: GradebookTechnique) => (")

content = content.replace("enrollments.map((enr: any, idx: number) => {", "enrollments.map((enr: GradebookEnrollment, idx: number) => {")

content = content.replace("const techAssessments = assessments.filter((a: any) =>", "const techAssessments = assessments.filter((a: GradebookAssessment) =>")
content = content.replace("techAssessments.forEach((a: any) => {", "techAssessments.forEach((a: GradebookAssessment) => {")
content = content.replace("a.assessmentClos.some((ac: any) =>", "a.assessmentClos.some((ac: NonNullable<GradebookAssessment['assessmentClos']>[number]) =>")
content = content.replace("assessments.some((a: any) =>", "assessments.some((a: GradebookAssessment) =>")

content = content.replace("submissions?.find((s: any) =>", "submissions?.find((s: GradebookSubmission) =>")
content = content.replace("sub.cloScores?.find((cs: any) =>", "sub.cloScores?.find((cs: GradebookCLOScore) =>")


with open(file_path, "w") as f:
    f.write(content)

