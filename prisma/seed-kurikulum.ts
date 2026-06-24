// @ts-nocheck
const { PrismaClient } = require('@prisma/client');
const ExcelJS = require('exceljs');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed from Kurikulum 2022.xlsx...');

    // Find Department TI
    const prodiTI = await prisma.department.findFirst({ where: { code: 'TI' } });
    if (!prodiTI) {
        throw new Error("Prodi TI not found. Please run normal seed first.");
    }
    
    // Find or create CurriculumYear 2022
    let currYear = await prisma.curriculumYear.findFirst({ where: { name: '2022/2023' } });
    if (!currYear) {
        currYear = await prisma.curriculumYear.create({ data: { name: '2022/2023', isActive: true } });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('Kurikulum 2022.xlsx');

    // 1. Profil Lulusan
    const gpMap = {};
    const gpSheet = workbook.getWorksheet('Profil Lulusan');
    if (gpSheet) {
        for (let i = 2; i <= gpSheet.rowCount; i++) {
            const row = gpSheet.getRow(i);
            const code = row.getCell(1).text?.trim();
            const desc = row.getCell(2).text?.trim();
            if (code && desc) {
                const gp = await prisma.graduateProfile.create({
                    data: {
                        code,
                        title: `Profil Lulusan ${code}`,
                        description: desc,
                        departmentId: prodiTI.id,
                        curriculumYearId: currYear.id
                    }
                });
                gpMap[code] = gp;
                console.log(`Created GP: ${code}`);
            }
        }
    }

    // 2. PLO
    const ploMap = {};
    const ploSheet = workbook.getWorksheet('PLO');
    if (ploSheet) {
        for (let i = 2; i <= ploSheet.rowCount; i++) {
            const row = ploSheet.getRow(i);
            const code = row.getCell(1).text?.trim();
            const desc = row.getCell(2).text?.trim();
            if (code && desc) {
                const plo = await prisma.programLearningOutcome.create({
                    data: {
                        code,
                        description: desc,
                        departmentId: prodiTI.id,
                        curriculumYearId: currYear.id,
                        // Optionally map to all GPs since excel doesn't map them
                        graduateProfiles: {
                            connect: Object.values(gpMap).map((gp: any) => ({ id: gp.id }))
                        }
                    }
                });
                ploMap[code] = plo;
                console.log(`Created PLO: ${code}`);
            }
        }
    }

    // 3. CLO
    const cloMap = {};
    const cloSheet = workbook.getWorksheet('CLO');
    if (cloSheet) {
        for (let i = 2; i <= cloSheet.rowCount; i++) {
            const row = cloSheet.getRow(i);
            const ploCode = row.getCell(1).text?.trim();
            const code = row.getCell(2).text?.trim();
            const desc = row.getCell(3).text?.trim();
            
            if (ploCode && code && desc && ploMap[ploCode]) {
                const clo = await prisma.courseLearningOutcome.create({
                    data: {
                        code,
                        description: desc,
                        departmentId: prodiTI.id,
                        curriculumYearId: currYear.id,
                        plos: {
                            connect: [{ id: ploMap[ploCode].id }]
                        }
                    }
                });
                cloMap[code] = clo;
                console.log(`Created CLO: ${code}`);
            }
        }
    }

    // 4. Katalog Matakuliah
    const subjectMap = {};
    const mkSheet = workbook.getWorksheet('Katalog Matakuliah');
    if (mkSheet) {
        for (let i = 2; i <= mkSheet.rowCount; i++) {
            const row = mkSheet.getRow(i);
            const code = row.getCell(1).text?.trim();
            const title = row.getCell(2).text?.trim();
            let cakupanRaw = row.getCell(3).text?.trim()?.toLowerCase();
            
            let scope = 'department';
            if (cakupanRaw?.includes('universitas')) scope = 'university';
            if (cakupanRaw?.includes('fakultas')) scope = 'faculty';

            if (code && title) {
                // Determine scope and assignments
                const data: any = {
                    code,
                    title,
                    type: 'wajib',
                    scope
                };
                
                if (scope === 'university') {
                    // Nothing needed
                } else if (scope === 'faculty') {
                    data.facultyId = prodiTI.facultyId;
                } else {
                    data.departmentId = prodiTI.id;
                    data.facultyId = prodiTI.facultyId;
                }

                // Check if already exists (some generic ones might exist)
                let subject = await prisma.subject.findFirst({ where: { code } });
                if (!subject) {
                    subject = await prisma.subject.create({ data });
                }
                subjectMap[code] = subject;
                console.log(`Created Subject: ${code} - ${title}`);
            }
        }
    }

    // 5. Pemetaan
    const mapSheet = workbook.getWorksheet('Pemetaan');
    if (mapSheet) {
        // Read headers from row 2
        const headerRow = mapSheet.getRow(2);
        const ploHeaders = {}; // colIndex -> PLO code
        for (let col = 2; col <= 13; col++) {
            const text = headerRow.getCell(col).text?.trim();
            if (text) {
                ploHeaders[col] = text;
            }
        }

        let mapCount = 0;
        for (let i = 3; i <= mapSheet.rowCount; i++) {
            const row = mapSheet.getRow(i);
            const mkCode = row.getCell(1).text?.trim();
            if (!mkCode) continue;
            if (!subjectMap[mkCode]) {
                console.log(`Skipping map row for MK: ${mkCode} because subject not found in subjectMap`);
                continue;
            }

            const subjectId = subjectMap[mkCode].id;

            for (let col = 2; col <= 13; col++) {
                const cellText = row.getCell(col).text?.trim();
                if (cellText) {
                    const ploCode = ploHeaders[col];
                    if (!ploCode || !ploMap[ploCode]) continue;

                    const cloCodes = cellText.split(',').map(c => c.trim());
                    for (const cCode of cloCodes) {
                        if (!cloMap[cCode]) {
                            console.log(`Warning: CLO code ${cCode} not found in cloMap for MK ${mkCode}`);
                        } else {
                            await prisma.subjectCLO.create({
                                data: {
                                    subjectId: subjectId,
                                    ploId: ploMap[ploCode].id,
                                    cloId: cloMap[cCode].id,
                                    weight: 100 / cloCodes.length // Temporary equal weighting
                                }
                            });
                            mapCount++;
                        }
                    }
                }
            }
        }
        console.log(`Created ${mapCount} Subject-CLO mappings.`);
    }

    console.log('Curriculum Seeding Finished Successfully!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
