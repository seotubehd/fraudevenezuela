// src/app/api/lista-negra/route.ts
import { getReportedPeople, getReportedPeopleCount } from "@/lib/services/lista-negra";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  try {
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);

    const [totalCount, people] = await Promise.all([
      getReportedPeopleCount(),
      getReportedPeople(page)
    ]);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return NextResponse.json({
      people,
      totalPages,
    });

  } catch (error) {
    console.error("Error in /api/lista-negra route:", error);

    // Type guard to safely check the structure of the error object
    if (typeof error === 'object' && error !== null && 'code' in error && 'details' in error) {
      const firestoreError = error as { code: unknown; details: unknown };
      if (firestoreError.code === 8) {
        return new NextResponse(JSON.stringify({
          message: "RESOURCE_EXHAUSTED: La cuota de lectura de la base de datos ha sido excedida. Esto suele ser temporal. Por favor, inténtalo de nuevo en unos minutos.",
          error: firestoreError.details
        }), {
          status: 429, // 'Too Many Requests' is appropriate here.
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Ensure the data is fetched dynamically on every request
export const dynamic = 'force-dynamic';
