"use client";

import CalendarFC from "@/components/CalendarFC";
import { useState } from "react";

export default function KalenderPage() {
  const [tide, setTide] = useState<"eb" | "vloed">("eb");
  return (
    <div className="page">
      <div className="page-head">
        <h1>Kalender</h1>
        <div className="seg">
          <button
            className={`seg-btn ${tide === "eb" ? "on" : ""}`}
            onClick={() => setTide("eb")}
          >
            Eb
          </button>
          <button
            className={`seg-btn ${tide === "vloed" ? "on" : ""}`}
            onClick={() => setTide("vloed")}
          >
            Vloed
          </button>
        </div>
      </div>

      <div className="card">
        <CalendarFC tide={tide} />
      </div>
    </div>
  );
}
