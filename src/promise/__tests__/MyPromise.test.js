import MyPromise from "../MyPromise"

const DEFAULT_VALUE = "default"

describe("then", () => {
  it("with no chaining", () => {
    return buildPromise().then(v => expect(v).toEqual(DEFAULT_VALUE))
  })

  it("throwing an error in executor fn, rejects the promise", async () => {
    const onError = jest.fn()
    const onSuccess = jest.fn()

    const promise = new MyPromise((res, rej) => {
      throw new Error("Error Error!")
    })

    await promise.then(onSuccess).catch(onError)

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledTimes(0)
  })

  it("with multiple thens for same promise", async () => {
    const onSuccess = jest.fn()
    const mainPromise = buildPromise()
    const promise1 = mainPromise.then(onSuccess)
    const promise2 = mainPromise.then(onSuccess)
    await Promise.allSettled([promise1, promise2])
    expect(onSuccess).toHaveBeenCalledTimes(2)
    expect(onSuccess.mock.calls).toEqual([ [ DEFAULT_VALUE ], [ DEFAULT_VALUE ] ])
  })

  it("with then and catch", async () => {
    const onSuccess = jest.fn()
    const onError = jest.fn()

    await buildPromise().then(onSuccess, onError)
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(0)

    const rejectedPromise = buildPromise({ fail: true }).then(onSuccess).catch(onError)
    await rejectedPromise
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it("with chaining", () => {
    const promise = buildPromise({ value: 3 }).then(v => v * 4)
    return expect(promise).resolves.toEqual(12)
  })
})

describe("catch", () => {
  it("with no chaining", () => {
    const rejectedPromise = buildPromise({ fail: true })
    return expect(rejectedPromise).rejects.toEqual(DEFAULT_VALUE)
  })

  it("with multiple catches for same promise", async () => {
    const onError = jest.fn()
    const mainPromise = buildPromise({ fail: true })
    const promise1 = mainPromise.catch(onError)
    const promise2 = mainPromise.catch(onError)
    await Promise.allSettled([promise1, promise2])

    expect(onError).toHaveBeenCalledTimes(2)
    expect(onError).toHaveBeenNthCalledWith(1,DEFAULT_VALUE)
    expect(onError).toHaveBeenNthCalledWith(2,DEFAULT_VALUE)
  })

  it("with chaining", async () => {
    const onError = jest.fn()

    await buildPromise({ value: 3 })
      .then(v => {
        throw v * 4
      })
      .catch(onError)

    expect(onError).toHaveBeenCalledWith(12)
  })
})

describe("finally", () => {
  it("with no chaining", () => {
    const checkFunc = v => v => expect(v).toBeUndefined()
    const successPromise = buildPromise().finally(checkFunc)
    const failPromise = buildPromise({ fail: true }).finally(checkFunc)
    return Promise.allSettled([successPromise, failPromise])
  })

  it("with multiple finallys for same promise", () => {
    const checkFunc = v => expect(v).toBeUndefined()
    const mainPromise = buildPromise()
    const promise1 = mainPromise.finally(checkFunc)
    const promise2 = mainPromise.finally(checkFunc)
    return Promise.allSettled([promise1, promise2])
  })

  it("with chaining", () => {
    const checkFunc = v => v => expect(v).toBeUndefined()
    const successPromise = buildPromise()
      .then(v => v)
      .finally(checkFunc)
    const failPromise = buildPromise({ fail: true })
      .then(v => v)
      .finally(checkFunc)
    return Promise.allSettled([successPromise, failPromise])
  })
})

describe("static methods", () => {
  it("resolve", () => {
    return expect(MyPromise.resolve(DEFAULT_VALUE)).resolves.toEqual(DEFAULT_VALUE)
  })

  it("reject", () => {
    return expect(MyPromise.reject(DEFAULT_VALUE)).rejects.toEqual(DEFAULT_VALUE)
  })

  describe("all", () => {
    it("with success", () => {
      const promises = [
        buildPromise({ value: 1 }),
        buildPromise({ value: 2 })
      ]

      return expect(MyPromise.all(promises)).resolves.toEqual([1,2])
    })

    it("with fail", () => {
      const promises = [
        buildPromise(),
        buildPromise({ fail: true, value: 'Error Error' })
      ]

      return expect(MyPromise.all(promises)).rejects.toEqual("Error Error")
    })
  })

  it("allSettled", () => {
    const promises = [
      buildPromise(),
      buildPromise({ fail: true })
    ]

    const expected = [
      { status: "fulfilled", value: DEFAULT_VALUE },
      { status: "rejected", reason: DEFAULT_VALUE },
    ]
    return expect(MyPromise.allSettled(promises)).resolves.toEqual(expected)
  })

  describe("race", () => {
    it("with success", () => {

      const racingPromise = MyPromise.race([
        buildPromise({ value: 1 }),
        buildPromise({ value: 2 }),
      ])


      return expect(racingPromise).resolves.toEqual(1)
    })

    it("with fail", () => {
      const promises = [
        buildPromise({ fail: true, value: 1 }),
        buildPromise({ fail: true, value: 2 }),
      ]

      return expect(MyPromise.race(promises)).rejects.toEqual(1)
    })
  })

  describe("any", () => {
    it("with success", () => {
      const promises = [
        buildPromise({ value: 1 }),
        buildPromise({ value: 2 }),
      ]

      return expect(MyPromise.any(promises)).resolves.toEqual(1)
    })

    it("with fail", () => {
      const promises = [
        buildPromise({ fail: true, value: 1 }),
        buildPromise({ value: 2 }),
      ]

      // return expect(MyPromise.any(promises)).resolves.toEqual([1,2])
      return MyPromise.any(promises).catch(e => expect(e.errors).toEqual([1, 2]))
    })
  })
})

function buildPromise({ value = DEFAULT_VALUE, fail = false } = {}) {
  return new MyPromise((resolve, reject) => {
    fail ? reject(value) : resolve(value)
  })
}
