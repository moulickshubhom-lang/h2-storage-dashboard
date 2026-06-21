/* ==========================================================================
   Hydrogen Storage Technology Comparator — app logic
   Depends on assets/data.js (H2_TECHNOLOGIES, H2_REFERENCE_TARGETS) and
   the Plotly.js CDN bundle loaded by index.html.
   ========================================================================== */

const CATEGORY_COLORS = {
  "Compressed gas": "#5ec8e0",
  "Cryogenic liquid": "#4f7cff",
  "Chemical carrier": "#e8a33d",
  "Metal hydride": "#7fd99a",
  "Geological / bulk": "#b87ee0",
};

const state = {
  activeCategories: new Set(Object.keys(CATEGORY_COLORS)),
  sortKey: "name",
  sortDir: 1,
  openDetailId: null,
};

function fmtNum(value, digits, unit) {
  if (value === null || value === undefined) return null;
  return `${value.toFixed(digits)}${unit ? " " + unit : ""}`;
}

function visibleTechnologies() {
  return H2_TECHNOLOGIES.filter((t) => state.activeCategories.has(t.category));
}

/* ---------------------------- filter chips ---------------------------- */

function renderFilters() {
  const container = document.getElementById("filters");
  container.innerHTML = "";
  Object.keys(CATEGORY_COLORS).forEach((cat) => {
    const chip = document.createElement("button");
    chip.className = "chip" + (state.activeCategories.has(cat) ? " active" : "");
    chip.style.borderColor = state.activeCategories.has(cat) ? CATEGORY_COLORS[cat] : "";
    chip.style.color = state.activeCategories.has(cat) ? CATEGORY_COLORS[cat] : "";
    chip.textContent = cat;
    chip.setAttribute("aria-pressed", state.activeCategories.has(cat));
    chip.addEventListener("click", () => {
      if (state.activeCategories.has(cat)) {
        state.activeCategories.delete(cat);
      } else {
        state.activeCategories.add(cat);
      }
      renderFilters();
      renderChart();
      renderTable();
    });
    container.appendChild(chip);
  });
}

/* ------------------------------- chart -------------------------------- */

function renderChart() {
  const techs = visibleTechnologies().filter(
    (t) => t.volumetric_kg_per_m3 !== null && t.gravimetric_wt_pct !== null
  );

  const byCategory = {};
  techs.forEach((t) => {
    byCategory[t.category] = byCategory[t.category] || [];
    byCategory[t.category].push(t);
  });

  const traces = Object.entries(byCategory).map(([cat, items]) => ({
    type: "scatter",
    mode: "markers",
    name: cat,
    x: items.map((t) => t.volumetric_kg_per_m3),
    y: items.map((t) => t.gravimetric_wt_pct),
    text: items.map((t) => t.name),
    customdata: items.map(
      (t) =>
        `<b>${t.name}</b><br>` +
        `Gravimetric: ${t.gravimetric_wt_pct} wt% <i>(${t.gravimetric_basis})</i><br>` +
        `Volumetric: ${t.volumetric_kg_per_m3} kg H2/m3<br>` +
        `TRL ${t.trl} &middot; Cost tier: ${t.cost_tier}`
    ),
    hovertemplate: "%{customdata}<extra></extra>",
    marker: {
      size: items.map((t) => 14 + (t.trl - 4) * 4),
      color: CATEGORY_COLORS[cat],
      line: { width: 1, color: "rgba(11,30,45,0.8)" },
      opacity: 0.9,
    },
  }));

  const doeTarget = H2_REFERENCE_TARGETS.find((r) => r.name.includes("2025"));
  const doeUltimate = H2_REFERENCE_TARGETS.find((r) => r.name.includes("ultimate"));

  const xMax = 145;
  const yMax = 19;

  const shapes = [
    {
      type: "rect",
      x0: doeUltimate.volumetric_kg_per_m3,
      x1: xMax,
      y0: doeUltimate.gravimetric_wt_pct,
      y1: yMax,
      line: { color: "#7fd99a", width: 1, dash: "dot" },
      fillcolor: "rgba(127,217,154,0.04)",
    },
    {
      type: "rect",
      x0: doeTarget.volumetric_kg_per_m3,
      x1: xMax,
      y0: doeTarget.gravimetric_wt_pct,
      y1: yMax,
      line: { color: "#5ec8e0", width: 1, dash: "dash" },
      fillcolor: "rgba(94,200,224,0.04)",
    },
  ];

  const annotations = [
    {
      x: doeTarget.volumetric_kg_per_m3 + 1,
      y: yMax - 0.6,
      text: "DOE 2025 target zone",
      showarrow: false,
      xanchor: "left",
      font: { family: "IBM Plex Mono, monospace", size: 11, color: "#5ec8e0" },
    },
    {
      x: doeUltimate.volumetric_kg_per_m3 + 1,
      y: yMax - 1.7,
      text: "DOE ultimate target",
      showarrow: false,
      xanchor: "left",
      font: { family: "IBM Plex Mono, monospace", size: 11, color: "#7fd99a" },
    },
  ];

  const layout = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: "IBM Plex Sans, sans-serif", color: "#edf3f6", size: 12.5 },
    margin: { l: 56, r: 20, t: 20, b: 52 },
    xaxis: {
      title: { text: "Volumetric H2 density (kg H2 / m3)", font: { size: 12 } },
      range: [0, xMax],
      gridcolor: "rgba(184,211,226,0.10)",
      zeroline: false,
    },
    yaxis: {
      title: { text: "Gravimetric H2 capacity (wt%)", font: { size: 12 } },
      range: [0, yMax],
      gridcolor: "rgba(184,211,226,0.10)",
      zeroline: false,
    },
    shapes: shapes,
    annotations: annotations,
    legend: {
      orientation: "h",
      y: -0.22,
      font: { size: 11.5 },
    },
    hoverlabel: {
      bgcolor: "#16344a",
      bordercolor: "#5ec8e0",
      font: { family: "IBM Plex Mono, monospace", size: 12, color: "#edf3f6" },
    },
  };

  Plotly.react("chart", traces, layout, { displayModeBar: false, responsive: true });
}

