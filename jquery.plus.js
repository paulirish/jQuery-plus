/**
 * jQuery plus - a collection of addons/plugins for jQuery
 * Copyright (c) 2009 James Padolsey
 * -------------------------------------------------------
 * Dual licensed under the MIT and GPL licenses.
 *    - http://www.opensource.org/licenses/mit-license.php
 *    - http://www.gnu.org/copyleft/gpl.html
 * -------------------------------------------------------
 * Version: 0.1 (last-mod: 07-sept-2009)
 * -------------------------------------------------------
 */

(function(){
    
    /* Specify alias if different from "jQuery" */
    var $ = window['jQuery'],
    
        typeOf = (function(){
            var toString = Object.prototype.toString;
            return function(a,b) {
                return toString.call(a).match(/\s(.+)\]/)[1].toLowerCase() === b;
            };
        })(),
        
        uid = '_' + (+new Date()),
        
        regexRegex = /^\/((?:\\\/|[^\/])+)\/([mig]{0,3})$/,
        
        moddedMethods = {
        
            log: function() {
                
                return ($.log = function(o) {
                
                   window.console && console.log ?
                       console.log.apply(console, arguments.length ? arguments : [this])
                   : opera && opera.postError
                       && opera.postError(o || this);
                
                   $.log.cache = $.log.cache || [];
                   $.log.cache[$.log.cache.length] = arguments.length > 1 ? arguments : o || this;
                   
                   return $.log.cache.length - 1;
                
               });
            
            },
            
            init: function(_jQueryInit) {
                
                /***
                 * Make jQuery._this always equal the last selection!
                 * See: http://james.padolsey.com/javascript/retaining-a-reference-the-simple-way/
                 */
                
                return function(selector, context) {
             
                    return ($._this = new _jQueryInit(selector, context));
             
                };
                
            },
            
            end: function() {
                
                /***
                 * end() accepts numerical argument...
                 * How far back to you want to go?
                 * E.g. $().find().find().end(2);
                 */
                
                return function(n) {
                    
                    n = Math.abs(isNaN(n) || n === 0 ? 1 : n);
                    
                    var cur = this;
                    
                    while (n--) {
                        if (cur.prevObject) {
                            cur = cur.prevObject;
                        } else {
                            cur = $([]);
                            break;
                        }
                    }
                    
                    return cur;
                
                };
                
            },
            
            data: function(_data) {
                
                /***
                 * Passing no arguments to data() will
                 * return data object.
                 */
                
                return function(a) {
                    
                    if (a === undefined) {
                        return $.cache[$.data(this[0])];
                    }
                    
                    return _data.apply(this, arguments);
                
                };
                
            },
            
            filter: function(_filter) {
                
                /***
                 * New filter method, accepts hash/schema + name/value
                 * 
                 * E.g. $().filter({
                 *          id: /^(apple|banana)$/,
                 *          parentNode: { nodeName: /^(a|span)$/i }
                 *      })
                 *      
                 * E.g. $().filter('id', /^(apple|banana)$/);
                 */
                
                function matchSchema(obj, schema) {
                    
                    var schemaIndex, schemaProp, matches = true, objProp;
                    
                    for (schemaIndex in schema) {
                        
                        if (schema.hasOwnProperty && !schema.hasOwnProperty(schemaIndex)) {
                            continue;
                        }
                        
                        matches = true;
                        schemaProp = schema[schemaIndex];
                        objProp = obj[schemaIndex];
                        
                        if (/^(number|string)$/.test(typeof schemaProp)) {
                            matches = schemaProp === objProp;
                        }
                        
                        if (typeOf(schemaProp, 'regexp')) {
                            matches = schemaProp.test(objProp);
                        }
                        
                        if ($.isFunction(schemaProp)) {
                            matches = !!schemaProp(objProp);
                        }
                        
                        if (typeOf(schemaProp, 'object')) {
                            matches = matchSchema(objProp, schemaProp);
                        }
                        
                    }
                    
                    return matches;
                    
                }
                
                return function(a, b) {
                    
                    var isRegex, val;
                    
                    if (typeOf(a, 'object'))  {
                        
                        return _filter.call(this, function(){
                            return matchSchema(this, a);
                        });
                    
                    }
                    
                    if (b !== undefined && typeof a === 'string') {
                        
                        isRegex = typeOf(b, 'regexp');
                        
                        return _filter.call(this, function(){
                            val = this[a];
                            return isRegex ? b.test(val) : b === val;
                        });
                    
                    }
                    
                    return _filter.apply(this, arguments);
                
                };
                
            },
            
            is: function(_is) {
                
                return function(a) {
                    
                    if (typeOf(a, 'object')) {
                        return !!this.filter(a).length;
                    }
                    
                    return _is.apply(this, arguments);
                    
                };
                
            },
            
            map: function(_map) {
                
                /***
                 * Map enhancement - accepts strings as schema
                 * E.g. $().map('attr:href') => [ **Array of HREFs** ]
                 * See: http://james.padolsey.com/javascript/jqueryfnmap-enhancement/
                 */
                
                return function(toMap, prop, jQueryOb) {
             
                    if (typeof toMap === 'string') {
             
                        var parts = toMap.match(/(\\:|[^:])+/g),
                            method = parts.shift(),
                            args = parts,
                            
                            mapped = _map.call(this, function(){
                                
                                var $this = $(this),
                                    result = $this[method].apply( $this, args );
                                    
                                return prop ? result[prop] : result;
                            
                            });
             
                        return jQueryOb ? mapped : mapped.get();
             
                    } else {
                        
                        return _map.apply(this, arguments);
                    
                    }
             
                };
                
            },
            
            bind: function(_bind) {
                
                /***
                 * Bind-mod - convenient registering of multiple handlers via hash-table
                 * See: http://james.padolsey.com/javascript/events-interface-for-jquery/
                 * plus Function'less event handlers. E.g. $().click({toggleClass:'foo'})
                 * See: http://james.padolsey.com/javascript/functionless-event-handlers-in-jquery/
                 */
                
                return function(type, data, fn) {
                    
                    if (typeOf(type, 'object')) {
                        
                        for (i in type) {
                            if (!type.hasOwnProperty || type.hasOwnProperty(i)) {
                                _bind.call(this, i, type[i]);
                            }
                        }
                        
                        return this;
                    
                    }
                    
                    if (fn === undefined && typeOf(data, 'object')) {
                        
                        /* Mark object to signify that it's an event-handler-hash */
                        $(data).data(uid, true);
                        fn = function(){};
                        
                    }
                    
                    return _bind.call(this, type, data, fn);
                    
                }
                
            },
            
            one: function(_one) {
                
                /***
                 * Function'less event handlers. (same as with bind())
                 */
                
                return function(type, data, fn) {
                    
                    if (fn === undefined && typeOf(data, 'object')) {
                        
                        /* Mark object to signify that it's an event-handler-hash */
                        $(data).data(uid, true);
                        fn = function(){ /* Blank function */ };
                        
                    }
                    
                    return _bind.call(this, type, data, fn);
                    
                }
                
            }
        
        };
    
    /* Overload specified methods */
    $.each(moddedMethods, function(name, newMethod){
        $.fn[name] = newMethod($.fn[name]);
    });
        
    /***
     * Function'less event handlers. E.g. $().click({toggleClass:'foo'})
     * See: http://james.padolsey.com/javascript/functionless-event-handlers-in-jquery/
     */
    
    var _eventAdd = $.event.add,
        _eventRemove = $.event.remove;
    
    $.event.remove = function(elem, types, handler) {
        
        if (handler === undefined && typeOf(types, 'object')) {
            handler = types;
            types = undefined;
        }
        
        if (typeOf(handler, 'object')) {
            handler = $(handler).data(uid) || handler;
        }
        
        _eventRemove.call(this, elem, types, handler);
        
    };
    
    $.event.add = function(elem, types, handler, data) {
        
        if (data && $(data).data(uid)) {
            $(data).data(uid, handler = function(){
                
                var $this = $(this), i;
                for (i in data) {
                    if ($.fn[i]) {
                        $.fn[i].apply($this, $.isArray(data[i]) ? data[i] : [data[i]]);
                    }
                }
                
            });
        }
        
        _eventAdd.call(this, elem, types, handler, data);
        
    };
    
    /* Make setters accept functions */
    $.each(
        [
            'css', 'html', 'val', 'attr', 'text',
            'width', 'height', 'scrollTop',
            'scrollLeft', 'addClass'
        ],
        function(){
            
            var _method = $.fn[this];
            
            $.fn[this] = function(fn) {
                if (fn && $.isFunction(fn)) {
                    return _method.call(this, fn.call(this));
                }
                return _method.apply(this, arguments);
            };
            
        }
    );
    
    /* Make getters return full set if first arg === true */
    $.each(
        [
            'html', 'val', 'text', 'width', 'height', 'scrollTop',
            'scrollLeft', 'hasClass', 'css', 'attr', 'offset',
            'position', 'outerHeight', 'outerWidth'
        ],
        function(){
            
            var _method = $.fn[this];
            
            if (!_method) {
                return true;
            }
            
            $.fn[this] = function() {
                
                var args = Array.prototype.slice.call(arguments);
                
                if (args.shift() === true) {
                    return this.map(function(){
                        return _method.apply($(this), args);
                    });
                }
                
                return _method.apply(this, arguments);
            
            };
            
        }
    );
    
    /* Selector mods */
    $.extend($.expr[':'], {
        
        data: function(elem, index, match){
            
            /***
             * Allows querying of an element's data within your
             * jQuery selectors. E.g. $('a:data(abc=123)');
             */
            
            var hasData = !!$.cache[$.data(elem)];
            
            if (hasData && match[3]) {
            
                var args = match[3].match(/^(['"])?((?:\\=|[^=])+?)\1?(?:=(['"])?(.+?)\3?)?$/);
                    key = $.trim(args[2]),
                    value = $.trim(args[4]),
                    regexMatch = null,
                    data = (function(){
                        
                        /***
                        * Allows DEEP object querying
                        * E.g. $('a:data(a.b.c=123)');
                        * Idea from: http://code.google.com/p/jquerypluginsblog/source/browse/trunk/dataSelector/jquery.dataSelector.js
                        */
            
                        var splitKey = key.match(/(\\\.|[^\.])+/g),
                            data = $(elem).data(splitKey[0]),
                            i = 1,
                            len = splitKey.length;
                        
                        for (; i < len && data !== undefined && (data = data[splitKey[i]]); ++i) {}
                        
                        return data;
                        
                    })();
                
                if ( value ) {
                    
                    if ( (regexMatch = regexRegex.exec(value)) ) {
                        return RegExp(regexMatch[1], regexMatch[2]).test(data);
                    } else {
                        return value === ('' + data);
                    }
                    
                } else {
                    
                    return !!data;
                
                }
                
            } else {
                
                return false;
            
            }

            
        }
        
    });
    
    (function(_ATTR) {
        
        /***
         * Making attribute selectors support regex syntax.
         * E.g. $('div[id%=/^foo/]')
         */
        
        var expr = $.expr;
        
        expr.filter.ATTR = function(elem, match) {
            
            if ( match[2] === '%=' ) {
            
                var attrName = match[1],
                    attrValue = expr.attrHandle[ attrName ] ? expr.attrHandle[ attrName ]( elem )
                      : elem[ attrName ] !== null ? elem[ attrName ] : elem.getAttribute( attrName ),
                    operator = match[2],
                    regex = regexRegex.exec(match[4]);
                
                return regex && RegExp(regex[1], regex[2]).test(attrValue);
                
            }
            
            return _ATTR.apply(this, arguments);
        
        };
        
    })($.expr.filter.ATTR);
    
})();

