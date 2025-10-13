"use client";

import { useEffect, useMemo, useState } from "react";

type DocItem = { title: string; file: string };

// Voeg hier je .docx-bestanden toe (liggen in /public/indicaties)
const DOCS: DocItem[] = [
  {
    title: "Tidiane Kamara – Aanmelding geïndiceerde activiteiten",
    file: "Tidiane-Kamara-aanvraag.docx",
  },
  // { title: "Voorbeeld 2", file: "voorbeeld-2.docx" },
];

export default function IndicatieSportPage() {
  const [selected, setSelected] = useState<string>(DOCS[0]?.file ?? "");
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const options = useMemo(
    () => ({
      includeDefaultStyleMap: true,
      convertImage: mammothImageConverter,
    }),
    [],
  );

  useEffect(() => {
    if (!selected) return;
    void loadDocx(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  async function loadDocx(filename: string) {
    setLoading(true);
    setErrorMsg("");
    setHtml("");

    try {
      const mammoth = await import("mammoth/mammoth.browser");

      const res = await fetch(`/indicaties/${encodeURIComponent(filename)}`);
      if (!res.ok) {
        throw new Error(
          `Kon /indicaties/${filename} niet laden (HTTP ${res.status}).`,
        );
      }
      const arrayBuffer = await res.arrayBuffer();

      const { value } = await mammoth.convertToHtml({ arrayBuffer }, options);

      setHtml(sanitizeMammothHtml(value));
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Onbekende fout bij laden/convert.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Indicatie Sport</h1>

      <div className="flex gap-3 items-center mb-4">
        <label className="text-sm font-medium">Document:</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {DOCS.map((d) => (
            <option key={d.file} value={d.file}>
              {d.title}
            </option>
          ))}
        </select>

        {selected && (
          <a
            href={`/indicaties/${encodeURIComponent(selected)}`}
            download
            className="text-sm underline"
          >
            Download .docx
          </a>
        )}
      </div>

      {loading && <div className="text-sm">Bezig met laden en omzetten…</div>}

      {errorMsg && (
        <div className="text-sm p-3 rounded bg-red-100 text-red-800">
          {errorMsg}
        </div>
      )}

      {!loading && !errorMsg && html && (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}

      {!loading && !errorMsg && !html && (
        <div className="text-sm text-gray-600">Geen inhoud om te tonen.</div>
      )}
    </div>
  );
}

// Afbeeldingen uit DOCX embedden als data-URL
async function mammothImageConverter(element: any) {
  const imageBuffer = await element.read("base64");
  const contentType = element.contentType || "image/png";
  return { src: `data:${contentType};base64,${imageBuffer}` };
}

// Kleine opschoning
function sanitizeMammothHtml(input: string) {
  return input?.trim?.() ?? input;
}
