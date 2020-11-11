// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'

function asyncReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return {status: 'pending', data: null, error: null}
    }
    case 'resolved': {
      return {status: 'resolved', data: action.data, error: null}
    }
    case 'rejected': {
      return {status: 'rejected', data: null, error: action.error}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

// function useAsync(asyncCallback, initialState, dependencies) {
// Extra 1: asyncCallback must be memoized
// function useAsync(asyncCallback, initialState) {
//   const [state, dispatch] = React.useReducer(asyncReducer, initialState)

//   React.useEffect(() => {
//     const promise = asyncCallback()
//     if (!promise) {
//       return
//     }

//     dispatch({type: 'pending'})
//     promise.then(
//       data => {
//         dispatch({type: 'resolved', data})
//       },
//       error => {
//         dispatch({type: 'rejected', error})
//       },
//     )

//     // }, dependencies)
//     // Extra 1: callback must be memoized
//   }, [asyncCallback])

//   return state
// }

function useSafeDispatch(dispatch) {
  const mountedRef = React.useRef(false)

  React.useLayoutEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  return React.useCallback(
    (...args) => {
      if (mountedRef.current) {
        dispatch(...args)
      }
    },
    [dispatch],
  )
}

// Extra 2: Provide a memoized run function to avoid memoization by consumer.
// Extra 3: Now avoid running dispatch if mounted
// Forgot to set default state for this hook
function useAsync(initialState) {
  const [state, unsafeDispatch] = React.useReducer(asyncReducer, {
    status: 'idle',
    data: null,
    error: null,
    ...initialState,
  })

  const dispatch = useSafeDispatch(unsafeDispatch)

  const run = React.useCallback(
    promise => {
      dispatch({type: 'pending'})
      promise.then(
        data => {
          dispatch({type: 'resolved', data})
        },
        error => {
          dispatch({type: 'rejected', error})
        },
      )
    },
    [dispatch],
  )

  return {...state, run}
}

function PokemonInfo({pokemonName}) {
  // const state = useAsync(
  //   () => {
  //     if (!pokemonName) {
  //       return
  //     }
  //     return fetchPokemon(pokemonName)
  //   },
  //   {status: pokemonName ? 'pending' : 'idle'},
  //   [pokemonName],
  // )

  // Extra 1: memoize callback to avoid passing dependencies
  // const asyncCallback = React.useCallback(() => {
  //   if (!pokemonName) {
  //     return
  //   }
  //   return fetchPokemon(pokemonName)
  // }, [pokemonName])

  // const state = useAsync(asyncCallback, {
  //   status: pokemonName ? 'pending' : 'idle',
  // })

  // const {data: pokemon, status, error} = state

  // Extra 2: New API design
  const {data: pokemon, status, error, run} = useAsync({
    status: pokemonName ? 'pending' : 'idle',
  })

  React.useEffect(() => {
    if (!pokemonName) {
      return
    }
    run(fetchPokemon(pokemonName))
  }, [pokemonName, run])

  if (status === 'idle' || !pokemonName) {
    return 'Submit a pokemon'
  } else if (status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />
  } else if (status === 'rejected') {
    throw error
  } else if (status === 'resolved') {
    return <PokemonDataView pokemon={pokemon} />
  }

  throw new Error('This should be impossible')
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

export default App
