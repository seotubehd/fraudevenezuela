import { Report } from "@/types/report";
import { unstable_cache as nextCache } from "next/cache";

// --- Cédula Data Fetching ---

export interface CedulaData {
  nombre: string;
}

/**
 * Fetches the name associated with a given Cédula from an external API.
 * This function is wrapped in `nextCache` to provide granular, persistent caching
 * even when called from dynamically rendered pages. The cache will hold the data
 * for one day (86400 seconds). This is the key to solving the caching issue.
 */
export const getCedula = nextCache(
  async (cedula: string): Promise<CedulaData | null> => {
    console.log(`[getCedula] Procesando para la cédula: ${cedula}`);

    const url = `https://api.venezuelan.id/v1/cedula/${cedula}`;
    try {
      const response = await fetch(url, {
        headers: {
          "X-API-KEY": "API_KEY_GOES_HERE", // Replace with your actual API key
        },
        // We let the `nextCache` wrapper handle caching, so we don't specify it here.
      });

      if (!response.ok) {
        console.error(`[getCedula] API request failed with status: ${response.status}`);
        return null;
      }

      const data = await response.json();

      // Basic validation of the response structure
      if (typeof data.nombre === "string") {
        return { nombre: data.nombre.trim() };
      } else {
        console.warn("[getCedula] API response did not contain a valid 'nombre' field.");
        return null;
      }
    } catch (error) {
      console.error("[getCedula] An unexpected error occurred during fetch:", error);
      return null;
    }
  },
  ["cedula-data"], // A unique key part for this cache bucket
  {
    revalidate: 86400, // Revalidate the data after 1 day
  }
);


// --- Reports Data Fetching (Firestore) ---

// Helper function to fetch reports from the reports API endpoint
async function fetchReports(cedula: string): Promise<Report[]> {
    const apiUrl = `https://fraudevenezuela-api-a5fx-dev.fl0.io/api/v1/reports/cedula/${cedula}`;
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // This fetch should ALWAYS be fresh, so we don't cache it.
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error(`[fetchReports] API request failed with status: ${response.status}`);
            return [];
        }

        const reports = await response.json();
        return Array.isArray(reports) ? reports : [];

    } catch (error) {
        console.error("[fetchReports] An unexpected error occurred during fetch:", error);
        return [];
    }
}

/**
 * Gets all reports for a given Cédula.
 * This function fetches data in real-time and is NOT cached.
 */
export async function getReportsByCedula(cedula: string): Promise<Report[]> {
  console.log(`[getReportsByCedula] Buscando reportes en tiempo real para: ${cedula}`);
  return await fetchReports(cedula);
}
