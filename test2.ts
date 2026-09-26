import { getCourseGradebookData } from './app/actions/assessmentActions'

async function main() {
    console.log("Running...");
    const res = await getCourseGradebookData('cmtzwxcaa0007ilan2vxmwtb2');
    console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);
