import React, { ReactElement, ReactNode } from "react"

export interface ContextProps {
  onRenderFirst?: () => ReactElement;
  onRenderWithout?: () => ReactElement;
}

const defaultContext: ContextProps = {
  onRenderFirst: undefined,
  onRenderWithout: undefined,
}

export const Context = React.createContext(defaultContext)

export interface RenderControllerProviderProps {
  context: ContextProps;
  children: ReactNode | ReactNode[];
}

export function RenderControllerProvider(
  props: RenderControllerProviderProps
): ReactElement {
  const { context, children } = props
  return <Context.Provider value={context}>{children}</Context.Provider>
}
