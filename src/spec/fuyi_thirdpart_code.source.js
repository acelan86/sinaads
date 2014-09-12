/**
 * namespace sinaadToolkit
 * @type {Object}
 */
'use strict';
var sinaadToolkit = {
    debug : function () {},
    error : function () {},
    /**
     * 获取当前时间戳
     * @return {Number} 当前时间戳
     * @static
     */
    now : function () {
        return +new Date();
    },
    /**
     * 随机数生成，生成一个随机数的36进制表示方法
     * @return {String} 生成一个随机的36进制字符串（包含0-9a-z）
     * @static
     */
    rnd : function () {
        return Math.floor(Math.random() * 2147483648).toString(36);
    },
    /**
     * 获取[min, max]区间内任意整数
     * @param  {Number} min 最小值
     * @param  {Number} max 最大值
     * @return {Number}     
     */
    rand : function (min, max) {
        return Math.floor(min + Math.random() * (max - min + 1));
    },
    /**
     * 把一个字符串生成唯一hash
     * @param  {String} s 要生成hash的字符串
     * @return {String}   36进制字符串
     */
    hash : function (s) {
        var hash = 0,
            i = 0,
            w;

        for (; !isNaN(w = s.charCodeAt(i++));) {
            hash = ((hash << 5) - hash) + w;
            hash = hash & hash;
        }

        return Math.abs(hash).toString(36);
    }
};

/**
 * @namespace sinaadToolkit.browser
 */
sinaadToolkit.browser = sinaadToolkit.browser || (function (ua) {
    /**
     * @lends sinaadToolkit.browser
     */
    var browser = {
        /**
         * 如果是ie返回ie当前版本号
         * @type {Number}
         */
        ie : /msie (\d+\.\d+)/i.test(ua) ? (document.documentMode || + RegExp.$1) : undefined
    };
    return browser;

})(navigator.userAgent);

/**
 * @namespace sinaadToolkit.event
 */
sinaadToolkit.event = sinaadToolkit.event || /** @lends sinaadToolkit.event */{
    /**
     * 注册事件
     * @param  {HTMLNodeElement}   dom      事件监听节点
     * @param  {String}   type     事件类型
     * @param  {Function} callback 回调方法
     */
    on : function (dom, type, callback) {
        if (dom.attachEvent) {
            dom.attachEvent('on' + type, callback);
        } else if (dom.addEventListener) {
            dom.addEventListener(type, callback, false);
        }
    },
    un : function (dom, type, callback) {
        if (dom.detachEvent) {
            dom.detachEvent('on' + type, callback);
        } else if (dom.removeEventListener) {
            dom.removeEventListener(type, callback);
        }
    }
};
/**
 * @namespace sinaadToolkit.cookie
 */
