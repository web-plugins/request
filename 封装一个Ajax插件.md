封装一个AJAX插件
===

参考：
* [四种常见的 POST 提交数据方式](http://blog.csdn.net/tycoon1988/article/details/40080691)
* [http-关于application/x-www-form-urlencoded等字符编码的解释说明](http://blog.csdn.net/klarclm/article/details/7711021)

## XMLHTTPRequest
需要考虑的是不同浏览器之间构造函数的兼容性
```javascript
var xhr = null;
try {
    xhr = new ActiveXObject("Msxml2.XMLHTTP"); // IE6以上版本
} catch (e) {
    try {
        xhr = new ActiveXObject("Microsoft.XMLHTTP"); // IE6以下版本
    } catch (e) {
        try {
            xhr = new XMLHttpRequest();
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("text/xml");
            }
        } catch (e) {
            alert("您的浏览器不支持Ajax");
        }
    }
}
```

## open和send
`open(method, url, async=true)`方法表示建立一个连接，该方法接受三个参数
* 第一个参数为HTTP请求方式，`GET`,`POST`,`HEAD`等
* 第二个参数是请求资源路径，需要考虑同源策略的限制的
* 第三个参数表示同步或异步请求，默认为`true`表示异步处理

然后调用`send()`方法真正发送请求到服务器。需要注意的是，请求方式不同，附带的请求数据形式也是不一样的
* `GET`方法的参数以`k1=v1&k2=v2`形式直接拼接带`url`后，用`?`分割
* `POST`方法参数以`k1=v1&k2=v2`形式的字符串传入`send()`方法中

### GET和POST的区别
GET方法
* 由于地址相同，浏览器会缓存导致忽略第二次及后面的动态数据，解决这个问题可以加上一个时间戳&t=或者随机数
* 将参数拼接到URL后，中文可能乱码，解决办法是将中文进行编码传输
* URL的长度是有限制的，过长的话浏览器会报414错误

POST方法：
* 无法使用缓存文件（更新服务器上的文件或数据库）
* POST 没有数据量限制，可以向服务器发送大量数据
* 发送包含未知字符的用户输入时，POST 比 GET 更稳定也更可靠

## setRequestHeader
设置请求头需要在`xhr.open()`和`xhr.send()`中间进行，在ajax中主要是设置请求头`Content-type`。

在请求头中，(比如 POST 或者 PUT) `Content-Type`表示客户端告诉服务端实际发送的数据类型，也就是表单<form>元素上的`enctype`属性对应的值。
```
Content-Type: text/html; charset=utf-8
Content-Type: multipart/form-data; boundary=-----
```

表单中的`enctype`属性有：
* `application/x-www-form-urlencoded`：窗体数据被编码为名称/值对。这是标准的编码格式，
    * `get`请求时该编码格式把form数据转换成一个字串（name1=value1&name2=value2...），然后把这个字串append到url后面，用?分割；
    * `post`请求时该编码格式会把form数据封装到请求报文主体中，然后发送到服务器
    * 如果没有`input[type=file]`则使用`x-www-form-urlencoded`就够了。
* `multipart/form-data`：如果存在`input[type=file]`，则需要使用`form-data`编码格式，窗体数据被编码为一条消息，页上的每个控件对应消息中的一个部分。
  
实际上用的最多的就是`application/x-www-form-urlencoded`了，对于`GET`和`POST`都适用，因此默认情况下不需要设置请求头部；如果需要异步上传图片，需要修改为`multipart/form-data`。

此外还可以设置： 
 * `text/plain`： 窗体数据以纯文本形式进行编码，其中不含任何控件或格式字符。
 * `"application/json"`，原本作为响应头，但是现在许多地方用来作为请求头，但是PHP在后台无法使用`$_REQUEST`获取到对应数据
 
## onreadystatechange
`xhr.readyState`保存xhr实例的状态
* 0: 请求未初始化
* 1: 服务器连接已建立
* 2: 请求已接收
* 3: 请求处理中
* 4: 请求已完成，且响应已就绪

每当`readyState`发生改变时，就会触发`onreadystatechange`事件。
`xhr.status`保存响应状态，常见的是
* `200`，请求成功
* `404`，未找到页面

上面的值均为数字类型，可以使用`===`进行比较。

## response
xhr对象上与响应相关的属性有：
* `response`
* `responseType`，响应的数据类型
* `responseURL`，响应资源路径
* `responseText`，以文本字符串形式返回服务器响应
* `responseXML`， 将响应作为XMLDocument对象返回
