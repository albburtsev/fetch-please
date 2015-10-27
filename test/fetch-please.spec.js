import {expect} from 'chai';
import FetchPlease from '../src/fetch-please';

describe('Class FetchPlease', () => {
    it('exist', () => {
        expect(FetchPlease).to.be.an.instanceof(Function);
    });
});

describe('Instance of FetchPlease', () => {
    const PATH = '/api';
    const TIMEOUT = 1000;
    const HEADERS = {
        Accept: 'application/json'
    };

    let api = new FetchPlease(PATH, {
        timeout: TIMEOUT,
        headers: HEADERS
    });

    it('has all required properties', () => {
        expect(api).to.be.an.instanceof(FetchPlease);
        expect(api.path).to.equal(PATH);
        expect(api.timeout).to.equal(TIMEOUT);
        expect(api.headers).to.deep.equal(HEADERS);
    });
});
