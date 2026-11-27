import { consumptionBetween, calculateDaysRemaining } from './medUtils';

/** A statutory prescription form (Muster 16) holds at most three medications. */
export const MAX_LINES_PER_PRESCRIPTION = 3;
export const DEFAULT_BUFFER_DAYS = 7;

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Packages per medication needed so that stock lasts until targetDate plus bufferDays.
 * Today's dose is already deducted on unlock, so consumption starts tomorrow.
 * Lines are ordered by urgency: the medication that runs out first comes first.
 */
export function calculatePrescriptionNeeds(
  meds,
  targetDate,
  { today = new Date(), bufferDays = DEFAULT_BUFFER_DAYS } = {}
) {
  const endDate = addDays(targetDate, Math.max(0, Number(bufferDays) || 0));
  return (meds || [])
    .map((med, index) => {
      const needed = consumptionBetween(med, today, endDate);
      // Two decimals: half doses add up to float noise
      const missing = Math.round((needed - (parseFloat(med.count) || 0)) * 100) / 100;
      if (needed <= 0 || missing <= 0) return null;
      const packageSize = parseFloat(med.packageSize) > 0 ? parseFloat(med.packageSize) : null;
      return {
        index,
        name: med.name,
        packageSize,
        packages: packageSize ? Math.ceil(missing / packageSize) : null,
        missingUnits: Math.ceil(missing),
        daysRemaining: calculateDaysRemaining(med)
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.daysRemaining ?? Infinity) - (b.daysRemaining ?? Infinity));
}

/** Splits lines into prescriptions of at most MAX_LINES_PER_PRESCRIPTION each. */
export function groupIntoPrescriptions(lines, maxLines = MAX_LINES_PER_PRESCRIPTION) {
  const prescriptions = [];
  for (let i = 0; i < lines.length; i += maxLines) {
    prescriptions.push(lines.slice(i, i + maxLines));
  }
  return prescriptions;
}

/**
 * Plain text for sharing with the practice. `t` is vue-i18n's translate function.
 * Keys: prescription.heading, prescription.line, prescription.lineNoPackage.
 */
export function formatPrescriptionText(prescriptions, t) {
  return prescriptions
    .map((lines, i) => {
      const body = lines.map((line) =>
        line.packages
          ? t('prescription.line', { packages: line.packages, name: line.name, size: line.packageSize })
          : t('prescription.lineNoPackage', { name: line.name, units: line.missingUnits })
      );
      return [t('prescription.heading', { number: i + 1 }), ...body.map((text) => `- ${text}`)].join('\n');
    })
    .join('\n\n');
}
