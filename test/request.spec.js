import sinon from 'sinon';
import {expect} from 'chai';
import FetchPlease, {
    ERROR_XHR_NOT_FOUND, ERROR_UNKNOWN_HTTP_METHOD, ERROR_UNACCEPTABLE_HTTP_CODE,
    ERROR_RESOURCE_ABORTED, ERROR_JSON_PARSE
} from '../src/fetch-please';

let XMLHttpRequest = sinon.useFakeXMLHttpRequest();

describe('Method request()', () => {
    before(function() {
        this.api = new FetchPlease('/api/', {XMLHttpRequest});
    });

    it('exists', function() {
        expect(this.api.request).to.be.a('function');
    });

    it('handles missed and invalid arguments correctly', function() {
        let broken = new FetchPlease('/api/');

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

    it('should join paths', function() {
        let api = new FetchPlease('/api/', {XMLHttpRequest});

        // URLs without normilizing
        expect(api.request('GET', '/users').xhr.url).to.equal('/api//users');
        expect(api.request('GET', 'users').xhr.url).to.equal('/api/users');
    });

    it('should set headers', function() {
        let preset = new FetchPlease('/api/', {
            XMLHttpRequest,
            headers: {
                'Content-Type': 'application/json',
                'X-Custom-Header': 'custom',
                'X-Undefined-Header': undefined,
                'X-Falsy-Header': false,
                'X-Null-Header': null
            }
        });

        let {xhr} = preset.request('GET', '/'),
            {requestHeaders} = xhr;

        /* eslint no-unused-expressions:0 */
        expect(requestHeaders['Content-Type']).to.equal('application/json');
        expect(requestHeaders['X-Custom-Header']).to.equal('custom');
        expect('X-Undefined-Header' in requestHeaders).to.be.false;
        expect('X-Falsy-Header' in requestHeaders).to.be.false;
        expect('X-Null-Header' in requestHeaders).to.be.false;
    });

    it('should set headers from callback', function() {
        let preset = new FetchPlease('/api/', {
            XMLHttpRequest,
            headers: () => {
                return {
                    'Content-Type': 'application/json',
                    'X-Custom-Header': 'custom'
                };
            }
        });

        let {xhr} = preset.request('GET', '/'),
            {requestHeaders} = xhr;

        expect(requestHeaders['Content-Type']).to.equal('application/json');
        expect(requestHeaders['X-Custom-Header']).to.equal('custom');
    });

    it('should set timeout', function() {
        let preset = new FetchPlease('/api/', {
            XMLHttpRequest,
            timeout: 1
        });

        expect(preset.timeout).to.equal(1);

        let {xhr} = preset.request('GET', '/');

        expect(xhr.timeout).to.equal(1);
    });

    it('should handle response without JSON', function() {
        let {xhr, promise} = this.api.request('GET', '/');

        xhr.respond(200, {'Content-Type': 'text/html'}, '<h1>Hi!</h1>');

        return promise
            .then((xhr) => {
                expect(xhr.responseText).to.equal('<h1>Hi!</h1>');
            });
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
            .then(() => {
                expect(this.api.opened.length).to.equal(0);
            });
    });

    it('should handle unacceptable HTTP code', function() {
        let {xhr, promise} = this.api.request('GET', '/');

        expect(this.api.opened.length).to.equal(1);
        xhr.respond(404, {'content-type': 'application/json'}, '{}');

        return promise.catch((error) => {
            expect(this.api.opened.length).to.equal(0);
            expect(error).to.be.an.instanceOf(Error);
            expect(error.message).to.equal(ERROR_UNACCEPTABLE_HTTP_CODE);
            expect(error.statusCode).to.equal(404);
        });
    });

    it('should handle invalid JSON', function() {
        let {xhr, promise} = this.api.request('GET', '/');
        xhr.respond(200, {'content-type': 'application/json'}, '{blah}');

        return promise.catch((error) => {
            expect(error).to.be.an.instanceOf(Error);
            expect(error.message).to.equal(ERROR_JSON_PARSE);
        });
    });

    it('should handle abort', function() {
        let {xhr, promise} = this.api.request('GET', '/');
        xhr.abort();

        return promise.catch((error) => {
            expect(error).to.be.an.instanceOf(Error);
            expect(error.message).to.equal(ERROR_RESOURCE_ABORTED);
        });
    });

    it('should handle progress', function() {
        function onProgress() {
            // Do nothing
        }

        let {xhr} = this.api.request('GET', '/', null, {onProgress});

        expect(xhr.eventListeners.progress[0]).to.equal(onProgress);
    });

    it('should handle progress upload', function() {
        function onProgressUpload() {
            // Do nothing
        }

        let {xhr} = this.api.request('GET', '/', null, {onProgressUpload});

        expect(xhr.upload.eventListeners.progress[0]).to.equal(onProgressUpload);
    });

    after(function() {
        this.api = null;
    });
});
