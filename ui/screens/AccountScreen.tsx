import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { Text, View } from '../components/Themed';
import dummyData from "../dummyData.json";
import { AccountParamList } from '../types'

type AccountScreenNavigationProp = StackNavigationProp<AccountParamList, 'AccountScreen'>;
type AccountScreenRouteProp = RouteProp<AccountParamList, 'AccountScreen'>;

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
        <View style={styles.container}>

        </View>
    );
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 65,
    paddingLeft: 20,
    paddingRight:20,
  },
});

// account information: total numbers for metrics? 
// edit account info