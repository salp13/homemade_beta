import * as React from 'react';
import { StyleSheet } from 'react-native';
// import { SearchBar } from 'react-native-elements';

import { Text, View, SearchBar } from '../components/Themed';
import { HeaderBackground } from '@react-navigation/stack';

export default class HomeScreen extends React.Component {
  state = {
    search: '',
  };

  updateSearch = (search?: string) => {
    this.setState({ search });
  };

  render() {
    const { search } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Hello!</Text>
        <Text style={styles.title}>Which ingredients would you like to use today?</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <SearchBar
          searchIcon={{ size: 24 }}
          placeholder="Find an ingredient to use..."
          onChangeText={this.updateSearch}
          showCancel
          value={search}
          containerStyle={styles.searchBarContainerStyle}
          inputContainerStyle={styles.searchBarInputContainerStyle}
          inputStyle={styles.searchBarTextStyle}
        />
      </View>
    );
  }
}

// export default function HomeScreen() {
//   return (
//     <View style={styles.container}>
//       <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
//     </View>
//   );
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 65,
    paddingLeft: 20,
    paddingRight:20,
  },
  title: {
    fontSize: 30,
    textAlign: 'left',
    paddingRight: 80,
  },
  separator: {
    marginVertical: 10,
    height: 1,
  },
  searchBarContainerStyle: {
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
  },
  searchBarInputContainerStyle: {
    height: 35,
  },
  searchBarTextStyle: {
    fontSize: 15,
    left: -10,
  },
});
