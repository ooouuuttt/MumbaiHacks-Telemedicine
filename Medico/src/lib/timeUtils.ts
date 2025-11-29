/**
 * Map medicine frequency text to suggested times
 * Examples: "once daily" → ["09:00"]
 *          "twice daily" → ["09:00", "21:00"]
 *          "TID" → ["08:00", "14:00", "20:00"]
 */
export function mapFrequencyToTimes(freq: string | undefined): string[] {
  if (!freq) return ['09:00'];

  const s = (freq || '').toLowerCase().trim();

  // Once daily
  if (/(once\s+a\s+day|once\s+daily|od|o\.d\.)\b/.test(s)) {
    return ['09:00'];
  }

  // Twice daily
  if (/(twice\s*a?\s*day|bd|b\.d\.|twice\s*daily)\b/.test(s)) {
    return ['09:00', '21:00'];
  }

  // Three times a day
  if (/(three\s+times|tid|t\.i\.d\.|tds|t\.d\.s\.)\b/.test(s)) {
    return ['08:00', '14:00', '20:00'];
  }

  // Four times a day
  if (/(four\s+times|qid|q\.i\.d\.)\b/.test(s)) {
    return ['08:00', '12:00', '16:00', '20:00'];
  }

  // At bedtime
  if (/(at\s+bedtime|bedtime|hs|h\.s\.)\b/.test(s)) {
    return ['22:00'];
  }

  // Every N hours
  const everyMatch = s.match(/every\s+(\d{1,2})\s*hours?/);
  if (everyMatch) {
    const hours = parseInt(everyMatch[1], 10);
    const times: string[] = [];
    for (let t = 8; t < 24; t += hours) {
      times.push(`${String(t).padStart(2, '0')}:00`);
    }
    return times.length > 0 ? times : ['09:00'];
  }

  // Every N hours (alternative format)
  const hourlyMatch = s.match(/(\d{1,2})\s*(?:hrly|h)\b/);
  if (hourlyMatch) {
    const hours = parseInt(hourlyMatch[1], 10);
    const times: string[] = [];
    for (let t = 8; t < 24; t += hours) {
      times.push(`${String(t).padStart(2, '0')}:00`);
    }
    return times.length > 0 ? times : ['09:00'];
  }

  // Default
  return ['09:00'];
}

/**
 * Extract duration in days from duration string
 * Examples: "5 days" → 5
 *          "2 weeks" → 14
 *          "1 month" → 30
 */
export function extractDurationDays(durationStr: string | undefined): number {
  if (!durationStr) return 7; // default 7 days

  const s = (durationStr || '').toLowerCase().trim();

  // Extract number first
  const numMatch = s.match(/(\d+)/);
  if (!numMatch) return 7;

  const num = parseInt(numMatch[1], 10);

  // Check unit
  if (/week/.test(s)) return num * 7;
  if (/month/.test(s)) return num * 30;
  if (/day/.test(s)) return num;

  // Default to days
  return num;
}
