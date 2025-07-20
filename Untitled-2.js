/**
 * 综合 JavaScript 语法与主要功能示例
 * 包含变量、数据类型、函数、类、模块、异步操作、DOM 操作等
 */

// 1. 注释示例
// 单行注释
/*
  多行注释
*/

// 2. 变量与数据类型
var globalVar = '全局变量'; // var：可重复声明
let mutableVar = 42;         // let：可变
const PI = 3.14159;          // const：常量

// 基本类型
let num = 123;               // 数字
let str = '字符串';           // 字符串
let bool = true;             // 布尔
let nothing = null;          // null
let notDefined;              // undefined
let sym = Symbol('唯一标识'); // Symbol
let big = 9007199254740991n; // BigInt

// 复合类型
let obj = { name: 'Alice', age: 30 };
let arr = [1, 2, 3];

// 3. 运算符
let sum = num + mutableVar;
let isEqual = (num === 123);

// 4. 字符串模板与解构赋值
let greeting = `Hello, ${obj.name}，年龄 ${obj.age}`;
let { name, age } = obj;
let [first, ...rest] = arr;

// 5. 控制流
if (age > 18) {
  console.log('成年人');
} else {
  console.log('未成年人');
}

switch (age) {
  case 20:
    console.log('二十岁');
    break;
  default:
    console.log('其他年龄');
}

// 循环
for (let i = 0; i < 3; i++) {
  console.log(i);
}

for (const item of arr) {
  console.log(item);
}

let i = 0;
while (i < 3) {
  console.log(i++);
}

// 6. 函数
// 6.1 函数声明
function add(a = 0, b = 0) {
  return a + b;
}

// 6.2 函数表达式
const multiply = function(a, b) {
  return a * b;
};

// 6.3 箭头函数
const square = x => x * x;

// 6.4 Rest 参数与可选参数
function sumAll(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}

// 6.5 闭包
function makeCounter() {
  let count = 0;
  return function() {
    return ++count;
  };
}
const counter = makeCounter();

// 7. 类与继承
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(`${this.name} 发声`);
  }
  static info() {
    console.log('动物类');
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
  speak() {
    super.speak();
    console.log(`${this.name} 是一只 ${this.breed}`);
  }
}

const dog = new Dog('旺财', '中华田园犬');
Dog.info();
dog.speak();

// 8. 异步与 Promise
function fetchData(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (url) {
        resolve({ data: '示例数据' });
      } else {
        reject(new Error('无效的 URL'));
      }
    }, 500);
  });
}

async function getData() {
  try {
    const result = await fetchData('https://api.example.com');
    console.log('异步获取结果：', result.data);
  } catch (error) {
    console.error('异步错误：', error);
  } finally {
    console.log('异步操作完成');
  }
}
getData();

// 9. 模块（ES6 模块示例，需打包工具或支持）
/*
// 导出
export const PI = 3.14;
export function circleArea(r) {
  return PI * r * r;
}

// 导入
import { PI, circleArea } from './math.js';
*/

// 10. 数据结构：Map, Set
let map = new Map();
map.set('key1', 'value1');
for (let [k, v] of map) {
  console.log(k, v);
}

let set = new Set([1, 2, 3, 2]);
set.add(4);
console.log(set);

// 11. Proxy 与 Reflect
let target = { x: 1 };
let proxy = new Proxy(target, {
  get(obj, prop) {
    console.log(`读取属性 ${prop}`);
    return Reflect.get(obj, prop);
  },
});
console.log(proxy.x);

// 12. DOM 操作示例（需在浏览器环境）
document.addEventListener('DOMContentLoaded', () => {
  const div = document.createElement('div');
  div.textContent = 'Hello DOM';
  div.style.color = 'cyan';
  document.body.appendChild(div);

  div.addEventListener('click', () => {
    alert('你点击了 DIV');
  });
});

// 13. 定时器
const timer = setInterval(() => {
  console.log('定时执行');
}, 1000);
setTimeout(() => {
  clearInterval(timer);
  console.log('已停止定时器');
}, 5000);

// 14. 迭代器与生成器
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}
const iterator = gen();
console.log(iterator.next(), iterator.next());

// 15. JSON 操作
const jsonString = JSON.stringify({ a: 1, b: 2 });
const jsonObj = JSON.parse(jsonString);

// 16. 本地存储示例（需在浏览器环境）
localStorage.setItem('key', 'value');
console.log(localStorage.getItem('key')); 

// 17. ES2020 新特性：可选链与空值合并
let nested = { a: { b: 2 } };
console.log(nested?.a?.b);
console.log(null ?? '默认值');

// ...更多现代 JS 特性...

// 18. 经典实用函数示例
/**
 * 18.1 防抖（debounce）
 * 连续触发时，仅在最后一次触发 wait 毫秒后执行 fn
 * @param {Function} fn 要执行的函数
 * @param {number} [wait=300] 延迟时间（毫秒）
 * @returns {Function} 返回防抖后的新函数
 */
