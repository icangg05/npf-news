import type { Currency } from '~/types/trade'
import { CURRENCIES } from '~/types/trade'

// Format mata uang tampilan (USD/USC/IDR), dibagi antar-halaman lewat useState
// dan diingat antar-reload lewat localStorage.
export function useDisplayCurrency() {
  const currency = useState<Currency>('display-currency', () => 'USC')
  onMounted(() => {
    const saved = localStorage.getItem('display-currency')
    if (saved && (CURRENCIES as string[]).includes(saved)) currency.value = saved as Currency
    watch(currency, (v) => localStorage.setItem('display-currency', v))
  })
  return currency
}
