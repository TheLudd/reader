import FL from 'fantasy-land'
import {
  chain,
  extract,
  map,
  of,
} from '@theludd/fantasy-functions'
import ArgumentError from './argument-error'

class Identity {
  constructor (v) {
    this.v = v
  }

  [FL.map] (f) {
    return of(f(this.v), Identity)
  }

  [FL.chain] (f) {
    return f(this.v)
  }

  [FL.extract] () {
    return this.v
  }
}

Identity[FL.of] = (v) => new Identity(v)

function ReaderT (M) {
  const type = M === Identity ? 'Reader' : `ReaderT(${M.name})`
  class R {
    constructor (f) {
      this.f = f
    }

    [FL.map] (f) {
      if (typeof f !== 'function') {
        throw new ArgumentError(type, 'map', 'function', f)
      }
      return chain((v) => of(R, f(v)), this)
    }

    [FL.chain] (f) {
      if (typeof f !== 'function') {
        throw new ArgumentError(type, 'chain', 'function', f)
      }
      return new R((e) => chain((v) => {
        const innerR = f(v)
        if (!(innerR instanceof R)) {
          throw new ArgumentError(type, 'chain', `function returning ${type}`, `function returning ${innerR}`)
        }
        return innerR.run(e)
      }, this.run(e)))
    }

    [FL.ap] (r) {
      if (!(r instanceof R)) {
        throw new ArgumentError(type, 'ap', type, r)
      }
      return chain((f) => {
        if (typeof f !== 'function') {
          throw new ArgumentError(type, 'ap', `${type} of function`, `${type} of ${f}`)
        }
        return map(f, this)
      }, r)
    }

    run (env) {
      return this.f(env)
    }

    toString () {
      return `${type}#${this.f.toString()}`
    }
  }

  class ResolvedR extends R {
    constructor (v) {
      super(() => of(M, v))
      this.v = v
    }

    [FL.map] (f) {
      if (typeof f !== 'function') {
        throw new ArgumentError(type, 'map', 'function', f)
      }
      return new ResolvedR(f(this.v))
    }

    toString () {
      return `${type}[${this.v}]`
    }
  }

  R[FL.of] = (v) => new ResolvedR(v)

  R.ask = new R(of(M))

  R.lift = (m) => new R(() => m)

  return R
}

const Reader = ReaderT(Identity)

const { ask } = Reader

function runReader (env, r) {
  return extract(r.run(env))
}

export { Reader, runReader, ask, ReaderT }
