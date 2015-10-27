'use strict';

import sinon from 'sinon';
import {expect} from 'chai';
import FetchPlease, {ERROR_RESOURCE_ABORTED} from '../src/fetch-please';

let XMLHttpRequest = sinon.useFakeXMLHttpRequest();

describe('Method abort()', () => {
    let api = new FetchPlease('/api/', {
        XMLHttpRequest: XMLHttpRequest
    });

    it('exists', function() {
        expect(api.abort).to.be.a('function');
    });

    it('aborted all opened requests', function() {
        let first = api.request('GET', '/'),
            second = api.request('GET', '/');

        expect(api.opened.length).to.equal(2);

        api.abort();

        return first.promise
            .catch(second.promise)
            .catch((error) => {
                expect(api.opened.length).to.equal(0);
                expect(error).to.be.an.instanceOf(Error);
                expect(error.message).to.equal(ERROR_RESOURCE_ABORTED);
            });
    });
});
