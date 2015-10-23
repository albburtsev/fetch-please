'use strict';

import {expect} from 'chai';
import Talaria from '../src/talaria';

describe('Class Talaria', () => {
    it('Constructor Talaria exist', () => {
        expect(Talaria).to.be.an.instanceof(Function);
    });
});

describe('Instance of Talaria', () => {
    const PATH = '/api';
    const TIMEOUT = 1000;
    const HEADERS = {
        Accept: 'application/json'
    };

    let api = new Talaria(PATH, {
        timeout: TIMEOUT,
        headers: HEADERS
    });

    it('Constructor Talaria exist', () => {
        expect(api).to.be.an.instanceof(Talaria);
        expect(api.path).to.equal(PATH);
        expect(api.timeout).to.equal(TIMEOUT);
        expect(api.headers).to.deep.equal(HEADERS);
    });
});
