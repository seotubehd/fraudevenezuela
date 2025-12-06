
import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAdmin } from '@/lib/admin-auth';
// Corrected the import path. The type is now AdminReport, imported as Report.
import { AdminReport as Report } from '@/lib/services/admin';

export interface AdminData {
  stats: {
    total: number;
    pending: number;
    verified: number;
    rejected: number;
    shares: number;
  };
  reports: Report[];
  totalReports: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminData | { error: string } | { message: string }>
) {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    await verifyAdmin(idToken);

    const reportsCollection = adminDb.collection('reports');

    switch (req.method) {
      case 'GET':
        const metricsDoc = adminDb.collection('metrics').doc('metadata');
        const totalPromise = reportsCollection.count().get();
        const pendingPromise = reportsCollection.where('status', '==', 'pending').count().get();
        const verifiedPromise = reportsCollection.where('status', '==', 'verified').count().get();
        const rejectedPromise = reportsCollection.where('status', '==', 'rejected').count().get();
        const sharesPromise = metricsDoc.get();

        const [totalSnapshot, pendingSnapshot, verifiedSnapshot, rejectedSnapshot, sharesDoc] = await Promise.all([
          totalPromise, pendingPromise, verifiedPromise, rejectedPromise, sharesPromise
        ]);

        const stats = {
          total: totalSnapshot.data().count,
          pending: pendingSnapshot.data().count,
          verified: verifiedSnapshot.data().count,
          rejected: rejectedSnapshot.data().count,
          shares: sharesDoc.data()?.shareCount || 0,
        };

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = (req.query.status as string) || 'pending';
        const offset = (page - 1) * limit;

        let reportsQuery = reportsCollection.where('status', '==', status);
        const totalFilteredReportsPromise = reportsQuery.count().get();

        const paginatedQuery = reportsQuery.orderBy('createdAt', 'desc').limit(limit).offset(offset);

        const [reportsSnapshot, totalFilteredSnapshot] = await Promise.all([paginatedQuery.get(), totalFilteredReportsPromise]);

        const reports = reportsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate().toISOString(),
          } as Report;
        });

        const totalReports = totalFilteredSnapshot.data().count;

        return res.status(200).json({ stats, reports, totalReports });

      case 'PUT':
        const { reportIds, status: newStatus } = req.body;
        if (!reportIds || !newStatus || !Array.isArray(reportIds) || reportIds.length === 0) {
          return res.status(400).json({ error: 'Invalid request body. Requires reportIds array and status.' });
        }
        const batchUpdate = adminDb.batch();
        reportIds.forEach((id: string) => {
          const docRef = reportsCollection.doc(id);
          batchUpdate.update(docRef, { status: newStatus });
        });
        await batchUpdate.commit();
        return res.status(200).json({ message: 'Reports updated successfully.' });

      case 'DELETE':
        const { reportIds: idsToDelete } = req.body;
        if (!idsToDelete || !Array.isArray(idsToDelete) || idsToDelete.length === 0) {
          return res.status(400).json({ error: 'Invalid request body. Requires reportIds array.' });
        }
        const batchDelete = adminDb.batch();
        idsToDelete.forEach((id: string) => {
          const docRef = reportsCollection.doc(id);
          batchDelete.delete(docRef);
        });
        await batchDelete.commit();
        return res.status(200).json({ message: 'Reports deleted successfully.' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Error in /api/admin/reports:', error.code, error.message);
    if (error.message.includes('401')) {
      return res.status(401).json({ error: 'Authentication failed.' });
    }
    if (error.message.includes('403')) {
      return res.status(403).json({ error: 'User does not have admin privileges.' });
    }
    if (error.code === 8 || error.code === 'RESOURCE_EXHAUSTED') {
      return res.status(429).json({ error: 'Quota exceeded. Please try again later.' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
