/**
 * Created by admin on 2017/5/15.
 */
!(function (factory) {
    if (typeof define === "function" && (define.amd || define.cmd)) {
        define(["jquery"], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = function (root, jQuery) {
            if (jQuery === undefined) {
                if (typeof window !== 'undefined') {
                    jQuery = require('jquery');
                } else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        factory();
    }
})(function () {

    // 格式化参数
    function formateParams(data) {
        var dataArr = [];
        for (var key in data) {
            dataArr.push(key + "=" + data[key]);
        }
        return dataArr.join("&");
    }

    // --------Request类---------//

    function Request(opt) {
        Object.assign(this, opt);
        this.getXHR();
    }

    Request.prototype.getXHR = function () {
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
                    alert("您的浏览器不支持Ajax");
                }
            }
        }

        this.xhr = xhr;
    };

    Request.prototype.request = function () {
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
        xhr.onreadystatechange = function () {
            var state = xhr.readyState;
            if (state === 4) {
                var status = xhr.status;
                // 这里的回调绑定到了this上面
                if (status === 200) {
                    console.log(xhr);
                    var data = self.formateData(xhr.responseText);
                    self.success(data);
                } else if (/^4/.test(status)) {
                    self.error();
                }
            }
        }
    };

    Request.prototype.formateData = function (content) {
        var res,
            type = this.type;

        if (type === "json") {
            res = JSON.parse(content);
        }

        return res;
    };

    window.Request = Request;
});