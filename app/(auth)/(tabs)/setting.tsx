import { View, Text, TextInput, Button, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const TEST_USER_ID = 'test-user-1'

const Setting = () => {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadInfo()
  }, [])

  const loadInfo = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .single()

    if (data) setName(data.name)
    if (error) console.log('Load error (ok if first time):', error.message)
  }

  const saveInfo = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .upsert({ user_id: TEST_USER_ID, name: name })

    setLoading(false)
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('Saved!', 'Your info was saved.')
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Setting</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />

      <Button title={loading ? 'Saving...' : 'Save'} onPress={saveInfo} disabled={loading} />
    </View>
  )
}

export default Setting