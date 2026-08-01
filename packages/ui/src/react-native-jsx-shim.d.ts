// Compatibility shim: react-native 0.86 declares host components (Text, View, …)
// as class components whose constructor signature doesn't satisfy @types/react's
// JSX.ElementClass. This augmentation widens ElementClass so RN components type-check
// under `tsc`. Runtime is unaffected (Expo/Babel bundles without tsc).
import * as React from 'react';
import {
  Text,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Image,
  FlatList,
} from 'react-native';

type RNNativeComponent =
  | typeof Text
  | typeof View
  | typeof Pressable
  | typeof ScrollView
  | typeof ActivityIndicator
  | typeof TextInput
  | typeof Image
  | typeof FlatList;

declare module 'react' {
  namespace JSX {
    interface ElementClass {
      // Accept react-native host/class components (they render but lack a strict
      // `props` instance member under @types/react).
      render?: any;
    }
  }
}

export {};
