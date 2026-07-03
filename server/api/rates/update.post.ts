import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// Tarik kurs USD->IDR terkini lalu simpan ke tabel exchange_rates.
// Hanya bisa dipanggil admin yang login.
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Harus login admin untuk update kurs.' })
  }

  let usdIdr: number | null = null
  let source = 'open.er-api.com'

  try {
    const res = await $fetch<any>('https://open.er-api.com/v6/latest/USD')
    usdIdr = Number(res?.rates?.IDR) || null
  } catch {
    usdIdr = null
  }

  // fallback provider
  if (!usdIdr) {
    try {
      const res2 = await $fetch<any>('https://api.frankfurter.app/latest?from=USD&to=IDR')
      usdIdr = Number(res2?.rates?.IDR) || null
      source = 'frankfurter.app'
    } catch {
      /* ignore */
    }
  }

  if (!usdIdr) {
    throw createError({ statusCode: 502, statusMessage: 'Gagal mengambil kurs dari API.' })
  }

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('exchange_rates')
    .update({ usd_idr: usdIdr, source } as never)
    .eq('id', 1)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  return data
})
