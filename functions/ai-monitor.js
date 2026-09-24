export async function onRequestPost(context) {
    try {
        const sentryPayload = await context.request.json();
        const errorDetails = sentryPayload.event || {};
        
        const errorMessage = errorDetails.message || errorDetails.exception?.values?.[0]?.value || "Error desconocido";
        const errorStack = errorDetails.exception?.values?.[0]?.stacktrace?.frames?.slice(-3) || [];

        const apiKey = context.env.GEMINI_API_KEY || (typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : null);

        if (!apiKey) {
            return new Response(JSON.stringify({ 
                status: "Error de configuración", 
                message: "La variable GEMINI_API_KEY no está accesible" 
            }), { headers: { "Content-Type": "application/json" } });
        }

        const prompt = `Actúa como un desarrollador frontend experto. Ocurrió un error en mi sitio web de fotografía:
Mensaje: "${errorMessage}"
Stack: ${JSON.stringify(errorStack)}

Por favor responde en Español de forma muy concisa:
1. Explica la causa raíz del error en una línea.
2. Determina si es "simple" de corregir (true/false).
3. Si es simple, provee el fragmento exacto de código corregido.`;

        // Apuntamos al modelo gemini-pro que es completamente compatible con v1beta
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const aiData = await geminiResponse.json();

        if (!geminiResponse.ok) {
            return new Response(JSON.stringify({ 
                status: "Error detallado de Google", 
                httpStatus: geminiResponse.status, 
                errorMensajeExacto: aiData.error?.message || aiData 
            }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        const analysis = aiData.candidates[0].content.parts[0].text;

        return new Response(JSON.stringify({ status: "Analizado con éxito", analysis }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message, status: 500 }), {
            headers: { "Content-Type": "application/json" }
        });
    }
}
