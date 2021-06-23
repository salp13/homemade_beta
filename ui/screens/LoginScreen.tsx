import * as React from 'react';
import { LoginParamList, RootStackParamList } from '../types'
import { RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput, Button } from 'react-native'
import { Text, View } from '../components/Themed';
import { styling } from '../style'
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenNavigationProp = CompositeNavigationProp<StackNavigationProp<LoginParamList>, StackNavigationProp<RootStackParamList, 'Auth'>>;
type LoginScreenRouteProp = RouteProp<LoginParamList, 'LoginScreen'>;

interface Props {
  navigation: LoginScreenNavigationProp,
  route: LoginScreenRouteProp
}
  
interface State {
  isLoading: boolean
  failed_attempt: boolean
  token: string
  username: string
  password: string
}

export default class LoginScreen extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      isLoading: true,
      failed_attempt: false,
      token: '', 
      username: '',
      password: ''
    }

    this.login = this.login.bind(this)
    this.setUsername = this.setUsername.bind(this)
    this.setPassword = this.setPassword.bind(this)
  }

  async componentDidMount() {
    const setToken = await AsyncStorage.getItem('@token')
    const setUserID = await AsyncStorage.getItem('@user_id')
    if (setToken && setUserID) {
      this.props.navigation.replace('Root')
    }
    this.setState({isLoading: false})
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
        console.log(data)
        if (data.non_field_errors) {
          this.setState({
            failed_attempt: true,
          })
          return
        } else {
          this.setState({
            failed_attempt: false,
          })
        }
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
        console.log(error)
        console.error(error);
        this.setState({
          failed_attempt: true,
        })
        return
      });

    if (this.state.failed_attempt) return

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
        if (data.non_field_errors) {
          this.setState({
            failed_attempt: true,
          })
          return
        } else {
          this.setState({
            failed_attempt: false,
          })
        }
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
    if (this.state.isLoading) return (<View></View>)
    return (
      <View style={styling.container}>
        <View style={{marginTop: 300}}>
          <Text style={{textAlign: 'center', fontSize: 20}}>homemade</Text>

          <TextInput 
            style={{marginTop: 20, fontSize: 15, textAlign: 'center', height: 30}}
            placeholder="username"
            autoCapitalize='none'
            onChangeText={text => this.setUsername(text)}
            defaultValue={''}/>

          <TextInput 
            style={{margin: 20, fontSize: 15, textAlign: 'center', height: 30}}
            placeholder="password"
            autoCapitalize='none'
            secureTextEntry={true}
            onChangeText={text => this.setPassword(text)}
            defaultValue={''}/>

          <Button title="login" onPress={() => this.login()}/>

          <Button title="signup" onPress={() => this.props.navigation.navigate('SignupScreen')}/>
          {this.state.failed_attempt ? 
            <Text style={{marginTop: 10, fontSize: 12, color: 'red', textAlign: 'center'}}>
              Login attempt failed, please try again with a different username or password.
              </Text> : 
              <View></View> }
        </View>
      </View>
    );
  }
}
