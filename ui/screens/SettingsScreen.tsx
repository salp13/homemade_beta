import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ProfileParamList } from '../types'
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Text, View } from '../components/Themed';

type SettingsScreenNavigationProp = StackNavigationProp<ProfileParamList, 'SettingsScreen'>;
type SettingsScreenRouteProp = RouteProp<ProfileParamList, 'SettingsScreen'>;

interface Props {
  navigation: SettingsScreenNavigationProp,
  route: SettingsScreenRouteProp
}


export default class SettingsScreen extends React.Component<Props> {

  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={() => {this.props.navigation.navigate('AccountScreen')}}>
            <View style={{flexDirection: 'row'}}>
                <Text style={{fontSize: 15, margin: 10, marginTop: 20}}>Account</Text>
                <Ionicons name="ios-arrow-forward" size={24} color="black" style={{marginLeft: 'auto', marginRight: 20, marginTop: 20}} />
            </View>
        </TouchableWithoutFeedback>
        <View style={styles.completeSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <TouchableWithoutFeedback onPress={() => {this.props.navigation.navigate('AboutScreen')}}>
            <View style={{flexDirection: 'row'}}>
                <Text style={{fontSize: 15, margin: 10}}>About</Text>
                <Ionicons name="ios-arrow-forward" size={24} color="black" style={{marginLeft: 'auto', marginRight: 20, marginTop: 10}} />
            </View>
        </TouchableWithoutFeedback>
        <View style={styles.completeSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  completeSeparator: {
    marginVertical: 10,
    height: 1,
  },
});
