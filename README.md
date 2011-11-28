node-dedup
===========
### By NodeSocket

### Performs a poor man's deduplication recursively on a directory. Deletes duplicate files, and creates symbolic links in their place.

About
========

**node-dedup** performs a *poor* mans deduplication on a base directory and recursively walks down. It loops through starting at the base directory and constructs a *SHA256* hash for each file *(excluding .DS_Store files and node-dedup-db directories)*. It then sorts all the hashs, and if a hash exists more than once, it deletes the duplicate files and creates a symbolic link in its place.

![alt node-dedup Diagram](http://i.imgur.com/RYFcp.png "node-dedup Diagram")

How To Use It
========

**From the command line:**

     $ node dedup.js /some/path/here

![alt node-dedup](http://i.imgur.com/Svc2S.png "node-dedup")

     $ node dedup.js --version
       0.0.1

Why
========

Surprisingly, we have lots of duplicate files on our systems, and we were looking for a solution to search and find duplicates and symlink them instead of having multiple copies wasting disk space. Some example use cases are music libraries, documents, and pictures.


Warning
============

**BE VERY CAREFUL. NODE-DEDUP IS STILL UNDER DEVELOPMENT, AND THINGS CAN GO VERY WRONG, VERY QUICKLY IF YOUR NOT CAREFUL. WE RECOMMEND, SETTING UP A TEST ENVIRONMENT AT FIRST, AND MANUALLY COPYING FILES INTO THE TEST ENVIRONMENT TO EXPLORE. RUNNING NODE-DEDUP ON YOUR ENTIRE DISK, WOULD PROBABLY BE A VERY BAD IDEA.**


**ONCE AGAIN, NODE-DEDUP IS RECURSIVE AND DELETES THINGS, SO BE CAREFUL.**


Database
=========

**node-dedup** keeps a basic **json** database log file of every deduplication performed. The name of the file is the UNIX timestamp and .json extension. The database file provides exactly what files link to what in case you ever need to manually revert. In the future, we would like to build the ability for node-dedup to read a database log file, and 'undo' the duplication; i.e. delete the symbolic links, and create copies of the files.

**Example database log file:**

    [
        {
            "hash": "7fb5225ffd276e2d4ef537d61a610b681d8f1d90eca100a0d41f3dea450c5e87",
            "path": "/test/sf-bridge-1.jpg",
            "link": null
        },
        {
            "hash": "7fb5225ffd276e2d4ef537d61a610b681d8f1d90eca100a0d41f3dea450c5e87",
            "path": "/test/sf-bridge-2.jpg",
            "link": "/Users//test/sf-bridge-1.jpg"
        },
        {
            "hash": "c651458681c4dd5dd636e6e20c704955d981435be90b19357dc0636b02601d9a",
            "path": "/test/photo.jpg",
            "link": null
        }
    ]


To Do
===========

 *    The file listing should sort by **date modified desc**, instead of name, that way the newest file modified gets to be link too
 *    Buffer overflow with a lot of files
 *    Somehow cache hashes, instead of calculating them everytime (naughty... slow)
 *    Read in a database file, and 'undo' a node-dedup; i.e. remove symbolic links and copy back files
 *    Move from flat .json files as the database to Redis or MongoDB

Change Log / Version History
===========

*     0.0.1 (11/28/2011)

Author / Contact
============

Created and coded by the **NodeSocket** team.

_Website: <http://www.nodesocket.com>_

_Twitter: <http://www.twitter.com/nodesocket>_

Problems? Bugs? Feature Requests? _<https://github.com/nodesocket/node-dedup/issues>_

*(c) 2011 NodeSocket LLC. All Rights Reserved.*

License & Legal
==============

*Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:*

*The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.*

*THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*