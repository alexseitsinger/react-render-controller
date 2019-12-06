import React from "react"
import PropTypes from "prop-types"

import { RenderController } from "./RenderController"
import { Context } from "./Provider"

export class Consumer extends React.Component {
  static displayName = "RenderControllerConsumer"

  static propTypes = {

  }

  static defaultProps = {

  }

  render() {
    return (
      <Context.Consumer>
        {context => <RenderController context={context} {...this.props} />}
      </Context.Consumer>
    )
  }
}
