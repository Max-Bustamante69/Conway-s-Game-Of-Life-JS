// Configuration Module - Manages game settings and grid dimensions
const Config = (function () {
  let cellSize = 20;
  let columns = 0;
  let rows = 0;
  let gameSpeed = 100;

  function updateDimensions() {
    const gridContainer = document.querySelector(".grid-container");
    const rect = gridContainer.getBoundingClientRect();
    columns = Math.floor(rect.width / cellSize);
    rows = Math.floor(rect.height / cellSize);
  }

  return {
    getCellSize: () => cellSize,
    getColumns: () => columns,
    getRows: () => rows,
    getGameSpeed: () => gameSpeed,
    setCellSize(size) {
      cellSize = parseInt(size, 10);
      updateDimensions();
      return { columns, rows };
    },
    setGameSpeed(speed) {
      gameSpeed = parseInt(speed, 10);
      return gameSpeed;
    },
    updateDimensions,
  };
})();

// Grid Module - Handles grid creation and rendering
const Grid = (function () {
  let matrix = [];
  const gridContainer = document.querySelector(".grid-container");

  function initialize(rows, columns) {
    matrix = Array.from({ length: rows }, () => Array(columns).fill(false));
    setupGridContainer();
    renderGrid(rows, columns);
    return matrix;
  }

  function setupGridContainer() {
    gridContainer.style.setProperty("--grid-width", `${Config.GRID_WIDTH}px`);
    gridContainer.style.setProperty("--grid-height", `${Config.GRID_HEIGHT}px`);
    gridContainer.style.setProperty("--cell-size", `${Config.getCellSize()}px`);
    gridContainer.style.setProperty("--grid-columns", Config.getColumns());
    gridContainer.style.setProperty("--grid-rows", Config.getRows());
  }

  function renderGrid(rows, columns) {
    // Clear existing cells
    gridContainer.innerHTML = "";

    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < rows * columns; i++) {
      const cell = document.createElement("div");
      cell.classList.add("grid-cell");
      cell.dataset.index = i;
      cell.addEventListener("click", GameController.toggleCell);
      fragment.appendChild(cell);
    }
    gridContainer.appendChild(fragment);
  }

  function updateGrid() {
    const cells = gridContainer.querySelectorAll(".grid-cell");
    const columns = Config.getColumns();

    cells.forEach((cell, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      cell.classList.toggle("alive", matrix[row][col]);
    });
  }

  return {
    initialize,
    updateGrid,
    getMatrix: () => matrix,
    setMatrix: (newMatrix) => {
      matrix = newMatrix;
    },
    resetMatrix() {
      matrix = Array.from({ length: Config.getRows() }, () =>
        Array(Config.getColumns()).fill(false)
      );
      updateGrid();
    },
  };
})();

// Game Engine Module - Handles game logic and rules
const GameEngine = (function () {
  function nextGeneration(matrix) {
    const rows = Config.getRows();
    const columns = Config.getColumns();
    const newMatrix = matrix.map((row) => row.slice());

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const aliveNeighbors = countAliveNeighbors(matrix, row, col);
        if (matrix[row][col]) {
          newMatrix[row][col] = aliveNeighbors === 2 || aliveNeighbors === 3;
        } else {
          newMatrix[row][col] = aliveNeighbors === 3;
        }
      }
    }

    return newMatrix;
  }

  function countAliveNeighbors(matrix, row, col) {
    let count = 0;
    const rows = Config.getRows();
    const columns = Config.getColumns();

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue; // Skip the cell itself

        // Modulo to wrap around the edges
        const newRow = (row + i + rows) % rows;
        const newCol = (col + j + columns) % columns;

        if (matrix[newRow][newCol]) count++;
      }
    }

    return count;
  }

  return {
    nextGeneration,
  };
})();

// Game Controller Module - Manages user interaction and game state
const GameController = (function () {
  let gameInterval = null;
  let isGameRunning = false;

  function initialize() {
    setupEventListeners();
  }

  function setupEventListeners() {
    const gridForm = document.getElementById("grid-form");
    const startButton = document.getElementById("start-button");
    const stopButton = document.getElementById("stop-button");
    const clearButton = document.getElementById("clear-button");
    const speedInput = document.getElementById("speed-input");

    gridForm.addEventListener("submit", handleGridFormSubmit);
    startButton.addEventListener("click", startGame);
    stopButton.addEventListener("click", stopGame);
    clearButton.addEventListener("click", clearGrid);
    speedInput.addEventListener("input", handleSpeedChange);
  }

  function handleGridFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const cellSize = formData.get("cell-size");

    if (!cellSize || cellSize < 20) {
      alert("Please enter a valid cell size (minimum 20px)");
      return;
    }

    const { rows, columns } = Config.setCellSize(cellSize);

    // Show game container and hide setup
    document.getElementById("setup-container").style.display = "none";
    document.getElementById("game-container").style.display = "block";

    Grid.initialize(rows, columns);
    e.target.reset();
  }

  window.addEventListener("resize", () => {
    if (document.getElementById("game-container").style.display !== "none") {
      Config.updateDimensions();
      Grid.initialize(Config.getRows(), Config.getColumns());
    }
  });

  function startGame() {
    if (isGameRunning) return;

    isGameRunning = true;
    gameInterval = setInterval(() => {
      const nextMatrix = GameEngine.nextGeneration(Grid.getMatrix());
      Grid.setMatrix(nextMatrix);
      Grid.updateGrid();
    }, Config.getGameSpeed());
  }

  function stopGame() {
    if (!isGameRunning) return;

    isGameRunning = false;
    clearInterval(gameInterval);
  }

  function clearGrid() {
    Grid.resetMatrix();
  }

  function handleSpeedChange(e) {
    const newSpeed = Config.setGameSpeed(e.target.value);

    if (isGameRunning) {
      clearInterval(gameInterval);
      gameInterval = setInterval(() => {
        const nextMatrix = GameEngine.nextGeneration(Grid.getMatrix());
        Grid.setMatrix(nextMatrix);
        Grid.updateGrid();
      }, newSpeed);
    }
  }

  function toggleCell(event) {
    const cell = event.target;
    const index = parseInt(cell.dataset.index, 10);
    const columns = Config.getColumns();
    const row = Math.floor(index / columns);
    const col = index % columns;
    const matrix = Grid.getMatrix();

    cell.classList.toggle("alive");
    matrix[row][col] = !matrix[row][col];

    console.log(
      `Cell at (${row}, ${col}) is now ${matrix[row][col] ? "alive" : "dead"}`
    );
  }

  return {
    initialize,
    toggleCell,
  };
})();

// Initialize the application when DOM is ready
document.addEventListener("DOMContentLoaded", GameController.initialize);
