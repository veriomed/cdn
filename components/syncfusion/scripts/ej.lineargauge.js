/*!
*  filename: ej.lineargauge.js
*  version : 15.3.0.26
*  Copyright Syncfusion Inc. 2001 - 2016. All rights reserved.
*  Use of this code is subject to the terms of our license.
*  A copy of the current license can be obtained at any time by e-mailing
*  licensing@syncfusion.com. Any infringement will be prosecuted under
*  applicable laws. 
*/


window.ej = window.Syncfusion = window.Syncfusion || {};


(function ($, ej, undefined) {
    'use strict';

    ej.version = "15.3.0.26";

    ej.consts = {
        NamespaceJoin: '-'
    };
    ej.TextAlign = {
        Center: 'center',
        Justify: 'justify',
        Left: 'left',
        Right: 'right'
    };
    ej.Orientation = { Horizontal: "horizontal", Vertical: "vertical" };

    ej.serverTimezoneOffset = 0;

    ej.persistStateVersion = null;

    ej.locales = ej.locales || [];

    if (!Object.prototype.hasOwnProperty) {
        Object.prototype.hasOwnProperty = function (obj, prop) {
            return obj[prop] !== undefined;
        };
    }

    //to support toISOString() in IE8
    if (!Date.prototype.toISOString) {
        (function () {
            function pad(number) {
                var r = String(number);
                if (r.length === 1) {
                    r = '0' + r;
                }
                return r;
            }
            Date.prototype.toISOString = function () {
                return this.getUTCFullYear()
                    + '-' + pad(this.getUTCMonth() + 1)
                    + '-' + pad(this.getUTCDate())
                    + 'T' + pad(this.getUTCHours())
                    + ':' + pad(this.getUTCMinutes())
                    + ':' + pad(this.getUTCSeconds())
                    + '.' + String((this.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5)
                    + 'Z';
            };
        }());
    }

    String.format = function () {
        var source = arguments[0];
        for (var i = 0; i < arguments.length - 1; i++)
            source = source.replace(new RegExp("\\{" + i + "\\}", "gm"), arguments[i + 1]);

        source = source.replace(/\{[0-9]\}/g, "");
        return source;
    };

    jQuery.uaMatch = function (ua) {
        ua = ua.toLowerCase();

        var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
            /(webkit)[ \/]([\w.]+)/.exec(ua) ||
            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
            /(msie) ([\w.]+)/.exec(ua) ||
            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
            [];

        return {
            browser: match[1] || "",
            version: match[2] || "0"
        };
    };
    // Function to create new class
    ej.defineClass = function (className, constructor, proto, replace) {
        /// <summary>Creates the javascript class with given namespace & class name & constructor etc</summary>
        /// <param name="className" type="String">class name prefixed with namespace</param>
        /// <param name="constructor" type="Function">constructor function</param>
        /// <param name="proto" type="Object">prototype for the class</param>
        /// <param name="replace" type="Boolean">[Optional]Replace existing class if exists</param>
        /// <returns type="Function">returns the class function</returns>
        if (!className || !proto) return undefined;

        var parts = className.split(".");

        // Object creation
        var obj = window, i = 0;
        for (; i < parts.length - 1; i++) {

            if (ej.isNullOrUndefined(obj[parts[i]]))
                obj[parts[i]] = {};

            obj = obj[parts[i]];
        }

        if (replace || ej.isNullOrUndefined(obj[parts[i]])) {

            //constructor
            constructor = typeof constructor === "function" ? constructor : function () {
            };

            obj[parts[i]] = constructor;

            // prototype
            obj[parts[i]].prototype = proto;
        }

        return obj[parts[i]];
    };

    ej.util = {
        getNameSpace: function (className) {
            /// <summary>Internal function, this will create namespace for plugins using class name</summary>
            /// <param name="className" type="String"></param>
            /// <returns type="String"></returns>
            var splits = className.toLowerCase().split(".");
            splits[0] === "ej" && (splits[0] = "e");

            return splits.join(ej.consts.NamespaceJoin);
        },

        getObject: function (nameSpace, from) {
            if (!from) return undefined;

            var value = from, splits = nameSpace.split('.');

            for (var i = 0; i < splits.length; i++) {

                if (ej.util.isNullOrUndefined(value)) break;

                value = value[splits[i]];
            }

            return value;
        },

        createObject: function (nameSpace, value, initIn) {
            var splits = nameSpace.split('.'), start = initIn || window, from = start, i, t, length = splits.length;

            for (i = 0; i < length; i++) {
                t = splits[i];
                if (i + 1 == length)
                    from[t] = value;
                else if (ej.isNullOrUndefined(from[t]))
                    from[t] = {};

                from = from[t];
            }

            return start;
        },

        isNullOrUndefined: function (value) {
            /// <summary>Util to check null or undefined</summary>
            /// <param name="value" type="Object"></param>
            /// <returns type="Boolean"></returns>
            return value === undefined || value === null;
        },
        print: function (element, printWin) {
            var $div = ej.buildTag('div')
            var elementClone = element.clone();
            $div.append(elementClone);
            if (!printWin)
                var printWin = window.open('', 'print', "height=452,width=1024,tabbar=no");
            printWin.document.write('<!DOCTYPE html>');
            var links = $('head').find('link').add("style");
            if (ej.browserInfo().name === "msie") {
                var a = ""
                links.each(function (index, obj) {
                    if (obj.tagName == "LINK")
                        $(obj).attr('href', obj.href);
                    a += obj.outerHTML;
                });
                printWin.document.write('<html><head></head><body>' + a + $div[0].innerHTML + '</body></html>');
            }
            else {
                var a = ""
                printWin.document.write('<html><head>')
                links.each(function (index, obj) {
                    if (obj.tagName == "LINK")
                        $(obj).attr('href', obj.href);
                    a += obj.outerHTML;
                });
                printWin.document.writeln(a + '</head><body>')
                printWin.document.writeln($div[0].innerHTML + '</body></html>')
            }
            printWin.document.close();
            printWin.focus();
            setTimeout(function () {
                if (!ej.isNullOrUndefined(printWin.window)) {
                    printWin.print();
                    setTimeout(function () { printWin.close() }, 1000);
                }
            }, 1000);
        },
        ieClearRemover: function (element) {
            var searchBoxHeight = $(element).height();
            element.style.paddingTop = parseFloat(searchBoxHeight / 2) + "px";
            element.style.paddingBottom = parseFloat(searchBoxHeight / 2) + "px";
            element.style.height = "1px";
            element.style.lineHeight = "1px";
        },
        //To send ajax request
        sendAjaxRequest: function (ajaxOptions) {
            $.ajax({
                type: ajaxOptions.type,
                cache: ajaxOptions.cache,
                url: ajaxOptions.url,
                dataType: ajaxOptions.dataType,
                data: ajaxOptions.data,
                contentType: ajaxOptions.contentType,
                async: ajaxOptions.async,
                success: ajaxOptions.successHandler,
                error: ajaxOptions.errorHandler,
                beforeSend: ajaxOptions.beforeSendHandler,
                complete: ajaxOptions.completeHandler
            });
        },

        buildTag: function (tag, innerHtml, styles, attrs) {
            /// <summary>Helper to build jQuery element</summary>
            /// <param name="tag" type="String">tagName#id.cssClass</param>
            /// <param name="innerHtml" type="String"></param>
            /// <param name="styles" type="Object">A set of key/value pairs that configure styles</param>
            /// <param name="attrs" type="Object">A set of key/value pairs that configure attributes</param>
            /// <returns type="jQuery"></returns>
            var tagName = /^[a-z]*[0-9a-z]+/ig.exec(tag)[0];

            var id = /#([_a-z]+[-_0-9a-z]+)/ig.exec(tag);
            id = id ? id[id.length - 1] : undefined;

            var className = /\.([a-z]+[-_0-9a-z ]+)/ig.exec(tag);
            className = className ? className[className.length - 1] : undefined;

            return $(document.createElement(tagName))
                .attr(id ? { "id": id } : {})
                .addClass(className || "")
                .css(styles || {})
                .attr(attrs || {})
                .html(innerHtml || "");
        },
        _preventDefaultException: function (el, exceptions) {
            if (el) {
                for (var i in exceptions) {
                    if (exceptions[i].test(el[i])) {
                        return true;
                    }
                }
            }

            return false;
        },

        //Gets the maximum z-index in the document
        getMaxZindex: function () {
            var maxZ = 1;
            maxZ = Math.max.apply(null, $.map($('body *'), function (e, n) {
                if ($(e).css('position') == 'absolute' || $(e).css('position') == 'fixed')
                    return parseInt($(e).css('z-index')) || 1;
            })
            );
            if (maxZ == undefined || maxZ == null)
                maxZ = 1;
            return maxZ;
        },

        //To prevent default actions for the element
        blockDefaultActions: function (e) {
            e.cancelBubble = true;
            e.returnValue = false;
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
        },

        //To get dimensions of the element when its hidden
        getDimension: function (element, method) {
            var value;
            var $hidden = $(element).parents().andSelf().filter(':hidden');
            if ($hidden) {
                var prop = { visibility: 'hidden', display: 'block' };
                var tmp = [];
                $hidden.each(function () {
                    var temp = {}, name;
                    for (name in prop) {
                        temp[name] = this.style[name];
                        this.style[name] = prop[name];
                    }
                    tmp.push(temp);
                });
                value = /(outer)/g.test(method) ?
                $(element)[method](true) :
               $(element)[method]();

                $hidden.each(function (i) {
                    var temp = tmp[i], name;
                    for (name in prop) {
                        this.style[name] = temp[name];
                    }
                });
            }
            return value;
        },
        //Get triggers when transition End
        transitionEndEvent: function () {
            var transitionEnd = {
                '': 'transitionend',
                'webkit': 'webkitTransitionEnd',
                'Moz': 'transitionend',
                'O': 'otransitionend',
                'ms': 'MSTransitionEnd'
            };

            return transitionEnd[ej.userAgent()];
        },
        //Get triggers when transition End
        animationEndEvent: function () {
            var animationEnd = {
                '': 'animationend',
                'webkit': 'webkitAnimationEnd',
                'Moz': 'animationend',
                'O': 'webkitAnimationEnd',
                'ms': 'animationend'
            };

            return animationEnd[ej.userAgent()];
        },
        //To return the start event to bind for element
        startEvent: function () {
            return (ej.isTouchDevice() || $.support.hasPointer) ? "touchstart" : "mousedown";
        },
        //To return end event to bind for element
        endEvent: function () {
            return (ej.isTouchDevice() || $.support.hasPointer) ? "touchend" : "mouseup"
        },
        //To return move event to bind for element
        moveEvent: function () {
            return (ej.isTouchDevice() || $.support.hasPointer) ? ($.support.hasPointer && !ej.isMobile()) ? "ejtouchmove" : "touchmove" : "mousemove";
        },
        //To return cancel event to bind for element
        cancelEvent: function () {
            return (ej.isTouchDevice() || $.support.hasPointer) ? "touchcancel" : "mousecancel";
        },
        //To return tap event to bind for element
        tapEvent: function () {
            return (ej.isTouchDevice() || $.support.hasPointer) ? "tap" : "click";
        },
        //To return tap hold event to bind for element
        tapHoldEvent: function () {
            return (ej.isTouchDevice() || $.support.hasPointer) ? "taphold" : "click";
        },
        //To check whether its Device
        isDevice: function () {
            if (ej.getBooleanVal($('head'), 'data-ej-forceset', false))
                return ej.getBooleanVal($('head'), 'data-ej-device', this._device());
            else
                return this._device();
        },
        //To check whether its portrait or landscape mode
        isPortrait: function () {
            var elem = document.documentElement;
            return (elem) && ((elem.clientWidth / elem.clientHeight) < 1.1);
        },
        //To check whether its in lower resolution
        isLowerResolution: function () {
            return ((window.innerWidth <= 640 && ej.isPortrait() && ej.isDevice()) || (window.innerWidth <= 800 && !ej.isDevice()) || (window.innerWidth <= 800 && !ej.isPortrait() && ej.isWindows() && ej.isDevice()) || ej.isMobile());
        },
        //To check whether its iOS web view
        isIOSWebView: function () {
            return (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent));
        },
        //To check whether its Android web view
        isAndroidWebView: function () {
            return (!(typeof (Android) === "undefined"));
        },
        //To check whether its windows web view
        isWindowsWebView: function () {
            return location.href.indexOf("x-wmapp") != -1;
        },
        _device: function () {
            return (/Android|BlackBerry|iPhone|iPad|iPod|IEMobile|kindle|windows\sce|palm|smartphone|iemobile|mobile|pad|xoom|sch-i800|playbook/i.test(navigator.userAgent.toLowerCase()));
        },
        //To check whether its Mobile
        isMobile: function () {
            return ((/iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(navigator.userAgent.toLowerCase()) && /mobile/i.test(navigator.userAgent.toLowerCase()))) || (ej.getBooleanVal($('head'), 'data-ej-mobile', false) === true);
        },
        //To check whether its Tablet
        isTablet: function () {
            return (/ipad|xoom|sch-i800|playbook|tablet|kindle/i.test(navigator.userAgent.toLowerCase())) || (ej.getBooleanVal($('head'), 'data-ej-tablet', false) === true) || (!ej.isMobile() && ej.isDevice());
        },
        //To check whether its Touch Device
        isTouchDevice: function () {
            return (('ontouchstart' in window || (window.navigator.msPointerEnabled && ej.isMobile())) && this.isDevice());
        },
        //To get the outerHTML string for object
        getClearString: function (string) {
            return $.trim(string.replace(/\s+/g, " ").replace(/(\r\n|\n|\r)/gm, "").replace(new RegExp("\>[\n\t ]+\<", "g"), "><"));
        },
        //Get the attribute value with boolean type of element
        getBooleanVal: function (ele, val, option) {
            /// <summary>Util to get the property from data attributes</summary>
            /// <param name="ele" type="Object"></param>
            /// <param name="val" type="String"></param>
            /// <param name="option" type="GenericType"></param>
            /// <returns type="GenericType"></returns>
            var value = $(ele).attr(val);
            if (value != null)
                return value.toLowerCase() == "true";
            else
                return option;
        },
        //Gets the Skew class based on the element current position
        _getSkewClass: function (item, pageX, pageY) {
            var itemwidth = item.width();
            var itemheight = item.height();
            var leftOffset = item.offset().left;
            var rightOffset = item.offset().left + itemwidth;
            var topOffset = item.offset().top;
            var bottomOffset = item.offset().top + itemheight;
            var widthoffset = itemwidth * 0.3;
            var heightoffset = itemheight * 0.3;
            if (pageX < leftOffset + widthoffset && pageY < topOffset + heightoffset)
                return "e-m-skew-topleft";
            if (pageX > rightOffset - widthoffset && pageY < topOffset + heightoffset)
                return "e-m-skew-topright";
            if (pageX > rightOffset - widthoffset && pageY > bottomOffset - heightoffset)
                return "e-m-skew-bottomright";
            if (pageX < leftOffset + widthoffset && pageY > bottomOffset - heightoffset)
                return "e-m-skew-bottomleft";
            if (pageX > leftOffset + widthoffset && pageY < topOffset + heightoffset && pageX < rightOffset - widthoffset)
                return "e-m-skew-top";
            if (pageX < leftOffset + widthoffset)
                return "e-m-skew-left";
            if (pageX > rightOffset - widthoffset)
                return "e-m-skew-right";
            if (pageY > bottomOffset - heightoffset)
                return "e-m-skew-bottom";
            return "e-m-skew-center";
        },
        //Removes the added Skew class on the element
        _removeSkewClass: function (element) {
            $(element).removeClass("e-m-skew-top e-m-skew-bottom e-m-skew-left e-m-skew-right e-m-skew-topleft e-m-skew-topright e-m-skew-bottomleft e-m-skew-bottomright e-m-skew-center e-skew-top e-skew-bottom e-skew-left e-skew-right e-skew-topleft e-skew-topright e-skew-bottomleft e-skew-bottomright e-skew-center");
        },
        //Object.keys  method to support all the browser including IE8.
        _getObjectKeys: function (obj) {
            var i, keys = [];
            obj = Object.prototype.toString.call(obj) === Object.prototype.toString() ? obj : {};
            if (!Object.keys) {
                for (i in obj) {
                    if (obj.hasOwnProperty(i))
                        keys.push(i);
                }
                return keys;
            }
            if (Object.keys)
                return Object.keys(obj);
        },
        _touchStartPoints: function (evt, object) {
            if (evt) {
                var point = evt.touches ? evt.touches[0] : evt;
                object._distX = 0;
                object._distY = 0;
                object._moved = false;
                object._pointX = point.pageX;
                object._pointY = point.pageY;
            }
        },
        _isTouchMoved: function (evt, object) {
            if (evt) {
                var point = evt.touches ? evt.touches[0] : evt,
                deltaX = point.pageX - object._pointX,
                deltaY = point.pageY - object._pointY,
                timestamp = Date.now(),
                newX, newY,
                absDistX, absDistY;
                object._pointX = point.pageX;
                object._pointY = point.pageY;
                object._distX += deltaX;
                object._distY += deltaY;
                absDistX = Math.abs(object._distX);
                absDistY = Math.abs(object._distY);
                return !(absDistX < 5 && absDistY < 5);
            }
        },
        //To bind events for element
        listenEvents: function (selectors, eventTypes, handlers, remove, pluginObj, disableMouse) {
            for (var i = 0; i < selectors.length; i++) {
                ej.listenTouchEvent(selectors[i], eventTypes[i], handlers[i], remove, pluginObj, disableMouse);
            }
        },
        //To bind touch events for element
        listenTouchEvent: function (selector, eventType, handler, remove, pluginObj, disableMouse) {
            var event = remove ? "removeEventListener" : "addEventListener";
            var jqueryEvent = remove ? "off" : "on";
            var elements = $(selector);
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                switch (eventType) {
                    case "touchstart":
                        ej._bindEvent(element, event, eventType, handler, "mousedown", "MSPointerDown", "pointerdown", disableMouse);
                        break;
                    case "touchmove":
                        ej._bindEvent(element, event, eventType, handler, "mousemove", "MSPointerMove", "pointermove", disableMouse);
                        break;
                    case "touchend":
                        ej._bindEvent(element, event, eventType, handler, "mouseup", "MSPointerUp", "pointerup", disableMouse);
                        break;
                    case "touchcancel":
                        ej._bindEvent(element, event, eventType, handler, "mousecancel", "MSPointerCancel", "pointercancel", disableMouse);
                        break;
                    case "tap": case "taphold": case "ejtouchmove": case "click":
                        $(element)[jqueryEvent](eventType, handler);
                        break;
                    default:
                        if (ej.browserInfo().name == "msie" && ej.browserInfo().version < 9)
                            pluginObj["_on"]($(element), eventType, handler);
                        else
                            element[event](eventType, handler, true);
                        break;
                }
            }
        },
        //To bind events for element
        _bindEvent: function (element, event, eventType, handler, mouseEvent, pointerEvent, ie11pointerEvent, disableMouse) {
            if ($.support.hasPointer)
                element[event](window.navigator.pointerEnabled ? ie11pointerEvent : pointerEvent, handler, true);
            else
                element[event](eventType, handler, true);
        },
        _browser: function () {
            return (/webkit/i).test(navigator.appVersion) ? 'webkit' : (/firefox/i).test(navigator.userAgent) ? 'Moz' : (/trident/i).test(navigator.userAgent) ? 'ms' : 'opera' in window ? 'O' : '';
        },
        styles: document.createElement('div').style,
        /**
       * To get the userAgent Name     
       * @example             
       * &lt;script&gt;
       *       ej.userAgent();//return user agent name
       * &lt;/script&gt         
       * @memberof AppView
       * @instance
       */
        userAgent: function () {
            var agents = 'webkitT,t,MozT,msT,OT'.split(','),
            t,
            i = 0,
            l = agents.length;

            for (; i < l; i++) {
                t = agents[i] + 'ransform';
                if (t in ej.styles) {
                    return agents[i].substr(0, agents[i].length - 1);
                }
            }

            return false;
        },
        addPrefix: function (style) {
            if (ej.userAgent() === '') return style;

            style = style.charAt(0).toUpperCase() + style.substr(1);
            return ej.userAgent() + style;
        },
        //To Prevent Default Exception

        //To destroy the mobile widgets
        destroyWidgets: function (element) {
            var dataEl = $(element).find("[data-role *= ejm]");
            dataEl.each(function (index, element) {
                var $element = $(element);
                var plugin = $element.data("ejWidgets");
                if (plugin)
                    $element[plugin]("destroy");
            });
        },
        //Get the attribute value of element
        getAttrVal: function (ele, val, option) {
            /// <summary>Util to get the property from data attributes</summary>
            /// <param name="ele" type="Object"></param>
            /// <param name="val" type="String"></param>
            /// <param name="option" type="GenericType"></param>
            /// <returns type="GenericType"></returns>
            var value = $(ele).attr(val);
            if (value != null)
                return value;
            else
                return option;
        },

        // Get the offset value of element
        getOffset: function (ele) {
            var pos = {};
            var offsetObj = ele.offset() || { left: 0, top: 0 };
            $.extend(true, pos, offsetObj);
            if ($("body").css("position") != "static") {
                var bodyPos = $("body").offset();
                pos.left -= bodyPos.left;
                pos.top -= bodyPos.top;
            }
            return pos;
        },

        // Z-index calculation for the element
        getZindexPartial: function (element, popupEle) {
            if (!ej.isNullOrUndefined(element) && element.length > 0) {
                var parents = element.parents(), bodyEle;
                bodyEle = $('body').children();
                if (!ej.isNullOrUndefined(element) && element.length > 0)
                    bodyEle.splice(bodyEle.index(popupEle), 1);
                $(bodyEle).each(function (i, ele) { parents.push(ele); });

                var maxZ = Math.max.apply(maxZ, $.map(parents, function (e, n) {
                    if ($(e).css('position') != 'static') return parseInt($(e).css('z-index')) || 1;
                }));
                if (!maxZ || maxZ < 10000) maxZ = 10000;
                else maxZ += 1;
                return maxZ;
            }
        },

        isValidAttr: function (element, attribute) {
            var element = $(element)[0];
            if (typeof element[attribute] != "undefined")
                return true;
            else {
                var _isValid = false;
                $.each(element, function (key) {
                    if (key.toLowerCase() == attribute.toLowerCase()) {
                        _isValid = true;
                        return false;
                    }
                });
            }
            return _isValid;
        }

    };

    $.extend(ej, ej.util);

    // base class for all ej widgets. It will automatically inhertied
    ej.widgetBase = {
        droppables: { 'default': [] },
        resizables: { 'default': [] },

        _renderEjTemplate: function (selector, data, index, prop, ngTemplateType) {
            var type = null;
            if (typeof selector === "object" || selector.startsWith("#") || selector.startsWith("."))
                type = $(selector).attr("type");
            if (type) {
                type = type.toLowerCase();
                if (ej.template[type])
                    return ej.template[type](this, selector, data, index, prop);
            }
            // For ejGrid Angular2 Template Support
            else if (!ej.isNullOrUndefined(ngTemplateType))
                 return ej.template['text/x-'+ ngTemplateType](this, selector, data, index, prop);
            return ej.template.render(this, selector, data, index, prop);
        },

        destroy: function () {

            if (this._trigger("destroy"))
                return;

            if (this.model.enablePersistence) {
                this.persistState();
                $(window).off("unload", this._persistHandler);
            }

            try {
                this._destroy();
            } catch (e) { }

            var arr = this.element.data("ejWidgets") || [];
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == this.pluginName) {
                    arr.splice(i, 1);
                }
            }
            if (!arr.length)
                this.element.removeData("ejWidgets");

            while (this._events) {
                var item = this._events.pop(), args = [];

                if (!item)
                    break;

                for (var i = 0; i < item[1].length; i++)
                    if (!$.isPlainObject(item[1][i]))
                        args.push(item[1][i]);

                $.fn.off.apply(item[0], args);
            }

            this._events = null;

            this.element
                .removeClass(ej.util.getNameSpace(this.sfType))
                .removeClass("e-js")
                .removeData(this.pluginName);

            this.element = null;
            this.model = null;
        },

        _on: function (element) {
            if (!this._events)
                this._events = [];
            var args = [].splice.call(arguments, 1, arguments.length - 1);

            var handler = {}, i = args.length;
            while (handler && typeof handler !== "function") {
                handler = args[--i];
            }

            args[i] = ej.proxy(args[i], this);

            this._events.push([element, args, handler, args[i]]);

            $.fn.on.apply(element, args);

            return this;
        },

        _off: function (element, eventName, selector, handlerObject) {
            var e = this._events, temp;
            if (!e || !e.length)
                return this;
            if (typeof selector == "function") {
                temp = handlerObject;
                handlerObject = selector;
                selector = temp;
            }
            var t = (eventName.match(/\S+/g) || [""]);
            for (var i = 0; i < e.length; i++) {
                var arg = e[i],
                r = arg[0].length && (!handlerObject || arg[2] === handlerObject) && (arg[1][0] === eventName || t[0]) && (!selector || arg[1][1] === selector) && $.inArray(element[0], arg[0]) > -1;
                if (r) {
                    $.fn.off.apply(element, handlerObject ? [eventName, selector, arg[3]] : [eventName, selector]);
                    e.splice(i, 1);
                    break;
                }
            }

            return this;
        },

        // Client side events wire-up / trigger helper.
        _trigger: function (eventName, eventProp) {
            var fn = null, returnValue, args, clientProp = {};
            $.extend(clientProp, eventProp)

            if (eventName in this.model)
                fn = this.model[eventName];

            if (fn) {
                if (typeof fn === "string") {
                    fn = ej.util.getObject(fn, window);
                }

                if ($.isFunction(fn)) {

                    args = ej.event(eventName, this.model, eventProp);

                    var scopeFn = this.model["_applyScope"];

                    returnValue = fn.call(this, args);

                    scopeFn && scopeFn.call();

                    // sending changes back - deep copy option should not be enabled for this $.extend 
                    if (eventProp) $.extend(eventProp, args);

                    if (args.cancel || !ej.isNullOrUndefined(returnValue))
                        return returnValue === false || args.cancel;
                }
            }

            var isPropDefined = Boolean(eventProp);
            eventProp = eventProp || {};
            eventProp.originalEventType = eventName;
            eventProp.type = this.pluginName + eventName;

            args = $.Event(eventProp.type, ej.event(eventProp.type, this.model, eventProp));

            this.element && this.element.trigger(args);

            // sending changes back - deep copy option should not be enabled for this $.extend 
            if (isPropDefined) $.extend(eventProp, args);

            if (ej.isOnWebForms && args.cancel == false && this.model.serverEvents && this.model.serverEvents.length)
                ej.raiseWebFormsServerEvents(eventName, eventProp, clientProp);

            return args.cancel;
        },

        setModel: function (options, forceSet) {
            // check for whether to apply values are not. if _setModel function is defined in child,
            //  this will call that function and validate it using return value

            if (this._trigger("modelChange", { "changes": options }))
                return;

            for (var prop in options) {
                if (!forceSet) {
                    if (this.model[prop] === options[prop]) {
                        delete options[prop];
                        continue;
                    }
                    if ($.isPlainObject(options[prop])) {
                        iterateAndRemoveProps(this.model[prop], options[prop]);
                        if ($.isEmptyObject(options[prop])) {
                            delete options[prop];
                            continue;
                        }
                    }
                }

                if (this.dataTypes) {
                    var returnValue = this._isValidModelValue(prop, this.dataTypes, options);
                    if (returnValue !== true)
                        throw "setModel - Invalid input for property :" + prop + " - " + returnValue;
                }
                if (this.model.notifyOnEachPropertyChanges && this.model[prop] !== options[prop]) {
                    var arg = {
                        oldValue: this.model[prop],
                        newValue: options[prop]
                    };

                    options[prop] = this._trigger(prop + "Change", arg) ? this.model[prop] : arg.newValue;
                }
            }
            if ($.isEmptyObject(options))
                return;

            if (this._setFirst) {
                var ds = options.dataSource;
                if (ds) delete options.dataSource;

                $.extend(true, this.model, options);
                if (ds) {
                    this.model.dataSource = (ds instanceof Array) ? ds.slice() : ds;
                    options["dataSource"] = this.model.dataSource;
                }
                !this._setModel || this._setModel(options);

            } else if (!this._setModel || this._setModel(options) !== false) {
                $.extend(true, this.model, options);
            }
            if ("enablePersistence" in options) {
                this._setState(options.enablePersistence);
            }
        },
        option: function (prop, value, forceSet) {
            if (!prop)
                return this.model;

            if ($.isPlainObject(prop))
                return this.setModel(prop, forceSet);

            if (typeof prop === "string") {
                prop = prop.replace(/^model\./, "");
                var oldValue = ej.getObject(prop, this.model);

                if (value === undefined && !forceSet)
                    return oldValue;

                if (prop === "enablePersistence")
                    return this._setState(value);

                if (forceSet && value === ej.extensions.modelGUID) {
                    return this._setModel(ej.createObject(prop, ej.getObject(prop, this.model), {}));
                }

                if (forceSet || ej.getObject(prop, this.model) !== value)
                    return this.setModel(ej.createObject(prop, value, {}), forceSet);
            }
            return undefined;
        },

        _isValidModelValue: function (prop, types, options) {
            var value = types[prop], option = options[prop], returnValue;

            if (!value)
                return true;

            if (typeof value === "string") {
                if (value == "enum") {
                    options[prop] = option ? option.toString().toLowerCase() : option;
                    value = "string";
                }

                if (value === "array") {
                    if (Object.prototype.toString.call(option) === '[object Array]')
                        return true;
                }
                else if (value === "data") {
                    return true;
                }
                else if (value === "parent") {
                    return true;
                }
                else if (typeof option === value)
                    return true;

                return "Expected type - " + value;
            }

            if (option instanceof Array) {
                for (var i = 0; i < option.length; i++) {
                    returnValue = this._isValidModelValue(prop, types, option[i]);
                    if (returnValue !== true) {
                        return " [" + i + "] - " + returnValue;
                    }
                }
                return true;
            }

            for (var innerProp in option) {
                returnValue = this._isValidModelValue(innerProp, value, option);
                if (returnValue !== true)
                    return innerProp + " : " + returnValue;
            }

            return true;
        },

        _returnFn: function (obj, propName) {
            if (propName.indexOf('.') != -1) {
                this._returnFn(obj[propName.split('.')[0]], propName.split('.').slice(1).join('.'));
            }
            else
                obj[propName] = obj[propName].call(obj.propName);
        },

        _removeCircularRef: function (obj) {
            var seen = [];
            function detect(obj, key, parent) {
                if (typeof obj != 'object') { return; }
                if (!Array.prototype.indexOf) {
                    Array.prototype.indexOf = function (val) {
                        return jQuery.inArray(val, this);
                    };
                }
                if (seen.indexOf(obj) >= 0) {
                    delete parent[key];
                    return;
                }
                seen.push(obj);
                for (var k in obj) { //dive on the object's children
                    if (obj.hasOwnProperty(k)) { detect(obj[k], k, obj); }
                }
                seen.pop();
                return;
            }
            detect(obj, 'obj', null);
            return obj;
        },

        stringify: function (model, removeCircular) {
            var observables = this.observables;
            for (var k = 0; k < observables.length; k++) {
                var val = ej.getObject(observables[k], model);
                if (!ej.isNullOrUndefined(val) && typeof (val) === "function")
                    this._returnFn(model, observables[k]);
            }
            if (removeCircular) model = this._removeCircularRef(model);
            return JSON.stringify(model);
        },

        _setState: function (val) {
            if (val === true) {
                this._persistHandler = ej.proxy(this.persistState, this);
                $(window).on("unload", this._persistHandler);
            } else {
                this.deleteState();
                $(window).off("unload", this._persistHandler);
            }
        },

        _removeProp: function (obj, propName) {
            if (!ej.isNullOrUndefined(obj)) {
                if (propName.indexOf('.') != -1) {
                    this._removeProp(obj[propName.split('.')[0]], propName.split('.').slice(1).join('.'));
                }
                else
                    delete obj[propName];
            }
        },

        persistState: function () {
            var model;

            if (this._ignoreOnPersist) {
                model = copyObject({}, this.model);
                for (var i = 0; i < this._ignoreOnPersist.length; i++) {
                    this._removeProp(model, this._ignoreOnPersist[i]);
                }
                model.ignoreOnPersist = this._ignoreOnPersist;
            } else if (this._addToPersist) {
                model = {};
                for (var i = 0; i < this._addToPersist.length; i++) {
                    ej.createObject(this._addToPersist[i], ej.getObject(this._addToPersist[i], this.model), model);
                }
                model.addToPersist = this._addToPersist;
            } else {
                model = copyObject({}, this.model);
            }

            if (this._persistState) {
                model.customPersists = {};
                this._persistState(model.customPersists);
            }

            if (window.localStorage) {
                if (!ej.isNullOrUndefined(ej.persistStateVersion) && window.localStorage.getItem("persistKey") == null)
                    window.localStorage.setItem("persistKey", ej.persistStateVersion);
                window.localStorage.setItem("$ej$" + this.pluginName + this._id, JSON.stringify(model));
            }
            else if (document.cookie) {
                if (!ej.isNullOrUndefined(ej.persistStateVersion) && ej.cookie.get("persistKey") == null)
                    ej.cookie.set("persistKey", ej.persistStateVersion);
                ej.cookie.set("$ej$" + this.pluginName + this._id, model);
            }
        },

        deleteState: function () {
            if (window.localStorage)
                window.localStorage.removeItem("$ej$" + this.pluginName + this._id);
            else if (document.cookie)
                ej.cookie.set("$ej$" + this.pluginName + this._id, model, new Date());
        },

        restoreState: function (silent) {
            var value = null;
            if (window.localStorage)
                value = window.localStorage.getItem("$ej$" + this.pluginName + this._id);
            else if (document.cookie)
                value = ej.cookie.get("$ej$" + this.pluginName + this._id);

            if (value) {
                var model = JSON.parse(value);

                if (this._restoreState) {
                    this._restoreState(model.customPersists);
                    delete model.customPersists;
                }

                if (ej.isNullOrUndefined(model) === false)
                    if (!ej.isNullOrUndefined(model.ignoreOnPersist)) {
                        this._ignoreOnPersist = model.ignoreOnPersist;
                        delete model.ignoreOnPersist;
                    } else if (!ej.isNullOrUndefined(model.addToPersist)) {
                        this._addToPersist = model.addToPersist;
                        delete model.addToPersist;
                    }
            }
            if (!ej.isNullOrUndefined(model) && !ej.isNullOrUndefined(this._ignoreOnPersist)) {
                for (var i in this._ignoreOnPersist) {
                    if (this._ignoreOnPersist[i].indexOf('.') !== -1)
                        ej.createObject(this._ignoreOnPersist[i], ej.getObject(this._ignoreOnPersist[i], this.model), model);
                    else
                        model[this._ignoreOnPersist[i]] = this.model[this._ignoreOnPersist[i]];
                }
                this.model = model;
            }
            else
                this.model = $.extend(true, this.model, model);

            if (!silent && value && this._setModel)
                this._setModel(this.model);
        },

        //to prevent persistence
        ignoreOnPersist: function (properties) {
            var collection = [];
            if (typeof (properties) == "object")
                collection = properties;
            else if (typeof (properties) == 'string')
                collection.push(properties);
            if (this._addToPersist === undefined) {
                this._ignoreOnPersist = this._ignoreOnPersist || [];
                for (var i = 0; i < collection.length; i++) {
                    this._ignoreOnPersist.push(collection[i]);
                }
            } else {
                for (var i = 0; i < collection.length; i++) {
                    var index = this._addToPersist.indexOf(collection[i]);
                    this._addToPersist.splice(index, 1);
                }
            }
        },

        //to maintain persistence
        addToPersist: function (properties) {
            var collection = [];
            if (typeof (properties) == "object")
                collection = properties;
            else if (typeof (properties) == 'string')
                collection.push(properties);
            if (this._addToPersist === undefined) {
                this._ignoreOnPersist = this._ignoreOnPersist || [];
                for (var i = 0; i < collection.length; i++) {
                    var index = this._ignoreOnPersist.indexOf(collection[i]);
                    this._ignoreOnPersist.splice(index, 1);
                }
            } else {
                for (var i = 0; i < collection.length; i++) {
                    if ($.inArray(collection[i], this._addToPersist) === -1)
                        this._addToPersist.push(collection[i]);
                }
            }
        },

        // Get formatted text 
        formatting: function (formatstring, str, locale) {
            formatstring = formatstring.replace(/%280/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
            locale = ej.preferredCulture(locale) ? locale : "en-US";
            var s = formatstring;
            var frontHtmlidx, FrontHtml, RearHtml, lastidxval;
            frontHtmlidx = formatstring.split("{0:");
            lastidxval = formatstring.split("}");
            FrontHtml = frontHtmlidx[0];
            RearHtml = lastidxval[1];
            if (typeof (str) == "string" && $.isNumeric(str))
                str = Number(str);
            if (formatstring.indexOf("{0:") != -1) {
                var toformat = new RegExp("\\{0(:([^\\}]+))?\\}", "gm");
                var formatVal = toformat.exec(formatstring);
                if (formatVal != null && str != null) {
                    if (FrontHtml != null && RearHtml != null)
                        str = FrontHtml + ej.format(str, formatVal[2], locale) + RearHtml;
                    else
                        str = ej.format(str, formatVal[2], locale);
                } else if (str != null)
                    str = str;
                else
                    str = "";
                return str;
            } else if (s.startsWith("{") && !s.startsWith("{0:")) {
                var fVal = s.split(""), str = (str || "") + "", strSplt = str.split(""), formats = /[0aA\*CN<>\?]/gm;
                for (var f = 0, f, val = 0; f < fVal.length; f++)
                    fVal[f] = formats.test(fVal[f]) ? "{" + val++ + "}" : fVal[f];
                return String.format.apply(String, [fVal.join("")].concat(strSplt)).replace('{', '').replace('}', '');
            } else if (this.data != null && this.data.Value == null) {
                $.each(this.data, function (dataIndex, dataValue) {
                    s = s.replace(new RegExp('\\{' + dataIndex + '\\}', 'gm'), dataValue);
                });
                return s;
            } else {
                return this.data.Value;
            }
        },
    };

    ej.WidgetBase = function () {
    }

    var iterateAndRemoveProps = function (source, target) {
        for (var prop in source) {
            if (source[prop] === target[prop])
                delete target[prop];
            if ($.isPlainObject(target[prop]) && $.isPlainObject(source[prop]))
                iterateAndRemoveProps(source[prop], target[prop]);
        }
    }

    ej.widget = function (pluginName, className, proto) {
        /// <summary>Widget helper for developers, this set have predefined function to jQuery plug-ins</summary>
        /// <param name="pluginName" type="String">the plugin name that will be added in jquery.fn</param>
        /// <param name="className" type="String">the class name for your plugin, this will help create default cssClas</param>
        /// <param name="proto" type="Object">prototype for of the plug-in</param>

        if (typeof pluginName === "object") {
            proto = className;
            for (var prop in pluginName) {
                var name = pluginName[prop];

                if (name instanceof Array) {
                    proto._rootCSS = name[1];
                    name = name[0];
                }

                ej.widget(prop, name, proto);

                if (pluginName[prop] instanceof Array)
                    proto._rootCSS = "";
            }

            return;
        }

        var nameSpace = proto._rootCSS || ej.getNameSpace(className);

        proto = ej.defineClass(className, function (element, options) {

            this.sfType = className;
            this.pluginName = pluginName;
            this.instance = pInstance;

            if (ej.isNullOrUndefined(this._setFirst))
                this._setFirst = true;

            this["ob.values"] = {};

            $.extend(this, ej.widgetBase);

            if (this.dataTypes) {
                for (var property in options) {
                    var returnValue = this._isValidModelValue(property, this.dataTypes, options);
                    if (returnValue !== true)
                        throw "setModel - Invalid input for property :" + property + " - " + returnValue;
                }
            }

            var arr = (element.data("ejWidgets") || []);
            arr.push(pluginName);
            element.data("ejWidgets", arr);

            for (var i = 0; ej.widget.observables && this.observables && i < this.observables.length; i++) {
                var t = ej.getObject(this.observables[i], options);
                if (t) ej.createObject(this.observables[i], ej.widget.observables.register(t, this.observables[i], this, element), options);
            }

            this.element = element.jquery ? element : $(element);
            this.model = copyObject(true, {}, proto.prototype.defaults, options);
            this.model.keyConfigs = copyObject(this.keyConfigs);

            this.element.addClass(nameSpace + " e-js").data(pluginName, this);

            this._id = element[0].id;

            if (this.model.enablePersistence) {
                if (window.localStorage && !ej.isNullOrUndefined(ej.persistStateVersion) && window.localStorage.getItem("persistKey") != ej.persistStateVersion) {
                    for (var i in window.localStorage) {
                        if (i.indexOf("$ej$") != -1)
                            window.localStorage.removeItem(i); //removing the previously stored plugin item from local storage				
                    }
                }
                else if (document.cookie && !ej.isNullOrUndefined(ej.persistStateVersion) && ej.cookie.get("persistKey") != ej.persistStateVersion) {
                    var splits = document.cookie.split(/; */);
                    for (var k in splits) {
                        if (k.indexOf("$ej$") != -1)
                            ej.cookie.set(k.split("=")[0], model, new Date()); //removing the previously stored plugin item from local storage		
                    }
                }
                this._persistHandler = ej.proxy(this.persistState, this);
                $(window).on("unload", this._persistHandler);
                this.restoreState(true);
            }

            this._init(options);

            if (typeof this.model.keyConfigs === "object" && !(this.model.keyConfigs instanceof Array)) {
                var requiresEvt = false;
                if (this.model.keyConfigs.focus)
                    this.element.attr("accesskey", this.model.keyConfigs.focus);

                for (var keyProps in this.model.keyConfigs) {
                    if (keyProps !== "focus") {
                        requiresEvt = true;
                        break;
                    }
                }

                if (requiresEvt && this._keyPressed) {
                    var el = element, evt = "keydown";

                    if (this.keySettings) {
                        el = this.keySettings.getElement ? this.keySettings.getElement() || el : el;
                        evt = this.keySettings.event || evt;
                    }

                    this._on(el, evt, function (e) {
                        if (!this.model.keyConfigs) return;

                        var action = keyFn.getActionFromCode(this.model.keyConfigs, e.which, e.ctrlKey, e.shiftKey, e.altKey);
                        var arg = {
                            code: e.which,
                            ctrl: e.ctrlKey,
                            alt: e.altKey,
                            shift: e.shiftKey
                        };
                        if (!action) return;

                        if (this._keyPressed(action, e.target, arg, e) === false)
                            e.preventDefault();
                    });
                }
            }
            this._trigger("create");
        }, proto);

        $.fn[pluginName] = function (options) {
            var opt = options, args;
            for (var i = 0; i < this.length; i++) {

                var $this = $(this[i]),
                    pluginObj = $this.data(pluginName),
                    isAlreadyExists = pluginObj && $this.hasClass(nameSpace),
                    obj = null;

                if (this.length > 0 && $.isPlainObject(opt))
                    options = ej.copyObject({}, opt);

                // ----- plug-in creation/init
                if (!isAlreadyExists) {
                    if (proto.prototype._requiresID === true && !$(this[i]).attr("id")) {
                        $this.attr("id", getUid("ejControl_"));
                    }
                    if (!options || typeof options === "object") {
                        if (proto.prototype.defaults && !ej.isNullOrUndefined(ej.setCulture) && "locale" in proto.prototype.defaults && pluginName != "ejChart") {
                            if (options && !("locale" in options)) options.locale = ej.setCulture().name;
                            else if (ej.isNullOrUndefined(options)) {
                                options = {}; options.locale = ej.setCulture().name;
                            }
                        }
                        new proto($this, options);
                    }
                    else {
                        throwError(pluginName + ": methods/properties can be accessed only after plugin creation");
                    }
                    continue;
                }

                if (!options) continue;

                args = [].slice.call(arguments, 1);

                if (this.length > 0 && args[0] && opt === "option" && $.isPlainObject(args[0])) {
                    args[0] = ej.copyObject({}, args[0]);
                }

                // --- Function/property set/access
                if ($.isPlainObject(options)) {
                    // setModel using JSON object
                    pluginObj.setModel(options);
                }

                    // function/property name starts with "_" is private so ignore it.
                else if (options.indexOf('_') !== 0
                    && !ej.isNullOrUndefined(obj = ej.getObject(options, pluginObj))
                    || options.indexOf("model.") === 0) {

                    if (!obj || !$.isFunction(obj)) {

                        // if property is accessed, then break the jquery chain
                        if (arguments.length == 1)
                            return obj;

                        //setModel using string input
                        pluginObj.option(options, arguments[1]);

                        continue;
                    }

                    var value = obj.apply(pluginObj, args);

                    // If function call returns any value, then break the jquery chain
                    if (value !== undefined)
                        return value;

                } else {
                    throwError(className + ": function/property - " + options + " does not exist");
                }
            }
            if (pluginName.indexOf("ejm") != -1)
                ej.widget.registerInstance($this, pluginName, className, proto.prototype);
            // maintaining jquery chain
            return this;
        };

        ej.widget.register(pluginName, className, proto.prototype);
        ej.loadLocale(pluginName);
    };

    ej.loadLocale = function (pluginName) {
        var i, len, locales = ej.locales;
        for (i = 0, len = locales.length; i < len; i++)
            $.fn["Locale_" + locales[i]](pluginName);
    };


    $.extend(ej.widget, (function () {
        var _widgets = {}, _registeredInstances = [],

        register = function (pluginName, className, prototype) {
            if (!ej.isNullOrUndefined(_widgets[pluginName]))
                throwError("ej.widget : The widget named " + pluginName + " is trying to register twice.");

            _widgets[pluginName] = { name: pluginName, className: className, proto: prototype };

            ej.widget.extensions && ej.widget.extensions.registerWidget(pluginName);
        },
        registerInstance = function (element, pluginName, className, prototype) {
            _registeredInstances.push({ element: element, pluginName: pluginName, className: className, proto: prototype });
        }

        return {
            register: register,
            registerInstance: registerInstance,
            registeredWidgets: _widgets,
            registeredInstances: _registeredInstances
        };

    })());

    ej.widget.destroyAll = function (elements) {
        if (!elements || !elements.length) return;

        for (var i = 0; i < elements.length; i++) {
            var data = elements.eq(i).data(), wds = data["ejWidgets"];
            if (wds && wds.length) {
                for (var j = 0; j < wds.length; j++) {
                    if (data[wds[j]] && data[wds[j]].destroy)
                        data[wds[j]].destroy();
                }
            }
        }
    };

    ej.cookie = {
        get: function (name) {
            var value = RegExp(name + "=([^;]+)").exec(document.cookie);

            if (value && value.length > 1)
                return value[1];

            return undefined;
        },
        set: function (name, value, expiryDate) {
            if (typeof value === "object")
                value = JSON.stringify(value);

            value = escape(value) + ((expiryDate == null) ? "" : "; expires=" + expiryDate.toUTCString());
            document.cookie = name + "=" + value;
        }
    };

    var keyFn = {
        getActionFromCode: function (keyConfigs, keyCode, isCtrl, isShift, isAlt) {
            isCtrl = isCtrl || false;
            isShift = isShift || false;
            isAlt = isAlt || false;

            for (var keys in keyConfigs) {
                if (keys === "focus") continue;

                var key = keyFn.getKeyObject(keyConfigs[keys]);
                for (var i = 0; i < key.length; i++) {
                    if (keyCode === key[i].code && isCtrl == key[i].isCtrl && isShift == key[i].isShift && isAlt == key[i].isAlt)
                        return keys;
                }
            }
            return null;
        },
        getKeyObject: function (key) {
            var res = {
                isCtrl: false,
                isShift: false,
                isAlt: false
            };
            var tempRes = $.extend(true, {}, res);
            var $key = key.split(","), $res = [];
            for (var i = 0; i < $key.length; i++) {
                var rslt = null;
                if ($key[i].indexOf("+") != -1) {
                    var k = $key[i].split("+");
                    for (var j = 0; j < k.length; j++) {
                        rslt = keyFn.getResult($.trim(k[j]), res);
                    }
                }
                else {
                    rslt = keyFn.getResult($.trim($key[i]), $.extend(true, {}, tempRes));
                }
                $res.push(rslt);
            }
            return $res;
        },
        getResult: function (key, res) {
            if (key === "ctrl")
                res.isCtrl = true;
            else if (key === "shift")
                res.isShift = true;
            else if (key === "alt")
                res.isAlt = true;
            else res.code = parseInt(key, 10);
            return res;
        }
    };

    ej.getScrollableParents = function (element) {
        return $(element).parentsUntil("html").filter(function () {
            return $(this).css("overflow") != "visible";
        }).add($(window));
    }
    ej.browserInfo = function () {
        var browser = {}, clientInfo = [],
        browserClients = {
            opera: /(opera|opr)(?:.*version|)[ \/]([\w.]+)/i, edge: /(edge)(?:.*version|)[ \/]([\w.]+)/i, webkit: /(chrome)[ \/]([\w.]+)/i, safari: /(webkit)[ \/]([\w.]+)/i, msie: /(msie|trident) ([\w.]+)/i, mozilla: /(mozilla)(?:.*? rv:([\w.]+)|)/i
        };
        for (var client in browserClients) {
            if (browserClients.hasOwnProperty(client)) {
                clientInfo = navigator.userAgent.match(browserClients[client]);
                if (clientInfo) {
                    browser.name = clientInfo[1].toLowerCase() == "opr" ? "opera" : clientInfo[1].toLowerCase();
                    browser.version = clientInfo[2];
                    browser.culture = {};
                    browser.culture.name = browser.culture.language = navigator.language || navigator.userLanguage;
                    if (typeof (ej.globalize) != 'undefined') {
                        var oldCulture = ej.preferredCulture().name;
                        var culture = (navigator.language || navigator.userLanguage) ? ej.preferredCulture(navigator.language || navigator.userLanguage) : ej.preferredCulture("en-US");
                        for (var i = 0; (navigator.languages) && i < navigator.languages.length; i++) {
                            culture = ej.preferredCulture(navigator.languages[i]);
                            if (culture.language == navigator.languages[i])
                                break;
                        }
                        ej.preferredCulture(oldCulture);
                        $.extend(true, browser.culture, culture);
                    }
                    if (!!navigator.userAgent.match(/Trident\/7\./)) {
                        browser.name = "msie";
                    }
                    break;
                }
            }
        }
        browser.isMSPointerEnabled = (browser.name == 'msie') && browser.version > 9 && window.navigator.msPointerEnabled;
        browser.pointerEnabled = window.navigator.pointerEnabled;
        return browser;
    };
    ej.eventType = {
        mouseDown: "mousedown touchstart",
        mouseMove: "mousemove touchmove",
        mouseUp: "mouseup touchend",
        mouseLeave: "mouseleave touchcancel",
        click: "click touchend"
    };

    ej.event = function (type, data, eventProp) {

        var e = $.extend(eventProp || {},
            {
                "type": type,
                "model": data,
                "cancel": false
            });

        return e;
    };

    ej.proxy = function (fn, context, arg) {
        if (!fn || typeof fn !== "function")
            return null;

        if ('on' in fn && context)
            return arg ? fn.on(context, arg) : fn.on(context);

        return function () {
            var args = arg ? [arg] : []; args.push.apply(args, arguments);
            return fn.apply(context || this, args);
        };
    };

    ej.hasStyle = function (prop) {
        var style = document.documentElement.style;

        if (prop in style) return true;

        var prefixs = ['ms', 'Moz', 'Webkit', 'O', 'Khtml'];

        prop = prop[0].toUpperCase() + prop.slice(1);

        for (var i = 0; i < prefixs.length; i++) {
            if (prefixs[i] + prop in style)
                return true;
        }

        return false;
    };

    Array.prototype.indexOf = Array.prototype.indexOf || function (searchElement) {
        var len = this.length;

        if (len === 0) return -1;

        for (var i = 0; i < len; i++) {
            if (i in this && this[i] === searchElement)
                return i;
        }
        return -1;
    };

    String.prototype.startsWith = String.prototype.startsWith || function (key) {
        return this.slice(0, key.length) === key;
    };
    var copyObject = ej.copyObject = function (isDeepCopy, target) {
        var start = 2, current, source;
        if (typeof isDeepCopy !== "boolean") {
            start = 1;
        }
        var objects = [].slice.call(arguments, start);
        if (start === 1) {
            target = isDeepCopy;
            isDeepCopy = undefined;
        }

        for (var i = 0; i < objects.length; i++) {
            for (var prop in objects[i]) {
                current = target[prop], source = objects[i][prop];

                if (source === undefined || current === source || objects[i] === source || target === source)
                    continue;
                if (source instanceof Array) {
                    if (i === 0 && isDeepCopy) {
                        target[prop] = new Array();
                        for (var j = 0; j < source.length; j++) {
                            copyObject(true, target[prop], source);
                        }
                    }
                    else
                        target[prop] = source.slice();
                }
                else if (ej.isPlainObject(source)) {
                    target[prop] = current || {};
                    if (isDeepCopy)
                        copyObject(isDeepCopy, target[prop], source);
                    else
                        copyObject(target[prop], source);
                } else
                    target[prop] = source;
            }
        }
        return target;
    };
    var pInstance = function () {
        return this;
    }

    var _uid = 0;
    var getUid = function (prefix) {
        return prefix + _uid++;
    }

    ej.template = {};

    ej.template.render = ej.template["text/x-jsrender"] = function (self, selector, data, index, prop) {
        if (selector.slice(0, 1) !== "#")
            selector = ["<div>", selector, "</div>"].join("");
        var property = { prop: prop, index: index };
        return $(selector).render(data, property);
    }

    ej.isPlainObject = function (obj) {
        if (!obj) return false;
        if (ej.DataManager !== undefined && obj instanceof ej.DataManager) return false;
        if (typeof obj !== "object" || obj.nodeType || jQuery.isWindow(obj)) return false;
        try {
            if (obj.constructor &&
                !obj.constructor.prototype.hasOwnProperty("isPrototypeOf")) {
                return false;
            }
        } catch (e) {
            return false;
        }

        var key, ownLast = ej.support.isOwnLast;
        for (key in obj) {
            if (ownLast) break;
        }

        return key === undefined || obj.hasOwnProperty(key);
    };
    var getValueFn = false;
    ej.util.valueFunction = function (prop) {
        return function (value, getObservable) {
            var val = ej.getObject(prop, this.model);

            if (getValueFn === false)
                getValueFn = ej.getObject("observables.getValue", ej.widget);

            if (value === undefined) {
                if (!ej.isNullOrUndefined(getValueFn)) {
                    return getValueFn(val, getObservable);
                }
                return typeof val === "function" ? val.call(this) : val;
            }

            if (typeof val === "function") {
                this["ob.values"][prop] = value;
                val.call(this, value);
            }
            else
                ej.createObject(prop, value, this.model);
        }
    };
    ej.util.getVal = function (val) {
        if (typeof val === "function")
            return val();
        return val;
    };
    ej.support = {
        isOwnLast: function () {
            var fn = function () { this.a = 1; };
            fn.prototype.b = 1;

            for (var p in new fn()) {
                return p === "b";
            }
        }(),
        outerHTML: function () {
            return document.createElement("div").outerHTML !== undefined;
        }()
    };

    var throwError = ej.throwError = function (er) {
        try {
            throw new Error(er);
        } catch (e) {
            throw e.message + "\n" + e.stack;
        }
    };

    ej.getRandomValue = function (min, max) {
        if (min === undefined || max === undefined)
            return ej.throwError("Min and Max values are required for generating a random number");

        var rand;
        if ("crypto" in window && "getRandomValues" in crypto) {
            var arr = new Uint16Array(1);
            window.crypto.getRandomValues(arr);
            rand = arr[0] % (max - min) + min;
        }
        else rand = Math.random() * (max - min) + min;
        return rand | 0;
    }

    ej.extensions = {};
    ej.extensions.modelGUID = "{0B1051BA-1CCB-42C2-A3B5-635389B92A50}";
})(window.jQuery, window.Syncfusion);
(function () {
    $.fn.addEleAttrs = function (json) {
        var $this = $(this);
        $.each(json, function (i, attr) {
            if (attr && attr.specified) {
                $this.attr(attr.name, attr.value);
            }
        });

    };
    $.fn.removeEleAttrs = function (regex) {
        return this.each(function () {
            var $this = $(this),
                names = [],
                attrs = $(this.attributes).clone();
            $.each(attrs, function (i, attr) {
                if (attr && attr.specified && regex.test(attr.name)) {
                    $this.removeAttr(attr.name);
                }
            });
        });
    };
    $.fn.attrNotStartsWith = function (regex) {
        var proxy = this;
        var attributes = [], attrs;
        this.each(function () {
            attrs = $(this.attributes).clone();
        });
        for (i = 0; i < attrs.length; i++) {
            if (attrs[i] && attrs[i].specified && regex.test(attrs[i].name)) {
                continue
            }
            else
                attributes.push(attrs[i])
        }
        return attributes;

    }
    $.fn.removeEleEmptyAttrs = function () {
        return this.each(function () {
            var $this = $(this),
                names = [],
                attrs = $(this.attributes).clone();
            $.each(attrs, function (i, attr) {
                if (attr && attr.specified && attr.value === "") {
                    $this.removeAttr(attr.name);
                }
            });
        });
    };
    $.extend($.support, {
        has3d: ej.addPrefix('perspective') in ej.styles,
        hasTouch: 'ontouchstart' in window,
        hasPointer: navigator.msPointerEnabled,
        hasTransform: ej.userAgent() !== false,
        pushstate: "pushState" in history &&
        "replaceState" in history,
        hasTransition: ej.addPrefix('transition') in ej.styles
    });
    //Ensuring elements having attribute starts with 'ejm-' 
    $.extend($.expr[':'], {
        attrNotStartsWith: function (element, index, match) {
            var i, attrs = element.attributes;
            for (i = 0; i < attrs.length; i++) {
                if (attrs[i].nodeName.indexOf(match[3]) === 0) {
                    return false;
                }
            }
            return true;
        }
    });
    //addBack() is supported from Jquery >1.8 and andSelf() supports later version< 1.8. support for both the method is provided by extending the JQuery function.
    var oldSelf = $.fn.andSelf || $.fn.addBack;
    $.fn.andSelf = $.fn.addBack = function () {
        return oldSelf.apply(this, arguments);
    };
})();;
;
/**
* @fileOverview Plugin to style the Html Button elements
* @copyright Copyright Syncfusion Inc. 2001 - 2013. All rights reserved.
*  Use of this code is subject to the terms of our license.
*  A copy of the current license can be obtained at any time by e-mailing
*  licensing@syncfusion.com. Any infringement will be prosecuted under
*  applicable laws. 
* @version 12.1 
* @author <a href="mailto:licensing@syncfusion.com">Syncfusion Inc</a>
*/

