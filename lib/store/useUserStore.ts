import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'student' | 'teacher' | 'qa' | 'admin' | 'super_admin' | 'head_of_department' | 'dean' | 'rector' | null

interface UserState {
    role: UserRole // Deprecated but kept for backward compatibility; represents activeRole
    setRole: (role: UserRole) => void
    roles: string[]
    setRoles: (roles: string[]) => void
    activeRole: UserRole
    setActiveRole: (role: UserRole) => void
    userName: string
    setUserName: (name: string) => void
    userId: string | null
    setUserId: (id: string) => void
    departments: { id: string, name: string, code: string }[]
    setProdis: (departments: { id: string, name: string, code: string }[]) => void
    departmentRoles?: { departmentId: string, role: string, department?: { id: string, name: string, code: string } }[]
    setDepartmentRoles: (roles: any[]) => void
    activeDepartmentId: string | null
    setActiveDepartmentId: (id: string) => void
    facultyName: string | null
    setFacultyName: (name: string | null) => void
    logout: () => void
    _hasHydrated: boolean
    setHasHydrated: (state: boolean) => void
    isSidebarCollapsed: boolean
    toggleSidebar: () => void
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            role: null, // Initial state is not logged in
            setRole: (role) => set({ role, activeRole: role }),
            roles: [],
            setRoles: (roles) => set({ roles }),
            activeRole: null,
            setActiveRole: (activeRole) => set({ activeRole, role: activeRole }),
            userName: 'Guest',
            setUserName: (userName) => set({ userName }),
            userId: null,
            setUserId: (userId) => set({ userId }),
            departments: [],
            setProdis: (departments) => set({ departments }),
            activeDepartmentId: null,
            setActiveDepartmentId: (activeDepartmentId) => set({ activeDepartmentId }),
            departmentRoles: [],
            setDepartmentRoles: (roles) => set({ departmentRoles: roles }),
            facultyName: null,
            setFacultyName: (name) => set({ facultyName: name }),
            logout: () => set({ role: null, activeRole: null, roles: [], userName: 'Guest', userId: null, departments: [], departmentRoles: [], activeDepartmentId: null, facultyName: null }),
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
            isSidebarCollapsed: false,
            toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
        }),
        {
            name: 'user-storage', // name of the item in the storage (must be unique)
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true)
            }
        }
    )
)
