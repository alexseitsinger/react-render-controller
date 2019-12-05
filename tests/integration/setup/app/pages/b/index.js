import { connect } from "react-redux"

import mapDispatch from "./mapDispatch"
import mapState from "./mapState"
import Component from "./component"

export default connect(mapState, mapDispatch)(Component)


