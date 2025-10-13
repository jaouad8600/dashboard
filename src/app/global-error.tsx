"use client";
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html>
      <body style={{ fontFamily: "ui-sans-serif,system-ui", padding: "16px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
          Er is een fout opgetreden
        </h1>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#fee2e2",
            border: "1px solid #fecaca",
            padding: "12px",
            borderRadius: "8px",
          }}
        >
          {String(error?.message || error)}
        </pre>
        <p style={{ marginTop: "8px", fontSize: "12px", color: "#6b7280" }}>
          Bekijk de console voor details.
        </p>
      </body>
    </html>
  );
}