sinaadToolkit.cookie = sinaadToolkit.cookie || /** @lends sinaadToolkit.cookie */{
    /**
     * @private
     * @param  {String} key 要验证的cookie的key
     * @return {Boolean}    是否为符合规则的key
     */
    // http://www.w3.org/Protocols/rfc2109/rfc2109
    // Syntax:  General
    // The two state management headers, Set-Cookie and Cookie, have common
    // syntactic properties involving attribute-value pairs.  The following
    // grammar uses the notation, and tokens DIGIT (decimal digits) and
    // token (informally, a sequence of non-special, non-white space
    // characters) from the HTTP/1.1 specification [RFC 2068] to describe
    // their syntax.
    // av-pairs   = av-pair *(";" av-pair)
    // av-pair    = attr ["=" value] ; optional value
    // attr       = token
    // value      = word
    // word       = token | quoted-string
     
    // http://www.ietf.org/rfc/rfc2068.txt
    // token      = 1*<any CHAR except CTLs or tspecials>
    // CHAR       = <any US-ASCII character (octets 0 - 127)>
    // CTL        = <any US-ASCII control character
    //              (octets 0 - 31) and DEL (127)>
    // tspecials  = "(" | ")" | "<" | ">" | "@"
    //              | "," | ";" | ":" | "\" | <">
    //              | "/" | "[" | "]" | "?" | "="
    //              | "{" | "}" | SP | HT
    // SP         = <US-ASCII SP, space (32)>
    // HT         = <US-ASCII HT, horizontal-tab (9)>
    _isValidKey : function (key) {
        return (new RegExp("^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24")).test(key);
    },
    /**
     * 从cookie中获取key所对应的值
     * @private
     * @param  {String} key 要获取的cookie的key
     * @return {String}     cookie对应该key的值
     */
    _getRaw : function (key) {
        if (sinaadToolkit.cookie._isValidKey(key)) {
            var reg = new RegExp("(^| )" + key + "=([^;]*)(;|\x24)"),
                result = reg.exec(document.cookie);
                 
            if (result) {
                return result[2] || null;
            }
        }
        return null;
    },
    /**
     * 将cookie中key的值设置为value, 并带入一些参数
     * @private
     * @param  {String} key 要设置的cookie的key
     * @param  {String} value 要设置的值
     * @param  {Object} options 选项
     */
    _setRaw : function (key, value, options) {
        if (!sinaadToolkit.cookie._isValidKey(key)) {
            return;
        }
         
        options = options || {};

        // 计算cookie过期时间
        var expires = options.expires;
        if ('number' === typeof options.expires) {
            expires = new Date();
            expires.setTime(expires.getTime() + options.expires);
        }
         
        document.cookie =
            key + "=" + value +
            (options.path ? "; path=" + options.path : "") +
            (expires ? "; expires=" + expires.toGMTString() : "") +
            (options.domain ? "; domain=" + options.domain : "") +
            (options.secure ? "; secure" : '');

    },
    /**
     * 获取cookie中key的值
     * @param  {String} key 要获取的key
     * @return {String}     cookie值
     */
    get : function (key) {
        var value = sinaadToolkit.cookie._getRaw(key);
        if ('string' === typeof value) {
            value = decodeURIComponent(value);
            return value;
        }
        return null;
    },
    /**
     * 设置cookie值
     * @param  {String} key     要设置的key
     * @param  {String} value   要设置的value   
     * @param  {object} options 选项
     */
    set : function (key, value, options) {
        sinaadToolkit.cookie._setRaw(key, encodeURIComponent(value), options);
    },
    /**
     * 移除key相关的cookie
     * @param  {String} key     要移除的cookie的key
     * @param  {Object} options 选项
     */
    remove : function (key, options) {
        options = options || {};
        options.expires = new Date(0);
        sinaadToolkit.cookie._setRaw(key, '', options);
    }
};

/**
 * @namespace sinaadToolkit.storage
 */
