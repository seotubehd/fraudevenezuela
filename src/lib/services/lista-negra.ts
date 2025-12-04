
import { adminDb } from '@/lib/firebase/admin';

export interface ReportedPerson {
  cedula: string;
  nombreCompleto: string;
  reportCount: number;
}

const PAGE_SIZE = 50;

/**
 * Fetches a single page of reported people from the summary collection.
 * This is the most efficient method, performing a paginated server-side query.
 */
export async function getReportedPeople(page: number = 1): Promise<ReportedPerson[]> {
  try {
    const offset = (page - 1) * PAGE_SIZE;

    const summarySnapshot = await adminDb.collection('listaNegraResumen')
                                         .orderBy('reportCount', 'desc')
                                         .limit(PAGE_SIZE)
                                         .offset(offset)
                                         .get();

    if (summarySnapshot.empty) {
      return [];
    }

    const reportedPeople: ReportedPerson[] = summarySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        cedula: data.cedula,
        nombreCompleto: data.nombreCompleto,
        reportCount: data.reportCount,
      };
    });

    return reportedPeople;

  } catch (error) {
    console.error('Error fetching paginated reported people:', error);
    throw error; // Re-throw to be handled by the API route
  }
}

/**
 * Gets the total count of documents in the listaNegraResumen collection.
 * This uses the efficient .getCount() method.
 */
export async function getReportedPeopleCount(): Promise<number> {
  try {
    const snapshot = await adminDb.collection('listaNegraResumen').count().get();
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting reported people count:", error);
    throw error; // Re-throw to be handled by the API route
  }
}