function debounce(fn, wait = 300) {
  let timeout; // 用于存储定时器 ID
  return function(...args) { // 返回一个新函数，接收原函数参数
    clearTimeout(timeout); // 清除前一次未执行的定时器
    timeout = setTimeout(() => fn.apply(this, args), wait); // 在指定等待后调用原函数，并保持 this 和参数
  };
}

/**
 * 18.2 节流（throttle）
 * 在固定 interval 毫秒内，只执行一次 fn，多余调用将被忽略
 * @param {Function} fn 要执行的函数
 * @param {number} [interval=300] 间隔时间（毫秒）
 * @returns {Function} 返回节流后的新函数
 */
function throttle(fn, interval = 300) {
  let last = 0; // 记录上次执行时间戳
  return function(...args) { // 返回节流函数，接收任意参数
    const now = Date.now(); // 获取当前时间戳
    if (now - last >= interval) { // 若距离上次执行时间超过间隔，则执行
      last = now; // 更新上次执行时间为当前时间
      fn.apply(this, args); // 调用原函数，并保持 this 和参数
    }
  };
}

/**
 * 18.3 深拷贝（deepClone）
 * 递归复制对象及其子属性，支持 Date、RegExp、Array，利用 WeakMap 避免循环引用
 * @param {*} obj 需要深拷贝的对象
 * @param {WeakMap} [hash=new WeakMap()] 用于记录已复制对象，防止循环引用
 * @returns {*} 返回深拷贝后的新对象
 */
function deepClone(obj, hash = new WeakMap()) {
  if (obj == null || typeof obj !== 'object') return obj; // 基本类型直接返回
  if (hash.has(obj)) return hash.get(obj); // 已拷贝过则返回缓存，防止循环引用
  const cloneObj = obj instanceof Date ? new Date(obj) // 处理 Date 类型
    : obj instanceof RegExp ? new RegExp(obj)           // 处理 RegExp 类型
    : Array.isArray(obj) ? [] : {};                     // 数组或普通对象
  hash.set(obj, cloneObj); // 缓存已拷贝对象
  for (const key in obj) { // 遍历对象属性
    if (obj.hasOwnProperty(key)) { // 过滤原型链属性
      cloneObj[key] = deepClone(obj[key], hash); // 递归拷贝属性
    }
  }
  return cloneObj; // 返回深拷贝后的对象
}

/**
 * 18.4 函数柯里化（curry）
 * 将多参数函数转为可以逐次传参的形式，直至参数满足原函数形参数量时执行
 * @param {Function} fn 原始函数
 * @returns {Function} 返回柯里化后的函数
 */
function curry(fn) {
  const arity = fn.length; // 获取函数形参数量，用于判断何时执行
  function curried(...args) { // 递归接收参数的内部函数
    if (args.length >= arity) { // 参数足够时执行原函数
      return fn.apply(this, args); // 调用原函数，并保持 this 和参数
    }
    return (...rest) => curried.apply(this, [...args, ...rest]); // 参数不足时返回新的函数收集剩余参数
  }
  return curried;
}

/**
 * 18.5 数组扁平化（flatten）
 * 递归展开任意嵌套的数组，返回一维数组
 * @param {Array} arr 输入数组
 * @returns {Array} 扁平化后的新数组
 */
function flatten(arr) {
  return arr.reduce((acc, val) => // 使用 reduce 累加
    acc.concat(Array.isArray(val) // 若当前元素为数组则递归扁平化
      ? flatten(val)
      : val
    ), []); // 初始值为空数组
}

/**
 * 18.6 函数组合（compose）
 * 将多个函数组合为先执行最右侧函数，再将结果依次传递给左侧函数
 * @param {...Function} fns 要组合的函数序列
 * @returns {Function} 返回组合后的函数
 */
function compose(...fns) {
  return function(initialValue) { // 返回组合函数，接收初始值
    return fns.reduceRight((val, fn) => fn(val), initialValue); // 右到左依次调用函数
  };
}

/**
 * 18.7 发布-订阅模式（EventEmitter）
 * 实现事件的订阅(on)、取消订阅(off)和发布(emit)
 */
class EventEmitter {
  constructor() { // 初始化 EventEmitter 实例
    this.events = {}; // 存储事件与回调函数列表
  }
  on(event, listener) { // 订阅事件
    (this.events[event] || (this.events[event] = [])).push(listener); // 添加监听器
  }
  off(event, listener) { // 取消订阅
    if (!this.events[event]) return; // 若不存在该事件，直接返回
    this.events[event] = this.events[event].filter(l => l !== listener); // 移除指定监听器
  }
  emit(event, ...args) { // 发布事件，执行所有监听器
    (this.events[event] || []).forEach(listener => listener(...args));
  }
}

// 使用示例
const emitter = new EventEmitter();
emitter.on('test', data => console.log('收到 test 事件：', data));
emitter.emit('test', { a: 1 });
