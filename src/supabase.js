import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ldtdslliqmkxahccgldk.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_h5VZ4kYkt1iCAPY-5Z1Khg_nN9QFYvu'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const STORE_KEY = 'rivals-census-y3y2'
const EMPTY = { captainCode: null, responses: [], comps: [] }

export async function loadStore() {
  try {
    const { data, error } = await supabase
      .from('census_data')
      .select('value')
      .eq('key', STORE_KEY)
      .single()
    if (error || !data) return { ...EMPTY }
    return { ...EMPTY, ...JSON.parse(data.value) }
  } catch (_) {
    return { ...EMPTY }
  }
}

export async function saveStore(data) {
  try {
    const { error } = await supabase
      .from('census_data')
      .upsert({ key: STORE_KEY, value: JSON.stringify(data), updated_at: new Date().toISOString() })
    return !error
  } catch (_) {
    return false
  }
}
