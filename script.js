const slides = Array.from(document.querySelectorAll(".slide"));
const previousButton = document.querySelector("#previous");
const nextButton = document.querySelector("#next");
const currentSlideLabel = document.querySelector("#current-slide");
const totalSlidesLabel = document.querySelector("#total-slides");
const progressFill = document.querySelector("#progress-fill");
const helpButton = document.querySelector("#help-button");
const helpPanel = document.querySelector("#help-panel");

let currentIndex = 0;
let touchStartX = null;

function clamp(index) {
  return Math.max(0, Math.min(index, slides.length - 1));
}

function indexFromHash() {
  const requestedSlide = Number.parseInt(window.location.hash.slice(1), 10);
  return Number.isNaN(requestedSlide) ? 0 : clamp(requestedSlide - 1);
}

function updateControls() {
  currentSlideLabel.textContent = String(currentIndex + 1);
  totalSlidesLabel.textContent = String(slides.length);
  progressFill.style.width = `${((currentIndex + 1) / slides.length) * 100}%`;
  previousButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === slides.length - 1;
}

function showSlide(nextIndex, { updateHash = true } = {}) {
  const safeIndex = clamp(nextIndex);
  slides[currentIndex].classList.remove("is-active");
  slides[currentIndex].setAttribute("aria-hidden", "true");
  currentIndex = safeIndex;
  slides[currentIndex].classList.add("is-active");
  slides[currentIndex].removeAttribute("aria-hidden");
  document.title = `${slides[currentIndex].dataset.title} · Building slide decks with Codex`;
  updateControls();
  if (updateHash) history.replaceState(null, "", `#${currentIndex + 1}`);
}

function closeHelp() {
  helpPanel.hidden = true;
  helpButton.setAttribute("aria-expanded", "false");
}

function toggleHelp() {
  const shouldOpen = helpPanel.hidden;
  helpPanel.hidden = !shouldOpen;
  helpButton.setAttribute("aria-expanded", String(shouldOpen));
}

async function toggleFullscreen() {
  if (document.fullscreenElement) await document.exitFullscreen();
  else await document.documentElement.requestFullscreen();
}

previousButton.addEventListener("click", () => showSlide(currentIndex - 1));
nextButton.addEventListener("click", () => showSlide(currentIndex + 1));
helpButton.addEventListener("click", toggleHelp);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !helpPanel.hidden) {
    closeHelp();
    return;
  }

  const actions = {
    ArrowLeft: () => showSlide(currentIndex - 1),
    ArrowRight: () => showSlide(currentIndex + 1),
    PageUp: () => showSlide(currentIndex - 1),
    PageDown: () => showSlide(currentIndex + 1),
    Home: () => showSlide(0),
    End: () => showSlide(slides.length - 1),
    f: toggleFullscreen,
    F: toggleFullscreen,
    "?": toggleHelp,
  };

  if (actions[event.key]) {
    event.preventDefault();
    actions[event.key]();
  }
});

window.addEventListener("hashchange", () => showSlide(indexFromHash(), { updateHash: false }));

document.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

document.addEventListener("touchend", (event) => {
  if (touchStartX === null) return;
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) > 50) showSlide(currentIndex + (distance < 0 ? 1 : -1));
  touchStartX = null;
}, { passive: true });

slides.forEach((slide, index) => {
  if (index !== 0) slide.setAttribute("aria-hidden", "true");
});

showSlide(indexFromHash(), { updateHash: window.location.hash === "" });
