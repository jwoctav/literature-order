// script.js
const cardsContainer = document.getElementById("cardsContainer");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const form = document.getElementById("cardForm");
const createBtn = document.getElementById("createCard");
const cancelBtn = document.getElementById("cancel");

const publicationsCatalog = [
  "Рабочая тетрадь",
  "Сторожевая башня",
  "Сторожевая башня (крупный шрифт)",
  "Ежедневник",
  "Ежедневник (крупный шрифт)",
  "Библия",
  "Памятка"
];

const months = [
  "Январь","Февраль","Март","Апрель","Май","Июнь",
  "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
];

const years = [2025, 2026, 2027, 2028, 2029, 2030];

// Одна карточка = { year, month, name, publications[], status }
let cards = JSON.parse(localStorage.getItem("cards")) || [];
let editIndex = null;

// Заполнение фильтров и формы
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

  years.forEach(y => {
    yearSel.innerHTML += `<option value="${y}">${y}</option>`;
    if (!Array.from(fYear.options).some(o => o.value == y)) {
      fYear.innerHTML += `<option value="${y}">${y}</option>`;
    }
  });

  months.forEach(m => {
    monthSel.innerHTML += `<option value="${m}">${m}</option>`;
    if (!Array.from(fMonth.options).some(o => o.value === m)) {
      fMonth.innerHTML += `<option value="${m}">${m}</option>`;
    }
  });

  publicationsCatalog.forEach(p => {
    pubsSel.innerHTML += `<option value="${p}">${p}</option>`;
    if (!Array.from(fPub.options).some(o => o.value === p)) {
      fPub.innerHTML += `<option value="${p}">${p}</option>`;
    }
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
          <button onclick="editCard(${i})" title="Редактировать">✏️</button>
          <button onclick="deleteCard(${i})" title="Удалить">🗑️</button>
        </div>
      `;
      cardsContainer.appendChild(div);
    });
}

createBtn.onclick = () => {
  modalTitle.textContent = "Создать карточку";
  form.reset();
  populateSelects();
  editIndex = null;
  modal.classList.remove("hidden");
};

cancelBtn.onclick = () => modal.classList.add("hidden");

form.onsubmit = (e) => {
  e.preventDefault();

  const pubsSel = document.getElementById("publications");
  const selectedPublications = Array.from(pubsSel.selectedOptions).map(o => o.value);

  const newCard = {
    year: form.year.value,
    month: form.month.value,
    name: form.name.value.trim(),
    publications: selectedPublications,
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
    // Уникальность по year+month+name: объединяем публикации
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
};

function editCard(i) {
  const c = cards[i];
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
}

function deleteCard(i) {
  if (confirm("Удалить карточку?")) {
    cards.splice(i, 1);
    saveCards();
    renderCards();
  }
}

document.querySelectorAll(".filters select")
  .forEach(f => f.addEventListener("change", renderCards));

renderCards();
