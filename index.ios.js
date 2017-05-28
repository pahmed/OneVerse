/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import Images from './src/images.js';
import RNAudioStreamer from 'react-native-audio-streamer';
import { StackNavigator } from 'react-navigation';
import { takeSnapshot } from "react-native-view-shot";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableHighlight,
  Image,
  DeviceEventEmitter,
  Share,
  ActivityIndicator
} from 'react-native';

export default class OneVerse extends Component {

  constructor(props) {
    super(props)
    this.state = {
      arabicVerse: "",
      englishVerse: "",

      arabicVerseName: "",
      englishVerseName: "",

      ma3ani: "",

      audioUrl: "",

      isPlaying: false,
      isLoading: false,
      isSharing: false,
    }

    this.playVerse = this.playVerse.bind(this);
    this.share = this.share.bind(this)
    this.shareURL = this.shareURL.bind(this)
  }

  render() {
    // const { navigate } = this.props.navigation;
    return (

      <View style={styles.container}>
      <Image source={Images.background} ref='image' style={styles.background}>
        {this._header()}
        <ScrollView ref='scrollView' collapsable={false} style={{flex: 1, marginTop: 8}}>
          {this._versesView()}
        </ScrollView>
        {this._actions()}
      </Image>
    </View>
    );
  }

  _versesView() {
    if (this.state.isLoading) {
      return <ActivityIndicator
        animating={true}
        style={[styles.activityIndicator]}
        size="large"
        color="white"
      />
    } else {
      return (
      <ScrollView ref='scrollView' collapsable={false} style={{flex: 1}}>
        <View ref='v' collapsable={false} style={styles.verseContainer}>
          <Text style={styles.arabicVerse}>{this.state.arabicVerse}</Text>

          <View style={styles.separator} />

          <Text style={styles.verseName}>{this.state.arabicVerseName}</Text>

          <View style={styles.separator} />

          <Text style={styles.ma3ani}>{this.state.ma3ani}</Text>
        </View>

        <View style={styles.verseContainer}>
          <Text style={styles.englishVerse}>{this.state.englishVerse}</Text>

          <View style={styles.separator} />

          <Text style={styles.verseName}>{this.state.englishVerseName}</Text>

        </View>
      </ScrollView>
      )
    }
  }

  _header() {
    if (!this.state.isSharing) {
      return <View style={styles.header}>
          <TouchableHighlight style={styles.shareButton} onPress={this.share}>
            <Text style={styles.buttonText}>Share</Text>
          </TouchableHighlight>
        </View>
    } else {
      return
       <View style={styles.header}>      
      </View>
    }
  }

  _actions() {
    if (!this.state.isSharing && !this.state.isLoading) {
      return <View style={styles.actionsContainer}>
          <TouchableHighlight title='Play' onPress={this.playVerse} style={styles.playButton}>
            <Text style={styles.buttonText}>{this.state.isPlaying ? "Stop" : "Play"}</Text>
          </TouchableHighlight>

          <TouchableHighlight title='Play' onPress={() => {}} style={styles.readItButton}>
            <Text style={styles.buttonText}>I read it</Text>
          </TouchableHighlight>
        </View>
    } else {
      return <View />
    }
  }

  componentDidMount() {
    this._loadVerse()
    this.subscription = DeviceEventEmitter.addListener('RNAudioStreamerStatusChanged',this._statusChanged.bind(this))
  }

  _today() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    today = dd+'-'+mm+'-'+yyyy;

    console.log("today: " + today)

