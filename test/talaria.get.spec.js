'use strict';

import sinon from 'sinon';
import {expect} from 'chai';
import Talaria from '../src/talaria';

let api = new Talaria(),
    XMLHttpRequest = sinon.useFakeXMLHttpRequest();

describe('Method get()', () => {
    before(function() {
        this.requests = [];

        XMLHttpRequest.onCreate = (xhr) => {
            this.requests.push(xhr);
        };
    });

    it('Method get() exists', function() {
        expect(api.get).to.be.a('function');
    });

    it('Call get()', function() {
        expect(this.requests.length).to.equal(0);

        let callback = sinon.spy(),
            req = new XMLHttpRequest();

        req.addEventListener('load', callback);
        req.open('GET', '/api/fake');
        req.send();

        expect(this.requests.length).to.equal(1);

        req.respond(
            200,
            {'Content-Type': 'application/json'},
            '[{ "id": 12, "comment": "Hey there" }]'
        );

        expect(callback.called).to.be.true;
    });
});
