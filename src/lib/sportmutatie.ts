export type StatusKey = 'niet_sporten' | 'beperkt' | 'voorzichtig' | 'vrijgegeven';

export const PRIORITY: StatusKey[] = ['niet_sporten','beperkt','voorzichtig','vrijgegeven'];

export const DEFAULT_COLORS: Record<StatusKey, string> = {
  niet_sporten: '#dc2626',  // rood
  beperkt:     '#f97316',   // oranje
  voorzichtig: '#eab308',   // geel
  vrijgegeven: '#16a34a',   // groen
};

export function normalizeStatus(input: string | undefined | null): StatusKey | null {
  if (!input) return null;
  const s = String(input).toLowerCase();

  // Niet sporten (totaal verbod)
  if (/(niet\s*sporten|totaal\s*verbod|verbod|no\s*sport)/.test(s)) return 'niet_sporten';

  // "Alleen fitness" en algemene "beperkt"
  if (/(alleen\s*fitness|alleen\s*fitnes|fitness\s*alleen)/.test(s)) return 'beperkt';
  if (/(beperkt|gedeeltelijk|partieel|beperking)/.test(s)) return 'beperkt';

  // Voorzichtig / licht
  if (/(voorzichtig|rustig|licht)/.test(s)) return 'voorzichtig';

  // Volledig vrij
  if (/(vrijgegeven|vrij\b|ok|toegestaan)/.test(s)) return 'vrijgegeven';

  return null;
}

export function loadColorMap(): Record<StatusKey, string> {
  if (typeof window === 'undefined') return DEFAULT_COLORS;
  try {
    const raw = localStorage.getItem('statusColors');
    if (!raw) return DEFAULT_COLORS;
    const obj = JSON.parse(raw) || {};
    return { ...DEFAULT_COLORS, ...obj };
  } catch {
    return DEFAULT_COLORS;
  }
}

export function saveColorMap(map: Partial<Record<StatusKey, string>>) {
  if (typeof window === 'undefined') return;
  try {
    const merged = { ...DEFAULT_COLORS, ...(map || {}) };
    localStorage.setItem('statusColors', JSON.stringify(merged));
  } catch {}
}

export function deriveGroupStatus(mutaties: any[], group: string): StatusKey | null {
  const now = new Date();
  let best: StatusKey | null = null;
  let bestIdx = PRIORITY.length;

  for (const m of mutaties) {
    const g = String(m.group ?? m.groep ?? '').trim();
    if (g !== group) continue;
    if (m.active === false) continue;
    if (m.end && new Date(m.end) < now) continue;

    // Zoek status in diverse velden + note (b.v. "alleen fitness")
    const key = normalizeStatus(
      [m.status, m.severity, m.kleur, m.type, m.note].filter(Boolean).join(' ')
    );
    if (!key) continue;

    const idx = PRIORITY.indexOf(key);
    if (idx !== -1 && idx < bestIdx) {
      bestIdx = idx;
      best = key;
    }
  }
  return best;
}
