import * as React from 'react';
import { LoginParamList, RootStackParamList } from '../types'
import { RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput, Button, ActivityIndicator } from 'react-native'
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
  updateLoading: boolean
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
      updateLoading: false,
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
    this.setState({ updateLoading: true })
    await fetch('https://homemadeapp.azurewebsites.net/api-token-auth/', {
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
        if (data.non_field_errors) {
          this.setState({
            failed_attempt: true,
            updateLoading: false,
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
          this.setState({ updateLoading: false })
          return
        }
      })
      .catch(error => {
        console.log(error)
        console.error(error);
        this.setState({
          failed_attempt: true,
          updateLoading: false
        })
        return
      });

    if (this.state.failed_attempt) return

    await fetch('https://homemadeapp.azurewebsites.net/homemade/login', {
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
            updateLoading: false,
          })
          return
        } else {
          this.setState({
            failed_attempt: false,
            updateLoading: false,
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
        <View style={styling.marginTop300}>
          <Text style={[{textAlign: 'center'}, styling.fontSize20]}>homemade</Text>
          {(this.state.updateLoading) ? (<ActivityIndicator/>) : (<View></View>)}
          <TextInput 
            style={styling.loginTextInput}
            placeholder="username"
            placeholderTextColor='#696969'
            autoCapitalize='none'
            onChangeText={text => this.setUsername(text)}
            defaultValue={''}/>

          <TextInput 
            style={styling.loginTextInput}
            placeholder="password"
            placeholderTextColor='#696969'
            autoCapitalize='none'
            secureTextEntry={true}
            onChangeText={text => this.setPassword(text)}
            defaultValue={''}/>

          <Button disabled={this.state.updateLoading} title="login" onPress={() => this.login()}/>

          <Button disabled={this.state.updateLoading} title="signup" onPress={() => this.props.navigation.navigate('SignupScreen')}/>
          {this.state.failed_attempt ? 
            <Text style={styling.errorMessageText}>
              Login attempt failed, please try again with a different username or password.
              </Text> : 
              <View></View> }
        </View>
      </View>
    );
  }
}
