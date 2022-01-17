import * as React from 'react';
import { ProfileParamList, RootStackParamList } from '../types'
import { RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, TextInput, ActivityIndicator } from 'react-native';
import { View, Text } from '../components/Themed';
import { styling } from '../style'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik, FieldArray, FormikProps } from 'formik'
import * as yup from 'yup'

type AccountScreenNavigationProp = CompositeNavigationProp<StackNavigationProp<ProfileParamList>, StackNavigationProp<RootStackParamList, 'Root'>>;
type AccountScreenRouteProp = RouteProp<ProfileParamList, 'AccountScreen'>;

interface Props {
  navigation: AccountScreenNavigationProp,
  route: AccountScreenRouteProp
}

interface State {
  isLoading: boolean
  updateLoading: boolean
  invalid: boolean
  token: string
  user_id: string
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
      isLoading: true,
      updateLoading: false,
      invalid: false,
      token: '',
      user_id: '',
      username: '',
      old_name: '',
      name: '', 
      old_password: '', 
      new_password: '',
      confirm_password: '',
    }

    this.logout = this.logout.bind(this)
    this.submit = this.submit.bind(this)
    this.IsLoadingRender = this.IsLoadingRender.bind(this)
  }

  async componentDidMount() {
    const setToken = await AsyncStorage.getItem('@token')
    const setUserID = await AsyncStorage.getItem('@user_id')
    if (setToken && setUserID) {
      this.setState({
        token: setToken,
        user_id: setUserID,
      })
    }

    await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_user/${this.state.user_id}`, {
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
            isLoading: false,
          })
         })
        .catch(error => {
        console.error(error);
      });
  }

  async logout() {
    try {
      await AsyncStorage.removeItem('@token')
      .then(() => { AsyncStorage.removeItem('@user_id') })
      .then(() => { AsyncStorage.removeItem('@metric_data') })
      .then(() => { AsyncStorage.removeItem('@fridge_data') })
      .then(() => { AsyncStorage.removeItem('@shopping_list') })
      .then(() => { AsyncStorage.removeItem('@saved_recipes') })
      .then(() => { AsyncStorage.removeItem('@owned_recipes') })
      .then(() => { this.props.navigation.replace('Auth') })
    } catch (e) {
      console.error(e)
    }
  }

  async verifySubmit() {
    let is_valid = false
    if (this.state.name !== this.state.old_name) {
      let schema = yup.object().shape({
        name: yup.string().min(2).max(30).required(),
      });
      await schema.isValid({name: this.state.name}).then(valid => { 
        if (valid) is_valid = true 
        else is_valid = false
      })
    }

    if (!is_valid) return false

    if (this.state.new_password !== '' && this.state.confirm_password === this.state.new_password) {
      let schema = yup.object().shape({
        new_password: yup.string().min(10).required(),
      });
      await schema.isValid({name: this.state.name}).then(valid => { 
        if (valid) is_valid = true 
        else is_valid = false
      })
    }
    if (is_valid) return true
    else return false
  }

  async submit() {
    await this.formikRef.current?.submitForm()
    await this.formikRef2.current?.submitForm()
    await this.setState({ updateLoading: true })

    let valid = await this.verifySubmit()
    if (!valid) {
      await this.setState({ updateLoading: false, invalid: true })
      return
    } else {
      this.setState({ invalid: false })
    }

    if (this.state.name !== this.state.old_name) {
      await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_user/${this.state.user_id}`, {
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
      await fetch(`https://homemadeapp.azurewebsites.net/homemade/change_password`, {
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
    this.setState({ updateLoading: false })
  }

  IsLoadingRender() {
    return (
      <View style={styling.container}>
        <ActivityIndicator />
      </View>
    )
  }

  render() {
    if (this.state.isLoading) return this.IsLoadingRender()

    return (
      <View style={styling.container}>
        {(this.state.updateLoading) ? (<ActivityIndicator/>) : (<View></View>)}
        <View>
          <Formik 
            enableReinitialize
            initialValues={{name: ""}}
            innerRef={this.formikRef}
            onSubmit={(values, actions) => { this.setState({name: values.name}) }}
            validationSchema={yup.object().shape({
              name: yup.string().min(2, "Must be at least 2 characters").max(30, "Max of 30 characters"),
            })}
            validateOnBlur
            render={({ values, errors, touched, handleChange, handleBlur })=> (
              <View>
                <TextInput 
                  data-name='name'
                  value={values.name}
                  placeholder={this.state.name}
                  placeholderTextColor='#696969'
                  style={styling.accountScreenInputs}
                  onChangeText={handleChange(`name`)}
                  onBlur={handleBlur(`name`)} />
                <Text style={[styling.errorMessageText, {textAlign:'left'} ]}>{(this.state.invalid && touched && errors.name) ? `${errors.name}` : ""}</Text>
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
            validationSchema={yup.object().shape({
              old_password: yup.string().required("Old password is required"),
              new_password: yup.string().required("Password is required").matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
                "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character" ),
              confirm_password: yup.string().min(10).oneOf([yup.ref('new_password'), null], "Must match password").required("Confirmation password is required")
            })}
            render={({ values, errors, handleChange, handleBlur })=> 
            {
            let touched = (values.old_password !== '' || values.new_password !== '' || values.confirm_password !== '')
            return (
              <View>
                <TextInput 
                  data-name='old_password'
                  secureTextEntry={true}
                  value={values.old_password}
                  placeholder="Verify Old Password"
                  placeholderTextColor='#696969'
                  style={styling.accountScreenInputs}
                  onChangeText={handleChange(`old_password`)}
                  onBlur={handleBlur(`old_password`)}
                  defaultValue={''} />
                <Text style={[styling.errorMessageText, {textAlign:'left'} ]}>{(this.state.invalid && touched && errors.old_password) ? `${errors.old_password}` : ""}</Text>
                <TextInput 
                  data-name='new_password'
                  secureTextEntry={true}
                  value={values.new_password}
                  placeholder="New Password"
                  placeholderTextColor='#696969'
                  style={styling.accountScreenInputs}
                  onChangeText={handleChange(`new_password`)}
                  onBlur={handleBlur(`new_password`)}
                  defaultValue={''} />
                <Text style={[styling.errorMessageText, {textAlign:'left'} ]}>{(this.state.invalid && touched && errors.new_password) ? `${errors.new_password}` : ""}</Text>
                <TextInput 
                  data-name='confirm_password'
                  secureTextEntry={true}
                  value={values.confirm_password}
                  placeholder="Confirm New Password"
                  placeholderTextColor='#696969'
                  style={styling.accountScreenInputs}
                  onChangeText={handleChange(`confirm_password`)}
                  onBlur={handleBlur(`confirm_password`)}
                  defaultValue={''} />
                  <Text style={[styling.errorMessageText, {textAlign:'left'} ]}>{(this.state.invalid && touched && errors.confirm_password) ? `${errors.confirm_password}` : ""}</Text>
              </View>
              )}}
              />
        </View>
        <Button title="Edit Account Info" disabled={this.state.updateLoading} onPress={() => this.submit()} />
        <View style={styling.SectionBuffer}>
        <Button title="logout" disabled={this.state.updateLoading} onPress={() => this.logout()} />
        </View>
      </View>
    );
  }
}
