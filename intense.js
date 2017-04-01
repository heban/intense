/**
 *
 * Intense
 * Hybrydowy framework dla gier HTML5
 * @version 0.7
 * @author Paweł Ochota
 *
 */

;(function (window, intense, undefined) {
	"use strict";
	var VERSION = "0.7",
		_FPS = 60,
		_serverFPS = 30,
		_initialize = false,
		_netSystems = true,
		_isString,
		_isFunction,
		_isArray,
		_isPlainObject,
		_isNumber,
		_isSet,
		_isNull,
		_isObjectEmpty,
		_isNode,
		_addEvent,
		_removeEvent,
		_deepCopy,
		_extend,
		_eventManager,
		_bind,
		_getCurrentTime,
		_animationFrame,
		_clearAnimationFrame,
		_clamp,
		_arrayIntersect,
		_arrayUnique,
		_arrayMerge,
		_arrayDiff,
		_arrayMap,
		_inArray,
		_serializeJSON,
		_sameOrigin,
		_keys,
		_lerp,
		_JSONH,
		_RJSON,
		_LZW;

	/**
	 * intense - przestrzeń nazw dla frameworka
	 * @namespace
	 */
	intense = intense || {};
		
	/* --- funkcje pomocnicze --- */

	/**
	 * _isString - sprawdza czy podany obiekt jest typu string
	 * @param {object} ob - dowolny obiekt
	 * @return {boolean} true lub false
	 */
	_isString = function (ob) {
		if (typeof ob === 'string') {
			return true;
		}
		return false;
	};

	/**
	 * _isFunction - sprawdza czy podany obiekt jest funkcją
	 * @param {object} ob - dowolny obiekt
	 * @return {boolean} true lub false
	 */
	_isFunction = function (ob) {
		if (typeof ob === 'function') {
			return true;
		}
		return false;
	};
	
	/**
	 * _isArray - sprawdza czy podany obiekt jest tablicą
	 * @param {object} ob - dowolny obiekt
	 * @return {boolean} true lub false
	 */
	_isArray = (function () {
		var _is;
		if (typeof Array.isArray !== 'undefined') {
			_is = function (ob) {
				return Array.isArray(ob);
			};
		} else {
			_is = function (ob) {
				return (Object.prototype.toString.call(ob) === '[object Array]');
			};
		}
		return function (ob) {
			return _is(ob);
		};
	}());
	
	/**
	 * _isPlainObject - sprawdza czy podany obiekt jest literałem obiektowym
	 * @param {object} ob - dowolny obiekt
	 * @return {boolean} true lub false
	 */
	_isPlainObject = function (ob) {
		return (ob && typeof ob === 'object' && ob.constructor == Object);
	};
	
	/**
	 * _isNumber - sprawdza czy podany obiekt jest typu number
	 * @param {object} ob - dowolny obiekt
	 * @return {boolean} true lub false
	 */
	_isNumber = function (ob) {
		if (typeof ob === 'number') {
			return true;
		}
		return false;
	};

	/**
	 * _isSet - sprawdza czy podany argument istnieje
	 * @param {object} ob - dowolny obiekt
	 * @return {boolean} true lub false
	 */
	_isSet = function (ob) {
		if (typeof ob !== 'undefined') {
			return true;
		}
		return false;
	};

	/**
	 * _isNull - sprawdza czy podany argument jest nullem
	 * @param {object} ob - dowolny obiekt
	 * @return {boolean} true lub false
	 */
	_isNull = function (ob) {
		if (ob === null) {
			return true;
		}
		return false;
	};

	/**
	 * _isObjectEmpty - sprawdza czy podany obiekt jest pusty
	 * @param {object} ob - dowolny obiekt
	 * @return {boolean} true lub false
	 */
	_isObjectEmpty = function (ob) {
		var i;
		for (var i in ob) {
        	if (ob.hasOwnProperty(i)) {
	       		return false;
	       	}
		}

    	return true;
	};

	/**
	 * _isNode - sprawdza czy framework został uruchomiony w Node.js
	 * @return {boolean} true lub false
	 */
	_isNode = function () {
		if (typeof module !== 'undefined' && module.exports) {
			return true;
		}
		return false;
	}

	/**
	 * _deepCopy - wykonuje głęboką kopie właściwości/obiektu
	 * @param {object} d - cel kopiowania
	 * @param {object} s - źródło kopiowania
	 * @return {object} nowy obiekt
	 */
	_deepCopy = function (d, s) {
		var i,
			d = d || {};

		for (i in s) {
			if (s.hasOwnProperty(i)) {
				if (typeof s[i] === 'object') {
					d[i] = _isArray ? [] : {};
					_deepCopy(d[i], s[i]);
				} else {
					d[i] = s[i];
				}
			}
		}
		return d; 
	};

	/**
	 * _extend - dziedziczenie prototypu (wg pomysłu Stoyana Stefanowa)
	 * @param {object} c - konstruktor, który odziedziczy prototyp
	 * @param {object} p - konstruktor z którego dziedziczony jest prototyp
	 */
	_extend = (function (c, p) {
		var F = function () {};
		return function () {
			F.prototype = p.prototype;
			c.prototype = new F();
			c.prototype.constructor = c;
		};
	}());

	/**
	 * _addEvent - proste dodawanie zdarzeń
	 * @param {String} elem - element którego zdarzenie dotyczy
	 * @param {object} type - typ zdarzenia
	 * @param {object} fn - funkcja, która zostanie wywołana w momencie zdarzenia
	 */
	_addEvent = (function () {
		var _event;
		if (_isFunction(window.addEventListener)) {
			_event = function (elem, type, fn) {
				elem.addEventListener(type, fn, false);
			};
		} else if (_isFunction(window.attachEvent)) {
			_event = function (elem, type, fn) {
				elem.attachEvent('on' + type, fn);
			};
		} else {
			_event = function (elem, type, fn) {
				elem['on' + type] = fn;
			};
		}
		return _event;
	}());

	/**
	 * _removeEvent - usuwa zdarzenia
	 * @param {String} elem - element którego zdarzenie dotyczy
	 * @param {object} type - typ zdarzenia
	 * @param {object} fn - funkcja, która zostanie wywołana w momencie usunięcia zdarzenia
	 */
	_removeEvent = (function () {
		var _event;
		if (_isFunction(window.removeEventListener)) {
			_event = function (elem, type, fn) {
				elem.removeEventListener(type, fn, false);
			};
		} else if (_isFunction(window.detachEvent)) {
			_event = function (elem, type, fn) {
				elem.detachEvent('on' + type, fn);
			};
		} else {
			_event = function (elem, type, fn) {
				elem['on' + type] = null;
			};
		}
		return _event;
	}());

	/**
	 * _eventManager - zarządzanie własnymi zdarzeniami, obserwator
	 * Modyfkacja rozwiązania Stefana Stoyanova.
	 */
	_eventManager = (function () {
		var _listen, _notify, _remove, _register, 
			_registerListeners,
			_removeByType,
			_getTypesOfListeners,
			register_listeners = [],
			listeners = {},

		/**
		 * _listen - nasłuchuje na podane zdarzenie
		 */
		_listen = function (type, fn, context) {
			fn = typeof fn === 'function' ? fn : context[fn];
			if (!_isSet(listeners[type])) {
				listeners[type] = [];
			}

		    listeners[type].push({ fn: fn, context: context});
		};

		/**
		 * _register - rejestruje zdarzenie ale nie nasłuchuje
		 */
		_register = function (type, fn, context) {
		    register_listeners.push({type: type, fn: fn, context: context});
		};

		/**
		 * _registerListeners - nasłuchuje zarejestrowane zdarzenia
		 */
		_registerListeners = function () {
		    var i, length = register_listeners.length;
		    for (i = 0; i < length; i++) {
		        _eventManager.listen(register_listeners[i].type, register_listeners[i].fn, register_listeners[i].context);
		    }
		};

		/**
		 * _notify - wywołuje podane zdarzenie
		 */
		_notify = function (type, arg) {
			var _listeners = listeners[type],
		        i, length = _listeners ? _listeners.length : 0;

		    for (i = 0; i < length; i++) {
		        _listeners[i].fn.call(_listeners[i].context, arg);
		    }
		};

		/**
		 * _remove - usuwa nasłuchiwanie zdarzenia
		 */
		_remove = function (type, fn, context) {
			var _listeners = listeners[type],
		        i, length = _listeners ? _listeners.length : 0;
			fn = typeof fn === 'function' ? fn : context[fn];

			while (length--) {
				if (_listeners[length].fn === fn && _listeners[length].context === context) {
		        	_listeners.splice(length, 1);
            	}
			}
		};

		/**
		 * _removeByType - usuwa zdarzenia danego typu
		 */
		_removeByType = function (type) {
			if (_isSet(listeners[type])) {
				listeners[type] = [];
			}
		};

		/**
		 * _getTypesOfListeners - Zwraca tablicę typów zarejestrowanych zdarzeń
		 * @return {Array} tablica typów zdarzeń
		 */
		_getTypesOfListeners = function () {
			var _tab = [];

			for (i in listeners) {
				if (listeners.hasOwnProperty(i)) {
					_tab.push(i);
				}
			}

			return _tab;
		};

		return {
			listen: _listen,
			notify: _notify,
			remove: _remove,
			removeByType: _removeByType,
			register: _register,
			registerListeners: _registerListeners,
			getTypesOfListeners: _getTypesOfListeners
		};
	}());
	
	/**
	 * _bind - wiąże przekazaną metodę z przekazanym obiektem i ją zwraca
	 * @param {object} ob - dowolny obiekt
	 * @param {Function} method - dowolna metoda
	 * @return {Function} nowa funkcja
	 */
	_bind = function (ob, method) {
		return function () {
			return method.apply(ob, [].slice.call(arguments));
		};
	};
	
	/**
	 * _getCurrentTime - pobiera aktualny czas systemu w milisekundach
	 * @return {Number} aktualny timestamp
	 */
	_getCurrentTime = (function () {
		var perform, now;

		perform = window.performance || {};
		now = perform.now ||
	        perform.mozNow ||
	        perform.msNow ||
	        perform.oNow ||
	        perform.webkitNow || null;
	    
	    if (!now) {
	    	if (_isSet(window.mozAnimationStartTime)) {
	    		return function() { return window.mozAnimationStartTime; };
	    	} else if (_isSet(Date.now)) {
	    		return function() { return Date.now(); };
	    	} else {
	    		return function() { return new Date().getTime(); };
	    	}
	    }

	    return _bind(window.performance, now);
	}());

	/**
	 * _animationFrame - funkcja renderowania, modyfikacja metody Paula Irisha
	 */
	_animationFrame = (function () {
		var anim = window.requestAnimationFrame ||
        	window.webkitRequestAnimationFrame ||
        	window.mozRequestAnimationFrame ||
        	window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame || 
            null;

        if (!anim) {
        	var lastTime = 0;
	        return function (callback, element) {
	        	var frame_time = _FPS/1000;
	            var currTime = Date.now(), timeToCall = Math.max( 0, frame_time - ( currTime - lastTime ) );
	            var id = setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
	            lastTime = currTime + timeToCall;
	            return id;
	        };
        	// return function (callback) {
	        // 	return setTimeout(callback, 1000 / _FPS);
	        // };
        }

        return function (callback) {
        	anim.call(window, callback); 
        };
	}());

	/**
	 * _clearAnimationFrame - czyszczenie funkcji renderowania
	 */
	_clearAnimationFrame = (function () {
		return window.cancelAnimationFrame ||
        	window.webkitCancelAnimationFrame ||
        	window.mozCancelAnimationFrame ||
        	window.oCancelAnimationFrame ||
        	function (id) {
            	clearTimeout(id);
        	};
	}());

	/**
	 * _clamp - obcięcie pierwszego parametru do przedziału wyznaczonego
	 * przez drugi i trzeci
	 * @param {Number} pierwszy parametr - będzie przycięty
	 * @param {Number} pierwszy element przedziału
	 * @param {Number} ostatni element przedziału
	 * @return {Number} przycięty parametr
	 */
	_clamp = function (param1, param2, param3) {
		return Math.min(param3, Math.max(param1, param2));
	};

	/**
	 * _arrayIntersect - część wspólna dwóch tablic
	 * @param {Array} a - pierwsza tablica
	 * @param {Array} b - druga tablica
	 * @return {Array} result - tablica wspólnych wartości
	 */
	_arrayIntersect = function (a, b) {
		var ai = 0,
			bi = 0, 
			result = [],
			_length1 = a.length,
			_length2 = b.length;

		while(ai < _length1 && bi < _length2) {
			if (a[ai] < b[bi] ) { 
				ai++; 
			} else if (a[ai] > b[bi] ) { 
				bi++; 
			} else {
				result.push(a[ai]);
				ai++;
				bi++;
			}
		}

		return result;
	};

	/**
	 * _arrayUnique - zwraca unikalne wartości z tablicy
	 * @param {Array} tab - tablica
	 * @return {Array} a - tablica unikalnych wartości
	 */
	_arrayUnique = function (tab) {
		var u = {}, a = [], 
			i, _length = tab.length;
		
		for (i = 0; i < _length; ++i) {
			if (u.hasOwnProperty(tab[i])) {
				continue;
			}
			a.push(tab[i]);
			u[tab[i]] = 1;
		}

		return a;
	};

	/**
	 * _arrayMerge - złącza tablice
	 * @param {Array} arguments - lista tablic
	 * @return {Array} a - złączona tablica
	 */
	_arrayMerge = function () {
		var i, a = [], _length = arguments.length;
		
		for (i = 0; i < _length; ++i) {
			a = a.concat(arguments[i]);
		}
		
		return a;
	};

	/**
	 * _arrayDiff - różnica tablic. Wg pomysłu Radu Cotescu.
	 * @param {Array} a1 - tablica
	 * @param {Array} a2 - tablica
	 * @return {Array} diff - tablica powstała z różnicy tablic a i b
	 */
	_arrayDiff = function (a1, a2) {
		var a = [], diff = [],
			_aLength = a1.length,
			_bLength = a2.length,
			i = 0, k;

		for (i = 0; i < _aLength; i++) {
			a[a1[i]] = a1[i];
		}
		for (i = 0; i < _bLength; i++) {
			if (a[a2[i]]) { 
				delete a[a2[i]];
			} else { 
				a[a2[i]] = a2[i];
			}
		}

		for (var k in a) {
			if (a.hasOwnProperty(k)){
				diff.push(a[k]);
			}
		}

		return diff;
	};

	/**
	 * _arrayMap - tworzy nową tablice z elementów zmienionych poprzez przekazany callback
	 * @param {Function} callback - funkcja do przekazania
	 * @param {object} context - kontekst dla callbacka
	 * @return {Array} nowa tablica
	 */
	_arrayMap = Array.map || function (callback, context) {
		for (var self = this, i = self.length, result = new Array(i); i--;
			result[i] = callback.call(context, self[i], i, self));
		return result;
	};

	/**
	 * _inArray - sprawdza czy w podanej tablicy znajduje się dany element
	 * @param {Array} tab - tablica
	 * @param {object} elem - element do sprawdzenia
	 * @return {Boolean} true lub false
	 */
	_inArray = function (tab, elem) {
		var i, _length = tab.length;
		
		for (i = 0; i < _length; i++) {
			if (tab[i] === elem) {
				return true;
			}
		}
		
		return false;
	};

	/**
	 * _serializeJSON - serializuje JSONa np. do wysłania ajaxem
	 * @param {object} json - obiekt do serializacji
	 * @return {String} serializowany JSON
	 */
	_serializeJSON = function (json) {
		var _temp = [], i;

		for (i in json) {
			_temp.push(i + "=" + window.encodeURIComponent(json[i]));
		}

		return _temp.join("&");
	};

	/**
	 * _sameOrigin - sprawdza czy podany url ma tą samą domenę co adres zawierający skrypt
	 * @param {String} url - adres url do sprawdzenia
	 * @return {Boolean} true lub false
	 */
	_sameOrigin = function (url) {
		var loc = window.location,
			a = document.createElement('a');

    	a.href = url;

		return a.hostname == loc.hostname &&
			a.port == loc.port &&
			a.protocol == loc.protocol;
	};

	/**
	 * _keys - zwraca tablicę kluczy/właściwości obiektu
	 * @param {object} o - dowolny obiekt
	 * @return {Array} tablica kluczy
	 */
	_keys = Object.keys || function (o) {
		var keys = [], key;
		for (key in o) o.hasOwnProperty(key) && keys.push(key);
	    return keys;
	};
	
	/**
	 * _JSONH - metoda kompresji tablicy obiektów JSON. Autor: Andrea Giammarchi
	 * Zmodyfikowano na potrzeby intense
	 */
	_JSONH = (function () {
	    /**
	     * Copyright (C) 2011 by Andrea Giammarchi, @WebReflection
	     * 
	     * Permission is hereby granted, free of charge, to any person obtaining a copy
	     * of this software and associated documentation files (the "Software"), to deal
	     * in the Software without restriction, including without limitation the rights
	     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	     * copies of the Software, and to permit persons to whom the Software is
	     * furnished to do so, subject to the following conditions:
	     * 
	     * The above copyright notice and this permission notice shall be included in
	     * all copies or substantial portions of the Software.
	     * 
	     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	     * THE SOFTWARE.
	     */
	    
	    var _hpack,
	        _hunpack,
	        _iteratingWith,
	        _packOrUnpack,
	        _pack, _unpack,
	        _stringify, _parse,
	        packSchema,
	        unpackSchema,
	        arr = [], concat = arr.concat,
	        Object_keys = Object.keys || function (o) {
	            var keys = [], key;
	            for (key in o) o.hasOwnProperty(key) && keys.push(key);
	            return keys;
	        },
	        JSON_stringify = JSON.stringify,
	        JSON_parse = JSON.parse;

	    // transforms [{a:"A"},{a:"B"}] to [1,"a","A","B"]
	    _hpack = function (list) {
	    	for (var
	            length = list.length,
	            keys = Object_keys(length ? list[0] : {}),
	            klength = keys.length,
	            result = new Array(length * klength),
	            i = 0,
	            j = 0,
	            ki, o;
	            i < length; ++i
	        ) {
	            for (
	                o = list[i], ki = 0;
	                ki < klength;
	                result[j++] = o[keys[ki++]]
	            );
	        }
	        return concat.call([klength], keys, result);
	    };

	    // transforms [1,"a","A","B"] to [{a:"A"},{a:"B"}]
	    _hunpack = function (hlist) {
	        for (var
	            length = hlist.length,
	            klength = hlist[0],
	            result = new Array(((length - klength - 1) / klength) || 0),
	            i = 1 + klength,
	            j = 0,
	            ki, o;
	            i < length;
	        ) {
	            for (
	                result[j++] = (o = {}), ki = 0;
	                ki < klength;
	                o[hlist[++ki]] = hlist[i++]
	            );
	        }
	        return result;
	    };

	    // recursive: called via map per each item h(pack|unpack)ing each entry through the schema
	   	_iteratingWith = function (method) {
	        return function iterate(item) {
	            for (var
	                path = this,
	                current = item,
	                i = 0, length = path.length,
	                j, k, tmp;
	                i < length; ++i
	            ) {
	                if (_isArray(tmp = current[k = path[i]])) {
	                    j = i + 1;
	                    current[k] = j < length ?
	                        _arrayMap.call(tmp, method, path.slice(j)) :
	                        method(tmp)
	                    ;
	                }
	                current = current[k];
	            }
	            return item;
	        };
	    };

	    // called per each schema (pack|unpack)ing each schema
	    _packOrUnpack = function (method) {
	        return function parse(o, schema) {
	            for (var
	                wasArray = _isArray(o),
	                result = concat.call(arr, o),
	                path = concat.call(arr, schema),
	                i = 0, length = path.length;
	                i < length; ++i
	            ) {
	                result = _arrayMap.call(result, method, path[i].split("."));
	            }
	            return wasArray ? result : result[0];
	        };
	    };

	    _pack = function (list, schema) {
	   		if (!_isArray(list)) {
	   			list = [list];
	   		}
	        return schema ? packSchema(list, schema) : _hpack(list);
	    };

	    _unpack = function (hlist, schema) {
			var value = schema ? unpackSchema(hlist, schema) : _hunpack(hlist);
			if (value.length == 1) {
				return value[0];
			}
			return value;
	    };

	    _stringify = function (list, replacer, space, schema) {
	    	if (!_isArray(list)) {
	   			list = [list];
	   		}
	        return JSON_stringify(_pack(list, schema), replacer, space);
	    };

	    _parse = function (hlist, reviver, schema) {
	        var value = _unpack(JSON_parse(hlist, reviver), schema);
	        if (value.length == 1) {
				return value[0];
			}
			return value;
	    };

	    packSchema = _packOrUnpack(_iteratingWith(_hpack)),
	    unpackSchema = _packOrUnpack(_iteratingWith(_hunpack));

	    return {
	        pack: _pack,
	        parse: _parse,
	        stringify: _stringify,
	        unpack: _unpack
	    };
	}());
	
	/**
	 * _RJSON - kompresja obiektów JSON. Autor: Dmytro V. Dogadailo
	 * Zmodyfikowano na potrzeby intense
	 */
	_RJSON = (function() {
		// Copyright (c) 2012, Dmytro V. Dogadailo <entropyhacker@gmail.com>

		// Permission to use, copy, modify, and/or distribute this software for any purpose with or without 
		// fee is hereby granted, provided that the above copyright notice and this permission notice appear 
		// in all copies. THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH 
		// REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. 
		// IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL 
		// DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN 
		// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION 
		// WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

	    var hasOwnProperty = Object.prototype.hasOwnProperty,
		    toString = Object.prototype.toString,
		    getKeys = _keys,
		    _pack, _unpack,
		    _isEncodedObject;

	    /**
	     * @param {*} Any valid for JSON javascript data.
	     * @return {*} Packed javascript data, usually a dictionary.
	     */
	    _pack = function (data) {
	        var schemas = {}, maxSchemaIndex = 0,
	        	encodeArray, encodeObject, encode;

	        encodeArray = function (value) {
	            var len = value.length, encoded = [];
	            if (len === 0) return [];
	            if (typeof value[0] === 'number') {
	                encoded.push(0);
	            }
	            for (var i = 0; i < len; i++) {
	                var v = value[i],
	                current = encode(v),
	                last = encoded[encoded.length - 1];
	                if (_isEncodedObject(current) &&
	                    _isArray(last) && current[0] === last[0]) {
	                    encoded[encoded.length - 1] =
	                        last.concat(current.slice(1));
	                } else {
	                    encoded.push(current);
	                }
	            }
	            return encoded;
	        };

	        encodeObject = function (value) {
	            var schemaKeys = getKeys(value).sort();
	            if (schemaKeys.length === 0) {
	                return {};
	            }
	            var encoded,
	            schema = schemaKeys.length + ':' + schemaKeys.join('|'),
	            schemaIndex = schemas[schema];
	            if (schemaIndex) {
	                encoded = [schemaIndex];
	                for (var i = 0, k; k = schemaKeys[i++]; ) {
	                    encoded[i] = encode(value[k]);
	                }
	            } else {
	                schemas[schema] = ++maxSchemaIndex;
	                encoded = {};
	                for (var i = 0, k; k = schemaKeys[i++]; ) {
	                    encoded[k] = encode(value[k]);
	                }
	            }
	            return encoded;
	        };

	        encode = function (value) {
	            if (typeof value !== 'object' || !value) {
	                return value;
	            } else if (_isArray(value)) {
	                return encodeArray(value);
	            } else {
	                return encodeObject(value);
	            }
	        };

	        return encode(data);
	    };

	    /**
	     * @param {*} data Packed javascript data.
	     * @return {*} Original data.
	     */
	    _unpack = function (data) {
	        var schemas = {}, maxSchemaIndex = 0,
	        	parseArray, decodeArray, decodeObject,
	        	decodeNewObject, decode;

	        parseArray = function (value) {
	            if (value.length === 0) {
	                return [];
	            } else if (value[0] === 0 || typeof value[0] !== 'number') {
	                return decodeArray(value);
	            } else {
	                return decodeObject(value);
	            }
	        };

	        decodeArray = function (value) {
	            var len = value.length, decoded = []; // decode array of something
	            for (var i = (value[0] === 0 ? 1 : 0); i < len; i++) {
	                var v = value[i], obj = decode(v);
	                if (_isEncodedObject(v) && _isArray(obj)) {
	                    // several objects was encoded into single array
	                    decoded = decoded.concat(obj);
	                } else {
	                    decoded.push(obj);
	                }
	            }
	            return decoded;
	        };

	        decodeObject = function (value) {
	            var schemaKeys = schemas[value[0]],
	            schemaLen = schemaKeys.length,
	            total = (value.length - 1) / schemaLen,
	            decoded;
	            if (total > 1) {
	                decoded = []; // array of objects with same schema
	                for (var i = 0; i < total; i++) {
	                    var obj = {};
	                    for (var j = 0, k; k = schemaKeys[j++]; ) {
	                        obj[k] = decode(value[i * schemaLen + j]);
	                    }
	                    decoded.push(obj);
	                }
	            } else {
	                decoded = {};
	                for (var j = 0, k; k = schemaKeys[j++]; ) {
	                    decoded[k] = decode(value[j]);
	                }
	            }
	            return decoded;
	        };

	        decodeNewObject = function (value) {
	            var schemaKeys = getKeys(value).sort();
	            if (schemaKeys.length === 0) {
	                return {};
	            }
	            schemas[++maxSchemaIndex] = schemaKeys;
	            var decoded = {};
	            for (var i = 0, k; k = schemaKeys[i++]; ) {
	                decoded[k] = decode(value[k]);
	            }
	            return decoded;
	        };

	        decode = function (value) {
	            if (typeof value !== 'object' || !value) {
	                return value;
	            } else if (_isArray(value)) {
	                return parseArray(value);
	            } else {
	                return decodeNewObject(value);
	            }
	        };

	        return decode(data);
	    };

	    _isEncodedObject = function (value) {
	        return _isArray(value) && _isNumber(value[0]) && value[0] !== 0;
	    };

	    return {
	        pack: _pack,
	        unpack: _unpack
	    };
	}());
	
	/**
	 * _LZW - algorytm kompresji obiektów typu string
	 */
	_LZW = (function () {
		var _pack, _unpack;

		/**
		 * _pack - kompresuje obiekt
		 * @param {String} value - tekst do kompresji
		 * @return {Array} result - skompresowany tekst
		 */
		_pack = function (value) {
			var i, sign,
				word = "",
				length = value.length,
				dict = {},
				size = 256,
				result = [];

			for (i = 0; i < size; i++) {
				dict[String.fromCharCode(i)] = i;
			}

			for (i = 0; i < length; i++) {
				sign = value.charAt(i);

				if (!dict.hasOwnProperty(word + sign)) {
					result.push(dict[word]);
					dict[word + sign] = size++;
					word = sign + "";
				} else {
					word = word + sign;
				}
			}

			if (word !== '') {
				result.push(dict[word]);
			}

			return result;
		};

		/**
		 * _unpack - dekompresuje obiekt
		 * @param {Array} value - skompresowany obiekt w postaci tablicy
		 * @return {String} result - zdekompresowany tekst
		 */
		_unpack = function (value) {
			var i, temp,
				length,
				word = "",
				entry = "",
				dict = {},
				size = 256,
				result = [];

			if (_isString(value)) {
				value = window.JSON.parse(value);
			}

			length = value.length;
			for (i = 0; i < size; i++) {
				dict[i] = String.fromCharCode(i);
			}

			word = String.fromCharCode(value[0]);
			result = word;

			for (i = 1; i < length; i++) {
				temp = value[i];

				if (dict[temp]) {
					entry = dict[temp];
				} else {
					if (temp === size) {
						entry = word + word.charAt(0);
					} else {
						return null;
					}
				}

				result += entry;
				dict[size++] = word + entry.charAt(0);
				word = entry;
			}

			return result;
		};

		return {
			pack: _pack,
			unpack: _unpack
		};
	}());

	/**
	 * _lerp - prosta interpolacja liniowa
	 * @param {Number} a - pierwsza wartość
	 * @param {Number} b - druga wartość
	 * @param {Number} t - liczba pomiędzy 0 a 1, decydująca o tym jak daleko od a lub b ma zostać znaleziona wartość.
	 * @return {Number} wynik interpolacji
	 */
	_lerp = function (a, b, t) {
		return (a + t * (b - a));
	};

	/**
	 * intense.fps - obiekt przechowujący wartość FPS
	 */
	intense.fps = 0;

	/**
	 * intense.expose - metoda eksponująca najważniejsze metody frameworka
	 */
	intense.expose = function () {
		var methods = [
			"support", "io", "debug", "utils", "drawing", "eventManager", "controls", "assetManager", "poolManager", "engine", "system", "renderSystem", "game", "keyDown","systemManager", "componentManager", "entityManager", "entity", "component"
		], i, length;

		for (i = 0, length = methods.length; i < length; i++) {
			if (!_isSet(window[methods[i]])) {
				window[methods[i]] = intense[methods[i]];
			}
		}
	};

	/**
	 * intense.utils - przestrzeń nazw dla funkcji użytkowych
	 */
	intense.utils = {};

	/**
	 * isMobileDevice - proste sprawdzanie czy urządzenie mobilne
	 * @param {String} type - sprecyzowane urządzenie
	 * @return {Boolean} true lub false
	 */
	intense.utils.isMobileDevice = function (type) {
		var type = type || "any";
		type = type.toLowerCase();

		switch (type) {
			case "android":
				return window.navigator.userAgent.match(/Android/i);
				break;
			case "blackberry":
				return window.navigator.userAgent.match(/BlackBerry|BB10|Playbook/i);
				break;
			case "ios":
				return window.navigator.userAgent.match(/iPhone|iPad|iPod/i);
				break;
			case "opera":
				return window.navigator.userAgent.match(/Opera Mini/i);
				break;
			case "windows":
				return window.navigator.userAgent.match(/IEMobile/i);
				break;
			default:
				return window.navigator.userAgent.match(/Android|BlackBerry|BB10|Playbook|iPhone|iPad|iPod|Opera Mini|IEMobile/i);
				break;
		}
	};

	/**
	 * stopPooling - zatrzymuje pooling obiektów
	 */
	intense.utils.stopPooling = function () {
		intense.cfg.pooling = false;
		intense.poolManager.removeListeners();

		_eventManager.notify('poolingInit', "Zatrzymano pooling");
	};

	/**
	 * aliasy użytecznych funkcji
	 */
	intense.utils.isString = _isString;
	intense.utils.isFunction = _isFunction;
	intense.utils.isArray = _isArray;
	intense.utils.isPlainObject = _isPlainObject;
	intense.utils.isNumber = _isNumber;
	intense.utils.isSet = _isSet;
	intense.utils.isNull = _isNull;
	intense.utils.isObjectEmpty = _isObjectEmpty;
	intense.utils.isNode = _isNode;
	intense.utils.bind = _bind;
	intense.utils.getCurrentTime = _getCurrentTime;
	intense.utils.clamp = _clamp;
	intense.utils.extend = _extend;
	intense.utils.deepCopy = _deepCopy;
	intense.utils.arrayIntersect = _arrayIntersect;
	intense.utils.arrayUnique = _arrayUnique;
	intense.utils.arrayMerge = _arrayMerge;
	intense.utils.arrayDiff = _arrayDiff;
	intense.utils.arrayMap = _arrayMap;
	intense.utils.inArray = _inArray;
	intense.utils.serializeJSON = _serializeJSON;
	intense.utils.sameOrigin = _sameOrigin;
	intense.utils.keys = _keys;
	intense.utils.lerp = _lerp;
	intense.utils.addEvent = _addEvent;
	intense.utils.removeEvent = _removeEvent;
	intense.utils.JSONH = _JSONH;
	intense.utils.RJSON = _RJSON;
	intense.utils.LZW = _LZW;

	/**
	 * intense.debug - przestrzeń nazw dla funkcji debugujących
	 */
	intense.debug = (function () {
		var _initialize = false,
			_globalReplace = false,
			_console = false,
			_replaceMode,
			_elem,
			_init,
			_stop,
			_start,
			_clear,
			_log,
			_defaultLog,
			_keyLog,
			_mouseLog,
			_touchLog,
			_canvasLog,
			_poolingLog,
			_keysInitLog,
			_mouseInitLog,
			_touchInitLog,
			_loopLog,
			_poolLog,
			_systemLog,
			_systemQueueLog,
			_systemDequeueLog,
			_systemRemoveLog,
			_systemNewLog,
			_componentRemoveLog,
			_componentNewLog,
			_entityLog,
			_entityNewLog,
			_entityRemoveLog,
			_entityNewComponentLog,
			_entityRemoveComponentLog,
			_ioLog,
			_listen,
			_removeListeners;

		/**
		 * _init - inicjalizuje okienko debugowania
		 * @param {Boolean} console - czy użyć konsoli przeglądarki
		 */
		_init = function (console) {
			if (console && _isSet(window.console) && _isFunction(window.console.log)) {
				_console = true;
			} else {
				_elem = document.createElement('div');
			    _elem.id = "intense-debug";
			    document.body.appendChild(_elem);
			}
			
		    _listen();
			_start();

			return function () {
				_eventManager.notify('defaultLog', "Debugger już zainicjalizowany!");
			};
		};

		/**
		 * _replaceMode - ustawia globalną podmiane komunikatów logowania
		 * @param {Boolean} replace - czy zamienić zawartość okienka nowym logiem
		 */
		_replaceMode = function (replace) {
			_globalReplace = !!replace;
		};

		/**
		 * _stop - zatrzymuje logowanie debugera
		 */
		_stop = function () {
			_initialize = false;
		};

		/**
		 * _start - wnawia logowanie debugera
		 */
		_start = function () {
			_initialize = true;
		};

		/**
		 * _clear - czyści okienko debugera
		 */
		_clear = function () {
			_elem.innerHTML = "";
		};

		/**
		 * _log - loguje najważniejsze zdarzenia we frameworku
		 * @param {String} msg - wiadomość do logowania
		 * @param {Boolean} replace - czy zamienić zawartość okienka nowym logiem
		 */
		_log = function (msg, replace) {
			var replace = !!replace;

			if (_initialize) {
				if (_console) {
					window.console.log(msg);
				} else if (_elem) {
					if (replace || _globalReplace) {
						_elem.innerHTML = "<span class='intense-debug-row'>" + msg + "</span>";
					} else {
						_elem.innerHTML += "<span class='intense-debug-row'>" + msg + "</span>";
					}
				}
			}
		};

		/**
		 * _defaultLog - standardowe logowanie
		 * @param {object} msg - wiadomość do logowania
		 */
		_defaultLog = function (msg) {
			_log('@INTENSE_LOG: ' + msg);
		};

		/**
		 * _keyLog - loguje wciśnięte klawisze
		 * @param {object} key - wiadomość do logowania
		 */
		_keyLog = function (key) {
			_log('@KEY - Wciśnięto klawisz: ' + key);
		};

		/**
		 * _mouseLog - loguje wciśnięte klawisze myszy
		 * @param {object} btn - wiadomość do logowania
		 */
		_mouseLog = function (btn) {
			_log('@MOUSE - Wciśnięto przycisk: ' + btn);
		};

		/**
		 * _touchLog - loguje dotyk
		 * @param {object} msg - wiadomość do logowania
		 */
		_touchLog = function (msg) {
			_log('@TOUCH: ' + msg);
		};

		/**
		 * _canvasLog - loguje inicjalizacje płótna
		 * @param {object} msg - wiadomość do logowania
		 */
		_canvasLog = function (msg) {
			_log('@CANVAS: ' + msg);
		};

		/**
		 * _poolingLog - loguje inicjalizacje poolingu
		 * @param {object} msg - wiadomość do logowania
		 */
		_poolingLog = function (msg) {
			_log('@POOL_INIT: ' + msg);
		};

		/**
		 * _keysInitLog - loguje inicjalizacje klawiatury
		 * @param {object} msg - wiadomość do logowania
		 */
		_keysInitLog = function (msg) {
			_log('@KEYS_INIT: ' + msg);
		};

		/**
		 * _mouseInitLog - loguje inicjalizacje myszy
		 * @param {object} msg - wiadomość do logowania
		 */
		_mouseInitLog = function (msg) {
			_log('@MOUSE_INIT: ' + msg);
		};

		/**
		 * _touchInitLog - loguje inicjalizacje dotyku
		 * @param {object} msg - wiadomość do logowania
		 */
		_touchInitLog = function (msg) {
			_log('@TOUCH_INIT: ' + msg);
		};

		/**
		 * _loopLog - loguje zdarzenia pętli gry
		 * @param {object} msg - wiadomość do logowania
		 */
		_loopLog = function (msg) {
			_log('@MAINLOOP: ' + msg);
		};

		/**
		 * _poolLog - loguje zdarzenia poolingu
		 * @param {object} msg - wiadomość do logowania
		 */
		_poolLog = function (msg) {
			_log('@POOL: ' + msg);
		};

		/**
		 * _systemLog - loguje zdarzenia systemów
		 * @param {object} msg - wiadomość do logowania
		 */
		_systemLog = function (msg) {
			_log('@SYSTEM: ' + msg);
		};

		/**
		 * _systemQueueLog - loguje zdarzenia dodania systemu do kolejki
		 * @param {object} msg - wiadomość do logowania
		 */
		_systemQueueLog = function (msg) {
			_log('@SYSTEM_QUEUE: Dodano system do kolejki: ' + msg);
		};

		/**
		 * _systemDequeueLog - loguje zdarzenia usunięcia systemu do kolejki
		 * @param {object} msg - wiadomość do logowania
		 */
		_systemDequeueLog = function (msg) {
			if (msg == '*') {
				_log('@SYSTEM_DEQUEUE: Usunięto wszystkie systemy z kolejki');
			} else {
				_log('@SYSTEM_DEQUEUE: Usunięto system z kolejki: ' + msg);
			}
		};

		/**
		 * _systemRemoveLog - loguje zdarzenia usunięcia systemu
		 * @param {object} msg - wiadomość do logowania
		 */
		_systemRemoveLog = function (msg) {
			if (msg == '*') {
				_log('@SYSTEM_REMOVE: Usunięto wszystkie systemy');
			} else {
				_log('@SYSTEM_REMOVE: Usunięto system: ' + msg);
			}
		};

		/**
		 * _systemNewLog - loguje zdarzenia dodania systemu
		 * @param {object} msg - wiadomość do logowania
		 */
		_systemNewLog = function (msg) {
			_log('@SYSTEM_NEW: Dodano system: ' + msg);
		};

		/**
		 * _componentRemoveLog - loguje zdarzenia usunięcia komponentu
		 * @param {object} msg - wiadomość do logowania
		 */
		_componentRemoveLog = function (msg) {
			if (msg == '*') {
				_log('@COMPONENT_REMOVE: Usunięto wszystkie komponenty');
			} else {
				_log('@COMPONENT_REMOVE: Usunięto komponent: ' + msg);
			}
		};

		/**
		 * _componentNewLog - loguje zdarzenia dodania komponentu
		 * @param {object} msg - wiadomość do logowania
		 */
		_componentNewLog = function (msg) {
			_log('@COMPONENT_NEW: Dodano komponent: ' + msg);
		};

		/**
		 * _entityLog - loguje zdarzenia managera encji
		 * @param {object} msg - wiadomość do logowania
		 */
		_entityLog = function (msg) {
			_log('@ENTITYLOG: ' + msg);
		};

		/**
		 * _entityNewLog - loguje zdarzenia dodania encji
		 * @param {object} msg - wiadomość do logowania
		 */
		_entityNewLog = function (msg) {
			_log('@ENTITY_NEW: Dodano encję: ' + msg);
		};

		/**
		 * _entityRemoveLog - loguje zdarzenia usunięcia encji
		 * @param {object} msg - wiadomość do logowania
		 */
		_entityRemoveLog = function (msg) {
			if (msg == '*') {
				_log('@ENTITY_REMOVE: Usunięto wszystkie encje');
			} else {
				_log('@ENTITY_REMOVE: Usunięto encję: ' + msg);
			}
		};

		/**
		 * _entityNewComponentLog - loguje zdarzenia dodania komponentu do encji
		 * @param {object} msg - wiadomość do logowania
		 */
		_entityNewComponentLog = function (msg) {
			_log('@ENTITY_ADD_COMPONENT: Dodano komponent: ' + msg[1] + " do encji: " + msg[0]);
		};

		/**
		 * _entityRemoveComponentLog - loguje zdarzenia usunięcia komponentu z encji
		 * @param {object} msg - wiadomość do logowania
		 */
		_entityRemoveComponentLog = function (msg) {
			_log('@ENTITY_REMOVE_COMPONENT: Usunięto komponent: ' + msg[1] + " z encji: " + msg[0]);
		};

		/**
		 * _ioLog - loguje zdarzenia połączeniowe
		 * @param {object} msg - wiadomość do logowania
		 */
		_ioLog = function (msg) {
			_log('@IO: ' + msg);
		};

		/**
		 * _listen - nasłuchuje zdarzenia frameworka i loguje je
		 */
		_listen = function () {
			_eventManager.listen('defaultLog', "defaultLog", intense.debug);
			_eventManager.listen('ioLog', "ioLog", intense.debug);
			_eventManager.listen('keyPressed', "keyLog", intense.debug);
			_eventManager.listen('mousePressed', "mouseLog", intense.debug);
			_eventManager.listen('touchPressed', "touchLog", intense.debug);
			_eventManager.listen('canvasInit', "canvasLog", intense.debug);
			_eventManager.listen('poolingInit', "poolingLog", intense.debug);
			_eventManager.listen('keysInit', "keysInitLog", intense.debug);
			_eventManager.listen('mouseInit', "mouseInitLog", intense.debug);
			_eventManager.listen('touchInit', "touchInitLog", intense.debug);
			_eventManager.listen('loopLog', "loopLog", intense.debug);
			_eventManager.listen('poolLog', "poolLog", intense.debug);
			_eventManager.listen('systemLog', "systemLog", intense.debug);
			_eventManager.listen('queueSystem', "systemQueueLog", intense.debug);
			_eventManager.listen('dequeueSystem', "systemDequeueLog", intense.debug);
			_eventManager.listen('removeSystem', "systemRemoveLog", intense.debug);
			_eventManager.listen('newSystem', "systemNewLog", intense.debug);
			_eventManager.listen('removeComponent', "componentRemoveLog", intense.debug);
			_eventManager.listen('newComponent', "componentNewLog", intense.debug);
			_eventManager.listen('entityLog', "entityLog", intense.debug);
			_eventManager.listen('newEntity', "entityNewLog", intense.debug);
			_eventManager.listen('removeEntity', "entityRemoveLog", intense.debug);
			_eventManager.listen('addEntityComponent', "entityNewComponentLog", intense.debug);
			_eventManager.listen('removeEntityComponent', "entityRemoveComponentLog", intense.debug);
		};

		/**
		 * _removeListeners - usuwa nasłuchiwanie zdarzeń
		 */
		_removeListeners = function () {
			_eventManager.remove('defaultLog', "defaultLog", intense.debug);
			_eventManager.remove('ioLog', "ioLog", intense.debug);
			_eventManager.remove('keyPressed', "keyLog", intense.debug);
			_eventManager.remove('mousePressed', "mouseLog", intense.debug);
			_eventManager.remove('touchPressed', "touchLog", intense.debug);
			_eventManager.remove('canvasInit', "canvasLog", intense.debug);
			_eventManager.remove('poolingInit', "poolingLog", intense.debug);
			_eventManager.remove('keysInit', "keysInitLog", intense.debug);
			_eventManager.remove('mouseInit', "mouseInitLog", intense.debug);
			_eventManager.remove('touchInit', "touchInitLog", intense.debug);
			_eventManager.remove('loopLog', "loopLog", intense.debug);
			_eventManager.remove('poolLog', "poolLog", intense.debug);
			_eventManager.remove('systemLog', "systemLog", intense.debug);
			_eventManager.remove('queueSystem', "systemQueueLog", intense.debug);
			_eventManager.remove('dequeueSystem', "systemDequeueLog", intense.debug);
			_eventManager.remove('removeSystem', "systemRemoveLog", intense.debug);
			_eventManager.remove('newSystem', "systemNewLog", intense.debug);
			_eventManager.remove('removeComponent', "componentRemoveLog", intense.debug);
			_eventManager.remove('newComponent', "componentNewLog", intense.debug);
			_eventManager.remove('entityLog', "entityLog", intense.debug);
			_eventManager.remove('newEntity', "entityNewLog", intense.debug);
			_eventManager.remove('removeEntity', "entityRemoveLog", intense.debug);
			_eventManager.remove('addEntityComponent', "entityNewComponentLog", intense.debug);
			_eventManager.remove('removeEntityComponent', "entityRemoveComponentLog", intense.debug);
		};

		return {
			init: _init,
			replaceMode: _replaceMode,
			stop: _stop,
			start: _start,
			clear: _clear,
			log: _log,
			defaultLog: _defaultLog,
			keyLog: _keyLog,
			mouseLog: _mouseLog,
			touchLog: _touchLog,
			canvasLog: _canvasLog,
			poolingLog: _poolingLog,
			keysInitLog: _keysInitLog,
			mouseInitLog: _mouseInitLog,
			touchInitLog: _touchInitLog,
			loopLog: _loopLog,
			poolLog: _poolLog,
			systemLog: _systemLog,
			systemQueueLog: _systemQueueLog,
			systemDequeueLog: _systemDequeueLog,
			systemRemoveLog: _systemRemoveLog,
			systemNewLog: _systemNewLog,
			componentRemoveLog: _componentRemoveLog,
			componentNewLog: _componentNewLog,
			entityLog: _entityLog,
			entityNewLog: _entityNewLog,
			entityRemoveLog: _entityRemoveLog,
			entityNewComponentLog: _entityNewComponentLog,
			entityRemoveComponentLog: _entityRemoveComponentLog,
			ioLog: _ioLog,
			listen: _listen,
			removeListeners: _removeListeners
		};
	}());

	/**
	 * intense.controls - przestrzeń nazw dla funkcji obsługujących klawisze
	 */
	intense.controls = (function () {
		var _keyPressed = {},
			_mousePressed = {},
			_keys,
			_mouseBtn,
			_onKeyDown,
			_onKeyUp,
			_findKeyByKeyCode,
			_findMouseBtn,
			_keyDown,
			_keysInit,
			_touchInit,
			_keysDestroy,
			_touchDestroy,
			_keyReset,
			_mouseDown,
			_mouseReset,
			_mouseInit,
			_mouseDestroy,
			_onMouseMove,
			_onMouseDown,
			_onMouseUp,
			_onTouchMove,
			_onTouchDown,
			_onTouchUp,
			_isTouched,
			_setKey,
			_touched = false,
			_canvasX = 0,
			_canvasY = 0;

		/**
		 * _keys - mapa klawiszy
		 */
		_keys = {
			'0': 48,
	        '1': 49,
	        '2': 50,
	        '3': 51,
	        '4': 52,
	        '5': 53,
	        '6': 54,
	        '7': 55,
	        '8': 56,
	        '9': 57,
	        'A': 65,
	        'B': 66,
	        'C': 67,
	        'D': 68,
	        'E': 69,
	        'F': 70,
	        'G': 71,
	        'H': 72,
	        'I': 73,
	        'J': 74,
	        'K': 75,
	        'L': 76,
	        'M': 77,
	        'N': 78,
	        'O': 79,
	        'P': 80,
	        'Q': 81,
	        'R': 82,
	        'S': 83,
	        'T': 84,
	        'U': 85,
	        'V': 86,
	        'W': 87,
	        'X': 88,
	        'Y': 89,
	        'Z': 90,
	        'BACKSPACE': 8,
	        'TAB': 9,
	        'ENTER': 13,
	        'SHIFT': 16,
	        'CTRL': 17,
	        'ALT': 18,
	        'PAUSE': 19,
	        'CAPS': 20,
	        'ESC': 27,
	        'SPACE': 32,
	        'PAGE_UP': 33,
	        'PAGE_DOWN': 34,
	        'END': 35,
	        'HOME': 36,
	        'LEFT': 37,
	        'UP': 38,
	        'RIGHT': 39,
	        'DOWN': 40,
	        'INSERT': 45,
	        'DELETE': 46,
	        'NUMPAD_0': 96,
	        'NUMPAD_1': 97,
	        'NUMPAD_2': 98,
	        'NUMPAD_3': 99,
	        'NUMPAD_4': 100,
	        'NUMPAD_5': 101,
	        'NUMPAD_6': 102,
	        'NUMPAD_7': 103,
	        'NUMPAD_8': 104,
	        'NUMPAD_9': 105,
	        'MULTIPLY': 106,
	        'ADD': 107,
	        'SUBSTRACT': 109,
	        'DECIMAL': 110,
	        'DIVIDE': 111,
	        'F1': 112,
	        'F2': 113,
	        'F3': 114,
	        'F4': 115,
	        'F5': 116,
	        'F6': 117,
	        'F7': 118,
	        'F8': 119,
	        'F9': 120,
	        'F10': 121,
	        'F11': 122,
	        'F12': 123,
	        'PLUS': 187,
	        'COMMA': 188,
	        'MINUS': 189,
	        'PERIOD': 190
		};

		/**
		 * _mouseBtn - przyciski myszy
		 */
		_mouseBtn = {
			'MOUSE_LEFT': 0,
			'MOUSE_RIGHT': 2,
			'MOUSE_MIDDLE': 1
		};

		/**
		 * _keysInit - inicjalizuje zdarzenia klawiatury
		 * @trigger keysInit
		 */
		_keysInit = function () {
			_addEvent(window, 'keydown', _onKeyDown);
			_addEvent(window, 'keyup', _onKeyUp);

			_eventManager.notify('keysInit', "Włączono obsługę klawiatury");
		};

		/**
		 * _touchInit - inicjalizuje zdarzenia dotyku
		 * @trigger touchInit
		 */
		_touchInit = function () {
			if (intense.support('msPointerEnabled')) {
				_addEvent(intense.canvas, 'MSPointerMove', _onTouchMove);
				_addEvent(intense.canvas, 'MSPointerDown', _onTouchDown);
				_addEvent(intense.canvas, 'MSPointerUp', _onTouchUp);
				_addEvent(intense.canvas, 'MSPointerOut', _onTouchUp);
			} else {
				_addEvent(intense.canvas, 'touchmove', _onTouchMove);
				_addEvent(intense.canvas, 'touchstart', _onTouchDown);
				_addEvent(intense.canvas, 'touchend', _onTouchUp);
				_addEvent(intense.canvas, 'touchcancel', _onTouchUp);
			}

			_eventManager.notify('touchInit', "Włączono obsługę dotyku");
		};

		/**
		 * _mouseInit - inicjalizuje śledzenie wskaźnika myszy
		 * @trigger mouseInit
		 */
		_mouseInit = function () {
			_addEvent(intense.canvas, 'mousemove', _onMouseMove);
			_addEvent(intense.canvas, 'mousedown', _onMouseDown);
			_addEvent(intense.canvas, 'mouseup', _onMouseUp);

			/**
			 * Blokada menu kontekstowego pod prawym klawiszem myszy
			 */
			document.oncontextmenu = function () {
				return false;
			};

			_eventManager.notify('mouseInit', "Włączono obsługę myszy");
		};

		/**
		 * _touchDestroy - usuwa zdarzenia dotyku
		 * @trigger touchInit
		 */
		_touchDestroy = function () {
			if (intense.support('msPointerEnabled')) {
				_removeEvent(intense.canvas, 'MSPointerMove', _onTouchMove);
				_removeEvent(intense.canvas, 'MSPointerDown', _onTouchDown);
				_removeEvent(intense.canvas, 'MSPointerUp', _onTouchUp);
				_removeEvent(intense.canvas, 'MSPointerOut', _onTouchUp);
			} else {
				_removeEvent(intense.canvas, 'touchmove', _onTouchMove);
				_removeEvent(intense.canvas, 'touchstart', _onTouchDown);
				_removeEvent(intense.canvas, 'touchend', _onTouchUp);
				_removeEvent(intense.canvas, 'touchcancel', _onTouchUp);
			}

			_eventManager.notify('touchInit', "Wyłączono obsługę dotyku");
		};

		/**
		 * _keysDestroy - usuwa zdarzenia klawiatury
		 * @trigger keysInit
		 */
		_keysDestroy = function () {
			_removeEvent(window, 'keydown', _onKeyDown);
			_removeEvent(window, 'keyup', _onKeyUp);

			_eventManager.notify('keysInit', "Wyłączono obsługę klawiatury");
		};

		/**
		 * _mouseDestroy - usuwa zdarzenia śledzenia myszy
		 * @trigger mouseInit
		 */
		_mouseDestroy = function () {
			_removeEvent(intense.canvas, 'mousemove', _onMouseMove);
			_removeEvent(intense.canvas, 'mousedown', _onMouseDown);
			_removeEvent(intense.canvas, 'mouseup', _onMouseUp);

			_eventManager.notify('mouseInit', "Wyłączono obsługę myszy");
		};

		/**
		 * _onMouseMove - śledzi wskaźnik myszy
		 * @param {object} event
		 */
		_onMouseMove = function (e) {
			e.preventDefault();
			_canvasX = e.pageX || e.clientX;
			_canvasY = e.pageY || e.clientY;
			_canvasX -= intense.canvas.offsetLeft;
			_canvasY -= intense.canvas.offsetTop;
		};

		/**
		 * _onTouchMove - zapisuje ruch na dotyk
		 * @param {object} event
		 */
		_onTouchMove = function (e) {
			var evt = e || window.event;
			evt.preventDefault();

			_canvasX = e.touches[0].pageX || e.clientX;
			_canvasY = e.touches[0].pageY || e.clientY;
			_canvasX -= intense.canvas.offsetLeft;
			_canvasY -= intense.canvas.offsetTop;
		};

		/**
		 * _onTouchDown - funkcja uruchamiana w momencie dotknięcia ekranu dotykowego
		 * @trigger touchPressed
		 * @param {object} event
		 */
		_onTouchDown = function (e) {
			var evt = e || window.event;
			evt.preventDefault();
			_touched = true;

			_eventManager.notify('touchPressed', 'Zareagowano na dotyk');
			_onTouchMove(evt);
		};

		/**
		 * _onTouchUp - funkcja uruchamiana w momencie zwolnienia ekranu dotykowego
		 * @param {object} event
		 */
		_onTouchUp = function (e) {
			var evt = e || window.event;
			evt.preventDefault();
			_touched = false;
			//_onTouchMove(e);
		};

		/**
		 * _onMouseDown - funkcja uruchamiana w momencie wciśnięcia klawisza myszy
		 * @trigger mousePressed
		 * @param {object} event
		 */
		_onMouseDown = function (e) {
			var evt = e || window.event,
				button;

			evt.preventDefault();
			if (_isSet(evt.button)) {
				button = evt.button;
			} else {
				switch (evt.which) {
					case 1: 
						button = 0;
						break;
					case 2: 
						button = 2;
						break;
					case 4: 
						button = 1;
						break;
				}
			}

  			if (_isSet(_mousePressed[button]) && _mousePressed[button] > 0) {
  				return; 
  			}

        	_mousePressed[button] = evt.timeStamp || _getCurrentTime();
        	_eventManager.notify('mousePressed', _findMouseBtn(button));

			_onMouseMove(evt);
		};

		/**
		 * _onMouseUp - funkcja uruchamiana w momencie zwolnienia klawisza myszy
		 * @param {object} event
		 */
		_onMouseUp = function (e) {
			var evt = e || window.event,
				button;

			evt.preventDefault();
			if (_isSet(evt.button)) {
				button = evt.button;
			} else {
				switch (evt.which) {
					case 1: 
						button = 0;
						break;
					case 2: 
						button = 2;
						break;
					case 4: 
						button = 1;
						break;
				}
			}

			evt.preventDefault();
  			_mousePressed[button] = 0;

			_onMouseMove(evt);
		};

		/**
		 * _findMouseBtn - szuka nazwy przycisku myszy na podstawie kodu
		 * @param {Number} btn
		 * @return nazwa przycisku myszy
		 */
		_findMouseBtn = function (btn) {
			var i;

			for (i in _mouseBtn) {
				if (_mouseBtn[i] == btn) {
					return i;
				}
			}

			return "UNDEFINED MOUSE BUTTON";
		};

		/**
		 * _isTouched - sprawdza czy dotknięto ekranu. Uruchamia przekazany callback
		 * @param {Function} callback - funkcja uruchamiana przy dotknięciu ekranu
		 * @return {boolean} true lub false
		 */
		_isTouched = function (callback) {
			if (!_isFunction(callback)) {
				return _touched;
			} else {
				if (_touched) {
					callback();
				}
				return true;
			}

			return false;
		};

		/**
		 * _mouseDown - sprawdza czy podany przycisk myszy jest wciśnięty. Uruchamia przekazany callback
		 * @param {String} btn - nazwa przycisku
		 * @param {Function} callback - funkcja uruchamiana przy wciśniętym przycisku
		 * @return {boolean} true lub false
		 */
		_mouseDown = function (btn, callback) {
			var _btnPress;

			if (_isString(btn)) {
				btn = btn + "";
				btn = key.toUpperCase();
				btn = _mouseBtn[btn];

				if (btn) {
					if (!_isFunction(callback)) {
						return !!_mousePressed[btn];
					} else {
						_btnPress = !!_mousePressed[btn];
						if (_btnPress) {
							callback();
						}
						return true;
					}
				}
			}

			return false;
		};

		/**
		 * _onKeyDown - funkcja uruchamiana w momencie wciśnięcia klawisza
		 * @trigger keyPressed
		 * @param {object} event
		 */
		_onKeyDown = function (e) {
			var evt = e || window.event,
  				key = evt.keyCode || evt.which;

  			e.preventDefault();

  			if (_isSet(_keyPressed[key]) && _keyPressed[key] > 0) { 
  				return; 
  			}

        	_keyPressed[key] = evt.timeStamp || _getCurrentTime();
        	_eventManager.notify('keyPressed', _findKeyByKeyCode(key));
		};

		/**
		 * _onKeyUp - funkcja uruchamiana w momencie zwolnienia klawisza
		 * @param {object} event
		 */
		_onKeyUp = function (e) {
			var evt = e || window.event,
  				key = evt.keyCode || evt.which;

  			e.preventDefault();
  			_keyPressed[key] = 0;
		};

		/**
		 * _setKey - pozwala ręcznie ustalić czy klawisz jest wciśnięty czy też nie
		 * @param {object} event
		 */
		_setKey = function (which, value) {
			var key = _keys[which.toUpperCase()];

			if (_isSet(key)) {
				if (value) {
					_keyPressed[key] = _getCurrentTime();
				} else {
					_keyPressed[key] = 0;
				}
			}
		};

		/**
		 * _findKeyByKeyCode - szuka nazwy klawisza na podstawie podanego kodu
		 * @param {Number} key
		 * @return nazwa klawisza
		 */
		_findKeyByKeyCode = function (key) {
			var i;

			for (i in _keys) {
				if (_keys[i] == key) {
					return i;
				}
			}

			return "UNDEFINED KEY";
		};

		/**
		 * _keyReset - reset obiektu wciśniętych klawiszy
		 */
		_keyReset = function () {
			_keyPressed = {};
		};

		/**
		 * _mouseReset - reset obiektu wciśniętych przycisków myszy
		 */
		_mouseReset = function () {
			_mousePressed = {};
		};

		/**
		 * _keyDown - sprawdza czy podany klawisz jest wciśnięty. Uruchamia przekazany callback
		 * @param {String} lub {Array} key - nazwa klawisza
		 * @param {Function} callback - funkcja uruchamiana przy wciśniętym klawiszu
		 * @return {boolean} true lub false
		 */
		_keyDown = function (key, callback) {
			var _kpress, i, _length, _temp;

			if (_isString(key)) {
				key = key + "";
				key = key.toUpperCase();
				key = _keys[key];

				if (key) {
					if (!_isFunction(callback)) {
						return !!_keyPressed[key];
					} else {
						_kpress = !!_keyPressed[key];
						if (_kpress) {
							callback();
						}
						return true;
					}
				}
			} else if (_isArray(key)) {
				for (i = 0, _length = key.length; i < _length; i++) {
					key[i] = key[i] + "";
					key[i] = key[i].toUpperCase();
					key[i] = _keys[key[i]];

					if (key[i]) {
						_kpress = !!_keyPressed[key[i]];
						if (!_kpress) {
							return false;
						}
					}
				}

				if (_isFunction(callback)) {
					callback();
				}
				return true;
			}

			return false;
		};

		return {
			keyDown: _keyDown,
			mouseDown: _mouseDown,
			keysInit: _keysInit,
			keysDestroy: _keysDestroy,
			mouseInit: _mouseInit,
			mouseDestroy: _mouseDestroy,
			touchInit: _touchInit,
			touchDestroy: _touchDestroy,
			isTouched: _isTouched,
			keyReset: _keyReset,
			mouseReset: _mouseReset,
			canvasX: _canvasX,
			canvasY: _canvasY,
			setKey: _setKey
		};
	}());

	/**
	 * intense.support - przestrzeń nazw dla funkcji sprawdzających support obsługiwanych elementów
	 */
	intense.support = (function () {
		var elems = [];

		/**
		 * support websocketów
		 */
		elems['websocket'] = function(specific) {
			if (_isSet(window.WebSocket)) {
				if (_isSet(specific)) {
					return "WebSocket";
				}
				return true;
			} else if (_isSet(window.MozWebSocket)) {
				if (_isSet(specific)) {
					return "MozWebSocket";
				}
				return true;
			}
    		return false;
    	};

    	/**
		 * support cors
		 */
		elems['cors'] = function(specific) {
			var xhr = intense.io.getXhr();
			
			if (_isSet(xhr.withCredentials)) {
				if (_isSet(specific)) {
					return "XMLHttpRequest";
				}
				return true;
			} else {
				if (_isSet(window.XDomainRequest)) {
					if (_isSet(specific)) {
						return "XDomainRequest";
					}
					return true;
				}
			}

			return false;
    	};

    	/**
		 * support socket.io
		 */
		elems['socket.io'] = function() {
			if (_isSet(window.io) && _isFunction(window.io.connect)) {
				return true;
			} 
			return false;
    	};

    	/**
		 * support geolokalizacji
		 */
		elems['geolocation'] = function() {
			if (_isSet(window.navigator.geolocation)) {
				return true;
			} 
			return false;
    	};

    	/**
		 * support deviceorientation
		 */
		elems['deviceorientation'] = function(specific) {
			if (_isSet(window.DeviceOrientationEvent)) {
				if (_isSet(specific)) {
					return "deviceorientation";
				}
				return true;
			} else if (_isSet(window.OrientationEvent)) {
				if (_isSet(specific)) {
					return "MozOrientation";
				}
				return true;
			}
			return false;
    	};

    	/**
		 * support pointerlock
		 */
		elems['pointerlock'] = function(specific) {
			if (_isSet(document.pointerLockElement)) {
				if (_isSet(specific)) {
					return "pointerLockElement";
				}
				return true;
			} else if (_isSet(document.mozPointerLockElement)) {
				if (_isSet(specific)) {
					return "mozPointerLockElement";
				}
				return true;
			} else if (_isSet(document.webkitRequestPointerLock)) {
				if (_isSet(specific)) {
					return "webkitRequestPointerLock";
				}
				return true;
			}
			return false;
    	};

    	/**
		 * support fullscreen-request
		 */
		elems['fullscreen-request'] = function(specific) {
			if (_isSet(document.requestFullScreen)) {
				if (_isSet(specific)) {
					return "requestFullScreen";
				}
				return true;
			} else if (_isSet(document.mozRequestFullScreen)) {
				if (_isSet(specific)) {
					return "mozRequestFullScreen";
				}
				return true;
			} else if (_isSet(document.webkitRequestFullScreen)) {
				if (_isSet(specific)) {
					return "webkitRequestFullScreen";
				}
				return true;
			}
			return false;
    	};

    	/**
		 * support fullscreen-cancel
		 */
		elems['fullscreen-cancel'] = function(specific) {
			if (_isSet(document.cancelFullScreen)) {
				if (_isSet(specific)) {
					return "cancelFullScreen";
				}
				return true;
			} else if (_isSet(document.mozCancelFullScreen)) {
				if (_isSet(specific)) {
					return "mozCancelFullScreen";
				}
				return true;
			} else if (_isSet(document.webkitCancelFullScreen)) {
				if (_isSet(specific)) {
					return "webkitCancelFullScreen";
				}
				return true;
			}
			return false;
    	};

    	/**
		 * support fullscreen-element
		 */
		elems['fullscreen-element'] = function(specific) {
			if (_isSet(document.fullscreenElement)) {
				if (_isSet(specific)) {
					return "fullscreenElement";
				}
				return true;
			} else if (_isSet(document.mozFullScreenElement)) {
				if (_isSet(specific)) {
					return "mozFullScreenElement";
				}
				return true;
			} else if (_isSet(document.webkitFullscreenElement)) {
				if (_isSet(specific)) {
					return "webkitFullscreenElement";
				}
				return true;
			}
			return false;
    	};

    	/**
		 * support fullscreen-enabled
		 */
		elems['fullscreen-enabled'] = function(specific) {
			if (_isSet(document.fullscreenEnabled)) {
				if (_isSet(specific)) {
					return "fullscreenEnabled";
				}
				return true;
			} else if (_isSet(document.mozFullScreenEnabled)) {
				if (_isSet(specific)) {
					return "mozFullScreenEnabled";
				}
				return true;
			} else if (_isSet(document.webkitFullscreenEnabled)) {
				if (_isSet(specific)) {
					return "webkitFullscreenEnabled";
				}
				return true;
			}
			return false;
    	};

    	/**
		 * support msPointerEnabled
		 */
		elems['msPointerEnabled'] = function() {
			if (window.navigator.msPointerEnabled) {
				return true;
			}
			return false;
    	};

    	/**
		 * support touch-device
		 */
		elems['touch-device'] = function() {
			return 'ontouchstart' in window || window.navigator.msMaxTouchPoints;
    	};

    	/**
		 * support notyfikacji
		 */
		elems['notifications'] = function(specific) {
			if (_isSet(window.Notification)) {
				if (_isSet(specific)) {
					return "Notification";
				}
				return true;
			} else if (_isSet(window.webkitNotifications)) {
				if (_isSet(specific)) {
					return "webkitNotifications";
				}
				return true;
			}
			return false;
    	};

    	/**
		 * support requestAnimationFrame
		 */
		elems['requestanimationframe'] = function(specific) {
			if (_isSet(window.requestAnimationFrame)) {
				if (_isSet(specific)) {
					return "requestAnimationFrame";
				}
				return true;
			} else if (_isSet(window.webkitRequestAnimationFrame)) {
				if (_isSet(specific)) {
					return "webkitRequestAnimationFrame";
				}
				return true;
			} else if (_isSet(window.mozRequestAnimationFrame)) {
				if (_isSet(specific)) {
					return "mozRequestAnimationFrame";
				}
				return true;
			} else if (_isSet(window.oRequestAnimationFrame)) {
				if (_isSet(specific)) {
					return "oRequestAnimationFrame";
				}
				return true;
			} else if (_isSet(window.msRequestAnimationFrame)) {
				if (_isSet(specific)) {
					return "msRequestAnimationFrame";
				}
				return true;
			}
			return false;
    	};

    	/**
		 * support devicemotion
		 */
		elems['devicemotion'] = function() {
			if (_isSet(window.DeviceMotionEvent)) {
				return true;
			} 
			return false;
    	};

    	/**
		 * support localstorage
		 */
		elems['localstorage'] = function() {
			try {
	            return 'localStorage' in window && window['localStorage'] !== null;
	        } catch(e) {
	            return false;
	        }
    	};

    	/**
		 * support sessionstorage
		 */
		elems['sessionstorage'] = function() {
			try {
	            return 'sessionStorage' in window && window['sessionStorage'] !== null;
	        } catch(e) {
	            return false;
	        }
    	};

    	/**
		 * support webworkers
		 */
		elems['webworkers'] = function() {
			if (_isSet(window.Worker)) {
				return true;
			} 
			return false;
    	};

    	/**
		 * support server-sent events
		 */
		elems['server-sent-events'] = function () {
			if (_isSet(window.EventSource)) {
				return true;
			}
			return false;
		};

		/**
		 * support History api
		 */
		elems['history'] = function () {
			if (_isSet(window.history) && _isSet(window.history.pushState)) {
				return true;
			}
			return false;
		};

		/**
		 * support offline
		 */
		elems['offline'] = function () {
			if (_isSet(window.applicationCache)) {
				return true;
			}
			return false;
		};

		/**
		 * support File Api
		 */
		elems['file'] = function () {
			if (_isSet(window.File) && _isSet(window.FileReader) && _isSet(window.FileList) && _isSet(window.Blob)) {
				return true;
			}
			return false;
		};

		/**
		 * support audio mp3
		 * Wg Marka Pilgrim - diveintohtml5.info
		 */
		elems['audio-mp3'] = function () {
			var a = document.createElement('audio');
			return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
		};

		/**
		 * support audio ogg
		 * Wg Marka Pilgrim - diveintohtml5.info
		 */
		elems['audio-ogg'] = function () {
			var a = document.createElement('audio');
			return !!(a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
		};

		/**
		 * support audio wav
		 * Wg Marka Pilgrim - diveintohtml5.info
		 */
		elems['audio-wav'] = function () {
			var a = document.createElement('audio');
			return !!(a.canPlayType && a.canPlayType('audio/wav; codecs="1"').replace(/no/, ''));			
		};

		/**
		 * support audio aac
		 * Wg Marka Pilgrim - diveintohtml5.info
		 */
		elems['audio-aac'] = function () {
			var a = document.createElement('audio');
			return !!(a.canPlayType && a.canPlayType('audio/mp4; codecs="mp4a.40.2"').replace(/no/, ''));		
		};

		/**
		 * support ArrayBuffer
		 */
		elems['ArrayBuffer'] = function () {
			if (_isSet(window.ArrayBuffer)) {
				return true;
			}
			return false;
		};

		/**
		 * support Int8Array
		 */
		elems['Int8Array'] = function () {
			if (_isSet(window.Int8Array)) {
				return true;
			}
			return false;
		};

		/**
		 * support Uint8Array
		 */
		elems['Uint8Array'] = function () {
			if (_isSet(window.Uint8Array)) {
				return true;
			}
			return false;
		};

		/**
		 * support Uint8ClampedArray
		 */
		elems['Uint8ClampedArray'] = function () {
			if (_isSet(window.Uint8ClampedArray)) {
				return true;
			}
			return false;
		};

		/**
		 * support Int16Array
		 */
		elems['Int16Array'] = function () {
			if (_isSet(window.Int16Array)) {
				return true;
			}
			return false;
		};

		/**
		 * support Uint16Array
		 */
		elems['Uint16Array'] = function () {
			if (_isSet(window.Uint16Array)) {
				return true;
			}
			return false;
		};

		/**
		 * support Int32Array
		 */
		elems['Int32Array'] = function () {
			if (_isSet(window.Int32Array)) {
				return true;
			}
			return false;
		};

		/**
		 * support Uint32Array
		 */
		elems['Uint32Array'] = function () {
			if (_isSet(window.Uint32Array)) {
				return true;
			}
			return false;
		};

		/**
		 * support Float32Array
		 */
		elems['Float32Array'] = function () {
			if (_isSet(window.Float32Array)) {
				return true;
			}
			return false;
		};

		/**
		 * support Float64Array
		 */
		elems['Float64Array'] = function () {
			if (_isSet(window.Float64Array)) {
				return true;
			}
			return false;
		};

		/**
		 * support DataView
		 */
		elems['DataView'] = function () {
			if (_isSet(window.DataView)) {
				return true;
			}
			return false;
		};
		
    	/**
		 * support canvasu
		 */
		elems['canvas'] = function () {
			var elem = document.createElement('canvas');
			return !!(elem.getContext && elem.getContext('2d'));
		};

		return function (what, getSpecific) {
			if (_isSet(elems[what])) {
				return elems[what](getSpecific);
			} 
			return false;
		};
	}());

	/**
	 * intense.canvas - płótno na którym rysowana jest gra
	 * intense.context - kontekst 2D dla płótna
	 * intense.container - kontener na canvas i pozycjonowane elementy
	 */
	intense.canvas = null;
	intense.context = null;
	intense.container = null;

	/**
	 * intense.cfg - przestrzeń nazw dla stałych konfiguracyjnych
	 */
	intense.cfg = {
		pooling: false
	};

	/**
	 * intense.init - inicjuje podstawowe elementy frameworka
	 * @trigger canvasInit
	 * @trigger poolingInit
	 */
	intense.init = function (conf) {
		var element, elem, _count, _resizeCall;

		if (!_isNode()) {
			var	htmlTag = document.documentElement,
		    	bodyTag = document.body;
	    }

		/**
		 * Callback od użytkownika - preinit
		 */
		if (_isFunction(conf.preinit)) {
			conf.preinit();
		}

		if (_isSet(conf.debug)) {
			if (!_isNode()) {
				if (conf.debug == 'console') {
					intense.debug.init(true);
				} else {
					intense.debug.init();
				}
			} else {
				intense.debug.init(true);
			}
		}

		if (!_isNode()) {
			if (!_isSet(conf.element)) {
				element = document.createElement('div');
				element.style.width = parseInt(conf.width || 640, 10) + "px";
			    element.style.height = parseInt(conf.height || 480, 10) + "px";
			    element.id = "intense-container";
			    element.style.position = "relative";
			    intense.container = element;
			    document.body.appendChild(intense.container);

			    _eventManager.notify('defaultLog', "Utworzono kontener gry");
			} else {
			    intense.container = conf.element;
			    intense.container.style.width = parseInt(conf.width || intense.container.style.width, 10) + "px";
			    intense.container.style.height = parseInt(conf.height || intense.container.style.height, 10) + "px";
			    intense.container.style.position = "relative";
				
				_eventManager.notify('defaultLog', "Wykorzystano gotowy kontener");
			}

			elem = document.createElement('canvas');
			elem.width = parseInt(conf.width || 640, 10);
		    elem.height = parseInt(conf.height || 480, 10);
		    elem.id = "intense-canvas";
		    elem.style.position = "absolute";
		    elem.style.left = 0;
		    elem.style.right = 0;
		    elem.style.display = "block";
		    intense.canvas = elem;
		    intense.context = elem.getContext('2d');
		    intense.container.appendChild(intense.canvas);

		    if (_isSet(conf.fullscreen) && conf.fullscreen) {
		    	htmlTag.style.margin = "0";
		    	htmlTag.style.padding = "0";
		    	bodyTag.style.margin = "0";
		    	bodyTag.style.padding = "0";
		    	htmlTag.style.width = "100%";
		    	htmlTag.style.height = "100%";
		    	bodyTag.style.width = "100%";
		    	bodyTag.style.height = "100%";

		    	intense.container.style.width = "100%";
		    	intense.container.style.height = "100%";
		    	intense.canvas.style.width = "100%";
		    	intense.canvas.style.height = "100%";

		    	_resizeCall = function () {
			    	intense.canvas.width = window.innerWidth;
			    	intense.canvas.height = window.innerHeight;
		    	};

		    	_resizeCall();
		    	_addEvent(window, 'resize', _resizeCall);
		    	_addEvent(window, 'orientationchange', _resizeCall);
		    }

		    _eventManager.notify('canvasInit', "Utworzono płótno");
		}

		if (_isSet(conf.pooling)) {
			intense.cfg.pooling = true;
			_count = parseInt(conf.pooling, 10);
			intense.poolManager.componentsSize(_count);
			intense.poolManager.listen();

			_eventManager.notify('poolingInit', "Włączono pooling, wartość poolingu: " + _count);
		}

		if (_isSet(conf.multiplayer)) {
			intense.io.init(conf.multiplayer);
		}

		if (!_isNode()) {
			intense.controls.keysInit();
			intense.controls.mouseInit();

			if (intense.support('touch-device')) {
				intense.controls.touchInit();
			}
		}

		if (_isSet(conf.server) && _isSet(conf.server.rate)) {
			_serverFPS = parseInt(conf.server.rate, 10) || 30;
			_netSystems = true;
		}

		/**
		 * Pokazywanie licznika FPSów
		 */
		if (_isSet(conf.fps) && _isPlainObject(conf.fps)) {
			if (!_isNode()) {
				if (_isSet(conf.fps.display) && conf.fps.display) {
					elem = document.createElement('span');
				    elem.id = "intense-fps";
				    elem.style.position = "absolute";
				    elem.style.right = 0;
				    elem.style.top = 0;
				    elem.style.zIndex = 2;
				    intense.container.appendChild(elem);

				    intense.engine.showFPS = function (_lastFPS) {
				    	intense.fps = _lastFPS;
						document.getElementById('intense-fps').innerHTML = _lastFPS + " FPS";
				    };
				}
			}

			if (_isSet(conf.fps.value) && _isNumber(conf.fps.value)) {
				_FPS = conf.fps.value;
			} else {
				_FPS = 60;
			}
		}

		/**
		 * Callback od użytkownika - preload
		 */
		if (_isFunction(conf.preload)) {
			conf.preload();
		}

		/**
		 * Uruchomienie mechanizmów gry dopiero po załadowaniu zasobów
		 */
		intense.assetManager.checkAssets({
			complete: function () {
				/**
				 * Callback od użytkownika - init
				 */
				if (_isFunction(conf.init)) {
					conf.init();
				}

				/**
				 * Wstępne przygotowanie systemów
				 */
				intense.systemManager.prepare();

				/**
				 * Uruchomienie pętli frameworka
				 */
				intense.engine.start();

				/**
				 * Callback od użytkownika - load
				 */
				if (_isFunction(conf.load)) {
					conf.load();
				}
			}
		});

		return function () {
			_eventManager.notify('defaultLog', "Framework już zainicjalizowany!");
		};
	};
	
	/**
	 * intense.game - konstruktor gry
	 * @param {object} obiekt konfiguracji
	 * @constructor
	 */
	intense.game = function (configuration) {
		var conf = configuration || {};
		if (!_initialize) {
			if (_isSet(conf.server)) {
				if (!_isNode()) {
					throw {
						name: "intenseError",
						message: "Konfiguracja serwerowa nie została uruchomiona w środowisku Node.js!"
					}
				}

				intense.init(conf);
			} else {
				if (!intense.support('canvas')) {
					throw {
						name: "intenseError",
						message: "Twoja przeglądarka nie obsługuje elementu canvas!"
					}
				}
				
				intense.init(conf);
			}
			_initialize = true;
		}
	};

	/**
	 * intense.assetManager - manager zasobów gry
	 */
	intense.assetManager = (function () {
		var _assets = {},
			_load,
			_onLoad,
			_onError,
			_getAssetType,
			_getAssets,
			_checkAssets,
			_get,
			_remove,
			_removeAll,
			_gCount = 0,
			_gTotal = 0,
			_isLoaded = false;

		/**
		 * _load - metoda ładowania zasobów gry
		 * @param {Array} lub {String} elems - zasoby w postaci tablicy lub pojedyńczy łańcuch znaków
		 * @param {Array} lub {String} opt1 - alternatywne nazwy zasobów, bądź callback
		 * @param {object} opt2 - obiekt zawierający funkcje wywoływane na określone zdarzenia
		 */
		_load = function (elems, opt1, opt2) {
			var i, _assetLength, 
				_assetName, 
				_assetType,
				_cb = {};

			_isLoaded = true;

			if (_isString(elems)) {
				elems = [elems];
			}

			if (_isArray(elems)) {
				if (_isPlainObject(opt1)) {
					opt2 = {};
					_deepCopy(opt2, opt1);
					opt1 = [];
				} else if (_isString(opt1)) {
					opt1 = [opt1];
				} else {
					opt1 = [];
				}

				if (!_isSet(opt2)) {
					opt2 = {};
				}

				if (_isArray(opt1)) {
					_cb.total = elems.length;
					_cb.count = 0;

					_gTotal += elems.length;
					if (_isFunction(opt2.complete)) {
						_cb.loadCallback = {ob: opt2, fn: opt2.complete};
					}

					if (_isFunction(opt2.error)) {
						_cb.errorCallback = {ob: opt2, fn: opt2.error};
					}

					for (i = 0, _assetLength = elems.length; i < _assetLength; i++) {
						_assetName = (_isSet(opt1[i])) ? opt1[i] : elems[i];
						
						if (!_assets[_assetName]) {
							_assetType = _getAssetType(elems[i]);

							switch (_assetType) {
								case "image": 
									var _file = new Image();
									_file.onload = function () {
										_onLoad(this, _cb);
									};
									_file.onerror = function () {
										_onError(this, _cb);
									};

									_file.src = elems[i];
									_assets[_assetName] = _file;
									break;
								case "sound": 
									var _file = new Audio();
									_addEvent(_file, 'canplaythrough', function () {
										_onLoad(this, _cb);
									});
									_addEvent(_file, 'error', function () {
										_onError(this, _cb);
									});

									_file.src = elems[i];
									_assets[_assetName] = _file;
									break;
							}

						} else {
							_onLoad(_assets[_assetName], _cb);
						}
					}
				}
			}
		};

		/**
		 * _onLoad - callback uruchamiany w momencie wczytania zasobu
		 * @param {object} file - plik zasobu
		 * @param {object} opt - obiekt z callbackami
		 */
		_onLoad = function (file, opt) {
			opt.count++;
			if (opt.count == opt.total) {
				if (_isSet(opt.loadCallback)) {
					opt.loadCallback.fn.call(opt.loadCallback.ob, file);
				}
			}

			_gCount++;
			if (_gCount == _gTotal) {
				_isLoaded = false;
				_eventManager.notify('assetsLoaded', true);

				_eventManager.removeByType('assetsLoaded');
				_eventManager.removeByType('assetError');
			}
		};

		/**
		 * _onError - callback uruchamiany w momencie błędu wczytania zasobu
		 * @param {object} file - plik zasobu
		 * @param {object} opt - obiekt z callbackami
		 */
		_onError = function (file, opt) {
			if (_isSet(opt.errorCallback)) {
				opt.errorCallback.fn.call(opt.errorCallback.ob, file);
			}
		};

		/**
		 * _checkAssets - funkcja która podłącza słuchaczy pod zdarzenia ładowania i błędu zasobów
		 * @param {object} opt - obiekt z callbackami
		 */
		_checkAssets = function (opt) {
			if (_isPlainObject(opt)) {
				if ((_gCount == _gTotal) && !_isLoaded) {
					opt.complete();
				} else {
					if (_isFunction(opt.complete)) {
						_eventManager.listen('assetsLoaded', "complete", opt);
					}
					
					if (_isFunction(opt.error)) {
						_eventManager.listen('assetError', "error", opt);
					}
				}
			}
		};

		/**
		 * _getAssetType - zwraca typ zasobu
		 * @param {String} elem - nazwa zasobu
		 * @return {String} typ zasobu
		 */
		_getAssetType = function (elem) {
			if (elem.indexOf('.jpg') != -1 || elem.indexOf('.jpeg') != -1 || elem.indexOf('.png') != -1 || elem.indexOf('.gif') != -1 || elem.indexOf('.wp') != -1) {
				return "image";
			}

			if (elem.indexOf('.wav') != -1 || elem.indexOf('.m4a') != -1 || elem.indexOf('.mp3') != -1 || elem.indexOf('.ogg') != -1 || elem.indexOf('.aac') != -1) {
				return "sound";
			}

			return null;
		};

		/**
		 * _getAssets - zwraca tablice zasobów
		 * @return {Array} tablica zasobów
		 */
		_getAssets = function () {
			return _assets;
		};

		/**
		 * _get - zwraca zasób
		 * @param {String} name - nazwa zasobu
		 * @return {Object} zasób
		 */
		_get = function (name) {
			return (_assets[name]) ? _assets[name] : null;
		};

		/**
		 * _remove - usuwa zasób
		 * @param {String} name - nazwa zasobu
		 * @return {Boolean} true lub false
		 */
		_remove = function (name) {
			if (name === "*") {
				_removeAll();
				return true;
			}

			if (_assets[name]) {
				delete _assets[name];
				return true;
			}
			return false;
		};

		/**
		 * _removeAll - usuwa wszystkie zasoby
		 */
		_removeAll = function () {
			_assets = {};
		};

		return {
			load: _load,
			checkAssets: _checkAssets,
			getAssets: _getAssets,
			get: _get,
			remove: _remove,
			removeAll: _removeAll
		};
	}());
	
	/**
	 * intense.drawing - przestrzeń nazw funkcji wspomagających rysowanie
	 */
	intense.drawing = (function () {
		var _drawRotated;

		/**
		 * _drawRotated - rysowanie obrazów pod kątem
		 * @param {Image} image - obraz do narysowania
		 * @param {Number} x - współrzędna x
		 * @param {Number} y - współrzędna y
		 * @param {Number} angle - kąt w stopniach
		 * @param {Number} ratio - współczynnik skalowania
		 */
		_drawRotated = function (image, x, y, angle, ratio) {
			var ctx = intense.context;

			ctx.save();
		    ctx.translate(x, y);
		    ctx.rotate(angle * Math.PI/180);
		    if (ratio) {
			    ctx.drawImage(image, -(image.width/2), -(image.height/2), image.width * ratio, image.height * ratio);
			} else {
				ctx.drawImage(image, -(image.width/2), -(image.height/2));
			}
		    ctx.restore();
		};

		return {
			drawRotated: _drawRotated
		};
	}());

	/**
	 * intense.engine - obiekt zarządzający pętlą gry i innymi niskopoziomowymi mechanizmami
	 */
	intense.engine = (function () {
		var _tick,
			_serverTick,
			_id,
			_serverId,
			_temp,
			_startLoop,
			_stopLoop,
			_paused,
			_isPaused,
			_pause,
			_resume,
			_dt,
			_countFPS,
			_showFPS,
			_lastUpdateTime = _getCurrentTime(),
			_accumulator = 0.0,
			TIME_STEP = 0.03,
			MAX_ACCUMULATED_TIME = 1.0,
			_currentFPS = 0,
			_lastFPS = 0,
			_lastUpdatedFPS = _getCurrentTime();
			
		/**
		 * _tick - pętla czasu rzeczywistego
		 * Przełożenie na JS wg pomysłu Jacka Złydacha
		 */
		_tick = function () {
			var _sManager = intense.systemManager;
			
			if (!_paused) {
				_countFPS();

				_dt = _getCurrentTime() - _lastUpdateTime;
				_lastUpdateTime += _dt;
				_dt = Math.max(0, _dt);
				_accumulator += _dt;
				_accumulator = _clamp(_accumulator, 0, MAX_ACCUMULATED_TIME);

				while (_accumulator > TIME_STEP) {
					_sManager.update(TIME_STEP);
					_accumulator -= TIME_STEP;
				}
				intense.delta = _dt;
				_sManager.render(_dt);
				//console.log(_dt);

				intense.engine.showFPS(_lastFPS);
			}
		};

		/**
		 * _serverTick - pętla serwerowa do wysyłania wiadomości
		 */
		_serverTick = function () {
			var _sManager = intense.systemManager;
			
			if (!_paused) {
				_sManager.netUpdate();
			}
		};

		/**
		 * _countFPS - oblicza liczbę FPS (Frame Per Second)
		 */
		_countFPS = function () {
			_currentFPS++;
			if (_getCurrentTime() - _lastUpdatedFPS >= 1000) {
				_lastFPS = _currentFPS;
				_currentFPS = 0;
				_lastUpdatedFPS = _getCurrentTime();
			}
		};

		/**
		 * _showFPS - pokazuje aktualną wartość FPS
		 * @param {Number} _lastFPS - liczba FPSów
		 */
		_showFPS = function (_lastFPS) {
			intense.fps = _lastFPS;
		};

		/**
		 * _startLoop - uruchamia pętle czasu rzeczywistego
		 * @trigger loopLog
		 */
		_startLoop = function () {
			_paused = false;
			_temp = function () {
				_tick();
				_id = _animationFrame(_temp, intense.canvas);
			};
			_animationFrame(_temp, intense.canvas);

			if (_netSystems) {
				_serverId = setInterval(function () {
					_serverTick();
				}, 1000/_serverFPS);
			}

			_eventManager.notify('loopLog', "Uruchomiono pętlę gry");
		};

		/**
		 * _stopLoop - zatrzymuje pętle gry
		 * @trigger loopLog
		 */
		_stopLoop = function () {
			_paused = true;
			_clearAnimationFrame(_id);
			clearInterval(_serverId);

			_eventManager.notify('loopLog', "Zatrzymano pętlę gry");
		};

		/**
		 * _isPaused - sprawdza czy pętla jest zatrzymana
		 * @return {boolean} paused - true lub false
		 */
		_isPaused = function () {
			return _paused;
		};

		/**
		 * _pause - zatrzymuje grę, nie zatrzymuje pętli
		 * @trigger loopLog
		 */
		_pause = function () {
			_paused = true;

			_eventManager.notify('loopLog', "Pauza");
		};

		/**
		 * _resume - wznawia grę
		 * @trigger loopLog
		 */
		_resume = function () {
			_paused = false;

			_eventManager.notify('loopLog', "Wznowienie");
		};

		return {
			start: _startLoop,
			stop: _stopLoop,
			isPaused: _isPaused,
			pause: _pause,
			resume: _resume,
			delta: _dt,
			showFPS: _showFPS
		};
	}());
	
	/**
	 * intense.version - zwraca numer wersji frameworka
	 * @return {number} VERSION - numer wersji
	 */
	intense.version = function () {
		return VERSION;
	};

	/**
	 * intense.poolManager - manager zarządzania reużywanymi obiektami
	 */
	intense.poolManager = (function () {
		var components = [],
			_cSize = 20,
			_componentsSize,
			_getComponent,
			_addComponent,
			_removeComponent,
			_hasComponent,
			_clearComponentPool,
			_componentsLength,
			_listen,
			_removeListeners;

		/**
		 * _componentsSize - ustala ilość gromadzonych obiektów komponentów
		 * @param {Number} number - ilość komponentów
		 * @return {Number} _cSize - jeśli ustalono parametr to zwraca max wartość dla puli komponentów
		 */
		_componentsSize = function (number) {
			var n;

			if (_isSet(number)) {
				n = parseInt(number, 10);
				_cSize = n || 20;
			} else {
				return _cSize;
			}
		};

		/**
		 * _getComponent - zwraca obiekt komponentu z puli
		 * @trigger poolLog
		 * @param {String} name - nazwa komponentu
		 * @return {object} komponent
		 */
		_getComponent = function (name) {
			var _length = components.length,
				_temp;

			while (_length--) {
				if (components[_length].constructor.componentName == name) {
		        	_temp = components.splice(_length, 1);
		        	break;
            	}
			}

			if (_temp) {
				_eventManager.notify('poolLog', "Wyciągnięto komponent z puli: " + name);
				return _temp[0];
			}

			_eventManager.notify('poolLog', "Brak wymaganego komponentu w puli: " + name);

			return null;
		};

		/**
		 * _addComponent - dodaje obiekt komponentu do puli
		 * @trigger poolLog
		 * @param {object} ob - obiekt komponentu
		 */
		_addComponent = function (ob) {
			var cManager = intense.componentManager;

			if (!_isSet(ob)) {
				throw {
					name: "intenseComponentPoolError",
					message: "Nie podano nazwy komponentu!"
				};
			}

			if (!cManager.isComponent(ob)) {
				throw {
					name: "intenseComponentPoolError",
					message: "Podany obiekt komponentu nie istnieje!"
				};
			}

			if (_isString(ob)) {
				throw {
					name: "intenseComponentPoolError",
					message: "Dodawany obiekt musi być instancją komponentu!"
				};
			}

			if (components.length < _cSize) {
				_eventManager.notify('poolLog', "Dodano komponent do puli: " + ob.constructor.componentName);
				components.push(ob);
			}
		};

		/**
		 * _removeComponent - usuwa obiekt komponentu z puli
		 * @trigger poolLog
		 * @param {String} name - nazwa komponentu
		 * @return {Boolean} true lub false
		 */
		_removeComponent = function (name) {
			var _temp = false,
				_length = components.length;

			if (name == '*') {
				_clearComponentPool();
				return true;
			}

			while (_length--) {
				if (components[_length].constructor.componentName == name) {
		        	components.splice(_length, 1);
		        	_eventManager.notify('poolLog', "Usunięto z puli komponent: " + name);
		        	_temp = true;
            	}
			}

			return _temp;
		};

		/**
		 * _hasComponent - sprawdza czy istnieje komponent w puli
		 * @param {String} name - nazwa komponentu
		 * @return {Boolean} true lub false
		 */
		_hasComponent = function (name) {
			var _length = components.length;

			if (name == '*') {
				return (_length > 0) ? true : false;
			}

			while (_length--) {
				if (components[_length].constructor.componentName == name) {
		        	return true;
            	}
			}

			return false;
		};

		/**
		 * _clearComponentPool - czyści pule komponentów
		 * @trigger poolLog
		 */
		_clearComponentPool = function () {
			components = [];

			_eventManager.notify('poolLog', "Wyczyszczono pule komponentów");
		};

		/**
		 * _componentsLength - zwraca ilość komponentów z puli
		 * @return {Number} ilość komponentów
		 */
		_componentsLength = function () {
			return components.length;
		};

		/**
		 * _listen - nasłuchuje na zmiany w managerze komponentów
		 */
		_listen = function () {
			_eventManager.listen('removeComponent', "removeComponent", intense.poolManager);
		};

		/**
		 * _removeListeners - usuwa nasłuchiwanie na zdarzenia
		 */
		_removeListeners = function () {
			_eventManager.remove('removeComponent', "removeComponent", intense.poolManager);
		};
		
		return {
			componentsSize: _componentsSize,
			getComponent: _getComponent,
			addComponent: _addComponent,
			removeComponent: _removeComponent,
			hasComponent: _hasComponent,
			clearComponentPool: _clearComponentPool,
			componentsLength: _componentsLength,
			listen: _listen,
			removeListeners: _removeListeners
		};
	}());
	
	/**
	 * intense.io - przestrzeń nazw do komunikacji z serwerem
	 */
	intense.io = (function () {
		var _init,
			_allowMethods = ['websocket', 'long-polling', 'polling', 'socket.io', 'sockjs'],
			_globalMethod,
			_detectMethod,
			_connect,
			_parseUrl,
			_getXhr,
			_socket,
			_webSocket,
			_ajaxSocket,
			_ajax,
			_socketState;

		/**
		 * _socketState - stany połączeniowe zgodne z api websocket
		 */
		_socketState = {
			CONNECTING: 0,
			OPEN: 1,
			CLOSING: 2,
			CLOSED: 3
		};

		/**
		 * _init - inicjalizuje moduł poprzez wykrycie metody połączenia
		 * @trigger defaultLog
		 * @param {Object} ob - obiekt konfiguracyjny
		 */
		_init = function (ob) {
			var method;

			if (_isSet(ob.method)) {
				method;
			} else {
				method = 'auto';
			}

			if (method === true || method == 'auto') {
				_globalMethod = _detectMethod();
			} else {
				if (_inArray(_allowMethods, method)) {
					_globalMethod = method;
				} else {
					_globalMethod = _detectMethod();
				}
			}

			if (_isSet(ob.rate)) {
				_serverFPS = parseInt(ob.rate, 10) || 30;
				_netSystems = true;
			}

			_eventManager.notify('defaultLog', "Moduł IO zainicjalizowany!");

			return function () {
				_eventManager.notify('defaultLog', "Moduł IO już zainicjalizowany!");
			};
		};

		/**
		 * _detectMethod - ustawia metode połączenia
		 * @return {String} method - nazwa metody połączeniowej
		 */
		_detectMethod = function () {
			var _temp;

			if (_isSet(window.io) && _isFunction(window.io.connect)) {
				return 'socket.io';
			}

			if (_isSet(window.SockJS)) {
				return 'sockjs';
			}

			if (intense.support('websocket')) {
				return 'websocket';
			}

			return 'long-polling';
		};

		/**
		 * _connect - łączy się z danym adresem i zwraca obiekt połączenia
		 * @param {String} url - adres url serwera
		 * @param {object} params - dodatkowe parametry konfiguracyjne
		 * @return {object} - obiekt połączenia - różny w zależności od metody
		 */
		_connect = function (url, params) {
			var _method, socket,
				params = params || {};

			if (!_isSet(url) || !_isString(url)) {
				throw {
					name: "intenseIOError",
					message: "Nieprawidłowy adres połączenia!"
				};
			}

			if (_isSet(params.method) && _inArray(_allowMethods, params.method)) {
				_method = params.method;
			} else {
				_method = _globalMethod || 'websocket';
			}

			switch (_method) {
				case "socket.io": 
					if (_isSet(window.io) && _isFunction(window.io.connect)) {
						url = _parseUrl(url, 'http');
						return window.io.connect(url, params);
					} else {
						throw {
							name: "intenseIOError",
							message: "Nie znaleziono Socket.io!"
						};
					}
					break;
				case "sockjs": 
					if (_isSet(window.SockJS)) {
						url = _parseUrl(url, 'http');
						params.url = url;
						params.method = 'sockjs';
						return new _socket(params);
					} else {
						throw {
							name: "intenseIOError",
							message: "Nie znaleziono SockJS!"
						};
					}
					break;
				case "websocket": 
					socket = intense.support('websocket', true);
					if (!socket) {
						throw {
							name: "intenseIOError",
							message: "Przeglądarka nie obsługuje websocket!"
						};
					} 

					url = _parseUrl(url, 'ws');
					params.url = url;
					params.method = 'websocket';
					params.socket = socket;
					return new _socket(params);
					break;
				case "long-polling": 
					url = _parseUrl(url, 'http');
					params.url = url;
					params.method = 'long-polling';
					params.cors = !intense.utils.sameOrigin(url);
					return new _socket(params);
					break;
				case "polling": 
					url = _parseUrl(url, 'http');
					params.url = url;
					params.method = 'polling';
					params.cors = !intense.utils.sameOrigin(url);
					return new _socket(params);
					break;
			}
		};

		/**
		 * _socket - obiekt opakowujący wybraną metodę połączeniową
		 * @trigger ioLog
		 * @param {object} params - obiekt dodatkowych parametrów
		 * @return {object} _socket
		 */
		_socket = function (params) {
			var $this = this, init;

			this.origin = null;
			this.url = params.url;
			this.protocols = params.protocols || [];
			this.method = params.method;
			this.readyState = _socketState.CONNECTING;
			this.reconnect = false;

			if (_isSet(params.reconnect)) {
				if (_isNumber(params.reconnect)) {
					this.reconnect = params.reconnect;
				} else {
					this.reconnect = 1000;
				}
			}

			/**
			 * _init - prywatna funkcja tworząca podobiekt, pomocna w ponownym łączeniu
			 */
			init = function () {
				switch ($this.method) {
					case "sockjs": 
						$this.origin = new window.SockJS($this.url);
						break;
					case "websocket":
						$this.origin = _webSocket($this.url, params);
						break;
					case "polling":
					case "long-polling":
						$this.origin = new _ajaxSocket($this.url, params);
						break;
					default:
						$this.origin = _webSocket($this.url, params);
						break;
				}

				$this.origin.onopen = function (e) {
					_eventManager.notify('ioLog', "Otwarto połączenie z adresem: " + $this.url);
					$this.readyState = _socketState.OPEN;
					$this.onopen(e);
				};

				$this.origin.onmessage = function (e) {
					_eventManager.notify('ioLog', "Otrzymano wiadomość: " + e.data);
					$this.onmessage(e);
				};

				$this.origin.onclose = function (e) {
					_eventManager.notify('ioLog', "Zamknięto połączenie");
					if ($this.reconnect) {
						$this.readyState = _socketState.CLOSED;
						$this.onclose(e);
						$this.readyState = _socketState.CONNECTING;

						setTimeout(function () {
							init();
							_eventManager.notify('ioLog', "Próba przywrócenia połączenia");
						}, $this.reconnect);
					} else {
						$this.readyState = _socketState.CLOSED;
						$this.onclose(e);
					}
				};

				$this.origin.onerror = function (e) {
					_eventManager.notify('ioLog', "Wystąpił błąd połączenia");
					$this.onerror(e);
				};
			};

			init();

			/**
			 * onopen - funkcja uruchamiana w momencie otwarcia połączenia
			 * @param {object} e - obiekt zdarzenia
			 */
			this.onopen = function (e) {};
			/**
			 * onmessage - funkcja uruchamiana w momencie otrzymania wiadomości
			 * @param {object} e - obiekt zdarzenia
			 */
			this.onmessage = function (e) {};
			/**
			 * onclose - funkcja uruchamiana w momencie zamknięcia połączenia
			 * @param {object} e - obiekt zdarzenia
			 */
			this.onclose = function (e) {};
			/**
			 * onerror - funkcja uruchamiana w momencie błędu połączenia
			 * @param {object} e - obiekt zdarzenia
			 */
			this.onerror = function (e) {};
		};

		/**
		 * _socket.prototype - wspólne funkcje dla obiektów _socket
		 * @trigger ioLog
		 */
		_socket.prototype = {
			/**
			 * on - metoda upodabnająca api websocket do tego znanego z socket.io
			 * @param {String} type - akcja do której podpięty będzie callback
			 * @param {Function} callback - funkcja podpinana pod określoną akcje
			 */
			on: function (type, callback) {
				if (!_isSet(type) || !_isSet(callback)) {
					throw {
						name: "intenseIOError",
						message: "Brakuje argumentu dla funkcji socketu!"
					};
				}

				switch (type) {
					case "connect": 
						this.onopen = callback;
						break;
					case "message": 
						this.onmessage = callback;
						break;
					case "disconnect": 
						this.onclose = callback;
						break;
					case "error": 
						this.onerror = callback;
						break;
				}
			},
			/**
			 * send - wysyła dane do serwera
			 * @param {object} ob - obiekt do wysłania
			 */
			send: function (ob) {
				if (this.readyState == _socketState.OPEN) {
					this.origin.send(ob);
					_eventManager.notify('ioLog', "Wysłano wiadomość: " + ob);
				}
			},
			/**
			 * close - funkcja zamykająca połączenie
			 * @param {object} e - obiekt zdarzenia
			 */
			close: function () {
				this.origin.close.apply(this.origin, arguments);
			}
		};

		/**
		 * _webSocket - zwraca obiekt websocket
		 * @param {String} url - adres do połączenia
		 * @param {String} params - dodatkowe parametry
		 * @return {object} websocket
		 */
		_webSocket = function (url, params) {
			if (_isSet(params.socket)) {
				if (params.socket == "WebSocket") {
					if (_isSet(params.protocols)) {
						return new window.WebSocket(url, params.protocols);
					}
					return new window.WebSocket(url);
				} else if (params.socket == "MozWebSocket") {
					if (_isSet(params.protocols)) {
						return new window.MozWebSocket(url, params.protocols);
					}
					return new window.MozWebSocket(url);
				}
			}
			
			if (_isSet(params.protocols)) {
				return new window.WebSocket(url, params.protocols);
			}
			return new window.WebSocket(url);
		};

		/**
		 * _ajaxSocket - emulacja obiektu websocket za pomocą technik ajaxowych
		 * @param {String} url - adres do połączenia
		 * @param {String} params - dodatkowe parametry
		 * @return {object} _ajaxSocket
		 */
		_ajaxSocket = function (url, params) {
			var _xhr,
				_polling,
				_openingInterval,
				_pollingInterval,
				_abort = false,
				_openingDelay = params.openingDelay || 100,
				_pollingTime = params.pollingTime || 5000,
				_ajaxTimeout = params.ajaxTimeout || 20000,
				_type = params.method || 'long-polling',
				_method = {},
				_cors = params.cors || true,
				$this = this;

			/**
			 * właściwości websocket. BufferedAmount niezaimplementowane dla metody ajaxowej
			 */
			this.wasClean = true;
			this.bufferedAmount = 0;
			this.readyState = _socketState.CONNECTING;

			/**
			 * onopen - funkcja uruchamiana w momencie otwarcia połączenia
			 * @param {object} e - obiekt zdarzenia
			 */
			this.onopen = function (e) {};
			/**
			 * onmessage - funkcja uruchamiana w momencie otrzymania wiadomości
			 * @param {object} e - obiekt zdarzenia
			 */
			this.onmessage = function (e) {};
			/**
			 * onerror - funkcja uruchamiana w momencie błędu połączenia
			 * @param {object} e - obiekt zdarzenia
			 */
			this.onerror = function (e) {};
			/**
			 * onclose - funkcja uruchamiana w momencie zamknięcia połączenia
			 * @param {object} e - obiekt zdarzenia
			 */
			this.onclose = function (e) {};

			/**
			 * send - wysyła dane do serwera
			 * @param {object} ob - obiekt do wysłania
			 */
			this.send = function (ob) {
				var _result = true;

				_ajax({
					url: url,
					type: "POST",
					data: ob,
					cors: _cors,
					success: function (data) {
						$this.onmessage({
							data: data
						});
					}, 
					error: function () {
						_result = false;
						$this.wasClean = false;
						$this.onerror();
					}
				});

				return _result;
			};

			/**
			 * close - funkcja zamykająca połączenie
			 * @param {Number} code - zwrócony kod statusu
			 * @param {String} reason - powód rozłączenia
			 */
			this.close = function (code, reason) {
				window.clearTimeout(_openingInterval);

				if (_type == 'polling') {
					window.clearInterval(_pollingInterval);
				} else {
					_abort = true;
					window.clearTimeout(_pollingInterval);
				}
				_xhr.abort();

				code = code || 1000;
				reason = reason || "";

				$this.readyState = _socketState.CLOSED;
				$this.onclose({
					code: code,
					reason: reason,
					wasClean: $this.wasClean
				});
			};

			/**
			 * _method['polling'] - implementacja pollingu
			 */
			_method['polling'] = function () {
				_polling = function () {
					_xhr = _ajax({
						url: url,
						type: "GET",
						cors: _cors,
						success: function (data) {
							$this.onmessage({
								data: data
							});
						},
						error: function () {
							$this.onerror();
						},
						timeout: _ajaxTimeout
					});
				};

				_polling();
				_pollingInterval = window.setInterval(_polling, _pollingTime);
			};

			/**
			 * _method['long-polling'] - implementacja long-pollingu
			 */
			_method['long-polling'] = function () {
				_polling = function () {
					_xhr = _ajax({
						url: url,
						type: "GET",
						cors: _cors,
						success: function (data) {
							$this.onmessage({
								data: data
							});
						},
						complete: function () {
							if (!_abort) {
								_pollingInterval = setTimeout(function () {
									_polling();
								},_pollingTime);
							} 
						},
						error: function () {
							$this.onerror();
						},
						timeout: _ajaxTimeout
					});
				};
				
				_polling();
			};

			/**
			 * _openingInterval - emulacja otwarcia socketu
			 */
			_openingInterval = setTimeout(function () {
				$this.readyState = _socketState.OPEN;
				$this.onopen();
				_method[_type]();
			}, _openingDelay);
		};

		/**
		 * _ajax - umożliwia wysłanie żadania ajaxowego na wskazany adres
		 * @param {object} params - parametry żądania
		 * @return {object} XMLHttpRequest
		 */
		_ajax = function (params) {
			var xhr = _getXhr(),
				_corsIE = false,
				_timer,
				_corsType;

			if (_isNode()) {
				return null;
			}

			params = params || {};

			if (!_isSet(params.dataType)) {
				params.dataType = "text";
			}

			if (!_isSet(params.data)) {
				params.data = null;
			} else if (_isPlainObject(params.data)) {
				params.data = _serializeJSON(params.data);
			}

			if (!_isSet(params.timeout)) {
				params.timeout = 30000;
			}

			if (!_isSet(params.cors)) {
				params.cors = false;
			} else {
				params.cors = !!params.cors;
			}

			if (!_isSet(params.type)) {
				params.type = "POST";
			}

			if (!_isSet(params.url)) {
				params.url = "";
			}

			if (!_isSet(params.sync)) {
				params.sync = true;
			} else {
				params.sync = !!params.sync;
			}

			if (!_isSet(params.success) || !_isFunction(params.success)) {
				params.success = function () {};
			}

			if (!_isSet(params.error) || !_isFunction(params.error)) {
				params.error = function () {};
			}

			if (!_isSet(params.complete) || !_isFunction(params.complete)) {
				params.complete = function () {};
			}

			if (params.cors) {
				_corsType = intense.support('cors', true);

				if (_corsType == "XDomainRequest") {
					_corsIE = true;
					xhr = new window.XDomainRequest();
				} else if (_corsType != "XMLHttpRequest" && _corsType != "XDomainRequest") {
					throw {
						name: "intenseIOError",
						message: "Przeglądarka nie obsługuje CORS!"
					};
				}
			}

			_timer = setTimeout(function () {
				xhr.abort();
				params.error();
				params.complete();
				xhr = null;
			}, params.timeout);

			xhr.open(params.type, params.url, params.sync);

			if (!_corsIE) {
				if (params.type == "POST") {
					if (!_isSet(params.headers)) {
						params.headers = "application/x-www-form-urlencoded; charset=utf-8";
					}
					xhr.setRequestHeader("Content-Type", params.headers);
				}

				xhr.onreadystatechange = function () {
					if (xhr.readyState == 4) {
						window.clearTimeout(_timer);
						if (((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (window.navigator.userAgent.indexOf("Safari") >= 0 && !_isSet(xhr.status)))) {
							if (params.dataType == "xml") {
								params.success(xhr.responseXML);
							} else {
								params.success(xhr.responseText);
							}
						} else {
							params.error();
						}
						params.complete();
						xhr = null;
					}
				};
			} else {
				xhr.onload = function () {
					window.clearTimeout(_timer);
					params.success(xhr.responseText);
					params.complete();
					xhr = null;
				};

				xhr.ontimeout = function () {
					params.error();
					params.complete();
					xhr = null;
				};
				xhr.onprogress = function () {};
				xhr.onerror = function () {
					params.error();
					params.complete();
					xhr = null;
				};
			}

			xhr.send(params.data);

			return xhr;
		};

		/**
		 * _parseUrl - parsuje adres pod kątem preferowanego protokołu
		 * @param {String} url - adres do połączenia
		 * @param {String} prefer - preferowany protokół
		 * @return {String} url
		 */
		_parseUrl = function (url, prefer) {
			if (prefer == 'http') {
				return url.replace('ws:', 'http:').replace('wss:', 'https:');
			}
			
			return url.replace('http:', 'ws:').replace('https:', 'wss:');
		};

		/**
		 * _getXhr - zwraca obiekt XMLHttpRequest
		 * @return {object} XMLHttpRequest
		 */
		_getXhr = (function () {
			var xhr;

			if (_isNode()) {
				return null;
			}
			
			if (_isSet(window.XMLHttpRequest)) {
				return function () {
					return new window.XMLHttpRequest();
				}
			}
			
			try {
				xhr = new window.ActiveXObject("MSXML2.XMLHTTP");
				return function () {
					return new window.ActiveXObject("MSXML2.XMLHTTP");
				}
			} catch (e) {
				try {
					xhr = new window.ActiveXObject("Microsoft.XMLHTTP");
					return function () {
						return new window.ActiveXObject("Microsoft.XMLHTTP");
					}
				} catch (e){
					throw {
						name: "intenseIOError",
						message: "Nie można utworzyć obiektu XMLHttpRequest!"
					};
				}
			}
		}());

		return {
			init: _init,
			connect: _connect,
			getXhr: _getXhr,
			detectMethod: _detectMethod,
			ajax: _ajax
		};
	}());

	/**
	 * intense.systemManager - manager zarządzania systemami
	 */
	intense.systemManager = (function () {
		var systems = {},
			updateQueue = [],
			renderQueue = [],
			netUpdateQueue = [],
			_sortSystemQueue,
			_prepareSystems,
			_system,
			_createSystem,
			_systemFabric,
			_dequeueSystem,
			_dequeueSystems,
			_inQueue,
			_isSystem,
			_getSystem,
			_getSystemList,
			_getSystems,
			_getObjectsCount,
			_getObjects,
			_removeSystem,
			_removeSystems,
			_updateSystems,
			_renderSystems,
			_netUpdateSystems,
			_addToQueue;

		/**
		 * _sortSystemQueue - sortuje kolejki systemów
		 * @trigger systemLog
		 * @param {Array} systemQueue - kolejka systemów
		 * @param {String} order - kolejność: low lub high
		 */
		_sortSystemQueue = function (systemQueue, order) {
			if (systemQueue == 'update') {
				systemQueue = updateQueue;
			} else if (systemQueue == 'render') {
				systemQueue = renderQueue;
			} else if (systemQueue == 'net') {
				systemQueue = netUpdateQueue;
			}

			if (!_isSet(order) || order == 'low') {
				systemQueue.sort(function(a, b) {
					return a.constructor.priority - b.constructor.priority;
				});
			} else {
				systemQueue.sort(function(a, b) {
					return b.constructor.priority - a.constructor.priority;
				});
			}

			_eventManager.notify('systemLog', "Sortowanie kolejek systemów");
		};

		/**
		 * _prepareSystems - ustanawia obiekty systemów i dodaje je do kolejki
		 * @trigger queueSystem
		 */
		_prepareSystems = function () {
			var i, _system;

			for (i in systems) {
				if (systems.hasOwnProperty(i)) {
					if (systems[i].manual === false) {
						_system = new systems[i];
						if (systems[i].type == 'update') {
							updateQueue.push(_system);
						} else if (systems[i].type == 'render') {
							renderQueue.push(_system);
						} else if (systems[i].type == 'net') {
							netUpdateQueue.push(_system);
						}
						_eventManager.notify('queueSystem', _system.constructor.systemName);
					}
				}
			}

			_sortSystemQueue('update');
			_sortSystemQueue('render');
			_sortSystemQueue('net');

			return function () {
				_eventManager.notify('defaultLog', "Systemy już przygotowane!");
			};
		};

		/**
		 * _addToQueue - dodaje system do kolejki
		 * @trigger queueSystem
		 * @param {object} ob - nazwa lub obiekt systemu
		 */
		_addToQueue = function (ob) {
			var _system;

			if (!_isSystem(ob)) {
				throw {
					name: "intenseSystemError",
					message: "Podany system nie istnieje!"
				}
			}

			if (_isString(ob)) {
				_system = _getSystem(ob);
				_system = new _system();
				if (_system.constructor.type == 'update') {
					updateQueue.push(_system);
					_sortSystemQueue('update');
				} else if (_system.constructor.type == 'render') {
					renderQueue.push(_system);
					_sortSystemQueue('render');
				} else if (_system.constructor.type == 'net') {
					netUpdateQueue.push(_system);
					_sortSystemQueue('net');
				}
				_eventManager.notify('queueSystem', ob);
			} else {
				_system = ob;
				if (_system.constructor.type == 'update') {
					updateQueue.push(_system);
					_sortSystemQueue('update');
				} else if (_system.constructor.type == 'render') {
					renderQueue.push(_system);
					_sortSystemQueue('render');
				} else if (_system.constructor.type == 'net') {
					netUpdateQueue.push(_system);
					_sortSystemQueue('net');
				}
				_eventManager.notify('queueSystem', ob.constructor.systemName);
			}
		};

		/**
		 * _inQueue - funkcja sprawdzająca czy dany system jest już w kolejce
		 * @param {String} name - nazwa systemu
		 * @return {Boolean} true lub false
		 */
		_inQueue = function (name) {
			var i, _length;

			for (i = 0, _length = updateQueue.length; i < _length; i++) {
				if (updateQueue[i].constructor.systemName == name) {
					return true;
				}
			}

			for (i = 0, _length = renderQueue.length; i < _length; i++) {
				if (renderQueue[i].constructor.systemName == name) {
					return true;
				}
			}

			for (i = 0, _length = netUpdateQueue.length; i < _length; i++) {
				if (netUpdateQueue[i].constructor.systemName == name) {
					return true;
				}
			}

			return false;
		};

		/**
		 * _updateSystems - wykonuje metodę update każdego systemu typu "update"
		 * @param {Number} time_step - stały krok aktualizacji pętli
		 */
		_updateSystems = function (time_step) {
			var i, _length;

			for (i = 0, _length = updateQueue.length; i < _length; i++) {
				updateQueue[i].update(time_step);
			}
		};

		/**
		 * _renderSystems - wykonuje metodę update każdego systemu typu "render"
		 * @param {Number} dt - delta
		 */
		_renderSystems = function (dt) {
			var i, _length;

			for (i = 0, _length = renderQueue.length; i < _length; i++) {
				renderQueue[i].update(dt);
			}
		};

		/**
		 * _netUpdateSystems - wykonuje metodę update każdego systemu typu "net"
		 */
		_netUpdateSystems = function () {
			var i, _length;

			for (i = 0, _length = netUpdateQueue.length; i < _length; i++) {
				netUpdateQueue[i].update();
			}
		};

		/**
		 * _dequeueSystem - usuwa z kolejki dany system
		 * @trigger dequeueSystem
		 * @param {String} name - nazwa systemu 
		 * @return {Boolean} true lub false
		 */
		_dequeueSystem = function (name) {
			var _length, _temp = false;

			if (name == '*') {
				_dequeueSystems();
				return true;
			}

			_length = updateQueue.length;
			while (_length--) {
				if (updateQueue[_length].constructor.systemName == name) {
					updateQueue[_length].entities.removeListeners();
		        	updateQueue.splice(_length, 1);
		        	_temp = true;
            	}
			}

			_length = renderQueue.length;
			while (_length--) {
				if (renderQueue[_length].constructor.systemName == name) {
					renderQueue[_length].entities.removeListeners();
		        	renderQueue.splice(_length, 1);
		        	_temp = true;
            	}
			}

			_length = netUpdateQueue.length;
			while (_length--) {
				if (netUpdateQueue[_length].constructor.systemName == name) {
					netUpdateQueue[_length].entities.removeListeners();
		        	netUpdateQueue.splice(_length, 1);
		        	_temp = true;
            	}
			}

			if (_temp) {
				_eventManager.notify('dequeueSystem', name);
			}
			return _temp;
		};

		/**
		 * _dequeueSystems - czyści kolejki systemów
		 * @trigger dequeueSystem
		 */
		_dequeueSystems = function () {
			var _length;

			_length = updateQueue.length;
			while (_length--) {
				updateQueue[_length].entities.removeListeners();
			}

			_length = renderQueue.length;
			while (_length--) {
				renderQueue[_length].entities.removeListeners();
			}

			_length = netUpdateQueue.length;
			while (_length--) {
				netUpdateQueue[_length].entities.removeListeners();
			}

			updateQueue = [];
			renderQueue = [];
			netUpdateQueue = [];
			_eventManager.notify('dequeueSystem', '*');
		};

		/**
		 * _getSystem - zwraca konstruktor systemu
		 * @param {object} ob - number lub string
		 * @return {Function} system
		 */
		_getSystem = function (ob) {
			if (_isString(ob)) {
				if (_isSet(systems[ob])) {
					return systems[ob];
				}
			}
			return null;
		};

		/**
		 * _getSystemList - zwraca liste dostępnych systemów
		 * @return {array} lista systemów
		 */
		_getSystemList = function () {
			var _temp = [], i;

			for (i in systems) {
				if (systems.hasOwnProperty(i)) {
					_temp.push(i);
				}
			}
			return _temp;
		};

		/**
		 * _getSystems - zwraca wszystkie systemy (słownik)
		 * @return {object} słownik systemów
		 */
		_getSystems = function () {
			return systems;
		};

		/**
		 * _getObjectsCount - zwraca ilość utworzonych obiektów systemów
		 * @param {String} type - typ systemu. Jeżeli pusty, zwróci sume kolejek
		 * @return {Number} ilość utworzonych obiektów systemów
		 */
		_getObjectsCount = function (type) {
			if (_isSet(type)) {
				if (type == 'render') {
					return renderQueue.length;
				} else if (type == 'update') {
					return updateQueue.length;
				} else if (type == 'net') {
					return netUpdateQueue.length;
				}
			}

			return (updateQueue.length + renderQueue.length + netUpdateQueue.length);
		};

		/**
		 * _getObjects - zwraca liste utworzonych obiektów systemów
		 * @param {String} type - typ systemu. Jeżeli pusty, zwróci sume kolejek
		 * @return {Array} listy z obiektami systemów
		 */
		_getObjects = function (type) {
			if (_isSet(type)) {
				if (type == 'render') {
					return renderQueue;
				} else if (type == 'update') {
					return updateQueue;
				} else if (type == 'net') {
					return netUpdateQueue;
				}
			}

			return _arrayMerge(_arrayMerge(updateQueue, renderQueue), netUpdateQueue);
		};

		/**
		 * _removeSystem - usuwa wybrany system
		 * @trigger removeSystem
		 * @param {string} name - nazwa systemu
		 * @return {boolean} powodzenie lub nie usuwania systemu
		 */
		_removeSystem = function (name) {
			if (_isSet(name) && _isString(name)) {
				if (name == '*') {
					_removeSystems();
					return true;
				} else if (_isSet(systems[name])) {
					_eventManager.notify('removeSystem', name);
					_dequeueSystem(name);
					delete systems[name];
					return true;
				}
			}
			return false;
		};

		/**
		 * _removeSystems - usuwa wszystkie systemy
		 * @trigger removeSystem
		 */
		_removeSystems = function () {
			systems = {};
			_dequeueSystems();

			_eventManager.notify('removeSystem', '*');
		};

		/**
		 * _createSystem - metoda managera do tworzenia nowych systemów
		 * @trigger newSystem
		 * @param {String} name - nowy system
		 * @param {object} props - parametry systemu
		 * @return {Function} system
		 */
		_createSystem = function (name, props) {
			var props = props || {};

			if (!_isSet(name)) {
				throw {
					name: "intenseSystemError",
					message: "Nie podano nazwy systemu!"
				};
			}
			name += "";
			if (_isSet(systems[name])) {
				throw {
					name: "intenseSystemError",
					message: "System o podanej nazwie już istnieje!"
				};
			}

			if (!_isSet(props.update) || !_isFunction(props.update)) {
				throw {
					name: "intenseSystemError",
					message: "System musi posiadać metodę update!"
				};
			}

			if (!_isSet(props.manual)) {
				props.manual = false;
			} else {
				props.manual = !!props.manual;
			}

			if (!_isSet(props.components)) {
				props.components = '*';
			} else {
				if (_isString(props.components) && props.components == '*') {
					props.components = '*';
				} else if (!_isArray(props.components)) {
					throw {
						name: "intenseSystemError",
						message: "Wymagane komponenty muszą być podane w formie tablicy!"
					};
				}
			}

			if (!_isSet(props.type) || (props.type == 'update') || (props.type != 'render' && props.type != 'net')) {
				props.type = 'update';
			}

			if (!_isSet(props.priority)) {
				props.priority = 1;
			}

			systems[name] = _systemFabric(name, props);
			_eventManager.notify('newSystem', name);

			return systems[name];
		};

		/**
		 * konstruktor dla systemów
		 */
		_system = function () {};

		/**
		 * _systemFabric - fabryka systemów
		 * @param {string} name - nazwa systemu
		 * @param {object} props - parametry dla fabryki
		 * @return {Function} konstruktor systemu
		 */
		_systemFabric = function (name, props) {
			var system, F, i,
				data = {}, 
				withoutNew = false;

			system = function () {
				if (!(this instanceof system)) {
					if (arguments.length > 0) {
						withoutNew = true;
						return new system(arguments);
					}
					return new system();
				}

				if (!_isObjectEmpty(data)) {
					_deepCopy(this, data);
				}

				this.entities = new intense.EntitySet(system.components);
				this.entities.listen();
				
				if (system.prototype.hasOwnProperty('__init')) {
					if (withoutNew) {
						withoutNew = false;
						system.prototype.__init.apply(this, arguments[0]);
					} else {
						system.prototype.__init.apply(this, arguments);
					}
				}
			};
			F = function () {};
			F.prototype = _system.prototype;
			system.prototype = new F();
			system.prototype.constructor = system;
			system.systemName = name;

			for (i in props) {
				if (i == "manual") {
					system.manual = props[i];
				} else if (i == "init") {
					system.prototype.__init = props[i];
				} else if (i == "components") {
					system.components = props[i];
				} else if (i == "type") {
					system.type = props[i];
				} else if (i == "priority") {
					system.priority = props[i];
				} else if (_isFunction(props[i])) {
					system.prototype[i] = props[i];
				} else {
					data[i] = props[i];
				}
			}

			return system;
		};

		/**
		 * _isSystem - sprawdza czy podany obiekt jest systemem
		 * @param {object} lub {string} - system
		 * @return {boolean} true lub false
		 */
		_isSystem = function (system) {
			if (_isString(system)) {
				if (_isSet(systems[system])) {
					return true;
				}
			} else if (_isSet(system) && (system instanceof _system)) {
				return true;
			}

			return false;
		};

		return {
			get: _getSystem,
			getList: _getSystemList,
			getAll: _getSystems,
			getObjectsCount: _getObjectsCount,
			getObjects: _getObjects,
			remove: _removeSystem,
			removeAll: _removeSystems,
			create: _createSystem,
			prepare: _prepareSystems,
			sort: _sortSystemQueue,
			deQueue: _dequeueSystem,
			deQueueAll: _dequeueSystems,
			update: _updateSystems,
			render: _renderSystems,
			netUpdate: _netUpdateSystems,
			add: _addToQueue,
			isSystem: _isSystem,
			inQueue: _inQueue
		};
	}());

	/**
	 * intense.componentManager - manager zarządzania komponentami
	 */
	intense.componentManager = (function () {
		var components = {},
			_getComponent,
			_getComponentList,
			_getComponents,
			_removeComponents,
			_removeComponent,
			_createComponent,
			_component,
			_componentFabric,
			_isComponent;

		/**
		 * _getComponent - wyszukuje komponent z kolekcji
		 * @param {object} ob - nazwa komponentu
		 * @return {Function} komponent
		 */
		_getComponent = function (ob) {
			if (_isString(ob)) {
				if (_isSet(components[ob])) {
					return components[ob];
				}
			}
			return null;
		};

		/**
		 * _getComponentList - zwraca liste dostępnych komponentów
		 * @return {array} lista komponentów
		 */
		_getComponentList = function () {
			var _temp = [], i;

			for (i in components) {
				if (components.hasOwnProperty(i)) {
					_temp.push(i);
				}
			}
			return _temp;
		};

		/**
		 * _getComponents - zwraca wszystkie komponenty (słownik)
		 * @return {object} słownik komponentów
		 */
		_getComponents = function () {
			return components;
		};

		/**
		 * _removeComponent - usuwa wybrany komponent
		 * @trigger removeComponent
		 * @param {string} name - nazwa komponentu
		 * @return {boolean} powodzenie lub nie usuwania komponentu
		 */
		_removeComponent = function (name) {
			if (_isSet(name) && _isString(name)) {
				if (name == '*') {
					_removeComponents();
					return true;
				} else if (_isSet(components[name])) {
					_eventManager.notify('removeComponent', name);
					delete components[name];
					return true;
				}
			}
			return false;
		};

		/**
		 * _removeComponents - usuwa wszystkie komponenty
		 * @trigger removeComponent
		 */
		_removeComponents = function () {
			components = {};
			_eventManager.notify('removeComponent', '*');
		};

		/**
		 * _createComponent - metoda managera do tworzenia nowych komponentów
		 * @trigger newComponent
		 * @param {String} name - nowy komponent
		 * @param {object} props - parametry komponentu
		 * @return {Function} komponent
		 */
		_createComponent = function (name, props) {
			if (!_isSet(name)) {
				throw {
					name: "intenseComponentError",
					message: "Nie podano nazwy komponentu!"
				};
			}
			name += "";
			if (_isSet(components[name])) {
				throw {
					name: "intenseComponentError",
					message: "Komponent o podanej nazwie już istnieje!"
				};
			}

			components[name] = _componentFabric(name, props);
			_eventManager.notify('newComponent', name);

			return components[name];
		};

		/**
		 * konstruktor dla komponentów
		 */
		_component = function () {};

		/**
		 * _componentFabric - fabryka komponentów
		 * @param {string} name - nazwa komponentu
		 * @param {object} props - parametry dla fabryki
		 * @return {Function} konstruktor komponentu
		 */
		_componentFabric = function (name, props) {
			var component, F, _cTemp,
				withoutNew = false, 
				_cfg = intense.cfg,
				_pManager = intense.poolManager,
				props = props || {};

			component = function () {
				if (_cfg.pooling && _pManager.hasComponent(name)) {
					_cTemp = _pManager.getComponent(name);
					if (arguments.length > 0) {
						_cTemp.prototype.__init.apply(_cTemp, arguments);
					}
					return _cTemp;
				}

				if (!(this instanceof component)) {
					if (arguments.length > 0) {
						withoutNew = true;
						return new component(arguments);
					}
					return new component();
				}

				if (_isSet(props.data)) {
					_deepCopy(this, props.data);
				}
				
				if (component.prototype.hasOwnProperty('__init')) {
					if (withoutNew) {
						withoutNew = false;
						component.prototype.__init.apply(this, arguments[0]);
					} else {
						component.prototype.__init.apply(this, arguments);
					}
				}
			};
			F = function () {};
			F.prototype = _component.prototype;
			component.prototype = new F();
			component.prototype.constructor = component;
			component.componentName = name;

			if (_isSet(props.inject) && _isArray(props.inject)) {
				component.inject = props.inject;
			}

			if (_isSet(props.system)) {
				_deepCopy(component.prototype, props.system);
			}

			if (props.hasOwnProperty('init')) {
				component.prototype.__init = props.init;
			}

			return component;
		};

		/**
		 * _isComponent - sprawdza czy podany obiekt jest komponentem
		 * @param {object} lub {string} - komponent
		 * @return {boolean} true lub false
		 */
		_isComponent = function (component) {
			if (_isString(component)) {
				if (_isSet(components[component])) {
					return true;
				}
			} else if (_isSet(component) && (component instanceof _component)) {
				return true;
			}

			return false;
		};

		return {
			get: _getComponent,
			getList: _getComponentList,
			getAll: _getComponents,
			remove: _removeComponent,
			removeAll: _removeComponents,
			create: _createComponent,
			isComponent: _isComponent
		};
	}());
	
	/**
	 * intense.entityManager - manager zarządzania encjami
	 */
	intense.entityManager = (function () {
		var entities = {},
			entitiesNames = {},
			componentsBinding = {},
			cManager = intense.componentManager,
			_lastId = 1,
			_freeId,
			_getId,
			_findFreeId,
			_createEntity,
			_removeEntity,
			_getComponentsBinding,
			_newComponentBind,
			_removeComponentBind,
			_injectComponent,
			_addComponent,
			_removeComponent,
			_toggleComponent,
			_removeComponents,
			_hasComponent,
			_setComponent,
			_getComponent,
			_getComponentList,
			_getComponents,
			_findEntity,
			_removeEntities,
			_getEntities,
			_getEntityList,
			_getName,
			_cloneEntity,
			_entity,
			_isEntity,
			_EntitySet;

		/**
		 * _getComponentsBinding - zwraca słownik powiązań komponentów z encjami.
		 * @return {object} componentsBinding
		 */
		_getComponentsBinding = function () {
			return componentsBinding;
		};

		/**
		 * _newComponentBind - tworzy miejsce powiązań komponentu z encjami.
		 * @param {string} name - nazwa komponentu
		 */
		_newComponentBind = function (name) {
			if (!cManager.isComponent(name)) {
				throw {
					name: "intenseComponentError",
					message: "Podany komponent nie istnieje!"
				};
			}
			if (!_isSet(componentsBinding[name])) {
				componentsBinding[name] = {};
			}
		};

		/**
		 * _removeComponentBind - usuwa powiązanie encji z komponentem.
		 * @param {string} name - nazwa komponentu
		 */
		_removeComponentBind = function (name) {
			var entities;

			if (name == '*') {
				componentsBinding = {};
			} else {
				if (!cManager.isComponent(name)) {
					throw {
						name: "intenseComponentError",
						message: "Podany komponent nie istnieje!"
					};
				}
				if (_isSet(componentsBinding[name])) {
					delete componentsBinding[name];
				}
			}
		};
		
		/**
		 * _getId - zwraca wolny id dla encji. Wykorzystuje id, które pozostało
		 * po usuniętej encji.
		 * @return {number} _lastId lub _freeId
		 */
		_getId = function () {
			var _temp;

			if (_freeId == _lastId) {
				_freeId = null;
			}

			if (_freeId != null) {
				return _freeId;
			} else {
				_temp = _lastId;
				_lastId += 1;
				return _temp;
			}
		};

		/**
		 * _findFreeId - szuka wolnego id
		 * @trigger entityLog
		 * @return (Number) id
		 */
		_findFreeId = function () {
			var i, _id = null;
			for (i = 1; i < _lastId; i++) {
				if (!_isSet(entities[i])) {
					_id = i;
					break;
				}
			}

			_eventManager.notify('entityLog', "Znaleziono wolne id dla encji: " + _id);
			return _id;
		};
		
		/**
		 * _findEntity - wyszukuje encję z kolekcji w zależności od typu
		 * parametru. Może wyszukać encję po id lub też po nazwie (nawet kilka)
		 * @param {object} ob - number lub string
		 * @return {object} entity
		 */
		_findEntity = function (ob) {
			var i, _temp = [], _e;

			if (_isNumber(ob)) {
				if (_isSet(entities[ob])) {
					return entities[ob];
				}
			} else if (_isString(ob)) {
				if (ob == "*") {
					return _getEntities();
				}

				for (i in entitiesNames) {
					if (entitiesNames.hasOwnProperty(i)) {
						if (ob == entitiesNames[i]) {
							_temp.push(entities[i]);
						}
					}
				}

				if (_temp.length == 1) {
					return _temp[0];
				} else if (_temp.length > 1) {
					return _temp;
				}
			}
			return null;
		};
		
		/**
		 * _createEntity - metoda managera do tworzenia nowych encji
		 * @param {object} props - parametry encji
		 * @return {object} entity
		 * @trigger newEntity
		 */
		_createEntity = function (props) {
			var _id = _getId();
			entities[_id] = new _entity(_id, props);

			if (_freeId != null) {
				_freeId = _findFreeId();
			}

			_eventManager.notify('newEntity', entities[_id]);

			return entities[_id];
		};
		
		/**
		 * _removeEntity - usuwa encję, wywoływana z poziomu systemu lub encji.
		 * Zwraca true lub false w zależności od wyniku operacji.
		 * @param {object} entity - number lub string
		 * @return {boolean} true lub false
		 * @trigger removeEntity
		 */
		_removeEntity = function (entity) {
			var i, c, 
				_result = false, 
				_temp = [], 
				_cfg = intense.cfg,
				_pManager = intense.poolManager,
				_length;
			
			if (!(this instanceof _entity)) {
				if (_isNumber(entity)) {
					if (_isSet(entities[entity])) {
						delete entities[entity];
						_freeId = entity;

						if (_isSet(entitiesNames[entity])) {
							delete entitiesNames[entity];
						}

						for (i in componentsBinding) {
							if (componentsBinding.hasOwnProperty(i)) {
								if (_isSet(componentsBinding[i][entity])) {
									if (_cfg.pooling) {
										_pManager.addComponent(componentsBinding[i][entity]);
									}
									delete componentsBinding[i][entity];
								}
							}
						}

						_eventManager.notify('removeEntity', entity);
						return true;
					}
				} else if (_isEntity(entity)) {
					if (_isSet(entities[entity.id])) {
						delete entities[entity.id];
						_freeId = entity.id;

						if (_isSet(entitiesNames[entity.id])) {
							delete entitiesNames[entity.id];
						}

						for (i in componentsBinding) {
							if (componentsBinding.hasOwnProperty(i)) {
								if (_isSet(componentsBinding[i][entity.id])) {
									if (_cfg.pooling) {
										_pManager.addComponent(componentsBinding[i][entity.id]);
									}
									delete componentsBinding[i][entity.id];
								}
							}
						}

						_eventManager.notify('removeEntity', entity.id);
						return true;
					}
				} else if (_isString(entity)) {
					if (entity == "*") {
						_removeEntities();
						return true;
					}

					for (i in entitiesNames) {
						if (entitiesNames.hasOwnProperty(i)) {
							if (entity == entitiesNames[i]) {
								_temp.push(i);
								delete entitiesNames[i];
								delete entities[i];

								_eventManager.notify('removeEntity', parseInt(i, 10));
							}
						}
					}

					for (i = 0, _length = _temp.length; i < _length; i++) {
						for (c in componentsBinding) {
							if (componentsBinding.hasOwnProperty(c)) {
								if (_isSet(componentsBinding[c][i])) {
									if (_cfg.pooling) {
										_pManager.addComponent(componentsBinding[c][i]);
									}
									delete componentsBinding[c][i];
								}
							}
						}
					}

					_freeId = _findFreeId();
					return _result;
				}
			} else {
				delete entities[this.id];
				_freeId = this.id;

				if (_isSet(entitiesNames[this.id])) {
					delete entitiesNames[this.id];
				}

				for (i in componentsBinding) {
					if (componentsBinding.hasOwnProperty(i)) {
						if (_isSet(componentsBinding[i][this.id])) {
							if (_cfg.pooling) {
								_pManager.addComponent(componentsBinding[i][this.id]);
							}
							delete componentsBinding[i][this.id];
						}
					}
				}

				_eventManager.notify('removeEntity', this.id);

				return true;
			}

			return false;
		};

		/**
		 * _removeEntities - usuwa wszystkie encje
		 * @trigger removeEntity
		 */
		_removeEntities = function () {
			var i, j, _cfg = intense.cfg,
				_pManager = intense.poolManager;

			if (_cfg.pooling) {
				for (i in componentsBinding) {
					if (componentsBinding.hasOwnProperty(i)) {
						for (j in componentsBinding[i]) {
							if (componentsBinding[i].hasOwnProperty(j)) {
								_pManager.addComponent(componentsBinding[i][j]);
							}
						}
						componentsBinding[i] = {};
					}
				}
			} else {
				for (i in componentsBinding) {
					if (componentsBinding.hasOwnProperty(i)) {
						componentsBinding[i] = {};
					}
				}
			}

			_freeId = null;
			_lastId = 1;
			entities = {};
			entitiesNames = {};

			_eventManager.notify('removeEntity', '*');
		};

		/**
		 * _getEntities - zwraca wszystkie encje lub też zawierające dany komponent.
		 * @param {object} component - nazwa komponentu
		 * @param {boolean} onlyId - czy zwrócić tylko id encji
		 * @return {object} lista encji
		 */
		_getEntities = function (component, onlyId) {
			var temp = [], 
				temp2 = [], 
				i, j, _length, onlyId = !!onlyId;

			if (!_isSet(component)) {
				return _getEntityList();
			}

			if (_isString(component)) {
				if (_isSet(componentsBinding[component])) {
					for (i in componentsBinding[component]) {
						if (componentsBinding[component].hasOwnProperty(i)) {
							if (onlyId) {
								temp.push(i);
							} else {
								temp.push(entities[i]);
							}
						}
					}
					return temp;
				}
			} else if (_isArray(component)) {
				for (j = 0, _length = component.length; j < _length; j++) {
					if (_isSet(componentsBinding[component[j]])) {
						for (i in componentsBinding[component[j]]) {
							if (componentsBinding[component[j]].hasOwnProperty(i)) {
								temp.push(i);
							}
						}
						temp2.push(temp);
						temp = [];
					}
				}

				temp = temp2[0];
				for (j = 0, _length = temp2.length; j < _length; j++) {
					temp = _arrayIntersect(temp, temp2[j]);
				}

				if (onlyId) {
					return temp;
				}

				temp2 = [];
				for (j = 0, _length = temp.length; j < _length; j++) {
					temp2.push(entities[temp[j]]);
				}

				return temp2;
			}
			return null;
		};

		/**
		 * _getEntityList - zwraca liste encji
		 * @return {array} lista encji
		 */
		_getEntityList = function () {
			var _temp = [], i;

			for (i in entities) {
				if (entities.hasOwnProperty(i)) {
					_temp.push(entities[i]);
				}
			}
			return _temp;
		};

		/**
		 * _injectComponent - wstrzykuje zależności komponentu
		 * @param {comp} obiekt komponentu
		 * @param {Number} id encji
		 */
		_injectComponent = function (comp, id) {
			var i, _length, _temp;

			_temp = comp.constructor.inject;
			for (i = 0, _length = _temp.length; i < _length; i++) {
				_addComponent(_temp[i], id);
			}
		};

		/**
		 * _addComponent - dodaje komponent do encji
		 * @param {object} ob - obiekt komponentu lub nazwa
		 * @param {object} id - identyfikator encji (w konstruktorze encji)
		 * @return {object} entity
		 * @trigger addEntityComponent
		 */
		_addComponent = function (ob, id) {
			var _comp,
				_cfg = intense.cfg,
				_pManager = intense.poolManager;

			if (!_isSet(ob)) {
				throw {
					name: "intenseComponentError",
					message: "Nie podano nazwy komponentu!"
				};
			}
			if (!cManager.isComponent(ob)) {
				throw {
					name: "intenseComponentError",
					message: "Podany komponent nie istnieje!"
				};
			}

			if (!(this instanceof _entity)) {
				if (_isString(ob)) {
					if (_cfg.pooling && _pManager.hasComponent(ob)) {
						_comp = _pManager.getComponent(ob);
					} else {
						_comp = cManager.get(ob);
						_comp = new _comp();
					}
					
					componentsBinding[ob][id] = _comp;
					_eventManager.notify('addEntityComponent', [id, ob]);

					if (_isSet(_comp.constructor.inject)) {
						_injectComponent(_comp, id);
					}
				}
			} else {
				if (_isString(ob)) {
					if (this.has(ob)) {
						return this;
					}

					if (_cfg.pooling && _pManager.hasComponent(ob)) {
						_comp = _pManager.getComponent(ob);
					} else {
						_comp = cManager.get(ob);
						_comp = new _comp();
					}

					componentsBinding[ob][this.id] = _comp;
					_eventManager.notify('addEntityComponent', [this, ob]);

					if (_isSet(_comp.constructor.inject)) {
						_injectComponent(_comp, this.id);
					}
				} else {
					if (this.has(ob.constructor.componentName)) {
						return this;
					}
					componentsBinding[ob.constructor.componentName][this.id] = ob;
					_eventManager.notify('addEntityComponent', [this, ob.constructor.componentName]);

					if (_isSet(ob.constructor.inject)) {
						_injectComponent(ob, this.id);
					}
				}
				return this;
			}
		};

		/**
		 * _hasComponent - sprawdza czy encja posiada komponent
		 * @param {String} lub {Array} name - nazwa komponentu
		 * @return {boolean} true lub false
		 */
		_hasComponent = function (name) {
			var i, length;
			if (_isString(name)) {
				if (name == "*") {
					for (i in componentsBinding) {
						if (componentsBinding.hasOwnProperty(i)) {
							if (_isSet(componentsBinding[i][this.id])) {
								return true;
							}
						}
					}
				}

				if (_isSet(componentsBinding[name])) {
					return _isSet(componentsBinding[name][this.id]) ? true : false;		
				}
			} else if (_isArray(name)) {
				for (i = 0, length = name.length; i < length; i++) {
					if (!_isSet(componentsBinding[name[i]][this.id])) {
						return false;
					}
				}
				return true;
			}
			return false;
		};

		/**
		 * _removeComponent - usuwa komponent podany w nazwie
		 * @param {string} name - nazwa komponentu
		 * @return {boolean} true lub false
		 * @trigger removeEntityComponent
		 */
		_removeComponent = function (name) {
			var _cfg = intense.cfg,
				_pManager = intense.poolManager;

			if (_isString(name)) {
				if (_isSet(componentsBinding[name])) {
					if (_isSet(componentsBinding[name][this.id])) {
						_eventManager.notify('removeEntityComponent', [this.id, name]);
						if (_cfg.pooling) {
							_pManager.addComponent(componentsBinding[name][this.id]);
						}
						delete componentsBinding[name][this.id];
						return true;
					}	
				}
			}
			return false;
		};

		/**
		 * _toggleComponent - usuwa jeden komponent, dodaje inny
		 * @param {string} comp1 - nazwa komponentu do usunięcia
		 * @param {object} comp2 - nazwa lub obiekt komponentu do dodania
		 * @return {object} entity
		 */
		_toggleComponent = function (comp1, comp2) {
			this.remove(comp1);
			this.add(comp2);

			return this;
		};

		/**
		 * _removeComponents - usuwa wszystkie komponenty encji
		 * @return {boolean} true lub false
		 * @trigger removeEntityComponent
		 */
		_removeComponents = function () {
			var i, _temp = false, _cfg = intense.cfg;

			for (i in componentsBinding) {
				if (componentsBinding.hasOwnProperty(i)) {
					if (_isSet(componentsBinding[i][this.id])) {
						_eventManager.notify('removeEntityComponent', [this.id, i]);
						if (_cfg.pooling) {
							_pManager.addComponent(componentsBinding[i][this.id]);
						}
						delete componentsBinding[i][this.id];
						_temp = true;
					}
				}
			}

			return _temp;
		};

		/**
		 * _setComponent - nadpisuje komponent nowym obiektem
		 * @trigger entityLog
		 * @param {string} name - nazwa komponentu
		 * @param {object} ob - nowy obiekt komponentu
		 * @return {object} entity
		 */
		_setComponent = function (name, ob) {
			if (_isString(name) && !_isString(ob) && cManager.isComponent(ob)) {
				if (_isSet(componentsBinding[name])) {
					if (_isSet(componentsBinding[name][this.id])) {
						componentsBinding[name][this.id] = ob;
						_eventManager.notify('entityLog', "Nadpisano komponent: " + name + " dla encji: " + this.id);
					}
				}
			}
			return this;
		};

		/**
		 * _getComponent - zwraca komponent dla encji
		 * @param {string} name - nazwa komponentu
		 * @return {object} komponent
		 */
		_getComponent = function (name) {
			if (_isString(name)) {
				if (_isSet(componentsBinding[name])) {
					if (_isSet(componentsBinding[name][this.id])) {
						return componentsBinding[name][this.id];
					}
				}
			}
			return null;
		};

		/**
		 * _getComponentList - zwraca listę komponentów encji
		 * @return {array} lista komponentów
		 */
		_getComponentList = function () {
			var _temp = [], i;

			for (i in componentsBinding) {
				if (componentsBinding.hasOwnProperty(i)) {
					if (_isSet(componentsBinding[i][this.id])) {
						_temp.push(i);
					}
				}
			}
			return _temp;
		};

		/**
		 * _getComponents - zwraca komponenty encji (słownik)
		 * @return {object} komponenty
		 */
		_getComponents = function () {
			var i, _temp = {};

			for (i in componentsBinding) {
				if (componentsBinding.hasOwnProperty(i)) {
					if (_isSet(componentsBinding[i][this.id])) {
						_temp[i] = componentsBinding[i][this.id];
					}
				}
			}

			return _temp;
		};

		/**
		 * _getName - zwraca nazwę encji
		 * @param {number} id - identyfikator encji
		 * @return {string} nazwa encji
		 */
		_getName = function (id) {
			if (!(this instanceof _entity)) {
				if (_isSet(entitiesNames[id])) {
					return entitiesNames[id];
				}
			} else {
				if (_isSet(entitiesNames[this.id])) {
					return entitiesNames[this.id];
				}
			}
			return null;
		};

		/**
		 * _cloneEntity - klonuje składniki do nowej encji
		 * @trigger entityLog
		 * @param {object} base - encja do której trafią składniki
		 * @param {object} copy - encja do sklonowania
		 * @return {object} entity
		 */
		_cloneEntity = function (base, copy) {
			var _comp, i, _temp,
				_cfg = intense.cfg,
				_pManager = intense.poolManager;

			if (copy.has('*')) {
				_comp = copy.getAll();
				if (!_isObjectEmpty(_comp)) {
					for (i in _comp) {
						if (_cfg.pooling && _pManager.hasComponent(i)) {
							_temp = _pManager.getComponent(i);
						} else {
							_temp = cManager.get(i);
							_temp = new _temp();
						}

						componentsBinding[i][base.id] = _temp;
						_deepCopy(componentsBinding[i][base.id], _comp[i]);
					}
				}
			}
			if (_isSet(entitiesNames[copy.id])) {
				entitiesNames[base.id] = entitiesNames[copy.id];
			}
			if (_isSet(copy.data)) {
				base.data = _deepCopy(base.data, copy.data);
			}

			_eventManager.notify('entityLog', "Klonowane encji, bazowa: " + base.id + ", klonowana: " + copy.id);
		};
		
		/**
		 * _entity - konstruktor encji
		 * @constructor
		 * @param {number} id - wolne id
		 * @param {object} props - parametry encji
		 */
		_entity = function (id, props) {
			var i, length;

			if (!(this instanceof _entity)) {
				return new _entity(id, props);
			}

			this.id = id;

			if (_isSet(props) && _isEntity(props)) {
				_cloneEntity(this, props);
			} else if (_isPlainObject(props)) {
				if (_isSet(props.entity) && _isEntity(props.entity)) {
					_cloneEntity(this, props.entity);
				}
				if (_isSet(props.name)) {
					entitiesNames[id] = props.name + "";
				}
				if (_isSet(props.components) && _isArray(props.components)) {
					for (i = 0, length = props.components.length; i < length; i++) {
						_addComponent(props.components[i], id);
					}
				}
				if (_isPlainObject(props.data)) {
					if (_isSet(this.data)) {
						_deepCopy(this.data, props.data);
					} else {
						this.data = props.data;
					}
				}
			}
		};
		
		/**
		 * W prototypie znajdują się metody pomocnicze dla encji
		 */
		_entity.prototype = {
			add: _addComponent,
			remove: _removeComponent,
			toggle: _toggleComponent,
			removeAll: _removeComponents,
			has: _hasComponent,
			set: _setComponent,
			get: _getComponent,
			getAll: _getComponents,
			getListOfComponents: _getComponentList,
			destroy: _removeEntity,
			getName: _getName,
			toString: function () {
				if (this.getName()) {
					return "Entity {id: " + this.id + ", name: " + this.getName() + "}";
				}
				return "Entity {id: " + this.id + "}";
			}
		};

		/**
		 * _isEntity - sprawdza czy podany obiekt jest encją
		 * @param {object} entity - dowolny obiekt
		 * @return {boolean} true lub false
		 */
		_isEntity = function (entity) {
			if (entity instanceof _entity) {
				return true;
			}
			return false;
		};

		/**
		 * _EntitySet - zbiór encji zawierających dany komponent
		 * @trigger entityLog
		 * @param {Array} components - zbiór komponentów
		 * @return {object} zbiór encji
		 */
		_EntitySet = function (components) {
			if (!(this instanceof _EntitySet)) {
				return new _EntitySet(components);
			}
			this.entities = _getEntities(components);

			if (!_isSet(components)) {
				this.components = '*';
			} else if (_isString(components) && components == '*') {
				this.components = '*';
			} else if (_isString(components) && components != '*') {
				this.components = [components];
			} else if (_isArray(components)) {
				this.components = components;
			}

			_eventManager.notify('entityLog', "Utworzono EntitySet, komponenty: " + components);
		};

		/**
		 * Współdzielone metody zbioru encji
		 */
		_EntitySet.prototype = {

			/**
			 * add - dodaje nową encje do kolekcji
			 * @param {object} lub {Number} - encja
			 * @return {boolean} true lub false
			 */
			add: function (entity) {
				var elem,
					entity = (_isArray(entity)) ? entity[0] : entity;

				if (_isNumber(entity)) {
					elem = _findEntity(entity);
					if (elem && !this.contains(elem) && elem.has(this.components)) {
						this.entities.push(elem);
						return true;
					}
				} else if (_isEntity(entity)) {
					if (!this.contains(entity) && entity.has(this.components)) {
						this.entities.push(entity);
						return true;
					}
				}

				return false;
			},

			/**
			 * clear - czyści kolekcje encji
			 */
			clear: function () {
				this.entities = [];
			},

			/**
			 * exclude - wyklucza encje o danym komponencie ze zbioru
			 * @param {object} comp - komponent
			 * @return {object} EntitySet
			 */
			exclude: function (comp) {
				var _elength = this.entities.length,
					_clength = this.components.length,
					_tlength;

				if (_isString(comp) || _isArray(comp)) {
					if (_isString(comp)) {
						while (_elength--) {
							if (this.entities[_elength].has(comp)) {
					        	this.entities.splice(_elength, 1);
			            	}
						}
						while (_clength--) {
							if (this.components[_clength] == comp) {
					        	this.components.splice(_clength, 1);
					        	break;
			            	}
						}
					} else {
						_tlength = comp.length;
						while (_tlength--) {
							while (_clength--) {
								if (comp[_tlength] == this.components[_clength]) {
									this.components.splice(_clength, 1);
								}
							}
							_clength = this.components.length;
						}

						_tlength = comp.length;
						while (_tlength--) {
							while (_elength--) {
								if (this.entities[_elength].has(comp[_tlength])) {
						        	this.entities.splice(_elength, 1);
				            	}
							}
							_elength = this.entities.length;
						}
					}
				}

				return this;
			},

			/**
			 * include - dodaje wymagane komponenty do zbioru
			 * @param {object} comp - komponent
			 * @return {object} EntitySet
			 */
			include: function (comp) {
				var _entities, i, length;

				if (_isString(comp)) {
					if (this.hasComponent(comp)) {
						return this;
					}

					this.components.push(comp);
					this.entities = _getEntities(this.components);
				} else if (_isArray(comp)) {
					for (i = 0, length = comp.length; i < length; i++) {
						if (this.hasComponent(comp[i])) {
							return this;
						}
					}

					for (i = 0, length = comp.length; i < length; i++) {
						this.components.push(comp[i]);
					}
					_entities = _getEntities(this.components);
					this.entities = _getEntities(this.components);
				}

				return this;
			},

			/**
			 * remove - usuwa encję z kolekcji
			 * @param {object} lub {Number} lub {Array} - encja
			 * @return {boolean} true lub false
			 */
			remove: function (entity) {
				var i, length;

				if (_isNumber(entity)) {
					for (i = 0, length = this.entities.length; i < length; i++) {
						if (this.entities[i].id == entity) {
							this.entities.splice(i, 1);
							return true;
						}
					}
				} else if (_isString(entity)) {
					if (entity == '*') {
						this.entities = [];
						return true;
					}
				} else if (_isEntity(entity)) {
					for (i = 0, length = this.entities.length; i < length; i++) {
						if (this.entities[i] == entity) {
							this.entities.splice(i, 1);
							return true;
						}
					}
				} else if (_isArray(entity)) {
					if (_isSet(entity[1]) && this.hasComponent(entity[1])) {
						for (i = 0, length = this.entities.length; i < length; i++) {
							if (this.entities[i].id == entity[0]) {
								this.entities.splice(i, 1);
								return true;
							}
						}
					}
				}

				return false;
			},

			/**
			 * removeByComponent - usuwa encje na podstawie komponentu
			 * @param {String} component - nazwa komponentu 
			 */
			removeByComponent: function (component) {
				var length = this.entities.length;

				if (!_isSet(component)) {
					return;
				}

				if (_isString(component)) {
					if (component == '*' || this.hasComponent(component)) {
						this.entities = [];
					} else {
						while (length--) {
							if (this.entities[length].has(component)) {
								this.entities.splice(length, 1);
							}
						}
					}
				}
			},

			/**
			 * hasComponent
			 * @param {String} component - sprawdza czy kolekcja posiada dany komponent
			 * @return {boolean} true lub false
			 */
			hasComponent: function (component) {
				var i, length;

				if (_isString(component)) {
					if (component == '*' || this.components == '*') {
						return true;
					}
					for (i = 0, length = this.components.length; i < length; i++) {
						if (this.components[i] == component) {
							return true;
						}
					}
				}

				return false;
			},

			/**
			 * contains - sprawdza czy kolekcja zawiera daną encję
			 * @param {object} lub {Number} - encja
			 * @return {boolean} true lub false
			 */
			contains: function (entity) {
				var i, length;

				if (_isNumber(entity)) {
					for (i = 0, length = this.entities.length; i < length; i++) {
						if (this.entities[i].id == entity) {
							return true;
						}
					}
				} else if (_isEntity(entity)) {
					for (i = 0, length = this.entities.length; i < length; i++) {
						if (this.entities[i].id == entity.id) {
							return true;
						}
					}
				}

				return false;
			},

			/**
			 * getArray - zwraca kolekcje encji jako tablicę
			 * @return {Array} entities
			 */
			getArray: function () {
				return this.entities;
			},

			/**
			 * size - zwraca ilość elementów kolekcji
			 * @return {Number} rozmiar kolekcji
			 */
			size: function () {
				return this.entities.length;
			},

			/**
			 * get - zwraca encję z kolekcji na podstawie id lub nazwy
			 * @param {Number} id - identyfikator encji
			 * @return {object} entity
			 */
			get: function (id) {
				var i, length, 
					_id, _temp = [];

				if (_isNumber(id)) {
					for (i = 0, length = this.entities.length; i < length; i++) {
						if (this.entities[i].id == id) {
							return this.entities[i];
						}
					}
				} else if (_isString(id)) {
					for (i = 0, length = this.entities.length; i < length; i++) {
						_id = this.entities[i].id;
						if (_isSet(entitiesNames[_id]) && entitiesNames[_id] == id) {
							_temp.push(this.entities[i]);
						}
					}

					if (_temp.length == 1) {
						return _temp[0];
					} else if (_temp.length > 1) {
						return _temp;
					}
				}

				return null;
			},

			/**
			 * getByComponent - zwraca encję z kolekcji na podstawie komponentu
			 * @param {String} lub {Array} component - komponent
			 * @param {boolean} onlyId - czy pobrać tylko id
			 * @return {Array} lub {object} tablica encji/encja
			 */
			getByComponent: function (component, onlyId) {
				var temp = [], temp2 = [], i, length, j, _length;

				if (_isString(component)) {
					for (i = 0, length = this.entities.length; i < length; i++) {
						if (this.entities[i].has(component)) {
							if (onlyId) {
								temp.push(this.entities[i].id);
							} else {
								temp.push(this.entities[i]);
							}
						}
					}

					if (temp.length == 1) {
						return temp[0];
					} else if (temp.length > 1) {
						return temp;
					}
				} else if (_isArray(component)) {
					for (j = 0, _length = component.length; j < _length; j++) {
						for (i = 0, length = this.entities.length; i < length; i++) {
							if (this.entities[i].has(component[j])) {
								temp.push(this.entities[i].id);
							}
						}

						temp2.push(temp);
						temp = [];
					}

					temp = temp2[0];
					for (j = 0, _length = temp2.length; j < _length; j++) {
						temp = _arrayIntersect(temp, temp2[j]);
					}

					if (onlyId) {
						if (temp.length == 1) {
							return temp[0];
						} else if (temp.length > 1) {
							return temp;
						}
					}

					temp2 = [];
					for (j = 0, _length = temp.length; j < _length; j++) {
						temp2.push(entities[temp[j]]);
					}

					if (temp2.length == 1) {
						return temp2[0];
					} else if (temp.length > 1) {
						return temp2;
					}
				}
				return null;
			},

			/**
			 * each - iteruje po kolekcji
			 * @param {Function} callback, który przyjmuje metoda
			 * @param {object} context - kontekst w ramach którego zostanie wywołana przekazana funkcja
			 */
			each: function (func, context) {
				var i, length;

				for (i = 0, length = this.entities.length; i < length; i++) {
					func.call(context, this.entities[i], i, this);
			    }
			},

			/**
			 * listen - ustawia nasłuchiwanie zdarzeń przez set
			 */
			listen: function () {
				_eventManager.listen('newEntity', "add", this);
				_eventManager.listen('removeEntity', "remove", this);
				_eventManager.listen('removeEntityComponent', "remove", this);
				_eventManager.listen('addEntityComponent', "add", this);
				_eventManager.listen('removeComponent', "removeByComponent", this);
			},

			/**
			 * removeListeners - usuwa nasłuchiwanie zdarzeń przez set
			 */
			removeListeners: function () {
				_eventManager.remove('newEntity', "add", this);
				_eventManager.remove('removeEntity', "remove", this);
				_eventManager.remove('removeEntityComponent', "remove", this);
				_eventManager.remove('addEntityComponent', "add", this);
				_eventManager.remove('removeComponent', "removeByComponent", this);
			}
		};
		
		return {
			find: _findEntity,
			create: _createEntity,
			remove: _removeEntity,
			removeAll: _removeEntities,
			getAll: _getEntities,
			getList: _getEntityList,
			getEntityName: _getName,
			isEntity: _isEntity,
			EntitySet: _EntitySet,
			newComponentBind: _newComponentBind,
			removeComponentBind: _removeComponentBind,
			getComponentsBinding: _getComponentsBinding
		};
	}());
	
	/**
	 * intense.entity - metoda proxy łącząca się z managerem encji.
	 * @param {object} props - parametry encji
	 * @return {object} entity
	 */
	intense.entity = function (props) {
		var props = props || {},
			_fabric = intense.entityManager,
			_entity;
			
		if (_isString(props) || _isNumber(props)) {
			return _fabric.find(props);
		} else if (_fabric.isEntity(props) || _isPlainObject(props)) {
			_entity = _fabric.create(props);
			return _entity;
		}
		
		return null;
	};

	/**
	 * intense.component - konstruktor komponentów.
	 * @param {string} name - nazwa komponentu
	 * @param {object} props - właściwości komponentu
	 * @return {object} component
	 */
	intense.component = function (name, props) {
		var _fabric = intense.componentManager;

		if (!_isSet(name)) {
			throw {
				name: "intenseComponentError",
				message: "Nie podano nazwy komponentu!"
			};
		}

		if (!_isSet(props)) {
			return _fabric.get(name);
		} else {
			return _fabric.create(name, props);
		}
	};

	/**
	 * intense.system - konstruktor systemów.
	 * @param {string} name - nazwa systemu
	 * @param {object} props - właściwości systemu
	 * @return {object} system
	 */
	intense.system = function (name, props) {
		var _fabric = intense.systemManager;

		if (!_isSet(name)) {
			throw {
				name: "intenseSystemError",
				message: "Nie podano nazwy systemu!"
			};
		}

		if (!_isSet(props)) {
			return _fabric.get(name);
		} else {
			return _fabric.create(name, props);
		}
	};

	/**
	 * intense.renderSystem - alias konstruktora systemów, dla typów "render"
	 * @param {string} name - nazwa systemu
	 * @param {object} props - właściwości systemu
	 * @return {object} system
	 */
	intense.renderSystem = function (name, props) {
		var props = props || {};

		props.type = 'render';
		return intense.system(name, props);
	};

	/**
	 * intense.netSystem - alias konstruktora systemów, dla typów "net"
	 * @param {string} name - nazwa systemu
	 * @param {object} props - właściwości systemu
	 * @return {object} system
	 */
	intense.netSystem = function (name, props) {
		var props = props || {};

		props.type = 'net';
		return intense.system(name, props);
	};

	/**
	 * aliasy
	 */
	intense.keyDown = intense.controls.keyDown;
	intense.EntitySet = intense.entityManager.EntitySet;
	intense.eventManager = _eventManager;

	/**
	 * rejestruje wszystkich zapisanych słuchaczy
	 */
	(function () {
		_eventManager.listen('newComponent', "newComponentBind", intense.entityManager);
		_eventManager.listen('removeComponent', "removeComponentBind", intense.entityManager);
	})();

	/**
	 * rejestrowanie intense w globalnym scope'ie lub jako moduł Node.js
	 */
	if (_isNode()) {
		module.exports = intense;
	} else {
    	window.intense = intense;
	}
	
}(this, (typeof intense !== 'undefined' ? intense : {})));