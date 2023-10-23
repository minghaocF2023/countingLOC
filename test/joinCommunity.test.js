import assert from 'assert';
import { isValidUsername, isValidPassword, isBannedUsername } from '../src/public/js/validation.js';

/**
 * Unit tests for the Username Rule written and pass
 */
describe('validateUsername', () => {
  it('should return true if username is valid', () => {
    assert.strictEqual(isValidUsername('testusername'), true);
  });
  it('shuold return true if username is exactly 3 characters', () => {
    assert.strictEqual(isValidUsername('tes'), true);
  });
  it('should return false if username is empty', () => {
    assert.strictEqual(isValidUsername(''), false);
  });
  it('should return false if username is less than 3 characters - 1 character', () => {
    assert.strictEqual(isValidUsername('t'), false);
  });
  it('should return false if username is less than 3 characters - 2 characters', () => {
    assert.strictEqual(isValidUsername('te'), false);
  });
  it('should return false if username is banned', () => {
    assert.strictEqual(isValidUsername('project'), false);
  });
  it('should return true for isBannedUsername if username is banned', () => {
    assert.strictEqual(isBannedUsername('project'), true);
  });
});

/**
 * Unit tests for the Password Rule written and pass
 */
describe('validatePassword', () => {
  it('should return true if password is valid', () => {
    assert.strictEqual(isValidPassword('testpassword'), true);
  });
  it('should return true if password is exactly 4 characters', () => {
    assert.strictEqual(isValidPassword('test'), true);
  });
  it('should return false if password is empty', () => {
    assert.strictEqual(isValidPassword(''), false);
  });
  it('should return false if password is less than 4 characters - 1 character', () => {
    assert.strictEqual(isValidPassword('t'), false);
  });
  it('should return false if password is less than 4 characters - 2 characters', () => {
    assert.strictEqual(isValidPassword('te'), false);
  });
  it('should return false if password is less than 4 characters - 3 characters', () => {
    assert.strictEqual(isValidPassword('tes'), false);
  });
});
