// let resolution be a random number between 10 and 70

let RESOLUTION = 5

let CANVAS = document.getElementById('canvas');
let FRAMERATE = 120
let DEFAULT_LIFETIME = randint(200, 1000)
let CHROMATIC_ABERRANCE_FACTOR = Math.random() * 0.02
let BACKGROUND_COLOR = randomHex()
let CELL_COLOR = randomHex()
BACKGROUND_VOLATILITY = Math.random() * 0.025

mouse_x = 0;
mouse_y = 0;

function init_canvas() {
    console.log("Initialising canvas...")
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
    return CANVAS;
}
function init_grid(random = false) {
    console.log("Initialising grid...")
    let grid = Array(Math.floor(CANVAS.width / RESOLUTION)).fill().map(
        () => Array(Math.floor(CANVAS.height / RESOLUTION)).fill(
            [0, 0, BACKGROUND_COLOR])
    );
    if (random) {
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                // Generate a random 0 or 1
                Math.floor(Math.random() * 2) ? grid[i][j] = [
                    1, DEFAULT_LIFETIME, CELL_COLOR] :
                    grid[i][j] = [0, 0, BACKGROUND_COLOR];

            }
        }
    }
    return grid;
}
function draw_grid(grid) {
    let ctx = CANVAS.getContext('2d');
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
    let new_grid = Array(grid.length).fill().map(
        () => Array(grid[0].length).fill([0, DEFAULT_LIFETIME, BACKGROUND_COLOR])
    );
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            new_grid[i][j] = [grid[i][j][0], grid[i][j][1], grid[i][j][2]];
        }
    }
    return new_grid
}

function update_grid(grid) {
    let new_grid = copy_grid(grid);

    // Update the grid using the rules for Conway's Game of Life
    let ctx = CANVAS.getContext('2d');
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {

            let cell = grid[i][j];
            let neighbors = 0;

            for (let k = -1; k < 2; k++) {
                for (let l = -1; l < 2; l++) {
                    // Check if the neighbor is within the grid,
                    // excluding the current cell and the edges
                    if (
                        i + k >= 0
                        && i + k < grid.length
                        && j + l >= 0
                        && j + l < grid[i].length
                        && !(k == 0 && l == 0)
                    ) { neighbors += grid[i + k][j + l][0] }
                }
            }
            // Any live cell with fewer than two live neighbours dies, as if by underpopulation
            if (cell[0] === 1 && neighbors < 2) {
                new_grid[i][j][0] = 0;
                if (new_grid[i][j][1] > 0) {
                    new_grid[i][j][1]--;
                    color = weightedMix(CELL_COLOR, BACKGROUND_COLOR, new_grid[i][j][1] / DEFAULT_LIFETIME);
                    new_grid[i][j][2] = color;
                }
            }

            // Any live cell with two or three live neighbours lives on to the next generation.
            else if (cell[0] === 1 && (neighbors === 2 || neighbors === 3)) {
                new_grid[i][j][0] = 1;
                color = hexWithAberrance(weightedMix(CELL_COLOR, BACKGROUND_COLOR, new_grid[i][j][1] / DEFAULT_LIFETIME), CHROMATIC_ABERRANCE_FACTOR)
                new_grid[i][j][2] = color;
            }

            // Any live cell with more than three live neighbours dies, as if by overpopulation
            else if (cell[0] === 1 && neighbors > 3) {
                new_grid[i][j][0] = 0;
                if (new_grid[i][j][1] > 0) {
                    new_grid[i][j][1]--;
                    color = hexWithAberrance(weightedMix(CELL_COLOR, BACKGROUND_COLOR, new_grid[i][j][1] / DEFAULT_LIFETIME), CHROMATIC_ABERRANCE_FACTOR)
                    new_grid[i][j][2] = color;
                }
            }

            // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
            else if (cell[0] === 0 && neighbors === 3) {
                new_grid[i][j][0] = 1;
                new_grid[i][j][1] = DEFAULT_LIFETIME;
                color = hexWithAberrance(weightedMix(CELL_COLOR, BACKGROUND_COLOR, new_grid[i][j][1] / DEFAULT_LIFETIME), CHROMATIC_ABERRANCE_FACTOR)
                new_grid[i][j][2] = color;
            }
            else if (cell[0] == 0) {
                if (new_grid[i][j][1] > 0) {
                    new_grid[i][j][1]--;
                    color = hexWithAberrance(weightedMix(CELL_COLOR, BACKGROUND_COLOR, new_grid[i][j][1] / DEFAULT_LIFETIME), CHROMATIC_ABERRANCE_FACTOR)
                    new_grid[i][j][2] = color;
                }

            }
        }
    }
    return new_grid;
}

function insert_random_shape(x, y, grid) {
    let shape = COMMON_SHAPES[Math.floor(Math.random() * COMMON_SHAPES.length)];
    console.log(shape)
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            // make sure that we're in the grid!
            if (
                x + i >= 0
                && x + i < grid.length
                && y + j >= 0
                && y + j < grid[0].length
            ) {

                grid[x + i][y + j] = [shape[j][i], DEFAULT_LIFETIME, shape[i][j] ? CELL_COLOR : BACKGROUND_COLOR];
            }
        }
    }

}

async function main(grid, debug = false) {

    // Toggle cell state on mouse click
    CANVAS.addEventListener('click', (event) => {
        let x = Math.floor(event.clientX / RESOLUTION);
        let y = Math.floor(event.clientY / RESOLUTION);
        let cell = grid[x][y]
        if (cell[0] === 1) { grid[x][y] = [0, 0, BACKGROUND_COLOR] } else {
            grid[x][y] = [1, DEFAULT_LIFETIME, CELL_COLOR]
        }
    });

    // track mouse movement
    CANVAS.addEventListener('mousemove', (event) => {
        mouse_x = Math.floor(event.clientX / RESOLUTION);
        mouse_y = Math.floor(event.clientY / RESOLUTION);
    });

    // Toggle keymaps
    document.addEventListener('keydown', (e) => {
        if (e.key === 'c') {
            running = !running;
            console.log("Running: " + running);
        }
        if (e.key === "s") {
            step = true;
            console.log("Stepping 1 frame...")
        }
        if (e.key == "r") {
            grid = init_grid(random = true);
            console.log("New random grid generated")
        }
        if (e.key == "x") {
            grid = init_grid(random = false);
            running = false;
            console.log("Grid cleared")
        }

        // Insert an r-pentonimo at mouse coords on press of 'p'
        if (e.key == "p") {
            let x = mouse_x;
            let y = mouse_y;
            insert_random_shape(x, y, grid);
        };
    });


    let running = true;
    let step = false;
    while (true) {
        clear = false
        if (running || step) {
            // draw the grid
            // update the grid
            grid = update_grid(grid, debug = debug);

            // wait for the next frame
            if (step) {
                running = false;
                step = false;
            }

        }
        draw_grid(grid)
        await new Promise(r => setTimeout(r, 1000 / FRAMERATE));
        // Clear the canvas
        CANVAS.getContext('2d').clearRect(
            0, 0, CANVAS.width, CANVAS.height
        )
        BACKGROUND_COLOR = weightedMix(BACKGROUND_COLOR, randomHex(), 1 - BACKGROUND_VOLATILITY);
    }
}
init_canvas()
main(init_grid(random = true), debug = false)