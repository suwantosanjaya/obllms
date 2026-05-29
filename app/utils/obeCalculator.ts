export function calculateStudentOBEGrade(studentId: string, assessments: any[], submissions: any[], subjectClos: any[], gradeScales: any[] = []) {
    // 1. Group submissions by CLO and Technique
    const cloTechniqueScores = new Map<string, number[]>(); // key: "cloId_technique"
    
    let hasAnyGradedAssessment = false;

    assessments.forEach(a => {
        const sub = submissions.find(s => s.studentId === studentId && s.assessmentId === a.id);
        if (sub && sub.score !== null) {
            hasAnyGradedAssessment = true;
            sub.cloScores.forEach((cs: any) => {
                if (cs.score !== null) {
                    const key = `${cs.cloId}_${a.type}`;
                    if (!cloTechniqueScores.has(key)) cloTechniqueScores.set(key, []);
                    cloTechniqueScores.get(key)!.push(cs.score);
                }
            });
        }
    });

    let finalGradePoints = 0;
    const cloResults = new Map<string, { points: number, maxPoints: number, mastery: number | null }>();

    // Check if the curriculum has techniques defined
    const hasCurriculumWeights = subjectClos.some((sclo: any) => sclo.techniques && sclo.techniques.length > 0);

    if (hasCurriculumWeights) {
        subjectClos.forEach((sclo: any) => {
            let cloPoints = 0;
            let cloMaxPoints = 0;
            let evaluatedMaxPoints = 0;
            
            const techniques = sclo.techniques || [];
            
            techniques.forEach((tech: any) => {
                const key = `${sclo.cloId}_${tech.technique}`;
                const scores = cloTechniqueScores.get(key) || [];
                cloMaxPoints += tech.weight;

                if (scores.length > 0) {
                    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
                    const points = avg * (tech.weight / 100);
                    cloPoints += points;
                    finalGradePoints += points;
                    evaluatedMaxPoints += tech.weight;
                }
            });

            const mastery = evaluatedMaxPoints > 0 ? (cloPoints / evaluatedMaxPoints) * 100 : null;

            cloResults.set(sclo.cloId, { 
                points: cloPoints, 
                maxPoints: cloMaxPoints, 
                mastery: mastery 
            });
        });
    } else {
        // Fallback: No curriculum weights defined (Simple Average)
        let totalScore = 0;
        let gradedCount = 0;
        
        assessments.forEach(a => {
            const sub = submissions.find(s => s.studentId === studentId && s.assessmentId === a.id);
            if (sub && sub.score !== null && sub.score !== undefined) {
                totalScore += sub.score;
                gradedCount++;
            }
        });
        
        finalGradePoints = gradedCount > 0 ? totalScore / gradedCount : 0;

        subjectClos.forEach((sclo: any) => {
            const allScoresForClo: number[] = [];
            assessments.forEach(a => {
                const sub = submissions.find(s => s.studentId === studentId && s.assessmentId === a.id);
                if (sub && sub.score !== null) {
                    const cs = sub.cloScores.find((c: any) => c.cloId === sclo.cloId);
                    if (cs && cs.score !== null) allScoresForClo.push(cs.score);
                }
            });
            
            if (allScoresForClo.length > 0) {
                const avg = allScoresForClo.reduce((sum, s) => sum + s, 0) / allScoresForClo.length;
                cloResults.set(sclo.cloId, { points: avg, maxPoints: 100, mastery: avg });
            } else {
                cloResults.set(sclo.cloId, { points: 0, maxPoints: 0, mastery: null });
            }
        });
    }

    // Aggregate PLO Results
    const ploResults = new Map<string, { points: number, maxPoints: number, mastery: number | null }>();
    
    subjectClos.forEach((sclo: any) => {
        const ploId = sclo.ploId;
        if (!ploId) return;

        const cloResult = cloResults.get(sclo.cloId);
        if (!cloResult) return;

        if (!ploResults.has(ploId)) {
            ploResults.set(ploId, { points: 0, maxPoints: 0, mastery: null });
        }

        const currentPlo = ploResults.get(ploId)!;
        currentPlo.points += cloResult.points;
        currentPlo.maxPoints += cloResult.maxPoints;
    });

    ploResults.forEach((val, key) => {
        val.mastery = val.maxPoints > 0 ? (val.points / val.maxPoints) * 100 : null;
    });

    // Determine Letter Grade
    let letterGrade = '-';
    if (hasAnyGradedAssessment && gradeScales.length > 0) {
        // Sort grades by minScore descending (e.g. A >= 85, then A- >= 80)
        const sortedScales = [...gradeScales].sort((a, b) => b.minScore - a.minScore);
        for (const scale of sortedScales) {
            if (finalGradePoints >= scale.minScore) {
                letterGrade = scale.grade;
                break;
            }
        }
    }

    return {
        finalGrade: hasAnyGradedAssessment ? finalGradePoints : null,
        letterGrade: hasAnyGradedAssessment ? letterGrade : '-',
        cloResults,
        ploResults,
        hasCurriculumWeights
    };
}
