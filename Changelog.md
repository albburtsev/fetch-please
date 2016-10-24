### 2016-10-24 v0.4.2

 * Implemeted support of `upload.progress` event

### 2016-10-24 v0.4.1

 * Implemented CORS (xhr.withCredentials) [#8](https://github.com/albburtsev/fetch-please/pull/8)

### 2016-10-22 v0.3.0

 * Implemeted support of `progress` event [#7](https://github.com/albburtsev/fetch-please/issues/7)

### 2016-10-09 v0.2.0

 * Don't ignore GET parameters with `false` value [#2](https://github.com/albburtsev/fetch-please/issues/2)

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
