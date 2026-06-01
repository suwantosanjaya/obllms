'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function submitStudentEvaluation(data: {
  enrollmentId: string;
  type: 'EXPECTATION' | 'PERCEPTION';
  content: string;
  rating: number;
}) {
  try {
    const existing = await prisma.studentCourseEvaluation.findFirst({
      where: {
        enrollmentId: data.enrollmentId,
        type: data.type,
      },
    });

    if (existing) {
      return { success: false, error: 'Evaluation already submitted.' };
    }

    const evaluation = await prisma.studentCourseEvaluation.create({
      data: {
        enrollmentId: data.enrollmentId,
        type: data.type,
        content: data.content,
        rating: data.rating,
      },
    });

    revalidatePath('/student/courses');
    return { success: true, evaluation };
  } catch (error: any) {
    console.error('Error submitting student evaluation:', error);
    return { success: false, error: error.message };
  }
}

export async function upsertSclSkillAssessment(data: {
  enrollmentId: string;
  entrepreneurshipScore?: number;
  leadershipScore?: number;
  industryKnowledgeScore?: number;
  employabilitySkillScore?: number;
  notes?: string;
}) {
  try {
    const assessment = await prisma.studentSkillAssessment.upsert({
      where: { enrollmentId: data.enrollmentId },
      update: {
        entrepreneurshipScore: data.entrepreneurshipScore,
        leadershipScore: data.leadershipScore,
        industryKnowledgeScore: data.industryKnowledgeScore,
        employabilitySkillScore: data.employabilitySkillScore,
        notes: data.notes,
      },
      create: {
        enrollmentId: data.enrollmentId,
        entrepreneurshipScore: data.entrepreneurshipScore,
        leadershipScore: data.leadershipScore,
        industryKnowledgeScore: data.industryKnowledgeScore,
        employabilitySkillScore: data.employabilitySkillScore,
        notes: data.notes,
      },
    });

    revalidatePath('/teacher/courses');
    return { success: true, assessment };
  } catch (error: any) {
    console.error('Error upserting SCL skill assessment:', error);
    return { success: false, error: error.message };
  }
}
