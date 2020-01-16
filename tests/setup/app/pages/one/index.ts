import { connect } from "react-redux"

import Component from "./component"
import mapDispatchToProps from "./mapDispatchToProps"
import mapStateToProps from "./mapStateToProps"

export default connect(mapStateToProps, mapDispatchToProps)(Component)

