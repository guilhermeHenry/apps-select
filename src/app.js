const select = require('./');
const foreach = require('lodash/forEach');

foreach(document.getElementsByClassName('select'), element => {
	select(element);
});