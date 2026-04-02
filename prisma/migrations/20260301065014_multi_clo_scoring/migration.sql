/*
  Warnings:

  - You are about to drop the column `cloId` on the `Assessment` table. All the data in the column will be lost.
  - You are about to alter the column `score` on the `Submission` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- CreateTable
CREATE TABLE "AssessmentCLO" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentId" TEXT NOT NULL,
    "cloId" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    CONSTRAINT "AssessmentCLO_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssessmentCLO_cloId_fkey" FOREIGN KEY ("cloId") REFERENCES "CourseLearningOutcome" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubmissionCLOScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submissionId" TEXT NOT NULL,
    "cloId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    CONSTRAINT "SubmissionCLOScore_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubmissionCLOScore_cloId_fkey" FOREIGN KEY ("cloId") REFERENCES "CourseLearningOutcome" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Assessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "dueDate" DATETIME,
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    CONSTRAINT "Assessment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Assessment" ("courseId", "description", "dueDate", "id", "maxScore", "title", "type") SELECT "courseId", "description", "dueDate", "id", "maxScore", "title", "type" FROM "Assessment";
DROP TABLE "Assessment";
ALTER TABLE "new_Assessment" RENAME TO "Assessment";
CREATE TABLE "new_Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "content" TEXT,
    "score" REAL,
    "feedback" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Submission_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Submission" ("assessmentId", "content", "feedback", "id", "score", "studentId", "submittedAt") SELECT "assessmentId", "content", "feedback", "id", "score", "studentId", "submittedAt" FROM "Submission";
DROP TABLE "Submission";
ALTER TABLE "new_Submission" RENAME TO "Submission";
CREATE UNIQUE INDEX "Submission_studentId_assessmentId_key" ON "Submission"("studentId", "assessmentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentCLO_assessmentId_cloId_key" ON "AssessmentCLO"("assessmentId", "cloId");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionCLOScore_submissionId_cloId_key" ON "SubmissionCLOScore"("submissionId", "cloId");
