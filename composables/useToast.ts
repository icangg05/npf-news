import { toast } from 'vue-sonner'

// Wrapper tipis di atas vue-sonner supaya API lama (toast.success/error/info)
// tetap sama di seluruh halaman.
export function useToast() {
  return {
    success: (m: string) => toast.success(m),
    error: (m: string) => toast.error(m),
    info: (m: string) => toast(m),
    message: (m: string) => toast(m),
  }
}
