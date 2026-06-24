// @ts-nocheck
const { PrismaClient } = require('@prisma/client');
const ExcelJS = require('exceljs');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Visi Misi from Kurikulum 2022.xlsx...');

    const prodiTI = await prisma.department.findFirst({ where: { code: 'TI' } });
    if (!prodiTI) throw new Error("Prodi TI not found.");
    
    let currYear = await prisma.curriculumYear.findFirst({ where: { name: '2022/2023' } });
    if (!currYear) throw new Error("CurriculumYear 2022/2023 not found.");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('Kurikulum 2022.xlsx');

    const vmSheet = workbook.getWorksheet('Visi Misi');
    if (vmSheet) {
        for (let i = 2; i <= vmSheet.rowCount; i++) {
            const row = vmSheet.getRow(i);
            const code = row.getCell(1).text?.trim();
            const desc = row.getCell(2).text?.trim();
            
            if (code && desc) {
                const type = code.toUpperCase().startsWith('VISI') ? 'vision' : 'mission';
                
                // Check if exists
                let vm = await prisma.institutionVisionMission.findFirst({
                    where: { code, departmentId: prodiTI.id, curriculumYearId: currYear.id }
                });
                
                if (!vm) {
                    await prisma.institutionVisionMission.create({
                        data: {
                            code,
                            description: desc,
                            type,
                            departmentId: prodiTI.id,
                            curriculumYearId: currYear.id
                        }
                    });
                    console.log(`Created Visi Misi: ${code}`);
                } else {
                    console.log(`Visi Misi ${code} already exists, skipping.`);
                }
            }
        }
    }
    
    // Now, link GP to Visi Misi? The user's page says "Data Visi/Misi tidak ditemukan."
    // Let's also check if GP needs visionMissionId.
    // The Excel doesn't map GP to Visi Misi. The dashboard might just show all VMs for the curriculum year.
    console.log('Visi Misi Seeding Finished Successfully!');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
