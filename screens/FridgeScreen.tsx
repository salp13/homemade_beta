import * as React from 'react';
import { StyleSheet, FlatList, ActivityIndicator, Platform} from 'react-native';

import { Text, View, SearchBar } from '../components/Themed';

interface Props {}

interface State {
  isLoading: boolean
  search: string
  allFood: Array<any>
  fridgeItems: Array<any>
}

interface Arrayholder {
  arrayholder: Array<any>
}

export default class FridgeScreen extends React.Component<Props, State, Arrayholder> {
  arrayholder: Array<any> = [];

  constructor(props?: any) {
    super(props);
    //setting default state
    this.state = { 
      isLoading: true, 
      search: '',
      allFood: [],
      fridgeItems: [],
    };
    this.arrayholder = [];
  }
  componentDidMount() {
    this.setState(
      {
        isLoading: false,
        allFood: [
          {title: "cauliflower"},
          {title: "pasta"},
          {title: "tomato paste"},
          {title: "bell pepper"}
        ]
      }
    )

    // TODO: query for all foods
    return fetch('https://jsonplaceholder.typicode.com/posts')
      .then(response => response.json())
      .then(data => {
        this.setState(
          {
            isLoading: false,
            allFood: data,
          },
          () => {
            this.arrayholder = data;
          }
        );
      })
      .catch(error => {
        console.error(error);
      });
  }

  search = (text: string) => {
    console.log(text);
  };

  // clear = () => {
  //   this.search.clear();
  // };

  SearchFilterFunction(text: string = '') {
    //passing the inserted text in textinput
    const filteredData = this.arrayholder.filter(function(item: any) {
      //applying filter for the inserted text in search bar
      const itemData = item.title ? item.title.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });

    this.setState({
      //setting the filtered newData on datasource
      //After setting the data it will automatically re-render the view
      allFood: filteredData,
      search: text,
    });
  }

  ListViewItemSeparator = () => {
    //Item sparator view
    return (
      <View
        style={{
          height: 0.3,
          width: '90%',
        }}
      />
    );
  };

  render() {
    if (this.state.isLoading) {
      //Loading View while data is loading
      return (
        <View style={{ flex: 1, paddingTop: 20 }}>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      //ListView to show with textinput used as search bar
      <View style={styles.container}>
        <SearchBar
          onChangeText={text => this.SearchFilterFunction(text)}
          onClear={this.SearchFilterFunction}
          value={this.state.search}
          placeholder="Find an ingredient to use..."
          autoCorrect={false}
          platform={Platform.OS === "android" || Platform.OS === "ios" ? Platform.OS : "default"}
          showCancel
          containerStyle={styles.searchBarContainerStyle}
          inputContainerStyle={styles.searchBarInputContainerStyle}
          inputStyle={styles.searchBarTextStyle}
        />
        <FlatList
          data={this.state.allFood}
          ItemSeparatorComponent={this.ListViewItemSeparator}
          //Item Separator View
          renderItem={({ item }) => (
            // Single Comes here which will be repeatative for the FlatListItems
            <Text>{item.title}</Text>
          )}
          style={{ marginTop: 10 }}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  }
}

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
  },
});