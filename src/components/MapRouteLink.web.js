import React from 'react';
import { colors, fonts } from '../theme/tokens';
export default function MapRouteLink({ action }) {
  return React.createElement('a', { href: action.url, target: '_blank', rel: 'noopener noreferrer', style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px 18px', marginTop: 10, borderRadius: 14, backgroundColor: colors.orange, color: colors.white, textDecoration: 'none', fontFamily: fonts.body, fontSize: 14, fontWeight: 800, textAlign: 'center', cursor: 'pointer' } }, action.label);
}
