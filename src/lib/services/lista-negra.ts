import { adminDb as db } from '@/lib/firebase/admin';

export interface ReportedPerson {
  cedula: string;
  nombreCompleto: string;
  reportCount: number;
}

/**
 * Fetches all verified reports and processes them in-memory to generate a blacklist summary.
 * This method is robust and avoids complex queries that require manual indexes.
 */
export async function getBlacklistSummary(options: { limit?: number } = {}): Promise<ReportedPerson[]> {
  const reportLimit = options.limit || 10;

  // 1. Fetch all verified reports with a simple query.
  const reportsSnapshot = await db
    .collection('reports')
    .where('status', '==', 'verified')
    .get();

  if (reportsSnapshot.empty) {
    return [];
  }

  // 2. Process reports in-memory to count occurrences.
  const peopleCount = new Map<string, ReportedPerson>();

  reportsSnapshot.forEach(doc => {
    const report = doc.data();
    const cedula = report.cedula;

    if (peopleCount.has(cedula)) {
      // Increment count if person already exists
      const person = peopleCount.get(cedula)!;
      person.reportCount += 1;
    } else {
      // Add person to map if new
      peopleCount.set(cedula, {
        cedula: cedula,
        nombreCompleto: report.nombreCompleto,
        reportCount: 1,
      });
    }
  });

  // 3. Convert map to array, sort by report count, and get top N.
  const allReportedPeople = Array.from(peopleCount.values());

  allReportedPeople.sort((a, b) => b.reportCount - a.reportCount);

  return allReportedPeople.slice(0, reportLimit);
}
