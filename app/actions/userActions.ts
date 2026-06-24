'use server'

import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function seedSimulatedUsers() {
    // If the database has missing roles, create them specifically for the login simulation
    const rolesToEnsure = [
        { email: 'budi@university.edu', name: 'Budi (Student)', role: 'student' },
        { email: 'andi@university.edu', name: 'Dr. Andi (Teacher)', role: 'teacher' },
        { email: 'siti@university.edu', name: 'Siti (QA)', role: 'qa' },
        { email: 'admin@university.edu', name: 'Department Admin', role: 'admin' },
        { email: 'super_admin@university.edu', name: 'Super Admin IT', role: 'super_admin' },
        { email: 'ketua@university.edu', name: 'Dr. Ketua (Head of Dept)', role: 'head_of_department' },
    ]

    const defaultPasswordHash = await bcrypt.hash('password123', 10)

    for (const r of rolesToEnsure) {
        const existing = await prisma.user.findFirst({ where: { role: r.role } })
        if (!existing) {
            await prisma.user.create({
                data: {
                    ...r,
                    password: defaultPasswordHash
                }
            })
        }
    }

    return { success: true, message: 'Ensured simulated users exist' }
}

export async function getUserLogin(role: string) {
    const user = await prisma.user.findFirst({
        where: { role: role.toLowerCase() }
    })
    return user
}

export async function loginWithEmail(email: string, passwordPlain: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: { 
                departments: true, 
                departmentRoles: { include: { department: true } },
                universityRoles: true,
                teacherProfile: true,
                studentProfile: true
            }
        })

        if (!user) {
            return { success: false, error: 'Pengguna tidak ditemukan.' }
        }

        if (!user.isActive) {
            if (user.approvalStatus === 'PENDING') {
                return { success: false, error: 'Akun ini menunggu proses persetujuan administrator. Silakan hubungi pihak terkait untuk mengaktifkan akun.' }
            } else if (user.approvalStatus === 'REJECTED') {
                return { success: false, error: 'Pendaftaran akun Anda telah ditolak oleh administrator.' }
            }
            return { success: false, error: 'Akun Anda telah dinonaktifkan.' }
        }

        const isValid = await bcrypt.compare(passwordPlain, user.password)
        if (!isValid) {
            return { success: false, error: 'Password salah.' }
        }

        if (user.approvalStatus === 'PENDING') {
            return { success: false, error: 'Akun Anda sedang menunggu persetujuan dari Admin/QA. Silakan cek kembali nanti.' }
        }
        if (user.approvalStatus === 'REJECTED') {
            return { success: false, error: 'Pendaftaran akun Anda ditolak.' }
        }

        if (user.mustChangePassword) {
            return { success: true, requirePasswordChange: true, email: user.email }
        }

        // Parse roles
        const roles = user.role.split(',').map(r => r.trim())
        const activeRole = roles[0]

        // Check for missing profiles
        let missingRole = null
        if (roles.includes('teacher') && !user.teacherProfile) {
            missingRole = 'teacher'
        } else if (roles.includes('student') && !user.studentProfile) {
            missingRole = 'student'
        }

        if (missingRole) {
            return { 
                success: true, 
                requireProfileCompletion: true, 
                missingRole, 
                email: user.email 
            }
        }

        // Exclude password from the returned object for security
        const { password, ...userWithoutPassword } = user

        // If user is a super admin, give them access to ALL departments
        if (roles.includes('super_admin') || roles.includes('rector')) {
            const allDepartments = await prisma.department.findMany({
                orderBy: { name: 'asc' }
            })
            user.departments = allDepartments as any
        } else if (roles.includes('dean')) {
            const faculty = await prisma.faculty.findFirst({
                where: { activeDeanId: user.id },
                include: { departments: true }
            })
            if (faculty) {
                user.departments = faculty.departments as any
                ;(user as any).facultyName = faculty.name
            }
        } else if (roles.includes('admin')) {
            const managedUnivIds = user.universityRoles.filter((ur: any) => ur.role === 'admin').map((ur: any) => ur.universityId)
            if (managedUnivIds.length > 0) {
                const adminDepartments = await prisma.department.findMany({
                    where: { faculty: { universityId: { in: managedUnivIds } } },
                    orderBy: { name: 'asc' }
                })
                user.departments = adminDepartments as any
            }
        }

        // Set an HTTP-only cookie for server components to access
        const cookieStore = await cookies()
        cookieStore.set('userId', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        })

        // Set active role cookie
        cookieStore.set('activeRole', activeRole, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7
        })

        // If user has at least 1 department, set the first one as active immediately
        if (user.departments.length > 0) {
            cookieStore.set('activeDepartmentId', user.departments[0].id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7
            })
        }

        return { success: true, user: { ...userWithoutPassword, departments: user.departments, departmentRoles: user.departmentRoles, activeRole, roles } }
    } catch (error) {
        console.error('Login error', error)
        return { success: false, error: 'Terjadi kesalahan sistem.' }
    }
}

