### 2015-03-10 v0.1.1

 * HTTP status in thrown error

### 2015-10-30 v0.1.0

 * Adds ability to set headers thru the callback, which will be called per each request
 * Bugfix: correct pipeline for non-JSON response
 * Bugfix: zero value can be set for GET parameter

### 2015-10-28 v0.0.2

 * Fixes wrong publushing, adds ```dist/``` folder into release

### 2015-10-27 v0.0.1

First release.

 * Constructor ```FetchPlease``` takes two arguments: path and settings
 * Available settings: timeout, headers, handleResponse, handleJson
 * Methods ```get()``` and ```getRequest()```
 * Methods ```post()``` and ```postRequest()```
 * Methods ```put()``` and ```putRequest()```
 * Methods ```delete()``` and ```deleteRequest()```
 * Method ```abort()```
