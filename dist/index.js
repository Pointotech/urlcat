"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.join = exports.subst = exports.query = exports.configure = void 0;
var qs_1 = __importDefault(require("qs"));
function urlcat(baseUrlOrTemplate, pathTemplateOrParams, maybeParams, config) {
    if (maybeParams === void 0) { maybeParams = {}; }
    if (config === void 0) { config = {}; }
    if (typeof pathTemplateOrParams === 'string') {
        var baseUrl = baseUrlOrTemplate;
        var pathTemplate = pathTemplateOrParams;
        var params = maybeParams;
        return urlcatImpl(pathTemplate, params, baseUrl, config);
    }
    else {
        var baseTemplate = baseUrlOrTemplate;
        var params = pathTemplateOrParams;
        return urlcatImpl(baseTemplate, params, undefined, config);
    }
}
exports.default = urlcat;
/**
 * Factory function providing a pre configured urlcat function
 *
 * @param {Object} config Configuration object for urlcat
 *
 * @returns {Function} urlcat decorator function
 *
 * @example
 * ```ts
 * configure({arrayFormat: 'brackets', objectFormat: {format: 'RFC1738'}})
 * ```
 */
function configure(rootConfig) {
    return function (baseUrlOrTemplate, pathTemplateOrParams, maybeParams, config) {
        if (maybeParams === void 0) { maybeParams = {}; }
        if (config === void 0) { config = {}; }
        return urlcat(baseUrlOrTemplate, pathTemplateOrParams, maybeParams, __assign(__assign({}, rootConfig), config));
    };
}
exports.configure = configure;
function urlcatImpl(pathTemplate, params, baseUrl, config) {
    var _a = path(pathTemplate, params), renderedPath = _a.renderedPath, remainingParams = _a.remainingParams;
    var cleanParams = removeNullOrUndef(remainingParams);
    var renderedQuery = query(cleanParams, config);
    var pathAndQuery = join(renderedPath, '?', renderedQuery);
    return baseUrl
        ? join(baseUrl, '/', pathAndQuery)
        : pathAndQuery;
}
/**
 * Creates a query string from the specified object.
 *
 * @param {Object} params an object to convert into a query string.
 * @param {Object} config configuration to stringify the query params.
 *
 * @returns {String} Query string.
 *
 * @example
 * ```ts
 * query({ id: 42, search: 'foo' })
 * // -> 'id=42&search=foo'
 * ```
 */
function query(params, config) {
    var _a, _b;
    var qsConfiguration = {
        format: (_b = (_a = config === null || config === void 0 ? void 0 : config.objectFormat) === null || _a === void 0 ? void 0 : _a.format) !== null && _b !== void 0 ? _b : 'RFC1738',
        arrayFormat: config === null || config === void 0 ? void 0 : config.arrayFormat
    };
    return qs_1.default.stringify(params, qsConfiguration);
}
exports.query = query;
/**
 * Substitutes :params in a template with property values of an object.
 *
 * @param {String} template a string that contains :params.
 * @param {Object} params an object with keys that correspond to the params in the template.
 *
 * @returns {String} Rendered path after substitution.
 *
 * @example
 * ```ts
 * subst('/users/:id/posts/:postId', { id: 42, postId: 36 })
 * // -> '/users/42/posts/36'
 * ```
 */
function subst(template, params) {
    var renderedPath = path(template, params).renderedPath;
    return renderedPath;
}
exports.subst = subst;
function path(template, params) {
    var remainingParams = __assign({}, params);
    var renderedPath = template.replace(/:[_A-Za-z][_A-Za-z0-9]*/g, function (p) {
        var key = p.slice(1);
        validatePathParam(params, key);
        delete remainingParams[key];
        return encodeURIComponent(params[key]);
    });
    return { renderedPath: renderedPath, remainingParams: remainingParams };
}
function validatePathParam(params, key) {
    var allowedTypes = ['boolean', 'string', 'number'];
    if (!Object.prototype.hasOwnProperty.call(params, key)) {
        throw new Error("Missing value for path parameter " + key + ".");
    }
    if (!allowedTypes.includes(typeof params[key])) {
        throw new TypeError("Path parameter " + key + " cannot be of type " + typeof params[key] + ". " +
            ("Allowed types are: " + allowedTypes.join(', ') + "."));
    }
    if (typeof params[key] === 'string' && params[key].trim() === '') {
        throw new Error("Path parameter " + key + " cannot be an empty string.");
    }
}
/**
 * Joins two strings using a separator.
 * If the separator occurs at the concatenation boundary in either of the strings, it is removed.
 * This prevents accidental duplication of the separator.
 *
 * @param {String} part1 First string.
 * @param {String} separator Separator used for joining.
 * @param {String} part2 Second string.
 *
 * @returns {String} Joined string.
 *
 * @example
 * ```ts
 * join('first/', '/', '/second')
 * // -> 'first/second'
 * ```
 */
function join(part1, separator, part2) {
    var p1 = part1.endsWith(separator)
        ? part1.slice(0, -separator.length)
        : part1;
    var p2 = part2.startsWith(separator)
        ? part2.slice(separator.length)
        : part2;
    return p1 === '' || p2 === ''
        ? p1 + p2
        : p1 + separator + p2;
}
exports.join = join;
function removeNullOrUndef(params) {
    return Object.keys(params)
        .filter(function (k) { return notNullOrUndefined(params[k]); })
        .reduce(function (result, k) {
        result[k] = params[k];
        return result;
    }, {});
}
function notNullOrUndefined(v) {
    return v !== undefined && v !== null;
}
