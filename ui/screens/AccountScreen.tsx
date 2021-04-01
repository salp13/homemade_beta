import * as React from 'react';
import { ProfileParamList } from '../types'
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';
import { View } from '../components/Themed';
import { styling } from '../style'

type AccountScreenNavigationProp = StackNavigationProp<ProfileParamList, 'AccountScreen'>;
type AccountScreenRouteProp = RouteProp<ProfileParamList, 'AccountScreen'>;

interface Props {
  navigation: AccountScreenNavigationProp,
  route: AccountScreenRouteProp
}

export default class AccountScreen extends React.Component<Props> {

  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
        <View style={styling.container}>

        </View>
    );
  }
}
