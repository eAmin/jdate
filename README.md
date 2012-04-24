##JDate

JDate v0.0.1 beta

JDate, is a JavaScript like Jalali date & time library for JavaScript & NodeJS

##Usage

	var jdate = JDate();
	
	console.log(jdate.getFullYear()); // 1391
	console.log(jdate.getMonth()); // 01
	console.log(jdate.getDate()); // 15
	console.log(jdate.getDay()); // 4
	console.log(jdate.getTime()); // 1336070315814
	console.log(jdate.toString()); // 1391-01-15 22:08:50.398 +03:30
	console.log(jdate.toString('yyyy/MMMM/dd HH:mm:ss')); // 1391/01/15 22:08:50

##Node.JS

to install use npm and insert folowing command `npm install jdate` and use in your project

	// not necessary defining the variable
	require('jdate');
	
	var jdate = JDate();
	
	console.log(jdate.getFullYear()); // 1391
	console.log(jdate.getMonth()); // 01
	console.log(jdate.getDate()); // 15
	console.log(jdate.getDay()); // 4
	console.log(jdate.getTime()); // 1336070315814
	console.log(jdate.toString()); // 1391-01-15 22:08:50.398 +03:30
	console.log(jdate.toString('yyyy/MMMM/dd HH:mm:ss')); // 1391/01/15 22:08:50
	

##Author

eAmin
Copyright (c) 2012 Amin AKbari, http://eamin.me/

##TODO:
`JDate.parse()`
`JDate.setTimezone()`
`JDate.diff()`

##License

Licensed under the MIT Style License