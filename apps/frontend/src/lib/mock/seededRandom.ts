/**
 * Seeded random number generator using mulberry32 algorithm
 * This ensures the same seed always produces the same sequence of random numbers
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Generate a random number between 0 and 1
   */
  random(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate a random integer between min (inclusive) and max (exclusive)
   */
  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min)) + min;
  }

  /**
   * Pick a random element from an array
   */
  pick<T>(array: T[]): T {
    return array[this.randomInt(0, array.length)];
  }

  /**
   * Generate a UUID-like string (deterministic based on seed)
   */
  uuid(): string {
    const hex = "0123456789abcdef";
    let result = "";
    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        result += "-";
      } else if (i === 14) {
        result += "4"; // UUID version 4
      } else if (i === 19) {
        result += hex[this.randomInt(8, 12)]; // UUID variant
      } else {
        result += hex[this.randomInt(0, 16)];
      }
    }
    return result;
  }
}
