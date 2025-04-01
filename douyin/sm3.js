function ir(t) {
    return ir = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
        return typeof t
    }
        : function (t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
        }
        ,
        ir(t)
}
function ur(t, r) {
    for (var e = 0; e < r.length; e++) {
        var n = r[e];
        n.enumerable = n.enumerable || !1,
            n.configurable = !0,
            "value" in n && (n.writable = !0),
            Object.defineProperty(t, sr(n.key), n)
    }
}
function sr(t) {
    var r = function (t, r) {
        if ("object" != ir(t) || !t)
            return t;
        var e = t[Symbol.toPrimitive];
        if (void 0 !== e) {
            var n = e.call(t, r || "default");
            if ("object" != ir(n))
                return n;
            throw new TypeError("@@toPrimitive must return a primitive value.")
        }
        return ("string" === r ? String : Number)(t)
    }(t, "string");
    return "symbol" == ir(r) ? r : r + ""
}
function dr(t, r) {
    return (t << (r %= 32) | t >>> 32 - r) >>> 0
}
function yr(t) {
    return 0 <= t && t < 16 ? 2043430169 : 16 <= t && t < 64 ? 2055708042 : void console.error("invalid j for constant Tj")
}
function br(t, r, e, n) {
    return 0 <= t && t < 16 ? (r ^ e ^ n) >>> 0 : 16 <= t && t < 64 ? (r & e | r & n | e & n) >>> 0 : (console.error("invalid j for bool function FF"),
        0)
}
function mr(t, r, e, n) {
    return 0 <= t && t < 16 ? (r ^ e ^ n) >>> 0 : 16 <= t && t < 64 ? (r & e | ~r & n) >>> 0 : (console.error("invalid j for bool function GG"),
        0)
}
var cr, ar, fr, lr, pr, vr, hr, gr = function () {
    function t() {
        if (function (t, r) {
            if (!(t instanceof r))
                throw new TypeError("Cannot call a class as a function")
        }(this, t),
            !(this instanceof t))
            return new t;
        this.reg = new Array(8),
            this.chunk = [],
            this.size = 0,
            this.reset()
    }
    return function (t, r, e) {
        r && ur(t.prototype, r),
            e && ur(t, e),
            Object.defineProperty(t, "prototype", {
                writable: !1
            })
    }(t, [{
        key: "reset",
        value: function () {
            this.reg[0] = 1937774191,
                this.reg[1] = 1226093241,
                this.reg[2] = 388252375,
                this.reg[3] = 3666478592,
                this.reg[4] = 2842636476,
                this.reg[5] = 372324522,
                this.reg[6] = 3817729613,
                this.reg[7] = 2969243214,
                this.chunk = [],
                this.size = 0
        }
    }, {
        key: "write",
        value: function (t) {
            var r = "string" == typeof t ? function (t) {
                var r = encodeURIComponent(t).replace(/%([0-9A-F]{2})/g, (function (t, r) {
                    return String.fromCharCode("0x" + r)
                }
                ))
                    , e = new Array(r.length);
                return Array.prototype.forEach.call(r, (function (t, r) {
                    e[r] = t.charCodeAt(0)
                }
                )),
                    e
            }(t) : t;
            this.size += r.length;
            var e = 64 - this.chunk.length;
            if (r.length < e)
                this.chunk = this.chunk.concat(r);
            else
                for (this.chunk = this.chunk.concat(r.slice(0, e)); this.chunk.length >= 64;)
                    this._compress(this.chunk),
                        e < r.length ? this.chunk = r.slice(e, Math.min(e + 64, r.length)) : this.chunk = [],
                        e += 64
        }
    }, {
        key: "sum",
        value: function (t, r) {
            t && (this.reset(),
                this.write(t)),
                this._fill();
            for (var e = 0; e < this.chunk.length; e += 64)
                this._compress(this.chunk.slice(e, e + 64));
            var n, o, i, u = null;
            if ("hex" == r) {
                u = "";
                for (e = 0; e < 8; e++)
                    u += (n = this.reg[e].toString(16),
                        o = 8,
                        i = "0",
                        n.length >= o ? n : i.repeat(o - n.length) + n)
            } else
                for (u = new Array(32),
                    e = 0; e < 8; e++) {
                    var s = this.reg[e];
                    u[4 * e + 3] = (255 & s) >>> 0,
                        s >>>= 8,
                        u[4 * e + 2] = (255 & s) >>> 0,
                        s >>>= 8,
                        u[4 * e + 1] = (255 & s) >>> 0,
                        s >>>= 8,
                        u[4 * e] = (255 & s) >>> 0
                }
            return this.reset(),
                u
        }
    }, {
        key: "_compress",
        value: function (t) {
            if (t < 64)
                console.error("compress error: not enough data");
            else {
                for (var r = function (t) {
                    for (var r = new Array(132), e = 0; e < 16; e++)
                        r[e] = t[4 * e] << 24,
                            r[e] |= t[4 * e + 1] << 16,
                            r[e] |= t[4 * e + 2] << 8,
                            r[e] |= t[4 * e + 3],
                            r[e] >>>= 0;
                    for (var n = 16; n < 68; n++) {
                        var o = r[n - 16] ^ r[n - 9] ^ dr(r[n - 3], 15);
                        o = o ^ dr(o, 15) ^ dr(o, 23),
                            r[n] = (o ^ dr(r[n - 13], 7) ^ r[n - 6]) >>> 0
                    }
                    for (n = 0; n < 64; n++)
                        r[n + 68] = (r[n] ^ r[n + 4]) >>> 0;
                    return r
                }(t), e = this.reg.slice(0), n = 0; n < 64; n++) {
                    var o = dr(e[0], 12) + e[4] + dr(yr(n), n)
                        , i = ((o = dr(o = (4294967295 & o) >>> 0, 7)) ^ dr(e[0], 12)) >>> 0
                        , u = br(n, e[0], e[1], e[2]);
                    u = (4294967295 & (u = u + e[3] + i + r[n + 68])) >>> 0;
                    var s = mr(n, e[4], e[5], e[6]);
                    s = (4294967295 & (s = s + e[7] + o + r[n])) >>> 0,
                        e[3] = e[2],
                        e[2] = dr(e[1], 9),
                        e[1] = e[0],
                        e[0] = u,
                        e[7] = e[6],
                        e[6] = dr(e[5], 19),
                        e[5] = e[4],
                        e[4] = (s ^ dr(s, 9) ^ dr(s, 17)) >>> 0
                }
                for (var c = 0; c < 8; c++)
                    this.reg[c] = (this.reg[c] ^ e[c]) >>> 0
            }
        }
    }, {
        key: "_fill",
        value: function () {
            var t = 8 * this.size
                , r = this.chunk.push(128) % 64;
            for (64 - r < 8 && (r -= 64); r < 56; r++)
                this.chunk.push(0);
            for (var e = 0; e < 4; e++) {
                var n = Math.floor(t / 4294967296);
                this.chunk.push(n >>> 8 * (3 - e) & 255)
            }
            for (e = 0; e < 4; e++)
                this.chunk.push(t >>> 8 * (3 - e) & 255)
        }
    }]),
        t
}();
var reg = {
    "reg": [
        1937774191,
        1226093241,
        388252375,
        3666478592,
        2842636476,
        372324522,
        3817729613,
        2969243214
    ],
    "chunk": [],
    "size": 0
}

