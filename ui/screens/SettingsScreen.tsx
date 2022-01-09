import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ProfileParamList } from '../types'
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Text, View } from '../components/Themed';
import { styling } from '../style';

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
      <View style={styling.container}>
        <TouchableWithoutFeedback onPress={() => {this.props.navigation.navigate('AccountScreen')}}>
            <View style={styling.flexRow}>
                <Text style={styling.accountOption}>Account</Text>
                <Ionicons name="ios-arrow-forward" color="black" style={styling.accountArrow} />
            </View>
        </TouchableWithoutFeedback>
        <View style={styles.completeSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <TouchableWithoutFeedback onPress={() => {this.props.navigation.navigate('AboutScreen')}}>
            <View style={styling.flexRow}>
                <Text style={styling.aboutOption}>About</Text>
                <Ionicons name="ios-arrow-forward" color="black" style={styling.aboutArrow} />
            </View>
        </TouchableWithoutFeedback>
        <View style={styles.completeSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      </View>
    );
  }
}


const styles = StyleSheet.create({
  completeSeparator: {
    marginVertical: 10,
    height: 1,
  },
});
