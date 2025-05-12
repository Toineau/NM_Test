const frequencies = {
  L1: {
    weekday: { creuse: 24, pointe: 16, soirée: 30 },
    saturday: { creuse: 24, pointe: 24, soirée: 30 },
    sunday: { creuse: null, pointe: 48, soirée: null }
  },
  L2: {
    weekday: { creuse: 16, pointe: 11, soirée: 40 },
    saturday: { creuse: 20, pointe: 13, soirée: 40 },
    sunday: { creuse: 40, pointe: 20, soirée: 40 }
  },
  L3: {
    weekday: { creuse: 32, pointe: 16, soirée: 64 },
    saturday: { creuse: 32, pointe: 21, soirée: 64 },
    sunday: { creuse: 64, pointe: 32, soirée: 64 }
  },
  L4: {
    weekday: { creuse: 28, pointe: 19, soirée: 35 },
    saturday: { creuse: null, pointe: 28, soirée: null },
    sunday: { creuse: null, pointe: null, soirée: null }
  }
};

const serviceHours = {
  L1: { start: 345, end: (d) => d === "saturday" ? 1170 : 1200 },
  L2: { start: 330, end: () => 1470 },
  L3: { start: 330, end: () => 1470 },
  L4: { start: 375, end: () => 1170 }
};

/* const busCapacity = {
  L1: 129,
  L2: 154,
  L3: 125,
  L4: 60
}; */

/* const passengers = {
  L1: 101,
  L2: 130,
  L3: 106,
  L4: 40
}; */


function getDayType() {
  const d = new Date();
  const day = d.getDay();
  return day === 0 ? "sunday" : (day === 6 ? "saturday" : "weekday");
}

function getPeriod(h) {
  if ((h >= 7 && h < 10) || (h >= 17 && h < 19)) return "pointe";
  if (h >= 20 || h < 6) return "soirée";
  return "creuse";
}

function getVariableFrequency(freq, stopName) {
  if (!freq) return null;
  const variation = (stopName.charCodeAt(0) % 3) - 1;
  return freq + variation;
}

function getNextDepartures(freq, offset = 0) {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes() + offset;
  const toNext = freq - (current % freq);
  return [toNext, toNext + freq];
}

function format(minutes) {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}min`;
  }
  return `${minutes} min`;
}

function updateTimes() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const currentMin = h * 60 + m;
  const dayType = getDayType();
  const period = getPeriod(h);

  document.querySelectorAll(".time").forEach(el => {
    const line = el.dataset.line;
    const stop = el.dataset.stop;
    const freqBase = frequencies[line]?.[dayType]?.[period];
    const offset = stop.includes("Gare Centrale") ? 2 : 0;

    const start = serviceHours[line].start;
    const end = typeof serviceHours[line].end === "function" ? serviceHours[line].end(dayType) : serviceHours[line].end;

    if (!freqBase) {
      el.textContent = "Pas de service";
      return;
    }

    if (currentMin < start) {
      el.textContent = `Premier bus à ${Math.floor(start / 60)}h${String(start % 60).padStart(2, "0")}`;
      return;
    }

    if (currentMin > end) {
      el.textContent = "Fin de service";
      return;
    }

    const freq = getVariableFrequency(freqBase, stop);
    const [t1, t2] = getNextDepartures(freq, offset);
    el.textContent = `${format(t1)} ⏐ ${format(t2)}`;
  });

  updateAffluence();
}

/* function updateAffluence() {
  for (const line in passengers) {
    const icon = document.getElementById("affluence-" + line);
    if (!icon) continue;

    const p = passengers[line];
    const max = busCapacity[line];
    const ratio = p / max;

    if (ratio < 0.5) {
      icon.textContent = "Affluence : Faible";
      icon.style.color = "green";
    } else if (ratio < 0.85) {
      icon.textContent = "Affluence : Moyenne";
      icon.style.color = "orange";
    } else {
      icon.textContent = "Affluence : Élevée";
      icon.style.color = "red";
    }
  }
} */

    setInterval(updateTimes, 1000);
    updateTimes();