export async function logoutUser() {
    const cookieStore = await cookies()
    cookieStore.delete('userId')
    cookieStore.delete('activeDepartmentId')
    cookieStore.delete('activeRole')
    return { success: true }
}

export async function getSessionUser() {
    const cookieStore = await cookies()
    const userIdCookie = cookieStore.get('userId')
    if (!userIdCookie?.value) return null

    const user = await prisma.user.findUnique({
        where: { id: userIdCookie.value },
        include: { departments: true, departmentRoles: { include: { department: true } }, universityRoles: true }
    })

    if (!user) return null
    
    const roles = user.role.split(',').map(r => r.trim())
    let activeRole = cookieStore.get('activeRole')?.value
    
    if (!activeRole || !roles.includes(activeRole)) {
        activeRole = roles[0]
    }

    // Determine allowed departments for the active role
    let visibleDepartments: any[] = []
    let facultyName = null
    if (activeRole === 'super_admin' || activeRole === 'rector') {
        visibleDepartments = await prisma.department.findMany({ orderBy: { name: 'asc' } })
    } else if (activeRole === 'dean') {
        const faculty = await prisma.faculty.findFirst({
            where: { activeDeanId: user.id },
            include: { departments: true }
        });
        if (faculty) {
            visibleDepartments = faculty.departments;
            facultyName = faculty.name
        } else {
            // Fallback if they are not explicitly an active dean, but have the role
            visibleDepartments = user.departments;
        }
    } else if (activeRole === 'admin') {
        const managedUnivIds = user.universityRoles.filter((ur: any) => ur.role === 'admin').map((ur: any) => ur.universityId)
        if (managedUnivIds.length > 0) {
            visibleDepartments = await prisma.department.findMany({
                where: {
                    faculty: {
                        universityId: { in: managedUnivIds }
                    }
                },
                orderBy: { name: 'asc' }
            })
        }
    } else {
        visibleDepartments = user.departmentRoles
            .filter(dr => dr.role?.split(',').map((r: string) => r.trim()).includes(activeRole as string) && dr.department)
            .map(dr => dr.department)
    }

    const activeDepartmentIdCookie = cookieStore.get('activeDepartmentId')
    let activeDepartmentId = activeDepartmentIdCookie?.value

    // Validate if the active department is accessible under the current activeRole
    const isValidDepartment = visibleDepartments.some(d => d.id === activeDepartmentId)
    
    // Fallback: If no valid active department is set, use the first one from visibleDepartments
    if ((!activeDepartmentId || !isValidDepartment) && visibleDepartments.length > 0) {
        activeDepartmentId = visibleDepartments[0].id
    }

    const { password, ...userWithoutPassword } = user
    
    // Calculate activeUniversityId
    let activeUniversityId = null;
    if (activeRole === 'admin' && user.universityRoles.length > 0) {
        activeUniversityId = user.universityRoles.find(r => r.role === 'admin')?.universityId || user.universityRoles[0]?.universityId;
    } else if (activeDepartmentId) {
        const activeDeptInfo = await prisma.department.findUnique({
            where: { id: activeDepartmentId },
            include: { faculty: true }
        });
        if (activeDeptInfo?.faculty?.universityId) {
            activeUniversityId = activeDeptInfo.faculty.universityId;
        }
    }

    return { 
        ...userWithoutPassword, 
        facultyName,
        departments: activeRole === 'super_admin' ? visibleDepartments : user.departments, 
        departmentRoles: user.departmentRoles, 
        activeDepartmentId, 
        activeUniversityId,
        activeRole, 
        roles 
    }
}

