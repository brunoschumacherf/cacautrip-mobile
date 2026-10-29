import React from 'react';
import { Image } from 'react-native';
export default function BrandLogo({ size = 38 }) {
  return <Image source={require('../../assets/brand/cacautrip.png')} accessibilityLabel="Cacau Trip" resizeMode="contain" style={{ width: size, height: size, borderRadius: size * 0.24 }} />;
}
