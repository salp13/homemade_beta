import * as React from 'react';
import { ProfileParamList, RootStackParamList } from '../types'
import { RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Text, View } from '../components/Themed';
import { styling } from '../style'
import AsyncStorage from '@react-native-async-storage/async-storage';

type AccountScreenNavigationProp = CompositeNavigationProp<StackNavigationProp<ProfileParamList>, StackNavigationProp<RootStackParamList, 'Root'>>;
type AccountScreenRouteProp = RouteProp<ProfileParamList, 'AccountScreen'>;

interface Props {
  navigation: AccountScreenNavigationProp,
  route: AccountScreenRouteProp
}

export default class AccountScreen extends React.Component<Props> {

  constructor(props: Props) {
    super(props);

    this.logout = this.logout.bind(this)
  }

  async logout() {
    try {
      AsyncStorage.setItem('@token', '')
    } catch (e) {
      console.error(e)
    }
    this.props.navigation.replace('Auth')
  }

  render() {
    return (
        <View style={styling.container}>
          <TouchableWithoutFeedback onPress={() => this.logout()}>
            <View style={{flexDirection: 'row'}}>
                <Text style={{fontSize: 15, margin: 10, marginTop: 20}}>Log Out</Text>
            </View>
        </TouchableWithoutFeedback>
        </View>
    );
  }
}
