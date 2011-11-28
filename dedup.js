/**
 * node-dedup.js
 *
 * @todo
 *		The file listing should sort by date modifed desc, instead of name, that way the newest file modified gets linked too
 *		Buffer overflow, with a lot of files
 *		Somehow cache hashes, instead of calculating them everytime
 *		Read in a database file, and 'undo' a node-dedup; i.e. remove symbolic link and copy back.
 *
 * @version 0.0.1
 * @date last modified 11/28/2011
 * @author NodeSocket <http://www.nodesocket.com> <hello@nodesocket.com>
 * @copyright (c) 2011 NodeSocket. All Rights Reserved.
 */

////
// Requires
////
var logger = require('./lib/logger');
var progress_hash = require('./lib/progressbar').create(process.stdout);
var progress_deduplicate = require('./lib/progressbar').create(process.stdout);
var exec = require('child_process').exec;
var fs = require('fs');
var crypto = require('crypto');
var path = require('path');

////
// dedup
////
var dedup = module.exports = {
	//Verion of node-dedup
	version: '0.0.1',

	//Base directory path to start working from
	base: null,

	//Array of objects; each object contains a hash, path, and link
	files: [],

	////
	// init
	//    parameters: p_base (String) base directory path to start from
	////
	init: function(p_base) {
		//Confirm that p_base directory exists
		path.exists(p_base, function(p_exists) {
			//Base directory path exists
			if(p_exists) {
				//Set global base equal to p_base, removes trailing slashes if it exists
				dedup.base = p_base.replace(/\/$/, '');

				logger.log("Notice: Deduplicating from '" + dedup.base + "'.", 'notice');

				//Check if node-dedup database directory exists
				path.exists(dedup.base + '/node-dedup-db', function(p_exists) {
					//Database directory does not exist
					if(!p_exists) {
						logger.log("Notice: No database directory found in '" + dedup.base + "', automatically creating it.", 'notice');

						//Create database directory
						fs.mkdir(dedup.base + '/node-dedup-db', function(p_err) {
							if(p_err) {
								logger.log(p_err.message, 'error');	
							} else {
								//Call getFiles
								dedup.getFiles(dedup.base);
							}
						});
					} 
					//Database directory exists
					else {
						//Call getFiles
						dedup.getFiles(dedup.base);
					}
				});
			}
			//Base directory path does not exist
			else {
				logger.log("Error: Provided base directory '" + p_base + "' does not exist.", 'error');
				process.exit(-2);
			}
		});
	},
	////
	// getFiles
	//     parameters: p_base (String) base directory path to start from
	////
	getFiles: function(p_base) {
		logger.log("Reading files...", 'info');

		////
		// todo:
		//   It may be faster to use native node and fs.readdir() recursively instead of find. Needs benchmarking.
		////
		//Find files, exclude .DS_Store and everything inside node-dedup-db directory
		exec('find ' + p_base + ' -type f \\( -not -iname ".DS_Store" -and -not -ipath "' + dedup.base + '/node-dedup-db/*" \\) | sort', function(p_err, p_stdout, p_stderr) {
			if(p_err) {
				logger.log(p_err.message, 'error');
			} else if(p_stderr) {
				logger.log(p_stderr, 'error');
			} else {
				//Split the paths on newline into an array
				var paths = p_stdout.split('\n');

				//Remove the last element if its empty
				if(paths[paths.length - 1] === '') {
					paths.pop();
				}

				//Call generateHashes
				dedup.generateHashes(paths);	
			}
		});
	},
	////
	// generateHashes
	//     parameters: p_paths (Array) list of file paths to generate hashes for
	////
	generateHashes: function(p_paths) {
		//Tracks callbacks
		var counter = 0;

		if(p_paths.length > 0) {
			logger.log("Generating hashes... (Can take a while if there are a lot of files).", 'info');	
		}

		//Loop through file paths
		for(var i = 0; i < p_paths.length; i++) {
			var hash = crypto.createHash('sha256');
			var stream = fs.ReadStream(p_paths[i]);
			
			//OnData
			stream.on('data', function(p_data) {
				this.hash.update(p_data);
			}.bind({
				hash: hash
			}));

			//OnEnd
			stream.on('end', function() {
				//Add file object to the global files array
				dedup.files.push({
					hash: this.hash.digest('hex'),
					path: this.path,
					link: null
				});

				//Increment counter
				counter++;

				//Update progress bar
				progress_hash.update(counter / p_paths.length);

				//Done looping through paths
				if(counter === p_paths.length) {
					//Call findDuplicates
					dedup.findDuplicates();	
				}
			}.bind({
				hash: hash,
				path: p_paths[i]
			}));
		}
	},
	////
	// findDuplicates
	//    parameters: none
	////
	findDuplicates: function() {
		//Sort files array by hash, neat trick; thanks stackoverflow.
		dedup.files.sort(function(p_a, p_b) {
    		return p_a.hash.localeCompare(p_b.hash);
		});

		//A pointer to array objects for previous, current, and the file that is kept
		var prev = null;
		var current = null;
		var keep = null;
		
		//Keeps track of callbacks so we know when we are done
		var total = 0;
		var callbacks = 0;

		if(dedup.files.length > 0) {
			logger.log("\n\tDeduplicating...", 'info');	
		}

		//Loop through files array
		for(var i = 0; i < dedup.files.length; i++) {
			//Set previous, assuming not the first time through the loop
			if(i > 0) {
				prev = dedup.files[i - 1];
			}

			//Set current
			current = dedup.files[i];

			//Set keep to current, if its the first time through the loop
			if(prev === null) {
				keep = current;
			//Previous equals current
			} else if(prev.hash === current.hash) {
				//Increment total
				total++;

				//Call deleteAndSymlink
				dedup.deleteAndSymlink(keep, current, function() {
					//Increment callbacks
					callbacks++;

					//Update progress bar
					progress_deduplicate.update(callbacks / total);

					//Done with all deletes and symlinks
					if(callbacks === total) {
						//Call writeDatabaseFile
						dedup.writeDatabaseFile();
					}
				});
			} 
			//New file, set keep to current
			else {
				keep = current;
			}
		}
	},
	////
	// deleteAndSymlink
	//    parameters: p_keep (Object) File to link too
	//                p_delete (Object) File to delete and create symbolic link from
	//				  p_callback (Function) Called on complete
	////
	deleteAndSymlink: function(p_keep, p_delete, p_callback) {
		//Delete p_delete file
		fs.unlink(p_delete.path, function(p_err) {
			if(p_err) {
				logger.log(p_err.message, 'error');
			} else {
				//Create the symbolic link from p_keep path to the p_delete path
				fs.symlink(p_keep.path, p_delete.path, function(p_err) {
					if(p_err) {
						logger.log(p_err.message, 'error');	
					} else {
						//Update p_delete link to p_keep's path
						p_delete.link = p_keep.path;

						//Call the callback, if it exists
						typeof p_callback === "function" ? p_callback.call() : null;	
					}
				});
			}
		});
	},
	////
	// writeDatabaseFile
	//    parameters: none
	////
	writeDatabaseFile: function() {
		var db_file_name = Math.round((new Date()).getTime() / 1000) + '.json';

		logger.log("\n\tNotice: Writing database file '" + db_file_name + "' to database directory '" + dedup.base + "/node-dedup-db'", 'notice');

		//Write the database file in base directory path with the filename being UNIX timestamp.json
		fs.writeFile(dedup.base + "/node-dedup-db/" + db_file_name, JSON.stringify(dedup.files), 'utf8', function(p_err) {
			if(p_err) {
				logger.log(p_err.message, 'error');	
			} else {
				logger.log("Complete!", 'info');

				//Exit nicely
				process.exit(0);
			}
		});
	}
}

////
// Execution begins
////
//argv[2] undefined, show error and exit
if(typeof process.argv[2] === "undefined") {
	logger.log("Usage: node dedup.js /Users/john", 'warning');

	process.exit(-1);
}
//argv[2] is set
else {
	if(process.argv[2] === '-v' || process.argv[2] === '--version' ) {
		console.log(dedup.version);
	} else {
		//Call init, passing argv[2] as the base directory path
		dedup.init(process.argv[2]);	
	}	
}