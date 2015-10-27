import sinon from 'sinon';
import {expect} from 'chai';
import FetchPlease from '../src/fetch-please';

let XMLHttpRequest = sinon.useFakeXMLHttpRequest();

describe('Method deleteRequest()', () => {
    before(function() {
        this.requests = [];
        this.api = new FetchPlease('/api/', {XMLHttpRequest});

        XMLHttpRequest.onCreate = (xhr) => {
            this.requests.push(xhr);
        };
    });

    it('exists', function() {
        expect(this.api.deleteRequest).to.be.a('function');
    });

    it('sends request', function() {
        expect(this.requests.length).to.equal(0);

        let {xhr, promise} = this.api.deleteRequest('users', {id: 1});

        expect(xhr).to.be.an.instanceof(XMLHttpRequest);
        expect(xhr.url).be.equal('/api/users?id=1');
        expect(xhr.method).be.equal('DELETE');
        expect(promise).to.be.an.instanceof(Promise);
        expect(this.requests.length).to.equal(1);

        xhr.respond(200, {'content-type': 'application/json'}, '{"result": true}');

        return promise.then((data) => {
            expect(data).to.deep.equal({result: true});
        });
    });

    after(function() {
        this.api = null;
        this.requests = [];
        XMLHttpRequest.onCreate = null;
    });
});

describe('Method delete()', () => {
    before(function() {
        this.requests = [];
        this.api = new FetchPlease('/api/', {XMLHttpRequest});

        XMLHttpRequest.onCreate = (xhr) => {
            this.requests.push(xhr);
        };
    });

    it('exists', function() {
        expect(this.api.delete).to.be.a('function');
    });

    it('sends request', function() {
        expect(this.requests.length).to.equal(0);

        let promise = this.api.delete('users', {id: 1});

        expect(promise).to.be.an.instanceof(Promise);
        expect(this.requests.length).to.equal(1);

        this.requests[0].respond(200, {'content-type': 'application/json'}, '{"result": true}');

        return promise.then((data) => {
            expect(data).to.deep.equal({result: true});
        });
    });

    after(function() {
        this.api = null;
        this.requests = [];
        XMLHttpRequest.onCreate = null;
    });
});
