import {expect} from 'chai';
import {assign, joinParams} from '../src/helpers';

describe('Helper assign()', () => {
    it('exist', () => {
        expect(assign).to.be.an.instanceof(Function);
    });

    it('merged objects', () => {
        expect(assign({}, {a: 1})).to.deep.equal({a: 1});
        expect(assign({a: 1}, {b: 2})).to.deep.equal({a: 1, b: 2});
    });

    it('merged objects in correct order', () => {
        expect(assign({a: 0}, {a: 1})).to.deep.equal({a: 1});
    });

    it('returns same target', () => {
        let target = {},
            assigned = assign(target, {a: 1});

        // expect((target === assigned)).to.be.ok;
        expect(target).to.equal(assigned);
    });
});

describe('Helper joinParams()', () => {
    it('exists', () => {
        expect(joinParams).to.be.an.instanceof(Function);
    });

    it('handles missed arguments correctly', () => {
        expect(joinParams(null)).to.be.equal(null);
        expect(joinParams('')).to.be.equal('');
        expect(joinParams('', null)).to.be.equal('');
        expect(joinParams('', {})).to.be.equal('');
    });

    it('forms URL correctly', () => {
        /* eslint no-dupe-keys:0 */
        expect(joinParams('', {a: 1})).to.be.equal('?a=1');
        expect(joinParams('', {a: 1, b: 2})).to.be.equal('?a=1&b=2');
        expect(joinParams('', {a: 0, a: 1})).to.be.equal('?a=1');
        expect(joinParams('/?a=1', {b: 2})).to.be.equal('/?a=1&b=2');
        expect(joinParams('/?', {a: 1})).to.be.equal('/?a=1');
    });

    it('decodes parameters correctly', () => {
        expect(joinParams('', {name: 'имя'})).to.be.equal('?name=%D0%B8%D0%BC%D1%8F');
    });
});
