// Type-compatibility shim for react-native 0.86 + @types/react.
// RN 0.86.2 declares host components (Text/View/etc.) as class components
// whose constructor signature doesn't satisfy @types/react's JSX.ElementClass.
// This augmentation treats RN components as valid JSX element classes so
// `tsc` (used for CI type-checking) passes. Runtime is unaffected (Expo/Babel).
import 'react';

declare module 'react' {
  namespace JSX {
    interface ElementClass {
      // Allow react-native host/class components through
      props?: any;
    }
  }
}