    return today
  }

  _linkForToday() {
    let url = 'https://one-verse-1d343.firebaseio.com/'+this._today()+'.json'

    console.log("url::: " + url)

    return url
  }

  _loadVerse() {
    console.log("verse link for today: " + this._linkForToday())
    this.setState({
      isLoading: true
    })
    fetch(this._linkForToday())
      .then((response) => response.json())
      .then((json) => {
        console.log("response json: " + json)
        this.setState({
          arabicVerse: json.ar,
          englishVerse: json.en,
          ma3ani: json.ma3ani,
          arabicVerseName: json.nameAr,
          englishVerseName: json.nameEn,
          audioUrl: json.audioUrl,
          isLoading: false
        })
      })
      .catch((error) => {
        console.error(error);
        this.setState({
          isLoading: false
        })
      });
  }

  _statusChanged(status) {
    console.log("status:" + status)

      switch (status) {
        case 'STOPPED':
        case 'FINISHED':
        case 'ERROR':
          this.setState({isPlaying: false});
          break;
      
        case 'PLAYING':
        case 'BUFFERING':
          this.setState({isPlaying: true});
          break;

        default:
          break;
      }
  }

  playVerse() {
    console.log("Playverse")

    if (this.state.isPlaying) {
      this.setState({isPlaying: false})
      RNAudioStreamer.pause()
    } else {
      this.setState({isPlaying: true})
      let url = this.state.audioUrl;
      RNAudioStreamer.setUrl(url)
      RNAudioStreamer.play()
      
    }

  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  share() {

    console.log('refs ' + this.refs)

    this.setState({isSharing: true})
    setTimeout(() => {
      takeSnapshot(this.refs.image, {
      format: "jpeg",
      quality: 1
    })
    .then(
      uri => this.shareURL(uri),
      error => {
        console.error("Oops, snapshot failed", error)
        this.setState({isSharing: false})
      }
    );
    }, 300)


  //   let url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAMAAAANIilAAAAAQlBMVEUAAABEREQ9PT0/Pz8/Pz9AQEA7OzszMzM/Pz8/Pz9FRUU/Pz8/Pz9VVVUAAAA/Pz8+Pj4/Pz8/Pz9BQUFAQEA/Pz+e9yGtAAAAFnRSTlMAD5bv9KgaFJ/yGv+zAwGltPH9LyD5QNQoVwAAAF5JREFUSMft0EkKwCAQRFHHqEnUON3/qkmDuHMlZlVv95GCRsYAAAD+xYVU+hhprHPWjDy1koJPx+L63L5XiJQx9PQPpZiOEz3n0qs2ylZ7lkyZ9oyXzl76MAAAgD1eJM8FMZg0rF4AAAAASUVORK5CYII='
  }

  shareURL(url) {
    this.setState({isSharing: false})
    Share.share({
      url: url
    })
  }
}

const styles = StyleSheet.create({
  container: {
    // marginTop: 20,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    // backgroundColor: 'yellow',
    flexDirection: 'column'
  },
  header: {
    height: 68,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    // width: 380
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
    marginBottom: 8
  },
  verseContainer: {
    margin: 8,
    padding: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  actionsContainer: {
    margin: 8,
    flexDirection: 'row',
    borderRadius: 8,
    height: 60,
    justifyContent: 'space-around',
    alignItems: 'center',
    // width: 300,
    // backgroundColor: 'white'
  },
  verseName: {
    textAlign: 'center',
    color: 'white'
  },
  ma3ani: {
    textAlign: 'right',
    color: 'white'
  },
  arabicVerse: {
    textAlign: 'right',
    fontSize: 20,
    marginBottom: 0,
    color: 'white'
  },
  englishVerse: {
    textAlign: 'left',
    fontSize: 20,
    color: 'white'
  },
  playButton: {
    marginRight: 20,
    marginLeft: 20,
    height: 50,
    width: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#f05d52',
    alignItems: 'center',
    justifyContent: 'center'
  },
  readItButton: {
    flex: 4,
    height: 50,
    marginRight: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#f05d52',
    alignItems: 'center',
    justifyContent: 'center'
    // color: '#f05d52'
  },
  shareButton: {
    marginRight: 20,
    marginTop: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
  },
  activityIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2,

    height: 400,
  }
});

AppRegistry.registerComponent('OneVerse', () => OneVerse);
