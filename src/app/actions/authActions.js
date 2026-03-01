
'use server'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function resetUserPasswordAdmin(userId, newPassword) {
    try {
        if (!userId || !newPassword) {
            return { success: false, error: 'Data tidak lengkap.' }
        }

        if (newPassword.length < 6) {
            return { success: false, error: 'Password minimal 6 karakter.' }
        }

        // Only works if SUPABASE_SERVICE_ROLE_KEY is correctly set in .env.local
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { password: newPassword }
        )

        if (error) {
            console.error('Admin Auth Error:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (err) {
        console.error('Server Action Error:', err)
        return { success: false, error: 'Terjadi kesalahan pada server.' }
    }
}

export async function updateUserEmailAdmin(userId, newEmail) {
    try {
        if (!userId || !newEmail) {
            return { success: false, error: 'Data tidak lengkap.' }
        }

        const { error } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { email: newEmail, email_confirm: true }
        )

        if (error) {
            console.error('Admin Auth Error:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (err) {
        console.error('Server Action Error:', err)
        return { success: false, error: 'Terjadi kesalahan pada server.' }
    }
}
export async function deleteUserAdmin(userId) {
    try {
        if (!userId) {
            return { success: false, error: 'User ID tidak lengkap.' }
        }

        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (error) {
            console.error('Admin Auth Error:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (err) {
        console.error('Server Action Error:', err)
        return { success: false, error: 'Terjadi kesalahan pada server.' }
    }
}
