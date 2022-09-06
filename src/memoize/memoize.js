const defaultResolver = (args) => JSON.stringify(args)

function memoize(callback, resolver = defaultResolver){
  const cache = new Map()

  const memo = (...args) => {
    const key = resolver(args)

    if(!cache.has(key)){
      const val = callback(...args)
      cache.set(key, val)
    }
    return cache.get(key)
  }

  memo.clear = () => cache.clear()

  memo.delete = (...args) => {
    const key = resolver(args)
    cache.delete(key)
  }

  memo.has = (...args) => {
    const key = resolver(args)
    return cache.has(key)
  }

  return memo
}

export default memoize