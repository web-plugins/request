/**
 * 封装浏览器 AJAX
 * todo 完善 xhr功能 与 兼容
 */


// 格式化参数
function formatParams(data) {
    let dataArr = []
    for (let key in data) {
        dataArr.push(key + "=" + data[key])
    }
    return dataArr.join("&")
}

function formatData(content, type = "json") {
    let res = content

    if (type === "json") {
        res = JSON.parse(content)
    }

    return res
}


// --------Request类---------//
const defaultConfig = {
    type: "raw",
    method: "GET"
}

class SimpleHttp {
    constructor(config) {
        this.config = Object.assign(defaultConfig, config)

        this.initXHR()
    }

    initXHR() {
        let xhr = null

        try {
            xhr = new XMLHttpRequest()
        } catch (e) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP") // IE6以上版本
            } catch (e) {
                try {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP") // IE6以下版本
                } catch (e) {
                    // alert("您的浏览器不支持Ajax")
                }
            }
        }

        this.xhr = xhr
    }

    request() {
        let xhr = this.xhr
        let {url, method, header, data} = this.config

        let params = formatParams(data)

        // 拼接get参数
        if (method === "GET") {
            url += "?" + data
            data = null
        }

        // 建立连接
        xhr.open(method, url, true)

        // 设置请求头
        header && Object.keys(header).forEach(key => {
            xhr.setRequestHeader(key, header[key])
        })

        // 发送请求
        xhr.send(params)

        // 监听状态
        return new Promise((resolve, reject) => {
            xhr.onreadystatechange = () => {
                let state = xhr.readyState
                if (state === 4) {
                    let response = this.getResponseSchema(xhr)
                    resolve(response)
                }
            }

            xhr.onerror = (err) => {
                reject(err)
            }
        })
    }

    getResponseSchema(xhr) {

        let data = formatData(xhr.response, this.config.type)

        let status = xhr.status,
            statusText = xhr.statusText

        let header = xhr.getAllResponseHeaders() // todo 目前返回的是一个字符串

        let request = this.config // todo 目前直接赋值的请求参数

        return {
            data, // 响应数据
            status, // 响应状态吗
            statusText, // 响应描述字段
            header, // 响应头
            request, // 对应的请求数据
        }
    }
}

// 浏览器默认请求函数
module.exports = config => {
    let http = new SimpleHttp(config)
    return http.request()
}
