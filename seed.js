const fs = require("fs");
const path = require("path");

const dump = {
  groups: [
    { id: "eb", name: "Eb", status: "groen" },
    { id: "vloed", name: "Vloed", status: "rood" },
    { id: "poel", name: "Poel", status: "groen" }
  ],
  indicaties: [],
  sportmutaties: [],
  overdrachten: [],
};

fs.writeFileSync("seed.json", JSON.stringify(dump, null, 2));
console.log("✅ Seed file aangemaakt: seed.json");
console.log("➡️  Import dit in localStorage via je backup/import pagina.");
