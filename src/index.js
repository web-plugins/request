let browserRequest = require("./browser");

// todo 服务器环境请求对象不同
let baseRequest = browserRequest

function hasHostPrefix(url) {
    return /^https?/.test(url);
}

class HttpModel {
    constructor(config, opt = {}) {
        this.interceptors = {
            request: [],
            response: []
        };

        this.opt = opt;

        this.config(config);
    }

    config(params) {
        this.host = params.host;

        return this;
    }

    before(opt) {
        this.interceptors.request.unshift(opt);
        return this;
    }

    after(opt) {
        this.interceptors.response.push(opt);
    }

    request(url, method, params = {}) {
        // 还原wx.request的参数格式
        let config = {
            url: hasHostPrefix(url) ? url : this.host + url,
            data: params,
            method: method
        };

        Object.assign(config, this.opt);

        let chain = [
            config => {
                return baseRequest(config).then(result => {
                    // 将响应状态和数据绑定到resource实例上
                    this.status = result.statusCode;
                    this.data = result.data;

                    return result;
                });
            },
            undefined
        ];

        // 添加中间件到执行链上
        this.interceptors.request.forEach(item => {
            chain.unshift(item.fulfilled, item.rejected);
        });
        this.interceptors.response.forEach(item => {
            chain.push(item.fulfilled, item.rejected);
        });

        let promise = Promise.resolve(config);

        while (chain.length) {
            promise = promise.then(chain.shift(), chain.shift());
        }

        return promise;
    }
}

// 基本方法
["GET", "POST", "HEAD", "DELETE", "PUT"].forEach(item => {
    let method = item.toLowerCase();
    HttpModel.prototype[method] = function (url, params = {}) {
        return this.request(url, item, params);
    };
});


function createInstance(config) {
    return new HttpModel(config)
}

let defaultConfig = {}

export default createInstance(defaultConfig)
