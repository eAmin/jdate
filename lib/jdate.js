/*!
 * JDate v0.0.2 beta
 * JDate is a JavaScript like Jalali date & time library for Browsers & NodeJS
 * https://github.com/eAmin/jdate
 *
 * Copyright (C) 2012 by Amin Akbari
 * http://eamin.me/
 * MIT License
 *
 * It has included Jalali date conversion by Roozbeh Pournader and Mohammad Toossi
 * JavaScript implementation by Behdad Esfahbod
 */

;(function(global) {

"use strict";

var JDate = function(datetime, utctime) {
	var convert = JDate.convert(),
	date = (!!datetime && datetime !== null) ? new Date(datetime) : new Date(),
	isutc = (!!utctime && utctime !== null) ? true : false,
	getMethod = function(name) {
		if (name === null) return;
		name += '';
		return date[isutc ? 'getUTC' + name : 'get' + name]();
	},
	year = getMethod('FullYear'),
	month = getMethod('Month'),
	monthDay = getMethod('Date'),
	weekDay = (getMethod('Day') + 1) % 7,
	hour = getMethod('Hours'),
	minute = getMethod('Minutes'),
	second = getMethod('Seconds'),
	ms = getMethod('Milliseconds');

	var jdate = function() {
		this.jdate = convert.toJalali([year, month + 1, monthDay]);
	};

	jdate._format = function(input, datee) {
		var pattern = /yy(?:yy)?|(?:M|d){1,4}|([HhmsTt])\1?|[LlZ]/g,
		designator = function(a) { 
			return (!!a && a !== null) ? Object.keys(locales.designator) : Object.values(locales.designator);
		},
		replacement = {
			yyyy: datee[0],
			yy:   (datee[0] + '').slice(2),
			MMMM: Object.values(locales.month)[datee[1] - 1],
			MMM:  (Object.values(locales.month)[datee[1] - 1] + '').substring(0, 3),
			MM:   zpad(datee[1]),
			M:    datee[1],
			dddd: Object.values(locales.day)[weekDay],
			ddd:  Object.keys(locales.day)[weekDay],
			dd:   zpad(datee[2]),
			d:    datee[2],
			HH:   zpad(hour),
			H:    hour,
			hh:   zpad(hour % 12 || 12),
			h:    hour % 12 || 12,
			mm:   zpad(minute),
			m:    minute,
			ss:   zpad(second),
			s:    second,
			l:    zpad(ms, 3),
			L:    zpad(ms > 99 ? Math.round(ms / 10) : ms),
			TT:   hour < 12 ? designator()[0] : designator()[1],
			T:    hour < 12 ? designator()[0] : designator()[1],
			tt:   hour < 12 ? designator(true)[0] : designator(true)[1],
			t:    hour < 12 ? designator(true)[0] : designator(true)[1],
			Z:    (!!utctime) ? 'UTC' : getTimezone(date)
		};

		return input.replace(pattern, function(match) {
			return (match in replacement) ? replacement[match] : null;
		});
	};

	jdate.prototype = {
		getFullYear: function() {
			return this.jdate[0];
		},

		getMonth: function(){
			return this.jdate[1];
		},

		getDate: function() {
			return this.jdate[2];
		},

		getDay: function() {
			return weekDay;
		},

		// get timestamp in linux format
		getTime: function() {
			var gregorian = convert.toGregorian([this.jdate[0], this.jdate[1], this.jdate[2]]),
				tDate = new Date(gregorian[0], gregorian[1], gregorian[2], hour, minute, second, ms);

			return tDate.getTime();
		},

		toString: function(format, convertDigit) {
			var ret = (!!format && format !== null) ? jdate._format(format + '', this.jdate) : jdate._format('yyyy-MM-dd HH:mm:ss.l Z', this.jdate);
			return (!!convertDigit && convertDigit !== null) ? ret.toFaDigit() : ret;
		}
	};

	return new jdate();
};

JDate.convert = function() {
	var g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
		j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29],
		div = function(a, b) { return ~~(a / b); },
		remainder = function(a, b) { return a - div(a, b) * b; };

	function gregorian_to_jalali(g) {
		var gy, gm, gd, jy, jm, jd, g_day_no, j_day_no, j_np, i;

		gy = g[0] - 1600;
		gm = g[1] - 1;
		gd = g[2] - 1;

		g_day_no = 365 * gy + div((gy + 3), 4) - div((gy + 99), 100) + div((gy + 399), 400);
		for (i = 0; i < gm; ++i) {
			g_day_no += g_days_in_month[i];
		}

		if (gm > 1 && ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0))) {
			++g_day_no; //leap and after Feb
		}

		g_day_no += gd;
		j_day_no = g_day_no - 79;
		j_np = div(j_day_no, 12053);
		j_day_no = remainder(j_day_no, 12053);
		jy = 979 + 33 * j_np + 4 * div(j_day_no, 1461);
		j_day_no = remainder(j_day_no, 1461);

		if (j_day_no >= 366) {
			jy += div((j_day_no - 1), 365);
			j_day_no = remainder((j_day_no - 1), 365);
		}

		for (i = 0; i < 11 && j_day_no >= j_days_in_month[i]; ++i) {
			j_day_no -= j_days_in_month[i];
		}

		jm = i + 1;
		jd = j_day_no + 1;

		return [jy, jm, jd];
	}

	function jalali_to_gregorian(j) {
		var gy, gm, gd, jy, jm, jd, g_day_no, j_day_no, leap, i;

		jy = j[0] - 979;
		jm = j[1] - 1;
		jd = j[2] - 1;
		j_day_no = 365 * jy + div(jy, 33) * 8 + div((remainder(jy, 33) + 3), 4);

		for (i = 0; i < jm; ++i) {
			j_day_no += j_days_in_month[i];
		}

		j_day_no += jd;
		g_day_no = j_day_no + 79;
		gy = 1600 + 400 * div(g_day_no, 146097); /* 146097 = 365*400 + 400/4 - 400/100 + 400/400 */
		g_day_no = remainder(g_day_no, 146097);
		leap = 1;

		if (g_day_no >= 36525) { /* 36525 = 365*100 + 100/4 */
			g_day_no--;
			gy += 100 * div(g_day_no, 36524); /* 36524 = 365*100 + 100/4 - 100/100 */
			g_day_no = remainder(g_day_no, 36524);

			if (g_day_no >= 365) {
				g_day_no++;
			} else {
				leap = 0;
			}
		}

		gy += 4 * div(g_day_no, 1461);/* 1461 = 365*4 + 4/4 */
		g_day_no = remainder(g_day_no, 1461);

		if (g_day_no >= 366) {
			leap = 0;
			g_day_no--;
			gy += div(g_day_no, 365);
			g_day_no = remainder(g_day_no, 365);
		}

		for (i = 0; g_day_no >= g_days_in_month[i] + (i === 1 && leap); i++) {
			g_day_no -= g_days_in_month[i] + (i === 1 && leap);
		}

		gm = i + 1;
		gd = g_day_no + 1;

		return [gy, gm, gd];
	}

	return {
		toJalali: gregorian_to_jalali,
		toGregorian: jalali_to_gregorian
	};
};

