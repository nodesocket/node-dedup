/**
 * logger.js
 *
 * @version 0.0.1
 * @date last modified 11/28/2011
 * @author NodeSocket <http://www.nodesocket.com> <hello@nodesocket.com>
 * @copyright (c) 2011 NodeSocket. All Rights Reserved.
 */

var colors = require('./termcolors').colors;

var loger = module.exports = {
    log: function(message, level) {
        if(typeof level === "undefined") {
            level = 'notice';
        }

        if(level === 'error') {
            console.log(colors.bg_red("\t" + message, true));
        } else if(level === 'notice') {
            console.log(colors.bg_lblue("\t" + message, true));
        } else if(level === 'info') {
            console.log("\t" + message);
        }
    }
}