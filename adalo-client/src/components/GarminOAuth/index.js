import React, { Component } from 'react'
import {  View, StyleSheet } from 'react-native'
import { GarminOAuthComponent } from './GarminOAuthComponent'


class GarminOAuth extends Component {
	render() {
		return (
			<View style={styles.wrapper}>
				<GarminOAuthComponent {...this.props } />
			</View>
		)
	}
}

const styles = StyleSheet.create({
	wrapper: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	}
})

export default GarminOAuth
