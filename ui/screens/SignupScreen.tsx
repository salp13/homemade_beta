import * as React from 'react';
import { LoginParamList, RootStackParamList } from '../types'
import { RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput, Button, ActivityIndicator } from 'react-native'
import { Text, View } from '../components/Themed';
import { styling } from '../style'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as yup from 'yup'
import { Formik, FormikProps, validateYupSchema } from 'formik'

interface Props {
  navigation: CompositeNavigationProp<StackNavigationProp<LoginParamList>, StackNavigationProp<RootStackParamList, 'Auth'>>;
  route: RouteProp<LoginParamList, 'SignupScreen'>;
}
  
interface State {
  invalid: boolean
  loading: boolean
  token: string
  user_id: string
  name: string
  email: string
  username: string
  password: string
  confirm_password: string
}

export default class SignupScreen extends React.Component<Props, State> {
  private formikRef = React.createRef<FormikProps<any>>()

  constructor(props: Props) {
    super(props)
    this.state = {
      invalid: false,
      loading: false,
      token: '',
      user_id: '',
      name: '',
      email: '',
      username: '',
      password: '',
      confirm_password: '',
    }

    this.login = this.login.bind(this)
    this.validateInputs = this.validateInputs.bind(this)
    this.signup = this.signup.bind(this)
  }

  async login() {
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

    // hit api for all foods excluding the unlisted food item
    let all_foods = await fetch(`https://homemadeapp.azurewebsites.net/homemade/many_foods/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
    })
    .then(response => response.json())
    .then(data => { return data })
    .catch(error => {
      console.error(error);
    });

    let food_groups = await fetch(`https://homemadeapp.azurewebsites.net/homemade/admin_food_group`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
    })
    .then(response => response.json())
    .then(data => { return data })
    .catch(error => {
      console.error(error);
    });

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
        try {
          AsyncStorage.setItem('@user_id', data.user_id)
          AsyncStorage.multiSet([
            ['@metric_data', JSON.stringify({})], 
            ['@fridge_data', JSON.stringify([])], 
            ['@shopping_list', JSON.stringify([])], 
            ['@saved_recipes', JSON.stringify([])],
            ['@owned_recipes', JSON.stringify([])],
            ['@food_groups', JSON.stringify(food_groups)],
            ['@all_foods', JSON.stringify(all_foods)]])
          this.props.navigation.replace('Root')
        } catch (e) {
          console.error(e)
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  async validateInputs() {
    let schema = yup.object().shape({
      name: yup.string().min(2, "Name is minimum 2 characters").max(30, "Name is max 30 characters").required("Name is required"),
      email: yup.string().email("Must be valid email").required("Email is required"),
      username: yup.string().min(5, "Username is minimum 5 characters").max(20, "Username is max 20 characters").required("Username is required"),
      password: yup.string().required("Password is required").matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
        "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character" ),
      confirm_password: yup.string().oneOf([yup.ref('new_password'), null], "Must match password").required("Confirm password is required")
    });

    return await schema.isValid({
      name: this.state.name,
      email: this.state.email,
      username: this.state.username,
      password: this.state.password,
      confirm_password: this.state.confirm_password
    }).then(valid => { return valid })
  }

