export type Language = 'typescript' | 'javascript' | 'csharp' | 'swift' | 'kotlin' | 'go' | 'rust';

export interface LanguageOption {
  language: Language;
  name: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { language: 'typescript', name: 'TypeScript' },
  { language: 'javascript', name: 'JavaScript' },
  { language: 'csharp', name: 'C#' },
  { language: 'swift', name: 'Swift' },
  { language: 'kotlin', name: 'Kotlin' },
  { language: 'go', name: 'Go' },
  { language: 'rust', name: 'Rust' },
];

/**
 * Generate a cryptographically secure random integer between min and max (inclusive)
 */
export function generateRandomNumber(min: number, max: number): number {
  // Ensure min is less than or equal to max
  if (min > max) {
    [min, max] = [max, min];
  }

  const range = max - min + 1;
  const array = new Uint32Array(1);

  // Reject draws from the final partial bucket, otherwise the low end of the
  // range would come up more often than the high end.
  const limit = Math.floor(2 ** 32 / range) * range;
  let randomValue: number | undefined;
  do {
    crypto.getRandomValues(array);
    randomValue = array[0];
    if (randomValue === undefined) {
      throw new Error('Failed to generate random value');
    }
  } while (randomValue >= limit);

  return min + (randomValue % range);
}

/**
 * Generate code sample template for the specified language
 */
export function generateCodeTemplate(
  language: Language,
  min: number,
  max: number
): string {
  const templates: Record<Language, (min: number, max: number) => string> = {
    typescript: (min, max) => `function getRandomNumber(min: number, max: number): number {
  const range = max - min + 1;
  // Reject the final partial bucket so every value in the range is equally likely.
  const limit = Math.floor(2 ** 32 / range) * range;
  const bytes = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(bytes);
    value = bytes[0]!;
  } while (value >= limit);
  return min + (value % range);
}

// Usage: Generate a random number between ${min} and ${max}
const randomNumber = getRandomNumber(${min}, ${max});
console.log(randomNumber);`,

    javascript: (min, max) => `function getRandomNumber(min, max) {
  const range = max - min + 1;
  // Reject the final partial bucket so every value in the range is equally likely.
  const limit = Math.floor(2 ** 32 / range) * range;
  const bytes = new Uint32Array(1);
  let value;
  do {
    crypto.getRandomValues(bytes);
    value = bytes[0];
  } while (value >= limit);
  return min + (value % range);
}

// Usage: Generate a random number between ${min} and ${max}
const randomNumber = getRandomNumber(${min}, ${max});
console.log(randomNumber);`,

    csharp: (min, max) => `using System;
using System.Security.Cryptography;

// RandomNumberGenerator.GetInt32 is the CSPRNG. System.Random is not and must
// not be used where the value has to be unguessable.
int GetRandomNumber(int min, int max)
{
    return RandomNumberGenerator.GetInt32(min, max + 1);
}

// Usage: Generate a random number between ${min} and ${max}
int randomNumber = GetRandomNumber(${min}, ${max});
Console.WriteLine(randomNumber);`,

    swift: (min, max) => `import Foundation
import Security

func getRandomNumber(min: Int, max: Int) -> Int {
    let range = UInt32(max - min + 1)
    // Reject the final partial bucket so every value in the range is equally likely.
    let limit = UInt32.max - (UInt32.max % range)
    var value: UInt32 = 0
    repeat {
        let status = SecRandomCopyBytes(kSecRandomDefault, MemoryLayout<UInt32>.size, &value)
        guard status == errSecSuccess else {
            fatalError("Unable to read secure random bytes")
        }
    } while value >= limit
    return min + Int(value % range)
}

// Usage: Generate a random number between ${min} and ${max}
let randomNumber = getRandomNumber(min: ${min}, max: ${max})
print(randomNumber)`,

    kotlin: (min, max) => `import java.security.SecureRandom

// SecureRandom is the CSPRNG. kotlin.random.Random is not and must not be used
// where the value has to be unguessable.
private val secureRandom = SecureRandom()

fun getRandomNumber(min: Int, max: Int): Int {
    return min + secureRandom.nextInt(max - min + 1)
}

// Usage: Generate a random number between ${min} and ${max}
val randomNumber = getRandomNumber(${min}, ${max})
println(randomNumber)`,

    go: (min, max) => `package main

import (
    "crypto/rand"
    "fmt"
    "math/big"
)

// crypto/rand is the CSPRNG. math/rand is not and must not be used where the
// value has to be unguessable.
func getRandomNumber(min, max int64) (int64, error) {
    n, err := rand.Int(rand.Reader, big.NewInt(max-min+1))
    if err != nil {
        return 0, err
    }
    return min + n.Int64(), nil
}

// Usage: Generate a random number between ${min} and ${max}
func main() {
    randomNumber, err := getRandomNumber(${min}, ${max})
    if err != nil {
        panic(err)
    }
    fmt.Println(randomNumber)
}`,

    rust: (min, max) => `// rand 0.8. OsRng reads straight from the operating system CSPRNG.
use rand::rngs::OsRng;
use rand::Rng;

fn get_random_number(min: i32, max: i32) -> i32 {
    OsRng.gen_range(min..=max)
}

// Usage: Generate a random number between ${min} and ${max}
fn main() {
    let random_number = get_random_number(${min}, ${max});
    println!("{}", random_number);
}`,
  };

  return templates[language](min, max);
}
