import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const cedula = searchParams.get("cedula");

        const title = cedula ? `Cédula: ${cedula}` : "Fraude Venezuela";
        const subtitle = cedula
            ? "Verifica el estado de este elector en el registro."
            : "Herramienta de verificación ciudadana.";

        return new ImageResponse(
            (
                <div
                    style={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#fff",
                        backgroundImage: "radial-gradient(circle at 25px 25px, lightgray 2%, transparent 0%), radial-gradient(circle at 75px 75px, lightgray 2%, transparent 0%)",
                        backgroundSize: "100px 100px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "white",
                            padding: "40px 80px",
                            borderRadius: "20px",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                            border: "1px solid #eaeaea",
                        }}
                    >
                        <h1
                            style={{
                                fontSize: "60px",
                                fontWeight: "bold",
                                background: "linear-gradient(to right, #000, #444)",
                                backgroundClip: "text",
                                color: "transparent",
                                marginBottom: "20px",
                                textAlign: "center",
                            }}
                        >
                            {title}
                        </h1>
                        <p
                            style={{
                                fontSize: "30px",
                                color: "#666",
                                textAlign: "center",
                            }}
                        >
                            {subtitle}
                        </p>
                        <div
                            style={{
                                marginTop: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "10px 30px",
                                backgroundColor: "#000",
                                color: "white",
                                borderRadius: "50px",
                                fontSize: "24px",
                            }}
                        >
                            fraudevenezuela.com
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
