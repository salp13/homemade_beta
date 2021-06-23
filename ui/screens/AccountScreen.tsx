import * as React from 'react';
import { ProfileParamList, RootStackParamList } from '../types'
import { RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button } from 'react-native';
import { View } from '../components/Themed';
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
        <View style={styling.SectionBuffer}>
        <Button title="logout" onPress={() => this.logout()} />
        </View>
      </View>
    );
  }
}
