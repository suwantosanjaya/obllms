import { Prisma } from '@prisma/client'
type SubjectCLOWithRelations = Prisma.SubjectCLOGetPayload<{
    include: { clo: true, techniques: true, plo: true }
}>
type PLO = Prisma.ProgramLearningOutcomeGetPayload<{}>
type Technique = Prisma.SubjectCLOTechniqueGetPayload<{}>
type CourseWithRelations = Prisma.CourseGetPayload<{
    include: {
        subject: {
            include: {
                faculty: true,
                department: {
                    include: {
                        faculty: true
                    }
                }
            }
        },
        enrollments: {
            include: {
                student: {
                    include: { studentProfile: true }
                }
            }
        },
        assessments: {
            include: {
                assessmentClos: {
                    include: { clo: true }
                }
            }
        }
    }
}>
type Enrollment = CourseWithRelations['enrollments'][0]
type Assessment = CourseWithRelations['assessments'][0]
type AssessmentCLO = Assessment['assessmentClos'][0]
type SubmissionWithRelations = Prisma.SubmissionGetPayload<{
    include: {
        cloScores: {
            include: { clo: true }
        }
    }
}>
type CLOScore = SubmissionWithRelations['cloScores'][0]
