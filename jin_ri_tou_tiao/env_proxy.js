const proxy_array = ['window', 'document', 'location', 'history', 'screen', 'target'];

function get_env_proxy(proxy_array) {
    const proxyObjects = {};

    proxy_array.forEach(name => {
        if (typeof window[name] !== 'undefined') {
            proxyObjects[name] = new Proxy(window[name], {
                get(target, prop, receiver) {
                    const value = Reflect.get(target, prop, receiver);
                    console.log(`方法：GET | 对象：${name} | 属性名：${String(prop)} | 属性值：${value} | 类型：${typeof value}`);
                    return value;
                },
                // set(target, prop, value, receiver) {
                //     console.log(`方法：SET | 对象：${name} | 属性名：${String(prop)} | 新值：${value} | 类型：${typeof value}`);
                //     return Reflect.set(target, prop, value, receiver);
                // }
            });

            Object.defineProperty(window, name, {
                get: () => proxyObjects[name],
                set: (val) => {
                    console.log(`方法：SET | 对象：window | 属性名：${name} | 新值：${val} | 类型：${typeof val}`);
                    proxyObjects[name] = val;
                }
            });
        }
    });
}

// 启用代理
get_env_proxy(proxy_array);
