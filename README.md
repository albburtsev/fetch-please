# Talaria.js

Talaria.js — HTTP-transport that supports [Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) and cancelable requests (XHR). Great for React!

## Justification

Handling requests with promises is really easy and convenient. But if you need to abort your request you can't do it with [fetch](https://fetch.spec.whatwg.org/). [Promises doesn't cancelable](https://esdiscuss.org/topic/cancelable-promises) outside of the constructor.

This library provides simple API with cancelable requests and XHR under the hood.

## Install

```bash
npm install talaria --save
```

## Examples

```js
import React from 'react';
import Talaria from 'talaria';

let api = new Talaria('/api/', {
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
			.get('/users/', {
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
		// Abort all opened requests for this instance of Talaria
		api.abort();
	}
});
```

If you want to abort individual request, you can do this with special API:

```js
// ... same part in previous example

	componentWillMount() {
		// It's another API, that returns XHR object as a Promise instance
		let {xhr, promise} = api.getRequest('/users/');

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

// ... same part in previous example
```

## Requirements

ES5 compatible besides Promises. Use [polyfill for ES6 Promises](https://github.com/jakearchibald/es6-promise).

If you need ES3 compatible version use polyfills for ```Object.keys```, ```Array.prototype.indexOf```, ```Array.prototype.map```, ```Array.prototype.reduce```, ```Array.prototype.filter```, ```Array.prototype.forEach```.

## API

TODO
