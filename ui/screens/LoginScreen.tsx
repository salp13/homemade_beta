import * as React from 'react';
import { LoginParamList, RootStackParamList } from '../types'
import { RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput, Button } from 'react-native'
import { Text, View } from '../components/Themed';
import { styling } from '../style'

type LoginScreenNavigationProp = CompositeNavigationProp<StackNavigationProp<LoginParamList, 'LoginScreen'>, StackNavigationProp<RootStackParamList>>;
type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Auth'>;

interface Props {
  navigation: LoginScreenNavigationProp,
  route: LoginScreenRouteProp
}
  
interface State {
  failed_attempt: boolean
  username: string
  password: string
}

export default class LoginScreen extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      failed_attempt: false,
      username: '',
      password: ''
    }

    this.login = this.login.bind(this)
    this.setUsername = this.setUsername.bind(this)
    this.setPassword = this.setPassword.bind(this)
  }

  async login() {
    return fetch('http://localhost:8000/homemade/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        if (data.response == 'failed') {
          this.setState({
            failed_attempt: true,
          })
        } else {
          console.log("navigating?")
          this.props.navigation.navigate('Root');
          globalThis.logged_in = true
        }
      })
      .catch(error => {
        console.error(error);
      });
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

        <Button title="login" onPress={() => this.login()}/>

        <Button title="signup" onPress={() => this.props.navigation.navigate('SignupScreen')}/>
        {this.state.failed_attempt ? <Text>Login attempt failed, please try again with a different username or password.</Text> : <View></View> }
      </View>
    );
  }
}
