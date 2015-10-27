'use strict';

import sinon from 'sinon';
import {expect} from 'chai';
import Talaria, {ERROR_XHR_NOT_FOUND, ERROR_UNKNOWN_HTTP_METHOD} from '../src/talaria';

let XMLHttpRequest = sinon.useFakeXMLHttpRequest();

describe('Method request()', () => {
    before(function() {
        this.api = new Talaria('/api/', {
            XMLHttpRequest: XMLHttpRequest
        });
    });

    it('exists', function() {
        expect(this.api.request).to.be.a('function');
    });

    it('handles missed and invalid arguments correctly', function() {
        let broken = new Talaria('/api/');

        expect(() => {
            broken.request();
        }).to.throw(ERROR_XHR_NOT_FOUND);

        expect(() => {
            this.api.request();
        }).to.throw(ERROR_UNKNOWN_HTTP_METHOD);

        expect(() => {
            this.api.request('FETCH');
        }).to.throw(ERROR_UNKNOWN_HTTP_METHOD);
    });

    it('should change number of opened requests', function() {
        expect(this.api.opened.length).to.equal(0);

        let first = this.api.request('GET', '/');

        expect(this.api.opened.length).to.equal(1);

        let second = this.api.request('GET', '/');

        expect(this.api.opened.length).to.equal(2);

        first.xhr.respond(200, {'content-type': 'application/json'}, '{}');
        second.xhr.respond(200, {'content-type': 'application/json'}, '{}');

        return first.promise
            .then(() => {
                return second.promise;
            })
            .then((data) => {
                expect(this.api.opened.length).to.equal(0);
            });
    });

    it('should handle HTTP errors correctly', function() {
        expect(this.api.opened.length).to.equal(0);

        let {xhr, promise} = this.api.request('GET', '/');

        expect(this.api.opened.length).to.equal(1);

        xhr.respond(404, {'content-type': 'application/json'}, '{}');

        return promise.catch((data) => {
            expect(this.api.opened.length).to.equal(0);
        });
    });

    it('should set headers', function() {
        let preset = new Talaria('/api/', {
            XMLHttpRequest: XMLHttpRequest,
            headers: {
                'Content-Type': 'application/json',
                'X-Custom-Header': 'custom'
            }
        });

        let {xhr} = preset.request('GET', '/'),
            {requestHeaders} = xhr;

        expect(requestHeaders['Content-Type']).to.equal('application/json');
        expect(requestHeaders['X-Custom-Header']).to.equal('custom');
    });

    after(function() {
        this.api = null;
    });
});
