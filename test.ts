import prisma from './lib/db'
import { getCourseGradebookData } from './app/actions/assessmentActions'

async function main() {
    console.log("Running...");
    const res = await getCourseGradebookData('cmtzwxcaa0007ilan2vxmwtb2'); // this is the courseId from the URL in screenshot
    console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);
