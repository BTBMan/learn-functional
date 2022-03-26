const fs = require('fs');
const _ = require('lodash');

class Functor {
  constructor(val) {
    this.val = val;
  }

  // 暂时没用 已经在IO中实现
  // map(f) {
  //   return new Functor(f(this.val));
  // }
}

class Monad extends Functor {
  join() {
    return this.val;
  }

  flatMap(f) {
    return this.map(f).join();
  }
}

const compose = _.flowRight;

class IO extends Monad {
  static of(val) {
    return new IO(val);
  }

  map(f) {
    return IO.of(compose(f, this.val));
  }
}

const readFile = function (filename) {
  console.log('readFile');

  return IO.of(function () {
    console.log('readFile in IO value');

    return fs.readFileSync(filename, 'utf-8');
  });
};

const print = function (x) {
  console.log('print');

  return IO.of(function () {
    console.log('print in IO value');
    return x + ' functional';
  });
};

const tail = function (x) {
  console.log('tail');

  return IO.of(function () {
    console.log('tail in IO value');
    return x + ' john';
  });
};

const result = readFile(__dirname + '/test.txt').flatMap(print);
// .flatMap(tail);

// console.log(result.toString());
// console.log('============');
// console.log(compose().toString());
// console.log(result().val());
result().val();

// 以上的执行说明
// readFile函数执行 此时会执行console.log('readFile');
// readFile执行完毕 会返回一个新的IO函子 并且传入的val是一个包涵console.log('readFile in IO value');的函数
// 通过返回的新IO函子 执行内部已经继承的Monad的flatMap方法
// flatMap内传入一个print方法
// print方法内部返回一个新的IO函子 并且传入的val是一个包涵console.log('print in IO value');的函数
// flatMap调用IO内部的map方法 并返回一个新的IO函子 并把flatMap传入的函数和之前的包涵console.log('readFile in IO value');的函数进行合并
// 合并后的函数为map方法内返回的新IO函子的值
// 通过join方法吧map方法内返回的新的IO函子的val取出来 方便在外部调用
// 外部直接调用result() 会先执行readFile in IO value和print的console信息
// 之后会返回最后执行的print内部返回的新的IO函子 其内部有一个val
// 再通过调用val() 而得到打印信息print in IO value

// compose(
//   function (x) {
//     console.log('1', x);
//   },
//   function (x) {
//     console.log('2', x);

//     return '2';
//   },
//   function () {
//     console.log('3');
//     return '3';
//   },
// )();
