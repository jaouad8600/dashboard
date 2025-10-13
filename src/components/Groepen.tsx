"use client";

import { useState, useEffect } from "react";
import { Group } from "@/lib/types";
import { getGroups, saveGroups } from "@/lib/store";

export default function Groepen() {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    setGroups(getGroups());
  }, []);

  function addGroup(name: string) {
    const newGroup: Group = {
      id: String(Date.now()),
      name,
      state: "Groen",
    };
    const updated = [...groups, newGroup];
    setGroups(updated);
    saveGroups(updated);
  }

  return (
    <div>
      <h1>Groepen</h1>
      <ul>
        {groups.map((g) => (
          <li key={g.id}>
            {g.name} ({g.state})
          </li>
        ))}
      </ul>
      <button onClick={() => addGroup("Nieuwe groep")}>+ Voeg toe</button>
    </div>
  );
}
