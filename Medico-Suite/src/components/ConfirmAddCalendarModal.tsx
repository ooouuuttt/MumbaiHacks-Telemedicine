'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { ParsedPrescription } from '@/lib/calendarUtils';
import { mapFrequencyToTimes, extractDurationDays } from '@/lib/timeUtils';

interface MedicineWithTimes {
  name: string;
  dosage?: string;
  dose?: string;
  frequency?: string;
  duration?: string;
  notes?: string;
  times?: string[];
}

interface ConfirmAddCalendarModalProps {
  isOpen: boolean;
  prescription: ParsedPrescription | null;
  isLoading?: boolean;
  onConfirm: (updatedMedicines: MedicineWithTimes[]) => Promise<void>;
  onCancel: () => void;
}

export default function ConfirmAddCalendarModal({
  isOpen,
  prescription,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmAddCalendarModalProps) {
  const [medicines, setMedicines] = useState<MedicineWithTimes[]>(prescription?.medicines || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Update medicine times when prescription changes
  useEffect(() => {
    if (prescription) {
      setMedicines(
        prescription.medicines.map((med) => ({
          ...med,
          times: (med as any).times || mapFrequencyToTimes(med.frequency),
        }))
      );
    }
  }, [prescription, isOpen]);

  const handleTimeChange = (medIndex: number, timeIndex: number, newTime: string) => {
    const updatedMedicines = [...medicines];
    if (!updatedMedicines[medIndex].times) {
      updatedMedicines[medIndex].times = mapFrequencyToTimes(updatedMedicines[medIndex].frequency);
    }
    if (updatedMedicines[medIndex].times) {
      updatedMedicines[medIndex].times[timeIndex] = newTime;
    }
    setMedicines(updatedMedicines);
  };

  const handleAddTime = (medIndex: number) => {
    const updatedMedicines = [...medicines];
    if (!updatedMedicines[medIndex].times) {
      updatedMedicines[medIndex].times = [];
    }
    updatedMedicines[medIndex].times?.push('09:00');
    setMedicines(updatedMedicines);
  };

  const handleRemoveTime = (medIndex: number, timeIndex: number) => {
    const updatedMedicines = [...medicines];
    if (updatedMedicines[medIndex].times) {
      updatedMedicines[medIndex].times.splice(timeIndex, 1);
    }
    setMedicines(updatedMedicines);
  };

  const handleConfirm = async () => {
    await onConfirm(medicines);
  };

  if (!prescription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Add Medicine Reminders to Google Calendar?
          </DialogTitle>
          <DialogDescription>
            Dr. {prescription.doctorName || 'Unknown'} • {prescription.date || new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info banner */}
          <div className="flex gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-900 border border-blue-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              We'll create recurring reminders for each medicine dose based on frequency and duration. You
              can adjust the times below.
            </p>
          </div>

          {/* Medicines */}
          <div className="space-y-3">
            {medicines.map((med, medIndex) => {
              const times = med.times || mapFrequencyToTimes(med.frequency);
              const duration = extractDurationDays(med.duration);

              return (
                <Card key={medIndex} className="p-4 space-y-3">
                  {/* Medicine header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-base">{med.name}</div>
                      {med.dosage || med.dose ? (
                        <Badge variant="secondary" className="mt-1">
                          {med.dosage || med.dose}
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  {/* Duration info */}
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Duration:</span> {med.duration || `${duration} days`}
                  </div>

                  {/* Times editor */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Reminder Times</Label>
                    <div className="space-y-2">
                      {(times || []).map((time: string, timeIndex: number) => (
                        <div key={timeIndex} className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={time}
                            onChange={(e) => handleTimeChange(medIndex, timeIndex, e.target.value)}
                            className="w-32"
                            disabled={isLoading}
                          />
                          <span className="text-xs text-muted-foreground">
                            {`Daily for ${duration} days`}
                          </span>
                          {times && times.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTime(medIndex, timeIndex)}
                              disabled={isLoading}
                              className="ml-auto h-8 w-8 p-0"
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTime(medIndex)}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      + Add Time
                    </Button>
                  </div>

                  {/* Notes */}
                  {med.notes && (
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      <span className="font-medium">Notes:</span> {med.notes}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm text-green-900 border border-green-200">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <p>{medicines.length} medicine(s) will get {medicines.reduce((sum, m) => sum + ((m.times || mapFrequencyToTimes(m.frequency))?.length || 0), 0)} reminder(s) each.</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Creating Events...' : 'Add to Calendar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
