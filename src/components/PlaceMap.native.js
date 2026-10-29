import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { mapHtml } from './mapHtml';
export default function PlaceMap({ points = [], ordered = false }) {
  return <View style={{ height: 280, borderRadius: 16, overflow: 'hidden', marginVertical: 16 }}><WebView originWhitelist={['*']} source={{ html: mapHtml(points, { ordered }) }} javaScriptEnabled /></View>;
}


