# fetch-please.js [![Build Status](https://secure.travis-ci.org/albburtsev/fetch-please.png?branch=master)](https://travis-ci.org/albburtsev/fetch-please)

HTTP-transport that supports [Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) and cancelable requests (XHR). Great for React!

Moreover it's extra small (minified+gzipped less than 2.5Kb).

## Justification

Handling requests with promises is really easy and convenient. But if you need to abort your request you can't do it with [fetch](https://fetch.spec.whatwg.org/). [Promises doesn't cancelable](https://esdiscuss.org/topic/cancelable-promises) outside of the constructor.

This library provides simple API with cancelable requests and XHR under the hood.

## Install

```bash
npm install fetch-please --save
```

## Examples

```js
import React from 'react';
import FetchPlease from 'fetch-please';

let api = new FetchPlease('/api/', {
	/* Settings here, see list of available settings below */
});

let SmartComponent = React.createClass({
	getInitialState() {
		return {
			loading: false,
			error: null,
			users: []
		};
	},

	/**
	 * Fetch state (list of users) for this component
	 */
	componentWillMount() {
		api
			.get('users/', {
				limit: 20,
				offset: 10
			})
			.then((json) => {
				// List of users successfully received
				this.setState({
					loading: false,
					users: json.users
				});
			})
			.catch((error) => {
				// Oops, something goes wrong
				this.setState({
					error,
					loading: false
				});
			});

		// Wait response
		this.setState({loading: true});
	},

	/**
	 * Our component was unexpectedly unmounted
	 * Application doesn't need in requested data
	 */
	componentWillUnmount() {
		// Abort all opened requests for this instance of FetchPlease
		api.abort();
	}
});
```

If you want to abort individual request, you can do this with special API:

```js
// ... same part in the previous example

	componentWillMount() {
		// It's another API, that returns XHR object as a Promise instance
		let {xhr, promise} = api.getRequest('users/');

		promise
			.then((json) => {
				/* Save users in state */
			})
			.catch((error) => {
				/* Save error in state */
			});

		// Save necessary request
		this.xhr = xhr;
		this.setState({loading: true});
	},

	componentWillUnmount() {
		// Abort individual requst with saved XHR object
		this.xhr.abort();
	}

// ... same part in the previous example
```

## Requirements

ES5 compatible besides Promises. Use [polyfill for ES6 Promises](https://github.com/jakearchibald/es6-promise).

If you need ES3 compatible version use polyfills for ```JSON```, ```Object.keys```, ```Array.prototype.indexOf```, ```Array.prototype.map```, ```Array.prototype.reduce```, ```Array.prototype.filter```, ```Array.prototype.forEach```.

## API

### Constructor

```
FetchPlease([String path], [Object settings]);
```

For example:

```js
let api = new FetchPlease('/api/', {
	timeout: 3000, // 3s
	headers: {
		'Content-Type': 'application/json',
		'X-Custom-Header': 'custom'
	}
});
```

#### Settings

`timeout = 0`

A number of milliseconds a request can take before automatically being terminated. The value of 0 means there is no timeout.

`headers = {}`

An object with HTTP headers for all requests.

`handleResponse`

Takes XHR object as a single argument and returns it if response looks like acceptable.

Example of custom response handler:

```js
let api = new FetchPlease('/api/', {
	handleResponse(xhr) {
		if (xhr.status !== 200) {
			throw new Error('Nooooooo!');
		}

		return xhr;
	}
});
```

`handleJson`

Takes XHR object as a single argument and returns object corresponding to the given JSON in responseText. Invokes if response header ```Content-Type: application/json``` exists.

### Methods

#### get() and getRequest()

```
Promise get(String url, [Object params,] [Object settings])
```

Sends GET request with optional parameters and same optional settings (see above for constructor). Returns an instance of ```Promise```.

```
Object getRequests(String url, [Object params,] [Object settings])
```

Sends GET request. Returns object with two properties: ```xhr``` (instance of ```XMLHttpRequest```) and ```promise``` (instance of ```Promise```).

Example:

```js
let api = new FetchPlease('/api/');
api
	.get('users', {limit: 10, offset: 50}) // sends GET request on /api/users?limit=10&offset=50
	.then((data) => {
		console.log(data);
	})
	.catch((error) => {
		console.error(error);
	});
```

#### post() and postRequest()

```
Promise post(String url, [Object data,] [Object settings])
```

```
Object postRequest(String url, [Object data,] [Object settings])
```

Sends data as a body of HTTP request. If a data object is an instance of ```Blob``` or ```FormData``` or ```String```, it will be sent without transformation. Otherwise, data will be sent as serialized JSON string.

Example:

```js
let api = new FetchPlease('/api/');
api
	.post('users', {name: 'Mary', surname: 'Brown'}) // sends POST request on /api/users
	.then((data) => {
		console.log(data);
	})
	.catch((error) => {
		console.error(error);
	});
```

#### put() and putRequest()

```
Promise put(String url, [Object data,] [Object settings])
```

```
Object putRequest(String url, [Object data,] [Object settings])
```

As well as ```post()``` and ```postRequest()```.

#### delete() and deleteRequest()

```
Promise delete(String url, [Object params,] [Object settings])
```

```
Object deleteRequests(String url, [Object params,] [Object settings])
```

As well as ```get()``` and ```getRequest()```.

#### abort()

Aborts all opened requests for appropriate FetchPlease instance. Example:

```js
let api = new FetchPlease('/api/');

api
	.get('users')
	.catch((error) => {
		console.error(error); // Error['Resource has been aborted']
	});

api.abort();
```

