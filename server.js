var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
    console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
    process.exit(1)
}

var server = http.createServer(function(request, response) {
    var parsedUrl = url.parse(request.url, true)
    var pathWithQuery = request.url
    var queryString = ''
    if (pathWithQuery.indexOf('?') >= 0) { queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
    var path = parsedUrl.pathname
    var query = parsedUrl.query
    var method = request.method

    /******** 从这里开始看，上面不要看 ************/

    console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)



    if (path === "/sign_in" && method === "POST") {
        response.setHeader("Content-Type", "text/html; charset=UTF-8")
            // 读数据库
        const userArray = JSON.parse(fs.readFileSync("./db/users.json"))
        const array = [];
        // 监听请求上面的数据，如果请求传了一个数据过来
        request.on("data", (chunk) => {
            array.push(chunk)
        });
        // 如果请求的数据传递结束，我就把这个数据给打印出来
        request.on("end", () => {
            const string = Buffer.concat(array).toString();
            const obj = JSON.parse(string); // name 和 password
            // 判断数组中有没有跟我一样的name 和 password
            // find 查找数组中有没有符合要求的值
            const user = userArray.find((user) => user.name === obj.name && user.password === obj.password)
            if (user === undefined) {
                response.statusCode = 400;
                response.setHeader("Content-Type", "text/html; charset=UTF-8")
                    // 每一个公司都应该有一个自己的errorCode,如果没有就说明很挫
                    // 这里的4001，表示400里的第一种错误
                response.end(`{"errorCode": 4001}`)
            } else {
                response.statusCode = 200;
                response.setHeader("Set-Cookie", "logined=1")
                response.end();
            }
            response.end();
        })

    } else if (path === "/home.html") {
        // 显示登录用户名，通过cookie做
        const cookie = request.headers["cookie"];
        if (cookie === "logined=1") {
            // 读取文件
            const homeHtml = fs.readFileSync("./db/users.json").toString()
                // 找到这个文件替换
            homeHtml.replace("{{loginStatus}}}", "已登录");
            response.write();
        } else {
            // 读取文件
            const homeHtml = fs.readFileSync("./db/users.json").toString()
                // 找到这个文件替换
            homeHtml.replace("{{loginStatus}}}", "未登录");
            response.write();
        }
    } else if (path === "/register" && method === "POST") {
        response.setHeader("Content-Type", "text/html; charset=UTF-8")
            // 读数据库
        const userArray = JSON.parse(fs.readFileSync("./db/users.json"))
        const array = [];
        // 监听请求上面的数据，如果请求传了一个数据过来
        request.on("data", (chunk) => {
            array.push(chunk)
        });
        // 如果请求的数据传递结束，我就把这个数据给打印出来
        request.on("end", () => {
            const string = Buffer.concat(array).toString();
            const obj = JSON.parse(string);
            // 由于数组里只留了一个空数组，所以这里还要加一下判断
            const lastUser = userArray;
            // 获取数据库里id值最大的那一个
            const newUser = {
                id: lastUser ? lastUser.id + 1 : 1,
                name: obj.name,
                password: obj.password
            }
            userArray.push(newUser)
                // 将请求写入数据库
            fs.writeFileSync('./db/users.json', JSON.stringify(userArray))
            response.end();
        })

    } else {
        response.statusCode = 200
            // 默认首页
        const filePath = path === '/' ? '/index.html' : path
        const index = filePath.lastIndexOf('.')
            // suffix 是后缀
        const suffix = filePath.substring(index)
        const fileTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg'
        }
        response.setHeader('Content-Type',
            `${fileTypes[suffix] || 'text/html'};charset=utf-8`)
        let content
        try {
            content = fs.readFileSync(`./public${filePath}`)
        } catch (error) {
            content = '文件不存在'
            response.statusCode = 404
        }
        response.write(content)
        response.end()
    }

})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)