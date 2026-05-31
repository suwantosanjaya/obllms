import { getDepartmentCloAnalytics } from './app/actions/qaAnalyticsActions';
async function main() {
    const res = await getDepartmentCloAnalytics('cmpkq54ha00099nmy0fzffhs3', 2024, 'cmpmm2cdt00013up2ygtiqom1');
    const clo11 = res.clos?.find((c: any) => c.code === 'CLO-11');
    console.log('CLO-11 in clos array:', clo11);
    const angkatan2024 = res.angkatanProfiles?.find((a: any) => a.angkatan === 2024);
    const clo11_2024 = angkatan2024?.clos.find((c: any) => c.code === 'CLO-11');
    console.log('CLO-11 in angkatanProfiles[2024]:', clo11_2024);
    const plo1_2024 = angkatan2024?.plos.find((p: any) => p.code === 'PLO-1');
    console.log('PLO-1 in angkatanProfiles[2024]:', plo1_2024);
}
main();
