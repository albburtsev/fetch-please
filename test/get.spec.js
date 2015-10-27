import sinon from 'sinon';
import {expect} from 'chai';
import FetchPlease from '../src/fetch-please';

let XMLHttpRequest = sinon.useFakeXMLHttpRequest();

describe('Method getRequest()', () => {
    before(function() {
        this.requests = [];
        this.api = new FetchPlease('/api/', {XMLHttpRequest});

        XMLHttpRequest.onCreate = (xhr) => {
            this.requests.push(xhr);
        };
    });

    it('exists', function() {
        expect(this.api.getRequest).to.be.a('function');
    });

    it('sends request', function() {
        expect(this.requests.length).to.equal(0);

        let {xhr, promise} = this.api.getRequest('users');

        expect(xhr).to.be.an.instanceof(XMLHttpRequest);
        expect(xhr.method).be.equal('GET');
        expect(promise).to.be.an.instanceof(Promise);
        expect(this.requests.length).to.equal(1);

        xhr.respond(200, {'content-type': 'application/json'}, '{"a":1}');

        return promise.then((data) => {
            expect(data).to.deep.equal({a: 1});
        });
    });

    it('joins parameters', function() {
        let {xhr} = this.api.getRequest('users', {limit: 10, offset: 20, filter: 'Mary'});
        expect(xhr.url).to.equal('/api/users?limit=10&offset=20&filter=Mary');
    });

    after(function() {
        this.api = null;
        this.requests = [];
        XMLHttpRequest.onCreate = null;
    });
});

describe('Method get()', () => {
    before(function() {
        this.requests = [];
        this.api = new FetchPlease('/api/', {XMLHttpRequest});

        XMLHttpRequest.onCreate = (xhr) => {
            this.requests.push(xhr);
        };
    });

    it('exists', function() {
        expect(this.api.get).to.be.a('function');
    });

    it('sends request', function() {
        expect(this.requests.length).to.equal(0);

        let promise = this.api.get('users');

        expect(this.requests.length).to.equal(1);

        let request = this.requests[0];
        request.respond(200, {'Content-Type': 'application/json'}, '{"a":1}');

        return promise.then((data) => {
            expect(data).to.deep.equal({a: 1});
        });
    });

    after(function() {
        this.api = null;
        this.requests = [];
        XMLHttpRequest.onCreate = null;
    });
});
