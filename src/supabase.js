import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ldtdslliqmkxahccgldk.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_h5VZ4kYkt1iCAPY-5Z1Khg_nN9QFYvu'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const STORE_KEY = 'rivals-census-y3y2'
const DRAFT_KEY = 'y3y2-draft-main'
const EMPTY = { captainCode: null, responses: [], comps: [], roster: [] }

// ── Census Store ──────────────────────────────────────────────────────────────
export async function loadStore() {
  try {
    const { data, error } = await supabase.from('census_data').select('value').eq('key', STORE_KEY).single()
    if (error || !data) return { ...EMPTY }
    return { ...EMPTY, ...JSON.parse(data.value) }
  } catch (_) { return { ...EMPTY } }
}
export async function saveStore(data) {
  try {
    const { error } = await supabase.from('census_data').upsert({ key: STORE_KEY, value: JSON.stringify(data), updated_at: new Date().toISOString() })
    return !error
  } catch (_) { return false }
}

// ── Comp Reviews ──────────────────────────────────────────────────────────────
export async function loadCompReviews(compId) {
  const { data, error } = await supabase.from('comp_reviews').select('*').eq('comp_id', String(compId)).order('created_at', { ascending: true })
  return error ? [] : data
}
export async function saveCompReview({ compId, playerName, comment, slotIndex, suggestedHero }) {
  const { data, error } = await supabase.from('comp_reviews').insert({
    comp_id: String(compId), player_name: playerName, comment: comment || null,
    slot_index: slotIndex ?? null, suggested_hero: suggestedHero ? JSON.stringify(suggestedHero) : null, status: 'pending',
  }).select().single()
  return error ? null : data
}
export async function updateReviewStatus(id, status) {
  const { error } = await supabase.from('comp_reviews').update({ status }).eq('id', id)
  return !error
}

// ── Availability ──────────────────────────────────────────────────────────────
export async function loadAllAvailability() {
  const { data, error } = await supabase.from('availability').select('*').order('updated_at', { ascending: false })
  return error ? [] : data
}
export async function savePlayerAvailability(playerName, availableDates) {
  const { error } = await supabase.from('availability').upsert({ player_name: playerName, available_dates: availableDates, updated_at: new Date().toISOString() })
  return !error
}

// ── Draft — state column is jsonb so Supabase returns it already parsed ───────
export async function loadDraft() {
  const { data, error } = await supabase.from('draft_sessions').select('state').eq('id', DRAFT_KEY).single()
  if (error || !data) return null
  // jsonb column returns an object; text would need JSON.parse — handle both
  const s = data.state
  if (!s) return null
  try { return typeof s === 'string' ? JSON.parse(s) : s } catch { return null }
}
export async function saveDraft(state) {
  // Pass the object directly — Supabase handles jsonb serialization
  const { error } = await supabase.from('draft_sessions').upsert({
    id: DRAFT_KEY, state: state, updated_at: new Date().toISOString()
  })
  return !error
}
export async function clearDraft() {
  await supabase.from('draft_sessions').delete().eq('id', DRAFT_KEY)
}
