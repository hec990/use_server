// 引入 fs，读取文件用的
const fs = require("fs")
    // fs.readFileSync 得到一个字符串
const usersString = fs.readFileSync('./db/users.json').toString();

// (1) 读数据库
// 把usersString 转换为 数组对象
const usersArray = JSON.parse(usersString)
console.log(typeof usersString) // string
console.log(usersString)
console.log(typeof usersArray) // object
console.log(usersArray instanceof Array) // Array
console.log(usersArray)


// (2) 写数据库
const users3 = { id: 3, name: "xiaohong", password: "zxcv123" }
    // 注意：这个数据是我本地的一个数组，我还没有把这个数据存在数据库
usersArray.push(users3)

// 怎么存呢？我们要记得文件是存字符串的，所以还要转换一下
// 此时JS对象变成了string
const string = JSON.stringify(usersArray)
    // 最后在将这个字符串写入数据库
    // 参数1：数据库目录，参数2：要传进去的对象
fs.writeFileSync("./db/users.json", string)