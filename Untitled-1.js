// JavaScript Comprehensive Example
// Demonstrates variables, data types, functions, classes, async/await, closures, modules, DOM, and more

// ========== VARIABLES & DATA TYPES ==========
var globalVar = 'I am a var (function-scoped)';        // function-scoped (avoid in modern code)
let mutableLet = 42;                                  // block-scoped, can reassign
const immutableConst = true;                          // block-scoped, cannot reassign

// Primitive types: string, number, boolean, null, undefined, symbol, bigint
const name = 'Alice';
const age = 30;
const isActive = false;
const nothing = null;
let notDefined; // undefined
const bigNumber = 9007199254740991n; // BigInt literal
const uniqueId = Symbol('id');

// ========== TEMPLATE LITERALS & STRING INTERPOLATION ==========
console.log(`Name: ${name}, Age: ${age}`);

// ========== OPERATORS ==========
const sum = 5 + 7;     // Arithmetic: +, -, *, /, %
const isAdult = age >= 18; // Comparison: ==, ===, !=, !==, <, >, <=, >=
const logical = isActive && isAdult;  // Logical: &&, ||, !

// ========== FUNCTIONS & ARROW FUNCTIONS ==========
// Traditional function declaration
def function greet(msg = 'Hello') {
    return msg + ', ' + name + '!';
}

// Arrow function (concise)
const greetArrow = (msg = 'Hi') => `${msg}, ${name}!`;

console.log(greet());
console.log(greetArrow('Welcome'));

// ========== HIGHER-ORDER FUNCTIONS & ARRAY METHODS ==========
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);        // map returns new array
const even = numbers.filter(n => n % 2 === 0);  // filter returns subset
const total = numbers.reduce((acc, n) => acc + n, 0); // reduce to single value

console.log({doubled, even, total});

// ========== CLASSES & INHERITANCE ==========
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(`${this.name} makes a noise.`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);      // call base constructor
    this.breed = breed;
  }
  speak() {
    console.log(`${this.name} barks!`);
  }
}

const dog = new Dog('Buddy', 'Golden Retriever');
dog.speak();

// ========== CLOSURES & IIFE ==========
// Immediately-Invoked Function Expression
(function() {
  let counter = 0;
  window.increment = () => ++counter; // closure captures `counter`
})();

console.log(increment()); // 1
console.log(increment()); // 2

// ========== ASYNC/AWAIT & PROMISES ==========
function fetchData(url) {
  // returns a promise that resolves after 1s
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!url) reject(new Error('URL is required'));
      resolve({data: `Response from ${url}`});
    }, 1000);
  });
}

async function load() {
  try {
    const result1 = await fetchData('/api/endpoint1');
    const result2 = await fetchData('/api/endpoint2');
    console.log(result1, result2);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
load();

// ========== GENERATORS ==========
function* idGenerator() {
  let id = 1;
  while (true) {
    yield id++;
  }
}
const gen = idGenerator();
console.log(gen.next().value); // 1
console.log(gen.next().value); // 2

// ========== MODULES (ES6) ==========
// export function example() {}
// import { example } from './module.js';

// ========== ERROR HANDLING ==========
try {
  throw new Error('Something went wrong');
} catch (e) {
  console.error(e.message);
} finally {
  console.log('Cleanup if needed');
}

// ========== DOM MANIPULATION & EVENT HANDLING ==========
// Assuming this script runs in browser with an element <button id="btn"></button>
const btn = document.getElementById('btn');
if (btn) {
  btn.addEventListener('click', () => {
    alert('Button clicked!');
  });
}

// End of comprehensive example
