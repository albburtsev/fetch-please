'use strict';

import sinon from 'sinon';
import {expect} from 'chai';
import Talaria from '../src/talaria';

let api = new Talaria(),
    XMLHttpRequest = sinon.useFakeXMLHttpRequest();

describe('HTTP method GET', () => {
    before(function() {
        this.requests = [];

        XMLHttpRequest.onCreate = (xhr) => {
            this.requests.push(xhr);
        };
    });

    let api = new Talaria('/api/', {
        XMLHttpRequest: XMLHttpRequest
    });

    it('Method getRequest() exists', function() {
        expect(api.getRequest).to.be.a('function');
    });

    it('Call method getRequest()', function() {
        // Empty list of array
        expect(this.requests.length).to.equal(0);

        // Create request
        let {request, promise} = api.getRequest('users');

        // Call returns correct instances
        expect(request).to.be.an.instanceof(XMLHttpRequest);
        expect(promise).to.be.an.instanceof(Promise);

        // Request appears in list
        expect(this.requests.length).to.equal(1);

        // Fake response
        req.respond(200, {'Content-Type': 'application/json'}, '{a:1}');

        // Compare JSON in callback
        return promise.then((data) => {
            expect(data).to.deep.equal({a: 1});
        });
    });

    it('Method get() exists', function() {
        expect(api.get).to.be.a('function');
    });

    it('Call method get()', function() {
        expect(this.requests.length).to.equal(0);

        // Call method get()
        let promise = api.get('users');

        // Counter of requests should be incremented
        expect(this.requests.length).to.equal(2);

        // Create fake response
        req.respond(200, {'Content-Type': 'application/json'}, '{a:1}');

        // Compare JSON in callback
        return promise.then((data) => {
            expect(data).to.deep.equal({a: 1});
        });
    });

    after(function() {
        this.requests = [];
        XMLHttpRequest.onCreate = null;
    });
});
