let RESOLUTION = 10;

let CANVAS = document.getElementById("canvas");
let FRAMERATE = 60;
let DEFAULT_LIFETIME = 250;
let PALLETTE = PALLETTES[Math.floor(Math.random() * PALLETTES.length)];

// SEEDS
let DEFAULT_SEED = shuffle([
  "010",
  "Harvey Pratt",
  "001",
  "100",
  "010010000221",
])[0];
console.log(DEFAULT_SEED);

// The probability that a cell will decay this step
let DECAY_PROBABILITY = 0.6;
let DECAY_TICK = 0; // The current value for the decay wave
let LIFETIME_DECAY_OSCILLATION = 50; // how regularly the decay wave modulates
// Init palette
let [BASE_BACKGROUND_COLOR, BASE_CELL_COLOR] = PALLETTE;

// Init colors
let CURRENT_BACKGROUND_COLOR = BASE_BACKGROUND_COLOR;
let CURRENT_CELL_COLOR = BASE_CELL_COLOR;
// Init input trackers
let MOUSE_X = 0;
let MOUSE_Y = 0;

// Simulation state
let running = true; // are we running
let step = false; // are we stepping

function init_canvas() {
  console.log("Initialising canvas...");
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;
  let ctx = CANVAS.getContext("2d");
  ctx.fillStyle = CURRENT_BACKGROUND_COLOR;
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

  return CANVAS;
}
function init_grid(seed, random = false) {
  console.log("Initialising grid...");
  // generate a random seed of a specified length
  if (random) {
    console.log("here!");
    let randseed = Array(CANVAS.width * CANVAS.height)
      .map("0".charCodeAt(randint(0, 27)))
      .join("");
  } else {
    randseed = null;
  }

  let matrix = generateBitMatrix(
    random ? randseed : seed,
    Math.floor(CANVAS.width / RESOLUTION),
    Math.floor(CANVAS.height / RESOLUTION)
  );

  // Iterate through the 2d matrix, initialising each cell with a one of a zero (and the corresponding color)
  return matrix.map((row) => {
    return row.map((cell) => {
      return [
        cell,
        DEFAULT_LIFETIME,
        cell ? CURRENT_CELL_COLOR : CURRENT_BACKGROUND_COLOR,
      ];
    });
  });
}

function draw_grid(grid) {
  let ctx = CANVAS.getContext("2d");
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j][0] === 1) {
        ctx.fillStyle = grid[i][j][2];
        ctx.fillRect(i * RESOLUTION, j * RESOLUTION, RESOLUTION, RESOLUTION);
      } else {
        ctx.fillStyle = grid[i][j][2];
        ctx.fillRect(i * RESOLUTION, j * RESOLUTION, RESOLUTION, RESOLUTION);
      }
    }
  }
}

function copy_grid(grid) {
  // Create a perfect copy of an existing grid
  let new_grid = Array(grid.length)
    .fill()
    .map(() =>
      Array(grid[0].length).fill([
        0,
        DEFAULT_LIFETIME,
        CURRENT_BACKGROUND_COLOR,
      ])
    );
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      new_grid[i][j] = [grid[i][j][0], grid[i][j][1], grid[i][j][2]];
    }
  }
  return new_grid;
}

