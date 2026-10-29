import { Platform } from 'react-native';

// Identidade visual CACAU TRIP. Apenas tokens de apresentação.
export const colors = {
  background: '#FBF5EB', paper: '#FFFCF8', orange: '#E96108', orangeHover: '#BF4900',
  brown: '#391E16', muted: '#786257', line: '#EADFD1', green: '#176346',
  secondary: '#F2E7D7', peach: '#FFF0DC', success: '#E1EFE3', danger: '#B6412D',
  dangerSurface: '#FAE9E2', white: '#FFFFFF', placeholder: '#A18C7D',
};
export const fonts = {
  heading: Platform.select({ web: 'Inter, system-ui, sans-serif', ios: 'System', default: 'sans-serif' }),
  body: Platform.select({ web: 'Manrope, system-ui, sans-serif', ios: 'System', default: 'sans-serif' }),
};
export const ct = {
  text: { fontFamily: fonts.body, color: colors.brown, fontSize: 14, lineHeight: 22 },
  heading: { fontFamily: fonts.heading, color: colors.brown, fontWeight: '800' },
};
