let browserRequest = require("./browser")


class HttpModel {
    constructor(requestEngine, config) {
        this.interceptors = {
            request: [],
            response: []
        }

        this.requestEngine = requestEngine

        this.config = config
    }

    // 手动设置请求配置
    setConfig(config) {
        this.config = Object.assign(this.config, config)
    }

    // 请求拦截器
    before(interceptor) {
        this.interceptors.request.unshift(interceptor)
        return this
    }

    // 响应拦截器
    after(interceptor) {
        this.interceptors.response.push(interceptor)
    }

    run(chain) {
        // 添加中间件到执行链上
        let {request, response} = this.interceptors

        request.forEach(item => {
            chain.unshift(item.fulfilled, item.rejected)
        })
        response.forEach(item => {
            chain.push(item.fulfilled, item.rejected)
        })

        // 构建Promise链
        let promise = Promise.resolve(this.config)
        // todo catch error
        while (chain.length) {
            promise = promise.then(chain.shift(), chain.shift())
        }

        return promise
    }

    // 基础请求方法
    request(url, method, params = {}, customConfig = {}) {
        // 还原request参数格式
        let config = {
            url: url,
            data: params,
            method: method
        }

        config = Object.assign(this.config, config, customConfig)

        let chain = [
            config => {
                return this.requestEngine(config)
            },
            undefined
        ]

        return this.run(chain)
    }
}

// 基本方法
["GET", "POST", "DELETE", "PUT"].forEach(method => {
    method = method.toLowerCase()
    // 快捷请求方法
    HttpModel.prototype[method] = function (url, params = {}) {
        return this.request(url, method, params)
    }
})

function createInstance(browserRequest, config) {
    return new HttpModel(browserRequest, config)
}

let defaultConfig = {
    header: {},
    baseUrl: ''
}

// 默认使用浏览器请求对象
export default createInstance(browserRequest, defaultConfig)
