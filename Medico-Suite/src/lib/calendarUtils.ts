import { mapFrequencyToTimes, extractDurationDays } from './timeUtils';

export interface ParsedMedicine {
  name: string;
  dosage?: string;
  dose?: string;
  frequency?: string;
  duration?: string;
  notes?: string;
}

export interface ParsedPrescription {
  doctorName?: string;
  date?: string;
  medicines: ParsedMedicine[];
  rawText?: string;
}

export interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  recurrence: string[];
  reminders: {
    useDefault: boolean;
    overrides: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

/**
 * Build Google Calendar event objects from parsed prescription
 * Creates one recurring event per dose time per medicine
 */
export function buildEventsFromPrescription(
  prescription: ParsedPrescription,
  timezone: string = 'Asia/Kolkata'
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  // Parse prescription.date robustly. Accept formats like:
  // - YYYY-MM-DD
  // - DD/MM/YYYY
  // - any ISO-parseable string
  function parseStartDate(d?: string): string {
    if (!d) return new Date().toISOString().split('T')[0];

    // If already ISO YYYY-MM-DD or ISO datetime, try Date.parse
    const isoCandidate = d.trim();
    // Detect DD/MM/YYYY (common in many locales)
    const ddmmyyyy = isoCandidate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const day = ddmmyyyy[1].padStart(2, '0');
      const month = ddmmyyyy[2].padStart(2, '0');
      const year = ddmmyyyy[3];
      return `${year}-${month}-${day}`;
    }

    // Try Date parse and fallback to today
    const parsed = new Date(isoCandidate);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }

    return new Date().toISOString().split('T')[0];
  }

  const startDate = parseStartDate(prescription.date); // YYYY-MM-DD

  for (const med of prescription.medicines) {
    const times = mapFrequencyToTimes(med.frequency);
    const durationDays = extractDurationDays(med.duration);

    for (const time of times) {
      // Build start datetime string: YYYY-MM-DDTHH:MM:SS (no Z)
      const startDateTime = `${startDate}T${time}:00`;

      // Compute end time by adding minutes to HH:MM without timezone arithmetic
      function addMinutesToTime(hhmm: string, minutesToAdd: number): string {
        const [hh, mm] = hhmm.split(':').map((s) => parseInt(s, 10));
        const total = hh * 60 + mm + minutesToAdd;
        const endH = Math.floor((total % (24 * 60)) / 60);
        const endM = total % 60;
        return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
      }

      const endTime = addMinutesToTime(time, 5);
      const endDateTime = `${startDate}T${endTime}`;

      const summary = `${med.name}${med.dosage ? ` (${med.dosage})` : med.dose ? ` (${med.dose})` : ''}`.trim();

      const description = [
        `Prescription from Dr. ${prescription.doctorName || 'Unknown'}`,
        med.notes ? `Notes: ${med.notes}` : '',
        med.frequency ? `Frequency: ${med.frequency}` : '',
        med.duration ? `Duration: ${med.duration}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const event: CalendarEvent = {
        summary,
        description,
        start: {
          dateTime: startDateTime,
          timeZone: timezone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: timezone,
        },
        recurrence: [`RRULE:FREQ=DAILY;COUNT=${durationDays}`],
        reminders: {
          useDefault: false,
          overrides: [
            {
              method: 'popup',
              minutes: 10,
            },
          ],
        },
      };

      events.push(event);
    }
  }

  return events;
}

/**
 * Get browser timezone or fallback to Asia/Kolkata
 * (This should be called client-side only)
 */
export function getBrowserTimezone(): string {
  if (typeof window === 'undefined') return 'Asia/Kolkata';
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Asia/Kolkata';
  }
}
