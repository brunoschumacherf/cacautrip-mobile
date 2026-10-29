import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocalizedText as Text, useLanguage } from '../../i18n';
import { colors, fonts } from '../../theme/tokens';

const photos = [
  { source: require('../../../assets/images/home/banner-praia.jpeg'), ratio: 739 / 415 },
  { source: require('../../../assets/images/home/gastronomia-01.jpeg'), ratio: 547 / 365 },
  { source: require('../../../assets/images/home/gastronomia-02.jpeg'), ratio: 1 },
  { source: require('../../../assets/images/home/gastronomia-03.jpeg'), ratio: 399 / 501 },
  { source: require('../../../assets/images/home/gastronomia-04.jpeg'), ratio: 1 },
  { source: require('../../../assets/images/home/gastronomia-05.jpeg'), ratio: 387 / 516 },
];

export default function DestinationBanners({ onExploreRegion }) {
  const { t } = useLanguage();
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState(0);
  const [ratios, setRatios] = useState({});
  const ratio = ratios[selected] || photos[selected].ratio;
  const displayWidth = width ? Math.min(width, (width >= 760 ? 560 : 480) * ratio) : 0;
  const displayHeight = displayWidth / ratio;
  const separateCaption = selected === 0 && displayHeight < 330;
  const bannerCopy = <View style={styles.content}>
    <Text style={styles.eyebrow}>SINTA A BAHIA</Text>
    <Text style={[styles.title, width >= 760 && { fontSize: 44, lineHeight: 49 }]}>Viva a Costa do Cacau</Text>
    <Text style={styles.description}>Praias, história e paisagens para descobrir no seu próximo passeio.</Text>
    <Pressable accessibilityRole="button" onPress={onExploreRegion} style={styles.cta}><Text style={styles.ctaText}>Explorar a região</Text><Ionicons name="arrow-forward" size={18} color={colors.brown} /></Pressable>
  </View>;
  const thumbnailSize = Math.min(112, Math.max(68, (width - 50) / 6));
  return <View style={styles.section} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
    <View style={[styles.stage, { width: displayWidth || '100%' }]}>
      <View style={[styles.frame, { width: '100%', aspectRatio: ratio }]}>
        <Image key={selected} source={photos[selected].source} resizeMode="contain" style={StyleSheet.absoluteFillObject}
          onLoad={({ nativeEvent }) => {
            const image = nativeEvent.source;
            if (image?.width > 0 && image?.height > 0) {
              const actual = image.width / image.height;
              setRatios(previous => previous[selected] === actual ? previous : { ...previous, [selected]: actual });
            }
          }}
          accessibilityLabel={selected === 0 ? t('Mar, praia e coqueiros na Costa do Cacau') : `${t('Foto ampliada')} ${selected}`} />
        {selected === 0 ? <>
          {!separateCaption && <View pointerEvents="none" style={styles.shade} />}
          <View style={styles.location}><Ionicons name="location-outline" size={14} color={colors.white} /><Text style={styles.locationText}>COSTA DO CACAU · BAHIA</Text></View>
          {!separateCaption && <View style={styles.copyOverlay}>{bannerCopy}</View>}
        </> : <Pressable accessibilityRole="button" accessibilityLabel={t('Voltar ao banner')} onPress={() => setSelected(0)} style={styles.back}><Ionicons name="close" size={18} color={colors.brown} /><Text style={styles.backText}>Voltar ao banner</Text></Pressable>}
      </View>
      {separateCaption && bannerCopy}
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnails}>
      {photos.map((photo, index) => <Pressable key={index} accessibilityRole="button" accessibilityLabel={index === 0 ? t('Voltar ao banner') : `${t('Ampliar foto')} ${index}`} accessibilityState={{ selected: selected === index }} onHoverIn={() => setSelected(index)} onPress={() => setSelected(index)} style={({ pressed }) => [styles.thumbnail, { width: thumbnailSize, height: thumbnailSize }, selected === index && styles.thumbnailSelected, pressed && { opacity: 0.8 }]}>
        <Image source={photo.source} resizeMode="contain" style={styles.thumbnailImage} />
      </Pressable>)}
    </ScrollView>
    <Text style={styles.hint}>Toque ou passe o mouse nas fotos para ampliar.</Text>
  </View>;
}
const styles = StyleSheet.create({
  section: { marginTop: 12, marginBottom: 26 },
  stage: { alignSelf: 'center', maxWidth: '100%', borderRadius: 26, overflow: 'hidden', backgroundColor: colors.green },
  frame: { position: 'relative' },
  copyOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0 },

  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: '#092B354D' },
  location: { flexDirection: 'row', alignItems: 'center', gap: 5, position: 'absolute', top: 16, left: 16, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#123F4BCC', borderRadius: 24 },
  locationText: { color: colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  content: { backgroundColor: '#0D29279C', padding: 24, gap: 10, alignItems: 'flex-start' },
  eyebrow: { color: '#F7D5A7', fontFamily: fonts.body, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  title: { color: colors.white, fontFamily: fonts.heading, fontWeight: '800', fontSize: 32, lineHeight: 37, letterSpacing: -0.8, maxWidth: 620 },
  description: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: '#FFF9ED', maxWidth: 430 },
  cta: { marginTop: 6, minHeight: 44, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 18, backgroundColor: colors.background },
  ctaText: { color: colors.brown, fontWeight: '800', fontSize: 12 },
  back: { position: 'absolute', top: 14, right: 14, backgroundColor: '#FFFCF8F2', minHeight: 40, paddingHorizontal: 12, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: colors.brown, fontSize: 11, fontWeight: '700' },
  thumbnails: { gap: 10, paddingTop: 13, paddingBottom: 4, flexGrow: 1, justifyContent: 'center' },
  thumbnail: { padding: 3, borderWidth: 2, borderColor: 'transparent', borderRadius: 14, backgroundColor: colors.secondary, overflow: 'hidden' },
  thumbnailSelected: { borderColor: colors.orange, backgroundColor: colors.paper },
  thumbnailImage: { width: '100%', height: '100%', borderRadius: 8 },
  hint: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 6 },
});