const input = "device_platform=webapp&aid=6383&channel=channel_pc_web&search_channel=aweme_user_web&keyword=%E4%BA%8C%E6%88%98&search_source=normal_search&query_correct_type=1&is_filter_search=0&from_group_id=&offset=10&count=10&need_filter_settings=0&list_type=single&search_id=202503161647481313E33575E11143B887&update_version_code=170400&pc_client_type=1&pc_libra_divert=Windows&support_h265=1&support_dash=1&version_code=170400&version_name=17.4.0&cookie_enabled=true&screen_width=1707&screen_height=960&browser_language=zh-CN&browser_platform=Win32&browser_name=Chrome&browser_version=127.0.0.0&browser_online=true&engine_name=Blink&engine_version=127.0.0.0&os_name=Windows&os_version=10&cpu_core_num=16&device_memory=8&platform=PC&downlink=10&effective_type=4g&round_trip_time=50&webid=7455907028960364086&uifid=973a3fd64dcc46a3490fd9b60d4a8e663b34df4ccc4bbcf97643172fb712d8b05c8207ab7a0402be2f993623172fba41ff6cc39877dd02cf23ff682b5895c2b0273435ccd10f5501764f37d4bc40c7592e612a1ff5bb2c598051d2da4e46f92708353aecd8e8a1d4ead44c99718738b075e07b51e2402a7f6f93b3f2b6428dea89519908ac39c9037c192cfad8c8351a6c6b7eef867964390d9c142d2e8b28bc&msToken=T12zW4iQ5k2RHlOBsxpsdJG3xjo3wchdFSk5ka6_gnLpbxkNioPg2bFJCL3IIQBnATpm25ex1fiz8Nbl8K2b2FAd8WOSZBH-iYk4Jdk8KOc5hb2K5xxb_M999mXtn9z4ay7XV8EU3OsblV_1JD6x6Jj-KK8X5trbVagU9T85HKUBh_spi5VPOnI%3Ddhzx";

exports.hasher= new gr();

// const hasher = new gr();
// hasher.write(input);
// const hashBytes = hasher.sum(null, 'array');
// console.log(hashBytes)
// hasher.write(hashBytes);
// const hashBytes2 = hasher.sum(null, 'array');
// console.log(hashBytes2)
//
// let res = ''
// for (let i = 0; i < hashBytes2.length; i++) {
//     res += String.fromCharCode(hashBytes2[i]);
//
// }
// console.log(res)
