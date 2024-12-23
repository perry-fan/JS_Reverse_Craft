ldvm = {

    "toolsFunc": {},

    "envFunc": {},

    "config": {},

    "memory": {},
}

ldvm.config.proxy = false;

ldvm.config.print = true;

ldvm.memory.symbolProxy = Symbol("proxy");

ldvm.memory.symbolData = Symbol("data");

ldvm.memory.tag = [];

ldvm.memory.filterProxyProp = [ldvm.memory.symbolProxy, ldvm.memory.symbolData, "eval"];

ldvm.memory.globalVar = {};

ldvm.memory.globalVar.jsonCookie = {};

ldvm.memory.asyncEvent = {};

!function () {


    ldvm.toolsFunc.createMimeTypeArray = function createMimeTypeArray() {
        let mimeTypeArray = {};
        mimeTypeArray = ldvm.toolsFunc.createProxyObj(mimeTypeArray, MimeTypeArray, "mimeTypeArray");
        ldvm.toolsFunc.setProtoArr.call(mimeTypeArray, "length", 0);
        return mimeTypeArray;
    };


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


    ldvm.toolsFunc.createPluginArray = function createPluginArray() {
        let pluginArray = {};
        pluginArray = ldvm.toolsFunc.createProxyObj(pluginArray, PluginArray, "pluginArray");
        ldvm.toolsFunc.setProtoArr.call(pluginArray, "length", 0);
        return pluginArray;
    }


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

    ldvm.toolsFunc.parseURL = (url = location.href, base) => {
        var pattern = /^(([^:/?#]+):)?\/\/(([^/?#]+):(.+)@)?([^/?#:]*)(:(\d+))?([^?#]*)(\\?([^#]*))?(#(.*))?/
        var getURLSearchParams = (url) => {
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


            if (!/^[/]/.test(url)) {
                url = '/' + url
            }


            url = base + url
        }

        matches = url.match(pattern)
        hostname = matches[6]
        port = matches[8] || ''
        pathname = matches[11] || '/'
        search = matches[10] || ''
        searchParams = (() => {
            var params = getURLSearchParams(url)

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
                    if ("varructor" !== prop) {
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
            varruct: function (target, argArray, newTarget) {
                let result;
                try {
                    result = Reflect.varruct(target, argArray, newTarget);
                    let type = ldvm.toolsFunc.getType(result);
                    console.log(`{varruct|function:[${objName}], type:[${type}]}`);
                } catch (e) {
                    console.log(`{varruct|function:[${objName}],error:[${e.message}]}`);
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
        if (Object.getOwnPropertyDescriptor(obj, "varructor") !== undefined) {
            if (Object.getOwnPropertyDescriptor(self, "varructor") !== undefined) {
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
        var $toString = Function.prototype.toString;
        var symbol = Symbol();
        var myToString = function () {
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
                var index = (buffer >> bufferLength) & 0x3f;
                encodedText += ldvm.toolsFunc.base64.base64Chars.charAt(index);
            }
        }

        // 处理最后剩余的不足6位的情况
        if (bufferLength > 0) {
            buffer <<= 6 - bufferLength;
            var index = buffer & 0x3f;
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
            var char = encodedText.charAt(i);
            var charCode = ldvm.toolsFunc.base64.base64Chars.indexOf(char);

            if (charCode === -1 || char === "=") {
                break;
            }

            buffer = (buffer << 6) | charCode;
            bufferLength += 6;

            if (bufferLength >= 8) {
                bufferLength -= 8;
                var decodedChar = (buffer >> bufferLength) & 0xff;
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
        for (var key in this) {
            if (index === i) {
                return key;
            }
            i++;
        }
        return null;
    }

    ldvm.envFunc.Storage_clear = function Storage_clear() {
        for (var key in this) {
            delete this[key];
        }
    }

    ldvm.envFunc.Storage_length_get = function Storage_clear() {
        let i = 0;
        for (var key in Object.getOwnPropertyDescriptors(this)) {
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
        for (var key in tagJson.prop) {
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
        for (var key in jsonCookie) {
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
        for (var key in jsonCookie) {
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

}();

//env相关代码
// EventTarget 对象
EventTarget = function EventTarget() {
}
ldvm.toolsFunc.safeProto(EventTarget, "EventTarget");
ldvm.toolsFunc.defineProperty(EventTarget.prototype, "addEventListener", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, EventTarget.prototype, "EventTarget", "addEventListener", arguments)
    }
});
ldvm.toolsFunc.defineProperty(EventTarget.prototype, "dispatchEvent", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, EventTarget.prototype, "EventTarget", "dispatchEvent", arguments)
    }
});
ldvm.toolsFunc.defineProperty(EventTarget.prototype, "removeEventListener", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, EventTarget.prototype, "EventTarget", "removeEventListener", arguments)
    }
});

//WindowProperties对象
WindowProperties = function WindowProperties() {

}
//保护原型
ldvm.toolsFunc.safeProto(WindowProperties, "WindowProperties");
//删除构造函数
delete WindowProperties.prototype.varructor;
Object.setPrototypeOf(WindowProperties.prototype, EventTarget.prototype);
// Window 对象
Window = function Window() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(Window, "Window");
Object.setPrototypeOf(Window.prototype, WindowProperties.prototype);
ldvm.toolsFunc.defineProperty(Window, "TEMPORARY", {configurable: false, enumerable: true, writable: false, value: 0});
ldvm.toolsFunc.defineProperty(Window, "PERSISTENT", {configurable: false, enumerable: true, writable: false, value: 1});
ldvm.toolsFunc.defineProperty(Window.prototype, "TEMPORARY", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 0
});
ldvm.toolsFunc.defineProperty(Window.prototype, "PERSISTENT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1
});

// Location 对象
Location = function Location() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(Location, "Location");

// location对象
location = {}
Object.setPrototypeOf(location, Location.prototype);
ldvm.toolsFunc.defineProperty(location, "valueOf", {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "valueOf", arguments)
    }
});
ldvm.toolsFunc.defineProperty(location, "ancestorOrigins", {
    configurable: false, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "ancestorOrigins_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(location, "href", {
    configurable: false, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "href_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "href_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(location, "origin", {
    configurable: false, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "origin_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(location, "protocol", {
    configurable: false, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "protocol_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "protocol_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(location, "host", {
    configurable: false, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "host_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "host_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(location, "hostname", {
    configurable: false, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "hostname_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "hostname_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(location, "port", {
    configurable: false, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "port_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "port_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(location, "pathname", {
    configurable: false, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "pathname_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "pathname_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(location, "search", {
    configurable: false, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "search_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "search_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(location, "hash", {
    configurable: false, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "hash_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "hash_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(location, "assign", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "assign", arguments)
    }
});
ldvm.toolsFunc.defineProperty(location, "reload", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "reload", arguments)
    }
});
ldvm.toolsFunc.defineProperty(location, "replace", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "replace", arguments)
    }
});
ldvm.toolsFunc.defineProperty(location, "toString", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, location, "location", "toString", arguments)
    }
});


// Node 对象
Node = function Node() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(Node, "Node");
Object.setPrototypeOf(Node.prototype, EventTarget.prototype);
ldvm.toolsFunc.defineProperty(Node, "ELEMENT_NODE", {configurable: false, enumerable: true, writable: false, value: 1});
ldvm.toolsFunc.defineProperty(Node, "ATTRIBUTE_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2
});
ldvm.toolsFunc.defineProperty(Node, "TEXT_NODE", {configurable: false, enumerable: true, writable: false, value: 3});
ldvm.toolsFunc.defineProperty(Node, "CDATA_SECTION_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 4
});
ldvm.toolsFunc.defineProperty(Node, "ENTITY_REFERENCE_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5
});
ldvm.toolsFunc.defineProperty(Node, "ENTITY_NODE", {configurable: false, enumerable: true, writable: false, value: 6});
ldvm.toolsFunc.defineProperty(Node, "PROCESSING_INSTRUCTION_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 7
});
ldvm.toolsFunc.defineProperty(Node, "COMMENT_NODE", {configurable: false, enumerable: true, writable: false, value: 8});
ldvm.toolsFunc.defineProperty(Node, "DOCUMENT_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 9
});
ldvm.toolsFunc.defineProperty(Node, "DOCUMENT_TYPE_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 10
});
ldvm.toolsFunc.defineProperty(Node, "DOCUMENT_FRAGMENT_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 11
});
ldvm.toolsFunc.defineProperty(Node, "NOTATION_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 12
});
ldvm.toolsFunc.defineProperty(Node, "DOCUMENT_POSITION_DISCONNECTED", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1
});
ldvm.toolsFunc.defineProperty(Node, "DOCUMENT_POSITION_PRECEDING", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2
});
ldvm.toolsFunc.defineProperty(Node, "DOCUMENT_POSITION_FOLLOWING", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 4
});
ldvm.toolsFunc.defineProperty(Node, "DOCUMENT_POSITION_CONTAINS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 8
});
ldvm.toolsFunc.defineProperty(Node, "DOCUMENT_POSITION_CONTAINED_BY", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 16
});
ldvm.toolsFunc.defineProperty(Node, "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32
});
ldvm.toolsFunc.defineProperty(Node.prototype, "nodeType", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "nodeType_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Node.prototype, "nodeName", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "nodeName_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Node.prototype, "baseURI", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "baseURI_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Node.prototype, "isConnected", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "isConnected_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Node.prototype, "ownerDocument", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "ownerDocument_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Node.prototype, "parentNode", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "parentNode_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Node.prototype, "parentElement", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "parentElement_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Node.prototype, "childNodes", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "childNodes_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Node.prototype, "firstChild", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "firstChild_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Node.prototype, "lastChild", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "lastChild_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Node.prototype, "previousSibling", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "previousSibling_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Node.prototype, "nextSibling", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "nextSibling_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Node.prototype, "nodeValue", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "nodeValue_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "nodeValue_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Node.prototype, "textContent", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "textContent_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "textContent_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Node.prototype, "ELEMENT_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1
});
ldvm.toolsFunc.defineProperty(Node.prototype, "ATTRIBUTE_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2
});
ldvm.toolsFunc.defineProperty(Node.prototype, "TEXT_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3
});
ldvm.toolsFunc.defineProperty(Node.prototype, "CDATA_SECTION_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 4
});
ldvm.toolsFunc.defineProperty(Node.prototype, "ENTITY_REFERENCE_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5
});
ldvm.toolsFunc.defineProperty(Node.prototype, "ENTITY_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 6
});
ldvm.toolsFunc.defineProperty(Node.prototype, "PROCESSING_INSTRUCTION_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 7
});
ldvm.toolsFunc.defineProperty(Node.prototype, "COMMENT_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 8
});
ldvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 9
});
ldvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_TYPE_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 10
});
ldvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_FRAGMENT_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 11
});
ldvm.toolsFunc.defineProperty(Node.prototype, "NOTATION_NODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 12
});
ldvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_POSITION_DISCONNECTED", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1
});
ldvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_POSITION_PRECEDING", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2
});
ldvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_POSITION_FOLLOWING", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 4
});
ldvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_POSITION_CONTAINS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 8
});
ldvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_POSITION_CONTAINED_BY", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 16
});
ldvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32
});
ldvm.toolsFunc.defineProperty(Node.prototype, "appendChild", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "appendChild", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Node.prototype, "cloneNode", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "cloneNode", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Node.prototype, "compareDocumentPosition", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "compareDocumentPosition", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Node.prototype, "contains", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "contains", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Node.prototype, "getRootNode", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "getRootNode", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Node.prototype, "hasChildNodes", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "hasChildNodes", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Node.prototype, "insertBefore", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "insertBefore", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Node.prototype, "isDefaultNamespace", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "isDefaultNamespace", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Node.prototype, "isEqualNode", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "isEqualNode", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Node.prototype, "isSameNode", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "isSameNode", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Node.prototype, "lookupNamespaceURI", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "lookupNamespaceURI", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Node.prototype, "lookupPrefix", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "lookupPrefix", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Node.prototype, "normalize", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "normalize", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Node.prototype, "removeChild", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "removeChild", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Node.prototype, "replaceChild", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Node.prototype, "Node", "replaceChild", arguments)
    }
});

// Element 对象
Element = function Element() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(Element, "Element");
Object.setPrototypeOf(Element.prototype, Node.prototype);
ldvm.toolsFunc.defineProperty(Element.prototype, "namespaceURI", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "namespaceURI_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "prefix", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "prefix_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "localName", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "localName_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "tagName", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "tagName_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "id", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "id_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "id_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "className", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "className_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "className_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "classList", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "classList_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "classList_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "slot", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "slot_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "slot_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "attributes", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "attributes_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "shadowRoot", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "shadowRoot_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "part", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "part_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "part_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "assignedSlot", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "assignedSlot_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "innerHTML", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "innerHTML_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "innerHTML_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "outerHTML", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "outerHTML_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "outerHTML_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "scrollTop", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollTop_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollTop_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "scrollLeft", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollLeft_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollLeft_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "scrollWidth", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollWidth_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "scrollHeight", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollHeight_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "clientTop", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "clientTop_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "clientLeft", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "clientLeft_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "clientWidth", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "clientWidth_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "clientHeight", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "clientHeight_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "onbeforecopy", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onbeforecopy_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onbeforecopy_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "onbeforecut", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onbeforecut_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onbeforecut_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "onbeforepaste", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onbeforepaste_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onbeforepaste_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "onsearch", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onsearch_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onsearch_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "elementTiming", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "elementTiming_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "elementTiming_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "onfullscreenchange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onfullscreenchange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onfullscreenchange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "onfullscreenerror", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onfullscreenerror_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onfullscreenerror_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "onwebkitfullscreenchange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onwebkitfullscreenchange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onwebkitfullscreenchange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "onwebkitfullscreenerror", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onwebkitfullscreenerror_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "onwebkitfullscreenerror_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "role", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "role_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "role_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaAtomic", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaAtomic_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaAtomic_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaAutoComplete", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaAutoComplete_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaAutoComplete_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaBusy", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaBusy_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaBusy_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaBrailleLabel", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaBrailleLabel_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaBrailleLabel_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaBrailleRoleDescription", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaBrailleRoleDescription_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaBrailleRoleDescription_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaChecked", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaChecked_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaChecked_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaColCount", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaColCount_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaColCount_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaColIndex", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaColIndex_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaColIndex_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaColSpan", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaColSpan_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaColSpan_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaCurrent", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaCurrent_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaCurrent_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaDescription", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaDescription_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaDescription_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaDisabled", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaDisabled_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaDisabled_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaExpanded", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaExpanded_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaExpanded_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaHasPopup", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaHasPopup_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaHasPopup_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaHidden", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaHidden_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaHidden_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaInvalid", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaInvalid_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaInvalid_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaKeyShortcuts", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaKeyShortcuts_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaKeyShortcuts_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaLabel", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaLabel_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaLabel_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaLevel", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaLevel_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaLevel_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaLive", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaLive_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaLive_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaModal", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaModal_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaModal_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaMultiLine", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaMultiLine_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaMultiLine_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaMultiSelectable", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaMultiSelectable_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaMultiSelectable_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaOrientation", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaOrientation_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaOrientation_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaPlaceholder", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaPlaceholder_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaPlaceholder_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaPosInSet", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaPosInSet_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaPosInSet_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaPressed", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaPressed_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaPressed_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaReadOnly", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaReadOnly_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaReadOnly_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaRelevant", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRelevant_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRelevant_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaRequired", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRequired_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRequired_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaRoleDescription", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRoleDescription_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRoleDescription_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaRowCount", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRowCount_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRowCount_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaRowIndex", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRowIndex_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRowIndex_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaRowSpan", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRowSpan_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaRowSpan_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaSelected", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaSelected_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaSelected_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaSetSize", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaSetSize_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaSetSize_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaSort", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaSort_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaSort_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaValueMax", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaValueMax_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaValueMax_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaValueMin", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaValueMin_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaValueMin_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaValueNow", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaValueNow_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaValueNow_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "ariaValueText", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaValueText_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "ariaValueText_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "children", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "children_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "firstElementChild", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "firstElementChild_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "lastElementChild", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "lastElementChild_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "childElementCount", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "childElementCount_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "previousElementSibling", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "previousElementSibling_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "nextElementSibling", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "nextElementSibling_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Element.prototype, "after", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "after", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "animate", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "animate", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "append", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "append", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "attachShadow", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "attachShadow", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "before", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "before", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "checkVisibility", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "checkVisibility", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "closest", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "closest", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "computedStyleMap", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "computedStyleMap", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "getAnimations", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getAnimations", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "getAttribute", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getAttribute", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "getAttributeNS", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getAttributeNS", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "getAttributeNames", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getAttributeNames", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "getAttributeNode", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getAttributeNode", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "getAttributeNodeNS", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getAttributeNodeNS", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "getBoundingClientRect", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getBoundingClientRect", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "getClientRects", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getClientRects", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "getElementsByClassName", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getElementsByClassName", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "getElementsByTagName", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getElementsByTagName", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "getElementsByTagNameNS", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getElementsByTagNameNS", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "getInnerHTML", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "getInnerHTML", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "hasAttribute", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "hasAttribute", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "hasAttributeNS", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "hasAttributeNS", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "hasAttributes", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "hasAttributes", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "hasPointerCapture", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "hasPointerCapture", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "insertAdjacentElement", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "insertAdjacentElement", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "insertAdjacentHTML", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "insertAdjacentHTML", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "insertAdjacentText", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "insertAdjacentText", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "matches", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "matches", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "prepend", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "prepend", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "querySelector", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "querySelector", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "querySelectorAll", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "querySelectorAll", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "releasePointerCapture", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "releasePointerCapture", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "remove", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "remove", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "removeAttribute", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "removeAttribute", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "removeAttributeNS", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "removeAttributeNS", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "removeAttributeNode", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "removeAttributeNode", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "replaceChildren", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "replaceChildren", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "replaceWith", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "replaceWith", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "requestFullscreen", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "requestFullscreen", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "requestPointerLock", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "requestPointerLock", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "scroll", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scroll", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "scrollBy", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollBy", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollIntoView", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "scrollIntoViewIfNeeded", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollIntoViewIfNeeded", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "scrollTo", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "scrollTo", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "setAttribute", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "setAttribute", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "setAttributeNS", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "setAttributeNS", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "setAttributeNode", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "setAttributeNode", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "setAttributeNodeNS", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "setAttributeNodeNS", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "setPointerCapture", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "setPointerCapture", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "toggleAttribute", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "toggleAttribute", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "webkitMatchesSelector", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "webkitMatchesSelector", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "webkitRequestFullScreen", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "webkitRequestFullScreen", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Element.prototype, "webkitRequestFullscreen", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Element.prototype, "Element", "webkitRequestFullscreen", arguments)
    }
});

// HTMLElement 对象
HTMLElement = function HTMLElement() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(HTMLElement, "HTMLElement");
Object.setPrototypeOf(HTMLElement.prototype, Element.prototype);
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "title", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "title_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "title_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "lang", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "lang_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "lang_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "translate", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "translate_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "translate_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "dir", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "dir_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "dir_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "hidden", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "hidden_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "hidden_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "accessKey", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "accessKey_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "accessKey_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "draggable", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "draggable_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "draggable_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "spellcheck", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "spellcheck_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "spellcheck_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "autocapitalize", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "autocapitalize_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "autocapitalize_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "contentEditable", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "contentEditable_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "contentEditable_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "enterKeyHint", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "enterKeyHint_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "enterKeyHint_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "isContentEditable", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "isContentEditable_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "inputMode", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "inputMode_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "inputMode_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "virtualKeyboardPolicy", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "virtualKeyboardPolicy_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "virtualKeyboardPolicy_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "offsetParent", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "offsetParent_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "offsetTop", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "offsetTop_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "offsetLeft", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "offsetLeft_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "offsetWidth_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "offsetHeight_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "popover", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "popover_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "popover_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "innerText", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "innerText_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "innerText_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "outerText", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "outerText_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "outerText_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onbeforexrselect", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onbeforexrselect_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onbeforexrselect_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onabort", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onabort_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onabort_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onbeforeinput", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onbeforeinput_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onbeforeinput_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onbeforematch", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onbeforematch_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onbeforematch_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onbeforetoggle", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onbeforetoggle_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onbeforetoggle_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onblur", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onblur_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onblur_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "oncancel", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncancel_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncancel_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "oncanplay", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncanplay_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncanplay_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "oncanplaythrough", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncanplaythrough_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncanplaythrough_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onchange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onchange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onchange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onclick", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onclick_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onclick_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onclose", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onclose_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onclose_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "oncontentvisibilityautostatechange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncontentvisibilityautostatechange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncontentvisibilityautostatechange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "oncontextlost", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncontextlost_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncontextlost_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "oncontextmenu", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncontextmenu_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncontextmenu_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "oncontextrestored", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncontextrestored_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncontextrestored_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "oncuechange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncuechange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncuechange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "ondblclick", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondblclick_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondblclick_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "ondrag", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondrag_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondrag_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "ondragend", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragend_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragend_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "ondragenter", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragenter_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragenter_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "ondragleave", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragleave_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragleave_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "ondragover", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragover_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragover_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "ondragstart", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragstart_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondragstart_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "ondrop", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondrop_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondrop_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "ondurationchange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondurationchange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ondurationchange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onemptied", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onemptied_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onemptied_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onended", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onended_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onended_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onerror", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onerror_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onerror_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onfocus", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onfocus_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onfocus_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onformdata", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onformdata_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onformdata_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "oninput", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oninput_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oninput_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "oninvalid", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oninvalid_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oninvalid_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onkeydown", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onkeydown_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onkeydown_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onkeypress", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onkeypress_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onkeypress_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onkeyup", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onkeyup_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onkeyup_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onload", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onload_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onload_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onloadeddata", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onloadeddata_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onloadeddata_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onloadedmetadata", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onloadedmetadata_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onloadedmetadata_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onloadstart", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onloadstart_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onloadstart_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onmousedown", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmousedown_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmousedown_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onmouseenter", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseenter_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseenter_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onmouseleave", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseleave_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseleave_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onmousemove", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmousemove_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmousemove_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onmouseout", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseout_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseout_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onmouseover", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseover_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseover_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onmouseup", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseup_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmouseup_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onmousewheel", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmousewheel_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onmousewheel_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onpause", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpause_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpause_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onplay", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onplay_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onplay_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onplaying", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onplaying_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onplaying_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onprogress", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onprogress_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onprogress_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onratechange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onratechange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onratechange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onreset", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onreset_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onreset_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onresize", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onresize_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onresize_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onscroll", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onscroll_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onscroll_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onsecuritypolicyviolation", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onsecuritypolicyviolation_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onsecuritypolicyviolation_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onseeked", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onseeked_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onseeked_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onseeking", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onseeking_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onseeking_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onselect", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onselect_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onselect_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onslotchange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onslotchange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onslotchange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onstalled", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onstalled_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onstalled_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onsubmit", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onsubmit_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onsubmit_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onsuspend", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onsuspend_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onsuspend_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "ontimeupdate", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontimeupdate_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontimeupdate_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "ontoggle", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontoggle_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontoggle_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onvolumechange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onvolumechange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onvolumechange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onwaiting", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwaiting_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwaiting_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onwebkitanimationend", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwebkitanimationend_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwebkitanimationend_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onwebkitanimationiteration", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwebkitanimationiteration_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwebkitanimationiteration_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onwebkitanimationstart", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwebkitanimationstart_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwebkitanimationstart_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onwebkittransitionend", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwebkittransitionend_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwebkittransitionend_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onwheel", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwheel_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onwheel_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onauxclick", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onauxclick_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onauxclick_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "ongotpointercapture", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ongotpointercapture_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ongotpointercapture_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onlostpointercapture", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onlostpointercapture_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onlostpointercapture_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onpointerdown", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerdown_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerdown_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onpointermove", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointermove_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointermove_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onpointerrawupdate", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerrawupdate_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerrawupdate_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onpointerup", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerup_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerup_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onpointercancel", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointercancel_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointercancel_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onpointerover", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerover_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerover_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onpointerout", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerout_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerout_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onpointerenter", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerenter_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerenter_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onpointerleave", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerleave_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpointerleave_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onselectstart", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onselectstart_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onselectstart_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onselectionchange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onselectionchange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onselectionchange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onanimationend", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onanimationend_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onanimationend_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onanimationiteration", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onanimationiteration_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onanimationiteration_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onanimationstart", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onanimationstart_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onanimationstart_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "ontransitionrun", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontransitionrun_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontransitionrun_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "ontransitionstart", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontransitionstart_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontransitionstart_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "ontransitionend", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontransitionend_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontransitionend_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "ontransitioncancel", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontransitioncancel_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "ontransitioncancel_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "oncopy", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncopy_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncopy_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "oncut", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncut_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "oncut_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onpaste", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpaste_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onpaste_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "dataset", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "dataset_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "nonce", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "nonce_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "nonce_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "autofocus", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "autofocus_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "autofocus_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "tabIndex", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "tabIndex_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "tabIndex_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "style", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "style_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "style_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "attributeStyleMap", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "attributeStyleMap_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "attachInternals", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "attachInternals", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "blur", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "blur", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "click", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "click", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "focus", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "focus", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "hidePopover", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "hidePopover", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "showPopover", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "showPopover", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "togglePopover", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "togglePopover", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "inert", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "inert_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "inert_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "onscrollend", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onscrollend_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "onscrollend_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype, "editContext", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "editContext_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLElement.prototype, "HTMLElement", "editContext_set", arguments)
    }
});

// HTMLAnchorElement 对象
HTMLAnchorElement = function HTMLAnchorElement() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(HTMLAnchorElement, "HTMLAnchorElement");
Object.setPrototypeOf(HTMLAnchorElement.prototype, HTMLElement.prototype);
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "target", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "target_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "target_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "download", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "download_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "download_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "ping", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "ping_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "ping_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "rel", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "rel_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "rel_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "relList", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "relList_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "relList_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "hreflang", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "hreflang_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "hreflang_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "type", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "type_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "type_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "referrerPolicy", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "referrerPolicy_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "referrerPolicy_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "text", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "text_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "text_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "coords", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "coords_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "coords_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "charset", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "charset_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "charset_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "name", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "name_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "name_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "rev", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "rev_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "rev_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "shape", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "shape_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "shape_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "origin", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "origin_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "protocol", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "protocol_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "protocol_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "username", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "username_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "username_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "password", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "password_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "password_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "host", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "host_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "host_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "hostname", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "hostname_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "hostname_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "port", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "port_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "port_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "pathname", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "pathname_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "pathname_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "search", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "search_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "search_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "hash", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "hash_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "hash_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "href", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "href_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "href_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "toString", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "toString", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "hrefTranslate", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "hrefTranslate_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "hrefTranslate_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype, "attributionSrc", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "attributionSrc_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLAnchorElement.prototype, "HTMLAnchorElement", "attributionSrc_set", arguments)
    }
});

// HTMLCanvasElement 对象
HTMLCanvasElement = function HTMLCanvasElement() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(HTMLCanvasElement, "HTMLCanvasElement");
Object.setPrototypeOf(HTMLCanvasElement.prototype, HTMLElement.prototype);
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype, "width", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "width_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "width_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype, "height", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "height_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "height_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype, "captureStream", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "captureStream", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "getContext", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "toBlob", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype, "toDataURL", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "toDataURL", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype, "transferControlToOffscreen", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLCanvasElement.prototype, "HTMLCanvasElement", "transferControlToOffscreen", arguments)
    }
});

// HTMLDivElement 对象
HTMLDivElement = function HTMLDivElement() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
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
HTMLHeadElement = function HTMLHeadElement() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(HTMLHeadElement, "HTMLHeadElement");
Object.setPrototypeOf(HTMLHeadElement.prototype, HTMLElement.prototype);

// HTMLInputElement 对象
HTMLInputElement = function HTMLInputElement() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(HTMLInputElement, "HTMLInputElement");
Object.setPrototypeOf(HTMLInputElement.prototype, HTMLElement.prototype);
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "accept", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "accept_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "accept_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "alt", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "alt_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "alt_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "autocomplete", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "autocomplete_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "autocomplete_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "defaultChecked", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "defaultChecked_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "defaultChecked_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "checked", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "checked_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "checked_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "dirName", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "dirName_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "dirName_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "disabled", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "disabled_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "disabled_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "form", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "form_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "files", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "files_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "files_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "formAction", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formAction_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formAction_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "formEnctype", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formEnctype_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formEnctype_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "formMethod", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formMethod_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formMethod_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "formNoValidate", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formNoValidate_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formNoValidate_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "formTarget", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formTarget_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "formTarget_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "height", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "height_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "height_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "indeterminate", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "indeterminate_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "indeterminate_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "list", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "list_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "max", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "max_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "max_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "maxLength", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "maxLength_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "maxLength_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "min", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "min_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "min_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "minLength", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "minLength_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "minLength_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "multiple", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "multiple_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "multiple_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "name", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "name_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "name_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "pattern", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "pattern_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "pattern_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "placeholder", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "placeholder_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "placeholder_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "readOnly", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "readOnly_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "readOnly_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "required", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "required_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "required_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "size", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "size_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "size_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "src", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "src_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "src_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "step", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "step_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "step_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "type", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "type_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "type_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "defaultValue", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "defaultValue_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "defaultValue_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "value", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "value_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "value_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "valueAsDate", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "valueAsDate_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "valueAsDate_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "valueAsNumber", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "valueAsNumber_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "valueAsNumber_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "width", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "width_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "width_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "willValidate", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "willValidate_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "validity", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "validity_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "validationMessage", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "validationMessage_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "labels", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "labels_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "selectionStart", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "selectionStart_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "selectionStart_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "selectionEnd", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "selectionEnd_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "selectionEnd_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "selectionDirection", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "selectionDirection_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "selectionDirection_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "align", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "align_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "align_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "useMap", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "useMap_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "useMap_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "webkitdirectory", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "webkitdirectory_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "webkitdirectory_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "incremental", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "incremental_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "incremental_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "popoverTargetElement", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "popoverTargetElement_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "popoverTargetElement_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "popoverTargetAction", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "popoverTargetAction_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "popoverTargetAction_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "checkValidity", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "checkValidity", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "reportValidity", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "reportValidity", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "select", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "select", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "setCustomValidity", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "setCustomValidity", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "setRangeText", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "setRangeText", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "setSelectionRange", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "setSelectionRange", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "showPicker", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "showPicker", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "stepDown", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "stepDown", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "stepUp", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "stepUp", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype, "webkitEntries", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLInputElement.prototype, "HTMLInputElement", "webkitEntries_get", arguments)
    },
    set: undefined
});

// HTMLMetaElement 对象
HTMLMetaElement = function HTMLMetaElement() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(HTMLMetaElement, "HTMLMetaElement");
Object.setPrototypeOf(HTMLMetaElement.prototype, HTMLElement.prototype);
ldvm.toolsFunc.defineProperty(HTMLMetaElement.prototype, "name", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "name_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "name_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLMetaElement.prototype, "httpEquiv", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "httpEquiv_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "httpEquiv_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLMetaElement.prototype, "content", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "content_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "content_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLMetaElement.prototype, "media", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "media_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "media_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLMetaElement.prototype, "scheme", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "scheme_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLMetaElement.prototype, "HTMLMetaElement", "scheme_set", arguments)
    }
});

// Document 对象
Document = function Document() {
}
ldvm.toolsFunc.safeProto(Document, "Document");
Object.setPrototypeOf(Document.prototype, Node.prototype);
ldvm.toolsFunc.defineProperty(Document, "parseHTMLUnsafe", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document, "Document", "parseHTMLUnsafe", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "implementation", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "implementation_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "URL", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "URL_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "documentURI", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "documentURI_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "compatMode", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "compatMode_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "characterSet", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "characterSet_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "charset", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "charset_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "inputEncoding", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "inputEncoding_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "contentType", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "contentType_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "doctype", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "doctype_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "documentElement", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "documentElement_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "xmlEncoding", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "xmlEncoding_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "xmlVersion", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "xmlVersion_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "xmlVersion_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "xmlStandalone", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "xmlStandalone_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "xmlStandalone_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "domain", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "domain_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "domain_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "referrer", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "referrer_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "cookie", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "cookie_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "cookie_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "lastModified", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "lastModified_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "readyState", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "readyState_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "title", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "title_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "title_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "dir", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "dir_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "dir_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "body", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "body_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "body_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "head", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "head_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "images", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "images_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "embeds", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "embeds_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "plugins", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "plugins_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "links", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "links_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "forms", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "forms_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "scripts", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "scripts_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "currentScript", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "currentScript_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "defaultView", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "defaultView_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "designMode", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "designMode_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "designMode_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onreadystatechange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onreadystatechange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onreadystatechange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "anchors", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "anchors_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "applets", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "applets_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "fgColor", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fgColor_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fgColor_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "linkColor", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "linkColor_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "linkColor_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "vlinkColor", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "vlinkColor_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "vlinkColor_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "alinkColor", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "alinkColor_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "alinkColor_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "bgColor", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "bgColor_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "bgColor_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "all", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "all_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "scrollingElement", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "scrollingElement_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onpointerlockchange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerlockchange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerlockchange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onpointerlockerror", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerlockerror_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerlockerror_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "hidden", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "hidden_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "visibilityState", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "visibilityState_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "wasDiscarded", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "wasDiscarded_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "prerendering", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "prerendering_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "featurePolicy", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "featurePolicy_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "webkitVisibilityState", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "webkitVisibilityState_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "webkitHidden", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "webkitHidden_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onbeforecopy", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforecopy_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforecopy_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onbeforecut", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforecut_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforecut_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onbeforepaste", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforepaste_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforepaste_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onfreeze", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onfreeze_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onfreeze_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onprerenderingchange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onprerenderingchange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onprerenderingchange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onresume", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onresume_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onresume_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onsearch", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onsearch_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onsearch_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onvisibilitychange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onvisibilitychange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onvisibilitychange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "timeline", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "timeline_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "fullscreenEnabled", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fullscreenEnabled_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fullscreenEnabled_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "fullscreen", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fullscreen_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fullscreen_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onfullscreenchange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onfullscreenchange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onfullscreenchange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onfullscreenerror", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onfullscreenerror_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onfullscreenerror_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "webkitIsFullScreen", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "webkitIsFullScreen_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "webkitCurrentFullScreenElement", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "webkitCurrentFullScreenElement_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "webkitFullscreenEnabled", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "webkitFullscreenEnabled_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "webkitFullscreenElement", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "webkitFullscreenElement_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onwebkitfullscreenchange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitfullscreenchange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitfullscreenchange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onwebkitfullscreenerror", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitfullscreenerror_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitfullscreenerror_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "rootElement", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "rootElement_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "pictureInPictureEnabled", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "pictureInPictureEnabled_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onbeforexrselect", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforexrselect_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforexrselect_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onabort", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onabort_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onabort_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onbeforeinput", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforeinput_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforeinput_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onbeforematch", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforematch_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforematch_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onbeforetoggle", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforetoggle_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onbeforetoggle_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onblur", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onblur_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onblur_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "oncancel", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncancel_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncancel_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "oncanplay", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncanplay_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncanplay_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "oncanplaythrough", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncanplaythrough_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncanplaythrough_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onchange", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onchange_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onchange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onclick", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onclick_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onclick_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onclose", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onclose_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onclose_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "oncontentvisibilityautostatechange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncontentvisibilityautostatechange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncontentvisibilityautostatechange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "oncontextlost", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncontextlost_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncontextlost_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "oncontextmenu", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncontextmenu_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncontextmenu_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "oncontextrestored", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncontextrestored_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncontextrestored_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "oncuechange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncuechange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncuechange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "ondblclick", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondblclick_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondblclick_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "ondrag", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondrag_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondrag_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "ondragend", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragend_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragend_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "ondragenter", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragenter_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragenter_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "ondragleave", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragleave_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragleave_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "ondragover", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragover_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragover_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "ondragstart", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragstart_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondragstart_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "ondrop", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondrop_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondrop_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "ondurationchange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondurationchange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ondurationchange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onemptied", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onemptied_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onemptied_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onended", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onended_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onended_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onerror", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onerror_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onerror_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onfocus", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onfocus_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onfocus_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onformdata", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onformdata_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onformdata_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "oninput", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oninput_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oninput_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "oninvalid", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oninvalid_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oninvalid_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onkeydown", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onkeydown_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onkeydown_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onkeypress", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onkeypress_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onkeypress_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onkeyup", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onkeyup_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onkeyup_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onload", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onload_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onload_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onloadeddata", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onloadeddata_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onloadeddata_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onloadedmetadata", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onloadedmetadata_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onloadedmetadata_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onloadstart", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onloadstart_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onloadstart_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onmousedown", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmousedown_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmousedown_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onmouseenter", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseenter_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseenter_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onmouseleave", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseleave_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseleave_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onmousemove", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmousemove_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmousemove_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onmouseout", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseout_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseout_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onmouseover", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseover_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseover_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onmouseup", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseup_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmouseup_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onmousewheel", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmousewheel_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onmousewheel_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onpause", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpause_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpause_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onplay", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onplay_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onplay_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onplaying", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onplaying_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onplaying_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onprogress", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onprogress_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onprogress_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onratechange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onratechange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onratechange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onreset", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onreset_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onreset_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onresize", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onresize_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onresize_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onscroll", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onscroll_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onscroll_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onsecuritypolicyviolation", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onsecuritypolicyviolation_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onsecuritypolicyviolation_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onseeked", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onseeked_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onseeked_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onseeking", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onseeking_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onseeking_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onselect", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onselect_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onselect_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onslotchange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onslotchange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onslotchange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onstalled", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onstalled_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onstalled_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onsubmit", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onsubmit_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onsubmit_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onsuspend", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onsuspend_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onsuspend_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "ontimeupdate", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontimeupdate_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontimeupdate_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "ontoggle", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontoggle_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontoggle_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onvolumechange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onvolumechange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onvolumechange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onwaiting", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwaiting_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwaiting_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onwebkitanimationend", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitanimationend_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitanimationend_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onwebkitanimationiteration", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitanimationiteration_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitanimationiteration_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onwebkitanimationstart", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitanimationstart_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkitanimationstart_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onwebkittransitionend", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkittransitionend_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwebkittransitionend_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onwheel", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwheel_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onwheel_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onauxclick", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onauxclick_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onauxclick_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "ongotpointercapture", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ongotpointercapture_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ongotpointercapture_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onlostpointercapture", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onlostpointercapture_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onlostpointercapture_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onpointerdown", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerdown_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerdown_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onpointermove", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointermove_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointermove_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onpointerrawupdate", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerrawupdate_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerrawupdate_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onpointerup", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerup_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerup_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onpointercancel", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointercancel_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointercancel_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onpointerover", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerover_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerover_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onpointerout", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerout_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerout_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onpointerenter", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerenter_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerenter_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onpointerleave", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerleave_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpointerleave_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onselectstart", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onselectstart_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onselectstart_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onselectionchange", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onselectionchange_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onselectionchange_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onanimationend", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onanimationend_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onanimationend_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onanimationiteration", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onanimationiteration_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onanimationiteration_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onanimationstart", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onanimationstart_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onanimationstart_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "ontransitionrun", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontransitionrun_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontransitionrun_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "ontransitionstart", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontransitionstart_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontransitionstart_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "ontransitionend", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontransitionend_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontransitionend_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "ontransitioncancel", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontransitioncancel_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "ontransitioncancel_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "oncopy", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncopy_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncopy_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "oncut", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncut_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "oncut_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onpaste", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpaste_get", arguments)
    }, set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onpaste_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "children", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "children_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "firstElementChild", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "firstElementChild_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "lastElementChild", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "lastElementChild_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "childElementCount", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "childElementCount_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "activeElement", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "activeElement_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "styleSheets", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "styleSheets_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "pointerLockElement", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "pointerLockElement_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "fullscreenElement", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fullscreenElement_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fullscreenElement_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "adoptedStyleSheets", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "adoptedStyleSheets_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "adoptedStyleSheets_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "pictureInPictureElement", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "pictureInPictureElement_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "fonts", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fonts_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "adoptNode", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "adoptNode", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "append", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "append", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "captureEvents", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "captureEvents", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "caretRangeFromPoint", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "caretRangeFromPoint", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "clear", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "clear", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "close", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "close", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "createAttribute", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createAttribute", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "createAttributeNS", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createAttributeNS", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "createCDATASection", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createCDATASection", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "createComment", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createComment", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "createDocumentFragment", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createDocumentFragment", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "createElement", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createElement", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "createElementNS", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createElementNS", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "createEvent", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createEvent", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "createExpression", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createExpression", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "createNSResolver", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createNSResolver", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "createNodeIterator", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createNodeIterator", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "createProcessingInstruction", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createProcessingInstruction", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "createRange", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createRange", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "createTextNode", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createTextNode", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "createTreeWalker", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "createTreeWalker", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "elementFromPoint", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "elementFromPoint", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "elementsFromPoint", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "elementsFromPoint", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "evaluate", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "evaluate", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "execCommand", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "execCommand", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "exitFullscreen", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "exitFullscreen", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "exitPictureInPicture", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "exitPictureInPicture", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "exitPointerLock", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "exitPointerLock", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "getAnimations", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "getAnimations", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "getElementById", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "getElementById", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "getElementsByClassName", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "getElementsByClassName", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "getElementsByName", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "getElementsByName", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "getElementsByTagName", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "getElementsByTagName", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "getElementsByTagNameNS", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "getElementsByTagNameNS", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "getSelection", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "getSelection", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "hasFocus", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "hasFocus", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "hasStorageAccess", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "hasStorageAccess", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "hasUnpartitionedCookieAccess", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "hasUnpartitionedCookieAccess", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "importNode", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "importNode", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "open", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "open", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "prepend", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "prepend", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "queryCommandEnabled", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "queryCommandEnabled", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "queryCommandIndeterm", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "queryCommandIndeterm", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "queryCommandState", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "queryCommandState", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "queryCommandSupported", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "queryCommandSupported", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "queryCommandValue", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "queryCommandValue", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "querySelector", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "querySelector", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "querySelectorAll", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "querySelectorAll", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "releaseEvents", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "releaseEvents", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "replaceChildren", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "replaceChildren", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "requestStorageAccess", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "requestStorageAccess", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "requestStorageAccessFor", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "requestStorageAccessFor", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "startViewTransition", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "startViewTransition", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "webkitCancelFullScreen", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "webkitCancelFullScreen", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "webkitExitFullscreen", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "webkitExitFullscreen", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "write", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "write", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "writeln", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "writeln", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "fragmentDirective", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "fragmentDirective_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Document.prototype, "browsingTopics", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "browsingTopics", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "hasPrivateToken", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "hasPrivateToken", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "hasRedemptionRecord", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "hasRedemptionRecord", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Document.prototype, "onscrollend", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onscrollend_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, Document.prototype, "Document", "onscrollend_set", arguments)
    }
});

// HTMLDocument 对象
HTMLDocument = function HTMLDocument() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
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
Storage = function Storage() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(Storage, "Storage");
ldvm.toolsFunc.defineProperty(Storage.prototype, "length", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Storage.prototype, "Storage", "length_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Storage.prototype, "clear", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Storage.prototype, "Storage", "clear", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Storage.prototype, "getItem", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Storage.prototype, "Storage", "getItem", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Storage.prototype, "key", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Storage.prototype, "Storage", "key", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Storage.prototype, "removeItem", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Storage.prototype, "Storage", "removeItem", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Storage.prototype, "setItem", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Storage.prototype, "Storage", "setItem", arguments)
    }
});

// localStorage对象
localStorage = {};
Object.setPrototypeOf(localStorage, Storage.prototype);

// sessionStorage对象
sessionStorage = {};
Object.setPrototypeOf(sessionStorage, Storage.prototype);


// Navigator 对象
Navigator = function Navigator() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(Navigator, "Navigator");
ldvm.toolsFunc.defineProperty(Navigator.prototype, "vendorSub", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "vendorSub_get", arguments,)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "productSub", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "productSub_get", arguments, 20030107)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "vendor", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "vendor_get", arguments, `Google Inc.`)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "maxTouchPoints", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "maxTouchPoints_get", arguments, 0)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "scheduling", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "scheduling_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "userActivation", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "userActivation_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "doNotTrack", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "doNotTrack_get", arguments, null)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "geolocation", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "geolocation_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "connection", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "connection_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "plugins", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "plugins_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "mimeTypes", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "mimeTypes_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "pdfViewerEnabled", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "pdfViewerEnabled_get", arguments, true)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "webkitTemporaryStorage", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "webkitTemporaryStorage_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "webkitPersistentStorage", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "webkitPersistentStorage_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "hardwareConcurrency", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "hardwareConcurrency_get", arguments, 16)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "cookieEnabled", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "cookieEnabled_get", arguments, true)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "appCodeName", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "appCodeName_get", arguments, Mozilla)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "appName", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "appName_get", arguments, 'Netscape')
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "appVersion", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "appVersion_get", arguments, `5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "platform", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "platform_get", arguments, Win32)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "product", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "product_get", arguments, Gecko)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "userAgent", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "userAgent_get", arguments, `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "language", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "language_get", arguments, zh - CN)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "languages", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "languages_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "onLine", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "onLine_get", arguments, true)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "webdriver", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "webdriver_get", arguments, false)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "getGamepads", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "getGamepads", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "javaEnabled", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "javaEnabled", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "sendBeacon", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "sendBeacon", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "vibrate", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "vibrate", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "deprecatedRunAdAuctionEnforcesKAnonymity", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "deprecatedRunAdAuctionEnforcesKAnonymity_get", arguments, false)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "bluetooth", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "bluetooth_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "clipboard", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "clipboard_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "credentials", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "credentials_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "keyboard", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "keyboard_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "managed", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "managed_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "mediaDevices", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "mediaDevices_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "storage", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "storage_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "serviceWorker", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "serviceWorker_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "virtualKeyboard", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "virtualKeyboard_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "wakeLock", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "wakeLock_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "deviceMemory", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "deviceMemory_get", arguments, 8)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "login", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "login_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "ink", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "ink_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "hid", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "hid_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "locks", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "locks_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "gpu", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "gpu_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "mediaCapabilities", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "mediaCapabilities_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "mediaSession", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "mediaSession_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "permissions", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "permissions_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "presentation", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "presentation_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "usb", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "usb_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "xr", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "xr_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "serial", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "serial_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "windowControlsOverlay", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "windowControlsOverlay_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "userAgentData", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "userAgentData_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "adAuctionComponents", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "adAuctionComponents", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "runAdAuction", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "runAdAuction", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "canLoadAdAuctionFencedFrame", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "canLoadAdAuctionFencedFrame", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "canShare", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "canShare", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "share", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "share", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "clearAppBadge", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "clearAppBadge", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "getBattery", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "getBattery", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "getUserMedia", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "getUserMedia", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "requestMIDIAccess", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "requestMIDIAccess", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "requestMediaKeySystemAccess", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "requestMediaKeySystemAccess", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "setAppBadge", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "setAppBadge", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "webkitGetUserMedia", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "webkitGetUserMedia", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "clearOriginJoinedAdInterestGroups", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "clearOriginJoinedAdInterestGroups", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "createAuctionNonce", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "createAuctionNonce", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "deprecatedReplaceInURN", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "deprecatedReplaceInURN", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "deprecatedURNToURL", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "deprecatedURNToURL", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "getInstalledRelatedApps", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "getInstalledRelatedApps", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "joinAdInterestGroup", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "joinAdInterestGroup", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "leaveAdInterestGroup", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "leaveAdInterestGroup", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "updateAdInterestGroups", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "updateAdInterestGroups", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "registerProtocolHandler", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "registerProtocolHandler", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Navigator.prototype, "unregisterProtocolHandler", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Navigator.prototype, "Navigator", "unregisterProtocolHandler", arguments)
    }
});


// navigator对象
navigator = {}
Object.setPrototypeOf(navigator, Navigator.prototype);


// HTMLCollection 对象
HTMLCollection = function HTMLCollection() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(HTMLCollection, "HTMLCollection");
ldvm.toolsFunc.defineProperty(HTMLCollection.prototype, "length", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLCollection.prototype, "HTMLCollection", "length_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(HTMLCollection.prototype, "item", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLCollection.prototype, "HTMLCollection", "item", arguments)
    }
});
ldvm.toolsFunc.defineProperty(HTMLCollection.prototype, "namedItem", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, HTMLCollection.prototype, "HTMLCollection", "namedItem", arguments)
    }
});

// PluginArray 对象
PluginArray = function PluginArray() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(PluginArray, "PluginArray");
ldvm.toolsFunc.defineProperty(PluginArray.prototype, "length", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, PluginArray.prototype, "PluginArray", "length_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(PluginArray.prototype, "item", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, PluginArray.prototype, "PluginArray", "item", arguments)
    }
});
ldvm.toolsFunc.defineProperty(PluginArray.prototype, "namedItem", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, PluginArray.prototype, "PluginArray", "namedItem", arguments)
    }
});
ldvm.toolsFunc.defineProperty(PluginArray.prototype, "refresh", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, PluginArray.prototype, "PluginArray", "refresh", arguments)
    }
});

// Plugin 对象
Plugin = function Plugin() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(Plugin, "Plugin");
ldvm.toolsFunc.defineProperty(Plugin.prototype, "name", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Plugin.prototype, "Plugin", "name_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Plugin.prototype, "filename", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Plugin.prototype, "Plugin", "filename_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Plugin.prototype, "description", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Plugin.prototype, "Plugin", "description_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Plugin.prototype, "length", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, Plugin.prototype, "Plugin", "length_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(Plugin.prototype, "item", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Plugin.prototype, "Plugin", "item", arguments)
    }
});
ldvm.toolsFunc.defineProperty(Plugin.prototype, "namedItem", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, Plugin.prototype, "Plugin", "namedItem", arguments)
    }
});

// MimeTypeArray 对象
MimeTypeArray = function MimeTypeArray() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(MimeTypeArray, "MimeTypeArray");
ldvm.toolsFunc.defineProperty(MimeTypeArray.prototype, "length", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, MimeTypeArray.prototype, "MimeTypeArray", "length_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(MimeTypeArray.prototype, "item", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, MimeTypeArray.prototype, "MimeTypeArray", "item", arguments)
    }
});
ldvm.toolsFunc.defineProperty(MimeTypeArray.prototype, "namedItem", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, MimeTypeArray.prototype, "MimeTypeArray", "namedItem", arguments)
    }
});

// MimeType 对象
MimeType = function MimeType() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(MimeType, "MimeType");
ldvm.toolsFunc.defineProperty(MimeType.prototype, "type", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, MimeType.prototype, "MimeType", "type_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(MimeType.prototype, "suffixes", {
    configurable: true, enumerable: true, get: function () {
        return ldvm.toolsFunc.dispatch(this, MimeType.prototype, "MimeType", "suffixes_get", arguments)
    }, set: undefined
});
ldvm.toolsFunc.defineProperty(MimeType.prototype, "description", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, MimeType.prototype, "MimeType", "description_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(MimeType.prototype, "enabledPlugin", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, MimeType.prototype, "MimeType", "enabledPlugin_get", arguments)
    },
    set: undefined
});

// CanvasRenderingContext2D 对象
CanvasRenderingContext2D = function CanvasRenderingContext2D() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(CanvasRenderingContext2D, "CanvasRenderingContext2D");
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "canvas", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "canvas_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "globalAlpha", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "globalAlpha_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "globalAlpha_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "globalCompositeOperation", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "globalCompositeOperation_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "globalCompositeOperation_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "filter", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "filter_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "filter_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "imageSmoothingEnabled", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "imageSmoothingEnabled_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "imageSmoothingEnabled_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "imageSmoothingQuality", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "imageSmoothingQuality_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "imageSmoothingQuality_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "strokeStyle", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "strokeStyle_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "strokeStyle_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "fillStyle", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fillStyle_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fillStyle_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "shadowOffsetX", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "shadowOffsetX_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "shadowOffsetX_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "shadowOffsetY", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "shadowOffsetY_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "shadowOffsetY_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "shadowBlur", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "shadowBlur_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "shadowBlur_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "shadowColor", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "shadowColor_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "shadowColor_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "lineWidth", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineWidth_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineWidth_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "lineCap", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineCap_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineCap_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "lineJoin", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineJoin_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineJoin_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "miterLimit", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "miterLimit_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "miterLimit_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "lineDashOffset", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineDashOffset_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineDashOffset_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "font", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "font_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "font_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "textAlign", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "textAlign_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "textAlign_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "textBaseline", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "textBaseline_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "textBaseline_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "direction", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "direction_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "direction_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "fontKerning", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fontKerning_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fontKerning_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "fontStretch", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fontStretch_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fontStretch_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "fontVariantCaps", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fontVariantCaps_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fontVariantCaps_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "letterSpacing", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "letterSpacing_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "letterSpacing_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "textRendering", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "textRendering_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "textRendering_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "wordSpacing", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "wordSpacing_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "wordSpacing_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "clip", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "clip", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "createConicGradient", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "createConicGradient", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "createImageData", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "createImageData", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "createLinearGradient", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "createLinearGradient", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "createPattern", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "createPattern", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "createRadialGradient", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "createRadialGradient", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "drawFocusIfNeeded", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "drawFocusIfNeeded", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "drawImage", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "drawImage", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "fill", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fill", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "fillText", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fillText", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "getContextAttributes", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "getContextAttributes", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "getImageData", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "getImageData", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "getLineDash", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "getLineDash", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "getTransform", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "getTransform", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "isContextLost", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "isContextLost", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "isPointInPath", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "isPointInPath", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "isPointInStroke", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "isPointInStroke", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "measureText", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "measureText", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "putImageData", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "putImageData", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "reset", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "reset", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "roundRect", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "roundRect", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "save", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "save", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "scale", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "scale", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "setLineDash", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "setLineDash", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "setTransform", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "setTransform", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "stroke", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "stroke", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "strokeText", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "strokeText", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "transform", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "transform", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "translate", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "translate", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "arc", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "arc", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "arcTo", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "arcTo", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "beginPath", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "beginPath", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "bezierCurveTo", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "bezierCurveTo", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "clearRect", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "clearRect", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "closePath", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "closePath", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "ellipse", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "ellipse", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "fillRect", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "fillRect", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "lineTo", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "lineTo", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "moveTo", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "moveTo", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "quadraticCurveTo", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "quadraticCurveTo", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "rect", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "rect", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "resetTransform", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "resetTransform", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "restore", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "restore", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "rotate", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "rotate", arguments)
    }
});
ldvm.toolsFunc.defineProperty(CanvasRenderingContext2D.prototype, "strokeRect", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, CanvasRenderingContext2D.prototype, "CanvasRenderingContext2D", "strokeRect", arguments)
    }
});

// WebGLRenderingContext 对象
WebGLRenderingContext = function WebGLRenderingContext() {
    ldvm.toolsFunc.throwError("TypeError", "Illegal varructor");
}
ldvm.toolsFunc.safeProto(WebGLRenderingContext, "WebGLRenderingContext");
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DEPTH_BUFFER_BIT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 256
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_BUFFER_BIT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1024
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "COLOR_BUFFER_BIT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 16384
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "POINTS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 0
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "LINES", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "LINE_LOOP", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "LINE_STRIP", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TRIANGLES", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 4
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TRIANGLE_STRIP", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TRIANGLE_FAN", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 6
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ZERO", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 0
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ONE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "SRC_COLOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 768
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ONE_MINUS_SRC_COLOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 769
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "SRC_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 770
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ONE_MINUS_SRC_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 771
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DST_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 772
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ONE_MINUS_DST_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 773
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DST_COLOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 774
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ONE_MINUS_DST_COLOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 775
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "SRC_ALPHA_SATURATE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 776
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FUNC_ADD", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32774
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BLEND_EQUATION", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32777
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BLEND_EQUATION_RGB", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32777
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BLEND_EQUATION_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34877
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FUNC_SUBTRACT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32778
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FUNC_REVERSE_SUBTRACT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32779
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BLEND_DST_RGB", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32968
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BLEND_SRC_RGB", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32969
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BLEND_DST_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32970
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BLEND_SRC_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32971
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "varANT_COLOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32769
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ONE_MINUS_varANT_COLOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32770
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "varANT_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32771
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ONE_MINUS_varANT_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32772
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BLEND_COLOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32773
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ARRAY_BUFFER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34962
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ELEMENT_ARRAY_BUFFER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34963
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ARRAY_BUFFER_BINDING", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34964
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ELEMENT_ARRAY_BUFFER_BINDING", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34965
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STREAM_DRAW", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35040
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STATIC_DRAW", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35044
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DYNAMIC_DRAW", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35048
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BUFFER_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34660
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BUFFER_USAGE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34661
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "CURRENT_VERTEX_ATTRIB", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34342
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FRONT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1028
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BACK", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1029
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FRONT_AND_BACK", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1032
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE_2D", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3553
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "CULL_FACE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2884
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BLEND", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3042
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DITHER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3024
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_TEST", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2960
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DEPTH_TEST", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2929
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "SCISSOR_TEST", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3089
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "POLYGON_OFFSET_FILL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32823
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "SAMPLE_ALPHA_TO_COVERAGE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32926
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "SAMPLE_COVERAGE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32928
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "NO_ERROR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 0
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "INVALID_ENUM", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1280
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "INVALID_VALUE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1281
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "INVALID_OPERATION", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1282
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "OUT_OF_MEMORY", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1285
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "CW", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2304
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "CCW", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2305
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "LINE_WIDTH", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2849
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ALIASED_POINT_SIZE_RANGE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33901
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ALIASED_LINE_WIDTH_RANGE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33902
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "CULL_FACE_MODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2885
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FRONT_FACE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2886
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DEPTH_RANGE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2928
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DEPTH_WRITEMASK", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2930
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DEPTH_CLEAR_VALUE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2931
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DEPTH_FUNC", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2932
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_CLEAR_VALUE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2961
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_FUNC", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2962
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_FAIL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2964
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_PASS_DEPTH_FAIL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2965
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_PASS_DEPTH_PASS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2966
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_REF", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2967
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_VALUE_MASK", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2963
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_WRITEMASK", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2968
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_BACK_FUNC", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34816
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_BACK_FAIL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34817
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_BACK_PASS_DEPTH_FAIL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34818
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_BACK_PASS_DEPTH_PASS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34819
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_BACK_REF", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36003
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_BACK_VALUE_MASK", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36004
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_BACK_WRITEMASK", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36005
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "VIEWPORT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2978
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "SCISSOR_BOX", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3088
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "COLOR_CLEAR_VALUE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3106
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "COLOR_WRITEMASK", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3107
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "UNPACK_ALIGNMENT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3317
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "PACK_ALIGNMENT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3333
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "MAX_TEXTURE_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3379
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "MAX_VIEWPORT_DIMS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3386
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "SUBPIXEL_BITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3408
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RED_BITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3410
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "GREEN_BITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3411
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BLUE_BITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3412
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ALPHA_BITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3413
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DEPTH_BITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3414
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_BITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3415
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "POLYGON_OFFSET_UNITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 10752
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "POLYGON_OFFSET_FACTOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32824
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE_BINDING_2D", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32873
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "SAMPLE_BUFFERS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32936
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "SAMPLES", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32937
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "SAMPLE_COVERAGE_VALUE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32938
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "SAMPLE_COVERAGE_INVERT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32939
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "COMPRESSED_TEXTURE_FORMATS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34467
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DONT_CARE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 4352
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FASTEST", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 4353
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "NICEST", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 4354
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "GENERATE_MIPMAP_HINT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33170
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BYTE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5120
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "UNSIGNED_BYTE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5121
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "SHORT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5122
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "UNSIGNED_SHORT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5123
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "INT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5124
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "UNSIGNED_INT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5125
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FLOAT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5126
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DEPTH_COMPONENT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 6402
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 6406
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RGB", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 6407
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RGBA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 6408
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "LUMINANCE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 6409
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "LUMINANCE_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 6410
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "UNSIGNED_SHORT_4_4_4_4", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32819
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "UNSIGNED_SHORT_5_5_5_1", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32820
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "UNSIGNED_SHORT_5_6_5", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33635
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FRAGMENT_SHADER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35632
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "VERTEX_SHADER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35633
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "MAX_VERTEX_ATTRIBS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34921
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "MAX_VERTEX_UNIFORM_VECTORS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36347
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "MAX_VARYING_VECTORS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36348
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "MAX_COMBINED_TEXTURE_IMAGE_UNITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35661
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "MAX_VERTEX_TEXTURE_IMAGE_UNITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35660
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "MAX_TEXTURE_IMAGE_UNITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34930
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "MAX_FRAGMENT_UNIFORM_VECTORS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36349
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "SHADER_TYPE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35663
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DELETE_STATUS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35712
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "LINK_STATUS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35714
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "VALIDATE_STATUS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35715
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ATTACHED_SHADERS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35717
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ACTIVE_UNIFORMS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35718
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ACTIVE_ATTRIBUTES", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35721
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "SHADING_LANGUAGE_VERSION", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35724
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "CURRENT_PROGRAM", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35725
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "NEVER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 512
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "LESS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 513
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "EQUAL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 514
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "LEQUAL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 515
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "GREATER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 516
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "NOTEQUAL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 517
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "GEQUAL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 518
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ALWAYS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 519
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "KEEP", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 7680
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "REPLACE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 7681
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "INCR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 7682
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DECR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 7683
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "INVERT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5386
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "INCR_WRAP", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34055
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DECR_WRAP", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34056
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "VENDOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 7936
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RENDERER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 7937
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "VERSION", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 7938
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "NEAREST", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 9728
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "LINEAR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 9729
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "NEAREST_MIPMAP_NEAREST", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 9984
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "LINEAR_MIPMAP_NEAREST", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 9985
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "NEAREST_MIPMAP_LINEAR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 9986
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "LINEAR_MIPMAP_LINEAR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 9987
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE_MAG_FILTER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 10240
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE_MIN_FILTER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 10241
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE_WRAP_S", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 10242
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE_WRAP_T", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 10243
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5890
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE_CUBE_MAP", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34067
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE_BINDING_CUBE_MAP", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34068
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE_CUBE_MAP_POSITIVE_X", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34069
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE_CUBE_MAP_NEGATIVE_X", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34070
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE_CUBE_MAP_POSITIVE_Y", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34071
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE_CUBE_MAP_NEGATIVE_Y", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34072
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE_CUBE_MAP_POSITIVE_Z", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34073
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE_CUBE_MAP_NEGATIVE_Z", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34074
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "MAX_CUBE_MAP_TEXTURE_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34076
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE0", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33984
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE1", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33985
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE2", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33986
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE3", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33987
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE4", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33988
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE5", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33989
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE6", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33990
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE7", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33991
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE8", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33992
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE9", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33993
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE10", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33994
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE11", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33995
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE12", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33996
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE13", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33997
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE14", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33998
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE15", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33999
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE16", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34000
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE17", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34001
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE18", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34002
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE19", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34003
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE20", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34004
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE21", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34005
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE22", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34006
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE23", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34007
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE24", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34008
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE25", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34009
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE26", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34010
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE27", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34011
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE28", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34012
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE29", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34013
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE30", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34014
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "TEXTURE31", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34015
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "ACTIVE_TEXTURE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34016
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "REPEAT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 10497
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "CLAMP_TO_EDGE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33071
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "MIRRORED_REPEAT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33648
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FLOAT_VEC2", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35664
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FLOAT_VEC3", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35665
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FLOAT_VEC4", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35666
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "INT_VEC2", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35667
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "INT_VEC3", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35668
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "INT_VEC4", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35669
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BOOL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35670
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BOOL_VEC2", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35671
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BOOL_VEC3", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35672
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BOOL_VEC4", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35673
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FLOAT_MAT2", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35674
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FLOAT_MAT3", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35675
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FLOAT_MAT4", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35676
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "SAMPLER_2D", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35678
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "SAMPLER_CUBE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35680
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "VERTEX_ATTRIB_ARRAY_ENABLED", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34338
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "VERTEX_ATTRIB_ARRAY_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34339
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "VERTEX_ATTRIB_ARRAY_STRIDE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34340
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "VERTEX_ATTRIB_ARRAY_TYPE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34341
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "VERTEX_ATTRIB_ARRAY_NORMALIZED", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34922
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "VERTEX_ATTRIB_ARRAY_POINTER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34373
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "VERTEX_ATTRIB_ARRAY_BUFFER_BINDING", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34975
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "IMPLEMENTATION_COLOR_READ_TYPE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35738
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "IMPLEMENTATION_COLOR_READ_FORMAT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35739
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "COMPILE_STATUS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35713
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "LOW_FLOAT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36336
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "MEDIUM_FLOAT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36337
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "HIGH_FLOAT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36338
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "LOW_INT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36339
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "MEDIUM_INT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36340
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "HIGH_INT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36341
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FRAMEBUFFER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36160
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RENDERBUFFER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36161
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RGBA4", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32854
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RGB5_A1", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32855
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RGB565", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36194
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DEPTH_COMPONENT16", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33189
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_INDEX8", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36168
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DEPTH_STENCIL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34041
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RENDERBUFFER_WIDTH", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36162
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RENDERBUFFER_HEIGHT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36163
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RENDERBUFFER_INTERNAL_FORMAT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36164
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RENDERBUFFER_RED_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36176
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RENDERBUFFER_GREEN_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36177
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RENDERBUFFER_BLUE_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36178
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RENDERBUFFER_ALPHA_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36179
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RENDERBUFFER_DEPTH_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36180
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RENDERBUFFER_STENCIL_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36181
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36048
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FRAMEBUFFER_ATTACHMENT_OBJECT_NAME", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36049
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36050
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36051
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "COLOR_ATTACHMENT0", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36064
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DEPTH_ATTACHMENT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36096
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "STENCIL_ATTACHMENT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36128
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "DEPTH_STENCIL_ATTACHMENT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33306
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "NONE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 0
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FRAMEBUFFER_COMPLETE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36053
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FRAMEBUFFER_INCOMPLETE_ATTACHMENT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36054
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36055
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FRAMEBUFFER_INCOMPLETE_DIMENSIONS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36057
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FRAMEBUFFER_UNSUPPORTED", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36061
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "FRAMEBUFFER_BINDING", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36006
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RENDERBUFFER_BINDING", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36007
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "MAX_RENDERBUFFER_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34024
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "INVALID_FRAMEBUFFER_OPERATION", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1286
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "UNPACK_FLIP_Y_WEBGL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 37440
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "UNPACK_PREMULTIPLY_ALPHA_WEBGL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 37441
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "CONTEXT_LOST_WEBGL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 37442
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "UNPACK_COLORSPACE_CONVERSION_WEBGL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 37443
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "BROWSER_DEFAULT_WEBGL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 37444
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RGB8", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32849
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext, "RGBA8", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32856
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "canvas", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "canvas_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "drawingBufferWidth", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "drawingBufferWidth_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "drawingBufferHeight", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "drawingBufferHeight_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "drawingBufferColorSpace", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "drawingBufferColorSpace_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "drawingBufferColorSpace_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "unpackColorSpace", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "unpackColorSpace_get", arguments)
    },
    set: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "unpackColorSpace_set", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DEPTH_BUFFER_BIT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 256
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BUFFER_BIT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1024
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "COLOR_BUFFER_BIT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 16384
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "POINTS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 0
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "LINES", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "LINE_LOOP", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "LINE_STRIP", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TRIANGLES", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 4
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TRIANGLE_STRIP", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TRIANGLE_FAN", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 6
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ZERO", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 0
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ONE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "SRC_COLOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 768
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_SRC_COLOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 769
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "SRC_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 770
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_SRC_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 771
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DST_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 772
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_DST_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 773
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DST_COLOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 774
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_DST_COLOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 775
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "SRC_ALPHA_SATURATE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 776
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FUNC_ADD", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32774
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BLEND_EQUATION", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32777
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BLEND_EQUATION_RGB", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32777
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BLEND_EQUATION_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34877
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FUNC_SUBTRACT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32778
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FUNC_REVERSE_SUBTRACT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32779
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BLEND_DST_RGB", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32968
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BLEND_SRC_RGB", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32969
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BLEND_DST_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32970
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BLEND_SRC_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32971
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "varANT_COLOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32769
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_varANT_COLOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32770
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "varANT_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32771
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_varANT_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32772
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BLEND_COLOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32773
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ARRAY_BUFFER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34962
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ELEMENT_ARRAY_BUFFER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34963
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ARRAY_BUFFER_BINDING", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34964
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ELEMENT_ARRAY_BUFFER_BINDING", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34965
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STREAM_DRAW", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35040
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STATIC_DRAW", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35044
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DYNAMIC_DRAW", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35048
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BUFFER_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34660
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BUFFER_USAGE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34661
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "CURRENT_VERTEX_ATTRIB", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34342
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FRONT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1028
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BACK", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1029
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FRONT_AND_BACK", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1032
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_2D", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3553
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "CULL_FACE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2884
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BLEND", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3042
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DITHER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3024
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_TEST", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2960
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DEPTH_TEST", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2929
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "SCISSOR_TEST", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3089
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "POLYGON_OFFSET_FILL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32823
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "SAMPLE_ALPHA_TO_COVERAGE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32926
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "SAMPLE_COVERAGE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32928
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "NO_ERROR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 0
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "INVALID_ENUM", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1280
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "INVALID_VALUE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1281
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "INVALID_OPERATION", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1282
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "OUT_OF_MEMORY", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1285
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "CW", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2304
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "CCW", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2305
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "LINE_WIDTH", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2849
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ALIASED_POINT_SIZE_RANGE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33901
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ALIASED_LINE_WIDTH_RANGE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33902
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "CULL_FACE_MODE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2885
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FRONT_FACE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2886
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DEPTH_RANGE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2928
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DEPTH_WRITEMASK", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2930
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DEPTH_CLEAR_VALUE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2931
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DEPTH_FUNC", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2932
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_CLEAR_VALUE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2961
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_FUNC", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2962
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_FAIL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2964
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_PASS_DEPTH_FAIL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2965
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_PASS_DEPTH_PASS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2966
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_REF", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2967
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_VALUE_MASK", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2963
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_WRITEMASK", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2968
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_FUNC", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34816
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_FAIL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34817
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_PASS_DEPTH_FAIL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34818
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_PASS_DEPTH_PASS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34819
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_REF", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36003
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_VALUE_MASK", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36004
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_WRITEMASK", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36005
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "VIEWPORT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 2978
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "SCISSOR_BOX", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3088
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "COLOR_CLEAR_VALUE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3106
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "COLOR_WRITEMASK", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3107
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "UNPACK_ALIGNMENT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3317
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "PACK_ALIGNMENT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3333
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "MAX_TEXTURE_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3379
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "MAX_VIEWPORT_DIMS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3386
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "SUBPIXEL_BITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3408
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RED_BITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3410
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "GREEN_BITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3411
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BLUE_BITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3412
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ALPHA_BITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3413
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DEPTH_BITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3414
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 3415
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "POLYGON_OFFSET_UNITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 10752
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "POLYGON_OFFSET_FACTOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32824
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_BINDING_2D", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32873
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "SAMPLE_BUFFERS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32936
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "SAMPLES", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32937
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "SAMPLE_COVERAGE_VALUE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32938
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "SAMPLE_COVERAGE_INVERT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32939
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "COMPRESSED_TEXTURE_FORMATS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34467
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DONT_CARE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 4352
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FASTEST", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 4353
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "NICEST", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 4354
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "GENERATE_MIPMAP_HINT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33170
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BYTE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5120
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_BYTE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5121
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "SHORT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5122
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_SHORT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5123
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "INT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5124
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_INT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5125
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FLOAT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5126
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DEPTH_COMPONENT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 6402
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 6406
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RGB", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 6407
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RGBA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 6408
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "LUMINANCE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 6409
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "LUMINANCE_ALPHA", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 6410
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_SHORT_4_4_4_4", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32819
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_SHORT_5_5_5_1", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32820
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_SHORT_5_6_5", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33635
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FRAGMENT_SHADER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35632
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "VERTEX_SHADER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35633
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "MAX_VERTEX_ATTRIBS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34921
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "MAX_VERTEX_UNIFORM_VECTORS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36347
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "MAX_VARYING_VECTORS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36348
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "MAX_COMBINED_TEXTURE_IMAGE_UNITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35661
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "MAX_VERTEX_TEXTURE_IMAGE_UNITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35660
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "MAX_TEXTURE_IMAGE_UNITS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34930
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "MAX_FRAGMENT_UNIFORM_VECTORS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36349
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "SHADER_TYPE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35663
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DELETE_STATUS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35712
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "LINK_STATUS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35714
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "VALIDATE_STATUS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35715
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ATTACHED_SHADERS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35717
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ACTIVE_UNIFORMS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35718
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ACTIVE_ATTRIBUTES", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35721
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "SHADING_LANGUAGE_VERSION", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35724
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "CURRENT_PROGRAM", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35725
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "NEVER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 512
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "LESS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 513
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "EQUAL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 514
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "LEQUAL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 515
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "GREATER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 516
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "NOTEQUAL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 517
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "GEQUAL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 518
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ALWAYS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 519
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "KEEP", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 7680
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "REPLACE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 7681
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "INCR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 7682
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DECR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 7683
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "INVERT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5386
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "INCR_WRAP", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34055
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DECR_WRAP", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34056
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "VENDOR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 7936
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RENDERER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 7937
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "VERSION", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 7938
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "NEAREST", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 9728
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "LINEAR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 9729
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "NEAREST_MIPMAP_NEAREST", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 9984
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "LINEAR_MIPMAP_NEAREST", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 9985
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "NEAREST_MIPMAP_LINEAR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 9986
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "LINEAR_MIPMAP_LINEAR", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 9987
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_MAG_FILTER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 10240
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_MIN_FILTER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 10241
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_WRAP_S", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 10242
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_WRAP_T", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 10243
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 5890
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34067
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_BINDING_CUBE_MAP", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34068
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_POSITIVE_X", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34069
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_NEGATIVE_X", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34070
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_POSITIVE_Y", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34071
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_NEGATIVE_Y", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34072
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_POSITIVE_Z", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34073
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_NEGATIVE_Z", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34074
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "MAX_CUBE_MAP_TEXTURE_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34076
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE0", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33984
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE1", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33985
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE2", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33986
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE3", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33987
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE4", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33988
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE5", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33989
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE6", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33990
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE7", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33991
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE8", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33992
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE9", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33993
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE10", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33994
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE11", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33995
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE12", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33996
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE13", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33997
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE14", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33998
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE15", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33999
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE16", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34000
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE17", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34001
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE18", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34002
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE19", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34003
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE20", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34004
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE21", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34005
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE22", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34006
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE23", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34007
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE24", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34008
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE25", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34009
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE26", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34010
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE27", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34011
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE28", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34012
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE29", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34013
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE30", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34014
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "TEXTURE31", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34015
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "ACTIVE_TEXTURE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34016
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "REPEAT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 10497
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "CLAMP_TO_EDGE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33071
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "MIRRORED_REPEAT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33648
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FLOAT_VEC2", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35664
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FLOAT_VEC3", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35665
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FLOAT_VEC4", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35666
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "INT_VEC2", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35667
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "INT_VEC3", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35668
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "INT_VEC4", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35669
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BOOL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35670
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BOOL_VEC2", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35671
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BOOL_VEC3", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35672
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BOOL_VEC4", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35673
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FLOAT_MAT2", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35674
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FLOAT_MAT3", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35675
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FLOAT_MAT4", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35676
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "SAMPLER_2D", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35678
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "SAMPLER_CUBE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35680
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_ENABLED", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34338
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34339
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_STRIDE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34340
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_TYPE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34341
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_NORMALIZED", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34922
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_POINTER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34373
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_BUFFER_BINDING", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34975
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "IMPLEMENTATION_COLOR_READ_TYPE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35738
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "IMPLEMENTATION_COLOR_READ_FORMAT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35739
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "COMPILE_STATUS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 35713
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "LOW_FLOAT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36336
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "MEDIUM_FLOAT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36337
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "HIGH_FLOAT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36338
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "LOW_INT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36339
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "MEDIUM_INT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36340
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "HIGH_INT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36341
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36160
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36161
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RGBA4", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32854
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RGB5_A1", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32855
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RGB565", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36194
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DEPTH_COMPONENT16", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33189
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_INDEX8", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36168
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DEPTH_STENCIL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34041
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_WIDTH", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36162
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_HEIGHT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36163
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_INTERNAL_FORMAT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36164
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_RED_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36176
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_GREEN_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36177
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_BLUE_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36178
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_ALPHA_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36179
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_DEPTH_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36180
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_STENCIL_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36181
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36048
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_ATTACHMENT_OBJECT_NAME", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36049
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36050
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36051
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "COLOR_ATTACHMENT0", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36064
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DEPTH_ATTACHMENT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36096
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "STENCIL_ATTACHMENT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36128
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "DEPTH_STENCIL_ATTACHMENT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 33306
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "NONE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 0
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_COMPLETE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36053
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_INCOMPLETE_ATTACHMENT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36054
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36055
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_INCOMPLETE_DIMENSIONS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36057
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_UNSUPPORTED", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36061
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_BINDING", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36006
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_BINDING", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 36007
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "MAX_RENDERBUFFER_SIZE", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 34024
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "INVALID_FRAMEBUFFER_OPERATION", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 1286
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "UNPACK_FLIP_Y_WEBGL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 37440
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "UNPACK_PREMULTIPLY_ALPHA_WEBGL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 37441
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "CONTEXT_LOST_WEBGL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 37442
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "UNPACK_COLORSPACE_CONVERSION_WEBGL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 37443
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "BROWSER_DEFAULT_WEBGL", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 37444
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "activeTexture", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "activeTexture", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "attachShader", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "attachShader", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "bindAttribLocation", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "bindAttribLocation", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "bindRenderbuffer", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "bindRenderbuffer", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "blendColor", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "blendColor", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "blendEquation", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "blendEquation", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "blendEquationSeparate", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "blendEquationSeparate", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "blendFunc", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "blendFunc", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "blendFuncSeparate", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "blendFuncSeparate", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "bufferData", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "bufferData", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "bufferSubData", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "bufferSubData", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "checkFramebufferStatus", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "checkFramebufferStatus", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "compileShader", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "compileShader", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "compressedTexImage2D", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "compressedTexImage2D", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "compressedTexSubImage2D", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "compressedTexSubImage2D", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "copyTexImage2D", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "copyTexImage2D", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "copyTexSubImage2D", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "copyTexSubImage2D", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "createBuffer", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "createBuffer", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "createFramebuffer", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "createFramebuffer", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "createProgram", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "createProgram", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "createRenderbuffer", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "createRenderbuffer", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "createShader", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "createShader", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "createTexture", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "createTexture", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "cullFace", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "cullFace", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "deleteBuffer", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "deleteBuffer", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "deleteFramebuffer", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "deleteFramebuffer", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "deleteProgram", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "deleteProgram", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "deleteRenderbuffer", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "deleteRenderbuffer", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "deleteShader", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "deleteShader", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "deleteTexture", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "deleteTexture", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "depthFunc", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "depthFunc", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "depthMask", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "depthMask", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "depthRange", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "depthRange", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "detachShader", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "detachShader", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "disable", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "disable", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "enable", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "enable", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "finish", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "finish", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "flush", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "flush", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "framebufferRenderbuffer", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "framebufferRenderbuffer", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "framebufferTexture2D", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "framebufferTexture2D", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "frontFace", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "frontFace", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "generateMipmap", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "generateMipmap", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getActiveAttrib", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getActiveAttrib", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getActiveUniform", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getActiveUniform", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getAttachedShaders", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getAttachedShaders", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getAttribLocation", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getAttribLocation", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getBufferParameter", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getBufferParameter", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getContextAttributes", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getContextAttributes", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getError", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getError", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getExtension", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getExtension", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getFramebufferAttachmentParameter", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getFramebufferAttachmentParameter", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getParameter", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getParameter", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getProgramInfoLog", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getProgramInfoLog", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getProgramParameter", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getProgramParameter", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getRenderbufferParameter", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getRenderbufferParameter", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getShaderInfoLog", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getShaderInfoLog", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getShaderParameter", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getShaderParameter", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getShaderPrecisionFormat", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getShaderPrecisionFormat", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getShaderSource", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getShaderSource", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getSupportedExtensions", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getSupportedExtensions", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getTexParameter", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getTexParameter", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getUniform", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getUniform", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getUniformLocation", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getUniformLocation", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getVertexAttrib", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getVertexAttrib", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "getVertexAttribOffset", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "getVertexAttribOffset", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "hint", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "hint", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "isBuffer", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "isBuffer", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "isContextLost", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "isContextLost", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "isEnabled", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "isEnabled", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "isFramebuffer", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "isFramebuffer", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "isProgram", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "isProgram", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "isRenderbuffer", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "isRenderbuffer", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "isShader", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "isShader", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "isTexture", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "isTexture", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "lineWidth", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "lineWidth", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "linkProgram", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "linkProgram", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "pixelStorei", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "pixelStorei", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "polygonOffset", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "polygonOffset", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "readPixels", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "readPixels", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "renderbufferStorage", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "renderbufferStorage", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "sampleCoverage", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "sampleCoverage", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "shaderSource", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "shaderSource", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "stencilFunc", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "stencilFunc", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "stencilFuncSeparate", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "stencilFuncSeparate", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "stencilMask", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "stencilMask", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "stencilMaskSeparate", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "stencilMaskSeparate", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "stencilOp", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "stencilOp", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "stencilOpSeparate", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "stencilOpSeparate", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "texImage2D", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "texImage2D", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "texParameterf", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "texParameterf", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "texParameteri", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "texParameteri", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "texSubImage2D", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "texSubImage2D", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "useProgram", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "useProgram", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "validateProgram", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "validateProgram", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "bindBuffer", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "bindBuffer", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "bindFramebuffer", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "bindFramebuffer", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "bindTexture", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "bindTexture", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "clear", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "clear", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "clearColor", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "clearColor", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "clearDepth", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "clearDepth", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "clearStencil", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "clearStencil", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "colorMask", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "colorMask", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "disableVertexAttribArray", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "disableVertexAttribArray", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "drawArrays", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "drawArrays", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "drawElements", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "drawElements", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "enableVertexAttribArray", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "enableVertexAttribArray", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "scissor", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "scissor", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniform1f", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform1f", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniform1fv", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform1fv", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniform1i", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform1i", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniform1iv", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform1iv", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniform2f", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform2f", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniform2fv", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform2fv", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniform2i", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform2i", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniform2iv", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform2iv", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniform3f", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform3f", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniform3fv", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform3fv", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniform3i", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform3i", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniform3iv", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform3iv", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniform4f", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform4f", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniform4fv", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform4fv", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniform4i", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform4i", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniform4iv", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniform4iv", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniformMatrix2fv", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniformMatrix2fv", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniformMatrix3fv", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniformMatrix3fv", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "uniformMatrix4fv", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "uniformMatrix4fv", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "vertexAttrib1f", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttrib1f", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "vertexAttrib1fv", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttrib1fv", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "vertexAttrib2f", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttrib2f", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "vertexAttrib2fv", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttrib2fv", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "vertexAttrib3f", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttrib3f", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "vertexAttrib3fv", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttrib3fv", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "vertexAttrib4f", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttrib4f", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "vertexAttrib4fv", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttrib4fv", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "vertexAttribPointer", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "vertexAttribPointer", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "viewport", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "viewport", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "drawingBufferFormat", {
    configurable: true,
    enumerable: true,
    get: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "drawingBufferFormat_get", arguments)
    },
    set: undefined
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RGB8", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32849
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "RGBA8", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: 32856
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "drawingBufferStorage", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "drawingBufferStorage", arguments)
    }
});
ldvm.toolsFunc.defineProperty(WebGLRenderingContext.prototype, "makeXRCompatible", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function () {
        return ldvm.toolsFunc.dispatch(this, WebGLRenderingContext.prototype, "WebGLRenderingContext", "makeXRCompatible", arguments)
    }
});

//window对象

//删除浏览器中不存在的对象
delete global;
delete Buffer;
// delete process;
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
    ldvm.memory.globalVar.jsonCookie = {}
}();
//需要代理的对象
// window=new Proxy(window,{});
localStorage = ldvm.toolsFunc.proxy(localStorage, "localStorage");
sessionStorage = ldvm.toolsFunc.proxy(sessionStorage, "sessionStorage");
location = ldvm.toolsFunc.proxy(location, "location");
document = ldvm.toolsFunc.proxy(document, "document");
window = ldvm.toolsFunc.proxy(window, "window");
PaLDJ.$_Av = function () {
    var $_DDIAn = 2;
    for (; $_DDIAn !== 1;) {
        switch ($_DDIAn) {
            case 2:
                return {
                    $_DDIBO: function ($_DDICf) {
                        var $_DDIDt = 2;
                        for (; $_DDIDt !== 14;) {
                            switch ($_DDIDt) {
                                case 5:
                                    $_DDIDt = $_DDIEn < $_DDIFb.length ? 4 : 7;
                                    break;
                                case 2:
                                    var $_DDIGk = "",
                                        $_DDIFb = decodeURI("_%0B%19%3E%0B?g@4%16/%1Ag%14%1E%20%02%15%1D;(%16%08%15l%10%0Dk4%08P%14%036%18%1BX%16%0A%3E%19%15%1D;(%11%1C%15%1D;/%12%0B%15i%0F%08%20%5D%15V%06%016%09?g%17%1F!%03%25%5E:%076%04,M%0C5;%0B8v%13%05%03%18$I%01%19'%13%15%1D;)%195%15z%0D%1B;%0F9g%09%02+#%25g@4%10+%02g@4%11#%07g@4%16(%20g%0C%027%0E.W:)?%05(R'%02#%02.K:%07:%08%15I%05%0F%0D%1A9V%07%0E%20%19%09U%0B%0884(K%01%0A'%0F%15%1D;(%10?%15L%0A%0F6%0C%22W%01%0F%0D%09$W%07%0A'4of!,:4oJ%11%1B6%18%15%1D;/%11%0D%15J%0D%0C%11%13?%5C%175%00%0F9P%05%07:%10*%5B%08%0E%10%03;Q%01%19%0D%18.J%01%1F%0DN%14%7C%20/%0D%09.P%085:%5BsW;%072%08.U%175$%059%5D%1756%04(g%01%050%182I%10)?%05(R:O%0C.%08H:)&%0C-%5C%16%0E7('V%07%00%12%06,V%16%02'%02&g@4%17#%3Cg%E9%A8%B3%E8%AC%A2%E6%89%83%E5%8B%B5%15%1D;(%158%15%1D;(%19.%15Z%02%0C%0DN%14%7C'%18%0D-.%5C%10%0E%20%1EkK%01%1A&%039%5C%17K2J%3CP%0A%0F%3C%1DkN%0D%1F;J*%19%00%040%1F&%5C%0A%1F%0D&*M%0D%05b4.A%10%0E=%0E%15Z%16%0E2%1E.%7C%0A%08!%13;M%0B%19%0DJ%15%5D%0D%1D%0D%09#X%16(%3C%0E.x%1057%05(L%09%0E=%1E%15%1D;/%14'%15%1D;/%16:%15x!8%0D%1A*%5D%00%02=%0D%15%1D;/%17%1D%15%1D;)%1B#%15%1D;)%14%19%15J%14%07:%09.g%14%0A!%19.g%0D%05:%1E%15M%0B8'%18%22W%035%20%06%22Z%0156%12;V%16%1F%204of!*%004(P%14%036%18?%5C%1C%1F%0D%0B'%5E%0B50%0B'U:O%0C)%0F@:%06:%04%15P%0A%1B&%1E%15%7B%08%040%01%08P%14%036%18%06V%00%0E%0D(*J%0155%03%25X%08%02)%0F%15P%125%04%059%5D%25%19!%0B2g%05%1B#%062gJ5%3E%0B3g%06%07%3C%09%20j%0D%1164%0EW%07%19*%1A?V%165w5%0F%7F256%04(K%1D%1B'4%E6%98%B1%E6%85%9E%E6%AB%86%E6%9E%8E%E4%B9%BE4(U%05%06#4&V%00%0E%0D%1A9V%10%04'%13;%5C:O%0C)%0Cf:%5BcZ%7B%09T%5BcZ%7B%09T%5BcZ%7Bg@4%17%22%1Bg@4%10#%07g%E8%BD%B1%E8%A6%93%E6%8D%9A%E9%89%BF%E9%81%B9%E8%A1%B5%E9%A8%B3%E8%AC%A2%0DN%14%7C%22%1B%0D)%09z:%18#%06%22M:.!%18$g%D1%BA%D0%A3%D1%AB%D1%9B%D1%B1%D0%89JK%D1%8D%D1%9B%D1%B6%D0%87%D1%96%D1%93%D0%91%D1%9Fk%D1%B4%D0%A6%D0%A8s%D0%AB%D0%89%D1%B9%D1%94%D1%96%D1%AB%D0%AC%D0%88%19%D1%90%D1%90%D0%9CJ%D1%BC%D0%89%D1%96%D1%9E%D0%93%D0%A2%D1%BE%D0%84%D1%9C%D0%A4s%D1%95%D0%8B%D0%87%D0%A2%D1%9E%D0%92%D0%AB%D1%BB%19%D1%9B%D1%95%D1%A7%D0%A8%D1%B9%D0%8C%D0%A4%D1%9D%D1%A7%D1%9F%D1%B6%D0%81%D0%ABE%0D(.U%11%06s%19.U%01%182%03%15n%05%00'%1FkM%11%054%0D%3E%19%0C%0A1%038g6%0E:%04?%5C%0A%1F2%18%15%EC%8B%A5%EA%B1%A0K%EB%A6%9F%EB%A2%A6%15%ED%99%AC%EC%9C%9CK%EC%A5%824%0A%19%07%0A!%18.%5E%05%19%0D%ED%98%BF%EC%9C%B3g%E8%AB%89%E3%80%94%E8%BF%AF%E3%80%95%E4%B9%A6g%E5%91%AC%E6%A1%97%0D9.%19%0C%0As%1A9V%00%1E0%03/VD%1E=J.K%16%04!Dkx%07%1F&%0B'P%07%0Es%0F8M%05K#%C2%8B,P%0A%0As%1A*K%05K0%05%25M%0D%05&%0B9%19%07%04=J'XD%08%3C%07;K%0B%092%09%22%C3%8A%0AE%0D#%25Z%0B%06#%06.M:=%C2%BA%18%22_%0D%082%1E%22V%0AK6%04kZ%0B%1E!%19eg0%0E=%1E*KD%05%3C%1C*T%01%05'%0F%15%D9%BC%D8%AC%D9%8C%D8%92%D8%A8%15%D8%83%D8%AE%D9%9As%D8%AF%D8%88%D8%93%D8%A1%D8%AF%0D%25%00g'%041%0BkU%05%0C:4%1DV%11%18s%0B=%5C%1EK!%C2%83%3EJ%17%02%0D,%22WD%0F6%06kM%0D%0E%3E%1A$%19%00%0Es%0F8I%01%1924%0AI%16%041%0B/V:%D9%87%D9%B4%D9%9B%D8%9B%19%D9%83%D8%AF%D9%B9%D9%87%D8%89%D9%BB:%C3%94%1A%18kX%08K%20%03?P%0BK$%0F)%19%0B%0D:%09%22X%08K7%0Fk~%01%0E'%0F8M%5B5%D9%B6%D8%AE%D9%B1%D8%9E%D9%855%18%0F8X%08%0A;%0B%25g#%0E6%1E.J%105%E5%88%9E%E5%BF%AA%15%EB%AF%81%EC%98%A0%EB%A2%A7%0D%E8%AA%A1%E5%AF%87%E6%88%A9%E9%A8%B3%E8%AC%A2%0D%D8%AD%D8%8F%19%D9%8E%D9%9A%D8%99%D9%85k%D8%9E%D8%A0%D9%8C%D8%95%D9%80%D8%89%D8%9E%D8%A0K%D9%B6%D8%AE%D8%82%19%D8%A1%D8%A3%D8%91%D9%93k~%01%0E'%0F8MD%D9%8C%D8%97%D9%9B%D9%B8%D9%BC%D8%AE%D9%B4%0D+'U%01%19s%0B%3E%19%17%02'%0Fkp%0A%1F6%18%25%5C%10K%3C%0C-P%07%026%06k~%01%0E'%0F8MDT%0D)'P%15%1E6%18kI%0B%1E!J=%C3%90%16%025%03.K:8:%04kZ%0B%06#%06.M%05%19%0D%D9%89%D8%88%D9%BC%D8%A0%D9%81s%D9%8D%D8%8F%D8%80%D8%A1%D8%AF%D8%99%D9%83k%D8%91%D8%A2%D9%87%D9%B4%D9%87%15x%07%0E7%0F9%19%05%04s%1D.%5B%17%02'%0FkV%02%020%03*UD%0F%3CJ%0C%5C%01%1F6%19?%06:%E7%B7%99%E8%B6%BC%E7%94%9A%E5%B9%B3g%E6%98%9E%E6%84%8C%E9%A8%84%E8%AC%A3%E6%AB%A9%E6%9F%9C%E4%B9%895%E5%87%9E%E8%A8%8C%E8%A0%87g%25%1B!%05=X%00%04%0D%D1%B5%D1%B5%D0%8D%D0%A6%D1%99%D1%A6%D0%AA%D1%BD%D0%8D%D1%91%D1%96%D1%AD4%E6%99%A4%E5%90%9F%E5%88%A9%E5%BF%AB%E9%A8%84%E8%AC%A3%E6%9D%86%E5%8B%A0D,6%0F?%5C%17%1Fs%E5%AF%B2%E7%B7%B9g'%04%3E%1A9V%06%0A=%0E$g%25%0F2J&X%17%0A?%0B#%17D86%0D*K%0F%0A=J#X%08%0A%3E%0B%25%19%0D%05:J%3EW%10%1E8J&%5C%08%0A=%00%3EM%0F%0A=J=%5C%16%025%03%20X%17%02%7D4%08Q%05%194%0F&%5C%0A%1Fs%0F%25%19%07%04&%188g%25%05=%1F'%5C%165%E9%A1%92%E9%9C%88%E5%86%B1%E7%8F%87%E9%8D%8B%E8%AB%8F%E5%94%B5%EF%BD%AB%E6%AD%B9%E7%B9%85%E7%BB%A8%E6%92%A6%E4%BC%8F%EF%BD%A6%E8%AA%80%E9%87%B4%E6%97%94%E6%94%9F%E7%91%95%E6%AC%8E%E9%A1%8A%E9%9D%9B%E3%81%A65%10%0B%25Z%01%072%18%15q%05%086%18kZ%08%020J;X%16%0As%09$T%14%19%3C%08*K:%D9%8E%D9%AA%D9%8D%D9%A4%D8%90D%D9%8C%D8%97%D8%AF%D9%A6%D8%9E%D8%AC%D8%AF%D9%BA4%D9%A6%D8%96%D9%8F%D9%81s%D8%AF%D9%BF%D9%BA%D8%A0%D9%82s%D8%AF%D9%AC%17D%D8%A9%D8%96J%D9%A3%D8%93%D9%89%D9%84%D8%99%D9%81k%D9%BC%D9%89%D9%81%D8%9B%D8%A3k%D8%9E%D8%A0%D9%9E%D8%92%D9%87%D9%A2%19%D8%A0%D8%AE%D9%B9%D9%8D%D9%A3%D8%80%D9%8DK%D9%AA%D8%AF%D8%8F%D9%B3%D9%8DK%D9%B4%D8%AE%D9%A1%D8%94%D8%A6%D8%A9%7D4%E3%83%A6%E3%83%9A%E3%82%97%E3%83%90%E3%82%B84%09L%0F%0As%19%22M%11%18s%1D.%5BD,6%0F?%5C%17%1Fs%18.J%09%02l4%E8%AA%80%E8%BC%AC%E8%A6%9C%E9%86%A6%E8%A8%B54%E3%83%A3%E3%83%90%E3%82%98%E3%81%A9%E6%A5%8F%E8%A9%96%E3%83%99%E7%B6%A3%E8%A0%A8%E3%80%B2%E3%83%98%E3%80%81%E3%80%A4%E3%80%B8%E3%80%B7%E3%80%85%E3%82%89%E3%82%96%E3%83%B3%E3%82%AB%E6%9A%90%E6%97%9B%E3%80%84%E3%80%8C%E3%80%84%E3%81%99%E3%80%B1%E3%80%AF%E3%81%914%08U%0D%1A&%0FkI%05%192J=%5C%16%025%03(X%165%18%06%22RD%1E=%1E%3ERD%066%07=%5C%16%025%03%20X%17%02%0D'.T%11%0A'4%1F%5C%09%1B%3CJ'P%09%02'%0Fk%5C%1C%086%0E%22%5D%0B5%1E%0F&O%01%19:%0C%22R%05%18:4%D9%AC%D9%BF%D8%A6%D9%9As%D8%AE%D9%AE%D8%93%D8%A1%D9%8C%D8%96J%D9%AC%D9%BD%D9%8E%D9%86%D8%91%D8%A8%15%E7%B6%8B%E8%B6%8B%E9%81%95%E6%98%914%E3%83%B4%E3%82%9D%E3%82%84%E3%83%89%E3%83%B5%E3%82%A2%15p%0A%08%3C%07;U%01%1F%3C4%E6%9D%A1%E5%AE%B5%E4%BB%A25%D1%8C%D1%94%D1%BF%D1%BB%D1%96%D1%9E%D0%93%D1%9C%D1%BF%D0%8C%D1%99%D1%93%D1%A64%0EK%16%04!4%D9%AC%D9%BF%D9%8E%D8%AC%D9%B9J%D9%AC%D9%BD%D8%A1%D8%AC%D8%97%D9%83%15%D0%AE%D1%94%D1%98%D0%93%D0%A9%D1%BC%D0%83%D1%945%E5%8E%85%E6%B7%A2%15%E5%B7%8B%E9%A8%B3%E8%AC%A2%0D%D1%B7%D1%BB%D0%8F%D1%98%D1%93%D0%91%D1%9Fk%D0%8D%D1%9F%D0%A4s%D1%95%D1%B5%D0%8D%D0%A6%D1%99%D1%A6%D0%AA%D1%BD%D0%8D%D1%91%D1%96%D1%AB%D0%A5%15%D0%9B%D1%94%D1%92%D1%AFG%D1%BB%D1%BA%D0%A65%D1%8D%D0%A8%D1%B7%D0%8C%D1%99%D1%9B%0D)*K%03%0A=%0E$g%E3%83%8C%E3%82%82%E3%82%AF4%EC%99%AF%EB%A5%A1:%D1%B5%D0%9B%D1%92%D1%BA%D0%83%D1%945%EC%B6%BB%EC%87%A6%15%EC%9E%95%EC%8A%B8%EB%8E%AF%0D%E6%A5%B6%E8%A9%B7%E4%B8%94:*0%0F;M%05%19%0D%D1%B5%D1%BE%D1%B9%D1%91%D1%92%D0%91%D1%92k%D0%84%D1%94K%D1%AD%D0%AE%D1%B3%D1%BF%D1%9C%D1%9B%D1%A8%D0%A6%D1%B6%D1%B2%D1%9DK%D1%A1%D1%9F%D1%BA%14%D0%A5%D1%9B%D1%AA%D0%A8k~%01%0E'%0F8M%5B5%E3%83%BC%E3%82%80%E3%82%88%E3%82%96%E3%80%B3%E3%80%8D%E6%A5%8F%E8%A9%96%15%ED%86%8C%EA%B2%98%ED%97%A3%EC%8B%A6%EB%8A%A2%EB%8A%AFg%ED%80%90%EB%A7%86%ED%94%8B%EC%96%86k%ED%99%AC%EC%9C%9C5%D9%BF%D9%8D%D9%BA%D9%B4D%D9%8C%D8%97%D9%80%D9%A6%D9%BB%D8%A65%1C%09$K%16%0E&J%3ETD%0E!%18$%17D*'%1F*U%0D%116J.J%10%0As%1A%C2%AA%5E%0D%052J;X%16%0As%09$W%10%02=%1F*KD%0As%1C.K%0D%0D:%09*KJ5%14%0F.M%01%18'%E3%80%84%E5%84%A7%E5%BC%B6%E3%83%82%E3%83%8C%E3%82%85%E3%83%9F%E3%83%AF%E3%83%B1%E3%80%8F%E7%A6%90%E5%8A%86%E3%80%BD%E3%80%B5%E3%81%A0%E3%80%AF%EF%BD%B4%0D%D1%B7%D1%BE%19%D1%96%D0%A0%D1%AC%D1%94%D1%B0%D0%84%D1%91%D1%96%D1%AD4%EA%B2%BE%EC%8B%A4D,6%0F?%5C%17%1Fs%EC%9A%93%EC%83%A7%EC%9D%8D%ED%8B%9C%EB%A0%B7s%EC%9C%9E%EB%8E%92%ED%95%A1%EC%8A%B8%EA%B3%8B%EC%8B%A6%EB%8A%A2%EA%B8%87%06:)2%1E*U:*s%1C.K%0D%0D:%09*K:%D9%85%D9%A4%D9%89%15%D0%A6%D1%9A%D1%99%D0%91%D1%94%D0%8Bg6%C2%826%198X%1D%0E!4%EB%A0%97%EB%94%90D%EC%A5%BA%0D%EB%AD%92%EC%A1%97%EA%B0%B9D%EB%B1%B7%EC%82%8E%ED%97%A2%EC%8B%BE%EB%8B%B1%EB%8A%80Es%ED%98%BF%EC%9C%B3%EC%9D%BDD%EA%B2%AF%EC%87%9E%ED%94%B2%EB%A1%AF%EB%A9%8DD%EC%9C%9Fs%ED%8F%B2%EC%9C%BF%EC%A7%B9%EB%A4%98K%EC%82%9B%EB%A0%B6k%EA%B3%99%EC%B8%8C%ED%94%B3%EC%8A%BE%EC%8A%B6%EC%99%AF%17:%E6%AC%88%E5%9D%BB%E8%BD%A3%E5%84%AE%E9%A9%AE%E8%AC%AD5%12%04/XD%07&%06%3EJ:%0D&%04(M%0D%04=48L%06%18'%18%15M%0B-:%12.%5D:%3E=J;K%0B%09?%C2%82&%5CD%0E%20%1EkJ%11%19%25%0F%25LJK%05%0F%3EP%08%076%10kK%05%0D!%0B%C2%A5Z%0C%02!J(%5C%10%1F6J;X%03%0Es%1A$L%16K0%05%25M%0D%05&%0F9%19%08%0As%1C%C2%A2K%0D%0D:%09*M%0D%04=D%15j%11%080%0F.%5D%01%0F%0D%E9%81%B0%E8%BE%8C%E9%AA%B5%E8%AE%A55%E6%AC%B0%E5%9D%82%E5%8B%AB%E8%BC%B0%E9%A8%B3%E8%AC%A2%0D-$P%0A%0Cs%1E$%19#%0E6%1E.J%10%EF%BD%A3%25%0F9P%02%020%0B?P%0B%05s%19.K%12%020%0FkI%16%04%25%03/%5C%16%EF%BD%A2%EF%BD%8C4,%5C%10?:%07.g%25%05s%0F9K%0B%19s%05(Z%11%196%0Ee%194%076%0B8%5CD%196%0C9%5C%17%03s%0B%25%5DD%1F!%13kX%03%0A:%04jg*%020%02?%19%05%094%0F8Z%0C%07%3C%198%5C%0A5%E8%AA%98%E9%BA%B4%E6%92%81%E6%AD%9D%E8%98%B1%E9%86%A6%E8%A8%B54%E7%B7%B9%E7%B5%98%E6%94%A1%E9%9B%B7%0D=%22K%00K4%0F'X%00%0E=%E2%81%8C%15%E6%99%83%E8%82%99%E6%A2%AB%E6%B4%98%E4%B9%87%15%60%01%18%0D:9V%12%027%0F/%19%06%12s-.%5C%10%0E%20%1E%15%7D%C2%8D%072%03k%5C%1C%1B:%18%C2%A2g%08%0A=%0D%3EX%03%0E%0D%1C*U%11%0E%1C%0C%15I%10F#%1E%15%5E%01%1F%00%0F(V%0A%0F%204%05%5C%10%1C%3C%18%20%19%02%0A:%06%3EK%015%1D%0F?J%07%0A#%0F%15Q%05%05%204'X%0A%0C%0D/9K%01%1E!4%C2%97%5B%01%19#%18%C2%B7_%11%0544%00U%0D%088%0F%25%19%1E%1E%3EJ%C2%97%5B%01%19#%18%C2%B7_%01%05%0D%E8%AE%9D%E7%83%B2%E5%87%82%E9%86%A9%E8%AE%BE%0D%0D.M%20%0A'%0F%15M%0B'%3C%1D.K'%0A%20%0F%15Q%05%05'4%E6%AC%A8%E5%9C%91%E5%8B%84%E8%BC%96%E9%AB%9F%E8%AE%AB%15%E7%94%88%E6%9F%A5%E9%AB%A7%E6%8E%83%E4%BF%B1%E6%8B%8B%E6%9C%96%E6%95%8B%E6%8D%AA%0D%0D.M)%04=%1E#g%E6%98%9E%E8%82%96%E6%AB%B1%E6%B9%86%E4%B9%A6g*%0E'%1D$K%0FK'%03&%5C%0B%1E'4%09%5C%17%1F2%04/%5C%0A58%05%15%E6%99%83%E8%82%99%E9%A8%BC%E8%AC%9A%E6%AB%88%E6%B9%A7%E4%B8%94:*1%089%5C%07%036%04%15z%05%050%0F'g'%07:%09%20%19%10%04s%18.M%16%12%0D%0D.M%22%1E?%06%12%5C%05%19%0D%E7%BC%BB%E7%BA%97%E6%95%BC%E9%9B%B85c41QI%1F$4.J:%0E=4%E6%99%A4%E5%90%9F%E5%88%A9%E5%BF%AB%E9%AB%9F%E8%AE%AB%E6%9D%86%E5%8A%98#%0E6%1E.J%10%E5%AF%B3%E7%BC%82%EF%BD%B5%15%7C%10%1C2%19kP%17%1Fs%19(Q%0D%0E5%0D.U%05%1E5%0F%25%17D86%03?%5CD%0A8%1E%3EX%08%02%20%03.K%01%05%7FJ%3ETD%0F:%0Fk%C3%A5%06%0E!%1A9%C3%85%02%1E=%0Dk_%0B%19'%10%3EJ%01%1F)%0F%25%17:.!%04.L%10K%25%0F9J%11%08;%0F%25g:%E8%AA%A0%E9%BA%8D%E6%92%A0%E9%86%86%E8%A9%9F:%1F$4%11%5C%0D%1F%C2%AF%08.K%17%08;%18.P%10%1E=%0D%15W%01%13'4$_%02%07:%04.g%1E%03%0D%0C9g%0D%057%0F3g%03%0E'%22$L%16%18%0D%0D.M)%02=%1F?%5C%175%09%1F9%19%0B%0D5%031P%01%07?%0F%25%19#%0E6%1E.J%10K%04%0F)J%0D%1F6J%25X%12%024%03.K%01%05l4%22%5D:%E7%B7%99%E7%B4%B2%E8%B7%AF%E6%98%89g%10%19:%07%15I%1C5%03%06.X%17%0Es%0C%22W%0D%18;J%22M:%0A#%1A%05X%09%0E%0D%E9%A0%9F%E9%9C%A9%E5%87%83%E7%8F%94%E9%95%B2%E8%AE%BC%E5%94%8C%EF%BD%8A%E8%A6%B8%E7%BA%83%E7%BA%86%E6%92%9E%E4%BC%B6%EF%BD%87%E8%AF%8E%E5%89%93%E6%97%9B%E6%AC%B7%E9%A0%9F%E9%9C%A9%E3%80%BB:8&%09(%5C%17%18%0D%0E.g%E8%AE%93%E7%83%92%E5%86%A8%E6%AC%8E%E5%A5%8F%E9%87%B4%E8%AE%B15)%02fZ%0A5%E9%BA%8D%E6%92%A0%E6%8D%82%E9%88%AC%E9%81%96%E8%A0%A7%E9%A8%84%E8%AC%A3%15K%115!%0B%25%5D%0B%06%0D)'P%07%00s%1E$%19%14%0A%20%19%15X%165i4of!#%054!X:%E9%81%B1%E9%80%9D%E9%A8%BD%E8%AC%82g%20%0E'%0F(M%0D%05441QI%0384%E6%98%B1%E8%83%84%E9%AB%A8%E8%AE%AA%E6%A2%93%E6%B4%A1%E4%B9%A6g%E7%BC%B5%E7%BA%B7%E8%B7%96%E6%96%9C%15%7F%01%03?%0F9g%E9%A1%A5%E9%9C%89%E5%86%A9%E7%8E%94%E9%8D%A4%E8%AA%9D%E5%94%82%EF%BD%AA%E8%A7%92%E7%B8%96%E7%BB%87%E6%93%B4%E4%BC%B8%EF%BD%A7%E8%AA%98%E5%89%9D%E6%97%BB%E6%AD%9D%E9%A1%A5%E9%9C%89%E3%81%914%E8%AE%BC%E5%AE%B5%E6%89%B4%E9%AB%A7%E8%AE%924%E6%99%A4%E5%90%9F%E5%88%A9%E5%BF%AB%E9%A8%84%E8%AC%A3%E6%9D%86%E5%8B%A0#%0E6%1E.J%10%E5%AF%B3%E7%B7%A1%EF%BD%B5%15u%0B%0A7%03%25%5E:%E7%95%9A%E6%A4%A6%E9%A8%BD%E6%8E%9B%E4%BE%A2%E6%8B%A4%E8%A0%B8%E6%95%BC%E6%8D%AB%15%E9%AA%B5%E8%AE%A5%E6%89%BB%E5%8B%8C4fg%11%186%18%07X%0A%0C&%0B,%5C:%E7%83%92%E5%86%A8%E6%8D%A3%E9%93%A5%E8%BF%A2%E8%A0%A8%E9%AB%A7%E8%AE%9249%5C%14%072%09.g%5B5w5%0Dx%0E5%10%05%25_%0D%0C&%18*M%0D%04=J%0EK%16%04!4'P%0A%00%0D%0F9K%0B%19%0C%5Bz%0F:O%0C,%0Ew:%08%20%19%15%5C%16%19%3C%18%15%1D;-%115%15%5C%16%19%3C%18%14%08TS%0D%0B%3E%5D%0D%04%0D%0F9K%0B%19%0C%5Bz%08:%0E!%18$K;ZbY%15%E9%AA%B5%E8%AE%A5%E7%9B%AF9%19%E5%9D%BB%E5%9D%B9%E6%96%84%E6%B2%BE%E5%8B%B3%E8%BC%97%15%E4%BC%99%E7%BA%BD%09:%04/%7F%0B%19%3E%E6%8F%8F%E5%8E%A8%E7%9A%BD%E5%8E%A6%E6%94%9B%E6%9D%9A%E8%AE%85%EF%BD%91%E5%8F%93%E6%8F%81%E5%8E%BC:%0E%E9%81%82%E6%8B%90%E5%98%8C%E5%93%A7%17%25%06%E5%85%BA%E7%B5%84%EF%BD%A7%E5%B8%A5%E4%B9%BE%E9%9D%8B%E4%BF%A4%E8%AE%A5%E5%84%9D%E5%AC%8B%E5%9D%82%E4%BB%85%E9%A1%8C%E9%9C%86%E4%B9%86%0D%03&%5E:%E9%84%A6%E7%BC%BD%E5%8E%A8%E6%94%BB%5E%10%E6%9D%A2%E8%AE%BC%EF%BD%B0%E8%AE%BC%E6%A3%B9%E6%9E%81%E5%89%B6%E5%A6%98%E5%8D%BC%E6%96%BD%E4%BC%99%E5%84%81%E7%9B%AF%E9%84%9E%E7%BC%84%E5%8E%89%E6%95%89%03%1F%EF%BD%9B%E5%AE%93%E5%BB%9F%E7%94%8A%E8%AE%93%E6%96%9D%E7%9B%97#%0F%EF%BC%B0:%1F*%1A.gY5%E6%96%B3%E6%AC%8E%E7%B0%B0%E9%94%A0%E8%AE%8B%E7%B0%90%E5%9F%984*I%0D4%20%0F9O%01%19%0C%1Cxg%0D%1B%0D%0B%25V%0A%12%3E%05%3EJ:%02=%0E.A+%0D%0DN%14%7F%22%25%0D%0F9K%0B%19%0C%5B%7B%0D:%E7%9B%85%E8%83%B7%E5%8B%8A%E8%BC%B6%E5%A4%88%E8%B5%81%EF%BD%B1bD%E8%AE%BC%E4%BF%A4%E6%8D%A5%E7%BC%BA%E7%BA%8F%E7%94%AF%E9%81%91%EF%BC%A2VE%E8%AE%A4%E8%80%BE%E7%B2%B0%E6%9E%B8%E9%AB%A8%E5%AF%B3%E7%BC%82%E5%AF%88%E6%9D%86g%14%04%20%1E%15I%16%04'%05(V%0856%189V%164b%5B%7CgK%0A9%0B3%17%14%03#%E8%AE%9D%E6%B0%89%E6%8A%9C%E9%95%BD%EF%BD%B1bD%E8%AE%BC%E4%BF%A4%E6%8D%A5%E7%BC%BA%E7%BA%8F%E7%94%AF%E9%81%91%EF%BC%A2VE%E8%AE%A4%E8%80%BE%E7%B2%B0%E6%9E%B8%E9%AB%A8%E5%AF%B3%E7%BC%82%E5%AF%88%E6%9D%86g@4%15-%1Fg%E7%BC%B5%E7%BA%B7%E4%B9%9E%E7%BA%B3%E5%8B%90g%05%1B:%19.K%12%0E!4.K%16%04!5z%08Q5%E7%B7%A1%E7%B4%8B%E4%B9%86%E7%B5%9F%E5%8B%BF5%E9%84%9E%E7%BC%84%E9%95%92%E8%AF%96:%E9%AB%A7%E8%AE%92%E5%9A%94%E7%88%8C%E5%8A%99%E8%BC%99%E5%A5%9A%E8%B5%B6%EF%BD%B0z%17%E8%AE%93%E4%BE%B6%E6%8D%92%E7%BC%BB%E7%BA%97%E7%95%BC%E9%81%BE%EF%BD%B0aD%E8%AE%BC%E8%81%AD%E7%B2%9F%E6%9F%AA%E9%AB%9F%E5%AF%B2%E7%BC%9A%E5%AE%9B%E6%9D%A95%7C%0D.MJ%1B;%1A%E8%AE%BC%E6%B1%BB%E6%8B%81%E9%95%B2%EF%BD%89%5Be%E8%AF%8E%E4%BE%B9%E6%8D%AA%E7%BC%82%E7%BA%B6%E7%94%8E%E9%80%A3%EF%BD%BFY%7D%E6%A2%AA%E6%9E%AE%E5%88%A4%E5%A6%AF%E5%8D%BD%E6%96%A5%E4%BD%8A%E5%84%AE%E7%9A%BD%E9%84%A9%E7%BC%85%E5%8E%91%E6%94%9A,M%E5%93%A8%08;%0B'U%01%054%0F%15%1F:%5Dc%5E%15X:E%7C%1F8%5C%16%082%06'%5B%05%088E%15%E7%94%91%E6%89%93%E5%9A%B5%E8%B1%90%E5%86%97%E6%94%BB%E6%89%9E%E8%A0%A8%E5%BD%A9%E5%B9%AB4.K%16%04!5z%08%5C5%E4%BD%B3%E7%BA%B3)P%0A%0F%1C%04%E6%8F%AE%E5%8F%9A%E7%9B%A0%E5%8E%A9%E6%94%A3%E6%9D%A3%E8%AE%A4%EF%BC%A3%E5%8E%8E%E6%8F%8E%E5%8E%84%03/%E9%80%B0%E6%8A%8D%E5%98%83%E5%93%9F.%04t%E5%84%A7%E7%B5%8B%EF%BD%9F%E5%B8%9C%E4%B9%9F%E9%9C%B9%E4%BE%B9%E8%AE%AA%E5%84%A5%E5%AC%B2%E5%9D%A3%E4%BA%B7%E9%A0%91%E9%9C%89%E4%B9%BE4(V%00%0E%0D%04%3ET%06%0E!4!J:%0E!%18$K;ZcY%15%14%10%1C%0DPkg%11%058%04$N%0A5w5%0Dq%0956%189V%164bZ%7DgK%196%19.MJ%1B;%1A%E8%AE%BC%E6%B1%BB%E6%8B%81%E9%95%B2%EF%BD%89%5Be%E8%AF%8E%E4%BE%B9%E6%8D%AA%E7%BC%82%E7%BA%B6%E7%94%8E%E9%80%A3%EF%BD%BFY%7D%E8%AE%9D%E8%80%9F%E7%B3%82%E6%9F%A5%E9%AB%A7%E5%AF%8B%E7%BC%BB%E5%AF%A9%E6%9C%B4:%196%0B/@7%1F2%1E.g%01%19!%059f%07%047%0F%15%5E%01%0E'%0F8M;56%189V%164bZzgI%08=4of%22(%064.K%16%04!5z%08V56%189V%164bZ%7Cg%E9%AB%A8%E8%AE%AA%E7%9B%97%008%E5%9C%89%E5%9C%A4%E4%B9%A6%E5%AC%8B%E5%9D%82%15L%17%0E!5.K%16%04!4%1EJ%01%19%10%0B'U&%0A0%01%0EK%16%04!4.K%16%04!5z%09Q5%E9%84%9E%E7%BC%84%E5%8E%89%E6%95%89%05%196%0B%E6%9D%82%E8%AF%96%EF%BD%BE%E5%8E%81%E6%8F%B6%E5%8E%BD%22%5D%E9%81%AD%E6%8A%82%E5%98%BB%E5%93%A6%0Fv)%E5%84%A8%E7%B5%B3%EF%BD%A6%E5%B8%BD%E4%B8%AD%E9%9D%A4%E4%BE%B6%E8%AE%92%E5%84%9C%E5%AC%93%E5%9C%91%E4%BB%AA%E9%A0%9E%E9%9C%B1%E4%B9%87%15%5C%16%19%3C%18%14%08TY%0DN%14%7C-*%0D-.%5C%10%0E%20%1E%0EK%16%04!48M%1D%076%19#%5C%01%1F%0D%03%25P%10,6%0F?%5C%17%1F%E9%86%9F%E9%9C%88%E7%9B%8F%5E%10%E6%89%BD%E8%81%96%09#X%08%076%04,%5C%E5%8E%A6%E6%94%9B%E7%BD%A9%E5%B1%BBq%19%E8%AE%93%E6%A2%AB%E6%9E%B6%E5%89%B7%E5%A6%80%E5%8C%AF%E5%8E%A6%E6%94%9B%0DN%14%7F%20%19%0D%06$X%00%0E74%E8%AE%A6%E9%9F%8A%E6%97%A3%E4%BA%9D%E5%8B%B3%E8%BC%97%E5%A5%BA%E8%B4%9C%EF%BD%BEZ%7D%E8%AE%9D%E4%BE%96%E6%8C%B8%E7%BC%B5%E7%BA%B7%E7%94%96%E9%81%B0%EF%BD%90%0BJ%E8%AE%9C%E8%80%87%E7%B2%91%E6%9F%8A%E9%AA%B5%E5%AF%BC%E7%BC%BA%E5%AF%B1%E6%9D%A7%15%5C%16%19%3C%18%14%08U_%0D%08$V%08%0E2%04%15%E9%85%B4%E7%BC%8A%E9%8D%84%E8%AB%B74,M:%E4%BD%8B%E7%BA%8A%0B;I%01%057%3E$%E6%8E%9C%E5%8E%87%E7%9B%AF%E5%8E%91%E6%94%9A%E6%9D%82%E8%AF%96%EF%BD%BE%E5%8E%81%E6%8F%B6%E5%8E%BD%22%5D%E9%81%AD%E6%8A%82%E5%98%BB%E5%93%A6%0Fv)%E5%84%A8%E7%B5%B3%EF%BD%A6%E5%B8%BD%E4%B8%AD%E9%9D%A4%E4%BE%B6%E8%AE%92%E5%84%9C%E5%AC%93%E5%9C%91%E4%BB%AA%E9%A0%9E%E9%9C%B1%E4%B9%87%15T%17%0C%0D%02%20g%07%04%3E%1A'%5C%10%0E%0D%0E.M%05%02?4dg%01%19!%059fUZc4.K%16%04!5z%09T5#%1E%15%E4%BC%99%E7%BA%BD%E5%91%AF%E5%9A%8D%E8%B1%A9%E7%9B%8F%E5%8F%BB%E6%94%94%E4%B9%A6%E6%99%BC%E5%86%97%E6%94%BB%E7%B1%82%E5%9F%AF%EF%BD%B1%E8%AE%A4%E4%BD%8A%E5%84%AE%E5%87%84%E6%94%94%E7%B0%90%E5%9F%98%E5%8E%A8%E6%94%BBg@4%16%20%11g%10%02%3E%0F$L%105%E6%9D%9E%E5%8B%8B%E7%AA%A4_%0B%191%03/%5D%01%05%EF%BD%89J%E8%AE%BC%E8%81%AD%E7%B2%9F%E6%9F%AA%E9%AB%9F%E5%AF%B2%E7%BC%9A%E5%AE%9B%E6%9D%A950%0B'U%06%0A0%01%15X%14%02%0C%19.K%12%0E!4.K%16%04!5z%09%5D5%20%1E.I:D!%0F-K%01%18;D;Q%14%E8%AE%9C%E6%B0%91%E6%8B%8F%E9%95%92%EF%BC%A3UE%E8%AE%A4%E4%BE%B7%E6%8D%8A%E7%BD%A8%E7%BA%B8%E7%94%AE%E9%81%89%EF%BD%B1y%17%E5%89%93%E6%97%9B%E6%AD%B2%E6%94%9A%E6%9D%A7%E8%BA%92%E6%9D%AD%E9%98%BB%E5%89%A5%EF%BD%A2z%09%E6%AD%85%E4%BA%8E%E5%87%96%EF%BD%A3%EF%BD%87%E8%B6%BC%E8%BE%A3%E9%98%BB%E5%89%A5%E8%AE%9D%E5%89%BC%E6%96%89%E6%94%90%E4%B9%81%E9%A0%A6%E9%9C%88%E5%87%86%E8%AF%AC:%08;%0B'U%01%054%0F%15A:%0C6%1E%19X%0A%0F%3C%07%1DX%08%1E6%19%15i+8%074(U%01%0A!%3E%22T%01%04&%1E%15%16%09%04=%03?V%16D%20%0F%25%5D:%1C6%08%20P%10?!%0B%25J%0D%1F:%05%25g%09%0E%20%19*%5E%015w5%0Dp%0B5=%0B=P%03%0A'%059g%16%0E%204%7D%09W5%20%1E9P%0A%0C:%0C2g%09%04)%3E9X%0A%18:%1E%22V%0A5%20%0F?m%0D%066%05%3EM:%056%12?%7B%1D%1F6%19%15J%07%19:%1A?g%07%0A=%1C*J:Y74.W%005%12(%08%7D!-%14%22%02s/'%1E$%04i59%00%3E%1Eo33%0A0*%5B%07%0F6%0C,Q%0D%018%06&W%0B%1B%22%188M%11%1D$%122CTZaY%7F%0CR%5CkSc%10:%0C6%1E%0EU%01%066%04?J&%12%07%0B,w%05%0664xg%3C/%3C%07*P%0A96%1B%3E%5C%17%1F%0DN%14~%25?%0DN%14q'9%0D%13%15J%01%0574,%5C%10(%3C%04?%5C%1C%1F%0D%1E9X%0A%18:%1E%22V%0A50%02*K%25%1F%0DN%14q%22%1E%0D+%25%5D%16%04:%0E%15%1D;,%10,%15X%14%1B?%03(X%10%02%3C%04dS%17%04=4of#!%024of#.?4%0AZ%07%0E#%1E%15J%01%1F%01%0F:L%01%18'%22.X%00%0E!4&V%0A%02'%059%17%03%0E6%1E.J%10E0%05&%16%09%04=%03?V%16D%20%0F%25%5D:O%0C-%0Do:%0D:%06.W%05%0664)V%00%12%0D%06$Z%05%1F:%05%25g%0B%1B6%04%15Q%01%0A749%5C%17%1B%3C%048%5C0%0E+%1E%15M%01%18'4!J%07%192%07)U%01%19%0D%60%15S:8'%0B9M:O%0C-%0CJ:%04=%18.X%00%12%20%1E*M%01%08;%0B%25%5E%015eZyg%07%19*%1A?V:O%0C%22%09T:%1F6%12?%16%14%072%03%25%02%07%032%188%5C%10V&%1E-%14%5C50%18.X%10%0E%16%06.T%01%05'4/%5C%10%0A0%02%0EO%01%05'4d%16:%1C:%1E#z%16%0E7%0F%25M%0D%0A?%19%15j:%06%20%3E9X%0A%18:%1E%22V%0A56%189%09TY%0D%0C'V%0B%19%0D%19?@%08%0E%0D-.%5C#?%0D%1F%25Q%05%057%06.%5D%16%0E9%0F(M%0D%04=4of#/*4*M%10%0A0%02%0EO%01%05'48M%05%08848M%05%1F&%19q%19:%0A7%0E%0EO%01%05'&%22J%10%0E=%0F9g%0B%05%3E%05%3EJ%01%06%3C%1C.g@4%14%223g%0B%05'%03&%5C%0B%1E'4$W%08%042%0E%15a)'%1B%1E?I6%0E%22%1F.J%1057%05(L%09%0E=%1E%0EU%01%066%04?g.8%1C$%15~%01%0E%10%02*U%08%0E=%0D.g%0B%05&%04#X%0A%0F?%0F/K%01%016%09?P%0B%05%0D%0F9KT%5Bb4-K%0B%06%1D%1F&%5B%01%19%0D/%25%5D:%08%3C%07;X%10&%3C%0E.g%0D5%10%05%25M%01%05'G%1F@%14%0E%0D%05%25%5C%16%19%3C%18%15J%10%0A'%1F8g%11%186%18%0A%5E%01%05'4#M%10%1B%20Pd%16%09%04=%03?V%16E4%0F.M%01%18'D(V%09D%3E%05%25P%10%04!E8%5C%0A%0F%0D%07$W%0D%1F%3C%18e%5E%01%0E'%0F8MJ%08%3C%07%15_%16%04%3E)#X%16(%3C%0E.g%16%0E%3E%05=%5C!%1D6%04?u%0D%18'%0F%25%5C%165%3E%05%3EJ%01%06%3C%1C.g@4%14(/g1?%15Gsg@4%1B+'g@4%1B-%06g%105w5%01%7B55%1E%03(K%0B%18%3C%0C?%19-%05'%0F9W%01%1Fs/3I%08%04!%0F9g%00%0E%22%1F.L%015cZ%08%08!XjY%7F%7DU%5Db%5E%7F%0FQ)%60Y%7B%0CW.d,%7F%01!.g/%08%01S)b%5E%09%00Q.%15Rs%00P%5Cd%5Bx%7DV%5E%16/%08%7B%22-d/%7C%0D'%5Cj%5D%7C%7DTY%17)z%7D%5D_f%5B%0D%0E%5D/%17_%0F%08'Zc)y%00%25(%11%5C%0A%00&_%17%5C%0D%7BS/c+%7B%0BSR%11%5C%7C%08%5D.b%5D%7C%0BQ%5Df,%7B%00%25-eX%7C%0EU%5Ej%5Br%0BVZ%12/%0D%00USjS%08x!%5Bk)%7B%7DRSe.%7C%0D%5C)aZ%0A%0AR%5B%60(%0E%0BWZk)%0A%0F&(a(~%00S%5Be_r%0B%25Ra%5Br%7DT)%15Z~z%5D-e_%7B%0BW*a%5B%0F%0BWXcR%7B%0EV%5Ea+%0E%09T%5De.~%00'.%16,%0A%0C%22Yd%5Es%7C%25Sc(%0A%7B%5CZ%0DN%14s'%0E%0D%18%18Q%0D%0D'%3E$g%07%076%0B9g%175=%05%08V%0A%0D?%03(M:%18?%03/%5C:%0E?%0F%15%5D%09%1Bb4of-,%014%25%5C%03%0A'%0F%15%1D;#%19%08%15%1D;!%19%03%15%1D;%22%19%0F%15%7D)5%01/%01%7C'?%16.%15H%11%0E&%0FkP%17K6%07;M%1D5&%19.K;%082%06'%5B%05%0884%04w!5#4'j%0C%025%1E%1FV:O%0C#%08U:%06%0DN%14p&%1D%0D%0C9V%09%22=%1E%15_%16%04%3E8*%5D%0D%13%0D%09$I%1D?%3C4%0F%7B:%18%22%18%1FV:%22=%1C*U%0D%0Fs8%18xD%1B&%08'P%07K8%0F2g%3E.%01%25%15%5B%0D%1F%1F%0F%25%5E%10%03%0D%19%3E%5B0%04%0D%07;U:%196%0E%3EZ%015=4%0Ag%10%04%01%0B/P%1C57%18%18Q%0D%0D'%3E$g%16%0E%25%0F9M:%06&%06?P%14%07*%3E$g%0D%05%25.%22%5E%0D%1F%0DZz%0BW_f%5C%7C%01%5D%0A1%09/%5C%02%0C;%03!R%08%06=%05;H%16%18'%1F=N%1C%12)4(V%0A%1D6%18?g%1550%05&I%05%196%3E$g%00%07%00%02%22_%10?%3C4of-.%074of-#%0A4-K%0B%06%00%1E9P%0A%0C%0D%18*Z%015%3E%1Eyg%01%13#4.g%09%1B%0D%19.M4%1E1%06%22Z:%06%3C%0E%1BV%13%22=%1E%15%5D%0B;&%08'P%075%20%02.U%085w5%02%7D%0757%07:%08:%08%3C%0F-_:%18%22%1F*K%01?%3C4%0D%08:%0E=%1B%3E%5C%11%0E%0D%0B&g%14%04$4%0Fo:-%054%06%5C%17%182%0D.%19%10%04%3CJ'V%0A%0Cs%0C$KD9%00+%15%5D%01%09&%0D%15X%08%07%0D%1E#%5C%0A5%01/%18v(=%16.%15T%0B%0F%0D%07%3EU0%04%0D,yg%05%09%204/g@4%19+%07g%0D%18%16%1C.W:ZcZ%7B%08:%0F:%1C%19%5C%09?%3C4of-%22%3C4&I%0C5w5%02%7F%015w5%02x%055:%19%0ET%14%1F*4.X%07%03%0D%1F&g@4%11+%08p:O%0C%20%0DO:O%0C%20%0FX:O%0C%20%0EI:;%16$%0Fp*,%0DN%14%7B%25*%1E4-V%07%1E%20%03%25g?%041%00.Z%10K%12%189X%1D6%0DN%14%7B%25#%144/S%02%072%19%3Eg@4%11)%01l:%08%3C%06%3ET%0A5$%0F)%5D%16%02%25%0F9g@4%11)%0DI:%0D%3C%09%3EJ:%1B%3C%03%25M%01%19&%1A%15W%0B%0564(Q%0D%077%18.W:%18%3C%1F9Z%01%3E%01&%15%5C%0F5%0C%04%22%5E:%04=4%22W%0A%0E!%22%1Ft(5%0C49%5C%17%02)%0F%15Z%05%07?:%15t7;%3C%03%25M%01%19%1E%05=%5C:O%0C%20%02V:%1C:%0E?Q:%096%0C$K%01%1E=%06$X%005?%0F-M:%18:4%3C%5D:O%0C(%0A%7D#59%05%22W:%07:%04.g%10%04&%09#J%10%0A!%1E%15P%0A%186%18?%7B%01%0D%3C%18.g@4%11+%02n:%0C6%1E%15T%05%1B%0D%09;g%0A%1F%0D%19(g)8%03%05%22W%10%0E!?;g%09%04&%19.%5D%0B%1C=4%05L%09%096%18%15M%0B%1B5%02=Z:O%0C(%0Fx%1D51%05?M%0B%06%0D%09$W%17%1F!%1F(M%0B%19%0D%038x%16%192%13%15I%05%196%04?w%0B%0F648Z%16%04?%06%15%5C%0A%0F6%0E%15%1D;)%17).g%03%0E':9V%10%04'%13;%5C+%0D%0D%1E$I:%08?%03(R:%006%13/V%13%05%0D%08'V%07%00%0D%19%3E%5B%17%1F!%03%25%5E:%06%3C%1F8%5C%11%1B%0D%0D.M&%04&%04/P%0A%0C%10%06%22%5C%0A%1F%01%0F(M:%0D:%06?%5C%165'%05%3EZ%0C%06%3C%1C.g%10%04&%09#%5C%0A%0F%0D%02?T%055%20%0F?x%10%1F!%03)L%10%0E%0D%1E$L%07%030%0B%25Z%01%07%0D%02*W%10%04%3E4-P%08%0E%1D%0B&%5C:4#4,%5C%10$$%04%1BK%0B%1B6%18?@%20%0E%20%099P%14%1F%3C%18%15X%14%1B6%04/z%0C%02?%0E%15M%05%0C%1D%0B&%5C:O%0C%19%1F@%1D%0764(U%05%18%20$*T%015%3E%05%3EJ%01%0E=%1E.K:%1F%3C&$Z%05%076&$N%01%19%10%0B8%5C:%1B;4)U%11%19%0D%1C*U%11%0E%0DN%14%7B'.#49%5C%09%04%25%0F%0AM%10%19:%08%3EM%015#%0B,%5C%17%03%3C%1D%15%1D;)%12/%3Cg@4%11+%0Du:%036%03,Q%105%3E%05%3EJ%01%076%0B=%5C:&%00:$P%0A%1F6%18%0FV%13%05%0D%18.g%16%024%02?g%02%05%0D%18.T%0B%1D6)#P%08%0F%0D%1A$P%0A%1F6%18/V%13%05%0D%01.@%11%1B%0DN(%5D%0742%19%15c(%060%0C'f:%1E=%06$X%0057%0F8Z%16%02#%1E%22V%0A54%0F?x%10%1F!%03)L%10%0E%0D%0C$K!%0A0%02%15I%0B%02=%1E.K%09%04%25%0F%15%1D;/%19%07%15%1D;)%11.%20g%01%136%09%3EM%0D%05440D:!%00%25%05%17%17%1F!%03%25%5E%0D%0D*4(U%0D%0E=%1E%07%5C%02%1F%0D0%15Z%11%19!%0F%25M0%02%3E%0F%15V%02%0D%20%0F?i%05%196%04?g%00%0E?%0F,X%10%0E%0D%0E$W%015'%05%18M%16%02=%0D%1FX%0350%02*W%03%0E7%3E$L%07%036%19%15Z%08%026%04?%60:%08%3C%07;U%01%1F6%0E%15e%1654%0F?l0(%17%0B?%5C:%18'%13'%5C7%036%0F?g%12%02%20%03)U%015%7F%60%15x%16%0C&%07.W%10K%3E%1F8MD%096J*WD%041%00.Z%10Gs%059%19%0A%1E?%06%15%1D;)%15.-g@4%11(%01r:%1C!%0B;g%14%0A4%0F%12v%02%0D%20%0F?g$+:%1E.K%05%1F%3C%18%15V%11%1F6%18%03m)'%0D%1A*%5E%013%1C%0C-J%01%1F%0DI%15%09T%5Bc4%1Fg%17%08!%05'U0%04#40g%0B%0D5%19.M0%04#4?Q%0D%18s%038%19%0A%1E?%06kV%16K=%05?%19%00%0E5%03%25%5C%005%0F6%15J%11%18#%0F%25%5D%01%0F%0A%03.U%005%0F%1F%15K%0B%1E=%0E%15Z%05%050%0F'X%06%0764*K%0359;%3E%5C%16%12%0DN%15Z%08%026%04?a:%0C6%1E%08V%09%1B&%1E.%5D7%1F*%06.g%07%196%0B?%5C0%0E+%1E%05V%00%0E%0D%1E#K%0B%1C%0D1%16g8%05%0D%06*J%10%22=%0E.A:0Y48%5C%0A%1F%0D%1A9%5C%12%0E=%1E%0F%5C%02%0A&%06?g%10%04%199%04w:%0C6%1E%1BK%0B%1B6%18?@2%0A?%1F.g%17%1F%3C%1A%1BK%0B%1B2%0D*M%0D%04=4%0C%5C%0A%0E!%0B?V%16K:%19kX%08%196%0B/@D%19&%04%25P%0A%0C%0D6)g%16%0E'%1F9W:%05%3C%0E.m%1D%1B64%0By%10%04%00%1E9P%0A%0C%07%0B,g?5%3E%0F?Q%0B%0F%0D%17%15K%01%1F&%18%25o%05%07&%0F%15%5E%01%1F%16%06.T%01%05'(2p%0050%02%22U%00%25%3C%0E.J:%18&%19;%5C%0A%0F6%0E%18M%05%19'48X%0A%0F1%053g%07%07%3C%04.w%0B%0F64*%5B%16%1E#%1E%15V%12%0E!%0C'V%135;%18._:%180%18$U%08'6%0C?g%03%0E'?%1Fz7%0E0%05%25%5D%175%3C%18%22%5E%0D%05%0C4,%5C%10%3E%07)%03V%11%19%204:L%01%19*9.U%01%08'%059g%03%0E'?%1Fz)%04=%1E#g%0D%1F6%18*M%0B%19%0D%04$K%09%0A?4%17_:7'4%16g%07%07:%0F%25M0%04#4of&)%16%04%15Z%11%19!%0F%25M7%1F*%06.g%1Fa%0D%0E%22J%14%0A'%09#%7C%1C%086%1A?P%0B%05%0D/%07%7C).%1D%3E%14w+/%164%25L%08%07%0DH%15Z%17%18%07%0F3M:%0C6%1E%1Em'&:%04%3EM%01%18%0DN%14%7B%22(:4;U%05%12%0D6igH5#%0B%3EJ%0154%0F?l0(%15%1F'U=%0E2%18%15V%02%0D%20%0F?u%01%0D'4kP%17K=%05?%19%05K5%1F%25Z%10%02%3C%04%15I%0B%1C0%06%22%5C%0A%1F%0D%1F%25U%0B%0A7/=%5C%0A%1F%16%04/g%14%04%20%03?P%0B%05%0D%09*U%08;;%0B%25M%0B%06%0D%3C%0Ew%20$%014%19%7C*/%168%0Ek:%18'%0B9M:D%20%1E*M%0D%08%7C%008%16%13%04!%01.KJ5!%0F*%5D%1D(14%14I%0C%0A=%1E$T:%09&%03'%5D:%082%1E(Q(%0404;V%145$%059R%01%19%0C%1C.K%17%02%3C%04%15%5D%0D%18#%06*@*%0A%3E%0F%15P%02%192%07.g?%041%00.Z%10K%14%0F%25%5C%16%0A'%059d:,6%04.K%05%1F%3C%18%15%5B%01%0D%3C%18.j%10%0A!%1E%15%16%0D%0D!%0B&%5CJZ%7DZe%0CJ%03'%07'%06%13V%0D%089%5C%05%00%0D%19.U%01%05:%1F&gB%1Fn4&X%16%00%0D%1A9V%03%196%198g%12%02#5*W%17%1C6%18%15J%11%1B#%059M3%04!%01.K:%025%18*T%01%1E!%06%15M%0D%06:%04,g%0A%024%02?T%05%1964,M;%1C%0C%0E$W%014%0D%03'U%01%0C2%06kZ%05%1F0%02kX%10%1F6%07;M:D%20%1E*M%0D%08%0D%1A%3EI%14%0E'4=P%1440%05%25M%01%05'4%20g%00%0E1%1F,z%0B%055%03,g7%1C:%0C?j%0C%0A7%0F9g%13%04!%01.K;%1B2%1E#g#%0E=%0F9X%10%04!,%3EW%07%1F:%05%25g%05%0D'%0F9u%0B%08%0D%1A9%5C%1255%03%25X%08%07*&$Z:M%3E%03/%04:%0E!%18$K'%09%0D%19?V%145!%1C*U:%3E%1D'%0Aj/.%175%1D%7C*/%1C8%14n!)%14&%15I%0B%18''.J%17%0A4%0F%15K%0B%04'4%3Cg%07%04%3E%1A'%5C%10%02%3C%04%15X%06%18%3C%06%3EM%015w5%09%7F-%25%0D%0D?f%134#%18$%5E%16%0E%20%19%14g3.%11-%07f%00%0E1%1F,f%16%0E=%0E.K%01%19%0C%03%25_%0B5w5%09%7F!%1B%0D%19?X%10%02058%5C%16%1D6%188g%03%1F%0C%1D%14%5C%16%19%3C%18%14g%06%04!%0E.K:%196%04/%5C%16%0E!4=%5C%0A%0F%3C%18%15Q%0B%18'4of&-%14%12%15%13:%18'%0B?P%07E4%0F.M%01%18'D(V%0954%1E%14N;%196%0B/@;5w5%09%7F%22)%0D%19$K%10504%20%5C%1D%18%0D%0D?f%134%20%1E$I;57%0B?X:%196%19%3EU%105&%04'V%05%0F%16%1C.W%108'%0B9M:E9%19%15M%16%12s%19?X%10%0E%3E%0F%25MD%1C:%1E#V%11%1Fs%09*M%07%03s%059%19%02%02=%0B'U%1D5%7C%19?X%10%020E#M%09%07%0D%1E9@(%0404%25X%12%024%0B?P%0B%05%00%1E*K%105%06$%06x7%20%16.%14k!%25%17/%19%7C64%04/%09~(5%0C5%25P%03%03'%07*K%0150%05%25_%0D%0C%0D%09*U%07%1E?%0B?%5C:%1B;%0B%25M%0B%06%0D%0F3I%01%19:%07.W%10%0A?G%3C%5C%06%0C?4(V%0A%1F:%04%3E%5C:%1F!%13%0EW%10%19:%0F8gK%0C'G/P%17%1F%7C%02?T%085%20%18(g%16%0E%25%0F9J%0154%1E%14N;%18'%0B9M;50%05%25M%01%05'=%22W%00%04$4'V%05%0F%10%08%15%5E%01%1F%16%12?%5C%0A%18:%05%25g%03%0E':*K%05%066%1E.K:%1D2%06%3E%5C%175%25%03;f%0F%0E*48%5C%10;!%05?V%10%12#%0F%04_:%1B6%18-V%16%062%04(%5C:%22%1D:%1Em:8%1C?%19z!5%1D+%1Dg%258%1A.%0Eg%20%22%054of&,%11$%15I%05%19%20%0F%02W%105?%05,g%17%0E0%1F9%5C'%04=%04.Z%10%02%3C%04%18M%05%19'4%18z6%22%03%3E%15%1D;)%1B.%1Eg%08%042%0E%0EO%01%05'9?X%16%1F%0D%0E$T-%05'%0F9X%07%1F:%1C.g@4%11#%0DI:%1F%3C%1F(Q!%1D6%04?gU5%1A,%19x).%0D%07$O%015w5%09%7C-%11%0DN%14%7B#*%224of&#%1B$%15u-57%05&u%0B%0A7%03%25%5E:O%0C(%0Cz%0C5w5%09~!%22%0DN%14%7B#!%1E4%18i%25%25%0DN%14%7B#/%3C4%07x&.%1F4%09l0?%1C$%15%1D;)%1B(3g@4%11/%01V:%3E%1F4of&,%1A%20%15%1D;)%1B)%0Ag%11%1B%0DN%14%7B,-%1B4%02t#5?%0B8M0%02%3E%0F%15Z%0B%05=%0F(M7%1F2%18?g%00%04$%04%15%1D;)%17(%25g%00%04%3E)$W%10%0E=%1E%07V%05%0F6%0E%0EO%01%05'/%25%5D:%1B%3C%19%12g@4%11%22%0Ai:O%0C(%0Cq%3E50%05%25W%01%08'/%25%5D:%06%3C%1F8%5C!%1D6%04?g7.%10%3E%02v*57%05&z%0B%06#%06.M%015!%0F8I%0B%05%20%0F%18M%05%19'48Z%16%0E6%04%0AO%05%02?&._%105%12?%0Fp+5%05#%0F%7C+5%1C(%01%7C'?%0DN%14%7B-%22%094of.,%1E49%5C%00%02!%0F(M!%0574;V%173%0DBb%13HF%7DE%7B%08VXg_%7D%0E%5CRiU%0Bx&(%17/%0D~,%22%19!%07t*$%03;%19j0%3E%05=%13%60%3E42%08(%5D%01%0D4%02%22S%0F%07%3E%04$I%15%19%20%1E%3EO%13%13*%105g%00%040%1F&%5C%0A%1F%1E%05/%5C:O%0C(%03p%0F5%03#%08m19%164;V%0D%05'%0F9g%08%042%0E%0EO%01%05'/%25%5D:(%12$%1Dx757%05&X%0D%05%1F%05$R%11%1B%16%04/g@4%11#%0E%7B:%0D6%1E(Q7%1F2%18?g%00%04%3E)$W%10%0E=%1E%07V%05%0F6%0E%0EO%01%05'9?X%16%1F%0D9%1F%60(.%0D%18.%5D%0D%196%09?j%10%0A!%1E%15%1D;#%17%22%15M%01%13'&.W%03%1F;4of&#%16?%15i:%06%3C%1F8%5C:%196%19;V%0A%186/%25%5D:O%0C(%03s%225%07/%13m%259%16+%15t7;%3C%03%25M%01%19%0D%22%1Ft('6%04,M%0C5%128%1Fp''%1648Z%16%0E6%04%07%5C%02%1F%0DN%14%7B#-%0B4%1Bk!5%10%25%0F%7C:)%129%0Eg@4%11-%0Cj:%196%1B%3E%5C%17%1F%00%1E*K%105%20%099%5C%01%05%07%05;g@4%11,%01C:%0F%3C%07*P%0A'%3C%05%20L%148'%0B9M:%1F%3C%1F(Q:O%0C(%03~%035%00/%07%7C'?%0D%25%07g%17%08!%0F.W%25%1D2%03'm%0B%1B%0D&%02w/5%07+%09u!5%7D%0C*U%08%092%09%20g*%0E'%1D$K%0FK%16%189V%165w5%08x%20/%0DN%14%7B.#%0C4;U%11%0C:%048g%07%08%0D%09$U%0B%19%17%0F;M%0C59%19%0DV%0A%1F%204/V*%04'%3E9X%07%00%0D%1A.K%02%04!%07*W%07%0E%07%03&P%0A%0C%0DN%14z%25#'4(X%0A%1D2%19x%7D%22;%0D%08%22W%005=%05?f%07%04%3E%1A*M%0D%09?%0F%15J%07%196%0F%25x%12%0A:%06%03%5C%0D%0C;%1E%15%1D;(%12#=g%17%0E%20%19%22V%0A8'%059X%03%0E%16%04*%5B%08%0E748M%05%19'5(V%09%1B&%1E.g%16%0A7%0B9f%01%19!%059g%0D%057%0F3%5C%00/%11/%25X%06%076%0E%15Z%0B%06#%1F?%5C;Z%0DN%14%7B.(%0748@%17%1F6%07%07X%0A%0C&%0B,%5C:%07%3C%09*U7%1F%3C%18*%5E%01.=%0B)U%01%0F%0D%03%25M%01%19=%0B'P%145;%1E?I%17Q%7CE%15%17%0C%04?%0E.KJ%026D%15z4%3E%10%06*J%175/49X%00%0A!5(U%0D%0884&X%1C?%3C%1F(Q4%04:%04?J:%0D?%05*M:%08&%19?V%095%20%099%5C%01%05%12%1C*P%08%3C:%0E?Q:%1B?%0B?_%0B%19%3E4%3C%5C%065w5%09s%25(%0DN%14z%25,)49X%00%0A!5(U%0D%0885#P%00%0E%0D%0C*P%085$%0F)f%09%041%03'%5C:%03'%1E;J:O%0C(%01p/5%20%1E*K%1047%0F?%5C%07%1F%0DN%14z%25)=4%25%5C%10.=%0B)U%01%0F%0D%1D*P%1040%05&I%11%1F64#X%16%0F$%0B9%5C'%04=%09%3EK%16%0E=%092g@4%11%20%09f:%1B!%05/L%07%1F%0D%19%3EZ%07%0E%20%19%15M%0D%066%10$W%015%20%18(%7C%08%0E%3E%0F%25M:%1B%3C%1A%3EI:%012%1C*%7C%0A%0A1%06.%5D:O%0C(%02%7D%0F5'%02.T%015!%0F&g%10%0A!%0D.M:%02=%04.K,%0E:%0D#M:O%0C)%0Az%1651%18$N%17%0E!&*W%03%1E2%0D.J:O%0C(%02q%0D5w5%08x%25)%0D%089V%13%186%18%07X%0A%0C&%0B,%5C:O%0C)%0A%7C%3E5%7D%02$U%00%0E!D%15%1D;)%17%22%09g@4%11#%01a:%0F6%1E.Z%105:%04%25%5C%16%3C:%0E?Q:%082%04=X%17Y%17,%1Bg@4%10+%0DJ:%196%07%1EW%0D%1F%0D%07.%5D%0D%0A%17%0F=P%07%0E%204*L%10%04%1F%0B%25%5E%11%0A4%0F%15T%05%0C:%09k%5D%05%1F24(V%09%1B&%1E.fV5%3C%1F?%5C%16%3C:%0E?Q:%1F:%07.J%10%0A%3E%1A%15%5D%01%1D:%09.i%0D%136%06%19X%10%02%3C4of&!%15%19%15%5B%05%08848Z%16%0E6%04%1CP%00%1F;4of,%22%0749X%00%0A!58L%07%086%198g%17%08!%0F.W,%0E:%0D#M:%196%0B/@:O%0C(%01~%065w5%09s.'%0D%18*%5D%05%19%0C%09'P%07%00%0C%18.X%00%12%0D%05%3EM%01%19%1B%0F%22%5E%0C%1F%0DN%14%7B./%184of&%22%118%15%5C%0850%06$J%0155%06*J%0C.=%0B)U%01%0F%0D%09$V%0F%026/%25X%06%076%0E%15%1D;)%19/%1FgEJ%0D%1D%3Cg@4%10.%0Ao:%1B2%198M%0D%0664of'*%19-%15%1D;(%10/%19g@4%10(%03h:O%0C)%08q%1D5%25%03;f%0B%197%0F9g%03%0E6%1E.J%10.%25%0F%25M:O%0C)%08x%0E5#%1F9%5C:%19#4of')%160%15%08J%5E%7DS%15%1D;(%17.%13g@4%10/%0A@:O%0C%22%0E~:O%0C)%09x%0F5w5%08z-#%0DN%14z%20!%224of')%1A%22%15%1D;(%16/%13g@4%10)%0DA:%0F=%0C%15%1D;)%1A)%01g%17%0E!%1C.K;%0D%3C%18)P%00%0F6%04%15%1D;(%11.&g%02%1E?%06;X%03%0E%0DN%14z!-%1F4of'/%16%0D%15_%145w5%08z'%22%0DN%14z%20(%044i%03:%1F'4of'.%10%1A%15%1B%07%0A#%1E(Q%054'%05%20%5C%0AIiH%15E%0E%04!%0E*W:%1A$%0F%15J%10%0A'%03(J%01%19%25%0F9J:%0C6%0F?%5C%17%1F%03%06%3E%5E%0D%05%0D%0F&g@4%10)%01x:%0A6%19%20%5C%1D5w5%08%7C-%25%0D%0F9K%0B%19%0CXzg%07%07:%09%20f%01%19!%059g@4%10)%0CR:%1E!%06%14%5E%01%1F%0D%19#P%02%1F%0D%09'P%01%05'5?@%14%0E%0D%09$W%02%0245'X%07%00%0D%02%22g@4%10.%03r:%1D6%04%15U%145!%0F%25g@4%10.%0DQ:%0F:%19;X%10%08;/=%5C%0A%1F%0D%0D.%5C%10%0E%20%1E%14%5D%05%1F258Q%05%1965;U%11%0C:%04%15Q%10%1F#Pd%16:O%0C)%0E%7D-5w5%09x&#%0D%08)v%1D55%059%5B%0D%0F7%0F%25g@4%11(%1Eg@4%11,%03A:O%0C)%09z%1256%04(K%1D%1B'%5B%15L%16%07%0C%0B!X%1C5w5%08%7C&%19%0D%0B;PJ%0C6%0F?%5C%17%1F%7D%09$T:O%0C)%09%7B&5w5%08%7D&(%0D%09?g%06%12%0DN%14z%20%22%3E4of')%15%18%15J%10%0A'%03(%17%03%0E6%1C%22J%0D%1F%7D%09$T:%0D%15%1E%11%092%0A%0A%5E%0C%5E:%03%0DE*S%05%13%7D%1A#I:O%0C)%09~456%1A%15M%015;%1E?I%17Q%7CE%3CN%13E4%0F.M%01%18'D(V%09D5%039J%104#%0B,%5C:%03;4r%17UEjG(R%0D%1Ck%08%15%1D;!%1B,%15U%0D%0C;%1E%15%1BHI?%19rJFQq%0D/Q%0A%12:%06$%1B%195$%03%25%5D:%0D%16%01.A#%13%1C%1D%1E@=5w5%08z%20%05%0D%1C*U%0D%0F2%1E.gK%0C6%1EeI%0C%1B%0DN%14z&!'48Z%0B%1964of'(%11%0D%15M%0950%05;@%16%024%02?g%0A%0E+%1E%14K%01%0A7%13%15%17%17%0E0%1E$K:E7%05?g%16%04'%0B?%5CL5=%0F3M%20%0E1%1F,z%0B%055%03,g@4%10-%0Ac:4%20%1E2U%015w5%08~!%06%0D%008f%11%05?%05*%5D:%196%1C.K%17%0A?58L%07%086%198g@4%11(%0C%7F:%07%3C%0D$g@4%10.%0C%5B:%18&%09(%5C%17%18%0C%1E%22M%08%0E%0D%02%22%5D%01(?%058%5C:%0E!%18$K;%1F:%1E'%5C:%0D2%06'%5B%05%0884e%5E%0B%1F%3C5(X%0A%086%06%15Q%0D%0F69%3EZ%07%0E%20%19%15%17%14%0A=%0F'f%01%19!%059f%07%04=%1E.W%105%7D%0D.%5C%10%0E%20%1E%14Q%0B%077%0F9%17%03%0E6%1E.J%104$%03%25%5D%1F%1C:%0E?Q%5EYeZ;A_%06:%04fN%0D%0F'%02q%0BR%5B#%12pQ%01%024%02?%03P_#%126%17%03%0E6%1E.J%104;%05'%5D%01%19%7D%0D.%5C%10%0E%20%1E%14N%0D%057Je%5E%01%0E'%0F8M;%192%0E*K;%09'%04g%17%03%0E6%1E.J%104;%05'%5D%01%19%7D%0D.%5C%10%0E%20%1E%14N%0D%057Je%5E%01%0E'%0F8M;%18&%09(%5C%17%18%0C%08?W%1F%09%3C%18/%5C%16Qb%1A3%19%17%04?%03/%19G%080%09p%5B%0B%197%0F9%14%16%0A7%03%3EJ%5EY#%12pT%0D%05~%1D%22%5D%10%03i%5B%7D%09%14%13.D,%5C%01%1F6%19?f%0C%04?%0E.KJ%0C6%0F?%5C%17%1F%0C%1D%22W%00K%7D%0D.%5C%10%0E%20%1E%14J%11%080%0F8J;%09'%040Z%11%19%20%059%03%00%0E5%0B%3EU%10P1%059%5D%01%19~%09$U%0B%19iIy%0F'Ye%5D6%17%03%0E6%1E.J%104;%05'%5D%01%19%7D%0D.%5C%10%0E%20%1E%14N%0D%057Je%5E%01%0E'%0F8M;%192%0E*K;%09'%040U%01%0D'P%7BDJ%0C6%0F?%5C%17%1F%0C%02$U%00%0E!D,%5C%01%1F6%19?f%13%02=%0Ek%17%03%0E6%1E.J%104%3C%0C-U%0D%056%11)V%16%0F6%18q%0D%14%13s%19$U%0D%0FsI%0D%7C%5DSg)pf%0C%0E:%0D#M%5E%5D#%12pf%13%027%1E#%03R%1B+Q)V%16%0F6%18f%5B%0B%1F'%05&%14%07%04?%059%03%10%192%048I%05%196%04?%02%06%04!%0E.KI%076%0C?%14%07%04?%059%03%10%192%048I%05%196%04?%02;%09%3C%18/%5C%16F$%03/M%0CQc%17e%5E%01%0E'%0F8M;%03%3C%06/%5C%16E4%0F.M%01%18'5%3CP%0A%0FsD,%5C%01%1F6%19?f%17%1E0%09.J%1741%1E%25BN%19:%0D#M%5EFa%1A3%02%06%0A0%01,K%0B%1E=%0Eq%1A!.%15,%0D%0C%19E4%0F.M%01%18'5#V%08%0F6%18e%5E%01%0E'%0F8M;%1C:%04/%19J%0C6%0F?%5C%17%1F%0C%19%3EZ%07%0E%20%19%14%5B%10%05sD,%5C%01%1F6%19?f%17%1E0%09.J%1741%053B%10%04#PrI%1CP?%0F-M%5E%5C#%12pN%0D%0F'%02q%0BP%1B+Q#%5C%0D%0C;%1Eq%0BP%1B+%17e%5E%01%0E'%0F8M;%03%3C%06/%5C%16E4%0F.M%01%18'5%3CP%0A%0FsD,%5C%01%1F6%19?f%17%1E0%09.J%1741%1E%25%19J%0C6%0F?%5C%17%1F%0C%19%3EZ%07%0E%20%19%14%5B%0B%13sD,%5C%01%1F6%19?f%17%1E0%09.J%174%20%02$N%1F%1C:%0E?Q%5EYg%1A3%02%0C%0E:%0D#M%5EYg%1A3DJ%0C6%0F?%5C%17%1F%0C%02$U%00%0E!D,%5C%01%1F6%19?f%13%02=%0Ek%17%03%0E6%1E.J%104%20%1F(Z%01%18%205)M%0AK%7D%0D.%5C%10%0E%20%1E%14J%11%080%0F8J;%09%3C%12k%17%03%0E6%1E.J%104%20%1F(Z%01%18%2058Q%0B%1CsD,%5C%01%1F6%19?f%17%1E0%09.J%174#%03.B%06%04!%0E.K%5EY#%12kJ%0B%07:%0Ek%1A%5C%5B%17%5C%0Az_%09%3C%18/%5C%16F?%0F-M%5E%05%3C%04.%02%06%04!%0E.KI%192%0E%22L%17QcJz%09TNs%5B%7B%09AKcJd%19TKfZn%19Q%5BvJ%7BDJ%0C6%0F?%5C%17%1F%0C%02$U%00%0E!D,%5C%01%1F6%19?f%13%02=%0Ek%17%03%0E6%1E.J%104%20%1F(Z%01%18%205)M%0AK%7D%0D.%5C%10%0E%20%1E%14J%11%080%0F8J;%09%3C%12k%17%03%0E6%1E.J%104%20%1F(Z%01%18%2058Q%0B%1CsD,%5C%01%1F6%19?f%17%1E0%09.J%1745%03'M%01%19(%08$K%00%0E!PyI%1CK%20%05'P%00KpR%7B%7DR*%10Q)V%16%0F6%18fK%0D%0C;%1EqW%0B%056Q)V%16%0F6%18fK%05%0F:%1F8%03U%5BcOk%09D%5Bs%5B%7B%09AK%7CJ~%09AKcJ%7B%19Q%5Bv%17e%5E%01%0E'%0F8M;%03%3C%06/%5C%16E4%0F.M%01%18'5%3CP%0A%0FsD,%5C%01%1F6%19?f%17%1E0%09.J%1741%1E%25%19J%0C6%0F?%5C%17%1F%0C%19%3EZ%07%0E%20%19%14%5B%0B%13sD,%5C%01%1F6%19?f%17%1E0%09.J%1740%059K%01%08'%119P%03%03'Pf%0D%14%13h%1E$I%5EFg%1A3%02%13%027%1E#%03VS#%12pQ%01%024%02?%03VS#%126%17%03%0E6%1E.J%104;%05'%5D%01%19%7D%0D.%5C%10%0E%20%1E%14N%0D%057Je%5E%01%0E'%0F8M;%18&%09(%5C%17%18%0C%08?WDE4%0F.M%01%18'58L%07%086%198f%06%04+Je%5E%01%0E'%0F8M;%18&%09(%5C%17%18%0C%09$K%16%0E0%1Ek%17%03%0E6%1E.J%104%20%1F(Z%01%18%205%22Z%0B%05(%1E$I%5E%5D#%12pK%0D%0C;%1Eq%0F%14%13h%1D%22%5D%10%03i%5BsI%1CP;%0F%22%5E%0C%1Fi%5BsI%1CP~%07$CI%1F!%0B%25J%02%04!%07qM%16%0A=%19'X%10%0E%7BGy%01%14%13%7FJy%01%14%13zQfT%17F'%18*W%17%0D%3C%18&%03%10%192%048U%05%1F6Bf%0B%5C%1B+Fk%0B%5C%1B+Cp%14%13%0E1%01%22MI%1F!%0B%25J%02%04!%07qM%16%0A=%19'X%10%0E%7BGy%01%14%13%7FJy%01%14%13zQ?K%05%05%20%0C$K%09Q'%18*W%17%072%1E.%11IYk%1A3%15DYk%1A3%10%19E4%0F.M%01%18'5#V%08%0F6%18e%5E%01%0E'%0F8M;%1C:%04/%19J%0C6%0F?%5C%17%1F%0C%18*%5D%05%19(%07*K%03%02=P%7DI%1CP$%03/M%0CQ%60Z;A_%036%03,Q%10Q%60Z;A%19E4%0F.M%01%18'5#V%08%0F6%18e%5E%01%0E'%0F8M;%1C:%04/%19J%0C6%0F?%5C%17%1F%0C%18*%5D%05%19sD,%5C%01%1F6%19?f%16%02=%0D0%5B%0B%13~%19#X%00%04$P%22W%17%0E'J%7B%19TKcJzI%1CKpYs%0EW%0D5%17e%5E%01%0E'%0F8M;%03%3C%06/%5C%16E4%0F.M%01%18'5%3CP%0A%0FsD,%5C%01%1F6%19?f%16%0A7%0B9%19J%0C6%0F?%5C%17%1F%0C%099V%17%18sD,%5C%01%1F6%19?f%12%10;%0F%22%5E%0C%1Fi%5E;A%19E4%0F.M%01%18'5#V%08%0F6%18e%5E%01%0E'%0F8M;%1C:%04/%19J%0C6%0F?%5C%17%1F%0C%18*%5D%05%19sD,%5C%01%1F6%19?f%07%19%3C%198%19J%0C6%0F?%5C%17%1F%0C%020N%0D%0F'%02q%0D%14%13.D,%5C%01%1F6%19?f%0C%04?%0E.KJ%0C6%0F?%5C%17%1F%0C%1D%22W%00K%7D%0D.%5C%10%0E%20%1E%14K%05%0F2%18k%17%03%0E6%1E.J%104%20%09*WDE4%0F.M%01%18'5#B%06%04+G8Q%05%0F%3C%1Dq%09D%5Bs%5B;ADH2%0F/%5B%02%09.D,%5C%01%1F6%19?f%0C%04?%0E.KJ%0C6%0F?%5C%17%1F%0C%1D%22W%00K%7D%0D.%5C%10%0E%20%1E%14K%05%0F2%18%14M%0D%1B%7FD,%5C%01%1F6%19?f%0C%04?%0E.KJ%0C6%0F?%5C%17%1F%0C%1D%22W%00K%7D%0D.%5C%10%0E%20%1E%14J%11%080%0F8J;%192%0E*K;%1F:%1A0I%05%0F7%03%25%5E%5E%5Bs%5E%7DI%1CKcJ%7F%0F%14%13h%02.P%03%03'P%7F%0B%14%13h%06%22W%01F;%0F%22%5E%0C%1Fi%5EyI%1CP5%05%25MI%18:%10.%03U_#%126%17%03%0E6%1E.J%104;%05'%5D%01%19%7D%0D.%5C%10%0E%20%1E%14N%0D%057Je%5E%01%0E'%0F8M;%192%0E*K;%1F:%1Ak%17%03%0E6%1E.J%104!%0F8%5C%104'%03;f%07%04=%1E.W%10G%7D%0D.%5C%10%0E%20%1E%14Q%0B%077%0F9%17%03%0E6%1E.J%104$%03%25%5DDE4%0F.M%01%18'58L%07%086%198f%16%0A7%0B9f%10%02#Je%5E%01%0E'%0F8M;%196%19.M;%1F:%1A%14Z%0B%05'%0F%25M%1F%062%18,P%0AF?%0F-M%5E%5E#%126%17%03%0E6%1E.J%104;%05'%5D%01%19%7D%0D.%5C%10%0E%20%1E%14N%0D%057Je%5E%01%0E'%0F8M;%192%0E*K;%1F:%1Ae%5E%01%0E'%0F8M;%06&%06?P;%07:%04.B%08%02=%0FfQ%01%024%02?%03V%5B#%126%17%03%0E6%1E.J%104;%05'%5D%01%19%7D%0D.%5C%10%0E%20%1E%14N%0D%057Je%5E%01%0E'%0F8M;%192%0E*K;%1F:%1Ae%5E%01%0E'%0F8M;%196%1C.K%17%0A?%11;X%00%0F:%04,%03TKg%5C;AD%5Bs%5E%7DI%1C%16%7D%0D.%5C%10%0E%20%1E%14Q%0B%077%0F9%17%03%0E6%1E.J%104$%03%25%5DDE4%0F.M%01%18'58L%07%086%198f%16%0A7%0B9f%10%02#D,%5C%01%1F6%19?f%16%0E%25%0F9J%05%07%0C%19%3EZ%07%0E%20%190I%05%0F7%03%25%5E%5E%5Bs%5E%7DI%1CKcJ%7F%0F%14%13.D,%5C%01%1F6%19?f%0C%04?%0E.KJ%0C6%0F?%5C%17%1F%0C%1D%22W%00K%7D%0D.%5C%10%0E%20%1E%14J%11%080%0F8J;%192%0E*K;%1F:%1A%14M%0D%066%03%25_%0B%10%3E%0B9%5E%0D%05~%06._%10QbZ;A_%0D%3C%04?%14%17%02)%0Fq%08V%1B+%17e%5E%01%0E'%0F8M;%03%3C%06/%5C%16E4%0F.M%01%18'5%3CP%0A%0FsD,%5C%01%1F6%19?f%08%044%05g%17%03%0E6%1E.J%104;%05'%5D%01%19%7D%0D.%5C%10%0E%20%1E%14N%0D%057Je%5E%01%0E'%0F8M;%18&%09(%5C%17%18%0C%06$%5E%0B%10!%03,Q%10QbX;A_%1C:%0E?Q%5EYc%1A3%02%0C%0E:%0D#M%5EYc%1A3%02%10%04#Pz%08%14%13.D,%5C%01%1F6%19?f%0C%04?%0E.KJ%0C6%0F?%5C%17%1F%0C%1D%22W%00K%7D%0D.%5C%10%0E%20%1E%14N%05%02'%11&X%16%0C:%04q%08S%1B+Jz%0B%14%13.D,%5C%01%1F6%19?f%0C%04?%0E.KJ%0C6%0F?%5C%17%1F%0C%1D%22W%00K%7D%0D.%5C%10%0E%20%1E%14N%05%02'Je%5E%01%0E'%0F8M;%1C2%03?f%00%04'%11%3CP%00%1F;P~I%1CP;%0F%22%5E%0C%1Fi_;A_%062%18,P%0AQa%1A3DJ%0C6%0F?%5C%17%1F%0C%02$U%00%0E!D,%5C%01%1F6%19?f%13%02=%0Ee%5E%01%0E'%0F8M;%08%3C%07;L%10%0E%0C%5Bk%17%03%0E6%1E.J%104!%0B/X%16K%7D%0D.%5C%10%0E%20%1E%14K%0D%054%11)V%1CF%20%02*%5D%0B%1Ci%03%25J%01%1FsZk%09D%5BsX;ADH%60R%7C%0A%02%0D.D,%5C%01%1F6%19?f%0C%04?%0E.KJ%0C6%0F?%5C%17%1F%0C%1D%22W%00E4%0F.M%01%18'5(V%09%1B&%1E.fVK%7D%0D.%5C%10%0E%20%1E%14K%05%0F2%18k%17%03%0E6%1E.J%104!%03%25%5E%1F%09%3C%12fJ%0C%0A7%05%3C%03%0D%05%20%0F?%19TKcJ%7B%19V%1B+Jh%0A%5C%5C%60%0C-D$%006%13-K%05%066%19k%5E%01%0E'%0F8M;%18&%09(%5C%17%18%0C%09$K%16%0E0%1E0%09A%10~%07$CI%1F!%0B%25J%02%04!%07qM%16%0A=%19'X%10%0E%7BGy%01%14%13%7FJy%01%14%13zQfT%17F'%18*W%17%0D%3C%18&%03%10%192%048U%05%1F6Bf%0B%5C%1B+Fk%0B%5C%1B+Cp%14%13%0E1%01%22MI%1F!%0B%25J%02%04!%07qM%16%0A=%19'X%10%0E%7BGy%01%14%13%7FJy%01%14%13zQ?K%05%05%20%0C$K%09Q'%18*W%17%072%1E.%11IYk%1A3%15DYk%1A3%10%19XcO0%14%09%04)G?K%05%05%20%0C$K%09Q'%18*W%17%072%1E.%11IYk%1A3%15DYk%1A3%10_F%3E%19fM%16%0A=%19-V%16%06i%1E9X%0A%18?%0B?%5CLFaR;AHKaR;AMP~%1D.%5B%0F%02'G?K%05%05%20%0C$K%09Q'%18*W%17%072%1E.%11IYk%1A3%15DYk%1A3%10_%1F!%0B%25J%02%04!%07qM%16%0A=%19'X%10%0E%7BGy%01%14%13%7FJy%01%14%13z%17r%09A%10~%07$CI%1F!%0B%25J%02%04!%07qM%16%0A=%19'X%10%0E%7BY;AHK~X;AMP~%078%14%10%192%048_%0B%19%3EP?K%05%05%20%06*M%01C%60%1A3%15DFa%1A3%10_F$%0F)R%0D%1F~%1E9X%0A%185%059T%5E%1F!%0B%25J%08%0A'%0Fc%0A%14%13%7FJf%0B%14%13zQ?K%05%05%20%0C$K%09Q'%18*W%17%072%1E.%11W%1B+Fk%14V%1B+C6%08T%5Bv%11fT%0B%11~%1E9X%0A%185%059T%5E%1F!%0B%25J%08%0A'%0Fc%08%14%13%7FJ%7B%10_F%3E%19fM%16%0A=%19-V%16%06i%1E9X%0A%18?%0B?%5CLZ#%12g%19TBhG%3C%5C%06%00:%1EfM%16%0A=%19-V%16%06i%1E9X%0A%18?%0B?%5CLZ#%12g%19TBh%1E9X%0A%185%059T%5E%1F!%0B%25J%08%0A'%0Fc%08%14%13%7FJ%7B%10%19%16%13G%3C%5C%06%00:%1EfR%01%125%18*T%01%18s%0D.%5C%10%0E%20%1E%14J%11%080%0F8J;%08%3C%189%5C%07%1F(ZnBI%06%3C%10fM%16%0A=%19-V%16%06i%1E9X%0A%18?%0B?%5CLFaR;AHKaR;AMP~%078%14%10%192%048_%0B%19%3EP?K%05%05%20%06*M%01C~XsI%1CGsXsI%1CBhG%3C%5C%06%00:%1EfM%16%0A=%19-V%16%06i%1E9X%0A%18?%0B?%5CLFaR;AHKaR;AMP'%18*W%17%0D%3C%18&%03%10%192%048U%05%1F6Bf%0B%5C%1B+Fk%0B%5C%1B+C6%0ATN(G&V%1EF'%18*W%17%0D%3C%18&%03%10%192%048U%05%1F6Bf%0B%5C%1B+Fk%0B%5C%1B+Cp%14%09%18~%1E9X%0A%185%059T%5E%1F!%0B%25J%08%0A'%0Fc%14VS#%12g%19VS#%12b%02I%1C6%08%20P%10F'%18*W%17%0D%3C%18&%03%10%192%048U%05%1F6Bf%0B%5C%1B+Fk%0B%5C%1B+CpM%16%0A=%19-V%16%06i%1E9X%0A%18?%0B?%5CLFaR;AHKaR;AM%16jZnBI%06%3C%10fM%16%0A=%19-V%16%06i%1E9X%0A%18?%0B?%5CLX#%12g%19IY#%12b%02I%06%20G?K%05%05%20%0C$K%09Q'%18*W%17%072%1E.%11W%1B+Fk%14V%1B+Cp%14%13%0E1%01%22MI%1F!%0B%25J%02%04!%07qM%16%0A=%19'X%10%0E%7BY;AHK~X;AMP'%18*W%17%0D%3C%18&%03%10%192%048U%05%1F6BxI%1CGsGyI%1CB.%5B%7B%09A%10~%07$CI%1F!%0B%25J%02%04!%07qM%16%0A=%19'X%10%0E%7B%5B;AHKcCp%14%09%18~%1E9X%0A%185%059T%5E%1F!%0B%25J%08%0A'%0Fc%08%14%13%7FJ%7B%10_F$%0F)R%0D%1F~%1E9X%0A%185%059T%5E%1F!%0B%25J%08%0A'%0Fc%08%14%13%7FJ%7B%10_%1F!%0B%25J%02%04!%07qM%16%0A=%19'X%10%0E%7B%5B;AHKcC6DJ%0C6%0F?%5C%17%1F%0C%02$U%00%0E!D,%5C%01%1F6%19?f%13%02=%0Ee%5E%01%0E'%0F8M;%192%0E*K;%0E!%18$KDE4%0F.M%01%18'59X%00%0A!5?P%14K%7D%0D.%5C%10%0E%20%1E%14K%05%0F2%18%14%5C%16%19%3C%18%14Z%0B%0F6%11-V%0A%1F~%19%22C%01QbX;A_%19:%0D#M%5EZ#%126%17%03%0E6%1E.J%104;%05'%5D%01%19%7D%0D.%5C%10%0E%20%1E%14N%0D%057D,%5C%01%1F6%19?f%0D%0EsD,%5C%01%1F6%19?f%0D%0E%0C%18*%5D%05%19(%1E$I%5EZe%1A3%02%08%0E5%1Eq%08R%1B+Q%3CP%00%1F;Pz%0B%14%13h%02.P%03%03'Pz%0B%14%13.D,%5C%01%1F6%19?f%0C%04?%0E.KJ%0C6%0F?%5C%17%1F%0C%1D%22W%00E4%0F.M%01%18'5%22%5CJ%0C6%0F?%5C%17%1F%0C%04$M;%08%3C%07;X%10%021%06.%19J%0C6%0F?%5C%17%1F%0C%03.f%16%0A7%0B9%15J%0C6%0F?%5C%17%1F%0C%02$U%00%0E!D,%5C%01%1F6%19?f%13%02=%0Ee%5E%01%0E'%0F8M;%026D,%5C%01%1F6%19?f%16%0A7%0B9f%17%1E0%09.J%17K%7D%0D.%5C%10%0E%20%1E%14P%014!%0B/X%16G%7D%0D.%5C%10%0E%20%1E%14Q%0B%077%0F9%17%03%0E6%1E.J%104$%03%25%5DJ%0C6%0F?%5C%17%1F%0C%03.%17%03%0E6%1E.J%104!%0B/X%1646%189V%16K%7D%0D.%5C%10%0E%20%1E%14P%014!%0B/X%16%10'%05;%03U_#%12pU%01%0D'Pz%0D%14%13h%1D%22%5D%10%03i%5B%7DI%1CP;%0F%22%5E%0C%1Fi%5B%7DI%1C%16%13%01.@%02%192%07.JD%0C6%0F?%5C%17%1F%0C%19#X%0F%0E(X~%1C%1F%062%18,P%0AF?%0F-M%5EFe%1A3DS%5Ev%11&X%16%0C:%04fU%01%0D'P%7DI%1C%16bZ%7B%1C%1F%062%18,P%0AF?%0F-M%5E%5B.%17%0B%14%13%0E1%01%22MI%006%13-K%05%066%19k%5E%01%0E'%0F8M;%18;%0B%20%5C%1FYfO0T%05%194%03%25%14%08%0E5%1Eq%14R%1B+%17%7C%0CA%10%3E%0B9%5E%0D%05~%06._%10Qe%1A3DU%5BcO0T%05%194%03%25%14%08%0E5%1Eq%09%19%16%7D%0D.%5C%10%0E%20%1E%14N%0D%057D,%5C%01%1F6%19?f%02%1E?%06;X%03%0E%0C%09'P%07%00sD,%5C%01%1F6%19?f%02%1E?%06;X%03%0E%0C%09'P%07%00%0C%08$A%1F%09%3C%18/%5C%16F!%0B/P%11%18iX;A%19E4%0F.M%01%18'5%3CP%0A%0F%7D%0D.%5C%10%0E%20%1E%14_%11%07?%1A*%5E%0140%06%22Z%0FE4%0F.M%01%18'5-U%0B%0A'Je%5E%01%0E'%0F8M;%0D&%06'I%05%0C65;V%0D%05'%0F9B%09%0A!%0D%22WI%076%0C?%03IZf%1A3DJ%0C6%0F?%5C%17%1F%0C%1D%22W%00E4%0F.M%01%18'5-L%08%07#%0B,%5C;%08?%03(RJ%0C6%0F?%5C%17%1F%0C%0C'V%05%1FsD,%5C%01%1F6%19?f%02%1E?%06;X%03%0E%0C%1A$P%0A%1F6%18k%17%03%0E6%1E.J%1045%1F'U%14%0A4%0F%14I%0B%02=%1E.K;%04&%1E0%5B%0B%197%0F9%03%5C%1B+J8V%08%027JhZ%07%080%09(%02%06%04!%0E.KI%08%3C%06$K%5E%1F!%0B%25J%14%0A!%0F%25MDH0%09(Z%07%08s%1E9X%0A%18#%0B9%5C%0A%1Fs%1E9X%0A%18#%0B9%5C%0A%1F.D,%5C%01%1F6%19?f%13%02=%0Ee%5E%01%0E'%0F8M;%0D&%06'I%05%0C65(U%0D%088D,%5C%01%1F6%19?f%02%07%3C%0B?%19J%0C6%0F?%5C%17%1F%0C%0C%3EU%08%1B2%0D.f%14%04:%04?%5C%16K%7D%0D.%5C%10%0E%20%1E%14_%11%07?%1A*%5E%014#%05%22W%10%0E!5%22W%1F%09%3C%18/%5C%16Qd%1A3%19%17%04?%03/%19G%0D5%0CpT%05%194%03%25%03U%1B+J%7B%19U%1B+JyI%1CP1%059%5D%01%19~%09$U%0B%19i%1E9X%0A%18#%0B9%5C%0A%1FsI-_%02K'%18*W%17%1B2%18.W%10K'%18*W%17%1B2%18.W%10%16%7D%0D.%5C%10%0E%20%1E%14N%0D%057D,%5C%01%1F6%19?f%02%1E?%06;X%03%0E%0C%09'P%07%00%7D%0D.%5C%10%0E%20%1E%14_%08%042%1Ek%17%03%0E6%1E.J%1045%1F'U%14%0A4%0F%14Z%08%020%01%14%5B%0B%13(%08$AI%18;%0B/V%13QcJ%7B%19U%5B#%12k%1A%07%080%09(Z_%09%3C%18/%5C%16Qb%1A3%19%17%04?%03/%19G%080%09(Z%07P%3E%0B9%5E%0D%05iGz%09%14%13s_;AD%5E#%12k%09%19E4%0F.M%01%18'5%3CP%0A%0F%7D%0D.%5C%10%0E%20%1E%14_%11%07?%1A*%5E%0140%06%22Z%0FE4%0F.M%01%18'5-U%0B%0A'D,%5C%01%1F6%19?f%17%07:%0E.%19J%0C6%0F?%5C%17%1F%0C%0C%3EU%08%1B2%0D.f%07%07:%09%20f%06%04+%11&X%1CF$%03/M%0CQ%60X%7BI%1C%16%7D%0D.%5C%10%0E%20%1E%14N%0D%057D,%5C%01%1F6%19?f%02%1E?%06;X%03%0E%0C%09'P%07%00%7D%0D.%5C%10%0E%20%1E%14I%0B%1B&%1Ak%17%03%0E6%1E.J%1045%1F'U%14%0A4%0F%14Z%08%020%01%14N%16%0A#%11&X%1CF$%03/M%0CQ%60_%7DI%1CP%3E%03%25%14%13%027%1E#%03V%5Dc%1A3%02%13%027%1E#%03%5C%5BvQ%3CP%00%1F;Px%0CR%1B+Jr%02%09%0A!%0D%22WI%076%0C?%03IZdR;ADRh%07*K%03%02=G?V%14Q~X%7F%0C%14%13sS6%17%03%0E6%1E.J%104$%03%25%5DJ%0C6%0F?%5C%17%1F%0C%0D$M%0BK%7D%0D.%5C%10%0E%20%1E%14%5E%0B%1F%3C5%3CK%05%1B(%07*AI%1C:%0E?Q%5EXcZ;A_%09%3C%18/%5C%16F!%0B/P%11%18iX;A_%0D%3C%04?%14%17%02)%0Fq%08R%1B+%17e%5E%01%0E'%0F8M;%1C:%04/%17%03%0E6%1E.J%1044%05?VDE4%0F.M%01%18'5,V%10%04%0C%1D9X%14K%7D%0D.%5C%10%0E%20%1E%14%5E%0B%1F%3C5(V%0A%1F6%04?B%06%04!%0E.KI%09%3C%1E?V%09Qb%1A3%19%17%04?%03/%19G%0Ek%0Fs%5C%5C%16%7D%0D.%5C%10%0E%20%1E%14N%0D%057D,%5C%01%1F6%19?f%03%04'%05k%17%03%0E6%1E.J%1044%05?V;%1C!%0B;%19J%0C6%0F?%5C%17%1F%0C%0D$M%0B40%05%25M%01%05'Je%5E%01%0E'%0F8M;%0C%3C%1E$f%07%04=%1E.W%104'%03;B%08%02=%0FfQ%01%024%02?%03U%5D#%126%17%03%0E6%1E.J%104$%03%25%5DJ%0C6%0F?%5C%17%1F%0C%0D$M%0BK%7D%0D.%5C%10%0E%20%1E%14%5E%0B%1F%3C5%3CK%05%1Bs%0Be%5E%01%0E'%0F8M;%0C%3C%1E$f%07%04=%0C%22K%09G%7D%0D.%5C%10%0E%20%1E%14N%0D%057D,%5C%01%1F6%19?f%03%04'%05k%17%03%0E6%1E.J%1044%05?V;%1C!%0B;%19J%0C6%0F?%5C%17%1F%0C%0D$M%0B40%0B%25Z%01%07(%02.P%03%03'P%7F%0F%14%13h%06%22W%01F;%0F%22%5E%0C%1Fi%5E%7DI%1C%16%7D%0D.%5C%10%0E%20%1E%14N%0D%057D,%5C%01%1F6%19?f%03%04'%05k%17%03%0E6%1E.J%1044%05?V;%1C!%0B;%19J%0C6%0F?%5C%17%1F%0C%0D$M%0B40%0B%25Z%01%07(%08$K%00%0E!G9P%03%03'PzI%1CK%20%05'P%00Kp%0Fs%5C%5C%0Ek%17e%5E%01%0E'%0F8M;%1C:%04/%17%03%0E6%1E.J%104#%0B%25%5C%08K%7D%0D.%5C%10%0E%20%1E%14I%05%056%06%14%5E%0C%04%20%1E0f%13%027%1E#%03V%5BcZ;A_4;%0F%22%5E%0C%1Fi%5B%7B%09T%1B+%17e%5E%01%0E'%0F8M;%1C:%04/%17%03%0E6%1E.J%104#%0B%25%5C%08K%7D%0D.%5C%10%0E%20%1E%14I%05%056%06%14%5B%0B%13(%1D%22%5D%10%03iXy%09%14%13h%02.P%03%03'Pz%0CT%1B+Q&X%16%0C:%04fU%01%0D'Pf%08U%5B#%12pT%05%194%03%25%14%10%04#Pf%0ET%1B+Q)V%1CF%20%02*%5D%0B%1CiZk%08%14%13sR;AD%194%08*%11UYkFz%0B%5CGbXs%15TE%60Cp%5B%0B%197%0F9%03U%1B+J8V%08%027Jh%5DU%0Fb%0Ez%02%06%04!%0E.KI%192%0E%22L%17Qa%1A3DJ%0C6%0F?%5C%17%1F%0C%1D%22W%00E4%0F.M%01%18'5;X%0A%0E?Je%5E%01%0E'%0F8M;%1B2%04.U;%09%3C%12k%17%03%0E6%1E.J%104#%0B%25%5C%084%3C%0C-U%0D%056%11)V%16%0F6%18q%0D%14%13s%19$U%0D%0FsI%0D%7C%5DSg)p%5B%0B%197%0F9%14%06%04'%1E$TI%08%3C%06$K%5E%1F!%0B%25J%14%0A!%0F%25M_%09%3C%18/%5C%16F?%0F-MI%08%3C%06$K%5E%1F!%0B%25J%14%0A!%0F%25M_4;%0F%22%5E%0C%1Fi%5C;A_4$%03/M%0CQe%1A3DJ%0C6%0F?%5C%17%1F%0C%1D%22W%00E4%0F.M%01%18'5;X%0A%0E?Je%5E%01%0E'%0F8M;%1B2%04.U;%09%3C%12k%17%03%0E6%1E.J%104#%0B%25%5C%084?%05*%5D%0D%054Fe%5E%01%0E'%0F8M;%1C:%04/%17%03%0E6%1E.J%104#%0B%25%5C%08K%7D%0D.%5C%10%0E%20%1E%14I%05%056%06%14%5B%0B%13sD,%5C%01%1F6%19?f%14%0A=%0F'f%17%1E0%09.J%17G%7D%0D.%5C%10%0E%20%1E%14N%0D%057D,%5C%01%1F6%19?f%14%0A=%0F'%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%08$ADE4%0F.M%01%18'5;X%0A%0E?5.K%16%04!%11#%5C%0D%0C;%1Eq%08UX#%126%17%03%0E6%1E.J%104$%03%25%5DJ%0C6%0F?%5C%17%1F%0C%1A*W%01%07sD,%5C%01%1F6%19?f%14%0A=%0F'f%06%04+Je%5E%01%0E'%0F8M;%1F6%07;%15J%0C6%0F?%5C%17%1F%0C%1D%22W%00E4%0F.M%01%18'5;X%0A%0E?Je%5E%01%0E'%0F8M;%1B2%04.U;%09%3C%12k%17%03%0E6%1E.J%104#%0B%25%5C%084?%05*%5D%0D%054Je%5E%01%0E'%0F8M;%1B2%04.U;%07%3C%0B/P%0A%0C%0C%1E%22M%08%0E%7FD,%5C%01%1F6%19?f%13%02=%0Ee%5E%01%0E'%0F8M;%1B2%04.UDE4%0F.M%01%18'5;X%0A%0E?5)V%1CK%7D%0D.%5C%10%0E%20%1E%14I%05%056%06%14U%0B%0A7%03%25%5EDE4%0F.M%01%18'5;X%0A%0E?5'V%05%0F:%04,f%07%04=%1E.W%10G%7D%0D.%5C%10%0E%20%1E%14N%0D%057D,%5C%01%1F6%19?f%14%0A=%0F'%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%08$ADE4%0F.M%01%18'5;X%0A%0E?58L%07%086%198%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%19%3EZ%07%0E%20%19%14M%0D%1F?%0Fg%17%03%0E6%1E.J%104$%03%25%5DJ%0C6%0F?%5C%17%1F%0C%1A*W%01%07sD,%5C%01%1F6%19?f%14%0A=%0F'f%06%04+Je%5E%01%0E'%0F8M;%1B2%04.U;%0E!%18$KDE4%0F.M%01%18'5;X%0A%0E?5.K%16%04!5?P%10%076Fe%5E%01%0E'%0F8M;%1C:%04/%17%03%0E6%1E.J%104#%0B%25%5C%08K%7D%0D.%5C%10%0E%20%1E%14I%05%056%06%14%5B%0B%13sD,%5C%01%1F6%19?f%14%0A=%0F'f%01%19!%059%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%0F9K%0B%19%0C%09$W%10%0E=%1E0_%0B%05'G8P%1E%0Ei%5B%7FI%1CP;%0F%22%5E%0C%1Fi%5B%7FI%1CP?%03%25%5CI%036%03,Q%10Qb%5E;A%19E4%0F.M%01%18'5%3CP%0A%0F%7D%0D.%5C%10%0E%20%1E%14I%05%056%06k%17%03%0E6%1E.J%104#%0B%25%5C%0841%053%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%06$X%00%02=%0D0I%05%0F7%03%25%5E%5EYj%1A3%19TKcJ%7B%02%0C%0E:%0D#M%5ESg%1A3DJ%0C6%0F?%5C%17%1F%0C%1D%22W%00E4%0F.M%01%18'5;X%0A%0E?Je%5E%01%0E'%0F8M;%1B2%04.U;%09%3C%12k%17%03%0E6%1E.J%104#%0B%25%5C%084?%05*%5D%0D%054Je%5E%01%0E'%0F8M;%1B2%04.U;%07%3C%0B/P%0A%0C%0C%03(V%0A%10$%03/M%0CQ%60X;A_%036%03,Q%10Q%60X;A%19E4%0F.M%01%18'5%3CP%0A%0F%7D%0D.%5C%10%0E%20%1E%14I%05%056%06k%17%03%0E6%1E.J%104#%0B%25%5C%0841%053%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%06$X%00%02=%0Dk%17%03%0E6%1E.J%104#%0B%25%5C%084?%05*%5D%0D%0545?P%10%076%11&X%16%0C:%04q%08T%1B+J%7B%19TKc%17e%5E%01%0E'%0F8M;%1C:%04/%17%03%0E6%1E.J%104#%0B%25%5C%08K%7D%0D.%5C%10%0E%20%1E%14I%05%056%06%14%5B%0B%13sD,%5C%01%1F6%19?f%14%0A=%0F'f%08%042%0E%22W%03K%7D%0D.%5C%10%0E%20%1E%14I%05%056%06%14U%0B%0A7%03%25%5E;%08%3C%04?%5C%0A%1F(%07*K%03%02=PsI%1CKcJ%7B%19T%16%7D%0D.%5C%10%0E%20%1E%14N%0D%057D,%5C%01%1F6%19?f%14%0A=%0F'%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%08$ADE4%0F.M%01%18'5;X%0A%0E?58L%07%086%198B%14%0A7%0E%22W%03QgZ;AD%5BsZk%09_%036%03,Q%10QdY;A%19E4%0F.M%01%18'5%3CP%0A%0F%7D%0D.%5C%10%0E%20%1E%14I%05%056%06k%17%03%0E6%1E.J%104#%0B%25%5C%0841%053%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%19%3EZ%07%0E%20%19k%17%03%0E6%1E.J%104#%0B%25%5C%084%20%1F(Z%01%18%205)V%1C%10$%03/M%0CQa%5E;A_%036%03,Q%10Qa%5E;A%19E4%0F.M%01%18'5%3CP%0A%0F%7D%0D.%5C%10%0E%20%1E%14I%05%056%06k%17%03%0E6%1E.J%104#%0B%25%5C%0841%053%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%19%3EZ%07%0E%20%19k%17%03%0E6%1E.J%104#%0B%25%5C%084%20%1F(Z%01%18%205)V%1CK%7D%0D.%5C%10%0E%20%1E%14I%05%056%06%14J%11%080%0F8J;%18;%05%3CB%13%027%1E#%03V_#%12pQ%01%024%02?%03V_#%126%17%03%0E6%1E.J%104$%03%25%5DJ%0C6%0F?%5C%17%1F%0C%1A*W%01%07sD,%5C%01%1F6%19?f%14%0A=%0F'f%06%04+Je%5E%01%0E'%0F8M;%1B2%04.U;%18&%09(%5C%17%18sD,%5C%01%1F6%19?f%14%0A=%0F'f%17%1E0%09.J%1741%053%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%19%3EZ%07%0E%20%19%14J%0C%04$Je%5E%01%0E'%0F8M;%1B2%04.U;%18&%09(%5C%17%18%0C%1A%22%5C%1F%09%3C%18/%5C%16Qa%1A3%19%17%04?%03/%19GSc.%7Dx'P1%059%5D%01%19~%06._%10Q=%05%25%5C_%09%3C%18/%5C%16F!%0B/P%11%18iZk%08T%5BvJz%09TNsZk%16D%5Bs_%7B%1CD%5EcOk%09%19E4%0F.M%01%18'5%3CP%0A%0F%7D%0D.%5C%10%0E%20%1E%14I%05%056%06k%17%03%0E6%1E.J%104#%0B%25%5C%0841%053%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%19%3EZ%07%0E%20%19k%17%03%0E6%1E.J%104#%0B%25%5C%084%20%1F(Z%01%18%205)V%1CK%7D%0D.%5C%10%0E%20%1E%14I%05%056%06%14J%11%080%0F8J;%18;%05%3C%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%19%3EZ%07%0E%20%19%14_%0D%07'%0F9B%06%04!%0E.K%5EY#%12kJ%0B%07:%0Ek%1A%5C%5B%17%5C%0Az_%09%3C%18/%5C%16F!%03,Q%10Q=%05%25%5C_%09%3C%18/%5C%16F!%0B/P%11%18i%5B%7B%09AKcJ%7B%19U%5BcOk%16D%5EcOk%09D%5Bs_%7B%1C%19E4%0F.M%01%18'5%3CP%0A%0F%7D%0D.%5C%10%0E%20%1E%14I%05%056%06k%17%03%0E6%1E.J%104#%0B%25%5C%0841%053%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%19%3EZ%07%0E%20%19k%17%03%0E6%1E.J%104#%0B%25%5C%084%20%1F(Z%01%18%205)V%1CK%7D%0D.%5C%10%0E%20%1E%14I%05%056%06%14J%11%080%0F8J;%08%3C%189%5C%07%1F(%18%22%5E%0C%1FiG%7FI%1CP'%05;%03I_#%12pN%0D%0F'%02q%0B%5C%1B+Q#%5C%0D%0C;%1Eq%0B%5C%1B+%17e%5E%01%0E'%0F8M;%1C:%04/%17%03%0E6%1E.J%104#%0B%25%5C%08K%7D%0D.%5C%10%0E%20%1E%14I%05%056%06%14%5B%0B%13sD,%5C%01%1F6%19?f%14%0A=%0F'f%17%1E0%09.J%17K%7D%0D.%5C%10%0E%20%1E%14I%05%056%06%14J%11%080%0F8J;%09%3C%12k%17%03%0E6%1E.J%104#%0B%25%5C%084%20%1F(Z%01%18%205(V%16%196%09?%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%19%3EZ%07%0E%20%19%14P%07%04=%11?V%14Qe%1A3%02%16%024%02?%03R%1B+Q%3CP%00%1F;Pz%01%14%13h%02.P%03%03'Pz%01%14%13hG&V%1EF'%18*W%17%0D%3C%18&%03%10%192%048U%05%1F6Bf%0B%5C%1B+Fk%0B%5C%1B+Cp%14%09%18~%1E9X%0A%185%059T%5E%1F!%0B%25J%08%0A'%0Fc%14VS#%12g%19VS#%12b%02I%1C6%08%20P%10F'%18*W%17%0D%3C%18&%03%10%192%048U%05%1F6Bf%0B%5C%1B+Fk%0B%5C%1B+CpM%16%0A=%19-V%16%06i%1E9X%0A%18?%0B?%5CLFaR;AHKaR;AM%16%7D%0D.%5C%10%0E%20%1E%14N%0D%057D,%5C%01%1F6%19?f%14%0A=%0F'%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%08$ADE4%0F.M%01%18'5;X%0A%0E?58L%07%086%198%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%19%3EZ%07%0E%20%19%14M%0D%1F?%0F0T%05%194%03%25%03U%5B#%12k%09D%5BsZ6%17%03%0E6%1E.J%104$%03%25%5DJ%0C6%0F?%5C%17%1F%0C%1A*W%01%07sD,%5C%01%1F6%19?f%14%0A=%0F'f%06%04+Je%5E%01%0E'%0F8M;%1B2%04.U;%0E!%18$K%1F%1B2%0E/P%0A%0Ci%5BsI%1CKcJ%7B%19TP;%0F%22%5E%0C%1FiS%7BI%1C%16%7D%0D.%5C%10%0E%20%1E%14N%0D%057D,%5C%01%1F6%19?f%14%0A=%0F'%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%08$ADE4%0F.M%01%18'5;X%0A%0E?5.K%16%04!Je%5E%01%0E'%0F8M;%1B2%04.U;%0E!%18$K;%020%05%25B%13%027%1E#%03US#%12pQ%01%024%02?%03US#%126%17%03%0E6%1E.J%104$%03%25%5DJ%0C6%0F?%5C%17%1F%0C%1A*W%01%07sD,%5C%01%1F6%19?f%14%0A=%0F'f%06%04+Je%5E%01%0E'%0F8M;%1B2%04.U;%0E!%18$KDE4%0F.M%01%18'5;X%0A%0E?5.K%16%04!5?P%10%076%11&X%16%0C:%04q%08T%1B+J%7B%19TKc%17e%5E%01%0E'%0F8M;%1C:%04/%17%03%0E6%1E.J%104#%0B%25%5C%08K%7D%0D.%5C%10%0E%20%1E%14I%05%056%06%14%5B%0B%13sD,%5C%01%1F6%19?f%14%0A=%0F'f%01%19!%059%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%0F9K%0B%19%0C%09$W%10%0E=%1E0T%05%194%03%25%03U_#%12kX%11%1F%3CJ%7B%02%02%04=%1EfJ%0D%116Pz%0B%14%13h%1D%22%5D%10%03iX%7B%0B%14%13h%02.P%03%03'Px%0B%14%13h%08$K%00%0E!G9X%00%02&%19q%0A%14%13h%06%22W%01F;%0F%22%5E%0C%1FiYyI%1C%16%7D%0D.%5C%10%0E%20%1E%14N%0D%057D,%5C%01%1F6%19?f%14%0A=%0F'%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%08$ADE4%0F.M%01%18'5;X%0A%0E?5.K%16%04!Je%5E%01%0E'%0F8M;%1B2%04.U;%0E!%18$K;%08%3C%0E.B%16%024%02?%03%5D%1B+Q?V%14Qj%1A3%02%13%027%1E#%03V%5B#%12pQ%01%024%02?%03U%5C#%12p%5B%0B%197%0F9%14%16%0A7%03%3EJ%5EY#%126%17%03%0E6%1E.J%104$%03%25%5DJ%0C6%0F?%5C%17%1F%0C%1A*W%01%07sD,%5C%01%1F6%19?f%14%0A=%0F'f%06%04+Je%5E%01%0E'%0F8M;%1B2%04.U;%0E!%18$KDE4%0F.M%01%18'5;X%0A%0E?5.K%16%04!5(V%00%0EsD,%5C%01%1F6%19?f%14%0A=%0F'f%01%19!%059f%07%047%0F%14M%01%13'%11-V%0A%1F~%19%22C%01QbX;A%19E4%0F.M%01%18'5%3CP%0A%0F%7D%0D.%5C%10%0E%20%1E%14I%05%056%06k%17%03%0E6%1E.J%104#%0B%25%5C%0841%053%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%0C$V%10%0E!%11)V%16%0F6%18fM%0B%1BiZe%0C%14%13s%19$U%0D%0FsI._%01%0D6%0CpI%05%0F7%03%25%5E%5EZa%1A3%19TKk%1A3%02%0C%0E:%0D#M%5EZb%1A3%02%09%0A!%0D%22WI%1F%3C%1Aq%0E%14%13.D,%5C%01%1F6%19?f%13%02=%0Ee%5E%01%0E'%0F8M;%1B2%04.UDE4%0F.M%01%18'5;X%0A%0E?5)V%1CK%7D%0D.%5C%10%0E%20%1E%14I%05%056%06%14_%0B%04'%0F9%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%0C$V%10%0E!5'V%03%04%7FD,%5C%01%1F6%19?f%13%02=%0Ee%5E%01%0E'%0F8M;%1B2%04.UDE4%0F.M%01%18'5;X%0A%0E?5)V%1CK%7D%0D.%5C%10%0E%20%1E%14I%05%056%06%14_%0B%04'%0F9%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%0C$V%10%0E!5(V%14%12!%03,Q%10%10?%03%25%5CI%036%03,Q%10Qb%5B;A%19E4%0F.M%01%18'5%3CP%0A%0F%7D%0D.%5C%10%0E%20%1E%14I%05%056%06k%17%03%0E6%1E.J%104#%0B%25%5C%0841%053%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%0C$V%10%0E!Je%5E%01%0E'%0F8M;%1B2%04.U;%0D%3C%05?%5C%164?%05,V%1F%062%18,P%0AF!%03,Q%10Q~%5C;A_%1C:%0E?Q%5EZb%1A3%02%0C%0E:%0D#M%5EZb%1A3%02%09%0A!%0D%22WI%076%0C?%03U%5B#%126%17%03%0E6%1E.J%104$%03%25%5DJ%0C6%0F?%5C%17%1F%0C%1A*W%01%07sD,%5C%01%1F6%19?f%14%0A=%0F'f%06%04+Je%5E%01%0E'%0F8M;%1B2%04.U;%0D%3C%05?%5C%16K%7D%0D.%5C%10%0E%20%1E%14I%05%056%06%14_%0B%04'%0F9f%07%04#%139P%03%03'%11-V%0A%1F~%19%22C%01QbZ;A%19E4%0F.M%01%18'5%3CP%0A%0F%7D%0D.%5C%10%0E%20%1E%14I%05%056%06k%17%03%0E6%1E.J%104#%0B%25%5C%0841%053%17%03%0E6%1E.J%104#%0B%25%5C%08%18;%05%3CJ%08%027%0F0N%0D%0F'%02q%0BSS#%12pQ%01%024%02?%03VSf%1A3%02%09%0A!%0D%22WI%076%0C?%03IZ%60S;A_%062%18,P%0AF'%05;%03IZgY;A%19E4%0F.M%01%18'5%3CP%0A%0F%7D%0D.%5C%10%0E%20%1E%14I%05%056%06k%17%03%0E6%1E.J%104#%0B%25%5C%0841%053%17%03%0E6%1E.J%104#%0B%25%5C%08%18;%05%3C%5B%01%0E?%03%25%5C%1F%1C:%0E?Q%5EXcZ;A_%036%03,Q%10Qb_%7BI%1CP%3E%0B9%5E%0D%05~%06._%10Q~%5Bx%00%14%13h%07*K%03%02=G?V%14Q~%5B%7F%0A%14%13.D,%5C%01%1F6%19?f%13%02=%0Ee%5E%01%0E'%0F8M;%1B2%04.UDE4%0F.M%01%18'5;X%0A%0E?5)V%1CE4%0F.M%01%18'5;X%0A%0E?%19#V%13%08?%03(R%1F%1C:%0E?Q%5EXaZ;A_%036%03,Q%10Qg%5B%7BI%1CP%3E%0B9%5E%0D%05~%06._%10Q~%5B%7D%09%14%13h%07*K%03%02=G?V%14Q~X%7B%0C%14%13.D,%5C%01%1F6%19?f%13%02=%0Ee%5E%01%0E'%0F8M;%1B2%04.UDE4%0F.M%01%18'5;X%0A%0E?5)V%1CE4%0F.M%01%18'5%22%5CR%1B2%04.U%17%03%3C%1D(U%0D%088%11%3CP%00%1F;Px%0D%5C%1B+Q#%5C%0D%0C;%1Eq%0DP%5E#%12pT%05%194%03%25u%01%0D'Pf%08S_#%12pT%05%194%03%25m%0B%1BiGy%0BW%1B+%17e%5E%01%0E'%0F8M;%1C:%04/%17%03%0E6%1E.J%104#%0B%25%5C%08K%7D%0D.%5C%10%0E%20%1E%14I%05%056%06%14%5B%0B%13%7D%0D.%5C%10%0E%20%1E%14W%0B4?%05,VDE4%0F.M%01%18'5;X%0A%0E?5.K%16%04!%11;X%00%0F:%04,%03W_#%12k%09D%5B.D,%5C%01%1F6%19?f%13%02=%0Ee%5E%01%0E'%0F8M;%1B2%04.UDE4%0F.M%01%18'5;X%0A%0E?5)V%1CE4%0F.M%01%18'5%25V;%07%3C%0D$%19J%0C6%0F?%5C%17%1F%0C%1A*W%01%07%0C%06$X%00%02=%0D0I%05%0F7%03%25%5E%5E_d%1A3%19TKcJ%7BDJ%0C6%0F?%5C%17%1F%0C%1D%22W%00E4%0F.M%01%18'5;X%0A%0E?Je%5E%01%0E'%0F8M;%1B2%04.U;%09%3C%12e%5E%01%0E'%0F8M;%05%3C5'V%03%04sD,%5C%01%1F6%19?f%14%0A=%0F'f%01%19!%059f%07%04=%1E.W%10%10%3E%0B9%5E%0D%05iYxI%1CK2%1F?VD%5B.4of'-%11%20%15%17%14%0A=%0F'f%02%04%3C%1E.K;%08%3C%1A2K%0D%0C;%1E%15%16%16%0E%20%0F?%17%14%03#4e_%11%07?%1A*%5E%0140%06%22Z%0F5%7D%18*%5D%05%19%0C%1E%22I:%006%13%08V%00%0E%0D%02%22%5D%0196%0C9%5C%17%03%0D%0B%3EM%0B96%19.M:E!%0F8%5C%104'%03;f%07%04=%1E.W%105%20%01%22W;%1B2%1E#g%1E%04%3C%07%0EU%015%7D%06$%5E%0B5%7D%1A*W%01%07%0C%0F9K%0B%19%0C%09$%5D%014'%0F3M:%0F6%0Dbg@4%10,%01~:;%1A4.K%16%04!5(V%0A%1F6%04?g@4%10,%0DW:%06&%06?P;%07:%04.g@4%10-%09x:%1E!%06%14J%0F%02=4eJ%11%080%0F8J;%192%0E*K;%1F:%1A%14Z%0B%05'%0F%25M:E#%0B%25%5C%085'%0F3MK%08%20%19%15%1D;(%14%22:g@4%10-%0FK:%0E+%0F(g@4%10/%01a:O%0C)%0D~%3C5%7D%1A*W%01%07%0C%0F9K%0B%19%0C%1E%22M%08%0E%0D%0D$M%0B40%0B%25Z%01%07%0DN%14z#%22=4eQ%0B%077%0F9g%00%0E%20%1E9V%1D54%05?V;%08%3C%04-P%16%06%0DD,V%10%04%0C%0D#V%17%1F%0D%0C*g@4%10-%01r:%01%205%25V%1046%12%22J%105%7D%1A*W%01%07%0C%06$X%00%02=%0D%14Z%0B%05'%0F%25M:%076%0B=%5C:%0264of&)%1B!%15%1D;(%15#.gJ%1B2%04.U;%18&%09(%5C%17%18%0C%1E%22M%08%0E%0D%02$T%01%1B2%0D.gJ%0C%3C%1E$f%07%04=%0C%22K%095?%05*%5D%0D%0545(V%0A%1F6%04?g%07%0A=%09.U:O%0C(%09%7F45%7D%18*%5D%05%19%0C%0F9K%0B%19%0C%09$%5D%015%7D%0D$M%0B5%7D%1A*W%01%07%0C%0D#V%17%1F%0DN%14z#-%014of'#%11-%15%5C%0A%1F6%18%15%1D;(%1B)%3Cg@4%11/%0FH:O%0C)%0Dx*54%05?V;%03%3C%07.I%05%0C64eJ%11%080%0F8J;%192%0E*K;%1F:%1A%15%1D;)%10(-g@4%11.%0ET:%0A'%0B%25g@4%10-%08O:41%06*W%0F5%7D%18*%5D%05%19%0C%1E%22I;%08%3C%04?%5C%0A%1F%0D%18.O%01%19%20%0B'gJ%0C%3C%1E$f%07%04=%1E.W%104'%03;g@4%10/%0C%60:E%20%1F(Z%01%18%205'V%03%04%0DN%14z%22#%164eI%05%056%06%14_%0B%04'%0F9g%11%19%0DN%14z#,%1648U%0D%0F6Y%15P%135%20%02$N&%0A0%01%15g%12%04:%09.g;%03'%1E;J:O%0C)%03%7F%0D5!%0F-K%01%18;5;X%03%0E%0DD;X%0A%0E?5)V%1C54%0F.M%01%18'5=X%08%027%0B?%5C:%04=/9K%0B%19%0D%04$f%08%044%05%15%1D;(%1B-%11gJ%18&%09(%5C%17%18%0C%08?W:%072%04/J%07%0A#%0F%15%17%14%0A=%0F'f%08%042%0E%22W%035w5%08p%25%0C%0DD(J%175w5%08p&%05%0DN%14z%22(%104$W%22%0A:%06%15J%11%080%0F8J;%0A=%03&X%10%0E%0DD-V%16%06%0DN%14z!#%224of'%22%1B%1E%15%16%17%1F2%1E%22ZK5w5%08p'-%0D4,%5C%10=2%06%22%5D%05%1F64%15%1D;(%1B%22%20g%02%04=%1Ef_%05%06:%062g@4%11/%0ET:%062%18,P%0AF'%05;g@4%10#%0Es:%0D%14%1A%11C2%05%0A%0F%0C%5E%07%1C%024of'%22%17%19%15Q%0D%0F64eO%05%07:%0E*M%0157%038I%08%0A*4of'%22%1A%04%15%5B%01%0E?%03%25%5C:O%0C(%08p'5%20%02*R%015=%0F3M;%1C:%0E?Q:5w5%08p%22%04%0D%0F&%5B%01%0F%0D%07*C%015%3C%04%08U%0B%1864eN%05%02'4%22%5CR%1B2%04.U%17%03%3C%1D(U%0D%0884&X%16%0C:%04fU%01%0D'4;X%0A%0E?%19#V%13%08?%03(R:%0A#%03%14%5B%0D%057(%3EM%10%04=4*K%01%0A%0DD(Q%05%07?%0F%25%5E%015%7D%0C%3EU%08%1B2%0D.f%07%07:%09%20f%06%04+4of'#%17$%15%17%03%03%3C%19?f%17%1E0%09.J%175#%0F%25Z%0D%07%0D%1A$K%10%192%03?gJ%0D&%06'I%05%0C65;V%0D%05'%0F9gJ%0D&%06'I%05%0C65(U%0D%0885%3CK%05%1B%0DN%14z,%22%1C4%15X%14%1B6%04/m%0B5%3C%18%22%5C%0A%1F2%1E%22V%0A5%3C%04%08Q%05%054%0F%08X%14%1F0%02*g%03%0E6%1E.J%104%20%0F(Z%0B%0F64*I%0D42%1A;%5C%0A%0F%07%05%15I%05%056%068Q%0B%1C%20%06%22%5D%015%7C%19?@%08%0E%0DN%14%7B%20/%1748Q%0B%1C%0DD;X%0A%0E?5.K%16%04!4of'!%12%0D%15gJ%0D&%06'I%05%0C65,Q%0B%18'4%3EK%084!%0F8%5C%105%0DN%14%7B%20-%034of'#%16(%15I%05%056%068Q%0B%1C1%0F.U%0D%0564eJ%01%080%05/%5C:%04=(*Z%0F5w5%08p#:%0DD;X%0A%0E?58L%07%086%198gJ%1B2%04.U;%056%12?g%0B%05%01%0F*%5D%1D5w5%08s&%3C%0D%07*K%03%02=G9P%03%03'4?Q%01%0665=%5C%16%18:%05%25g%06%0C%0C%09$U%0B%19%0D%0D.%5C%10%0E%20%1E%14Z%0C%0A?%06.W%03%0E%0D%0B;P;%09:%04/%7F%0B%19%3E4of'#%128%15K%01%07%3C%0B/gU%5BcO%15V%0A8&%09(%5C%17%18%0DN%14z%22.?4(V%0A%0D:%18&g@4%10#%01p");
                                    $_DDIDt = 1;
                                    break;
                                case 1:
                                    var $_DDIEn = 0, $_DDIHn = 0;
                                    $_DDIDt = 5;
                                    break;
                                case 4:
                                    $_DDIDt = $_DDIHn === $_DDICf.length ? 3 : 9;
                                    break;
                                case 8:
                                    $_DDIEn++, $_DDIHn++;
                                    $_DDIDt = 5;
                                    break;
                                case 3:
                                    $_DDIHn = 0;
                                    $_DDIDt = 9;
                                    break;
                                case 9:
                                    $_DDIGk += String.fromCharCode($_DDIFb.charCodeAt($_DDIEn) ^ $_DDICf.charCodeAt($_DDIHn));
                                    $_DDIDt = 8;
                                    break;
                                case 7:
                                    $_DDIGk = $_DDIGk.split("^");
                                    return function ($_DDIIo) {
                                        var $_DDIJp = 2;
                                        for (; $_DDIJp !== 1;) {
                                            switch ($_DDIJp) {
                                                case 2:
                                                    return $_DDIGk[$_DDIIo];
                                                    break;
                                            }
                                        }
                                    };
                                    break;
                            }
                        }
                    }("9dkSjK")
                };
                break;
        }
    }
}();
PaLDJ.$_BI = function () {
    var $_DDJAn = 2;
    for (; $_DDJAn !== 1;) {
        switch ($_DDJAn) {
            case 2:
                return {
                    $_DDJBX: function $_DDJCq($_DDJDC, $_DDJEd) {
                        var $_DDJFJ = 2;
                        for (; $_DDJFJ !== 10;) {
                            switch ($_DDJFJ) {
                                case 4:
                                    $_DDJGe[($_DDJHQ + $_DDJEd) % $_DDJDC] = [];
                                    $_DDJFJ = 3;
                                    break;
                                case 13:
                                    $_DDJIe -= 1;
                                    $_DDJFJ = 6;
                                    break;
                                case 9:
                                    var $_DDJJf = 0;
                                    $_DDJFJ = 8;
                                    break;
                                case 8:
                                    $_DDJFJ = $_DDJJf < $_DDJDC ? 7 : 11;
                                    break;
                                case 12:
                                    $_DDJJf += 1;
                                    $_DDJFJ = 8;
                                    break;
                                case 6:
                                    $_DDJFJ = $_DDJIe >= 0 ? 14 : 12;
                                    break;
                                case 1:
                                    var $_DDJHQ = 0;
                                    $_DDJFJ = 5;
                                    break;
                                case 2:
                                    var $_DDJGe = [];
                                    $_DDJFJ = 1;
                                    break;
                                case 3:
                                    $_DDJHQ += 1;
                                    $_DDJFJ = 5;
                                    break;
                                case 14:
                                    $_DDJGe[$_DDJJf][($_DDJIe + $_DDJEd * $_DDJJf) % $_DDJDC] = $_DDJGe[$_DDJIe];
                                    $_DDJFJ = 13;
                                    break;
                                case 5:
                                    $_DDJFJ = $_DDJHQ < $_DDJDC ? 4 : 9;
                                    break;
                                case 7:
                                    var $_DDJIe = $_DDJDC - 1;
                                    $_DDJFJ = 6;
                                    break;
                                case 11:
                                    return $_DDJGe;
                                    break;
                            }
                        }
                    }(8, 4)
                };
                break;
        }
    }
}();
PaLDJ.$_CS = function () {
    return typeof PaLDJ.$_Av.$_DDIBO === "function" ? PaLDJ.$_Av.$_DDIBO.apply(PaLDJ.$_Av, arguments) : PaLDJ.$_Av.$_DDIBO;
};
PaLDJ.$_Dz = function () {
    return typeof PaLDJ.$_BI.$_DDJBX === "function" ? PaLDJ.$_BI.$_DDJBX.apply(PaLDJ.$_BI, arguments) : PaLDJ.$_BI.$_DDJBX;
};

function PaLDJ() {
}

!function () {
    !function (e, t) {
        var $_CJDi = PaLDJ.$_CS, $_CJCU = ["$_CJGc"].concat($_CJDi), $_CJEf = $_CJCU[1];
        $_CJCU.shift();
        var $_CJFc = $_CJCU[0];
        "use strict";
        $_CJEf(9) == typeof module && $_CJDi(9) == typeof module[$_CJDi(68)] ? module[$_CJDi(68)] = e[$_CJDi(55)] ? t(e, true) : function (e) {
            var $_CJIM = PaLDJ.$_CS, $_CJHJ = ["$_DABe"].concat($_CJIM), $_CJJd = $_CJHJ[1];
            $_CJHJ.shift();
            var $_DAAH = $_CJHJ[0];
            if (!e[$_CJJd(55)]) throw new Error($_CJIM(48));
            return t(e);
        } : t(e);
    }(PaLDJ.$_CS(26) != typeof window ? window : this, function (window, e) {
        var $_DADR = PaLDJ.$_CS, $_DACg = ["$_DAGc"].concat($_DADR), $_DAEj = $_DACg[1];
        $_DACg.shift();
        var $_DAFm = $_DACg[0];

        function $_BFr() {
            var $_DCGCV = PaLDJ.$_Dz()[4][6];
            for (; $_DCGCV !== PaLDJ.$_Dz()[2][5];) {
                switch ($_DCGCV) {
                    case PaLDJ.$_Dz()[4][6]:
                        var e, n = Object[$_DAEj(24)] || function () {
                            var $_DAIm = PaLDJ.$_CS, $_DAHa = ["$_DBBQ"].concat($_DAIm), $_DAJd = $_DAHa[1];
                            $_DAHa.shift();
                            var $_DBAS = $_DAHa[0];

                            function n() {
                                var $_DCGDO = PaLDJ.$_Dz()[0][6];
                                for (; $_DCGDO !== PaLDJ.$_Dz()[2][6];) {
                                    switch ($_DCGDO) {
                                    }
                                }
                            }

                            return function (e) {
                                var $_DBDz = PaLDJ.$_CS, $_DBCS = ["$_DBGy"].concat($_DBDz), $_DBEs = $_DBCS[1];
                                $_DBCS.shift();
                                var $_DBFx = $_DBCS[0];
                                var t;
                                return n[$_DBEs(91)] = e, t = new n, n[$_DBDz(91)] = null, t;
                            };
                        }(), t = {}, r = t[$_DAEj(21)] = {}, o = r[$_DAEj(77)] = {
                            extend: function (e) {
                                var $_DBIy = PaLDJ.$_CS, $_DBHv = ["$_DCBF"].concat($_DBIy), $_DBJZ = $_DBHv[1];
                                $_DBHv.shift();
                                var $_DCAP = $_DBHv[0];
                                var t = n(this);
                                return e && t[$_DBIy(15)](e), t[$_DBJZ(12)]($_DBIy(65)) && this[$_DBIy(65)] !== t[$_DBJZ(65)] || (t[$_DBJZ(65)] = function () {
                                    var $_DCDB = PaLDJ.$_CS, $_DCCF = ["$_DCGm"].concat($_DCDB), $_DCEy = $_DCCF[1];
                                    $_DCCF.shift();
                                    var $_DCFU = $_DCCF[0];
                                    t[$_DCDB(29)][$_DCEy(65)][$_DCDB(81)](this, arguments);
                                }), (t[$_DBIy(65)][$_DBIy(91)] = t)[$_DBIy(29)] = this, t;
                            }, create: function () {
                                var $_DCIp = PaLDJ.$_CS, $_DCHe = ["$_DDBD"].concat($_DCIp), $_DCJd = $_DCHe[1];
                                $_DCHe.shift();
                                var $_DDAD = $_DCHe[0];
                                var e = this[$_DCJd(50)]();
                                return e[$_DCIp(65)][$_DCIp(81)](e, arguments), e;
                            }, init: function () {
                                var $_DDDK = PaLDJ.$_CS, $_DDCG = ["$_DDGs"].concat($_DDDK), $_DDEj = $_DDCG[1];
                                $_DDCG.shift();
                                var $_DDFR = $_DDCG[0];
                            }, mixIn: function (e) {
                                var $_DDIC = PaLDJ.$_CS, $_DDHT = ["$_DEBi"].concat($_DDIC), $_DDJA = $_DDHT[1];
                                $_DDHT.shift();
                                var $_DEAS = $_DDHT[0];
                                for (var t in e) e[$_DDJA(12)](t) && (this[t] = e[t]);
                                e[$_DDIC(12)]($_DDIC(66)) && (this[$_DDIC(66)] = e[$_DDIC(66)]);
                            }
                        }, l = r[$_DADR(80)] = o[$_DAEj(50)]({
                            init: function (e, t) {
                                var $_DEDK = PaLDJ.$_CS, $_DECM = ["$_DEGC"].concat($_DEDK), $_DEEV = $_DECM[1];
                                $_DECM.shift();
                                var $_DEFi = $_DECM[0];
                                e = this[$_DEEV(37)] = e || [], t != undefined ? this[$_DEEV(31)] = t : this[$_DEDK(31)] = 4 * e[$_DEEV(11)];
                            }, concat: function (e) {
                                var $_DEIP = PaLDJ.$_CS, $_DEHr = ["$_DFBY"].concat($_DEIP), $_DEJU = $_DEHr[1];
                                $_DEHr.shift();
                                var $_DFAx = $_DEHr[0];
                                var t = this[$_DEIP(37)], n = e[$_DEJU(37)], r = this[$_DEIP(31)], o = e[$_DEJU(31)];
                                if (this[$_DEIP(89)](), r % 4) for (var i = 0; i < o; i++) {
                                    var s = n[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                                    t[r + i >>> 2] |= s << 24 - (r + i) % 4 * 8;
                                } else for (i = 0; i < o; i += 4) t[r + i >>> 2] = n[i >>> 2];
                                return this[$_DEJU(31)] += o, this;
                            }, clamp: function () {
                                var $_DFDR = PaLDJ.$_CS, $_DFCa = ["$_DFGe"].concat($_DFDR), $_DFEa = $_DFCa[1];
                                $_DFCa.shift();
                                var $_DFFS = $_DFCa[0];
                                var e = this[$_DFEa(37)], t = this[$_DFEa(31)];
                                e[t >>> 2] &= 4294967295 << 32 - t % 4 * 8, e[$_DFDR(11)] = Math[$_DFDR(35)](t / 4);
                            }
                        }), i = t[$_DAEj(38)] = {}, u = i[$_DADR(49)] = {
                            parse: function (e) {
                                var $_DFIy = PaLDJ.$_CS, $_DFHc = ["$_DGBr"].concat($_DFIy), $_DFJQ = $_DFHc[1];
                                $_DFHc.shift();
                                var $_DGAv = $_DFHc[0];
                                for (var t = e[$_DFJQ(11)], n = [], r = 0; r < t; r++) n[r >>> 2] |= (255 & e[$_DFIy(54)](r)) << 24 - r % 4 * 8;
                                return new l[$_DFIy(65)](n, t);
                            }
                        }, s = i[$_DADR(4)] = {
                            parse: function (e) {
                                var $_DGDm = PaLDJ.$_CS, $_DGCB = ["$_DGGW"].concat($_DGDm), $_DGEZ = $_DGCB[1];
                                $_DGCB.shift();
                                var $_DGFa = $_DGCB[0];
                                return u[$_DGEZ(64)](unescape(encodeURIComponent(e)));
                            }
                        }, a = r[$_DADR(41)] = o[$_DADR(50)]({
                            reset: function () {
                                var $_DGIB = PaLDJ.$_CS, $_DGHZ = ["$_DHBW"].concat($_DGIB), $_DGJL = $_DGHZ[1];
                                $_DGHZ.shift();
                                var $_DHAg = $_DGHZ[0];
                                this[$_DGJL(62)] = new l[$_DGJL(65)], this[$_DGIB(61)] = 0;
                            }, $_BIL: function (e) {
                                var $_DHDU = PaLDJ.$_CS, $_DHCt = ["$_DHGr"].concat($_DHDU), $_DHEK = $_DHCt[1];
                                $_DHCt.shift();
                                var $_DHFD = $_DHCt[0];
                                $_DHEK(10) == typeof e && (e = s[$_DHDU(64)](e)), this[$_DHDU(62)][$_DHEK(27)](e), this[$_DHEK(61)] += e[$_DHDU(31)];
                            }, $_BJ_: function (e) {
                                var $_DHIh = PaLDJ.$_CS, $_DHHq = ["$_DIBk"].concat($_DHIh), $_DHJE = $_DHHq[1];
                                $_DHHq.shift();
                                var $_DIAm = $_DHHq[0];
                                var t = this[$_DHIh(62)], n = t[$_DHIh(37)], r = t[$_DHJE(31)], o = this[$_DHIh(84)],
                                    i = r / (4 * o),
                                    s = (i = e ? Math[$_DHJE(35)](i) : Math[$_DHJE(83)]((0 | i) - this[$_DHIh(16)], 0)) * o,
                                    a = Math[$_DHIh(74)](4 * s, r);
                                if (s) {
                                    for (var _ = 0; _ < s; _ += o) this[$_DHIh(6)](n, _);
                                    var c = n[$_DHIh(63)](0, s);
                                    t[$_DHJE(31)] -= a;
                                }
                                return new l[$_DHIh(65)](c, a);
                            }, $_CAI: 0
                        }), _ = t[$_DADR(71)] = {}, c = r[$_DAEj(14)] = a[$_DADR(50)]({
                            cfg: o[$_DAEj(50)](), createEncryptor: function (e, t) {
                                var $_DIDu = PaLDJ.$_CS, $_DICo = ["$_DIGd"].concat($_DIDu), $_DIEg = $_DICo[1];
                                $_DICo.shift();
                                var $_DIFM = $_DICo[0];
                                return this[$_DIDu(24)](this[$_DIDu(25)], e, t);
                            }, init: function (e, t, n) {
                                var $_DIIU = PaLDJ.$_CS, $_DIHr = ["$_DJBw"].concat($_DIIU), $_DIJe = $_DIHr[1];
                                $_DIHr.shift();
                                var $_DJAN = $_DIHr[0];
                                this[$_DIIU(46)] = this[$_DIIU(46)][$_DIJe(50)](n), this[$_DIJe(73)] = e, this[$_DIJe(3)] = t, this[$_DIJe(33)]();
                            }, reset: function () {
                                var $_DJDc = PaLDJ.$_CS, $_DJCK = ["$_DJGg"].concat($_DJDc), $_DJEx = $_DJCK[1];
                                $_DJCK.shift();
                                var $_DJFQ = $_DJCK[0];
                                a[$_DJDc(33)][$_DJDc(72)](this), this[$_DJEx(44)]();
                            }, process: function (e) {
                                var $_DJIy = PaLDJ.$_CS, $_DJHs = ["$_EABM"].concat($_DJIy), $_DJJF = $_DJHs[1];
                                $_DJHs.shift();
                                var $_EAAx = $_DJHs[0];
                                return this[$_DJJF(17)](e), this[$_DJJF(13)]();
                            }, finalize: function (e) {
                                var $_EADl = PaLDJ.$_CS, $_EACf = ["$_EAGE"].concat($_EADl), $_EAEg = $_EACf[1];
                                $_EACf.shift();
                                var $_EAFy = $_EACf[0];
                                return e && this[$_EADl(17)](e), this[$_EAEg(92)]();
                            }, keySize: 4, ivSize: 4, $_CCU: 1, $_CH_: 2, $_CIL: function (c) {
                                var $_EAIL = PaLDJ.$_CS, $_EAHA = ["$_EBBH"].concat($_EAIL), $_EAJW = $_EAHA[1];
                                $_EAHA.shift();
                                var $_EBAa = $_EAHA[0];
                                return {
                                    encrypt: function (e, t, n) {
                                        var $_EBDu = PaLDJ.$_CS, $_EBCr = ["$_EBGr"].concat($_EBDu), $_EBEY = $_EBCr[1];
                                        $_EBCr.shift();
                                        var $_EBFl = $_EBCr[0];
                                        t = u[$_EBEY(64)](t), n && n[$_EBDu(79)] || ((n = n || {})[$_EBDu(79)] = u[$_EBDu(64)]($_EBDu(93)));
                                        for (var r = m[$_EBDu(87)](c, e, t, n), o = r[$_EBEY(70)][$_EBEY(37)], i = r[$_EBDu(70)][$_EBEY(31)], s = [], a = 0; a < i; a++) {
                                            var _ = o[a >>> 2] >>> 24 - a % 4 * 8 & 255;
                                            s[$_EBDu(2)](_);
                                        }
                                        return s;
                                    }, encrypt1: function (e, t, n) {
                                        var $_EBIk = PaLDJ.$_CS, $_EBHQ = ["$_ECBf"].concat($_EBIk), $_EBJB = $_EBHQ[1];
                                        $_EBHQ.shift();
                                        var $_ECAB = $_EBHQ[0];
                                        t = u[$_EBJB(64)](t), n && n[$_EBIk(79)] || ((n = n || {})[$_EBJB(79)] = u[$_EBJB(64)]($_EBIk(93)));
                                        for (var r = m[$_EBJB(87)](c, e, t, n), o = r[$_EBIk(70)][$_EBIk(37)], i = r[$_EBIk(70)][$_EBJB(31)], s = [], a = 0; a < i; a++) {
                                            var _ = o[a >>> 2] >>> 24 - a % 4 * 8 & 255;
                                            s[$_EBJB(2)](_);
                                        }
                                        return s;
                                    }
                                };
                            }
                        }), p = t[$_DADR(90)] = {}, h = r[$_DAEj(76)] = o[$_DAEj(50)]({
                            createEncryptor: function (e, t) {
                                var $_ECDm = PaLDJ.$_CS, $_ECCz = ["$_ECGI"].concat($_ECDm), $_ECEs = $_ECCz[1];
                                $_ECCz.shift();
                                var $_ECFy = $_ECCz[0];
                                return this[$_ECEs(85)][$_ECDm(24)](e, t);
                            }, init: function (e, t) {
                                var $_ECId = PaLDJ.$_CS, $_ECHk = ["$_EDBJ"].concat($_ECId), $_ECJm = $_ECHk[1];
                                $_ECHk.shift();
                                var $_EDAr = $_ECHk[0];
                                this[$_ECJm(45)] = e, this[$_ECId(7)] = t;
                            }
                        }), f = p[$_DAEj(98)] = ((e = h[$_DADR(50)]())[$_DADR(85)] = e[$_DAEj(50)]({
                            processBlock: function (e, t) {
                                var $_EDDr = PaLDJ.$_CS, $_EDCN = ["$_EDGZ"].concat($_EDDr), $_EDEP = $_EDCN[1];
                                $_EDCN.shift();
                                var $_EDFP = $_EDCN[0];
                                var n = this[$_EDEP(45)], r = n[$_EDEP(84)];
                                (function s(e, t, n) {
                                    var $_EDIt = PaLDJ.$_CS, $_EDHv = ["$_EEBN"].concat($_EDIt), $_EDJo = $_EDHv[1];
                                    $_EDHv.shift();
                                    var $_EEAO = $_EDHv[0];
                                    var r = this[$_EDJo(7)];
                                    if (r) {
                                        var o = r;
                                        this[$_EDJo(7)] = undefined;
                                    } else var o = this[$_EDIt(30)];
                                    for (var i = 0; i < n; i++) e[t + i] ^= o[i];
                                }[$_EDDr(72)](this, e, t, r), n[$_EDEP(39)](e, t), this[$_EDDr(30)] = e[$_EDDr(67)](t, t + r));
                            }
                        }), e), d = (t[$_DADR(22)] = {})[$_DAEj(8)] = {
                            pad: function (e, t) {
                                var $_EEDv = PaLDJ.$_CS, $_EECk = ["$_EEGS"].concat($_EEDv), $_EEEG = $_EECk[1];
                                $_EECk.shift();
                                var $_EEFv = $_EECk[0];
                                for (var n = 4 * t, r = n - e[$_EEDv(31)] % n, o = r << 24 | r << 16 | r << 8 | r, i = [], s = 0; s < r; s += 4) i[$_EEEG(2)](o);
                                var a = l[$_EEEG(24)](i, r);
                                e[$_EEEG(27)](a);
                            }
                        }, g = r[$_DAEj(20)] = c[$_DADR(50)]({
                            cfg: c[$_DADR(46)][$_DAEj(50)]({mode: f, padding: d}), reset: function () {
                                var $_EEIx = PaLDJ.$_CS, $_EEHS = ["$_EFBI"].concat($_EEIx), $_EEJU = $_EEHS[1];
                                $_EEHS.shift();
                                var $_EFAe = $_EEHS[0];
                                c[$_EEIx(33)][$_EEIx(72)](this);
                                var e = this[$_EEJU(46)], t = e[$_EEIx(79)], n = e[$_EEIx(90)];
                                if (this[$_EEIx(73)] == this[$_EEIx(25)]) var r = n[$_EEIx(51)];
                                this[$_EEIx(40)] && this[$_EEIx(40)][$_EEJU(60)] == r ? this[$_EEJU(40)][$_EEJU(65)](this, t && t[$_EEJU(37)]) : (this[$_EEJU(40)] = r[$_EEJU(72)](n, this, t && t[$_EEJU(37)]), this[$_EEJU(40)][$_EEJU(60)] = r);
                            }, $_CBv: function (e, t) {
                                var $_EFDG = PaLDJ.$_CS, $_EFCW = ["$_EFGO"].concat($_EFDG), $_EFEX = $_EFCW[1];
                                $_EFCW.shift();
                                var $_EFFR = $_EFCW[0];
                                this[$_EFDG(40)][$_EFEX(23)](e, t);
                            }, $_CG_: function () {
                                var $_EFIX = PaLDJ.$_CS, $_EFHa = ["$_EGBd"].concat($_EFIX), $_EFJd = $_EFHa[1];
                                $_EFHa.shift();
                                var $_EGAC = $_EFHa[0];
                                var e = this[$_EFIX(46)][$_EFJd(59)];
                                if (this[$_EFJd(73)] == this[$_EFIX(25)]) {
                                    e[$_EFJd(22)](this[$_EFIX(62)], this[$_EFIX(84)]);
                                    var t = this[$_EFIX(13)](true);
                                }
                                return t;
                            }, blockSize: 4
                        }), v = r[$_DAEj(5)] = o[$_DAEj(50)]({
                            init: function (e) {
                                var $_EGDp = PaLDJ.$_CS, $_EGCD = ["$_EGGz"].concat($_EGDp), $_EGEg = $_EGCD[1];
                                $_EGCD.shift();
                                var $_EGFh = $_EGCD[0];
                                this[$_EGEg(15)](e);
                            }
                        }), m = r[$_DADR(32)] = o[$_DAEj(50)]({
                            cfg: o[$_DADR(50)](), encrypt: function (e, t, n, r) {
                                var $_EGIL = PaLDJ.$_CS, $_EGHm = ["$_EHBF"].concat($_EGIL), $_EGJm = $_EGHm[1];
                                $_EGHm.shift();
                                var $_EHAY = $_EGHm[0];
                                r = this[$_EGIL(46)][$_EGJm(50)](r);
                                var o = e[$_EGJm(51)](n, r), i = o[$_EGIL(78)](t), s = o[$_EGJm(46)];
                                return v[$_EGIL(24)]({
                                    ciphertext: i,
                                    key: n,
                                    iv: s[$_EGIL(79)],
                                    algorithm: e,
                                    mode: s[$_EGJm(90)],
                                    padding: s[$_EGIL(59)],
                                    blockSize: e[$_EGIL(84)],
                                    formatter: r[$_EGJm(0)]
                                });
                            }
                        }), x = [], w = [], y = [], b = [], E = [], C = [], k = [], S = [], T = [], D = [];
                        !function () {
                            var $_EHDl = PaLDJ.$_CS, $_EHCz = ["$_EHGB"].concat($_EHDl), $_EHEv = $_EHCz[1];
                            $_EHCz.shift();
                            var $_EHFb = $_EHCz[0];
                            for (var e = [], t = 0; t < 256; t++) e[t] = t < 128 ? t << 1 : t << 1 ^ 283;
                            var n = 0, r = 0;
                            for (t = 0; t < 256; t++) {
                                var o = r ^ r << 1 ^ r << 2 ^ r << 3 ^ r << 4;
                                o = o >>> 8 ^ 255 & o ^ 99, x[n] = o;
                                var i = e[w[o] = n], s = e[i], a = e[s], _ = 257 * e[o] ^ 16843008 * o;
                                y[n] = _ << 24 | _ >>> 8, b[n] = _ << 16 | _ >>> 16, E[n] = _ << 8 | _ >>> 24, C[n] = _;
                                _ = 16843009 * a ^ 65537 * s ^ 257 * i ^ 16843008 * n;
                                k[o] = _ << 24 | _ >>> 8, S[o] = _ << 16 | _ >>> 16, T[o] = _ << 8 | _ >>> 24, D[o] = _, n ? (n = i ^ e[e[e[a ^ i]]], r ^= e[e[r]]) : n = r = 1;
                            }
                        }();
                        var A = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], O = _[$_DADR(58)] = g[$_DAEj(50)]({
                            $_CFR: function () {
                                var $_EHIA = PaLDJ.$_CS, $_EHHu = ["$_EIBz"].concat($_EHIA), $_EHJY = $_EHHu[1];
                                $_EHHu.shift();
                                var $_EIAc = $_EHHu[0];
                                if (!this[$_EHJY(57)] || this[$_EHJY(86)] !== this[$_EHJY(3)]) {
                                    for (var e = this[$_EHJY(86)] = this[$_EHIA(3)], t = e[$_EHIA(37)], n = e[$_EHIA(31)] / 4, r = 4 * (1 + (this[$_EHIA(57)] = 6 + n)), o = this[$_EHJY(56)] = [], i = 0; i < r; i++) if (i < n) o[i] = t[i]; else {
                                        var s = o[i - 1];
                                        i % n ? 6 < n && i % n == 4 && (s = x[s >>> 24] << 24 | x[s >>> 16 & 255] << 16 | x[s >>> 8 & 255] << 8 | x[255 & s]) : (s = x[(s = s << 8 | s >>> 24) >>> 24] << 24 | x[s >>> 16 & 255] << 16 | x[s >>> 8 & 255] << 8 | x[255 & s], s ^= A[i / n | 0] << 24), o[i] = o[i - n] ^ s;
                                    }
                                    for (var a = this[$_EHIA(94)] = [], _ = 0; _ < r; _++) {
                                        i = r - _;
                                        if (_ % 4) s = o[i]; else s = o[i - 4];
                                        a[_] = _ < 4 || i <= 4 ? s : k[x[s >>> 24]] ^ S[x[s >>> 16 & 255]] ^ T[x[s >>> 8 & 255]] ^ D[x[255 & s]];
                                    }
                                }
                            }, encryptBlock: function (e, t) {
                                var $_EIDB = PaLDJ.$_CS, $_EICc = ["$_EIGX"].concat($_EIDB), $_EIEr = $_EICc[1];
                                $_EICc.shift();
                                var $_EIFH = $_EICc[0];
                                this[$_EIEr(42)](e, t, this[$_EIEr(56)], y, b, E, C, x);
                            }, $_DIw: function (e, t, n, r, o, i, s, a) {
                                var $_EIIV = PaLDJ.$_CS, $_EIHr = ["$_EJBD"].concat($_EIIV), $_EIJd = $_EIHr[1];
                                $_EIHr.shift();
                                var $_EJAJ = $_EIHr[0];
                                for (var _ = this[$_EIIV(57)], c = e[t] ^ n[0], l = e[t + 1] ^ n[1], u = e[t + 2] ^ n[2], p = e[t + 3] ^ n[3], h = 4, f = 1; f < _; f++) {
                                    var d = r[c >>> 24] ^ o[l >>> 16 & 255] ^ i[u >>> 8 & 255] ^ s[255 & p] ^ n[h++],
                                        g = r[l >>> 24] ^ o[u >>> 16 & 255] ^ i[p >>> 8 & 255] ^ s[255 & c] ^ n[h++],
                                        v = r[u >>> 24] ^ o[p >>> 16 & 255] ^ i[c >>> 8 & 255] ^ s[255 & l] ^ n[h++],
                                        m = r[p >>> 24] ^ o[c >>> 16 & 255] ^ i[l >>> 8 & 255] ^ s[255 & u] ^ n[h++];
                                    c = d, l = g, u = v, p = m;
                                }
                                d = (a[c >>> 24] << 24 | a[l >>> 16 & 255] << 16 | a[u >>> 8 & 255] << 8 | a[255 & p]) ^ n[h++], g = (a[l >>> 24] << 24 | a[u >>> 16 & 255] << 16 | a[p >>> 8 & 255] << 8 | a[255 & c]) ^ n[h++], v = (a[u >>> 24] << 24 | a[p >>> 16 & 255] << 16 | a[c >>> 8 & 255] << 8 | a[255 & l]) ^ n[h++], m = (a[p >>> 24] << 24 | a[c >>> 16 & 255] << 16 | a[l >>> 8 & 255] << 8 | a[255 & u]) ^ n[h++];
                                e[t] = d, e[t + 1] = g, e[t + 2] = v, e[t + 3] = m;
                            }, keySize: 8
                        });
                        return t[$_DADR(58)] = g[$_DADR(95)](O), t[$_DAEj(58)];
                        break;
                }
            }
        }

        function $_BEp(e, t, n) {
            var $_DCGEu = PaLDJ.$_Dz()[0][6];
            for (; $_DCGEu !== PaLDJ.$_Dz()[0][5];) {
                switch ($_DCGEu) {
                    case PaLDJ.$_Dz()[4][6]:
                        var r = e[$_DAEj(99)]($_DAEj(82)), o = r[0] || $_DADR(53),
                            i = new $_DJm(r)[$_DADR(69)](1)[$_DADR(18)](function (e) {
                                var $_EJDr = PaLDJ.$_CS, $_EJCV = ["$_EJGU"].concat($_EJDr), $_EJEf = $_EJCV[1];
                                $_EJCV.shift();
                                var $_EJFM = $_EJCV[0];
                                return B + e;
                            })[$_DAEj(47)]($_DAEj(52)), s = new le(o);
                        return n($_DADR(82) + r[1], s), $_DADR(75) == o ? s[$_DAEj(34)]({
                            type: $_DADR(19),
                            name: i
                        }) : s[$_DADR(1)]({className: i}), K(t) ? s[$_DADR(34)]({textContent: t}) : new ce(t)[$_DAEj(97)](function (e, t) {
                            var $_EJIO = PaLDJ.$_CS, $_EJHh = ["$_FABS"].concat($_EJIO), $_EJJt = $_EJHh[1];
                            $_EJHh.shift();
                            var $_FAAv = $_EJHh[0];
                            s[$_EJIO(28)]($_BEp(e, t, n));
                        }), s;
                        break;
                }
            }
        }

        function $_BDL(e) {
            var $_DCGFX = PaLDJ.$_Dz()[0][6];
            for (; $_DCGFX !== PaLDJ.$_Dz()[4][4];) {
                switch ($_DCGFX) {
                    case PaLDJ.$_Dz()[4][6]:
                        var t = e[$_DADR(36)], n = {
                            "zh-tw": {
                                ready: $_DAEj(96),
                                fullpage: $_DADR(88),
                                success: $_DADR(43),
                                reset: $_DAEj(153),
                                next: $_DAEj(198),
                                next_ready: $_DADR(129),
                                goto_homepage: $_DADR(141),
                                goto_confirm: $_DAEj(127),
                                goto_cancel: $_DAEj(169),
                                loading_content: $_DADR(137),
                                success_title: $_DAEj(170),
                                error_title: $_DADR(161),
                                copyright: $_DAEj(126),
                                refresh_page: $_DAEj(146),
                                error_content: $_DAEj(153),
                                error: $_DAEj(136)
                            },
                            ja: {
                                ready: $_DADR(183),
                                fullpage: $_DADR(180),
                                success: $_DAEj(110),
                                reset: $_DAEj(138),
                                next: $_DADR(109),
                                next_ready: $_DAEj(164),
                                goto_homepage: $_DAEj(188),
                                goto_confirm: $_DAEj(117),
                                goto_cancel: $_DAEj(151),
                                loading_content: $_DAEj(180),
                                success_title: $_DADR(110),
                                error_title: $_DAEj(162),
                                copyright: $_DAEj(126),
                                refresh_page: $_DADR(154),
                                error_content: $_DAEj(138),
                                error: $_DAEj(175)
                            },
                            ko: {
                                ready: $_DAEj(185),
                                fullpage: $_DADR(106),
                                success: $_DADR(184),
                                reset: $_DAEj(179),
                                next: $_DAEj(196),
                                next_ready: $_DADR(128),
                                goto_homepage: $_DADR(190),
                                goto_confirm: $_DAEj(108),
                                goto_cancel: $_DAEj(178),
                                loading_content: $_DAEj(106),
                                success_title: $_DAEj(184),
                                error_title: $_DADR(105),
                                copyright: $_DADR(126),
                                refresh_page: $_DADR(197),
                                error_content: $_DADR(179),
                                error: $_DAEj(176)
                            },
                            id: {
                                ready: $_DADR(156),
                                fullpage: $_DAEj(159),
                                success: $_DAEj(199),
                                reset: $_DAEj(118),
                                next: $_DADR(157),
                                next_ready: $_DAEj(102),
                                goto_homepage: $_DADR(152),
                                goto_confirm: $_DADR(117),
                                goto_cancel: $_DADR(191),
                                loading_content: $_DAEj(159),
                                success_title: $_DAEj(199),
                                error_title: $_DAEj(103),
                                copyright: $_DADR(126),
                                refresh_page: $_DADR(143),
                                error_content: $_DADR(118),
                                error: $_DADR(125)
                            },
                            ru: {
                                ready: $_DAEj(171),
                                fullpage: $_DADR(165),
                                success: $_DADR(140),
                                reset: $_DADR(194),
                                next: $_DAEj(168),
                                next_ready: $_DAEj(189),
                                goto_homepage: $_DADR(182),
                                goto_confirm: $_DADR(117),
                                goto_cancel: $_DAEj(173),
                                loading_content: $_DAEj(165),
                                success_title: $_DAEj(140),
                                error_title: $_DAEj(172),
                                copyright: $_DADR(126),
                                refresh_page: $_DADR(101),
                                error_content: $_DADR(194),
                                error: $_DADR(177)
                            },
                            ar: {
                                ready: $_DADR(160),
                                fullpage: $_DADR(122),
                                success: $_DADR(134),
                                reset: $_DAEj(149),
                                next: $_DAEj(122),
                                next_ready: $_DAEj(116),
                                goto_homepage: $_DADR(130),
                                goto_confirm: $_DADR(115),
                                goto_cancel: $_DAEj(124),
                                loading_content: $_DADR(186),
                                success_title: $_DAEj(134),
                                error_title: $_DADR(167),
                                copyright: $_DAEj(126),
                                refresh_page: $_DAEj(150),
                                error_content: $_DADR(149),
                                error: $_DAEj(193)
                            },
                            es: {
                                ready: $_DAEj(148),
                                fullpage: $_DADR(142),
                                success: $_DADR(121),
                                reset: $_DAEj(104),
                                next: $_DADR(174),
                                next_ready: $_DADR(133),
                                goto_homepage: $_DADR(123),
                                goto_confirm: $_DADR(181),
                                goto_cancel: $_DADR(147),
                                loading_content: $_DAEj(142),
                                success_title: $_DADR(121),
                                error_title: $_DADR(120),
                                copyright: $_DAEj(126),
                                refresh_page: $_DAEj(111),
                                error_content: $_DAEj(104),
                                error: $_DAEj(166)
                            },
                            "pt-pt": {
                                ready: $_DAEj(155),
                                fullpage: $_DADR(192),
                                success: $_DAEj(139),
                                reset: $_DAEj(114),
                                next: $_DAEj(107),
                                next_ready: $_DAEj(163),
                                goto_homepage: $_DAEj(135),
                                goto_confirm: $_DADR(117),
                                goto_cancel: $_DAEj(147),
                                loading_content: $_DAEj(192),
                                success_title: $_DAEj(139),
                                error_title: $_DADR(158),
                                copyright: $_DADR(126),
                                refresh_page: $_DADR(187),
                                error_content: $_DAEj(114),
                                error: $_DADR(100)
                            },
                            fr: {
                                ready: $_DADR(132),
                                fullpage: $_DAEj(113),
                                success: $_DAEj(119),
                                reset: $_DAEj(195),
                                next: $_DAEj(144),
                                next_ready: $_DAEj(112),
                                goto_homepage: $_DADR(131),
                                goto_confirm: $_DADR(117),
                                goto_cancel: $_DADR(145),
                                loading_content: $_DADR(113),
                                success_title: $_DAEj(119),
                                error_title: $_DADR(217),
                                copyright: $_DAEj(126),
                                refresh_page: $_DAEj(203),
                                error_content: $_DADR(195),
                                error: $_DADR(226)
                            },
                            de: {
                                ready: $_DAEj(228),
                                fullpage: $_DAEj(227),
                                success: $_DADR(238),
                                reset: $_DADR(252),
                                next: $_DAEj(213),
                                next_ready: $_DAEj(210),
                                goto_homepage: $_DAEj(264),
                                goto_confirm: $_DADR(117),
                                goto_cancel: $_DAEj(241),
                                loading_content: $_DADR(227),
                                success_title: $_DAEj(238),
                                error_title: $_DAEj(256),
                                copyright: $_DAEj(126),
                                refresh_page: $_DADR(251),
                                error_content: $_DAEj(252),
                                error: $_DAEj(289)
                            },
                            "zh-cn": {
                                ready: $_DADR(298),
                                fullpage: $_DAEj(214),
                                success: $_DAEj(295),
                                reset: $_DAEj(229),
                                next: $_DADR(233),
                                next_ready: $_DADR(291),
                                goto_homepage: $_DADR(250),
                                goto_confirm: $_DAEj(127),
                                goto_cancel: $_DAEj(169),
                                loading_content: $_DAEj(287),
                                success_title: $_DADR(205),
                                error_title: $_DAEj(288),
                                copyright: $_DAEj(234),
                                refresh_page: $_DAEj(271),
                                error_content: $_DAEj(274),
                                error: $_DAEj(245)
                            },
                            en: {
                                ready: $_DAEj(279),
                                fullpage: $_DADR(285),
                                success: $_DAEj(204),
                                error: $_DADR(222),
                                reset: $_DAEj(243),
                                next: $_DAEj(293),
                                next_ready: $_DADR(269),
                                goto_homepage: $_DAEj(207),
                                goto_confirm: $_DAEj(215),
                                goto_cancel: $_DADR(242),
                                loading_content: $_DAEj(285),
                                success_title: $_DADR(272),
                                error_title: $_DADR(237),
                                error_content: $_DAEj(243),
                                copyright: $_DADR(216),
                                refresh_page: $_DAEj(209)
                            },
                            "zh-hk": {
                                ready: $_DADR(276),
                                fullpage: $_DAEj(236),
                                success: $_DADR(43),
                                error: $_DAEj(212),
                                reset: $_DADR(254),
                                next: $_DADR(206),
                                next_ready: $_DAEj(129),
                                goto_homepage: $_DADR(292),
                                goto_confirm: $_DADR(127),
                                goto_cancel: $_DAEj(169),
                                loading_content: $_DAEj(240),
                                success_title: $_DAEj(284),
                                error_title: $_DADR(266),
                                error_content: $_DADR(211),
                                copyright: $_DAEj(294),
                                refresh_page: $_DAEj(290)
                            }
                        };
                        for (var r in t) if ($_DAEj(9) == typeof t && t[$_DADR(12)](r)) return t;
                        $_DCGFX = PaLDJ.$_Dz()[4][5];
                        break;
                    case PaLDJ.$_Dz()[0][5]:
                        return e && e[$_DAEj(258)] && -1 < new $_DJm([$_DAEj(275), $_DAEj(249), $_DAEj(286), $_DAEj(280), $_DAEj(247), $_DAEj(283), $_DAEj(239), $_DAEj(265), $_DADR(277), $_DADR(248), $_DADR(220), $_DAEj(260), $_DADR(273)])[$_DADR(282)](e[$_DADR(225)]) ? n[e[$_DADR(225)]] : n[$_DADR(249)];
                        break;
                }
            }
        }

        function $_BCL(e, o) {
            var $_DCGGq = PaLDJ.$_Dz()[0][6];
            for (; $_DCGGq !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DCGGq) {
                    case PaLDJ.$_Dz()[2][6]:
                        if (o || (o = e[$_DAEj(11)]), o < 1) return e;
                        if (o > e[$_DAEj(11)]) return e;
                        var t = function s(e) {
                            var $_FADN = PaLDJ.$_CS, $_FACi = ["$_FAGV"].concat($_FADN), $_FAEK = $_FACi[1];
                            $_FACi.shift();
                            var $_FAFK = $_FACi[0];
                            for (var t = [], n = 0; n < e; n++) t[n] = 1;
                            return t[0] = 1, t;
                        }(o), i = (function a(e, t) {
                            var $_FAIO = PaLDJ.$_CS, $_FAHN = ["$_FBBC"].concat($_FAIO), $_FAJJ = $_FAHN[1];
                            $_FAHN.shift();
                            var $_FBAO = $_FAHN[0];
                            if (e < t) return 0;
                            return r(e, t) / r(t, t);
                        }(e[$_DAEj(11)], o), e[$_DADR(11)]), n = e[$_DADR(67)]();

                    function r(e, t) {
                        var $_DCGHo = PaLDJ.$_Dz()[0][6];
                        for (; $_DCGHo !== PaLDJ.$_Dz()[2][5];) {
                            switch ($_DCGHo) {
                                case PaLDJ.$_Dz()[0][6]:
                                    var n = 1;
                                    while (t--) n *= e--;
                                    return n;
                                    break;
                            }
                        }
                    }

                        return n[$_DAEj(65)] = function () {
                            var $_FBDC = PaLDJ.$_CS, $_FBCF = ["$_FBGL"].concat($_FBDC), $_FBED = $_FBCF[1];
                            $_FBCF.shift();
                            var $_FBFC = $_FBCF[0];
                            this[$_FBDC(261)] = t[$_FBED(27)]();
                        }, n[$_DAEj(257)] = function () {
                            var $_FBIN = PaLDJ.$_CS, $_FBHE = ["$_FCBl"].concat($_FBIN), $_FBJf = $_FBHE[1];
                            $_FBHE.shift();
                            var $_FCAM = $_FBHE[0];
                            if (!(this[$_FBIN(261)][$_FBJf(11)] > i)) {
                                for (var e = 0, t = this[$_FBIN(261)], n = [], r = 0; r < t[$_FBJf(11)]; r++, e++) t[r] && (n[n[$_FBJf(11)]] = this[e]);
                                return function _(e, t) {
                                    var $_FCDk = PaLDJ.$_CS, $_FCCi = ["$_FCGt"].concat($_FCDk), $_FCEw = $_FCCi[1];
                                    $_FCCi.shift();
                                    var $_FCFL = $_FCCi[0];
                                    var n = e, r = t, o = 0;
                                    for (o = n[$_FCDk(11)] - 1; 0 <= o; o--) {
                                        if (1 != n[o]) break;
                                        r--;
                                    }
                                    if (0 == r) {
                                        n[n[$_FCDk(11)]] = 1;
                                        for (var i = n[$_FCDk(11)] - 2; 0 <= i; i--) n[i] = i < t - 1 ? 1 : 0;
                                    } else {
                                        for (var s = -1, a = -1, o = 0; o < n[$_FCEw(11)]; o++) if (0 == n[o] && -1 != s && (a = o), 1 == n[o] && (s = o), -1 != a && -1 != s) {
                                            n[a] = 1, n[s] = 0;
                                            break;
                                        }
                                        r = t;
                                        for (var o = n[$_FCDk(11)] - 1; s <= o; o--) 1 == n[o] && r--;
                                        for (var o = 0; o < s; o++) n[o] = o < r ? 1 : 0;
                                    }
                                    return n;
                                }(this[$_FBJf(261)], o), n;
                            }
                        }, n[$_DAEj(65)](), n;
                        break;
                }
            }
        }

        function $_BBU(e) {
            var $_DCGIp = PaLDJ.$_Dz()[4][6];
            for (; $_DCGIp !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DCGIp) {
                    case PaLDJ.$_Dz()[0][6]:
                        try {
                            return (e / ve)[$_DAEj(202)](4) + ge;
                        } catch (t) {
                            return e + $_DAEj(268);
                        }
                        $_DCGIp = PaLDJ.$_Dz()[0][5];
                        break;
                }
            }
        }

        function $_BAE() {
            var $_DCGJW = PaLDJ.$_Dz()[2][6];
            for (; $_DCGJW !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DCGJW) {
                    case PaLDJ.$_Dz()[0][6]:
                        return ($_DAEj(223) === pe[$_DADR(270)] ? pe[$_DADR(218)] : pe[$_DADR(297)])[$_DAEj(201)](0, 2);
                        break;
                }
            }
        }

        function $_JM(e) {
            var $_DCHAH = PaLDJ.$_Dz()[4][6];
            for (; $_DCHAH !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DCHAH) {
                    case PaLDJ.$_Dz()[4][6]:
                        if (!e) return $_DADR(259);
                        var t = e[$_DAEj(231)](), n = t[$_DAEj(99)]($_DADR(296)), r = n[0];
                        if (3 === n[$_DAEj(11)]) {
                            var o = n[2];
                            $_DADR(224) === $_Ib(n[1]) ? o = $_DADR(253) : $_DADR(232) === $_Ib(n[1]) && (o = $_DADR(255)), t = r + o;
                        }
                        return t;
                        break;
                }
            }
        }

        function $_Ib(e) {
            var $_DCHBN = PaLDJ.$_Dz()[2][6];
            for (; $_DCHBN !== PaLDJ.$_Dz()[2][5];) {
                switch ($_DCHBN) {
                    case PaLDJ.$_Dz()[2][6]:
                        return String[$_DADR(91)][$_DADR(267)] ? String[$_DAEj(91)][$_DADR(267)][$_DAEj(72)](e) : e[$_DADR(299)](/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, $_DADR(253));
                        break;
                }
            }
        }

        function $_Ht() {
            var $_DCHCN = PaLDJ.$_Dz()[2][6];
            for (; $_DCHCN !== PaLDJ.$_Dz()[0][4];) {
                switch ($_DCHCN) {
                    case PaLDJ.$_Dz()[0][6]:
                        var e = new Date, t = e[$_DADR(244)](), n = e[$_DAEj(235)]() + 1, r = e[$_DADR(230)](),
                            o = e[$_DAEj(262)](), i = e[$_DAEj(263)](), s = e[$_DAEj(221)]();
                        $_DCHCN = PaLDJ.$_Dz()[0][5];
                        break;
                    case PaLDJ.$_Dz()[0][5]:
                        return 1 <= n && n <= 9 && (n = $_DADR(246) + n), 0 <= r && r <= 9 && (r = $_DAEj(246) + r), 0 <= o && o <= 9 && (o = $_DADR(246) + o), 0 <= i && i <= 9 && (i = $_DAEj(246) + i), 0 <= s && s <= 9 && (s = $_DAEj(246) + s), t + $_DADR(296) + n + $_DADR(296) + r + $_DADR(52) + o + $_DAEj(281) + i + $_DAEj(281) + s;
                        break;
                }
            }
        }

        function $_GM() {
            var $_DCHDw = PaLDJ.$_Dz()[2][6];
            for (; $_DCHDw !== PaLDJ.$_Dz()[2][5];) {
                switch ($_DCHDw) {
                    case PaLDJ.$_Dz()[2][6]:
                        return (new Date)[$_DAEj(208)]();
                        break;
                }
            }
        }

        function $_Fc() {
            var $_DCHEU = PaLDJ.$_Dz()[0][6];
            for (; $_DCHEU !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DCHEU) {
                    case PaLDJ.$_Dz()[2][6]:
                        var n = {};
                        return function (e, t) {
                            var $_FCIh = PaLDJ.$_CS, $_FCHD = ["$_FDBR"].concat($_FCIh), $_FCJj = $_FCHD[1];
                            $_FCHD.shift();
                            var $_FDAy = $_FCHD[0];
                            if (!t) return n[e[$_FCIh(299)](B, $_FCIh(253))];
                            n[e] = t;
                        };
                        break;
                }
            }
        }

        function $_EA() {
            var $_DCHFS = PaLDJ.$_Dz()[0][6];
            for (; $_DCHFS !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DCHFS) {
                    case PaLDJ.$_Dz()[0][6]:
                        return parseInt(1e4 * Math[$_DAEj(278)]()) + (new Date)[$_DADR(219)]();
                        break;
                }
            }
        }

        function Q(e) {
            var $_DCHGp = PaLDJ.$_Dz()[4][6];
            for (; $_DCHGp !== PaLDJ.$_Dz()[2][5];) {
                switch ($_DCHGp) {
                    case PaLDJ.$_Dz()[0][6]:
                        return $_DAEj(200) == typeof e;
                        break;
                }
            }
        }

        function Z(e) {
            var $_DCHHf = PaLDJ.$_Dz()[4][6];
            for (; $_DCHHf !== PaLDJ.$_Dz()[0][5];) {
                switch ($_DCHHf) {
                    case PaLDJ.$_Dz()[2][6]:
                        return $_DADR(378) == typeof e;
                        break;
                }
            }
        }

        function K(e) {
            var $_DCHIX = PaLDJ.$_Dz()[4][6];
            for (; $_DCHIX !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DCHIX) {
                    case PaLDJ.$_Dz()[0][6]:
                        return $_DAEj(10) == typeof e;
                        break;
                }
            }
        }

        function J(e) {
            var $_DCHJX = PaLDJ.$_Dz()[2][6];
            for (; $_DCHJX !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DCHJX) {
                    case PaLDJ.$_Dz()[4][6]:
                        return $_DADR(347) == typeof e;
                        break;
                }
            }
        }

        function G(n) {
            var $_DCIAn = PaLDJ.$_Dz()[0][6];
            for (; $_DCIAn !== PaLDJ.$_Dz()[0][5];) {
                switch ($_DCIAn) {
                    case PaLDJ.$_Dz()[2][6]:
                        return console && console[$_DAEj(307)] && console[$_DADR(307)](n), new V(function (e, t) {
                            var $_FDDn = PaLDJ.$_CS, $_FDCu = ["$_FDGi"].concat($_FDDn), $_FDED = $_FDCu[1];
                            $_FDCu.shift();
                            var $_FDFU = $_FDCu[0];
                            t(n);
                        });
                        break;
                }
            }
        }

        function z(e, t, n) {
            var $_DCIBq = PaLDJ.$_Dz()[4][6];
            for (; $_DCIBq !== PaLDJ.$_Dz()[0][4];) {
                switch ($_DCIBq) {
                    case PaLDJ.$_Dz()[4][6]:
                        var r = t[$_DADR(370)], o = (t[$_DADR(391)], $_DAEj(371));
                        $_DCIBq = PaLDJ.$_Dz()[2][5];
                        break;
                    case PaLDJ.$_Dz()[0][5]:
                        return n && (o = $_DADR(366), e[$_DADR(385)] = n, r[$_DAEj(357)] = $_DAEj(340), r[$_DADR(382)] = e[$_DAEj(382)], l(R(r, $_DADR(342) + (e[$_DAEj(385)] && e[$_DAEj(385)][$_DADR(317)])), r[$_DAEj(327)], r[$_DADR(328)])), t[$_DADR(301)](e), new Error(o + $_DADR(351) + (e && e[$_DAEj(382)]));
                        break;
                }
            }
        }

        function F(e, t, n) {
            var $_DCICH = PaLDJ.$_Dz()[2][6];
            for (; $_DCICH !== PaLDJ.$_Dz()[2][4];) {
                switch ($_DCICH) {
                    case PaLDJ.$_Dz()[2][6]:
                        var r = t[$_DADR(370)];
                        $_DCICH = PaLDJ.$_Dz()[4][5];
                        break;
                    case PaLDJ.$_Dz()[4][5]:
                        return r[$_DADR(357)] = e[$_DAEj(357)], l(R(r, n), r[$_DADR(327)], r[$_DAEj(328)]), z({
                            msg: (e = e || {})[$_DADR(307)],
                            code: e[$_DAEj(357)],
                            error_code: e[$_DAEj(357)],
                            user_error: e[$_DADR(365)]
                        }, t);
                        break;
                }
            }
        }

        function I(e, t, n) {
            var $_DCIDZ = PaLDJ.$_Dz()[4][6];
            for (; $_DCIDZ !== PaLDJ.$_Dz()[0][5];) {
                switch ($_DCIDZ) {
                    case PaLDJ.$_Dz()[0][6]:
                        var r = {
                            api_appendTo: {msg: $_DAEj(381), code: $_DAEj(388)},
                            api_bindOn: {msg: $_DADR(345), code: $_DADR(359)},
                            api_onXxx: {msg: $_DAEj(390), code: $_DAEj(369)},
                            config_gt: {msg: $_DADR(316), code: $_DADR(349)},
                            url_get: {msg: $_DAEj(338), code: $_DADR(325)},
                            url_ajax: {msg: $_DADR(330), code: $_DADR(367)},
                            url_refresh: {msg: $_DAEj(398), code: $_DADR(354)},
                            url_skin: {msg: $_DADR(326), code: $_DADR(363)},
                            url_picture: {msg: $_DADR(337), code: $_DADR(309)},
                            url_reset: {msg: $_DADR(355), code: $_DADR(396)},
                            js_not_exist: {msg: $_DADR(364), code: $_DAEj(387)},
                            js_unload: {msg: $_DADR(313), code: $_DAEj(311)},
                            config_area: {msg: $_DADR(368), code: $_DAEj(362)},
                            server_forbidden: {msg: $_DAEj(393), code: $_DAEj(312)},
                            config_lack: {msg: $_DAEj(373), code: $_DAEj(377)},
                            url_voice: {msg: $_DADR(376), code: $_DAEj(334)},
                            user_callback: {msg: $_DADR(343), code: $_DAEj(304)},
                            unknown: {msg: $_DAEj(319), code: $_DAEj(329)},
                            api_bindForm: {msg: $_DAEj(314), code: $_DADR(344)}
                        };
                        r[e] || (e = $_DADR(352));
                        var o = r[e], i = t[$_DADR(391)];
                        return o[$_DADR(365)] = function (e, t) {
                            var $_FDII = PaLDJ.$_CS, $_FDHK = ["$_FEBS"].concat($_FDII), $_FDJB = $_FDHK[1];
                            $_FDHK.shift();
                            var $_FEAg = $_FDHK[0];
                            var n = {
                                neterror: {"zh-cn": $_FDII(332), en: $_FDII(222), "zh-tw": $_FDII(335)},
                                configerror: {"zh-cn": $_FDII(336), en: $_FDJB(302), "zh-tw": $_FDJB(379)}
                            }, r = function (e) {
                                var $_FEDa = PaLDJ.$_CS, $_FECR = ["$_FEGy"].concat($_FEDa), $_FEEt = $_FECR[1];
                                $_FECR.shift();
                                var $_FEFH = $_FECR[0];
                                var t = {
                                    neterror: [$_FEDa(325), $_FEDa(367), $_FEEt(354), $_FEEt(363), $_FEEt(309), $_FEDa(396), $_FEEt(387), $_FEDa(311), $_FEEt(312), $_FEDa(334)],
                                    configerror: [$_FEDa(388), $_FEEt(359), $_FEEt(369), $_FEEt(349), $_FEEt(362), $_FEDa(377), $_FEDa(304), $_FEEt(329), $_FEEt(344)]
                                };
                                for (var n in t) {
                                    var r = t[n];
                                    if (r[$_FEDa(11)]) for (var o = r[$_FEEt(11)] - 1; 0 <= o; o--) if (r[o] === e) return n;
                                }
                                return $_FEEt(253);
                            }(e), o = function (e) {
                                var $_FEIk = PaLDJ.$_CS, $_FEHU = ["$_FFBt"].concat($_FEIk), $_FEJJ = $_FEHU[1];
                                $_FEHU.shift();
                                var $_FFAh = $_FEHU[0];
                                var t = (e = (e = e || $_FEJJ(275))[$_FEJJ(231)]())[$_FEJJ(323)]($_FEIk(296)),
                                    n = -1 < t ? e[$_FEJJ(67)](0, t) : e;
                                return $_FEIk(259) === n && (-1 < e[$_FEJJ(323)]($_FEJJ(255)) || -1 < e[$_FEIk(323)]($_FEIk(383)) ? n += $_FEIk(350) : n += $_FEIk(360)), n;
                            }(t);
                            return n[r] && n[r][o] || n[r][$_FDII(249)];
                        }(o[$_DAEj(346)], i[$_DADR(225)]), o[$_DADR(357)] = o[$_DAEj(346)], z(o, t, n);
                        break;
                }
            }
        }

        function j(e, t, n) {
            var $_DCIEk = PaLDJ.$_Dz()[4][6];
            for (; $_DCIEk !== PaLDJ.$_Dz()[0][5];) {
                switch ($_DCIEk) {
                    case PaLDJ.$_Dz()[2][6]:
                        return e[$_DAEj(258)] ? tt[$_DAEj(308)](e, t, n) : undefined !== u && u[$_DAEj(361)]() && e[$_DADR(327)] ? function (a, _, c) {
                            var $_FFDw = PaLDJ.$_CS, $_FFCP = ["$_FFGa"].concat($_FFDw), $_FFEb = $_FFCP[1];
                            $_FFCP.shift();
                            var $_FFFB = $_FFCP[0];
                            return new V(function (r, o) {
                                var $_FFIb = PaLDJ.$_CS, $_FFHH = ["$_FGBx"].concat($_FFIb), $_FFJT = $_FFHH[1];
                                $_FFHH.shift();
                                var $_FGAh = $_FFHH[0];

                                function s(t) {
                                    var $_DCIFI = PaLDJ.$_Dz()[4][6];
                                    for (; $_DCIFI !== PaLDJ.$_Dz()[2][4];) {
                                        switch ($_DCIFI) {
                                            case PaLDJ.$_Dz()[2][6]:
                                                var n = O(a[$_FFIb(328)], i[t], _);
                                                $_DCIFI = PaLDJ.$_Dz()[2][5];
                                                break;
                                            case PaLDJ.$_Dz()[0][5]:
                                                u[$_FFJT(374)](n, c, function (e) {
                                                    var $_FGDv = PaLDJ.$_CS, $_FGCB = ["$_FGGz"].concat($_FGDv),
                                                        $_FGEW = $_FGCB[1];
                                                    $_FGCB.shift();
                                                    var $_FGFV = $_FGCB[0];
                                                    r(e);
                                                }, function (e) {
                                                    var $_FGIP = PaLDJ.$_CS, $_FGHB = ["$_FHBT"].concat($_FGIP),
                                                        $_FGJm = $_FGHB[1];
                                                    $_FGHB.shift();
                                                    var $_FHAF = $_FGHB[0];
                                                    t >= i[$_FGJm(11)] - 1 ? (a[$_FGIP(357)] = 508, l(R(a, n), true, a[$_FGIP(328)]), o(e)) : s(t + 1);
                                                });
                                                $_DCIFI = PaLDJ.$_Dz()[2][4];
                                                break;
                                        }
                                    }
                                }

                                for (var e in c) c[$_FFJT(12)](e) && $_FFIb(347) == typeof c[e] && (c[e] = $_FFJT(253) + c[e]);
                                c[$_FFIb(341)] && (c[$_FFIb(341)] = decodeURIComponent(c[$_FFJT(341)]));
                                var i = a[$_FFIb(320)] || [a[$_FFIb(395)] || a[$_FFJT(333)]];
                                s(0);
                            });
                        }(e, t, n) : function (e, o, i) {
                            var $_FHDM = PaLDJ.$_CS, $_FHCs = ["$_FHGN"].concat($_FHDM), $_FHEY = $_FHCs[1];
                            $_FHCs.shift();
                            var $_FHFr = $_FHCs[0];
                            return new V(function (n, t) {
                                var $_FHIx = PaLDJ.$_CS, $_FHHf = ["$_FIBR"].concat($_FHIx), $_FHJR = $_FHHf[1];
                                $_FHHf.shift();
                                var $_FIAs = $_FHHf[0];
                                var r = $_FHJR(358) + $_EA();
                                window[r] = function (e) {
                                    var $_FID_ = PaLDJ.$_CS, $_FICw = ["$_FIG_"].concat($_FID_), $_FIEq = $_FICw[1];
                                    $_FICw.shift();
                                    var $_FIFv = $_FICw[0];
                                    n(e), window[r] = undefined;
                                    try {
                                        delete window[r];
                                    } catch (t) {
                                    }
                                }, i[$_FHIx(394)] = r, L(e, $_FHJR(348), e[$_FHJR(328)], e[$_FHJR(320)] || [e[$_FHJR(395)] || e[$_FHJR(333)]], o, i)[$_FHIx(305)](function () {
                                    var $_FIIo = PaLDJ.$_CS, $_FIHD = ["$_FJBb"].concat($_FIIo), $_FIJK = $_FIHD[1];
                                    $_FIHD.shift();
                                    var $_FJAx = $_FIHD[0];
                                }, function (e) {
                                    var $_FJDS = PaLDJ.$_CS, $_FJCJ = ["$_FJGM"].concat($_FJDS), $_FJEZ = $_FJCJ[1];
                                    $_FJCJ.shift();
                                    var $_FJFR = $_FJCJ[0];
                                    t(e);
                                });
                            });
                        }(e, t, n);
                        break;
                }
            }
        }

        function R(e, t) {
            var $_DCIGu = PaLDJ.$_Dz()[2][6];
            for (; $_DCIGu !== PaLDJ.$_Dz()[2][4];) {
                switch ($_DCIGu) {
                    case PaLDJ.$_Dz()[4][6]:
                        var n = $_DADR(253), r = 0;
                        $_DCIGu = PaLDJ.$_Dz()[0][5];
                        break;
                    case PaLDJ.$_Dz()[4][5]:
                        return e[$_DAEj(324)] && (n = e[$_DADR(324)][$_DADR(321)], r = e[$_DAEj(324)][$_DAEj(389)]), {
                            time: $_Ht(),
                            user_ip: n,
                            captcha_id: e[$_DAEj(380)],
                            challenge: e[$_DADR(399)],
                            pt: r,
                            exception_url: t,
                            error_code: e[$_DAEj(357)] || $_DADR(253),
                            msg: e[$_DAEj(382)] || $_DAEj(253)
                        };
                        break;
                }
            }
        }

        function L(r, e, t, n, o, i, s) {
            var $_DCIHs = PaLDJ.$_Dz()[4][6];
            for (; $_DCIHs !== PaLDJ.$_Dz()[0][4];) {
                switch ($_DCIHs) {
                    case PaLDJ.$_Dz()[2][6]:
                        var a;
                        $_DADR(348) == e ? a = S : $_DAEj(306) == e ? a = T : $_DADR(315) == e ? a = D : $_DAEj(310) === e && (a = A);
                        $_DCIHs = PaLDJ.$_Dz()[2][5];
                        break;
                    case PaLDJ.$_Dz()[4][5]:
                        for (var _ = function (n) {
                            var $_FJIm = PaLDJ.$_CS, $_FJHY = ["$_GABU"].concat($_FJIm), $_FJJR = $_FJHY[1];
                            $_FJHY.shift();
                            var $_GAAD = $_FJHY[0];
                            return function (e, t) {
                                var $_GADH = PaLDJ.$_CS, $_GACs = ["$_GAGa"].concat($_GADH), $_GAEd = $_GACs[1];
                                $_GACs.shift();
                                var $_GAFW = $_GACs[0];
                                a(n, r[$_GAEd(392)], r, s)[$_GADH(305)](function (e) {
                                    var $_GAIV = PaLDJ.$_CS, $_GAHC = ["$_GBBy"].concat($_GAIV), $_GAJC = $_GAHC[1];
                                    $_GAHC.shift();
                                    var $_GBAW = $_GAHC[0];
                                    t(e);
                                }, function () {
                                    var $_GBDU = PaLDJ.$_CS, $_GBCg = ["$_GBGN"].concat($_GBDU), $_GBEt = $_GBCg[1];
                                    $_GBCg.shift();
                                    var $_GBFj = $_GBCg[0];
                                    e();
                                });
                            };
                        }, c = [], l = 0, u = n[$_DAEj(11)]; l < u; l += 1) c[$_DADR(2)](_(O(t, n[l], o, i)));
                        return new V(function (t, e) {
                            var $_GBII = PaLDJ.$_CS, $_GBHA = ["$_GCBU"].concat($_GBII), $_GBJa = $_GBHA[1];
                            $_GBHA.shift();
                            var $_GCAc = $_GBHA[0];
                            V[$_GBII(397)](c)[$_GBII(305)](function () {
                                var $_GCDx = PaLDJ.$_CS, $_GCCr = ["$_GCGy"].concat($_GCDx), $_GCEw = $_GCCr[1];
                                $_GCCr.shift();
                                var $_GCFg = $_GCCr[0];
                                e();
                            }, function (e) {
                                var $_GCIo = PaLDJ.$_CS, $_GCHt = ["$_GDBA"].concat($_GCIo), $_GCJg = $_GCHt[1];
                                $_GCHt.shift();
                                var $_GDAR = $_GCHt[0];
                                t(e);
                            });
                        });
                        break;
                }
            }
        }

        function O(e, t, n, r) {
            var $_DCIIG = PaLDJ.$_Dz()[4][6];
            for (; $_DCIIG !== PaLDJ.$_Dz()[0][4];) {
                switch ($_DCIIG) {
                    case PaLDJ.$_Dz()[0][6]:
                        t = function (e) {
                            var $_GDDS = PaLDJ.$_CS, $_GDCz = ["$_GDGX"].concat($_GDDS), $_GDEv = $_GDCz[1];
                            $_GDCz.shift();
                            var $_GDFW = $_GDCz[0];
                            return e[$_GDDS(299)](/^https?:\/\/|\/$/g, $_GDDS(253));
                        }(t);
                        var o = function (e) {
                            var $_GDIr = PaLDJ.$_CS, $_GDHa = ["$_GEBl"].concat($_GDIr), $_GDJF = $_GDHa[1];
                            $_GDHa.shift();
                            var $_GEAZ = $_GDHa[0];
                            return 0 !== (e = e[$_GDJF(299)](/\/+/g, $_GDJF(386)))[$_GDIr(323)]($_GDIr(386)) && (e = $_GDIr(386) + e), e;
                        }(n) + function (e) {
                            var $_GEDi = PaLDJ.$_CS, $_GECu = ["$_GEGQ"].concat($_GEDi), $_GEEE = $_GECu[1];
                            $_GECu.shift();
                            var $_GEFq = $_GECu[0];
                            if (!e) return $_GEDi(253);
                            var n = $_GEDi(300);
                            return new ce(e)[$_GEDi(97)](function (e, t) {
                                var $_GEIB = PaLDJ.$_CS, $_GEHb = ["$_GFBA"].concat($_GEIB), $_GEJZ = $_GEHb[1];
                                $_GEHb.shift();
                                var $_GFAX = $_GEHb[0];
                                (K(t) || J(t) || Z(t)) && (n = n + encodeURIComponent(e) + $_GEIB(318) + encodeURIComponent(t) + $_GEIB(339));
                            }), $_GEDi(300) === n && (n = $_GEDi(253)), n[$_GEEE(299)](/&$/, $_GEDi(253));
                        }(r);
                        $_DCIIG = PaLDJ.$_Dz()[2][5];
                        break;
                    case PaLDJ.$_Dz()[4][5]:
                        return t && (o = e + t + o), o;
                        break;
                }
            }
        }

        function A(r, o, i) {
            var $_DCIJq = PaLDJ.$_Dz()[2][6];
            for (; $_DCIJq !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DCIJq) {
                    case PaLDJ.$_Dz()[0][6]:
                        return new V(function (e, t) {
                            var $_GFDG = PaLDJ.$_CS, $_GFC_ = ["$_GFGO"].concat($_GFDG), $_GFEO = $_GFC_[1];
                            $_GFC_.shift();
                            var $_GFFq = $_GFC_[0];
                            var n = new le($_GFEO(310));
                            n[$_GFEO(1)]({
                                onerror: function () {
                                    var $_GFIl = PaLDJ.$_CS, $_GFHz = ["$_GGBA"].concat($_GFIl), $_GFJf = $_GFHz[1];
                                    $_GFHz.shift();
                                    var $_GGAI = $_GFHz[0];
                                    l(R(i, r), i[$_GFJf(327)], i[$_GFJf(328)]), t(M);
                                }, onloadedmetadata: function () {
                                    var $_GGDY = PaLDJ.$_CS, $_GGCO = ["$_GGGZ"].concat($_GGDY), $_GGER = $_GGCO[1];
                                    $_GGCO.shift();
                                    var $_GGFK = $_GGCO[0];
                                    e(n);
                                }
                            }), n[$_GFDG(34)]({src: r}), g(function () {
                                var $_GGIF = PaLDJ.$_CS, $_GGHM = ["$_GHBQ"].concat($_GGIF), $_GGJZ = $_GGHM[1];
                                $_GGHM.shift();
                                var $_GHAq = $_GGHM[0];
                                t(P);
                            }, o || k);
                        });
                        break;
                }
            }
        }

        function D(r, o, i, s) {
            var $_DCJAw = PaLDJ.$_Dz()[4][6];
            for (; $_DCJAw !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DCJAw) {
                    case PaLDJ.$_Dz()[2][6]:
                        return new V(function (e, t) {
                            var $_GHDr = PaLDJ.$_CS, $_GHCg = ["$_GHGt"].concat($_GHDr), $_GHEO = $_GHCg[1];
                            $_GHCg.shift();
                            var $_GHFJ = $_GHCg[0];
                            var n = new le($_GHDr(315));
                            n[$_GHDr(1)]({
                                onerror: function () {
                                    var $_GHIY = PaLDJ.$_CS, $_GHHo = ["$_GIBf"].concat($_GHIY), $_GHJq = $_GHHo[1];
                                    $_GHHo.shift();
                                    var $_GIAE = $_GHHo[0];
                                    l(R(i, r), i[$_GHIY(327)], i[$_GHJq(328)]), t(M);
                                }, onload: function () {
                                    var $_GIDa = PaLDJ.$_CS, $_GICi = ["$_GIG_"].concat($_GIDa), $_GIEf = $_GICi[1];
                                    $_GICi.shift();
                                    var $_GIFz = $_GICi[0];
                                    e(n);
                                }
                            }), false !== s && n[$_GHDr(1)]({crossOrigin: $_GHEO(322)})[$_GHDr(34)]({crossorigin: $_GHDr(322)}), n[$_GHDr(34)]({src: r}), g(function () {
                                var $_GIIt = PaLDJ.$_CS, $_GIHn = ["$_GJBm"].concat($_GIIt), $_GIJr = $_GIHn[1];
                                $_GIHn.shift();
                                var $_GJAk = $_GIHn[0];
                                t(P);
                            }, o || k);
                        });
                        break;
                }
            }
        }

        function T(o, i, s) {
            var $_DCJBK = PaLDJ.$_Dz()[0][6];
            for (; $_DCJBK !== PaLDJ.$_Dz()[2][5];) {
                switch ($_DCJBK) {
                    case PaLDJ.$_Dz()[2][6]:
                        return new V(function (e, t) {
                            var $_GJDv = PaLDJ.$_CS, $_GJCh = ["$_GJGY"].concat($_GJDv), $_GJEO = $_GJCh[1];
                            $_GJCh.shift();
                            var $_GJFd = $_GJCh[0];
                            var n = new le($_GJDv(303)), r = false;
                            g(function () {
                                var $_GJIJ = PaLDJ.$_CS, $_GJHI = ["$_HABA"].concat($_GJIJ), $_GJJB = $_GJHI[1];
                                $_GJHI.shift();
                                var $_HAAj = $_GJHI[0];
                                r = true, e(n);
                            }, 2e3), n[$_GJDv(1)]({
                                onerror: function () {
                                    var $_HADE = PaLDJ.$_CS, $_HACw = ["$_HAGo"].concat($_HADE), $_HAEV = $_HACw[1];
                                    $_HACw.shift();
                                    var $_HAFH = $_HACw[0];
                                    l(R(s, o), s[$_HADE(327)], s[$_HADE(328)]), n[$_HAEV(331)](), t(M);
                                }, onload: function () {
                                    var $_HAIn = PaLDJ.$_CS, $_HAHW = ["$_HBBY"].concat($_HAIn), $_HAJl = $_HAHW[1];
                                    $_HAHW.shift();
                                    var $_HBAz = $_HAHW[0];
                                    r = true, e(n);
                                }, href: o, rel: $_GJDv(372)
                            })[$_GJDv(353)](new le(f)), g(function () {
                                var $_HBDL = PaLDJ.$_CS, $_HBCK = ["$_HBGN"].concat($_HBDL), $_HBEA = $_HBCK[1];
                                $_HBCK.shift();
                                var $_HBFV = $_HBCK[0];
                                r || n[$_HBDL(331)](), t(P);
                            }, i || k);
                        });
                        break;
                }
            }
        }

        function S(s, a, _) {
            var $_DCJCX = PaLDJ.$_Dz()[4][6];
            for (; $_DCJCX !== PaLDJ.$_Dz()[0][5];) {
                switch ($_DCJCX) {
                    case PaLDJ.$_Dz()[2][6]:
                        return new V(function (e, t) {
                            var $_HBIn = PaLDJ.$_CS, $_HBHl = ["$_HCBv"].concat($_HBIn), $_HBJE = $_HBHl[1];
                            $_HBHl.shift();
                            var $_HCAI = $_HBHl[0];

                            function i() {
                                var $_DCJDB = PaLDJ.$_Dz()[0][6];
                                for (; $_DCJDB !== PaLDJ.$_Dz()[0][5];) {
                                    switch ($_DCJDB) {
                                        case PaLDJ.$_Dz()[4][6]:
                                            o || r[$_HBIn(356)] && $_HBIn(375) !== r[$_HBJE(356)] && $_HBIn(384) !== r[$_HBIn(356)] || (o = true, g(function () {
                                                var $_HCDw = PaLDJ.$_CS, $_HCCt = ["$_HCGZ"].concat($_HCDw),
                                                    $_HCEj = $_HCCt[1];
                                                $_HCCt.shift();
                                                var $_HCFu = $_HCCt[0];
                                                e(n);
                                            }, 0));
                                            $_DCJDB = PaLDJ.$_Dz()[4][5];
                                            break;
                                    }
                                }
                            }

                            var n = new le($_HBIn(415)), r = n[$_HBIn(407)], o = false;
                            /static\.geetest\.com/g[$_HBJE(446)](s) && n[$_HBIn(1)]({crossOrigin: $_HBJE(322)}), n[$_HBJE(1)]({
                                charset: $_HBJE(497),
                                aysnc: false,
                                onload: i,
                                onreadystatechange: i,
                                onerror: function () {
                                    var $_HCIp = PaLDJ.$_CS, $_HCHo = ["$_HDBa"].concat($_HCIp), $_HCJv = $_HCHo[1];
                                    $_HCHo.shift();
                                    var $_HDAM = $_HCHo[0];
                                    _[$_HCJv(357)] = 508, _[$_HCIp(380)] && l(R(_, s[$_HCJv(99)]($_HCIp(300))[0]), _[$_HCIp(327)], _[$_HCIp(328)]), n[$_HCIp(331)](), o = true, t(M);
                                },
                                src: s
                            })[$_HBIn(353)](new le(f)), g(function () {
                                var $_HDDp = PaLDJ.$_CS, $_HDCT = ["$_HDGy"].concat($_HDDp), $_HDEV = $_HDCT[1];
                                $_HDCT.shift();
                                var $_HDFB = $_HDCT[0];
                                o || (n[$_HDDp(331)](), _[$_HDEV(380)] && (_[$_HDEV(357)] = 408, l(R(_, s[$_HDDp(99)]($_HDDp(300))[0]), _[$_HDEV(327)], _[$_HDEV(328)]))), t(P);
                            }, a || k);
                        });
                        break;
                }
            }
        }

        function C() {
            var $_DCJEL = PaLDJ.$_Dz()[4][6];
            for (; $_DCJEL !== PaLDJ.$_Dz()[2][5];) {
                switch ($_DCJEL) {
                    case PaLDJ.$_Dz()[4][6]:
                        return !!h && ($_DAEj(428) in h[$_DAEj(465)] || $_DAEj(405) in h[$_DADR(465)] || $_DAEj(412) in h[$_DADR(465)] || $_DADR(462) in h[$_DADR(465)]);
                        break;
                }
            }
        }

        function v(e) {
            var $_DCJFM = PaLDJ.$_Dz()[0][6];
            for (; $_DCJFM !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DCJFM) {
                    case PaLDJ.$_Dz()[4][6]:
                        window[$_DADR(403)](e);
                        $_DCJFM = PaLDJ.$_Dz()[4][5];
                        break;
                }
            }
        }

        function g(e, t) {
            var $_DCJGb = PaLDJ.$_Dz()[4][6];
            for (; $_DCJGb !== PaLDJ.$_Dz()[0][5];) {
                switch ($_DCJGb) {
                    case PaLDJ.$_Dz()[2][6]:
                        return window[$_DADR(413)](e, t);
                        break;
                }
            }
        }

        function c(e, t) {
            var $_DCJHk = PaLDJ.$_Dz()[2][6];
            for (; $_DCJHk !== PaLDJ.$_Dz()[0][5];) {
                switch ($_DCJHk) {
                    case PaLDJ.$_Dz()[0][6]:
                        if (e && e[$_DAEj(440)] && /static\.geetest\.com/g[$_DADR(446)](e[$_DADR(440)]) || t) {
                            try {
                                var n = {
                                    captcha_id: window && window[$_DADR(466)] || $_DADR(253),
                                    challenge: window && window[$_DADR(480)] || $_DADR(253),
                                    error_code: t ? $_DADR(410) : $_DADR(453),
                                    exception_url: e[$_DADR(440)] || $_DADR(253),
                                    pt: /Mobi/i[$_DADR(446)](window[$_DAEj(408)][$_DAEj(490)]) ? $_DADR(421) : $_DADR(246),
                                    time: function a() {
                                        var $_HDIW = PaLDJ.$_CS, $_HDHk = ["$_HEBx"].concat($_HDIW), $_HDJh = $_HDHk[1];
                                        $_HDHk.shift();
                                        var $_HEAD = $_HDHk[0];
                                        var e = new Date, t = e[$_HDJh(244)](), n = e[$_HDJh(235)]() + 1,
                                            r = e[$_HDJh(230)](), o = e[$_HDIW(262)](), i = e[$_HDIW(263)](),
                                            s = e[$_HDIW(221)]();
                                        return 1 <= n && n <= 9 && (n = $_HDIW(246) + n), 0 <= r && r <= 9 && (r = $_HDIW(246) + r), 0 <= o && o <= 9 && (o = $_HDJh(246) + o), 0 <= i && i <= 9 && (i = $_HDJh(246) + i), 0 <= s && s <= 9 && (s = $_HDJh(246) + s), t + $_HDJh(296) + n + $_HDIW(296) + r + $_HDJh(52) + o + $_HDJh(281) + i + $_HDJh(281) + s;
                                    }(),
                                    msg: e[$_DAEj(307)] && e[$_DAEj(307)][$_DADR(406)] || e[$_DAEj(406)] || $_DAEj(253),
                                    stack: e[$_DAEj(307)] && e[$_DADR(307)][$_DAEj(470)] || e[$_DAEj(470)] || $_DADR(253)
                                };
                                _[$_DADR(361)]() && _[$_DADR(374)]($_DAEj(491), n, function (e) {
                                    var $_HEDo = PaLDJ.$_CS, $_HECx = ["$_HEGx"].concat($_HEDo), $_HEE_ = $_HECx[1];
                                    $_HECx.shift();
                                    var $_HEFE = $_HECx[0];
                                }, function (e) {
                                    var $_HEIb = PaLDJ.$_CS, $_HEHN = ["$_HFBJ"].concat($_HEIb), $_HEJA = $_HEHN[1];
                                    $_HEHN.shift();
                                    var $_HFAX = $_HEHN[0];
                                });
                            } catch (r) {
                            }
                        }
                        $_DCJHk = PaLDJ.$_Dz()[0][5];
                        break;
                }
            }
        }

        function s(e, r) {
            var $_DCJIk = PaLDJ.$_Dz()[0][6];
            for (; $_DCJIk !== PaLDJ.$_Dz()[0][5];) {
                switch ($_DCJIk) {
                    case PaLDJ.$_Dz()[2][6]:
                        return new V(function (t, n) {
                            var $_HFDK = PaLDJ.$_CS, $_HFCq = ["$_HFG_"].concat($_HFDK), $_HFEy = $_HFCq[1];
                            $_HFCq.shift();
                            var $_HFFP = $_HFCq[0];
                            u[$_HFEy(374)](r + $_HFDK(438), e, function (e) {
                                var $_HFIR = PaLDJ.$_CS, $_HFHM = ["$_HGBn"].concat($_HFIR), $_HFJL = $_HFHM[1];
                                $_HFHM.shift();
                                var $_HGAD = $_HFHM[0];
                                t(e);
                            }, function (e) {
                                var $_HGDd = PaLDJ.$_CS, $_HGCd = ["$_HGGn"].concat($_HGDd), $_HGEg = $_HGCd[1];
                                $_HGCd.shift();
                                var $_HGFk = $_HGCd[0];
                                n(e);
                            });
                        });
                        break;
                }
            }
        }

        function i(n, r) {
            var $_DCJJA = PaLDJ.$_Dz()[4][6];
            for (; $_DCJJA !== PaLDJ.$_Dz()[0][5];) {
                switch ($_DCJJA) {
                    case PaLDJ.$_Dz()[2][6]:
                        return new V(function (e, t) {
                            var $_HGIO = PaLDJ.$_CS, $_HGHp = ["$_HHBX"].concat($_HGIO), $_HGJi = $_HGHp[1];
                            $_HGHp.shift();
                            var $_HHAl = $_HGHp[0];
                            L({timeout: 3e3}, $_HGJi(348), r, [$_HGJi(492)], $_HGIO(404), n)[$_HGIO(305)](function () {
                                var $_HHDU = PaLDJ.$_CS, $_HHCQ = ["$_HHGr"].concat($_HHDU), $_HHEG = $_HHCQ[1];
                                $_HHCQ.shift();
                                var $_HHFW = $_HHCQ[0];
                            }, function (e) {
                                var $_HHIW = PaLDJ.$_CS, $_HHH_ = ["$_HIBS"].concat($_HHIW), $_HHJO = $_HHH_[1];
                                $_HHH_.shift();
                                var $_HIAh = $_HHH_[0];
                                t(e);
                            });
                        });
                        break;
                }
            }
        }

        function l(e, t, n) {
            var $_DDAAS = PaLDJ.$_Dz()[0][6];
            for (; $_DDAAS !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DDAAS) {
                    case PaLDJ.$_Dz()[0][6]:
                        if (undefined !== u && u[$_DADR(361)]() && t) try {
                            s(e, n);
                        } catch (r) {
                        } else try {
                            i(e, n);
                        } catch (r) {
                        }
                        $_DDAAS = PaLDJ.$_Dz()[2][5];
                        break;
                }
            }
        }

        var t, n, r, o, _ = {
                $_FCU: function () {
                    var $_HIDm = PaLDJ.$_CS, $_HICC = ["$_HIGd"].concat($_HIDm), $_HIEH = $_HICC[1];
                    $_HICC.shift();
                    var $_HIFp = $_HICC[0];
                    return (window[$_HIEH(422)] || window[$_HIEH(477)] && $_HIEH(460) in new window[$_HIEH(477)]) && window[$_HIDm(479)];
                }, $_FDr: function (e, t, n, r, o) {
                    var $_HIIg = PaLDJ.$_CS, $_HIHq = ["$_HJBR"].concat($_HIIg), $_HIJp = $_HIHq[1];
                    $_HIHq.shift();
                    var $_HJAK = $_HIHq[0];
                    var i = null;
                    if (i = $_HIJp(10) == typeof t ? t : window[$_HIJp(479)][$_HIIg(411)](t), !window[$_HIIg(477)] || $_HIJp(460) in new window[$_HIJp(477)]) {
                        if (window[$_HIIg(477)]) {
                            var s = new window[$_HIJp(477)];
                            s[$_HIJp(443)]($_HIIg(402), e, true), s[$_HIJp(437)]($_HIJp(487), $_HIIg(456)), s[$_HIIg(437)]($_HIJp(436), $_HIJp(433)), s[$_HIIg(460)] = true, s[$_HIIg(392)] = o || 3e4, s[$_HIJp(476)] = function () {
                                var $_HJDH = PaLDJ.$_CS, $_HJCJ = ["$_HJGs"].concat($_HJDH), $_HJEr = $_HJCJ[1];
                                $_HJCJ.shift();
                                var $_HJFt = $_HJCJ[0];
                                n(window[$_HJDH(479)][$_HJEr(64)](s[$_HJDH(445)]));
                            }, s[$_HIIg(452)] = function () {
                                var $_HJIe = PaLDJ.$_CS, $_HJHZ = ["$_IABw"].concat($_HJIe), $_HJJD = $_HJHZ[1];
                                $_HJHZ.shift();
                                var $_IAAn = $_HJHZ[0];
                                4 === s[$_HJIe(356)] && (200 === s[$_HJIe(489)] ? n(window[$_HJJD(479)][$_HJJD(64)](s[$_HJJD(445)])) : r({error: $_HJIe(471) + s[$_HJJD(489)]}));
                            }, s[$_HIJp(426)](i);
                        }
                    } else {
                        var a = window[$_HIJp(442)][$_HIIg(328)], _ = new window[$_HIJp(422)];
                        _[$_HIIg(392)] = o || 3e4, -1 === e[$_HIJp(323)](a) && (e = e[$_HIJp(299)](/^https?:/, a)), _[$_HIIg(475)] = function () {
                            var $_IADM = PaLDJ.$_CS, $_IACg = ["$_IAG_"].concat($_IADM), $_IAEb = $_IACg[1];
                            $_IACg.shift();
                            var $_IAFp = $_IACg[0];
                            $_IADM(200) == typeof r && r({error: $_IADM(392)});
                        }, _[$_HIIg(488)] = function () {
                            var $_IAIM = PaLDJ.$_CS, $_IAHT = ["$_IBBh"].concat($_IAIM), $_IAJk = $_IAHT[1];
                            $_IAHT.shift();
                            var $_IBAO = $_IAHT[0];
                            $_IAIM(200) == typeof r && r({error: $_IAJk(307)});
                        }, _[$_HIIg(476)] = function () {
                            var $_IBDd = PaLDJ.$_CS, $_IBCd = ["$_IBGv"].concat($_IBDd), $_IBEI = $_IBCd[1];
                            $_IBCd.shift();
                            var $_IBFe = $_IBCd[0];
                            $_IBDd(200) == typeof n && n(window[$_IBEI(479)][$_IBDd(64)](_[$_IBEI(445)]));
                        }, _[$_HIJp(443)]($_HIIg(402), e), g(function () {
                            var $_IBID = PaLDJ.$_CS, $_IBHk = ["$_ICBF"].concat($_IBID), $_IBJY = $_IBHk[1];
                            $_IBHk.shift();
                            var $_ICAd = $_IBHk[0];
                            _[$_IBID(426)](i);
                        }, 0);
                    }
                }
            }, u = (function ot() {
                var $_ICDU = PaLDJ.$_CS, $_ICCI = ["$_ICGX"].concat($_ICDU), $_ICEc = $_ICCI[1];
                $_ICCI.shift();
                var $_ICFL = $_ICCI[0];
                window[$_ICDU(472)] ? (window[$_ICEc(472)]($_ICDU(307), function (e) {
                    var $_ICIm = PaLDJ.$_CS, $_ICHZ = ["$_IDB_"].concat($_ICIm), $_ICJx = $_ICHZ[1];
                    $_ICHZ.shift();
                    var $_IDAr = $_ICHZ[0];
                    c(e);
                }), window[$_ICDU(472)]($_ICDU(467), function (e) {
                    var $_IDDi = PaLDJ.$_CS, $_IDCK = ["$_IDGa"].concat($_IDDi), $_IDE_ = $_IDCK[1];
                    $_IDCK.shift();
                    var $_IDFA = $_IDCK[0];
                    c(e);
                })) : window[$_ICEc(469)] && (window[$_ICDU(469)]($_ICEc(488), function (e) {
                    var $_IDIB = PaLDJ.$_CS, $_IDH_ = ["$_IEBR"].concat($_IDIB), $_IDJK = $_IDH_[1];
                    $_IDH_.shift();
                    var $_IEAA = $_IDH_[0];
                    c(e);
                }), window[$_ICDU(469)]($_ICEc(481), function (e) {
                    var $_IEDJ = PaLDJ.$_CS, $_IECc = ["$_IEGq"].concat($_IEDJ), $_IEEl = $_IECc[1];
                    $_IECc.shift();
                    var $_IEFI = $_IECc[0];
                    c(e);
                }));
            }(), {
                $_FCU: function () {
                    var $_IEIN = PaLDJ.$_CS, $_IEHl = ["$_IFBx"].concat($_IEIN), $_IEJn = $_IEHl[1];
                    $_IEHl.shift();
                    var $_IFAd = $_IEHl[0];
                    return (window[$_IEJn(422)] || window[$_IEJn(477)] && $_IEJn(460) in new window[$_IEIN(477)]) && window[$_IEJn(479)];
                }, $_FDr: function (e, t, n, r, o) {
                    var $_IFDc = PaLDJ.$_CS, $_IFCy = ["$_IFGu"].concat($_IFDc), $_IFEY = $_IFCy[1];
                    $_IFCy.shift();
                    var $_IFFB = $_IFCy[0];
                    var i = null;
                    if (i = $_IFEY(10) == typeof t ? t : window[$_IFDc(479)][$_IFDc(411)](t), !window[$_IFEY(477)] || $_IFEY(460) in new window[$_IFDc(477)]) {
                        if (window[$_IFDc(477)]) {
                            var s = new window[$_IFDc(477)];
                            s[$_IFEY(443)]($_IFEY(402), e, true), s[$_IFDc(437)]($_IFEY(487), $_IFDc(456)), s[$_IFDc(437)]($_IFEY(436), $_IFDc(433)), s[$_IFEY(460)] = true, s[$_IFEY(392)] = o || 3e4, s[$_IFEY(476)] = function () {
                                var $_IFIN = PaLDJ.$_CS, $_IFHu = ["$_IGBb"].concat($_IFIN), $_IFJw = $_IFHu[1];
                                $_IFHu.shift();
                                var $_IGAI = $_IFHu[0];
                                n(window[$_IFJw(479)][$_IFJw(64)](s[$_IFJw(445)]));
                            }, s[$_IFDc(452)] = function () {
                                var $_IGDg = PaLDJ.$_CS, $_IGCb = ["$_IGGI"].concat($_IGDg), $_IGEF = $_IGCb[1];
                                $_IGCb.shift();
                                var $_IGFv = $_IGCb[0];
                                4 === s[$_IGEF(356)] && (200 === s[$_IGEF(489)] ? n(window[$_IGDg(479)][$_IGEF(64)](s[$_IGEF(445)])) : r({error: $_IGEF(471) + s[$_IGDg(489)]}));
                            }, s[$_IFDc(426)](i);
                        }
                    } else {
                        var a = window[$_IFDc(442)][$_IFEY(328)], _ = new window[$_IFEY(422)];
                        _[$_IFEY(392)] = o || 3e4, -1 === e[$_IFDc(323)](a) && (e = e[$_IFDc(299)](/^https?:/, a)), _[$_IFDc(475)] = function () {
                            var $_IGIV = PaLDJ.$_CS, $_IGHb = ["$_IHBQ"].concat($_IGIV), $_IGJM = $_IGHb[1];
                            $_IGHb.shift();
                            var $_IHAO = $_IGHb[0];
                            $_IGIV(200) == typeof r && r({error: $_IGIV(392)});
                        }, _[$_IFDc(488)] = function () {
                            var $_IHDg = PaLDJ.$_CS, $_IHCp = ["$_IHGu"].concat($_IHDg), $_IHEo = $_IHCp[1];
                            $_IHCp.shift();
                            var $_IHFq = $_IHCp[0];
                            $_IHEo(200) == typeof r && r({error: $_IHEo(307)});
                        }, _[$_IFDc(476)] = function () {
                            var $_IHIq = PaLDJ.$_CS, $_IHHZ = ["$_IIBq"].concat($_IHIq), $_IHJp = $_IHHZ[1];
                            $_IHHZ.shift();
                            var $_IIAL = $_IHHZ[0];
                            $_IHJp(200) == typeof n && n(window[$_IHIq(479)][$_IHIq(64)](_[$_IHIq(445)]));
                        }, _[$_IFDc(443)]($_IFDc(402), e), g(function () {
                            var $_IIDe = PaLDJ.$_CS, $_IICj = ["$_IIGF"].concat($_IIDe), $_IIEs = $_IICj[1];
                            $_IICj.shift();
                            var $_IIFn = $_IICj[0];
                            _[$_IIDe(426)](i);
                        }, 0);
                    }
                }
            }),
            p = {
                $_FJM: {
                    $_GAT: $_DAEj(419),
                    $_GBd: $_DAEj(82),
                    $_GCF: 7274496,
                    $_GDy: 9483264,
                    $_GEl: 19220,
                    $_GFV: 235,
                    $_GGs: 24
                },
                $_GAT: $_DADR(419),
                $_GBd: $_DAEj(82),
                $_GCF: 7274496,
                $_GDy: 9483264,
                $_GEl: 19220,
                $_GFV: 235,
                $_GGs: 24,
                $_GHx: function (e) {
                    var $_IIIp = PaLDJ.$_CS, $_IIHl = ["$_IJBz"].concat($_IIIp), $_IIJA = $_IIHl[1];
                    $_IIHl.shift();
                    var $_IJAk = $_IIHl[0];
                    for (var t = [], n = 0, r = e[$_IIJA(11)]; n < r; n += 1) t[$_IIIp(2)](e[$_IIJA(54)](n));
                    return t;
                },
                $_GIX: function (e) {
                    var $_IJDv = PaLDJ.$_CS, $_IJCu = ["$_IJGe"].concat($_IJDv), $_IJEG = $_IJCu[1];
                    $_IJCu.shift();
                    var $_IJFl = $_IJCu[0];
                    for (var t = $_IJEG(253), n = 0, r = e[$_IJEG(11)]; n < r; n += 1) t += String[$_IJEG(493)](e[n]);
                    return t;
                },
                $_GJQ: function (e) {
                    var $_IJIL = PaLDJ.$_CS, $_IJHW = ["$_JABI"].concat($_IJIL), $_IJJb = $_IJHW[1];
                    $_IJHW.shift();
                    var $_JAAK = $_IJHW[0];
                    var t = this[$_IJJb(423)];
                    return e < 0 || e >= t[$_IJIL(11)] ? $_IJJb(82) : t[$_IJIL(429)](e);
                },
                $_HAl: function (e) {
                    var $_JADP = PaLDJ.$_CS, $_JACp = ["$_JAG_"].concat($_JADP), $_JAEv = $_JACp[1];
                    $_JACp.shift();
                    var $_JAFM = $_JACp[0];
                    return this[$_JAEv(423)][$_JAEv(323)](e);
                },
                $_HBm: function (e, t) {
                    var $_JAIf = PaLDJ.$_CS, $_JAHR = ["$_JBBG"].concat($_JAIf), $_JAJG = $_JAHR[1];
                    $_JAHR.shift();
                    var $_JBAv = $_JAHR[0];
                    return e >> t & 1;
                },
                $_HCR: function (e, o) {
                    var $_JBDY = PaLDJ.$_CS, $_JBCj = ["$_JBGq"].concat($_JBDY), $_JBES = $_JBCj[1];
                    $_JBCj.shift();
                    var $_JBFH = $_JBCj[0];
                    var i = this;
                    o || (o = i);
                    for (var t = function (e, t) {
                        var $_JBIu = PaLDJ.$_CS, $_JBHa = ["$_JCBb"].concat($_JBIu), $_JBJX = $_JBHa[1];
                        $_JBHa.shift();
                        var $_JCAc = $_JBHa[0];
                        for (var n = 0, r = o[$_JBJX(451)] - 1; 0 <= r; r -= 1) 1 === i[$_JBJX(455)](t, r) && (n = (n << 1) + i[$_JBIu(455)](e, r));
                        return n;
                    }, n = $_JBDY(253), r = $_JBDY(253), s = e[$_JBDY(11)], a = 0; a < s; a += 3) {
                        var _;
                        if (a + 2 < s) _ = (e[a] << 16) + (e[a + 1] << 8) + e[a + 2], n += i[$_JBDY(434)](t(_, o[$_JBDY(432)])) + i[$_JBDY(434)](t(_, o[$_JBDY(468)])) + i[$_JBDY(434)](t(_, o[$_JBES(435)])) + i[$_JBDY(434)](t(_, o[$_JBES(439)])); else {
                            var c = s % 3;
                            2 == c ? (_ = (e[a] << 16) + (e[a + 1] << 8), n += i[$_JBDY(434)](t(_, o[$_JBDY(432)])) + i[$_JBES(434)](t(_, o[$_JBDY(468)])) + i[$_JBDY(434)](t(_, o[$_JBES(435)])), r = o[$_JBES(496)]) : 1 == c && (_ = e[a] << 16, n += i[$_JBES(434)](t(_, o[$_JBDY(432)])) + i[$_JBES(434)](t(_, o[$_JBES(468)])), r = o[$_JBDY(496)] + o[$_JBDY(496)]);
                        }
                    }
                    return {res: n, end: r};
                },
                $_HDH: function (e) {
                    var $_JCDl = PaLDJ.$_CS, $_JCCy = ["$_JCGk"].concat($_JCDl), $_JCEK = $_JCCy[1];
                    $_JCCy.shift();
                    var $_JCFv = $_JCCy[0];
                    var t = this[$_JCEK(424)](this[$_JCDl(474)](e));
                    return t[$_JCEK(409)] + t[$_JCDl(418)];
                },
                $_HEG: function (e) {
                    var $_JCIC = PaLDJ.$_CS, $_JCHJ = ["$_JDBC"].concat($_JCIC), $_JCJa = $_JCHJ[1];
                    $_JCHJ.shift();
                    var $_JDAe = $_JCHJ[0];
                    var t = this[$_JCIC(424)](e);
                    return t[$_JCIC(409)] + t[$_JCJa(418)];
                },
                $_HFu: function (e, i) {
                    var $_JDDw = PaLDJ.$_CS, $_JDCc = ["$_JDGK"].concat($_JDDw), $_JDEi = $_JDCc[1];
                    $_JDCc.shift();
                    var $_JDFG = $_JDCc[0];
                    var s = this;
                    i || (i = s);
                    for (var t = function (e, t) {
                        var $_JDIw = PaLDJ.$_CS, $_JDHu = ["$_JEBr"].concat($_JDIw), $_JDJI = $_JDHu[1];
                        $_JDHu.shift();
                        var $_JEAK = $_JDHu[0];
                        if (e < 0) return 0;
                        for (var n = 5, r = 0, o = i[$_JDIw(451)] - 1; 0 <= o; o -= 1) 1 === s[$_JDJI(455)](t, o) && (r += s[$_JDIw(455)](e, n) << o, n -= 1);
                        return r;
                    }, n = e[$_JDDw(11)], r = $_JDEi(253), o = 0; o < n; o += 4) {
                        var a = t(s[$_JDDw(498)](e[$_JDEi(429)](o)), i[$_JDEi(432)]) + t(s[$_JDDw(498)](e[$_JDEi(429)](o + 1)), i[$_JDEi(468)]) + t(s[$_JDDw(498)](e[$_JDDw(429)](o + 2)), i[$_JDEi(435)]) + t(s[$_JDDw(498)](e[$_JDEi(429)](o + 3)), i[$_JDEi(439)]),
                            _ = a >> 16 & 255;
                        if (r += String[$_JDEi(493)](_), e[$_JDDw(429)](o + 2) !== i[$_JDDw(496)]) {
                            var c = a >> 8 & 255;
                            if (r += String[$_JDDw(493)](c), e[$_JDDw(429)](o + 3) !== i[$_JDEi(496)]) {
                                var l = 255 & a;
                                r += String[$_JDEi(493)](l);
                            }
                        }
                    }
                    return r;
                },
                $_HGM: function (e) {
                    var $_JEDj = PaLDJ.$_CS, $_JECO = ["$_JEGS"].concat($_JEDj), $_JEEY = $_JECO[1];
                    $_JECO.shift();
                    var $_JEFt = $_JECO[0];
                    var t = 4 - e[$_JEEY(11)] % 4;
                    if (t < 4) for (var n = 0; n < t; n += 1) e += this[$_JEDj(496)];
                    return this[$_JEEY(430)](e);
                },
                $_HHC: function (e) {
                    var $_JEIk = PaLDJ.$_CS, $_JEHg = ["$_JFBw"].concat($_JEIk), $_JEJl = $_JEHg[1];
                    $_JEHg.shift();
                    var $_JFAl = $_JEHg[0];
                    return this[$_JEJl(499)](e);
                }
            }, N = window[$_DADR(55)], a = window[$_DAEj(442)], h = N[$_DADR(441)] || N[$_DAEj(420)]($_DADR(441))[0],
            f = N[$_DADR(444)] || N[$_DAEj(420)]($_DAEj(444))[0], m = N[$_DAEj(478)] || h,
            d = a[$_DAEj(328)] + $_DADR(459), pe = window[$_DADR(408)],
            x = (t = N[$_DADR(457)]($_DAEj(416)), n = t[$_DADR(427)] && t[$_DADR(427)]($_DAEj(417)), r = /msie/i[$_DADR(446)](pe[$_DADR(490)]), !n && r),
            w = /Mobi/i[$_DAEj(446)](pe[$_DADR(490)]), y = /msie 6\.0/i[$_DAEj(446)](pe[$_DAEj(490)]),
            b = /msie 7\.0/i[$_DADR(446)](pe[$_DAEj(490)]),
            E = (N[$_DADR(485)], parseFloat(pe[$_DADR(490)][$_DAEj(67)](pe[$_DAEj(490)][$_DAEj(323)]($_DADR(431)) + 8)), parseFloat(pe[$_DAEj(490)][$_DAEj(67)](pe[$_DADR(490)][$_DADR(323)]($_DADR(431)) + 8)), -1 < pe[$_DADR(490)][$_DAEj(323)]($_DADR(431))),
            k = 3e4, B = $_DADR(358), M = $_DADR(482), P = $_DAEj(463), q = (o = [], {
                $_HIT: function (e, t) {
                    var $_JFDs = PaLDJ.$_CS, $_JFCD = ["$_JFGK"].concat($_JFDs), $_JFEj = $_JFCD[1];
                    $_JFCD.shift();
                    var $_JFFQ = $_JFCD[0];
                    o[e] = t;
                }, $_HJb: function (e) {
                    var $_JFIT = PaLDJ.$_CS, $_JFHi = ["$_JGBI"].concat($_JFIT), $_JFJO = $_JFHi[1];
                    $_JFHi.shift();
                    var $_JGAa = $_JFHi[0];
                    return o[e];
                }
            });
        window.func1 = p;
        et[$_DAEj(447)] = $_DAEj(450);

        function H(e) {
            var $_DDABa = PaLDJ.$_Dz()[4][6];
            for (; $_DDABa !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DDABa) {
                    case PaLDJ.$_Dz()[4][6]:

                    function _(e, t) {
                        var $_DDACZ = PaLDJ.$_Dz()[4][6];
                        for (; $_DDACZ !== PaLDJ.$_Dz()[0][5];) {
                            switch ($_DDACZ) {
                                case PaLDJ.$_Dz()[0][6]:
                                    return e << t | e >>> 32 - t;
                                    break;
                            }
                        }
                    }

                    function c(e, t) {
                        var $_DDADE = PaLDJ.$_Dz()[4][6];
                        for (; $_DDADE !== PaLDJ.$_Dz()[0][4];) {
                            switch ($_DDADE) {
                                case PaLDJ.$_Dz()[0][6]:
                                    var n, r, o, i, s;
                                    $_DDADE = PaLDJ.$_Dz()[2][5];
                                    break;
                                case PaLDJ.$_Dz()[0][5]:
                                    return o = 2147483648 & e, i = 2147483648 & t, s = (1073741823 & e) + (1073741823 & t), (n = 1073741824 & e) & (r = 1073741824 & t) ? 2147483648 ^ s ^ o ^ i : n | r ? 1073741824 & s ? 3221225472 ^ s ^ o ^ i : 1073741824 ^ s ^ o ^ i : s ^ o ^ i;
                                    break;
                            }
                        }
                    }

                    function t(e, t, n, r, o, i, s) {
                        var $_DDAER = PaLDJ.$_Dz()[4][6];
                        for (; $_DDAER !== PaLDJ.$_Dz()[0][5];) {
                            switch ($_DDAER) {
                                case PaLDJ.$_Dz()[4][6]:
                                    return c(_(e = c(e, c(c(function a(e, t, n) {
                                        var $_JGDJ = PaLDJ.$_CS, $_JGCv = ["$_JGGt"].concat($_JGDJ), $_JGEd = $_JGCv[1];
                                        $_JGCv.shift();
                                        var $_JGFz = $_JGCv[0];
                                        return e & t | ~e & n;
                                    }(t, n, r), o), s)), i), t);
                                    break;
                            }
                        }
                    }

                    function n(e, t, n, r, o, i, s) {
                        var $_DDAFR = PaLDJ.$_Dz()[0][6];
                        for (; $_DDAFR !== PaLDJ.$_Dz()[0][5];) {
                            switch ($_DDAFR) {
                                case PaLDJ.$_Dz()[0][6]:
                                    return c(_(e = c(e, c(c(function a(e, t, n) {
                                        var $_JGII = PaLDJ.$_CS, $_JGHF = ["$_JHBU"].concat($_JGII), $_JGJW = $_JGHF[1];
                                        $_JGHF.shift();
                                        var $_JHAN = $_JGHF[0];
                                        return e & n | t & ~n;
                                    }(t, n, r), o), s)), i), t);
                                    break;
                            }
                        }
                    }

                    function r(e, t, n, r, o, i, s) {
                        var $_DDAGU = PaLDJ.$_Dz()[2][6];
                        for (; $_DDAGU !== PaLDJ.$_Dz()[2][5];) {
                            switch ($_DDAGU) {
                                case PaLDJ.$_Dz()[0][6]:
                                    return c(_(e = c(e, c(c(function a(e, t, n) {
                                        var $_JHDB = PaLDJ.$_CS, $_JHCm = ["$_JHGj"].concat($_JHDB), $_JHEL = $_JHCm[1];
                                        $_JHCm.shift();
                                        var $_JHFO = $_JHCm[0];
                                        return e ^ t ^ n;
                                    }(t, n, r), o), s)), i), t);
                                    break;
                            }
                        }
                    }

                    function o(e, t, n, r, o, i, s) {
                        var $_DDAHz = PaLDJ.$_Dz()[0][6];
                        for (; $_DDAHz !== PaLDJ.$_Dz()[0][5];) {
                            switch ($_DDAHz) {
                                case PaLDJ.$_Dz()[4][6]:
                                    return c(_(e = c(e, c(c(function a(e, t, n) {
                                        var $_JHIc = PaLDJ.$_CS, $_JHHu = ["$_JIBx"].concat($_JHIc), $_JHJe = $_JHHu[1];
                                        $_JHHu.shift();
                                        var $_JIAj = $_JHHu[0];
                                        return t ^ (e | ~n);
                                    }(t, n, r), o), s)), i), t);
                                    break;
                            }
                        }
                    }

                    function i(e) {
                        var $_DDAIV = PaLDJ.$_Dz()[0][6];
                        for (; $_DDAIV !== PaLDJ.$_Dz()[2][4];) {
                            switch ($_DDAIV) {
                                case PaLDJ.$_Dz()[4][6]:
                                    var t, n = $_DAEj(253), r = $_DADR(253);
                                    for (t = 0; t <= 3; t++) n += (r = $_DAEj(246) + (e >>> 8 * t & 255)[$_DAEj(66)](16))[$_DAEj(201)](r[$_DADR(11)] - 2, 2);
                                    $_DDAIV = PaLDJ.$_Dz()[2][5];
                                    break;
                                case PaLDJ.$_Dz()[4][5]:
                                    return n;
                                    break;
                            }
                        }
                    }

                        var s, a, l, u, p, h, f, d, g, v;
                        for (s = function m(e) {
                            var $_JIDA = PaLDJ.$_CS, $_JICR = ["$_JIGJ"].concat($_JIDA), $_JIEU = $_JICR[1];
                            $_JICR.shift();
                            var $_JIFw = $_JICR[0];
                            var t, n = e[$_JIEU(11)], r = n + 8, o = 16 * (1 + (r - r % 64) / 64), i = Array(o - 1),
                                s = 0, a = 0;
                            while (a < n) s = a % 4 * 8, i[t = (a - a % 4) / 4] = i[t] | e[$_JIEU(54)](a) << s, a++;
                            return s = a % 4 * 8, i[t = (a - a % 4) / 4] = i[t] | 128 << s, i[o - 2] = n << 3, i[o - 1] = n >>> 29, i;
                        }(e = function x(e) {
                            var $_JIIt = PaLDJ.$_CS, $_JIHr = ["$_JJBd"].concat($_JIIt), $_JIJl = $_JIHr[1];
                            $_JIHr.shift();
                            var $_JJAA = $_JIHr[0];
                            e = e[$_JIIt(299)](/\r\n/g, $_JIJl(448));
                            for (var t = $_JIJl(253), n = 0; n < e[$_JIIt(11)]; n++) {
                                var r = e[$_JIIt(54)](n);
                                r < 128 ? t += String[$_JIIt(493)](r) : (127 < r && r < 2048 ? t += String[$_JIIt(493)](r >> 6 | 192) : (t += String[$_JIIt(493)](r >> 12 | 224), t += String[$_JIIt(493)](r >> 6 & 63 | 128)), t += String[$_JIIt(493)](63 & r | 128));
                            }
                            return t;
                        }(e)), f = 1732584193, d = 4023233417, g = 2562383102, v = 271733878, a = 0; a < s[$_DADR(11)]; a += 16) d = o(d = o(d = o(d = o(d = r(d = r(d = r(d = r(d = n(d = n(d = n(d = n(d = t(d = t(d = t(d = t(u = d, g = t(p = g, v = t(h = v, f = t(l = f, d, g, v, s[a + 0], 7, 3614090360), d, g, s[a + 1], 12, 3905402710), f, d, s[a + 2], 17, 606105819), v, f, s[a + 3], 22, 3250441966), g = t(g, v = t(v, f = t(f, d, g, v, s[a + 4], 7, 4118548399), d, g, s[a + 5], 12, 1200080426), f, d, s[a + 6], 17, 2821735955), v, f, s[a + 7], 22, 4249261313), g = t(g, v = t(v, f = t(f, d, g, v, s[a + 8], 7, 1770035416), d, g, s[a + 9], 12, 2336552879), f, d, s[a + 10], 17, 4294925233), v, f, s[a + 11], 22, 2304563134), g = t(g, v = t(v, f = t(f, d, g, v, s[a + 12], 7, 1804603682), d, g, s[a + 13], 12, 4254626195), f, d, s[a + 14], 17, 2792965006), v, f, s[a + 15], 22, 1236535329), g = n(g, v = n(v, f = n(f, d, g, v, s[a + 1], 5, 4129170786), d, g, s[a + 6], 9, 3225465664), f, d, s[a + 11], 14, 643717713), v, f, s[a + 0], 20, 3921069994), g = n(g, v = n(v, f = n(f, d, g, v, s[a + 5], 5, 3593408605), d, g, s[a + 10], 9, 38016083), f, d, s[a + 15], 14, 3634488961), v, f, s[a + 4], 20, 3889429448), g = n(g, v = n(v, f = n(f, d, g, v, s[a + 9], 5, 568446438), d, g, s[a + 14], 9, 3275163606), f, d, s[a + 3], 14, 4107603335), v, f, s[a + 8], 20, 1163531501), g = n(g, v = n(v, f = n(f, d, g, v, s[a + 13], 5, 2850285829), d, g, s[a + 2], 9, 4243563512), f, d, s[a + 7], 14, 1735328473), v, f, s[a + 12], 20, 2368359562), g = r(g, v = r(v, f = r(f, d, g, v, s[a + 5], 4, 4294588738), d, g, s[a + 8], 11, 2272392833), f, d, s[a + 11], 16, 1839030562), v, f, s[a + 14], 23, 4259657740), g = r(g, v = r(v, f = r(f, d, g, v, s[a + 1], 4, 2763975236), d, g, s[a + 4], 11, 1272893353), f, d, s[a + 7], 16, 4139469664), v, f, s[a + 10], 23, 3200236656), g = r(g, v = r(v, f = r(f, d, g, v, s[a + 13], 4, 681279174), d, g, s[a + 0], 11, 3936430074), f, d, s[a + 3], 16, 3572445317), v, f, s[a + 6], 23, 76029189), g = r(g, v = r(v, f = r(f, d, g, v, s[a + 9], 4, 3654602809), d, g, s[a + 12], 11, 3873151461), f, d, s[a + 15], 16, 530742520), v, f, s[a + 2], 23, 3299628645), g = o(g, v = o(v, f = o(f, d, g, v, s[a + 0], 6, 4096336452), d, g, s[a + 7], 10, 1126891415), f, d, s[a + 14], 15, 2878612391), v, f, s[a + 5], 21, 4237533241), g = o(g, v = o(v, f = o(f, d, g, v, s[a + 12], 6, 1700485571), d, g, s[a + 3], 10, 2399980690), f, d, s[a + 10], 15, 4293915773), v, f, s[a + 1], 21, 2240044497), g = o(g, v = o(v, f = o(f, d, g, v, s[a + 8], 6, 1873313359), d, g, s[a + 15], 10, 4264355552), f, d, s[a + 6], 15, 2734768916), v, f, s[a + 13], 21, 1309151649), g = o(g, v = o(v, f = o(f, d, g, v, s[a + 4], 6, 4149444226), d, g, s[a + 11], 10, 3174756917), f, d, s[a + 2], 15, 718787259), v, f, s[a + 9], 21, 3951481745), f = c(f, l), d = c(d, u), g = c(g, p), v = c(v, h);
                        return (i(f) + i(d) + i(g) + i(v))[$_DAEj(231)]();
                        break;
                }
            }
        }

        et[$_DAEj(447)] = $_DAEj(484);
        var X = function () {
            var $_JJDm = PaLDJ.$_CS, $_JJCm = ["$_JJGP"].concat($_JJDm), $_JJEu = $_JJCm[1];
            $_JJCm.shift();
            var $_JJFc = $_JJCm[0];

            function n() {
                var $_DDAJy = PaLDJ.$_Dz()[0][6];
                for (; $_DDAJy !== PaLDJ.$_Dz()[0][5];) {
                    switch ($_DDAJy) {
                        case PaLDJ.$_Dz()[2][6]:
                            this[$_JJDm(486)] = 0, this[$_JJEu(449)] = 0, this[$_JJDm(461)] = [];
                            $_DDAJy = PaLDJ.$_Dz()[4][5];
                            break;
                    }
                }
            }

            n[$_JJDm(91)][$_JJDm(65)] = function C(e) {
                var $_JJIH = PaLDJ.$_CS, $_JJHC = ["$_BAABx"].concat($_JJIH), $_JJJR = $_JJHC[1];
                $_JJHC.shift();
                var $_BAAAg = $_JJHC[0];
                var t, n, r;
                for (t = 0; t < 256; ++t) this[$_JJIH(461)][t] = t;
                for (t = n = 0; t < 256; ++t) n = n + this[$_JJIH(461)][t] + e[t % e[$_JJIH(11)]] & 255, r = this[$_JJIH(461)][t], this[$_JJJR(461)][t] = this[$_JJJR(461)][n], this[$_JJJR(461)][n] = r;
                this[$_JJJR(486)] = 0, this[$_JJJR(449)] = 0;
            }, n[$_JJEu(91)][$_JJEu(257)] = function k() {
                var $_BAADm = PaLDJ.$_CS, $_BAACe = ["$_BAAGq"].concat($_BAADm), $_BAAEE = $_BAACe[1];
                $_BAACe.shift();
                var $_BAAFZ = $_BAACe[0];
                var e;
                return this[$_BAAEE(486)] = this[$_BAADm(486)] + 1 & 255, this[$_BAADm(449)] = this[$_BAADm(449)] + this[$_BAADm(461)][this[$_BAAEE(486)]] & 255, e = this[$_BAADm(461)][this[$_BAADm(486)]], this[$_BAADm(461)][this[$_BAAEE(486)]] = this[$_BAADm(461)][this[$_BAAEE(449)]], this[$_BAADm(461)][this[$_BAAEE(449)]] = e, this[$_BAAEE(461)][e + this[$_BAADm(461)][this[$_BAADm(486)]] & 255];
            };
            var r, o, i, e, s = 256;
            if (null == o) {
                var t;
                o = [], i = 0;
                try {
                    if (window[$_JJEu(454)] && window[$_JJEu(454)][$_JJEu(401)]) {
                        var a = new Uint32Array(256);
                        for (window[$_JJDm(454)][$_JJEu(401)](a), t = 0; t < a[$_JJEu(11)]; ++t) o[i++] = 255 & a[t];
                    }
                } catch (S) {
                }
                var _ = 0, c = function (e) {
                    var $_BAAIb = PaLDJ.$_CS, $_BAAHL = ["$_BABBH"].concat($_BAAIb), $_BAAJR = $_BAAHL[1];
                    $_BAAHL.shift();
                    var $_BABAM = $_BAAHL[0];
                    if (256 <= (_ = _ || 0) || s <= i) window[$_BAAJR(494)] ? (_ = 0, window[$_BAAJR(494)]($_BAAJR(495), c, false)) : window[$_BAAJR(458)] && (_ = 0, window[$_BAAIb(458)]($_BAAJR(473), c)); else try {
                        var t = e[$_BAAIb(400)] + e[$_BAAIb(425)];
                        o[i++] = 255 & t, _ += 1;
                    } catch (S) {
                    }
                };
                window[$_JJDm(472)] ? window[$_JJEu(472)]($_JJDm(495), c, false) : window[$_JJDm(469)] && window[$_JJDm(469)]($_JJDm(473), c);
            }

            function l() {
                var $_DDBAG = PaLDJ.$_Dz()[4][6];
                for (; $_DDBAG !== PaLDJ.$_Dz()[0][4];) {
                    switch ($_DDBAG) {
                        case PaLDJ.$_Dz()[2][6]:
                            if (null == r) {
                                r = function t() {
                                    var $_BABDx = PaLDJ.$_CS, $_BABCy = ["$_BABGl"].concat($_BABDx),
                                        $_BABEI = $_BABCy[1];
                                    $_BABCy.shift();
                                    var $_BABFC = $_BABCy[0];
                                    return new n;
                                }();
                                while (i < s) {
                                    var e = Math[$_JJEu(464)](65536 * Math[$_JJDm(278)]());
                                    o[i++] = 255 & e;
                                }
                                for (r[$_JJDm(65)](o), i = 0; i < o[$_JJEu(11)]; ++i) o[i] = 0;
                                i = 0;
                            }
                            $_DDBAG = PaLDJ.$_Dz()[0][5];
                            break;
                        case PaLDJ.$_Dz()[0][5]:
                            return r[$_JJDm(257)]();
                            break;
                    }
                }
            }

            function u() {
                var $_DDBB_ = PaLDJ.$_Dz()[0][6];
                for (; $_DDBB_ !== PaLDJ.$_Dz()[4][6];) {
                    switch ($_DDBB_) {
                    }
                }
            }

            u[$_JJDm(91)][$_JJDm(414)] = function T(e) {
                var $_BABIR = PaLDJ.$_CS, $_BABHJ = ["$_BACBb"].concat($_BABIR), $_BABJX = $_BABHJ[1];
                $_BABHJ.shift();
                var $_BACAr = $_BABHJ[0];
                var t;
                for (t = 0; t < e[$_BABIR(11)]; ++t) e[t] = l();
            };

            function x(e, t, n) {
                var $_DDBCR = PaLDJ.$_Dz()[0][6];
                for (; $_DDBCR !== PaLDJ.$_Dz()[4][5];) {
                    switch ($_DDBCR) {
                        case PaLDJ.$_Dz()[4][6]:
                            null != e && ($_JJDm(347) == typeof e ? this[$_JJDm(483)](e, t, n) : null == t && $_JJDm(10) != typeof e ? this[$_JJDm(553)](e, 256) : this[$_JJEu(553)](e, t));
                            $_DDBCR = PaLDJ.$_Dz()[2][5];
                            break;
                    }
                }
            }

            function w() {
                var $_DDBDp = PaLDJ.$_Dz()[0][6];
                for (; $_DDBDp !== PaLDJ.$_Dz()[0][5];) {
                    switch ($_DDBDp) {
                        case PaLDJ.$_Dz()[4][6]:
                            return new x(null);
                            break;
                    }
                }
            }

            e = $_JJEu(502) == pe[$_JJDm(270)] ? (x[$_JJEu(91)][$_JJEu(569)] = function D(e, t, n, r, o, i) {
                var $_BACDi = PaLDJ.$_CS, $_BACCP = ["$_BACGf"].concat($_BACDi), $_BACEH = $_BACCP[1];
                $_BACCP.shift();
                var $_BACFi = $_BACCP[0];
                var s = 32767 & t, a = t >> 15;
                while (0 <= --i) {
                    var _ = 32767 & this[e], c = this[e++] >> 15, l = a * _ + c * s;
                    o = ((_ = s * _ + ((32767 & l) << 15) + n[r] + (1073741823 & o)) >>> 30) + (l >>> 15) + a * c + (o >>> 30), n[r++] = 1073741823 & _;
                }
                return o;
            }, 30) : $_JJEu(223) != pe[$_JJEu(270)] ? (x[$_JJDm(91)][$_JJDm(569)] = function A(e, t, n, r, o, i) {
                var $_BACIP = PaLDJ.$_CS, $_BACHC = ["$_BADBi"].concat($_BACIP), $_BACJt = $_BACHC[1];
                $_BACHC.shift();
                var $_BADAx = $_BACHC[0];
                while (0 <= --i) {
                    var s = t * this[e++] + n[r] + o;
                    o = Math[$_BACJt(464)](s / 67108864), n[r++] = 67108863 & s;
                }
                return o;
            }, 26) : (x[$_JJEu(91)][$_JJEu(569)] = function O(e, t, n, r, o, i) {
                var $_BADDG = PaLDJ.$_CS, $_BADCj = ["$_BADGY"].concat($_BADDG), $_BADEf = $_BADCj[1];
                $_BADCj.shift();
                var $_BADFZ = $_BADCj[0];
                var s = 16383 & t, a = t >> 14;
                while (0 <= --i) {
                    var _ = 16383 & this[e], c = this[e++] >> 14, l = a * _ + c * s;
                    o = ((_ = s * _ + ((16383 & l) << 14) + n[r] + o) >> 28) + (l >> 14) + a * c, n[r++] = 268435455 & _;
                }
                return o;
            }, 28), x[$_JJDm(91)][$_JJDm(531)] = e, x[$_JJDm(91)][$_JJDm(518)] = (1 << e) - 1, x[$_JJEu(91)][$_JJDm(571)] = 1 << e;
            x[$_JJEu(91)][$_JJDm(572)] = Math[$_JJEu(570)](2, 52), x[$_JJDm(91)][$_JJDm(567)] = 52 - e, x[$_JJEu(91)][$_JJDm(580)] = 2 * e - 52;
            var p, h, f = $_JJDm(546), d = [];
            for (p = $_JJEu(246)[$_JJDm(54)](0), h = 0; h <= 9; ++h) d[p++] = h;
            for (p = $_JJEu(341)[$_JJEu(54)](0), h = 10; h < 36; ++h) d[p++] = h;
            for (p = $_JJEu(540)[$_JJEu(54)](0), h = 10; h < 36; ++h) d[p++] = h;

            function g(e) {
                var $_DDBEj = PaLDJ.$_Dz()[4][6];
                for (; $_DDBEj !== PaLDJ.$_Dz()[0][5];) {
                    switch ($_DDBEj) {
                        case PaLDJ.$_Dz()[0][6]:
                            return f[$_JJDm(429)](e);
                            break;
                    }
                }
            }

            function v(e) {
                var $_DDBFX = PaLDJ.$_Dz()[4][6];
                for (; $_DDBFX !== PaLDJ.$_Dz()[2][4];) {
                    switch ($_DDBFX) {
                        case PaLDJ.$_Dz()[2][6]:
                            var t = w();
                            $_DDBFX = PaLDJ.$_Dz()[4][5];
                            break;
                        case PaLDJ.$_Dz()[0][5]:
                            return t[$_JJDm(528)](e), t;
                            break;
                    }
                }
            }

            function y(e) {
                var $_DDBGR = PaLDJ.$_Dz()[2][6];
                for (; $_DDBGR !== PaLDJ.$_Dz()[4][4];) {
                    switch ($_DDBGR) {
                        case PaLDJ.$_Dz()[2][6]:
                            var t, n = 1;
                            $_DDBGR = PaLDJ.$_Dz()[2][5];
                            break;
                        case PaLDJ.$_Dz()[0][5]:
                            return 0 != (t = e >>> 16) && (e = t, n += 16), 0 != (t = e >> 8) && (e = t, n += 8), 0 != (t = e >> 4) && (e = t, n += 4), 0 != (t = e >> 2) && (e = t, n += 2), 0 != (t = e >> 1) && (e = t, n += 1), n;
                            break;
                    }
                }
            }

            function m(e) {
                var $_DDBHc = PaLDJ.$_Dz()[4][6];
                for (; $_DDBHc !== PaLDJ.$_Dz()[4][5];) {
                    switch ($_DDBHc) {
                        case PaLDJ.$_Dz()[4][6]:
                            this[$_JJEu(526)] = e;
                            $_DDBHc = PaLDJ.$_Dz()[0][5];
                            break;
                    }
                }
            }

            function b(e) {
                var $_DDBIi = PaLDJ.$_Dz()[0][6];
                for (; $_DDBIi !== PaLDJ.$_Dz()[0][5];) {
                    switch ($_DDBIi) {
                        case PaLDJ.$_Dz()[4][6]:
                            this[$_JJEu(526)] = e, this[$_JJEu(558)] = e[$_JJEu(545)](), this[$_JJEu(537)] = 32767 & this[$_JJEu(558)], this[$_JJDm(588)] = this[$_JJDm(558)] >> 15, this[$_JJEu(593)] = (1 << e[$_JJDm(531)] - 15) - 1, this[$_JJDm(555)] = 2 * e[$_JJEu(500)];
                            $_DDBIi = PaLDJ.$_Dz()[2][5];
                            break;
                    }
                }
            }

            function E() {
                var $_DDBJB = PaLDJ.$_Dz()[2][6];
                for (; $_DDBJB !== PaLDJ.$_Dz()[2][4];) {
                    switch ($_DDBJB) {
                        case PaLDJ.$_Dz()[4][6]:
                            this[$_JJEu(539)] = null, this[$_JJDm(557)] = 0, this[$_JJEu(582)] = null, this[$_JJEu(523)] = null, this[$_JJDm(548)] = null, this[$_JJDm(512)] = null, this[$_JJEu(564)] = null, this[$_JJEu(565)] = null;
                            $_DDBJB = PaLDJ.$_Dz()[0][5];
                            break;
                        case PaLDJ.$_Dz()[2][5]:
                            this[$_JJEu(559)]($_JJDm(504), $_JJDm(585));
                            $_DDBJB = PaLDJ.$_Dz()[2][4];
                            break;
                    }
                }
            }

            return m[$_JJDm(91)][$_JJDm(547)] = function L(e) {
                var $_BADIn = PaLDJ.$_CS, $_BADHI = ["$_BAEBq"].concat($_BADIn), $_BADJ_ = $_BADHI[1];
                $_BADHI.shift();
                var $_BAEAz = $_BADHI[0];
                return e[$_BADIn(508)] < 0 || 0 <= e[$_BADIn(549)](this[$_BADIn(526)]) ? e[$_BADJ_(578)](this[$_BADJ_(526)]) : e;
            }, m[$_JJDm(91)][$_JJDm(543)] = function N(e) {
                var $_BAEDG = PaLDJ.$_CS, $_BAECA = ["$_BAEGZ"].concat($_BAEDG), $_BAEEb = $_BAECA[1];
                $_BAECA.shift();
                var $_BAEFO = $_BAECA[0];
                return e;
            }, m[$_JJEu(91)][$_JJDm(538)] = function R(e) {
                var $_BAEIn = PaLDJ.$_CS, $_BAEHz = ["$_BAFBX"].concat($_BAEIn), $_BAEJS = $_BAEHz[1];
                $_BAEHz.shift();
                var $_BAFAS = $_BAEHz[0];
                e[$_BAEJS(586)](this[$_BAEIn(526)], null, e);
            }, m[$_JJDm(91)][$_JJDm(579)] = function j(e, t, n) {
                var $_BAFDj = PaLDJ.$_CS, $_BAFCm = ["$_BAFGh"].concat($_BAFDj), $_BAFEE = $_BAFCm[1];
                $_BAFCm.shift();
                var $_BAFFE = $_BAFCm[0];
                e[$_BAFDj(544)](t, n), this[$_BAFDj(538)](n);
            }, m[$_JJDm(91)][$_JJEu(532)] = function B(e, t) {
                var $_BAFIb = PaLDJ.$_CS, $_BAFHc = ["$_BAGBy"].concat($_BAFIb), $_BAFJA = $_BAFHc[1];
                $_BAFHc.shift();
                var $_BAGAA = $_BAFHc[0];
                e[$_BAFJA(566)](t), this[$_BAFIb(538)](t);
            }, b[$_JJEu(91)][$_JJEu(547)] = function M(e) {
                var $_BAGDR = PaLDJ.$_CS, $_BAGCZ = ["$_BAGGC"].concat($_BAGDR), $_BAGEh = $_BAGCZ[1];
                $_BAGCZ.shift();
                var $_BAGFH = $_BAGCZ[0];
                var t = w();
                return e[$_BAGDR(581)]()[$_BAGEh(550)](this[$_BAGEh(526)][$_BAGDR(500)], t), t[$_BAGEh(586)](this[$_BAGDR(526)], null, t), e[$_BAGEh(508)] < 0 && 0 < t[$_BAGDR(549)](x[$_BAGDR(534)]) && this[$_BAGEh(526)][$_BAGDR(536)](t, t), t;
            }, b[$_JJDm(91)][$_JJEu(543)] = function P(e) {
                var $_BAGIw = PaLDJ.$_CS, $_BAGHS = ["$_BAHBD"].concat($_BAGIw), $_BAGJt = $_BAGHS[1];
                $_BAGHS.shift();
                var $_BAHAS = $_BAGHS[0];
                var t = w();
                return e[$_BAGJt(530)](t), this[$_BAGIw(538)](t), t;
            }, b[$_JJDm(91)][$_JJDm(538)] = function q(e) {
                var $_BAHDi = PaLDJ.$_CS, $_BAHCz = ["$_BAHGr"].concat($_BAHDi), $_BAHEb = $_BAHCz[1];
                $_BAHCz.shift();
                var $_BAHFH = $_BAHCz[0];
                while (e[$_BAHEb(500)] <= this[$_BAHDi(555)]) e[e[$_BAHEb(500)]++] = 0;
                for (var t = 0; t < this[$_BAHDi(526)][$_BAHEb(500)]; ++t) {
                    var n = 32767 & e[t],
                        r = n * this[$_BAHDi(537)] + ((n * this[$_BAHEb(588)] + (e[t] >> 15) * this[$_BAHDi(537)] & this[$_BAHDi(593)]) << 15) & e[$_BAHDi(518)];
                    e[n = t + this[$_BAHEb(526)][$_BAHEb(500)]] += this[$_BAHDi(526)][$_BAHDi(569)](0, r, e, t, 0, this[$_BAHEb(526)][$_BAHDi(500)]);
                    while (e[n] >= e[$_BAHDi(571)]) e[n] -= e[$_BAHDi(571)], e[++n]++;
                }
                e[$_BAHDi(89)](), e[$_BAHDi(542)](this[$_BAHEb(526)][$_BAHDi(500)], e), 0 <= e[$_BAHDi(549)](this[$_BAHDi(526)]) && e[$_BAHDi(536)](this[$_BAHEb(526)], e);
            }, b[$_JJEu(91)][$_JJEu(579)] = function I(e, t, n) {
                var $_BAHIV = PaLDJ.$_CS, $_BAHHo = ["$_BAIBc"].concat($_BAHIV), $_BAHJE = $_BAHHo[1];
                $_BAHHo.shift();
                var $_BAIAv = $_BAHHo[0];
                e[$_BAHJE(544)](t, n), this[$_BAHJE(538)](n);
            }, b[$_JJEu(91)][$_JJEu(532)] = function F(e, t) {
                var $_BAIDq = PaLDJ.$_CS, $_BAICe = ["$_BAIGe"].concat($_BAIDq), $_BAIEl = $_BAICe[1];
                $_BAICe.shift();
                var $_BAIFQ = $_BAICe[0];
                e[$_BAIDq(566)](t), this[$_BAIEl(538)](t);
            }, x[$_JJEu(91)][$_JJDm(530)] = function z(e) {
                var $_BAIIg = PaLDJ.$_CS, $_BAIHN = ["$_BAJBn"].concat($_BAIIg), $_BAIJR = $_BAIHN[1];
                $_BAIHN.shift();
                var $_BAJAw = $_BAIHN[0];
                for (var t = this[$_BAIJR(500)] - 1; 0 <= t; --t) e[t] = this[t];
                e[$_BAIIg(500)] = this[$_BAIIg(500)], e[$_BAIJR(508)] = this[$_BAIIg(508)];
            }, x[$_JJDm(91)][$_JJEu(528)] = function G(e) {
                var $_BAJDX = PaLDJ.$_CS, $_BAJCe = ["$_BAJGn"].concat($_BAJDX), $_BAJEx = $_BAJCe[1];
                $_BAJCe.shift();
                var $_BAJFD = $_BAJCe[0];
                this[$_BAJDX(500)] = 1, this[$_BAJEx(508)] = e < 0 ? -1 : 0, 0 < e ? this[0] = e : e < -1 ? this[0] = e + this[$_BAJEx(571)] : this[$_BAJDX(500)] = 0;
            }, x[$_JJEu(91)][$_JJEu(553)] = function H(e, t) {
                var $_BAJIr = PaLDJ.$_CS, $_BAJH_ = ["$_BBABD"].concat($_BAJIr), $_BAJJk = $_BAJH_[1];
                $_BAJH_.shift();
                var $_BBAAq = $_BAJH_[0];
                var n;
                if (16 == t) n = 4; else if (8 == t) n = 3; else if (256 == t) n = 8; else if (2 == t) n = 1; else if (32 == t) n = 5; else {
                    if (4 != t) return void this[$_BAJIr(529)](e, t);
                    n = 2;
                }
                this[$_BAJIr(500)] = 0, this[$_BAJIr(508)] = 0;
                var r, o, i = e[$_BAJJk(11)], s = false, a = 0;
                while (0 <= --i) {
                    var _ = 8 == n ? 255 & e[i] : (r = i, null == (o = d[e[$_BAJJk(54)](r)]) ? -1 : o);
                    _ < 0 ? $_BAJIr(296) == e[$_BAJJk(429)](i) && (s = true) : (s = false, 0 == a ? this[this[$_BAJIr(500)]++] = _ : a + n > this[$_BAJIr(531)] ? (this[this[$_BAJIr(500)] - 1] |= (_ & (1 << this[$_BAJIr(531)] - a) - 1) << a, this[this[$_BAJIr(500)]++] = _ >> this[$_BAJIr(531)] - a) : this[this[$_BAJIr(500)] - 1] |= _ << a, (a += n) >= this[$_BAJIr(531)] && (a -= this[$_BAJJk(531)]));
                }
                8 == n && 0 != (128 & e[0]) && (this[$_BAJJk(508)] = -1, 0 < a && (this[this[$_BAJIr(500)] - 1] |= (1 << this[$_BAJJk(531)] - a) - 1 << a)), this[$_BAJJk(89)](), s && x[$_BAJIr(534)][$_BAJIr(536)](this, this);
            }, x[$_JJEu(91)][$_JJEu(89)] = function X() {
                var $_BBADi = PaLDJ.$_CS, $_BBACy = ["$_BBAGV"].concat($_BBADi), $_BBAET = $_BBACy[1];
                $_BBACy.shift();
                var $_BBAFx = $_BBACy[0];
                var e = this[$_BBADi(508)] & this[$_BBAET(518)];
                while (0 < this[$_BBAET(500)] && this[this[$_BBAET(500)] - 1] == e) --this[$_BBADi(500)];
            }, x[$_JJEu(91)][$_JJEu(550)] = function V(e, t) {
                var $_BBAIX = PaLDJ.$_CS, $_BBAHh = ["$_BBBBR"].concat($_BBAIX), $_BBAJJ = $_BBAHh[1];
                $_BBAHh.shift();
                var $_BBBAG = $_BBAHh[0];
                var n;
                for (n = this[$_BBAJJ(500)] - 1; 0 <= n; --n) t[n + e] = this[n];
                for (n = e - 1; 0 <= n; --n) t[n] = 0;
                t[$_BBAIX(500)] = this[$_BBAIX(500)] + e, t[$_BBAIX(508)] = this[$_BBAJJ(508)];
            }, x[$_JJEu(91)][$_JJDm(542)] = function U(e, t) {
                var $_BBBDA = PaLDJ.$_CS, $_BBBCC = ["$_BBBGU"].concat($_BBBDA), $_BBBEK = $_BBBCC[1];
                $_BBBCC.shift();
                var $_BBBFS = $_BBBCC[0];
                for (var n = e; n < this[$_BBBEK(500)]; ++n) t[n - e] = this[n];
                t[$_BBBDA(500)] = Math[$_BBBEK(83)](this[$_BBBEK(500)] - e, 0), t[$_BBBDA(508)] = this[$_BBBDA(508)];
            }, x[$_JJDm(91)][$_JJDm(524)] = function $(e, t) {
                var $_BBBIz = PaLDJ.$_CS, $_BBBHW = ["$_BBCBl"].concat($_BBBIz), $_BBBJV = $_BBBHW[1];
                $_BBBHW.shift();
                var $_BBCAc = $_BBBHW[0];
                var n, r = e % this[$_BBBIz(531)], o = this[$_BBBIz(531)] - r, i = (1 << o) - 1,
                    s = Math[$_BBBIz(464)](e / this[$_BBBJV(531)]), a = this[$_BBBJV(508)] << r & this[$_BBBJV(518)];
                for (n = this[$_BBBJV(500)] - 1; 0 <= n; --n) t[n + s + 1] = this[n] >> o | a, a = (this[n] & i) << r;
                for (n = s - 1; 0 <= n; --n) t[n] = 0;
                t[s] = a, t[$_BBBJV(500)] = this[$_BBBJV(500)] + s + 1, t[$_BBBJV(508)] = this[$_BBBJV(508)], t[$_BBBJV(89)]();
            }, x[$_JJDm(91)][$_JJEu(506)] = function Y(e, t) {
                var $_BBCDP = PaLDJ.$_CS, $_BBCCT = ["$_BBCGI"].concat($_BBCDP), $_BBCEV = $_BBCCT[1];
                $_BBCCT.shift();
                var $_BBCFi = $_BBCCT[0];
                t[$_BBCEV(508)] = this[$_BBCEV(508)];
                var n = Math[$_BBCEV(464)](e / this[$_BBCDP(531)]);
                if (n >= this[$_BBCDP(500)]) t[$_BBCDP(500)] = 0; else {
                    var r = e % this[$_BBCEV(531)], o = this[$_BBCDP(531)] - r, i = (1 << r) - 1;
                    t[0] = this[n] >> r;
                    for (var s = n + 1; s < this[$_BBCEV(500)]; ++s) t[s - n - 1] |= (this[s] & i) << o, t[s - n] = this[s] >> r;
                    0 < r && (t[this[$_BBCEV(500)] - n - 1] |= (this[$_BBCDP(508)] & i) << o), t[$_BBCEV(500)] = this[$_BBCDP(500)] - n, t[$_BBCDP(89)]();
                }
            }, x[$_JJEu(91)][$_JJEu(536)] = function W(e, t) {
                var $_BBCIT = PaLDJ.$_CS, $_BBCHP = ["$_BBDBS"].concat($_BBCIT), $_BBCJt = $_BBCHP[1];
                $_BBCHP.shift();
                var $_BBDAY = $_BBCHP[0];
                var n = 0, r = 0, o = Math[$_BBCIT(74)](e[$_BBCIT(500)], this[$_BBCIT(500)]);
                while (n < o) r += this[n] - e[n], t[n++] = r & this[$_BBCIT(518)], r >>= this[$_BBCJt(531)];
                if (e[$_BBCIT(500)] < this[$_BBCIT(500)]) {
                    r -= e[$_BBCIT(508)];
                    while (n < this[$_BBCJt(500)]) r += this[n], t[n++] = r & this[$_BBCJt(518)], r >>= this[$_BBCIT(531)];
                    r += this[$_BBCIT(508)];
                } else {
                    r += this[$_BBCJt(508)];
                    while (n < e[$_BBCJt(500)]) r -= e[n], t[n++] = r & this[$_BBCJt(518)], r >>= this[$_BBCIT(531)];
                    r -= e[$_BBCIT(508)];
                }
                t[$_BBCJt(508)] = r < 0 ? -1 : 0, r < -1 ? t[n++] = this[$_BBCJt(571)] + r : 0 < r && (t[n++] = r), t[$_BBCJt(500)] = n, t[$_BBCJt(89)]();
            }, x[$_JJDm(91)][$_JJDm(544)] = function J(e, t) {
                var $_BBDDD = PaLDJ.$_CS, $_BBDCV = ["$_BBDGf"].concat($_BBDDD), $_BBDEE = $_BBDCV[1];
                $_BBDCV.shift();
                var $_BBDFJ = $_BBDCV[0];
                var n = this[$_BBDEE(581)](), r = e[$_BBDEE(581)](), o = n[$_BBDEE(500)];
                t[$_BBDEE(500)] = o + r[$_BBDEE(500)];
                while (0 <= --o) t[o] = 0;
                for (o = 0; o < r[$_BBDDD(500)]; ++o) t[o + n[$_BBDDD(500)]] = n[$_BBDEE(569)](0, r[o], t, o, 0, n[$_BBDEE(500)]);
                t[$_BBDEE(508)] = 0, t[$_BBDDD(89)](), this[$_BBDEE(508)] != e[$_BBDDD(508)] && x[$_BBDDD(534)][$_BBDEE(536)](t, t);
            }, x[$_JJEu(91)][$_JJEu(566)] = function K(e) {
                var $_BBDIO = PaLDJ.$_CS, $_BBDHP = ["$_BBEBg"].concat($_BBDIO), $_BBDJI = $_BBDHP[1];
                $_BBDHP.shift();
                var $_BBEAA = $_BBDHP[0];
                var t = this[$_BBDJI(581)](), n = e[$_BBDIO(500)] = 2 * t[$_BBDJI(500)];
                while (0 <= --n) e[n] = 0;
                for (n = 0; n < t[$_BBDIO(500)] - 1; ++n) {
                    var r = t[$_BBDIO(569)](n, t[n], e, 2 * n, 0, 1);
                    (e[n + t[$_BBDJI(500)]] += t[$_BBDIO(569)](n + 1, 2 * t[n], e, 2 * n + 1, r, t[$_BBDJI(500)] - n - 1)) >= t[$_BBDJI(571)] && (e[n + t[$_BBDJI(500)]] -= t[$_BBDIO(571)], e[n + t[$_BBDJI(500)] + 1] = 1);
                }
                0 < e[$_BBDIO(500)] && (e[e[$_BBDJI(500)] - 1] += t[$_BBDJI(569)](n, t[n], e, 2 * n, 0, 1)), e[$_BBDIO(508)] = 0, e[$_BBDIO(89)]();
            }, x[$_JJEu(91)][$_JJEu(586)] = function Z(e, t, n) {
                var $_BBEDb = PaLDJ.$_CS, $_BBECT = ["$_BBEGC"].concat($_BBEDb), $_BBEEX = $_BBECT[1];
                $_BBECT.shift();
                var $_BBEFb = $_BBECT[0];
                var r = e[$_BBEDb(581)]();
                if (!(r[$_BBEEX(500)] <= 0)) {
                    var o = this[$_BBEEX(581)]();
                    if (o[$_BBEEX(500)] < r[$_BBEEX(500)]) return null != t && t[$_BBEDb(528)](0), void (null != n && this[$_BBEEX(530)](n));
                    null == n && (n = w());
                    var i = w(), s = this[$_BBEDb(508)], a = e[$_BBEEX(508)],
                        _ = this[$_BBEEX(531)] - y(r[r[$_BBEDb(500)] - 1]);
                    0 < _ ? (r[$_BBEEX(524)](_, i), o[$_BBEEX(524)](_, n)) : (r[$_BBEDb(530)](i), o[$_BBEEX(530)](n));
                    var c = i[$_BBEDb(500)], l = i[c - 1];
                    if (0 != l) {
                        var u = l * (1 << this[$_BBEDb(567)]) + (1 < c ? i[c - 2] >> this[$_BBEDb(580)] : 0),
                            p = this[$_BBEEX(572)] / u, h = (1 << this[$_BBEEX(567)]) / u, f = 1 << this[$_BBEDb(580)],
                            d = n[$_BBEDb(500)], g = d - c, v = null == t ? w() : t;
                        i[$_BBEEX(550)](g, v), 0 <= n[$_BBEDb(549)](v) && (n[n[$_BBEEX(500)]++] = 1, n[$_BBEDb(536)](v, n)), x[$_BBEEX(522)][$_BBEDb(550)](c, v), v[$_BBEEX(536)](i, i);
                        while (i[$_BBEEX(500)] < c) i[i[$_BBEEX(500)]++] = 0;
                        while (0 <= --g) {
                            var m = n[--d] == l ? this[$_BBEEX(518)] : Math[$_BBEEX(464)](n[d] * p + (n[d - 1] + f) * h);
                            if ((n[d] += i[$_BBEDb(569)](0, m, n, g, 0, c)) < m) {
                                i[$_BBEEX(550)](g, v), n[$_BBEDb(536)](v, n);
                                while (n[d] < --m) n[$_BBEEX(536)](v, n);
                            }
                        }
                        null != t && (n[$_BBEDb(542)](c, t), s != a && x[$_BBEDb(534)][$_BBEEX(536)](t, t)), n[$_BBEDb(500)] = c, n[$_BBEEX(89)](), 0 < _ && n[$_BBEEX(506)](_, n), s < 0 && x[$_BBEEX(534)][$_BBEDb(536)](n, n);
                    }
                }
            }, x[$_JJDm(91)][$_JJDm(545)] = function Q() {
                var $_BBEId = PaLDJ.$_CS, $_BBEHl = ["$_BBFBv"].concat($_BBEId), $_BBEJh = $_BBEHl[1];
                $_BBEHl.shift();
                var $_BBFAA = $_BBEHl[0];
                if (this[$_BBEId(500)] < 1) return 0;
                var e = this[0];
                if (0 == (1 & e)) return 0;
                var t = 3 & e;
                return 0 < (t = (t = (t = (t = t * (2 - (15 & e) * t) & 15) * (2 - (255 & e) * t) & 255) * (2 - ((65535 & e) * t & 65535)) & 65535) * (2 - e * t % this[$_BBEJh(571)]) % this[$_BBEId(571)]) ? this[$_BBEId(571)] - t : -t;
            }, x[$_JJDm(91)][$_JJDm(584)] = function $_EA() {
                var $_BBFDk = PaLDJ.$_CS, $_BBFCH = ["$_BBFGi"].concat($_BBFDk), $_BBFEq = $_BBFCH[1];
                $_BBFCH.shift();
                var $_BBFFf = $_BBFCH[0];
                return 0 == (0 < this[$_BBFDk(500)] ? 1 & this[0] : this[$_BBFEq(508)]);
            }, x[$_JJDm(91)][$_JJEu(556)] = function te(e, t) {
                var $_BBFIy = PaLDJ.$_CS, $_BBFHm = ["$_BBGBK"].concat($_BBFIy), $_BBFJU = $_BBFHm[1];
                $_BBFHm.shift();
                var $_BBGAa = $_BBFHm[0];
                if (4294967295 < e || e < 1) return x[$_BBFIy(522)];
                var n = w(), r = w(), o = t[$_BBFJU(547)](this), i = y(e) - 1;
                o[$_BBFIy(530)](n);
                while (0 <= --i) if (t[$_BBFIy(532)](n, r), 0 < (e & 1 << i)) t[$_BBFJU(579)](r, o, n); else {
                    var s = n;
                    n = r, r = s;
                }
                return t[$_BBFIy(543)](n);
            }, x[$_JJEu(91)][$_JJDm(66)] = function $_Fc(e) {
                var $_BBGDD = PaLDJ.$_CS, $_BBGCY = ["$_BBGGm"].concat($_BBGDD), $_BBGEK = $_BBGCY[1];
                $_BBGCY.shift();
                var $_BBGFZ = $_BBGCY[0];
                if (this[$_BBGEK(508)] < 0) return $_BBGDD(296) + this[$_BBGEK(514)]()[$_BBGEK(66)](e);
                var t;
                if (16 == e) t = 4; else if (8 == e) t = 3; else if (2 == e) t = 1; else if (32 == e) t = 5; else {
                    if (4 != e) return this[$_BBGDD(541)](e);
                    t = 2;
                }
                var n, r = (1 << t) - 1, o = false, i = $_BBGEK(253), s = this[$_BBGDD(500)],
                    a = this[$_BBGEK(531)] - s * this[$_BBGDD(531)] % t;
                if (0 < s--) {
                    a < this[$_BBGDD(531)] && 0 < (n = this[s] >> a) && (o = true, i = g(n));
                    while (0 <= s) a < t ? (n = (this[s] & (1 << a) - 1) << t - a, n |= this[--s] >> (a += this[$_BBGDD(531)] - t)) : (n = this[s] >> (a -= t) & r, a <= 0 && (a += this[$_BBGDD(531)], --s)), 0 < n && (o = true), o && (i += g(n));
                }
                return o ? i : $_BBGDD(246);
            }, x[$_JJEu(91)][$_JJDm(514)] = function $_GM() {
                var $_BBGIy = PaLDJ.$_CS, $_BBGHs = ["$_BBHBL"].concat($_BBGIy), $_BBGJD = $_BBGHs[1];
                $_BBGHs.shift();
                var $_BBHAb = $_BBGHs[0];
                var e = w();
                return x[$_BBGIy(534)][$_BBGJD(536)](this, e), e;
            }, x[$_JJEu(91)][$_JJDm(581)] = function $_Ht() {
                var $_BBHDE = PaLDJ.$_CS, $_BBHCX = ["$_BBHGE"].concat($_BBHDE), $_BBHEZ = $_BBHCX[1];
                $_BBHCX.shift();
                var $_BBHFa = $_BBHCX[0];
                return this[$_BBHDE(508)] < 0 ? this[$_BBHDE(514)]() : this;
            }, x[$_JJDm(91)][$_JJDm(549)] = function $_Ib(e) {
                var $_BBHIg = PaLDJ.$_CS, $_BBHH_ = ["$_BBIBN"].concat($_BBHIg), $_BBHJG = $_BBHH_[1];
                $_BBHH_.shift();
                var $_BBIAn = $_BBHH_[0];
                var t = this[$_BBHJG(508)] - e[$_BBHJG(508)];
                if (0 != t) return t;
                var n = this[$_BBHIg(500)];
                if (0 != (t = n - e[$_BBHJG(500)])) return this[$_BBHJG(508)] < 0 ? -t : t;
                while (0 <= --n) if (0 != (t = this[n] - e[n])) return t;
                return 0;
            }, x[$_JJDm(91)][$_JJDm(535)] = function $_JM() {
                var $_BBIDJ = PaLDJ.$_CS, $_BBIC_ = ["$_BBIGF"].concat($_BBIDJ), $_BBIEG = $_BBIC_[1];
                $_BBIC_.shift();
                var $_BBIFV = $_BBIC_[0];
                return this[$_BBIEG(500)] <= 0 ? 0 : this[$_BBIDJ(531)] * (this[$_BBIEG(500)] - 1) + y(this[this[$_BBIEG(500)] - 1] ^ this[$_BBIDJ(508)] & this[$_BBIDJ(518)]);
            }, x[$_JJEu(91)][$_JJEu(578)] = function $_BAE(e) {
                var $_BBIIY = PaLDJ.$_CS, $_BBIHS = ["$_BBJBr"].concat($_BBIIY), $_BBIJR = $_BBIHS[1];
                $_BBIHS.shift();
                var $_BBJAR = $_BBIHS[0];
                var t = w();
                return this[$_BBIIY(581)]()[$_BBIIY(586)](e, null, t), this[$_BBIJR(508)] < 0 && 0 < t[$_BBIIY(549)](x[$_BBIIY(534)]) && e[$_BBIJR(536)](t, t), t;
            }, x[$_JJDm(91)][$_JJDm(560)] = function $_DJm(e, t) {
                var $_BBJDc = PaLDJ.$_CS, $_BBJCk = ["$_BBJGp"].concat($_BBJDc), $_BBJEa = $_BBJCk[1];
                $_BBJCk.shift();
                var $_BBJFK = $_BBJCk[0];
                var n;
                return n = e < 256 || t[$_BBJEa(584)]() ? new m(t) : new b(t), this[$_BBJDc(556)](e, n);
            }, x[$_JJDm(534)] = v(0), x[$_JJEu(522)] = v(1), E[$_JJEu(91)][$_JJDm(561)] = function ce(e) {
                var $_BBJIe = PaLDJ.$_CS, $_BBJHb = ["$_BCABs"].concat($_BBJIe), $_BBJJZ = $_BBJHb[1];
                $_BBJHb.shift();
                var $_BCAAt = $_BBJHb[0];
                return e[$_BBJJZ(560)](this[$_BBJJZ(557)], this[$_BBJIe(539)]);
            }, E[$_JJEu(91)][$_JJDm(559)] = function le(e, t) {
                var $_BCADT = PaLDJ.$_CS, $_BCACX = ["$_BCAGu"].concat($_BCADT), $_BCAEc = $_BCACX[1];
                $_BCACX.shift();
                var $_BCAFP = $_BCACX[0];
                null != e && null != t && 0 < e[$_BCAEc(11)] && 0 < t[$_BCADT(11)] ? (this[$_BCADT(539)] = function n(e, t) {
                    var $_BCAIs = PaLDJ.$_CS, $_BCAHD = ["$_BCBBJ"].concat($_BCAIs), $_BCAJn = $_BCAHD[1];
                    $_BCAHD.shift();
                    var $_BCBAe = $_BCAHD[0];
                    return new x(e, t);
                }(e, 16), this[$_BCAEc(557)] = parseInt(t, 16)) : console && console[$_BCADT(307)] && console[$_BCAEc(307)]($_BCAEc(533));
            }, E[$_JJDm(91)][$_JJEu(87)] = function ue(e) {
                var $_BCBDH = PaLDJ.$_CS, $_BCBCd = ["$_BCBGt"].concat($_BCBDH), $_BCBEq = $_BCBCd[1];
                $_BCBCd.shift();
                var $_BCBFY = $_BCBCd[0];
                var t = function a(e, t) {
                    var $_BCBIT = PaLDJ.$_CS, $_BCBHa = ["$_BCCBN"].concat($_BCBIT), $_BCBJW = $_BCBHa[1];
                    $_BCBHa.shift();
                    var $_BCCAd = $_BCBHa[0];
                    if (t < e[$_BCBIT(11)] + 11) return console && console[$_BCBIT(307)] && console[$_BCBIT(307)]($_BCBIT(573)), null;
                    var n = [], r = e[$_BCBJW(11)] - 1;
                    while (0 <= r && 0 < t) {
                        var o = e[$_BCBIT(54)](r--);
                        o < 128 ? n[--t] = o : 127 < o && o < 2048 ? (n[--t] = 63 & o | 128, n[--t] = o >> 6 | 192) : (n[--t] = 63 & o | 128, n[--t] = o >> 6 & 63 | 128, n[--t] = o >> 12 | 224);
                    }
                    n[--t] = 0;
                    var i = new u, s = [];
                    while (2 < t) {
                        s[0] = 0;
                        while (0 == s[0]) i[$_BCBJW(414)](s);
                        n[--t] = s[0];
                    }
                    return n[--t] = 2, n[--t] = 0, new x(n);
                }(e, this[$_BCBEq(539)][$_BCBDH(535)]() + 7 >> 3);
                if (null == t) return null;
                var n = this[$_BCBDH(561)](t);
                if (null == n) return null;
                var r = n[$_BCBDH(66)](16);
                return 0 == (1 & r[$_BCBDH(11)]) ? r : $_BCBEq(246) + r;
            }, E;
        }(), V = function (e) {
            var $_BCCDl = PaLDJ.$_CS, $_BCCCi = ["$_BCCGO"].concat($_BCCDl), $_BCCEa = $_BCCCi[1];
            $_BCCCi.shift();
            var $_BCCFP = $_BCCCi[0];
            var s = function (e) {
                var $_BCCIi = PaLDJ.$_CS, $_BCCHc = ["$_BCDBM"].concat($_BCCIi), $_BCCJo = $_BCCHc[1];
                $_BCCHc.shift();
                var $_BCDAf = $_BCCHc[0];
                return $_BCCJo(200) == typeof e;
            }, a = function (e) {
                var $_BCDDr = PaLDJ.$_CS, $_BCDCU = ["$_BCDGA"].concat($_BCDDr), $_BCDEe = $_BCDCU[1];
                $_BCDCU.shift();
                var $_BCDFl = $_BCDCU[0];
                e();
            };

            function r() {
                var $_DDCAa = PaLDJ.$_Dz()[4][6];
                for (; $_DDCAa !== PaLDJ.$_Dz()[2][5];) {
                    switch ($_DDCAa) {
                        case PaLDJ.$_Dz()[0][6]:
                            this[$_BCCEa(590)] = this[$_BCCEa(527)] = null;
                            $_DDCAa = PaLDJ.$_Dz()[4][5];
                            break;
                    }
                }
            }

            var _ = function (t, e) {
                var $_BCDIQ = PaLDJ.$_CS, $_BCDHb = ["$_BCEBY"].concat($_BCDIQ), $_BCDJD = $_BCDHb[1];
                $_BCDHb.shift();
                var $_BCEAh = $_BCDHb[0];
                if (t === e) t[$_BCDJD(525)](new TypeError); else if (e instanceof l) e[$_BCDJD(576)](function (e) {
                    var $_BCEDl = PaLDJ.$_CS, $_BCECv = ["$_BCEGi"].concat($_BCEDl), $_BCEEC = $_BCECv[1];
                    $_BCECv.shift();
                    var $_BCEFt = $_BCECv[0];
                    _(t, e);
                }, function (e) {
                    var $_BCEIa = PaLDJ.$_CS, $_BCEHy = ["$_BCFBk"].concat($_BCEIa), $_BCEJb = $_BCEHy[1];
                    $_BCEHy.shift();
                    var $_BCFAc = $_BCEHy[0];
                    t[$_BCEJb(525)](e);
                }); else if (s(e) || function (e) {
                    var $_BCFDA = PaLDJ.$_CS, $_BCFCL = ["$_BCFGZ"].concat($_BCFDA), $_BCFEB = $_BCFCL[1];
                    $_BCFCL.shift();
                    var $_BCFFK = $_BCFCL[0];
                    return $_BCFEB(9) == typeof e && null !== e;
                }(e)) {
                    var n;
                    try {
                        n = e[$_BCDJD(576)];
                    } catch (o) {
                        return l[$_BCDJD(563)](o), void t[$_BCDIQ(525)](o);
                    }
                    var r = false;
                    if (s(n)) try {
                        n[$_BCDIQ(72)](e, function (e) {
                            var $_BCFIE = PaLDJ.$_CS, $_BCFHP = ["$_BCGBr"].concat($_BCFIE), $_BCFJl = $_BCFHP[1];
                            $_BCFHP.shift();
                            var $_BCGAo = $_BCFHP[0];
                            r || (r = true, _(t, e));
                        }, function (e) {
                            var $_BCGDA = PaLDJ.$_CS, $_BCGCj = ["$_BCGGX"].concat($_BCGDA), $_BCGED = $_BCGCj[1];
                            $_BCGCj.shift();
                            var $_BCGFV = $_BCGCj[0];
                            r || (r = true, t[$_BCGED(525)](e));
                        });
                    } catch (o) {
                        if (r) return;
                        r = true, t[$_BCDJD(525)](o);
                    } else t[$_BCDJD(551)](e);
                } else t[$_BCDJD(551)](e);
            };

            function l(e) {
                var $_DDCBo = PaLDJ.$_Dz()[0][6];
                for (; $_DDCBo !== PaLDJ.$_Dz()[4][5];) {
                    switch ($_DDCBo) {
                        case PaLDJ.$_Dz()[0][6]:
                            var t = this;
                            if (t[$_BCCDl(589)] = t[$_BCCEa(598)], t[$_BCCDl(513)] = new r, t[$_BCCEa(552)] = new r, s(e)) try {
                                e(function (e) {
                                    var $_BCGIk = PaLDJ.$_CS, $_BCGHN = ["$_BCHBp"].concat($_BCGIk),
                                        $_BCGJk = $_BCGHN[1];
                                    $_BCGHN.shift();
                                    var $_BCHAO = $_BCGHN[0];
                                    t[$_BCGJk(551)](e);
                                }, function (e) {
                                    var $_BCHDa = PaLDJ.$_CS, $_BCHCC = ["$_BCHGF"].concat($_BCHDa),
                                        $_BCHEh = $_BCHCC[1];
                                    $_BCHCC.shift();
                                    var $_BCHFk = $_BCHCC[0];
                                    t[$_BCHDa(525)](e);
                                });
                            } catch (n) {
                                l[$_BCCEa(563)](n);
                            }
                            $_DDCBo = PaLDJ.$_Dz()[2][5];
                            break;
                    }
                }
            }

            var t = !(r[$_BCCEa(91)] = {
                enqueue: function (e) {
                    var $_BCHIm = PaLDJ.$_CS, $_BCHHr = ["$_BCIBZ"].concat($_BCHIm), $_BCHJw = $_BCHHr[1];
                    $_BCHHr.shift();
                    var $_BCIAj = $_BCHHr[0];
                    var t = this, n = {ele: e, next: null};
                    null === t[$_BCHJw(590)] ? t[$_BCHJw(590)] = this[$_BCHJw(527)] = n : (t[$_BCHIm(527)][$_BCHIm(257)] = n, t[$_BCHIm(527)] = t[$_BCHIm(527)][$_BCHIm(257)]);
                }, dequeue: function () {
                    var $_BCIDt = PaLDJ.$_CS, $_BCICr = ["$_BCIGz"].concat($_BCIDt), $_BCIEn = $_BCICr[1];
                    $_BCICr.shift();
                    var $_BCIFX = $_BCICr[0];
                    if (null === this[$_BCIDt(590)]) throw new Error($_BCIEn(520));
                    var e = this[$_BCIEn(590)][$_BCIDt(511)];
                    return this[$_BCIEn(590)] = this[$_BCIEn(590)][$_BCIDt(257)], e;
                }, isEmpty: function () {
                    var $_BCIIu = PaLDJ.$_CS, $_BCIHo = ["$_BCJBh"].concat($_BCIIu), $_BCIJP = $_BCIHo[1];
                    $_BCIHo.shift();
                    var $_BCJAd = $_BCIHo[0];
                    return null === this[$_BCIIu(590)];
                }, clear: function () {
                    var $_BCJDN = PaLDJ.$_CS, $_BCJCW = ["$_BCJGJ"].concat($_BCJDN), $_BCJEY = $_BCJCW[1];
                    $_BCJCW.shift();
                    var $_BCJFV = $_BCJCW[0];
                    this[$_BCJDN(590)] = this[$_BCJEY(587)] = null;
                }, each: function (e) {
                    var $_BCJIq = PaLDJ.$_CS, $_BCJHP = ["$_BDABn"].concat($_BCJIq), $_BCJJF = $_BCJHP[1];
                    $_BCJHP.shift();
                    var $_BDAAJ = $_BCJHP[0];
                    this[$_BCJIq(591)]() || (e(this[$_BCJIq(503)]()), this[$_BCJIq(592)](e));
                }
            });
            return l[$_BCCDl(574)] = function () {
                var $_BDADz = PaLDJ.$_CS, $_BDACw = ["$_BDAGi"].concat($_BDADz), $_BDAEV = $_BDACw[1];
                $_BDACw.shift();
                var $_BDAFw = $_BDACw[0];
                t = true;
            }, l[$_BCCEa(563)] = function (e) {
                var $_BDAIP = PaLDJ.$_CS, $_BDAHr = ["$_BDBBs"].concat($_BDAIP), $_BDAJS = $_BDAHr[1];
                $_BDAHr.shift();
                var $_BDBAo = $_BDAHr[0];
                c(e, true), t && $_BDAIP(26) != typeof console && console[$_BDAJS(307)](e);
            }, l[$_BCCEa(91)] = {
                PENDING: 0, RESOLVED: 1, REJECTED: -1, $_IET: function (e) {
                    var $_BDBDC = PaLDJ.$_CS, $_BDBCf = ["$_BDBGG"].concat($_BDBDC), $_BDBEH = $_BDBCf[1];
                    $_BDBCf.shift();
                    var $_BDBFv = $_BDBCf[0];
                    var t = this;
                    t[$_BDBDC(589)] === t[$_BDBEH(598)] && (t[$_BDBDC(589)] = t[$_BDBDC(577)], t[$_BDBEH(517)] = e, t[$_BDBEH(583)]());
                }, $_ICl: function (e) {
                    var $_BDBIY = PaLDJ.$_CS, $_BDBHU = ["$_BDCBI"].concat($_BDBIY), $_BDBJI = $_BDBHU[1];
                    $_BDBHU.shift();
                    var $_BDCA_ = $_BDBHU[0];
                    var t = this;
                    t[$_BDBJI(589)] === t[$_BDBJI(598)] && (t[$_BDBIY(589)] = t[$_BDBIY(519)], t[$_BDBIY(501)] = e, t[$_BDBJI(583)]());
                }, $_JAL: function () {
                    var $_BDCDz = PaLDJ.$_CS, $_BDCCk = ["$_BDCGr"].concat($_BDCDz), $_BDCEk = $_BDCCk[1];
                    $_BDCCk.shift();
                    var $_BDCFX = $_BDCCk[0];
                    var e, t, n = this, r = n[$_BDCEk(589)];
                    r === n[$_BDCEk(577)] ? (e = n[$_BDCEk(513)], n[$_BDCEk(552)][$_BDCDz(507)](), t = n[$_BDCEk(517)]) : r === n[$_BDCEk(519)] && (e = n[$_BDCEk(552)], n[$_BDCEk(513)][$_BDCDz(507)](), t = n[$_BDCEk(501)]), e[$_BDCEk(592)](function (e) {
                        var $_BDCIo = PaLDJ.$_CS, $_BDCHy = ["$_BDDBf"].concat($_BDCIo), $_BDCJe = $_BDCHy[1];
                        $_BDCHy.shift();
                        var $_BDDAg = $_BDCHy[0];
                        a(function () {
                            var $_BDDDx = PaLDJ.$_CS, $_BDDCc = ["$_BDDGj"].concat($_BDDDx), $_BDDEg = $_BDDCc[1];
                            $_BDDCc.shift();
                            var $_BDDFV = $_BDDCc[0];
                            e(r, t);
                        });
                    });
                }, $_JCe: function (n, r, o) {
                    var $_BDDIi = PaLDJ.$_CS, $_BDDHi = ["$_BDEBl"].concat($_BDDIi), $_BDDJb = $_BDDHi[1];
                    $_BDDHi.shift();
                    var $_BDEAq = $_BDDHi[0];
                    var i = this;
                    a(function () {
                        var $_BDEDZ = PaLDJ.$_CS, $_BDECu = ["$_BDEGM"].concat($_BDEDZ), $_BDEEN = $_BDECu[1];
                        $_BDECu.shift();
                        var $_BDEFs = $_BDECu[0];
                        if (s(r)) {
                            var e;
                            try {
                                e = r(o);
                            } catch (t) {
                                return l[$_BDEDZ(563)](t), void i[$_BDEDZ(525)](t);
                            }
                            _(i, e);
                        } else n === i[$_BDEDZ(577)] ? i[$_BDEDZ(551)](o) : n === i[$_BDEDZ(519)] && i[$_BDEDZ(525)](o);
                    });
                }, then: function (n, r) {
                    var $_BDEIo = PaLDJ.$_CS, $_BDEHg = ["$_BDFBb"].concat($_BDEIo), $_BDEJl = $_BDEHg[1];
                    $_BDEHg.shift();
                    var $_BDFAG = $_BDEHg[0];
                    var e = this, o = new l;
                    return e[$_BDEJl(513)][$_BDEIo(568)](function (e, t) {
                        var $_BDFDS = PaLDJ.$_CS, $_BDFCR = ["$_BDFGT"].concat($_BDFDS), $_BDFEF = $_BDFCR[1];
                        $_BDFCR.shift();
                        var $_BDFFP = $_BDFCR[0];
                        o[$_BDFEF(505)](e, n, t);
                    }), e[$_BDEJl(552)][$_BDEIo(568)](function (e, t) {
                        var $_BDFIX = PaLDJ.$_CS, $_BDFHC = ["$_BDGBp"].concat($_BDFIX), $_BDFJm = $_BDFHC[1];
                        $_BDFHC.shift();
                        var $_BDGAd = $_BDFHC[0];
                        o[$_BDFIX(505)](e, r, t);
                    }), e[$_BDEIo(589)] === e[$_BDEJl(577)] ? e[$_BDEJl(583)]() : e[$_BDEIo(589)] === e[$_BDEJl(519)] && e[$_BDEJl(583)](), o;
                }
            }, l[$_BCCEa(575)] = function (c) {
                var $_BDGDA = PaLDJ.$_CS, $_BDGCT = ["$_BDGGH"].concat($_BDGDA), $_BDGEZ = $_BDGCT[1];
                $_BDGCT.shift();
                var $_BDGFX = $_BDGCT[0];
                return new l(function (r, o) {
                    var $_BDGIL = PaLDJ.$_CS, $_BDGHf = ["$_BDHBj"].concat($_BDGIL), $_BDGJp = $_BDGHf[1];
                    $_BDGHf.shift();
                    var $_BDHAq = $_BDGHf[0];
                    var i = c[$_BDGJp(11)], s = 0, a = false, _ = [];

                    function n(e, t, n) {
                        var $_DDCCn = PaLDJ.$_Dz()[0][6];
                        for (; $_DDCCn !== PaLDJ.$_Dz()[2][5];) {
                            switch ($_DDCCn) {
                                case PaLDJ.$_Dz()[2][6]:
                                    a || (null !== e && (a = true, o(e)), _[n] = t, (s += 1) === i && (a = true, r(_)));
                                    $_DDCCn = PaLDJ.$_Dz()[4][5];
                                    break;
                            }
                        }
                    }

                    for (var e = 0; e < i; e += 1) !function (t) {
                        var $_BDHDr = PaLDJ.$_CS, $_BDHCl = ["$_BDHGi"].concat($_BDHDr), $_BDHEm = $_BDHCl[1];
                        $_BDHCl.shift();
                        var $_BDHFs = $_BDHCl[0];
                        var e = c[t];
                        e instanceof l || (e = new l(e)), e[$_BDHEm(576)](function (e) {
                            var $_BDHIf = PaLDJ.$_CS, $_BDHHb = ["$_BDIBS"].concat($_BDHIf), $_BDHJX = $_BDHHb[1];
                            $_BDHHb.shift();
                            var $_BDIAY = $_BDHHb[0];
                            n(null, e, t);
                        }, function (e) {
                            var $_BDIDf = PaLDJ.$_CS, $_BDICc = ["$_BDIGY"].concat($_BDIDf), $_BDIEh = $_BDICc[1];
                            $_BDICc.shift();
                            var $_BDIFG = $_BDICc[0];
                            n(e || true);
                        });
                    }(e);
                });
            }, l[$_BCCDl(554)] = function (_) {
                var $_BDIIK = PaLDJ.$_CS, $_BDIHy = ["$_BDJBP"].concat($_BDIIK), $_BDIJV = $_BDIHy[1];
                $_BDIHy.shift();
                var $_BDJAt = $_BDIHy[0];
                return new l(function (n, r) {
                    var $_BDJDv = PaLDJ.$_CS, $_BDJCk = ["$_BDJGT"].concat($_BDJDv), $_BDJEO = $_BDJCk[1];
                    $_BDJCk.shift();
                    var $_BDJFE = $_BDJCk[0];
                    var e, o = _[$_BDJDv(11)], i = false, s = 0;

                    function t(e, t) {
                        var $_DDCDb = PaLDJ.$_Dz()[0][6];
                        for (; $_DDCDb !== PaLDJ.$_Dz()[2][5];) {
                            switch ($_DDCDb) {
                                case PaLDJ.$_Dz()[2][6]:
                                    i || (null == e ? (i = true, n(t)) : o <= (s += 1) && (i = true, r(e)));
                                    $_DDCDb = PaLDJ.$_Dz()[4][5];
                                    break;
                            }
                        }
                    }

                    for (var a = 0; a < o; a += 1) e = undefined, (e = _[a]) instanceof l || (e = new l(e)), e[$_BDJEO(576)](function (e) {
                        var $_BDJIZ = PaLDJ.$_CS, $_BDJHq = ["$_BEABu"].concat($_BDJIZ), $_BDJJm = $_BDJHq[1];
                        $_BDJHq.shift();
                        var $_BEAAl = $_BDJHq[0];
                        t(null, e);
                    }, function (e) {
                        var $_BEADY = PaLDJ.$_CS, $_BEACq = ["$_BEAGJ"].concat($_BEADY), $_BEAEK = $_BEACq[1];
                        $_BEACq.shift();
                        var $_BEAFF = $_BEACq[0];
                        t(e || true);
                    });
                });
            }, l[$_BCCDl(397)] = function (n) {
                var $_BEAIO = PaLDJ.$_CS, $_BEAHS = ["$_BEBBX"].concat($_BEAIO), $_BEAJX = $_BEAHS[1];
                $_BEAHS.shift();
                var $_BEBAY = $_BEAHS[0];
                var r = n[$_BEAJX(11)], o = new l, i = function (t, e) {
                    var $_BEBDO = PaLDJ.$_CS, $_BEBCD = ["$_BEBGz"].concat($_BEBDO), $_BEBEz = $_BEBCD[1];
                    $_BEBCD.shift();
                    var $_BEBFJ = $_BEBCD[0];
                    if (r <= t) return o[$_BEBDO(551)](e);
                    new l(n[t])[$_BEBEz(576)](function (e) {
                        var $_BEBIf = PaLDJ.$_CS, $_BEBHF = ["$_BECBm"].concat($_BEBIf), $_BEBJO = $_BEBHF[1];
                        $_BEBHF.shift();
                        var $_BECAs = $_BEBHF[0];
                        i(t + 1, e);
                    }, function (e) {
                        var $_BECDg = PaLDJ.$_CS, $_BECCk = ["$_BECGY"].concat($_BECDg), $_BECEs = $_BECCk[1];
                        $_BECCk.shift();
                        var $_BECFt = $_BECCk[0];
                        o[$_BECDg(525)](e);
                    });
                };
                return new l(n[0])[$_BEAJX(576)](function (e) {
                    var $_BECIF = PaLDJ.$_CS, $_BECHp = ["$_BEDBV"].concat($_BECIF), $_BECJi = $_BECHp[1];
                    $_BECHp.shift();
                    var $_BEDAc = $_BECHp[0];
                    i(1, e);
                }, function (e) {
                    var $_BEDDJ = PaLDJ.$_CS, $_BEDCE = ["$_BEDGE"].concat($_BEDDJ), $_BEDEs = $_BEDCE[1];
                    $_BEDCE.shift();
                    var $_BEDFa = $_BEDCE[0];
                    o[$_BEDEs(525)](e);
                }), o;
            }, l[$_BCCEa(91)][$_BCCEa(305)] = function (e, t) {
                var $_BEDIt = PaLDJ.$_CS, $_BEDHI = ["$_BEEBH"].concat($_BEDIt), $_BEDJD = $_BEDHI[1];
                $_BEDHI.shift();
                var $_BEEAc = $_BEDHI[0];
                return this[$_BEDIt(576)](e, t);
            }, l;
        }();

        window.func3 = X;

        function U(e) {
            var $_DDCEK = PaLDJ.$_Dz()[0][6];
            for (; $_DDCEK !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DDCEK) {
                    case PaLDJ.$_Dz()[2][6]:
                        this[$_DAEj(596)] = e, this[$_DAEj(597)] = {};
                        $_DDCEK = PaLDJ.$_Dz()[0][5];
                        break;
                }
            }
        }

        function $(e, t) {
            var $_DDCFh = PaLDJ.$_Dz()[0][6];
            for (; $_DDCFh !== PaLDJ.$_Dz()[2][5];) {
                switch ($_DDCFh) {
                    case PaLDJ.$_Dz()[0][6]:
                        return e[$_DADR(317)] || (e[$_DADR(317)] = $_DAEj(510)), new $[e[$_DADR(317)]](e, t);
                        break;
                }
            }
        }

        function Y(e) {
            var $_DDCGB = PaLDJ.$_Dz()[2][6];
            for (; $_DDCGB !== PaLDJ.$_Dz()[2][5];) {
                switch ($_DDCGB) {
                    case PaLDJ.$_Dz()[0][6]:
                        this[$_DAEj(595)] = e;
                        $_DDCGB = PaLDJ.$_Dz()[0][5];
                        break;
                }
            }
        }

        V[$_DADR(574)](), U[$_DAEj(91)] = {
            $_JGM: function (e, t) {
                var $_BEEDd = PaLDJ.$_CS, $_BEECu = ["$_BEEGL"].concat($_BEEDd), $_BEEER = $_BEECu[1];
                $_BEECu.shift();
                var $_BEEFQ = $_BEECu[0];
                return this[$_BEEDd(597)][e] ? this[$_BEEDd(597)][e][$_BEEDd(2)](t) : this[$_BEEER(597)][e] = [t], this;
            }, $_JHF: function (e, t) {
                var $_BEEII = PaLDJ.$_CS, $_BEEHs = ["$_BEFBt"].concat($_BEEII), $_BEEJf = $_BEEHs[1];
                $_BEEHs.shift();
                var $_BEFAm = $_BEEHs[0];
                var n = this, r = n[$_BEEII(597)][e];
                if (r) {
                    for (var o = 0, i = r[$_BEEJf(11)]; o < i; o += 1) try {
                        r[o](t);
                    } catch (a) {
                        var s = {error: a, type: e};
                        return G(I($_BEEII(521), n[$_BEEJf(596)], s));
                    }
                    return n;
                }
            }, $_JIo: function () {
                var $_BEFDV = PaLDJ.$_CS, $_BEFCT = ["$_BEFGh"].concat($_BEFDV), $_BEFET = $_BEFCT[1];
                $_BEFCT.shift();
                var $_BEFFf = $_BEFCT[0];
                this[$_BEFDV(597)] = {};
            }
        }, $[$_DAEj(317)] = $_DAEj(562), $[$_DAEj(509)] = function (window, e) {
            var $_BEFIo = PaLDJ.$_CS, $_BEFHn = ["$_BEGBB"].concat($_BEFIo), $_BEFJE = $_BEFHn[1];
            $_BEFHn.shift();
            var $_BEGAU = $_BEFHn[0];
            window[$_BEFIo(126)] ? window[$_BEFIo(126)][$_BEFJE(317)] === $[$_BEFIo(317)] ? window[$_BEFJE(126)][e[$_BEFJE(317)]] = e : ($[e[$_BEFJE(317)]] = e, $[window[$_BEFJE(126)][$_BEFIo(317)]] = window[$_BEFIo(126)], window[$_BEFIo(126)] = $) : ($[e[$_BEFJE(317)]] = e, window[$_BEFJE(126)] = $);
        }, Y[$_DADR(91)] = {
            $_HIT: function (e) {
                var $_BEGDf = PaLDJ.$_CS, $_BEGCa = ["$_BEGGP"].concat($_BEGDf), $_BEGEM = $_BEGCa[1];
                $_BEGCa.shift();
                var $_BEGFS = $_BEGCa[0];
                var t = this;
                return t[$_BEGEM(516)] = t[$_BEGEM(599)], t[$_BEGEM(599)] = e, t[$_BEGEM(595)](t[$_BEGDf(599)], t[$_BEGDf(516)]), t;
            }, $_HJb: function () {
                var $_BEGIB = PaLDJ.$_CS, $_BEGHw = ["$_BEHBj"].concat($_BEGIB), $_BEGJr = $_BEGHw[1];
                $_BEGHw.shift();
                var $_BEHAG = $_BEGHw[0];
                return this[$_BEGIB(599)];
            }, $_BABH: function (e) {
                var $_BEHDz = PaLDJ.$_CS, $_BEHCd = ["$_BEHGw"].concat($_BEHDz), $_BEHEw = $_BEHCd[1];
                $_BEHCd.shift();
                var $_BEHFc = $_BEHCd[0];
                for (var t = $_DJm[$_BEHDz(594)](e) ? e : [e], n = 0, r = t[$_BEHDz(11)]; n < r; n += 1) if (t[n] === this[$_BEHEw(515)]()) return true;
                return false;
            }
        };
        var W = function () {
            var $_BEHIJ = PaLDJ.$_CS, $_BEHHG = ["$_BEIBV"].concat($_BEHIJ), $_BEHJf = $_BEHHG[1];
            $_BEHHG.shift();
            var $_BEIAn = $_BEHHG[0];

            function c(e, t) {
                var $_DDCHx = PaLDJ.$_Dz()[4][6];
                for (; $_DDCHx !== PaLDJ.$_Dz()[2][5];) {
                    switch ($_DDCHx) {
                        case PaLDJ.$_Dz()[0][6]:
                            return e in t;
                            break;
                    }
                }
            }

            function l(e) {
                var $_DDCIg = PaLDJ.$_Dz()[2][6];
                for (; $_DDCIg !== PaLDJ.$_Dz()[2][5];) {
                    switch ($_DDCIg) {
                        case PaLDJ.$_Dz()[4][6]:
                            return e ? a : s;
                            break;
                    }
                }
            }

            function i(e) {
                var $_DDCJt = PaLDJ.$_Dz()[2][6];
                for (; $_DDCJt !== PaLDJ.$_Dz()[2][5];) {
                    switch ($_DDCJt) {
                        case PaLDJ.$_Dz()[2][6]:
                            return e ? _ : a;
                            break;
                    }
                }
            }

            var s = 0, a = 1, _ = 2;

            function u(e) {
                var $_DDDAu = PaLDJ.$_Dz()[0][6];
                for (; $_DDDAu !== PaLDJ.$_Dz()[0][5];) {
                    switch ($_DDDAu) {
                        case PaLDJ.$_Dz()[0][6]:
                            return typeof e;
                            break;
                    }
                }
            }

            var r = window, e = Object, t = N, p = $_BEHIJ(26), n = $_BEHJf(200), h = e[$_BEHJf(650)], f = u(h) == n;

            function o(n, r) {
                var $_DDDBi = PaLDJ.$_Dz()[4][6];
                for (; $_DDDBi !== PaLDJ.$_Dz()[4][5];) {
                    switch ($_DDDBi) {
                        case PaLDJ.$_Dz()[4][6]:
                            return function (e, t) {
                                var $_BEIDN = PaLDJ.$_CS, $_BEICw = ["$_BEIGw"].concat($_BEIDN), $_BEIEB = $_BEICw[1];
                                $_BEICw.shift();
                                var $_BEIFi = $_BEICw[0];
                                return l(c(n, r));
                            };
                            break;
                    }
                }
            }

            var d = $_BEHIJ(664), g = o([$_BEHIJ(666), d][$_BEHIJ(628)]($_BEHJf(253)), r);
            var v = e[$_BEHIJ(667)], m = u(v) == n, x = $_BEHIJ(606);
            for (var w, y, b, E = [$_BEHIJ(674), $_BEHIJ(635), $_BEHJf(613), $_BEHJf(626), $_BEHIJ(636), $_BEHJf(625), $_BEHJf(637)], C = [g, function D() {
                var $_BEIIz = PaLDJ.$_CS, $_BEIHP = ["$_BEJBa"].concat($_BEIIz), $_BEIJt = $_BEIHP[1];
                $_BEIHP.shift();
                var $_BEJAA = $_BEIHP[0];
                var e, t = $_BEIJt(619) + d;
                if (!c(t, r)) return s;
                try {
                    r[t];
                } catch (n) {
                    e = [];
                }
                return e ? 9 : a;
            }, function A() {
                var $_BEJDG = PaLDJ.$_CS, $_BEJCE = ["$_BEJGS"].concat($_BEJDG), $_BEJEo = $_BEJCE[1];
                $_BEJCE.shift();
                var $_BEJFR = $_BEJCE[0];
                var e = 5 * Math[$_BEJEo(278)](2), t = e - 1, n = [];
                try {
                    n[$_BEJDG(2)](e(n, t));
                } catch (_) {
                    n = _;
                }
                for (var r = [$_BEJDG(629), $_BEJEo(605), $_BEJDG(640)], o = [r[0], r[1], r[0] + r[2], r[1] + r[2], $_BEJEo(665), $_BEJEo(406), r[2][$_BEJDG(231)](), $_BEJEo(694), $_BEJEo(612), $_BEJDG(470)], i = o[$_BEJEo(67)](o[$_BEJDG(11)]), s = 0, a = o[$_BEJDG(11)]; s < a; ++s) i[s] = l(c(o[s], n));
                return parseInt(i[$_BEJDG(628)]($_BEJDG(253)), 2)[$_BEJEo(66)](16);
            }, function O() {
                var $_BEJIB = PaLDJ.$_CS, $_BEJHq = ["$_BFABZ"].concat($_BEJIB), $_BEJJs = $_BEJHq[1];
                $_BEJHq.shift();
                var $_BFAAd = $_BEJHq[0];
                var e = x, t = pe, n = function o(e) {
                    var $_BFADE = PaLDJ.$_CS, $_BFACx = ["$_BFAGF"].concat($_BFADE), $_BFAEj = $_BFACx[1];
                    $_BFACx.shift();
                    var $_BFAFP = $_BFACx[0];
                    var t;
                    if (u(e) != p) return f && (t = h(e)), u(t) != p ? t : u(t = e[$_BFADE(627)]) != p ? t : u(t = e[$_BFAEj(644)]) != p ? t[$_BFADE(91)] : undefined;
                }(t);
                if (!n) return 8;
                if (!c(e, n)) return c(e, t) ? t[e] ? _ : a : s;
                if (!m) return i(t[e]);
                var r = v(n, e);
                return $_BEJIB(9) != u(r) ? 9 : r[$_BEJIB(633)] ? i(r[$_BEJIB(633)][$_BEJJs(72)](t)) : i(r[$_BEJJs(676)]);
            }, o([$_BEHJf(617), $_BEHIJ(614), $_BEHIJ(661), $_BEHIJ(685)][$_BEHIJ(628)]($_BEHIJ(253)), r), (w = t, o([y = $_BEHJf(617), x, $_BEHIJ(415), $_BEHIJ(687)][$_BEHIJ(628)](y), w)), (b = t, o([$_BEHIJ(691), $_BEHIJ(603), $_BEHJf(641), $_BEHJf(692)][$_BEHJf(628)]($_BEHIJ(253)), b))], k = [], S = -1, T = E[$_BEHJf(11)]; ++S < T;) k[S] = [E[S], C[S]];
            return function L(e, t) {
                var $_BFAID = PaLDJ.$_CS, $_BFAHj = ["$_BFBBe"].concat($_BFAID), $_BFAJJ = $_BFAHj[1];
                $_BFAHj.shift();
                var $_BFBAW = $_BFAHj[0];
                for (var n, r, o = k, i = -1, s = o[$_BFAJJ(11)]; ++i < s;) r = (n = o[i])[1](i), t[n[0]] = r;
                return e;
            };
        }(), te = function () {
            var $_BFBDi = PaLDJ.$_CS, $_BFBCF = ["$_BFBGj"].concat($_BFBDi), $_BFBEh = $_BFBCF[1];
            $_BFBCF.shift();
            var $_BFBFu = $_BFBCF[0];

            function e() {
                var $_DDDCs = PaLDJ.$_Dz()[2][6];
                for (; $_DDDCs !== PaLDJ.$_Dz()[4][5];) {
                    switch ($_DDDCs) {
                        case PaLDJ.$_Dz()[2][6]:
                            return (65536 * (1 + Math[$_BFBEh(278)]()) | 0)[$_BFBEh(66)](16)[$_BFBEh(655)](1);
                            break;
                    }
                }
            }

            return function () {
                var $_BFBIs = PaLDJ.$_CS, $_BFBHC = ["$_BFCBu"].concat($_BFBIs), $_BFBJz = $_BFBHC[1];
                $_BFBHC.shift();
                var $_BFCAx = $_BFBHC[0];
                return e() + e() + e() + e();
            };
        }();

        function $_DJm(e) {
            var $_DDDDT = PaLDJ.$_Dz()[4][6];
            for (; $_DDDDT !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DDDDT) {
                    case PaLDJ.$_Dz()[0][6]:
                        this[$_DAEj(680)] = e || [];
                        $_DDDDT = PaLDJ.$_Dz()[2][5];
                        break;
                }
            }
        }

        function ce(e) {
            var $_DDDEk = PaLDJ.$_Dz()[0][6];
            for (; $_DDDEk !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DDDEk) {
                    case PaLDJ.$_Dz()[2][6]:
                        this[$_DAEj(681)] = e;
                        $_DDDEk = PaLDJ.$_Dz()[4][5];
                        break;
                }
            }
        }

        function le(e) {
            var $_DDDFq = PaLDJ.$_Dz()[0][6];
            for (; $_DDDFq !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DDDFq) {
                    case PaLDJ.$_Dz()[4][6]:
                        this[$_DAEj(407)] = $_DAEj(10) == typeof e ? N[$_DADR(457)](e) : e;
                        $_DDDFq = PaLDJ.$_Dz()[0][5];
                        break;
                }
            }
        }

        function ue(e, t) {
            var $_DDDGD = PaLDJ.$_Dz()[4][6];
            for (; $_DDDGD !== PaLDJ.$_Dz()[2][5];) {
                switch ($_DDDGD) {
                    case PaLDJ.$_Dz()[0][6]:
                        this[$_DAEj(698)] = t, this[$_DADR(407)] = e;
                        $_DDDGD = PaLDJ.$_Dz()[4][5];
                        break;
                }
            }
        }

        $_DJm[$_DADR(91)] = {
            $_HJb: function (e) {
                var $_BFCDX = PaLDJ.$_CS, $_BFCCP = ["$_BFCGt"].concat($_BFCDX), $_BFCEz = $_BFCCP[1];
                $_BFCCP.shift();
                var $_BFCFb = $_BFCCP[0];
                return this[$_BFCDX(680)][e];
            }, $_BAGO: function () {
                var $_BFCIL = PaLDJ.$_CS, $_BFCHj = ["$_BFDBr"].concat($_BFCIL), $_BFCJB = $_BFCHj[1];
                $_BFCHj.shift();
                var $_BFDAZ = $_BFCHj[0];
                return this[$_BFCJB(680)][$_BFCIL(11)];
            }, $_EAS: function (e, t) {
                var $_BFDDV = PaLDJ.$_CS, $_BFDCT = ["$_BFDGE"].concat($_BFDDV), $_BFDEZ = $_BFDCT[1];
                $_BFDCT.shift();
                var $_BFDFG = $_BFDCT[0];
                return new $_DJm(J(t) ? this[$_BFDEZ(680)][$_BFDDV(67)](e, t) : this[$_BFDDV(680)][$_BFDDV(67)](e));
            }, $_BAHG: function (e) {
                var $_BFDIk = PaLDJ.$_CS, $_BFDHi = ["$_BFEBS"].concat($_BFDIk), $_BFDJh = $_BFDHi[1];
                $_BFDHi.shift();
                var $_BFEA_ = $_BFDHi[0];
                return this[$_BFDJh(680)][$_BFDJh(2)](e), this;
            }, $_BAIW: function (e, t) {
                var $_BFEDX = PaLDJ.$_CS, $_BFECT = ["$_BFEGd"].concat($_BFEDX), $_BFEEg = $_BFECT[1];
                $_BFECT.shift();
                var $_BFEFh = $_BFECT[0];
                return this[$_BFEDX(680)][$_BFEEg(63)](e, t || 1);
            }, $_ECs: function (e) {
                var $_BFEIY = PaLDJ.$_CS, $_BFEHP = ["$_BFFBW"].concat($_BFEIY), $_BFEJ_ = $_BFEHP[1];
                $_BFEHP.shift();
                var $_BFFAr = $_BFEHP[0];
                return this[$_BFEIY(680)][$_BFEIY(628)](e);
            }, $_BAJJ: function (e) {
                var $_BFFDF = PaLDJ.$_CS, $_BFFCd = ["$_BFFGZ"].concat($_BFFDF), $_BFFEz = $_BFFCd[1];
                $_BFFCd.shift();
                var $_BFFFj = $_BFFCd[0];
                return new $_DJm(this[$_BFFDF(680)][$_BFFDF(27)](e));
            }, $_EBk: function (e) {
                var $_BFFIK = PaLDJ.$_CS, $_BFFHq = ["$_BFGBk"].concat($_BFFIK), $_BFFJJ = $_BFFHq[1];
                $_BFFHq.shift();
                var $_BFGAg = $_BFFHq[0];
                var t = this[$_BFFIK(680)];
                if (t[$_BFFJJ(634)]) return new $_DJm(t[$_BFFIK(634)](e));
                for (var n = [], r = 0, o = t[$_BFFIK(11)]; r < o; r += 1) n[r] = e(t[r], r, this);
                return new $_DJm(n);
            }, $_BBAO: function (e) {
                var $_BFGDO = PaLDJ.$_CS, $_BFGCn = ["$_BFGGj"].concat($_BFGDO), $_BFGEr = $_BFGCn[1];
                $_BFGCn.shift();
                var $_BFGFx = $_BFGCn[0];
                var t = this[$_BFGEr(680)];
                if (t[$_BFGDO(658)]) return new $_DJm(t[$_BFGEr(658)](e));
                for (var n = [], r = 0, o = t[$_BFGDO(11)]; r < o; r += 1) e(t[r], r, this) && n[$_BFGEr(2)](t[r]);
                return new $_DJm(n);
            }, $_EHV: function (e) {
                var $_BFGIz = PaLDJ.$_CS, $_BFGHy = ["$_BFHBH"].concat($_BFGIz), $_BFGJP = $_BFGHy[1];
                $_BFGHy.shift();
                var $_BFHAS = $_BFGHy[0];
                var t = this[$_BFGJP(680)];
                if (t[$_BFGJP(323)]) return t[$_BFGJP(323)](e);
                for (var n = 0, r = t[$_BFGIz(11)]; n < r; n += 1) if (t[n] === e) return n;
                return -1;
            }, $_BBBM: function (e) {
                var $_BFHDN = PaLDJ.$_CS, $_BFHCF = ["$_BFHGQ"].concat($_BFHDN), $_BFHEG = $_BFHCF[1];
                $_BFHCF.shift();
                var $_BFHFS = $_BFHCF[0];
                var t = this[$_BFHDN(680)];
                if (!t[$_BFHEG(696)]) for (var n = arguments[1], r = 0; r < t[$_BFHDN(11)]; r++) r in t && e[$_BFHEG(72)](n, t[r], r, this);
                return t[$_BFHEG(696)](e);
            }
        }, $_DJm[$_DADR(594)] = function (e) {
            var $_BFHIo = PaLDJ.$_CS, $_BFHHQ = ["$_BFIBF"].concat($_BFHIo), $_BFHJp = $_BFHHQ[1];
            $_BFHHQ.shift();
            var $_BFIAq = $_BFHHQ[0];
            return Array[$_BFHJp(645)] ? Array[$_BFHIo(645)](e) : $_BFHIo(601) === Object[$_BFHIo(91)][$_BFHJp(66)][$_BFHIo(72)](e);
        }, ce[$_DADR(91)] = {
            $_EFp: function (e) {
                var $_BFIDT = PaLDJ.$_CS, $_BFICu = ["$_BFIGT"].concat($_BFIDT), $_BFIEf = $_BFICu[1];
                $_BFICu.shift();
                var $_BFIFG = $_BFICu[0];
                var t = this[$_BFIDT(681)];
                for (var n in t) t[$_BFIEf(12)](n) && e(n, t[n]);
                return this;
            }, $_BBCm: function () {
                var $_BFIIH = PaLDJ.$_CS, $_BFIHa = ["$_BFJBq"].concat($_BFIIH), $_BFIJW = $_BFIHa[1];
                $_BFIHa.shift();
                var $_BFJAJ = $_BFIHa[0];
                var e = this[$_BFIIH(681)];
                for (var t in e) if (e[$_BFIIH(12)](t)) return false;
                return true;
            }
        }, le[$_DADR(91)] = {
            $_BBDk: {
                down: [$_DADR(639), $_DAEj(630), $_DAEj(689), $_DAEj(684)],
                move: [$_DAEj(495), $_DADR(659), $_DAEj(697), $_DADR(620)],
                up: [$_DADR(656), $_DADR(660), $_DAEj(609), $_DAEj(638)],
                enter: [$_DADR(672)],
                leave: [$_DAEj(683)],
                cancel: [$_DAEj(663)],
                click: [$_DADR(652)],
                scroll: [$_DADR(647)],
                resize: [$_DADR(618)],
                blur: [$_DAEj(675)],
                focus: [$_DADR(608)],
                unload: [$_DADR(693)],
                input: [$_DADR(75)],
                keyup: [$_DAEj(690)],
                ended: [$_DAEj(648)],
                keydown: [$_DADR(653)],
                beforeunload: [$_DADR(623)],
                focusin: [$_DADR(600)],
                pageshow: [$_DAEj(679)]
            }, $_BBEn: function () {
                var $_BFJDr = PaLDJ.$_CS, $_BFJCS = ["$_BFJGp"].concat($_BFJDr), $_BFJEr = $_BFJCS[1];
                $_BFJCS.shift();
                var $_BFJFB = $_BFJCS[0];
                var e = this[$_BFJDr(407)];
                return e[$_BFJDr(616)] = $_BFJDr(253), $_BFJEr(75) === e[$_BFJEr(669)][$_BFJDr(673)]() && (e[$_BFJEr(676)] = $_BFJEr(253)), this;
            }, $_BBFP: function () {
                var $_BFJIR = PaLDJ.$_CS, $_BFJHR = ["$_BGABT"].concat($_BFJIR), $_BFJJZ = $_BFJHR[1];
                $_BFJHR.shift();
                var $_BGAAS = $_BFJHR[0];
                return this[$_BFJJZ(670)]({display: $_BFJIR(610)});
            }, $_BBGF: function () {
                var $_BGADG = PaLDJ.$_CS, $_BGACM = ["$_BGAGD"].concat($_BGADG), $_BGAEq = $_BGACM[1];
                $_BGACM.shift();
                var $_BGAFF = $_BGACM[0];
                return this[$_BGADG(670)]({display: $_BGADG(654)});
            }, $_BBHK: function (e) {
                var $_BGAIz = PaLDJ.$_CS, $_BGAHx = ["$_BGBBz"].concat($_BGAIz), $_BGAJQ = $_BGAHx[1];
                $_BGAHx.shift();
                var $_BGBAH = $_BGAHx[0];
                return this[$_BGAIz(670)]({opacity: e});
            }, $_BBI_: function (e) {
                var $_BGBDG = PaLDJ.$_CS, $_BGBCD = ["$_BGBGU"].concat($_BGBDG), $_BGBEs = $_BGBCD[1];
                $_BGBCD.shift();
                var $_BGBFJ = $_BGBCD[0];
                return this[$_BGBEs(407)][$_BGBEs(695)](e);
            }, $_EDD: function (e) {
                var $_BGBIN = PaLDJ.$_CS, $_BGBHA = ["$_BGCBF"].concat($_BGBIN), $_BGBJz = $_BGBHA[1];
                $_BGBHA.shift();
                var $_BGCAl = $_BGBHA[0];
                var n = this[$_BGBIN(407)];
                return new ce(e)[$_BGBIN(97)](function (e, t) {
                    var $_BGCDC = PaLDJ.$_CS, $_BGCCl = ["$_BGCGt"].concat($_BGCDC), $_BGCEV = $_BGCCl[1];
                    $_BGCCl.shift();
                    var $_BGCFB = $_BGCCl[0];
                    n[$_BGCEV(662)](e, t);
                }), this;
            }, $_BBJK: function (e) {
                var $_BGCIf = PaLDJ.$_CS, $_BGCHH = ["$_BGDBM"].concat($_BGCIf), $_BGCJK = $_BGCHH[1];
                $_BGCHH.shift();
                var $_BGDAl = $_BGCHH[0];
                var t = this[$_BGCJK(407)];
                return new $_DJm(e)[$_BGCJK(18)](function (e) {
                    var $_BGDDN = PaLDJ.$_CS, $_BGDCh = ["$_BGDGL"].concat($_BGDDN), $_BGDEP = $_BGDCh[1];
                    $_BGDCh.shift();
                    var $_BGDFH = $_BGDCh[0];
                    t[$_BGDDN(678)](e);
                }), this;
            }, $_EEQ: function (e) {
                var $_BGDIa = PaLDJ.$_CS, $_BGDHH = ["$_BGEBS"].concat($_BGDIa), $_BGDJm = $_BGDHH[1];
                $_BGDHH.shift();
                var $_BGEAs = $_BGDHH[0];
                var n = this[$_BGDJm(407)];
                return new ce(e)[$_BGDJm(97)](function (e, t) {
                    var $_BGEDk = PaLDJ.$_CS, $_BGECD = ["$_BGEGm"].concat($_BGEDk), $_BGEEo = $_BGECD[1];
                    $_BGECD.shift();
                    var $_BGEFo = $_BGECD[0];
                    n[e] = t;
                }), this;
            }, $_sTyyle: function (e) {
                var $_BGEIc = PaLDJ.$_CS, $_BGEHN = ["$_BGFBP"].concat($_BGEIc), $_BGEJN = $_BGEHN[1];
                $_BGEHN.shift();
                var $_BGFAH = $_BGEHN[0];
                var n = this[$_BGEIc(407)];
                return new ce(e)[$_BGEIc(97)](function (e, t) {
                    var $_BGFDL = PaLDJ.$_CS, $_BGFCH = ["$_BGFGS"].concat($_BGFDL), $_BGFEQ = $_BGFCH[1];
                    $_BGFCH.shift();
                    var $_BGFFe = $_BGFCH[0];
                    n[$_BGFEQ(465)][e] = t;
                }), this;
            }, setStyles: function (e) {
                var $_BGFIO = PaLDJ.$_CS, $_BGFHc = ["$_BGGBq"].concat($_BGFIO), $_BGFJD = $_BGFHc[1];
                $_BGFHc.shift();
                var $_BGGAl = $_BGFHc[0];
                var n = this[$_BGFIO(407)];
                return new ce(e)[$_BGFJD(97)](function (e, t) {
                    var $_BGGDz = PaLDJ.$_CS, $_BGGCk = ["$_BGGGP"].concat($_BGGDz), $_BGGEw = $_BGGCk[1];
                    $_BGGCk.shift();
                    var $_BGGFu = $_BGGCk[0];
                    n[$_BGGDz(465)][e] = t;
                }), this;
            }, $_BCAV: function () {
                var $_BGGIN = PaLDJ.$_CS, $_BGGHL = ["$_BGHBH"].concat($_BGGIN), $_BGGJJ = $_BGGHL[1];
                $_BGGHL.shift();
                var $_BGHAs = $_BGGHL[0];
                return new le(this[$_BGGIN(407)][$_BGGIN(646)]);
            }, $_FHm: function (e) {
                var $_BGHDy = PaLDJ.$_CS, $_BGHCo = ["$_BGHGv"].concat($_BGHDy), $_BGHEg = $_BGHCo[1];
                $_BGHCo.shift();
                var $_BGHFK = $_BGHCo[0];
                return e[$_BGHEg(407)][$_BGHEg(668)](this[$_BGHEg(407)]), this;
            }, $_BCBf: function (e) {
                var $_BGHIu = PaLDJ.$_CS, $_BGHHS = ["$_BGIB_"].concat($_BGHIu), $_BGHJG = $_BGHHS[1];
                $_BGHHS.shift();
                var $_BGIAy = $_BGHHS[0];
                var t = this[$_BGHIu(407)];
                return t[$_BGHJG(646)][$_BGHJG(688)](t), this[$_BGHIu(353)](e), this;
            }, $_BCCj: function (e) {
                var $_BGIDv = PaLDJ.$_CS, $_BGICx = ["$_BGIGC"].concat($_BGIDv), $_BGIE_ = $_BGICx[1];
                $_BGICx.shift();
                var $_BGIFr = $_BGICx[0];
                return e[$_BGIDv(407)][$_BGIE_(646)][$_BGIE_(631)](this[$_BGIDv(407)], e[$_BGIDv(407)]), this;
            }, $_EGi: function (e) {
                var $_BGIIf = PaLDJ.$_CS, $_BGIHW = ["$_BGJBY"].concat($_BGIIf), $_BGIJH = $_BGIHW[1];
                $_BGIHW.shift();
                var $_BGJAk = $_BGIHW[0];
                return e[$_BGIJH(353)](this), this;
            }, $_FGT: function () {
                var $_BGJDV = PaLDJ.$_CS, $_BGJCu = ["$_BGJGR"].concat($_BGJDV), $_BGJEz = $_BGJCu[1];
                $_BGJCu.shift();
                var $_BGJFl = $_BGJCu[0];
                var e = this[$_BGJDV(407)], t = e[$_BGJDV(646)];
                return t && t[$_BGJEz(688)](e), this;
            }, $_BCDI: function (e) {
                var $_BGJIF = PaLDJ.$_CS, $_BGJHI = ["$_BHABy"].concat($_BGJIF), $_BGJJS = $_BGJHI[1];
                $_BGJHI.shift();
                var $_BHAAs = $_BGJHI[0];
                var t = this[$_BGJJS(407)];
                return -1 === new $_DJm(t[$_BGJJS(671)] ? t[$_BGJIF(671)][$_BGJJS(99)]($_BGJJS(52)) : [])[$_BGJIF(282)](B + e) ? this[$_BGJIF(677)](e) : this[$_BGJIF(607)](e), this;
            }, $_BCEp: function (e) {
                var $_BHADn = PaLDJ.$_CS, $_BHACF = ["$_BHAGE"].concat($_BHADn), $_BHAEJ = $_BHACF[1];
                $_BHACF.shift();
                var $_BHAFL = $_BHACF[0];
                var t = this[$_BHAEJ(407)],
                    n = new $_DJm(t[$_BHADn(671)] ? t[$_BHADn(671)][$_BHADn(99)]($_BHADn(52)) : []);
                return e = B + e, -1 == n[$_BHAEJ(282)](e) && (n[$_BHADn(602)](e), t[$_BHAEJ(671)] = n[$_BHAEJ(47)]($_BHAEJ(52))), this;
            }, $_BCGM: function () {
                var $_BHAIW = PaLDJ.$_CS, $_BHAHA = ["$_BHBBK"].concat($_BHAIW), $_BHAJo = $_BHAHA[1];
                $_BHAHA.shift();
                var $_BHBAN = $_BHAHA[0];
                return this[$_BHAIW(407)][$_BHAIW(611)];
            }, $_BCHW: function () {
                var $_BHBDM = PaLDJ.$_CS, $_BHBCo = ["$_BHBGe"].concat($_BHBDM), $_BHBET = $_BHBCo[1];
                $_BHBCo.shift();
                var $_BHBFB = $_BHBCo[0];
                var e = this[$_BHBDM(407)];
                return e && e[$_BHBDM(465)] && e[$_BHBDM(465)][$_BHBET(686)] || 0;
            }, $_BCFp: function (e) {
                var $_BHBIC = PaLDJ.$_CS, $_BHBHb = ["$_BHCBK"].concat($_BHBIC), $_BHBJX = $_BHBHb[1];
                $_BHBHb.shift();
                var $_BHCAW = $_BHBHb[0];
                var t = this[$_BHBJX(407)], n = new $_DJm(t[$_BHBJX(671)][$_BHBJX(99)]($_BHBJX(52)));
                e = B + e;
                var r = n[$_BHBIC(282)](e);
                return -1 < r && (n[$_BHBJX(632)](r), t[$_BHBJX(671)] = n[$_BHBIC(47)]($_BHBIC(52))), this;
            }, $_BCIC: function (e, t) {
                var $_BHCDv = PaLDJ.$_CS, $_BHCCR = ["$_BHCGM"].concat($_BHCDv), $_BHCEk = $_BHCCR[1];
                $_BHCCR.shift();
                var $_BHCFI = $_BHCCR[0];
                return this[$_BHCDv(607)](t)[$_BHCDv(677)](e), this;
            }, $_BCJU: function (e, n) {
                var $_BHCID = PaLDJ.$_CS, $_BHCHa = ["$_BHDBj"].concat($_BHCID), $_BHCJQ = $_BHCHa[1];
                $_BHCHa.shift();
                var $_BHDAl = $_BHCHa[0];

                function i(e) {
                    var $_DDDHI = PaLDJ.$_Dz()[0][6];
                    for (; $_DDDHI !== PaLDJ.$_Dz()[4][5];) {
                        switch ($_DDDHI) {
                            case PaLDJ.$_Dz()[2][6]:
                                n(new ue(r, e));
                                $_DDDHI = PaLDJ.$_Dz()[0][5];
                                break;
                        }
                    }
                }

                var r = this, o = r[$_BHCJQ(407)], t = r[$_BHCID(699)][e];
                return new $_DJm(t)[$_BHCJQ(18)](function (e) {
                    var $_BHDDK = PaLDJ.$_CS, $_BHDCC = ["$_BHDGl"].concat($_BHDDK), $_BHDEw = $_BHDCC[1];
                    $_BHDCC.shift();
                    var $_BHDFW = $_BHDCC[0];
                    if (N[$_BHDEw(472)]) o[$_BHDEw(472)](e, i); else if (N[$_BHDDK(469)]) o[$_BHDDK(469)]($_BHDDK(615) + e, i); else {
                        var t = o[$_BHDDK(615) + e];
                        o[$_BHDEw(615) + e] = function (e) {
                            var $_BHDIQ = PaLDJ.$_CS, $_BHDHX = ["$_BHEBI"].concat($_BHDIQ), $_BHDJM = $_BHDHX[1];
                            $_BHDHX.shift();
                            var $_BHEAN = $_BHDHX[0];
                            n(new ue(r, e)), $_BHDIQ(200) == typeof t && t[$_BHDIQ(72)](this, e);
                        };
                    }
                }), {
                    $_JIo: function () {
                        var $_BHEDL = PaLDJ.$_CS, $_BHECS = ["$_BHEGI"].concat($_BHEDL), $_BHEEQ = $_BHECS[1];
                        $_BHECS.shift();
                        var $_BHEFd = $_BHECS[0];
                        new $_DJm(t)[$_BHEEQ(18)](function (e) {
                            var $_BHEIj = PaLDJ.$_CS, $_BHEHr = ["$_BHFBH"].concat($_BHEIj), $_BHEJb = $_BHEHr[1];
                            $_BHEHr.shift();
                            var $_BHFAK = $_BHEHr[0];
                            N[$_BHEIj(494)] ? o[$_BHEJb(494)](e, i) : N[$_BHEIj(458)] ? o[$_BHEJb(458)]($_BHEJb(615) + e, i) : o[$_BHEJb(615) + e] = null;
                        });
                    }
                };
            }, $_JGM: function (e, t) {
                var $_BHFDz = PaLDJ.$_CS, $_BHFCb = ["$_BHFGK"].concat($_BHFDz), $_BHFEi = $_BHFCb[1];
                $_BHFCb.shift();
                var $_BHFF_ = $_BHFCb[0];
                var n = this, r = n[$_BHFEi(604)](e, t);
                return n[$_BHFDz(642)] = n[$_BHFEi(642)] || {}, n[$_BHFEi(642)][e] ? n[$_BHFDz(642)][e][$_BHFDz(2)](r) : n[$_BHFDz(642)][e] = [r], n;
            }, $_BDBn: function (e) {
                var $_BHFIP = PaLDJ.$_CS, $_BHFHH = ["$_BHGBA"].concat($_BHFIP), $_BHFJg = $_BHFHH[1];
                $_BHFHH.shift();
                var $_BHGAH = $_BHFHH[0];
                var t = this;
                if (t[$_BHFJg(642)]) if (e) {
                    if (t[$_BHFJg(642)][e] && 0 < t[$_BHFIP(642)][e][$_BHFIP(11)]) for (var n = t[$_BHFIP(642)][e][$_BHFJg(11)] - 1; 0 <= n; n--) t[$_BHFJg(642)][e][n][$_BHFIP(621)]();
                } else for (var r in t[$_BHFJg(642)]) if (t[$_BHFIP(642)][r] && 0 < t[$_BHFIP(642)][r][$_BHFJg(11)]) for (n = t[$_BHFIP(642)][r][$_BHFJg(11)] - 1; 0 <= n; n--) t[$_BHFIP(642)][r][n][$_BHFJg(621)]();
                return t;
            }, $_BDCe: function (e) {
                var $_BHGDY = PaLDJ.$_CS, $_BHGCS = ["$_BHGGR"].concat($_BHGDY), $_BHGEx = $_BHGCS[1];
                $_BHGCS.shift();
                var $_BHGFX = $_BHGCS[0];
                var t = this[$_BHGEx(407)][$_BHGDY(657)]();
                return 1 !== (e = e || 1) && (t[$_BHGEx(400)] = t[$_BHGDY(400)] * e, t[$_BHGDY(425)] = t[$_BHGDY(425)] * e, t[$_BHGDY(651)] = t[$_BHGDY(651)] * e, t[$_BHGDY(624)] = t[$_BHGDY(624)] * e, t[$_BHGEx(686)] = t[$_BHGEx(686)] * e, t[$_BHGEx(643)] = t[$_BHGEx(643)] * e, t[$_BHGEx(622)] = t[$_BHGEx(622)] * e, t[$_BHGEx(682)] = t[$_BHGEx(682)] * e), t;
            }, $_BDDD: function (e) {
                var $_BHGIX = PaLDJ.$_CS, $_BHGHC = ["$_BHHBH"].concat($_BHGIX), $_BHGJD = $_BHGHC[1];
                $_BHGHC.shift();
                var $_BHHAB = $_BHGHC[0];
                var t = this[$_BHGIX(649)](), n = N[$_BHGIX(441)], r = N[$_BHGJD(478)],
                    o = window[$_BHGJD(722)] || r[$_BHGIX(729)] || n[$_BHGJD(729)],
                    i = window[$_BHGIX(725)] || r[$_BHGJD(771)] || n[$_BHGJD(771)],
                    s = r[$_BHGIX(782)] || n[$_BHGIX(782)] || 0, a = r[$_BHGJD(703)] || n[$_BHGJD(703)] || 0,
                    _ = t[$_BHGIX(651)] + o - s, c = t[$_BHGJD(624)] + i - a;
                return {
                    top: Math[$_BHGIX(736)](_),
                    left: Math[$_BHGIX(736)](c),
                    width: t[$_BHGIX(686)] - t[$_BHGJD(624)],
                    height: t[$_BHGJD(643)] - t[$_BHGIX(651)]
                };
            }, $_BDEm: function (e) {
                var $_BHHDb = PaLDJ.$_CS, $_BHHCS = ["$_BHHGj"].concat($_BHHDb), $_BHHEU = $_BHHCS[1];
                $_BHHCS.shift();
                var $_BHHFq = $_BHHCS[0];
                var t = this[$_BHHDb(407)];
                return this[$_BHHEU(783)](), t[$_BHHDb(668)](N[$_BHHEU(743)](e)), this;
            }, $_BDFP: function (e) {
                var $_BHHIK = PaLDJ.$_CS, $_BHHHM = ["$_BHIBK"].concat($_BHHIK), $_BHHJj = $_BHHHM[1];
                $_BHHHM.shift();
                var $_BHIAo = $_BHHHM[0];
                return this[$_BHHJj(407)][$_BHHJj(616)] = e, this;
            }, _style: function (e) {
                var $_BHIDT = PaLDJ.$_CS, $_BHICM = ["$_BHIGa"].concat($_BHIDT), $_BHIEc = $_BHICM[1];
                $_BHICM.shift();
                var $_BHIFw = $_BHICM[0];
                var t = this[$_BHIEc(407)];
                return N[$_BHIDT(420)]($_BHIEc(444))[0][$_BHIEc(668)](t), t[$_BHIEc(715)] ? t[$_BHIEc(715)][$_BHIEc(790)] = e : t[$_BHIEc(668)](N[$_BHIDT(743)](e)), this;
            }, $_BDGO: function (e) {
                var $_BHIIZ = PaLDJ.$_CS, $_BHIHD = ["$_BHJBO"].concat($_BHIIZ), $_BHIJu = $_BHIHD[1];
                $_BHIHD.shift();
                var $_BHJAe = $_BHIHD[0];
                var t, n, r = this[$_BHIIZ(407)],
                    o = !((n = N[$_BHIJu(457)]($_BHIJu(416)))[$_BHIIZ(427)] && n[$_BHIJu(427)]($_BHIIZ(417)));
                if (e) {
                    if (o) {
                        var i = N[$_BHIJu(457)]($_BHIJu(53));
                        i[$_BHIJu(616)] = r[$_BHIIZ(724)], t = new le(i[$_BHIJu(764)][0]);
                    } else t = new le(this[$_BHIJu(407)][$_BHIIZ(767)](true));
                    r[$_BHIJu(265)] = $_BHIIZ(773) + r[$_BHIJu(265)], t[$_BHIJu(720)]([$_BHIJu(770)]);
                } else (t = new le(this[$_BHIIZ(407)][$_BHIIZ(767)](false)))[$_BHIJu(677)]($_BHIIZ(766));
                return t;
            }, $_BDHB: function () {
                var $_BHJDz = PaLDJ.$_CS, $_BHJCS = ["$_BHJGl"].concat($_BHJDz), $_BHJEI = $_BHJCS[1];
                $_BHJCS.shift();
                var $_BHJFA = $_BHJCS[0];
                return this[$_BHJDz(407)][$_BHJEI(652)](), this;
            }, $_BDIH: function () {
                var $_BHJIJ = PaLDJ.$_CS, $_BHJHQ = ["$_BIABJ"].concat($_BHJIJ), $_BHJJi = $_BHJHQ[1];
                $_BHJHQ.shift();
                var $_BIAAW = $_BHJHQ[0];
                return this[$_BHJIJ(407)][$_BHJJi(793)](), this;
            }, $_BDJt: function () {
                var $_BIADg = PaLDJ.$_CS, $_BIACq = ["$_BIAGa"].concat($_BIADg), $_BIAEq = $_BIACq[1];
                $_BIACq.shift();
                var $_BIAFY = $_BIACq[0];
                return this[$_BIADg(407)][$_BIAEq(705)] = 0, this[$_BIADg(407)][$_BIADg(793)](), this;
            }, $_BEAd: function () {
                var $_BIAIa = PaLDJ.$_CS, $_BIAHQ = ["$_BIBBW"].concat($_BIAIa), $_BIAJm = $_BIAHQ[1];
                $_BIAHQ.shift();
                var $_BIBAY = $_BIAHQ[0];
                return this[$_BIAIa(407)][$_BIAJm(705)] = 0, this[$_BIAJm(407)][$_BIAIa(796)](), this;
            }, $_BEB_: function () {
                var $_BIBDm = PaLDJ.$_CS, $_BIBCI = ["$_BIBGI"].concat($_BIBDm), $_BIBEl = $_BIBCI[1];
                $_BIBCI.shift();
                var $_BIBFq = $_BIBCI[0];
                return this[$_BIBDm(407)][$_BIBDm(676)];
            }, $_BECN: function () {
                var $_BIBIU = PaLDJ.$_CS, $_BIBHS = ["$_BICBw"].concat($_BIBIU), $_BIBJx = $_BIBHS[1];
                $_BIBHS.shift();
                var $_BICAb = $_BIBHS[0];
                return this[$_BIBJx(407)][$_BIBIU(608)](), this;
            }, $_BEDq: function () {
                var $_BICDL = PaLDJ.$_CS, $_BICCy = ["$_BICGW"].concat($_BICDL), $_BICEQ = $_BICCy[1];
                $_BICCy.shift();
                var $_BICFi = $_BICCy[0];
                var e = this[$_BICEQ(649)]();
                return e[$_BICDL(686)] - e[$_BICDL(624)];
            }, $_BEEm: function (e) {
                var $_BICIA = PaLDJ.$_CS, $_BICHO = ["$_BIDBA"].concat($_BICIA), $_BICJz = $_BICHO[1];
                $_BICHO.shift();
                var $_BIDAx = $_BICHO[0];
                var t = this[$_BICJz(407)];
                return window[$_BICJz(742)] ? window[$_BICJz(742)](t)[e] : t[$_BICJz(784)][e];
            }, $_BEFT: function () {
                var $_BIDDx = PaLDJ.$_CS, $_BIDCA = ["$_BIDGb"].concat($_BIDDx), $_BIDEP = $_BIDCA[1];
                $_BIDCA.shift();
                var $_BIDFy = $_BIDCA[0];
                var e, t, n;
                try {
                    var r = this[$_BIDEP(407)], o = r;
                    while (o[$_BIDDx(646)] != N[$_BIDDx(441)] && r[$_BIDDx(731)] - o[$_BIDDx(646)][$_BIDEP(731)] < 160) o = o[$_BIDEP(646)], $_BIDDx(19) == (t = $_BIDDx(769), n = undefined, (e = o)[$_BIDEP(784)] ? n = e[$_BIDDx(784)][t] : window[$_BIDDx(742)] && (n = window[$_BIDEP(742)](e, null)[$_BIDEP(752)](t)), n) && (o[$_BIDDx(465)][$_BIDEP(769)] = $_BIDEP(716));
                } catch (i) {
                }
                return this;
            }, $_BEGd: function () {
                var $_BIDIQ = PaLDJ.$_CS, $_BIDHx = ["$_BIEBh"].concat($_BIDIQ), $_BIDJN = $_BIDHx[1];
                $_BIDHx.shift();
                var $_BIEAT = $_BIDHx[0];
                var e = this[$_BIDJN(407)], t = e[$_BIDIQ(798)], n = e[$_BIDJN(706)];
                while (null !== n) t += n[$_BIDIQ(798)], n = n[$_BIDIQ(706)];
                return t;
            }, $_BEHP: function () {
                var $_BIEDV = PaLDJ.$_CS, $_BIECD = ["$_BIEGB"].concat($_BIEDV), $_BIEEu = $_BIECD[1];
                $_BIECD.shift();
                var $_BIEFc = $_BIECD[0];
                var e = this[$_BIEEu(407)], t = e[$_BIEDV(731)], n = e[$_BIEEu(706)];
                while (null !== n) t += n[$_BIEEu(731)], n = n[$_BIEEu(706)];
                return t;
            }
        }, le[$_DADR(740)] = function (e) {
            var $_BIEIG = PaLDJ.$_CS, $_BIEHa = ["$_BIFBZ"].concat($_BIEIG), $_BIEJz = $_BIEHa[1];
            $_BIEHa.shift();
            var $_BIFAY = $_BIEHa[0];
            var t, n;
            $_BIEIG(10) == typeof e ? $_BIEIG(726) === e[0] ? t = N[$_BIEIG(763)](e[$_BIEIG(67)](1)) : $_BIEIG(775) in N ? t = N[$_BIEIG(775)](e) : Q(window[$_BIEIG(739)]) ? t = window[$_BIEJz(739)](e)[0] : $_BIEJz(726) === e[$_BIEJz(67)](0, 1) && (t = N[$_BIEIG(763)](e[$_BIEIG(67)](1))) : t = e[$_BIEIG(11)] ? e[0] : e;
            try {
                n = Node[$_BIEIG(787)];
            } catch (r) {
                n = 1;
            }
            try {
                if (t[$_BIEJz(757)] === n) return new le(t);
            } catch (r) {
                return false;
            }
        }, ue[$_DADR(91)] = {
            $_BEIz: function () {
                var $_BIFDN = PaLDJ.$_CS, $_BIFCu = ["$_BIFGl"].concat($_BIFDN), $_BIFEh = $_BIFCu[1];
                $_BIFCu.shift();
                var $_BIFFA = $_BIFCu[0];
                var e = this[$_BIFDN(698)];
                if (J(e[$_BIFEh(741)])) return e[$_BIFEh(741)];
                var t = e[$_BIFEh(710)] && e[$_BIFEh(710)][0];
                return t ? t[$_BIFEh(741)] : -1;
            }, $_BEJo: function () {
                var $_BIFIn = PaLDJ.$_CS, $_BIFHx = ["$_BIGBK"].concat($_BIFIn), $_BIFJa = $_BIFHx[1];
                $_BIFHx.shift();
                var $_BIGAL = $_BIFHx[0];
                var e = this[$_BIFJa(698)];
                if (J(e[$_BIFJa(711)])) return e[$_BIFIn(711)];
                var t = e[$_BIFIn(710)] && e[$_BIFJa(710)][0];
                return t ? t[$_BIFIn(711)] : -1;
            }, $_BFAe: function () {
                var $_BIGDS = PaLDJ.$_CS, $_BIGCz = ["$_BIGGQ"].concat($_BIGDS), $_BIGEg = $_BIGCz[1];
                $_BIGCz.shift();
                var $_BIGFq = $_BIGCz[0];
                var e = this[$_BIGEg(698)];
                return e[$_BIGDS(737)] && Q(e[$_BIGDS(750)]) ? e[$_BIGEg(750)]() : e[$_BIGDS(762)] = false, this;
            }, $_BFBY: function () {
                var $_BIGIY = PaLDJ.$_CS, $_BIGHV = ["$_BIHBa"].concat($_BIGIY), $_BIGJo = $_BIGHV[1];
                $_BIGHV.shift();
                var $_BIHAJ = $_BIGHV[0];
                var e = this[$_BIGIY(698)];
                return Q(e[$_BIGJo(753)]) && e[$_BIGJo(753)](), this;
            }
        };
        var he, fe, de = function () {
            var $_BIHDf = PaLDJ.$_CS, $_BIHCn = ["$_BIHGy"].concat($_BIHDf), $_BIHEy = $_BIHCn[1];
            $_BIHCn.shift();
            var $_BIHFt = $_BIHCn[0];
            "use strict";
            var l, u, n, p, e = {},
                t = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

            function r(e) {
                var $_DDDIm = PaLDJ.$_Dz()[4][6];
                for (; $_DDDIm !== PaLDJ.$_Dz()[0][5];) {
                    switch ($_DDDIm) {
                        case PaLDJ.$_Dz()[2][6]:
                            return e < 10 ? $_BIHEy(246) + e : e;
                            break;
                    }
                }
            }

            function o() {
                var $_DDDJy = PaLDJ.$_Dz()[0][6];
                for (; $_DDDJy !== PaLDJ.$_Dz()[4][5];) {
                    switch ($_DDDJy) {
                        case PaLDJ.$_Dz()[4][6]:
                            return this[$_BIHDf(219)]();
                            break;
                    }
                }
            }

            function h(e) {
                var $_DDEAw = PaLDJ.$_Dz()[2][6];
                for (; $_DDEAw !== PaLDJ.$_Dz()[4][5];) {
                    switch ($_DDEAw) {
                        case PaLDJ.$_Dz()[0][6]:
                            return t[$_BIHEy(747)] = 0, t[$_BIHDf(446)](e) ? $_BIHDf(789) + e[$_BIHEy(299)](t, function (e) {
                                var $_BIHIh = PaLDJ.$_CS, $_BIHHv = ["$_BIIBW"].concat($_BIHIh), $_BIHJs = $_BIHHv[1];
                                $_BIHHv.shift();
                                var $_BIIAv = $_BIHHv[0];
                                var t = n[e];
                                return $_BIHJs(10) == typeof t ? t : $_BIHJs(735) + ($_BIHIh(727) + e[$_BIHIh(54)](0)[$_BIHJs(66)](16))[$_BIHIh(67)](-4);
                            }) + $_BIHEy(789) : $_BIHDf(789) + e + $_BIHEy(789);
                            break;
                    }
                }
            }

            return $_BIHEy(200) != typeof Date[$_BIHDf(91)][$_BIHEy(751)] && (Date[$_BIHEy(91)][$_BIHDf(751)] = function () {
                var $_BIIDR = PaLDJ.$_CS, $_BIICr = ["$_BIIGg"].concat($_BIIDR), $_BIIEe = $_BIICr[1];
                $_BIICr.shift();
                var $_BIIFT = $_BIICr[0];
                return isFinite(this[$_BIIDR(219)]()) ? this[$_BIIDR(797)]() + $_BIIDR(296) + r(this[$_BIIEe(776)]() + 1) + $_BIIDR(296) + r(this[$_BIIDR(714)]()) + $_BIIEe(728) + r(this[$_BIIDR(774)]()) + $_BIIEe(281) + r(this[$_BIIDR(791)]()) + $_BIIDR(281) + r(this[$_BIIDR(772)]()) + $_BIIDR(704) : null;
            }, Boolean[$_BIHDf(91)][$_BIHEy(751)] = o, Number[$_BIHEy(91)][$_BIHEy(751)] = o, String[$_BIHDf(91)][$_BIHDf(751)] = o), n = {
                "": $_BIHDf(755),
                "	": $_BIHEy(780),
                "\n": $_BIHDf(746),
                "": $_BIHEy(779),
                "\r": $_BIHDf(713),
                '"': $_BIHDf(794),
                "\\": $_BIHDf(733)
            }, e[$_BIHEy(411)] = function (e, t, n) {
                var $_BIIIR = PaLDJ.$_CS, $_BIIHH = ["$_BIJBJ"].concat($_BIIIR), $_BIIJE = $_BIIHH[1];
                $_BIIHH.shift();
                var $_BIJAI = $_BIIHH[0];
                var r;
                if (u = l = $_BIIJE(253), $_BIIIR(347) == typeof n) for (r = 0; r < n; r += 1) u += $_BIIIR(52); else $_BIIIR(10) == typeof n && (u = n);
                if ((p = t) && $_BIIJE(200) != typeof t && ($_BIIJE(9) != typeof t || $_BIIJE(347) != typeof t[$_BIIJE(11)])) throw new Error($_BIIJE(702));
                return function c(e, t) {
                    var $_BIJDj = PaLDJ.$_CS, $_BIJCi = ["$_BIJGH"].concat($_BIJDj), $_BIJE_ = $_BIJCi[1];
                    $_BIJCi.shift();
                    var $_BIJFw = $_BIJCi[0];
                    var n, r, o, i, s, a = l, _ = t[e];
                    switch (_ && $_BIJDj(9) == typeof _ && $_BIJDj(200) == typeof _[$_BIJE_(751)] && (_ = _[$_BIJE_(751)](e)), $_BIJE_(200) == typeof p && (_ = p[$_BIJE_(72)](t, e, _)), typeof _) {
                        case $_BIJE_(10):
                            return h(_);
                        case $_BIJE_(347):
                            return isFinite(_) ? String(_) : $_BIJDj(788);
                        case $_BIJDj(378):
                        case $_BIJE_(788):
                            return String(_);
                        case $_BIJE_(9):
                            if (!_) return $_BIJDj(788);
                            if (l += u, s = [], $_BIJDj(601) === Object[$_BIJDj(91)][$_BIJE_(66)][$_BIJDj(81)](_)) {
                                for (i = _[$_BIJE_(11)], n = 0; n < i; n += 1) s[n] = c(n, _) || $_BIJE_(788);
                                return o = 0 === s[$_BIJE_(11)] ? $_BIJE_(745) : l ? $_BIJDj(748) + l + s[$_BIJDj(628)]($_BIJDj(717) + l) + $_BIJDj(448) + a + $_BIJDj(781) : $_BIJE_(759) + s[$_BIJE_(628)]($_BIJDj(795)) + $_BIJDj(781), l = a, o;
                            }
                            if (p && $_BIJDj(9) == typeof p) for (i = p[$_BIJDj(11)], n = 0; n < i; n += 1) $_BIJE_(10) == typeof p[n] && (o = c(r = p[n], _)) && s[$_BIJDj(2)](h(r) + (l ? $_BIJDj(351) : $_BIJDj(281)) + o); else for (r in _) Object[$_BIJE_(91)][$_BIJE_(12)][$_BIJDj(72)](_, r) && (o = c(r, _)) && s[$_BIJDj(2)](h(r) + (l ? $_BIJDj(351) : $_BIJE_(281)) + o);
                            return o = 0 === s[$_BIJDj(11)] ? $_BIJDj(701) : l ? $_BIJDj(785) + l + s[$_BIJDj(628)]($_BIJDj(717) + l) + $_BIJE_(448) + a + $_BIJE_(761) : $_BIJE_(730) + s[$_BIJE_(628)]($_BIJE_(795)) + $_BIJE_(761), l = a, o;
                    }
                }($_BIIIR(253), {"": e});
            }, e;
        }(), ge = $_DADR(268), ve = 1, xe = function () {
            var $_BIJIO = PaLDJ.$_CS, $_BIJHo = ["$_BJABu"].concat($_BIJIO), $_BIJJd = $_BIJHo[1];
            $_BIJHo.shift();
            var $_BJAAf = $_BIJHo[0];
            var _, e = Object[$_BIJIO(91)], c = e[$_BIJJd(12)], t = $_BIJIO(200) == typeof Symbol ? Symbol : {},
                o = t[$_BIJJd(777)] || $_BIJIO(723), n = t[$_BIJIO(709)] || $_BIJJd(758);
            $_BIJIO(200) != typeof Object[$_BIJJd(24)] && (Object[$_BIJJd(24)] = function (e) {
                var $_BJADm = PaLDJ.$_CS, $_BJACe = ["$_BJAGG"].concat($_BJADm), $_BJAEw = $_BJACe[1];
                $_BJACe.shift();
                var $_BJAFM = $_BJACe[0];
                if (null !== e && $_BJAEw(9) != typeof e && $_BJADm(200) != typeof e) throw TypeError($_BJAEw(718));

                function t() {
                    var $_DDEBI = PaLDJ.$_Dz()[2][6];
                    for (; $_DDEBI !== PaLDJ.$_Dz()[4][6];) {
                        switch ($_DDEBI) {
                        }
                    }
                }

                return t[$_BJADm(91)] = e, new t;
            }), Array[$_BIJJd(91)][$_BIJJd(696)] || (Array[$_BIJJd(91)][$_BIJIO(696)] = function (e) {
                var $_BJAIs = PaLDJ.$_CS, $_BJAHG = ["$_BJBBs"].concat($_BJAIs), $_BJAJB = $_BJAHG[1];
                $_BJAHG.shift();
                var $_BJBAj = $_BJAHG[0];
                var t, n;
                if (null == this) throw new TypeError($_BJAJB(732));
                var r = Object(this), o = r[$_BJAJB(11)] >>> 0;
                if ($_BJAJB(200) != typeof e) throw new TypeError(e + $_BJAJB(799));
                1 < arguments[$_BJAIs(11)] && (t = arguments[1]), n = 0;
                while (n < o) {
                    var i;
                    n in r && (i = r[n], e[$_BJAJB(72)](t, i, n, r)), n++;
                }
            });
            var r = {};

            function l(e, t, n) {
                var $_DDECu = PaLDJ.$_Dz()[0][6];
                for (; $_DDECu !== PaLDJ.$_Dz()[2][5];) {
                    switch ($_DDECu) {
                        case PaLDJ.$_Dz()[2][6]:
                            try {
                                return {type: $_BIJIO(778), arg: e[$_BIJIO(72)](t, n)};
                            } catch (r) {
                                return {type: $_BIJJd(744), arg: r};
                            }
                            $_DDECu = PaLDJ.$_Dz()[2][5];
                            break;
                    }
                }
            }

            r[$_BIJIO(721)] = function k(e, t, n, r) {
                var $_BJBDN = PaLDJ.$_CS, $_BJBCD = ["$_BJBGC"].concat($_BJBDN), $_BJBEk = $_BJBCD[1];
                $_BJBCD.shift();
                var $_BJBFF = $_BJBCD[0];
                var o = t && t[$_BJBEk(91)] instanceof a ? t : a, i = Object[$_BJBEk(24)](o[$_BJBDN(91)]),
                    s = new b(r || []);
                return i[$_BJBDN(792)] = function c(i, s, a) {
                    var $_BJBIO = PaLDJ.$_CS, $_BJBHz = ["$_BJCBt"].concat($_BJBIO), $_BJBJB = $_BJBHz[1];
                    $_BJBHz.shift();
                    var $_BJCAb = $_BJBHz[0];
                    var _ = u;
                    return function (e, t) {
                        var $_BJCDg = PaLDJ.$_CS, $_BJCCM = ["$_BJCGe"].concat($_BJCDg), $_BJCEe = $_BJCCM[1];
                        $_BJCCM.shift();
                        var $_BJCFo = $_BJCCM[0];
                        if (_ === h) throw new Error($_BJCDg(754));
                        if (_ === f) {
                            if ($_BJCEe(744) === e) throw t;
                            return C();
                        }
                        a[$_BJCEe(760)] = e, a[$_BJCEe(738)] = t;
                        while (1) {
                            var n = a[$_BJCEe(707)];
                            if (n) {
                                var r = maybeInvokeDelegate(n, a);
                                if (r) {
                                    if (r === d) continue;
                                    return r;
                                }
                            }
                            if ($_BJCDg(257) === a[$_BJCEe(760)]) a[$_BJCEe(749)] = a[$_BJCEe(719)] = a[$_BJCEe(738)]; else if ($_BJCDg(744) === a[$_BJCDg(760)]) {
                                if (_ === u) throw _ = f, a[$_BJCDg(738)];
                                a[$_BJCEe(786)](a[$_BJCDg(738)]);
                            } else $_BJCDg(756) === a[$_BJCEe(760)] && a[$_BJCEe(768)]($_BJCDg(756), a[$_BJCDg(738)]);
                            _ = h;
                            var o = l(i, s, a);
                            if ($_BJCEe(778) === o[$_BJCEe(317)]) {
                                if (_ = a[$_BJCEe(708)] ? f : p, o[$_BJCDg(738)] === d) continue;
                                return {value: o[$_BJCDg(738)], done: a[$_BJCEe(708)]};
                            }
                            $_BJCEe(744) === o[$_BJCEe(317)] && (_ = f, a[$_BJCEe(760)] = $_BJCDg(744), a[$_BJCDg(738)] = o[$_BJCEe(738)]);
                        }
                    };
                }(e, n, s), i;
            };
            var u = $_BIJIO(765), p = $_BIJIO(734), h = $_BIJIO(700), f = $_BIJIO(712), d = {};

            function a() {
                var $_DDEDW = PaLDJ.$_Dz()[2][6];
                for (; $_DDEDW !== PaLDJ.$_Dz()[2][6];) {
                    switch ($_DDEDW) {
                    }
                }
            }

            function i() {
                var $_DDEEl = PaLDJ.$_Dz()[0][6];
                for (; $_DDEEl !== PaLDJ.$_Dz()[4][6];) {
                    switch ($_DDEEl) {
                    }
                }
            }

            function s() {
                var $_DDEFU = PaLDJ.$_Dz()[4][6];
                for (; $_DDEFU !== PaLDJ.$_Dz()[2][6];) {
                    switch ($_DDEFU) {
                    }
                }
            }

            var g = {};
            g[o] = function () {
                var $_BJCI_ = PaLDJ.$_CS, $_BJCHm = ["$_BJDBo"].concat($_BJCI_), $_BJCJ_ = $_BJCHm[1];
                $_BJCHm.shift();
                var $_BJDAn = $_BJCHm[0];
                return this;
            };
            var v = Object[$_BIJIO(650)], m = v && v(v(E([])));
            m && m !== e && c[$_BIJIO(72)](m, o) && (g = m);
            var x = s[$_BIJIO(91)] = a[$_BIJJd(91)] = Object[$_BIJIO(24)](g);

            function w(e) {
                var $_DDEGT = PaLDJ.$_Dz()[0][6];
                for (; $_DDEGT !== PaLDJ.$_Dz()[4][5];) {
                    switch ($_DDEGT) {
                        case PaLDJ.$_Dz()[2][6]:
                            var t = {tryLoc: e[0]};
                            1 in e && (t[$_BIJJd(811)] = e[1]), 2 in e && (t[$_BIJJd(842)] = e[2], t[$_BIJIO(840)] = e[3]), this[$_BIJJd(887)][$_BIJIO(2)](t);
                            $_DDEGT = PaLDJ.$_Dz()[2][5];
                            break;
                    }
                }
            }

            function y(e) {
                var $_DDEHC = PaLDJ.$_Dz()[0][6];
                for (; $_DDEHC !== PaLDJ.$_Dz()[4][4];) {
                    switch ($_DDEHC) {
                        case PaLDJ.$_Dz()[4][6]:
                            var t = e[$_BIJIO(851)] || {};
                            $_DDEHC = PaLDJ.$_Dz()[4][5];
                            break;
                        case PaLDJ.$_Dz()[4][5]:
                            t[$_BIJJd(317)] = $_BIJJd(778), delete t[$_BIJIO(738)], e[$_BIJJd(851)] = t;
                            $_DDEHC = PaLDJ.$_Dz()[0][4];
                            break;
                    }
                }
            }

            function b(e) {
                var $_DDEIh = PaLDJ.$_Dz()[2][6];
                for (; $_DDEIh !== PaLDJ.$_Dz()[0][5];) {
                    switch ($_DDEIh) {
                        case PaLDJ.$_Dz()[0][6]:
                            this[$_BIJJd(887)] = [{tryLoc: $_BIJJd(849)}], e[$_BIJIO(696)](w, this), this[$_BIJIO(33)](true);
                            $_DDEIh = PaLDJ.$_Dz()[4][5];
                            break;
                    }
                }
            }

            function E(e) {
                var $_DDEJn = PaLDJ.$_Dz()[0][6];
                for (; $_DDEJn !== PaLDJ.$_Dz()[2][5];) {
                    switch ($_DDEJn) {
                        case PaLDJ.$_Dz()[2][6]:
                            if (e) {
                                var t = e[o];
                                if (t) return t[$_BIJJd(72)](e);
                                if ($_BIJIO(200) == typeof e[$_BIJIO(257)]) return e;
                                if (!isNaN(e[$_BIJJd(11)])) {
                                    var n = -1, r = function r() {
                                        var $_BJDDx = PaLDJ.$_CS, $_BJDCL = ["$_BJDGb"].concat($_BJDDx),
                                            $_BJDEV = $_BJDCL[1];
                                        $_BJDCL.shift();
                                        var $_BJDFw = $_BJDCL[0];
                                        while (++n < e[$_BJDDx(11)]) if (c[$_BJDEV(72)](e, n)) return r[$_BJDDx(676)] = e[n], r[$_BJDDx(708)] = false, r;
                                        return r[$_BJDEV(676)] = _, r[$_BJDEV(708)] = true, r;
                                    };
                                    return r[$_BIJJd(257)] = r;
                                }
                            }
                            return {next: C};
                            break;
                    }
                }
            }

            function C() {
                var $_DDFAv = PaLDJ.$_Dz()[4][6];
                for (; $_DDFAv !== PaLDJ.$_Dz()[2][5];) {
                    switch ($_DDFAv) {
                        case PaLDJ.$_Dz()[4][6]:
                            return {value: _, done: true};
                            break;
                    }
                }
            }

            return i[$_BIJIO(91)] = x[$_BIJJd(644)] = s, s[$_BIJIO(644)] = i, s[n] = i[$_BIJIO(814)] = $_BIJJd(839), r[$_BIJJd(823)] = function (e) {
                var $_BJDIb = PaLDJ.$_CS, $_BJDHp = ["$_BJEBR"].concat($_BJDIb), $_BJDJz = $_BJDHp[1];
                $_BJDHp.shift();
                var $_BJEAK = $_BJDHp[0];
                return Object[$_BJDJz(898)] ? Object[$_BJDIb(898)](e, s) : (e[$_BJDIb(627)] = s, n in e || (e[n] = $_BJDJz(839))), e[$_BJDIb(91)] = Object[$_BJDIb(24)](x), e;
            }, function S(e) {
                var $_BJEDU = PaLDJ.$_CS, $_BJECE = ["$_BJEGz"].concat($_BJEDU), $_BJEEv = $_BJECE[1];
                $_BJECE.shift();
                var $_BJEFn = $_BJECE[0];
                [$_BJEDU(257), $_BJEDU(744), $_BJEEv(756)][$_BJEDU(696)](function (t) {
                    var $_BJEII = PaLDJ.$_CS, $_BJEHA = ["$_BJFBW"].concat($_BJEII), $_BJEJl = $_BJEHA[1];
                    $_BJEHA.shift();
                    var $_BJFAs = $_BJEHA[0];
                    e[t] = function (e) {
                        var $_BJFDn = PaLDJ.$_CS, $_BJFCp = ["$_BJFGy"].concat($_BJFDn), $_BJFEp = $_BJFCp[1];
                        $_BJFCp.shift();
                        var $_BJFFx = $_BJFCp[0];
                        return this[$_BJFEp(792)](t, e);
                    };
                });
            }(x), x[n] = $_BIJIO(817), x[o] = function () {
                var $_BJFIU = PaLDJ.$_CS, $_BJFHm = ["$_BJGBD"].concat($_BJFIU), $_BJFJh = $_BJFHm[1];
                $_BJFHm.shift();
                var $_BJGAj = $_BJFHm[0];
                return this;
            }, x[$_BIJIO(66)] = function () {
                var $_BJGDE = PaLDJ.$_CS, $_BJGCH = ["$_BJGGF"].concat($_BJGDE), $_BJGEu = $_BJGCH[1];
                $_BJGCH.shift();
                var $_BJGFa = $_BJGCH[0];
                return $_BJGEu(816);
            }, r[$_BIJIO(870)] = function (t) {
                var $_BJGIW = PaLDJ.$_CS, $_BJGHK = ["$_BJHBT"].concat($_BJGIW), $_BJGJb = $_BJGHK[1];
                $_BJGHK.shift();
                var $_BJHAE = $_BJGHK[0];
                var n = [];
                for (var e in t) n[$_BJGJb(2)](e);
                return n[$_BJGIW(890)](), function r() {
                    var $_BJHDY = PaLDJ.$_CS, $_BJHCC = ["$_BJHGU"].concat($_BJHDY), $_BJHEQ = $_BJHCC[1];
                    $_BJHCC.shift();
                    var $_BJHFQ = $_BJHCC[0];
                    while (n[$_BJHEQ(11)]) {
                        var e = n[$_BJHEQ(812)]();
                        if (e in t) return r[$_BJHEQ(676)] = e, r[$_BJHEQ(708)] = false, r;
                    }
                    return r[$_BJHEQ(708)] = true, r;
                };
            }, r[$_BIJJd(896)] = E, b[$_BIJJd(91)] = {
                varructor: b, reset: function (e) {
                    var $_BJHId = PaLDJ.$_CS, $_BJHHv = ["$_BJIBF"].concat($_BJHId), $_BJHJu = $_BJHHv[1];
                    $_BJHHv.shift();
                    var $_BJIAf = $_BJHHv[0];
                    if (this[$_BJHJu(841)] = 0, this[$_BJHId(257)] = 0, this[$_BJHJu(749)] = this[$_BJHJu(719)] = _, this[$_BJHJu(708)] = false, this[$_BJHJu(707)] = null, this[$_BJHId(760)] = $_BJHJu(257), this[$_BJHJu(738)] = _, this[$_BJHJu(887)][$_BJHJu(696)](y), !e) for (var t in this) $_BJHJu(500) === t[$_BJHId(429)](0) && c[$_BJHId(72)](this, t) && !isNaN(+t[$_BJHJu(67)](1)) && (this[t] = _);
                }, stop: function () {
                    var $_BJIDg = PaLDJ.$_CS, $_BJICf = ["$_BJIGC"].concat($_BJIDg), $_BJIEA = $_BJICf[1];
                    $_BJICf.shift();
                    var $_BJIFB = $_BJICf[0];
                    this[$_BJIDg(708)] = true;
                    var e = this[$_BJIEA(887)][0][$_BJIDg(851)];
                    if ($_BJIEA(744) === e[$_BJIEA(317)]) throw e[$_BJIDg(738)];
                    return this[$_BJIDg(846)];
                }, dispatchException: function (n) {
                    var $_BJIIK = PaLDJ.$_CS, $_BJIHk = ["$_BJJBQ"].concat($_BJIIK), $_BJIJW = $_BJIHk[1];
                    $_BJIHk.shift();
                    var $_BJJAS = $_BJIHk[0];
                    if (this[$_BJIIK(708)]) throw n;
                    var r = this;

                    function e(e, t) {
                        var $_DDFBF = PaLDJ.$_Dz()[4][6];
                        for (; $_DDFBF !== PaLDJ.$_Dz()[2][5];) {
                            switch ($_DDFBF) {
                                case PaLDJ.$_Dz()[4][6]:
                                    return i[$_BJIIK(317)] = $_BJIJW(744), i[$_BJIIK(738)] = n, r[$_BJIIK(257)] = e, t && (r[$_BJIJW(760)] = $_BJIIK(257), r[$_BJIJW(738)] = _), !!t;
                                    break;
                            }
                        }
                    }

                    for (var t = this[$_BJIJW(887)][$_BJIJW(11)] - 1; 0 <= t; --t) {
                        var o = this[$_BJIJW(887)][t], i = o[$_BJIIK(851)];
                        if ($_BJIJW(849) === o[$_BJIJW(878)]) return e($_BJIIK(418));
                        if (o[$_BJIJW(878)] <= this[$_BJIJW(841)]) {
                            var s = c[$_BJIJW(72)](o, $_BJIIK(811)), a = c[$_BJIIK(72)](o, $_BJIJW(842));
                            if (s && a) {
                                if (this[$_BJIJW(841)] < o[$_BJIIK(811)]) return e(o[$_BJIJW(811)], true);
                                if (this[$_BJIIK(841)] < o[$_BJIJW(842)]) return e(o[$_BJIJW(842)]);
                            } else if (s) {
                                if (this[$_BJIJW(841)] < o[$_BJIIK(811)]) return e(o[$_BJIJW(811)], true);
                            } else {
                                if (!a) throw new Error($_BJIIK(876));
                                if (this[$_BJIJW(841)] < o[$_BJIJW(842)]) return e(o[$_BJIJW(842)]);
                            }
                        }
                    }
                }, abrupt: function (e, t) {
                    var $_BJJDV = PaLDJ.$_CS, $_BJJCZ = ["$_BJJGk"].concat($_BJJDV), $_BJJEE = $_BJJCZ[1];
                    $_BJJCZ.shift();
                    var $_BJJFq = $_BJJCZ[0];
                    for (var n = this[$_BJJEE(887)][$_BJJEE(11)] - 1; 0 <= n; --n) {
                        var r = this[$_BJJEE(887)][n];
                        if (r[$_BJJEE(878)] <= this[$_BJJDV(841)] && c[$_BJJDV(72)](r, $_BJJEE(842)) && this[$_BJJDV(841)] < r[$_BJJEE(842)]) {
                            var o = r;
                            break;
                        }
                    }
                    o && ($_BJJDV(820) === e || $_BJJEE(886) === e) && o[$_BJJEE(878)] <= t && t <= o[$_BJJEE(842)] && (o = null);
                    var i = o ? o[$_BJJEE(851)] : {};
                    return i[$_BJJEE(317)] = e, i[$_BJJDV(738)] = t, o ? (this[$_BJJEE(760)] = $_BJJEE(257), this[$_BJJEE(257)] = o[$_BJJEE(842)], d) : this[$_BJJEE(384)](i);
                }, complete: function (e, t) {
                    var $_BJJIG = PaLDJ.$_CS, $_BJJHr = ["$_CAABI"].concat($_BJJIG), $_BJJJs = $_BJJHr[1];
                    $_BJJHr.shift();
                    var $_CAAAm = $_BJJHr[0];
                    if ($_BJJJs(744) === e[$_BJJIG(317)]) throw e[$_BJJIG(738)];
                    return $_BJJJs(820) === e[$_BJJIG(317)] || $_BJJIG(886) === e[$_BJJIG(317)] ? this[$_BJJIG(257)] = e[$_BJJJs(738)] : $_BJJJs(756) === e[$_BJJIG(317)] ? (this[$_BJJJs(846)] = this[$_BJJJs(738)] = e[$_BJJJs(738)], this[$_BJJIG(760)] = $_BJJIG(756), this[$_BJJJs(257)] = $_BJJIG(418)) : $_BJJJs(778) === e[$_BJJIG(317)] && t && (this[$_BJJIG(257)] = t), d;
                }, finish: function (e) {
                    var $_CAADF = PaLDJ.$_CS, $_CAACx = ["$_CAAGV"].concat($_CAADF), $_CAAEE = $_CAACx[1];
                    $_CAACx.shift();
                    var $_CAAFI = $_CAACx[0];
                    for (var t = this[$_CAAEE(887)][$_CAADF(11)] - 1; 0 <= t; --t) {
                        var n = this[$_CAADF(887)][t];
                        if (n[$_CAADF(842)] === e) return this[$_CAADF(384)](n[$_CAAEE(851)], n[$_CAADF(840)]), y(n), d;
                    }
                }, catch: function (e) {
                    var $_CAAIp = PaLDJ.$_CS, $_CAAHb = ["$_CABBO"].concat($_CAAIp), $_CAAJp = $_CAAHb[1];
                    $_CAAHb.shift();
                    var $_CABAT = $_CAAHb[0];
                    for (var t = this[$_CAAIp(887)][$_CAAJp(11)] - 1; 0 <= t; --t) {
                        var n = this[$_CAAIp(887)][t];
                        if (n[$_CAAJp(878)] === e) {
                            var r = n[$_CAAJp(851)];
                            if ($_CAAJp(744) === r[$_CAAJp(317)]) {
                                var o = r[$_CAAIp(738)];
                                y(n);
                            }
                            return o;
                        }
                    }
                    throw new Error($_CAAJp(831));
                }, delegateYield: function (e, t, n) {
                    var $_CABDs = PaLDJ.$_CS, $_CABCr = ["$_CABGr"].concat($_CABDs), $_CABEC = $_CABCr[1];
                    $_CABCr.shift();
                    var $_CABFl = $_CABCr[0];
                    return this[$_CABDs(707)] = {
                        iterator: E(e),
                        resultName: t,
                        nextLoc: n
                    }, $_CABEC(257) === this[$_CABDs(760)] && (this[$_CABEC(738)] = _), d;
                }
            }, r;
        }(), ye = function () {
            var $_CABIa = PaLDJ.$_CS, $_CABHP = ["$_CACBR"].concat($_CABIa), $_CABJh = $_CABHP[1];
            $_CABHP.shift();
            var $_CACAZ = $_CABHP[0];

            function v(e) {
                var $_DDFCc = PaLDJ.$_Dz()[4][6];
                for (; $_DDFCc !== PaLDJ.$_Dz()[0][4];) {
                    switch ($_DDFCc) {
                        case PaLDJ.$_Dz()[0][6]:
                            for (var t = [], n = [], r = 0, o = e[$_CABIa(11)]; r < o; r++) {
                                var i = e[r];
                                0 < i[1] ? t[$_CABIa(2)](i) : n[$_CABJh(2)](i);
                            }
                            t[$_CABJh(868)](function (e, t) {
                                var $_CACDZ = PaLDJ.$_CS, $_CACCJ = ["$_CACGf"].concat($_CACDZ), $_CACEs = $_CACCJ[1];
                                $_CACCJ.shift();
                                var $_CACFA = $_CACCJ[0];
                                return e[0] - t[0];
                            }), t[$_CABJh(890)](), n[$_CABJh(868)](function (e, t) {
                                var $_CACId = PaLDJ.$_CS, $_CACHl = ["$_CADBe"].concat($_CACId), $_CACJl = $_CACHl[1];
                                $_CACHl.shift();
                                var $_CADAr = $_CACHl[0];
                                return e[0] - t[0];
                            }), t = t[$_CABIa(27)](n);
                            var s = [];
                            $_DDFCc = PaLDJ.$_Dz()[2][5];
                            break;
                        case PaLDJ.$_Dz()[0][5]:
                            for (r = 0; r < 2; r++) {
                                var a = t[r][0], _ = t[r + 1][0], c = t[r + 3][0], l = t[r + 4][0], u = t[r][1],
                                    p = t[r + 1][1], h = t[r + 3][1], f = t[r + 4][1];
                                s[$_CABIa(2)](m(a, u, _, p, c, h, l, f));
                            }
                            return s;
                            break;
                    }
                }
            }

            function m(e, t, n, r, o, i, s, a) {
                var $_DDFDw = PaLDJ.$_Dz()[0][6];
                for (; $_DDFDw !== PaLDJ.$_Dz()[4][4];) {
                    switch ($_DDFDw) {
                        case PaLDJ.$_Dz()[2][6]:
                            $_CABIa(347) != typeof e && (e = parseFloat(e), t = parseFloat(t), n = parseFloat(n), r = parseFloat(r), o = parseFloat(o), i = parseFloat(i), s = parseFloat(s), a = parseFloat(a));
                            var _ = (t - r) / (e - n), c = (i - a) / (o - s), l = (_ * e - c * o + i - t) / (_ - c);
                            $_DDFDw = PaLDJ.$_Dz()[2][5];
                            break;
                        case PaLDJ.$_Dz()[2][5]:
                            return [l, t + (l - e) * _];
                            break;
                    }
                }
            }

            function x(e, t) {
                var $_DDFEN = PaLDJ.$_Dz()[0][6];
                for (; $_DDFEN !== PaLDJ.$_Dz()[2][5];) {
                    switch ($_DDFEN) {
                        case PaLDJ.$_Dz()[0][6]:
                            for (var n = e[$_CABJh(11)] - 1; 0 <= n; n--) {
                                var r = e[n];
                                if (r[0] == t[0] && r[1] == t[1]) return true;
                            }
                            return false;
                            break;
                    }
                }
            }

            return {
                calculate: function w(e) {
                    var $_CADDg = PaLDJ.$_CS, $_CADCf = ["$_CADGC"].concat($_CADDg), $_CADER = $_CADCf[1];
                    $_CADCf.shift();
                    var $_CADFb = $_CADCf[0];
                    for (var t, n, r, o, i, s, a, _, c = e[$_CADER(508)] || [], l = e[$_CADER(835)], u = null, p = c[$_CADDg(11)] - 1; 0 <= p; p--) {
                        for (var h = c[p], f = (t = h[0], n = h[1], r = h[2], _ = undefined, o = v(t)[$_CADDg(27)](v(n), v(r)), i = m(o[0][0], o[0][1], o[1][0], o[1][1], o[2][0], o[2][1], o[3][0], o[3][1]), s = m(o[0][0], o[0][1], o[1][0], o[1][1], o[4][0], o[4][1], o[5][0], o[5][1]), a = m(o[2][0], o[2][1], o[3][0], o[3][1], o[4][0], o[4][1], o[5][0], o[5][1]), (_ = [])[$_CADDg(2)](i), _[$_CADDg(2)](s), _[$_CADDg(2)](a), _), d = true, g = 0; g < f[$_CADER(11)]; g++) if (!x(l, f[g])) {
                            d = false;
                            break;
                        }
                        if (d) {
                            u = h;
                            break;
                        }
                    }
                    return u;
                }
            };
        }(), be = function () {
            var $_CADIt = PaLDJ.$_CS, $_CADHU = ["$_CAEBR"].concat($_CADIt), $_CADJD = $_CADHU[1];
            $_CADHU.shift();
            var $_CAEAV = $_CADHU[0];
            var e = xe[$_CADJD(823)](n);

            function n(t, n) {
                var $_DDFFo = PaLDJ.$_Dz()[0][6];
                for (; $_DDFFo !== PaLDJ.$_Dz()[2][5];) {
                    switch ($_DDFFo) {
                        case PaLDJ.$_Dz()[4][6]:
                            var r, o, i, s, a, _, c, l, u, p, h, f;
                            return xe[$_CADIt(721)](function (e) {
                                var $_CAEDL = PaLDJ.$_CS, $_CAECQ = ["$_CAEGc"].concat($_CAEDL), $_CAEEb = $_CAECQ[1];
                                $_CAECQ.shift();
                                var $_CAEFq = $_CAECQ[0];
                                while (1) switch (e[$_CAEDL(841)] = e[$_CAEEb(257)]) {
                                    case 0:
                                        r = n[0] || [], o = n[1] || [], i = n[2] || [], a = $_BCL(t, (s = 6) - r[$_CAEDL(11)]), c = [], l = 1e3;
                                    case 7:
                                        if (!(_ = a[$_CAEDL(257)]())) {
                                            e[$_CAEEb(257)] = 21;
                                            break;
                                        }
                                        u = d(t, _), p = $_BCL(u, s - o[$_CAEEb(11)]);
                                    case 10:
                                        if (!(h = p[$_CAEDL(257)]())) {
                                            e[$_CAEDL(257)] = 19;
                                            break;
                                        }
                                        if (f = d(u, h), c[$_CAEDL(2)]([r[$_CAEEb(27)](_), o[$_CAEDL(27)](h), i[$_CAEDL(27)](f)]), c[$_CAEDL(11)] === l) return e[$_CAEEb(257)] = 16, c;
                                        e[$_CAEEb(257)] = 17;
                                        break;
                                    case 16:
                                        c = [];
                                    case 17:
                                        e[$_CAEEb(257)] = 10;
                                        break;
                                    case 19:
                                        e[$_CAEEb(257)] = 7;
                                        break;
                                    case 21:
                                        if (c[$_CAEDL(11)]) return e[$_CAEEb(257)] = 24, c;
                                        e[$_CAEEb(257)] = 24;
                                        break;
                                    case 24:
                                    case $_CAEDL(418):
                                        return e[$_CAEDL(845)]();
                                }
                            }, e, this);
                            break;
                    }
                }
            }

            function d(e, t) {
                var $_DDFGG = PaLDJ.$_Dz()[2][6];
                for (; $_DDFGG !== PaLDJ.$_Dz()[2][5];) {
                    switch ($_DDFGG) {
                        case PaLDJ.$_Dz()[4][6]:
                            for (var n = e[$_CADIt(67)](0), r = t[$_CADIt(11)] - 1; 0 <= r; r--) {
                                var o = i(n, t[r]);
                                0 <= o && n[$_CADIt(63)](o, 1);
                            }
                            return n;
                            break;
                    }
                }
            }

            function i(e, t) {
                var $_DDFHu = PaLDJ.$_Dz()[0][6];
                for (; $_DDFHu !== PaLDJ.$_Dz()[0][5];) {
                    switch ($_DDFHu) {
                        case PaLDJ.$_Dz()[2][6]:
                            if (e[$_CADJD(323)]) return e[$_CADIt(323)](t);
                            for (var n = 0, r = e[$_CADIt(11)]; n < r; n++) if (e[n] === t) return n;
                            return -1;
                            break;
                    }
                }
            }

            return {
                build: function r(e, t) {
                    var $_CAEIH = PaLDJ.$_CS, $_CAEHi = ["$_CAFBq"].concat($_CAEIH), $_CAEJu = $_CAEHi[1];
                    $_CAEHi.shift();
                    var $_CAFAw = $_CAEHi[0];
                    return n(e, function s(e) {
                        var $_CAFDg = PaLDJ.$_CS, $_CAFCZ = ["$_CAFGf"].concat($_CAFDg), $_CAFEM = $_CAFCZ[1];
                        $_CAFCZ.shift();
                        var $_CAFFd = $_CAFCZ[0];
                        if (!e || 0 === e[$_CAFEM(11)]) return [[], [], []];
                        for (var t = [[], [], []], n = Math[$_CAFEM(35)](e[$_CAFDg(11)] / 3), r = 0; r < n; r++) for (var o = 0; o < 3; o++) {
                            var i = e[o + 3 * r];
                            i && t[o][$_CAFEM(2)](i);
                        }
                        return t;
                    }(t));
                }
            };
        }(), Ee = (function () {
            var $_CAFIF = PaLDJ.$_CS, $_CAFHv = ["$_CAGBt"].concat($_CAFIF), $_CAFJH = $_CAFHv[1];
            $_CAFHv.shift();
            var $_CAGA_ = $_CAFHv[0];

            function r(e, t, n) {
                var $_DDFIW = PaLDJ.$_Dz()[2][6];
                for (; $_DDFIW !== PaLDJ.$_Dz()[4][5];) {
                    switch ($_DDFIW) {
                        case PaLDJ.$_Dz()[4][6]:
                            var r = e[$_CAFIF(328)] + (e[$_CAFIF(857)][0] || $_CAFJH(865)) + $_CAFIF(877),
                                o = $_CAFIF(807) + e[$_CAFIF(813)] + $_CAFJH(875), i = e[$_CAFJH(836)];
                            return i && i[$_CAFIF(838)] && (r = a[$_CAFIF(770)] + $_CAFJH(888), o = o[$_CAFJH(299)]($_CAFJH(832), i[$_CAFIF(838)])), function (n) {
                                var $_CAGDV = PaLDJ.$_CS, $_CAGCo = ["$_CAGGZ"].concat($_CAGDV), $_CAGEn = $_CAGCo[1];
                                $_CAGCo.shift();
                                var $_CAGFK = $_CAGCo[0];
                                var r = (new Date)[$_CAGDV(208)](),
                                    e = n[$_CAGEn(862)] + $_CAGDV(819) + n[$_CAGEn(850)] + $_CAGEn(843) + r;
                                window[$_CAGDV(472)]($_CAGDV(406), function s(e) {
                                    var $_CAGIQ = PaLDJ.$_CS, $_CAGHd = ["$_CAHBA"].concat($_CAGIQ),
                                        $_CAGJn = $_CAGHd[1];
                                    $_CAGHd.shift();
                                    var $_CAHAL = $_CAGHd[0];
                                    var t = e[$_CAGJn(872)];
                                    switch (t[$_CAGIQ(317)]) {
                                        case $_CAGIQ(858) + r:
                                            n[$_CAGIQ(844)] && n[$_CAGJn(844)][$_CAGIQ(81)](null, []);
                                            break;
                                        case $_CAGJn(830) + r:
                                            o[$_CAGJn(81)](null, [t[$_CAGIQ(873)], t[$_CAGJn(500)]]);
                                            break;
                                        case $_CAGJn(866) + r:
                                            n[$_CAGIQ(808)] && n[$_CAGIQ(808)][$_CAGIQ(81)](null, []);
                                            break;
                                        case $_CAGJn(854) + r:
                                            i && i[$_CAGIQ(81)](null, []);
                                    }
                                }, false);
                                var o, i, t = N[$_CAGDV(457)]($_CAGDV(815));
                                t[$_CAGDV(265)] = r, t[$_CAGEn(889)] = e, t[$_CAGDV(465)][$_CAGDV(682)] = 0, t[$_CAGEn(465)][$_CAGDV(622)] = 0, t[$_CAGEn(465)][$_CAGDV(859)] = $_CAGEn(610), t[$_CAGEn(465)][$_CAGDV(802)] = $_CAGDV(852), t[$_CAGDV(488)] = n[$_CAGDV(844)], t[$_CAGDV(476)] = n[$_CAGEn(893)], N[$_CAGDV(441)][$_CAGEn(668)](t);
                                return {
                                    start: function (e) {
                                        var $_CAHDT = PaLDJ.$_CS, $_CAHCM = ["$_CAHGN"].concat($_CAHDT),
                                            $_CAHEN = $_CAHCM[1];
                                        $_CAHCM.shift();
                                        var $_CAHFn = $_CAHCM[0];
                                        o = e[$_CAHEN(708)], i = e[$_CAHEN(824)], t[$_CAHDT(892)][$_CAHDT(848)]({
                                            type: $_CAHEN(891) + r,
                                            c: e[$_CAHEN(869)],
                                            a: e[$_CAHEN(341)],
                                            k: e[$_CAHEN(835)]
                                        }, $_CAHEN(864));
                                    }, stop: function () {
                                        var $_CAHIj = PaLDJ.$_CS, $_CAHHX = ["$_CAIBG"].concat($_CAHIj),
                                            $_CAHJH = $_CAHHX[1];
                                        $_CAHHX.shift();
                                        var $_CAIAj = $_CAHHX[0];
                                        t[$_CAHIj(892)][$_CAHJH(848)]({type: $_CAHIj(871) + r}, $_CAHJH(864));
                                    }, iframe: t
                                };
                            }({
                                host: r, w: o, loadCb: function () {
                                    var $_CAIDq = PaLDJ.$_CS, $_CAIC_ = ["$_CAIGH"].concat($_CAIDq),
                                        $_CAIEV = $_CAIC_[1];
                                    $_CAIC_.shift();
                                    var $_CAIFr = $_CAIC_[0];
                                }, errorCb: function () {
                                    var $_CAIIy = PaLDJ.$_CS, $_CAIHq = ["$_CAJBn"].concat($_CAIIy),
                                        $_CAIJQ = $_CAIHq[1];
                                    $_CAIHq.shift();
                                    var $_CAJAu = $_CAIHq[0];
                                    $_CAIIy(200) == typeof n && n();
                                }, readyCb: function () {
                                    var $_CAJDX = PaLDJ.$_CS, $_CAJCE = ["$_CAJGy"].concat($_CAJDX),
                                        $_CAJEw = $_CAJCE[1];
                                    $_CAJCE.shift();
                                    var $_CAJFl = $_CAJCE[0];
                                    $_CAJEw(200) == typeof t && t();
                                }
                            });
                            break;
                    }
                }
            }

            function o(e, t, n, r, o, i) {
                var $_DDFJj = PaLDJ.$_Dz()[4][6];
                for (; $_DDFJj !== PaLDJ.$_Dz()[2][4];) {
                    switch ($_DDFJj) {
                        case PaLDJ.$_Dz()[2][6]:
                            $_CAFIF(200) == typeof r && r();
                            var s, a = (new Date)[$_CAFIF(208)](), _ = 0, c = be[$_CAFJH(810)](e, t);
                            $_CAFIF(200) == typeof o && o();
                            $_DDFJj = PaLDJ.$_Dz()[0][5];
                            break;
                        case PaLDJ.$_Dz()[0][5]:
                            var l = false;
                            while (!l) {
                                var u = c[$_CAFIF(257)]()[$_CAFJH(676)];
                                u ? (s = ye[$_CAFIF(883)]({
                                    k: n,
                                    s: u
                                })) && s[$_CAFJH(11)] && (_ = (new Date)[$_CAFJH(208)](), l = true) : (_ = (new Date)[$_CAFJH(208)](), l = true);
                            }
                            $_CAFIF(200) == typeof i && i(s, _ - a);
                            $_DDFJj = PaLDJ.$_Dz()[0][4];
                            break;
                    }
                }
            }

            function e(e) {
                var $_DDGAt = PaLDJ.$_Dz()[0][6];
                for (; $_DDGAt !== PaLDJ.$_Dz()[2][5];) {
                    switch ($_DDGAt) {
                        case PaLDJ.$_Dz()[4][6]:
                            var t = e[$_CAFJH(882)], n = this;
                            n[$_CAFIF(882)] = t, n[$_CAFJH(818)] = e[$_CAFJH(818)], n[$_CAFJH(708)] = e[$_CAFIF(708)], n[$_CAFJH(824)] = e[$_CAFJH(824)], n[$_CAFJH(826)] = t[$_CAFJH(826)], n[$_CAFIF(826)] ? n[$_CAFIF(800)] = r(t, function () {
                                var $_CAJIx = PaLDJ.$_CS, $_CAJHP = ["$_CBABn"].concat($_CAJIx), $_CAJJJ = $_CAJHP[1];
                                $_CAJHP.shift();
                                var $_CBAAT = $_CAJHP[0];
                                g(function () {
                                    var $_CBADR = PaLDJ.$_CS, $_CBACW = ["$_CBAGd"].concat($_CBADR),
                                        $_CBAEP = $_CBACW[1];
                                    $_CBACW.shift();
                                    var $_CBAFB = $_CBACW[0];
                                    !function a(e, t, n, r, o, i, s) {
                                        var $_CBAIU = PaLDJ.$_CS, $_CBAHy = ["$_CBBBd"].concat($_CBAIU),
                                            $_CBAJR = $_CBAHy[1];
                                        $_CBAHy.shift();
                                        var $_CBBAa = $_CBAHy[0];
                                        $_CBAJR(200) == typeof r && r(), s[$_CBAJR(806)]({
                                            done: i,
                                            progress: o,
                                            k: n,
                                            c: e,
                                            a: t
                                        });
                                    }(t[$_CBADR(834)], t[$_CBAEP(825)], t[$_CBADR(897)], n[$_CBADR(818)], n[$_CBAEP(824)], n[$_CBAEP(708)], n[$_CBADR(800)]);
                                }, 50);
                            }, function () {
                                var $_CBBDp = PaLDJ.$_CS, $_CBBCn = ["$_CBBGF"].concat($_CBBDp), $_CBBEu = $_CBBCn[1];
                                $_CBBCn.shift();
                                var $_CBBFo = $_CBBCn[0];
                                e[$_CBBDp(708)]();
                            }) : o(t[$_CAFIF(834)], t[$_CAFJH(825)], t[$_CAFJH(897)], n[$_CAFJH(818)], n[$_CAFIF(824)], n[$_CAFJH(708)]);
                            $_DDGAt = PaLDJ.$_Dz()[0][5];
                            break;
                    }
                }
            }

            e[$_CAFIF(91)][$_CAFJH(856)] = function (e) {
                var $_CBBIr = PaLDJ.$_CS, $_CBBHj = ["$_CBCBU"].concat($_CBBIr), $_CBBJb = $_CBBHj[1];
                $_CBBHj.shift();
                var $_CBCAQ = $_CBBHj[0];
                var t = this;
                t[$_CBBIr(826)] ? (t[$_CBBJb(827)] || (t[$_CBBIr(827)] = t[$_CBBJb(800)][$_CBBJb(815)][$_CBBIr(889)]), t[$_CBBIr(800)][$_CBBIr(815)][$_CBBIr(889)] = t[$_CBBJb(827)] + $_CBBJb(822) + (new Date)[$_CBBJb(208)]()) : o(e[$_CBBJb(834)], e[$_CBBJb(825)], e[$_CBBIr(897)], t[$_CBBIr(818)], t[$_CBBJb(824)], t[$_CBBJb(708)]);
            }, e[$_CAFIF(91)][$_CAFIF(621)] = function () {
                var $_CBCDT = PaLDJ.$_CS, $_CBCCt = ["$_CBCGE"].concat($_CBCDT), $_CBCEr = $_CBCCt[1];
                $_CBCCt.shift();
                var $_CBCFc = $_CBCCt[0];
                var e = this;
                e[$_CBCDT(800)] && e[$_CBCEr(800)][$_CBCEr(815)] && (e[$_CBCDT(800)][$_CBCDT(845)](), e[$_CBCDT(800)][$_CBCEr(815)][$_CBCDT(646)][$_CBCEr(688)](e[$_CBCEr(800)][$_CBCDT(815)]));
            }, e[$_CAFIF(91)][$_CAFIF(867)] = function () {
                var $_CBCIn = PaLDJ.$_CS, $_CBCHR = ["$_CBDBp"].concat($_CBCIn), $_CBCJV = $_CBCHR[1];
                $_CBCHR.shift();
                var $_CBDAT = $_CBCHR[0];
                this[$_CBCJV(800)] && this[$_CBCIn(800)][$_CBCJV(815)] && this[$_CBCIn(800)][$_CBCIn(845)]();
            };
        }(), he = function it() {
            var $_CBDDL = PaLDJ.$_CS, $_CBDCI = ["$_CBDGH"].concat($_CBDDL), $_CBDEW = $_CBDCI[1];
            $_CBDCI.shift();
            var $_CBDFc = $_CBDCI[0];
            try {
                var e, t = N[$_CBDDL(457)]($_CBDDL(416));
                if (!t[$_CBDDL(427)]) return {vendor: -1, renderer: -1};
                if (!(e = t[$_CBDDL(427)]($_CBDDL(885)))) return {vendor: -1, renderer: -1};
                var n = e[$_CBDEW(894)]($_CBDDL(855)), r = n ? n[$_CBDEW(847)] : e[$_CBDEW(804)],
                    o = n ? n[$_CBDDL(880)] : e[$_CBDDL(805)];
                return {vendor: e[$_CBDDL(895)](r), renderer: e[$_CBDDL(895)](o)};
            } catch (i) {
                return {vendor: -1, renderer: -1};
            }
        }(), fe = {
            puppet: false,
            phantom: false,
            nightmare: false,
            selenium: false,
            vendor: he[$_DADR(861)],
            renderer: he[$_DADR(860)]
        }, function st() {
            var $_CBDIa = PaLDJ.$_CS, $_CBDHl = ["$_CBEBz"].concat($_CBDIa), $_CBDJn = $_CBDHl[1];
            $_CBDHl.shift();
            var $_CBEAl = $_CBDHl[0];
            !function e() {
                var $_CBEDY = PaLDJ.$_CS, $_CBECy = ["$_CBEGS"].concat($_CBEDY), $_CBEEW = $_CBECy[1];
                $_CBECy.shift();
                var $_CBEFt = $_CBECy[0];
                he[$_CBEEW(860)] && -1 !== he[$_CBEEW(860)][$_CBEEW(66)]()[$_CBEDY(323)]($_CBEEW(837)) ? fe[$_CBEDY(833)] = true : pe[$_CBEDY(606)] && (fe[$_CBEEW(833)] = true);
            }(), function t() {
                var $_CBEIo = PaLDJ.$_CS, $_CBEHR = ["$_CBFBF"].concat($_CBEIo), $_CBEJx = $_CBEHR[1];
                $_CBEHR.shift();
                var $_CBFAo = $_CBEHR[0];
                window[$_CBEJx(809)] ? fe[$_CBEJx(884)] = true : $_CBEIo(200) == typeof window[$_CBEJx(803)] && (fe[$_CBEJx(884)] = true);
            }(), function n() {
                var $_CBFDO = PaLDJ.$_CS, $_CBFCU = ["$_CBFGH"].concat($_CBFDO), $_CBFEh = $_CBFCU[1];
                $_CBFCU.shift();
                var $_CBFFh = $_CBFCU[0];
                $_CBFDO(9) == typeof window[$_CBFEh(881)] && (fe[$_CBFDO(829)] = true);
            }(), function r() {
                var $_CBFIn = PaLDJ.$_CS, $_CBFHr = ["$_CBGBB"].concat($_CBFIn), $_CBFJS = $_CBFHr[1];
                $_CBFHr.shift();
                var $_CBGAl = $_CBFHr[0];
                $_CBFIn(200) == typeof N[$_CBFIn(863)] && (fe[$_CBFJS(821)] = true);
            }();
        }(), fe);

        function Ce() {
            var $_DDGBP = PaLDJ.$_Dz()[4][6];
            for (; $_DDGBP !== PaLDJ.$_Dz()[0][6];) {
                switch ($_DDGBP) {
                }
            }
        }

        var ke, Se = (ke = {
            mouseEvent: !(Ce[$_DAEj(91)] = {
                $_BFHx: function () {
                    var $_CBGDy = PaLDJ.$_CS, $_CBGCB = ["$_CBGGx"].concat($_CBGDy), $_CBGE_ = $_CBGCB[1];
                    $_CBGCB.shift();
                    var $_CBGFS = $_CBGCB[0];
                    return window[$_CBGDy(899)] && window[$_CBGDy(899)][$_CBGDy(828)] && this[$_CBGDy(853)]() || -1;
                }, $_BFIN: function () {
                    var $_CBGIf = PaLDJ.$_CS, $_CBGHx = ["$_CBHBc"].concat($_CBGIf), $_CBGJX = $_CBGHx[1];
                    $_CBGHx.shift();
                    var $_CBHAL = $_CBGHx[0];
                    var e = window[$_CBGJX(899)][$_CBGJX(828)];
                    return {
                        a: e[$_CBGJX(879)],
                        b: e[$_CBGIf(874)],
                        c: e[$_CBGIf(801)],
                        d: e[$_CBGJX(971)],
                        e: e[$_CBGJX(957)],
                        f: e[$_CBGJX(968)],
                        g: e[$_CBGIf(992)],
                        h: e[$_CBGJX(966)],
                        i: e[$_CBGIf(939)],
                        j: e[$_CBGIf(946)],
                        k: e[$_CBGIf(908)],
                        l: e[$_CBGJX(989)],
                        m: e[$_CBGJX(950)],
                        n: e[$_CBGJX(977)],
                        o: e[$_CBGIf(922)],
                        p: e[$_CBGIf(912)],
                        q: e[$_CBGJX(969)],
                        r: e[$_CBGJX(942)],
                        s: e[$_CBGIf(949)],
                        t: e[$_CBGJX(911)],
                        u: e[$_CBGJX(964)]
                    };
                }
            }), touchEvent: false
        }, function at() {
            var $_CBHDt = PaLDJ.$_CS, $_CBHCn = ["$_CBHGS"].concat($_CBHDt), $_CBHEc = $_CBHCn[1];
            $_CBHCn.shift();
            var $_CBHFb = $_CBHCn[0];
            !function e() {
                var $_CBHIn = PaLDJ.$_CS, $_CBHHh = ["$_CBIBD"].concat($_CBHIn), $_CBHJL = $_CBHHh[1];
                $_CBHHh.shift();
                var $_CBIAy = $_CBHHh[0];
                if (window[$_CBHJL(472)]) {
                    function t(e) {
                        var $_DDGCA = PaLDJ.$_Dz()[0][6];
                        for (; $_DDGCA !== PaLDJ.$_Dz()[0][5];) {
                            switch ($_DDGCA) {
                                case PaLDJ.$_Dz()[4][6]:
                                    ke[$_CBHJL(947)] = true, N[$_CBHJL(494)]($_CBHIn(639), t), N[$_CBHIn(494)]($_CBHIn(495), t), N[$_CBHJL(494)]($_CBHJL(656), t);
                                    $_DDGCA = PaLDJ.$_Dz()[0][5];
                                    break;
                            }
                        }
                    }

                    N[$_CBHJL(472)]($_CBHIn(639), t), N[$_CBHJL(472)]($_CBHJL(495), t), N[$_CBHIn(472)]($_CBHIn(656), t);
                }
            }(), function n() {
                var $_CBIDt = PaLDJ.$_CS, $_CBICH = ["$_CBIGH"].concat($_CBIDt), $_CBIEG = $_CBICH[1];
                $_CBICH.shift();
                var $_CBIFR = $_CBICH[0];
                if (window[$_CBIDt(472)]) {
                    function t(e) {
                        var $_DDGDe = PaLDJ.$_Dz()[2][6];
                        for (; $_DDGDe !== PaLDJ.$_Dz()[4][5];) {
                            switch ($_DDGDe) {
                                case PaLDJ.$_Dz()[2][6]:
                                    ke[$_CBIDt(914)] = true, N[$_CBIDt(494)]($_CBIDt(630), t), N[$_CBIEG(494)]($_CBIDt(659), t), N[$_CBIDt(494)]($_CBIEG(660), t);
                                    $_DDGDe = PaLDJ.$_Dz()[0][5];
                                    break;
                            }
                        }
                    }

                    N[$_CBIDt(472)]($_CBIEG(630), t), N[$_CBIDt(472)]($_CBIDt(659), t), N[$_CBIDt(472)]($_CBIDt(660), t);
                }
            }();
        }(), ke);

        function Te() {
            var $_DDGEz = PaLDJ.$_Dz()[4][6];
            for (; $_DDGEz !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DDGEz) {
                    case PaLDJ.$_Dz()[2][6]:
                        var e = this;
                        e[$_DAEj(958)] = 0, e[$_DAEj(943)] = 0, e[$_DADR(771)] = 0, e[$_DAEj(729)] = 0, e[$_DADR(938)] = 0, e[$_DADR(62)] = [], e[$_DAEj(991)] = new le(N), e[$_DAEj(919)] = new le(window), e[$_DADR(905)] = null, e[$_DAEj(923)] = null, e[$_DADR(927)] = 0, e[$_DADR(924)] = 0, e[$_DAEj(984)] = 0, e[$_DADR(988)]();
                        $_DDGEz = PaLDJ.$_Dz()[4][5];
                        break;
                }
            }
        }

        function De() {
            var $_DDGFd = PaLDJ.$_Dz()[2][6];
            for (; $_DDGFd !== PaLDJ.$_Dz()[4][5];) {
                switch ($_DDGFd) {
                    case PaLDJ.$_Dz()[4][6]:
                        this[$_DADR(62)] = this[$_DAEj(945)]();
                        $_DDGFd = PaLDJ.$_Dz()[4][5];
                        break;
                }
            }
        }

        function Ae() {
            var $_DDGGd = PaLDJ.$_Dz()[2][6];
            for (; $_DDGGd !== PaLDJ.$_Dz()[2][5];) {
                switch ($_DDGGd) {
                    case PaLDJ.$_Dz()[0][6]:
                        var t = this;
                        t[$_DAEj(62)] = [], t[$_DAEj(933)] = 0, t[$_DADR(925)] = [], t[$_DAEj(944)] = 30, t[$_DAEj(930)] = N[$_DAEj(441)] && N[$_DAEj(441)][$_DAEj(757)], t[$_DAEj(934)] = new le(N), t[$_DADR(934)][$_DADR(956)]($_DADR(652), function (e) {
                            var $_CBIIB = PaLDJ.$_CS, $_CBIHB = ["$_CBJBZ"].concat($_CBIIB), $_CBIJj = $_CBIHB[1];
                            $_CBIHB.shift();
                            var $_CBJAf = $_CBIHB[0];
                            t[$_CBIIB(910)](e[$_CBIJj(698)]);
                        });
                        $_DDGGd = PaLDJ.$_Dz()[2][5];
                        break;
                }
            }
        }

        Te[$_DADR(91)] = {
            $_BHAP: y || b || x ? 150 : 300, $_BGGS: function () {
                var $_CBJDZ = PaLDJ.$_CS, $_CBJCN = ["$_CBJGs"].concat($_CBJDZ), $_CBJEG = $_CBJCN[1];
                $_CBJCN.shift();
                var $_CBJFF = $_CBJCN[0];
                var r = this;
                r[$_CBJEG(991)][$_CBJDZ(956)]($_CBJDZ(917), function (e) {
                    var $_CBJIe = PaLDJ.$_CS, $_CBJHY = ["$_CCABL"].concat($_CBJIe), $_CBJJT = $_CBJHY[1];
                    $_CBJHY.shift();
                    var $_CCAAd = $_CBJHY[0];
                    r[$_CBJJT(974)](), r[$_CBJIe(958)] = e[$_CBJIe(918)](), r[$_CBJIe(943)] = e[$_CBJJT(931)](), r[$_CBJIe(936)]($_CBJJT(917), r[$_CBJJT(958)], r[$_CBJJT(943)], e[$_CBJIe(698)][$_CBJIe(317)]);
                })[$_CBJEG(956)]($_CBJDZ(940), function (e) {
                    var $_CCADZ = PaLDJ.$_CS, $_CCACe = ["$_CCAGL"].concat($_CCADZ), $_CCAEz = $_CCACe[1];
                    $_CCACe.shift();
                    var $_CCAFD = $_CCACe[0];
                    var t = r[$_CCADZ(62)][$_CCAEz(11)];
                    r[$_CCADZ(62)][t - 1] && $_CCADZ(940) === r[$_CCAEz(62)][t - 1][0] || (r[$_CCADZ(974)](), r[$_CCADZ(958)] = e[$_CCADZ(918)](), r[$_CCAEz(943)] = e[$_CCAEz(931)](), r[$_CCADZ(936)]($_CCADZ(940), r[$_CCADZ(958)], r[$_CCAEz(943)], e[$_CCAEz(698)][$_CCADZ(317)]), r[$_CCAEz(62)][t - 2] && $_CCAEz(917) === r[$_CCAEz(62)][t - 2][0] && r[$_CCAEz(62)][t - 3] && $_CCAEz(935) === r[$_CCADZ(62)][t - 3][0] && r[$_CCAEz(994)](t - 2));
                })[$_CBJDZ(956)]($_CBJDZ(935), function (e) {
                    var $_CCAIn = PaLDJ.$_CS, $_CCAHR = ["$_CCBBK"].concat($_CCAIn), $_CCAJn = $_CCAHR[1];
                    $_CCAHR.shift();
                    var $_CCBAE = $_CCAHR[0];
                    var t = r[$_CCAJn(62)][$_CCAJn(11)];
                    r[$_CCAIn(62)][t - 1] && $_CCAJn(935) === r[$_CCAIn(62)][t - 1][0] || (r[$_CCAJn(974)](), r[$_CCAJn(958)] = e[$_CCAJn(918)](), r[$_CCAJn(943)] = e[$_CCAIn(931)](), r[$_CCAJn(936)]($_CCAIn(935), r[$_CCAJn(958)], r[$_CCAJn(943)], e[$_CCAJn(698)][$_CCAJn(317)]), r[$_CCAJn(62)][t - 2] && $_CCAIn(917) === r[$_CCAJn(62)][t - 2][0] && r[$_CCAJn(62)][t - 3] && $_CCAIn(940) === r[$_CCAIn(62)][t - 3][0] && r[$_CCAJn(994)](t - 2));
                })[$_CBJEG(956)]($_CBJDZ(600), function () {
                    var $_CCBDi = PaLDJ.$_CS, $_CCBCO = ["$_CCBGC"].concat($_CCBDi), $_CCBEI = $_CCBCO[1];
                    $_CCBCO.shift();
                    var $_CCBFG = $_CCBCO[0];
                    r[$_CCBEI(936)]($_CCBDi(608));
                }), r[$_CBJEG(919)][$_CBJEG(956)]($_CBJDZ(647), function () {
                    var $_CCBIp = PaLDJ.$_CS, $_CCBHv = ["$_CCCBY"].concat($_CCBIp), $_CCBJF = $_CCBHv[1];
                    $_CCBHv.shift();
                    var $_CCCAJ = $_CCBHv[0];
                    var e = $_CCBJF(725) in window, t = e ? window[$_CCBIp(725)] : N[$_CCBIp(441)][$_CCBIp(771)],
                        n = e ? window[$_CCBJF(722)] : N[$_CCBIp(441)][$_CCBIp(729)];
                    r[$_CCBIp(958)] = t - r[$_CCBIp(771)] + r[$_CCBIp(958)], r[$_CCBJF(943)] = n - r[$_CCBIp(729)] + r[$_CCBIp(943)], r[$_CCBJF(936)]($_CCBJF(647), t - r[$_CCBIp(771)] + r[$_CCBIp(958)], n - r[$_CCBJF(729)] + r[$_CCBIp(943)]), r[$_CCBJF(974)]();
                })[$_CBJEG(956)]($_CBJEG(608), function () {
                    var $_CCCDg = PaLDJ.$_CS, $_CCCCq = ["$_CCCGB"].concat($_CCCDg), $_CCCEf = $_CCCCq[1];
                    $_CCCCq.shift();
                    var $_CCCFN = $_CCCCq[0];
                    r[$_CCCDg(936)]($_CCCDg(608));
                })[$_CBJDZ(956)]($_CBJEG(675), function () {
                    var $_CCCIO = PaLDJ.$_CS, $_CCCHC = ["$_CCDBc"].concat($_CCCIO), $_CCCJS = $_CCCHC[1];
                    $_CCCHC.shift();
                    var $_CCDAp = $_CCCHC[0];
                    r[$_CCCIO(936)]($_CCCIO(675));
                })[$_CBJDZ(956)]($_CBJDZ(693), function () {
                    var $_CCDDM = PaLDJ.$_CS, $_CCDCc = ["$_CCDGF"].concat($_CCDDM), $_CCDEs = $_CCDCc[1];
                    $_CCDCc.shift();
                    var $_CCDFV = $_CCDCc[0];
                    r[$_CCDEs(936)]($_CCDDM(693));
                });
            }, $_BHEU: function () {
                var $_CCDIC = PaLDJ.$_CS, $_CCDHQ = ["$_CCEBk"].concat($_CCDIC), $_CCDJS = $_CCDHQ[1];
                $_CCDHQ.shift();
                var $_CCEAp = $_CCDHQ[0];
                var e = $_CCDJS(725) in window, t = e ? window[$_CCDJS(725)] : N[$_CCDIC(441)][$_CCDJS(771)],
                    n = e ? window[$_CCDJS(722)] : N[$_CCDJS(441)][$_CCDIC(729)];
                return {x: this[$_CCDIC(771)] = t, y: this[$_CCDIC(729)] = n};
            }, $_BHFH: function (e, t, n, r) {
                var $_CCEDE = PaLDJ.$_CS, $_CCECj = ["$_CCEGt"].concat($_CCEDE), $_CCEED = $_CCECj[1];
                $_CCECj.shift();
                var $_CCEFg = $_CCECj[0];
                var o = $_GM(), i = this, s = i[$_CCEED(927)], a = i[$_CCEDE(924)], _ = i[$_CCEDE(984)],
                    c = i[$_CCEED(62)];
                if (-1 < new $_DJm([$_CCEED(917), $_CCEED(940), $_CCEED(935), $_CCEED(647)])[$_CCEDE(282)](e)) {
                    if ($_CCEDE(917) === e) {
                        if (t === s && n === a || _ === o) return;
                        i[$_CCEED(927)] = t, i[$_CCEDE(924)] = n, i[$_CCEED(984)] = o;
                    }
                    c[$_CCEDE(2)]([e, i[$_CCEED(920)](t), i[$_CCEED(920)](n), o, r]);
                } else c[$_CCEED(2)]([e, o]);
                return i;
            }, $_BHGg: function (e) {
                var $_CCEIs = PaLDJ.$_CS, $_CCEHW = ["$_CCFBD"].concat($_CCEIs), $_CCEJK = $_CCEHW[1];
                $_CCEHW.shift();
                var $_CCFAQ = $_CCEHW[0];
                this[$_CCEIs(62)][$_CCEIs(63)](e, 1);
            }, $_JIo: function () {
                var $_CCFDS = PaLDJ.$_CS, $_CCFCZ = ["$_CCFGn"].concat($_CCFDS), $_CCFEd = $_CCFCZ[1];
                $_CCFCZ.shift();
                var $_CCFFi = $_CCFCZ[0];
                this[$_CCFDS(919)][$_CCFDS(941)](), this[$_CCFDS(991)][$_CCFDS(941)]();
            }, $_BHIk: function (e) {
                var $_CCFIx = PaLDJ.$_CS, $_CCFHl = ["$_CCGBO"].concat($_CCFIx), $_CCFJX = $_CCFHl[1];
                $_CCFHl.shift();
                var $_CCGAn = $_CCFHl[0];
                var t = 0, n = 0, r = [], o = this, i = o[$_CCFJX(938)];
                if (e[$_CCFIx(11)] <= 0) return [];
                for (var s = null, a = null, _ = o[$_CCFIx(978)](e), c = _[$_CCFJX(11)], l = c < this[$_CCFJX(944)] ? 0 : c - this[$_CCFIx(944)]; l < c; l += 1) {
                    var u = _[l], p = u[0];
                    -1 < new $_DJm([$_CCFIx(940), $_CCFJX(917), $_CCFJX(935), $_CCFJX(647)])[$_CCFJX(282)](p) ? (s || (s = u), a = u, r[$_CCFIx(2)]([p, [u[1] - t, u[2] - n], o[$_CCFJX(920)](i ? u[3] - i : i)]), t = u[1], n = u[2], i = u[3]) : -1 < new $_DJm([$_CCFIx(675), $_CCFJX(608), $_CCFJX(693)])[$_CCFIx(282)](p) && (r[$_CCFIx(2)]([p, o[$_CCFJX(920)](i ? u[1] - i : i)]), i = u[1]);
                }
                return o[$_CCFJX(905)] = s, o[$_CCFJX(923)] = a, r;
            }, $_BHJF: function (e) {
                var $_CCGDJ = PaLDJ.$_CS, $_CCGCE = ["$_CCGGN"].concat($_CCGDJ), $_CCGEC = $_CCGCE[1];
                $_CCGCE.shift();
                var $_CCGFe = $_CCGCE[0];
                var t = $_CCGEC(253), n = 0;
                (e || [])[$_CCGEC(11)];
                while (!t && e[n]) t = e[n] && e[n][4], n++;
                if (!t) return e;
                for (var r = $_CCGDJ(253), o = [$_CCGDJ(976), $_CCGDJ(993), $_CCGEC(963), $_CCGDJ(980)], i = 0, s = o[$_CCGDJ(11)]; i < s; i++) 0 === t[$_CCGEC(323)](o[i]) && (r = o[i]);
                for (var a = e[$_CCGDJ(67)](), _ = a[$_CCGDJ(11)] - 1; 0 <= _; _--) {
                    var c = a[_], l = c[0];
                    if (-1 < new $_DJm([$_CCGDJ(917), $_CCGEC(940), $_CCGDJ(935)])[$_CCGEC(282)](l)) 0 !== (c[4] || $_CCGEC(253))[$_CCGDJ(323)](r) && a[$_CCGEC(63)](_, 1);
                }
                return a;
            }, $_HDH: function (e) {
                var $_CCGII = PaLDJ.$_CS, $_CCGHs = ["$_CCHB_"].concat($_CCGII), $_CCGJT = $_CCGHs[1];
                $_CCGHs.shift();
                var $_CCHAh = $_CCGHs[0];
                var p = {move: 0, down: 1, up: 2, scroll: 3, focus: 4, blur: 5, unload: 6, unknown: 7};

                function h(e, t) {
                    var $_DDGHF = PaLDJ.$_Dz()[2][6];
                    for (; $_DDGHF !== PaLDJ.$_Dz()[4][4];) {
                        switch ($_DDGHF) {
                            case PaLDJ.$_Dz()[0][6]:
                                for (var n = e[$_CCGII(66)](2), r = $_CCGII(253), o = n[$_CCGJT(11)] + 1; o <= t; o += 1) r += $_CCGII(246);
                                $_DDGHF = PaLDJ.$_Dz()[4][5];
                                break;
                            case PaLDJ.$_Dz()[2][5]:
                                return n = r + n;
                                break;
                        }
                    }
                }

                function f(e) {
                    var $_DDGIN = PaLDJ.$_Dz()[2][6];
                    for (; $_DDGIN !== PaLDJ.$_Dz()[2][5];) {
                        switch ($_DDGIN) {
                            case PaLDJ.$_Dz()[4][6]:
                                var t = [], n = e[$_CCGII(11)], r = 0;
                                while (r < n) {
                                    var o = e[r], i = 0;
                                    while (1) {
                                        if (16 <= i) break;
                                        var s = r + i + 1;
                                        if (n <= s) break;
                                        if (e[s] !== o) break;
                                        i += 1;
                                    }
                                    r = r + 1 + i;
                                    var a = p[o];
                                    0 != i ? (t[$_CCGII(2)](8 | a), t[$_CCGII(2)](i - 1)) : t[$_CCGII(2)](a);
                                }
                                for (var _ = h(32768 | n, 16), c = $_CCGII(253), l = 0, u = t[$_CCGII(11)]; l < u; l += 1) c += h(t[l], 4);
                                return _ + c;
                                break;
                        }
                    }
                }

                function c(e, t) {
                    var $_DDGJo = PaLDJ.$_Dz()[4][6];
                    for (; $_DDGJo !== PaLDJ.$_Dz()[2][5];) {
                        switch ($_DDGJo) {
                            case PaLDJ.$_Dz()[0][6]:
                                for (var n = [], r = 0, o = e[$_CCGJT(11)]; r < o; r += 1) n[$_CCGII(2)](t(e[r]));
                                return n;
                                break;
                        }
                    }
                }

                function d(e, t) {
                    var $_DDHAR = PaLDJ.$_Dz()[2][6];
                    for (; $_DDHAR !== PaLDJ.$_Dz()[4][5];) {
                        switch ($_DDHAR) {
                            case PaLDJ.$_Dz()[0][6]:
                                e = function _(e) {
                                    var $_CCHDG = PaLDJ.$_CS, $_CCHCg = ["$_CCHGz"].concat($_CCHDG),
                                        $_CCHED = $_CCHCg[1];
                                    $_CCHCg.shift();
                                    var $_CCHFH = $_CCHCg[0];
                                    var t = 32767, n = (e = c(e, function (e) {
                                        var $_CCHIO = PaLDJ.$_CS, $_CCHHi = ["$_CCIBe"].concat($_CCHIO),
                                            $_CCHJx = $_CCHHi[1];
                                        $_CCHHi.shift();
                                        var $_CCIAv = $_CCHHi[0];
                                        return t < e ? t : e < -t ? -t : e;
                                    }))[$_CCHDG(11)], r = 0, o = [];
                                    while (r < n) {
                                        var i = 1, s = e[r], a = Math[$_CCHED(581)](s);
                                        while (1) {
                                            if (n <= r + i) break;
                                            if (e[r + i] !== s) break;
                                            if (127 <= a || 127 <= i) break;
                                            i += 1;
                                        }
                                        1 < i ? o[$_CCHED(2)]((s < 0 ? 49152 : 32768) | i << 7 | a) : o[$_CCHDG(2)](s), r += i;
                                    }
                                    return o;
                                }(e);
                                var n, r = [], o = [];
                                c(e, function (e) {
                                    var $_CCIDL = PaLDJ.$_CS, $_CCICg = ["$_CCIGV"].concat($_CCIDL),
                                        $_CCIEe = $_CCICg[1];
                                    $_CCICg.shift();
                                    var $_CCIFH = $_CCICg[0];
                                    var t = Math[$_CCIDL(35)](function n(e, t) {
                                        var $_CCIIf = PaLDJ.$_CS, $_CCIHX = ["$_CCJBP"].concat($_CCIIf),
                                            $_CCIJP = $_CCIHX[1];
                                        $_CCIHX.shift();
                                        var $_CCJAa = $_CCIHX[0];
                                        return 0 === e ? 0 : Math[$_CCIJP(907)](e) / Math[$_CCIJP(907)](t);
                                    }(Math[$_CCIEe(581)](e) + 1, 16));
                                    0 === t && (t = 1), r[$_CCIEe(2)](h(t - 1, 2)), o[$_CCIDL(2)](h(Math[$_CCIEe(581)](e), 4 * t));
                                });
                                var i = r[$_CCGJT(628)]($_CCGJT(253)), s = o[$_CCGII(628)]($_CCGII(253));
                                return n = t ? c(function a(e, t) {
                                    var $_CCJDV = PaLDJ.$_CS, $_CCJCo = ["$_CCJGL"].concat($_CCJDV),
                                        $_CCJEB = $_CCJCo[1];
                                    $_CCJCo.shift();
                                    var $_CCJFL = $_CCJCo[0];
                                    var n = [];
                                    return c(e, function (e) {
                                        var $_CCJIp = PaLDJ.$_CS, $_CCJHZ = ["$_CDABc"].concat($_CCJIp),
                                            $_CCJJS = $_CCJHZ[1];
                                        $_CCJHZ.shift();
                                        var $_CDAAs = $_CCJHZ[0];
                                        t(e) && n[$_CCJIp(2)](e);
                                    }), n;
                                }(e, function (e) {
                                    var $_CDADz = PaLDJ.$_CS, $_CDACF = ["$_CDAGe"].concat($_CDADz),
                                        $_CDAER = $_CDACF[1];
                                    $_CDACF.shift();
                                    var $_CDAFG = $_CDACF[0];
                                    return 0 != e && e >> 15 != 1;
                                }), function (e) {
                                    var $_CDAIf = PaLDJ.$_CS, $_CDAHK = ["$_CDBBg"].concat($_CDAIf),
                                        $_CDAJh = $_CDAHK[1];
                                    $_CDAHK.shift();
                                    var $_CDBAY = $_CDAHK[0];
                                    return e < 0 ? $_CDAJh(915) : $_CDAIf(246);
                                })[$_CCGJT(628)]($_CCGJT(253)) : $_CCGJT(253), h(32768 | e[$_CCGJT(11)], 16) + i + s + n;
                                break;
                        }
                    }
                }

                return function (e) {
                    var $_CDBDf = PaLDJ.$_CS, $_CDBCY = ["$_CDBGL"].concat($_CDBDf), $_CDBEA = $_CDBCY[1];
                    $_CDBCY.shift();
                    var $_CDBFo = $_CDBCY[0];
                    for (var t = [], n = [], r = [], o = [], i = 0, s = e[$_CDBEA(11)]; i < s; i += 1) {
                        var a = e[i], _ = a[$_CDBDf(11)];
                        t[$_CDBEA(2)](a[0]), n[$_CDBEA(2)](2 === _ ? a[1] : a[2]), 3 === _ && (r[$_CDBEA(2)](a[1][0]), o[$_CDBEA(2)](a[1][1]));
                    }
                    var c = f(t) + d(n, false) + d(r, true) + d(o, true), l = c[$_CDBDf(11)];
                    return l % 6 != 0 && (c += h(0, 6 - l % 6)), function u(e) {
                        var $_CDBID = PaLDJ.$_CS, $_CDBHv = ["$_CDCBC"].concat($_CDBID), $_CDBJD = $_CDBHv[1];
                        $_CDBHv.shift();
                        var $_CDCAh = $_CDBHv[0];
                        for (var t = $_CDBID(253), n = e[$_CDBID(11)] / 6, r = 0; r < n; r += 1) t += $_CDBJD(959)[$_CDBID(429)](window[$_CDBJD(906)](e[$_CDBJD(67)](6 * r, 6 * (r + 1)), 2));
                        return t;
                    }(c);
                }(e);
            }, $_BHHN: function (e) {
                var $_CDCDs = PaLDJ.$_CS, $_CDCCw = ["$_CDCGt"].concat($_CDCDs), $_CDCEu = $_CDCCw[1];
                $_CDCCw.shift();
                var $_CDCFB = $_CDCCw[0];
                var t = 32767;
                return $_CDCEu(347) != typeof e ? e : (t < e ? e = t : e < -t && (e = -t), Math[$_CDCEu(736)](e));
            }, $_BIAb: function () {
                var $_CDCIy = PaLDJ.$_CS, $_CDCHL = ["$_CDDBZ"].concat($_CDCIy), $_CDCJH = $_CDCHL[1];
                $_CDCHL.shift();
                var $_CDDAr = $_CDCHL[0];
                return this[$_CDCIy(972)](this[$_CDCIy(961)](this[$_CDCJH(62)]))[$_CDCIy(11)];
            }, $_BIBR: function () {
                var $_CDDDk = PaLDJ.$_CS, $_CDDCE = ["$_CDDGb"].concat($_CDDDk), $_CDDEh = $_CDDCE[1];
                $_CDDCE.shift();
                var $_CDDFf = $_CDDCE[0];
                var e = this[$_CDDDk(62)];
                return this[$_CDDDk(62)] = [], this[$_CDDDk(972)](this[$_CDDEh(961)](e));
            }, $_BICJ: function () {
                var $_CDDIU = PaLDJ.$_CS, $_CDDHc = ["$_CDEBT"].concat($_CDDIU), $_CDDJ_ = $_CDDHc[1];
                $_CDDHc.shift();
                var $_CDEAc = $_CDDHc[0];
                return this[$_CDDIU(972)](this[$_CDDJ_(62)]);
            }
        }, De[$_DADR(91)] = {
            $_BIDk: -1,
            $_BIEB: 1,
            $_BIFp: 0,
            $_BIGH: function (e) {
                var $_CDEDR = PaLDJ.$_CS, $_CDECo = ["$_CDEGh"].concat($_CDEDR), $_CDEEh = $_CDECo[1];
                $_CDECo.shift();
                var $_CDEFP = $_CDECo[0];
                return e ? this[$_CDEDR(967)] : this[$_CDEDR(913)];
            },
            $_BIHi: function (e) {
                var $_CDEIt = PaLDJ.$_CS, $_CDEHI = ["$_CDFBr"].concat($_CDEIt), $_CDEJa = $_CDEHI[1];
                $_CDEHI.shift();
                var $_CDFAx = $_CDEHI[0];
                return undefined === e;
            },
            $_BIIZ: [$_DADR(540), $_DAEj(982), $_DAEj(903), $_DAEj(952), $_DADR(987), $_DAEj(929), $_DADR(965), $_DADR(986), $_DAEj(916), $_DAEj(937), $_DAEj(900), $_DADR(928), $_DADR(998), $_DAEj(902), $_DAEj(954), $_DAEj(996), $_DADR(962), $_DAEj(985), $_DAEj(948), $_DADR(995), $_DAEj(901), $_DAEj(926), $_DAEj(970), $_DADR(999), $_DADR(979), $_DAEj(953)],
            $_BIJX: [$_DAEj(904), $_DAEj(975), $_DAEj(932), $_DAEj(921), $_DAEj(909)],
            $_BJAC: function () {
                var $_CDFDI = PaLDJ.$_CS, $_CDFCw = ["$_CDFGi"].concat($_CDFDI), $_CDFEC = $_CDFCw[1];
                $_CDFCw.shift();
                var $_CDFFk = $_CDFCw[0];
                return [$_CDFDI(973), $_CDFEC(981), $_CDFEC(960)][$_CDFEC(27)](this[$_CDFEC(955)])[$_CDFEC(27)]([$_CDFEC(983), $_CDFEC(990), $_CDFEC(951), $_CDFDI(997), $_CDFEC(1070), $_CDFDI(1059), $_CDFEC(1078), $_CDFDI(1091), $_CDFDI(1064), $_CDFEC(1061), $_CDFEC(1022), $_CDFEC(1080), $_CDFDI(1006), $_CDFEC(490), $_CDFEC(1097), $_CDFDI(1045), $_CDFEC(1083), $_CDFEC(1086), $_CDFEC(1033), $_CDFEC(1014), $_CDFDI(1023), $_CDFDI(1016), $_CDFEC(1019), $_CDFEC(1027), $_CDFEC(1034), $_CDFEC(1008), $_CDFEC(1051), $_CDFEC(1071), $_CDFDI(1011), $_CDFDI(1004), $_CDFEC(1030), $_CDFEC(1096), $_CDFEC(1054), $_CDFDI(1047), $_CDFDI(1007), $_CDFDI(1079), $_CDFEC(1009), $_CDFEC(1024), $_CDFEC(1074)])[$_CDFEC(27)](this[$_CDFDI(1068)])[$_CDFEC(27)]([$_CDFEC(914)]);
            },
            $_BGHZ: function () {
                var $_CDFIM = PaLDJ.$_CS, $_CDFHC = ["$_CDGBC"].concat($_CDFIM), $_CDFJt = $_CDFHC[1];
                $_CDFHC.shift();
                var $_CDGAY = $_CDFHC[0];
                return {};
            },
            $_BIAb: function () {
                var $_CDGDl = PaLDJ.$_CS, $_CDGCc = ["$_CDGGE"].concat($_CDGDl), $_CDGEy = $_CDGCc[1];
                $_CDGCc.shift();
                var $_CDGFc = $_CDGCc[0];
                return this[$_CDGDl(1093)]()[$_CDGDl(11)];
            },
            $_BICJ: function (e, t) {
                var $_CDGIw = PaLDJ.$_CS, $_CDGHB = ["$_CDHBs"].concat($_CDGIw), $_CDGJB = $_CDGHB[1];
                $_CDGHB.shift();
                var $_CDHAt = $_CDGHB[0];
                var n = this, r = n[$_CDGJB(62)], o = [];
                return new $_DJm(n[$_CDGJB(1036)]())[$_CDGIw(18)](function (e) {
                    var $_CDHDX = PaLDJ.$_CS, $_CDHCh = ["$_CDHGJ"].concat($_CDHDX), $_CDHEd = $_CDHCh[1];
                    $_CDHCh.shift();
                    var $_CDHFV = $_CDHCh[0];
                    var t = r[e];
                    o[$_CDHEd(2)](n[$_CDHEd(1062)](t) ? n[$_CDHEd(1055)] : t);
                }), o[$_CDGJB(628)]($_CDGJB(1076));
            },
            $_BIBR: function () {
                var $_CDHIE = PaLDJ.$_CS, $_CDHHe = ["$_CDIBZ"].concat($_CDHIE), $_CDHJi = $_CDHHe[1];
                $_CDHHe.shift();
                var $_CDIAG = $_CDHHe[0];
                var n = this, r = n[$_CDHIE(62)], o = [];
                return new $_DJm(n[$_CDHIE(1036)]())[$_CDHJi(18)](function (e) {
                    var $_CDIDB = PaLDJ.$_CS, $_CDICd = ["$_CDIGn"].concat($_CDIDB), $_CDIEF = $_CDICd[1];
                    $_CDICd.shift();
                    var $_CDIFy = $_CDICd[0];
                    var t = r[e];
                    o[$_CDIDB(2)](n[$_CDIEF(1062)](t) ? n[$_CDIEF(1055)] : t);
                }), o[$_CDHIE(628)]($_CDHIE(1099));
            }
        }, Ae[$_DAEj(91)] = {
            $_BIAb: function () {
                var $_CDIIB = PaLDJ.$_CS, $_CDIHS = ["$_CDJBE"].concat($_CDIIB), $_CDIJz = $_CDIHS[1];
                $_CDIHS.shift();
                var $_CDJAv = $_CDIHS[0];
                return this[$_CDIJz(62)][$_CDIIB(628)]($_CDIIB(1028))[$_CDIJz(11)];
            }, $_BIBR: function () {
                var $_CDJDD = PaLDJ.$_CS, $_CDJCU = ["$_CDJGv"].concat($_CDJDD), $_CDJEy = $_CDJCU[1];
                $_CDJCU.shift();
                var $_CDJFE = $_CDJCU[0];
                var e = this[$_CDJEy(62)] || [];
                return this[$_CDJEy(62)] = [], this[$_CDJEy(933)] = 0, this[$_CDJDD(925)] = [], (y || b || x) && (e = e[$_CDJEy(67)](0, 10)), e[$_CDJDD(628)]($_CDJEy(1028));
            }, $_JIo: function () {
                var $_CDJIx = PaLDJ.$_CS, $_CDJHK = ["$_CEABo"].concat($_CDJIx), $_CDJJk = $_CDJHK[1];
                $_CDJHK.shift();
                var $_CEAAC = $_CDJHK[0];
                this[$_CDJIx(934)][$_CDJIx(941)]();
            }, $_BHDU: function (e) {
                var $_CEADg = PaLDJ.$_CS, $_CEACr = ["$_CEAGE"].concat($_CEADg), $_CEAEm = $_CEACr[1];
                $_CEACr.shift();
                var $_CEAFx = $_CEACr[0];
                var t = this, n = t[$_CEADg(62)];
                n[$_CEAEm(11)] >= t[$_CEAEm(944)] && n[$_CEADg(63)](0, 1);
                var r = e[$_CEAEm(1058)] || e[$_CEADg(1052)];
                if (r && r[$_CEAEm(757)] === t[$_CEAEm(930)]) {
                    for (var o = null, i = t[$_CEAEm(925)][$_CEADg(11)] - 1; 0 <= i; i--) if (t[$_CEADg(925)][i][$_CEADg(1094)] === r) {
                        o = t[$_CEADg(925)][i];
                        break;
                    }
                    o ? n[$_CEADg(2)](o[$_CEAEm(1094)][$_CEADg(669)] + $_CEAEm(617) + o[$_CEADg(261)]) : (t[$_CEADg(925)][$_CEAEm(2)]({
                        el: r,
                        index: t[$_CEAEm(933)]
                    }), n[$_CEADg(2)](r[$_CEADg(669)] + $_CEAEm(617) + t[$_CEADg(933)]), t[$_CEADg(933)]++);
                } else n[$_CEADg(2)]($_CEAEm(253));
            }
        };
        M = $_DAEj(1001), B = $_DADR(358);
        var Oe = $_DAEj(65), Le = $_DADR(1087), Ne = $_DAEj(1043), Re = $_DAEj(1069), je = $_DADR(1046),
            Be = $_DAEj(1017), Me = $_DADR(1020), Pe = $_DADR(1077), qe = $_DAEj(1085), Ie = $_DADR(1018),
            Fe = $_DAEj(1029), ze = $_DADR(1090), Ge = $_DAEj(1038), He = $_DADR(1050), Xe = $_DADR(307),
            Ve = $_DADR(1013), Ue = $_DAEj(1095), $e = $_DADR(1082);
        FAIL = $_DADR(1039);
        C = function () {
            var $_CEAIe = PaLDJ.$_CS, $_CEAHR = ["$_CEBBj"].concat($_CEAIe), $_CEAJM = $_CEAHR[1];
            $_CEAHR.shift();
            var $_CEBAW = $_CEAHR[0];
            return !!h && ($_CEAJM(428) in h[$_CEAIe(465)] || $_CEAJM(405) in h[$_CEAIe(465)] || $_CEAJM(412) in h[$_CEAIe(465)] || $_CEAIe(462) in h[$_CEAJM(465)]);
        };
        var We = {
            ".form": {"input.challenge": {}, "input.validate": {}, "input.seccode": {}},
            ".btn": {
                ".radar_btn": {
                    ".radar": {
                        ".ring": {".small": {}},
                        ".sector": {".small": {}},
                        ".cross": {".h": {}, ".v": {}},
                        ".dot": {},
                        ".scan": {".h": {}},
                        ".status": {".bg": {}, ".hook": {}}
                    },
                    ".ie_radar": {},
                    ".radar_tip": {
                        "span.radar_tip_content": {},
                        "span.reset_tip_content": {},
                        "span.radar_error_code": {}
                    },
                    "a.logo": {},
                    ".other_offline.offline": {}
                },
                ".ghost_success": {
                    ".success_btn": {
                        ".success_box": {
                            ".success_show": {
                                ".success_pie": {},
                                ".success_filter": {},
                                ".success_mask": {}
                            }, ".success_correct": {".success_icon": {}}
                        },
                        ".success_radar_tip": {
                            "span.success_radar_tip_content": {},
                            "span.success_radar_tip_timeinfo": {}
                        },
                        "a.success_logo": {},
                        ".success_offline.offline": {}
                    }
                },
                ".slide_icon": {}
            },
            ".wait": {"span.wait_dot.dot_1": {}, "span.wait_dot.dot_2": {}, "span.wait_dot.dot_3": {}},
            ".fullpage_click": {
                ".fullpage_ghost": {},
                ".fullpage_click_wrap": {
                    ".fullpage_click_box": {},
                    ".fullpage_pointer": {".fullpage_pointer_out": {}, ".fullpage_pointer_in": {}}
                }
            },
            ".goto": {
                ".goto_ghost": {},
                ".goto_wrap": {".goto_content": {".goto_content_tip": {}}, ".goto_cancel": {}, "a.goto_confirm": {}}
            },
            ".panel": {
                ".panel_ghost": {},
                ".panel_box": {
                    ".other_offline.panel_offline": {},
                    ".panel_loading": {".panel_loading_icon": {}, ".panel_loading_content": {}},
                    ".panel_success": {
                        ".panel_success_box": {
                            ".panel_success_show": {
                                ".panel_success_pie": {},
                                ".panel_success_filter": {},
                                ".panel_success_mask": {}
                            }, ".panel_success_correct": {".panel_success_icon": {}}
                        }, ".panel_success_title": {}
                    },
                    ".panel_error": {
                        ".panel_error_icon": {},
                        ".panel_error_title": {},
                        ".panel_error_content": {},
                        ".panel_error_code": {".panel_error_code_text": {}}
                    },
                    ".panel_footer": {".panel_footer_logo": {}, ".panel_footer_copyright": {}},
                    ".panel_next": {}
                }
            }
        };

        function Ze(e, t) {
            var $_DDHBp = PaLDJ.$_Dz()[4][6];
            for (; $_DDHBp !== PaLDJ.$_Dz()[2][5];) {
                switch ($_DDHBp) {
                    case PaLDJ.$_Dz()[4][6]:
                        var n = this, r = new Qe(e);
                        r[$_DADR(1073)] && !isNaN(r[$_DADR(1073)]) && (ge = $_DADR(1057), ve = r[$_DAEj(1073)]), r[$_DADR(1075)] && !r[$_DAEj(12)]($_DAEj(225)) && (r[$_DADR(225)] = $_JM($_BAE())), r[$_DADR(1041)] && (r[$_DAEj(328)] = $_DAEj(1025)), e[$_DAEj(836)] && r[$_DADR(1048)](e[$_DADR(836)]), $_DADR(1031) !== r[$_DAEj(1049)] && $_DADR(1053) !== r[$_DADR(1049)] && $_DADR(1032) !== r[$_DAEj(1049)] && $_DADR(1012) !== r[$_DAEj(1049)] && (r[$_DADR(1049)] = $_DAEj(1031)), (w || y) && $_DAEj(1031) === r[$_DAEj(1049)] && (r[$_DADR(1049)] = $_DADR(1053)), y && $_DAEj(1032) === r[$_DAEj(1049)] && (r[$_DAEj(1049)] = $_DAEj(1053)), r[$_DADR(1005)] = pe[$_DAEj(1047)] || 0, r[$_DADR(826)] = $_DAEj(26) != typeof Worker, n[$_DADR(1021)] = new De, n[$_DAEj(370)] = r, n[$_DADR(391)] = e, n[$_DAEj(1092)] = new U(n), n[$_DAEj(599)] = new Y(function (e, t) {
                            var $_CEBDr = PaLDJ.$_CS, $_CEBCX = ["$_CEBGY"].concat($_CEBDr), $_CEBEK = $_CEBCX[1];
                            $_CEBCX.shift();
                            var $_CEBFv = $_CEBCX[0];
                            n[$_CEBDr(1098)](e, t);
                        }), n[$_DAEj(1081)] = t, n[$_DAEj(1088)] = w ? 3 : 0, n[$_DADR(1003)] = w ? $_DAEj(1040) : $_DADR(1035), n[$_DADR(1042)] = -1, n[$_DAEj(370)][$_DADR(324)] = {pt: n[$_DAEj(1088)]}, n[$_DADR(599)][$_DAEj(1084)](Oe), n[$_DAEj(1089)] = new Te, n[$_DADR(1067)] = new Ae;
                        $_DDHBp = PaLDJ.$_Dz()[4][5];
                        break;
                }
            }
        }

        function Qe(e) {
            var $_DDHCm = PaLDJ.$_Dz()[4][6];
            for (; $_DDHCm !== PaLDJ.$_Dz()[2][5];) {
                switch ($_DDHCm) {
                    case PaLDJ.$_Dz()[4][6]:
                        this[$_DADR(1063)] = $_EA(), this[$_DADR(1048)]({protocol: d})[$_DAEj(1048)](e);
                        $_DDHCm = PaLDJ.$_Dz()[0][5];
                        break;
                }
            }
        }

        function et(e, t) {
            var $_DDHDl = PaLDJ.$_Dz()[4][6];
            for (; $_DDHDl !== PaLDJ.$_Dz()[0][5];) {
                switch ($_DDHDl) {
                    case PaLDJ.$_Dz()[0][6]:
                        this[$_DAEj(1044)] = $_EA(), this[$_DAEj(1060)] = true, q[$_DAEj(1084)](this[$_DAEj(1044)], new Ze(e, t));
                        $_DDHDl = PaLDJ.$_Dz()[2][5];
                        break;
                }
            }
        }

        function tt() {
            var $_DDHEX = PaLDJ.$_Dz()[0][6];
            for (; $_DDHEX !== PaLDJ.$_Dz()[4][6];) {
                switch ($_DDHEX) {
                }
            }
        }

        function nt(e) {
            var $_DDHFy = PaLDJ.$_Dz()[4][6];
            for (; $_DDHFy !== PaLDJ.$_Dz()[0][5];) {
                switch ($_DDHFy) {
                    case PaLDJ.$_Dz()[2][6]:
                        var t, n = this, r = e[$_DAEj(370)];
                        n[$_DAEj(599)] = e[$_DADR(599)], n[$_DADR(596)] = e, n[$_DADR(370)] = r, n[$_DADR(391)] = e[$_DAEj(391)], n[$_DAEj(1002)] = $_BDL(r), n[$_DADR(740)] = $_Fc(), n[$_DADR(1065)] = C(), n[$_DADR(1072)] = null, n[$_DAEj(1037)] = function (e) {
                            var $_CEBIZ = PaLDJ.$_CS, $_CEBHI = ["$_CECBx"].concat($_CEBIZ), $_CEBJs = $_CEBHI[1];
                            $_CEBHI.shift();
                            var $_CECAn = $_CEBHI[0];
                            return n[$_CEBJs(1065)] ? e : 0;
                        }, t = n[$_DAEj(1065)] ? $_DADR(1066) + r[$_DADR(1056)] : $_DADR(1026) + r[$_DAEj(1056)], r[$_DADR(258)] && (t += $_DAEj(1e3)), n[$_DADR(1010)] = $_BEp(t, We, n[$_DADR(740)]), n[$_DAEj(1015)] = new le(window), n[$_DAEj(934)] = new le(N), n[$_DADR(988)]();
                        $_DDHFy = PaLDJ.$_Dz()[2][5];
                        break;
                }
            }
        }

        window.func2 = $_BFr();

        Ze[$_DADR(91)] = {
            $_BJET: function (e, t) {
                var $_CECDo = PaLDJ.$_CS, $_CECC_ = ["$_CECGP"].concat($_CECDo), $_CECEX = $_CECC_[1];
                $_CECC_.shift();
                var $_CECFB = $_CECC_[0];
                var n = this, r = n[$_CECEX(1103)], o = n[$_CECDo(599)], i = n[$_CECEX(1092)], s = n[$_CECDo(370)],
                    a = $_CECEX(1012) === s[$_CECDo(1049)];
                if (!o[$_CECEX(1162)](t) && t !== Ve) if (o[$_CECDo(1162)](Oe) || (r && r[$_CECEX(1117)](e, t), r && r[$_CECDo(1172)]()), o[$_CECEX(1162)](Oe)) n[$_CECDo(1167)] = n[$_CECEX(988)]()[$_CECEX(305)](function () {
                    var $_CECIw = PaLDJ.$_CS, $_CECHp = ["$_CEDBk"].concat($_CECIw), $_CECJP = $_CECHp[1];
                    $_CECHp.shift();
                    var $_CEDAY = $_CECHp[0];
                    o[$_CECIw(1084)](Le), i[$_CECJP(1188)](Oe);
                }); else if (o[$_CECEX(1162)](Fe)) r[$_CECEX(587)](n[$_CECDo(1126)]); else if (o[$_CECDo(1162)](ze)) r[$_CECEX(1112)](), a && s[$_CECDo(1110)] && i[$_CECDo(1188)](ze); else if (o[$_CECEX(1162)](Ge)) r[$_CECEX(1177)](), i[$_CECDo(1188)](Ue); else if (o[$_CECDo(1162)]([qe])) r[$_CECEX(1182)](n[$_CECDo(1105)]), g(function () {
                    var $_CEDDh = PaLDJ.$_CS, $_CEDCz = ["$_CEDGg"].concat($_CEDDh), $_CEDEn = $_CEDCz[1];
                    $_CEDCz.shift();
                    var $_CEDFE = $_CEDCz[0];
                    a ? (n[$_CEDEn(1089)] = new Te, r[$_CEDDh(1120)](), s[$_CEDDh(1110)] && g(function () {
                        var $_CEDIM = PaLDJ.$_CS, $_CEDHp = ["$_CEEBd"].concat($_CEDIM), $_CEDJR = $_CEDHp[1];
                        $_CEDHp.shift();
                        var $_CEEAO = $_CEDHp[0];
                        r[$_CEDJR(1196)]();
                    }, 300)) : n[$_CEDDh(1089)][$_CEDDh(621)](), i[$_CEDEn(1188)](He);
                }, 400); else if (o[$_CECDo(1162)]([Ie, $_CECDo(1146)])) a && (s[$_CECDo(1110)] ? (r && r[$_CECDo(1120)](), g(function () {
                    var $_CEEDz = PaLDJ.$_CS, $_CEECi = ["$_CEEGT"].concat($_CEEDz), $_CEEE_ = $_CEECi[1];
                    $_CEECi.shift();
                    var $_CEEFI = $_CEECi[0];
                    r && r[$_CEEDz(1196)]();
                }, 300)) : (r && r[$_CECEX(1196)](), r && r[$_CECEX(1109)]())), n[$_CECEX(1198)] && $_CECDo(1145) === n[$_CECEX(1198)][$_CECDo(346)] && r && r[$_CECDo(1131)](), i[$_CECEX(1188)](Xe, n[$_CECDo(1198)]); else if (o[$_CECDo(1162)](FAIL)) o[$_CECDo(1084)](ze), i[$_CECDo(1188)](FAIL); else if (o[$_CECDo(1162)](Pe)) a && !s[$_CECDo(1110)] && r[$_CECDo(1193)](), r[$_CECEX(1104)](); else if (o[$_CECDo(1162)]($e)) return;
            }, $_BGGS: function () {
                var $_CEEIT = PaLDJ.$_CS, $_CEEHW = ["$_CEFBT"].concat($_CEEIT), $_CEEJW = $_CEEHW[1];
                $_CEEHW.shift();
                var $_CEFAz = $_CEEHW[0];
                var t = this, n = t[$_CEEJW(370)];
                if (!n[$_CEEJW(380)] || !n[$_CEEJW(399)]) return G(I($_CEEIT(1151), t));
                var e = t[$_CEEJW(1021)][$_CEEIT(1093)]();
                t[$_CEEJW(1122)] = e, t[$_CEEIT(391)][$_CEEJW(1005)] = n[$_CEEIT(1005)], t[$_CEEJW(391)][$_CEEJW(1100)] = n[$_CEEJW(826)], t[$_CEEJW(391)][$_CEEJW(486)] = e;
                var r = t[$_CEEIT(1147)](),
                    o = $_BFr()[$_CEEIT(1168)](de[$_CEEIT(411)](t[$_CEEJW(391)]), t[$_CEEJW(1106)]()),
                    i = p[$_CEEIT(1116)](o), s = {
                        gt: t[$_CEEIT(391)][$_CEEIT(380)],
                        challenge: t[$_CEEJW(391)][$_CEEJW(399)],
                        lang: n[$_CEEJW(225)],
                        pt: t[$_CEEIT(1088)],
                        client_type: t[$_CEEIT(1003)],
                        w: i + r
                    };
                return j(n, p[$_CEEJW(499)]($_CEEJW(1179)), s)[$_CEEIT(305)](function (e) {
                    var $_CEFDi = PaLDJ.$_CS, $_CEFCZ = ["$_CEFGB"].concat($_CEFDi), $_CEFEC = $_CEFCZ[1];
                    $_CEFCZ.shift();
                    var $_CEFFN = $_CEFCZ[0];
                    return e[$_CEFDi(489)] === Xe ? G(F(e, t, $_CEFDi(1195))) : (n[$_CEFDi(1048)](e[$_CEFEC(872)]), n[$_CEFDi(333)] && (n[$_CEFDi(395)] = n[$_CEFDi(333)]), n[$_CEFEC(1139)] && (n[$_CEFEC(857)] = n[$_CEFDi(1139)]), n[$_CEFDi(836)] && n[$_CEFDi(1048)](n[$_CEFEC(836)]), t[$_CEFEC(1103)] = new nt(t), t[$_CEFDi(1118)](), t[$_CEFDi(1103)][$_CEFEC(1142)]);
                }, function () {
                    var $_CEFIX = PaLDJ.$_CS, $_CEFHa = ["$_CEGBY"].concat($_CEFIX), $_CEFJg = $_CEFHa[1];
                    $_CEFHa.shift();
                    var $_CEGAO = $_CEFHa[0];
                    return G(I($_CEFJg(1148), t));
                });
            }, $_CCIH: function () {
                var $_CEGDd = PaLDJ.$_CS, $_CEGCq = ["$_CEGGZ"].concat($_CEGDd), $_CEGEM = $_CEGCq[1];
                $_CEGCq.shift();
                var $_CEGFn = $_CEGCq[0];
                var t = this[$_CEGDd(370)], n = this[$_CEGDd(599)];
                this[$_CEGDd(740)];
                try {
                    if (N && N[$_CEGEM(763)] && N[$_CEGDd(763)]($_CEGDd(1159))) {
                        var e = N[$_CEGDd(763)]($_CEGEM(1159)), r = new CustomEvent($_CEGDd(1140), {
                            detail: {
                                challenge: t[$_CEGDd(399)],
                                gt: t[$_CEGEM(380)]
                            }
                        });
                        e[$_CEGEM(472)]($_CEGDd(1108), function (e) {
                            var $_CEGIj = PaLDJ.$_CS, $_CEGHZ = ["$_CEHBB"].concat($_CEGIj), $_CEGJN = $_CEGHZ[1];
                            $_CEGHZ.shift();
                            var $_CEHAN = $_CEGHZ[0];
                            $_CEGJN(1012) !== t[$_CEGJN(1049)] && n[$_CEGJN(1084)](Pe);
                        }), e[$_CEGEM(1158)](r);
                    }
                } catch (o) {
                }
            }, $_JIo: function () {
                var $_CEHDu = PaLDJ.$_CS, $_CEHCS = ["$_CEHGH"].concat($_CEHDu), $_CEHEO = $_CEHCS[1];
                $_CEHCS.shift();
                var $_CEHFD = $_CEHCS[0];
                var e = this;
                e[$_CEHEO(1103)] && e[$_CEHDu(1103)][$_CEHDu(621)](), e[$_CEHEO(1092)][$_CEHEO(621)](), e[$_CEHDu(1089)][$_CEHEO(621)](), e[$_CEHDu(1067)][$_CEHDu(621)]();
            }, $_FAj: function (e) {
                var $_CEHIY = PaLDJ.$_CS, $_CEHHv = ["$_CEIBG"].concat($_CEHIY), $_CEHJt = $_CEHHv[1];
                $_CEHHv.shift();
                var $_CEIAA = $_CEHHv[0];
                return this[$_CEHIY(1198)] = e, this[$_CEHJt(599)][$_CEHIY(1084)](Ie), this;
            }, $_FHm: function (e) {
                var $_CEIDu = PaLDJ.$_CS, $_CEICZ = ["$_CEIGR"].concat($_CEIDu), $_CEIEL = $_CEICZ[1];
                $_CEICZ.shift();
                var $_CEIFT = $_CEICZ[0];
                var t = this;
                return $_CEIDu(1012) === t[$_CEIEL(370)][$_CEIDu(1049)] || t[$_CEIEL(1167)][$_CEIDu(305)](function () {
                    var $_CEIIg = PaLDJ.$_CS, $_CEIHM = ["$_CEJBh"].concat($_CEIIg), $_CEIJq = $_CEIHM[1];
                    $_CEIHM.shift();
                    var $_CEJAM = $_CEIHM[0];
                    t[$_CEIIg(1103)][$_CEIIg(353)](e);
                }), t;
            }, $_CDAV: function (e) {
                var $_CEJDS = PaLDJ.$_CS, $_CEJCL = ["$_CEJGx"].concat($_CEJDS), $_CEJEz = $_CEJCL[1];
                $_CEJCL.shift();
                var $_CEJFt = $_CEJCL[0];
                this[$_CEJEz(1173)] = e;
            }, $_CDCW: function (e) {
                var $_CEJIY = PaLDJ.$_CS, $_CEJHQ = ["$_CFABH"].concat($_CEJIY), $_CEJJc = $_CEJHQ[1];
                $_CEJHQ.shift();
                var $_CFAAS = $_CEJHQ[0];
                this[$_CEJJc(1114)] = e;
            }, $_CDEg: function (e) {
                var $_CFADc = PaLDJ.$_CS, $_CFACK = ["$_CFAG_"].concat($_CFADc), $_CFAER = $_CFACK[1];
                $_CFACK.shift();
                var $_CFAFt = $_CFACK[0];
                var t = this;
                t[$_CFAER(1167)][$_CFAER(305)](function () {
                    var $_CFAIJ = PaLDJ.$_CS, $_CFAHO = ["$_CFBBl"].concat($_CFAIJ), $_CFAJg = $_CFAHO[1];
                    $_CFAHO.shift();
                    var $_CFBAf = $_CFAHO[0];
                    t[$_CFAIJ(1103)][$_CFAIJ(1129)](e);
                });
            }, $_CDFh: function (e) {
                var $_CFBDO = PaLDJ.$_CS, $_CFBCr = ["$_CFBGd"].concat($_CFBDO), $_CFBEN = $_CFBCr[1];
                $_CFBCr.shift();
                var $_CFBFo = $_CFBCr[0];
                var t = this;
                t[$_CFBEN(1167)][$_CFBDO(305)](function () {
                    var $_CFBIa = PaLDJ.$_CS, $_CFBHW = ["$_CFCBT"].concat($_CFBIa), $_CFBJs = $_CFBHW[1];
                    $_CFBHW.shift();
                    var $_CFCAw = $_CFBHW[0];
                    t[$_CFBIa(1103)][$_CFBIa(1157)](e);
                });
            }, $_CDGb: function () {
                var $_CFCDm = PaLDJ.$_CS, $_CFCCf = ["$_CFCGV"].concat($_CFCDm), $_CFCEy = $_CFCCf[1];
                $_CFCCf.shift();
                var $_CFCFO = $_CFCCf[0];
                this[$_CFCDm(370)][$_CFCDm(834)] ? true !== this[$_CFCEy(1153)] && (this[$_CFCDm(1153)] = true) : this[$_CFCEy(1176)]();
            }, $_CDIm: function () {
                var $_CFCIE = PaLDJ.$_CS, $_CFCHo = ["$_CFDBz"].concat($_CFCIE), $_CFCJf = $_CFCHo[1];
                $_CFCHo.shift();
                var $_CFDAE = $_CFCHo[0];
                var t = this, e = t[$_CFCIE(370)];
                t[$_CFCIE(1119)]();
                var n = {};
                n[$_CFCIE(380)] = e[$_CFCJf(380)], n[$_CFCJf(399)] = e[$_CFCJf(399)], n[$_CFCJf(225)] = e[$_CFCJf(225)] || $_CFCIE(275), n[$_CFCIE(389)] = t[$_CFCIE(1088)], n[$_CFCIE(1150)] = t[$_CFCJf(1003)], n[$_CFCJf(850)] = t[$_CFCJf(1115)], j(t[$_CFCJf(370)], p[$_CFCJf(499)]($_CFCIE(1192)), n)[$_CFCJf(305)](function (e) {
                    var $_CFDDw = PaLDJ.$_CS, $_CFDCS = ["$_CFDGP"].concat($_CFDDw), $_CFDEG = $_CFDCS[1];
                    $_CFDCS.shift();
                    var $_CFDFm = $_CFDCS[0];
                    if (e[$_CFDEG(489)] === Xe) return G(F(e, t, $_CFDDw(1181)));
                    t[$_CFDEG(1170)](e[$_CFDDw(872)]);
                }, function () {
                    var $_CFDIl = PaLDJ.$_CS, $_CFDHS = ["$_CFEBh"].concat($_CFDIl), $_CFDJU = $_CFDHS[1];
                    $_CFDHS.shift();
                    var $_CFEAX = $_CFDHS[0];
                    return G(I($_CFDIl(1169), t));
                });
            }, $_CDJq: function () {
                var $_CFEDF = PaLDJ.$_CS, $_CFECz = ["$_CFEGU"].concat($_CFEDF), $_CFEEE = $_CFECz[1];
                $_CFECz.shift();
                var $_CFEFo = $_CFECz[0];
                var i = this, e = i[$_CFEDF(1089)][$_CFEDF(1093)](), t = i[$_CFEEE(1089)][$_CFEDF(1124)](),
                    n = i[$_CFEEE(1021)][$_CFEDF(1124)](), r = i[$_CFEEE(1067)][$_CFEEE(1093)](), o = i[$_CFEDF(370)],
                    s = $_GM() - rt;
                i[$_CFEDF(1135)] = $_CFEDF(253);
                for (var a = [[$_CFEDF(225), o[$_CFEDF(225)] || $_CFEEE(275)], [$_CFEEE(317), $_CFEEE(1127)], [$_CFEEE(1134), function (e, t, n) {
                    var $_CFEIG = PaLDJ.$_CS, $_CFEHx = ["$_CFFBF"].concat($_CFEIG), $_CFEJn = $_CFEHx[1];
                    $_CFEHx.shift();
                    var $_CFFAg = $_CFEHx[0];
                    if (!t || !n) return e;
                    var r, o = 0, i = e, s = t[0], a = t[2], _ = t[4];
                    while (r = n[$_CFEIG(201)](o, 2)) {
                        o += 2;
                        var c = parseInt(r, 16), l = String[$_CFEJn(493)](c),
                            u = (s * c * c + a * c + _) % e[$_CFEJn(11)];
                        i = i[$_CFEJn(201)](0, u) + l + i[$_CFEIG(201)](u);
                    }
                    return i;
                }(e, o[$_CFEEE(869)], o[$_CFEDF(508)]) || -1], [$_CFEEE(1189), r || -1], [$_CFEDF(508), H(p[$_CFEEE(972)](t))], [$_CFEDF(1180), H(p[$_CFEEE(972)](n))], [$_CFEDF(1186), H(n)], [$_CFEEE(1152), H(i[$_CFEEE(1122)])], [$_CFEEE(1107), i[$_CFEEE(1107)] || -1], [$_CFEEE(1174), i[$_CFEEE(1174)] || -1], [$_CFEEE(1183), i[$_CFEEE(1161)]() || -1], [$_CFEDF(1102), s || -1], [$_CFEEE(1111), H(o[$_CFEEE(380)] + o[$_CFEEE(399)] + s)]], _ = 0; _ < a[$_CFEEE(11)]; _++) i[$_CFEDF(1135)] += $_CFEDF(789) + a[_][0] + $_CFEEE(1133) + de[$_CFEDF(411)](a[_][1]) + $_CFEEE(795);
                var c = $_BFr();
                i[$_CFEDF(1121)] = function l() {
                    var $_CFFDE = PaLDJ.$_CS, $_CFFCO = ["$_CFFGM"].concat($_CFFDE), $_CFFEg = $_CFFCO[1];
                    $_CFFCO.shift();
                    var $_CFFFJ = $_CFFCO[0];
                    var t = [$_CFFDE(1163)];
                    return function (e) {
                        var $_CFFIN = PaLDJ.$_CS, $_CFFHK = ["$_CFGBT"].concat($_CFFIN), $_CFFJm = $_CFFHK[1];
                        $_CFFHK.shift();
                        var $_CFGAm = $_CFFHK[0];
                        t[$_CFFJm(2)](e[$_CFFIN(66)]());
                        var r = $_CFFIN(253);
                        !function o(e, t) {
                            var $_CFGDd = PaLDJ.$_CS, $_CFGCd = ["$_CFGGt"].concat($_CFGDd), $_CFGEW = $_CFGCd[1];
                            $_CFGCd.shift();
                            var $_CFGFv = $_CFGCd[0];

                            function n(e) {
                                var $_DDHGR = PaLDJ.$_Dz()[0][6];
                                for (; $_DDHGR !== PaLDJ.$_Dz()[0][4];) {
                                    switch ($_DDHGR) {
                                        case PaLDJ.$_Dz()[2][6]:
                                            var t = 5381, n = e[$_CFGEW(11)], r = 0;
                                            while (n--) t = (t << 5) + t + e[$_CFGDd(54)](r++);
                                            $_DDHGR = PaLDJ.$_Dz()[0][5];
                                            break;
                                        case PaLDJ.$_Dz()[0][5]:
                                            return t &= 2147483647;
                                            break;
                                    }
                                }
                            }

                            100 < (new Date)[$_CFGEW(208)]() - t[$_CFGDd(208)]() && (e = $_CFGEW(1138)),
                                r = $_CFGEW(730) + i[$_CFGDd(1135)] + $_CFGDd(1136) + n(o[$_CFGDd(66)]() + n(n[$_CFGDd(66)]()) + n(e[$_CFGEW(66)]())) + $_CFGDd(1190);
                        }(t[$_CFFIN(1149)](), new Date), i[$_CFFIN(1115)] = p[$_CFFJm(1116)](c[$_CFFJm(87)](r, i[$_CFFJm(1106)]()));
                    };
                }(), i[$_CFEEE(1121)]($_CFEDF(253));
            }, $_CEBr: function (e) {
                var $_CFGIM = PaLDJ.$_CS, $_CFGHe = ["$_CFHBz"].concat($_CFGIM), $_CFGJc = $_CFGHe[1];
                $_CFGHe.shift();
                var $_CFHAG = $_CFGHe[0];
                var t, n = this, r = n[$_CFGIM(370)];
                if ($_CFGJc(1050) === e[$_CFGJc(873)]) {
                    var o = e[$_CFGIM(1194)][$_CFGJc(99)]($_CFGJc(1028))[0];
                    n[$_CFGIM(1105)] = {
                        geetest_challenge: r[$_CFGJc(399)],
                        geetest_validate: o,
                        geetest_seccode: o + $_CFGIM(1137)
                    }, n[$_CFGJc(1128)] = e[$_CFGJc(1197)], t = qe;
                } else {
                    if ($_CFGIM(1164) === e[$_CFGJc(873)]) return G(I($_CFGJc(1125), n));
                    t = Fe, n[$_CFGIM(1126)] = e[$_CFGJc(873)];
                }
                n[$_CFGJc(599)][$_CFGIM(1084)](t);
            }, $_CEGY: function () {
                var $_CFHDH = PaLDJ.$_CS, $_CFHCx = ["$_CFHGY"].concat($_CFHDH), $_CFHEk = $_CFHCx[1];
                $_CFHCx.shift();
                var $_CFHFf = $_CFHCx[0];
                return this[$_CFHEk(1105)];
            }, $_CEHq: function () {
                var $_CFHIt = PaLDJ.$_CS, $_CFHHp = ["$_CFIBj"].concat($_CFHIt), $_CFHJz = $_CFHHp[1];
                $_CFHHp.shift();
                var $_CFIAz = $_CFHHp[0];
                this[$_CFHJz(1105)] = null;
            }, $_JGM: function (e, t) {
                var $_CFIDA = PaLDJ.$_CS, $_CFICm = ["$_CFIGY"].concat($_CFIDA), $_CFIEs = $_CFICm[1];
                $_CFICm.shift();
                var $_CFIFP = $_CFICm[0];
                return this[$_CFIDA(1092)][$_CFIEs(956)](e, t), this;
            }, $_CEIN: function () {
                var $_CFIIq = PaLDJ.$_CS, $_CFIHt = ["$_CFJBB"].concat($_CFIIq), $_CFIJf = $_CFIHt[1];
                $_CFIHt.shift();
                var $_CFJAG = $_CFIHt[0];
                return this[$_CFIJf(1103)] && this[$_CFIIq(1103)][$_CFIJf(1144)](), this;
            }, $_BBFP: function () {
                var $_CFJDX = PaLDJ.$_CS, $_CFJCd = ["$_CFJGW"].concat($_CFJDX), $_CFJEq = $_CFJCd[1];
                $_CFJCd.shift();
                var $_CFJFS = $_CFJCd[0];
                this[$_CFJEq(599)][$_CFJDX(1084)](Ge);
            }, $_BBGF: function () {
                var $_CFJID = PaLDJ.$_CS, $_CFJHF = ["$_CGABa"].concat($_CFJID), $_CFJJz = $_CFJHF[1];
                $_CFJHF.shift();
                var $_CGAAe = $_CFJHF[0];
                this[$_CFJID(599)][$_CFJID(1084)](ze);
            }, $_CEJX: function () {
                var $_CGADt = PaLDJ.$_CS, $_CGACJ = ["$_CGAGr"].concat($_CGADt), $_CGAEZ = $_CGACJ[1];
                $_CGACJ.shift();
                var $_CGAFC = $_CGACJ[0];
                var e = this[$_CGAEZ(1103)], t = this[$_CGADt(370)], n = this[$_CGAEZ(599)];
                $_CGAEZ(1012) === t[$_CGAEZ(1049)] && ($_CGADt(200) != typeof this[$_CGAEZ(1114)] || this[$_CGAEZ(1114)]()) && (this[$_CGAEZ(1042)] = 2, n[$_CGADt(1162)](Le) ? n[$_CGAEZ(1084)](Pe) : n[$_CGADt(1162)](Ge) ? n[$_CGAEZ(1084)](ze) : n[$_CGADt(1162)]([Ie, qe]) && e && e[$_CGAEZ(1144)]()[$_CGADt(305)](function () {
                    var $_CGAIo = PaLDJ.$_CS, $_CGAHm = ["$_CGBBy"].concat($_CGAIo), $_CGAJT = $_CGAHm[1];
                    $_CGAHm.shift();
                    var $_CGBAy = $_CGAHm[0];
                    n[$_CGAIo(1084)](Pe);
                }));
            }, $_CFAN: function () {
                var $_CGBDu = PaLDJ.$_CS, $_CGBCg = ["$_CGBGf"].concat($_CGBDu), $_CGBEt = $_CGBCg[1];
                $_CGBCg.shift();
                var $_CGBFs = $_CGBCg[0];
                this[$_CGBDu(1092)][$_CGBDu(1188)](Ue);
            }, $_CEDI: function () {
                var $_CGBIb = PaLDJ.$_CS, $_CGBHF = ["$_CGCBA"].concat($_CGBIb), $_CGBJZ = $_CGBHF[1];
                $_CGBHF.shift();
                var $_CGCAz = $_CGBHF[0];
                var e = {v: $_CGBIb(1187)};
                this[$_CGBJZ(370)];
                e[$_CGBJZ(1184)] = Se[$_CGBJZ(914)], e[$_CGBJZ(1165)] = Se[$_CGBJZ(947)];
                var t = !w && Ee;
                return e[$_CGBJZ(1154)] = t[$_CGBJZ(861)] || -1, e[$_CGBIb(1156)] = t[$_CGBJZ(860)] || -1, e[$_CGBIb(1130)] = this[$_CGBIb(1089)][$_CGBIb(905)], e[$_CGBJZ(1155)] = this[$_CGBIb(1089)][$_CGBJZ(923)], e[$_CGBIb(1141)] = {}, W([], e[$_CGBJZ(1141)]), e[$_CGBJZ(1199)] = (new Ce)[$_CGBIb(1166)](), e[$_CGBIb(1123)] = $_CGBIb(1123), e[$_CGBIb(1175)] = this[$_CGBJZ(1042)], e;
            },
            $_CCHy: function (e) {
                var $_CGCD_ = PaLDJ.$_CS, $_CGCCN = ["$_CGCGT"].concat($_CGCD_), $_CGCEn = $_CGCCN[1];
                $_CGCCN.shift();
                var $_CGCFt = $_CGCCN[0];
                return this[$_CGCEn(370)][$_CGCD_(1143)] && !e || (this[$_CGCEn(370)][$_CGCD_(1143)] = te()), this[$_CGCEn(370)][$_CGCD_(1143)];
            }, $_CCGk: function (e) {
                var $_CGCIM = PaLDJ.$_CS, $_CGCHg = ["$_CGDBd"].concat($_CGCIM), $_CGCJD = $_CGCHg[1];
                $_CGCHg.shift();
                var $_CGDAd = $_CGCHg[0];
                var t = (new X)[$_CGCJD(87)](this[$_CGCIM(1106)](e));
                while (!t || 256 !== t[$_CGCIM(11)]) t = (new X)[$_CGCJD(87)](this[$_CGCJD(1106)](true));
                return t;
            },
        },
            Qe[$_DADR(91)] = {
                challenge: $_DAEj(253),
                gt: $_DAEj(253),
                type: $_DADR(1127),
                api_server: $_DAEj(1171),
                static_servers: [$_DAEj(865), $_DAEj(1178)],
                product: $_DAEj(1053),
                lang: $_DADR(275),
                width: $_BBU(300),
                logo: true,
                protocol: $_DAEj(1160),
                https: false,
                autoReset: true,
                version: $_DADR(1187),
                theme: $_DADR(1191),
                theme_version: $_DAEj(1113),
                homepage: $_DAEj(1185),
                $_BJB_: function (e) {
                    var $_CGDDD = PaLDJ.$_CS, $_CGDCD = ["$_CGDGD"].concat($_CGDDD), $_CGDEQ = $_CGDCD[1];
                    $_CGDCD.shift();
                    var $_CGDFJ = $_CGDCD[0];
                    return function (n, e) {
                        var $_CGDIy = PaLDJ.$_CS, $_CGDHB = ["$_CGEBN"].concat($_CGDIy), $_CGDJJ = $_CGDHB[1];
                        $_CGDHB.shift();
                        var $_CGEAh = $_CGDHB[0];
                        new ce(e)[$_CGDJJ(97)](function (e, t) {
                            var $_CGEDy = PaLDJ.$_CS, $_CGECh = ["$_CGEGC"].concat($_CGEDy), $_CGEEG = $_CGECh[1];
                            $_CGECh.shift();
                            var $_CGEFZ = $_CGECh[0];
                            n[e] = t;
                        });
                    }(this, e), this;
                }
            }, et[$_DADR(91)] = {
            appendTo: function (e) {
                var $_CGEIL = PaLDJ.$_CS, $_CGEHt = ["$_CGFBq"].concat($_CGEIL), $_CGEJZ = $_CGEHt[1];
                $_CGEHt.shift();
                var $_CGFAa = $_CGEHt[0];
                return this[$_CGEJZ(1060)] && q[$_CGEIL(515)](this[$_CGEIL(1044)])[$_CGEIL(353)](e), this;
            }, bindForm: function (e) {
                var $_CGFDZ = PaLDJ.$_CS, $_CGFCY = ["$_CGFGP"].concat($_CGFDZ), $_CGFEy = $_CGFCY[1];
                $_CGFCY.shift();
                var $_CGFFw = $_CGFCY[0];
                return this[$_CGFDZ(1060)] && q[$_CGFEy(515)](this[$_CGFEy(1044)])[$_CGFDZ(1129)](e), this;
            }, bindButton: function (e) {
                var $_CGFIM = PaLDJ.$_CS, $_CGFHE = ["$_CGGBZ"].concat($_CGFIM), $_CGFJy = $_CGFHE[1];
                $_CGFHE.shift();
                var $_CGGAn = $_CGFHE[0];
                return this[$_CGFIM(1060)] && q[$_CGFIM(515)](this[$_CGFJy(1044)])[$_CGFJy(1157)](e), this;
            }, destroy: function () {
                var $_CGGDW = PaLDJ.$_CS, $_CGGCH = ["$_CGGGU"].concat($_CGGDW), $_CGGEv = $_CGGCH[1];
                $_CGGCH.shift();
                var $_CGGFF = $_CGGCH[0];
                this[$_CGGEv(1060)] && (q[$_CGGDW(515)](this[$_CGGDW(1044)])[$_CGGDW(621)](), q[$_CGGEv(1084)](this[$_CGGDW(1044)], null), this[$_CGGEv(1060)] = false);
            }, reset: function () {
                var $_CGGIK = PaLDJ.$_CS, $_CGGHM = ["$_CGHBp"].concat($_CGGIK), $_CGGJR = $_CGGHM[1];
                $_CGGHM.shift();
                var $_CGHAb = $_CGGHM[0];
                return this[$_CGGJR(1060)] && q[$_CGGIK(515)](this[$_CGGJR(1044)])[$_CGGIK(1144)](), this;
            }, setInfos: function (e) {
                var $_CGHD_ = PaLDJ.$_CS, $_CGHCi = ["$_CGHGM"].concat($_CGHD_), $_CGHER = $_CGHCi[1];
                $_CGHCi.shift();
                var $_CGHFj = $_CGHCi[0];
                return this[$_CGHER(1060)] && q[$_CGHER(515)](this[$_CGHER(1044)])[$_CGHER(1101)](e), this;
            }, validate: function (e) {
                var $_CGHIn = PaLDJ.$_CS, $_CGHHN = ["$_CGIBG"].concat($_CGHIn), $_CGHJx = $_CGHHN[1];
                $_CGHHN.shift();
                var $_CGIAu = $_CGHHN[0];
                return this[$_CGHIn(1060)] && q[$_CGHJx(515)](this[$_CGHIn(1044)])[$_CGHIn(1132)](e), this;
            }, getValidate: function () {
                var $_CGIDw = PaLDJ.$_CS, $_CGICZ = ["$_CGIGl"].concat($_CGIDw), $_CGIEP = $_CGICZ[1];
                $_CGICZ.shift();
                var $_CGIFj = $_CGICZ[0];
                return !!this[$_CGIDw(1060)] && q[$_CGIDw(515)](this[$_CGIEP(1044)])[$_CGIDw(1291)]();
            }, onReady: function (e) {
                var $_CGIIA = PaLDJ.$_CS, $_CGIHu = ["$_CGJBF"].concat($_CGIIA), $_CGIJ_ = $_CGIHu[1];
                $_CGIHu.shift();
                var $_CGJAY = $_CGIHu[0];
                return this[$_CGIJ_(1060)] && q[$_CGIIA(515)](this[$_CGIJ_(1044)])[$_CGIIA(956)](Oe, e), this;
            }, onSuccess: function (e) {
                var $_CGJDu = PaLDJ.$_CS, $_CGJCl = ["$_CGJGp"].concat($_CGJDu), $_CGJEO = $_CGJCl[1];
                $_CGJCl.shift();
                var $_CGJFq = $_CGJCl[0];
                return this[$_CGJDu(1060)] && q[$_CGJEO(515)](this[$_CGJDu(1044)])[$_CGJDu(956)](He, e), this;
            }, onFail: function (e) {
                var $_CGJIz = PaLDJ.$_CS, $_CGJH_ = ["$_CHABc"].concat($_CGJIz), $_CGJJA = $_CGJH_[1];
                $_CGJH_.shift();
                var $_CHAAW = $_CGJH_[0];
                return this[$_CGJJA(1060)] && q[$_CGJIz(515)](this[$_CGJJA(1044)])[$_CGJIz(956)](FAIL, e), this;
            }, onError: function (e) {
                var $_CHADA = PaLDJ.$_CS, $_CHACO = ["$_CHAG_"].concat($_CHADA), $_CHAEG = $_CHACO[1];
                $_CHACO.shift();
                var $_CHAFe = $_CHACO[0];
                return this[$_CHADA(1060)] && q[$_CHADA(515)](this[$_CHADA(1044)])[$_CHAEG(956)](Xe, e), this;
            }, onClose: function (e) {
                var $_CHAIu = PaLDJ.$_CS, $_CHAHE = ["$_CHBB_"].concat($_CHAIu), $_CHAJq = $_CHAHE[1];
                $_CHAHE.shift();
                var $_CHBAQ = $_CHAHE[0];
                return this[$_CHAIu(1060)] && q[$_CHAJq(515)](this[$_CHAJq(1044)])[$_CHAJq(956)](Ue, e), this;
            }, hide: function () {
                var $_CHBDf = PaLDJ.$_CS, $_CHBCX = ["$_CHBGR"].concat($_CHBDf), $_CHBEp = $_CHBCX[1];
                $_CHBCX.shift();
                var $_CHBFx = $_CHBCX[0];
                return this[$_CHBDf(1060)] && q[$_CHBDf(515)](this[$_CHBDf(1044)])[$_CHBDf(1271)](), this;
            }, show: function () {
                var $_CHBIZ = PaLDJ.$_CS, $_CHBHW = ["$_CHCBB"].concat($_CHBIZ), $_CHBJC = $_CHBHW[1];
                $_CHBHW.shift();
                var $_CHCAh = $_CHBHW[0];
                return this[$_CHBIZ(1060)] && q[$_CHBJC(515)](this[$_CHBJC(1044)])[$_CHBIZ(1211)](), this;
            }, verify: function () {
                var $_CHCDg = PaLDJ.$_CS, $_CHCCS = ["$_CHCGX"].concat($_CHCDg), $_CHCEG = $_CHCCS[1];
                $_CHCCS.shift();
                var $_CHCFe = $_CHCCS[0];
                return this[$_CHCEG(1060)] && q[$_CHCEG(515)](this[$_CHCDg(1044)])[$_CHCEG(1249)](), this;
            }, onNextReady: function (e) {
                var $_CHCIz = PaLDJ.$_CS, $_CHCHg = ["$_CHDBC"].concat($_CHCIz), $_CHCJL = $_CHCHg[1];
                $_CHCHg.shift();
                var $_CHDAe = $_CHCHg[0];
                return this[$_CHCJL(1060)] && q[$_CHCIz(515)](this[$_CHCIz(1044)])[$_CHCIz(956)](ze, e), this;
            }
        }, et[$_DAEj(317)] = $_DAEj(1127), tt[$_DAEj(515)] = function (e, t, n) {
            var $_CHDDd = PaLDJ.$_CS, $_CHDCg = ["$_CHDGV"].concat($_CHDDd), $_CHDEE = $_CHDCg[1];
            $_CHDCg.shift();
            var $_CHDFq = $_CHDCg[0];
            return new V(function (e) {
                var $_CHDIv = PaLDJ.$_CS, $_CHDHb = ["$_CHEBM"].concat($_CHDIv), $_CHDJL = $_CHDHb[1];
                $_CHDHb.shift();
                var $_CHEAR = $_CHDHb[0];
                e({status: $_CHDJL(1050), data: {}});
            });
        }, tt[$_DAEj(1222)] = function (t, e, n) {
            var $_CHEDa = PaLDJ.$_CS, $_CHECc = ["$_CHEGa"].concat($_CHEDa), $_CHEEF = $_CHECc[1];
            $_CHECc.shift();
            var $_CHEFh = $_CHECc[0];
            return new V(function (e) {
                var $_CHEIz = PaLDJ.$_CS, $_CHEHF = ["$_CHFBZ"].concat($_CHEIz), $_CHEJZ = $_CHEHF[1];
                $_CHEHF.shift();
                var $_CHFAs = $_CHEHF[0];
                e({status: $_CHEIz(1050), data: {result: $_CHEIz(1050), validate: H(t[$_CHEIz(399)])}});
            });
        }, tt[$_DAEj(1144)] = function (t, e, n) {
            var $_CHFDK = PaLDJ.$_CS, $_CHFCy = ["$_CHFGu"].concat($_CHFDK), $_CHFEN = $_CHFCy[1];
            $_CHFCy.shift();
            var $_CHFFd = $_CHFCy[0];
            return new V(function (e) {
                var $_CHFIk = PaLDJ.$_CS, $_CHFHo = ["$_CHGBD"].concat($_CHFIk), $_CHFJm = $_CHFHo[1];
                $_CHFHo.shift();
                var $_CHGAS = $_CHFHo[0];
                e({status: $_CHFJm(1050), data: {challenge: t[$_CHFIk(399)]}});
            });
        }, tt[$_DAEj(308)] = function (e, t, n) {
            var $_CHGDL = PaLDJ.$_CS, $_CHGCL = ["$_CHGGC"].concat($_CHGDL), $_CHGEl = $_CHGCL[1];
            $_CHGCL.shift();
            var $_CHGFF = $_CHGCL[0];
            return $_CHGEl(1195) === t ? tt[$_CHGEl(515)](e, t, n) : $_CHGDL(1181) === t ? tt[$_CHGEl(1222)](e, t, n) : $_CHGEl(1224) === t ? tt[$_CHGDL(1144)](e, t, n) : undefined;
        }, pure = undefined, nt[$_DAEj(91)] = {
            $_CFCC: 260, $_CFDi: 200, $_CFEl: 0, $_CFFn: 54e4, $_CBBB: function () {
                var $_CHGIG = PaLDJ.$_CS, $_CHGHb = ["$_CHHBQ"].concat($_CHGIG), $_CHGJz = $_CHGHb[1];
                $_CHGHb.shift();
                var $_CHHAZ = $_CHGHb[0];
                var e = this, t = e[$_CHGIG(1002)], n = e[$_CHGJz(599)], r = e[$_CHGJz(740)];
                if (r) {
                    var o = false;
                    if (n[$_CHGJz(1162)]([Le, Ge]) ? o = $_CHGJz(1087) : n[$_CHGJz(1162)]([Me, Pe]) ? o = $_CHGJz(1127) : n[$_CHGJz(1162)]([qe]) ? o = $_CHGIG(1050) : n[$_CHGJz(1162)]([Ie]) ? o = $_CHGJz(307) : n[$_CHGIG(1162)]([Fe]) ? o = $_CHGIG(257) : n[$_CHGJz(1162)]([ze]) ? o = $_CHGIG(1201) : n[$_CHGIG(1162)](Ve) && (o = $_CHGIG(1013)), o) {
                        if (r($_CHGIG(1226))[$_CHGIG(34)]({
                            tabIndex: $_CHGJz(246),
                            "aria-label": t[o]
                        })[$_CHGIG(670)]({"outline-width": 0}), n[$_CHGJz(1162)](qe)) r($_CHGJz(1243))[$_CHGIG(1284)](t[o]); else if (n[$_CHGIG(1162)]([Ie])) {
                            var i = e[$_CHGJz(596)][$_CHGIG(1198)];
                            if (i && i[$_CHGIG(346)]) {
                                var s = e[$_CHGIG(370)], a = /(\d+)$/[$_CHGJz(1248)](i[$_CHGJz(346)]);
                                $_CHGIG(1012) === s[$_CHGIG(1049)] ? (r($_CHGIG(1251))[$_CHGJz(1284)](i[$_CHGIG(365)] || $_CHGJz(253)), a && r($_CHGIG(1234))[$_CHGIG(1284)](a[0] || $_CHGJz(253))) : (r($_CHGIG(1288))[$_CHGJz(1284)](i[$_CHGJz(365)] || $_CHGIG(253)), a && r($_CHGJz(1272))[$_CHGJz(1284)](a[0] || $_CHGJz(253)));
                            } else r($_CHGIG(1288))[$_CHGIG(1284)](t[o]);
                        } else r($_CHGJz(1288))[$_CHGIG(1284)](t[o]);
                        e[$_CHGJz(1250)] && n[$_CHGJz(1162)](Ie) && (r($_CHGJz(1288))[$_CHGIG(1284)]($_CHGJz(307)), e[$_CHGJz(1250)] = false), e[$_CHGJz(1293)]();
                    }
                }
            }, $_CFHE: function () {
                var $_CHHDf = PaLDJ.$_CS, $_CHHCF = ["$_CHHGD"].concat($_CHHDf), $_CHHEM = $_CHHCF[1];
                $_CHHCF.shift();
                var $_CHHFc = $_CHHCF[0];
                var e = this[$_CHHEM(740)];
                if ($_CHHDf(1012) !== this[$_CHHEM(370)][$_CHHDf(1049)]) {
                    var t = e($_CHHEM(1226))[$_CHHEM(1279)]() - 80,
                        n = e($_CHHEM(1288))[$_CHHEM(1279)]() + e($_CHHEM(1230))[$_CHHDf(1279)]();
                    0 < t && t < n ? e($_CHHDf(1226))[$_CHHEM(677)]($_CHHEM(1240)) : e($_CHHEM(1226))[$_CHHEM(607)]($_CHHEM(1240));
                }
            }, $_BGGS: function () {
                var $_CHHIR = PaLDJ.$_CS, $_CHHHK = ["$_CHIBS"].concat($_CHHIR), $_CHHJa = $_CHHHK[1];
                $_CHHHK.shift();
                var $_CHIAQ = $_CHHHK[0];
                var e = this;
                e[$_CHHJa(1265)] = 1, e[$_CHHJa(1236)] = 0, e[$_CHHJa(1206)](), e[$_CHHIR(1142)] = e[$_CHHIR(1241)]()[$_CHHIR(305)](null, function () {
                    var $_CHIDx = PaLDJ.$_CS, $_CHICh = ["$_CHIGk"].concat($_CHIDx), $_CHIEX = $_CHICh[1];
                    $_CHICh.shift();
                    var $_CHIFd = $_CHICh[0];
                    return G(I($_CHIEX(1242), e[$_CHIDx(596)]));
                });
                var t = e[$_CHHIR(740)], n = e[$_CHHJa(370)], r = e[$_CHHJa(1002)], o = e[$_CHHIR(596)],
                    i = e[$_CHHJa(599)];
                return n[$_CHHIR(1073)] && !isNaN(n[$_CHHIR(1073)]) && e[$_CHHIR(1286)](), n[$_CHHJa(1229)] && (e[$_CHHJa(1247)] = g(function () {
                    var $_CHIIy = PaLDJ.$_CS, $_CHIHp = ["$_CHJBT"].concat($_CHIIy), $_CHIJ_ = $_CHIHp[1];
                    $_CHIHp.shift();
                    var $_CHJAy = $_CHIHp[0];
                    e[$_CHIJ_(1208)]();
                }, e[$_CHHJa(1239)])), $_CHHIR(1012) === n[$_CHHJa(1049)] ? n[$_CHHIR(1212)] || t($_CHHJa(1294))[$_CHHJa(670)]({display: $_CHHJa(610)}) : w && n[$_CHHIR(1212)] || (n[$_CHHJa(1212)] ? (t($_CHHIR(1233))[$_CHHJa(1)]({
                    target: $_CHHJa(1287),
                    href: n[$_CHHIR(1267)]
                }), t($_CHHIR(1292))[$_CHHJa(1)]({
                    target: $_CHHJa(1287),
                    href: n[$_CHHIR(1267)]
                })) : (t($_CHHJa(1233))[$_CHHIR(1271)](), t($_CHHIR(1292))[$_CHHIR(1271)]())), n[$_CHHIR(1212)] && w && $_CHHJa(1012) !== n[$_CHHJa(1049)] && (t($_CHHJa(1273))[$_CHHJa(677)](n[$_CHHIR(1056)])[$_CHHJa(1283)](new le(h)), t($_CHHIR(1290))[$_CHHJa(1284)](r[$_CHHJa(1281)]), t($_CHHJa(1268))[$_CHHIR(1284)](r[$_CHHIR(1256)])[$_CHHIR(1)]({href: n[$_CHHJa(1267)]}), t($_CHHIR(1218))[$_CHHJa(1284)](r[$_CHHIR(1252)])), t($_CHHIR(1273))[$_CHHJa(1271)](), $_CHHJa(1012) === n[$_CHHIR(1049)] && (t($_CHHJa(1244))[$_CHHIR(1271)]()[$_CHHIR(677)](n[$_CHHIR(1056)])[$_CHHJa(1283)](new le(h)), n[$_CHHJa(258)] && t($_CHHIR(1244))[$_CHHIR(677)]($_CHHIR(1217)), e[$_CHHIR(1065)] || t($_CHHIR(1244))[$_CHHJa(677)]($_CHHJa(1263)), t($_CHHJa(1261))[$_CHHIR(1284)](r[$_CHHIR(1269)]), t($_CHHJa(1266))[$_CHHJa(1284)](r[$_CHHIR(1214)]), t($_CHHJa(1251))[$_CHHJa(1284)](r[$_CHHJa(1216)]), t($_CHHIR(1220))[$_CHHIR(1284)](r[$_CHHIR(1238)]), t($_CHHJa(1223))[$_CHHJa(1284)](r[$_CHHJa(1200)]), t($_CHHIR(1220))[$_CHHIR(956)]($_CHHIR(652), function () {
                    var $_CHJDF = PaLDJ.$_CS, $_CHJCO = ["$_CHJGT"].concat($_CHJDF), $_CHJEq = $_CHJCO[1];
                    $_CHJCO.shift();
                    var $_CHJFv = $_CHJCO[0];
                    e[$_CHJDF(596)][$_CHJEq(1198)] && $_CHJEq(1145) === e[$_CHJDF(596)][$_CHJEq(1198)][$_CHJEq(346)] ? e[$_CHJEq(1275)]() : o[$_CHJEq(1249)]();
                }), t($_CHHIR(1274))[$_CHHIR(956)]($_CHHJa(652), function () {
                    var $_CHJIW = PaLDJ.$_CS, $_CHJHu = ["$_CIABF"].concat($_CHJIW), $_CHJJG = $_CHJHu[1];
                    $_CHJHu.shift();
                    var $_CIAAI = $_CHJHu[0];
                    i[$_CHJJG(1162)]([qe, Ie]) ? (e[$_CHJIW(1120)](), i[$_CHJIW(1162)](Ie) && o[$_CHJJG(1280)]()) : i[$_CHJIW(1162)](ze) && i[$_CHJJG(1084)](Ge);
                })), $_CHHIR(1012) !== n[$_CHHJa(1049)] && -1 < new $_DJm([$_CHHIR(280), $_CHHIR(1258), $_CHHJa(1298), $_CHHJa(1295)])[$_CHHJa(282)](n[$_CHHIR(225)]) && (t($_CHHJa(1226))[$_CHHJa(677)]($_CHHIR(1289)), t($_CHHJa(1282))[$_CHHJa(677)]($_CHHJa(1210))), t($_CHHIR(1230))[$_CHHJa(1284)](r[$_CHHIR(33)]), e;
            }, $_CGCv: function () {
                var $_CIADi = PaLDJ.$_CS, $_CIACl = ["$_CIAGV"].concat($_CIADi), $_CIAEF = $_CIACl[1];
                $_CIACl.shift();
                var $_CIAFX = $_CIACl[0];
                var e = function (e) {
                    var $_CIAIu = PaLDJ.$_CS, $_CIAHe = ["$_CIBBW"].concat($_CIAIu), $_CIAJe = $_CIAHe[1];
                    $_CIAHe.shift();
                    var $_CIBAB = $_CIAHe[0];
                    return e[$_CIAJe(299)](/(-?[\d\.]+px)/g, function (e) {
                        var $_CIBDL = PaLDJ.$_CS, $_CIBCd = ["$_CIBGK"].concat($_CIBDL), $_CIBEg = $_CIBCd[1];
                        $_CIBCd.shift();
                        var $_CIBFk = $_CIBCd[0];
                        var t = e[$_CIBDL(67)](0, -2);
                        return $_BBU(t);
                    });
                }($_CIAEF(1221)), t = new le($_CIADi(465));
                t[$_CIADi(317)] = $_CIADi(1245), t[$_CIADi(1207)](e), t[$_CIADi(353)](new le(f));
            }, $_JIo: function () {
                var $_CIBIf = PaLDJ.$_CS, $_CIBHc = ["$_CICBf"].concat($_CIBIf), $_CIBJf = $_CIBHc[1];
                $_CIBHc.shift();
                var $_CICAw = $_CIBHc[0];
                var e = this, t = e[$_CIBIf(370)], n = e[$_CIBIf(740)];
                switch (e[$_CIBIf(1296)] && e[$_CIBIf(1296)][$_CIBJf(1255)](), e[$_CIBJf(1015)][$_CIBJf(941)](), e[$_CIBJf(934)][$_CIBJf(941)](), e[$_CIBJf(1072)] && e[$_CIBJf(1072)][$_CIBIf(1270)](), e[$_CIBIf(1247)] && v(e[$_CIBIf(1247)]), t[$_CIBIf(1049)]) {
                    case $_CIBIf(1012):
                        n($_CIBJf(1244))[$_CIBJf(331)]();
                        break;
                    case $_CIBIf(1053):
                    case $_CIBJf(1031):
                        n($_CIBIf(1254))[$_CIBJf(331)](), n($_CIBIf(1225))[$_CIBJf(331)]();
                        break;
                    case $_CIBIf(1032):
                        n($_CIBIf(1254))[$_CIBIf(331)]();
                }
            }, $_JGM: function () {
                var $_CICDe = PaLDJ.$_CS, $_CICCB = ["$_CICGl"].concat($_CICDe), $_CICEL = $_CICCB[1];
                $_CICCB.shift();
                var $_CICFb = $_CICCB[0];
                var t, n, e, r = this, o = r[$_CICDe(740)], i = r[$_CICEL(599)], s = r[$_CICEL(596)];
                r[$_CICDe(1246)] = false, w ? (new $_DJm([o($_CICEL(1233)), o($_CICDe(1292))])[$_CICDe(18)](function (e) {
                    var $_CICIy = PaLDJ.$_CS, $_CICHq = ["$_CIDBO"].concat($_CICIy), $_CICJm = $_CICHq[1];
                    $_CICHq.shift();
                    var $_CIDAw = $_CICHq[0];
                    e[$_CICJm(956)]($_CICIy(652), function () {
                        var $_CIDD_ = PaLDJ.$_CS, $_CIDCu = ["$_CIDGu"].concat($_CIDD_), $_CIDEV = $_CIDCu[1];
                        $_CIDCu.shift();
                        var $_CIDFh = $_CIDCu[0];
                        r[$_CIDEV(1246)] = true, o($_CIDD_(1273))[$_CIDEV(1211)](), g(function () {
                            var $_CIDIg = PaLDJ.$_CS, $_CIDHi = ["$_CIEBW"].concat($_CIDIg), $_CIDJM = $_CIDHi[1];
                            $_CIDHi.shift();
                            var $_CIEAk = $_CIDHi[0];
                            o($_CIDJM(1273))[$_CIDJM(1264)](1);
                        }, 300);
                    });
                }), new $_DJm([o($_CICDe(1218)), o($_CICDe(1257))])[$_CICDe(18)](function (e) {
                    var $_CIEDr = PaLDJ.$_CS, $_CIECu = ["$_CIEGt"].concat($_CIEDr), $_CIEEx = $_CIECu[1];
                    $_CIECu.shift();
                    var $_CIEFz = $_CIECu[0];
                    e[$_CIEEx(956)]($_CIEDr(652), function () {
                        var $_CIEID = PaLDJ.$_CS, $_CIEHH = ["$_CIFBo"].concat($_CIEID), $_CIEJn = $_CIEHH[1];
                        $_CIEHH.shift();
                        var $_CIFAp = $_CIEHH[0];
                        r[$_CIEID(1246)] = false, o($_CIEID(1273))[$_CIEJn(1264)](0), g(function () {
                            var $_CIFDt = PaLDJ.$_CS, $_CIFC_ = ["$_CIFGm"].concat($_CIFDt), $_CIFEP = $_CIFC_[1];
                            $_CIFC_.shift();
                            var $_CIFFW = $_CIFC_[0];
                            o($_CIFDt(1273))[$_CIFDt(1271)]();
                        }, 300);
                    });
                })) : (o($_CICDe(1233))[$_CICDe(956)]($_CICEL(652), function (e) {
                    var $_CIFIG = PaLDJ.$_CS, $_CIFHU = ["$_CIGBr"].concat($_CIFIG), $_CIFJZ = $_CIFHU[1];
                    $_CIFHU.shift();
                    var $_CIGAu = $_CIFHU[0];
                    r[$_CIFIG(1246)] = true, g(function () {
                        var $_CIGDO = PaLDJ.$_CS, $_CIGCi = ["$_CIGGr"].concat($_CIGDO), $_CIGEI = $_CIGCi[1];
                        $_CIGCi.shift();
                        var $_CIGFQ = $_CIGCi[0];
                        r[$_CIGDO(1246)] = false;
                    }, 10);
                }), o($_CICEL(1292))[$_CICDe(956)]($_CICDe(652), function (e) {
                    var $_CIGIU = PaLDJ.$_CS, $_CIGHk = ["$_CIHB_"].concat($_CIGIU), $_CIGJd = $_CIGHk[1];
                    $_CIGHk.shift();
                    var $_CIHAs = $_CIGHk[0];
                    r[$_CIGJd(1246)] = true, g(function () {
                        var $_CIHDT = PaLDJ.$_CS, $_CIHCU = ["$_CIHGC"].concat($_CIHDT), $_CIHEs = $_CIHCU[1];
                        $_CIHCU.shift();
                        var $_CIHFe = $_CIHCU[0];
                        r[$_CIHEs(1246)] = false;
                    }, 10);
                })), r[$_CICEL(1065)] && (r[$_CICDe(1072)] = (t = function (e) {
                    var $_CIHIk = PaLDJ.$_CS, $_CIHHe = ["$_CIIBV"].concat($_CIHIk), $_CIHJH = $_CIHHe[1];
                    $_CIHHe.shift();
                    var $_CIIAb = $_CIHHe[0];
                    if (i[$_CIHJH(1162)](Le)) i[$_CIHJH(1084)](Ne), g(function () {
                        var $_CIIDg = PaLDJ.$_CS, $_CIICI = ["$_CIIGe"].concat($_CIIDg), $_CIIEh = $_CIICI[1];
                        $_CIICI.shift();
                        var $_CIIFO = $_CIICI[0];
                        i[$_CIIDg(1162)](Ne) && i[$_CIIEh(1084)](Re);
                    }, 500); else if (i[$_CIHIk(1162)](je) && w) {
                        if (r[$_CIHIk(1246)]) return;
                        i[$_CIHIk(1084)](Be), g(function () {
                            var $_CIIIH = PaLDJ.$_CS, $_CIIHe = ["$_CIJBd"].concat($_CIIIH), $_CIIJf = $_CIIHe[1];
                            $_CIIHe.shift();
                            var $_CIJAF = $_CIIHe[0];
                            i[$_CIIIH(1162)](Be) && (i[$_CIIJf(1084)](Me), r[$_CIIJf(1089)]());
                        }, 10);
                    }
                    i[$_CIHJH(1162)]([Ne, Re]) && r[$_CIHIk(1253)](e);
                }, n = null, (e = function (e) {
                    var $_CIJDB = PaLDJ.$_CS, $_CIJCC = ["$_CIJG_"].concat($_CIJDB), $_CIJEu = $_CIJCC[1];
                    $_CIJCC.shift();
                    var $_CIJFB = $_CIJCC[0];
                    n = g(function () {
                        var $_CIJIH = PaLDJ.$_CS, $_CIJH_ = ["$_CJABZ"].concat($_CIJIH), $_CIJJu = $_CIJH_[1];
                        $_CIJH_.shift();
                        var $_CJAAZ = $_CIJH_[0];
                        t(e);
                    }, 10);
                })[$_CICEL(1270)] = function () {
                    var $_CJADe = PaLDJ.$_CS, $_CJACh = ["$_CJAGA"].concat($_CJADe), $_CJAEq = $_CJACh[1];
                    $_CJACh.shift();
                    var $_CJAFn = $_CJACh[0];
                    v(n), n = null;
                }, e), r[$_CICDe(934)][$_CICEL(956)]($_CICEL(917), r[$_CICEL(1072)]));

                function a() {
                    var $_DDHHL = PaLDJ.$_Dz()[0][6];
                    for (; $_DDHHL !== PaLDJ.$_Dz()[4][5];) {
                        switch ($_DDHHL) {
                            case PaLDJ.$_Dz()[0][6]:
                                r[$_CICEL(1246)] || ($_CICDe(200) != typeof r[$_CICEL(596)][$_CICDe(1114)] || r[$_CICDe(596)][$_CICDe(1114)]()) && (i[$_CICDe(1162)]([je, Ne, Re]) ? (i[$_CICDe(1084)](Be), g(function () {
                                    var $_CJAIh = PaLDJ.$_CS, $_CJAHc = ["$_CJBBV"].concat($_CJAIh),
                                        $_CJAJT = $_CJAHc[1];
                                    $_CJAHc.shift();
                                    var $_CJBAO = $_CJAHc[0];
                                    i[$_CJAJT(1162)](Be) && (i[$_CJAJT(1084)](Me), r[$_CJAIh(1089)]());
                                }, 10)) : i[$_CICDe(1162)]([Le]) && (i[$_CICDe(1084)](Me), r[$_CICEL(1089)]()));
                                $_DDHHL = PaLDJ.$_Dz()[4][5];
                                break;
                        }
                    }
                }

                return o($_CICEL(1254))[$_CICEL(956)]($_CICDe(653), function (e) {
                    var $_CJBDy = PaLDJ.$_CS, $_CJBCo = ["$_CJBGs"].concat($_CJBDy), $_CJBEB = $_CJBCo[1];
                    $_CJBCo.shift();
                    var $_CJBFY = $_CJBCo[0];
                    13 === e[$_CJBEB(698)][$_CJBDy(1227)] && (s[$_CJBEB(1042)] = 1, a());
                })[$_CICEL(956)]($_CICDe(652), function (e) {
                    var $_CJBIu = PaLDJ.$_CS, $_CJBHr = ["$_CJCBt"].concat($_CJBIu), $_CJBJe = $_CJBHr[1];
                    $_CJBHr.shift();
                    var $_CJCAK = $_CJBHr[0];
                    s[$_CJBIu(1042)] = 0, a();
                })[$_CICEL(956)]($_CICEL(1277), function () {
                    var $_CJCDr = PaLDJ.$_CS, $_CJCCP = ["$_CJCGY"].concat($_CJCDr), $_CJCEw = $_CJCCP[1];
                    $_CJCCP.shift();
                    var $_CJCFo = $_CJCCP[0];
                    i[$_CJCEw(1162)]([Le, Ne, Re]) && i[$_CJCEw(1084)](je);
                })[$_CICEL(956)]($_CICEL(1262), function () {
                    var $_CJCIC = PaLDJ.$_CS, $_CJCHm = ["$_CJDBi"].concat($_CJCIC), $_CJCJc = $_CJCHm[1];
                    $_CJCHm.shift();
                    var $_CJDAV = $_CJCHm[0];
                    i[$_CJCIC(1162)]([Le, Ne, Re, je]) && i[$_CJCIC(1084)](Re);
                }), o($_CICDe(1230))[$_CICEL(956)]($_CICEL(652), function () {
                    var $_CJDDX = PaLDJ.$_CS, $_CJDCC = ["$_CJDGq"].concat($_CJDDX), $_CJDEt = $_CJDCC[1];
                    $_CJDCC.shift();
                    var $_CJDFv = $_CJDCC[0];
                    r[$_CJDDX(596)][$_CJDEt(1198)] && $_CJDEt(1145) === r[$_CJDEt(596)][$_CJDDX(1198)][$_CJDEt(346)] ? r[$_CJDEt(1275)]() : r[$_CJDDX(1144)]()[$_CJDEt(305)](function () {
                        var $_CJDIr = PaLDJ.$_CS, $_CJDHD = ["$_CJEBR"].concat($_CJDIr), $_CJDJV = $_CJDHD[1];
                        $_CJDHD.shift();
                        var $_CJEAO = $_CJDHD[0];
                        i[$_CJDIr(1084)](Pe);
                    });
                }), r;
            }, $_CGIn: function (e) {
                var $_CJEDI = PaLDJ.$_CS, $_CJECx = ["$_CJEGl"].concat($_CJEDI), $_CJEEC = $_CJECx[1];
                $_CJECx.shift();
                var $_CJEF_ = $_CJECx[0];
                var t = this[$_CJEEC(740)], n = t($_CJEDI(1203)), r = t($_CJEEC(1202)), o = e[$_CJEDI(918)](),
                    i = e[$_CJEDI(931)](), s = n[$_CJEDI(649)](), a = o - (s[$_CJEEC(624)] + 8),
                    _ = s[$_CJEDI(651)] + 8 - i, c = 180 * Math[$_CJEDI(1285)](a / _) / Math[$_CJEDI(1237)];
                _ < 0 && (c += 180), r[$_CJEDI(670)]({transform: $_CJEDI(1204) + c + $_CJEDI(1235)});
            }, $_BJJL: function () {
                var $_CJEIE = PaLDJ.$_CS, $_CJEHs = ["$_CJFBg"].concat($_CJEIE), $_CJEJW = $_CJEHs[1];
                $_CJEHs.shift();
                var $_CJFAf = $_CJEHs[0];
                var e = this[$_CJEIE(599)];
                e[$_CJEJW(1162)](Me) && e[$_CJEJW(1084)](Pe);
            }, $_CCER: function () {
                var $_CJFDU = PaLDJ.$_CS, $_CJFCN = ["$_CJFGg"].concat($_CJFDU), $_CJFEM = $_CJFCN[1];
                $_CJFCN.shift();
                var $_CJFFH = $_CJFCN[0];
                this[$_CJFEM(599)];
                var e = this[$_CJFEM(596)];
                e[$_CJFDU(1259)] = $_GM(), e[$_CJFEM(1213)]();
            }, $_CHAR: function () {
                var $_CJFIj = PaLDJ.$_CS, $_CJFHv = ["$_CJGBE"].concat($_CJFIj), $_CJFJK = $_CJFHv[1];
                $_CJFHv.shift();
                var $_CJGAh = $_CJFHv[0];
                var e = this, t = e[$_CJFIj(370)], n = e[$_CJFIj(1126)];
                if ($_CJFJK(510) === n && (n = $_CJFIj(1297)), window[$_CJFIj(126)] && window[$_CJFIj(126)][n]) e[$_CJFJK(1276)](); else {
                    var r = t[n] || t[$_CJFIj(510)];
                    if (!r) return G(I($_CJFIj(1260), e[$_CJFIj(596)]));
                    L(t, $_CJFJK(348), t[$_CJFIj(328)], t[$_CJFIj(857)], r)[$_CJFIj(305)](function () {
                        var $_CJGDf = PaLDJ.$_CS, $_CJGCM = ["$_CJGGl"].concat($_CJGDf), $_CJGEd = $_CJGCM[1];
                        $_CJGCM.shift();
                        var $_CJGFO = $_CJGCM[0];
                        e[$_CJGEd(1276)]();
                    }, function () {
                        var $_CJGIy = PaLDJ.$_CS, $_CJGHV = ["$_CJHBb"].concat($_CJGIy), $_CJGJY = $_CJGHV[1];
                        $_CJGHV.shift();
                        var $_CJHAN = $_CJGHV[0];
                        return G(I($_CJGIy(1209), e[$_CJGIy(596)]));
                    });
                }
            }, $_CHBG: function () {
                var $_CJHDw = PaLDJ.$_CS, $_CJHCU = ["$_CJHGo"].concat($_CJHDw), $_CJHEm = $_CJHCU[1];
                $_CJHCU.shift();
                var $_CJHFC = $_CJHCU[0];
                var n = this, r = n[$_CJHDw(370)], e = n[$_CJHDw(740)], o = n[$_CJHDw(599)], i = n[$_CJHDw(596)],
                    t = n[$_CJHDw(1126)];
                $_CJHEm(510) === t && (t = $_CJHDw(1297));
                var s = {
                    is_next: true,
                    type: t,
                    gt: r[$_CJHDw(380)],
                    challenge: r[$_CJHEm(399)],
                    lang: r[$_CJHEm(225)],
                    https: r[$_CJHDw(1041)],
                    protocol: r[$_CJHEm(328)],
                    offline: r[$_CJHDw(258)],
                    product: r[$_CJHDw(1049)],
                    skin_path: r[$_CJHDw(1231)],
                    api_server: r[$_CJHDw(395)],
                    static_servers: r[$_CJHDw(857)],
                    timeout: r[$_CJHDw(392)],
                    post: r[$_CJHEm(327)],
                    debugConfig: r[$_CJHDw(1205)],
                    $: e,
                    isPC: true,
                    hideSuccess: r[$_CJHEm(1219)],
                    remUnit: r[$_CJHDw(1073)],
                    zoomEle: r[$_CJHEm(1232)],
                    hideClose: r[$_CJHDw(1215)],
                    hideRefresh: r[$_CJHEm(1228)],
                    autoReset: r[$_CJHEm(1229)]
                };
                n[$_CJHDw(1278)] && (s[$_CJHDw(1299)] = true), $_CJHEm(1031) !== r[$_CJHDw(1049)] && (s[$_CJHDw(1352)] = r[$_CJHDw(1352)], r[$_CJHEm(1390)] && (s[$_CJHEm(1390)] = r[$_CJHEm(1390)])), $_CJHDw(1012) === r[$_CJHEm(1049)] || $_CJHDw(1031) === r[$_CJHDw(1049)] ? s[$_CJHDw(622)] = $_CJHDw(1395) : s[$_CJHDw(622)] = r[$_CJHEm(1341)] || $_CJHEm(1395), $_CJHEm(1012) === r[$_CJHEm(1049)] && (s[$_CJHEm(1049)] = $_CJHDw(1344)), $_CJHEm(1297) === t && $_CJHDw(1031) === r[$_CJHEm(1049)] && (s[$_CJHDw(1049)] = $_CJHDw(1344)), n[$_CJHEm(1296)] && (n[$_CJHEm(1296)][$_CJHDw(1255)](), n[$_CJHDw(1296)] = null);
                var a = window[$_CJHDw(126)](s);
                e($_CJHEm(1225))[$_CJHDw(677)](t), $_CJHDw(1012) === r[$_CJHDw(1049)] ? (e($_CJHEm(1385))[$_CJHDw(1378)]($_CJHDw(253)), a[$_CJHDw(1363)](e($_CJHEm(1385))[$_CJHDw(407)])) : (e($_CJHDw(1354))[$_CJHDw(1378)]($_CJHEm(253)), a[$_CJHDw(1363)](e($_CJHDw(1354))[$_CJHEm(407)])), a[$_CJHDw(1386)](function () {
                    var $_CJHIx = PaLDJ.$_CS, $_CJHHd = ["$_CJIBm"].concat($_CJHIx), $_CJHJO = $_CJHHd[1];
                    $_CJHHd.shift();
                    var $_CJIAR = $_CJHHd[0];
                    o[$_CJHJO(1084)](ze);
                })[$_CJHDw(1396)](function (e) {
                    var $_CJIDQ = PaLDJ.$_CS, $_CJICV = ["$_CJIGq"].concat($_CJIDQ), $_CJIEq = $_CJICV[1];
                    $_CJICV.shift();
                    var $_CJIFQ = $_CJICV[0];
                    if (i[$_CJIDQ(1105)] = a[$_CJIDQ(1325)](), i[$_CJIDQ(1128)] = e, $_CJIEq(1012) === r[$_CJIDQ(1049)]) o[$_CJIDQ(1084)](qe); else {
                        o[$_CJIEq(1084)](Ge), n[$_CJIEq(1131)]();
                        var t = 50;
                        $_CJIEq(1053) !== r[$_CJIDQ(1049)] && $_CJIEq(1032) !== r[$_CJIEq(1049)] || (t += 400), g(function () {
                            var $_CJIIX = PaLDJ.$_CS, $_CJIHy = ["$_CJJBQ"].concat($_CJIIX), $_CJIJi = $_CJIHy[1];
                            $_CJIHy.shift();
                            var $_CJJAV = $_CJIHy[0];
                            o[$_CJIIX(1084)](qe);
                        }, t);
                    }
                })[$_CJHEm(1317)](function () {
                    var $_CJJDb = PaLDJ.$_CS, $_CJJCb = ["$_CJJGn"].concat($_CJJDb), $_CJJEl = $_CJJCb[1];
                    $_CJJCb.shift();
                    var $_CJJFN = $_CJJCb[0];
                    e($_CJJDb(1360))[$_CJJDb(677)]($_CJJDb(1340)), g(function () {
                        var $_CJJIO = PaLDJ.$_CS, $_CJJHe = ["$_DAABx"].concat($_CJJIO), $_CJJJO = $_CJJHe[1];
                        $_CJJHe.shift();
                        var $_DAAAm = $_CJJHe[0];
                        e($_CJJJO(1360))[$_CJJJO(607)]($_CJJJO(1340)), o[$_CJJIO(1084)](FAIL);
                    }, 400), $_CJJDb(1012) === r[$_CJJEl(1049)] && e($_CJJDb(1305)) && (e($_CJJEl(1305))[$_CJJEl(677)]($_CJJEl(1340)), g(function () {
                        var $_DAADE = PaLDJ.$_CS, $_DAACy = ["$_DAAGX"].concat($_DAADE), $_DAAEh = $_DAACy[1];
                        $_DAACy.shift();
                        var $_DAAFV = $_DAACy[0];
                        e($_DAAEh(1305))[$_DAAEh(607)]($_DAAEh(1340));
                    }, 400));
                })[$_CJHDw(1307)](function (e) {
                    var $_DAAIU = PaLDJ.$_CS, $_DAAHL = ["$_DABBK"].concat($_DAAIU), $_DAAJF = $_DAAHL[1];
                    $_DAAHL.shift();
                    var $_DABAL = $_DAAHL[0];
                    $_DAAIU(1012) !== r[$_DAAIU(1049)] && n[$_DAAIU(1177)](), i[$_DAAJF(301)](e);
                })[$_CJHDw(1346)](function () {
                    var $_DABDy = PaLDJ.$_CS, $_DABCq = ["$_DABGN"].concat($_DABDy), $_DABEv = $_DABCq[1];
                    $_DABCq.shift();
                    var $_DABFI = $_DABCq[0];
                    o[$_DABEv(1162)]([Ie, qe, $_DABEv(33)]) || o[$_DABDy(1084)](Ge);
                }), a[$_CJHEm(1365)] && a[$_CJHEm(1365)](function (e) {
                    var $_DABIQ = PaLDJ.$_CS, $_DABHS = ["$_DACBL"].concat($_DABIQ), $_DABJM = $_DABHS[1];
                    $_DABHS.shift();
                    var $_DACAe = $_DABHS[0];
                    i[$_DABJM(1126)] = e, n[$_DABJM(1296)] = null, n[$_DABIQ(1278)] = true;
                    o[$_DABJM(1084)]($_DABJM(1029));
                }), a[$_CJHDw(1382)] && a[$_CJHDw(1382)](function () {
                    var $_DACDA = PaLDJ.$_CS, $_DACCR = ["$_DACGQ"].concat($_DACDA), $_DACEn = $_DACCR[1];
                    $_DACCR.shift();
                    var $_DACFm = $_DACCR[0];
                    n[$_DACDA(1196)](), o[$_DACDA(1084)]($e), n[$_DACDA(1144)]()[$_DACEn(305)](function () {
                        var $_DACIQ = PaLDJ.$_CS, $_DACHF = ["$_DADBA"].concat($_DACIQ), $_DACJI = $_DACHF[1];
                        $_DACHF.shift();
                        var $_DADAG = $_DACHF[0];
                        o[$_DACJI(1084)](Pe);
                    });
                }), n[$_CJHEm(1296)] = a;
            }, $_CBEZ: function () {
                var $_DADDo = PaLDJ.$_CS, $_DADCz = ["$_DADGt"].concat($_DADDo), $_DADEx = $_DADCz[1];
                $_DADCz.shift();
                var $_DADFA = $_DADCz[0];
                var e = this, t = e[$_DADEx(740)], n = e[$_DADDo(370)], r = (e[$_DADEx(599)], e[$_DADEx(1126)]);
                e[$_DADEx(1296)] && ($_DADEx(1031) === (n = e[$_DADDo(370)])[$_DADEx(1049)] ? (e[$_DADEx(1355)](), t($_DADEx(1225))[$_DADDo(1211)]()[$_DADEx(1264)](1), e[$_DADDo(1296)][$_DADDo(1371)]()) : $_DADDo(1012) === n[$_DADDo(1049)] ? $_DADDo(652) === r || $_DADDo(1301) === r || $_DADDo(1357) === r || $_DADDo(1345) === r ? e[$_DADEx(1379)]() : $_DADEx(1338) === r ? e[$_DADDo(1303)]() : e[$_DADDo(1309)]() : $_DADEx(1053) !== n[$_DADDo(1049)] && $_DADDo(1032) !== n[$_DADEx(1049)] || e[$_DADEx(1296)][$_DADDo(1371)]());
            }, $_CBFr: function () {
                var $_DADIb = PaLDJ.$_CS, $_DADHs = ["$_DAEBb"].concat($_DADIb), $_DADJy = $_DADHs[1];
                $_DADHs.shift();
                var $_DAEAn = $_DADHs[0];
                var e = this, t = (e[$_DADIb(599)], e[$_DADIb(740)]);
                if (e[$_DADJy(1296)]) {
                    var n = e[$_DADJy(370)];
                    $_DADIb(1031) === n[$_DADJy(1049)] ? (t($_DADIb(1225))[$_DADJy(1264)](1), g(function () {
                        var $_DAEDs = PaLDJ.$_CS, $_DAECd = ["$_DAEGv"].concat($_DAEDs), $_DAEEG = $_DAECd[1];
                        $_DAECd.shift();
                        var $_DAEFD = $_DAECd[0];
                        t($_DAEEG(1225))[$_DAEEG(1271)]();
                    }, 10)) : $_DADIb(1053) === n[$_DADIb(1049)] || $_DADJy(1032) === n[$_DADJy(1049)] ? e[$_DADJy(1296)][$_DADJy(1334)]() : $_DADIb(1012) === n[$_DADIb(1049)] && e[$_DADIb(1120)]();
                }
            }, $_IIo: function (e) {
                var $_DAEIw = PaLDJ.$_CS, $_DAEHK = ["$_DAFBx"].concat($_DAEIw), $_DAEJz = $_DAEHK[1];
                $_DAEHK.shift();
                var $_DAFAy = $_DAEHK[0];
                var t = this, n = t[$_DAEIw(740)], r = t[$_DAEIw(370)], o = t[$_DAEIw(599)];
                if (t[$_DAEJz(1126)] = e, o[$_DAEIw(1162)](Fe)) {
                    $_DAEIw(1053) === r[$_DAEJz(1049)] ? n($_DAEJz(1225))[$_DAEIw(677)]($_DAEJz(1053))[$_DAEJz(677)](r[$_DAEJz(1056)])[$_DAEIw(1283)](new le(h)) : $_DAEIw(1031) === r[$_DAEIw(1049)] && (n($_DAEIw(1225))[$_DAEJz(677)]($_DAEIw(1031))[$_DAEJz(677)](r[$_DAEIw(1056)])[$_DAEIw(1283)](new le(h)), t[$_DAEIw(1355)](), t[$_DAEJz(1015)][$_DAEJz(941)]($_DAEJz(618)), t[$_DAEIw(1015)][$_DAEIw(956)]($_DAEJz(618), function () {
                        var $_DAFDS = PaLDJ.$_CS, $_DAFCf = ["$_DAFGb"].concat($_DAFDS), $_DAFEO = $_DAFCf[1];
                        $_DAFCf.shift();
                        var $_DAFFq = $_DAFCf[0];
                        t[$_DAFDS(1355)]();
                    })), $_DAEJz(1012) === r[$_DAEJz(1049)] && w && $_DAEJz(510) !== e && (t[$_DAEIw(1015)][$_DAEIw(941)]($_DAEIw(618)), t[$_DAEJz(1015)][$_DAEJz(956)]($_DAEIw(618), function () {
                        var $_DAFIn = PaLDJ.$_CS, $_DAFHz = ["$_DAGBG"].concat($_DAFIn), $_DAFJA = $_DAFHz[1];
                        $_DAFHz.shift();
                        var $_DAGAM = $_DAFHz[0];
                        t[$_DAFJA(1327)]();
                    })), t[$_DAEJz(1393)](), n($_DAEJz(1375))[$_DAEIw(956)]($_DAEJz(652), function () {
                        var $_DAGDn = PaLDJ.$_CS, $_DAGCn = ["$_DAGGe"].concat($_DAGDn), $_DAGEM = $_DAGCn[1];
                        $_DAGCn.shift();
                        var $_DAGFi = $_DAGCn[0];
                        t[$_DAGDn(1296)] && o[$_DAGEM(1084)](Ge);
                    });

                    function i() {
                        var $_DDHIW = PaLDJ.$_Dz()[4][6];
                        for (; $_DDHIW !== PaLDJ.$_Dz()[4][5];) {
                            switch ($_DDHIW) {
                                case PaLDJ.$_Dz()[0][6]:
                                    t[$_DAEJz(1246)] || t[$_DAEJz(1296)] && o[$_DAEJz(1162)]([Ge]) && o[$_DAEIw(1084)](ze);
                                    $_DDHIW = PaLDJ.$_Dz()[0][5];
                                    break;
                            }
                        }
                    }

                    t[$_DAEJz(1361)] ? t[$_DAEJz(1361)][$_DAEJz(956)]($_DAEIw(652), i) : (n($_DAEIw(1254))[$_DAEIw(956)]($_DAEIw(652), i), n($_DAEJz(1254))[$_DAEIw(956)]($_DAEIw(653), function (e) {
                        var $_DAGIi = PaLDJ.$_CS, $_DAGHs = ["$_DAHBK"].concat($_DAGIi), $_DAGJ_ = $_DAGHs[1];
                        $_DAGHs.shift();
                        var $_DAHAe = $_DAGHs[0];
                        13 === e[$_DAGIi(698)][$_DAGIi(1227)] && i();
                    }));
                }
            }, $_CHDN: function () {
                var $_DAHDt = PaLDJ.$_CS, $_DAHCY = ["$_DAHGN"].concat($_DAHDt), $_DAHEI = $_DAHCY[1];
                $_DAHCY.shift();
                var $_DAHFm = $_DAHCY[0];

                function r(e) {
                    var $_DDHJJ = PaLDJ.$_Dz()[0][6];
                    for (; $_DDHJJ !== PaLDJ.$_Dz()[2][4];) {
                        switch ($_DDHJJ) {
                            case PaLDJ.$_Dz()[2][6]:
                                var t = 0;
                                $_DDHJJ = PaLDJ.$_Dz()[0][5];
                                break;
                            case PaLDJ.$_Dz()[4][5]:
                                return e && (t = parseInt(e)) != t && (t = 0), t;
                                break;
                        }
                    }
                }

                var e, t, n = this[$_DAHEI(370)], o = this[$_DAHDt(740)], i = this[$_DAHEI(1126)], s = new le(m),
                    a = s[$_DAHDt(649)](), _ = r(s[$_DAHDt(1329)]($_DAHDt(1349))),
                    c = r(s[$_DAHDt(1329)]($_DAHDt(1388))), l = r(s[$_DAHEI(1329)]($_DAHEI(1330))),
                    u = o($_DAHDt(1347))[$_DAHDt(649)](), p = u[$_DAHDt(686)] - (a[$_DAHDt(624)] - _) + 9,
                    h = u[$_DAHDt(651)] - (a[$_DAHDt(651)] - l) - 3, f = 0;
                f = /%/[$_DAHEI(446)](n[$_DAHEI(1341)]) ? parseInt(n[$_DAHEI(622)]) * (0.01 * parseInt(n[$_DAHDt(1341)])) : parseInt(n[$_DAHDt(1341)]) || a[$_DAHDt(686)] + c - u[$_DAHDt(686)] - 10, $_DAHDt(510) === i ? (278 < f ? f = 278 : f < 230 && (f = 230), e = f * 1.025179856115108 - 50) : $_DAHEI(1338) === i ? (f = 300, e = 100) : $_DAHEI(652) !== i && $_DAHEI(1301) !== i && $_DAHEI(1357) !== i && $_DAHDt(1345) !== i || (348 < f ? f = 348 : f < 210 && (f = 210), e = 446 * f / 348 - 50), t = h - 10 - 5 < e / 2 ? h - 10 - 5 : e / 2;
                var d = o($_DAHEI(1225)), g = o($_DAHDt(1359)), v = o($_DAHDt(1354));
                g[$_DAHDt(1211)](), d[$_DAHDt(670)]({left: $_BBU(p), top: $_BBU(h)}), v[$_DAHEI(670)]({
                    width: $_BBU(f),
                    top: $_BBU(-t)
                });
            }, $_CHJB: function () {
                var $_DAHIN = PaLDJ.$_CS, $_DAHHF = ["$_DAIBI"].concat($_DAHIN), $_DAHJp = $_DAHHF[1];
                $_DAHHF.shift();
                var $_DAIAe = $_DAHHF[0];
                this[$_DAHIN(1313)](this[$_DAHJp(1397)]);
            }, $_CGAZ: function () {
                var $_DAIDQ = PaLDJ.$_CS, $_DAICV = ["$_DAIGB"].concat($_DAIDQ), $_DAIEE = $_DAICV[1];
                $_DAICV.shift();
                var $_DAIFS = $_DAICV[0];
                var e = this[$_DAIEE(370)];
                return this[$_DAIDQ(1010)][$_DAIEE(670)]({width: e[$_DAIDQ(622)] || $_BBU(this[$_DAIDQ(1316)])}), this;
            }, $_CGBA: function () {
                var $_DAIIc = PaLDJ.$_CS, $_DAIHZ = ["$_DAJBP"].concat($_DAIIc), $_DAIJo = $_DAIHZ[1];
                $_DAIHZ.shift();
                var $_DAJAT = $_DAIHZ[0];
                var e = this[$_DAIJo(370)],
                    t = $_DAIIc(1322) + e[$_DAIIc(1056)] + $_DAIIc(1369) + ($_DAIJo(1025) === e[$_DAIIc(328)] ? $_DAIJo(1302) : $_DAIJo(253)) + $_DAIIc(82) + e[$_DAIIc(1389)] + $_DAIIc(1314),
                    n = e[$_DAIIc(836)];
                return n && n[$_DAIIc(1231)] && (t = t[$_DAIJo(299)]($_DAIIc(832), n[$_DAIJo(1231)])), L(e, $_DAIIc(306), e[$_DAIJo(328)], e[$_DAIIc(857)], t);
            }, $_CBAk: function (e, t) {
                var $_DAJDh = PaLDJ.$_CS, $_DAJCu = ["$_DAJGE"].concat($_DAJDh), $_DAJEr = $_DAJCu[1];
                $_DAJCu.shift();
                var $_DAJFO = $_DAJCu[0];
                var n = this[$_DAJEr(740)];
                if (e === qe) if (n($_DAJEr(1254))[$_DAJEr(1339)](e, t || null), this[$_DAJDh(1065)]) n($_DAJEr(1356))[$_DAJEr(677)]($_DAJDh(1318)), n($_DAJDh(1384))[$_DAJDh(677)]($_DAJEr(1318)), n($_DAJDh(1310))[$_DAJEr(670)]({width: n($_DAJDh(1254))[$_DAJEr(1279)]() + $_DAJEr(268)}), g(function () {
                    var $_DAJId = PaLDJ.$_CS, $_DAJHJ = ["$_DBABb"].concat($_DAJId), $_DAJJM = $_DAJHJ[1];
                    $_DAJHJ.shift();
                    var $_DBAAU = $_DAJHJ[0];
                    n($_DAJJM(1310))[$_DAJJM(670)]({width: $_DAJId(1395)});
                }, 2e3); else {
                    var r = this[$_DAJDh(370)];
                    $_DAJDh(1012) === r[$_DAJDh(1049)] && r[$_DAJEr(1110)] || (n($_DAJEr(1384))[$_DAJEr(1211)]()[$_DAJEr(677)]($_DAJEr(1318)), n($_DAJEr(1356))[$_DAJEr(1211)]()[$_DAJEr(677)]($_DAJEr(1318)));
                } else n($_DAJEr(1254))[$_DAJDh(1339)](e, t || null);
                return this;
            }, $_FHm: function (e) {
                var $_DBADz = PaLDJ.$_CS, $_DBACl = ["$_DBAGP"].concat($_DBADz), $_DBAEi = $_DBACl[1];
                $_DBACl.shift();
                var $_DBAFO = $_DBACl[0];
                var t = this, n = t[$_DBADz(370)][$_DBAEi(1049)];
                if ($_DBAEi(1031) === n || $_DBAEi(1053) === n || $_DBADz(1032) === n) return t[$_DBAEi(1315)] || t[$_DBADz(1361)] ? t : (t[$_DBADz(1315)] = le[$_DBAEi(740)](e), t[$_DBAEi(1315)] ? (t[$_DBAEi(1323)] = $_GM(), t[$_DBADz(956)](), t[$_DBADz(1010)][$_DBADz(353)](t[$_DBAEi(1315)]), t[$_DBAEi(1293)](), t) : G(I($_DBAEi(1367), t[$_DBAEi(596)])));
            }, $_CDEg: function (e) {
                var $_DBAIb = PaLDJ.$_CS, $_DBAHE = ["$_DBBBe"].concat($_DBAIb), $_DBAJG = $_DBAHE[1];
                $_DBAHE.shift();
                var $_DBBAr = $_DBAHE[0];
                var t = this, n = t[$_DBAJG(740)];
                return t[$_DBAIb(1333)] = le[$_DBAIb(740)](e), t[$_DBAJG(1333)] ? (n($_DBAIb(1319))[$_DBAIb(1283)](t[$_DBAIb(1333)]), t) : G(I($_DBAJG(1392), t[$_DBAJG(596)]));
            }, $_CDFh: function (e) {
                var $_DBBDP = PaLDJ.$_CS, $_DBBCC = ["$_DBBGP"].concat($_DBBDP), $_DBBEs = $_DBBCC[1];
                $_DBBCC.shift();
                var $_DBBFh = $_DBBCC[0];
                var t = this;
                if (t[$_DBBEs(1361)] || t[$_DBBEs(1315)]) return t;
                var n = t[$_DBBEs(599)];
                if (t[$_DBBEs(1361)] = le[$_DBBEs(740)](e), !t[$_DBBEs(1361)]) return G(I($_DBBEs(1351), t[$_DBBDP(596)]));
                t[$_DBBDP(1361)][$_DBBEs(956)]($_DBBEs(652), function () {
                    var $_DBBIa = PaLDJ.$_CS, $_DBBHV = ["$_DBCBl"].concat($_DBBIa), $_DBBJN = $_DBBHV[1];
                    $_DBBHV.shift();
                    var $_DBCA_ = $_DBBHV[0];
                    n[$_DBBJN(1162)]([Le]) && n[$_DBBIa(1084)](Pe);
                });
            }, $_CBGP: function (e) {
                var $_DBCDD = PaLDJ.$_CS, $_DBCCG = ["$_DBCGm"].concat($_DBCDD), $_DBCEV = $_DBCCG[1];
                $_DBCCG.shift();
                var $_DBCFS = $_DBCCG[0];
                var t = this[$_DBCEV(370)];
                $_DBCDD(1012) === t[$_DBCDD(1049)] && (t[$_DBCDD(1110)] || (this[$_DBCDD(1331)](), this[$_DBCEV(1196)]())), this[$_DBCDD(1343)](e);
            }, $_CIFo: function (e) {
                var $_DBCIc = PaLDJ.$_CS, $_DBCHg = ["$_DBDBB"].concat($_DBCIc), $_DBCJZ = $_DBCHg[1];
                $_DBCHg.shift();
                var $_DBDAl = $_DBCHg[0];
                var t = this[$_DBCIc(740)];
                t($_DBCJZ(1353))[$_DBCJZ(34)]({value: e[$_DBCIc(1391)]}), t($_DBCIc(1335))[$_DBCJZ(34)]({value: e[$_DBCIc(1306)]}), t($_DBCJZ(1381))[$_DBCIc(34)]({value: e[$_DBCJZ(1366)]});
            }, $_CIGQ: function () {
                var $_DBDDc = PaLDJ.$_CS, $_DBDCs = ["$_DBDGa"].concat($_DBDDc), $_DBDEc = $_DBDCs[1];
                $_DBDCs.shift();
                var $_DBDFu = $_DBDCs[0];
                var e = this[$_DBDDc(740)];
                return e($_DBDEc(1353))[$_DBDEc(720)]([$_DBDEc(676)]), e($_DBDEc(1335))[$_DBDDc(720)]([$_DBDDc(676)]), e($_DBDDc(1381))[$_DBDEc(720)]([$_DBDEc(676)]), this;
            }, $_CGEm: function () {
                var $_DBDIV = PaLDJ.$_CS, $_DBDHZ = ["$_DBEBD"].concat($_DBDIV), $_DBDJm = $_DBDHZ[1];
                $_DBDHZ.shift();
                var $_DBEAc = $_DBDHZ[0];
                var t = this, n = t[$_DBDJm(370)];
                v(t[$_DBDJm(1247)]), t[$_DBDJm(596)][$_DBDIV(1122)] = t[$_DBDIV(596)][$_DBDIV(1021)][$_DBDIV(1093)]();
                var e = {
                        lang: n[$_DBDJm(225)] || $_DBDIV(275),
                        ww: n[$_DBDJm(826)],
                        cc: n[$_DBDJm(1005)],
                        i: t[$_DBDIV(596)][$_DBDJm(1122)]
                    }, r = t[$_DBDIV(596)][$_DBDIV(1147)](true),
                    o = $_BFr()[$_DBDJm(1168)](de[$_DBDIV(411)](e), t[$_DBDIV(596)][$_DBDIV(1106)]()),
                    i = p[$_DBDIV(1116)](o), s = {
                        gt: n[$_DBDJm(380)],
                        challenge: n[$_DBDJm(399)],
                        lang: e[$_DBDJm(225)],
                        w: i + r,
                        pt: t[$_DBDJm(596)][$_DBDJm(1088)],
                        client_type: t[$_DBDIV(596)][$_DBDIV(1003)]
                    };
                return j(n, p[$_DBDIV(499)]($_DBDIV(1332)), s)[$_DBDIV(305)](function (e) {
                    var $_DBEDt = PaLDJ.$_CS, $_DBECx = ["$_DBEGT"].concat($_DBEDt), $_DBEEA = $_DBECx[1];
                    $_DBECx.shift();
                    var $_DBEFP = $_DBECx[0];
                    if (t[$_DBEDt(596)][$_DBEEA(1320)](), e[$_DBEDt(489)] === Xe) return G(F(e, t[$_DBEDt(596)], $_DBEDt(1224)));
                    $_DBEEA(1012) !== n[$_DBEEA(1049)] && (t[$_DBEDt(596)][$_DBEEA(1089)] = new Te), n[$_DBEEA(1048)](e[$_DBEEA(872)]), e[$_DBEDt(872)] && e[$_DBEEA(872)][$_DBEEA(834)] && t[$_DBEDt(596)][$_DBEDt(1321)](), n[$_DBEEA(1229)] && (t[$_DBEEA(1247)] = g(function () {
                        var $_DBEIb = PaLDJ.$_CS, $_DBEHQ = ["$_DBFBK"].concat($_DBEIb), $_DBEJQ = $_DBEHQ[1];
                        $_DBEHQ.shift();
                        var $_DBFAE = $_DBEHQ[0];
                        t[$_DBEJQ(1208)]();
                    }, t[$_DBEDt(1239)]));
                }, function () {
                    var $_DBFDR = PaLDJ.$_CS, $_DBFCM = ["$_DBFGO"].concat($_DBFDR), $_DBFEK = $_DBFCM[1];
                    $_DBFCM.shift();
                    var $_DBFFU = $_DBFCM[0];
                    return G(I($_DBFDR(1376), t[$_DBFEK(596)]));
                });
            }, $_CEIN: function () {
                var $_DBFIA = PaLDJ.$_CS, $_DBFHl = ["$_DBGBT"].concat($_DBFIA), $_DBFJi = $_DBFHl[1];
                $_DBFHl.shift();
                var $_DBGAa = $_DBFHl[0];
                var e = this, t = e[$_DBFIA(599)], n = e[$_DBFJi(740)], r = t[$_DBFJi(515)]();
                return t[$_DBFIA(1162)]([qe, Ie, $e]) ? (t[$_DBFIA(1084)]($_DBFIA(33)), e[$_DBFIA(1208)]()[$_DBFIA(305)](function () {
                    var $_DBGDl = PaLDJ.$_CS, $_DBGCS = ["$_DBGGk"].concat($_DBGDl), $_DBGEl = $_DBGCS[1];
                    $_DBGCS.shift();
                    var $_DBGFH = $_DBGCS[0];
                    r === qe ? (e[$_DBGEl(1383)](), n($_DBGEl(1356))[$_DBGEl(1271)](), e[$_DBGDl(1065)] && g(function () {
                        var $_DBGIe = PaLDJ.$_CS, $_DBGHZ = ["$_DBHBr"].concat($_DBGIe), $_DBGJm = $_DBGHZ[1];
                        $_DBGHZ.shift();
                        var $_DBHAI = $_DBGHZ[0];
                        n($_DBGIe(1356))[$_DBGJm(607)]($_DBGIe(1318))[$_DBGJm(1211)]();
                    }, 10)) : r = Ie, t[$_DBGDl(1084)](Le);
                })) : e;
            }, $_CIIn: function () {
                var $_DBHDX = PaLDJ.$_CS, $_DBHCb = ["$_DBHGe"].concat($_DBHDX), $_DBHEp = $_DBHCb[1];
                $_DBHCb.shift();
                var $_DBHFA = $_DBHCb[0];
                var e = this[$_DBHEp(740)];
                e($_DBHDX(1312))[$_DBHDX(1271)](), e($_DBHEp(1384))[$_DBHDX(1271)](), e($_DBHEp(1372))[$_DBHEp(1271)](), e($_DBHDX(1294))[$_DBHEp(1271)](), e($_DBHEp(1385))[$_DBHEp(1271)](), e($_DBHDX(1244))[$_DBHEp(1211)](), g(function () {
                    var $_DBHIc = PaLDJ.$_CS, $_DBHHM = ["$_DBIBv"].concat($_DBHIc), $_DBHJT = $_DBHHM[1];
                    $_DBHHM.shift();
                    var $_DBIAU = $_DBHHM[0];
                    e($_DBHJT(1244))[$_DBHIc(1264)](1);
                }, 10), y && e($_DBHEp(1305))[$_DBHEp(670)]({marginLeft: $_DBHDX(246), marginTop: $_DBHDX(246)});
            }, $_CBJt: function () {
                var $_DBIDe = PaLDJ.$_CS, $_DBICd = ["$_DBIGd"].concat($_DBIDe), $_DBIEc = $_DBICd[1];
                $_DBICd.shift();
                var $_DBIFg = $_DBICd[0];
                var e = this[$_DBIEc(740)];
                e($_DBIDe(1305))[$_DBIDe(607)]($_DBIDe(1350)), e($_DBIDe(1305))[$_DBIDe(607)]($_DBIEc(1348)), e($_DBIEc(1305))[$_DBIEc(607)]($_DBIDe(1368)), e($_DBIDe(1305))[$_DBIEc(607)]($_DBIDe(1380)), e($_DBIDe(1305))[$_DBIDe(670)]({
                    width: $_DBIDe(253),
                    height: $_DBIEc(253)
                });
            }, $_CBIH: function () {
                var $_DBIId = PaLDJ.$_CS, $_DBIHJ = ["$_DBJBP"].concat($_DBIId), $_DBIJu = $_DBIHJ[1];
                $_DBIHJ.shift();
                var $_DBJAO = $_DBIHJ[0];
                var e = this[$_DBIId(740)];
                e($_DBIId(1244))[$_DBIJu(1264)](0), g(function () {
                    var $_DBJDT = PaLDJ.$_CS, $_DBJCw = ["$_DBJGS"].concat($_DBJDT), $_DBJEJ = $_DBJCw[1];
                    $_DBJCw.shift();
                    var $_DBJFw = $_DBJCw[0];
                    e($_DBJDT(1244))[$_DBJEJ(1271)]();
                }, 300);
            }, $_CHEB: function () {
                var $_DBJIW = PaLDJ.$_CS, $_DBJHk = ["$_DCABe"].concat($_DBJIW), $_DBJJl = $_DBJHk[1];
                $_DBJHk.shift();
                var $_DCAAB = $_DBJHk[0];
                var e = this, t = e[$_DBJIW(740)], n = e[$_DBJIW(370)];
                if (e[$_DBJJl(1337)](), n[$_DBJIW(1341)]) {
                    var r = $_DBJIW(253);
                    if (/%/[$_DBJIW(446)](n[$_DBJIW(1341)])) r = t($_DBJIW(1244))[$_DBJIW(1279)]() * parseInt(n[$_DBJIW(1341)]) * 0.01; else r = parseInt(n[$_DBJIW(1341)]) || 348;
                    348 < r ? r = 348 : r < 230 && (r = 230);
                    var o = r * 1.2816091954022988;
                    y ? t($_DBJJl(1305))[$_DBJJl(677)]($_DBJJl(1348))[$_DBJIW(670)]({
                        width: r + $_DBJIW(268),
                        height: o + $_DBJJl(268)
                    })[$_DBJJl(1211)]() : (t($_DBJIW(1305))[$_DBJIW(677)]($_DBJIW(1350))[$_DBJIW(1211)]()[$_DBJJl(670)]({
                        width: $_BBU(r),
                        height: $_BBU(o)
                    }), e[$_DBJJl(1327)]());
                } else y ? t($_DBJIW(1305))[$_DBJIW(677)]($_DBJIW(1348))[$_DBJIW(1211)]() : (t($_DBJJl(1305))[$_DBJIW(677)]($_DBJIW(1350))[$_DBJJl(1211)](), e[$_DBJJl(1327)]());
                t($_DBJJl(1385))[$_DBJIW(1211)]();
            }, $_CHHk: function () {
                var $_DCADa = PaLDJ.$_CS, $_DCACk = ["$_DCAGD"].concat($_DCADa), $_DCAEl = $_DCACk[1];
                $_DCACk.shift();
                var $_DCAFK = $_DCACk[0];
                var e = this, t = e[$_DCADa(740)], n = e[$_DCADa(370)];
                if (w && !n[$_DCADa(1341)]) {
                    var r = t($_DCAEl(1274))[$_DCADa(1329)]($_DCAEl(1328));
                    if ($_DCAEl(1311) === r || $_DCAEl(1358) === r) var o = $_DCADa(1311) === r; else o = 90 === Math[$_DCAEl(581)](window[$_DCAEl(1364)]);
                    if (o) {
                        var i = Math[$_DCADa(74)](window[$_DCAEl(1059)], window[$_DCAEl(1070)]);
                        if ((i = E ? i : i - 30) < 410) {
                            var s = 0.85 * i, a = $_BBU(Math[$_DCAEl(35)](s / 1.28));
                            t($_DCADa(1305))[$_DCAEl(670)]({width: a, height: $_BBU(Math[$_DCAEl(35)](s))});
                        }
                    } else t($_DCAEl(1305))[$_DCADa(670)]({width: $_DCADa(253), height: $_DCADa(253)});
                }
                g(function () {
                    var $_DCAIl = PaLDJ.$_CS, $_DCAHD = ["$_DCBBA"].concat($_DCAIl), $_DCAJR = $_DCAHD[1];
                    $_DCAHD.shift();
                    var $_DCBAh = $_DCAHD[0];
                    e[$_DCAJR(1296)][$_DCAJR(1371)]();
                }, 500);
            }, $_CIJI: function () {
                var $_DCBDR = PaLDJ.$_CS, $_DCBCz = ["$_DCBGY"].concat($_DCBDR), $_DCBEy = $_DCBCz[1];
                $_DCBCz.shift();
                var $_DCBFT = $_DCBCz[0];
                var e = this[$_DCBDR(740)];
                this[$_DCBEy(1337)](), e($_DCBDR(1385))[$_DCBDR(1271)]();
            }, $_CHGZ: function () {
                var $_DCBIo = PaLDJ.$_CS, $_DCBHb = ["$_DCCBS"].concat($_DCBIo), $_DCBJz = $_DCBHb[1];
                $_DCBHb.shift();
                var $_DCCAN = $_DCBHb[0];
                var e = this[$_DCBIo(740)], t = this[$_DCBJz(370)];
                if (this[$_DCBJz(1337)](), t[$_DCBJz(1341)]) {
                    var n = $_DCBIo(253);
                    if (/%/[$_DCBJz(446)](t[$_DCBIo(1341)])) n = e($_DCBJz(1244))[$_DCBJz(1279)]() * parseInt(t[$_DCBIo(1341)]) * 0.01; else n = parseInt(t[$_DCBIo(1341)]) || 278;
                    348 < n ? n = 348 : n < 230 && (n = 230);
                    var r = n * 1.025179856115108;
                    e($_DCBIo(1305))[$_DCBIo(677)]($_DCBJz(1368))[$_DCBIo(670)]({width: $_BBU(n), height: $_BBU(r)});
                } else e($_DCBJz(1305))[$_DCBJz(677)]($_DCBJz(1368));
                e($_DCBJz(1385))[$_DCBIo(1211)]();
            }, $_CHFi: function () {
                var $_DCCDf = PaLDJ.$_CS, $_DCCCq = ["$_DCCGC"].concat($_DCCDf), $_DCCEv = $_DCCCq[1];
                $_DCCCq.shift();
                var $_DCCFm = $_DCCCq[0];
                var e = this[$_DCCDf(740)];
                e($_DCCDf(1305))[$_DCCDf(677)]($_DCCDf(1380)), this[$_DCCDf(1337)](), e($_DCCEv(1385))[$_DCCDf(1211)]();
            }, $_CCAj: function () {
                var $_DCCIz = PaLDJ.$_CS, $_DCCHe = ["$_DCDBT"].concat($_DCCIz), $_DCCJY = $_DCCHe[1];
                $_DCCHe.shift();
                var $_DCDAS = $_DCCHe[0];
                var e = this[$_DCCJY(740)];
                $_DCCIz(610) !== e($_DCCJY(1244))[$_DCCJY(1329)]($_DCCJY(1336)) && (this[$_DCCJY(1399)](), e($_DCCJY(1372))[$_DCCIz(1211)](), this[$_DCCJY(1373)]());
            }, $_CCDn: function () {
                var $_DCDDl = PaLDJ.$_CS, $_DCDCH = ["$_DCDGl"].concat($_DCDDl), $_DCDEc = $_DCDCH[1];
                $_DCDCH.shift();
                var $_DCDFo = $_DCDCH[0];
                var e = this, t = e[$_DCDEc(740)];
                e[$_DCDEc(370)][$_DCDDl(1352)] && e[$_DCDDl(1387)](), e[$_DCDDl(1399)](), t($_DCDEc(1312))[$_DCDDl(1211)](), e[$_DCDEc(1373)]();
            }, $_CJBW: function () {
                var $_DCDIu = PaLDJ.$_CS, $_DCDHj = ["$_DCEBw"].concat($_DCDIu), $_DCDJR = $_DCDHj[1];
                $_DCDHj.shift();
                var $_DCEAL = $_DCDHj[0];
                var e = this[$_DCDIu(370)], t = this[$_DCDIu(740)], n = le[$_DCDIu(740)](e[$_DCDJR(1352)]);
                if (!n) return G(I($_DCDIu(1367), this[$_DCDIu(596)]));
                var r = n[$_DCDJR(1370)](), o = t($_DCDJR(1244));
                o && o[$_DCDJR(670)]({
                    position: $_DCDIu(852),
                    left: $_BBU(r[$_DCDJR(624)]),
                    top: $_BBU(r[$_DCDJR(651)]),
                    width: $_BBU(r[$_DCDIu(622)]),
                    height: $_BBU(r[$_DCDJR(682)])
                });
            }, $_CIEJ: function () {
                var $_DCEDi = PaLDJ.$_CS, $_DCECF = ["$_DCEGB"].concat($_DCEDi), $_DCEEt = $_DCECF[1];
                $_DCECF.shift();
                var $_DCEFx = $_DCECF[0];
                var e = this[$_DCEEt(740)];
                this[$_DCEEt(1399)](), e($_DCEDi(1384))[$_DCEDi(1211)](), this[$_DCEEt(1373)]();
            }, $_CJAg: function () {
                var $_DCEIm = PaLDJ.$_CS, $_DCEHG = ["$_DCFBl"].concat($_DCEIm), $_DCEJT = $_DCEHG[1];
                $_DCEHG.shift();
                var $_DCFAu = $_DCEHG[0];
                var e = this[$_DCEJT(740)];
                this[$_DCEIm(370)][$_DCEIm(1212)] ? e($_DCEIm(1294))[$_DCEJT(1211)]() : (e($_DCEJT(1305))[$_DCEIm(677)]($_DCEIm(1308)), e($_DCEIm(1294))[$_DCEIm(1271)]());
            }, $_CGFR: function () {
                var $_DCFDO = PaLDJ.$_CS, $_DCFCP = ["$_DCFGD"].concat($_DCFDO), $_DCFEt = $_DCFCP[1];
                $_DCFCP.shift();
                var $_DCFFH = $_DCFCP[0];
                var e = this[$_DCFEt(1002)][$_DCFEt(1304)] || $_DCFEt(253);
                window[$_DCFDO(1398)](e) && window[$_DCFDO(442)][$_DCFEt(1394)]();
            }, $_CCCI: function () {
                var $_DCFIz = PaLDJ.$_CS, $_DCFHE = ["$_DCGBi"].concat($_DCFIz), $_DCFJH = $_DCFHE[1];
                $_DCFHE.shift();
                var $_DCGAQ = $_DCFHE[0];
                v(this[$_DCFJH(1247)]);
            }
        }, $[$_DADR(509)](window, et);

        var rt = $_GM();
        if (e) return et;
    });
}();
//异步执行的代码
function get_w1(gt, challenge, random_str) {
    let e = (new window.func3);
    let r = e["encrypt"](random_str);

    let param = {
        "gt": gt,
        "challenge": challenge,
        "offline": false,
        "new_captcha": true,
        "product": "float",
        "width": "300px",
        "https": true,
        "api_server": "apiv6.geetest.com",
        "protocol": "https://",
        "type": "fullpage",
        "static_servers": ["static.geetest.com/", "static.geevisit.com/"],
        "beeline": "/static/js/beeline.1.0.1.js",
        "voice": "/static/js/voice.1.2.4.js",
        "click": "/static/js/click.3.1.0.js",
        "fullpage": "/static/js/fullpage.9.1.9-ckiw8b.js",
        "slide": "/static/js/slide.7.9.2.js",
        "geetest": "/static/js/geetest.6.0.9.js",
        "aspect_radio": {"slide": 103, "click": 128, "voice": 128, "beeline": 50},
        "cc": 20,
        "ww": true,
        "i": "-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1!!-1"
    };
    let o = window.func2["encrypt1"](JSON.stringify(param), random_str);
    let i = window.func1.$_HEG(o);
    let w = i + r;
    return w;
}

function get_w2(rp,random_str) {
    let params = {
        "lang": "zh-cn",
        "type": "fullpage",
        "tt": "M?d8Pjp8Pjp8Pjp8Pjp8Pjp8PjI?M.(e5,55(qe8e5e5nbb(((f()((9:9SM-Un)37M?-j-V)3)M?/*MP-NM93)(E/*M9-U3)3)(E-*OM-UC)34M?Ob-UG)3*(?ME/)(NME1?M99gF?FC2jM9bA6hJ0-2@NoNMh.d4Ah(fUb(((bb5((5(e5b5b(e,5be5,,5(5,(b5,,5b(85,,nbn((b(((((e((((,55(e,,(,b(5fU-bU2?-P1?5Nb91fbE1d0)(P1?EN8)(P-PbE2Y/*8*MPb92?8*(Pb91?5Qc11I--1I/*0)(Nb91Ab9-Y-)4)(?(I-*-Y-)8)(?-*,)(?-Y3)19b9-N,)(?-5-)15-*,)(MbE-M-M0)(Y-)4)(?-Y-)1n-)b94)(AbE-Qb90t)(N1?-Nb91c1@1?-N1c1?bE-Y-)1@-N1)1)15-*,)(?,)(?(Mc9-Y-)15-)15-)1)(E-(bM-)(9/)()ME)qqqqqqqqqqqqqqqqqqqqqn(ghE(/FTkSE()SFkMEE//(mFMFSFSFSFSFM/((K10(b191*9*(N(b191*-,(N(b5*(95*-,(N(M195*)*)*-,(N(b191*A*(91*-*(M191*)91(1,(M(N(M1*(b1(5-(*c(bI(5-(,/((bA(5*(,)M(bM(5-(,,((e1(52(,-b(c-(A*(*(NMM1*(M1E1,(b((((qPn",
        "light": "SPAN_0",
        "s": "c7c3e21112fe4f741921cb3e4ff9f7cb",
        "h": "321f9af1e098233dbd03f250fd2b5e21",
        "hh": "39bd9cad9e425c3a8f51610fd506e3b3",
        "hi": "09eb21b3ae9542a9bc1e8b63b3d9a467",
        "vip_order": -1,
        "ct": -1,
        "ep": {
            "v": "9.1.9-ckiw8b",
            "te": false,
            "$_BBU": true,
            "ven": "Google Inc. (Intel)",
            "ren": "ANGLE (Intel, Intel(R) Iris(R) Xe Graphics (0x0000A7A0) Direct3D11 vs_5_0 ps_5_0, D3D11)",
            "fp": ["move", 1184, 259, 1729912379261, "pointermove"],
            "lp": ["up", 716, 312, 1729912379946, "pointerup"],
            "em": {"ph": 0, "cp": 0, "ek": "11", "wd": 1, "nt": 0, "si": 0, "sc": 0},
            "tm": {
                "a": 1729912377705,
                "b": 1729912377956,
                "c": 1729912377957,
                "d": 0,
                "e": 0,
                "f": 1729912377706,
                "g": 1729912377709,
                "h": 1729912377781,
                "i": 1729912377781,
                "j": 1729912377903,
                "k": 1729912377842,
                "l": 1729912377903,
                "m": 1729912377953,
                "n": 1729912377955,
                "o": 1729912377959,
                "p": 1729912378101,
                "q": 1729912378101,
                "r": 1729912378102,
                "s": 1729912378105,
                "t": 1729912378105,
                "u": 1729912378105
            },
            "dnf": "dnf",
            "by": 0
        },
        "passtime": 3023,
        "rp": rp,
        "captcha_token": "1493390763",
        "ls9s": "gdhnyilo"
    };

    var r = JSON.stringify(params);
    console.log("r==>%s\n", r)
    enc_res = window.func2.encrypt(r, random_str)
    var w = window.func1.$_HEG(enc_res);
    w = w.replace(/\ +/g, "");//去掉空格
    w = w.replace(/[ ]/g, "");    //去掉空格
    w = w.replace(/[\r\n]/g, "");//去掉回车换行
    console.log("w==>%s", w)
    return w;
}

