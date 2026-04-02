import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'mahasiswa' | 'dosen' | 'qa' | 'admin' | null

interface UserState {
    role: UserRole
    setRole: (role: UserRole) => void
    userName: string
    setUserName: (name: string) => void
    userId: string | null
    setUserId: (id: string) => void
    logout: () => void
    _hasHydrated: boolean
    setHasHydrated: (state: boolean) => void
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            role: null, // Initial state is not logged in
            setRole: (role) => set({ role }),
            userName: 'Guest',
            setUserName: (userName) => set({ userName }),
            userId: null,
            setUserId: (userId) => set({ userId }),
            logout: () => set({ role: null, userName: 'Guest', userId: null }),
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: 'user-storage', // name of the item in the storage (must be unique)
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true)
            }
        }
    )
)
