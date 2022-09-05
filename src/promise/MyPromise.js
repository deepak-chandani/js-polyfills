const STATE = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
}

class MyPromise {
  #state = STATE.PENDING
  #value = null
  #resolveBinded = this.#resolve.bind(this)
  #rejectBinded = this.#reject.bind(this)
  #fulfilledCallbacks = []
  #rejectedCallbacks = []

  constructor(executerFn){
    queueMicrotask(() => {
      try {
        executerFn(this.#resolveBinded, this.#rejectBinded)
      } catch (error) {
        this.#reject(error)
      }
    })
  }

  then(onFulfilled, onRejected){
    return new MyPromise((res, rej) => {
      const fulfilledCallback = (value) => {
        if(!onFulfilled) {
          return res(this.#value)
        }

        try {
          res(onFulfilled(this.#value)) // the value returned by onFulfilled will be set as resolved value of the new promise being returned
        } catch (error) {
          rej(error)
        }
      }

      const rejectedCallback = (error) => {
          if(!onRejected) {
            return rej(this.#value)
          }

          try {
            res(onRejected(this.#value))
          } catch (error) {
            rej(error)
          }
      }

      switch(this.#state){
        case STATE.FULFILLED:
          queueMicrotask(() => fulfilledCallback(this.#value))
          break;
        case STATE.REJECTED:
          queueMicrotask(() => rejectedCallback(this.#value))
          break;
        case STATE.PENDING:
          this.#fulfilledCallbacks.push(fulfilledCallback)
          this.#rejectedCallbacks.push(rejectedCallback)
          break;
        default:
          break;
      }

    })
  }

  catch(onRejected) {
    return this.then(undefined, onRejected)
  }

  finally(cb) {
    const onSuccess = (result) => {
      cb()
      return result
    }

    const onError = (error) => {
      cb()
      return error
    }

    return this.then(onSuccess, onError)
  }

  #resolve(value) {

    if(value instanceof MyPromise){
      return value.then(this.#resolveBinded, this.#rejectBinded)
    }

    this.#state = STATE.FULFILLED
    this.#value = value
    this.runCallbacks()
  }

  #reject(error) {
    this.#state = STATE.REJECTED
    this.#value = error
    this.runCallbacks()
  }

  runCallbacks(){
    if(this.#isFulfilled()){
      this.#fulfilledCallbacks.forEach(cb => cb())
      this.#fulfilledCallbacks = []
    }

    if(this.#isRejected()){
      this.#rejectedCallbacks.forEach(cb => cb())
      this.#rejectedCallbacks = []
    }
  }

  #isPending(){
    return this.#state === STATE.PENDING
  }
  #isRejected(){
    return this.#state === STATE.REJECTED
  }
  #isFulfilled(){
    return this.#state === STATE.FULFILLED
  }

  static resolve(result){
    return new MyPromise((res, rej) => res(result))
  }

  static reject(error){
    return new MyPromise((res, rej) => rej(error))
  }

   /**
   * resolves when all the promises are fulfilled,
   * if any of the input promise is rejected then returned promise will be rejected
   */
    static all(promises){
      return new MyPromise((res, rej) => {
        const results = []
        promises.forEach((p, i) => {
          const onSuccess = (result) => {
            results[i] = result
            if(results.length === promises.length){
              res(results)
            }
          }
          const onError = (error) => {
            rej(error)
          }

          p.then(onSuccess)
            .catch(onError)
        })
      })

    }

    static allSettled(promises){
      return new MyPromise((res) => {
        const output = []
        let settledCount = 0

         promises.forEach((p, i) => {
            p.then((value) => {
              output[i] = {status: STATE.FULFILLED, value}
            }, (reason) => {
              output[i] = {status: STATE.REJECTED, reason}
            }).finally(() => {
              settledCount++
              if(settledCount>=promises.length){
                res(output)
              }
            })
         })
      })
    }

    static race(promises){
      return new MyPromise((res, rej) => {
        promises.forEach(p => {
          p.then(res).catch(rej)
        })
      })
    }

    /**
     * TODO: Little improvements needed inside this
     */
    static any(promises){
      return new MyPromise((res, rej) => {
        promises.forEach(p => p.then(res))
      })
    }
}

export default MyPromise