sinaadToolkit.storage = sinaadToolkit.storage || (function () {
    //关闭浏览器后过期的key
    var _sessionStorageMap = {};
    //刷新浏览器清空没有设置expires的存储
    sinaadToolkit.event.on(window, 'beforeunload', function () {
        for (var key in _sessionStorageMap) {
            try {
                sinaadToolkit.storage.remove(key);
                delete _sessionStorageMap[key];
            } catch (e) {}
        }
    });

    /**
     * userData相关方法
     */
    var userData = {
        id : 'sinaadToolkitUserDataContainer',
        name : location.hostname,
        init : function () {
            var dom = document.getElementById(userData.id);
            if (!dom) {
                try {
                    dom = document.createElement('input');
                    dom.type = "hidden";
                    dom.style.display = "none";
                    dom.addBehavior("#default#userData");
                    document.body.insertBefore(dom, document.body.firstChild);
                    var expires = new Date();
                    expires.setDate(expires.getDate() + 365);
                    dom.expires = expires.toUTCString();
                } catch (e) {
                    sinaadToolkit.debug('sinaadToolkit.storage:userData init fail, ' + e.message);
                    return null;
                }
            }
            return dom;
        },
        setItem : function (key, value, expires) {
            var dom = userData.init();
            if (dom) {
                dom.load(userData.name);
                dom.setAttribute(key, value + (expires ? ';expires=' + (sinaadToolkit.now() + expires) : ''));
                dom.save(userData.name);
            }
            if (!expires) {
                _sessionStorageMap[key] = 1;
            }
        },
        getItem : function (key) {
            var dom = userData.init();
            if (dom) {
                dom.load(userData.name);
                return dom.getAttribute(key);
            }
            return null;
        },
        removeItem : function (key) {
            var dom = userData.init();
            if (dom) {
                dom.load(userData.name);
                dom.removeAttribute(key);
                dom.save(userData.name);
            }
        }
    };

    /**
     * localstorage相关方法
     */
    var ls = {
        getItem : function (key) {
            return window.localStorage.getItem(key);
        },
        setItem : function (key, value, expires) {
            window.localStorage.setItem(key, value + (expires ? ';expires=' + (sinaadToolkit.now() + expires) : ''));
            if (!expires) {
                _sessionStorageMap[key] = 1;
            }
        },
        removeItem : function (key) {
            window.localStorage.removeItem(key);
        }
    };

    /**
     * cookie相关方法
     * @type {Object}
     */
    var cookie = {
        getItem : function (key) {
            return sinaadToolkit.cookie.get(key);
        },
        setItem : function (key, value, expires) {
            sinaadToolkit.cookie.set(key, value, {expires : expires || 0});
        },
        removeItem : function (key) {
            sinaadToolkit.cookie.remove(key);
        }
    };

    /** 
     * 根据浏览器支持选择相关的存储方案
     * 当ie且ie<8时使用userData方案，否则使用localStorage方案，否则使用cookie方案
     */
    var storage = window.localStorage ? ls : sinaadToolkit.browser.ie && sinaadToolkit.browser.ie < 8 ? userData : cookie;

    return /** @lends sinaadToolkit.storage */{
        /**
         * 获取本地存储的key的值
         * @param  {String} key key
         * @return {String}     取得的值
         */
        get : function (key) {
            try {
                var value = storage.getItem(key);
                if (value) {
                    sinaadToolkit.debug('sinaadToolkit.storage.get:get value of ' + key + ':' + value);
                    value = value.split(';expires=');
                    //有过期时间
                    if (value[1] && sinaadToolkit.now() > parseInt(value[1], 10)) {
                        storage.removeItem(key);
                        return null;
                    } else {
                        return value[0];
                    }
                }
                return null;
            } catch (e) {
                sinaadToolkit.debug('sinaadToolkit.storage.get:' + e.message);
                return null;
            }
        },
        /**
         * 设置本地存储key的值为value
         * 注意：请不要设置非字符串格式形式的值到本地存储
         * @param  {String} key     设置的key
         * @param  {String} value   设置的value
         * @param  {Number} expires 过期时间毫秒数
         */
        set : function (key, value, expires) {
            try {
                storage.setItem(key, value, expires);
            } catch (e) {
                sinaadToolkit.error('sinaadToolkit.storage.set:' + e.message);
            }
        },
        /**
         * 移除本地存储中key的值
         * @param  {String} key 要移除的key
         */
        remove : function (key) {
            try {
                storage.removeItem(key);
            } catch (e) {
                sinaadToolkit.error('sinaadToolkit.storage.remove:' + e.message);
            }
        }
    };
})();

/**
 * @namespace sinaadToolkit.sio
 */
sinaadToolkit.sio = sinaadToolkit.sio || {
    /**
     * 日志方法
     * @param  {String} url 发送日志地址
     */
    log : function (url, useCache) {
        var img = new Image(),
            key = '_sinaads_sio_log_' + sinaadToolkit.rnd();

        window[key] = img;
     
        img.onload = img.onerror = img.onabort = function () {
            img.onload = img.onerror = img.onabort = null;
     
            window[key] = null;
            img = null;
        };
 
        img.src = url + (useCache ? '' : (url.indexOf('?') > 0 ? '&' : '?') + key);
    }
};


sinaadToolkit.url = sinaadToolkit.url || {
    /**
     * 获取当前页面所在的主页面url
     * @return {String} 获取当前页面所在的主页面url
     */
    top : (function () {
        var top;
        try {
            top = window.top.location.href;
        } catch (e) {}
        top = top || ((window.top === window.self) ?  window.location.href : window.document.referrer);
        if (!top) {
            sinaadToolkit.error('sinaadToolkit:Cannot get pageurl on which ad locates.');
        }
        return top;
    })()
};