/* -------------------------------- table -------------------------------- */

const COLUMN_GETTERS = {
  name: (t) => t.name,
  category: (t) => t.category,
  gravimetric_wt_pct: (t) => t.gravimetric_wt_pct,
  volumetric_kg_per_m3: (t) => t.volumetric_kg_per_m3,
  trl: (t) => t.trl,
  cost_tier: (t) => t.cost_tier,
};

function sortedTechnologies() {
  const getter = COLUMN_GETTERS[state.sortKey];
  const items = [...visibleTechnologies()];
  items.sort((a, b) => {
    const va = getter(a);
    const vb = getter(b);
    if (va === null || va === undefined) return 1;
    if (vb === null || vb === undefined) return -1;
    if (typeof va === "string") return va.localeCompare(vb) * state.sortDir;
    return (va - vb) * state.sortDir;
  });
  return items;
}

function operatingConditionsText(t) {
  const temp = t.operating_temp_c;
  const pressure = t.operating_pressure_bar;
  const tempStr = temp === null || temp === undefined ? "—" : `${temp} degC`;
  const pStr = pressure === null || pressure === undefined ? "—" : `${pressure} bar`;
  return `${tempStr}, ${pStr}`;
}

function renderTable() {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";
  const items = sortedTechnologies();

  items.forEach((t) => {
    const row = document.createElement("tr");
    const grav = fmtNum(t.gravimetric_wt_pct, 1, "wt%");
    const vol = fmtNum(t.volumetric_kg_per_m3, 0, "kg/m3");

    row.innerHTML = `
      <td>
        <span class="tech-name">${t.name}</span>
        <span class="tech-cat" style="color:${CATEGORY_COLORS[t.category]}">${t.category}</span>
      </td>
      <td class="num">${grav ?? '<span class="na">n/a</span>'}</td>
      <td class="num">${vol ?? '<span class="na">n/a</span>'}</td>
      <td class="col-hide-mobile">${operatingConditionsText(t)}</td>
      <td class="num">${t.trl}</td>
      <td><span class="cost-pill">${t.cost_tier}</span></td>
      <td><button class="source-btn" data-id="${t.id}">${state.openDetailId === t.id ? "Hide" : "Details"}</button></td>
    `;
    tbody.appendChild(row);

    const detailRow = document.createElement("tr");
    detailRow.className = "detail-row" + (state.openDetailId === t.id ? "" : " hidden");
    detailRow.innerHTML = `
      <td colspan="7">
        <strong>Basis:</strong> gravimetric ${t.gravimetric_basis}; volumetric ${t.volumetric_basis}<br>
        <strong>Cost note:</strong> ${t.cost_note}<br>
        <strong>Notes:</strong> ${t.notes}<br>
        <strong>Source:</strong> ${t.source}
      </td>
    `;
    tbody.appendChild(detailRow);
  });

  tbody.querySelectorAll(".source-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.openDetailId = state.openDetailId === btn.dataset.id ? null : btn.dataset.id;
      renderTable();
    });
  });
}

function renderHeaderSortState() {
  document.querySelectorAll("th[data-key]").forEach((th) => {
    th.classList.toggle("sorted", th.dataset.key === state.sortKey);
    const arrow = th.querySelector(".arrow");
    arrow.textContent = th.dataset.key === state.sortKey ? (state.sortDir === 1 ? "↑" : "↓") : "↕";
  });
}

function bindHeaderSorting() {
  document.querySelectorAll("th[data-key]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      if (state.sortKey === key) {
        state.sortDir *= -1;
      } else {
        state.sortKey = key;
        state.sortDir = 1;
      }
      renderHeaderSortState();
      renderTable();
    });
  });
}

/* -------------------------------- init -------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  renderFilters();
  renderChart();
  bindHeaderSorting();
  renderHeaderSortState();
  renderTable();
  window.addEventListener("resize", () => Plotly.Plots.resize(document.getElementById("chart")));
});
