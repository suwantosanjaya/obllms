import { getRegistrationData } from '@/app/actions/authActions'
import RegisterForm from './RegisterForm'

export default async function RegisterPage() {
    const dataRes = await getRegistrationData()
    const universities = dataRes.success ? (dataRes.universities || []) : []

    return (
        <div className="min-h-screen w-full bg-muted/10 flex items-center justify-center p-4">
            <RegisterForm universities={universities} />
        </div>
    )
}
