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
      render?: any;
    }
  }
}

export {};
