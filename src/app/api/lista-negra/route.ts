import { NextResponse } from 'next/server';
import { getBlacklistSummary } from '@/lib/services/lista-negra';

/**
 * API route to get the top 10 most recently reported individuals from the blacklist summary.
 * This provides a snapshot of the latest activity.
 */
export async function GET() {
  try {
    // Fetch only the top 10 most recent entries
    const people = await getBlacklistSummary({ limit: 10 });

    return NextResponse.json(people);

  } catch (error: any) {
    console.error('Error fetching blacklist summary:', error);

    // Create a user-friendly error message
    let errorMessage = 'An unexpected error occurred.';
    let statusCode = 500;

    if (error.code === 'resource-exhausted' || (error.message && error.message.includes('RESOURCE_EXHAUSTED'))) {
      errorMessage = 'La cuota de lectura de la base de datos ha sido excedida. Esto suele ser temporal. Por favor, inténtalo de nuevo en unos minutos.';
      statusCode = 429; // Too Many Requests
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
