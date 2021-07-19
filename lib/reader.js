import {
  ap as AP,
  chain as CHAIN,
  extract as EXTRACT,
  map as MAP,
  of as OF,
} from 'fantasy-land'
import {
  chain,
  extract,
  map,
  of,
} from '@yafu/fantasy-functions'

class Identity {
  constructor (v) {
    this.v = v
  }

  [MAP] (f) {
    return of(f(this.v), Identity)
  }

  [CHAIN] (f) {
    return f(this.v)
  }

  [EXTRACT] () {
    return this.v
  }
}

Identity[OF] = (v) => new Identity(v)

function ReaderT (M) {
  const type = M === Identity ? 'Reader' : `ReaderT(${M.name})`
  class R {
    constructor (f) {
      this.f = f
    }

    [MAP] (f) {
      return chain((v) => of(R, f(v)), this)
    }

    [CHAIN] (f) {
      return new R((e) => chain((v) => f(v).run(e), this.run(e)))
    }

    [AP] (r) {
      return chain((f) => map(f, this), r)
    }

    chainInner (f) {
      return chain((v) => R.lift(f(v)), this)
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

    [MAP] (f) {
      return new ResolvedR(f(this.v))
    }

    toString () {
      return `${type}[${this.v}]`
    }
  }

  R[OF] = (v) => new ResolvedR(v)

  R.ask = new R(of(M))

  R.lift = (m) => new R(() => m)

  return R
}

const Reader = ReaderT(Identity)

const { ask } = Reader

function runReader (env, r) {
  return extract(r.run(env))
}

function chainInner (f, rt) {
  return rt.chainInner(f)
}

export {
  Reader,
  ReaderT,
  ask,
  chainInner,
  runReader,
}
