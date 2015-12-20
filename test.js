var EatBeeParser = require('./parser/p.js');

var parser = new EatBeeParser();

parser.add('AA1', 'foo');
parser.add('C2', 'bar');
// f.add('Z0', 'AA1+2');

var foo = parser.compute('concat(concat(AA1, C2), \'hey\')');
console.log(foo);
// var foo = f.compute('concat(\'foo\',\'bar\')');
// var foo = f.compute('equals(\'foo\',\'bar\')');
// var foo = f.compute('equals(\'foo\',\'foo\')');
// var foo = f.compute('indexof(\'x fun\', \'some function\')');
// var foo = f.compute('substr(\'x fun\', 2, 3)');
// var foo = f.compute('replace(\'Jello\\\' hell\', \'ll\', \'foo\')');
// var foo = f.compute('degToRad(60)');
// var foo = f.compute('radToDeg(1.0472)');
// var foo = parser.compute('CeIl(4.4)');
// console.log(foo);

// var foo = parser.compute('substr(\'foobar\', 2, 2^3)');
var foo = parser.compute('-2^3');
// var foo = parser.compute('Math.pow(C1,C2^2)');
console.log(foo);
