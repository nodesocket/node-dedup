node-dedup
===========

### Performs a poor man's file deduplication recursively on a directory. Deletes duplicate files, and creates symbolic links in their place.

About
========

**node-dedup** performs a *poor* mans file deduplication on a base directory and recursively walks down. It loops through starting at the base directory and constructs a *SHA256* hash for each file *(excluding .DS_Store files and node-dedup-db directories)*. It then sorts all the hashs, and if a hash exists more than once, it deletes the duplicate files and creates a symbolic link in its place.

How To Use
========

**From the command line:**

     $ node dedup.js /some/path/here

![alt node-dedup](http://i.imgur.com/UnWY7.png "node-dedup")

     $ node dedup.js /some/path/here --dryrun

![alt node-dedup-dryrun](http://i.imgur.com/460CJ.png "node-dedup-dryrun")

     $ node dedup.js --version
       0.0.3


Why
========

Surprisingly, we have lots of duplicate files on our systems, and we were looking for a solution to search and find duplicates and symlink them instead of having multiple copies wasting disk space.

**Some example use cases are music libraries, pictures, and videos. Static content that inst changed often makes the most sense.**


Warning
============

**BE VERY CAREFUL. NODE-DEDUP IS STILL UNDER DEVELOPMENT, AND THINGS CAN GO VERY WRONG, VERY QUICKLY IF YOUR NOT CAREFUL. WE RECOMMEND, EITHER SETTING UP A TEST ENVIRONMENT AT FIRST, AND MANUALLY COPYING FILES INTO THE TEST ENVIRONMENT OR RUNNING NODE-DEDUP IN DRY-RUN MODE. RUNNING NODE-DEDUP ON YOUR ENTIRE DISK, WOULD PROBABLY BE A VERY BAD IDEA.**


Database
=========

**node-dedup** keeps a basic **json** database log file of every deduplication performed. The name of the file is the UNIX timestamp and .json extension. The database file provides exactly what files link to what in case you ever need to manually revert. In the future, we would like to build the ability for node-dedup to read a database log file, and 'undo' the duplication; i.e. delete the symbolic links, and create copies of the files.

**Example database log file:**

    [
        {
            "hash": "b8a434ad9deddbb2bb246e0e403fdca3a8ca0a67e052a6583cdfa68d2965a344",
            "path": "/Users/justin/test/vegas-1.jpg",
            "linksto": null
        },
        {
            "hash": "b8a434ad9deddbb2bb246e0e403fdca3a8ca0a67e052a6583cdfa68d2965a344",
            "path": "/Users/justin/test/vegas-2.jpg",
            "linksto": "/Users/justin/test/vegas-1.jpg"
        },
        {
            "hash": "b8a434ad9deddbb2bb246e0e403fdca3a8ca0a67e052a6583cdfa68d2965a344",
            "path": "/Users/justin/test/vegas-3.jpg",
            "linksto": "/Users/justin/test/vegas-1.jpg"
       }
    ]


To Do
===========

 *    The file listing should sort by **date modified desc**, instead of name, that way the newest file modified gets to be link too
 *    Somehow cache hashes, instead of calculating them everytime (naughty... slow)
 *    Read in a database file, and 'undo' a node-dedup; i.e. remove symbolic links and copy back files
 *    Move from flat .json files as the database to Redis or MongoDB

Change Log / Version History
===========

*     0.0.3 (12/01/2011)
          + Added option to child.process.exec() { maxBuffer: (200*10240) } which should prevent buffer overflow errors, unless reading a massive amount of files.

*     0.0.2 (12/01/2011)
          + Added flag '--dryrun' which does not delete files and does not create symbolic links. Use for testing.
          * Modified database structure, changed 'link' property to 'linksto' for clearification.
          * Improved logging to screen to show number of files read and number of files deduplciated.

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