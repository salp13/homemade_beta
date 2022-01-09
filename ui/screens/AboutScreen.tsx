import * as React from 'react';
import { ProfileParamList } from '../types'
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StyleSheet } from 'react-native'
import { Text, View } from '../components/Themed';
import { styling } from '../style'

type AboutScreenNavigationProp = StackNavigationProp<ProfileParamList, 'AboutScreen'>;
type AboutScreenRouteProp = RouteProp<ProfileParamList, 'AboutScreen'>;

interface Props {
  navigation: AboutScreenNavigationProp,
  route: AboutScreenRouteProp
}

export default class AboutScreen extends React.Component<Props> {

  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <View style={StyleSheet.flatten([styling.noHeader, styling.container])}>
        <Text>
            Hello and welcome to homemade! This is an app designed to help you track, mitigate, and reduce your personal food waste. 
            On our app, you can easily keep track of the perishables in your refrigerator and when they are due to expire. 
            Having this information in a central location makes it easier to not forget about what you have. 
            In addition to helping you keep track of the perishables in your fridge, you can post recipes or search through recipes other user have posted!
        </Text>
      </View>
    );
  }
}