/* retargeting */
(function (core) {
    function inArray(item, arr) {
        for (var i = 0, len = arr.length; i < len; i++) {
            if (item === arr[i]) {
                return true;
            }
        }
        return false;
    }

    var domainMap = 'com com.cn cn net net.cn org org.cn edu com.hk gov gov.cn im int mil biz cc tv info mobi asia cd travel pro io me'.split(' ');
    
    function parseDomain(domain) {
        var segs = domain.split('.'),
            cur = segs.length - 1,
            seg,
            result = [],
            found = 0,
            pos = 0,  //匹配不上的位置
            tmp;
        while ((seg = segs[cur--])) {
            if (found) {
                result.unshift(seg);
                continue;
            }
            tmp = tmp ? seg + '.' + tmp : seg;
            if (!inArray(tmp, domainMap)) {
                result.unshift(tmp);
                found = 1;
                pos = cur + 1; //记录不匹配的位置
            }
        }
        return pos === segs.length - 1 ? [result.join('.')] : result; //如果匹配的第一段就匹配不上，使用整个域名当作主域名
    }

    function parseURL(url) {
        var a = document.createElement('a'),
            path,
            host;

        a.href = url;
        path = a.pathname || '';
        host = (a.host || '').split(':');
        path = (path.substring(0, 1) !== '/' ? '/' : '') + path;

        return {
            //ie下拿到的host包含端口号，需要去掉
            host : host[0],
            port : host[1] || 80,
            //注意在ie下pathname拿到的最开始没有‘/’
            pathname : path
        };
    }

    function getSinaGlobal(callback) {
        var key = 'SINAGLOBAL',
            value;

        if ((value = core.cookie.get(key))) {
            callback(value);
        } else {
            //获取不到cookie值，比如受到P3P影响
            //那么就创建suda iframe用来从beacon.sina.com.cn的storage中获取
            var suda = document.createElement('iframe'),
                script = document.getElementsByTagName('script')[0],
                timer,
                timeout = 5000; //超时5s没有返回suda的值即认为不成功

            document.domain = 'sina.com.cn';
            suda.src = '//beacon.sina.com.cn/data.html?' + (+new Date());
            script.parentNode.insertBefore(suda, script);
            //循环判断是否需要
            timer = setInterval(function () {
                if (suda.contentWindow && suda.contentWindow.storage) {
                    clearInterval(timer);
                    value = suda.contentWindow.storage.get(key);
                    value && value !== 'null' && callback(value);
                }
            }, 500);
            setTimeout(function () {
                clearInterval(timer);
            }, timeout);
        }
    }

    getSinaGlobal(function (sinaglobal) {
        var HASH_LIST_KEY = 'sfy_rt',
            RECORD_URL = '//r.sax.sina.com.cn/visit?',
            hashList = core.storage.get(HASH_LIST_KEY),
            split = '|',
            uid = window.location.search.substring(1),
            hashMap = {},
            hash,
            now = new Date(),
            today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(),
            i = 0,
            len = 0;


        if (hashList) {
            hashList = hashList.split('$');
            hashList[1] = hashList[1] || 0;
            if (now - parseInt(hashList[1], 10) > 24 * 60 * 60 * 1000) {
                core.storage.remove(HASH_LIST_KEY);
                hashList = [];
            } else {
                hashList = hashList[0].split(split);
            }
            i = hashList.length;
            while((hash = hashList[--i])) {
                hashMap[hash] = 1;
            }
        }
        hashList = [];

        //www.sina.com.cn/bar1/bar2/ => globalid@sina.com.cn_bar1_bar2
        //foo.sina.com.cn/bar1/bar2/ => globalid@sina.com.cn_foo_bar1
        //foo1.foo2.sina.com.cn/bar1/bar2 => globalid@sina.com.cn_foo2_foo1
        //foo1.foo2.bar/bar1/bar2 => globalid@foo1.foo2.bar_bar1_bar2
        var url,
            path,
            key,
            segs;

        //解析url
        url = parseURL(core.url.top);
        //去掉www, 解析出domain和子域部分
        segs = parseDomain(url.host.replace(/^www\./, ''));
        //往解析出的内容中再添加两级path
        path = url.pathname.split('/');
        for (i = 0, len = path.length; i < len ; i++) {
            path[i] && segs.unshift(path[i]);
        }

        //获取三项作为key
        key = sinaglobal + '@' + segs.reverse().splice(0, 3).join('_');

        //alert('visit:' + key);

        var currentHash = core.hash(key);

        //访问过sina, 有sinaglobal且此sinaglobal没有访问过该url
        if (uid && sinaglobal && !hashMap[currentHash]) {
            hashList.push(currentHash);
            for (hash in hashMap) {
                hashList.push(hash);
            }
            core.sio.log(RECORD_URL +
                'cid=' + encodeURIComponent(uid) +
                '&ref=' + encodeURIComponent(core.url.top) +
                '&ck=' + encodeURIComponent(sinaglobal)
            );
            //alert('record!');
            //保存一天的请求
            core.storage.set(HASH_LIST_KEY, hashList.join(split) + '$' + today, 48 * 60 * 60 * 1000);
        }
    });
})(sinaadToolkit);