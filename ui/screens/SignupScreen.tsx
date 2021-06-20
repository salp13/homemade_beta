import * as React from 'react';
import { LoginParamList } from '../types'
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput, Button } from 'react-native'
import { Text, View } from '../components/Themed';
import { styling } from '../style'

interface Props {
  navigation: StackNavigationProp<LoginParamList, 'SignupScreen'>;
  route: RouteProp<LoginParamList, 'SignupScreen'>;
}
  
interface State {
  name: string
  username: string
  password: string
}

export default class SignupScreen extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      name: '',
      username: '',
      password: ''
    }

    this.setName = this.setName.bind(this)
    this.setUsername = this.setUsername.bind(this)
    this.setPassword = this.setPassword.bind(this)
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

        <Button title="signup" onPress={() => {
          // TODO: requeset to post / create new user 
        }}/>

        <Button title="back to login" onPress={() => this.props.navigation.navigate('LoginScreen')}/>
      </View>
    );
  }
}
