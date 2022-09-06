import memoize from "./memoize";

describe('memoize', () => {
  it('callback without parameters is never called twice', () => {
    const callback = jest.fn(() => {});
    const memoized = memoize(callback);
    expect(callback).toHaveBeenCalledTimes(0);
    memoized();
    expect(callback).toHaveBeenCalledTimes(1);
    memoized();
    expect(callback).toHaveBeenCalledTimes(1);
    memoized();
    memoized();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('callback with a single parameter is handled properly', () => {
    const callback = jest.fn(val => val * 2);
    const memoized = memoize(callback);
    expect(callback).toHaveBeenCalledTimes(0);
    const val1 = memoized(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(val1).toEqual(2);

    const val2 = memoized(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(val2).toEqual(2);

    const val3 = memoized(2);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(val3).toEqual(4);

    const val4 = memoized(2);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(val4).toEqual(4);

    const val5 = memoized(1);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(val5).toEqual(2);
  });

  it('callback with a multiple parameter is handled properly', () => {
    const callback = jest.fn((a,b) => a + b);
    const memoized = memoize(callback);

    const val1 = memoized(1,2);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(val1).toEqual(3);

    const val2 = memoized(1,2);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(val2).toEqual(3);

    const val3 = memoized(2, 1);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(val3).toEqual(3);

    const val4 = memoized(1, 3);
    expect(callback).toHaveBeenCalledTimes(3);
    expect(val4).toEqual(4);

    const val5 = memoized(1, 3);
    expect(callback).toHaveBeenCalledTimes(3);
    expect(val5).toEqual(4);
  })

  it('callback with variable number of parameter is handled properly', () => {
    const callback = jest.fn((...args) => args.reduce((acc, n) => acc+n, 0));
    const memoized = memoize(callback);

    const val1 = memoized(1,2);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(val1).toEqual(3);

    const val2 = memoized(1);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(val2).toEqual(1);

    const val3 = memoized(1,2, 3);
    expect(callback).toHaveBeenCalledTimes(3);
    expect(val3).toEqual(6);

    const val4 = memoized(1,3);
    expect(callback).toHaveBeenCalledTimes(4);
    expect(val4).toEqual(4);

    const val5 = memoized(1,2);
    expect(callback).toHaveBeenCalledTimes(4);
    expect(val5).toEqual(3);
  })

  it('has function works as expected', () => {
    const callback = jest.fn((...args) => args);
    const memoized = memoize(callback);

    expect(memoized.has()).toBeFalsy();
    expect(memoized.has(123)).toBeFalsy();
    expect(memoized.has(123, 'abc')).toBeFalsy();

    memoized();
    expect(memoized.has()).toBeTruthy();

    memoized(123);
    expect(memoized.has(123)).toBeTruthy();

    memoized(123, 'abc');
    expect(memoized.has(123, 'abc')).toBeTruthy();

    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('return value is correct with no parameters', () => {
    const callback = jest.fn(val => 123);
    const memoized = memoize(callback);
    let val = memoized()
    expect(val).toEqual(123)
    val = memoized()
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('custom cache key resolver can be passed', () => {
    const callback = jest.fn((...args) => args);
    const memoized = memoize(callback, () => 'key');

    let val = memoized(123, 'deepak')
    val = memoized(123, 'jest')

    expect(callback).toHaveBeenCalledTimes(1)

    const callback2 = jest.fn((...args) => args);
    const keyResolver = (...args) => args.join('|')
    const memoized2 = memoize(callback2, keyResolver);

    val = memoized2(1,2,3)
    expect(callback2).toHaveBeenCalledTimes(1)

    val = memoized2(3, 2, 1)
    expect(callback2).toHaveBeenCalledTimes(2)
    expect(val).toEqual([3,2,1])

    val = memoized2(1, 2, 3)
    expect(callback2).toHaveBeenCalledTimes(2)
    expect(val).toEqual([1,2,3])
  })

  it.todo('clear function works as expected')

  it.todo('delete function works as expected')

})