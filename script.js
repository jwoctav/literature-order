// script.js
const cardsContainer = document.getElementById("cardsContainer");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const form = document.getElementById("cardForm");
const createBtn = document.getElementById("createCard");
const cancelBtn = document.getElementById("cancel");
const exportBtn = document.getElementById("exportJson");
const importInput = document.getElementById("importJson");

const publicationsCatalog = [
  "Рабочая тетрадь",
  "Сторожевая башня",
  "Сторожевая башня (крупный шрифт)",
  "Ежедневник",
  "Ежедневник (крупный шрифт)",
  "Библия",
  "Памятка"
];

// месяцы в нижнем регистре
const months = [
  "январь","февраль","март","апрель","май","июнь",
  "июль","август","сентябрь","октябрь","ноябрь","декабрь"
];

const years = [2025, 2026, 2027, 2028, 2029, 2030];

// одна карточка = { year, month, name, publications[], status }
let cards = JSON.parse(localStorage.getItem("cards")) || [];
let editIndex = null;

function populateSelects() {
  const yearSel = document.getElementById("year");
  const monthSel = document.getElementById("month");
  const pubsSel = document.getElementById("publications");
  const fYear = document.getElementById("filterYear");
  const fMonth = document.getElementById("filterMonth");
  const fPub = document.getElementById("filterPublication");

  yearSel.innerHTML = "";
  monthSel.innerHTML = "";
  pubsSel.innerHTML = "";

  const ensureOption = (selectEl, value, label = value) => {
    if (!Array.from(selectEl.options).some(o => o.value == value)) {
      selectEl.innerHTML += `<option value="${value}">${label}</option>`;
    }
  };

  years.forEach(y => {
    yearSel.innerHTML += `<option value="${y}">${y}</option>`;
    ensureOption(fYear, y);
  });

  months.forEach(m => {
    monthSel.innerHTML += `<option value="${m}">${m}</option>`;
    ensureOption(fMonth, m);
  });

  publicationsCatalog.forEach(p => {
    pubsSel.innerHTML += `<option value="${p}">${p}</option>`;
    ensureOption(fPub, p);
  });

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = months[now.getMonth()];
  if (years.includes(curYear)) yearSel.value = curYear;
  monthSel.value = curMonth;
}
populateSelects();

function saveCards() {
  localStorage.setItem("cards", JSON.stringify(cards));
}

function renderCards() {
  cardsContainer.innerHTML = "";
  const fy = document.getElementById("filterYear").value;
  const fm = document.getElementById("filterMonth").value;
  const fp = document.getElementById("filterPublication").value;
  const fs = document.getElementById("filterStatus").value;

  cards
    .filter(c =>
      (fy === "all" || c.year == fy) &&
      (fm === "all" || c.month === fm) &&
      (fp === "all" || (Array.isArray(c.publications) && c.publications.includes(fp))) &&
      (fs === "all" || c.status === fs)
    )
    .forEach((card, i) => {
      const div = document.createElement("div");
      div.className = "card";
      const pubsHtml = (card.publications || []).map(p => `<li>${p}</li>`).join("");
      div.innerHTML = `
        <h3>${card.name}</h3>
        <p><b>Год:</b> ${card.year}</p>
        <p><b>Месяц:</b> ${card.month}</p>
        <p><b>Статус:</b> ${card.status}</p>
        <p><b>Публикации:</b></p>
        <ul class="pub-list">${pubsHtml}</ul>
        <div class="actions">
          <button class="btn-edit" data-index="${i}" aria-label="Редактировать" title="Редактировать">✏️</button>
          <button class="btn-delete" data-index="${i}" aria-label="Удалить" title="Удалить">🗑️</button>
        </div>
      `;
      cardsContainer.appendChild(div);
    });
}

createBtn.addEventListener("click", () => {
  modalTitle.textContent = "Создать карточку";
  form.reset();
  populateSelects();
  editIndex = null;
  modal.classList.remove("hidden");
});

