import * as React from 'react';
import { Text as DefaultText, View as DefaultView, Image as DefaultImage } from 'react-native';
import { SearchBar as DefaultSearchBar } from 'react-native-elements';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  
  // temporary change due to incompatibility with dark mode
  // const theme = useColorScheme();
  const theme = "light"
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function useThemeColorSearch() {
  // temporary change due to incompatibility with dark mode
  // const theme = useColorScheme();
  const theme = "light"

  if (theme === "light") {
    return { 
      lightMode: true, 
      outerBackgroundColor: Colors[theme]["background"], 
      inputBackgroundColor: Colors[theme]["searchBarBackground"],
      textColor: Colors[theme]["text"]
    }
  }
  return { 
    lightMode: false, 
    outerBackgroundColor: Colors[theme]["background"], 
    inputBackgroundColor: Colors[theme]["searchBarBackground"],
    textColor: Colors[theme]["text"]
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

type RefProps = {
  reference?: React.RefObject<DefaultSearchBar>
}

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];
export type ImageProps = ThemeProps & DefaultImage['props'];
export type SearchBarProps = ThemeProps & DefaultSearchBar['props'] & RefProps;

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

export function Image(props: ImageProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultImage style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function SearchBar(props: SearchBarProps) {
  const {containerStyle, inputContainerStyle, inputStyle, reference, ...otherProps} = props
  const { lightMode, outerBackgroundColor, inputBackgroundColor, textColor } = useThemeColorSearch()
  return <DefaultSearchBar 
    lightTheme={ lightMode } 
    containerStyle={[{ backgroundColor: outerBackgroundColor }, containerStyle]} 
    inputContainerStyle={[{ backgroundColor: inputBackgroundColor}, inputContainerStyle]} 
    inputStyle={[{ color: textColor}, inputStyle]}
    ref={reference}
    {...otherProps} 
  />;
} 
