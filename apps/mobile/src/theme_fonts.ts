// Font loading for the worker vertical slice.
// Typography system:
//   Khmer   -> Noto Sans Khmer (primary UI font; covers Khmer + Latin glyphs)
//   English -> Urbanist (UI, body, and headings — one family, no pairing)
import {
  useFonts as useKhmerFonts,
  NotoSansKhmer_400Regular,
  NotoSansKhmer_500Medium,
  NotoSansKhmer_600SemiBold,
  NotoSansKhmer_700Bold,
} from '@expo-google-fonts/noto-sans-khmer';
import {
  useFonts as useUrbanistFonts,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
} from '@expo-google-fonts/urbanist';

export const FONT = {
  khmer: {
    regular: 'NotoSansKhmer_400Regular',
    medium: 'NotoSansKhmer_500Medium',
    semibold: 'NotoSansKhmer_600SemiBold',
    bold: 'NotoSansKhmer_700Bold',
  },
  urbanist: {
    regular: 'Urbanist_400Regular',
    medium: 'Urbanist_500Medium',
    semibold: 'Urbanist_600SemiBold',
    bold: 'Urbanist_700Bold',
  },
} as const;

export function useWorkerFonts(): boolean {
  const [khmerLoaded] = useKhmerFonts({
    NotoSansKhmer_400Regular,
    NotoSansKhmer_500Medium,
    NotoSansKhmer_600SemiBold,
    NotoSansKhmer_700Bold,
  });
  const [urbanistLoaded] = useUrbanistFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
  });
  return khmerLoaded && urbanistLoaded;
}