export async function setActiveProdiCookie(departmentId: string) {
    const cookieStore = await cookies()
    cookieStore.set('activeDepartmentId', departmentId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
    })
    return { success: true }
}

export async function setActiveRoleCookie(role: string) {
    const cookieStore = await cookies()
    cookieStore.set('activeRole', role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
    })
    return { success: true }
}

export async function getTeachers() {
    try {
        const teachers = await prisma.user.findMany({
            where: {
                role: { contains: 'teacher' }
            },
            select: {
                id: true,
                name: true,
                email: true,
                teacherProfile: {
                    select: {
                        gelarDepan: true,
                        gelarBelakang: true,
                        nidn: true,
                        nip: true
                    }
                },
                homebaseDepartment: {
                    select: {
                        id: true,
                        name: true,
                        faculty: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                departmentRoles: {
                    where: { role: 'teacher' },
                    select: {
                        department: {
                            select: {
                                id: true,
                                name: true,
                                faculty: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: [
                { homebaseDepartment: { faculty: { name: 'asc' } } },
                { homebaseDepartment: { name: 'asc' } },
                { name: 'asc' }
            ]
        })
        
        // Format the name and group
        const formattedTeachers = teachers.map(t => {
            let facultyName = 'Tanpa Fakultas'
            let departmentName = 'Tanpa Program Studi'
            
            if (t.homebaseDepartment) {
                facultyName = t.homebaseDepartment.faculty?.name || 'Tanpa Fakultas'
                departmentName = t.homebaseDepartment.name || 'Tanpa Program Studi'
            } else if (t.departmentRoles && t.departmentRoles.length > 0 && t.departmentRoles[0].department) {
                facultyName = t.departmentRoles[0].department.faculty?.name || 'Tanpa Fakultas'
                departmentName = t.departmentRoles[0].department.name || 'Tanpa Program Studi'
            }

            const gelarDepan = t.teacherProfile?.gelarDepan ? `${t.teacherProfile.gelarDepan} ` : ''
            const gelarBelakang = t.teacherProfile?.gelarBelakang ? `, ${t.teacherProfile.gelarBelakang}` : ''
            const fullName = `${gelarDepan}${t.name}${gelarBelakang}`
            
            return {
                id: t.id,
                name: fullName,
                rawName: t.name,
                email: t.email,
                nidn: t.teacherProfile?.nidn,
                nip: t.teacherProfile?.nip,
                departmentId: t.homebaseDepartment?.id || t.departmentRoles?.[0]?.department?.id,
                departmentName: departmentName,
                facultyId: t.homebaseDepartment?.faculty?.id || t.departmentRoles?.[0]?.department?.faculty?.id,
                facultyName: facultyName
            }
        })
        return { success: true, teachers: formattedTeachers }
    } catch (error) {
        console.error('Failed to get teachers', error)
        return { success: false, error: 'Gagal mengambil data dosen' }
    }
}

export async function forceChangePasswordAction(email: string, newPasswordPlain: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })

        if (!user || !user.mustChangePassword) {
            return { success: false, error: 'Sesi tidak valid.' }
        }

        const hashedPassword = await bcrypt.hash(newPasswordPlain, 10)
        
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                mustChangePassword: false
            }
        })

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function forceCompleteProfileAction(email: string, role: string, data: any) {
    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })

        if (!user) {
            return { success: false, error: 'Pengguna tidak ditemukan.' }
        }

        if (role === 'teacher') {
            if (data.nidn) {
                const existingNidn = await prisma.teacherProfile.findFirst({ where: { nidn: data.nidn } })
                if (existingNidn && existingNidn.userId !== user.id) return { success: false, error: 'NIDN tersebut sudah terdaftar pada akun lain.' }
            }
            if (data.nip) {
                const existingNip = await prisma.teacherProfile.findFirst({ where: { nip: data.nip } })
                if (existingNip && existingNip.userId !== user.id) return { success: false, error: 'NIP/NIK tersebut sudah terdaftar pada akun lain.' }
            }

            await prisma.teacherProfile.create({
                data: {
                    userId: user.id,
                    nidn: data.nidn || null,
                    nip: data.nip || null,
                    gelarDepan: data.gelarDepan || null,
                    gelarBelakang: data.gelarBelakang || null,
                    isDlb: data.isDlb || false
                }
            })
        } else if (role === 'student') {
            if (data.nim) {
                const existingNim = await prisma.studentProfile.findFirst({ where: { nim: data.nim } })
                if (existingNim && existingNim.userId !== user.id) return { success: false, error: 'NIM tersebut sudah terdaftar pada akun lain.' }
            }

            await prisma.studentProfile.create({
                data: {
                    userId: user.id,
                    nim: data.nim || null,
                    angkatan: data.angkatan ? parseInt(data.angkatan) : null,
                    jenisKelamin: data.jenisKelamin || null,
                    alamat: data.alamat || null
                }
            })
        } else {
            return { success: false, error: 'Role tidak dikenali.' }
        }

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function bulkEnrollStudents(courseId: string, students: { name: string, nim: string, email: string }[], departmentId: string) {
    if (!courseId || !departmentId || !students || students.length === 0) {
        return { success: false, error: 'Invalid data provided.' }
    }
    
    let newUsersCount = 0;
    let existingUsersEnrolledCount = 0;
    let existingUsersAlreadyEnrolledCount = 0;
    let errorCount = 0;
    const errorDetails: string[] = [];

    try {
        for (const student of students) {
            try {
                if (!student.name || !student.nim || !student.email) {
                    throw new Error("Missing name, nim, or email")
                }
                
                const emailToUse = student.email.toLowerCase().trim()
                const nimToUse = student.nim.trim()
                
                // Check if user exists by email or nim
                let user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: emailToUse },
                            { studentProfile: { nim: nimToUse } }
                        ]
                    },
                    include: { studentProfile: true }
                })
                
                if (!user) {
                    // Create new user Wajib ganti password, pw default sama dengan NIM
                    const hashedPassword = await bcrypt.hash(nimToUse, 10)
                    user = await prisma.user.create({
                        data: {
                            email: emailToUse,
                            name: student.name,
                            password: hashedPassword,
                            role: 'student',
                            approvalStatus: 'APPROVED',
                            mustChangePassword: true,
                            homebaseDepartmentId: departmentId,
                            studentProfile: {
                                create: {
                                    nim: nimToUse
                                }
                            },
                            departmentRoles: {
                                create: {
                                    departmentId: departmentId,
                                    role: 'student'
                                }
                            }
                        },
                        include: { studentProfile: true }
                    })
                    newUsersCount++;
                }

                // Make sure they are enrolled in the course
                const existingEnrollment = await prisma.enrollment.findUnique({
                    where: {
                        studentId_courseId: {
                            studentId: user.id,
                            courseId: courseId
                        }
                    }
                })

                if (!existingEnrollment) {
                    await prisma.enrollment.create({
                        data: {
                            studentId: user.id,
                            courseId: courseId,
                            status: 'active'
                        }
                    })
                    if (user.createdAt.getTime() < Date.now() - 10000) {
                        // Existed before this operation
                        existingUsersEnrolledCount++;
                    }
                } else {
                    existingUsersAlreadyEnrolledCount++;
                }
                
            } catch (err: any) {
                console.error(`Error processing student ${student.email}:`, err)
                errorCount++;
                errorDetails.push(`Gagal memproses ${student.email}: ${err.message}`)
            }
        }
        
        return { 
            success: true, 
            newUsersCount, 
            existingUsersEnrolledCount, 
            existingUsersAlreadyEnrolledCount,
            errorCount,
            errorDetails
        }
    } catch (error: any) {
        console.error("bulkEnrollStudents error:", error)
        return { success: false, error: 'Terjadi kesalahan internal.' }
    }
}
