//全局配置
ldvm = {
    // 功能函数相关插件
    "toolsFunc": {},
    // 功能函数相关
    "envFunc": {},
    // 配置相关
    "config": {},
    // 内存相关
    "memory": {},
}
// 是否开启代理
ldvm.config.proxy = false;
// 是否输出日志
ldvm.config.print = true;
// 唯一的属性，标记是否已经代理过
ldvm.memory.symbolProxy = Symbol("proxy");
// 用来保存当前对象上的原型属性
ldvm.memory.symbolData = Symbol("data");
// 存储tag标签
ldvm.memory.tag = [];
// 需要过滤的属性
ldvm.memory.filterProxyProp = [ldvm.memory.symbolProxy, ldvm.memory.symbolData, "eval"];
// 全局变量
ldvm.memory.globalVar = {};
// json格式的cookie
ldvm.memory.globalVar.jsonCookie = {};
//监听事件
ldvm.memory.asyncEvent= {};
//插件功能 相关
!function () {

    // 创建MimeType数组
    ldvm.toolsFunc.createMimeTypeArray = function createMimeTypeArray() {
        let mimeTypeArray = {};
        mimeTypeArray = ldvm.toolsFunc.createProxyObj(mimeTypeArray, MimeTypeArray, "mimeTypeArray");
        ldvm.toolsFunc.setProtoArr.call(mimeTypeArray, "length", 0);
        return mimeTypeArray;
    };

    // 添加MimeType对象
    ldvm.toolsFunc.addMimeType = function (mimeType) {
        let mimeTypeArray = ldvm.memory.globalVar.mimeTypeArray;
        if (mimeTypeArray === undefined) {
            mimeTypeArray = ldvm.toolsFunc.createMimeTypeArray();
        }
        let index = mimeTypeArray.length;
        let flag = true;
        for (let i = 0; i < index; i++) {
            if (mimeTypeArray[i].type === mimeType.type) {
                flag = false;
            }
        }
        if (flag) {
            mimeTypeArray[index] = mimeType;
            Object.defineProperty(mimeTypeArray, mimeType.type, {
                "value": mimeType,
                "writable": false,
                "enumerable": false,
                "configurable": true
            });
            ldvm.toolsFunc.setProtoArr.call(mimeTypeArray, "length", index + 1);
        }
        ldvm.memory.globalVar.mimeTypeArray = mimeTypeArray;
        return mimeTypeArray;
    };

    // 创建MimeType对象
    ldvm.toolsFunc.createMimeType = function (mimeTypeJson, plugin) {
        let mimeType = {}
        mimeType = ldvm.toolsFunc.createProxyObj(mimeType, MimeType, "mimeType");
        ldvm.toolsFunc.setProtoArr.call(mimeType, "description", mimeTypeJson.description);
        ldvm.toolsFunc.setProtoArr.call(mimeType, "suffixes", mimeTypeJson.suffixes);
        ldvm.toolsFunc.setProtoArr.call(mimeType, "type", mimeTypeJson.type);
        ldvm.toolsFunc.setProtoArr.call(mimeType, "enabledPlugin", plugin);
        ldvm.toolsFunc.addMimeType(mimeType);
        return mimeType;
    };

    // 创建plugin数组
    ldvm.toolsFunc.createPluginArray = function createPluginArray() {
        let pluginArray = {};
        pluginArray = ldvm.toolsFunc.createProxyObj(pluginArray, PluginArray, "pluginArray");
        ldvm.toolsFunc.setProtoArr.call(pluginArray, "length", 0);
        return pluginArray;
    }

    // 添加plugin对象
    ldvm.toolsFunc.addPlugin = function addPlugin(plugin) {
        let pluginArray = ldvm.memory.globalVar.pluginArray;
        if (pluginArray === undefined) {
            pluginArray = ldvm.toolsFunc.createPluginArray();
        }
        let index = pluginArray.length;
        pluginArray[index] = plugin;
        Object.defineProperty(pluginArray, plugin.name, {
            "value": plugin,
            "writable": false,
            "enumerable": false,
            "configurable": true
        });
        ldvm.toolsFunc.setProtoArr.call(pluginArray, "length", index + 1);
        ldvm.memory.globalVar.pluginArray = pluginArray;
        return pluginArray;
    }

    //创建plugin
    ldvm.toolsFunc.createPlugin = function createPlugin(data) {
        let mimeTypes = data.mimeTypes;
        let plugin = {};
        plugin = ldvm.toolsFunc.createProxyObj(plugin, Plugin, "plugin");
        ldvm.toolsFunc.setProtoArr.call(plugin, "description", data.description);
        ldvm.toolsFunc.setProtoArr.call(plugin, "name", data.name);
        ldvm.toolsFunc.setProtoArr.call(plugin, "filename", data.filename);
        ldvm.toolsFunc.setProtoArr.call(plugin, "length", mimeTypes.length);

        for (let i = 0; i < mimeTypes.length; i++) {
            let mimeType = ldvm.toolsFunc.createMimeType(mimeTypes[i], plugin);
            plugin[i] = mimeType;
            Object.defineProperty(plugin, mimeTypes[i].type, {
                "value": mimeType,
                "writable": false,
                "enumerable": false,
                "configurable": true
            });

        }

        ldvm.toolsFunc.addPlugin(plugin);
        return plugin;

    }

    /**
     * 分析 url 地址，将解析的结果作为对象返回，返回属性有：
     * 1. href - 完整 URL 地址
     * 2. protocol - 协议
     * 3. username - 用户名
     * 4. password - 密码
     * 5. host - 域名地址
     * 6. hostname - 域名名称
     * 7. port - 端口号
     * 8. path - 路径
     * 9. pathname - 路径名
     * 10. search - 查询参数
     * 11. hash - 哈希值
     * 12. origin
     * 13. searchParams
     * ====================================================
     * @param {String} url - URL地址
     * @param {String} [base] - 基准 URL 地址
     * @returns {Object}
     */
    ldvm.toolsFunc.parseURL = (url = location.href, base) => {
        const pattern = /^(([^:/?#]+):)?\/\/(([^/?#]+):(.+)@)?([^/?#:]*)(:(\d+))?([^?#]*)(\\?([^#]*))?(#(.*))?/
        const getURLSearchParams = (url) => {
            return (url.match(/([^?=&]+)(=([^&]*))/g) || []).reduce((a, v) => {
                return ((a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1)), a)
            }, {})
        }
        let matches,
            hostname,
            port,
            pathname,
            search,
            searchParams

        // url 是为度路径时，忽略 base
        if (/^(([^:/?#]+):)/.test(url)) {
            base = ''
        }

        // 设置了基准 URL
        if (base) {
            // 移除 base 最后的斜杠 ‘/’
            if (/[/]$/.test(base)) {
                base = base.replace(/[/]$/, '')
            }

            // 确保 url 开始有斜杠
            if (!/^[/]/.test(url)) {
                url = '/' + url
            }

            // 保证 URL 地址拼接后是一个正确的格式
            url = base + url
        }

        matches = url.match(pattern)
        hostname = matches[6]
        port = matches[8] || ''
        pathname = matches[11] || '/'
        search = matches[10] || ''
        searchParams = (() => {
            const params = getURLSearchParams(url)

            return {
                get(name) {
                    return params[name] || ''
                }
            }
        })()

        return {
            href: url,
            origin: (matches[1] ? matches[1] + '//' : '') + hostname,
            protocol: matches[2] || '',
            username: matches[4] || '',
            password: matches[5] || '',
            hostname,
            port,
            host: hostname + port,
            pathname,
            search,
            path: pathname + search,
            hash: matches[13] || '',
            searchParams
        }
    }

    ldvm.toolsFunc.getCollection = function getCollection(type) {
        let collection = [];
        for (let i = 0; i < ldvm.memory.tag.length; i++) {
            let tag = ldvm.memory.tag[i];
            if (ldvm.toolsFunc.getType(tag) === type) {
                collection.push(tag);
            }
        }
        return collection;
    }

    //获取原型对象上自身属性值
    ldvm.toolsFunc.getProtoArr = function getProtoArr(key) {
        return this[ldvm.memory.symbolData] && this[ldvm.memory.symbolData][key];
    }

    //设置原型对象上自身属性值
    ldvm.toolsFunc.setProtoArr = function setProtoArr(key, value) {
        if (!(ldvm.memory.symbolData in this)) {
            Object.defineProperty(this, ldvm.memory.symbolData, {
                enumerable: false,
                configurable: false,
                writable: true,
                value: {}
            });
        }
        this[ldvm.memory.symbolData][key] = value;
    }

    //获取一个自增的ID
    ldvm.toolsFunc.getID = function getID() {
        if (ldvm.memory.ID === undefined) {
            ldvm.memory.ID = 0;
        }
        ldvm.memory.ID += 1;
        return ldvm.memory.ID;
    }

    //代理原型对象
    ldvm.toolsFunc.createProxyObj = function createProxyObj(obj, proto, name) {
        Object.setPrototypeOf(obj, proto.prototype);
        return ldvm.toolsFunc.proxy(obj, `${name}_ID(${ldvm.toolsFunc.getID()})`);
    }

    // hook 插件
    ldvm.toolsFunc.hook = function hook(func, funcInfo, isDebug, onEnter, onLeave, isExec) {
        //     func：原函数，需要hook的函数
        //     funcInfo：是一个对象，objName,funcName属性
        //     isDebug：布尔类型，是否进行调试，关键点定位，回溯调用栈
        //     onEnter：函数，原函数执行前执行的函数，改原函数入参，或者输出入参
        //     onLeave：函数，原函数执行完之后执行的函数，改原函数的返回值，或者输出原函数的返回值
        //     isExec：布尔类型，是否执行原函数，比如无限debugger函数
        if (typeof func !== 'function') {
            return func;
        }
        if (funcInfo === undefined) {
            funcInfo = {};
            funcInfo.objName = "globalThis";
            funcInfo.funcName = func.name || '';
        }
        if (isDebug === undefined) {
            isDebug = false;
        }
        if (!onEnter) {
            onEnter = function (obj) {
                console.log(`{hook|${funcInfo.objName}[${funcInfo.funcName}]正在调用，参数是${JSON.stringify(obj.args)}}`);
            }
        }
        if (!onLeave) {
            onLeave = function (obj) {
                console.log(`{hook|${funcInfo.objName}[${funcInfo.funcName}]正在调用，返回值是[${obj.result}]`);
            }
        }
        if (isExec === undefined) {
            isExec = true;
        }
        // 替换的函数
        let hookFunc = function () {
            if (isDebug) {
                debugger;
            }
            let obj = {};
            obj.args = [];
            for (let i = 0; i < arguments.length; i++) {
                obj.args[i] = arguments[i];
            }
            // 原函数执行前
            onEnter.call(this, obj);
            // 原函数正在执行
            let result;
            if (isExec) {
                result = func.apply(this, obj.args);
            }
            obj.result = result;
            // 原函数执行后
            onLeave.call(this, obj);
            // 返回结束
            return obj.result;
        }
        ldvm.toolsFunc.setNative(hookFunc, funcInfo.funcName);
        ldvm.toolsFunc.reNameFunc(hookFunc, funcInfo.funcName);
        return hookFunc;
    }

    //获取类型
    ldvm.toolsFunc.getType = function getType(obj) {
        return Object.prototype.toString.call(obj);
    }

    // 过滤代理属性
    ldvm.toolsFunc.filterProxyProp = function filterProxyProp(prop) {
        for (let i = 0; i < ldvm.memory.filterProxyProp.length; i++) {
            if (ldvm.memory.filterProxyProp[i] === prop) {
                return true;
            }
        }
        return false;
    }

    //proxy代理器
    ldvm.toolsFunc.proxy = function proxy(obj, objName) {
        //    obj 原始对象
        //    objName 原始对象的名字
        if (!ldvm.config.proxy) {
            return obj;
        }
        //判断对象是否已经代理过
        if (ldvm.memory.symbolProxy in obj) {
            return obj[ldvm.memory.symbolProxy];
        }
        let handler = {
            get: function (target, prop, receiver) {
                let result;
                try {
                    result = Reflect.get(target, prop, receiver);
                    if (ldvm.toolsFunc.filterProxyProp(prop)) {
                        return result;
                    }
                    let type = ldvm.toolsFunc.getType(result);
                    if (result instanceof Object) {
                        console.log(`get|obj:[${objName}] -> prop:${prop.toString()}],type:[${type}]}`);
                        // 递归代理
                        result = ldvm.toolsFunc.proxy(result, `${objName}.${prop.toString()}`);
                    } else if (typeof result === "symbol") {
                        console.log(`{get|obj:[${objName}] -> prop:[${prop.toString()}],ret:[${result.toString()}]}`);
                    } else {
                        console.log(`{get|obj:[${objName}] -> prop:[${prop.toString()}],ret:[${result}]}`);
                    }
                } catch (e) {
                    console.log(`{get|obj:[${objName}] -> prop:[${prop.toString()}],error:[${e.message}]}`);
                }
                return result;
            },
            set: function (target, prop, value, receiver) {
                let result;
                try {
                    result = Reflect.set(target, prop, value, receiver);
                    let type = ldvm.toolsFunc.getType(result);
                    if (result instanceof Object) {
                        console.log(`set|obj:[${objName}] -> prop:${prop.toString()}],type:[${type}]}`);
                    } else if (typeof result === "symbol") {
                        console.log(`{set|obj:[${objName}] -> prop:[${prop.toString()}],ret:[${result.toString()}]}`);
                    } else {
                        console.log(`{set|obj:[${objName}] -> prop:[${prop.toString()}],ret:[${result}]}`);
                    }
                } catch (e) {
                    console.log(`{set|obj:[${objName}] -> prop:[${prop.toString()}],error:[${e.message}]}`);
                }
                return result;
            },
            getOwnPropertyDescriptor: function (target, prop) {
                let result;
                try {
                    result = Reflect.getOwnPropertyDescriptor(target, prop);
                    let type = ldvm.toolsFunc.getType(result);
                    if ("constructor" !== prop) {
                        console.log(`getOwnPropertyDescriptor|obj:[${objName}] -> prop:${prop.toString()}],type:[${type}]}`);
                    }
                    // if (typeof result !== "undefined") {
                    //     result = ldvm.toolsFunc.proxy(result, `${objName}.${prop.toString()}.PropertyDescriptor`);
                    // }
                } catch (e) {
                    console.log(`{getOwnPropertyDescriptor|obj:[${objName}] -> prop:[${prop.toString()}],error:[${e.message}]}`);
                }
                return result;
            },
            defineProperty: function (target, prop, descriptor) {
                let result;
                try {
                    result = Reflect.defineProperty(target, prop, descriptor);
                    console.log(`{defineProperty|obj:[${objName}] -> prop:[${prop.toString()}]}`);
                } catch (e) {
                    console.log(`{defineProperty|obj:[${objName}] -> prop:[${prop.toString()}],error:[${e.message}]}`);
                }
                return result;
            },
            apply: function (target, thisArg, argumentsList) {
                let result;
                try {
                    result = Reflect.apply(target, thisArg, argumentsList);


                    let type = ldvm.toolsFunc.getType(result);
                    if (result instanceof Object) {
                        console.log(`{apply|function:[${objName}],args:[${argumentsList}], type:[${type}]}`);
                    } else if (typeof result === "symbol") {
                        console.log(`{apply|function:[${objName}],args:[${argumentsList}],result:[${result.toString()}]}`);
                    } else {
                        console.log(`{apply|function:[${objName}],args:[${argumentsList}], type:[${type}]}`);
                    }
                } catch (e) {
                    console.log(`{apply|function:[${objName}],args:[${argumentsList}],error:[${e.message}]}`);
                }
                return result;
            },
            construct: function (target, argArray, newTarget) {
                let result;
                try {
                    result = Reflect.construct(target, argArray, newTarget);
                    let type = ldvm.toolsFunc.getType(result);
                    console.log(`{construct|function:[${objName}], type:[${type}]}`);
                } catch (e) {
                    console.log(`{construct|function:[${objName}],error:[${e.message}]}`);
                }
                return result;
            },
            deleteProperty: function (target, propKey) {
                let result;
                result = Reflect.deleteProperty(target, propKey);
                console.log(`{deleteProperty|obj:[${objName}] -> prop:[${propKey.toString()}],result:[${result}]}`);
                return result;
            },
            has: function (target, propKey) {
                let result = Reflect.has(target, propKey);
                if (propKey !== ldvm.memory.symbolProxy) {
                    console.log(`{has|obj:[${objName}] -> prop:[${propKey.toString()}],result:[${result}]}`);
                }
                return result;
            },
            ownKeys: function (target) {
                let result;
                result = Reflect.ownKeys(target);
                console.log(`{ownKeys|obj:[${objName}]}`);
                return result;
            },
            getPrototypeOf: function (target) {
                let result = Reflect.getPrototypeOf(target);
                console.log(`{getPrototypeOf|obj:[${objName}]}`);
                return result;
            },
            setPrototypeOf: function (target, proto) {
                let result = Reflect.setPrototypeOf(target, proto);
                console.log(`{setPrototypeOf|obj:[${objName}]}`);
                return result;
            },
            preventExtensions: function (target) {
                let result = Reflect.preventExtensions(target);
                console.log(`{preventExtensions|obj:[${objName}]}`);
                return result;
            },
            isExtensible: function (target) {
                let result = Reflect.isExtensible(target);
                console.log(`{isExtensible|obj:[${objName}]}`);
                return result;
            },
        };

        let proxyObj = new Proxy(obj, handler);

        Object.defineProperty(obj, ldvm.memory.symbolProxy, {
            configurable: false,
            enumerable: false,
            writable: false,
            value: proxyObj
        });

        return proxyObj;

    }

    //env函数分发器
    ldvm.toolsFunc.dispatch = function dispatch(self, obj, objName, funcName, argList, defaultValue) {
        let name = `${objName}_${funcName}`;
        if (Object.getOwnPropertyDescriptor(obj, "constructor") !== undefined) {
            if (Object.getOwnPropertyDescriptor(self, "constructor") !== undefined) {
                // self 不是实例对象
                return ldvm.toolsFunc.throwError('TypeError', 'Illegal invocation');
            }
        }
        try {
            return ldvm.envFunc[name].apply(self, argList);
        } catch (e) {
            if (defaultValue === undefined) {
                console.log(`[${name}]正在执行，错误信息：${e.message}`);
            }
            return defaultValue;
        }
    }

    // 定义对象属性defineProperty
    ldvm.toolsFunc.defineProperty = function defineProperty(obj, prop, oldDescriptor) {
        let newDescriptor = {};
        newDescriptor.configurable = ldvm.config.proxy || oldDescriptor.configurable;//如果开启代理必须是true
        newDescriptor.enumerable = oldDescriptor.enumerable;
        if (oldDescriptor.hasOwnProperty("writable")) {
            newDescriptor.writable = ldvm.config.proxy || oldDescriptor.writable;
        }
        if (oldDescriptor.hasOwnProperty("value")) {
            let value = oldDescriptor.value;
            if (typeof value === "function") {
                ldvm.toolsFunc.safeFunc(value, prop);
            }
            newDescriptor.value = value;
        }
        if (oldDescriptor.hasOwnProperty("get")) {
            let get = oldDescriptor.get;
            if (typeof get === "function") {
                ldvm.toolsFunc.safeFunc(get, `get ${prop}`);
            }
            newDescriptor.get = get;
        }
        if (oldDescriptor.hasOwnProperty("set")) {
            let set = oldDescriptor.set;
            if (typeof set === "function") {
                ldvm.toolsFunc.safeFunc(set, `set ${prop}`);
            }
            newDescriptor.set = set;
        }
        Object.defineProperty(obj, prop, newDescriptor);
    }

    // 函数native化
    !function () {
        const $toString = Function.prototype.toString;
        const symbol = Symbol();
        const myToString = function () {
            return typeof this === 'function' && this[symbol] || $toString.call(this);
        }

        function set_native(func, key, value) {
            Object.defineProperty(func, key, {
                configurable: true,
                enumerable: false,
                value: value,
                writable: true
            });
        }

        delete Function.prototype.toString();
        set_native(Function.prototype, "toString", myToString);
        set_native(Function.prototype.toString, symbol, "function toString() { [native code] }");
        ldvm.toolsFunc.setNative = function (func, funcname) {
            set_native(func, symbol, `function ${funcname || func.name || ''}() { [native code] }`);
        }
    }();

    // 对象重命名
    ldvm.toolsFunc.reNameObj = function reNameObj(obj, name) {
        Object.defineProperty(obj.prototype, Symbol.toStringTag, {
            configurable: true,
            enumerable: false,
            value: name,
            writable: false
        })
    }

    // 函数重命名
    ldvm.toolsFunc.reNameFunc = function reNameFunc(func, name) {
        Object.defineProperty(func, "name", {
            configurable: true,
            enumerable: false,
            value: name,
            writable: false
        })
    }

    // 抛错函数
    ldvm.toolsFunc.throwError = function throwError(name, message) {
        let e = new Error();
        e.name = name;
        e.message = message;
        e.stack = `TypeError: ${message}\n at snippet://`;
        throw e;
    }

    // 保护函数
    ldvm.toolsFunc.safeFunc = function safeFunc(func, name) {
        ldvm.toolsFunc.setNative(func, name);
        ldvm.toolsFunc.reNameFunc(func, name);
    }

    // 保护原型
    ldvm.toolsFunc.safeProto = function safeProto(obj, name) {
        ldvm.toolsFunc.setNative(obj, name);
        ldvm.toolsFunc.reNameObj(obj, name);
    }

    // base64加密解密
    ldvm.toolsFunc.base64 = {};

    ldvm.toolsFunc.base64.base64Chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    ldvm.toolsFunc.base64.base64encode = function base64encode(originalText) {
        let encodedText = "";
        let buffer = 0;
        let bufferLength = 0;

        for (let i = 0; i < originalText.length; i++) {
            buffer = (buffer << 8) | originalText.charCodeAt(i);
            bufferLength += 8;

            while (bufferLength >= 6) {
                bufferLength -= 6;
                const index = (buffer >> bufferLength) & 0x3f;
                encodedText += ldvm.toolsFunc.base64.base64Chars.charAt(index);
            }
        }

        // 处理最后剩余的不足6位的情况
        if (bufferLength > 0) {
            buffer <<= 6 - bufferLength;
            const index = buffer & 0x3f;
            encodedText += ldvm.toolsFunc.base64.base64Chars.charAt(index);
        }

        // 添加填充字符
        while (encodedText.length % 4 !== 0) {
            encodedText += "=";
        }

        return encodedText;
    }

    ldvm.toolsFunc.base64.base64decode = function base64decode(encodedText) {
        let decodedText = "";
        let buffer = 0;
        let bufferLength = 0;

        for (let i = 0; i < encodedText.length; i++) {
            const char = encodedText.charAt(i);
            const charCode = ldvm.toolsFunc.base64.base64Chars.indexOf(char);

            if (charCode === -1 || char === "=") {
                break;
            }

            buffer = (buffer << 6) | charCode;
            bufferLength += 6;

            if (bufferLength >= 8) {
                bufferLength -= 8;
                const decodedChar = (buffer >> bufferLength) & 0xff;
                decodedText += String.fromCharCode(decodedChar);
            }
        }

        return decodedText;
    };

}();

//浏览器接口的具体实现
!function () {
    ldvm.envFunc.HTMLCanvasElement_getContext = function HTMLCanvasElement_getContext() {
        let type = arguments[0];
        let context = {};
        switch (type) {
            case "2d":
                context = ldvm.toolsFunc.createProxyObj(context, CanvasRenderingContext2D, "context_2d");
                break;
            case "experimental-webgl":
                context = ldvm.toolsFunc.createProxyObj(context, WebGLRenderingContext, "webgl");
                break;
            default:
                console.log(`HTMLCanvasElement_getContext_${type}未实现`);
                break;
        }
    }
    ldvm.envFunc.EventTarget_addEventListener = function EventTarget_addEventListener() {
        let type = arguments[0];
        let listener = arguments[1];
        let options = arguments[2];
        let event = {
            "self": this,
            "type": type,
            "listener": listener,
            "options": options
        }
        if (ldvm.memory.asyncEvent.listener === undefined) {
            ldvm.memory.asyncEvent.listener = {};
        }
        if (ldvm.memory.asyncEvent.listener[type] === undefined) {
            ldvm.memory.asyncEvent.listener[type] = [];
        }
        ldvm.memory.asyncEvent.listener[type].push(event);
    }
    ldvm.envFunc.MimeTypeArray_namedItem = function MimeTypeArray_namedItem() {
        let name = arguments[0];
        return this[name];
    }
    ldvm.envFunc.MimeTypeArray_item = function MimeTypeArray_item() {
        let index = arguments[0];
        return this[index];
    }
    ldvm.envFunc.Plugin_namedItem = function Plugin_namedItem() {
        let name = arguments[0];
        return this[name];
    }
    ldvm.envFunc.Plugin_item = function Plugin_item() {
        let index = arguments[0];
        return this[index];
    }
    ldvm.envFunc.PluginArray_namedItem = function PluginArray_namedItem() {
        let name = arguments[0];
        return this[name];
    }
    ldvm.envFunc.PluginArray_item = function PluginArray_item() {
        let index = arguments[0];
        return this[index];
    }
    ldvm.envFunc.Navigator_mimeTypes_get = function Navigator_mimeTypes_get() {
        return ldvm.memory.globalVar.mimeTypeArray;
    }
    ldvm.envFunc.MimeType_suffixes_get = function MimeType_suffixes_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "suffixes");
    }
    ldvm.envFunc.MimeType_description_get = function MimeType_description_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "description");
    }
    ldvm.envFunc.MimeType_enabledPlugin_get = function MimeType_enabledPlugin_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "enabledPlugin");
    }
    ldvm.envFunc.Plugin_length_get = function Plugin_length_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "length");
    }
    ldvm.envFunc.Plugin_filename_get = function Plugin_filename_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "filename");
    }
    ldvm.envFunc.Plugin_description_get = function Plugin_description_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "description");
    }
    ldvm.envFunc.Plugin_name_get = function Plugin_name_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "name");
    }
    ldvm.envFunc.MimeType_type_get = function MimeType_type_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "type");
    }
    ldvm.envFunc.PluginArray_length_get = function PluginArray_length_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "length");
    }
    ldvm.envFunc.MimeTypeArray_length_get = function MimeTypeArray_length_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "length");
    }
    ldvm.envFunc.Navigator_plugins_get = function Navigator_plugins_get() {
        return ldvm.memory.globalVar.pluginArray;
    }
    ldvm.envFunc.HTMLAnchorElement_protocol_get = function HTMLAnchorElement_protocol_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "protocol");
    }

    ldvm.envFunc.HTMLAnchorElement_href_get = function HTMLAnchorElement_href_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "href");
    }

    ldvm.envFunc.HTMLAnchorElement_href_set = function HTMLAnchorElement_href_set() {
        let url = arguments[0];
        if (url.indexOf("http") === -1) {
            url = location.protocol + "//" + location.hostname + url;
        }
        let jsonUrl = ldvm.toolsFunc.parseURL(url);
        ldvm.toolsFunc.setProtoArr.call(this, "origin", jsonUrl["origin"]);
        ldvm.toolsFunc.setProtoArr.call(this, "protocol", jsonUrl["protocol"]);
        ldvm.toolsFunc.setProtoArr.call(this, "host", jsonUrl["host"]);
        ldvm.toolsFunc.setProtoArr.call(this, "hostname", jsonUrl["hostname"]);
        ldvm.toolsFunc.setProtoArr.call(this, "port", jsonUrl["port"]);
        ldvm.toolsFunc.setProtoArr.call(this, "path", jsonUrl["path"]);
        ldvm.toolsFunc.setProtoArr.call(this, "pathname", jsonUrl["pathname"]);
        ldvm.toolsFunc.setProtoArr.call(this, "search", jsonUrl["search"]);
        ldvm.toolsFunc.setProtoArr.call(this, "hash", jsonUrl["hash"]);
        ldvm.toolsFunc.setProtoArr.call(this, "href", jsonUrl["href"]);

    }

    ldvm.envFunc.location_hostname_get = function location_hostname_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "hostname");
    }

    ldvm.envFunc.location_hostname_set = function location_hostname_set() {
        let value = arguments[0];
        ldvm.toolsFunc.setProtoArr.call(this, "hostname", value);
    }

    ldvm.envFunc.location_protocol_get = function location_protocol_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "protocol");
    }

    ldvm.envFunc.location_protocol_set = function location_protocol_set() {
        let value = arguments[0];
        ldvm.toolsFunc.setProtoArr.call(this, "protocol", value);
    }

    ldvm.envFunc.HTMLInputElement_value_get = function HTMLInputElement_value_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "value");
    }

    ldvm.envFunc.HTMLInputElement_value_set = function HTMLInputElement_value_set() {
        let value = arguments[0];
        ldvm.toolsFunc.setProtoArr.call(this, "value", value);
    }

    ldvm.envFunc.HTMLInputElement_name_get = function HTMLInputElement_name_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "name");
    }

    ldvm.envFunc.HTMLInputElement_name_set = function HTMLInputElement_name_set() {
        let value = arguments[0];
        ldvm.toolsFunc.setProtoArr.call(this, "name", value);
    }

    ldvm.envFunc.Element_id_get = function Element_id_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "id");
    }

    ldvm.envFunc.Element_id_set = function Element_id_set() {
        let value = arguments[0];
        ldvm.toolsFunc.setProtoArr.call(this, "id", value);
    }

    ldvm.envFunc.HTMLInputElement_type_get = function HTMLInputElement_type_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "type");
    }

    ldvm.envFunc.HTMLInputElement_type_set = function HTMLInputElement_type_set() {
        let value = arguments[0];
        ldvm.toolsFunc.setProtoArr.call(this, "type", value);
    }

    ldvm.envFunc.Node_removeChild = function Node_removeChild() {
    }

    ldvm.envFunc.Node_parentNode_get = function Node_parentNode_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "parentNode");
    }

    ldvm.envFunc.HTMLMetaElement_content_set = function HTMLMetaElement_content_set() {
        let value = arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this, "content", value);
    }

    ldvm.envFunc.HTMLMetaElement_content_get = function HTMLMetaElement_content_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "content");
    }

    ldvm.envFunc.HTMLDivElement_align_get = function HTMLDivElement_align_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "align");
    }

    ldvm.envFunc.HTMLDivElement_align_set = function HTMLDivElement_align_set() {
        let value = arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this, "align", value);
    }

    ldvm.envFunc.Storage_setItem = function Storage_setItem() {
        let keyName = arguments[0];
        let keyValue = arguments[1];
        this[keyName] = keyValue;
    }

    ldvm.envFunc.Storage_getItem = function Storage_getItem() {
        let key = arguments[0];
        if (key in this) {
            return this[key];
        }
        return null;
    }

    ldvm.envFunc.Storage_removeItem = function Storage_removeItem() {
        let key = arguments[0];
        delete this[key];
    }

    ldvm.envFunc.Storage_key = function Storage_key() {
        let index = arguments[0];
        let i = 0;
        for (const key in this) {
            if (index === i) {
                return key;
            }
            i++;
        }
        return null;
    }

    ldvm.envFunc.Storage_clear = function Storage_clear() {
        for (const key in this) {
            delete this[key];
        }
    }

    ldvm.envFunc.Storage_length_get = function Storage_clear() {
        let i = 0;
        for (const key in Object.getOwnPropertyDescriptors(this)) {
            i++;
        }
        return i;
    }

    ldvm.envFunc.window_self_get = function window_self_get() {
        return window;
    }

    ldvm.envFunc.window_self_set = function window_self_set() {
        return window;
    }

    ldvm.envFunc.window_top_get = function window_top_get() {
        return window;
    }

    ldvm.envFunc.window_location_get = function window_location_get() {
        return window;
    }

    ldvm.envFunc.window_location_set = function window_location_set() {
        return window;
    }

    ldvm.envFunc.Document_createElement = function Document_createElement() {
        let tagName = arguments[0].toLowerCase();
        let options = arguments[1];
        let tag = {};
        switch (tagName) {
            case "div":
                tag = ldvm.toolsFunc.createProxyObj(tag, HTMLDivElement, `Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break;
            case "meta":
                tag = ldvm.toolsFunc.createProxyObj(tag, HTMLMetaElement, `Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break;
            case "head":
                tag = ldvm.toolsFunc.createProxyObj(tag, HTMLHeadElement, `Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break;
            case "input":
                tag = ldvm.toolsFunc.createProxyObj(tag, HTMLInputElement, `Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break;
            case "a":
                tag = ldvm.toolsFunc.createProxyObj(tag, HTMLAnchorElement, `Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break;
            case "canvas":
                tag = ldvm.toolsFunc.createProxyObj(tag, HTMLCanvasElement, `Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break;
            case "img":
                tag = ldvm.toolsFunc.createProxyObj(tag, HTMLImageElement, `Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break;
            default:
                console.log(`Document_createElement_${tagName}未实现`);
                break;
        }
        return tag;
    }

    ldvm.envFunc.Document_getElementsByTagName = function Document_getElementsByTagName() {
        let tagName = arguments[0].toLowerCase();
        let collection = {};
        switch (tagName) {
            case "meta":
                collection = ldvm.toolsFunc.getCollection('[object HTMLMetaElement]');
                collection = ldvm.toolsFunc.createProxyObj(collection, HTMLCollection, `Document_getElementsByTagName_${tagName}`);
                break;
            default:
                console.log(`Document_getElementsByTagName_${tagName}未实现`);
                break;
        }
        return collection;
    }

    ldvm.envFunc.Document_write = function Document_write() {
        let tagStr = arguments[0];
        let tagJson = {
            "type": "input",
            "prop": {
                "type": "hidden",
                "id": "test",
                "name": "inputTag",
                "value": "666"
            }
        }
        let tag = document.createElement(tagJson.type);
        for (const key in tagJson.prop) {
            tag[key] = tagJson.prop[key];
            if (tag[key] === undefined) {
                ldvm.toolsFunc.setProtoArr.call(tag, key, tagJson.prop[key]);
            }
        }
    }

    ldvm.envFunc.Document_getElementById = function Document_getElementById() {
        let id = arguments[0];
        let tags = ldvm.memory.tag;
        for (let i = 0; i < tags.length; i++) {
            if (tags[i].id === id) {
                return tags[i];
            }
        }
        return null;
    }

    ldvm.envFunc.Document_cookie_get = function Document_cookie_get() {
        let jsonCookie = ldvm.memory.globalVar.jsonCookie;
        let tempCookie = "";
        for (const key in jsonCookie) {
            if (key === "") {
                tempCookie += `${jsonCookie[key]};`;
            } else {
                tempCookie += `${key}=${jsonCookie[key]};`;
            }
        }
        return tempCookie;
    }

    ldvm.envFunc.Document_cookie_set = function Document_cookie_set() {
        let cookieValue = arguments[0];
        let index = cookieValue.indexOf(";");
        if (index !== -1) {
            cookieValue = cookieValue.substring(0, index);
        }
        if (cookieValue.indexOf("=") === -1) {
            ldvm.memory.globalVar.jsonCookie[""] = cookieValue.trim();
        } else {
            let item = cookieValue.split("=");
            let k = item[0];
            let v = item[1];
            ldvm.memory.globalVar.jsonCookie[k] = v;
        }
    }
    ldvm.envFunc.Document_cookie_get = function Document_cookie_get() {
        let jsonCookie = ldvm.memory.globalVar.jsonCookie;
        let tempCookie = "";
        for (const key in jsonCookie) {
            if (key === "") {
                tempCookie += `${jsonCookie[key]};`;
            } else {
                tempCookie += `${key}=${jsonCookie[key]};`;
            }
        }
        return tempCookie;
    }

    ldvm.envFunc.Document_body_get = function Document_body_get() {
        return {};
    }
    ldvm.envFunc.Document_head_get = function Document_head_get() {
        return {};
    }
    ldvm.envFunc.Document_documentElement_get = function Document_documentElement_get() {
        return {};
    }
    ldvm.envFunc.Document_compatMode_get = function Document_documentElement_get() {
        return 'CSS1Compat';
    }
    ldvm.envFunc.Screen_width_get = function Screen_width_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "width");
    }
    ldvm.envFunc.Screen_height_get = function Screen_height_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "height");
    }

    ldvm.envFunc.HTMLImageElement_src_set = function HTMLImageElement_src_set() {
        let src = arguments[0];
        ldvm.toolsFunc.setProtoArr.call(this, "src", src);
    }
    ldvm.envFunc.HTMLImageElement_src_get = function HTMLImageElement_src_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "src");
    }

}();

//env相关代码
// EventTarget 对象
EventTarget = function EventTarget(){}
ldvm.toolsFunc.safeProto(EventTarget, "EventTarget");
ldvm.toolsFunc.defineProperty(EventTarget.prototype,"addEventListener",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, EventTarget.prototype, "EventTarget", "addEventListener", arguments)}});
ldvm.toolsFunc.defineProperty(EventTarget.prototype,"dispatchEvent",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, EventTarget.prototype, "EventTarget", "dispatchEvent", arguments)}});
ldvm.toolsFunc.defineProperty(EventTarget.prototype,"removeEventListener",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, EventTarget.prototype, "EventTarget", "removeEventListener", arguments)}});

//WindowProperties对象
WindowProperties = function WindowProperties() {

}
//保护原型
ldvm.toolsFunc.safeProto(WindowProperties,"WindowProperties");
//删除构造函数
delete WindowProperties.prototype.constructor;
Object.setPrototypeOf(WindowProperties.prototype,EventTarget.prototype);
// Window 对象
Window = function Window(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(Window, "Window");
Object.setPrototypeOf(Window.prototype, WindowProperties.prototype);
ldvm.toolsFunc.defineProperty(Window,"TEMPORARY",{configurable:false,enumerable:true,writable:false,value:0});
ldvm.toolsFunc.defineProperty(Window,"PERSISTENT",{configurable:false,enumerable:true,writable:false,value:1});
ldvm.toolsFunc.defineProperty(Window.prototype,"TEMPORARY",{configurable:false,enumerable:true,writable:false,value:0});
ldvm.toolsFunc.defineProperty(Window.prototype,"PERSISTENT",{configurable:false,enumerable:true,writable:false,value:1});

// Location 对象
Location = function Location(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(Location, "Location");

// location对象
location = {}
Object.setPrototypeOf(location,Location.prototype);
ldvm.toolsFunc.defineProperty(location,"valueOf",{configurable:false,enumerable:false,writable:false,value: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "valueOf", arguments)}});
ldvm.toolsFunc.defineProperty(location,"ancestorOrigins",{configurable:false,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "ancestorOrigins_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(location,"href",{configurable:false,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "href_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "href_set", arguments)}});
ldvm.toolsFunc.defineProperty(location,"origin",{configurable:false,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "origin_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(location,"protocol",{configurable:false,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "protocol_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "protocol_set", arguments)}});
ldvm.toolsFunc.defineProperty(location,"host",{configurable:false,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "host_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "host_set", arguments)}});
ldvm.toolsFunc.defineProperty(location,"hostname",{configurable:false,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "hostname_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "hostname_set", arguments)}});
ldvm.toolsFunc.defineProperty(location,"port",{configurable:false,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "port_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "port_set", arguments)}});
ldvm.toolsFunc.defineProperty(location,"pathname",{configurable:false,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "pathname_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "pathname_set", arguments)}});
ldvm.toolsFunc.defineProperty(location,"search",{configurable:false,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "search_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "search_set", arguments)}});
ldvm.toolsFunc.defineProperty(location,"hash",{configurable:false,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "hash_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "hash_set", arguments)}});
ldvm.toolsFunc.defineProperty(location,"assign",{configurable:false,enumerable:true,writable:false,value: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "assign", arguments)}});
ldvm.toolsFunc.defineProperty(location,"reload",{configurable:false,enumerable:true,writable:false,value: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "reload", arguments)}});
ldvm.toolsFunc.defineProperty(location,"replace",{configurable:false,enumerable:true,writable:false,value: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "replace", arguments)}});
ldvm.toolsFunc.defineProperty(location,"toString",{configurable:false,enumerable:true,writable:false,value: function () { return ldvm.toolsFunc.dispatch(this, location, "location", "toString", arguments)}});



// Node 对象
Node = function Node(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(Node, "Node");
Object.setPrototypeOf(Node.prototype, EventTarget.prototype);
ldvm.toolsFunc.defineProperty(Node,"ELEMENT_NODE",{configurable:false,enumerable:true,writable:false,value:1});
ldvm.toolsFunc.defineProperty(Node,"ATTRIBUTE_NODE",{configurable:false,enumerable:true,writable:false,value:2});
ldvm.toolsFunc.defineProperty(Node,"TEXT_NODE",{configurable:false,enumerable:true,writable:false,value:3});
ldvm.toolsFunc.defineProperty(Node,"CDATA_SECTION_NODE",{configurable:false,enumerable:true,writable:false,value:4});
ldvm.toolsFunc.defineProperty(Node,"ENTITY_REFERENCE_NODE",{configurable:false,enumerable:true,writable:false,value:5});
ldvm.toolsFunc.defineProperty(Node,"ENTITY_NODE",{configurable:false,enumerable:true,writable:false,value:6});
ldvm.toolsFunc.defineProperty(Node,"PROCESSING_INSTRUCTION_NODE",{configurable:false,enumerable:true,writable:false,value:7});
ldvm.toolsFunc.defineProperty(Node,"COMMENT_NODE",{configurable:false,enumerable:true,writable:false,value:8});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_NODE",{configurable:false,enumerable:true,writable:false,value:9});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_TYPE_NODE",{configurable:false,enumerable:true,writable:false,value:10});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_FRAGMENT_NODE",{configurable:false,enumerable:true,writable:false,value:11});
ldvm.toolsFunc.defineProperty(Node,"NOTATION_NODE",{configurable:false,enumerable:true,writable:false,value:12});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_POSITION_DISCONNECTED",{configurable:false,enumerable:true,writable:false,value:1});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_POSITION_PRECEDING",{configurable:false,enumerable:true,writable:false,value:2});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_POSITION_FOLLOWING",{configurable:false,enumerable:true,writable:false,value:4});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_POSITION_CONTAINS",{configurable:false,enumerable:true,writable:false,value:8});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_POSITION_CONTAINED_BY",{configurable:false,enumerable:true,writable:false,value:16});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC",{configurable:false,enumerable:true,writable:false,value:32});
ldvm.toolsFunc.defineProperty(Node.prototype,"nodeType",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "nodeType_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"nodeName",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "nodeName_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"baseURI",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "baseURI_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"isConnected",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "isConnected_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"ownerDocument",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "ownerDocument_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"parentNode",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "parentNode_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"parentElement",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "parentElement_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"childNodes",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "childNodes_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"firstChild",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "firstChild_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"lastChild",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "lastChild_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"previousSibling",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "previousSibling_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"nextSibling",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "nextSibling_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"nodeValue",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "nodeValue_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "nodeValue_set", arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"textContent",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "textContent_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "textContent_set", arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"ELEMENT_NODE",{configurable:false,enumerable:true,writable:false,value:1});
ldvm.toolsFunc.defineProperty(Node.prototype,"ATTRIBUTE_NODE",{configurable:false,enumerable:true,writable:false,value:2});
ldvm.toolsFunc.defineProperty(Node.prototype,"TEXT_NODE",{configurable:false,enumerable:true,writable:false,value:3});
ldvm.toolsFunc.defineProperty(Node.prototype,"CDATA_SECTION_NODE",{configurable:false,enumerable:true,writable:false,value:4});
ldvm.toolsFunc.defineProperty(Node.prototype,"ENTITY_REFERENCE_NODE",{configurable:false,enumerable:true,writable:false,value:5});
ldvm.toolsFunc.defineProperty(Node.prototype,"ENTITY_NODE",{configurable:false,enumerable:true,writable:false,value:6});
ldvm.toolsFunc.defineProperty(Node.prototype,"PROCESSING_INSTRUCTION_NODE",{configurable:false,enumerable:true,writable:false,value:7});
ldvm.toolsFunc.defineProperty(Node.prototype,"COMMENT_NODE",{configurable:false,enumerable:true,writable:false,value:8});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_NODE",{configurable:false,enumerable:true,writable:false,value:9});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_TYPE_NODE",{configurable:false,enumerable:true,writable:false,value:10});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_FRAGMENT_NODE",{configurable:false,enumerable:true,writable:false,value:11});
ldvm.toolsFunc.defineProperty(Node.prototype,"NOTATION_NODE",{configurable:false,enumerable:true,writable:false,value:12});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_POSITION_DISCONNECTED",{configurable:false,enumerable:true,writable:false,value:1});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_POSITION_PRECEDING",{configurable:false,enumerable:true,writable:false,value:2});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_POSITION_FOLLOWING",{configurable:false,enumerable:true,writable:false,value:4});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_POSITION_CONTAINS",{configurable:false,enumerable:true,writable:false,value:8});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_POSITION_CONTAINED_BY",{configurable:false,enumerable:true,writable:false,value:16});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC",{configurable:false,enumerable:true,writable:false,value:32});
ldvm.toolsFunc.defineProperty(Node.prototype,"appendChild",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "appendChild", arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"cloneNode",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "cloneNode", arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"compareDocumentPosition",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "compareDocumentPosition", arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"contains",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "contains", arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"getRootNode",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "getRootNode", arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"hasChildNodes",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "hasChildNodes", arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"insertBefore",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "insertBefore", arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"isDefaultNamespace",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "isDefaultNamespace", arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"isEqualNode",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "isEqualNode", arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"isSameNode",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "isSameNode", arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"lookupNamespaceURI",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "lookupNamespaceURI", arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"lookupPrefix",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "lookupPrefix", arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"normalize",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "normalize", arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"removeChild",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "removeChild", arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"replaceChild",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "replaceChild", arguments)}});

// Element 对象
Element = function Element(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(Element, "Element");
Object.setPrototypeOf(Element.prototype, Node.prototype);
ldvm.toolsFunc.defineProperty(Element.prototype,"namespaceURI",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "namespaceURI_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"prefix",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "prefix_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"localName",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "localName_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"tagName",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "tagName_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"id",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "id_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "id_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"className",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "className_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "className_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"classList",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "classList_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "classList_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"slot",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "slot_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "slot_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"attributes",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "attributes_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"shadowRoot",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "shadowRoot_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"part",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "part_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "part_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"assignedSlot",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "assignedSlot_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"innerHTML",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "innerHTML_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "innerHTML_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"outerHTML",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "outerHTML_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "outerHTML_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"scrollTop",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollTop_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollTop_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"scrollLeft",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollLeft_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollLeft_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"scrollWidth",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollWidth_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"scrollHeight",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollHeight_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"clientTop",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "clientTop_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"clientLeft",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "clientLeft_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"clientWidth",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "clientWidth_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"clientHeight",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "clientHeight_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"onbeforecopy",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onbeforecopy_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onbeforecopy_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"onbeforecut",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onbeforecut_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onbeforecut_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"onbeforepaste",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onbeforepaste_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onbeforepaste_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"onsearch",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onsearch_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onsearch_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"elementTiming",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "elementTiming_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "elementTiming_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"onfullscreenchange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onfullscreenchange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onfullscreenchange_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"onfullscreenerror",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onfullscreenerror_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onfullscreenerror_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"onwebkitfullscreenchange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onwebkitfullscreenchange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onwebkitfullscreenchange_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"onwebkitfullscreenerror",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onwebkitfullscreenerror_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onwebkitfullscreenerror_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"role",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "role_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "role_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaAtomic",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaAtomic_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaAtomic_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaAutoComplete",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaAutoComplete_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaAutoComplete_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaBusy",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaBusy_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaBusy_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaBrailleLabel",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaBrailleLabel_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaBrailleLabel_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaBrailleRoleDescription",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaBrailleRoleDescription_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaBrailleRoleDescription_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaChecked",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaChecked_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaChecked_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaColCount",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaColCount_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaColCount_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaColIndex",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaColIndex_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaColIndex_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaColSpan",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaColSpan_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaColSpan_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaCurrent",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaCurrent_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaCurrent_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaDescription",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaDescription_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaDescription_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaDisabled",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaDisabled_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaDisabled_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaExpanded",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaExpanded_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaExpanded_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaHasPopup",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaHasPopup_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaHasPopup_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaHidden",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaHidden_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaHidden_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaInvalid",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaInvalid_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaInvalid_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaKeyShortcuts",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaKeyShortcuts_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaKeyShortcuts_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaLabel",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaLabel_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaLabel_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaLevel",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaLevel_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaLevel_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaLive",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaLive_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaLive_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaModal",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaModal_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaModal_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaMultiLine",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaMultiLine_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaMultiLine_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaMultiSelectable",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaMultiSelectable_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaMultiSelectable_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaOrientation",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaOrientation_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaOrientation_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaPlaceholder",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaPlaceholder_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaPlaceholder_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaPosInSet",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaPosInSet_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaPosInSet_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaPressed",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaPressed_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaPressed_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaReadOnly",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaReadOnly_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaReadOnly_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaRelevant",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRelevant_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRelevant_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaRequired",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRequired_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRequired_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaRoleDescription",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRoleDescription_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRoleDescription_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaRowCount",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRowCount_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRowCount_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaRowIndex",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRowIndex_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRowIndex_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaRowSpan",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRowSpan_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRowSpan_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaSelected",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaSelected_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaSelected_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaSetSize",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaSetSize_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaSetSize_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaSort",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaSort_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaSort_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaValueMax",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaValueMax_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaValueMax_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaValueMin",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaValueMin_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaValueMin_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaValueNow",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaValueNow_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaValueNow_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaValueText",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaValueText_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaValueText_set", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"children",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "children_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"firstElementChild",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "firstElementChild_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"lastElementChild",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "lastElementChild_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"childElementCount",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "childElementCount_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"previousElementSibling",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "previousElementSibling_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"nextElementSibling",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "nextElementSibling_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"after",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "after", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"animate",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "animate", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"append",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "append", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"attachShadow",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "attachShadow", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"before",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "before", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"checkVisibility",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "checkVisibility", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"closest",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "closest", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"computedStyleMap",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "computedStyleMap", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getAnimations",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getAnimations", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getAttribute",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getAttribute", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getAttributeNS",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getAttributeNS", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getAttributeNames",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getAttributeNames", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getAttributeNode",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getAttributeNode", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getAttributeNodeNS",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getAttributeNodeNS", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getBoundingClientRect",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getBoundingClientRect", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getClientRects",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getClientRects", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getElementsByClassName",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getElementsByClassName", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getElementsByTagName",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getElementsByTagName", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getElementsByTagNameNS",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getElementsByTagNameNS", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getInnerHTML",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getInnerHTML", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"hasAttribute",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "hasAttribute", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"hasAttributeNS",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "hasAttributeNS", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"hasAttributes",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "hasAttributes", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"hasPointerCapture",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "hasPointerCapture", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"insertAdjacentElement",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "insertAdjacentElement", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"insertAdjacentHTML",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "insertAdjacentHTML", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"insertAdjacentText",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "insertAdjacentText", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"matches",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "matches", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"prepend",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "prepend", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"querySelector",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "querySelector", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"querySelectorAll",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "querySelectorAll", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"releasePointerCapture",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "releasePointerCapture", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"remove",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "remove", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"removeAttribute",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "removeAttribute", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"removeAttributeNS",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "removeAttributeNS", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"removeAttributeNode",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "removeAttributeNode", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"replaceChildren",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "replaceChildren", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"replaceWith",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "replaceWith", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"requestFullscreen",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "requestFullscreen", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"requestPointerLock",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "requestPointerLock", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"scroll",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scroll", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"scrollBy",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollBy", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"scrollIntoView",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollIntoView", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"scrollIntoViewIfNeeded",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollIntoViewIfNeeded", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"scrollTo",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollTo", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"setAttribute",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "setAttribute", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"setAttributeNS",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "setAttributeNS", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"setAttributeNode",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "setAttributeNode", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"setAttributeNodeNS",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "setAttributeNodeNS", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"setPointerCapture",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "setPointerCapture", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"toggleAttribute",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "toggleAttribute", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"webkitMatchesSelector",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "webkitMatchesSelector", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"webkitRequestFullScreen",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "webkitRequestFullScreen", arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"webkitRequestFullscreen",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "webkitRequestFullscreen", arguments)}});

// HTMLElement 对象
HTMLElement = function HTMLElement(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLElement, "HTMLElement");
Object.setPrototypeOf(HTMLElement.prototype, Element.prototype);
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"title",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "title_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "title_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"lang",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "lang_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "lang_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"translate",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "translate_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "translate_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"dir",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "dir_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "dir_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"hidden",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "hidden_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "hidden_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"accessKey",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "accessKey_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "accessKey_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"draggable",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "draggable_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "draggable_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"spellcheck",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "spellcheck_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "spellcheck_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"autocapitalize",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "autocapitalize_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "autocapitalize_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"contentEditable",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "contentEditable_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "contentEditable_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"enterKeyHint",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "enterKeyHint_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "enterKeyHint_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"isContentEditable",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "isContentEditable_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"inputMode",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "inputMode_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "inputMode_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"virtualKeyboardPolicy",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "virtualKeyboardPolicy_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "virtualKeyboardPolicy_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"offsetParent",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "offsetParent_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"offsetTop",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "offsetTop_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"offsetLeft",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "offsetLeft_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"offsetWidth",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "offsetWidth_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"offsetHeight",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "offsetHeight_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"popover",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "popover_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "popover_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"innerText",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "innerText_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "innerText_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"outerText",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "outerText_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "outerText_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onbeforexrselect",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onbeforexrselect_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onbeforexrselect_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onabort",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onabort_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onabort_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onbeforeinput",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onbeforeinput_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onbeforeinput_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onbeforematch",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onbeforematch_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onbeforematch_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onbeforetoggle",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onbeforetoggle_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onbeforetoggle_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onblur",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onblur_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onblur_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncancel",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncancel_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncancel_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncanplay",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncanplay_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncanplay_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncanplaythrough",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncanplaythrough_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncanplaythrough_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onchange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onchange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onchange_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onclick",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onclick_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onclick_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onclose",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onclose_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onclose_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncontentvisibilityautostatechange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncontentvisibilityautostatechange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncontentvisibilityautostatechange_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncontextlost",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncontextlost_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncontextlost_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncontextmenu",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncontextmenu_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncontextmenu_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncontextrestored",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncontextrestored_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncontextrestored_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncuechange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncuechange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncuechange_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondblclick",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondblclick_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondblclick_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondrag",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondrag_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondrag_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondragend",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragend_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragend_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondragenter",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragenter_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragenter_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondragleave",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragleave_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragleave_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondragover",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragover_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragover_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondragstart",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragstart_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragstart_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondrop",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondrop_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondrop_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondurationchange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondurationchange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondurationchange_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onemptied",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onemptied_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onemptied_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onended",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onended_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onended_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onerror",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onerror_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onerror_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onfocus",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onfocus_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onfocus_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onformdata",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onformdata_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onformdata_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oninput",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oninput_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oninput_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oninvalid",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oninvalid_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oninvalid_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onkeydown",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onkeydown_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onkeydown_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onkeypress",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onkeypress_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onkeypress_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onkeyup",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onkeyup_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onkeyup_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onload",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onload_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onload_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onloadeddata",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onloadeddata_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onloadeddata_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onloadedmetadata",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onloadedmetadata_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onloadedmetadata_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onloadstart",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onloadstart_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onloadstart_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onmousedown",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmousedown_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmousedown_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onmouseenter",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseenter_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseenter_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onmouseleave",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseleave_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseleave_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onmousemove",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmousemove_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmousemove_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onmouseout",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseout_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseout_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onmouseover",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseover_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseover_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onmouseup",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseup_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseup_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onmousewheel",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmousewheel_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmousewheel_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpause",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpause_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpause_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onplay",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onplay_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onplay_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onplaying",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onplaying_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onplaying_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onprogress",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onprogress_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onprogress_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onratechange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onratechange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onratechange_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onreset",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onreset_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onreset_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onresize",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onresize_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onresize_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onscroll",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onscroll_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onscroll_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onsecuritypolicyviolation",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onsecuritypolicyviolation_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onsecuritypolicyviolation_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onseeked",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onseeked_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onseeked_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onseeking",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onseeking_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onseeking_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onselect",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onselect_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onselect_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onslotchange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onslotchange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onslotchange_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onstalled",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onstalled_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onstalled_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onsubmit",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onsubmit_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onsubmit_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onsuspend",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onsuspend_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onsuspend_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ontimeupdate",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontimeupdate_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontimeupdate_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ontoggle",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontoggle_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontoggle_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onvolumechange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onvolumechange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onvolumechange_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onwaiting",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwaiting_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwaiting_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onwebkitanimationend",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwebkitanimationend_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwebkitanimationend_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onwebkitanimationiteration",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwebkitanimationiteration_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwebkitanimationiteration_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onwebkitanimationstart",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwebkitanimationstart_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwebkitanimationstart_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onwebkittransitionend",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwebkittransitionend_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwebkittransitionend_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onwheel",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwheel_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwheel_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onauxclick",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onauxclick_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onauxclick_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ongotpointercapture",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ongotpointercapture_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ongotpointercapture_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onlostpointercapture",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onlostpointercapture_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onlostpointercapture_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointerdown",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerdown_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerdown_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointermove",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointermove_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointermove_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointerrawupdate",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerrawupdate_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerrawupdate_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointerup",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerup_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerup_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointercancel",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointercancel_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointercancel_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointerover",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerover_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerover_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointerout",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerout_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerout_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointerenter",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerenter_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerenter_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointerleave",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerleave_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerleave_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onselectstart",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onselectstart_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onselectstart_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onselectionchange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onselectionchange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onselectionchange_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onanimationend",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onanimationend_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onanimationend_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onanimationiteration",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onanimationiteration_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onanimationiteration_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onanimationstart",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onanimationstart_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onanimationstart_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ontransitionrun",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontransitionrun_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontransitionrun_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ontransitionstart",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontransitionstart_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontransitionstart_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ontransitionend",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontransitionend_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontransitionend_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ontransitioncancel",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontransitioncancel_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontransitioncancel_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncopy",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncopy_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncopy_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncut",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncut_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncut_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpaste",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpaste_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpaste_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"dataset",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "dataset_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"nonce",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "nonce_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "nonce_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"autofocus",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "autofocus_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "autofocus_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"tabIndex",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "tabIndex_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "tabIndex_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"style",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "style_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "style_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"attributeStyleMap",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "attributeStyleMap_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"attachInternals",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "attachInternals", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"blur",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "blur", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"click",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "click", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"focus",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "focus", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"hidePopover",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "hidePopover", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"showPopover",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "showPopover", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"togglePopover",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "togglePopover", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"inert",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "inert_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "inert_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onscrollend",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onscrollend_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onscrollend_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"editContext",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "editContext_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "editContext_set", arguments)}});

// HTMLAnchorElement 对象
HTMLAnchorElement = function HTMLAnchorElement(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLAnchorElement, "HTMLAnchorElement");
Object.setPrototypeOf(HTMLAnchorElement.prototype, HTMLElement.prototype);
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"target",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "target_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "target_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"download",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "download_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "download_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"ping",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "ping_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "ping_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"rel",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "rel_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "rel_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"relList",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "relList_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "relList_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"hreflang",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "hreflang_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "hreflang_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"type",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "type_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "type_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"referrerPolicy",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "referrerPolicy_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "referrerPolicy_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"text",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "text_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "text_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"coords",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "coords_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "coords_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"charset",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "charset_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "charset_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"name",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "name_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "name_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"rev",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "rev_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "rev_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"shape",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "shape_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "shape_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"origin",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "origin_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"protocol",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "protocol_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "protocol_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"username",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "username_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "username_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"password",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "password_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "password_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"host",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "host_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "host_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"hostname",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "hostname_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "hostname_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"port",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "port_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "port_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"pathname",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "pathname_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "pathname_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"search",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "search_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "search_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"hash",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "hash_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "hash_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"href",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "href_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "href_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"toString",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "toString", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"hrefTranslate",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "hrefTranslate_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "hrefTranslate_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"attributionSrc",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "attributionSrc_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "attributionSrc_set", arguments)}});

// HTMLCanvasElement 对象
HTMLCanvasElement = function HTMLCanvasElement(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLCanvasElement, "HTMLCanvasElement");
Object.setPrototypeOf(HTMLCanvasElement.prototype, HTMLElement.prototype);
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype,"width",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "width_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "width_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype,"height",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "height_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "height_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype,"captureStream",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "captureStream", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype,"getContext",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "getContext", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype,"toBlob",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "toBlob", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype,"toDataURL",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "toDataURL", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype,"transferControlToOffscreen",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "transferControlToOffscreen", arguments)}});

// HTMLDivElement 对象
HTMLDivElement = function HTMLDivElement() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");
}
ldvm.toolsFunc.safeProto(HTMLDivElement, "HTMLDivElement");
Object.setPrototypeOf(HTMLDivElement.prototype, HTMLElement.prototype);
ldvm.toolsFunc.defineProperty(HTMLDivElement.prototype, "align", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLDivElement.prototype, "HTMLDivElement", "align_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLDivElement.prototype, "HTMLDivElement", "align_set", arguments)
    }
});

// HTMLHeadElement 对象
HTMLHeadElement = function HTMLHeadElement(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLHeadElement, "HTMLHeadElement");
Object.setPrototypeOf(HTMLHeadElement.prototype, HTMLElement.prototype);

// HTMLImageElement 对象
HTMLImageElement = function HTMLImageElement(){ldvm.toolsFunc.throwError("TypeError", "Failed to construct 'HTMLImageElement': Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLImageElement, "HTMLImageElement");
Object.setPrototypeOf(HTMLImageElement.prototype, HTMLElement.prototype);
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"alt",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "alt_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "alt_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"src",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "src_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "src_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"srcset",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "srcset_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "srcset_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"sizes",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "sizes_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "sizes_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"crossOrigin",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "crossOrigin_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "crossOrigin_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"useMap",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "useMap_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "useMap_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"isMap",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "isMap_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "isMap_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"width",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "width_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "width_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"height",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "height_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "height_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"naturalWidth",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "naturalWidth_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"naturalHeight",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "naturalHeight_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"complete",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "complete_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"currentSrc",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "currentSrc_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"referrerPolicy",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "referrerPolicy_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "referrerPolicy_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"decoding",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "decoding_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "decoding_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"fetchPriority",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "fetchPriority_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "fetchPriority_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"loading",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "loading_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "loading_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"name",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "name_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "name_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"lowsrc",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "lowsrc_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "lowsrc_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"align",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "align_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "align_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"hspace",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "hspace_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "hspace_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"vspace",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "vspace_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "vspace_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"longDesc",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "longDesc_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "longDesc_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"border",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "border_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "border_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"x",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "x_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"y",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "y_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"decode",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "decode", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"attributionSrc",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "attributionSrc_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "attributionSrc_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLImageElement.prototype,"sharedStorageWritable",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "sharedStorageWritable_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLImageElement.prototype, "HTMLImageElement", "sharedStorageWritable_set", arguments)}});

// HTMLInputElement 对象
HTMLInputElement = function HTMLInputElement(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLInputElement, "HTMLInputElement");
Object.setPrototypeOf(HTMLInputElement.prototype, HTMLElement.prototype);
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"accept",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "accept_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "accept_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"alt",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "alt_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "alt_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"autocomplete",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "autocomplete_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "autocomplete_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"defaultChecked",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "defaultChecked_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "defaultChecked_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"checked",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "checked_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "checked_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"dirName",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "dirName_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "dirName_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"disabled",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "disabled_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "disabled_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"form",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "form_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"files",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "files_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "files_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"formAction",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formAction_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formAction_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"formEnctype",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formEnctype_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formEnctype_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"formMethod",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formMethod_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formMethod_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"formNoValidate",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formNoValidate_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formNoValidate_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"formTarget",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formTarget_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formTarget_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"height",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "height_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "height_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"indeterminate",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "indeterminate_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "indeterminate_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"list",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "list_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"max",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "max_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "max_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"maxLength",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "maxLength_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "maxLength_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"min",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "min_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "min_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"minLength",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "minLength_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "minLength_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"multiple",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "multiple_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "multiple_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"name",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "name_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "name_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"pattern",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "pattern_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "pattern_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"placeholder",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "placeholder_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "placeholder_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"readOnly",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "readOnly_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "readOnly_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"required",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "required_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "required_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"size",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "size_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "size_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"src",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "src_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "src_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"step",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "step_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "step_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"type",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "type_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "type_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"defaultValue",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "defaultValue_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "defaultValue_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"value",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "value_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "value_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"valueAsDate",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "valueAsDate_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "valueAsDate_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"valueAsNumber",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "valueAsNumber_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "valueAsNumber_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"width",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "width_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "width_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"willValidate",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "willValidate_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"validity",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "validity_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"validationMessage",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "validationMessage_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"labels",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "labels_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"selectionStart",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "selectionStart_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "selectionStart_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"selectionEnd",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "selectionEnd_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "selectionEnd_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"selectionDirection",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "selectionDirection_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "selectionDirection_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"align",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "align_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "align_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"useMap",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "useMap_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "useMap_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"webkitdirectory",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "webkitdirectory_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "webkitdirectory_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"incremental",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "incremental_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "incremental_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"popoverTargetElement",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "popoverTargetElement_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "popoverTargetElement_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"popoverTargetAction",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "popoverTargetAction_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "popoverTargetAction_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"checkValidity",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "checkValidity", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"reportValidity",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "reportValidity", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"select",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "select", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"setCustomValidity",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "setCustomValidity", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"setRangeText",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "setRangeText", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"setSelectionRange",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "setSelectionRange", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"showPicker",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "showPicker", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"stepDown",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "stepDown", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"stepUp",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "stepUp", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"webkitEntries",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "webkitEntries_get", arguments)},set:undefined});

// HTMLMetaElement 对象
HTMLMetaElement = function HTMLMetaElement(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLMetaElement, "HTMLMetaElement");
Object.setPrototypeOf(HTMLMetaElement.prototype, HTMLElement.prototype);
ldvm.toolsFunc.defineProperty(HTMLMetaElement.prototype,"name",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "name_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "name_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLMetaElement.prototype,"httpEquiv",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "httpEquiv_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "httpEquiv_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLMetaElement.prototype,"content",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "content_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "content_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLMetaElement.prototype,"media",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "media_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "media_set", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLMetaElement.prototype,"scheme",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "scheme_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "scheme_set", arguments)}});

// Document 对象
Document = function Document(){}
ldvm.toolsFunc.safeProto(Document, "Document");
Object.setPrototypeOf(Document.prototype, Node.prototype);
ldvm.toolsFunc.defineProperty(Document,"parseHTMLUnsafe",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document, "Document", "parseHTMLUnsafe", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"implementation",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "implementation_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"URL",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "URL_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"documentURI",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "documentURI_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"compatMode",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "compatMode_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"characterSet",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "characterSet_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"charset",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "charset_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"inputEncoding",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "inputEncoding_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"contentType",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "contentType_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"doctype",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "doctype_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"documentElement",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "documentElement_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"xmlEncoding",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "xmlEncoding_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"xmlVersion",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "xmlVersion_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "xmlVersion_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"xmlStandalone",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "xmlStandalone_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "xmlStandalone_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"domain",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "domain_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "domain_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"referrer",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "referrer_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"cookie",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "cookie_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "cookie_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"lastModified",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "lastModified_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"readyState",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "readyState_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"title",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "title_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "title_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"dir",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "dir_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "dir_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"body",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "body_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "body_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"head",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "head_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"images",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "images_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"embeds",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "embeds_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"plugins",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "plugins_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"links",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "links_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"forms",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "forms_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"scripts",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "scripts_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"currentScript",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "currentScript_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"defaultView",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "defaultView_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"designMode",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "designMode_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "designMode_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onreadystatechange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onreadystatechange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onreadystatechange_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"anchors",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "anchors_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"applets",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "applets_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"fgColor",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fgColor_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fgColor_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"linkColor",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "linkColor_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "linkColor_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"vlinkColor",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "vlinkColor_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "vlinkColor_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"alinkColor",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "alinkColor_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "alinkColor_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"bgColor",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "bgColor_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "bgColor_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"all",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "all_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"scrollingElement",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "scrollingElement_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerlockchange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerlockchange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerlockchange_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerlockerror",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerlockerror_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerlockerror_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"hidden",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "hidden_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"visibilityState",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "visibilityState_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"wasDiscarded",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "wasDiscarded_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"prerendering",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "prerendering_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"featurePolicy",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "featurePolicy_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"webkitVisibilityState",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "webkitVisibilityState_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"webkitHidden",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "webkitHidden_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"onbeforecopy",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforecopy_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforecopy_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onbeforecut",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforecut_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforecut_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onbeforepaste",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforepaste_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforepaste_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onfreeze",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onfreeze_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onfreeze_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onprerenderingchange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onprerenderingchange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onprerenderingchange_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onresume",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onresume_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onresume_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onsearch",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onsearch_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onsearch_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onvisibilitychange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onvisibilitychange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onvisibilitychange_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"timeline",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "timeline_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"fullscreenEnabled",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fullscreenEnabled_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fullscreenEnabled_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"fullscreen",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fullscreen_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fullscreen_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onfullscreenchange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onfullscreenchange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onfullscreenchange_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onfullscreenerror",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onfullscreenerror_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onfullscreenerror_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"webkitIsFullScreen",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "webkitIsFullScreen_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"webkitCurrentFullScreenElement",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "webkitCurrentFullScreenElement_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"webkitFullscreenEnabled",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "webkitFullscreenEnabled_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"webkitFullscreenElement",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "webkitFullscreenElement_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"onwebkitfullscreenchange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitfullscreenchange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitfullscreenchange_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onwebkitfullscreenerror",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitfullscreenerror_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitfullscreenerror_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"rootElement",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "rootElement_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"pictureInPictureEnabled",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "pictureInPictureEnabled_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"onbeforexrselect",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforexrselect_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforexrselect_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onabort",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onabort_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onabort_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onbeforeinput",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforeinput_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforeinput_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onbeforematch",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforematch_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforematch_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onbeforetoggle",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforetoggle_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforetoggle_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onblur",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onblur_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onblur_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncancel",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncancel_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncancel_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncanplay",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncanplay_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncanplay_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncanplaythrough",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncanplaythrough_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncanplaythrough_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onchange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onchange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onchange_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onclick",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onclick_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onclick_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onclose",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onclose_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onclose_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncontentvisibilityautostatechange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncontentvisibilityautostatechange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncontentvisibilityautostatechange_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncontextlost",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncontextlost_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncontextlost_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncontextmenu",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncontextmenu_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncontextmenu_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncontextrestored",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncontextrestored_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncontextrestored_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncuechange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncuechange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncuechange_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondblclick",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondblclick_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondblclick_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondrag",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondrag_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondrag_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondragend",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragend_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragend_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondragenter",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragenter_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragenter_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondragleave",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragleave_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragleave_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondragover",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragover_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragover_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondragstart",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragstart_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragstart_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondrop",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondrop_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondrop_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondurationchange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondurationchange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondurationchange_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onemptied",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onemptied_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onemptied_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onended",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onended_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onended_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onerror",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onerror_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onerror_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onfocus",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onfocus_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onfocus_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onformdata",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onformdata_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onformdata_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oninput",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oninput_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oninput_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oninvalid",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oninvalid_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oninvalid_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onkeydown",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onkeydown_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onkeydown_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onkeypress",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onkeypress_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onkeypress_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onkeyup",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onkeyup_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onkeyup_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onload",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onload_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onload_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onloadeddata",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onloadeddata_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onloadeddata_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onloadedmetadata",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onloadedmetadata_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onloadedmetadata_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onloadstart",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onloadstart_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onloadstart_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onmousedown",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmousedown_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmousedown_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onmouseenter",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseenter_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseenter_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onmouseleave",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseleave_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseleave_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onmousemove",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmousemove_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmousemove_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onmouseout",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseout_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseout_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onmouseover",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseover_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseover_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onmouseup",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseup_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseup_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onmousewheel",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmousewheel_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmousewheel_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpause",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpause_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpause_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onplay",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onplay_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onplay_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onplaying",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onplaying_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onplaying_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onprogress",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onprogress_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onprogress_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onratechange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onratechange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onratechange_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onreset",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onreset_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onreset_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onresize",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onresize_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onresize_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onscroll",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onscroll_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onscroll_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onsecuritypolicyviolation",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onsecuritypolicyviolation_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onsecuritypolicyviolation_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onseeked",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onseeked_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onseeked_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onseeking",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onseeking_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onseeking_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onselect",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onselect_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onselect_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onslotchange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onslotchange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onslotchange_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onstalled",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onstalled_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onstalled_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onsubmit",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onsubmit_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onsubmit_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onsuspend",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onsuspend_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onsuspend_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ontimeupdate",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontimeupdate_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontimeupdate_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ontoggle",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontoggle_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontoggle_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onvolumechange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onvolumechange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onvolumechange_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onwaiting",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwaiting_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwaiting_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onwebkitanimationend",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitanimationend_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitanimationend_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onwebkitanimationiteration",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitanimationiteration_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitanimationiteration_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onwebkitanimationstart",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitanimationstart_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitanimationstart_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onwebkittransitionend",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkittransitionend_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkittransitionend_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onwheel",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwheel_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwheel_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onauxclick",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onauxclick_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onauxclick_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ongotpointercapture",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ongotpointercapture_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ongotpointercapture_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onlostpointercapture",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onlostpointercapture_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onlostpointercapture_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerdown",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerdown_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerdown_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointermove",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointermove_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointermove_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerrawupdate",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerrawupdate_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerrawupdate_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerup",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerup_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerup_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointercancel",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointercancel_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointercancel_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerover",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerover_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerover_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerout",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerout_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerout_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerenter",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerenter_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerenter_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerleave",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerleave_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerleave_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onselectstart",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onselectstart_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onselectstart_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onselectionchange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onselectionchange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onselectionchange_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onanimationend",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onanimationend_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onanimationend_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onanimationiteration",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onanimationiteration_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onanimationiteration_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onanimationstart",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onanimationstart_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onanimationstart_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ontransitionrun",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontransitionrun_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontransitionrun_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ontransitionstart",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontransitionstart_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontransitionstart_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ontransitionend",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontransitionend_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontransitionend_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ontransitioncancel",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontransitioncancel_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontransitioncancel_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncopy",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncopy_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncopy_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncut",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncut_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncut_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpaste",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpaste_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpaste_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"children",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "children_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"firstElementChild",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "firstElementChild_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"lastElementChild",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "lastElementChild_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"childElementCount",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "childElementCount_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"activeElement",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "activeElement_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"styleSheets",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "styleSheets_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"pointerLockElement",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "pointerLockElement_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"fullscreenElement",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fullscreenElement_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fullscreenElement_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"adoptedStyleSheets",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "adoptedStyleSheets_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "adoptedStyleSheets_set", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"pictureInPictureElement",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "pictureInPictureElement_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"fonts",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fonts_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"adoptNode",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "adoptNode", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"append",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "append", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"captureEvents",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "captureEvents", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"caretRangeFromPoint",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "caretRangeFromPoint", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"clear",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "clear", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"close",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "close", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createAttribute",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createAttribute", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createAttributeNS",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createAttributeNS", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createCDATASection",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createCDATASection", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createComment",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createComment", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createDocumentFragment",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createDocumentFragment", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createElement",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createElement", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createElementNS",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createElementNS", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createEvent",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createEvent", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createExpression",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createExpression", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createNSResolver",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createNSResolver", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createNodeIterator",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createNodeIterator", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createProcessingInstruction",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createProcessingInstruction", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createRange",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createRange", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createTextNode",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createTextNode", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createTreeWalker",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createTreeWalker", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"elementFromPoint",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "elementFromPoint", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"elementsFromPoint",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "elementsFromPoint", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"evaluate",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "evaluate", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"execCommand",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "execCommand", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"exitFullscreen",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "exitFullscreen", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"exitPictureInPicture",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "exitPictureInPicture", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"exitPointerLock",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "exitPointerLock", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"getAnimations",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "getAnimations", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"getElementById",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "getElementById", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"getElementsByClassName",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "getElementsByClassName", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"getElementsByName",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "getElementsByName", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"getElementsByTagName",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "getElementsByTagName", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"getElementsByTagNameNS",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "getElementsByTagNameNS", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"getSelection",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "getSelection", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"hasFocus",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "hasFocus", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"hasStorageAccess",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "hasStorageAccess", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"hasUnpartitionedCookieAccess",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "hasUnpartitionedCookieAccess", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"importNode",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "importNode", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"open",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "open", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"prepend",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "prepend", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"queryCommandEnabled",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "queryCommandEnabled", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"queryCommandIndeterm",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "queryCommandIndeterm", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"queryCommandState",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "queryCommandState", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"queryCommandSupported",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "queryCommandSupported", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"queryCommandValue",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "queryCommandValue", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"querySelector",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "querySelector", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"querySelectorAll",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "querySelectorAll", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"releaseEvents",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "releaseEvents", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"replaceChildren",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "replaceChildren", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"requestStorageAccess",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "requestStorageAccess", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"requestStorageAccessFor",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "requestStorageAccessFor", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"startViewTransition",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "startViewTransition", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"webkitCancelFullScreen",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "webkitCancelFullScreen", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"webkitExitFullscreen",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "webkitExitFullscreen", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"write",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "write", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"writeln",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "writeln", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"fragmentDirective",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fragmentDirective_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"browsingTopics",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "browsingTopics", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"hasPrivateToken",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "hasPrivateToken", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"hasRedemptionRecord",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "hasRedemptionRecord", arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onscrollend",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onscrollend_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onscrollend_set", arguments)}});

// HTMLDocument 对象
HTMLDocument = function HTMLDocument() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");
}
ldvm.toolsFunc.safeProto(HTMLDocument, "HTMLDocument");
Object.setPrototypeOf(HTMLDocument.prototype, Document.prototype);

// document对象
document = {};
Object.setPrototypeOf(document, HTMLDocument.prototype);
ldvm.toolsFunc.defineProperty(document, "location", {
    configurable: false, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, document, "document", "location_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, document, "document", "location_set", arguments)
    }
});


// Storage 对象
Storage = function Storage(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(Storage, "Storage");
ldvm.toolsFunc.defineProperty(Storage.prototype,"length",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Storage.prototype, "Storage", "length_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Storage.prototype,"clear",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Storage.prototype, "Storage", "clear", arguments)}});
ldvm.toolsFunc.defineProperty(Storage.prototype,"getItem",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Storage.prototype, "Storage", "getItem", arguments)}});
ldvm.toolsFunc.defineProperty(Storage.prototype,"key",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Storage.prototype, "Storage", "key", arguments)}});
ldvm.toolsFunc.defineProperty(Storage.prototype,"removeItem",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Storage.prototype, "Storage", "removeItem", arguments)}});
ldvm.toolsFunc.defineProperty(Storage.prototype,"setItem",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Storage.prototype, "Storage", "setItem", arguments)}});

// localStorage对象
localStorage = {};
Object.setPrototypeOf(localStorage,Storage.prototype);

// sessionStorage对象
sessionStorage = {};
Object.setPrototypeOf(sessionStorage,Storage.prototype);


// Navigator 对象
Navigator = function Navigator(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(Navigator, "Navigator");
ldvm.toolsFunc.defineProperty(Navigator.prototype,"vendorSub",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "vendorSub_get", arguments,)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"productSub",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "productSub_get", arguments,20030107)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"vendor",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "vendor_get", arguments,`Google Inc.`)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"maxTouchPoints",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "maxTouchPoints_get", arguments,0)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"scheduling",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "scheduling_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"userActivation",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "userActivation_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"doNotTrack",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "doNotTrack_get", arguments,null)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"geolocation",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "geolocation_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"connection",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "connection_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"plugins",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "plugins_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"mimeTypes",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "mimeTypes_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"pdfViewerEnabled",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "pdfViewerEnabled_get", arguments,true)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"webkitTemporaryStorage",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "webkitTemporaryStorage_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"webkitPersistentStorage",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "webkitPersistentStorage_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"hardwareConcurrency",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "hardwareConcurrency_get", arguments,16)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"cookieEnabled",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "cookieEnabled_get", arguments,true)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"appCodeName",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "appCodeName_get", arguments,Mozilla)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"appName",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "appName_get", arguments,'Netscape')},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"appVersion",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "appVersion_get", arguments,`5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"platform",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "platform_get", arguments,Win32)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"product",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "product_get", arguments,Gecko)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"userAgent",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "userAgent_get", arguments,`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"language",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "language_get", arguments,zh-CN)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"languages",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "languages_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"onLine",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "onLine_get", arguments,true)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"webdriver",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "webdriver_get", arguments,false)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"getGamepads",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "getGamepads", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"javaEnabled",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "javaEnabled", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"sendBeacon",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "sendBeacon", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"vibrate",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "vibrate", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"deprecatedRunAdAuctionEnforcesKAnonymity",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "deprecatedRunAdAuctionEnforcesKAnonymity_get", arguments,false)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"bluetooth",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "bluetooth_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"clipboard",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "clipboard_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"credentials",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "credentials_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"keyboard",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "keyboard_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"managed",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "managed_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"mediaDevices",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "mediaDevices_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"storage",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "storage_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"serviceWorker",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "serviceWorker_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"virtualKeyboard",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "virtualKeyboard_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"wakeLock",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "wakeLock_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"deviceMemory",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "deviceMemory_get", arguments,8)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"login",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "login_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"ink",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "ink_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"hid",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "hid_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"locks",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "locks_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"gpu",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "gpu_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"mediaCapabilities",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "mediaCapabilities_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"mediaSession",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "mediaSession_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"permissions",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "permissions_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"presentation",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "presentation_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"usb",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "usb_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"xr",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "xr_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"serial",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "serial_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"windowControlsOverlay",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "windowControlsOverlay_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"userAgentData",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "userAgentData_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"adAuctionComponents",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "adAuctionComponents", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"runAdAuction",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "runAdAuction", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"canLoadAdAuctionFencedFrame",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "canLoadAdAuctionFencedFrame", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"canShare",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "canShare", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"share",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "share", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"clearAppBadge",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "clearAppBadge", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"getBattery",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "getBattery", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"getUserMedia",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "getUserMedia", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"requestMIDIAccess",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "requestMIDIAccess", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"requestMediaKeySystemAccess",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "requestMediaKeySystemAccess", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"setAppBadge",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "setAppBadge", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"webkitGetUserMedia",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "webkitGetUserMedia", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"clearOriginJoinedAdInterestGroups",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "clearOriginJoinedAdInterestGroups", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"createAuctionNonce",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "createAuctionNonce", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"deprecatedReplaceInURN",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "deprecatedReplaceInURN", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"deprecatedURNToURL",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "deprecatedURNToURL", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"getInstalledRelatedApps",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "getInstalledRelatedApps", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"joinAdInterestGroup",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "joinAdInterestGroup", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"leaveAdInterestGroup",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "leaveAdInterestGroup", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"updateAdInterestGroups",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "updateAdInterestGroups", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"registerProtocolHandler",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "registerProtocolHandler", arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"unregisterProtocolHandler",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "unregisterProtocolHandler", arguments)}});


// navigator对象
navigator = {}
Object.setPrototypeOf(navigator,Navigator.prototype);


// HTMLCollection 对象
HTMLCollection = function HTMLCollection(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLCollection, "HTMLCollection");
ldvm.toolsFunc.defineProperty(HTMLCollection.prototype,"length",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, HTMLCollection.prototype, "HTMLCollection", "length_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(HTMLCollection.prototype,"item",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLCollection.prototype, "HTMLCollection", "item", arguments)}});
ldvm.toolsFunc.defineProperty(HTMLCollection.prototype,"namedItem",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, HTMLCollection.prototype, "HTMLCollection", "namedItem", arguments)}});

// PluginArray 对象
PluginArray = function PluginArray(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(PluginArray, "PluginArray");
ldvm.toolsFunc.defineProperty(PluginArray.prototype,"length",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, PluginArray.prototype, "PluginArray", "length_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(PluginArray.prototype,"item",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, PluginArray.prototype, "PluginArray", "item", arguments)}});
ldvm.toolsFunc.defineProperty(PluginArray.prototype,"namedItem",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, PluginArray.prototype, "PluginArray", "namedItem", arguments)}});
ldvm.toolsFunc.defineProperty(PluginArray.prototype,"refresh",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, PluginArray.prototype, "PluginArray", "refresh", arguments)}});

// Plugin 对象
Plugin = function Plugin(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(Plugin, "Plugin");
ldvm.toolsFunc.defineProperty(Plugin.prototype,"name",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Plugin.prototype, "Plugin", "name_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Plugin.prototype,"filename",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Plugin.prototype, "Plugin", "filename_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Plugin.prototype,"description",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Plugin.prototype, "Plugin", "description_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Plugin.prototype,"length",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Plugin.prototype, "Plugin", "length_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Plugin.prototype,"item",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Plugin.prototype, "Plugin", "item", arguments)}});
ldvm.toolsFunc.defineProperty(Plugin.prototype,"namedItem",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, Plugin.prototype, "Plugin", "namedItem", arguments)}});

// MimeTypeArray 对象
MimeTypeArray = function MimeTypeArray(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(MimeTypeArray, "MimeTypeArray");
ldvm.toolsFunc.defineProperty(MimeTypeArray.prototype,"length",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, MimeTypeArray.prototype, "MimeTypeArray", "length_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(MimeTypeArray.prototype,"item",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, MimeTypeArray.prototype, "MimeTypeArray", "item", arguments)}});
ldvm.toolsFunc.defineProperty(MimeTypeArray.prototype,"namedItem",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, MimeTypeArray.prototype, "MimeTypeArray", "namedItem", arguments)}});

// MimeType 对象
MimeType = function MimeType(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(MimeType, "MimeType");
ldvm.toolsFunc.defineProperty(MimeType.prototype,"type",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, MimeType.prototype, "MimeType", "type_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(MimeType.prototype,"suffixes",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, MimeType.prototype, "MimeType", "suffixes_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(MimeType.prototype,"description",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, MimeType.prototype, "MimeType", "description_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(MimeType.prototype,"enabledPlugin",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, MimeType.prototype, "MimeType", "enabledPlugin_get", arguments)},set:undefined});

// CanvasRenderingContext2D 对象
CanvasRenderingContext2D = function CanvasRenderingContext2D(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(CanvasRenderingContext2D, "CanvasRenderingContext2D");
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"canvas",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "canvas_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"globalAlpha",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "globalAlpha_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "globalAlpha_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"globalCompositeOperation",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "globalCompositeOperation_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "globalCompositeOperation_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"filter",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "filter_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "filter_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"imageSmoothingEnabled",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "imageSmoothingEnabled_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "imageSmoothingEnabled_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"imageSmoothingQuality",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "imageSmoothingQuality_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "imageSmoothingQuality_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"strokeStyle",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "strokeStyle_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "strokeStyle_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"fillStyle",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fillStyle_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fillStyle_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"shadowOffsetX",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "shadowOffsetX_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "shadowOffsetX_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"shadowOffsetY",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "shadowOffsetY_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "shadowOffsetY_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"shadowBlur",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "shadowBlur_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "shadowBlur_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"shadowColor",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "shadowColor_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "shadowColor_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"lineWidth",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineWidth_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineWidth_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"lineCap",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineCap_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineCap_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"lineJoin",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineJoin_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineJoin_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"miterLimit",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "miterLimit_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "miterLimit_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"lineDashOffset",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineDashOffset_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineDashOffset_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"font",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "font_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "font_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"textAlign",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "textAlign_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "textAlign_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"textBaseline",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "textBaseline_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "textBaseline_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"direction",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "direction_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "direction_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"fontKerning",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fontKerning_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fontKerning_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"fontStretch",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fontStretch_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fontStretch_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"fontVariantCaps",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fontVariantCaps_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fontVariantCaps_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"letterSpacing",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "letterSpacing_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "letterSpacing_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"textRendering",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "textRendering_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "textRendering_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"wordSpacing",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "wordSpacing_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "wordSpacing_set", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"clip",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "clip", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"createConicGradient",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "createConicGradient", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"createImageData",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "createImageData", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"createLinearGradient",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "createLinearGradient", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"createPattern",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "createPattern", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"createRadialGradient",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "createRadialGradient", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"drawFocusIfNeeded",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "drawFocusIfNeeded", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"drawImage",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "drawImage", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"fill",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fill", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"fillText",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fillText", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"getContextAttributes",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "getContextAttributes", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"getImageData",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "getImageData", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"getLineDash",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "getLineDash", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"getTransform",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "getTransform", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"isContextLost",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "isContextLost", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"isPointInPath",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "isPointInPath", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"isPointInStroke",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "isPointInStroke", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"measureText",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "measureText", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"putImageData",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "putImageData", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"reset",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "reset", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"roundRect",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "roundRect", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"save",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "save", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"scale",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "scale", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"setLineDash",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "setLineDash", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"setTransform",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "setTransform", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"stroke",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "stroke", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"strokeText",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "strokeText", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"transform",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "transform", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"translate",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "translate", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"arc",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "arc", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"arcTo",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "arcTo", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"beginPath",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "beginPath", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"bezierCurveTo",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "bezierCurveTo", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"clearRect",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "clearRect", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"closePath",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "closePath", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"ellipse",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "ellipse", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"fillRect",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fillRect", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"lineTo",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineTo", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"moveTo",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "moveTo", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"quadraticCurveTo",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "quadraticCurveTo", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"rect",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "rect", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"resetTransform",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "resetTransform", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"restore",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "restore", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"rotate",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "rotate", arguments)}});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype,"strokeRect",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "strokeRect", arguments)}});

// WebGLRenderingContext 对象
WebGLRenderingContext = function WebGLRenderingContext(){ldvm.toolsFunc.throwError("TypeError", "Illegal constructor");}
ldvm.toolsFunc.safeProto(WebGLRenderingContext, "WebGLRenderingContext");
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DEPTH_BUFFER_BIT",{configurable:false,enumerable:true,writable:false,value:256});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_BUFFER_BIT",{configurable:false,enumerable:true,writable:false,value:1024});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"COLOR_BUFFER_BIT",{configurable:false,enumerable:true,writable:false,value:16384});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"POINTS",{configurable:false,enumerable:true,writable:false,value:0});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"LINES",{configurable:false,enumerable:true,writable:false,value:1});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"LINE_LOOP",{configurable:false,enumerable:true,writable:false,value:2});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"LINE_STRIP",{configurable:false,enumerable:true,writable:false,value:3});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TRIANGLES",{configurable:false,enumerable:true,writable:false,value:4});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TRIANGLE_STRIP",{configurable:false,enumerable:true,writable:false,value:5});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TRIANGLE_FAN",{configurable:false,enumerable:true,writable:false,value:6});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ZERO",{configurable:false,enumerable:true,writable:false,value:0});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ONE",{configurable:false,enumerable:true,writable:false,value:1});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"SRC_COLOR",{configurable:false,enumerable:true,writable:false,value:768});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ONE_MINUS_SRC_COLOR",{configurable:false,enumerable:true,writable:false,value:769});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"SRC_ALPHA",{configurable:false,enumerable:true,writable:false,value:770});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ONE_MINUS_SRC_ALPHA",{configurable:false,enumerable:true,writable:false,value:771});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DST_ALPHA",{configurable:false,enumerable:true,writable:false,value:772});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ONE_MINUS_DST_ALPHA",{configurable:false,enumerable:true,writable:false,value:773});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DST_COLOR",{configurable:false,enumerable:true,writable:false,value:774});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ONE_MINUS_DST_COLOR",{configurable:false,enumerable:true,writable:false,value:775});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"SRC_ALPHA_SATURATE",{configurable:false,enumerable:true,writable:false,value:776});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FUNC_ADD",{configurable:false,enumerable:true,writable:false,value:32774});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BLEND_EQUATION",{configurable:false,enumerable:true,writable:false,value:32777});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BLEND_EQUATION_RGB",{configurable:false,enumerable:true,writable:false,value:32777});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BLEND_EQUATION_ALPHA",{configurable:false,enumerable:true,writable:false,value:34877});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FUNC_SUBTRACT",{configurable:false,enumerable:true,writable:false,value:32778});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FUNC_REVERSE_SUBTRACT",{configurable:false,enumerable:true,writable:false,value:32779});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BLEND_DST_RGB",{configurable:false,enumerable:true,writable:false,value:32968});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BLEND_SRC_RGB",{configurable:false,enumerable:true,writable:false,value:32969});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BLEND_DST_ALPHA",{configurable:false,enumerable:true,writable:false,value:32970});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BLEND_SRC_ALPHA",{configurable:false,enumerable:true,writable:false,value:32971});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"CONSTANT_COLOR",{configurable:false,enumerable:true,writable:false,value:32769});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ONE_MINUS_CONSTANT_COLOR",{configurable:false,enumerable:true,writable:false,value:32770});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"CONSTANT_ALPHA",{configurable:false,enumerable:true,writable:false,value:32771});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ONE_MINUS_CONSTANT_ALPHA",{configurable:false,enumerable:true,writable:false,value:32772});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BLEND_COLOR",{configurable:false,enumerable:true,writable:false,value:32773});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ARRAY_BUFFER",{configurable:false,enumerable:true,writable:false,value:34962});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ELEMENT_ARRAY_BUFFER",{configurable:false,enumerable:true,writable:false,value:34963});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ARRAY_BUFFER_BINDING",{configurable:false,enumerable:true,writable:false,value:34964});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ELEMENT_ARRAY_BUFFER_BINDING",{configurable:false,enumerable:true,writable:false,value:34965});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STREAM_DRAW",{configurable:false,enumerable:true,writable:false,value:35040});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STATIC_DRAW",{configurable:false,enumerable:true,writable:false,value:35044});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DYNAMIC_DRAW",{configurable:false,enumerable:true,writable:false,value:35048});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BUFFER_SIZE",{configurable:false,enumerable:true,writable:false,value:34660});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BUFFER_USAGE",{configurable:false,enumerable:true,writable:false,value:34661});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"CURRENT_VERTEX_ATTRIB",{configurable:false,enumerable:true,writable:false,value:34342});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FRONT",{configurable:false,enumerable:true,writable:false,value:1028});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BACK",{configurable:false,enumerable:true,writable:false,value:1029});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FRONT_AND_BACK",{configurable:false,enumerable:true,writable:false,value:1032});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE_2D",{configurable:false,enumerable:true,writable:false,value:3553});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"CULL_FACE",{configurable:false,enumerable:true,writable:false,value:2884});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BLEND",{configurable:false,enumerable:true,writable:false,value:3042});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DITHER",{configurable:false,enumerable:true,writable:false,value:3024});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_TEST",{configurable:false,enumerable:true,writable:false,value:2960});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DEPTH_TEST",{configurable:false,enumerable:true,writable:false,value:2929});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"SCISSOR_TEST",{configurable:false,enumerable:true,writable:false,value:3089});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"POLYGON_OFFSET_FILL",{configurable:false,enumerable:true,writable:false,value:32823});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"SAMPLE_ALPHA_TO_COVERAGE",{configurable:false,enumerable:true,writable:false,value:32926});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"SAMPLE_COVERAGE",{configurable:false,enumerable:true,writable:false,value:32928});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"NO_ERROR",{configurable:false,enumerable:true,writable:false,value:0});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"INVALID_ENUM",{configurable:false,enumerable:true,writable:false,value:1280});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"INVALID_VALUE",{configurable:false,enumerable:true,writable:false,value:1281});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"INVALID_OPERATION",{configurable:false,enumerable:true,writable:false,value:1282});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"OUT_OF_MEMORY",{configurable:false,enumerable:true,writable:false,value:1285});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"CW",{configurable:false,enumerable:true,writable:false,value:2304});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"CCW",{configurable:false,enumerable:true,writable:false,value:2305});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"LINE_WIDTH",{configurable:false,enumerable:true,writable:false,value:2849});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ALIASED_POINT_SIZE_RANGE",{configurable:false,enumerable:true,writable:false,value:33901});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ALIASED_LINE_WIDTH_RANGE",{configurable:false,enumerable:true,writable:false,value:33902});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"CULL_FACE_MODE",{configurable:false,enumerable:true,writable:false,value:2885});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FRONT_FACE",{configurable:false,enumerable:true,writable:false,value:2886});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DEPTH_RANGE",{configurable:false,enumerable:true,writable:false,value:2928});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DEPTH_WRITEMASK",{configurable:false,enumerable:true,writable:false,value:2930});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DEPTH_CLEAR_VALUE",{configurable:false,enumerable:true,writable:false,value:2931});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DEPTH_FUNC",{configurable:false,enumerable:true,writable:false,value:2932});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_CLEAR_VALUE",{configurable:false,enumerable:true,writable:false,value:2961});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_FUNC",{configurable:false,enumerable:true,writable:false,value:2962});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_FAIL",{configurable:false,enumerable:true,writable:false,value:2964});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_PASS_DEPTH_FAIL",{configurable:false,enumerable:true,writable:false,value:2965});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_PASS_DEPTH_PASS",{configurable:false,enumerable:true,writable:false,value:2966});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_REF",{configurable:false,enumerable:true,writable:false,value:2967});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_VALUE_MASK",{configurable:false,enumerable:true,writable:false,value:2963});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_WRITEMASK",{configurable:false,enumerable:true,writable:false,value:2968});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_BACK_FUNC",{configurable:false,enumerable:true,writable:false,value:34816});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_BACK_FAIL",{configurable:false,enumerable:true,writable:false,value:34817});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_BACK_PASS_DEPTH_FAIL",{configurable:false,enumerable:true,writable:false,value:34818});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_BACK_PASS_DEPTH_PASS",{configurable:false,enumerable:true,writable:false,value:34819});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_BACK_REF",{configurable:false,enumerable:true,writable:false,value:36003});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_BACK_VALUE_MASK",{configurable:false,enumerable:true,writable:false,value:36004});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_BACK_WRITEMASK",{configurable:false,enumerable:true,writable:false,value:36005});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"VIEWPORT",{configurable:false,enumerable:true,writable:false,value:2978});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"SCISSOR_BOX",{configurable:false,enumerable:true,writable:false,value:3088});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"COLOR_CLEAR_VALUE",{configurable:false,enumerable:true,writable:false,value:3106});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"COLOR_WRITEMASK",{configurable:false,enumerable:true,writable:false,value:3107});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"UNPACK_ALIGNMENT",{configurable:false,enumerable:true,writable:false,value:3317});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"PACK_ALIGNMENT",{configurable:false,enumerable:true,writable:false,value:3333});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"MAX_TEXTURE_SIZE",{configurable:false,enumerable:true,writable:false,value:3379});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"MAX_VIEWPORT_DIMS",{configurable:false,enumerable:true,writable:false,value:3386});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"SUBPIXEL_BITS",{configurable:false,enumerable:true,writable:false,value:3408});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RED_BITS",{configurable:false,enumerable:true,writable:false,value:3410});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"GREEN_BITS",{configurable:false,enumerable:true,writable:false,value:3411});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BLUE_BITS",{configurable:false,enumerable:true,writable:false,value:3412});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ALPHA_BITS",{configurable:false,enumerable:true,writable:false,value:3413});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DEPTH_BITS",{configurable:false,enumerable:true,writable:false,value:3414});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_BITS",{configurable:false,enumerable:true,writable:false,value:3415});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"POLYGON_OFFSET_UNITS",{configurable:false,enumerable:true,writable:false,value:10752});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"POLYGON_OFFSET_FACTOR",{configurable:false,enumerable:true,writable:false,value:32824});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE_BINDING_2D",{configurable:false,enumerable:true,writable:false,value:32873});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"SAMPLE_BUFFERS",{configurable:false,enumerable:true,writable:false,value:32936});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"SAMPLES",{configurable:false,enumerable:true,writable:false,value:32937});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"SAMPLE_COVERAGE_VALUE",{configurable:false,enumerable:true,writable:false,value:32938});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"SAMPLE_COVERAGE_INVERT",{configurable:false,enumerable:true,writable:false,value:32939});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"COMPRESSED_TEXTURE_FORMATS",{configurable:false,enumerable:true,writable:false,value:34467});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DONT_CARE",{configurable:false,enumerable:true,writable:false,value:4352});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FASTEST",{configurable:false,enumerable:true,writable:false,value:4353});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"NICEST",{configurable:false,enumerable:true,writable:false,value:4354});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"GENERATE_MIPMAP_HINT",{configurable:false,enumerable:true,writable:false,value:33170});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BYTE",{configurable:false,enumerable:true,writable:false,value:5120});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"UNSIGNED_BYTE",{configurable:false,enumerable:true,writable:false,value:5121});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"SHORT",{configurable:false,enumerable:true,writable:false,value:5122});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"UNSIGNED_SHORT",{configurable:false,enumerable:true,writable:false,value:5123});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"INT",{configurable:false,enumerable:true,writable:false,value:5124});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"UNSIGNED_INT",{configurable:false,enumerable:true,writable:false,value:5125});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FLOAT",{configurable:false,enumerable:true,writable:false,value:5126});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DEPTH_COMPONENT",{configurable:false,enumerable:true,writable:false,value:6402});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ALPHA",{configurable:false,enumerable:true,writable:false,value:6406});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RGB",{configurable:false,enumerable:true,writable:false,value:6407});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RGBA",{configurable:false,enumerable:true,writable:false,value:6408});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"LUMINANCE",{configurable:false,enumerable:true,writable:false,value:6409});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"LUMINANCE_ALPHA",{configurable:false,enumerable:true,writable:false,value:6410});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"UNSIGNED_SHORT_4_4_4_4",{configurable:false,enumerable:true,writable:false,value:32819});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"UNSIGNED_SHORT_5_5_5_1",{configurable:false,enumerable:true,writable:false,value:32820});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"UNSIGNED_SHORT_5_6_5",{configurable:false,enumerable:true,writable:false,value:33635});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FRAGMENT_SHADER",{configurable:false,enumerable:true,writable:false,value:35632});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"VERTEX_SHADER",{configurable:false,enumerable:true,writable:false,value:35633});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"MAX_VERTEX_ATTRIBS",{configurable:false,enumerable:true,writable:false,value:34921});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"MAX_VERTEX_UNIFORM_VECTORS",{configurable:false,enumerable:true,writable:false,value:36347});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"MAX_VARYING_VECTORS",{configurable:false,enumerable:true,writable:false,value:36348});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"MAX_COMBINED_TEXTURE_IMAGE_UNITS",{configurable:false,enumerable:true,writable:false,value:35661});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"MAX_VERTEX_TEXTURE_IMAGE_UNITS",{configurable:false,enumerable:true,writable:false,value:35660});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"MAX_TEXTURE_IMAGE_UNITS",{configurable:false,enumerable:true,writable:false,value:34930});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"MAX_FRAGMENT_UNIFORM_VECTORS",{configurable:false,enumerable:true,writable:false,value:36349});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"SHADER_TYPE",{configurable:false,enumerable:true,writable:false,value:35663});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DELETE_STATUS",{configurable:false,enumerable:true,writable:false,value:35712});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"LINK_STATUS",{configurable:false,enumerable:true,writable:false,value:35714});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"VALIDATE_STATUS",{configurable:false,enumerable:true,writable:false,value:35715});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ATTACHED_SHADERS",{configurable:false,enumerable:true,writable:false,value:35717});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ACTIVE_UNIFORMS",{configurable:false,enumerable:true,writable:false,value:35718});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ACTIVE_ATTRIBUTES",{configurable:false,enumerable:true,writable:false,value:35721});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"SHADING_LANGUAGE_VERSION",{configurable:false,enumerable:true,writable:false,value:35724});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"CURRENT_PROGRAM",{configurable:false,enumerable:true,writable:false,value:35725});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"NEVER",{configurable:false,enumerable:true,writable:false,value:512});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"LESS",{configurable:false,enumerable:true,writable:false,value:513});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"EQUAL",{configurable:false,enumerable:true,writable:false,value:514});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"LEQUAL",{configurable:false,enumerable:true,writable:false,value:515});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"GREATER",{configurable:false,enumerable:true,writable:false,value:516});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"NOTEQUAL",{configurable:false,enumerable:true,writable:false,value:517});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"GEQUAL",{configurable:false,enumerable:true,writable:false,value:518});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ALWAYS",{configurable:false,enumerable:true,writable:false,value:519});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"KEEP",{configurable:false,enumerable:true,writable:false,value:7680});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"REPLACE",{configurable:false,enumerable:true,writable:false,value:7681});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"INCR",{configurable:false,enumerable:true,writable:false,value:7682});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DECR",{configurable:false,enumerable:true,writable:false,value:7683});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"INVERT",{configurable:false,enumerable:true,writable:false,value:5386});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"INCR_WRAP",{configurable:false,enumerable:true,writable:false,value:34055});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DECR_WRAP",{configurable:false,enumerable:true,writable:false,value:34056});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"VENDOR",{configurable:false,enumerable:true,writable:false,value:7936});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RENDERER",{configurable:false,enumerable:true,writable:false,value:7937});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"VERSION",{configurable:false,enumerable:true,writable:false,value:7938});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"NEAREST",{configurable:false,enumerable:true,writable:false,value:9728});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"LINEAR",{configurable:false,enumerable:true,writable:false,value:9729});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"NEAREST_MIPMAP_NEAREST",{configurable:false,enumerable:true,writable:false,value:9984});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"LINEAR_MIPMAP_NEAREST",{configurable:false,enumerable:true,writable:false,value:9985});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"NEAREST_MIPMAP_LINEAR",{configurable:false,enumerable:true,writable:false,value:9986});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"LINEAR_MIPMAP_LINEAR",{configurable:false,enumerable:true,writable:false,value:9987});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE_MAG_FILTER",{configurable:false,enumerable:true,writable:false,value:10240});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE_MIN_FILTER",{configurable:false,enumerable:true,writable:false,value:10241});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE_WRAP_S",{configurable:false,enumerable:true,writable:false,value:10242});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE_WRAP_T",{configurable:false,enumerable:true,writable:false,value:10243});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE",{configurable:false,enumerable:true,writable:false,value:5890});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE_CUBE_MAP",{configurable:false,enumerable:true,writable:false,value:34067});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE_BINDING_CUBE_MAP",{configurable:false,enumerable:true,writable:false,value:34068});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE_CUBE_MAP_POSITIVE_X",{configurable:false,enumerable:true,writable:false,value:34069});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE_CUBE_MAP_NEGATIVE_X",{configurable:false,enumerable:true,writable:false,value:34070});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE_CUBE_MAP_POSITIVE_Y",{configurable:false,enumerable:true,writable:false,value:34071});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE_CUBE_MAP_NEGATIVE_Y",{configurable:false,enumerable:true,writable:false,value:34072});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE_CUBE_MAP_POSITIVE_Z",{configurable:false,enumerable:true,writable:false,value:34073});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE_CUBE_MAP_NEGATIVE_Z",{configurable:false,enumerable:true,writable:false,value:34074});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"MAX_CUBE_MAP_TEXTURE_SIZE",{configurable:false,enumerable:true,writable:false,value:34076});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE0",{configurable:false,enumerable:true,writable:false,value:33984});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE1",{configurable:false,enumerable:true,writable:false,value:33985});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE2",{configurable:false,enumerable:true,writable:false,value:33986});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE3",{configurable:false,enumerable:true,writable:false,value:33987});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE4",{configurable:false,enumerable:true,writable:false,value:33988});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE5",{configurable:false,enumerable:true,writable:false,value:33989});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE6",{configurable:false,enumerable:true,writable:false,value:33990});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE7",{configurable:false,enumerable:true,writable:false,value:33991});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE8",{configurable:false,enumerable:true,writable:false,value:33992});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE9",{configurable:false,enumerable:true,writable:false,value:33993});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE10",{configurable:false,enumerable:true,writable:false,value:33994});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE11",{configurable:false,enumerable:true,writable:false,value:33995});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE12",{configurable:false,enumerable:true,writable:false,value:33996});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE13",{configurable:false,enumerable:true,writable:false,value:33997});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE14",{configurable:false,enumerable:true,writable:false,value:33998});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE15",{configurable:false,enumerable:true,writable:false,value:33999});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE16",{configurable:false,enumerable:true,writable:false,value:34000});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE17",{configurable:false,enumerable:true,writable:false,value:34001});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE18",{configurable:false,enumerable:true,writable:false,value:34002});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE19",{configurable:false,enumerable:true,writable:false,value:34003});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE20",{configurable:false,enumerable:true,writable:false,value:34004});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE21",{configurable:false,enumerable:true,writable:false,value:34005});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE22",{configurable:false,enumerable:true,writable:false,value:34006});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE23",{configurable:false,enumerable:true,writable:false,value:34007});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE24",{configurable:false,enumerable:true,writable:false,value:34008});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE25",{configurable:false,enumerable:true,writable:false,value:34009});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE26",{configurable:false,enumerable:true,writable:false,value:34010});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE27",{configurable:false,enumerable:true,writable:false,value:34011});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE28",{configurable:false,enumerable:true,writable:false,value:34012});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE29",{configurable:false,enumerable:true,writable:false,value:34013});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE30",{configurable:false,enumerable:true,writable:false,value:34014});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"TEXTURE31",{configurable:false,enumerable:true,writable:false,value:34015});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"ACTIVE_TEXTURE",{configurable:false,enumerable:true,writable:false,value:34016});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"REPEAT",{configurable:false,enumerable:true,writable:false,value:10497});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"CLAMP_TO_EDGE",{configurable:false,enumerable:true,writable:false,value:33071});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"MIRRORED_REPEAT",{configurable:false,enumerable:true,writable:false,value:33648});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FLOAT_VEC2",{configurable:false,enumerable:true,writable:false,value:35664});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FLOAT_VEC3",{configurable:false,enumerable:true,writable:false,value:35665});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FLOAT_VEC4",{configurable:false,enumerable:true,writable:false,value:35666});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"INT_VEC2",{configurable:false,enumerable:true,writable:false,value:35667});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"INT_VEC3",{configurable:false,enumerable:true,writable:false,value:35668});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"INT_VEC4",{configurable:false,enumerable:true,writable:false,value:35669});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BOOL",{configurable:false,enumerable:true,writable:false,value:35670});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BOOL_VEC2",{configurable:false,enumerable:true,writable:false,value:35671});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BOOL_VEC3",{configurable:false,enumerable:true,writable:false,value:35672});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BOOL_VEC4",{configurable:false,enumerable:true,writable:false,value:35673});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FLOAT_MAT2",{configurable:false,enumerable:true,writable:false,value:35674});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FLOAT_MAT3",{configurable:false,enumerable:true,writable:false,value:35675});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FLOAT_MAT4",{configurable:false,enumerable:true,writable:false,value:35676});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"SAMPLER_2D",{configurable:false,enumerable:true,writable:false,value:35678});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"SAMPLER_CUBE",{configurable:false,enumerable:true,writable:false,value:35680});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"VERTEX_ATTRIB_ARRAY_ENABLED",{configurable:false,enumerable:true,writable:false,value:34338});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"VERTEX_ATTRIB_ARRAY_SIZE",{configurable:false,enumerable:true,writable:false,value:34339});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"VERTEX_ATTRIB_ARRAY_STRIDE",{configurable:false,enumerable:true,writable:false,value:34340});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"VERTEX_ATTRIB_ARRAY_TYPE",{configurable:false,enumerable:true,writable:false,value:34341});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"VERTEX_ATTRIB_ARRAY_NORMALIZED",{configurable:false,enumerable:true,writable:false,value:34922});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"VERTEX_ATTRIB_ARRAY_POINTER",{configurable:false,enumerable:true,writable:false,value:34373});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"VERTEX_ATTRIB_ARRAY_BUFFER_BINDING",{configurable:false,enumerable:true,writable:false,value:34975});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"IMPLEMENTATION_COLOR_READ_TYPE",{configurable:false,enumerable:true,writable:false,value:35738});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"IMPLEMENTATION_COLOR_READ_FORMAT",{configurable:false,enumerable:true,writable:false,value:35739});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"COMPILE_STATUS",{configurable:false,enumerable:true,writable:false,value:35713});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"LOW_FLOAT",{configurable:false,enumerable:true,writable:false,value:36336});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"MEDIUM_FLOAT",{configurable:false,enumerable:true,writable:false,value:36337});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"HIGH_FLOAT",{configurable:false,enumerable:true,writable:false,value:36338});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"LOW_INT",{configurable:false,enumerable:true,writable:false,value:36339});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"MEDIUM_INT",{configurable:false,enumerable:true,writable:false,value:36340});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"HIGH_INT",{configurable:false,enumerable:true,writable:false,value:36341});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FRAMEBUFFER",{configurable:false,enumerable:true,writable:false,value:36160});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RENDERBUFFER",{configurable:false,enumerable:true,writable:false,value:36161});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RGBA4",{configurable:false,enumerable:true,writable:false,value:32854});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RGB5_A1",{configurable:false,enumerable:true,writable:false,value:32855});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RGB565",{configurable:false,enumerable:true,writable:false,value:36194});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DEPTH_COMPONENT16",{configurable:false,enumerable:true,writable:false,value:33189});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_INDEX8",{configurable:false,enumerable:true,writable:false,value:36168});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DEPTH_STENCIL",{configurable:false,enumerable:true,writable:false,value:34041});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RENDERBUFFER_WIDTH",{configurable:false,enumerable:true,writable:false,value:36162});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RENDERBUFFER_HEIGHT",{configurable:false,enumerable:true,writable:false,value:36163});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RENDERBUFFER_INTERNAL_FORMAT",{configurable:false,enumerable:true,writable:false,value:36164});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RENDERBUFFER_RED_SIZE",{configurable:false,enumerable:true,writable:false,value:36176});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RENDERBUFFER_GREEN_SIZE",{configurable:false,enumerable:true,writable:false,value:36177});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RENDERBUFFER_BLUE_SIZE",{configurable:false,enumerable:true,writable:false,value:36178});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RENDERBUFFER_ALPHA_SIZE",{configurable:false,enumerable:true,writable:false,value:36179});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RENDERBUFFER_DEPTH_SIZE",{configurable:false,enumerable:true,writable:false,value:36180});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RENDERBUFFER_STENCIL_SIZE",{configurable:false,enumerable:true,writable:false,value:36181});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE",{configurable:false,enumerable:true,writable:false,value:36048});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FRAMEBUFFER_ATTACHMENT_OBJECT_NAME",{configurable:false,enumerable:true,writable:false,value:36049});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL",{configurable:false,enumerable:true,writable:false,value:36050});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE",{configurable:false,enumerable:true,writable:false,value:36051});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"COLOR_ATTACHMENT0",{configurable:false,enumerable:true,writable:false,value:36064});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DEPTH_ATTACHMENT",{configurable:false,enumerable:true,writable:false,value:36096});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"STENCIL_ATTACHMENT",{configurable:false,enumerable:true,writable:false,value:36128});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"DEPTH_STENCIL_ATTACHMENT",{configurable:false,enumerable:true,writable:false,value:33306});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"NONE",{configurable:false,enumerable:true,writable:false,value:0});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FRAMEBUFFER_COMPLETE",{configurable:false,enumerable:true,writable:false,value:36053});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FRAMEBUFFER_INCOMPLETE_ATTACHMENT",{configurable:false,enumerable:true,writable:false,value:36054});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT",{configurable:false,enumerable:true,writable:false,value:36055});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FRAMEBUFFER_INCOMPLETE_DIMENSIONS",{configurable:false,enumerable:true,writable:false,value:36057});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FRAMEBUFFER_UNSUPPORTED",{configurable:false,enumerable:true,writable:false,value:36061});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"FRAMEBUFFER_BINDING",{configurable:false,enumerable:true,writable:false,value:36006});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RENDERBUFFER_BINDING",{configurable:false,enumerable:true,writable:false,value:36007});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"MAX_RENDERBUFFER_SIZE",{configurable:false,enumerable:true,writable:false,value:34024});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"INVALID_FRAMEBUFFER_OPERATION",{configurable:false,enumerable:true,writable:false,value:1286});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"UNPACK_FLIP_Y_WEBGL",{configurable:false,enumerable:true,writable:false,value:37440});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"UNPACK_PREMULTIPLY_ALPHA_WEBGL",{configurable:false,enumerable:true,writable:false,value:37441});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"CONTEXT_LOST_WEBGL",{configurable:false,enumerable:true,writable:false,value:37442});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"UNPACK_COLORSPACE_CONVERSION_WEBGL",{configurable:false,enumerable:true,writable:false,value:37443});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"BROWSER_DEFAULT_WEBGL",{configurable:false,enumerable:true,writable:false,value:37444});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RGB8",{configurable:false,enumerable:true,writable:false,value:32849});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext,"RGBA8",{configurable:false,enumerable:true,writable:false,value:32856});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"canvas",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "canvas_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"drawingBufferWidth",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "drawingBufferWidth_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"drawingBufferHeight",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "drawingBufferHeight_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"drawingBufferColorSpace",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "drawingBufferColorSpace_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "drawingBufferColorSpace_set", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"unpackColorSpace",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "unpackColorSpace_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "unpackColorSpace_set", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DEPTH_BUFFER_BIT",{configurable:false,enumerable:true,writable:false,value:256});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_BUFFER_BIT",{configurable:false,enumerable:true,writable:false,value:1024});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"COLOR_BUFFER_BIT",{configurable:false,enumerable:true,writable:false,value:16384});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"POINTS",{configurable:false,enumerable:true,writable:false,value:0});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"LINES",{configurable:false,enumerable:true,writable:false,value:1});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"LINE_LOOP",{configurable:false,enumerable:true,writable:false,value:2});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"LINE_STRIP",{configurable:false,enumerable:true,writable:false,value:3});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TRIANGLES",{configurable:false,enumerable:true,writable:false,value:4});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TRIANGLE_STRIP",{configurable:false,enumerable:true,writable:false,value:5});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TRIANGLE_FAN",{configurable:false,enumerable:true,writable:false,value:6});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ZERO",{configurable:false,enumerable:true,writable:false,value:0});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ONE",{configurable:false,enumerable:true,writable:false,value:1});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"SRC_COLOR",{configurable:false,enumerable:true,writable:false,value:768});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ONE_MINUS_SRC_COLOR",{configurable:false,enumerable:true,writable:false,value:769});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"SRC_ALPHA",{configurable:false,enumerable:true,writable:false,value:770});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ONE_MINUS_SRC_ALPHA",{configurable:false,enumerable:true,writable:false,value:771});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DST_ALPHA",{configurable:false,enumerable:true,writable:false,value:772});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ONE_MINUS_DST_ALPHA",{configurable:false,enumerable:true,writable:false,value:773});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DST_COLOR",{configurable:false,enumerable:true,writable:false,value:774});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ONE_MINUS_DST_COLOR",{configurable:false,enumerable:true,writable:false,value:775});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"SRC_ALPHA_SATURATE",{configurable:false,enumerable:true,writable:false,value:776});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FUNC_ADD",{configurable:false,enumerable:true,writable:false,value:32774});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BLEND_EQUATION",{configurable:false,enumerable:true,writable:false,value:32777});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BLEND_EQUATION_RGB",{configurable:false,enumerable:true,writable:false,value:32777});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BLEND_EQUATION_ALPHA",{configurable:false,enumerable:true,writable:false,value:34877});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FUNC_SUBTRACT",{configurable:false,enumerable:true,writable:false,value:32778});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FUNC_REVERSE_SUBTRACT",{configurable:false,enumerable:true,writable:false,value:32779});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BLEND_DST_RGB",{configurable:false,enumerable:true,writable:false,value:32968});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BLEND_SRC_RGB",{configurable:false,enumerable:true,writable:false,value:32969});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BLEND_DST_ALPHA",{configurable:false,enumerable:true,writable:false,value:32970});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BLEND_SRC_ALPHA",{configurable:false,enumerable:true,writable:false,value:32971});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"CONSTANT_COLOR",{configurable:false,enumerable:true,writable:false,value:32769});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ONE_MINUS_CONSTANT_COLOR",{configurable:false,enumerable:true,writable:false,value:32770});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"CONSTANT_ALPHA",{configurable:false,enumerable:true,writable:false,value:32771});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ONE_MINUS_CONSTANT_ALPHA",{configurable:false,enumerable:true,writable:false,value:32772});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BLEND_COLOR",{configurable:false,enumerable:true,writable:false,value:32773});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ARRAY_BUFFER",{configurable:false,enumerable:true,writable:false,value:34962});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ELEMENT_ARRAY_BUFFER",{configurable:false,enumerable:true,writable:false,value:34963});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ARRAY_BUFFER_BINDING",{configurable:false,enumerable:true,writable:false,value:34964});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ELEMENT_ARRAY_BUFFER_BINDING",{configurable:false,enumerable:true,writable:false,value:34965});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STREAM_DRAW",{configurable:false,enumerable:true,writable:false,value:35040});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STATIC_DRAW",{configurable:false,enumerable:true,writable:false,value:35044});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DYNAMIC_DRAW",{configurable:false,enumerable:true,writable:false,value:35048});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BUFFER_SIZE",{configurable:false,enumerable:true,writable:false,value:34660});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BUFFER_USAGE",{configurable:false,enumerable:true,writable:false,value:34661});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"CURRENT_VERTEX_ATTRIB",{configurable:false,enumerable:true,writable:false,value:34342});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FRONT",{configurable:false,enumerable:true,writable:false,value:1028});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BACK",{configurable:false,enumerable:true,writable:false,value:1029});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FRONT_AND_BACK",{configurable:false,enumerable:true,writable:false,value:1032});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE_2D",{configurable:false,enumerable:true,writable:false,value:3553});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"CULL_FACE",{configurable:false,enumerable:true,writable:false,value:2884});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BLEND",{configurable:false,enumerable:true,writable:false,value:3042});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DITHER",{configurable:false,enumerable:true,writable:false,value:3024});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_TEST",{configurable:false,enumerable:true,writable:false,value:2960});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DEPTH_TEST",{configurable:false,enumerable:true,writable:false,value:2929});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"SCISSOR_TEST",{configurable:false,enumerable:true,writable:false,value:3089});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"POLYGON_OFFSET_FILL",{configurable:false,enumerable:true,writable:false,value:32823});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"SAMPLE_ALPHA_TO_COVERAGE",{configurable:false,enumerable:true,writable:false,value:32926});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"SAMPLE_COVERAGE",{configurable:false,enumerable:true,writable:false,value:32928});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"NO_ERROR",{configurable:false,enumerable:true,writable:false,value:0});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"INVALID_ENUM",{configurable:false,enumerable:true,writable:false,value:1280});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"INVALID_VALUE",{configurable:false,enumerable:true,writable:false,value:1281});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"INVALID_OPERATION",{configurable:false,enumerable:true,writable:false,value:1282});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"OUT_OF_MEMORY",{configurable:false,enumerable:true,writable:false,value:1285});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"CW",{configurable:false,enumerable:true,writable:false,value:2304});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"CCW",{configurable:false,enumerable:true,writable:false,value:2305});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"LINE_WIDTH",{configurable:false,enumerable:true,writable:false,value:2849});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ALIASED_POINT_SIZE_RANGE",{configurable:false,enumerable:true,writable:false,value:33901});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ALIASED_LINE_WIDTH_RANGE",{configurable:false,enumerable:true,writable:false,value:33902});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"CULL_FACE_MODE",{configurable:false,enumerable:true,writable:false,value:2885});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FRONT_FACE",{configurable:false,enumerable:true,writable:false,value:2886});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DEPTH_RANGE",{configurable:false,enumerable:true,writable:false,value:2928});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DEPTH_WRITEMASK",{configurable:false,enumerable:true,writable:false,value:2930});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DEPTH_CLEAR_VALUE",{configurable:false,enumerable:true,writable:false,value:2931});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DEPTH_FUNC",{configurable:false,enumerable:true,writable:false,value:2932});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_CLEAR_VALUE",{configurable:false,enumerable:true,writable:false,value:2961});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_FUNC",{configurable:false,enumerable:true,writable:false,value:2962});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_FAIL",{configurable:false,enumerable:true,writable:false,value:2964});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_PASS_DEPTH_FAIL",{configurable:false,enumerable:true,writable:false,value:2965});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_PASS_DEPTH_PASS",{configurable:false,enumerable:true,writable:false,value:2966});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_REF",{configurable:false,enumerable:true,writable:false,value:2967});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_VALUE_MASK",{configurable:false,enumerable:true,writable:false,value:2963});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_WRITEMASK",{configurable:false,enumerable:true,writable:false,value:2968});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_BACK_FUNC",{configurable:false,enumerable:true,writable:false,value:34816});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_BACK_FAIL",{configurable:false,enumerable:true,writable:false,value:34817});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_BACK_PASS_DEPTH_FAIL",{configurable:false,enumerable:true,writable:false,value:34818});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_BACK_PASS_DEPTH_PASS",{configurable:false,enumerable:true,writable:false,value:34819});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_BACK_REF",{configurable:false,enumerable:true,writable:false,value:36003});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_BACK_VALUE_MASK",{configurable:false,enumerable:true,writable:false,value:36004});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_BACK_WRITEMASK",{configurable:false,enumerable:true,writable:false,value:36005});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"VIEWPORT",{configurable:false,enumerable:true,writable:false,value:2978});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"SCISSOR_BOX",{configurable:false,enumerable:true,writable:false,value:3088});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"COLOR_CLEAR_VALUE",{configurable:false,enumerable:true,writable:false,value:3106});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"COLOR_WRITEMASK",{configurable:false,enumerable:true,writable:false,value:3107});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"UNPACK_ALIGNMENT",{configurable:false,enumerable:true,writable:false,value:3317});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"PACK_ALIGNMENT",{configurable:false,enumerable:true,writable:false,value:3333});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"MAX_TEXTURE_SIZE",{configurable:false,enumerable:true,writable:false,value:3379});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"MAX_VIEWPORT_DIMS",{configurable:false,enumerable:true,writable:false,value:3386});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"SUBPIXEL_BITS",{configurable:false,enumerable:true,writable:false,value:3408});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RED_BITS",{configurable:false,enumerable:true,writable:false,value:3410});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"GREEN_BITS",{configurable:false,enumerable:true,writable:false,value:3411});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BLUE_BITS",{configurable:false,enumerable:true,writable:false,value:3412});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ALPHA_BITS",{configurable:false,enumerable:true,writable:false,value:3413});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DEPTH_BITS",{configurable:false,enumerable:true,writable:false,value:3414});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_BITS",{configurable:false,enumerable:true,writable:false,value:3415});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"POLYGON_OFFSET_UNITS",{configurable:false,enumerable:true,writable:false,value:10752});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"POLYGON_OFFSET_FACTOR",{configurable:false,enumerable:true,writable:false,value:32824});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE_BINDING_2D",{configurable:false,enumerable:true,writable:false,value:32873});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"SAMPLE_BUFFERS",{configurable:false,enumerable:true,writable:false,value:32936});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"SAMPLES",{configurable:false,enumerable:true,writable:false,value:32937});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"SAMPLE_COVERAGE_VALUE",{configurable:false,enumerable:true,writable:false,value:32938});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"SAMPLE_COVERAGE_INVERT",{configurable:false,enumerable:true,writable:false,value:32939});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"COMPRESSED_TEXTURE_FORMATS",{configurable:false,enumerable:true,writable:false,value:34467});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DONT_CARE",{configurable:false,enumerable:true,writable:false,value:4352});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FASTEST",{configurable:false,enumerable:true,writable:false,value:4353});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"NICEST",{configurable:false,enumerable:true,writable:false,value:4354});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"GENERATE_MIPMAP_HINT",{configurable:false,enumerable:true,writable:false,value:33170});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BYTE",{configurable:false,enumerable:true,writable:false,value:5120});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"UNSIGNED_BYTE",{configurable:false,enumerable:true,writable:false,value:5121});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"SHORT",{configurable:false,enumerable:true,writable:false,value:5122});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"UNSIGNED_SHORT",{configurable:false,enumerable:true,writable:false,value:5123});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"INT",{configurable:false,enumerable:true,writable:false,value:5124});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"UNSIGNED_INT",{configurable:false,enumerable:true,writable:false,value:5125});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FLOAT",{configurable:false,enumerable:true,writable:false,value:5126});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DEPTH_COMPONENT",{configurable:false,enumerable:true,writable:false,value:6402});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ALPHA",{configurable:false,enumerable:true,writable:false,value:6406});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RGB",{configurable:false,enumerable:true,writable:false,value:6407});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RGBA",{configurable:false,enumerable:true,writable:false,value:6408});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"LUMINANCE",{configurable:false,enumerable:true,writable:false,value:6409});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"LUMINANCE_ALPHA",{configurable:false,enumerable:true,writable:false,value:6410});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"UNSIGNED_SHORT_4_4_4_4",{configurable:false,enumerable:true,writable:false,value:32819});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"UNSIGNED_SHORT_5_5_5_1",{configurable:false,enumerable:true,writable:false,value:32820});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"UNSIGNED_SHORT_5_6_5",{configurable:false,enumerable:true,writable:false,value:33635});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FRAGMENT_SHADER",{configurable:false,enumerable:true,writable:false,value:35632});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"VERTEX_SHADER",{configurable:false,enumerable:true,writable:false,value:35633});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"MAX_VERTEX_ATTRIBS",{configurable:false,enumerable:true,writable:false,value:34921});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"MAX_VERTEX_UNIFORM_VECTORS",{configurable:false,enumerable:true,writable:false,value:36347});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"MAX_VARYING_VECTORS",{configurable:false,enumerable:true,writable:false,value:36348});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"MAX_COMBINED_TEXTURE_IMAGE_UNITS",{configurable:false,enumerable:true,writable:false,value:35661});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"MAX_VERTEX_TEXTURE_IMAGE_UNITS",{configurable:false,enumerable:true,writable:false,value:35660});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"MAX_TEXTURE_IMAGE_UNITS",{configurable:false,enumerable:true,writable:false,value:34930});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"MAX_FRAGMENT_UNIFORM_VECTORS",{configurable:false,enumerable:true,writable:false,value:36349});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"SHADER_TYPE",{configurable:false,enumerable:true,writable:false,value:35663});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DELETE_STATUS",{configurable:false,enumerable:true,writable:false,value:35712});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"LINK_STATUS",{configurable:false,enumerable:true,writable:false,value:35714});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"VALIDATE_STATUS",{configurable:false,enumerable:true,writable:false,value:35715});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ATTACHED_SHADERS",{configurable:false,enumerable:true,writable:false,value:35717});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ACTIVE_UNIFORMS",{configurable:false,enumerable:true,writable:false,value:35718});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ACTIVE_ATTRIBUTES",{configurable:false,enumerable:true,writable:false,value:35721});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"SHADING_LANGUAGE_VERSION",{configurable:false,enumerable:true,writable:false,value:35724});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"CURRENT_PROGRAM",{configurable:false,enumerable:true,writable:false,value:35725});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"NEVER",{configurable:false,enumerable:true,writable:false,value:512});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"LESS",{configurable:false,enumerable:true,writable:false,value:513});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"EQUAL",{configurable:false,enumerable:true,writable:false,value:514});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"LEQUAL",{configurable:false,enumerable:true,writable:false,value:515});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"GREATER",{configurable:false,enumerable:true,writable:false,value:516});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"NOTEQUAL",{configurable:false,enumerable:true,writable:false,value:517});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"GEQUAL",{configurable:false,enumerable:true,writable:false,value:518});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ALWAYS",{configurable:false,enumerable:true,writable:false,value:519});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"KEEP",{configurable:false,enumerable:true,writable:false,value:7680});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"REPLACE",{configurable:false,enumerable:true,writable:false,value:7681});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"INCR",{configurable:false,enumerable:true,writable:false,value:7682});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DECR",{configurable:false,enumerable:true,writable:false,value:7683});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"INVERT",{configurable:false,enumerable:true,writable:false,value:5386});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"INCR_WRAP",{configurable:false,enumerable:true,writable:false,value:34055});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DECR_WRAP",{configurable:false,enumerable:true,writable:false,value:34056});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"VENDOR",{configurable:false,enumerable:true,writable:false,value:7936});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RENDERER",{configurable:false,enumerable:true,writable:false,value:7937});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"VERSION",{configurable:false,enumerable:true,writable:false,value:7938});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"NEAREST",{configurable:false,enumerable:true,writable:false,value:9728});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"LINEAR",{configurable:false,enumerable:true,writable:false,value:9729});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"NEAREST_MIPMAP_NEAREST",{configurable:false,enumerable:true,writable:false,value:9984});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"LINEAR_MIPMAP_NEAREST",{configurable:false,enumerable:true,writable:false,value:9985});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"NEAREST_MIPMAP_LINEAR",{configurable:false,enumerable:true,writable:false,value:9986});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"LINEAR_MIPMAP_LINEAR",{configurable:false,enumerable:true,writable:false,value:9987});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE_MAG_FILTER",{configurable:false,enumerable:true,writable:false,value:10240});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE_MIN_FILTER",{configurable:false,enumerable:true,writable:false,value:10241});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE_WRAP_S",{configurable:false,enumerable:true,writable:false,value:10242});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE_WRAP_T",{configurable:false,enumerable:true,writable:false,value:10243});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE",{configurable:false,enumerable:true,writable:false,value:5890});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE_CUBE_MAP",{configurable:false,enumerable:true,writable:false,value:34067});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE_BINDING_CUBE_MAP",{configurable:false,enumerable:true,writable:false,value:34068});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE_CUBE_MAP_POSITIVE_X",{configurable:false,enumerable:true,writable:false,value:34069});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE_CUBE_MAP_NEGATIVE_X",{configurable:false,enumerable:true,writable:false,value:34070});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE_CUBE_MAP_POSITIVE_Y",{configurable:false,enumerable:true,writable:false,value:34071});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE_CUBE_MAP_NEGATIVE_Y",{configurable:false,enumerable:true,writable:false,value:34072});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE_CUBE_MAP_POSITIVE_Z",{configurable:false,enumerable:true,writable:false,value:34073});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE_CUBE_MAP_NEGATIVE_Z",{configurable:false,enumerable:true,writable:false,value:34074});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"MAX_CUBE_MAP_TEXTURE_SIZE",{configurable:false,enumerable:true,writable:false,value:34076});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE0",{configurable:false,enumerable:true,writable:false,value:33984});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE1",{configurable:false,enumerable:true,writable:false,value:33985});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE2",{configurable:false,enumerable:true,writable:false,value:33986});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE3",{configurable:false,enumerable:true,writable:false,value:33987});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE4",{configurable:false,enumerable:true,writable:false,value:33988});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE5",{configurable:false,enumerable:true,writable:false,value:33989});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE6",{configurable:false,enumerable:true,writable:false,value:33990});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE7",{configurable:false,enumerable:true,writable:false,value:33991});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE8",{configurable:false,enumerable:true,writable:false,value:33992});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE9",{configurable:false,enumerable:true,writable:false,value:33993});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE10",{configurable:false,enumerable:true,writable:false,value:33994});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE11",{configurable:false,enumerable:true,writable:false,value:33995});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE12",{configurable:false,enumerable:true,writable:false,value:33996});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE13",{configurable:false,enumerable:true,writable:false,value:33997});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE14",{configurable:false,enumerable:true,writable:false,value:33998});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE15",{configurable:false,enumerable:true,writable:false,value:33999});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE16",{configurable:false,enumerable:true,writable:false,value:34000});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE17",{configurable:false,enumerable:true,writable:false,value:34001});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE18",{configurable:false,enumerable:true,writable:false,value:34002});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE19",{configurable:false,enumerable:true,writable:false,value:34003});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE20",{configurable:false,enumerable:true,writable:false,value:34004});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE21",{configurable:false,enumerable:true,writable:false,value:34005});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE22",{configurable:false,enumerable:true,writable:false,value:34006});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE23",{configurable:false,enumerable:true,writable:false,value:34007});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE24",{configurable:false,enumerable:true,writable:false,value:34008});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE25",{configurable:false,enumerable:true,writable:false,value:34009});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE26",{configurable:false,enumerable:true,writable:false,value:34010});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE27",{configurable:false,enumerable:true,writable:false,value:34011});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE28",{configurable:false,enumerable:true,writable:false,value:34012});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE29",{configurable:false,enumerable:true,writable:false,value:34013});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE30",{configurable:false,enumerable:true,writable:false,value:34014});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"TEXTURE31",{configurable:false,enumerable:true,writable:false,value:34015});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"ACTIVE_TEXTURE",{configurable:false,enumerable:true,writable:false,value:34016});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"REPEAT",{configurable:false,enumerable:true,writable:false,value:10497});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"CLAMP_TO_EDGE",{configurable:false,enumerable:true,writable:false,value:33071});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"MIRRORED_REPEAT",{configurable:false,enumerable:true,writable:false,value:33648});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FLOAT_VEC2",{configurable:false,enumerable:true,writable:false,value:35664});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FLOAT_VEC3",{configurable:false,enumerable:true,writable:false,value:35665});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FLOAT_VEC4",{configurable:false,enumerable:true,writable:false,value:35666});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"INT_VEC2",{configurable:false,enumerable:true,writable:false,value:35667});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"INT_VEC3",{configurable:false,enumerable:true,writable:false,value:35668});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"INT_VEC4",{configurable:false,enumerable:true,writable:false,value:35669});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BOOL",{configurable:false,enumerable:true,writable:false,value:35670});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BOOL_VEC2",{configurable:false,enumerable:true,writable:false,value:35671});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BOOL_VEC3",{configurable:false,enumerable:true,writable:false,value:35672});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BOOL_VEC4",{configurable:false,enumerable:true,writable:false,value:35673});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FLOAT_MAT2",{configurable:false,enumerable:true,writable:false,value:35674});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FLOAT_MAT3",{configurable:false,enumerable:true,writable:false,value:35675});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FLOAT_MAT4",{configurable:false,enumerable:true,writable:false,value:35676});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"SAMPLER_2D",{configurable:false,enumerable:true,writable:false,value:35678});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"SAMPLER_CUBE",{configurable:false,enumerable:true,writable:false,value:35680});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"VERTEX_ATTRIB_ARRAY_ENABLED",{configurable:false,enumerable:true,writable:false,value:34338});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"VERTEX_ATTRIB_ARRAY_SIZE",{configurable:false,enumerable:true,writable:false,value:34339});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"VERTEX_ATTRIB_ARRAY_STRIDE",{configurable:false,enumerable:true,writable:false,value:34340});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"VERTEX_ATTRIB_ARRAY_TYPE",{configurable:false,enumerable:true,writable:false,value:34341});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"VERTEX_ATTRIB_ARRAY_NORMALIZED",{configurable:false,enumerable:true,writable:false,value:34922});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"VERTEX_ATTRIB_ARRAY_POINTER",{configurable:false,enumerable:true,writable:false,value:34373});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"VERTEX_ATTRIB_ARRAY_BUFFER_BINDING",{configurable:false,enumerable:true,writable:false,value:34975});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"IMPLEMENTATION_COLOR_READ_TYPE",{configurable:false,enumerable:true,writable:false,value:35738});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"IMPLEMENTATION_COLOR_READ_FORMAT",{configurable:false,enumerable:true,writable:false,value:35739});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"COMPILE_STATUS",{configurable:false,enumerable:true,writable:false,value:35713});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"LOW_FLOAT",{configurable:false,enumerable:true,writable:false,value:36336});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"MEDIUM_FLOAT",{configurable:false,enumerable:true,writable:false,value:36337});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"HIGH_FLOAT",{configurable:false,enumerable:true,writable:false,value:36338});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"LOW_INT",{configurable:false,enumerable:true,writable:false,value:36339});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"MEDIUM_INT",{configurable:false,enumerable:true,writable:false,value:36340});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"HIGH_INT",{configurable:false,enumerable:true,writable:false,value:36341});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FRAMEBUFFER",{configurable:false,enumerable:true,writable:false,value:36160});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RENDERBUFFER",{configurable:false,enumerable:true,writable:false,value:36161});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RGBA4",{configurable:false,enumerable:true,writable:false,value:32854});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RGB5_A1",{configurable:false,enumerable:true,writable:false,value:32855});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RGB565",{configurable:false,enumerable:true,writable:false,value:36194});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DEPTH_COMPONENT16",{configurable:false,enumerable:true,writable:false,value:33189});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_INDEX8",{configurable:false,enumerable:true,writable:false,value:36168});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DEPTH_STENCIL",{configurable:false,enumerable:true,writable:false,value:34041});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RENDERBUFFER_WIDTH",{configurable:false,enumerable:true,writable:false,value:36162});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RENDERBUFFER_HEIGHT",{configurable:false,enumerable:true,writable:false,value:36163});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RENDERBUFFER_INTERNAL_FORMAT",{configurable:false,enumerable:true,writable:false,value:36164});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RENDERBUFFER_RED_SIZE",{configurable:false,enumerable:true,writable:false,value:36176});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RENDERBUFFER_GREEN_SIZE",{configurable:false,enumerable:true,writable:false,value:36177});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RENDERBUFFER_BLUE_SIZE",{configurable:false,enumerable:true,writable:false,value:36178});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RENDERBUFFER_ALPHA_SIZE",{configurable:false,enumerable:true,writable:false,value:36179});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RENDERBUFFER_DEPTH_SIZE",{configurable:false,enumerable:true,writable:false,value:36180});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RENDERBUFFER_STENCIL_SIZE",{configurable:false,enumerable:true,writable:false,value:36181});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE",{configurable:false,enumerable:true,writable:false,value:36048});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FRAMEBUFFER_ATTACHMENT_OBJECT_NAME",{configurable:false,enumerable:true,writable:false,value:36049});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL",{configurable:false,enumerable:true,writable:false,value:36050});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE",{configurable:false,enumerable:true,writable:false,value:36051});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"COLOR_ATTACHMENT0",{configurable:false,enumerable:true,writable:false,value:36064});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DEPTH_ATTACHMENT",{configurable:false,enumerable:true,writable:false,value:36096});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"STENCIL_ATTACHMENT",{configurable:false,enumerable:true,writable:false,value:36128});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"DEPTH_STENCIL_ATTACHMENT",{configurable:false,enumerable:true,writable:false,value:33306});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"NONE",{configurable:false,enumerable:true,writable:false,value:0});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FRAMEBUFFER_COMPLETE",{configurable:false,enumerable:true,writable:false,value:36053});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FRAMEBUFFER_INCOMPLETE_ATTACHMENT",{configurable:false,enumerable:true,writable:false,value:36054});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT",{configurable:false,enumerable:true,writable:false,value:36055});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FRAMEBUFFER_INCOMPLETE_DIMENSIONS",{configurable:false,enumerable:true,writable:false,value:36057});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FRAMEBUFFER_UNSUPPORTED",{configurable:false,enumerable:true,writable:false,value:36061});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"FRAMEBUFFER_BINDING",{configurable:false,enumerable:true,writable:false,value:36006});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RENDERBUFFER_BINDING",{configurable:false,enumerable:true,writable:false,value:36007});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"MAX_RENDERBUFFER_SIZE",{configurable:false,enumerable:true,writable:false,value:34024});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"INVALID_FRAMEBUFFER_OPERATION",{configurable:false,enumerable:true,writable:false,value:1286});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"UNPACK_FLIP_Y_WEBGL",{configurable:false,enumerable:true,writable:false,value:37440});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"UNPACK_PREMULTIPLY_ALPHA_WEBGL",{configurable:false,enumerable:true,writable:false,value:37441});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"CONTEXT_LOST_WEBGL",{configurable:false,enumerable:true,writable:false,value:37442});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"UNPACK_COLORSPACE_CONVERSION_WEBGL",{configurable:false,enumerable:true,writable:false,value:37443});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"BROWSER_DEFAULT_WEBGL",{configurable:false,enumerable:true,writable:false,value:37444});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"activeTexture",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "activeTexture", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"attachShader",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "attachShader", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"bindAttribLocation",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "bindAttribLocation", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"bindRenderbuffer",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "bindRenderbuffer", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"blendColor",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "blendColor", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"blendEquation",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "blendEquation", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"blendEquationSeparate",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "blendEquationSeparate", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"blendFunc",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "blendFunc", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"blendFuncSeparate",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "blendFuncSeparate", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"bufferData",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "bufferData", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"bufferSubData",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "bufferSubData", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"checkFramebufferStatus",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "checkFramebufferStatus", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"compileShader",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "compileShader", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"compressedTexImage2D",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "compressedTexImage2D", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"compressedTexSubImage2D",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "compressedTexSubImage2D", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"copyTexImage2D",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "copyTexImage2D", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"copyTexSubImage2D",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "copyTexSubImage2D", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"createBuffer",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "createBuffer", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"createFramebuffer",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "createFramebuffer", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"createProgram",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "createProgram", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"createRenderbuffer",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "createRenderbuffer", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"createShader",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "createShader", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"createTexture",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "createTexture", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"cullFace",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "cullFace", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"deleteBuffer",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "deleteBuffer", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"deleteFramebuffer",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "deleteFramebuffer", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"deleteProgram",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "deleteProgram", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"deleteRenderbuffer",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "deleteRenderbuffer", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"deleteShader",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "deleteShader", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"deleteTexture",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "deleteTexture", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"depthFunc",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "depthFunc", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"depthMask",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "depthMask", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"depthRange",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "depthRange", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"detachShader",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "detachShader", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"disable",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "disable", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"enable",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "enable", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"finish",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "finish", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"flush",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "flush", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"framebufferRenderbuffer",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "framebufferRenderbuffer", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"framebufferTexture2D",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "framebufferTexture2D", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"frontFace",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "frontFace", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"generateMipmap",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "generateMipmap", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getActiveAttrib",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getActiveAttrib", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getActiveUniform",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getActiveUniform", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getAttachedShaders",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getAttachedShaders", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getAttribLocation",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getAttribLocation", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getBufferParameter",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getBufferParameter", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getContextAttributes",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getContextAttributes", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getError",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getError", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getExtension",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getExtension", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getFramebufferAttachmentParameter",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getFramebufferAttachmentParameter", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getParameter",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getParameter", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getProgramInfoLog",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getProgramInfoLog", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getProgramParameter",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getProgramParameter", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getRenderbufferParameter",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getRenderbufferParameter", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getShaderInfoLog",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getShaderInfoLog", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getShaderParameter",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getShaderParameter", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getShaderPrecisionFormat",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getShaderPrecisionFormat", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getShaderSource",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getShaderSource", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getSupportedExtensions",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getSupportedExtensions", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getTexParameter",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getTexParameter", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getUniform",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getUniform", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getUniformLocation",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getUniformLocation", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getVertexAttrib",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getVertexAttrib", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"getVertexAttribOffset",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getVertexAttribOffset", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"hint",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "hint", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"isBuffer",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "isBuffer", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"isContextLost",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "isContextLost", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"isEnabled",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "isEnabled", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"isFramebuffer",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "isFramebuffer", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"isProgram",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "isProgram", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"isRenderbuffer",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "isRenderbuffer", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"isShader",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "isShader", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"isTexture",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "isTexture", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"lineWidth",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "lineWidth", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"linkProgram",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "linkProgram", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"pixelStorei",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "pixelStorei", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"polygonOffset",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "polygonOffset", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"readPixels",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "readPixels", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"renderbufferStorage",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "renderbufferStorage", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"sampleCoverage",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "sampleCoverage", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"shaderSource",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "shaderSource", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"stencilFunc",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "stencilFunc", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"stencilFuncSeparate",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "stencilFuncSeparate", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"stencilMask",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "stencilMask", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"stencilMaskSeparate",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "stencilMaskSeparate", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"stencilOp",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "stencilOp", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"stencilOpSeparate",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "stencilOpSeparate", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"texImage2D",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "texImage2D", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"texParameterf",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "texParameterf", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"texParameteri",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "texParameteri", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"texSubImage2D",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "texSubImage2D", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"useProgram",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "useProgram", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"validateProgram",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "validateProgram", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"bindBuffer",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "bindBuffer", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"bindFramebuffer",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "bindFramebuffer", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"bindTexture",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "bindTexture", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"clear",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "clear", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"clearColor",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "clearColor", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"clearDepth",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "clearDepth", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"clearStencil",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "clearStencil", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"colorMask",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "colorMask", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"disableVertexAttribArray",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "disableVertexAttribArray", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"drawArrays",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "drawArrays", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"drawElements",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "drawElements", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"enableVertexAttribArray",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "enableVertexAttribArray", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"scissor",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "scissor", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniform1f",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform1f", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniform1fv",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform1fv", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniform1i",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform1i", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniform1iv",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform1iv", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniform2f",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform2f", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniform2fv",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform2fv", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniform2i",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform2i", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniform2iv",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform2iv", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniform3f",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform3f", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniform3fv",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform3fv", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniform3i",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform3i", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniform3iv",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform3iv", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniform4f",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform4f", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniform4fv",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform4fv", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniform4i",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform4i", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniform4iv",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform4iv", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniformMatrix2fv",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniformMatrix2fv", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniformMatrix3fv",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniformMatrix3fv", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"uniformMatrix4fv",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniformMatrix4fv", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"vertexAttrib1f",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttrib1f", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"vertexAttrib1fv",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttrib1fv", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"vertexAttrib2f",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttrib2f", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"vertexAttrib2fv",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttrib2fv", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"vertexAttrib3f",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttrib3f", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"vertexAttrib3fv",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttrib3fv", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"vertexAttrib4f",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttrib4f", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"vertexAttrib4fv",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttrib4fv", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"vertexAttribPointer",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttribPointer", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"viewport",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "viewport", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"drawingBufferFormat",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "drawingBufferFormat_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RGB8",{configurable:false,enumerable:true,writable:false,value:32849});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"RGBA8",{configurable:false,enumerable:true,writable:false,value:32856});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"drawingBufferStorage",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "drawingBufferStorage", arguments)}});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype,"makeXRCompatible",{configurable:true,enumerable:true,writable:true,value: function () { return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "makeXRCompatible", arguments)}});

//window对象

//删除浏览器中不存在的对象
delete global;
delete Buffer;
delete process;
// delete GlOBAL;
// delete VM2_INTERNAL_STATE_DO_NOT_USE_OR_PROGRAM_WILL_FAIL;
delete WindowProperties;
delete globalThis[Symbol.toStringTag];
window = globalThis;

Object.setPrototypeOf(window, Window.prototype);

ldvm.toolsFunc.defineProperty(window, "atob", {
    "writable": true,
    "enumerable": true,
    "configurable": true,
    value: function atob(str) {
        return ldvm.toolsFunc.base64.base64decode(str);
    }
});

ldvm.toolsFunc.defineProperty(window, "btoa", {
    "writable": true,
    "enumerable": true,
    "configurable": true,
    value: function btoa(str) {
        return ldvm.toolsFunc.base64.base64encode(str);
    }
});

ldvm.toolsFunc.defineProperty(window, "name", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, window, "window", "name_get", arguments,)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, window, "window", "name_set", arguments)
    }
});


ldvm.toolsFunc.defineProperty(window, "location", {
    configurable: false, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, window, "window", "location_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, window, "window", "location_set", arguments)
    }
});

ldvm.toolsFunc.defineProperty(window, "top", {
    configurable: false, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, window, "window", "top_get", arguments)
    }, set: undefined
});


ldvm.toolsFunc.defineProperty(window, "self", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, window, "window", "self_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, window, "window", "self_set", arguments)
    }
});

// eval= ldvm.toolsFunc.hook(eval,undefined,false,function (){},function (){});
// Screen 对象
Screen = function Screen(){ldvm.toolsFunc.throwError("TypeError", "Failed to construct 'Screen': Illegal constructor");}
ldvm.toolsFunc.safeProto(Screen, "Screen");
Object.setPrototypeOf(Screen.prototype, EventTarget.prototype);
ldvm.toolsFunc.defineProperty(Screen.prototype,"availWidth",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Screen.prototype, "Screen", "availWidth_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Screen.prototype,"availHeight",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Screen.prototype, "Screen", "availHeight_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Screen.prototype,"width",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Screen.prototype, "Screen", "width_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Screen.prototype,"height",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Screen.prototype, "Screen", "height_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Screen.prototype,"colorDepth",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Screen.prototype, "Screen", "colorDepth_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Screen.prototype,"pixelDepth",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Screen.prototype, "Screen", "pixelDepth_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Screen.prototype,"availLeft",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Screen.prototype, "Screen", "availLeft_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Screen.prototype,"availTop",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Screen.prototype, "Screen", "availTop_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Screen.prototype,"orientation",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Screen.prototype, "Screen", "orientation_get", arguments)},set:undefined});
ldvm.toolsFunc.defineProperty(Screen.prototype,"onchange",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Screen.prototype, "Screen", "onchange_get", arguments)},set: function () { return ldvm.toolsFunc.dispatch(this, Screen.prototype, "Screen", "onchange_set", arguments)}});
ldvm.toolsFunc.defineProperty(Screen.prototype,"isExtended",{configurable:true,enumerable:true,get: function () { return ldvm.toolsFunc.dispatch(this, Screen.prototype, "Screen", "isExtended_get", arguments)},set:undefined});

// screen对象
screen = {
    width:1920,
    height:1080
}
Object.setPrototypeOf(screen,Screen.prototype);


//全局变量初始化
!function () {
    onEnter = function (obj) {
        try {
            ldvm.toolsFunc.printLog(obj.args);
        } catch (e) {
        }
    }
    console.log = ldvm.toolsFunc.hook(
        console.log,
        undefined,
        false,
        onEnter,
        function () {
        },
        ldvm.config.print
    );
    ldvm.toolsFunc.createPlugin({
        "description": "Portable Document Format",
        "filename": "internal-pdf-viewer",
        "name": "PDF Viewer",
        "mimeTypes": [
            {
                "type": "application/pdf",
                "suffixes": "pdf",
                "description": "Portable Document Format"
            },
            {
                "type": "text/pdf",
                "suffixes": "pdf",
                "description": "Portable Document Format"
            }
        ]
    });
    ldvm.toolsFunc.createPlugin({
        "description": "Portable Document Format",
        "filename": "internal-pdf-viewer",
        "name": "Chrome PDF Viewer",
        "mimeTypes": [
            {
                "type": "application/pdf",
                "suffixes": "pdf",
                "description": "Portable Document Format"
            },
            {
                "type": "text/pdf",
                "suffixes": "pdf",
                "description": "Portable Document Format"
            }
        ]
    });
    ldvm.toolsFunc.createPlugin({
        "description": "Portable Document Format",
        "filename": "internal-pdf-viewer",
        "name": "Chromium PDF Viewer",
        "mimeTypes": [
            {
                "type": "application/pdf",
                "suffixes": "pdf",
                "description": "Portable Document Format"
            },
            {
                "type": "text/pdf",
                "suffixes": "pdf",
                "description": "Portable Document Format"
            }
        ]
    });
    ldvm.toolsFunc.createPlugin({
        "description": "Portable Document Format",
        "filename": "internal-pdf-viewer",
        "name": "Microsoft Edge PDF Viewer",
        "mimeTypes": [
            {
                "type": "application/pdf",
                "suffixes": "pdf",
                "description": "Portable Document Format"
            },
            {
                "type": "text/pdf",
                "suffixes": "pdf",
                "description": "Portable Document Format"
            }
        ]
    });
    ldvm.toolsFunc.createPlugin({
        "description": "Portable Document Format",
        "filename": "internal-pdf-viewer",
        "name": "WebKit built-in PDF",
        "mimeTypes": [
            {
                "type": "application/pdf",
                "suffixes": "pdf",
                "description": "Portable Document Format"
            },
            {
                "type": "text/pdf",
                "suffixes": "pdf",
                "description": "Portable Document Format"
            }
        ]
    });
}();
//网页变量初始化

!function () {
    // ldvm.memory.globalVar.jsonCookie = {
    //     "QN1": "000102802f1069cd64082ba6",
    //     "QN48": "551e2039-eaf5-42e0-89f2-674df3b68b96",
    //     "QN300": "organic",
    //     "ctt_june": "1683616182042##iK3wWSX%3DauPwawPwasWRa%3DXwEP3OERgsWstmWSt%2BWRjnEREDEDiRWSXAXsg%3DiK3siK3saKgsWSj%3DVRawaKv8aUPwaUvt",
    //     "Alina": "c5d51773-0a0196-11422713-8690e003-558967832681",
    //     "QN601": "8759d566e70f9da389e00be4a77ba010",
    //     "quinn": "6ad53805188d57deeab79468313106ae35f17a03bc3c4f57130e50761f4d212cf0fd320009eceffa50fec6929c709cc6",
    //     "QN621": "fr%3Dtouch_index_search",
    //     "F235": "1738118404960",
    //     "QN668": "51%2C57%2C53%2C58%2C51%2C54%2C53%2C51%2C58%2C51%2C55%2C50%2C52",
    //     "ctf_june": "1683616182042##iK3wWS3%3DWhPwawPwa%3DD%3DaKanWRanEDWRWK2OWKHDESkRW2DAEDawE2WTaRPAiK3siK3saKgsVRD%3DasDmaSvAahPwaUvt",
    //     "cs_june": "84ca3a9b5a98782f34be6296a1606f06d2f8078570472611aef884fe5cddc86cb28517b9e90095deb7261a7e6ee1fbe8727a8a22efde110d05bc1541e857487eb17c80df7eee7c02a9c1a6a5b97c1179c8c2d6c0b6e35b8acf6ad3e1214e4edb5a737ae180251ef5be23400b098dd8ca"
    // }
    location.protocol = 'https:';
    location.host = 'm.flight.qunar.com';
    location.hostname = 'm.flight.qunar.com';
    location.pathname = '/ncs/page/flightlist';
}();
//需要代理的对象
// window=new Proxy(window,{});
localStorage = ldvm.toolsFunc.proxy(localStorage, "localStorage");
sessionStorage = ldvm.toolsFunc.proxy(sessionStorage, "sessionStorage");
location = ldvm.toolsFunc.proxy(location, "location");
document = ldvm.toolsFunc.proxy(document, "document");
window = ldvm.toolsFunc.proxy(window, "window");


            window.retainGodeyePages = ["touch_spa_inner_list_oneway","touch_spa_inner_otalist_oneway"];
            window.__start_time = 1738167179778;
            window.__local_start_time = Date.now();
            var _0x4238=['bzhMk','RUHJB','JyFOd','NuOmo','wdMBo','jZcic','YoWpQ','uJNhP','XAEaE','mzvqs','kEjSI','map','grnrA','LMDBj','rGfWD','VLEyF','xGxne','join','QhGUF','RyaEV','EqiiG','XAxNk','src','YDpfA','LLktk','host','indexOf','sMQFP','hostname','Gfrrh','wNhQK','_phantom','callPhantom','OBmpa','AwfiQ','userAgent','uJBHB','prototype','bind','RgqEg','replace','UMvCY','jKpEc','top','DDSZL','iERyY','pPyWO','BZADJ','QMark','log','TmJHI','webdriver','getElementsByTagName','djioA','uyHQe','rel','QbxrJ','vqCXT','eovKq','oZWxI','scBfk','vtsYU','faLBY','DJAWU','UmyWn','WKVmM','wvaoo','znaNG','pLaEI','content','LDjvS','HpjXi','wcQMZ','djvTL','yIpou','uFHJO','substr','VMrqh','reverse','mQcne','touch_spa_inter_list_oneway','&p=touch_spa_inter_list_oneway','img','/touch/api/domestic/help?index=','flight','flight_touch_react','enter','pagepts','&p=touch_spa_inner_list_oneway','NnQVF','https://log.flight.qunar.com/l?r=pagepts&apv=','&scr=','iAMCr','&p=touch_spa_home','flightlist','fOWpE','touch_spa_inner_otalist_oneway','interlist','interdetail','&p=touch_spa_inter_otalist_oneway','00000','00001','00010','00011','00101','00110','00111','01001','01011','01100','01101','01111','10000','10010','10011','10100','10101','10110','10111','11000','11001','11010','11100','11101','11111','.qunar.com','PhantomJS','Error','tcmFB','kAFmi','link','icon','meta','viewport','keywords','lNdAi','vwsoo','TniTQ','gTPPY','jgyry','ktckE','SAbMU','gXmjy','aKJZd','Hqagj','Iikiw','mLwKs','TIWTG','kHgUM','toString','split','length','KOSHZ','vPqgr','OnMYQ','OnpDw','IgVtn','tibRO','zLmwm','charAt','href','appVersion','width','tTSJZ','sxibl','xFauM','kJgfF','SUSKR','location','pathname','match','NellS','kayvr','YUxbX','aXczH','afgjq','CKFBM','PuSVZ','iZywE','IyHQj','GZLUq','Xifvg','wsVKq','QdUal','hOtYV','oldsR','xrQZl','qoCqT','theDm','NhMFN','tCeqI','hjsZd','TyeqN','retainGodeyePages','includes','fnHYA','EdrJP','VEmkM','zHZaO','TpmgB','EEcXH','uuXcS','LzxZS','qrfxt','IrpVd','WSRma','phrMd'];(function(_0x2e986b,_0x5076c3){var _0x31653a=function(_0x98e97e){while(--_0x98e97e){_0x2e986b['push'](_0x2e986b['shift']());}};var _0x1f416b=function(){var _0x4fa502={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x57b904,_0x2eabd4,_0xb936e8,_0x541d47){_0x541d47=_0x541d47||{};var _0x4ad739=_0x2eabd4+'='+_0xb936e8;var _0x4f701d=0x0;for(var _0x4f701d=0x0,_0x34426a=_0x57b904['length'];_0x4f701d<_0x34426a;_0x4f701d++){var _0x45b614=_0x57b904[_0x4f701d];_0x4ad739+=';\x20'+_0x45b614;var _0x3c21d7=_0x57b904[_0x45b614];_0x57b904['push'](_0x3c21d7);_0x34426a=_0x57b904['length'];if(_0x3c21d7!==!![]){_0x4ad739+='='+_0x3c21d7;}}_0x541d47['cookie']=_0x4ad739;},'removeCookie':function(){return'dev';},'getCookie':function(_0x19d214,_0x42ef47){_0x19d214=_0x19d214||function(_0x5c0986){return _0x5c0986;};var _0x46d491=_0x19d214(new RegExp('(?:^|;\x20)'+_0x42ef47['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x5e1978=function(_0x57dbdc,_0x41f87a){_0x57dbdc(++_0x41f87a);};_0x5e1978(_0x31653a,_0x5076c3);return _0x46d491?decodeURIComponent(_0x46d491[0x1]):undefined;}};var _0x36915e=function(){var _0x29c34=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return true;};_0x4fa502['updateCookie']=_0x36915e;var _0x1b7eea='';var _0x3d06ef=_0x4fa502['updateCookie']();if(!_0x3d06ef){_0x4fa502['setCookie'](['*'],'counter',0x1);}else if(_0x3d06ef){_0x1b7eea=_0x4fa502['getCookie'](null,'counter');}else{_0x4fa502['removeCookie']();}};_0x1f416b();}(_0x4238,0x1ed));var _0x1fce=function(_0x10ef7b,_0x2dc20c){_0x10ef7b=_0x10ef7b-0x0;var _0x1d6b82=_0x4238[_0x10ef7b];return _0x1d6b82;};(function(_0x1cec52){var _0x114c9a=function(){var _0x1a026c=!![];return function(_0x2492de,_0x2d8f05){var _0x4b81bb=_0x1a026c?function(){if(_0x2d8f05){var _0x4d74cb=_0x2d8f05['apply'](_0x2492de,arguments);_0x2d8f05=null;return _0x4d74cb;}}:function(){};_0x1a026c=![];return _0x4b81bb;};}();var _0x5d7d3d={'OnMYQ':function(_0x4c5bc5,_0x4a8ad6){return _0x4c5bc5(_0x4a8ad6);},'OnpDw':function(_0x15970a,_0x46c22f,_0x440fa3){return _0x15970a(_0x46c22f,_0x440fa3);},'CKFBM':function(_0xd4f3ca,_0x5cbeb3){return _0xd4f3ca(_0x5cbeb3);},'QdUal':function(_0x5651fe,_0x494dc9){return _0x5651fe(_0x494dc9);},'KOSHZ':function(_0x27cf45,_0x4d7174){return _0x27cf45!==_0x4d7174;},'kEjSI':_0x1fce('0x0'),'RyaEV':_0x1fce('0x1'),'EqiiG':function(_0x51dcb1,_0x4ba5f3){return _0x51dcb1+_0x4ba5f3;},'XAxNk':_0x1fce('0x2'),'QhGUF':'iqgjI','fnHYA':_0x1fce('0x3'),'MXVFI':function(_0x274215,_0x554990){return _0x274215+_0x554990;},'YDpfA':_0x1fce('0x4'),'TmJHI':_0x1fce('0x5'),'EdrJP':_0x1fce('0x6'),'VEmkM':'godeye','HpfwB':_0x1fce('0x7'),'zHZaO':_0x1fce('0x8'),'GZLUq':'touch_spa_inner_list_oneway','scBfk':function(_0x50dbaf,_0x4aa077){return _0x50dbaf+_0x4aa077;},'wsVKq':_0x1fce('0x9'),'IgVtn':function(_0x99c765,_0x14c0db){return _0x99c765(_0x14c0db);},'uFHJO':function(_0x19524d,_0x5088d0){return _0x19524d-_0x5088d0;},'TniTQ':'createElement','uBTlf':function(_0x270fd4,_0x3a08bd){return _0x270fd4+_0x3a08bd;},'gTPPY':function(_0x2278ff,_0x51bb90){return _0x2278ff+_0x51bb90;},'jgyry':'43*3418acc3263b','ktckE':'3194bc','SAbMU':'4691d20561e103b8f6','gXmjy':'0861727c8','aKJZd':'434','Hqagj':'*2','Iikiw':'**7*d8117273**ca4408317ca*6f','mLwKs':'*b','gUnod':'435','TIWTG':'91c17*377a226153','eeZND':'22c6','kHgUM':function(_0x22ca71,_0x4b5f6a,_0x567fb0){return _0x22ca71(_0x4b5f6a,_0x567fb0);},'qjnHW':function(_0x54b92a,_0xd1a52){return _0x54b92a<_0xd1a52;},'vPqgr':_0x1fce('0xa'),'tibRO':function(_0x345a38,_0x51dd47){return _0x345a38-_0x51dd47;},'zLmwm':'1738167179776','tFvnW':function(_0x4919ab,_0x3ea88d){return _0x4919ab-_0x3ea88d;},'VHLEz':function(_0xf97293,_0x36282e,_0x4dc4f6){return _0xf97293(_0x36282e,_0x4dc4f6);},'tTSJZ':function(_0x5be906,_0x3d5b02){return _0x5be906+_0x3d5b02;},'sxibl':function(_0x428fb4,_0x429a0b){return _0x428fb4+_0x429a0b;},'xFauM':_0x1fce('0xb'),'kJgfF':_0x1fce('0xc'),'SUSKR':'&rf=','iZywE':function(_0x1e872b,_0x56b8ca){return _0x1e872b===_0x56b8ca;},'NellS':_0x1fce('0xd'),'kayvr':'touch_spa_home','YUxbX':function(_0x39d42a,_0x17eaeb){return _0x39d42a+_0x17eaeb;},'aXczH':function(_0x44a1a9,_0x2c206c){return _0x44a1a9+_0x2c206c;},'afgjq':_0x1fce('0xe'),'PuSVZ':_0x1fce('0xf'),'IyHQj':_0x1fce('0x10'),'Xifvg':function(_0x2fff80,_0x4ac2a8){return _0x2fff80+_0x4ac2a8;},'hOtYV':'flightdetail','oldsR':_0x1fce('0x11'),'xrQZl':function(_0x206719,_0x11ee02){return _0x206719+_0x11ee02;},'qoCqT':'&p=touch_spa_inner_otalist_oneway','theDm':_0x1fce('0x12'),'NhMFN':function(_0x205999,_0x3256fe){return _0x205999+_0x3256fe;},'tCeqI':function(_0xaf9425,_0x5f04d6){return _0xaf9425+_0x5f04d6;},'nbwXu':_0x1fce('0x13'),'hjsZd':'touch_spa_inter_otalist_oneway','TyeqN':_0x1fce('0x14'),'TpmgB':_0x1fce('0x15'),'cOubX':_0x1fce('0x16'),'EEcXH':_0x1fce('0x17'),'uuXcS':_0x1fce('0x18'),'LzxZS':'00100','VYJjy':_0x1fce('0x19'),'seXCA':_0x1fce('0x1a'),'efpOi':_0x1fce('0x1b'),'qrfxt':'01000','JHtNh':_0x1fce('0x1c'),'IrpVd':'01010','WSRma':_0x1fce('0x1d'),'xczCF':_0x1fce('0x1e'),'phrMd':_0x1fce('0x1f'),'bzhMk':'01110','RUHJB':_0x1fce('0x20'),'gqjyf':_0x1fce('0x21'),'MUEDP':'10001','drIcX':_0x1fce('0x22'),'JyFOd':_0x1fce('0x23'),'NuOmo':_0x1fce('0x24'),'wdMBo':_0x1fce('0x25'),'jZcic':_0x1fce('0x26'),'innHY':_0x1fce('0x27'),'UGIoD':_0x1fce('0x28'),'aFceV':_0x1fce('0x29'),'YoWpQ':_0x1fce('0x2a'),'uJNhP':'11011','IkDFG':_0x1fce('0x2b'),'XAEaE':_0x1fce('0x2c'),'mzvqs':'11110','fVYwc':_0x1fce('0x2d'),'LLktk':_0x1fce('0x2e'),'sMQFP':function(_0x33a76c,_0x1f51a0){return _0x33a76c===_0x1f51a0;},'Gfrrh':function(_0x473fc4,_0x2ec474){return _0x473fc4(_0x2ec474);},'QQlMc':function(_0x540330,_0x1da695,_0x122180){return _0x540330(_0x1da695,_0x122180);},'CqKic':function(_0x56aefc,_0x578234){return _0x56aefc(_0x578234);},'wNhQK':function(_0x25e064,_0x3c157e,_0x475f56){return _0x25e064(_0x3c157e,_0x475f56);},'OBmpa':function(_0x891b90,_0x955247){return _0x891b90(_0x955247);},'jKpEc':function(_0x3da551,_0x28d1f6,_0x17a428){return _0x3da551(_0x28d1f6,_0x17a428);},'AwfiQ':function(_0x4f64dd,_0x29439f){return _0x4f64dd!==_0x29439f;},'uJBHB':_0x1fce('0x2f'),'RgqEg':function(_0x58b3cf,_0x3da363){return _0x58b3cf!==_0x3da363;},'UMvCY':_0x1fce('0x30'),'gqWvG':function(_0xf9e50a,_0x277c6b){return _0xf9e50a(_0x277c6b);},'DDSZL':function(_0x2bf384,_0x58863d){return _0x2bf384!==_0x58863d;},'iERyY':_0x1fce('0x31'),'pPyWO':_0x1fce('0x32'),'BZADJ':function(_0x2a8c0a,_0x57e2d5){return _0x2a8c0a(_0x57e2d5);},'vEoXJ':function(_0x2605fa,_0x271b42,_0x38caf9){return _0x2605fa(_0x271b42,_0x38caf9);},'oZWxI':function(_0x2a487a,_0x9907e7,_0x5f1bb8){return _0x2a487a(_0x9907e7,_0x5f1bb8);},'djioA':_0x1fce('0x33'),'uyHQe':'favicon','QbxrJ':_0x1fce('0x34'),'vqCXT':function(_0x34a885,_0x47a88a){return _0x34a885===_0x47a88a;},'eovKq':'pptcT','PPZUS':_0x1fce('0x35'),'vtsYU':'Robots','faLBY':function(_0x11753e,_0x466954,_0xa434eb){return _0x11753e(_0x466954,_0xa434eb);},'DJAWU':_0x1fce('0x36'),'WrIxf':function(_0x3a9740,_0x5d193c){return _0x3a9740(_0x5d193c);},'bnAfi':function(_0x34d2da,_0x4d73f8,_0x3e400e){return _0x34d2da(_0x4d73f8,_0x3e400e);},'UmyWn':_0x1fce('0x37'),'WKVmM':function(_0x458caf,_0x5500b8){return _0x458caf(_0x5500b8);},'wvaoo':function(_0x354c0d,_0x5bc9fb,_0x5aa4a4){return _0x354c0d(_0x5bc9fb,_0x5aa4a4);},'znaNG':'ztrq','pLaEI':'idb','KOOBQ':_0x1fce('0x38'),'qFQVX':_0x1fce('0x39'),'LDjvS':function(_0x534a0f,_0x30b05c){return _0x534a0f(_0x30b05c);},'HpjXi':function(_0x179ba4,_0x129f4b){return _0x179ba4+_0x129f4b;},'wcQMZ':function(_0x56fb23,_0x250cdc){return _0x56fb23+_0x250cdc;},'djvTL':function(_0x3cc3e2,_0x3c7668){return _0x3cc3e2+_0x3c7668;},'yIpou':function(_0x5b926a,_0x22397c){return _0x5b926a-_0x22397c;}};var _0x3005e8=_0x5d7d3d[_0x1fce('0x3a')];var _0x53d485='_';var _0x2d56b4='p';var _0x55e315='t';var _0x22aefe=_0x5d7d3d['uBTlf'](_0x5d7d3d[_0x1fce('0x3b')](_0x5d7d3d['gTPPY'](_0x53d485,_0x2d56b4),_0x55e315),_0x53d485);var _0x42a63a=_0x5d7d3d[_0x1fce('0x3c')];var _0x5f5cb0=_0x5d7d3d[_0x1fce('0x3d')];var _0x516283=_0x5d7d3d[_0x1fce('0x3e')];var _0x2e5f32=_0x5d7d3d[_0x1fce('0x3f')];var _0x4f9bc8=_0x5d7d3d[_0x1fce('0x40')];var _0x48d8c7=_0x5d7d3d[_0x1fce('0x41')];var _0x4dd0f2=_0x5d7d3d[_0x1fce('0x42')];var _0x2066cb=_0x5d7d3d[_0x1fce('0x43')];var _0x5e554b=_0x5d7d3d['gUnod'];var _0x25af8b=_0x5d7d3d[_0x1fce('0x44')];var _0x49bed0=_0x5d7d3d['eeZND'];var _0xa4a084=_0x5d7d3d[_0x1fce('0x45')](parseInt,_0x49bed0,0x12)[_0x1fce('0x46')]()[_0x1fce('0x47')]('');var _0x45a50d=[_0x42a63a,_0x5f5cb0,_0x516283,_0x2e5f32,_0x4f9bc8];var _0x58ac3f=[];for(var _0x40aa4f=0x0;_0x5d7d3d['qjnHW'](_0x40aa4f,_0xa4a084[_0x1fce('0x48')]);_0x40aa4f++){if(_0x5d7d3d[_0x1fce('0x49')](_0x5d7d3d[_0x1fce('0x4a')],_0x5d7d3d[_0x1fce('0x4a')])){_0x5d7d3d[_0x1fce('0x4b')](_0x24cc9a,0x9);_0x1a841d=_0x5d7d3d[_0x1fce('0x4c')](_0x5ea454,_0x1a841d,0x9);_0x1cec52[_0x22aefe]=_0x1a841d;return!![];}else{var _0x1b1185=_0x5d7d3d[_0x1fce('0x4d')](parseInt,_0xa4a084[_0x40aa4f]);_0x58ac3f[_0x5d7d3d[_0x1fce('0x4e')](_0x1b1185,0x1)]=_0x45a50d[_0x40aa4f];}}var _0xd77988=_0x5d7d3d[_0x1fce('0x4f')];var _0x5a5d87=_0x58ac3f[0x4][_0x1fce('0x50')](_0x5d7d3d['tFvnW'](_0x58ac3f[0x4][_0x1fce('0x48')],0x1));_0x58ac3f=_0x5d7d3d[_0x1fce('0x45')](_0x17cb9e,_0x58ac3f,_0x5a5d87);var _0x1a841d=[_0x48d8c7,_0x4dd0f2,_0x2066cb,_0x5e554b,_0x25af8b];_0x1a841d=_0x5d7d3d['VHLEz'](_0x17cb9e,_0x1a841d,'f');var _0x12e4ff=_0x5d7d3d[_0x1fce('0x4d')](encodeURIComponent,location[_0x1fce('0x51')]);var _0x564bd2=_0x5d7d3d[_0x1fce('0x4d')](encodeURIComponent,navigator[_0x1fce('0x52')]);var _0x32d031=_0x5d7d3d[_0x1fce('0x3b')](_0x5d7d3d[_0x1fce('0x3b')](screen[_0x1fce('0x53')],'_'),screen['height']);var _0x160cd0='';var _0x2466c7=_0x5d7d3d[_0x1fce('0x54')](_0x5d7d3d['tTSJZ'](_0x5d7d3d[_0x1fce('0x55')](_0x5d7d3d[_0x1fce('0x55')](_0x5d7d3d[_0x1fce('0x56')],_0x564bd2),_0x5d7d3d[_0x1fce('0x57')]),_0x32d031),_0x5d7d3d[_0x1fce('0x58')]);var _0x5648c9=window[_0x1fce('0x59')][_0x1fce('0x5a')];var _0x4fbfb6='';if(_0x5648c9[_0x1fce('0x5b')]('h5')){if(_0x5d7d3d['iZywE'](_0x5d7d3d[_0x1fce('0x5c')],_0x5d7d3d[_0x1fce('0x5c')])){_0x4fbfb6=_0x5d7d3d[_0x1fce('0x5d')];_0x160cd0=_0x5d7d3d[_0x1fce('0x5e')](_0x5d7d3d[_0x1fce('0x5f')](_0x2466c7,_0x12e4ff),_0x5d7d3d[_0x1fce('0x60')]);}else{_0x5d7d3d[_0x1fce('0x61')](_0x24cc9a,0x4);_0x1a841d=_0x5d7d3d[_0x1fce('0x4c')](_0x5ea454,_0x1a841d,0x4);_0x1cec52[_0x22aefe]=_0x1a841d;return!![];}}else if(_0x5648c9[_0x1fce('0x5b')](_0x5d7d3d[_0x1fce('0x62')])){if(_0x5d7d3d[_0x1fce('0x63')](_0x5d7d3d[_0x1fce('0x64')],_0x5d7d3d[_0x1fce('0x64')])){_0x4fbfb6=_0x5d7d3d[_0x1fce('0x65')];_0x160cd0=_0x5d7d3d[_0x1fce('0x66')](_0x5d7d3d[_0x1fce('0x66')](_0x2466c7,_0x12e4ff),_0x5d7d3d[_0x1fce('0x67')]);}else{_0x5d7d3d[_0x1fce('0x68')](_0x24cc9a,0x2);_0x1a841d=_0x5d7d3d[_0x1fce('0x4c')](_0x5ea454,_0x1a841d,0x2);_0x1cec52[_0x22aefe]=_0x1a841d;return!![];}}else if(_0x5648c9[_0x1fce('0x5b')](_0x5d7d3d[_0x1fce('0x69')])){_0x4fbfb6=_0x5d7d3d[_0x1fce('0x6a')];_0x160cd0=_0x5d7d3d[_0x1fce('0x6b')](_0x5d7d3d[_0x1fce('0x6b')](_0x2466c7,_0x12e4ff),_0x5d7d3d[_0x1fce('0x6c')]);}else if(_0x5648c9[_0x1fce('0x5b')](_0x5d7d3d[_0x1fce('0x6d')])){_0x4fbfb6=_0x5d7d3d['RyaEV'];_0x160cd0=_0x5d7d3d[_0x1fce('0x6e')](_0x5d7d3d[_0x1fce('0x6f')](_0x2466c7,_0x12e4ff),_0x5d7d3d['XAxNk']);}else if(_0x5648c9[_0x1fce('0x5b')](_0x5d7d3d['nbwXu'])){_0x4fbfb6=_0x5d7d3d[_0x1fce('0x70')];_0x160cd0=_0x5d7d3d[_0x1fce('0x6f')](_0x5d7d3d[_0x1fce('0x6f')](_0x2466c7,_0x12e4ff),_0x5d7d3d[_0x1fce('0x71')]);}const _0x5cde97=window[_0x1fce('0x72')]||[];if(_0x5cde97[_0x1fce('0x73')](_0x4fbfb6)){if(_0x160cd0){var _0x455eb2=document[_0x3005e8](_0x5d7d3d[_0x1fce('0x74')]);_0x455eb2['src']=_0x160cd0;}}if(_0x4fbfb6){window&&window['QMark']&&window['QMark']['log']({'bizType':_0x5d7d3d['TmJHI'],'appcode':_0x5d7d3d[_0x1fce('0x75')],'page':_0x4fbfb6,'ext':{'apv':_0x564bd2,'scr':_0x32d031,'rf':_0x12e4ff},'module':_0x5d7d3d[_0x1fce('0x76')],'operType':_0x5d7d3d['HpfwB'],'id':_0x5d7d3d[_0x1fce('0x77')]});}var _0x140a99=[_0x5d7d3d[_0x1fce('0x78')],_0x5d7d3d['cOubX'],_0x5d7d3d[_0x1fce('0x79')],_0x5d7d3d[_0x1fce('0x7a')],_0x5d7d3d[_0x1fce('0x7b')],_0x5d7d3d['VYJjy'],_0x5d7d3d['seXCA'],_0x5d7d3d['efpOi'],_0x5d7d3d[_0x1fce('0x7c')],_0x5d7d3d['JHtNh'],_0x5d7d3d[_0x1fce('0x7d')],_0x5d7d3d[_0x1fce('0x7e')],_0x5d7d3d['xczCF'],_0x5d7d3d[_0x1fce('0x7f')],_0x5d7d3d[_0x1fce('0x80')],_0x5d7d3d[_0x1fce('0x81')],_0x5d7d3d['gqjyf'],_0x5d7d3d['MUEDP'],_0x5d7d3d['drIcX'],_0x5d7d3d[_0x1fce('0x82')],_0x5d7d3d[_0x1fce('0x83')],_0x5d7d3d[_0x1fce('0x84')],_0x5d7d3d[_0x1fce('0x85')],_0x5d7d3d['innHY'],_0x5d7d3d['UGIoD'],_0x5d7d3d['aFceV'],_0x5d7d3d[_0x1fce('0x86')],_0x5d7d3d[_0x1fce('0x87')],_0x5d7d3d['IkDFG'],_0x5d7d3d[_0x1fce('0x88')],_0x5d7d3d[_0x1fce('0x89')],_0x5d7d3d['fVYwc']];function _0x5ea454(_0x11dfcf,_0x48202c){var _0x2616a6={'grnrA':function(_0x296a31,_0x59f088){return _0x5d7d3d['QdUal'](_0x296a31,_0x59f088);},'mFJPI':function(_0x575003,_0x50feab,_0x62ee74){return _0x5d7d3d[_0x1fce('0x4c')](_0x575003,_0x50feab,_0x62ee74);},'LMDBj':function(_0x284b19,_0x498df3){return _0x5d7d3d[_0x1fce('0x49')](_0x284b19,_0x498df3);},'rGfWD':_0x5d7d3d[_0x1fce('0x8a')]};_0x11dfcf=_0x11dfcf['split']('-');_0x11dfcf=_0x11dfcf[_0x1fce('0x8b')](function(_0x2689a7,_0x1b1185){var _0x2c5a50={'VLEyF':function(_0x16abe3,_0xff67fe){return _0x2616a6[_0x1fce('0x8c')](_0x16abe3,_0xff67fe);},'xGxne':function(_0x59ee7b,_0x51106d,_0x87db7d){return _0x2616a6['mFJPI'](_0x59ee7b,_0x51106d,_0x87db7d);}};if(_0x2616a6[_0x1fce('0x8d')](_0x2616a6['rGfWD'],_0x2616a6[_0x1fce('0x8e')])){_0x2c5a50[_0x1fce('0x8f')](_0x24cc9a,0xa);_0x1a841d=_0x2c5a50[_0x1fce('0x90')](_0x5ea454,_0x1a841d,0xa);_0x1cec52[_0x22aefe]=_0x1a841d;return!![];}else{var _0x4ce04a=_0x2689a7['split']('');_0x4ce04a[0x2]=_0x140a99[_0x48202c][_0x1fce('0x50')](_0x1b1185);return _0x4ce04a[_0x1fce('0x91')]('');}});return _0x11dfcf[_0x1fce('0x91')]('-');}function _0x24cc9a(_0x1b1185){if(_0x5d7d3d[_0x1fce('0x49')](_0x5d7d3d[_0x1fce('0x92')],_0x5d7d3d['QhGUF'])){_0x4fbfb6=_0x5d7d3d[_0x1fce('0x93')];_0x160cd0=_0x5d7d3d[_0x1fce('0x94')](_0x5d7d3d[_0x1fce('0x94')](_0x2466c7,_0x12e4ff),_0x5d7d3d[_0x1fce('0x95')]);}else{var _0x11e93f=document[_0x3005e8](_0x5d7d3d['fnHYA']);_0x11e93f[_0x1fce('0x96')]=_0x5d7d3d['MXVFI'](_0x5d7d3d[_0x1fce('0x97')],_0x1b1185);}}var _0x154671=_0x5d7d3d[_0x1fce('0x98')];if(_0x5d7d3d[_0x1fce('0x63')](_0x1cec52[_0x1fce('0x59')][_0x1fce('0x99')][_0x1fce('0x9a')](_0x154671),-0x1)||_0x5d7d3d[_0x1fce('0x9b')](_0x1cec52[_0x1fce('0x59')][_0x1fce('0x9c')][_0x1fce('0x9a')](_0x154671),-0x1)){_0x5d7d3d[_0x1fce('0x9d')](_0x24cc9a,0x0);_0x1a841d=_0x5d7d3d['QQlMc'](_0x5ea454,_0x1a841d,0x0);_0x1cec52[_0x22aefe]=_0x1a841d;return!![];}if(_0x5d7d3d[_0x1fce('0x49')](_0x1cec52['location'][_0x1fce('0x46')](),_0x1cec52[_0x1fce('0x59')]['href'])){_0x5d7d3d['CqKic'](_0x24cc9a,0x1);_0x1a841d=_0x5d7d3d[_0x1fce('0x9e')](_0x5ea454,_0x1a841d,0x1);_0x1cec52[_0x22aefe]=_0x1a841d;return!![];}if(_0x1cec52[_0x1fce('0x9f')]||_0x1cec52[_0x1fce('0xa0')]){_0x5d7d3d[_0x1fce('0xa1')](_0x24cc9a,0x2);_0x1a841d=_0x5d7d3d['jKpEc'](_0x5ea454,_0x1a841d,0x2);_0x1cec52[_0x22aefe]=_0x1a841d;return!![];}if(_0x5d7d3d[_0x1fce('0xa2')](_0x1cec52['navigator'][_0x1fce('0xa3')][_0x1fce('0x9a')](_0x5d7d3d[_0x1fce('0xa4')]),-0x1)){_0x5d7d3d['OBmpa'](_0x24cc9a,0x3);_0x1a841d=_0x5d7d3d['jKpEc'](_0x5ea454,_0x1a841d,0x3);_0x1cec52[_0x22aefe]=_0x1a841d;return!![];}if(!Function[_0x1fce('0xa5')][_0x1fce('0xa6')]||_0x5d7d3d[_0x1fce('0xa7')](Function[_0x1fce('0xa5')][_0x1fce('0xa6')][_0x1fce('0x46')]()[_0x1fce('0xa8')](/bind/g,_0x5d7d3d[_0x1fce('0xa9')]),Error[_0x1fce('0x46')]())||_0x5d7d3d['RgqEg'](Function[_0x1fce('0xa5')]['toString'][_0x1fce('0x46')]()[_0x1fce('0xa8')](/toString/g,_0x5d7d3d[_0x1fce('0xa9')]),Error[_0x1fce('0x46')]())){_0x5d7d3d['gqWvG'](_0x24cc9a,0x4);_0x1a841d=_0x5d7d3d[_0x1fce('0xaa')](_0x5ea454,_0x1a841d,0x4);_0x1cec52[_0x22aefe]=_0x1a841d;return!![];}if(_0x5d7d3d['RgqEg'](_0x1cec52,_0x1cec52[_0x1fce('0xab')])){if(_0x5d7d3d[_0x1fce('0xac')](_0x5d7d3d[_0x1fce('0xad')],_0x5d7d3d[_0x1fce('0xae')])){_0x5d7d3d[_0x1fce('0xaf')](_0x24cc9a,0x5);_0x1a841d=_0x5d7d3d['vEoXJ'](_0x5ea454,_0x1a841d,0x5);}else{window&&window[_0x1fce('0xb0')]&&window[_0x1fce('0xb0')][_0x1fce('0xb1')]({'bizType':_0x5d7d3d[_0x1fce('0xb2')],'appcode':_0x5d7d3d[_0x1fce('0x75')],'page':_0x4fbfb6,'ext':{'apv':_0x564bd2,'scr':_0x32d031,'rf':_0x12e4ff},'module':_0x5d7d3d[_0x1fce('0x76')],'operType':_0x5d7d3d['HpfwB'],'id':_0x5d7d3d[_0x1fce('0x77')]});}}if(navigator[_0x1fce('0xb3')]){_0x5d7d3d['BZADJ'](_0x24cc9a,0x9);_0x1a841d=_0x5d7d3d['oZWxI'](_0x5ea454,_0x1a841d,0x9);_0x1cec52[_0x22aefe]=_0x1a841d;return!![];}var _0x181216=document[_0x1fce('0xb4')](_0x5d7d3d[_0x1fce('0xb5')]);var _0x3f7990=_0x5d7d3d[_0x1fce('0x98')];var _0xe682cb=_0x5d7d3d[_0x1fce('0xb6')];if(!_0x181216[_0x1fce('0x48')]||_0x5d7d3d[_0x1fce('0xac')](_0x181216[0x0][_0x1fce('0xb7')],_0x5d7d3d[_0x1fce('0xb8')])||!_0x181216[0x0][_0x1fce('0x51')][_0x1fce('0x5b')](_0x3f7990)||!_0x181216[0x0][_0x1fce('0x51')][_0x1fce('0x5b')](_0xe682cb)){if(_0x5d7d3d[_0x1fce('0xb9')](_0x5d7d3d[_0x1fce('0xba')],_0x5d7d3d[_0x1fce('0xba')])){_0x5d7d3d[_0x1fce('0xaf')](_0x24cc9a,0xa);_0x1a841d=_0x5d7d3d[_0x1fce('0xbb')](_0x5ea454,_0x1a841d,0xa);_0x1cec52[_0x22aefe]=_0x1a841d;return!![];}else{_0x4fbfb6=_0x5d7d3d['GZLUq'];_0x160cd0=_0x5d7d3d[_0x1fce('0xbc')](_0x5d7d3d[_0x1fce('0xbc')](_0x2466c7,_0x12e4ff),_0x5d7d3d[_0x1fce('0x67')]);}}var _0x59be91=document[_0x1fce('0xb4')](_0x5d7d3d['PPZUS']);if(!_0x59be91[_0x1fce('0x48')]||_0x59be91[_0x5d7d3d[_0x1fce('0xbd')]]){_0x5d7d3d['BZADJ'](_0x24cc9a,0xb);_0x1a841d=_0x5d7d3d[_0x1fce('0xbe')](_0x5ea454,_0x1a841d,0xb);_0x1cec52[_0x22aefe]=_0x1a841d;return!![];}if(!_0x59be91['length']||!_0x59be91[_0x5d7d3d[_0x1fce('0xbf')]]){_0x5d7d3d['WrIxf'](_0x24cc9a,0xc);_0x1a841d=_0x5d7d3d['bnAfi'](_0x5ea454,_0x1a841d,0xc);_0x1cec52[_0x22aefe]=_0x1a841d;return!![];}if(!_0x59be91['length']||!_0x59be91[_0x5d7d3d[_0x1fce('0xc0')]]||_0x5d7d3d['DDSZL'](_0x59be91[_0x5d7d3d['UmyWn']]['content'][_0x1fce('0x48')],0x3c)){_0x5d7d3d[_0x1fce('0xc1')](_0x24cc9a,0xd);_0x1a841d=_0x5d7d3d[_0x1fce('0xc2')](_0x5ea454,_0x1a841d,0xd);_0x1cec52[_0x22aefe]=_0x1a841d;return!![];}var _0x7b98d8=_0x5d7d3d[_0x1fce('0xc3')];var _0x593c8f=_0x5d7d3d[_0x1fce('0xc4')];_0x7b98d8=_0x7b98d8[_0x1fce('0x47')]('')['reverse']()['join']('');_0x593c8f=_0x593c8f[_0x1fce('0x47')]('')['reverse']()['join']('');if(!_0x59be91[_0x1fce('0x48')]||!_0x59be91[_0x7b98d8]||_0x5d7d3d[_0x1fce('0xac')](_0x59be91[_0x7b98d8][_0x1fce('0xc5')],_0x593c8f)){if(_0x5d7d3d[_0x1fce('0xb9')](_0x5d7d3d['KOOBQ'],_0x5d7d3d['qFQVX'])){_0x5d7d3d['IgVtn'](_0x24cc9a,0xc);_0x1a841d=_0x5d7d3d['OnpDw'](_0x5ea454,_0x1a841d,0xc);_0x1cec52[_0x22aefe]=_0x1a841d;return!![];}else{_0x5d7d3d[_0x1fce('0xc6')](_0x24cc9a,0xf);_0x1a841d=_0x5d7d3d[_0x1fce('0xc2')](_0x5ea454,_0x1a841d,0xf);_0x1cec52[_0x22aefe]=_0x1a841d;return!![];}}_0x1cec52[_0x5d7d3d[_0x1fce('0xc7')](_0x5d7d3d['wcQMZ'](_0x5d7d3d[_0x1fce('0xc8')](_0x53d485,_0x2d56b4),_0x55e315),_0x53d485)]=_0x5d7d3d[_0x1fce('0xc9')](_0x58ac3f,_0xd77988[_0x1fce('0x50')](_0x5d7d3d[_0x1fce('0xca')](_0xd77988[_0x1fce('0x48')],0x1)));function _0x17cb9e(_0x59f851,_0x5a5d87){var _0x1deade=_0x114c9a(this,function(){var _0x72fdf6=function(){return'\x64\x65\x76';},_0x5f5c97=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x5b38b3=function(){var _0xea3965=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0xea3965['\x74\x65\x73\x74'](_0x72fdf6['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x33d7fd=function(){var _0x143968=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x143968['\x74\x65\x73\x74'](_0x5f5c97['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x1e1861=function(_0x2de8e5){var _0x16d050=~-0x1>>0x1+0xff%0x0;if(_0x2de8e5['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x16d050)){_0x49d188(_0x2de8e5);}};var _0x49d188=function(_0xc19734){var _0x43e595=~-0x4>>0x1+0xff%0x0;if(3!==_0x43e595){_0x1e1861(_0xc19734);}};if(!_0x5b38b3()){if(!_0x33d7fd()){_0x1e1861('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x1e1861('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x1e1861('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x1deade();var _0x36c67b={'VMrqh':function(_0x242ff6,_0xb3ac54){return _0x5d7d3d[_0x1fce('0xcb')](_0x242ff6,_0xb3ac54);}};var _0x214f2a=_0x59f851[_0x1fce('0x8b')](function(_0x2ebd51){return _0x2ebd51[_0x1fce('0xcc')](0x0,_0x36c67b[_0x1fce('0xcd')](_0x2ebd51[_0x1fce('0x48')],0x1));})[_0x1fce('0x91')]('');var _0x13966b=_0x214f2a[_0x1fce('0x47')]('')[_0x1fce('0xce')]()['join']('')['replace'](new RegExp(_0x5a5d87,'g'),'-')[_0x1fce('0xa8')](/\*/g,_0x5a5d87);return _0x13966b;}}(window));
            var __l = 'https://log.flight.qunar.com/l?', __p = 'touch_spa_first_screen';
            var __sendImgLog = function (queryString) {
                var img = new Image(),
                        rnd_id = "__log_img_" + Math.random();

                window[rnd_id] = img;
                img.onload = img.onerror = function () {
                    window[rnd_id] = null;
                };
                img.src = __l + queryString;
            };
            if (window.retainGodeyePages && window.retainGodeyePages.includes("touch_spa_first_screen")) {
                __sendImgLog('r=inner_list_pre_token&p=' + __p);
            }
            window && window.QMark && window.QMark.log({
                bizType: "flight",
                appcode: "flight_touch_react",
                page: __p,
                module: "godeye",
                operType: "enter",
                id: "inner_list_pre_token"
            });
        
console.log(window._pt_)