import * as React from 'react';
import { LoginParamList } from '../types'
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput, Button } from 'react-native'
import { Text, View } from '../components/Themed';
import { styling } from '../style'

type LoginScreenNavigationProp = StackNavigationProp<LoginParamList, 'LoginScreen'>;
type LoginScreenRouteProp = RouteProp<LoginParamList, 'LoginScreen'>;

interface Props {
  navigation: LoginScreenNavigationProp,
  route: LoginScreenRouteProp
}
  
interface State {
  username: string
  password: string
}

export default class LoginScreen extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      username: '',
      password: ''
    }

    this.setUsername = this.setUsername.bind(this)
    this.setPassword = this.setPassword.bind(this)
  }

  setUsername(text: string) {
    this.setState({
      username: text,
    })
  }

  setPassword(text: string) {
    this.setState({
      password: text,
    })
  }

  render() {
    return (
      <View style={[styling.setFlex, {margin: 100}]}>
        <Text>homemade</Text>

        <TextInput 
          style={{height: 30}}
          placeholder="username"
          onChangeText={text => this.setUsername(text)}
          defaultValue={''}/>

        <TextInput 
          style={{height: 30}}
          placeholder="password"
          onChangeText={text => this.setPassword(text)}
          defaultValue={''}/>

        <Button title="login" onPress={() => {
          // TODO: check if credentials match, then finish login (switch to bottom tab screens somehow)
        }}/>

        <Button title="signup" onPress={() => this.props.navigation.navigate('SignupScreen')}/>
      </View>
    );
  }
}
