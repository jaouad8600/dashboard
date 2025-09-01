const now = new Date();
const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0);
const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 45);
const evts = [
  { id: crypto.randomUUID(), title:"Test (Poel)", start, end, tide:"eb", group:"Poel" },
  { id: crypto.randomUUID(), title:"Test (Gaag)", start:new Date(start.getTime()+2*60*60*1000), end:new Date(end.getTime()+2*60*60*1000), tide:"vloed", group:"Gaag" },
];
localStorage.setItem("rbc-events-v1", JSON.stringify(evts));
localStorage.setItem("active-group", "Poel");
console.log("Seeded 2 events.");
