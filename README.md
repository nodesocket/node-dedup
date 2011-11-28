node-dedup
===========


About
========

**node-dedup** performs a poor mans deduplication on a directory recursively. It loops through starting at a base directory and constructs a *SHA256* hash for each file *(excluding .DS_Store files and node-dedup-db directories)*. It then sorts all the hashs, and if a hash exists more than once, it deletes the duplicate files and creates a symbolic link in its place.

Why
========

Surprisingly, we have lots of duplicate files on our systems, and we were looking for a solution to search and find duplicates and symlink them instead of having multiple copies. Some example use cases are music libraries, documents, and pictures.


How To Use
========

**From the command line:**
<code>$ node dedup.js /some/path</code>

![alt node-dedup](http://i.imgur.com/Svc2S.png "node-dedup")

Node-DeDup Database
=========

*node-dedup* keeps a basic json log file of every deduplication performed. The name of the file is the UNIX timestamp and .json extension. The database file provides exactly what files link to what, in case you ever need to manually revert. In the future, would like to build the ability for node-dedup to read a database file, and undo the duplication; i.e. delete the symbolic link, and create a copy of the file it points too.

Example database file:

[
    {
        "hash": "7fb5225ffd276e2d4ef537d61a610b681d8f1d90eca100a0d41f3dea450c5e87",
        "path": "/test/sf-bridge-1.jpg",
        "linksto": null
    },
    {
        "hash": "7fb5225ffd276e2d4ef537d61a610b681d8f1d90eca100a0d41f3dea450c5e87",
        "path": "/test/sf-bridge-2.jpg",
        "linksto": "/Users//test/sf-bridge-1.jpg"
    },
    {
        "hash": "c651458681c4dd5dd636e6e20c704955d981435be90b19357dc0636b02601d9a",
        "path": "/test/photo.jpg",
        "linksto": null
    }
]