import * as React from 'react';
import { ProfileParamList, RootStackParamList } from '../types'
import { RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, TextInput } from 'react-native';
import { View } from '../components/Themed';
import { styling } from '../style'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik, FieldArray, FormikProps } from 'formik'

type AccountScreenNavigationProp = CompositeNavigationProp<StackNavigationProp<ProfileParamList>, StackNavigationProp<RootStackParamList, 'Root'>>;
type AccountScreenRouteProp = RouteProp<ProfileParamList, 'AccountScreen'>;

interface Props {
  navigation: AccountScreenNavigationProp,
  route: AccountScreenRouteProp
}

interface State {
  token: string
  user_id: string
  isLoading: boolean
  username: string
  old_name: string
  name: string
  old_password: string
  new_password: string
  confirm_password: string
}

export default class AccountScreen extends React.Component<Props, State> {
  private formikRef = React.createRef<FormikProps<any>>()
  private formikRef2 = React.createRef<FormikProps<any>>()

  constructor(props: Props) {
    super(props);
    this.state = {
      token: '',
      user_id: '',
      isLoading: true,
      username: '',
      old_name: '',
      name: '', 
      old_password: '', 
      new_password: '',
      confirm_password: '',
    }

    this.logout = this.logout.bind(this)
    this.submit = this.submit.bind(this)
  }

  async componentDidMount() {
    const setToken = await AsyncStorage.getItem('@token')
    const setUserID = await AsyncStorage.getItem('@user_id')
    if (setToken && setUserID) {
      this.setState({
        token: setToken,
        user_id: setUserID,
        isLoading: false,
      })
    }

    await fetch(`http://localhost:8000/homemade/single_user/${this.state.user_id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + this.state.token,
        },
      })
        .then(response => response.json())
        .then(data => { 
          this.setState({
            username: data.username,
            old_name: data.name,
            name: data.name,
          })
         })
        .catch(error => {
        console.error(error);
      });
  }

  async logout() {
    try {
      AsyncStorage.setItem('@token', '')
    } catch (e) {
      console.error(e)
    }
    this.props.navigation.replace('Auth')
  }

  async submit() {
    await this.formikRef.current?.submitForm()
    await this.formikRef2.current?.submitForm()

    if (this.state.name !== this.state.old_name) {
      await fetch(`http://localhost:8000/homemade/single_user/${this.state.user_id}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + this.state.token,
        },
        body: JSON.stringify({ name: this.state.name })
      })
        .catch(error => {
          console.error(error);
        });
    }
    if (this.state.new_password !== '' && this.state.confirm_password === this.state.new_password) {
      await fetch(`http://localhost:8000/homemade/change_password`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + this.state.token,
        },
        body: JSON.stringify({ 
          username: this.state.username, 
          old_password: this.state.old_password, 
          new_password: this.state.new_password 
        })})
        .catch(error => {
          console.error(error);
        });
    }
    console.log(this.state.username)
    console.log(this.state.old_password)
    console.log(this.state.new_password)
    console.log(this.state.confirm_password)
  }

  render() {
    return (
      <View style={styling.container}>
        <View>
          <Formik 
            enableReinitialize
            initialValues={{name: this.state.name}}
            innerRef={this.formikRef}
            onSubmit={(values, actions) => { this.setState({name: values.name}) }}
            render={({ values, handleChange, handleBlur })=> (
              <View>
                <TextInput 
                  data-name='name'
                  value={values.name}
                  placeholder="Your Name"
                  style={[{marginTop: 5 }]}
                  onChangeText={handleChange(`name`)}
                  onBlur={handleBlur(`name`)}
                  defaultValue={values.name} />
              </View>
              )}
              />
          <Formik 
            enableReinitialize
            initialValues={{
              old_password: this.state.old_password,
              new_password: this.state.new_password,
              confirm_password: this.state.confirm_password,
            }}
            innerRef={this.formikRef2}
            onSubmit={(values, actions) => { this.setState({
              old_password: values.old_password,
              new_password: values.new_password,
              confirm_password: values.confirm_password
            }) 
            }}
            render={({ values, handleChange, handleBlur })=> (
              <View>
                <TextInput 
                  data-name='old_password'
                  secureTextEntry={true}
                  value={values.old_password}
                  placeholder="Verify Old Password"
                  style={[{marginTop: 5 }]}
                  onChangeText={handleChange(`old_password`)}
                  onBlur={handleBlur(`old_password`)}
                  defaultValue={''} />
                <TextInput 
                  data-name='new_password'
                  secureTextEntry={true}
                  value={values.new_password}
                  placeholder="New Password"
                  style={[{marginTop: 5 }]}
                  onChangeText={handleChange(`new_password`)}
                  onBlur={handleBlur(`new_password`)}
                  defaultValue={''} />
                <TextInput 
                  data-name='confirm_password'
                  secureTextEntry={true}
                  value={values.confirm_password}
                  placeholder="Confirm Password"
                  style={[{marginTop: 5 }]}
                  onChangeText={handleChange(`confirm_password`)}
                  onBlur={handleBlur(`confirm_password`)}
                  defaultValue={''} />
              </View>
              )}
              />
        </View>
        <Button title="Edit Account Info" onPress={() => this.submit()} />
        <View style={styling.SectionBuffer}>
        <Button title="logout" onPress={() => this.logout()} />
        </View>
      </View>
    );
  }
}
