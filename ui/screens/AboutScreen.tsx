import * as React from 'react';
import { ProfileParamList } from '../types'
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';

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
      <View style={styles.container}>
        <Text style={{margin: 20}}>
            Hello and welcome to the homemade family! This is an app designed as a tool to help you track, mitigate, and reduce your own personal food waste. 
            On our app, you can easily keep track of the perishables in your refrigerator and when they are due to expire. 
            Having this information in a central location makes it easier to not forget about what you have. 
            In addition to helping you keep track of the perishables in your fridge, we recommend recipes based on food you have that is nearing expiration 
            so you know what to eat and a delicious way to encorporate it into your next meal! {"\n\n"}We are open to any and all feedback so please email susiealptekin33@gmail.com
            with any questions, concerns, or suggestions for our product.
        </Text>
      </View>
    );
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