var getTimezone = function(dt) {
	var tz = dt.getTimezoneOffset();
	return ((tz < 0) ? '+' : '-') + zpad(~~(Math.abs(tz) / 60)) + ':' + zpad(Math.abs(tz) % 60);
};

Date.now = Date.now || function() {
	return +(new Date());
};

// from: https://gist.github.com/786108
String.prototype.toFaDigit = function() {
	return this.replace(/\d+/g, function(digit) {
		var ret = '';
		for (var i = 0, len = digit.length; i < len; i++) {
			ret += String.fromCharCode(digit.charCodeAt(i) + 1728);
		}

		return ret;
	});
};

Object.has = function(object, value) {
	return Object.prototype.hasOwnProperty.call(object, value);
};

Object.keys = Object.keys || function(object) {
	var keys = [];
	for (var key in object) {
		Object.has(object, key) && keys.push(key);
	}

	return keys;
};

Object.values = function(object) {
	var values = [];
	for (var key in object) {
		Object.has(object, key) && values.push(object[key]);
	}

	return values;
};

var zpad = function(value, length) {
	value += '';
	length = length || 2;
	while (value.length < length) {
		value = '0' + value;
	}

	return value;
};

if (typeof module !== 'undefined') {
	module.exports.JDate = JDate;
}

// in strict mode we can`t use `this.JDate = JDate`
global.JDate = JDate;

var locales = {
	// all properties structure is "short : long"
	day: {
		'\u0634\u0646\u0628\u0647': '\u0634\u0646\u0628\u0647',
		'\u06CC\u06A9': '\u06CC\u06A9 \u0634\u0646\u0628\u0647',
		'\u062F\u0648': '\u062F\u0648\u0634\u0646\u0628\u0647',
		'\u0633\u0647': '\u0633\u0647 \u0634\u0646\u0628\u0647',
		'\u0686\u0647\u0627\u0631': '\u0686\u0647\u0627\u0631\u0634\u0646\u0628\u0647',
		'\u067E\u0646\u062C': '\u067E\u0646\u062C\u0634\u0646\u0628\u0647',
		'\u062C\u0645\u0639\u0647': '\u062C\u0645\u0639\u0647'
	},

	month: {
		'1': '\u0641\u0631\u0648\u0631\u062F\u06CC\u0646',
		'2': '\u0627\u0631\u062F\u06CC\u0628\u0647\u0634\u062A',
		'3': '\u062E\u0631\u062F\u0627\u062F',
		'4': '\u062A\u06CC\u0631',
		'5': '\u0645\u0631\u062F\u0627\u062F',
		'6': '\u0634\u0647\u0631\u06CC\u0648\u0631',
		'7': '\u0645\u0647\u0631',
		'8': '\u0622\u0628\u0627\u0646',
		'9': '\u0622\u0630\u0631',
		'10': '\u062F\u06CC',
		'11': '\u0628\u0647\u0645\u0646',
		'12': '\u0627\u0633\u0641\u0646\u062F'
	},

	designator: {
		'\u0642.\u0638': '\u0642\u0628\u0644 \u0627\u0632 \u0638\u0647\u0631',
		'\u0628.\u0638': '\u0628\u0639\u062F \u0627\u0632 \u0638\u0647\u0631'
	}
};

})(this);
