export class Roulette {
  static RED_NUMBERS = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ];

  spin() {
    const result = Math.floor(Math.random() * 37); // 0-36
    return Roulette.RED_NUMBERS.includes(result);
  }
}
