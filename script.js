// Conway's Game of Life - Retro, Responsive, Simple Controls

const CELL_SIZE = 20; // px, fijo para look retro
let rows,
  cols,
  matrix,
  intervalId = null;

const gridContainer = document.querySelector(".grid-container");
const playBtn = document.getElementById("play-button");
const stopBtn = document.getElementById("stop-button");
const clearBtn = document.getElementById("clear-button");
const speedInput = document.getElementById("speed-input");

function calculateGridSize() {
    // Calcula el tamaño cuadrado máximo que cabe en el contenedor, restando padding, border y gaps
    const computed = window.getComputedStyle(gridContainer);
    const padding = parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight);
    const border = parseFloat(computed.borderLeftWidth) + parseFloat(computed.borderRightWidth);
    const gap = parseFloat(computed.gap) || 0;

    // El tamaño real usable
    const size = gridContainer.clientWidth - padding - border;
    // Calcula cuántas celdas caben, considerando el gap entre cada una
    const fit = Math.floor((size + gap) / (CELL_SIZE + gap));
    cols = rows = fit;
}

function createEmptyMatrix() {
  return Array.from({ length: rows }, () => Array(cols).fill(false));
}

function renderGrid() {
  gridContainer.innerHTML = "";
  gridContainer.style.setProperty("--cell-size", `${CELL_SIZE}px`);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      if (matrix[r][c]) cell.classList.add("alive");
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => {
        matrix[r][c] = !matrix[r][c];
        cell.classList.toggle("alive");
      });
      gridContainer.appendChild(cell);
    }
  }
  // Ajusta el grid-template-columns para que siempre sea cuadrado
  gridContainer.style.gridTemplateColumns = `repeat(${cols}, var(--cell-size))`;
  gridContainer.style.gridTemplateRows = `repeat(${rows}, var(--cell-size))`;
}

function updateGrid() {
  const cells = gridContainer.querySelectorAll(".grid-cell");
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c]) {
        cells[i].classList.add("alive");
      } else {
        cells[i].classList.remove("alive");
      }
      i++;
    }
  }
}

function countNeighbors(r, c) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = (r + dr + rows) % rows;
      const nc = (c + dc + cols) % cols;
      if (matrix[nr][nc]) count++;
    }
  }
  return count;
}

function nextGeneration() {
  const newMatrix = createEmptyMatrix();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const alive = matrix[r][c];
      const neighbors = countNeighbors(r, c);
      if (alive) {
        newMatrix[r][c] = neighbors === 2 || neighbors === 3;
      } else {
        newMatrix[r][c] = neighbors === 3;
      }
    }
  }
  matrix = newMatrix;
  updateGrid();
}

function play() {
  if (intervalId) return;
  playBtn.disabled = true;
  stopBtn.disabled = false;
  intervalId = setInterval(nextGeneration, 10000 /  parseInt(speedInput.value));
}

function stop() {
  playBtn.disabled = false;
  stopBtn.disabled = true;
  clearInterval(intervalId);
  intervalId = null;
}

function clear() {
  stop();
  matrix = createEmptyMatrix();
  updateGrid();
}

function resizeAndResetGrid() {
  calculateGridSize();
  matrix = createEmptyMatrix();
  renderGrid();
}

// Event listeners
playBtn.addEventListener("click", play);
stopBtn.addEventListener("click", stop);
clearBtn.addEventListener("click", clear);
speedInput.addEventListener("input", () => {
  if (intervalId) {
    stop();
    play();
  }
});

window.addEventListener("resize", () => {
  // Mantener patrón si es posible
  const oldMatrix = matrix;
  const oldRows = rows,
    oldCols = cols;
  calculateGridSize();
  const newMatrix = createEmptyMatrix();
  for (let r = 0; r < Math.min(rows, oldRows); r++) {
    for (let c = 0; c < Math.min(cols, oldCols); c++) {
      newMatrix[r][c] = oldMatrix[r][c];
    }
  }
  matrix = newMatrix;
  renderGrid();
});

// Inicialización
function init() {
  stopBtn.disabled = true;
  calculateGridSize();
  matrix = createEmptyMatrix();
  renderGrid();
}

init();
