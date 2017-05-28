/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
} from 'react-native';

export default class OneVerse extends Component {
  render() {
    // const { navigate } = this.props.navigation;
    return (<Home />);
  }
}

AppRegistry.registerComponent('OneVerse', () => OneVerse);
