import Enzyme, { shallow, render, mount } from "enzyme"
import Adapter from "enzyme-adapter-react-16"

Enzyme.configure({ adapter: new Adapter() })

jest.setTimeout(20000)

global.shallow = shallow
global.render = render
global.mount = mount
