"use client";
import { useEffect, useState } from "react";
export default function TodayLabel() {
  const [txt, setTxt] = useState<string>("—");
  useEffect(()=>{
    const f = () => setTxt(new Date().toLocaleDateString("nl-NL", {weekday:"long", day:"2-digit", month:"2-digit"}));
    f();
    const t = setInterval(f, 60_000);
    return ()=>clearInterval(t);
  },[]);
  return <span className="capitalize">{txt}</span>;
}
