function seed() {
  return Array.from(arguments);
}

function same([x, y], [j, k]) {
  let isSame = true;
  const first = arguments[0];
  const second = arguments[1];
  for (let i = 0; i < 2; i++) {
    if (first[i] !== second[i]) {
      isSame = false;
    }
  }
  return isSame;
}

// The game state to search for `cell` is passed as the `this` value of the function.
function contains(cell) {
  return !!this.find((c) => same(cell, c));
}

const printCell = (cell, state) => {
  const alive = "\u25a3";
  const dead = "\u25a2";

  const found = !!state.find((c) => same(cell, c));
  if (found) return alive;

  return dead;
};

const corners = (state = []) => {
  const borders = { topRight: [0, 0], bottomLeft: [0, 0] };
  const records = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  if (!!state.length) {
    records.minX = state[0][0];
    records.maxX = state[0][0];
    records.minY = state[0][1];
    records.maxY = state[0][1];

    let { minX, minY, maxX, maxY } = records;

    state.forEach((cell) => {
      let x = cell[0];
      let y = cell[1];

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    borders.bottomLeft = [minX, minY];
    borders.topRight = [maxX, maxY];
  }

  return borders;
};

const printCells = (state) => {
  let visuals = ``;
  const {
    topRight: [maxX, maxY],
    bottomLeft: [minX, minY],
  } = corners(state);
  for (let y = minY; y <= maxY; y++) {
    let line = "";
    for (let x = minX; x <= maxX; x++) {
      line = line + printCell([x, y], state);
    }
    visuals = line + "\n" + visuals;
  }
  return visuals;
};

const getNeighborsOf = ([x, y]) => {
  const area = [];
  for (let i = y - 1; i <= y + 1; i++) {
    for (let j = x - 1; j <= x + 1; j++) {
      if (!same([j, i], [x, y])) {
        area.push([j, i]);
      }
    }
  }
  return area;
};

const getLivingNeighbors = (cell, state) => {
  const neighbors = getNeighborsOf(cell);
  const myContains = contains.bind(state);
  const livingNeighbors = [];
  neighbors.forEach((n) => {
    if (myContains(n)) {
      livingNeighbors.push(n);
    }
  });

  return livingNeighbors;
};

const willBeAlive = (cell, state) => {
  const livingNeighbors = getLivingNeighbors(cell, state);
  if (livingNeighbors.length === 3) {
    return true;
  } else if (livingNeighbors.length === 2) {
    return contains.call(state, cell);
  }
  return false;
};

const calculateNext = (state) => {
  const {
    topRight: [maxX, maxY],
    bottomLeft: [minX, minY],
  } = corners(state);
  const area = [];
  const nextState = [];

  for (let i = minY - 1; i <= maxY + 1; i++) {
    for (let j = minX - 1; j <= maxX + 1; j++) {
      area.push([j, i]);
    }
  }

  area.forEach((cell) => {
    if (willBeAlive(cell, state)) {
      nextState.push(cell);
    }
  });
  return nextState;
};

const iterate = (state, iterations) => {
  const res = [state];
  for (let i = 0; i < iterations; i++) {
    res.push(calculateNext(res[res.length - 1]));
  }

  return res;
};

const main = (pattern, iterations) => {
  const res = iterate(startPatterns[pattern], iterations);
  console.log(res.map((state) => printCells(state)).join("\n"));
};

const startPatterns = {
  rpentomino: [
    [3, 2],
    [2, 3],
    [3, 3],
    [3, 4],
    [4, 4],
  ],
  glider: [
    [-2, -2],
    [-1, -2],
    [-2, -1],
    [-1, -1],
    [1, 1],
    [2, 1],
    [3, 1],
    [3, 2],
    [2, 3],
  ],
  square: [
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2],
  ],
};

const [pattern, iterations] = process.argv.slice(2);
const runAsScript = require.main === module;

if (runAsScript) {
  if (startPatterns[pattern] && !isNaN(parseInt(iterations))) {
    main(pattern, parseInt(iterations));
  } else {
    console.log("Usage: node js/gameoflife.js rpentomino 50");
  }
}

exports.seed = seed;
exports.same = same;
exports.contains = contains;
exports.getNeighborsOf = getNeighborsOf;
exports.getLivingNeighbors = getLivingNeighbors;
exports.willBeAlive = willBeAlive;
exports.corners = corners;
exports.calculateNext = calculateNext;
exports.printCell = printCell;
exports.printCells = printCells;
exports.startPatterns = startPatterns;
exports.iterate = iterate;
exports.main = main;
