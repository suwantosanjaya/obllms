import { Prisma } from '@prisma/client'
import { getAssessmentsForCourse } from './app/actions/assessmentActions'

type AssessmentWithDetails = NonNullable<Prisma.PromiseReturnType<typeof getAssessmentsForCourse>['assessments']>[number];
type AssessmentClo = AssessmentWithDetails['assessmentClos'][number];
