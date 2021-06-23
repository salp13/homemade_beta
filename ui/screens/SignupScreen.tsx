import * as React from 'react';
import { LoginParamList, RootStackParamList } from '../types'
import { RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput, Button } from 'react-native'
import { Text, View } from '../components/Themed';
import { styling } from '../style'
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  navigation: CompositeNavigationProp<StackNavigationProp<LoginParamList>, StackNavigationProp<RootStackParamList, 'Auth'>>;
  route: RouteProp<LoginParamList, 'SignupScreen'>;
}
  
interface State {
  invalid: boolean
  token: string
  user_id: string
  name: string
  email: string
  username: string
  password: string
}

export default class SignupScreen extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      invalid: false,
      token: '',
      user_id: '',
      name: '',
      email: '',
      username: '',
      password: ''
    }

    this.login = this.login.bind(this)
    this.signup = this.signup.bind(this)
    this.setEmail = this.setEmail.bind(this)
    this.setName = this.setName.bind(this)
    this.setUsername = this.setUsername.bind(this)
    this.setPassword = this.setPassword.bind(this)
  }

  async login() {
    await fetch('http://localhost:8000/api-token-auth/', {
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
          this.setState({
            token: data.token
          })
          try {
            AsyncStorage.setItem('@token', data.token)
          } catch (e) {
            console.error(e)
            return
          }
        })
        .catch(error => {
          console.error(error);
        });

    await fetch('http://localhost:8000/homemade/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      })
    })
      .then(response => response.json())
      .then(data => {
        try {
          AsyncStorage.setItem('@user_id', data.user_id)
          this.props.navigation.replace('Root')
        } catch (e) {
          console.error(e)
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  async signup() {
    await fetch('http://localhost:8000/homemade/signup', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: this.state.email,
        name: this.state.name,
        username: this.state.username,
        password: this.state.password
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.response == 'failed') {
          this.setState({
            invalid: true,
          })
          return
        }
      })
      .catch(error => {
        console.error(error);
        return
      });
    await this.login()
  }

  setEmail(text: string) {
    this.setState({
      email: text,
    })
  }

  setName(text: string) {
    this.setState({
      name: text,
    })
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
          placeholder="email"
          onChangeText={text => this.setEmail(text)}
          defaultValue={''}/>

        <TextInput 
          style={{height: 30}}
          placeholder="name"
          onChangeText={text => this.setName(text)}
          defaultValue={''}/>

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

        <Button title="signup" onPress={() => this.signup()}/>

        <Button title="back to login" onPress={() => this.props.navigation.navigate('LoginScreen')}/>

        {this.state.invalid ? <Text>Signup attempt failed, please try again with a different information.</Text> : <View></View> }
      </View>
    );
  }
}
