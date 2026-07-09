import type { Role } from '~/types/trade'

export interface AdminUser {
  id: string
  email: string
  role: Role
  display_name: string | null
  phone: string | null
  created_at: string
  last_sign_in_at: string | null
  confirmed: boolean
}

export interface NewUserInput {
  email: string
  password: string
  role: Role
  display_name: string | null
  phone: string | null
}

export interface EditUserInput {
  email?: string
  password?: string
  role?: Role
  display_name?: string | null
  phone?: string | null
}

// Kelola user (khusus admin). Semua lewat server route ber-service-role.
export function useAdminUsers() {
  function list(): Promise<AdminUser[]> {
    return $fetch<AdminUser[]>('/api/admin/users')
  }

  function create(payload: NewUserInput) {
    return $fetch('/api/admin/users', { method: 'POST', body: payload })
  }

  function update(id: string, payload: EditUserInput) {
    return $fetch(`/api/admin/users/${id}`, { method: 'PATCH', body: payload })
  }

  function remove(id: string) {
    return $fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
  }

  return { list, create, update, remove }
}
