function Tile(x, y, state) {
    this.x = x;
    this.y = y;

    this.state = state;
}

// if you want to add a new tile, you need to update these three lines of code
const tiles = ["cracked", "spikes", "nowalk", "checkpoint", "end", "walk", "start"];
const firstWalkableTile = 3;

/*
    Maze generation logic: (not that advanced):

        step 1: Get the neighbouring tiles that aren't walkable
        step 2: If the list is empty, backtrack
        step 3: Else, pick a random tile from this list to repeat this process on
        step 4: If there's no tiles left, load level
*/

// random level generation code
function randomLevel(w, h) {
    let grid = [];

    // set starting point
    startX = 1;
    startY = 1;

    // loop through grid and random non-walkable tiles
    for (let y = 0; y < h + 1; y++) {
        let tempGrid = [];
        for (let x = 0; x < w + 1; x++) {
            // random tile from bad tiles array
            let state = Math.floor(Math.random() * firstWalkableTile);

            tempGrid.push({ x, y, state });
        }

        grid.push(tempGrid);
    }

    function getNeighbours(tile) {
        let x = tile.x;
        let y = tile.y;

        let n1 = (grid[y + 2] || [])[x];
        let n2 = (grid[y] || [])[x + 2];
        let n3 = (grid[y - 2] || [])[x];
        let n4 = (grid[y] || [])[x - 2];

        return [n1, n2, n3, n4];
    }

    function generateLayout(tile) {
        // set current tile to walkable
        tile.state = tiles.indexOf("walk");

        // get neighbours
        let neighbours = getNeighbours(tile);

        // declare next
        let next;

        // pick a random neighbour
        while (true) {
            next = neighbours[Math.floor(Math.random() * neighbours.length)];

            if (next != undefined && next.state < firstWalkableTile || neighbours.length == 0) break;

            neighbours.splice(neighbours.indexOf(next), 1);
        }

        if (next) {
            next.parent = tile;

            // make the tile in between current and neighbour walkable
            let betweenX = (tile.x + next.x) / 2;
            let betweenY = (tile.y + next.y) / 2;
            grid[betweenY][betweenX].state = tiles.indexOf("walk");
        }

        // if there are no valid neighbours, backtrack
        if (tile.parent && !next) next = tile.parent;

        // check for neighbour
        if (next) {
            generateLayout(next);
        } else {
            generateSpecial();
        }
    }

    // generates start, end and checkpoints
    function generateSpecial() {
        // loop through current grid and look for farthest point from the player
        let dstHigh, highTile;

        for (let x = 0; x < grid.length; x++) {
            for (let y = 0; y < grid[x].length; y++) {
                let current = grid[x][y];

                if (current.state != tiles.indexOf("walk")) continue;

                let dst = Math.abs(current.x - startX) + Math.abs(current.y - startY);

                if (!dstHigh || dstHigh < dst) {
                    dstHigh = dst;
                    highTile = current;
                }
            }
        }

        // set the tile farthest away to the end
        highTile.state = tiles.indexOf("end");

        // set start
        grid[startX][startY].state = tiles.indexOf("start");

        loadLevel();
    }

    // convert the grid to valid tiles
    function loadLevel() {
        levelCache = document.createElement("canvas");
        levelContext = levelCache.getContext("2d");

        // set the width and height of the canvas
        levelCache.width = grid[0].length * tileSize;
        levelCache.height = grid.length * tileSize;

        levelContext.imageSmoothingEnabled = false;

        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                let tile = new Tile(x, y, grid[y][x].state);

                // set start tile
                if (tiles[tile.state] === "start") {
                    startX = tile.x;
                    startY = tile.y;
                    checkX = startX;
                    checkY = startY;
                }

                grid[y][x] = tile;

                // if there's no tile here, continue
                if (tiles[tile.state] === "nowalk") continue;

                // draw tile sprite on top of the current theme (in the water case, ripples around the rock)
                levelContext.drawImage(Pic(currentTheme), tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);
                levelContext.drawImage(Pic(tiles[tile.state]), tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);

                // draw connections between walkable tiles

                // left
                if (tile.state >= firstWalkableTile) {

                    if ((grid[y] || [])[x - 1] && (grid[y] || [])[x - 1].state >= firstWalkableTile) levelContext.drawImage(Pic("bridge_horizontal"), tile.x * tileSize - tileSize / 2, tile.y * tileSize, tileSize, tileSize);
                    if ((grid[y - 1] || [])[x] && (grid[y - 1] || [])[x].state >= firstWalkableTile) levelContext.drawImage(Pic("bridge_vertical"), tile.x * tileSize, tile.y * tileSize - tileSize / 2, tileSize, tileSize);

                }
            }
        }

        if (startX == undefined || startY == undefined) {
            throw new Error("Level initialization error, no start tile defined");
        }

        player.kill();
    }

    generateLayout(grid[startX][startY]);

    return grid;
}