// useReducer: simple Counter
// http://localhost:3000/isolated/exercise/01.js

// LESSONS:
// 1. reducers can take any type of 2nd argument
// 2. Always fail fast. Unsupported cases should throw error

import * as React from 'react'

// function countReducer(prevCount, newCount) {
//   return newCount
// }

// Extra 1
// function countReducer(prevCount, step) {
//   return prevCount + step
// }

// Extra 2, 3
// function countReducer(state, newState) {
//   return {
//     ...state,
//     ...(typeof newState === 'function' ? newState(state) : newState),
//   }
// }

// Extra 4
function countReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + action.step,
      }

    default:
      throw new Error(`Unsupported action: ${action.type}`)
  }
}

function Counter({initialCount = 0, step = 1}) {
  // const [count, setCount] = React.useReducer(countReducer, initialCount)
  // const [count, changeCount] = React.useReducer(countReducer, initialCount)
  // const [{count}, setState] = React.useReducer(countReducer, {
  //   count: initialCount,
  // })
  const [{count}, dispatch] = React.useReducer(countReducer, {
    count: initialCount,
  })

  // const increment = () => setCount(count + step)
  // const increment = () => changeCount(step)
  // const increment = () => setState({count: count + step})
  // const increment = () =>
  //   setState(currentState => ({count: currentState.count + step}))
  const increment = () => dispatch({type: 'INCREMENT', step})
  return <button onClick={increment}>{count}</button>
}

function App() {
  return <Counter />
}

export default App
