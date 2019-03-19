import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import db from "../db.js"

import { Header, ListItem, Divider, Badge, Avatar, Card, Button, Icon } from "react-native-elements"

export default class MaintenanceScreen extends React.Component {
    static navigationOptions = {
        title: 'Maintenance Dashboard',
        headerTintColor: 'white',
        headerStyle: { backgroundColor: 'blue', borderWidth: 1, borderBottomColor: 'white' },
        headerTitleStyle: { color: 'white' }
    };
    state = {
        trashs: [],
        zones: [],
        totaldamageTrash: 0,
        totalProTrash: 0,
        totallowbattery: 0
    }
    trashs = []
    componentDidMount() {
        db.collection("Zone")
            .onSnapshot(querySnapshot => {
                let zones = []
                querySnapshot.forEach(doc => {
                    zones.push({ id: doc.id, ...doc.data() })
                    // let trash = [...this.state.trash]
                    // console.log("zoneid", doc.id)
                    // db.collection(`Zone/${doc.id}/Trash`)
                    //     .get().then(querySnapshot => {
                    //         querySnapshot.forEach(doc => {
                    //             trash.push({ id: doc.id, ...doc.data() })
                    //         });
                    //         this.setState({ trash }, console.log("Current trash : ", this.state.trash[this.state.trash.length - 1]))
                    //     })
                    this.getTrashData(doc.id)

                });
                // this.count()
                this.setState({ zones })

                // console.log("Current zones : ", zones)

            })

    }
    getTrashData = async (id) => {
        let trashs = [...this.trashs]
        // console.log("Current trash 1 : ", this.state.trashs[0])
        // console.log("Current trash last : ", this.state.trashs[this.state.trashs.length - 1])
        db.collection(`Zone/${id}/Trash`)
            .get().then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    trashs.push({ id: doc.id, ...doc.data() })
                });
                this.setState({ trashs }, console.log("trash id : ", this.trashs[0]))
                this.count()
            })
    }
    count = async () => {
        totaldamageTrash = this.state.totaldamageTrash
        totalProTrash = this.state.totalProTrash
        totallowbattery = this.state.totallowbattery
        console.log("damage bahir : ", this.state.totaldamageTrash)
        console.log("trash bahir : ", this.state.trashs.length)
        for (let i = 0; this.state.trashs.length - 1; i++) {
            // console.log("trash id  : ", this.state.trashs[i].id)
            if (this.state.trashs[i].Status == 'Damaged') {
                await this.setState({ totaldamageTrash: this.state.totaldamageTrash + 1 })
                console.log("damage : ", this.state.totaldamageTrash)
            } else if (this.state.trashs[i].Status == 'Process') {
                await this.setState({ totalProTrash: this.state.totalProTrash + 1 })
            }
            if (this.state.trashs[i].Battery < 30) {
                await this.setState({ totallowbattery: this.state.totallowbattery + 1 })
            }
        }
    }


    render() {
        // console.log("Current trash render : ", this.state.trashs[this.state.trashs.length - 1])
        // console.log("damage : ", this.state.totaldamageTrash)
        // console.log("processing : ", this.state.totalProTrash)
        // console.log("lowbattery : ", this.state.totallowbattery)

        return (
            <ScrollView style={styles.container}>
                {/* <Header
                    leftComponent={{ icon: 'menu', color: '#fff' }}
                    centerComponent={{ text: 'MY TITLE', style: { color: '#fff' } }}
                    rightComponent={{ icon: 'home', color: '#fff' }}
                /> */}
                <View>

                </View>
                <View>
                    <View>
                        <Card title="Damage Trash">
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                               <View><Text>Damaged Trash: {this.state.totaldamageTrash}</Text></View>
                            </View>
                        </Card>
                    </View>
                    <View>
                        <Card title="Low Battery">
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <Text></Text>
                            </View>
                        </Card>
                    </View>
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
