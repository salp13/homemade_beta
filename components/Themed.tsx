import * as React from 'react';
import { Text as DefaultText, View as DefaultView } from 'react-native';
import {SearchBar as DefaultSearchBar} from 'react-native-elements';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function useThemeColorSearch() {
  const theme = useColorScheme();
  if (theme === "light") {
    return { 
      lightMode: true, 
      outerBackgroundColor: Colors[theme]["background"], 
      inputBackgroundColor: Colors[theme]["searchBarBackground"]
    }
  }
  return { 
    lightMode: false, 
    outerBackgroundColor: Colors[theme]["background"], 
    inputBackgroundColor: Colors[theme]["searchBarBackground"]
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];
export type SearchBarProps = DefaultSearchBar['props'];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function SearchBar(props: SearchBarProps) {
  const {containerStyle, inputContainerStyle, ...otherProps} = props
  const { lightMode, outerBackgroundColor, inputBackgroundColor } = useThemeColorSearch()
  return <DefaultSearchBar 
    lightTheme={ lightMode } 
    containerStyle={[{ backgroundColor: outerBackgroundColor }, containerStyle]} 
    inputContainerStyle={[{ backgroundColor: inputBackgroundColor}, inputContainerStyle]} {...otherProps} 
  />
} 
