function generateBitArray(seed_string, length) {
  // Deterministically generate an array of 1s and 0s from a seed phrase.
  // If the seed is too short, wrap around to the beginning of the seed
  let bit_array = [];
  let seed = seed_string.split("");
  let seed_index = 0;
  for (let i = 0; i < length; i++) {
    bit_array.push(seed[seed_index].charCodeAt(0) % 2);
    seed_index = (seed_index + 1) % seed.length;
  }
  return bit_array;
}

function generateBitMatrix(seed_string, width, height) {
  // Generate a matrix of 1s and 0s from a seed phrase
  let bit_array = generateBitArray(seed_string, width * height);
  console.log(height)
  let bit_matrix = Array(width).fill().map(() => Array(height).fill(0));
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      bit_matrix[i][j] = bit_array[i * height + j];
    }
  }
  return bit_matrix;
}
