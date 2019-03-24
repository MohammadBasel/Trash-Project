import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import db from "../db.js"

import { Header, ListItem, Divider, Badge, Avatar, Card, Button, Icon } from "react-native-elements"

let bins = []
export default class Battery extends React.Component {
    static navigationOptions = {
        title: 'Battery',
        headerTintColor: 'white',
        headerStyle: { backgroundColor: 'blue', borderWidth: 1, borderBottomColor: 'white' },
        headerTitleStyle: { color: 'white' }
    };
    state = {
        trashs: [],
        zones: [],
    }
    // trashs = []
    // zones = []
    
    async componentDidMount() {
        await this.getZoneData()
        
    }
    getZoneData = async () => {
        db.collection("Zone")
            .onSnapshot(querySnapshot => {
                let zones = []
                let zoneId = 0
                querySnapshot.forEach(doc => {db.collection(`Zone/${doc.id}/Trash`).onSnapshot(querySnapshot => {
                  let trashs = []
                  zoneId = doc.id
                    querySnapshot.forEach(doc => {                    
                        trashs.push({ id: doc.id, ...doc.data() })
                    });
                    zones.push({id: zoneId, trashs})
                    this.setState({zones})
                })   
                });
            })
    }

    getData = async () => {
      let trashs = []
      let zones = []
      await this.setState({zones, trashs})
      console.log("new method", this.state.trashs)
  }
    Update = async (id,condition) => {
      let zoneid = 0
        db.collection("Zone")
            .onSnapshot(querySnapshot => {
                let zones = []
                querySnapshot.forEach(doc => {db.collection(`Zone/${doc.id}/Trash`).get().then(querySnapshot => {
                  zoneid = doc.id
                    querySnapshot.forEach(doc => {
                        if (doc.id == id ){
                          db.collection(`Zone/${zoneid}/Trash`).doc(doc.id).update({Battery: 100})
                        }
                    });
                })   
                });
                this.getZoneData()
            })

    }
    render() {
        // // console.log("zone length : ", this.state.zones.length)
        // // console.log("zone id1 : ", this.state.zones[0])
        // // console.log("zone id last : ", this.state.zones[this.state.zones.length -1])
        // console.log("final",this.state)
        // console.log("final this",this.trash)
        return (
            <ScrollView style={styles.container}>
            <View >
                 {
                    this.state.zones.map((item, i) => ( 
                      item.trashs.map((trash, j) => (
                        trash.Battery < 30 && (       
                            <ListItem
                                key={j}
                                title={`Battery Level: ${trash.Battery} Low`}
                                subtitle={`id: ${trash.id}`}
                                leftIcon={{ name: trash.icon }}
                                rightElement={<Text onPress={() => this.Update(trash.id, "fix")} style={{color: "blue"}}>Fix</Text>}
                                
                            />
                        )
                    ))
                  ))
                }
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 15,
        backgroundColor: '#fff',
    },
});