(function ($, ej, undefined) {
	 
    var initialLinearDivWidth, _linearGaugeCount, initialGaugeCount;
    ej.widget({ "ejLinearGauge": "ej.datavisualization.LinearGauge"}, {
       
        element: null,
        _rootCSS: "e-lineargauge",
        _animationFlag: true,
        
        model: null,
        _customLblMaxSize: 0,
        _savedPoints: [],
        validTags: ["div", "span"],

       
        defaults:  {
		
			locale: null,
			
			enableGroupSeparator: false,
			  	
            value: 0,
			  
            minimum: 0,
			  
            maximum: 100,
			  
            width: 150,
			  
            height: 400,
			  
            theme: "flatlight",
			  
            orientation: "Vertical",
			  
            pointerGradient1: null,
			  
            pointerGradient2: null,
			  
            backgroundColor: null,
			  
            borderColor: null,
			  
            labelColor: null,
			  
            tickColor: null,
			  
            readOnly: true,
			  
            enableResize: false,
              
            isResponsive: false,
              
            tooltip: {
                  
                showLabelTooltip: false,
                  
                showCustomLabelTooltip: false,
                  
                    templateID: null,
            },
              
            outerCustomLabelPosition: "bottom",
              
			frame: {
			      
			    backgroundImageUrl: null,
			      
			    outerWidth: 12,
			      
                innerWidth:8
			},
			  
            scales: null,
			  
            enableAnimation: true,
              
            enableMarkerPointerAnimation: true,
			  
            animationSpeed: 500,
			  
            drawTicks: null,
			  
            drawLabels: null,
			  
            drawBarPointers: null,
			  
            drawMarkerPointers: null,
			  
            drawRange: null,
			  
            drawCustomLabel: null,
			  
            drawIndicators: null,
			  
            load: null,
			  
            init: null,
			  
            renderComplete: null,
              
            mouseClick: null,
              
            mouseClickMove: null,
              
            mouseClickUp: null,
			themeProperties:{
			flatlight: {
            scales: {
                backgroundColor: "#FFFFFF",
                border: { color: "#1d1e1e" },
                barPointers: {
                    backgroundColor: "#8abc3b",
                    border: { color: "#8abc3b" }
                },
                markerPointers: {
                    backgroundColor: "#212121",
                    border: { color: "#212121" }
                },
                ticks: {
                    color: "#1d1e1e"
                },
                labels: {
                    labelColor: "#222222"
                }
            }
        },
		  
        flatdark: {
            scales: {
                backgroundColor: "#808080",
                border: { color: "#808080" },
                barPointers: {
                    backgroundColor: "#8abc3b",
                    border: { color: "#8abc3b" }
                },
                markerPointers: {
                    backgroundColor: "#CCCCCC",
                    border: { color: "#CCCCCC" }
                },
                ticks: {
                    color: "#808080"
                },
                labels: {
                    labelColor: "#CCCCCC"
                }
            }
        }
			
			}
        },
				  	
        _defaultScaleValues: function () {
            return {
				  	
                minimum: null,
				  	
                maximum: null,
				  	
                majorIntervalValue: 10,
				  	
                minorIntervalValue: 2,
				  	
                direction: "counterclockwise",
				  	
                backgroundColor: null,
				  	
                border: {
                      
                    color: null,
                      
                    width:1.5
                },
				  	
                opacity: NaN,
				  	
                width: 30,
				  	
                shadowOffset: 0,
				  	
                length: 290,
				  	
                type: "rectangle",
				  	
                position: { 
				  	
				x: 50, 
				  	
				y: 50 },
				  	
                showRanges: false,
				  	
                showIndicators: false,
				  	
                showCustomLabels: false,
				  	
                showLabels: true,
				  	
                showTicks: true,
				  	
                showBarPointers: true,
				  	
                showMarkerPointers: true,
				  	
                ticks: [{
                                          
                    distanceFromScale: {
                          
                        x: 0,
                          
                        y:0
                    },
					  	
                    angle: 0,
					  	
                    color: null,
					  	
                    type: "majorinterval",
					  	
                    placement: "near",
					  	
                    opacity: 0,
					  	
                    height: 10,
					  	
                    width: 3
                },
                {              
                    distanceFromScale: {
                        x: 0,
                        y:0
                    },
                    angle: 0,
                    color: null,
                    type: "minorinterval",
                    placement: "near",
                    opacity: 0,
                    height: 5,
                    width: 2
                }],
                  
                ranges: [{
                      
                    endWidth: 10,
                      
                    placement: "center",
					  
                    startWidth: 10,
					  
                    distanceFromScale: 0,
					  
                    endValue: 60,
					  
                    startValue: 20,
					  
                    gradients: null,
					  
                    backgroundColor: null,
					  
                    border: {
                          
                        color: null,
                          
                        width:1.5
                    },
					  
                    opacity: null
                }],
					  
                labels: [{
                      
                    distanceFromScale: {
                            
                        x: -10,
                            
                        y:0
                    },
                      
                    angle: 0,
					  
                    font: { 
					  
					size: "11px", 
					  
					fontFamily: "Arial", 
					  
					fontStyle: "bold" },
					  
                    textColor: null,
					  
                    opacity: 0,
					  
                    type: "major",
					  
                    placement: "near",
					  
                    includeFirstValue: true,
					  
					unitText: "",
					  
					unitTextPlacement: "back"  
                }],
				      
                markerPointers: [{
					  
                    type: "triangle",
					  
                    length: 30,
					  
                    placement: "far",
					  
                    gradients: null,
					  
                    distanceFromScale: 0,
					  
                    width: 30,
					  
                    value: null,
					  
                    backgroundColor: null,
					  
                    border: {
                          
                        color: null,
                          
                        width:1.5
                    },
					  
                    opacity: 1
                }],
					  
                barPointers: [{
				      
                    gradients: null,
					  
                    distanceFromScale: 0,
					  
                    width: 30,
					  
                    value: null,
					  
                    backgroundColor: null,
                      
                    border: {
                          
                        color: null,
                          
                        width:1.5
                    },
					  
                    opacity: 1
                }],
					  	
                indicators: [{
					  
                    font: { 
					  
					size: "11px", 
					  
					fontFamily: "Arial",
					  					
					fontStyle: "bold" },
					  					
                    height: 30,
					  	
                    type: "rectangle",
					  	
                    width: 30,
						  	
                    position: { 
					  	
					x: 0, 
					  	
					y: 0 },
					  	
                    textLocation: { 
					  	
					x: 0, 
					  	
					y: 0 },
					  
                    stateRanges: [{
					  
                    endValue: 60,
					  
                    startValue: 50,
					  
                    backgroundColor: null,
					  
                    borderColor: null,
					  
                    text: "",
					  
                        textColor: null
                    }],
					  
                    backgroundColor: null,
                                          
                    border: {
                          
                        color: null,
                          
                        width:1.5
                    },
					  
                    opacity: NaN
                }],
					  
                customLabels: [{
					  
                    font: { 
					  
					size: "11px", 
					  
					fontFamily: "Arial", 
					  
					fontStyle: "bold" },
					  
                    color: null,
					  
                    opacity: 0,
					  
                    value: "",
					  
                    textAngle: 0,
					  
                    position: { 
					  
					x: 0, 
					  
					y: 0 },
                      
                    positionType:"inner"
                }]
            };
        },

        dataTypes: {
            scales: "data",
            isResponsive: "boolean",
        },
        observables: ["value", "minimum", "maximum"],
        _tags: [{
            tag: "scales",
            attr: ["majorIntervalValue", "minorIntervalValue", "backgroundColor", "shadowOffset", "showRanges", "showIndicators", "showCustomLabels", "showLabels", "showTicks", "showBarPointers", "showMarkerPointers", "border.color", "border.width", "position.x", "position.y",
                [{
                    tag: "markerPointers", attr: ["distanceFromScale", "backgroundColor", "border.width", "border.color"]
                }, {
                    tag: "barPointers", attr: ["distanceFromScale", "backgroundColor", "border.width", "border.color"]
                }, {
                    tag: "ranges", attr: ["distanceFromScale", "startValue", "endValue", "startWidth", "endWidth", "backgroundColor", "border.color", "border.width"]
                }, {
                    tag: "ticks", attr: ["distanceFromScale.x", "distanceFromScale.y"]
                }, {
                    tag: "indicators", attr: ["backgroundColor", "textLocation", "font.size", "font.fontFamily", "font.fontStyle", "position.x", "position.y", "textLocation.x", "textLocation.y", "borderColor", "textColor",
                        [{
                            tag: "stateRanges", attr: ["endValue", "startValue", "backgroundColor", "borderColor", "textColor"]
                        }]
                    ]
                }, {
                    tag: "labels", attr: ["distanceFromScale.x", "distanceFromScale.y", "textColor", "includeFirstValue", "unitText", "unitTextPlacement", "font.size", "font.fontFamily", "font.fontStyle"]
                }, {
                    tag: "customLabels", attr: ["textAngle", "font.size", "font.fontFamily", "font.fontStyle", "position.x", "position.y"]
                }]
            ]
        }],
        value: ej.util.valueFunction("value"),
        minimum: ej.util.valueFunction("minimum"),
        maximum: ej.util.valueFunction("maximum"),

          
		  	 
        _init: function () {
            _linearGaugeCount = $(".e-lineargauge").length;
            initialGaugeCount = _linearGaugeCount;
            this._initialize();
            this._trigger("load");
            this._setTheme();
            this._render();
            this.wireEvents();
			this._onWindowResize();
        },
		  	
		_onWindowResize:function()
        {
            if (this.model.enableResize || this.model.isResponsive) {
                if (!ej.isTouchDevice())
                    this._on($(window), "resize", this.resizeCanvas);
                else
                    this._on($(window), "orientationchange", this.resizeCanvas);
            }
        },
		  	 
        _setModel: function (options) {
            var option;
            for (option in options) {
                switch (option) {
                    case "theme": this.model.theme = options[option]; this._init(); break;
                    case "height": this.model.height = options[option]; break;
                    case "width": this.model.width = options[option]; break;
                    case "orientation": this.model.orientation = options[option]; break;
                    case "pointerGradient1": this.model.pointerGradient1 = options[option]; break;
                    case "pointerGradient2": this.model.pointerGradient2 = options[option]; break;
                    case "labelColor": this.model.labelColor = options[option]; break;
                    case "tick": $.extend(this.model.tick,options[option]); break;
                    case "backgroundColor": this.model.backgroundColor = options[option]; break;
                    case "borderColor": this.model.borderColor = options[option]; break;
                    case "frame": $.extend(this.model.frame, options[option]);
                    case "outerCustomLabelPosition": this.model.outerCustomLabelPosition = options[option]; break;
                    case "tooltip": $.extend(this.model.tooltip, options[option]); break;
                    case "readOnly": this.model.readOnly = options[option]; break;
                    case "value":
                        (this.value() == "") && this.value(0);
                        for (var i = 0; this.model.scales[i] != null; i++) {
                            for (var j = 0; this.model.scales[i].markerPointers[j] != null; j++) {
                                this.model.scales[i].markerPointers[j].value = parseFloat(this.value());
                            }
                        }
                        for (var k = 0; this.model.scales[k] != null; k++) {
                            for (var l = 0; this.model.scales[k].barPointers[l] != null; l++) {
                                this.model.scales[k].barPointers[l].value = parseFloat(this.value());
                            }
                        }
                        break;
                    case "minimum":
                        (this.minimum() == "") && this.minimum(0);
                        for (var m = 0; this.model.scales[m] != null; m++) {
                            this.model.scales[m].minimum = parseInt(this.minimum());
                        }
                        break;
                    case "maximum":
                        (this.maximum() == "") && this.maximum(0);
                        for (var n = 0; this.model.scales[n] != null; n++) {
                            this.model.scales[n].maximum = parseInt(this.maximum());
                        }
                        break;
                    case "scales":
                        this.model.scales = options[option];
                        this._itemInitialize();
                        break;
                }
            }
            this._render();
            this.wireEvents();
        },
          	       	 
        _destroy: function () {
            this.activeElement = null;
            this.canvasEl = null;
            this.contextEl = null;
            this.unWireEvents();
            this.element.empty().removeClass("e-lineargauge e-js e-widget");
        },
		  	
        _initialize: function () {
            this.GaugeEl = this.element;
            this.scaleStartX = [];
            this.scaleStartY = [];
            this.isScaleModified = false;
            this.target = this.element[0];
            this._itemInitialize();
            this.Model = this.model;
        },
		  
        _render: function () {
            this.initialize();
            this.wireEvents();
        },
		  
        _itemInitialize: function () {
            var proxy = this;
            if (this.model.scales != null) {
                $.each(this.model.scales, function (index, element) {
                    element = proxy._checkArrayObject(element, index);
                    var obj = proxy._defaultScaleValues();
                    $.extend(obj, element);
                    $.extend(element, obj);
                });
            }
            else {
                this.model.scales = [this._defaultScaleValues()];
            }
        },
		  	
         _checkArrayObject: function (element, initialName) {
            var proxy = this;
			var type;
            $.each(element, function (name, innerElement) {
			 type = typeof name;	 
			if((type!="string" ||( type=="string" && name.indexOf('_') == -1 && name.indexOf('__') == -1)) && typeof innerElement !="function"){
                if (innerElement instanceof Array  ) {
                    proxy._checkArrayObject(innerElement, name);
                }			 
                else if (innerElement != null && typeof innerElement == "object" && !innerElement.setter && !innerElement.factory && !innerElement.key) {
                    var allObjects = proxy._defaultScaleValues();
                    proxy._LoadIndividualDefaultValues(innerElement, allObjects, (typeof name === "number") ? initialName : name);
                }
				}	
               				
            });
            return element;
        },
	 	
        _LoadIndividualDefaultValues: function (obj, allObjects, name) {		    
            var defaultObj = null;
            var proxy = this;
            var type;
            $.each(allObjects, function (n, element) {
                if (name == n) {
                    defaultObj = element;
                    return;
                }
            });
            if (defaultObj instanceof Array) defaultObj = defaultObj[0];
               type = typeof name;	
            $.each(obj, function (objName, ele) {
                if (ele instanceof Array) {
                    proxy._checkArrayObject(ele, name);
                }
                else if (ele != null && typeof ele == "object" && (type!="string" ||( type=="string" && name.indexOf('_') == -1 && name.indexOf('__') == -1)) ) {
                    proxy._LoadIndividualDefaultValues(ele, defaultObj, (typeof objName === "number") ? name : objName);
                }
            });

            $.extend(defaultObj, obj);
            $.extend(obj, defaultObj);
            return obj;
			 
        },
		  
        initialize: function () {
            this._initObject(this);

            if (this.Model.frame.backgroundImageUrl)
                this._drawCustomImage(this, this.Model.frame.backgroundImageUrl);
            else {
                if (this.Model.scales != null)
                    this._drawScales();
            }
        },
		  
        _initObject: function (element) {
            this._savedPoints = [];
            this.element.addClass("e-widget");
            element.GaugeEl = element.element;
            if (element.canvasEl) {
                element.canvasEl.parent().empty();
                element.GaugeEl.empty();
            }
            element.canvasEl = $("<canvas></canvas>");
            var outerLabelCount = 0;
            for (var i = 0; this.model.scales[i] != null; i++) {
                if (this.model.scales[i].minimum == null)
                    this.model.scales[i].minimum = this.minimum();
                if (this.model.scales[i].maximum == null)
                    this.model.scales[i].maximum = this.maximum();
                for (var j = 0; this.model.scales[i].markerPointers[j] != null; j++) {
                    if (this.model.scales[i].markerPointers[j].value == null)
                        this.model.scales[i].markerPointers[j].value = this.value();
                }
                for (var l = 0; this.model.scales[i].barPointers[l] != null; l++) {
                    if (this.model.scales[i].barPointers[l].value == null)
                        this.model.scales[i].barPointers[l].value = this.value();
                }
                for (var k = 0; this.model.scales[i].customLabels[k] != null && this.model.scales[i].showCustomLabels == true; k++) {
                    outerLabelCount++;
                    if (this.model.scales[i].customLabels[k].value != null && element.GaugeEl.find('div').length == 0) {
                        if (this.model.scales[i].customLabels[k] != null && this.model.scales[i].customLabels[k].positionType != null && this.model.scales[i].customLabels[k].positionType == "outer") {
                            element.outerDiv = ej.buildTag("div");
                            if (element.model.outerCustomLabelPosition == "bottom") {
                                element.GaugeEl.append(element.canvasEl);
                                element.GaugeEl.append(element.outerDiv);
                                element.outerDiv.css('text-align', 'center');
                                element.GaugeEl.css({ 'width': element.model.width });
                            }
                            else {
                                if (element.model.outerCustomLabelPosition != "top") {
                                    var table = ej.buildTag("TABLE");
                                    table.css('width', '100%');
                                    var tr = ej.buildTag("TR");
                                    var td1 = ej.buildTag("TD");
                                    var td2 = ej.buildTag("td");
                                    if (element.model.outerCustomLabelPosition == "left") {
                                        td1.append(element.outerDiv);
                                        td2.append(element.canvasEl);
                                    }
                                    else {
                                        td1.append(element.canvasEl);
                                        td2.append(element.outerDiv);
                                    }
                                    tr.append(td1);
                                    tr.append(td2);
                                    table.append(tr);
                                    element.GaugeEl.append(table);
                                    element.outerDiv.css({
                                        'width': this.element.width() - element.model.width
                                    });
                                }
                                else {
                                    element.GaugeEl.append(element.outerDiv);
                                    element.GaugeEl.append(element.canvasEl);
                                    element.GaugeEl.css({ 'width': element.model.width });
                                    element.outerDiv.css('text-align', 'center');
                                }
                            }
                        }
                        else
                            element.GaugeEl.append(element.canvasEl);
                    }
                }
                if (outerLabelCount == 0)
                    element.GaugeEl.append(element.canvasEl);
            }
            element.canvasEl.attr("role", "presentation");
            if (_linearGaugeCount == initialGaugeCount) {
                initialLinearDivWidth = window.innerWidth;
            }
            element.canvasEl[0].setAttribute("width", element.model.width);
            element.canvasEl[0].setAttribute("height", element.model.height);
            element.centerX = element.canvasEl[0].width / 2;
            element.centerY = element.canvasEl[0].height / 2;
            var elem = element.canvasEl[0];
            if (typeof window.G_vmlCanvasManager != "undefined") {
                elem = window.G_vmlCanvasManager.initElement(elem);
            }
            if (!elem || !elem.getContext) {
                return;
            }
            element.contextEl = element.canvasEl[0].getContext("2d");
        },
		  
        _drawFrameCircle: function (location, style, element) {
            this._contextOpenPath(style, element);
            element.contextEl.arc(location.startX, location.startY, style.circleRadius, 0, 2 * Math.PI, true);
            this._contextClosePath(style, element);
            if (style.indicatorText)
                element._drawText(location, style);
        },
		  
        _drawFrameRectangle: function (location, style, element) {
            this._contextOpenPath(style, element);
            element.contextEl.lineTo(location.startX + style.radius, location.startY);
            element.contextEl.lineTo(location.startX + style.width - style.radius, location.startY);
            element.contextEl.lineTo(location.startX + style.width, location.startY + style.height - style.radius);
            element.contextEl.lineTo(location.startX + style.radius, location.startY + style.height);
            this._contextClosePath(style, element);
            if (style.indicatorText)
                element._drawText(location, style);
        },
		  
        _drawFrameThermometer: function (location, style, element) {
            var radius = element.Model.orientation == "Vertical" ? Math.sqrt(style.width * style.width + style.width * style.width) / 2 : Math.sqrt(style.height * style.height + style.height * style.height) / 2;   
            this._contextOpenPath(style, element);
            if (element.Model.orientation == "Vertical") {
                if (element.scaleEl[element.scaleIndex].direction == "counterclockwise") {
                    element.contextEl.arc(location.startX + Math.cos(Math.PI * (45 / 180)) * radius,
                                       location.startY + style.height - Math.sin(Math.PI * (45 / 180)) * radius,
                                       radius, Math.PI * (-45 / 180), Math.PI * (225 / 180), false);
                    element.contextEl.lineTo(location.startX, location.startY + style.calDistance + style.width / 2);
                    if (style.topRounded)
                        element.contextEl.arc(location.startX + style.width / 2, location.startY + style.width / 2, style.width / 2, -Math.PI, 0, false);
                    else
                        element.contextEl.lineTo(location.startX + style.width, location.startY + style.calDistance + style.width / 2);
                }
                else {
                    element.contextEl.arc(location.startX + Math.cos(Math.PI * (45 / 180)) * radius,
                                       location.startY + Math.sin(Math.PI * (45 / 180)) * radius,
                                       radius, Math.PI * (45 / 180), Math.PI * (-225 / 180), true);
                    element.contextEl.lineTo(location.startX, location.startY + style.height - style.width / 2);
                    if (style.topRounded)
                        element.contextEl.arc(location.startX + style.width / 2, location.startY + style.height - style.width / 2, style.width / 2, -Math.PI, 0, true);
                    else
                        element.contextEl.lineTo(location.startX + style.width, location.startY + style.height - style.width / 2);
                }
            }
            else {
                if (element.scaleEl[element.scaleIndex].direction == "counterclockwise") {
                    element.contextEl.arc(location.startX + style.width - radius / 4 - Math.cos(Math.PI * (45 / 180)) * radius,
                               location.startY + Math.sin(Math.PI * (45 / 180)) * radius,
                               radius, Math.PI * (135 / 180), Math.PI * (225 / 180), true);
                    element.contextEl.lineTo(location.startX + style.height / 2, location.startY);
                    if (style.topRounded)
                        element.contextEl.arc(location.startX + style.height / 2, location.startY + style.height / 2, style.height / 2, Math.PI * (270 / 180), Math.PI * (90 / 180), true);
                    else
                        element.contextEl.lineTo(location.startX + style.height / 2, location.startY + style.height);

                }
                else {
                    element.contextEl.arc(location.startX + radius / 4 + Math.cos(Math.PI * (45 / 180)) * radius,
                               location.startY + Math.sin(Math.PI * (45 / 180)) * radius,
                               radius, Math.PI * (45 / 180), Math.PI * (315 / 180), false);
                    element.contextEl.lineTo(location.startX + style.width - style.height / 2, location.startY);
                    if (style.topRounded)
                        element.contextEl.arc(location.startX + style.width - style.height / 2, location.startY + style.height / 2, style.height / 2, Math.PI * (270 / 180), Math.PI * (90 / 180), false);
                    else
                        element.contextEl.lineTo(location.startX + style.width - style.height / 2, location.startY + style.height);
                }
            }
            this._contextClosePath(style, element);
        },
		  
        _drawFrameRoundedRectangle: function (location, style, element) {
            this._contextOpenPath(style, element);
            element.contextEl.lineTo(location.startX + style.radius, location.startY);
            element.contextEl.lineTo(location.startX + style.width - style.radius, location.startY);
            element.contextEl.quadraticCurveTo(location.startX + style.width, location.startY, location.startX + style.width, location.startY + style.radius);
            element.contextEl.lineTo(location.startX + style.width, location.startY + style.height - style.radius);
            element.contextEl.quadraticCurveTo(location.startX + style.width, location.startY + style.height, location.startX + style.width - style.radius, location.startY + style.height);
            element.contextEl.lineTo(location.startX + style.radius, location.startY + style.height);
            element.contextEl.quadraticCurveTo(location.startX, location.startY + style.height, location.startX, location.startY + style.height - style.radius);
            element.contextEl.lineTo(location.startX, location.startY + style.radius);
            element.contextEl.quadraticCurveTo(location.startX, location.startY, location.startX + style.radius, location.startY);
            this._contextClosePath(style, element);
            if (style.indicatorText)
                this._drawText(location, style);
        },
		  
        _contextOpenPath: function (style, element) {
            element.contextEl.save();
            element.contextEl.beginPath();
            if (style.strokeStyle)
                element.contextEl.strokeStyle = style.strokeStyle;
            if (style.opacity != undefined)
                element.contextEl.globalAlpha = style.opacity;
            if (style.lineWidth)
                element.contextEl.lineWidth = style.lineWidth;
            if (style.fillStyle)
                element.contextEl.fillStyle = style.fillStyle;
        },
		  
        _contextClosePath: function (style, element) {
            element.contextEl.closePath();
            if (style.isFill)
                element.contextEl.fill();
            if (style.isStroke)
                element.contextEl.stroke();
            element.contextEl.restore();
        },
		  
        _drawScales: function () {
            var self = this;
            this.scaleEl = this.Model.scales;
            this.contextEl.save();
            this.contextEl.translate(this.Model.frame.outerWidth + this.Model.frame.innerWidth, this.Model.frame.outerWidth + this.Model.frame.innerWidth);
            $.each(this.Model.scales, function (index, element) {
                self.scaleIndex = index;
                self._setScaleCordinates(element, element.type);
            });
            this._setTicks();
            this._setLabels();
            this._setRange();
            this._setCustomLabel();
            this._flagPointer = false;
            this._tempOpacity=this.model.scales[0].barPointers[0].opacity;
            this._setBarPointers();
            this._setMarkerPointers();
            this._setIndicators();
            $.each(this.Model.scales, function (ind, elemt) {
                if (elemt.showBarPointers) {
                    if (elemt.barPointers.length > 1)
                        self.model.enableAnimation = false;
                }
                if (elemt.showMarkerPointers) {
                    if (elemt.markerPointers.length > 1)
                        self.model.enableAnimation = false;
                }
            });
            if (!this.contextEl.putImageData)
                this.model.enableAnimation = false;
            if (this.model.animationSpeed != null && this.model.animationSpeed > 0) {
                var delay = this.model.animationSpeed / 25;
                if (delay >= 0) {
                    if (this.model.enableAnimation && this._animationFlag) {
                        this._onAnimate(delay);
                    }
                }
            }
        },
		  
        _setTicks: function () {
            var self = this;
            $.each(this.Model.scales, function (index, element) {
                if (element.showTicks) {
                    self.scaleIndex = index;
                    if (element.ticks != null) {
                        self.tickEl = element.ticks;
                        $.each(element.ticks, function (tickIndex, tickElement) {
                            self.tickIndex = tickIndex;
                            self._setTicksCordinates(tickElement, tickIndex);
                        });
                    }
                }
            });
        },
		  
        _setLabels: function () {
            var self = this;
            $.each(this.Model.scales, function (index, element) {
                if (element.showLabels) {
                    self.scaleIndex = index;
                    if (element.labels != null) {
                        self.labelEl = element.labels;
                        $.each(element.labels, function (labelIndex, labelElement) {
                            self.labelIndex = labelIndex;
                            self._setLabelCordinates(labelElement, labelIndex);
                        });
                    }
                }
            });
        },
		  
        _setIndicators: function () {
            var self = this;
            $.each(this.Model.scales, function (index, element) {
                self.scaleIndex = index;
                if (element.indicators != null && element.showIndicators) {
                    self.indicatorEl = element.indicators;
                    $.each(element.indicators, function (indicatorIndex, indicatorElement) {
                        self.indicatorIndex = indicatorIndex;
                        self._drawIndicator(indicatorIndex, indicatorElement);
                    });
                }
            });
        },
		  
        _setBarPointers: function () {
            var self = this;
            $.each(this.Model.scales, function (index, element) {
                if (element.showBarPointers) {
                    self.scaleIndex = index;
                    if (element.barPointers != null) {
                        self.barPointerEl = element.barPointers;
                        $.each(element.barPointers, function (barPointerIndex, barPointerElement) {
                            self.barPointerIndex = barPointerIndex;
                            element.opacity = (self.scaleIndex == 0 && self.barPointerIndex == 0 && self.model.enableAnimation == true && (self._flagPointer == false && self._animationFlag == true) && self.model.scales[0].type == "thermometer") ? 0 : self._tempOpacity;
                            self._drawScaleBarPointer(barPointerElement, barPointerIndex);
                            self._flagPointer=true;
                        });
                    }
                }
            });
        },
		  
        _setMarkerPointers: function () {
            var self = this;
            $.each(this.Model.scales, function (index, element) {
                if (element.showMarkerPointers) {
                    self.scaleIndex = index;
                    if (element.markerPointers != null) {
                        self.markerPointerEl = element.markerPointers;
                        $.each(element.markerPointers, function (markerPointerIndex, markerPointerElement) {
                            self.markerPointerIndex = markerPointerIndex;
                            self._drawMarkerPointer(markerPointerElement, markerPointerIndex);
							self.canvasEl.attr("aria-label", self.model.scales[self.scaleIndex].markerPointers[self.markerPointerIndex].value);
                        });
                    }
                }
            });
        },
		  
        _onAnimate: function (delay) {
            var self = this, timer, timer1;
            var currentValue = self.model.scales[0].minimum;
            var barPointerValue = self.model.scales[0].barPointers[0].value;
            var markerPointerValue = self.model.scales[0].markerPointers[0].value;
            timer = setInterval(function pointerchan() {
			  if(self.model){
                if (barPointerValue > currentValue || currentValue == self.model.scales[0].minimum) {
                    currentValue = currentValue + ((self.model.scales[0].maximum-self.model.scales[0].minimum)/100);
                    if (self.scaleEl[0].type == "thermometer") {
                        self.model.scales[0].barPointers[0].value = (barPointerValue > currentValue) ? currentValue: barPointerValue;
                        if (self.contextEl.putImageData != "undefined") {
                            self._setBarPointers();
                        }
                        else {
                            barPointerValue > currentValue ? self.setBarPointerValue(0, 0, currentValue) : self.setBarPointerValue(0, 0, barPointerValue);
                        }
                    }
                    else
                        barPointerValue > currentValue ? self.setBarPointerValue(0, 0, currentValue) : self.setBarPointerValue(0, 0, barPointerValue);
                }
                else {
                    self._animationFlag = false;
                    self.setBarPointerValue(0, 0, barPointerValue);
                    window.clearInterval(timer);
                }
			  } else window.clearInterval(timer); 	
            }, delay);
            timer1 = setInterval(function pointerchan() {
            if(self.model && self.model.enableMarkerPointerAnimation){
                if (markerPointerValue > currentValue || currentValue == self.model.scales[0].minimum) {
                    currentValue = currentValue + ((self.model.scales[0].maximum-self.model.scales[0].minimum)/100);
                    if (self.scaleEl[0].type == "thermometer") {
                        self.model.scales[0].markerPointers[0].value = (markerPointerValue > currentValue) ? currentValue : markerPointerValue;
                        if (self.contextEl.putImageData != "undefined") {
                            self._setMarkerPointers();
                            }
                            else {
                                markerPointerValue > currentValue ? self.setPointerValue(0, 0, currentValue) : self.setPointerValue(0, 0, markerPointerValue);
                            }
                        }
                        else
                            markerPointerValue > currentValue ? self.setPointerValue(0, 0, currentValue) : self.setPointerValue(0, 0, markerPointerValue);
                    }
                    else {
                        self._animationFlag = false;
                        self.setPointerValue(0, 0, markerPointerValue);
                        window.clearInterval(timer1);
                }} else window.clearInterval(timer1);
            }, delay);
        },
		  
        _setRange: function () {
            var self = this;
            $.each(this.Model.scales, function (index, element) {
                self.scaleIndex = index;
                if (element.ranges != null && element.showRanges) {
                    self.rangeEl = element.ranges;
                    $.each(element.ranges, function (rangeIndex, rangeElement) {
                        self.rangeIndex = rangeIndex;
                        self._drawRange(rangeElement);
                    });
                }
            });
        },
		  
        _setCustomLabel: function () {
            var self = this;
            $.each(this.Model.scales, function (index, element) {
                self.scaleIndex = index;
                if (element.customLabels != null && element.showCustomLabels) {
                    self.customLabelEl = element.customLabels;
                    $.each(element.customLabels, function (cusLblIndex, cusLblElement) {
                        self.customLabelIndex = cusLblIndex;
                        if (self.model.scales[self.scaleIndex].customLabels[self.customLabelIndex] != null && self.model.scales[self.scaleIndex].customLabels[self.customLabelIndex].positionType != null && self.model.scales[self.scaleIndex].customLabels[self.customLabelIndex].positionType == "outer")
                            self._setOuterCustomLabelCordinates(cusLblIndex, cusLblElement);
                        else
                            self._setCustomLabelCordinates(cusLblIndex, cusLblElement);
                    });
                }
            });
        },
          
        _setOuterCustomLabelCordinates: function (index, element) {
            this._customLblMaxSize = this._customLblMaxSize < parseFloat(element.font.size.match(/\d+/)[0]) ? parseFloat(element.font.size.match(/\d+/)[0]) : this._customLblMaxSize;
            var div = ej.buildTag("div." + this._id + "outercustomlbl");
            div.text(this.model.scales[this.scaleIndex].customLabels[index].value);
            var position = (this.model.outerCustomLabelPosition == "right" || this.model.outerCustomLabelPosition == "left") ? "left" : "center";
            this.outerDiv.append(div);
            this.outerDiv.append('</br>');
            if (position == "center")
                div.css({ 'display': 'inline-block', 'margin': '0 auto', 'max-width': this.model.width });
            else
                div.css({ 'display': 'inline-block', 'max-width': this.element.width() - this.model.width > 10 ? this.element.width() - this.model.width : 10 });
            div.css({
                "color": element.color,
                'overflow': 'hidden',
                'text-overflow': 'ellipsis',
                'white-space': 'nowrap',
                'font-size': (element.font != null && element.font.size != null) ? element.font.size : "12px",
                'font-family': (element.font != null && element.font.fontFamily != null) ? element.font.fontFamily : "Arial",
                'font-weight': (element.font != null && element.font.fontStyle != null) ? element.font.fontStyle : "Normal",
                'text-align': position
            });

        },
		  
        _setScaleCordinates: function (element, scaleStyle) {
            var location, style, radius;
            this.opacity = 1;
            this.bottomRadius = Math.sqrt(element.width * element.width + element.width * element.width) / 2;

            this.bounds = {
                height: this.canvasEl[0].height - 2 * (this.Model.frame.outerWidth + this.Model.frame.innerWidth),
                width: this.canvasEl[0].width - 2 * (this.Model.frame.outerWidth + this.Model.frame.innerWidth)
            };
            if (this.Model.orientation == "Vertical") {
                this.scaleStartX[this.scaleIndex] = (this.bounds.width - element.width) * ((element.position.x) / 100);
                this.scaleStartY[this.scaleIndex] = (this.bounds.height - element.length) * ((element.position.y) / 100);
            }
            else {
                this.scaleStartX[this.scaleIndex] = (this.bounds.width - element.length) * ((element.position.x) / 100);
                this.scaleStartY[this.scaleIndex] = (this.bounds.height - element.width) * ((element.position.y) / 100);
            }
            radius = scaleStyle == "roundedrectangle" ? 5 : 0;
            location = { "startX": this.scaleStartX[this.scaleIndex], "startY": this.scaleStartY[this.scaleIndex] };
            style = {
                "width": this.Model.orientation == "Vertical" ? element.width : element.length, "isStroke": true,
                "topRounded": true,
                "fillStyle": element.backgroundColor ? ((element.backgroundColor == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, element.backgroundColor)) : ((this.Model.backgroundColor == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, this.Model.backgroundColor)),
                "lineWidth": element.border.width,
                "radius": radius,
                "height": this.Model.orientation == "Vertical" ? element.length : element.width,
                "isFill": true,
                "strokeStyle": element.border.color ? ((element.border.color == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, element.border.color)) : ((this.Model.borderColor == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, this.Model.borderColor))
            };
	    if (element.maximum < element.minimum) {
                var tempValue = element.maximum;
                element.maximum = element.minimum;
                element.minimum=tempValue;
            }
			 if (element.maximum == element.minimum)
	            element.maximum = element.maximum + 1;
            this.minimum(element.minimum);
            this.maximum(element.maximum);
            if (this._notifyArrayChange) {
                this._notifyArrayChange("scales[" + this.scaleIndex + "]maximum", element.maximum);
                this._notifyArrayChange("scales[" + this.scaleIndex + "]minimum", element.minimum);
            }
            if (element.shadowOffset) {
                this.contextEl.shadowBlur = element.shadowOffset;
                this.contextEl.shadowColor = (style.fillStyle == "transparent") ? "rgba(0,0,0,0)" : style.fillStyle;
            }
            this._drawFrame(scaleStyle, location, style);
            if (this.scaleEl[this.scaleIndex].type == "thermometer" && !this.isScaleModified) {
                this._modifyWidth();
                this.isScaleModified = true;
            }
            if (this.contextEl.getImageData)
                this.scaleImage = this.contextEl.getImageData(0, 0, this.Model.width, this.Model.height);
        },
		  
        _setTicksCordinates: function (element, index) {
            var staticPosition, height, lineChangePosition, interval;
            if (this.scaleEl[this.scaleIndex].majorIntervalValue > this.scaleEl[this.scaleIndex].minorIntervalValue) {
                interval = element.type == "majorinterval" ? this.scaleEl[this.scaleIndex].majorIntervalValue : this.scaleEl[this.scaleIndex].minorIntervalValue;
                if (element.placement == "near") {
                    staticPosition = this.Model.orientation == "Vertical" ? this.scaleStartX[this.scaleIndex] : this.scaleStartY[this.scaleIndex];
                }
                else if (element.placement == "far") {
                    staticPosition = this.Model.orientation == "Vertical" ? this.scaleStartX[this.scaleIndex] + this.scaleEl[this.scaleIndex].width : this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].width;
                }
                else if (element.placement == "center") {
                    staticPosition = this.Model.orientation == "Vertical" ? this.scaleStartX[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 : this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2;
                }
                height = element.placement == "near" ? -element.height : element.height;
                for (var value = this.scaleEl[this.scaleIndex].maximum; value >= this.scaleEl[this.scaleIndex].minimum; value -= interval) {
                    if (interval == this.scaleEl[this.scaleIndex].minorIntervalValue && value % this.scaleEl[this.scaleIndex].majorIntervalValue != 0 || interval == this.scaleEl[this.scaleIndex].majorIntervalValue) {
                        lineChangePosition = this._getClockwiseLinePosition(value);
                        this.region = {
                            "lineChangePosition": lineChangePosition + (this.Model.orientation == "horizontal" ? element.distanceFromScale.x : (element.distanceFromScale.y)),
                            "lineStaticPosition": staticPosition + (this.Model.orientation == "horizontal" ? element.distanceFromScale.y : (element.distanceFromScale.x))
                        };
                        this.style = {
                            "lineHeight": height,
                            "angle": this.Model.orientation == "Vertical" ? element.angle : element.angle + 270,
                            "tickShape": element.TickShape,
                            "strokeStyle": element.color ? ((element.color == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, element.color)) : ((this.Model.tickColor == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, this.Model.tickColor)),
                            "lineWidth": element.width
                        }
                        if (this.Model.drawTicks)
                            this._onDrawTicks(this.Model.orientation == "Vertical" ? element.angle : element.angle + 270, value);
                        this._drawTickMark(this.region, this.style);
                    }
                }

                if (this.contextEl.getImageData)
                    this.tickImage = this.contextEl.getImageData(0, 0, this.Model.width, this.Model.height);
            }
        },
		  
        _drawTickMark: function (location, style) {
            this.contextEl.beginPath();
            this.contextEl.save();
            this.contextEl.lineWidth = style.lineWidth;
            this.contextEl.strokeStyle = style.strokeStyle;
            if (this.Model.orientation == "Vertical")
                this.contextEl.translate(location.lineStaticPosition, location.lineChangePosition);
            else
                this.contextEl.translate(location.lineChangePosition, location.lineStaticPosition);
            this.contextEl.lineTo(0, 0);
            if (this.scaleEl[this.scaleIndex].direction.toLowerCase() == "clockwise")
                this.contextEl.rotate((Math.PI * (style.angle / 180)));
            else
                this.contextEl.rotate(-(Math.PI * (style.angle / 180)));
            this.contextEl.lineTo(style.lineHeight, 0);
            this.contextEl.stroke();
            this.contextEl.restore();
            this.contextEl.closePath();
        },
		  
        _addDecimal: function (lblValue, lblInterval) {
            var value = lblValue.toString();
            var interval = lblInterval.toString();
            var vDecimal;
            var iDecimal;
            if (value.indexOf('.') > -1)
                vDecimal = value.length - value.indexOf('.') - 1;
            else
                vDecimal = 0;
            if (interval.indexOf('.') > -1)
                iDecimal = interval.length - interval.indexOf('.') - 1;
            else
                iDecimal = 0;
            var decimal = vDecimal > iDecimal ? vDecimal : iDecimal;
            var correctValue = (lblValue * Math.pow(10, decimal) + lblInterval * Math.pow(10, decimal)) / Math.pow(10, decimal);
            return correctValue;
        },
		  
        _setLabelCordinates: function (element, index) {

            var xDistanceFromScale, yDistanceFromScale, staticPosition, lineChangePosition, interval, locale = this.model.locale;
            if (this.scaleEl[this.scaleIndex].majorIntervalValue > this.scaleEl[this.scaleIndex].minorIntervalValue) {

                if (this.Model.orientation == "Vertical") {
                    xDistanceFromScale = element.distanceFromScale.x;
                    yDistanceFromScale = element.distanceFromScale.y;
                }
                else {
                    xDistanceFromScale = element.distanceFromScale.y;
                    yDistanceFromScale = element.distanceFromScale.x;
                }
                interval = element.type == "major" ? this.scaleEl[this.scaleIndex].majorIntervalValue : this.scaleEl[this.scaleIndex].minorIntervalValue;
                if (element.placement == "near") {
                    staticPosition = this.Model.orientation == "Vertical" ? this.scaleStartX[this.scaleIndex] - this.scaleEl[this.scaleIndex].border.width / 2 : this.scaleStartY[this.scaleIndex] - this.scaleEl[this.scaleIndex].border.width - 5;
                    this.contextEl.textAlign = this.Model.orientation == "Vertical" ? "right" : "center";
                }
                else if (element.placement == "far") {
                    staticPosition = this.Model.orientation == "Vertical" ? this.scaleStartX[this.scaleIndex] + this.scaleEl[this.scaleIndex].width + this.scaleEl[this.scaleIndex].border.width / 2 : this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].width + this.scaleEl[this.scaleIndex].border.width + 5;
                    this.contextEl.textAlign = this.Model.orientation == "Vertical" ? "left" : "center";
                }
                else {
                    this.contextEl.textAlign = "center";
                    staticPosition = this.Model.orientation == "Vertical" ? this.scaleStartX[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 + this.scaleEl[this.scaleIndex].border.width / 2 : this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 + this.scaleEl[this.scaleIndex].border.width / 2;
                }
                for (var value = this.scaleEl[this.scaleIndex].minimum; value <= this.scaleEl[this.scaleIndex].maximum; value = this._addDecimal(value, interval)) {
                    if (interval == this.scaleEl[this.scaleIndex].minorIntervalValue && value % this.scaleEl[this.scaleIndex].majorIntervalValue != 0 || interval == this.scaleEl[this.scaleIndex].majorIntervalValue) {
                        lineChangePosition = this.scaleEl[this.scaleIndex].direction == "counterclockwise" ? this._getCounterClockwiseLinePosition(value) : this._getClockwiseLinePosition(value);
                        this.labelValue = value;
                        this.region = {
                            "lineChangePosition": lineChangePosition + (yDistanceFromScale),
                            "lineStaticPosition": staticPosition + (xDistanceFromScale)
                        };
                        this.style = {
                            "angle": this.Model.orientation == "Vertical" ? element.angle : element.angle + 270,
                            "fillStyle": element.textColor ? ((element.textColor == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, element.textColor)) : ((this.Model.labelColor == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, this.Model.labelColor)), "opacity": isNaN(element.opacity) ? 1 : element.opacity,
                            "font": this._getFontString(this, element.font),
                            "textValue": this.labelValue
                        };
						
						this.style.textValue  = this.labelValue = (locale && this.model.enableGroupSeparator) ? this.labelValue.toLocaleString(locale) : this.labelValue;
                        if (this.Model.drawLabels)
                            this._onDrawLabels(this.Model.orientation == "Vertical" ? element.angle : element.angle + 270);
                        this._drawLabel(this.region, this.style,false);
                    }
                }
            }

            if (this.contextEl.getImageData)
                this.labelImage = this.contextEl.getImageData(0, 0, this.Model.width, this.Model.height);

        },
		  
        _drawLabel: function (location, style, isCustomLabel) {
            this.contextEl.beginPath();
            this.contextEl.save();
            this.contextEl.textBaseline = "middle";
            this.contextEl.fillStyle = style.fillStyle;
            this.contextEl.font = style.font;
            if (style.opacity)
                this.contextEl.globalAlpha = style.opacity;
            if (this.Model.orientation == "Vertical") {
                this.contextEl.translate(location.lineStaticPosition, location.lineChangePosition);
                if (this.model.tooltip.showLabelTooltip && !isCustomLabel)
                    this._savedPoints.push({ "startX": location.lineStaticPosition + 5, "startY": location.lineChangePosition + 10, "width": 15, "height": 15, "value": style.textValue });
                if (this.model.tooltip.showCustomLabelTooltip && isCustomLabel)
                    this._savedPoints.push({ "startX": location.lineStaticPosition - 35, "startY": location.lineChangePosition + 10, "width": 110, "height": 15, "value": style.textValue });
            }
            else {
                this.contextEl.translate(location.lineChangePosition, location.lineStaticPosition);
                if (this.model.tooltip.showLabelTooltip && !isCustomLabel)
                    this._savedPoints.push({ "startX": location.lineChangePosition + 10, "startY": location.lineStaticPosition + 10, "width": 15, "height": 15, "value": style.textValue });
                if (this.model.tooltip.showCustomLabelTooltip && isCustomLabel)
                    this._savedPoints.push({ "startX": location.lineChangePosition - 35, "startY": location.lineStaticPosition + 10, "width": 110, "height": 15, "value": style.textValue });
            }
            this.contextEl.lineTo(0, 0);
            if (this.scaleEl[this.scaleIndex].direction.toLowerCase() == "clockwise")
                this.contextEl.rotate((Math.PI * (style.angle / 180)));
            else
                this.contextEl.rotate(-(Math.PI * (style.angle / 180)));
			if(!ej.isNullOrUndefined(isCustomLabel) && !isCustomLabel){
			    var textPostion = this.model.scales[this.scaleIndex].labels[this.labelIndex].unitTextPlacement;
            if (!ej.isNullOrUndefined(textPostion) && textPostion.toString() == "back")
                style.textValue = style.textValue + this.model.scales[this.scaleIndex].labels[this.labelIndex].unitText;
            else if (!ej.isNullOrUndefined(textPostion) && textPostion.toString() == "front")
                style.textValue = this.model.scales[this.scaleIndex].labels[this.labelIndex].unitText + style.textValue;
            }
            this.contextEl.fillText(style.textValue, 0, 0);
            this.contextEl.fill();
            this.contextEl.restore();

        },
		  
        _drawScaleBarPointer: function (element, index) {
            element.value = element.value > this.scaleEl[this.scaleIndex].maximum ? this.scaleEl[this.scaleIndex].maximum : element.value;
            element.value = element.value < this.scaleEl[this.scaleIndex].minimum ? this.scaleEl[this.scaleIndex].minimum : element.value;
            var grd, lineYPosition, radius, height, width, startY, backgroundColor, startX, gradients;
            gradients = [{ "ColorStop": 0, "Color": (this.Model.pointerGradient1 == "transparent") ? "rgba(0,0,0,0)" : this.Model.pointerGradient1 }, { "ColorStop": 1, "Color": (this.Model.pointerGradient2 == "transparent") ? "rgba(0,0,0,0)" : this.Model.pointerGradient2}];
            radius = this.scaleEl[this.scaleIndex].type == "roundedrectangle" ? 5 : 0;
            if (this.scaleEl[this.scaleIndex].direction.toLowerCase() == "clockwise") {
                lineYPosition = this._getClockwiseLinePosition(element.value);
                if (this.scaleEl[this.scaleIndex].type == "thermometer" && this.isScaleModified) {
                    this._restoreWidth();
                    this.isModify = true;
                }
                if (this.Model.orientation == "Vertical") {
                    startX = this.scaleStartX[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 - element.width / 2 + element.distanceFromScale;
                    grd = this.contextEl.createLinearGradient(startX, this.scaleStartY[this.scaleIndex], startX + element.width, this.scaleStartY[this.scaleIndex]);
                }
                else {
                    startX = this.scaleStartX[this.scaleIndex];
                    grd = this.contextEl.createLinearGradient(startX, this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 - element.width / 2, startX, this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 + element.width / 2);
                }
            }
            else {
                lineYPosition = this._getCounterClockwiseLinePosition(element.value);
                if (this.scaleEl[this.scaleIndex].type == "thermometer" && this.isScaleModified) {
                    this._restoreWidth();
                    this.isModify = true;
                }
                if (this.Model.orientation == "Vertical") {
                    startX = this.scaleStartX[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 - element.width / 2 + element.distanceFromScale;
                    grd = this.contextEl.createLinearGradient(startX, this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].length - lineYPosition, startX + element.width, this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].length - lineYPosition);
                }
                else {
                    startX = this.scaleEl[this.scaleIndex].type == "thermometer" ? lineYPosition - this.scaleEl[this.scaleIndex].width / 2 - this.scaleEl[this.scaleIndex].border.width / 2 : lineYPosition - this.scaleEl[this.scaleIndex].border.width / 2;
                    grd = this.contextEl.createLinearGradient(startX, this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 - element.width / 2, startX, this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 + element.width / 2);
                }
            }
            if (element.backgroundColor)
                backgroundColor = ((element.backgroundColor == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, element.backgroundColor));
            else if (element.gradients)
                this._setGradientColor(this, grd, element.gradients.colorInfo);
            else if (this.Model.ScaleInterior)
                this._setGradientColor(this, grd, this.Model.ScaleInterior.colorInfo);
            else
                this._setGradientColor(this, grd, gradients);
            if (this.Model.orientation == "Vertical") {
                startY = this.scaleEl[this.scaleIndex].direction.toLowerCase() == "clockwise" ? this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].border.width / 2 : lineYPosition;
                if (this.scaleEl[this.scaleIndex].direction == "counterclockwise" && this.scaleEl[this.scaleIndex].type == "thermometer")
                    startY = startY - this.scaleEl[this.scaleIndex].width / 2;
                height = this.scaleEl[this.scaleIndex].direction.toLowerCase() == "clockwise" ? lineYPosition - this.scaleStartY[this.scaleIndex] : this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].length - lineYPosition - this.scaleEl[this.scaleIndex].border.width / 2;
                width = element.width;
            }
            else {
                startY = this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 - element.width / 2 + this.scaleEl[this.scaleIndex].border.width / 2 + element.distanceFromScale;
                height = element.width;
                width = this.scaleEl[this.scaleIndex].direction.toLowerCase() == "clockwise" ? lineYPosition - this.scaleStartX : this.scaleStartX[this.scaleIndex] + this.scaleEl[this.scaleIndex].length - lineYPosition;
            }
            this.region = { "startX": startX + this.scaleEl[this.scaleIndex].border.width / 2, "startY": startY };
            this.style = {
                "width": (this.scaleEl[this.scaleIndex].type == "thermometer" && this.Model.orientation == "horizontal") ? width + height / 2 - this.scaleEl[this.scaleIndex].border.width / 2 : width,
                "lineWidth": element.border.width,
                "radius": radius,
                "topRounded": false,
                "isStroke": false,
                "isFill": true,
                "height": (this.scaleEl[this.scaleIndex].type == "thermometer" && this.Model.orientation == "Vertical") ? height + width / 2 : height,
                "strokeStyle": element.border.color == null ? ((this.Model.borderColor == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, this.Model.borderColor)) : ((element.border.color == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, element.border.color)),
                "fillStyle": element.backgroundColor ? ((element.backgroundColor == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, element.backgroundColor)) : ((grd == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, grd)),
                "opacity": isNaN(element.opacity) ? 0.4 : element.opacity,
                "calDistance": (this.scaleEl[this.scaleIndex].type == "thermometer" && this.Model.orientation == "Vertical") ? (this.scaleEl[this.scaleIndex].width - this.barPointerEl[this.barPointerIndex].width) / 2 : 0
            };
            this.value(element.value);
            if (this._notifyArrayChange)
                this._notifyArrayChange("scales[" + this.scaleIndex + "]barpointers[" + index + "]value", element.value);
            if (this.Model.drawBarPointers)
                this._onDrawBarPointers(element.value);
            this._drawFrame(this.scaleEl[this.scaleIndex].type, this.region, this.style);
            if (this.contextEl.getImageData)
                this.barPointerImage = this.contextEl.getImageData(0, 0, this.Model.width, this.Model.height);
        },
		  
        _drawMarkerPointer: function (element, index) {
            element.value = element.value > this.scaleEl[this.scaleIndex].maximum ? this.scaleEl[this.scaleIndex].maximum : element.value;
            element.value = element.value < this.scaleEl[this.scaleIndex].minimum ? this.scaleEl[this.scaleIndex].minimum : element.value;
            var startX, startY, radius, linePosition, angle, grd, backgroundColor;
            var gradients = [{ "ColorStop": 0, "Color": (this.Model.pointerGradient1 == "transparent") ? "rgba(0,0,0,0)" : this.Model.pointerGradient1 }, { "ColorStop": 1, "Color": (this.Model.pointerGradient2 == "transparent") ? "rgba(0,0,0,0)" : this.Model.pointerGradient2}];
            this.markerPlacement = element.placement;
            radius = Math.sqrt(element.width * element.width + element.length * element.length) / 2;
            if (this.scaleEl[this.scaleIndex].type == "thermometer" && this.isModify)
                this._modifyWidth();
            if (this.Model.orientation == "Vertical") {
                if (this.markerPlacement == "far") {
                    startX = this.scaleStartX[this.scaleIndex] + this.scaleEl[this.scaleIndex].width + this.scaleEl[this.scaleIndex].border.width / 2 + element.distanceFromScale;
                    angle = 0;
                }
                if (this.markerPlacement == "near") {
                    if (element.type == "star")
                        startX = this.scaleStartX[this.scaleIndex] + element.distanceFromScale - element.width;
                    else
                        startX = this.scaleStartX[this.scaleIndex] + element.distanceFromScale;
                    angle = 180;
                }
                if (this.markerPlacement == "center") {
                    if (element.type == "circle")
                        startX = this.scaleStartX[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 - element.width / 2 + element.distanceFromScale + (element.border.width);
                    else
                        startX = this.scaleStartX[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 - element.width / 2 + element.distanceFromScale;
                    angle = 0;
                }
            }
            else {
                if (this.markerPlacement == "far") {
                    startX = this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].width + this.scaleEl[this.scaleIndex].border.width / 2 + element.distanceFromScale;
                    angle = 90;
                }
                if (this.markerPlacement == "near") {
                    if (element.type == "star")
                        startX = this.scaleStartY[this.scaleIndex] - this.scaleEl[this.scaleIndex].border.width / 2 + element.distanceFromScale - element.length;
                    else
                        startX = this.scaleStartY[this.scaleIndex] - this.scaleEl[this.scaleIndex].border.width / 2 + element.distanceFromScale;
                    angle = 270;
                }
                if (this.markerPlacement == "center") {
                    if (element.type == "circle")
                        startX = this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 - element.length / 2 + element.distanceFromScale + (element.border.width);
                    else
                        startX = this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 - element.length / 2 + element.distanceFromScale;
                    angle = 90;
                }
            }
            linePosition = this.scaleEl[this.scaleIndex].direction.toLowerCase() == "clockwise" ? this._getClockwiseLinePosition(element.value) : this._getCounterClockwiseLinePosition(element.value);
            if (element.type == "star") {
                if (this.Model.orientation == "Vertical") {
                    grd = this.contextEl.createLinearGradient(startX, this.scaleStartY[this.scaleIndex], startX + element.width, this.scaleStartY[this.scaleIndex]);
                    startY = linePosition - element.length / 3;
                }
                else {
                    grd = this.contextEl.createLinearGradient(linePosition, startX, linePosition, startX + element.length);
                    startY = linePosition - element.width / 2;
                }
            }
            else {
                grd = this.contextEl.createLinearGradient(0, 0, element.width, 0);
                startY = linePosition;
            }
            if (element.type == "roundedrectangle") {
                if (this.Model.orientation == "Vertical" && this.markerPlacement == "near")
                    startY += element.length;
                else if (this.Model.orientation == "horizontal") {
                    if (this.markerPlacement == "near")
                        startY -= (element.width);
                    startX += element.width / 2;
                }
            }
            if (element.backgroundColor)
                backgroundColor = ((element.backgroundColor == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, element.backgroundColor));
            else if (element.gradients)
                this._setGradientColor(this, grd, element.gradients.colorInfo);
            else if (this.Model.PointerInterior)
                this._setGradientColor(this, grd, this.Model.PointerInterior.colorInfo);
            else
                this._setGradientColor(this, grd, gradients);

            this.region = { "startX": this.Model.orientation == "Vertical" ? startX : startY, "startY": this.Model.orientation == "Vertical" ? startY : startX };
            this.style = {
                "width": element.width,
                "radius": element.type == "rectangle" ? 0 : radius,
                "height": element.length,
                "lineWidth": element.border.width,
                "isFill": true,
                "isStroke": true,
                "angle": angle,
                "strokeStyle": ((element.border.color == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, element.border.color)),
                "markerPlacement": this.markerPlacement,
                "opacity": isNaN(element.opacity) ? 0.4 : element.opacity,
                "fillStyle": element.backgroundColor ? ((element.backgroundColor == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, element.backgroundColor)) : ((grd == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, grd))
            };
            this.value(element.value);
            if (this._notifyArrayChange)
                this._notifyArrayChange("scales[" + this.scaleIndex + "]markerpointers[" + index + "]value", element.value);
            if (this.Model.drawMarkerPointers)
                this._onDrawMarkerPointers(angle, element.value);
            if (element.type == "roundedrectangle")
                this.style.radius = 5;
            this._drawMarkerType(element.type, this.region, this.style);
            if (this.scaleEl[this.scaleIndex].type == "thermometer" && this.isModify) {
                this._restoreWidth();
                this.isScaleModified = false;
            }
            if (this.contextEl.getImageData)
                this.markerPointerImage = this.contextEl.getImageData(0, 0, this.Model.width, this.Model.height);
        },

        _drawMarkerType: function (type, location, style) {
            switch (type) {
                case "rectangle":
                    this._drawRectangle(location, style, this);
                    break;
                case "triangle":
                    this._drawTriangle(location, style, this);
                    break;
                case "ellipse":
                    this._drawEllipse(location, style, this);
                    break;
                case "diamond":
                    this._drawDiamond(location, style, this);
                    break;
                case "pentagon":
                    this._drawPentagon(location, style, this);
                    break;
                case "circle":
                    this._drawCircle(location, style, this);
                    break;
                case "slider":
                    this._drawSlider(location, style, this);
                    break;
                case "star":
                    this._drawStar(location, style, this);
                    break;
                case "pointer":
                    this._drawPointer(location, style, this);
                    break;
                case "wedge":
                    this._drawWedge(location, style, this);
                    break;
                case "trapezoid":
                    this._drawTrapezoid(location, style, this);
                    break;
                case "roundedrectangle":
                    this._drawRoundedRectangle(location, style, this);
                    break;
            }
        },

		  
        _drawRange: function (element) {
            if (element.startValue < this.scaleEl[this.scaleIndex].maximum && element.endValue > this.scaleEl[this.scaleIndex].minimum && this.scaleEl[this.scaleIndex].minimum < this.scaleEl[this.scaleIndex].maximum && element.endValue <= this.scaleEl[this.scaleIndex].maximum) {
                var tempStartValue = element.startValue < this.scaleEl[this.scaleIndex].minimum ? this.scaleEl[this.scaleIndex].minimum : element.startValue;
                var tempEndValue = element.endValue > this.scaleEl[this.scaleIndex].maximum ? this.scaleEl[this.scaleIndex].maximum : element.endValue;
                this.rangePosition = element.placement;
                var startLinePosition, endLinePosition, startX, startY, grd, backgroundColor;
                var gradients = [{ "ColorStop": 0, "Color": (this.Model.pointerGradient1 == "transparent") ? "rgba(0,0,0,0)" : this.Model.pointerGradient1 }, { "ColorStop": 1, "Color": (this.Model.pointerGradient2 == "transparent") ? "rgba(0,0,0,0)" : this.Model.pointerGradient2 }];
                startLinePosition = (this.scaleEl[this.scaleIndex].direction.toLowerCase() == "clockwise") ? this._getClockwiseLinePosition(tempStartValue) : this._getCounterClockwiseLinePosition(tempStartValue);
                endLinePosition = (this.scaleEl[this.scaleIndex].direction.toLowerCase() == "clockwise") ? this._getClockwiseLinePosition(tempEndValue) : this._getCounterClockwiseLinePosition(tempEndValue);
                if (this.Model.orientation == "Vertical") {
                    if (element.placement == "far")
                        startX = this.scaleStartX[this.scaleIndex] + element.distanceFromScale + this.scaleEl[this.scaleIndex].width + this.scaleEl[this.scaleIndex].border.width;
                    if (element.placement == "near")
                        startX = this.scaleStartX[this.scaleIndex] + element.distanceFromScale;
                    if (element.placement == "center")
                        startX = (element.startWidth > element.endWidth) ? this.scaleStartX[this.scaleIndex] + element.distanceFromScale + this.scaleEl[this.scaleIndex].width / 2 - element.startWidth / 2 : this.scaleStartX[this.scaleIndex] + element.distanceFromScale + this.scaleEl[this.scaleIndex].width / 2 - element.endWidth / 2;
                    grd = this.contextEl.createLinearGradient(endLinePosition, endLinePosition, endLinePosition, startLinePosition);
                    this.region = { "startX": startX, "startY": startLinePosition, "endY": endLinePosition };
                }
                else {
                    if (element.placement == "far")
                        startY = this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].width + element.distanceFromScale + this.scaleEl[this.scaleIndex].border.width;
                    if (element.placement == "near")
                        startY = this.scaleStartY[this.scaleIndex] + element.distanceFromScale;
                    if (element.placement == "center")
                        startY = (element.startWidth > element.endWidth) ? this.scaleStartY[this.scaleIndex] + element.distanceFromScale + this.scaleEl[this.scaleIndex].width / 2 - element.startWidth / 2 : this.scaleStartY[this.scaleIndex] + element.distanceFromScale + this.scaleEl[this.scaleIndex].width / 2 - element.endWidth / 2;
                    grd = this.contextEl.createLinearGradient(endLinePosition, startY, startLinePosition, startY);
                    this.region = { "startX": startLinePosition, "startY": startY, "endX": endLinePosition };
                }

                if (element.backgroundColor)
                    backgroundColor = ((element.backgroundColor == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, element.backgroundColor));
                else if (element.gradients)
                    this._setGradientColor(this, grd, element.gradients.colorInfo);
                else if (this.Model.RangeInterior)
                    this._setGradientColor(this, grd, this.Model.RangeInterior.colorInfo);
                else
                    this._setGradientColor(this, grd, gradients);

                this.style = {
                    "startWidth": element.startWidth, "lineWidth": element.border.width,
                    "isStroke": true, "isFill": true, "opacity": isNaN(element.opacity) ? 0.4 : element.opacity,
                    "endWidth": element.endWidth,
                    "fillStyle": element.backgroundColor ? ((backgroundColor == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, backgroundColor)) : ((grd == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, grd)),
                    "strokeStyle": element.border.color ? ((element.border.color == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, element.border.color)) : ((this.Model.borderColor == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, this.Model.borderColor))
                };
                if (this.Model.drawRange)
                    this._onDrawRange();
                this._drawRangeBar(this.region, this.style);
                if (this.contextEl.getImageData)
                    this.rangeImage = this.contextEl.getImageData(0, 0, this.Model.width, this.Model.height);
            }
        },
		  
        _drawRangeBar: function (location, style) {
            this._contextOpenPath(style, this);
            if (this.Model.orientation == "Vertical") {
                this.contextEl.lineTo(location.startX, location.startY);
                this.contextEl.lineTo(location.startX, location.endY);
                if (this.rangePosition == "near") {
                    this.contextEl.lineTo(location.startX - style.endWidth, location.endY);
                    this.contextEl.lineTo(location.startX - style.startWidth, location.startY);
                }
                else {
                    this.contextEl.lineTo(location.startX + style.endWidth, location.endY);
                    this.contextEl.lineTo(location.startX + style.startWidth, location.startY);
                }
            }
            else {
                this.contextEl.lineTo(location.startX, location.startY);
                this.contextEl.lineTo(location.endX, location.startY);
                if (this.rangePosition == "near") {
                    this.contextEl.lineTo(location.endX, location.startY - style.endWidth);
                    this.contextEl.lineTo(location.startX, location.startY - style.startWidth);
                }
                else {
                    this.contextEl.lineTo(location.endX, location.startY + style.endWidth);
                    this.contextEl.lineTo(location.startX, location.startY + style.startWidth);
                }
            }
            this._contextClosePath(style, this);
        },
		  
        _setCustomLabelCordinates: function (index, element) {
            this._customLblMaxSize = this._customLblMaxSize < parseFloat(element.font.size.match(/\d+/)[0]) ? parseFloat(element.font.size.match(/\d+/)[0]) : this._customLblMaxSize;
            var startX, startY;
            this.contextEl.textAlign = "center";
            if (this.Model.orientation == "Vertical") {
                startX = (this.bounds.width) * ((element.position.x) / 100);
                startY = (this.bounds.height) * ((element.position.y) / 100);
            }
            else {
                startX = (this.bounds.width) * ((element.position.x) / 100);
                startY = (this.bounds.height) * ((element.position.y) / 100);
            }
            this.region = { "lineStaticPosition": this.Model.orientation == "Vertical" ? startX : startY, "lineChangePosition": this.Model.orientation == "Vertical" ? startY : startX }
            this.style = { "angle": element.textAngle, "textValue": element.value, "fillStyle": element.color ? ((element.color == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, element.color)) : ((this.Model.labelColor == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, this.Model.labelColor)), "font": this._getFontString(this, element.font) };
            if (this.Model.drawCustomLabel)
                this._onDrawCustomLabel();
            this._drawLabel(this.region, this.style,true);

            if (this.contextEl.getImageData)
                this.customLabelImage = this.contextEl.getImageData(0, 0, this.Model.width, this.Model.height);
        },
		  
        _drawIndicator: function (index, element) {
            var self = this, xlocation, ylocation, txtLocation, isInStateRange = false;
            xlocation = (this.bounds.width - 2 * element.width) * ((element.position.x) / 100);
            ylocation = (this.bounds.height - 2 * element.height) * ((element.position.y) / 100);
            txtLocation = { "x": (this.bounds.width) * ((element.textLocation.x) / 100), "y": (this.bounds.height) * ((element.textLocation.y) / 100) };
            self.region = { "startX": element.type == "circle" ? xlocation + element.width : xlocation, "textLocation": txtLocation, "startY": element.type == "circle" ? ylocation + element.height : ylocation, "startAngle": 0, "endAngle": 2 * Math.PI };
            self.style = {
                "radius": element.type == "roundedrectangle" ? 2 : 0,
                "strokeStyle": element.border.color ? ((element.border.color == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, element.border.color)) : this._getColor(element, "#FFFFFF"),
                "angle": 0,
                "circleRadius": (element.height + element.width) / 2,
                "height": element.height,
                "width": element.width,
                "lineWidth": element.border.width,
                "fillStyle": element.backgroundColor ? ((element.backgroundColor == "transparent") ? "rgba(0,0,0,0)" : this._getColor(element, element.backgroundColor)) : this._getColor(element, "#FFFFFF"),
                "isStroke": true,
                "isFill": true,
                "indicatorText": null,
                "textColor": null,
                "font": null,
                "counterClockwise": false
            };
            if (this.Model.drawIndicators)
                this._onDrawIndicators(self.style, self.region);
            if (element.stateRanges != null) {
                $.each(element.stateRanges, function (sRIndex, srEl) {  
                    if (self.markerPointerEl[self.markerPointerIndex].value >= srEl.startValue && self.markerPointerEl[self.markerPointerIndex].value <= srEl.endValue) {
                        isInStateRange = true;
                        if (!ej.isNullOrUndefined(srEl.text) && srEl.text.length > 0) {
                            self.style.indicatorText = srEl.text;
                            self.style.textColor = ((srEl.textColor == "transparent") ? "rgba(0,0,0,0)" : self._getColor(element, srEl.textColor));
                            self.style.font = self._getFontString(self, element.font);
                        }
                        if (element.type != "text") {
                            self.style.strokeStyle = ((srEl.borderColor == "transparent") ? "rgba(0,0,0,0)" : self._getColor(element, srEl.borderColor));
                            self.style.fillStyle = ((srEl.backgroundColor == "transparent") ? "rgba(0,0,0,0)" : self._getColor(element, srEl.backgroundColor));
                            self._drawFrame(element.type, self.region, self.style, self);
                        }
                        else if (element.type == "text")
                            self._drawText(self.region, self.style);
                    }
                });
                }
            if (!isInStateRange && element.type != "text")
                this._drawFrame(element.type, self.region, self.style, self);
            if (this.contextEl.getImageData)
                this.indicatorImage = this.contextEl.getImageData(0, 0, this.Model.width, this.Model.height);
        },

        _drawFrame: function (type, location, style) {
            switch (type) {
                case "circle":
                    this._drawFrameCircle(location, style, this);
                    break;
                case "rectangle":
                    this._drawFrameRectangle(location, style, this);
                    break;
                case "roundedrectangle":
                    this._drawFrameRoundedRectangle(location, style, this);
                    break;
                case "thermometer":
                    this._drawFrameThermometer(location,style,this) ;
                    break;
            }
        },
		  
        _drawText: function (location, style) {
            this.contextEl.beginPath();
            this.contextEl.textAlign = "center";
            this.contextEl.fillStyle = ((style.textColor == "transparent") ? "rgba(0,0,0,0)" : style.textColor);
            this.contextEl.font = style.font;
            this.contextEl.fillText(style.indicatorText, location.textLocation.x, location.textLocation.y);
            this.contextEl.closePath();
        },
		  
        _drawTriangle: function (location, style, element) {
            style = this._setPointerDimension(style, element);
            this._contextOpenPath(style, element);
            element.contextEl.translate(location.startX, location.startY);
            this._setContextRotation(style, element);
            element.contextEl.lineTo(0, 0);
            element.contextEl.lineTo(style.width, -style.height / 2);
            element.contextEl.lineTo(style.width, style.height / 2);
            this._contextClosePath(style, element);
        },
		  
        _drawPointer: function (location, style, element) {
            style = this._setPointerDimension(style, element);
            this._contextOpenPath(style, element);
            element.contextEl.translate(location.startX, location.startY);
            this._setContextRotation(style, element);
            element.contextEl.lineTo(style.width, style.height / 4);
            element.contextEl.lineTo(style.width, -style.height / 4);
            element.contextEl.lineTo(style.width / 2, -style.height / 4);
            element.contextEl.lineTo(style.width / 2, -style.height / 2);
            element.contextEl.lineTo(0, 0);
            element.contextEl.lineTo(style.width / 2, style.height / 2);
            element.contextEl.lineTo(style.width / 2, style.height / 4);
            this._contextClosePath(style, element);
        },
		  
        _drawWedge: function (location, style, element) {
            style = this._setPointerDimension(style, element);
            this._contextOpenPath(style, element);
            element.contextEl.translate(location.startX, location.startY);
            this._setContextRotation(style, element);
            element.contextEl.lineTo(0, 0);
            element.contextEl.lineTo(style.width, -style.height / 2);
            element.contextEl.lineTo(3 * style.width / 4, 0);
            element.contextEl.lineTo(style.width, style.height / 2);
            this._contextClosePath(style, element);
        },
		  
        _drawSlider: function (location, style, element) {
            style = this._setPointerDimension(style, element);
            this._contextOpenPath(style, element);
            element.contextEl.translate(location.startX, location.startY);
            this._setContextRotation(style, element);
            element.contextEl.lineTo(0, 0);
            element.contextEl.lineTo(style.width / 4, -style.height / 2);
            element.contextEl.lineTo(style.width, -style.height / 2);
            element.contextEl.lineTo(style.width, style.height / 2);
            element.contextEl.lineTo(style.width / 4, style.height / 2);
            this._contextClosePath(style, element);
        },
		  
        _drawStar: function (location, style, element) {
            this._contextOpenPath(style, element);
            if (element.Model.orientation == "horizontal" && element.markerPlacement == "near") {
                element.contextEl.lineTo(location.startX + style.width - (style.width / 6), location.startY);   
                element.contextEl.lineTo(location.startX, location.startY + style.height - style.height / 3);
                element.contextEl.lineTo(location.startX + style.width, location.startY + style.height - style.height / 3);
                element.contextEl.lineTo(location.startX + style.width / 6, location.startY);
                element.contextEl.lineTo(location.startX + style.width / 2, location.startY + style.height);
            }
            else {
                element.contextEl.lineTo(location.startX + (style.width / 6), location.startY + style.height);   
                element.contextEl.lineTo(location.startX + style.width, location.startY + (style.height / 3));   
                element.contextEl.lineTo(location.startX, location.startY + (style.height / 3));   
                element.contextEl.lineTo(location.startX + style.width - (style.width / 6), location.startY + style.height);   
                element.contextEl.lineTo(location.startX + style.width / 2, location.startY);   
            }
            this._contextClosePath(style, element);
        },
		  
        _drawPentagon: function (location, style, element) {
            style = this._setPointerDimension(style, element);
            this._contextOpenPath(style, element);
            element.contextEl.translate(location.startX, location.startY);
            this._setContextRotation(style, element);
            element.contextEl.lineTo(0, 0);
            element.contextEl.lineTo(style.width / 3, -style.height / 2);
            element.contextEl.lineTo(style.width, -style.height / 4);
            element.contextEl.lineTo(style.width, style.height / 4);
            element.contextEl.lineTo(style.width / 3, style.height / 2);
            this._contextClosePath(style, element);
        },
		  
        _drawDiamond: function (location, style, element) {
            style = this._setPointerDimension(style, element);
            this._contextOpenPath(style, element);
            element.contextEl.translate(location.startX, location.startY);
            this._setContextRotation(style, element);
            element.contextEl.lineTo(0, 0);
            element.contextEl.lineTo(style.width / 2, -style.height / 2);
            element.contextEl.lineTo(style.width, 0);
            element.contextEl.lineTo(style.width / 2, style.height / 2);
            element.contextEl.lineTo(0, 0);
            this._contextClosePath(style, element);
        },
		  
        _drawCircle: function (location, style, element) {
            var radius = Math.sqrt(style.height * style.height + style.width * style.width) / 2;
            style = this._setPointerDimension(style, element);
            this._contextOpenPath(style, element);
            element.contextEl.translate(location.startX, location.startY);
            this._setContextRotation(style, element);
            element.contextEl.arc(radius / 2, 0, radius / 2, 0, Math.PI * 2, true);
            this._contextClosePath(style, element);
        },
		  
        _drawTrapezoid: function (location, style, element) {
            style = this._setPointerDimension(style, element);
            this._contextOpenPath(style, element);
            element.contextEl.translate(location.startX, location.startY);
            this._setContextRotation(style, element);
            element.contextEl.lineTo(0, 0);
            element.contextEl.lineTo(0, -style.height / 4);
            element.contextEl.lineTo(style.width, -style.height / 2);
            element.contextEl.lineTo(style.width, style.height / 2);
            element.contextEl.lineTo(0, style.height / 4);
            this._contextClosePath(style, element);
        },
		  
        _drawRectangle: function (location, style, element) {
            style = this._setPointerDimension(style, element);
            this._contextOpenPath(style, element);
            element.contextEl.translate(location.startX, location.startY);
            this._setContextRotation(style, element);
            element.contextEl.lineTo(0, 0);
            element.contextEl.lineTo(0, -style.height / 2);
            element.contextEl.lineTo(style.width, -style.height / 2);
            element.contextEl.lineTo(style.width, style.height / 2);
            element.contextEl.lineTo(0, style.height / 2);
            this._contextClosePath(style, element);
        },
		  
        _drawRoundedRectangle: function (location, style, element) {
            style = this._setPointerDimension(style, element);
            this._contextOpenPath(style, element);
            element.contextEl.translate(location.startX, location.startY - style.height / 2);
            this._setContextRotation(style, element);
            element.contextEl.lineTo(style.radius, 0);
            element.contextEl.lineTo(style.width - style.radius, 0);
            element.contextEl.quadraticCurveTo(style.width, 0, style.width, style.radius);
            element.contextEl.lineTo(style.width, style.height - style.radius);
            element.contextEl.quadraticCurveTo(style.width, style.height, style.width - style.radius, style.height);
            element.contextEl.lineTo(style.radius, style.height);
            element.contextEl.quadraticCurveTo(0, style.height, 0, style.height - style.radius);
            element.contextEl.lineTo(0, style.radius);
            element.contextEl.quadraticCurveTo(0, 0, style.radius, 0);
            this._contextClosePath(style, element);
        },
		  
        _drawCustomImage: function (element, imageUrl) {
            var image = new Image();
            $(image).on('load', function () {
                element.contextEl.drawImage(this, 0, 0, element.Model.width, element.Model.height);
                if (element.Model.scales != null)
                    element._drawScales();
                if (element.Model.Items != null)
                    element._renderItems();
            }).attr('src', imageUrl);
        },
		  
        _drawEllipse: function (location, style, element) {
            var radius = Math.sqrt(style.height * style.height + style.width * style.width) / 2;
            style = this._setPointerDimension(style, element);
            this._contextOpenPath(style, element);
            element.contextEl.translate(location.startX, location.startY);
            this._setContextRotation(style, element);
            element.contextEl.scale(2, 1);
            element.contextEl.arc(radius / 2, 0, radius / 2, 0, Math.PI * 2, true);
            this._contextClosePath(style, element);
        },
          
		  	
        _getIndicatorImage: function () {
            if (this.pointerImage)
                return this.pointerImage;
            else
                return this._getMarkerPointerImage();
        },
		  	
        _getBarPointerImage: function () {
            if (this.customLabelImage)
                return this.customLabelImage;
            else
                return this._getCustomLabelImage();
        },
		  	
        _getMarkerPointerImage: function () {
            if (this.barPointerImage)
                return this.barPointerImage;
            else
                return this._getCustomLabelImage();
        },
		  	
        _getCustomLabelImage: function () {
            if (this.rangeImage)
                return this.rangeImage;
            else
                return this._getRangeImage();
        },
		  	
        _getRangeImage: function () {
            if (this.labelImage)
                return this.labelImage;
            else
                return this._getLabelImage();
        },
		  	
        _getLabelImage: function () {

            if (this.tickImage)
                return this.tickImage;
            else
                return this._getTickImage();
        },
		  	
        _getTickImage: function () {
            if (this.scaleImage)
                return this.scaleImage;
            else
                return this.outerImage;
        },
		  
        setPointerValue: function (scaleIndex, pointerIndex, value) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].markerPointers.length && value != null) {
            if(value <= this.scaleEl[scaleIndex].maximum && value >= this.scaleEl[scaleIndex].minimum)
                this.scaleEl[scaleIndex].markerPointers[pointerIndex].value = value;
                if (this.contextEl.putImageData) {
                    this.contextEl.putImageData(this._getMarkerPointerImage(), 0, 0);
                    if (!ej.isNullOrUndefined(this.outerDiv) && this.model.scale[scaleIndex].showCustomLabels)
                        this.outerDiv.empty();
                        this._setCustomLabel();
                        this._setMarkerPointers();
                        this._setIndicators();
                }
                else
                    this.initialize();
            }
        },
		  
        getPointerValue: function (scaleIndex, pointerIndex) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].markerPointers.length)
                return this.scaleEl[scaleIndex].markerPointers[pointerIndex].value;
            else
                return null;
        },
		  
        setPointerWidth: function (scaleIndex, pointerIndex, width) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].markerPointers.length && width != null) {
                this.scaleEl[scaleIndex].markerPointers[pointerIndex].width = width;
                if (this.contextEl.putImageData) {
                    if (this.scaleEl[this.scaleIndex].type == "thermometer")
                        this.initialize();
                    else {
                        this.contextEl.putImageData(this._getMarkerPointerImage(), 0, 0);
                        this._setMarkerPointers();
                    }
                }
                else
                    this.initialize();
            }
        },
		  
        getPointerWidth: function (scaleIndex, pointerIndex) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].markerPointers.length)
                return this.scaleEl[scaleIndex].markerPointers[pointerIndex].width;
            else
                return null;
        },
		  
        setPointerHeight: function (scaleIndex, pointerIndex, height) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].markerPointers.length && height != null) {
                this.scaleEl[scaleIndex].markerPointers[pointerIndex].length = height;
                if (this.contextEl.putImageData) {
                    if (this.scaleEl[this.scaleIndex].type == "thermometer")
                        this.initialize();
                    else {
                        this.contextEl.putImageData(this._getMarkerPointerImage(), 0, 0);
                        this._setMarkerPointers();
                    }
                }
                else
                    this.initialize();
            }
        },
		  
        getPointerHeight: function (scaleIndex, pointerIndex) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].markerPointers.length)
                return this.scaleEl[scaleIndex].markerPointers[pointerIndex].length;
            else
                return null;
        },
		  
        _getColor: function (element, option) {
            if (typeof (option) === "string") {
                return option;
            }
            else {
                return ("rgba(" + option.r + ", " + option.g + "," + option.b + ", " + option.a / 255 + ")");
            }
        },
		  
        setPointerDistanceFromScale: function (scaleIndex, pointerIndex, value) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].markerPointers.length && value != null) {
                this.scaleEl[scaleIndex].markerPointers[pointerIndex].distanceFromScale = value;
                if (this.contextEl.putImageData) {
                    if (this.scaleEl[this.scaleIndex].type == "thermometer")
                        this.initialize();
                    else {
                        this.contextEl.putImageData(this._getMarkerPointerImage(), 0, 0);
                        this._setMarkerPointers();
                    }
                }
                else
                    this.initialize();
            }
        },
		  
        getPointerDistanceFromScale: function (scaleIndex, pointerIndex) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].markerPointers.length)
                return this.scaleEl[scaleIndex].markerPointers[pointerIndex].distanceFromScale;
            else
                return null;
        },
		  
        setPointerPlacement: function (scaleIndex, pointerIndex, value) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].markerPointers.length && value != null) {
                this.scaleEl[scaleIndex].markerPointers[pointerIndex].placement = value;
                if (this.contextEl.putImageData) {
                    if (this.scaleEl[this.scaleIndex].type == "thermometer")
                        this.initialize();
                    else {
                        this.contextEl.putImageData(this._getMarkerPointerImage(), 0, 0);
                        this._setMarkerPointers();
                    }
                }
                else
                    this.initialize();
            }
        },
		  
        getPointerPlacement: function (scaleIndex, pointerIndex) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].markerPointers.length)
                return this.scaleEl[scaleIndex].markerPointers[pointerIndex].placement;
            else
                return null;
        },
		  
        setMarkerStyle: function (scaleIndex, pointerIndex, value) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].markerPointers.length && value != null) {
                this.scaleEl[scaleIndex].markerPointers[pointerIndex].type = value;
                if (this.contextEl.putImageData) {
                    if (this.scaleEl[this.scaleIndex].type == "thermometer")
                        this.initialize();
                    else {
                        this.contextEl.putImageData(this._getMarkerPointerImage(), 0, 0);
                        this._setMarkerPointers();
                    }
                }
                else
                    this.initialize();
            }
        },
		  
        getMarkerStyle: function (scaleIndex, pointerIndex) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].markerPointers.length)
                return this.scaleEl[scaleIndex].markerPointers[pointerIndex].type;
            else
                return null;
        },
		  
        setBarPointerValue: function (scaleIndex, pointerIndex, value) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].barPointers.length && value != null) {
            if(value <= this.scaleEl[scaleIndex].maximum && value >= this.scaleEl[scaleIndex].minimum)
                this.scaleEl[scaleIndex].barPointers[pointerIndex].value = value;
                if (this.contextEl.putImageData) {
                    if (this.scaleEl[this.scaleIndex].type == "thermometer")
                        this.initialize();
                    else
                        this._reDrawBarPointer();
                }
                else
                    this.initialize();
            }
        },
		  
        getBarPointerValue: function (scaleIndex, pointerIndex) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].barPointers.length)
                return this.scaleEl[scaleIndex].barPointers[pointerIndex].value;
            else
                return null;
        },
		  
        setBarWidth: function (scaleIndex, pointerIndex, value) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].barPointers.length && value != null) {
                this.scaleEl[scaleIndex].barPointers[pointerIndex].width = value;
                if (this.contextEl.putImageData) {
                    if (this.scaleEl[this.scaleIndex].type == "thermometer")
                        this.initialize();
                    else
                        this._reDrawBarPointer();
                }
                else
                    this.initialize();
            }
        },
		  
        getBarWidth: function (scaleIndex, pointerIndex) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].barPointers.length)
                return this.scaleEl[scaleIndex].barPointers[pointerIndex].width;
            else
                return null;
        },
		  
        setBarDistanceFromScale: function (scaleIndex, pointerIndex, value) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].barPointers.length && value != null) {
                this.scaleEl[scaleIndex].barPointers[pointerIndex].distanceFromScale = value;
                if (this.contextEl.putImageData) {
                    if (this.scaleEl[this.scaleIndex].type == "thermometer")
                        this.initialize();
                    else
                        this._reDrawBarPointer();
                }
                else
                    this.initialize();
            }
        },
		  
        getBarDistanceFromScale: function (scaleIndex, pointerIndex) {
            if (scaleIndex < this.Model.scales.length && pointerIndex < this.Model.scales[scaleIndex].barPointers.length)
                return this.scaleEl[scaleIndex].barPointers[pointerIndex].distanceFromScale;
            else
                return null;
        },
		  
        setCustomLabelValue: function (scaleIndex, customLabelIndex, value) {
            if (scaleIndex < this.Model.scales.length && customLabelIndex < this.Model.scales[scaleIndex].customLabels.length && value != null) {
                this.scaleEl[scaleIndex].customLabels[customLabelIndex].value = value;
                if (this.contextEl.putImageData)
                    this._reDrawCustomLabel();
                else
                    this.initialize();
            }
        },
		  
        getCustomLabelValue: function (scaleIndex, customLabelIndex) {
            if (scaleIndex < this.Model.scales.length && customLabelIndex < this.Model.scales[scaleIndex].customLabels.length)
                return this.scaleEl[scaleIndex].customLabels[customLabelIndex].value;
            else
                return null;
        },
		  
        setCustomLabelAngle: function (scaleIndex, customLabelIndex, value) {
            if (scaleIndex < this.Model.scales.length && customLabelIndex < this.Model.scales[scaleIndex].customLabels.length && value != null) {
                this.scaleEl[scaleIndex].customLabels[customLabelIndex].textAngle = value;
                if (this.contextEl.putImageData)
                    this._reDrawCustomLabel();
                else
                    this.initialize();
            }
        },
		  
        getCustomLabelAngle: function (scaleIndex, customLabelIndex) {
            if (scaleIndex < this.Model.scales.length && customLabelIndex < this.Model.scales[scaleIndex].customLabels.length)
                return this.scaleEl[scaleIndex].customLabels[customLabelIndex].textAngle;
            else
                return null;
        },
		  
        setRangeStartValue: function (scaleIndex, rangeIndex, value) {
            if (scaleIndex < this.Model.scales.length && rangeIndex < this.Model.scales[scaleIndex].ranges.length && value != null) {
                this.scaleEl[scaleIndex].ranges[rangeIndex].startValue = value;
                if (this.contextEl.putImageData)
                    this._reDrawRange();
                else
                    this.initialize();
            }
        },
		  
        getRangeStartValue: function (scaleIndex, rangeIndex) {
            if (scaleIndex < this.Model.scales.length && rangeIndex < this.Model.scales[scaleIndex].ranges.length)
                return this.scaleEl[scaleIndex].ranges[rangeIndex].startValue;
            else
                return null;
        },
		  
        setRangeEndValue: function (scaleIndex, rangeIndex, value) {
            if (scaleIndex < this.Model.scales.length && rangeIndex < this.Model.scales[scaleIndex].ranges.length && value != null) {
                this.scaleEl[scaleIndex].ranges[rangeIndex].endValue = value;
                if (this.contextEl.putImageData)
                    this._reDrawRange();
                else
                    this.initialize();
            }
        },
		  
        getRangeEndValue: function (scaleIndex, rangeIndex) {
            if (scaleIndex < this.Model.scales.length && rangeIndex < this.Model.scales[scaleIndex].ranges.length)
                return this.scaleEl[scaleIndex].ranges[rangeIndex].endValue;
            else
                return null;
        },
		  
        setRangeStartWidth: function (scaleIndex, rangeIndex, value) {
            if (scaleIndex < this.Model.scales.length && rangeIndex < this.Model.scales[scaleIndex].ranges.length && value != null) {
                this.scaleEl[scaleIndex].ranges[rangeIndex].startWidth = value;
                if (this.contextEl.putImageData)
                    this._reDrawRange();
                else
                    this.initialize();
            }
        },
		  
        getRangeStartWidth: function (scaleIndex, rangeIndex) {
            if (scaleIndex < this.Model.scales.length && rangeIndex < this.Model.scales[scaleIndex].ranges.length)
                return this.scaleEl[scaleIndex].ranges[rangeIndex].startWidth;
            else
                return null;
        },
		  
        setRangeEndWidth: function (scaleIndex, rangeIndex, value) {
            if (scaleIndex < this.Model.scales.length && rangeIndex < this.Model.scales[scaleIndex].ranges.length && value != null) {
                this.scaleEl[scaleIndex].ranges[rangeIndex].endWidth = value;
                if (this.contextEl.putImageData)
                    this._reDrawRange();
                else
                    this.initialize();
            }
        },
		  
        getRangeEndWidth: function (scaleIndex, rangeIndex) {
            if (scaleIndex < this.Model.scales.length && rangeIndex < this.Model.scales[scaleIndex].ranges.length)
                return this.scaleEl[scaleIndex].ranges[rangeIndex].endWidth;
            else
                return null;
        },
		  
        setRangeDistanceFromScale: function (scaleIndex, rangeIndex, value) {
            if (scaleIndex < this.Model.scales.length && rangeIndex < this.Model.scales[scaleIndex].ranges.length && value != null) {
                this.scaleEl[scaleIndex].ranges[rangeIndex].distanceFromScale = value;
                if (this.contextEl.putImageData)
                    this._reDrawRange();
                else
                    this.initialize();
            }
        },
		  
        getRangeDistanceFromScale: function (scaleIndex, rangeIndex) {
            if (scaleIndex < this.Model.scales.length && rangeIndex < this.Model.scales[scaleIndex].ranges.length)
                return this.scaleEl[scaleIndex].ranges[rangeIndex].distanceFromScale;
            else
                return null;
        },
		  
        setRangePosition: function (scaleIndex, rangeIndex, value) {
            if (scaleIndex < this.Model.scales.length && rangeIndex < this.Model.scales[scaleIndex].ranges.length && value != null) {
                this.scaleEl[scaleIndex].ranges[rangeIndex].placement = value;
                if (this.contextEl.putImageData)
                    this._reDrawRange();
                else
                    this.initialize();
            }
        },
		  
        getRangePosition: function (scaleIndex, rangeIndex) {
            if (scaleIndex < this.Model.scales.length && rangeIndex < this.Model.scales[scaleIndex].ranges.length)
                return this.scaleEl[scaleIndex].ranges[rangeIndex].placement;
            else
                return null;
        },
		  
        setRangeBorderWidth: function (scaleIndex, rangeIndex, value) {
            if (scaleIndex < this.Model.scales.length && rangeIndex < this.Model.scales[scaleIndex].ranges.length && value != null) {
                this.scaleEl[scaleIndex].ranges[rangeIndex].border.width = value;
                if (this.contextEl.putImageData)
                    this._reDrawRange();
                else
                    this.initialize();
            }
        },
		  
        getRangeBorderWidth: function (scaleIndex, rangeIndex) {
            if (scaleIndex < this.Model.scales.length && rangeIndex < this.Model.scales[scaleIndex].ranges.length)
                return this.scaleEl[scaleIndex].ranges[rangeIndex].border.width;
            else
                return null;
        },
		  
        setLabelAngle: function (scaleIndex, labelIndex, angle) {
            if (scaleIndex < this.Model.scales.length && labelIndex < this.Model.scales[scaleIndex].labels.length && angle != null) {
                this.scaleEl[scaleIndex].labels[labelIndex].angle = angle;
                if (this.contextEl.putImageData) this._reDrawLabel();
                else
                    this.initialize();
            }
        },
		  
        getLabelAngle: function (scaleIndex, labelIndex) {
            if (scaleIndex < this.Model.scales.length && labelIndex < this.Model.scales[scaleIndex].labels.length)
                return this.scaleEl[scaleIndex].labels[labelIndex].angle;
            else
                return null;
        },
		  
        setLabelStyle: function (scaleIndex, labelIndex, value) {
            if (scaleIndex < this.Model.scales.length && labelIndex < this.Model.scales[scaleIndex].labels.length && value != null) {
                this.scaleEl[scaleIndex].labels[labelIndex].type = value;
                if (this.contextEl.putImageData) this._reDrawLabel();
                else
                    this.initialize();
            }
        },
		  
        getLabelStyle: function (scaleIndex, labelIndex) {
            if (scaleIndex < this.Model.scales.length && labelIndex < this.Model.scales[scaleIndex].labels.length)
                return this.scaleEl[scaleIndex].labels[labelIndex].type;
            else
                return null;
        },
		  
        setLabelPlacement: function (scaleIndex, labelIndex, value) {
            if (scaleIndex < this.Model.scales.length && labelIndex < this.Model.scales[scaleIndex].labels.length && value != null) {
                this.scaleEl[scaleIndex].labels[labelIndex].placement = value;
                if (this.contextEl.putImageData) this._reDrawLabel();
                else
                    this.initialize();
            }
        },
		  
        getLabelPlacement: function (scaleIndex, labelIndex) {
            if (scaleIndex < this.Model.scales.length && labelIndex < this.Model.scales[scaleIndex].labels.length)
                return this.scaleEl[scaleIndex].labels[labelIndex].placement;
            else
                return null;
        },
		  
        setLabelXDistanceFromScale: function (scaleIndex, labelIndex, value) {
            if (scaleIndex < this.Model.scales.length && labelIndex < this.Model.scales[scaleIndex].labels.length && value != null) {
                this.scaleEl[scaleIndex].labels[labelIndex].distanceFromScale.x = value;
                if (this.contextEl.putImageData) this._reDrawLabel();
                else
                    this.initialize();
            }
        },
		  
        getLabelXDistanceFromScale: function (scaleIndex, labelIndex) {
            if (scaleIndex < this.Model.scales.length && labelIndex < this.Model.scales[scaleIndex].labels.length)
                return this.scaleEl[scaleIndex].labels[labelIndex].distanceFromScale.x;
            else
                return null;
        },
		  
        setLabelYDistanceFromScale: function (scaleIndex, labelIndex, value) {
            if (scaleIndex < this.Model.scales.length && labelIndex < this.Model.scales[scaleIndex].labels.length && value != null) {
                this.scaleEl[scaleIndex].labels[labelIndex].distanceFromScale.y = value;
                if (this.contextEl.putImageData)
                    this._reDrawLabel();
                else
                    this.initialize();
            }
        },
		  
        getLabelYDistanceFromScale: function (scaleIndex, labelIndex) {
            if (scaleIndex < this.Model.scales.length && labelIndex < this.Model.scales[scaleIndex].labels.length)
                return this.scaleEl[scaleIndex].labels[labelIndex].distanceFromScale.y;
            else
                return null;
        },
		  
        setTickAngle: function (scaleIndex, tickIndex, angle) {
            if (scaleIndex < this.Model.scales.length && tickIndex < this.Model.scales[scaleIndex].ticks.length && angle != null) {
                this.scaleEl[scaleIndex].ticks[tickIndex].angle = angle;
                if (this.contextEl.putImageData) {
                    this._reDrawTickMark();
                }
                else
                    this.initialize();
            }
        },
		  
        getTickAngle: function (scaleIndex, tickIndex) {
            if (scaleIndex < this.Model.scales.length && tickIndex < this.Model.scales[scaleIndex].ticks.length)
                return this.scaleEl[scaleIndex].ticks[tickIndex].angle;
            else
                return null;
        },
		  
        setTickWidth: function (scaleIndex, tickIndex, value) {
            if (scaleIndex < this.Model.scales.length && tickIndex < this.Model.scales[scaleIndex].ticks.length && value != null) {
                this.scaleEl[scaleIndex].ticks[tickIndex].width = value;
                if (this.contextEl.putImageData) {
                    this._reDrawTickMark();
                }
                else
                    this.initialize();
            }
        },
		  
        getTickWidth: function (scaleIndex, tickIndex) {
            if (scaleIndex < this.Model.scales.length && tickIndex < this.Model.scales[scaleIndex].ticks.length)
                return this.scaleEl[scaleIndex].ticks[tickIndex].width;
            else
                return null;
        },
		  
        setTickHeight: function (scaleIndex, tickIndex, value) {
            if (scaleIndex < this.Model.scales.length && tickIndex < this.Model.scales[scaleIndex].ticks.length && value != null) {
                this.scaleEl[scaleIndex].ticks[tickIndex].height = value;
                if (this.contextEl.putImageData) {
                    this._reDrawTickMark();
                }
                else
                    this.initialize();
            }
        },
		  
        getTickHeight: function (scaleIndex, tickIndex) {
            if (scaleIndex < this.Model.scales.length && tickIndex < this.Model.scales[scaleIndex].ticks.length)
                return this.scaleEl[scaleIndex].ticks[tickIndex].height;
            else
                return null;
        },
		  
        setTickStyle: function (scaleIndex, tickIndex, value) {
            if (scaleIndex < this.Model.scales.length && tickIndex < this.Model.scales[scaleIndex].ticks.length && value != null) {
                this.scaleEl[scaleIndex].ticks[tickIndex].type = value;
                if (this.contextEl.putImageData) {
                    this._reDrawTickMark();
                }
                else
                    this.initialize();
            }
        },
		  
        getTickStyle: function (scaleIndex, tickIndex) {
            if (scaleIndex < this.Model.scales.length && tickIndex < this.Model.scales[scaleIndex].ticks.length)
                return this.scaleEl[scaleIndex].ticks[tickIndex].type;
            else
                return null;
        },
		  
        setTickPlacement: function (scaleIndex, tickIndex, value) {
            if (scaleIndex < this.Model.scales.length && tickIndex < this.Model.scales[scaleIndex].ticks.length && value != null) {
                this.scaleEl[scaleIndex].ticks[tickIndex].placement = value;
                if (this.contextEl.putImageData) {
                    this._reDrawTickMark();
                }
                else
                    this.initialize();
            }
        },
		  
        getTickPlacement: function (scaleIndex, tickIndex) {
            if (scaleIndex < this.Model.scales.length && tickIndex < this.Model.scales[scaleIndex].ticks.length)
                return this.scaleEl[scaleIndex].ticks[tickIndex].placement;
            else
                return null;
        },
		  
        setTickXDistanceFromScale: function (scaleIndex, tickIndex, value) {
            if (scaleIndex < this.Model.scales.length && tickIndex < this.Model.scales[scaleIndex].ticks.length && value != null) {
                this.scaleEl[scaleIndex].ticks[tickIndex].distanceFromScale.x = value;
                if (this.contextEl.putImageData) {
                    this._reDrawTickMark();
                }
                else
                    this.initialize();
            }
        },
		  
        getTickXDistanceFromScale: function (scaleIndex, tickIndex) {
            if (scaleIndex < this.Model.scales.length && tickIndex < this.Model.scales[scaleIndex].ticks.length)
                return this.scaleEl[scaleIndex].ticks[tickIndex].distanceFromScale.x;
            else
                return null;
        },
		  
        setTickYDistanceFromScale: function (scaleIndex, tickIndex, value) {
            if (scaleIndex < this.Model.scales.length && tickIndex < this.Model.scales[scaleIndex].ticks.length && value != null) {
                this.scaleEl[scaleIndex].ticks[tickIndex].distanceFromScale.y = value;
                if (this.contextEl.putImageData) {
                    this._reDrawTickMark();
                }
                else
                    this.initialize();
            }
        },
		  
        getTickYDistanceFromScale: function (scaleIndex, tickIndex) {
            if (scaleIndex < this.Model.scales.length && tickIndex < this.Model.scales[scaleIndex].ticks.length)
                return this.scaleEl[scaleIndex].ticks[tickIndex].distanceFromScale.y;
            else
                return null;
        },
		  
        setScaleLocation: function (scaleIndex, value) {
            if (scaleIndex < this.Model.scales.length && value != null) {
                this.scaleEl[scaleIndex].position.x = value.x;
                this.scaleEl[scaleIndex].position.y = value.y;
                this.initialize();
            }
        },
		  
        getScaleLocation: function (scaleIndex) {
            if (scaleIndex < this.Model.scales.length)
                return { "x": this.scaleEl[scaleIndex].position.x, "y": this.scaleEl[scaleIndex].position.y };
            else
                return null;
        },
		  
        setMaximumValue: function (scaleIndex, value) {
            if (scaleIndex < this.Model.scales.length && value != null) {
            if(value > this.scaleEl[scaleIndex].minimum)
                this.scaleEl[scaleIndex].maximum = value;
                this.initialize();
            }
        },
		  
        getMaximumValue: function (scaleIndex) {
            if (scaleIndex < this.Model.scales.length)
                return this.scaleEl[this.scaleIndex].maximum;
            else
                return null;
        },
		  
        setMinimumValue: function (scaleIndex, value) {
            if (scaleIndex < this.Model.scales.length && value != null) {
            if(value < this.scaleEl[scaleIndex].maximum)
                this.scaleEl[scaleIndex].minimum = value;
                this.initialize();
            }
        },
		  
        getMinimumValue: function (scaleIndex) {
            if (scaleIndex < this.Model.scales.length)
                return this.scaleEl[this.scaleIndex].minimum;
            else
                return null;
        },
		  
        setScaleBarSize: function (scaleIndex, value) {
            if (scaleIndex < this.Model.scales.length && value != null) {
                this.scaleEl[scaleIndex].width = value;
                this.initialize();
            }
        },
		  
        getScaleBarSize: function (scaleIndex) {
            if (scaleIndex < this.Model.scales.length)
                return this.scaleEl[scaleIndex].width;
            else
                return null;
        },
		  
        setScaleBarLength: function (scaleIndex, value) {
            if (scaleIndex < this.Model.scales.length && value != null) {
                this.scaleEl[scaleIndex].length = value;
                this.initialize();
            }
        },
		  
        setScaleStyle: function (scaleIndex, value) {
            if (scaleIndex < this.Model.scales.length && value != null) {
                this.scaleEl[scaleIndex].type = value;
                this.initialize();
            }
        },
		  
        getScaleStyle: function (scaleIndex) {
            if (scaleIndex < this.Model.scales.length)
                return this.scaleEl[scaleIndex].type;
            else
                return null;
        },
		  
        getScaleBarLength: function (scaleIndex) {
            if (scaleIndex < this.Model.scales.length)
                return this.scaleEl[scaleIndex].length;
            else
                return null;
        },
		  
        setScaleBorderWidth: function (scaleIndex, value) {
            if (scaleIndex < this.Model.scales.length && value != null) {
                this.scaleEl[scaleIndex].border.width = value;
                this.initialize();
            }
        },
		  
        setScaleDirection: function (scaleIndex, value) {
            if (scaleIndex < this.Model.scales.length && value != null) {
                this.scaleEl[scaleIndex].direction = value;
                this.initialize();
            }
        },
		  
        getScaleDirection: function (scaleIndex) {
            if (scaleIndex < this.Model.scales.length)
                return this.scaleEl[scaleIndex].direction;
            else
                return null;
        },
		  
        getScaleBorderWidth: function (scaleIndex) {
            if (scaleIndex < this.Model.scales.length)
                return this.scaleEl[scaleIndex].border.width;
            else
                return null;
        },
		  
        setMajorIntervalValue: function (scaleIndex, value) {
            if (scaleIndex < this.Model.scales.length && value != null) {
                this.scaleEl[scaleIndex].majorIntervalValue = value;
                this.initialize();
            }
        },
		  
        getMajorIntervalValue: function (scaleIndex) {
            if (scaleIndex < this.Model.scales.length)
                return this.scaleEl[scaleIndex].majorIntervalValue;
            else
                return null;
        },
		  
        setMinorIntervalValue: function (scaleIndex, value) {
            if (scaleIndex < this.Model.scales.length && value != null) {
                this.scaleEl[scaleIndex].minorIntervalValue = value;
                this.initialize();
            }
        },
		  
        getMinorIntervalValue: function (scaleIndex) {
            if (scaleIndex < this.Model.scales.length)
                return this.scaleEl[scaleIndex].minorIntervalValue;
            else
                return null;
        },
		  
        _reDrawBarPointer: function () {
            if (this.Model.frame.backgroundImageUrl) {
                var tmpData = !ej.isNullOrUndefined(this.customLabelImage) ? this.customLabelImage() : !ej.isNullOrUndefined(this.rangeImage) ? this.rangeImage : !ej.isNullOrUndefined(this.labelImage) ? this.labelImage : !ej.isNullOrUndefined(this.tickImage) ? this.tickImage : !ej.isNullOrUndefined(this.scaleImage) ? this.scaleImage : null;
                this.contextEl.putImageData(tmpData, 0, 0);
                this._setBarPointers();
                this._setMarkerPointers();
                this._setIndicators();
            }
            else {
                if (this.contextEl.putImageData != "undefined") {
                    this.contextEl.putImageData(this._getBarPointerImage(), 0, 0);
                    this._setBarPointers();
                    this._setMarkerPointers();
                    this._setIndicators();
                }

            }
        },
		  
        _reDrawMarkerPointer: function () {
            if (this.Model.frame.backgroundImageUrl) {
                var tmpData = !ej.isNullOrUndefined(this.customLabelImage) ? this.customLabelImage() : !ej.isNullOrUndefined(this.rangeImage) ? this.rangeImage : !ej.isNullOrUndefined(this.labelImage) ? this.labelImage : !ej.isNullOrUndefined(this.tickImage) ? this.tickImage : !ej.isNullOrUndefined(this.scaleImage) ? this.scaleImage : null;
                this.contextEl.putImageData(tmpData, 0, 0);
                this._setMarkerPointers();
            }
            else {
                if (this.contextEl.putImageData != "undefined") {
                    this.contextEl.putImageData(this._getMarkerPointerImage(), 0, 0);
                    this._setMarkerPointers();
                }

            }
        },
		  
        _reDrawCustomLabel: function () {
            if (this.Model.frame.backgroundImageUrl) {
                var tmpData = !ej.isNullOrUndefined(this.rangeImage) ? this.rangeImage : !ej.isNullOrUndefined(this.labelImage) ? this.labelImage : !ej.isNullOrUndefined(this.tickImage) ? this.tickImage : !ej.isNullOrUndefined(this.scaleImage) ? this.scaleImage : null;
                this.contextEl.putImageData(tmpData, 0, 0);
                this._setCustomLabel();
                this._setIndicators();
                this._setBarPointers();
                this._setMarkerPointers();
            }
            else {
                this.contextEl.putImageData(this._getCustomLabelImage(), 0, 0);
                this._setCustomLabel();
                this._setIndicators();
                this._setBarPointers();
                this._setMarkerPointers();

            }
        },
		  
        _reDrawRange: function () {
            if (this.Model.frame.backgroundImageUrl) {
                var tmpData = !ej.isNullOrUndefined(this.labelImage) ? this.labelImage : !ej.isNullOrUndefined(this.tickImage) ? this.tickImage : !ej.isNullOrUndefined(this.scaleImage) ? this.scaleImage : null;
                this.contextEl.putImageData(tmpData, 0, 0);
                this._setRange();
                this._setCustomLabel();
                this._setIndicators();
                this._setBarPointers();
                this._setMarkerPointers();
            }
            else {
                this.contextEl.putImageData(this._getRangeImage(), 0, 0);
                this._setRange();
                this._setCustomLabel();
                this._setIndicators();
                this._setBarPointers();
                this._setMarkerPointers();

            }
        },
		  
        _reDrawLabel: function () {
            if (this.Model.frame.backgroundImageUrl){
                var tmpData = !ej.isNullOrUndefined(this.tickImage) ? this.tickImage : !ej.isNullOrUndefined(this.scaleImage) ? this.scaleImage : null;
                this.contextEl.putImageData(tmpData, 0, 0);
                this._setLabels();
                this._setRange();
                this._setCustomLabel();
                this._setIndicators();
                this._setBarPointers();
                this._setMarkerPointers();
            }
            else {
                this.contextEl.putImageData(this._getLabelImage(), 0, 0);
                this._setLabels();
                this._setRange();
                this._setCustomLabel();
                this._setIndicators();
                this._setBarPointers();
                this._setMarkerPointers();

            }
        },
		  
        _reDrawTickMark: function () {
            if (this.Model.frame.backgroundImageUrl) {
                var tmpData = !ej.isNullOrUndefined(this.scaleImage) ? this.scaleImage : null;
                this.contextEl.putImageData(tmpData, 0, 0);
                this._setTicks();
                this._setLabels();
                this._setRange();
                this._setCustomLabel();
                this._setIndicators();
                this._setBarPointers();
                this._setMarkerPointers();
            }
            else {
                this.contextEl.putImageData(this._getTickImage(), 0, 0);
                this._setTicks();
                this._setLabels();
                this._setRange();
                this._setCustomLabel();
                this._setIndicators();
                this._setBarPointers();
                this._setMarkerPointers();

            }
        },
		  
        refresh: function () {
            this._init();
        },
		  
		exportImage: function(fileName, fileType) {
			/// <summary>This function save the rendered canvas image</summary>
            /// <param name="fileName" type="String">fileName to which the image has been saved</param>
		    /// <param name="fileType" type="String">fileType to which the image has been saved</param>
		    if (ej.browserInfo().name === "msie" && parseFloat(ej.browserInfo().version) < 10) {
		        return false;
		    }
		    else {
		        var image = this.canvasEl[0].toDataURL();
		        image = image.replace(/^data:[a-z]*;,/, '');
		        var image1 = image.split(',');
		        var byteString = atob(image1[1]);
		        var buffer = new ArrayBuffer(byteString.length);
		        var intArray = new Uint8Array(buffer);
		        for (var i = 0; i < byteString.length; i++) {
		            intArray[i] = byteString.charCodeAt(i);
		        }
		        var blob = new Blob([buffer], { type: "image/png" });
		        if (ej.browserInfo().name === "msie")
		            window.navigator.msSaveOrOpenBlob(blob, fileName + '.' + fileType);
		        else {
		            var pom = document.createElement('a');
		            var url = URL.createObjectURL(blob);
		            pom.href = url;
		            pom.setAttribute('download', fileName + '.' + fileType);
		            if (document.createEvent) {
		                var e = document.createEvent("MouseEvents");
		                e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		                pom.dispatchEvent(e);
		            }
		            else if (pom.fireEvent) {
		                pom.fireEvent("onclick");
		            }
		        }
		        return true;
		    }
        },
		 
		resizeCanvas: function () {
		    if (_linearGaugeCount != 0)
		        _linearGaugeCount = _linearGaugeCount - 1;
		    else
		        _linearGaugeCount = $(".e-lineargauge").length - 1;
		    var state, chk = true;
		    if (!ej.isNullOrUndefined(this.GaugeEl.parent().attr("style")))
		        state = this.GaugeEl.parent().attr("style").split(";");
		    if (!ej.isNullOrUndefined(state)) {
		        $.each(state, function (key, val) {
		            while (val.indexOf("width") != -1) {
		                chk = val.indexOf("px") == -1 ? true : false;
		                break;
		            }
		        });
		    }
            if (chk) {
                var ratio = window.innerWidth / initialLinearDivWidth;
                this.model.width *=ratio;
				for(var i=0;this.model.scales[i]!=null;i++){
                this.model.scales[i].length *= ratio;
                for (var j = 0; this.model.scales[i].markerPointers[j] != null || this.model.scales[i].barPointers[j] != null || this.model.scales[i].indicators[j] != null || this.model.scales[i].customLabels[j] != null || this.model.scales[i].ranges[j] != null || this.model.scales[i].labels[j] != null || this.model.scales[i].ticks[j] != null; j++) {
                    if (!ej.isNullOrUndefined(this.model.scales[i].markerPointers[j])) {
                        this.model.scales[i].markerPointers[j].length *= ratio;
                        this.model.scales[i].markerPointers[j].width *= ratio;
                    }
                    if (!ej.isNullOrUndefined(this.model.scales[i].barPointers[j])) {
                        this.model.scales[i].barPointers[j].distanceFromScale *= ratio;
                        this.model.scales[i].barPointers[j].width *= ratio;
                    }
                    if (!ej.isNullOrUndefined(this.model.scales[i].indicators[j]) && this.model.scales[i].showIndicators) {
                        this.model.scales[i].indicators[j].height *= ratio;
                        this.model.scales[i].indicators[j].width *= ratio;
                        this.model.scales[i].indicators[j].position.x *= ratio;
                        this.model.scales[i].indicators[j].textLocation.x *= ratio;
                    }
                    if (!ej.isNullOrUndefined(this.model.scales[i].ticks[j])) {
                        this.model.scales[i].ticks[j].length *= ratio;
                        this.model.scales[i].ticks[j].width *= ratio;
                    }
                    if (!ej.isNullOrUndefined(this.model.scales[i].ranges[j])) {
                        this.model.scales[i].ranges[j].startWidth *= ratio;
                        this.model.scales[i].ranges[j].endWidth *= ratio;
                    }
                    if (!ej.isNullOrUndefined(this.model.scales[i].customLabels[j])) {
                        if (this.model.scales[i].customLabels[j].positionType != "outer")
                            this.model.scales[i].customLabels[j].position.x *= ratio;
                        this.model.scales[i].customLabels[j].font.size = (parseFloat(this.model.scales[i].customLabels[j].font.size.match(/\d+/)[0]) * ratio < 10) ? "10px" : ((parseFloat(this.model.scales[i].customLabels[j].font.size.match(/\d+/)[0]) * ratio) > this._customLblMaxSize) ? this._customLblMaxSize.toString() + 'px' : ((parseFloat(this.model.scales[i].customLabels[j].font.size.match(/\d+/)[0])) * ratio).toString() + 'px';
                    }
				}
				}
				//this._initialize();
				this._render();
				if (_linearGaugeCount == 0) {
				    initialLinearDivWidth = window.innerWidth;
				}
            }
        },
        //Client-Side Events
	 
		_onDrawTicks: function (tickAngle, tickValue) {
		    var tick = { index: this.tickIndex, element: this.tickEl[this.tickIndex], angle: parseInt(tickAngle), value: tickValue }
            var data = { Object: this, Model: this.Model, scaleElement: this.Model.scales[this.scaleIndex], scaleIndex: this.scaleIndex, context: this.contextEl, style: this.style, position: this.region };
            this._trigger("drawTicks", data);
        },
		 
		_onDrawLabels: function (labelAngle) {
		    var label = { index: this.labelIndex, element: this.labelEl[this.labelIndex], angle: parseInt(labelAngle), value: this.labelValue }
		    var data = { object: this, Model: this.Model, scaleElement: this.Model.scales[this.scaleIndex], scaleIndex: this.scaleIndex, context: this.contextEl, style: this.style, position: this.region, label: label };
		    this._trigger("drawLabels", data);
		},
		 
        _onDrawBarPointers: function (pointerValue) {
            var data = { object: this, Model: this.Model, scaleElement: this.Model.scales[this.scaleIndex], scaleIndex: this.scaleIndex, barPointerIndex: this.barPointerIndex, barElement: this.barPointerEl[this.barPointerIndex], context: this.contextEl, style: this.style, position: this.region, pointerValue: pointerValue };
            this._trigger("drawBarPointers", data);
        },
		 
        _onDrawMarkerPointers: function (pointerAngle, pointerValue) {
            var data = { object: this, Model: this.Model, scaleElement: this.Model.scales[this.scaleIndex], scaleIndex: this.scaleIndex, markerPointerIndex: this.markerPointerIndex, markerElement: this.markerPointerEl[this.markerPointerIndex], context: this.contextEl, style: this.style, position: this.region, pointerValue: pointerValue, pointerAngle: parseInt(pointerAngle) };
            this._trigger("drawMarkerPointers", data);
        },
		 
        _onDrawRange: function () {
            var data = { object: this, Model: this.Model, scaleElement: this.Model.scales[this.scaleIndex], scaleIndex: this.scaleIndex, rangeIndex: this.rangeIndex, rangeElement: this.rangeEl[this.rangeIndex], context: this.contextEl, style: this.style, position: this.region };
            this._trigger("drawRange", data);
        },
	 
        _onDrawCustomLabel: function () {
            var data = { object: this, Model: this.Model, scaleElement: this.Model.scales[this.scaleIndex], scaleIndex: this.scaleIndex, customLabelIndex: this.customLabelIndex, customLabelElement: this.customLabelEl[this.customLabelIndex], context: this.contextEl, style: this.style, position: this.region };
            this._trigger("drawCustomLabel", data);
        },
		 
        _onDrawIndicators: function (location, style) {
            var data = { object: this, Model: this.Model, scaleElement: this.Model.scales[this.scaleIndex], scaleIndex: this.scaleIndex, indicatorIndex: this.indicatorIndex, indicatorEl: this.indicatorEl[this.indicatorIndex], context: this.contextEl, style: this.style, position: this.region };
            this._trigger("drawIndicators", data);
        },
		 
        onLoad: function () {
            var data = { object: this, Model: this.Model, scaleElement: this.Model.scales, context: this.contextEl };
            this._trigger("load", data);
        },
	 
        _onInit: function () {
            var data = { object: this, Model: this.Model, scaleElement: this.Model.scales, context: this.contextEl };
            this._trigger("init", data);
        },
		 
        _onRenderComplete: function () {
            var data = { object: this, Model: this.Model, scaleElement: this.Model.scales, context: this.contextEl };
            this._trigger("renderComplete", data);
        },
        
        _onMouseClick: function (pointerValue) {
            var markerpointer = { index: this.markerPointerIndex, element: this.markerPointerEl[this.markerPointerIndex], value: pointerValue };
            var data = { object: this, scaleElement: this.model.scales[this.scaleIndex], scaleIndex: this.scaleIndex, context: this.contextEl, style: this.style, position: this.region, markerPointer: markerpointer };
            this._trigger("mouseClick", data);
        },
        
        _onMouseClickMove: function (pointerValue) {
            var markerpointer = { index: this.markerPointerIndex, element: this.markerPointerEl[this.markerPointerIndex], value: pointerValue };
            var data = { object: this, scaleElement: this.model.scales[this.scaleIndex], scaleIndex: this.scaleIndex, context: this.contextEl, style: this.style, position: this.region, markerPointer: markerpointer };
            this._trigger("mouseClickMove", data);
        },
        
        _onMouseClickUp: function (pointerValue) {
            var markerpointer = { index: this.markerPointerIndex, element: this.markerPointerEl[this.markerPointerIndex], value: pointerValue };
            var data = { object: this, scaleElement: this.model.scales[this.scaleIndex], scaleIndex: this.scaleIndex, context: this.contextEl, style: this.style, position: this.region, markerPointer: markerpointer };
            this._trigger("mouseClickUp", data);
        },
        //_trigger: function (type, event, data) {
        //    var fn = this.Model[type];
        //    event = $.Event(event);
        //    event.type = type;
        //    $(this.GaugeEl).trigger(event, data);
        //    return !($.isFunction(fn) &&
        //        fn(this, data) === false ||
        //        event.isDefaultPrevented());
        //},

        //trigger: function (element, eventName, e) {
        //    e = $.extend(e || {}, new $.Event(eventName));
        //    e.stopPropagation();
        //    $(element).trigger(e);
        //    return e.isDefaultPrevented();
        //},
		 
        _restoreWidth: function () {
            this.scaleEl[this.scaleIndex].length = this.scaleEl[this.scaleIndex].length + this.bottomRadius + this.scaleEl[this.scaleIndex].width;
            if (this.Model.orientation == "Vertical") {
                if (this.scaleEl[this.scaleIndex].direction.toLowerCase() == "clockwise")
                    this.scaleStartY[this.scaleIndex] = this.scaleStartY[this.scaleIndex] - this.bottomRadius - this.scaleEl[this.scaleIndex].width / 2;
                else
                    this.scaleStartY[this.scaleIndex] = this.scaleStartY[this.scaleIndex] - this.scaleEl[this.scaleIndex].width / 2;
            }
            else {
                if (this.scaleEl[this.scaleIndex].direction.toLowerCase() == "clockwise")
                    this.scaleStartX[this.scaleIndex] = this.scaleStartX[this.scaleIndex] - this.bottomRadius - this.scaleEl[this.scaleIndex].width / 2;
                else
                    this.scaleStartX[this.scaleIndex] = this.scaleStartX[this.scaleIndex] - this.scaleEl[this.scaleIndex].width / 2;
            }
        },
		 
        _modifyWidth: function () {
            this.scaleEl[this.scaleIndex].length = this.scaleEl[this.scaleIndex].length - this.bottomRadius - this.scaleEl[this.scaleIndex].width;
            if (this.Model.orientation == "Vertical") {
                if (this.scaleEl[this.scaleIndex].direction.toLowerCase() == "clockwise")
                    this.scaleStartY[this.scaleIndex] = this.scaleStartY[this.scaleIndex] + this.bottomRadius + this.scaleEl[this.scaleIndex].width / 2;
                else
                    this.scaleStartY[this.scaleIndex] = this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2;
            }
            else {
                if (this.scaleEl[this.scaleIndex].direction.toLowerCase() == "clockwise")
                    this.scaleStartX[this.scaleIndex] = this.scaleStartX[this.scaleIndex] + this.bottomRadius + this.scaleEl[this.scaleIndex].width / 2;
                else
                    this.scaleStartX[this.scaleIndex] = this.scaleStartX[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2;
            }
        },
        // return y positions for vertical gauge
	 
        _getClockwiseLinePosition: function (value) {
            var tempVal, linePosition;
            tempVal = (value - this.scaleEl[this.scaleIndex].minimum) / (this.scaleEl[this.scaleIndex].maximum - this.scaleEl[this.scaleIndex].minimum) * 100;
            linePosition = this.Model.orientation == "Vertical" ? this.scaleStartY[this.scaleIndex] + parseInt((tempVal * this.scaleEl[this.scaleIndex].length) / 100) : this.scaleStartX[this.scaleIndex] + parseInt((tempVal * this.scaleEl[this.scaleIndex].length) / 100);
            return linePosition;
        },
		 
        _getCounterClockwiseLinePosition: function (value) {
            var tempVal, linePosition;
            tempVal = this.scaleEl[this.scaleIndex].maximum - value + this.scaleEl[this.scaleIndex].minimum;
            tempVal = (tempVal - this.scaleEl[this.scaleIndex].minimum) / (this.scaleEl[this.scaleIndex].maximum - this.scaleEl[this.scaleIndex].minimum) * 100;
            linePosition = this.Model.orientation == "Vertical" ? this.scaleStartY[this.scaleIndex] + parseInt((tempVal * this.scaleEl[this.scaleIndex].length) / 100) : this.scaleStartX[this.scaleIndex] + parseInt((tempVal * this.scaleEl[this.scaleIndex].length) / 100);
            return linePosition;
        },
		 
        _getValue: function (position) {
            var tempVal;
            if (this.Model.orientation == "Vertical")
                tempVal = ((position.y - this.scaleStartY[this.scaleIndex]) / this.scaleEl[this.scaleIndex].length) * 100;
            else
                tempVal = (((position.x - this.scaleStartX[this.scaleIndex])) / this.scaleEl[this.scaleIndex].length) * 100;
            var value = ((tempVal * (this.scaleEl[this.scaleIndex].maximum - this.scaleEl[this.scaleIndex].minimum)) + this.scaleEl[this.scaleIndex].minimum) / 100;
            if (this.scaleEl[this.scaleIndex].direction == "counterclockwise")
                value = this.scaleEl[this.scaleIndex].maximum - value;
            else
                value = this.scaleEl[this.scaleIndex].minimum + value;
            return value;
        },
		 
        _getPointerXPosition: function (element) {
            var startX, angle;
            if (this.Model.orientation == "Vertical") {
                if (this.markerPlacement == "far") {
                    startX = this.scaleStartX[this.scaleIndex] + this.scaleEl[this.scaleIndex].width + this.scaleEl[this.scaleIndex].border.width / 2 + element.distanceFromScale;
                    angle = 0;
                }
                if (this.markerPlacement == "near") {
                    startX = this.scaleStartX[this.scaleIndex] + element.distanceFromScale;
                    angle = 180;
                }
                if (this.markerPlacement == "center") {
                    if (element.type == "circle")
                        startX = this.scaleStartX[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 - (Math.sqrt(element.length * element.length + element.width * element.width) / 2) + element.distanceFromScale;
                    else
                        startX = this.scaleStartX[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 - element.width / 2 + element.distanceFromScale;
                    angle = 0;
                }
            }
            else {
                if (this.markerPlacement == "far") {
                    startX = this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].width + this.scaleEl[this.scaleIndex].border.width / 2 + element.distanceFromScale;
                    angle = 90;
                }
                if (this.markerPlacement == "near") {
                    startX = this.scaleStartY[this.scaleIndex] - this.scaleEl[this.scaleIndex].border.width / 2 + element.distanceFromScale;
                    angle = 270;
                }
                if (this.markerPlacement == "center") {
                    if (element.type == "circle")
                        startX = this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 - (Math.sqrt(element.length * element.length + element.width * element.width) / 2) + element.distanceFromScale;
                    else
                        startX = this.scaleStartY[this.scaleIndex] + this.scaleEl[this.scaleIndex].width / 2 - element.length / 2 + element.distanceFromScale;
                    angle = 90;
                }
            }
            return { "startx": startX, "angle": angle };
        },
		 
        _hexFromRGB: function (r, g, b) {
            var hex = [r.toString(16), g.toString(16), b.toString(16)];
            $.each(hex, function (nr, val) { if (val.length === 1) { hex[nr] = "0" + val; } });
            return hex.join("").toUpperCase();
        },
	 
        _setGradientColor: function (element, gradients, options) {
            if (options.Name || typeof (options) === "string") {
                gradients.addColorStop(0, options);
                gradients.addColorStop(1, options);
            }
            else
                $.each(options, function (index, colorElement) {
                    gradients.addColorStop(colorElement.colorStop != NaN ? colorElement.colorStop : 0, typeof (colorElement.color) === "string" ? colorElement.color : colorElement.color);
                });
        },
		 
        _getFontString: function (element, font) {
            return font.fontStyle + " " + ((font.size == null) ? "11px" : font.size) + " " + font.fontFamily;
        },
	 
        _setPointerDimension: function (style, element) {
            if (element.Model.orientation) {
                if (element.Model.orientation == "horizontal") {
                    var tempWidth = style.width;
                    var tempHeight = style.height;
                    style.height = tempWidth;
                    style.width = tempHeight;
                }
            }
            return style;
        },
		 
        _setContextRotation: function (style, element) {
            element.contextEl.rotate(Math.PI * (style.angle / 180));
        },
        _browserInfo: function () {
            var browser = {}, clientInfo = [],
            browserClients = {
                webkit: /(chrome)[ \/]([\w.]+)/i, safari: /(webkit)[ \/]([\w.]+)/i, msie: /(msie) ([\w.]+)/i,
                opera: /(opera)(?:.*version|)[ \/]([\w.]+)/i, mozilla: /(mozilla)(?:.*? rv:([\w.]+)|)/i
            };
            for (var client in browserClients) {
                if (browserClients.hasOwnProperty(client)) {
                    clientInfo = navigator.userAgent.match(browserClients[client]);
                    if (clientInfo) {
                        browser.name = clientInfo[1].toLowerCase();
                        browser.version = clientInfo[2];
                        if (!!navigator.userAgent.match(/Trident\/7\./)) {
                            browser.name = "msie";
                        }
                        break;
                    }
                }
            }
            browser.isMSPointerEnabled = (browser.name == 'msie') && browser.version > 9 && window.navigator.msPointerEnabled;
            browser.pointerEnabled = window.navigator.pointerEnabled;
            return browser;
        },
        wireEvents: function () {
            var matched = jQuery.uaMatch(navigator.userAgent),
               browserInfo = this._browserInfo(),
               isPointer = browserInfo.isMSPointerEnabled,
               isIE11Pointer = browserInfo.pointerEnabled;
            this.startEv = isPointer ? (isIE11Pointer ? "pointerdown" : "MSPointerDown") : "touchstart mousedown",
            this.endEv = isPointer ? (isIE11Pointer ? "pointerup" : "MSPointerUp") : "touchend mouseup",
            this.moveEv = isPointer ? (isIE11Pointer ? "pointermove" : "MSPointerMove") : "touchmove mousemove",
            this.leaveEv = isPointer ? (isIE11Pointer ? "pointerleave" : "MSPointerOut") : "touchleave mouseleave",
            this.scrollEv = matched.browser.toLowerCase() == "mozilla" ? (isIE11Pointer ? "mousewheel" : "DOMMouseScroll") : "mousewheel";
            this.model.browserInfo = browserInfo;

            var action= this.model.readOnly? 'pan-y pan-x' : 'none';
            $(this.element).css('touch-action', action);

            this.onMouseMoveHandler = $.proxy(this._onMouseMove, this);
            this.onMouseUpHandler = $.proxy(this._onMouseUp, this);
            this.onHoverOCustomLabel = $.proxy(this._onHoverOCustomLabel, this);
            this.onLeaveOCustomLabel = $.proxy(this._onLeaveOCustomLabel, this);
            if (!this.model.readOnly) {
                this.onMouseDownHandler = $.proxy(this._onMouseDown, this);
                this._on($(this.element), this.startEv, this._onMouseDown);
            }

            if (this.model.tooltip.showCustomLabelTooltip || this.model.tooltip.showLabelTooltip) {
                $(this.canvasEl).bind(this.moveEv, this.onMouseMoveHandler);
                $(this.canvasEl).bind(this.scrollEv, this.onMouseMoveHandler);
                $(this.canvasEl).bind(this.startEv, this.onMouseDownHandler);
                $(this.canvasEl).bind(this.endEv, this.onLeaveOCustomLabel);
                $(this.canvasEl).bind(this.leaveEv, this.onLeaveOCustomLabel);
            }
            this.element.bind(this.startEv, this.onMouseDownHandler);
            if (this.model.tooltip.showCustomLabelTooltip) {
                $('.' + this._id + 'outercustomlbl').bind("mouseenter", this.onHoverOCustomLabel);
                $('.' + this._id + 'outercustomlbl').bind(this.leaveEv, this.onLeaveOCustomLabel);
            }
        },
		 
        unWireEvents: function () {
            this.element.unbind(this.startEv, this.onMouseDownHandler);
        },
       
        _onHoverOCustomLabel: function (e) {
            if (e.currentTarget.innerHTML != null || e.currentTarget.innerHTML != "")
                this._showTooltip(e, e.currentTarget.innerHTML);
        },
        
        _onLeaveOCustomLabel: function (evt) {
            if (this.isTouch(evt)) {
                this._performTooltip(evt);
				window.clearTimeout(this.model.timer);
				this.model.timer = setTimeout(function () {
					$('.tooltipDiv').fadeOut(500);
	            }, 1200);
            }
            else {
                this._hideTooltip();
            }
        },
		 
        isTouch: function (evt) {
            var event = evt.originalEvent ? evt.originalEvent : evt;
            if ((event.pointerType == "touch") || (event.pointerType == 2) || (event.type.indexOf("touch") > -1))
                return true;
            return false;
        },

        _blockDefaultActions: function (e) {
            e.cancelBubble = true;
            e.returnValue = false;
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
        },
		 
        _onMouseDown: function (e) {
            var endPoint, position, greaterValue, lesserValue, startX;
            this._blockDefaultActions(e);
            this._mouseDown = true;
            var padding = this.isTouch(e) ? 10 : 0;
            var touch = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
            endPoint = { "x": touch.pageX - $(this.canvasEl).offset().left - (this.Model.frame.outerWidth + this.Model.frame.innerWidth), "y": touch.pageY - $(this.canvasEl).offset().top - (this.Model.frame.outerWidth + this.Model.frame.innerWidth) };
            var self = this;
            if (!this.model.readOnly) {
                $.each(this.Model.scales, function (index, element) {
                    self.scaleIndex = index;
                    if (element.markerPointers != null) {
                        self.markerPointerEl = element.markerPointers;
                        $.each(element.markerPointers, function (mpIndex, mpElement) {
                            if (self.scaleEl[self.scaleIndex].direction.toLowerCase() == "clockwise")
                                position = self._getClockwiseLinePosition(mpElement.value);
                            else
                                position = self._getCounterClockwiseLinePosition(mpElement.value);
                            greaterValue = position + mpElement.width;
                            lesserValue = position - mpElement.width;
                            startX = self._getPointerXPosition(mpElement).startx;
                            var isOffset = self._isBetween(((self.Model.orientation == "horizontal" ? endPoint.y : endPoint.x) - mpElement.width), ((self.Model.orientation == "horizontal" ? endPoint.y : endPoint.x) + mpElement.width), startX, padding);
                            if ((self.Model.orientation == "horizontal" ? self._isBetween(lesserValue, greaterValue, endPoint.x, padding) : self._isBetween(lesserValue, greaterValue, endPoint.y, padding)) && isOffset)
                                self.activeElement = mpElement;
                            if (self.Model.scales[self.scaleIndex].barPointers[mpIndex] != null)
                                self.activeBarElement = self.Model.scales[self.scaleIndex].barPointers[mpIndex];
                            if (self.model.mouseClick)
                                self._onMouseClick(mpElement.value);
                            self.onMouseMoveHandler = $.proxy(self._onMouseMove, self);
                            self.onMouseUpHandler = $.proxy(self._onMouseUp, self);
                            $(document).bind(self.moveEv, self.onMouseMoveHandler);
                            $(document).bind(self.endEv, self.onMouseUpHandler);
                        });
                    }
                });
            }
        },
		 
        _isBetween: function (first, last, number, padding) {
            return (first < last ? number >= first - padding && number <= last + padding : number >= last - padding && number <= first + padding);
        },
		 
        _onMouseUp: function () {
            this._mouseDown = false;
            this.mouseMove = false;
            $(document).unbind(self.moveEv, self.onMouseMoveHandler);
            $(document).unbind(self.endEv, self.onMouseUpHandler);
            if (this.model.mouseClickUp && this.activeElement)
                this._onMouseClickUp(this.activeElement.value);
            this.activeElement = null;
        },
        _mousePosition: function (evt) {
            if (!ej.util.isNullOrUndefined(evt.pageX) && evt.pageX > 0)
                return { x: evt.pageX, y: evt.pageY };
            else if (evt.originalEvent && !ej.util.isNullOrUndefined(evt.originalEvent.pageX) && evt.originalEvent.pageX > 0)
                return { x: evt.originalEvent.pageX, y: evt.originalEvent.pageY };
            else if (evt.originalEvent && evt.originalEvent.changedTouches != undefined) {
                if (!ej.util.isNullOrUndefined(evt.originalEvent.changedTouches[0].pageX) && evt.originalEvent.changedTouches[0].pageX > 0)
                    return { x: evt.originalEvent.changedTouches[0].pageX, y: evt.originalEvent.changedTouches[0].pageY };
            }
            else
                return { x: 0, y: 0 };

        },
        _calTouchPosition: function (e) {
            var matched = jQuery.uaMatch(navigator.userAgent);
            var mouseposition = this._mousePosition(e);
            e.pageX = mouseposition.x;
            e.pageY = mouseposition.y;
        },
        getEvent: function (event) {
            return (event.targetTouches && event.targetTouches[0]) ? event.targetTouches[0] : event
        },
        _onMouseMove: function (e) {
            if (this._mouseDown && !ej.isNullOrUndefined(this.activeElement)) {
                this._blockDefaultActions(e);
                var touch = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
                var endPoint = { "x": touch.pageX - $(this.canvasEl).offset().left - (this.Model.frame.outerWidth + this.Model.frame.innerWidth), "y": touch.pageY - $(this.canvasEl).offset().top - (this.Model.frame.outerWidth + this.Model.frame.innerWidth) };
                this.activeElement.value = this._getValue(endPoint);
                this.value(this.activeElement.value);
                if (this.model.mouseClickMove)
                    this._onMouseClickMove(this.activeElement.value);
                if (this.activeBarElement)
                    this.activeBarElement.value = this._getValue(endPoint);
                if (this.contextEl.putImageData)
                    this._reDrawBarPointer();
                else
                    this._init();
            }
            else {
                if ((this.model.tooltip.showCustomLabelTooltip || this.model.tooltip.showLabelTooltip) && (!this.isTouch(e))) {
                    this._performTooltip(e);
                    
                    
                }
            }
        },

        _performTooltip: function (e) {
            var hit = false;
            var padding = 10;
            var isTouch = this.isTouch(e);
            for (var i = 0; this._savedPoints[i] != null; i++) {
                if (isTouch) {
                    var mousedownCords = this._calTouchPosition(e),
                        pointer = this.getEvent(e),
                        currX = pointer.pageX,
                        currY = pointer.pageY;
                    var current = { "X": currX - $(this.canvasEl).offset().left, "Y": currY - $(this.canvasEl).offset().top };
                    if (current.X > this._savedPoints[i].startX - padding && current.X < (this._savedPoints[i].startX + this._savedPoints[i].width + padding) && current.Y > this._savedPoints[i].startY - padding && current.Y < (this._savedPoints[i].startY + this._savedPoints[i].height + padding)) {
                        this._showTooltip(e, this._savedPoints[i].value);
                        hit = true;
                    }
                    else if (hit == false)
                        this._hideTooltip();
                } else {
                    var current = { "X": e.pageX - $(this.canvasEl).offset().left, "Y": e.pageY - $(this.canvasEl).offset().top };

                    if (current.X > this._savedPoints[i].startX && current.X < (this._savedPoints[i].startX + this._savedPoints[i].width) && current.Y > this._savedPoints[i].startY && current.Y < (this._savedPoints[i].startY + this._savedPoints[i].height)) {
                        this._showTooltip(e, this._savedPoints[i].value);
                        hit = true;
                    }
                    else if (hit == false)
                        this._hideTooltip();
                }
            }
        },
     
        _showTooltip: function (event, val) {
            var tooltipText = val + "";
            var tooltipdiv = $('.tooltipDiv');
            if (tooltipdiv.length == 0) {
                tooltipdiv = $("<div class='tooltipDiv' style='position: absolute; z-index: 105; display: block;'></div>");
                $(document.body).append(tooltipdiv);
            }
            if (this.model.tooltip.templateID != "" && this.model.tooltip.templateID != null) {
                var cloneNode = $("#" + this.model.tooltip.templateID).clone();
                $('.tooltipDiv')[0].innerHTML = "";
                $(cloneNode).css("display", "block").appendTo(tooltipdiv);
                $(tooltipdiv).css({
                    'background-color': this.model.backgroundColor,
                    'border': '1px solid #bbbcbb',
                    'border-radius': '3px',
                    'color': '#565656'
                });
                tooltipdiv.html(tooltipdiv.html().replace('#label#', tooltipText));
            } else {
                $(tooltipdiv).html(tooltipText);
                $(tooltipdiv).css({
                    'background-color': 'white',
                    'border': '2px solid #bbbcbb',
                    'position': 'absolute',
                    'padding': '10px 20px',
                    'margin-top': '5px',
                    'text-align': 'left',
                    'font': '12px Segoe UI',
                    'font-stretch': 'condensed',
                    'display': 'inline-block',
                    'border-radius': '3px',
                    'color': '#565656',
                    'width': 'auto'
                });
            }
            var tooltipMargin = 10;
            var xPos = event.pageX + tooltipMargin;
            var yPos = event.pageY + tooltipMargin;
            xPos = ((xPos + $(tooltipdiv).width()) < $(window).width()) ? (xPos) : (xPos - $(tooltipdiv).width());
            yPos = ((yPos + $(tooltipdiv).height()) < $(window).height()) ? (yPos) : (yPos - $(tooltipdiv).height());
            $(tooltipdiv).css("left", xPos);
            $(tooltipdiv).css("top", yPos);
            $('.tooltipDiv').show();
        },
        
        _hideTooltip: function () {
            $('.tooltipDiv').remove();//.fadeOut(0, "linear");
        },
       
        _setTheme: function () {
            var selectedTheme = this.model.themeProperties[this.model.theme];
            this._setThemeColors(selectedTheme);
        },
		 
        _setThemeColors: function (selectedTheme) {
            var result = [], jsonObj = this.model.themeProperties;
            for (var name in jsonObj) {
                result.push(name);
            }
            for (var th = 0; th < result.length; th++) {
                this.model.backgroundColor = ((!this.model.backgroundColor || this.model.backgroundColor == jsonObj[result[th]].scales.backgroundColor) ? selectedTheme.scales.backgroundColor : this.model.backgroundColor);
                this.model.borderColor = ((!this.model.borderColor || this.model.borderColor == jsonObj[result[th]].scales.border.color) ? selectedTheme.scales.border.color : this.model.borderColor);
                this.model.labelColor = ((!this.model.labelColor || this.model.labelColor == jsonObj[result[th]].scales.labels.labelColor) ? selectedTheme.scales.labels.labelColor : this.model.labelColor);
                this.model.tickColor = ((!this.model.tickColor || this.model.tickColor == jsonObj[result[th]].scales.ticks.color) ? selectedTheme.scales.ticks.color : this.model.tickColor);

                for (var i = 0; i < this.model.scales.length; i++) {
                    for (var m = 0; m < this.model.scales[i].markerPointers.length; m++) {
                        this.model.scales[i].markerPointers[m].backgroundColor = (!this.model.scales[i].markerPointers[m].backgroundColor || this.model.scales[i].markerPointers[m].backgroundColor == jsonObj[result[th]].scales.markerPointers.backgroundColor) ? selectedTheme.scales.markerPointers.backgroundColor : this.model.scales[i].markerPointers[m].backgroundColor;
                        this.model.scales[i].markerPointers[m].border.color = (!this.model.scales[i].markerPointers[m].border.color || this.model.scales[i].markerPointers[m].border.color == jsonObj[result[th]].scales.markerPointers.border.color) ? selectedTheme.scales.markerPointers.border.color : this.model.scales[i].markerPointers[m].border.color;
                    }
                    for (var b = 0; b < this.model.scales[i].barPointers.length; b++) {
                        this.model.scales[i].barPointers[b].backgroundColor = (!this.model.scales[i].barPointers[b].backgroundColor || this.model.scales[i].barPointers[b].backgroundColor == jsonObj[result[th]].scales.barPointers.backgroundColor) ? selectedTheme.scales.barPointers.backgroundColor : this.model.scales[i].barPointers[b].backgroundColor;
                        this.model.scales[i].barPointers[b].border.color = (!this.model.scales[i].barPointers[b].border.color || this.model.scales[i].barPointers[b].border.color == jsonObj[result[th]].scales.barPointers.border.color) ? selectedTheme.scales.barPointers.border.color : this.model.scales[i].barPointers[b].border.color;
                    }
                }
            }
        }
    });
    
    ej.datavisualization.LinearGauge.TickType = {
          
        MajorInterval: "majorinterval",
          
        MinorInterval: "minorinterval"
    };
      
    ej.datavisualization.LinearGauge.LabelType = {
          
        Major: "major",
          
        Minor: "minor"
    };
      
    ej.datavisualization.LinearGauge.FontStyle = {
          
        Bold: "bold",
          
        Italic: "italic",
          
        Regular: "regular",
          
        Strikeout: "strikeout",
          
        Underline: "underline"
    };


      
    ej.datavisualization.LinearGauge.PointerPlacement = {
          
        Near: "near",
          
        Far: "far",
          
        Center: "center"
    };
      
    ej.datavisualization.LinearGauge.TickPlacement = {
          
        Near: "near",
          
        Far: "far",
          
        Center: "center"
    };
      
    ej.datavisualization.LinearGauge.LabelPlacement = {
          
        Near: "near",
          
        Far: "far",
          
        Center: "center"
    };
      
    ej.datavisualization.LinearGauge.RangePlacement = {
          
        Near: "near",
          
        Far: "far",
          
        Center: "center"
    };
      

    ej.datavisualization.LinearGauge.UnitTextPlacement = {
          
        Front: "front",
          
        Back: "back"
    };
      

    ej.datavisualization.LinearGauge.Directions = {
          
        Clockwise: "clockwise",
          
        CounterClockwise: "counterclockwise"
    };
      
    ej.datavisualization.LinearGauge.ScaleType = {
          
        Rectangle: "rectangle",
          
        RoundedRectangle: "roundedrectangle",
          
        Thermometer: "thermometer"
    };
      
    ej.datavisualization.LinearGauge.IndicatorType = {
          
        Rectangle: "rectangle",
          
        Circle: "circle",
          
        RoundedRectangle: "roundedrectangle",
          
        Text: "text"
    };
      
    ej.datavisualization.LinearGauge.MarkerType = {
          
        Rectangle: "rectangle",
          
        Triangle: "triangle",
          
        Ellipse: "ellipse",
          
        Diamond: "diamond",
          
        Pentagon: "pentagon",
          
        Circle: "circle",
          
        Star: "star",
          
        Slider: "slider",
          
        Pointer: "pointer",
          
        Wedge: "wedge",
          
        Trapezoid: "trapezoid",
          
        RoundedRectangle: "roundedrectangle"
    };
      
    ej.datavisualization.LinearGauge.CustomLabelPositionType = {
          
        Inner: "inner",
          
        Outer: "outer"
    };
      
    ej.datavisualization.LinearGauge.OuterCustomLabelPosition = {
          
        Left: "left",
          
        Right: "right",
          
        Top: "top",
          
        Bottom: "bottom",
    };
	  
    ej.datavisualization.LinearGauge.Themes = {
	  
        FlatLight: 'flatlight',

		FlatDark: 'flatdark'
    };

})(jQuery, Syncfusion);
;;