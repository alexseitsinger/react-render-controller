import React from "react"
import { connect } from "react-redux"

//import mapDispatch from "./mapDispatch"
import {
  getOneData,
  setOneData,
  getTwoData,
  setTwoData,
} from "./actions"
import mapState from "./mapState"
import Component from "./component"

export default ({ mocked, ...props }) => {
  const mapDispatch = dispatch => {
    const setOneDataWrapper = data => {
      mocked.setOneData()
      dispatch(setOneData(data))
    }
    const getOneDataWrapper = () => {
      mocked.getOneData()
      dispatch(getOneData(setOneDataWrapper))
    }
    const setTwoDataWrapper = data => {
      mocked.setTwoData()
      dispatch(setTwoData(data))
    }
    const getTwoDataWrapper = () => {
      mocked.getTwoData()
      dispatch(getTwoData(setTwoDataWrapper))
    }
    return {
      getOneData: getOneDataWrapper,
      setOneData: setOneDataWrapper,
      getTwoData: getTwoDataWrapper,
      setTwoData: setTwoDataWrapper,
    }
  }
  const ConnectedApp = connect(mapState, mapDispatch)(Component)
  return <ConnectedApp />
}


