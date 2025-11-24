import { NextRequest, NextResponse } from "next/server";

const API_CONFIG = {
    baseUrl: "https://api.cedula.com.ve/api/v1",
    appId: "1433",
    token: "4b8c954364ff8af253c18a7eaa1950c5"
};

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const cedula = searchParams.get("cedula");

    if (!cedula) {
        return NextResponse.json(
            { error: true, message: "Cédula is required" },
            { status: 400 }
        );
    }

    // Normalizar cédula
    const cleanCedula = cedula.replace(/[^0-9]/g, "");
    const nacionalidad = cedula.toUpperCase().startsWith("E") ? "E" : "V";

    try {
        const url = `${API_CONFIG.baseUrl}?app_id=${API_CONFIG.appId}&token=${API_CONFIG.token}&nacionalidad=${nacionalidad}&cedula=${cleanCedula}`;

        const response = await fetch(url);

        if (!response.ok) {
            return NextResponse.json(
                { error: true, message: `API error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error fetching from external API:", error);
        return NextResponse.json(
            { error: true, message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
