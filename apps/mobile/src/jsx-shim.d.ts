// Project JSX shim for React 19 + React Native 0.86 + react-jsx.
//
// @types/react 18.3 declares JSX.ElementClass requiring a `props` instance member.
// React Native 0.86 host/class components (View, Text, ...) do not satisfy that
// strict signature under `tsc --noEmit`, producing spurious type errors even
// though the runtime (Expo/Babel) compiles fine. The shared package ships a
// similar shim; this widens ElementClass at the project level so our screens
// type-check. Runtime is unaffected.
import * as React from 'react';

declare module 'react' {
  namespace JSX {
    interface ElementClass {
      // RN host/class components don't satisfy the strict `props` member that
      // @types/react 18.3 requires on JSX.ElementClass. We widen to a callable
      // render instead of `any` so the shim stays type-safe.
      render?: (...args: unknown[]) => unknown;
    }
  }
}

export {};
