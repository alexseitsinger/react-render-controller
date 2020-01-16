import React from "react"

export interface Pathname {
  from: string;
  to: string;
  reverse?: boolean;
}

export interface AddUnloaderArgs {
  lastPathname: string;
  currentPathname: string;
  skippedPathnames: Pathname[];
  handler: () => void;
  name: string;
}

export interface LoadTarget {
  name: string;
  data: object | [];
  getter: (...args: any) => void;
  setter: (o: {} | []) => void;
  empty: {} | [];
  excluded?: string[];
  forced?: boolean;
  attempted?: boolean;
  cached?: boolean;
}

export interface Props {
  children?: React.ReactNode | React.ReactNode[];
  targets: LoadTarget[];
  failDelay?: number;
  renderFirst?: () => React.ReactElement;
  renderWith?: () => React.ReactElement;
  renderWithout?: () => React.ReactElement;
  lastPathname: string;
  currentPathname: string;
  skippedPathnames: Pathname[];
  name: string;
}

export interface State {
  isControllerSeen: boolean;
}

export class RenderController extends React.Component<Props, State> {}
