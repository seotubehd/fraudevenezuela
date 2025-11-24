export interface CedulaData {
  cedula: string;
  nombre: string;
  estado: string;
  municipio: string;
  parroquia: string;
  centro: string;
}

interface ApiResponse {
  error: boolean;
  error_str: boolean | string;
  data?: {
    nacionalidad: string;
    cedula: number;
    rif: string;
    primer_apellido: string;
    segundo_apellido: string;
    primer_nombre: string;
    segundo_nombre: string;
    cne?: {
      estado: string;
      municipio: string;
      parroquia: string;
      centro_electoral: string;
    };
    request_date: string;
  };
}

export async function getCedula(cedula: string): Promise<CedulaData | null> {
  try {
    const url = `/api/cedula?cedula=${encodeURIComponent(cedula)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse = await response.json();

    if (result.error || !result.data) {
      console.error("API Error:", result.error_str);
      return null;
    }

    const apiData = result.data;

    // Si no hay datos CNE, usar "N/A"
    const cneData = apiData.cne || {
      estado: "N/A",
      municipio: "N/A",
      parroquia: "N/A",
      centro_electoral: "N/A"
    };

    return {
      cedula: `${apiData.nacionalidad}-${apiData.cedula}`,
      nombre: `${apiData.primer_nombre} ${apiData.segundo_nombre || ""} ${apiData.primer_apellido} ${apiData.segundo_apellido || ""}`.trim(),
      estado: cneData.estado,
      municipio: cneData.municipio,
      parroquia: cneData.parroquia,
      centro: cneData.centro_electoral
    };
  } catch (error) {
    console.error("Error fetching cedula from API:", error);
    throw error;
  }
}