function update_grid(grid) {
  let new_grid = copy_grid(grid);

  // Update the grid using the rules for Conway's Game of Life
  let ctx = CANVAS.getContext("2d");
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      let cell = grid[i][j];
      let neighbors = 0;

      for (let k = -1; k < 2; k++) {
        for (let l = -1; l < 2; l++) {
          // Check if the neighbor is within the grid,
          // excluding the current cell and the edges
          if (
            i + k >= 0 &&
            i + k < grid.length &&
            j + l >= 0 &&
            j + l < grid[i].length &&
            !(k == 0 && l == 0)
          ) {
            neighbors += grid[i + k][j + l][0];
          }
        }
      }
      // Any live cell with fewer than two live neighbours dies, as if by underpopulation
      if (cell[0] === 1 && neighbors < 2) {
        new_grid[i][j][0] = 0;
        if (new_grid[i][j][1] > 0) {
          new_grid[i][j][1]--;
          let color = weightedMix(
            CURRENT_CELL_COLOR,
            CURRENT_BACKGROUND_COLOR,
            new_grid[i][j][1] / DEFAULT_LIFETIME
          );
          new_grid[i][j][2] = color;
        }
      }

      // Any live cell with two or three live neighbours lives on to the next generation.
      else if (cell[0] === 1 && (neighbors === 2 || neighbors === 3)) {
        new_grid[i][j][0] = 1;
        let color = weightedMix(
          CURRENT_CELL_COLOR,
          CURRENT_BACKGROUND_COLOR,
          new_grid[i][j][1] / DEFAULT_LIFETIME
        );
        new_grid[i][j][2] = color;
      }

      // Any live cell with more than three live neighbours dies, as if by overpopulation
      else if (cell[0] === 1 && neighbors > 3) {
        new_grid[i][j][0] = 0;
        if (new_grid[i][j][1] > 0) {
          new_grid[i][j][1]--;
          let color = weightedMix(
            CURRENT_CELL_COLOR,
            CURRENT_BACKGROUND_COLOR,
            new_grid[i][j][1] / DEFAULT_LIFETIME
          );
          new_grid[i][j][2] = color;
        }
      }

      // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
      else if (cell[0] === 0 && neighbors === 3) {
        new_grid[i][j][0] = 1;
        new_grid[i][j][1] = DEFAULT_LIFETIME;
        let color = weightedMix(
          CURRENT_BACKGROUND_COLOR,
          CURRENT_CELL_COLOR,
          new_grid[i][j][1] / DEFAULT_LIFETIME
        );
        new_grid[i][j][2] = color;
      }

      // Default behavior for dead cells
      else if (cell[0] == 0 && cell[1] != 0) {
        if (!cell[1]) {
          debugger;
        }
        if (new_grid[i][j][1] > 0) {
          new_grid[i][j][1]--;

          // assign colors
          if (
            cell[3] != CURRENT_BACKGROUND_COLOR &&
            DECAY_TICK > 1 - DECAY_PROBABILITY
          ) {
            let color = weightedMix(
              CURRENT_CELL_COLOR,
              CURRENT_BACKGROUND_COLOR,
              new_grid[i][j][1] / DEFAULT_LIFETIME
            );
            new_grid[i][j][2] = color;
          } else new_grid[i][j][1] = 0;
        }
      }
    }
  }
  return new_grid;
}

function insert_random_shape(x, y, grid) {
  let shape = COMMON_SHAPES[Math.floor(Math.random() * COMMON_SHAPES.length)];
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      // make sure that we're in the grid!
      if (
        x + i >= 0 &&
        x + i < grid.length &&
        y + j >= 0 &&
        y + j < grid[0].length
      ) {
        grid[x + i][y + j] = [
          shape[j][i],
          DEFAULT_LIFETIME,
          shape[i][j] ? CURRENT_CELL_COLOR : CURRENT_BACKGROUND_COLOR,
        ];
      }
    }
  }
}

async function main(grid, debug = false) {
  if (debug) {
    step = true;
  }
  // Toggle cell state on mouse click
  CANVAS.addEventListener("click", (event) => {
    let x = Math.floor(event.clientX / RESOLUTION);
    let y = Math.floor(event.clientY / RESOLUTION);
    // spawn a random shape
    insert_random_shape(x, y, grid);
  });
  //let cell = grid[x][y];
  //if (cell[0] === 1) {
  //grid[x][y] = [0, 0, CURRENT_BACKGROUND_COLOR];
  //} else {
  //grid[x][y] = [1, DEFAULT_LIFETIME, CURRENT_CELL_COLOR];
  //}
  //});

  // track mouse movement
  CANVAS.addEventListener("mousemove", (event) => {
    MOUSE_X = Math.floor(event.clientX / RESOLUTION);
    MOUSE_Y = Math.floor(event.clientY / RESOLUTION);
  });

  // Toggle keymaps
  document.addEventListener("keydown", (e) => {
    if (e.key === "c") {
      running = !running;
      console.log("Running: " + running);
    }
    if (e.key === "s") {
      step = true;
      running = true;
      console.log("Stepping 1 frame...");
    }
    if (e.key == "r") {
      grid = init_grid(DEFAULT_SEED, (random = true));
      console.log("New random grid generated");
    }
    if (e.key == "x") {
      grid = init_grid((" ", (random = false)));
      running = false;
      console.log("Grid cleared");
    }

    // Insert an r-pentonimo at mouse coords on press of 'p'
    if (e.key == "p") {
      let x = MOUSE_X;
      let y = MOUSE_Y;
      insert_random_shape(x, y, grid);
    }
  });
  let init = true;
  let tick = 0;
  while (true) {
    // Simulate a step
    if (running || step || init) {
      // Clear canvas
      CANVAS.getContext("2d").clearRect(0, 0, CANVAS.width, CANVAS.height);

      // update the grid
      if (!init) {
        draw_grid(grid);
        grid = update_grid(grid);
      } else {
        init = false;
      }
    }
    if (step) {
      running = false;
      step = false;
    }
    // Modulate lifetime decay sine wave
    DECAY_TICK = Math.sin(tick / LIFETIME_DECAY_OSCILLATION) / 2 + 0.5;
    tick += 1;

    await new Promise((r) => setTimeout(r, 1000 / FRAMERATE));
  }
}

init_canvas();
grid = init_grid(DEFAULT_SEED, (random = false));
main(grid, (debug = false));
