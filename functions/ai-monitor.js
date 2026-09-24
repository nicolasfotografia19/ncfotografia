{\rtf1\ansi\ansicpg1252\cocoartf2908
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural\partightenfactor0

\f0\fs24 \cf0 export async function onRequestPost(context) \{\
  try \{\
    const sentryPayload = await context.request.json();\
    const errorDetails = sentryPayload.event || \{\};\
    \
    const errorMessage = errorDetails.exception?.values?.[0]?.value || "Error desconocido";\
    const errorStack = errorDetails.exception?.values?.[0]?.stacktrace?.frames?.slice(-3) || [];\
\
    const prompt = `Act\'faa como un desarrollador frontend experto. Ocurri\'f3 un error en mi sitio web de fotograf\'eda:\
    Mensaje: "$\{errorMessage\}"\
    Stack: $\{JSON.stringify(errorStack)\}\
\
    Por favor responde en Espa\'f1ol de forma muy concisa:\
    1. Explica la causa ra\'edz del error en una l\'ednea.\
    2. Determina si es "simple" de corregir (true/false).\
    3. Si es simple, provee el fragmento exacto de c\'f3digo corregido.`;\
\
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$\{context.env.GEMINI_API_KEY\}`, \{\
      method: 'POST',\
      headers: \{ 'Content-Type': 'application/json' \},\
      body: JSON.stringify(\{\
        contents: [\{ parts: [\{ text: prompt \}] \}]\
      \})\
    \});\
\
    const aiData = await geminiResponse.json();\
    const analysis = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo analizar.";\
\
    return new Response(JSON.stringify(\{ status: "Analizado con \'e9xito", analysis \}), \{\
      headers: \{ "Content-Type": "application/json" \}\
    \});\
\
  \} catch (err) \{\
    return new Response(JSON.stringify(\{ error: err.message \}), \{ \
      status: 500,\
      headers: \{ "Content-Type": "application/json" \}\
    \});\
  \}\
\}}