  async signup() {
    await this.formikRef.current?.submitForm()
    this.setState({ loading: true })

    const valid = await this.validateInputs()

    if (!valid) {
      this.setState({ invalid: true, loading: false })
      return
    } else {
      await fetch('https://homemadeapp.azurewebsites.net/homemade/signup', {
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
            loading: false,
          })
        } else {
          this.setState({
            invalid: false,
          })
        }
      })
      .catch(error => {
        console.error(error);
        return
      });
    if (!this.state.invalid) await this.login()
  }
    
  }

  render() {
    return (
      <View style={styling.container}>
        <View style={styling.marginTop100}>
          <Text style={[{textAlign: 'center'}, styling.fontSize20]}>homemade</Text>
          {this.state.loading ? (<ActivityIndicator />) : (<View></View>)}

          <Formik 
            enableReinitialize
            initialValues={{
              email: this.state.email,
              name: this.state.name,
              username: this.state.username,
              password: this.state.password,
              confirm_password: this.state.confirm_password,
            }}
            innerRef={this.formikRef}
            onSubmit={(values, actions) => { this.setState({
              email: values.email,
              name: values.name,
              username: values.username,
              password: values.password,
              confirm_password: values.confirm_password
            }) 
            }}
            validationSchema={yup.object().shape({
              name: yup.string().min(2, "Name is minimum 2 characters").max(30, "Name is max 30 characters").required("Name is required"),
              email: yup.string().email("Must be valid email").required("Email is required"),
              username: yup.string().min(5, "Username is minimum 5 characters").max(20, "Username is max 20 characters").required("Username is required"),
              password: yup.string().required("Password is required").matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
                "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character" ),
              confirm_password: yup.string().oneOf([yup.ref('new_password'), null], "Must match password").required("Confirm password is required")
            })}
            render={({ values, errors, handleChange, handleBlur })=> (
              <View>
                <TextInput 
                  data-name='name'
                  value={values.name}
                  editable={!this.state.loading}
                  autoCapitalize='none'
                  placeholder="name"
                  placeholderTextColor='#696969'
                  style={[styling.accountScreenInputs, {textAlign: 'center'}]}
                  onChangeText={handleChange(`name`)}
                  onBlur={handleBlur(`name`)}
                  defaultValue={''} />
                <Text style={styling.errorMessageText}>{(this.state.invalid && errors.name) ? `${errors.name}` : ""}</Text>
                <TextInput 
                  data-name='email'
                  value={values.email}
                  editable={!this.state.loading}
                  autoCapitalize='none'
                  placeholderTextColor='#696969'
                  placeholder="email"
                  style={[styling.accountScreenInputs, {textAlign: 'center'}]}
                  onChangeText={handleChange(`email`)}
                  onBlur={handleBlur(`email`)}
                  defaultValue={''} />
                <Text style={styling.errorMessageText}>{(this.state.invalid && errors.email) ? `${errors.email}` : ""}</Text>
                <TextInput 
                  data-name='username'
                  secureTextEntry={true}
                  value={values.username}
                  editable={!this.state.loading}
                  autoCapitalize='none'
                  placeholder="username"
                  placeholderTextColor='#696969'
                  style={[styling.accountScreenInputs, {textAlign: 'center'}]}
                  onChangeText={handleChange(`username`)}
                  onBlur={handleBlur(`username`)}
                  defaultValue={''} />
                  <Text style={styling.errorMessageText}>{(this.state.invalid && errors.username) ? `${errors.username}` : ""}</Text>
                <TextInput 
                  data-name='password'
                  secureTextEntry={true}
                  value={values.password}
                  editable={!this.state.loading}
                  autoCapitalize='none'
                  placeholder="password"
                  placeholderTextColor='#696969'
                  style={[styling.accountScreenInputs, {textAlign: 'center'}]}
                  onChangeText={handleChange(`password`)}
                  onBlur={handleBlur(`password`)}
                  defaultValue={''} />
                  <Text style={styling.errorMessageText}>{(this.state.invalid && errors.password) ? `${errors.password}` : ""}</Text>
                <TextInput 
                  data-name='confirm_password'
                  secureTextEntry={true}
                  value={values.confirm_password}
                  editable={!this.state.loading}
                  autoCapitalize='none'
                  placeholder="confirm password"
                  placeholderTextColor='#696969'
                  style={[styling.accountScreenInputs, {textAlign: 'center'}]}
                  onChangeText={handleChange(`confirm_password`)}
                  onBlur={handleBlur(`confirm_password`)}
                  defaultValue={''} />
                  <Text style={styling.errorMessageText}>{(this.state.invalid  && errors.confirm_password) ? `${errors.confirm_password}` : ""}</Text>
              </View>
              )} />   
          <View style={styling.sectionBuffer}>
            <Button disabled={this.state.loading} title="signup" onPress={() => this.signup()}/>
          </View>
          <View style={styling.sectionBuffer}>
            <Button disabled={this.state.loading} title="back to login" onPress={() => this.props.navigation.navigate('LoginScreen')}/>
          </View>
          
        </View>
      </View>
    );
  }
}
