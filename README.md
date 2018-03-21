xRequest
===

一个简洁的网络请求库，支持下列特性	
* 可运行在浏览器和NodeJS环境下
* 支持`Promise`链式调用
* 支持请求拦截器和响应拦截器


## 实现
在实现过程中，将不同的网络请求对象和通用的网络请求库功能进行分层，
* 底层根据运行平台，
	* 浏览器封装`xhr`对象，
	* NodeJS环境封装http对象（todo）
* 顶层封装通用功能
	* 请求配置，如`header`、`baseUrl`等
	* 请求拦截器和响应拦截器
	* 请求快捷方式，`get`、`post`、`delete`、`put`等

## Api
```js
let url = "http://localhost:9999/test.php",
    data = {name: "txm"};

// 基础配置
http.config({
    header: {
        "Content-type": "application/x-www-form-urlencoded"
    },
})

// 请求拦截器
http.before({
    fulfilled(config) {
        console.log(config)
        return config
    }
})

// 响应拦截器
http.after({
    fulfilled(res) {
        console.log('this is response: ' + res)
        return res
    }
})


// 请求方法 get post delete put
http.get(url, data).then(res => {
    console.log(res)
})
        
```