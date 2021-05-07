import React, { useEffect, useState } from 'react'
import { Button, Linking, Platform } from 'react-native'

export function GarminOAuthComponent({ request_url, authorize_url, access_url, token, token_secret, verifier, onSuccessRequest, onSuccessAccess, onError, ...rest }) {
  const [oauthToken, setOAuthToken] = useState('')
  useEffect(() => {
    console.log(oauthToken)
    if (oauthToken) {
      onSuccessRequest(oauthToken.oauth_token, oauthToken.oauth_token_secret)
      // https://connect.garmin.com/oauthConfirm
      if (Platform.OS === 'web') {
        window.open(`${authorize_url}?oauth_token=${oauthToken.oauth_token}&oauth_token_secret=${oauthToken.oauth_token_secret}`)
      } else {
        Linking.openURL(`${authorize_url}?oauth_token=${oauthToken.oauth_token}&oauth_token_secret=${oauthToken.oauth_token_secret}`)
      }
    }
  }, [oauthToken])
  
  const getFinal = async () => {
    try {
      const final = await fetch(`${access_url}?token=${token}&token_secret=${token_secret}&verifier=${verifier}`, {
        method: 'GET'
      })

      const reply = await final.text()
      const parts = JSON.parse(reply)
      onSuccessAccess(parts.oauth_token, parts.oauth_token_secret)
    } catch (e) {
      onError()
    }
  }

  useEffect(() => {
    if (!rest.editor) {
      if (verifier) {
        getFinal()
      }
    }
  }, [verifier])


  return (
    <>
    <Button title="Garmin Connect" color="#000000" onPress={async () => {
      try {
        const response = await fetch(request_url, {
          method: 'GET'
        }) 
        const reply = await response.text()
        console.log(reply)
        setOAuthToken(JSON.parse(reply))
      } catch (error) {
        console.error(error)
      }
    }} />
    </>
  )
}