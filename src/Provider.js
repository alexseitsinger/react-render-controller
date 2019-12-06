import React from "react"
import PropTypes from "prop-types"

const defaultValue = {}

export const Context = React.createContext(defaultValue)

export const providerShape = PropTypes.shape({
  isCacheClearedWhenUnmounted: PropTypes.bool,
})

export class Provider extends React.Component {
  static propTypes = {
    context: PropTypes.shape(),
    children: PropTypes.node.isRequired,
  }

  static defaultProps = {
    context: {},
  }

  static displayName = "RenderControllerProvider"

  render() {
    const { children, context } = this.props

    return (
      <Context.Provider value={context}>
        {children}
      </Context.Provider>
    )
  }
}