cancelBtn.addEventListener("click", () => modal.classList.add("hidden"));

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const pubsSel = document.getElementById("publications");
  const selectedPublications = Array.from(pubsSel.selectedOptions).map(o => o.value);

  const newCard = {
    year: form.year.value,
    month: form.month.value,
    name: form.name.value.trim(),
    publications: selectedPubliclications(selectedPublications),
    status: form.status.value
  };

  if (!newCard.name) {
    alert("Введите имя.");
    return;
  }
  if (!newCard.publications || newCard.publications.length === 0) {
    alert("Выберите хотя бы одну публикацию.");
    return;
  }

  if (editIndex !== null) {
    cards[editIndex] = newCard;
  } else {
    const existsIndex = cards.findIndex(c => c.year == newCard.year && c.month === newCard.month && c.name === newCard.name);
    if (existsIndex >= 0) {
      const existing = cards[existsIndex];
      const mergedPubs = Array.from(new Set([...(existing.publications || []), ...newCard.publications]));
      cards[existsIndex] = { ...existing, publications: mergedPubs, status: newCard.status };
    } else {
      cards.push(newCard);
    }
  }

  saveCards();
  renderCards();
  modal.classList.add("hidden");
});

// делегирование кликов по кнопкам внутри карточек
cardsContainer.addEventListener("click", (e) => {
  const target = e.target.closest("button");
  if (!target) return;

  const idxAttr = target.getAttribute("data-index");
  const i = idxAttr ? parseInt(idxAttr, 10) : -1;

  if (target.classList.contains("btn-edit")) {
    // открыть модалку с данными карточки
    const c = cards[i];
    if (!c) return;
    modalTitle.textContent = "Редактировать карточку";
    form.year.value = c.year;
    form.month.value = c.month;
    form.name.value = c.name;
    form.status.value = c.status;

    const pubsSel = document.getElementById("publications");
    Array.from(pubsSel.options).forEach(opt => {
      opt.selected = Array.isArray(c.publications) && c.publications.includes(opt.value);
    });

    editIndex = i;
    modal.classList.remove("hidden");
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  if (target.classList.contains("btn-delete")) {
    if (confirm("Удалить карточку?")) {
      cards.splice(i, 1);
      saveCards();
      renderCards();
    }
    e.preventDefault();
    e.stopPropagation();
  }
});

// Экспорт JSON
exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, "-");
  a.download = `literature-orders-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// Импорт JSON
importInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!Array.isArray(data)) {
      alert("Неверный формат: ожидается массив карточек.");
      e.target.value = "";
      return;
    }
    const grouped = {};
    data.forEach(c => {
      const year = String(c.year || "").trim();
      const month = String(c.month || "").trim();
      const name = String(c.name || "").trim();
      const status = (c.status === "выполнен") ? "выполнен" : "ожидает";
      const pubs = Array.isArray(c.publications) ? c.publications.filter(Boolean) : [];
      if (!year || !month || !name) return;
      const key = `${year}|${month}|${name}`;
      if (!grouped[key]) grouped[key] = { year, month, name, publications: [], status };
      pubs.forEach(p => { if (!grouped[key].publications.includes(p)) grouped[key].publications.push(p); });
      if (grouped[key].status !== "выполнен" && status === "выполнен") grouped[key].status = "выполнен";
    });
    cards = Object.values(grouped);
    saveCards();
    document.getElementById("filterYear").value = "all";
    document.getElementById("filterMonth").value = "all";
    document.getElementById("filterPublication").value = "all";
    document.getElementById("filterStatus").value = "all";
    renderCards();
    e.target.value = "";
    alert("Импорт завершён: данные обновлены.");
  } catch (err) {
    alert("Ошибка чтения файла JSON.");
    e.target.value = "";
  }
});

// хелпер: нормализуем публикации (убираем пустые)
function selectedPubliclications(list) {
  return list.filter(Boolean);
}

// Первый рендер
renderCards();
