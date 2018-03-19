// 格式化参数
function formateParams(data) {
    var dataArr = [];
    for (var key in data) {
        dataArr.push(key + "=" + data[key]);
    }
    return dataArr.join("&");
}

function formateData(content, type = "json") {
    var res = content;

    if (type === "json") {
        res = JSON.parse(content);
    }

    return res;
}
// --------Request类---------//

const defaultConfig = {
    type: "raw",
    method: "GET"
};

class SimpleHttp {
    constructor(opt) {
        Object.assign(this, defaultConfig, opt);
        this.initXHR();
    }

    initXHR() {
        var xhr = null;
        try {
            xhr = new ActiveXObject("Msxml2.XMLHTTP"); // IE6以上版本
        } catch (e) {
            try {
                xhr = new ActiveXObject("Microsoft.XMLHTTP"); // IE6以下版本
            } catch (e) {
                try {
                    xhr = new XMLHttpRequest();
                    // 如果来自服务器的响应没有 XML mime-type 头部，则一些版本的 Mozilla 浏览器不能正常运行
                    if (xhr.overrideMimeType) {
                        xhr.overrideMimeType("text/xml");
                    }
                } catch (e) {
                    // alert("您的浏览器不支持Ajax");
                }
            }
        }

        this.xhr = xhr;
    }

    request() {
        var self = this,
            xhr = self.xhr,
            url = self.url,
            method = self.method,
            header = self.header,
            data = formateParams(self.data);

        // 拼接get参数
        if (method === "GET") {
            url += "?" + data;
            data = null;
        }

        // 建立连接
        xhr.open(method, url, true);

        // 设置请求头
        if (header) {
            for (var key in header) {
                xhr.setRequestHeader(key, header[key]);
            }
        }

        // 发送请求
        xhr.send(data);

        // 监听状态
        return new Promise((resolve, reject) => {
            xhr.onreadystatechange = () => {
                var state = xhr.readyState;
                if (state === 4) {
                    var status = xhr.status;
                    if (status === 200) {
                        var data = formateData(xhr.responseText, this.type);
                        resolve(data);
                    } else if (/^4/.test(status)) {
                        reject();
                    }
                }
            };
        });
    }
}

// 浏览器默认请求函数
module.exports = config => {
    let http = new SimpleHttp(config)
    return http.request();
};
