import React, { useRef, useState } from 'react';
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
  const wide = width >= 680;
  const ratio = ratios[selected] || photos[selected].ratio;

  // A moldura permanece estável para o hover não mover a faixa de miniaturas.
  // A fotografia preserva sua proporção dentro dessa área responsiva.
  const stageHeight = width ? Math.min(wide ? 440 : 340, width * (wide ? 0.56 : 0.9)) : 260;
  const fittedWidth = Math.min(width, stageHeight * ratio);
  const fittedHeight = fittedWidth / ratio;
  const thumbnailWidth = wide ? 82 : 62;
  const strip = useRef(null);
  const select = (index, scroll = false) => {
    const target = (index + photos.length) % photos.length;
    setSelected(target);
    if (scroll) strip.current?.scrollTo({ x: Math.max(0, target * (thumbnailWidth + 10) - (width - thumbnailWidth) / 2), animated: true });
  };

  return <View style={styles.section} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
    <View style={[styles.headingRow, wide && styles.headingRowWide]}>
      <View style={styles.headingCopy}>
        <View style={styles.destination}><View style={styles.destinationDot} /><Text style={styles.eyebrow}>COSTA DO CACAU · BAHIA</Text></View>
        <Text style={[styles.title, wide && styles.titleWide]}>Viva a Costa do Cacau</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={t('Explorar a região')} onPress={onExploreRegion} style={({ pressed }) => [styles.explore, wide && styles.exploreWide, pressed && styles.pressed]}>
        {wide && <Text style={styles.exploreText}>Explorar a região</Text>}<Ionicons name="arrow-forward" size={19} color={colors.white} />
      </Pressable>
    </View>

    <View style={[styles.gallery, { height: stageHeight }]}>
      <Image source={photos[selected].source} blurRadius={24} resizeMode="cover" style={StyleSheet.absoluteFillObject} accessible={false} />
      <View pointerEvents="none" style={styles.backdrop} />
      <View style={[styles.photoFrame, { width: fittedWidth || '100%', height: fittedHeight || stageHeight }]}>
        <Image key={selected} source={photos[selected].source} resizeMode="contain" style={StyleSheet.absoluteFillObject}
          onLoad={({ nativeEvent }) => {
            const image = nativeEvent.source;
            if (image?.width > 0 && image?.height > 0) {
              const actual = image.width / image.height;
              setRatios(previous => previous[selected] === actual ? previous : { ...previous, [selected]: actual });
            }
          }}
          accessibilityLabel={selected === 0 ? t('Mar, praia e coqueiros na Costa do Cacau') : `${t('Foto ampliada')} ${selected}`} />
      </View>
    </View>

    <View style={[styles.toolbar, wide && styles.toolbarWide]}>
      <View style={styles.photoInfo}><Ionicons name="images-outline" size={14} color={colors.muted} /><Text style={styles.counter}>{String(selected + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</Text></View>
      <View style={styles.navigation}>
        {selected !== 0 && <Pressable accessibilityRole="button" onPress={() => select(0)} style={styles.return}><Text style={styles.returnText}>Foto principal</Text></Pressable>}
        <Pressable accessibilityRole="button" accessibilityLabel={t('Foto anterior')} onPress={() => select(selected - 1, true)} style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}><Ionicons name="chevron-back" size={18} color={colors.brown} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Próxima foto')} onPress={() => select(selected + 1, true)} style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}><Ionicons name="chevron-forward" size={18} color={colors.brown} /></Pressable>
      </View>
    </View>

    <View style={styles.stripFrame}>
      <ScrollView ref={strip} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.thumbnails, wide && styles.thumbnailsWide]}>
        {photos.map((photo, index) => <Pressable key={index} accessibilityRole="button" accessibilityLabel={index === 0 ? t('Foto principal') : `${t('Ampliar foto')} ${index}`} accessibilityState={{ selected: selected === index }} onHoverIn={() => select(index)} onFocus={() => select(index)} onPress={() => select(index)} style={({ pressed }) => [styles.thumbnail, { width: thumbnailWidth, height: thumbnailWidth }, selected === index && styles.thumbnailSelected, pressed && styles.pressed]}>
          <Image source={photo.source} resizeMode="contain" style={styles.thumbnailImage} />
          {selected === index && <View style={styles.selectionBar} />}
        </Pressable>)}
      </ScrollView>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  section: { marginTop: 12, marginBottom: 26, borderRadius: 24, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  headingRow: { paddingHorizontal: 16, paddingTop: 19, paddingBottom: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  headingRowWide: { paddingHorizontal: 24, paddingVertical: 23 }, headingCopy: { flex: 1 },
  destination: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 7 },
  destinationDot: { width: 5, height: 5, backgroundColor: colors.orange, borderRadius: 3 },
  eyebrow: { fontFamily: fonts.body, fontSize: 8, lineHeight: 12, letterSpacing: 1.1, fontWeight: '700', color: colors.muted },
  title: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 29, color: colors.brown, fontWeight: '800', letterSpacing: -0.8 },
  titleWide: { fontSize: 30, lineHeight: 36 },
  explore: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  exploreWide: { width: 'auto', paddingHorizontal: 18, flexDirection: 'row', gap: 12 },
  exploreText: { color: colors.white, fontSize: 12, fontWeight: '700', fontFamily: fonts.body },
  gallery: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', backgroundColor: colors.secondary },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#FBF5EB99' },
  photoFrame: { position: 'relative', overflow: 'hidden', maxWidth: '100%' },
  toolbar: { paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  toolbarWide: { paddingHorizontal: 24 }, photoInfo: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  counter: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  navigation: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  return: { minHeight: 38, justifyContent: 'center', paddingHorizontal: 8 }, returnText: { fontFamily: fonts.body, fontSize: 10, color: colors.muted, fontWeight: '600' },
  arrow: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  stripFrame: { borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: '#F7F1E8' },
  thumbnails: { gap: 10, paddingHorizontal: 14, paddingVertical: 12, flexGrow: 1 },
  thumbnailsWide: { paddingVertical: 15, justifyContent: 'center' },
  thumbnail: { borderRadius: 12, overflow: 'hidden', backgroundColor: colors.paper, borderWidth: 2, borderColor: 'transparent', padding: 3 },
  thumbnailSelected: { borderColor: colors.orange },
  thumbnailImage: { width: '100%', height: '100%', borderRadius: 7 },
  selectionBar: { position: 'absolute', bottom: 3, left: '30%', right: '30%', height: 3, borderRadius: 2, backgroundColor: colors.orange },
  pressed: { opacity: 0.75 },
});
