export interface SkippedPathname {
  from: string;
  to: string;
  reverse?: boolean;
}

export interface AddUnloaderArgs {
  lastPathname: string;
  currentPathname: string;
  skippedPathnames: SkippedPathname[];
  handler: () => void;
  name: string;
}

export interface Loaders {
  [key: string]: () => void;
}

export interface LoadTarget {
  name: string;
  data: { [key: string]: any };
  getter: (...args: any[]) => void;
  setter: (o: {} | []) => void;
  empty: {} | [];
  excluded?: string[];
  forced?: boolean;
  cached?: boolean;
  attempted?: boolean;
}
