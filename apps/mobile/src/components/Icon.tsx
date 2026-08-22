// Cross-platform icon set built only from React Native View primitives.
// No emoji, no SVG library, no new dependency. Icons scale via transform.
// Each builder draws in a 24x24 coordinate space; Icon scales to `size`.
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { colors } from '../theme';

export type IconName =
  | 'check'
  | 'checkCircle'
  | 'alert'
  | 'shield'
  | 'shieldCheck'
  | 'search'
  | 'pin'
  | 'briefcase'
  | 'doc'
  | 'user'
  | 'phone'
  | 'share'
  | 'flag'
  | 'arrowLeft'
  | 'arrowRight'
  | 'chevronRight'
  | 'close'
  | 'info'
  | 'lock'
  | 'building'
  | 'clock'
  | 'money'
  | 'language'
  | 'list'
  | 'bell'
  | 'edit'
  | 'plus';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Line segment between two points, rotated around its center.
function seg(x1: number, y1: number, x2: number, y2: number, t: number, c: string) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  return (
    <View
      style={{
        position: 'absolute',
        left: cx - len / 2,
        top: cy - t / 2,
        width: len,
        height: t,
        backgroundColor: c,
        borderRadius: t / 2,
        transform: [{ rotate: `${angle}deg` }],
      }}
    />
  );
}

function ring(cx: number, cy: number, r: number, t: number, c: string) {
  return (
    <View
      style={{
        position: 'absolute',
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        borderRadius: r,
        borderWidth: t,
        borderColor: c,
      }}
    />
  );
}

function dot(cx: number, cy: number, r: number, c: string) {
  return (
    <View
      style={{
        position: 'absolute',
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        borderRadius: r,
        backgroundColor: c,
      }}
    />
  );
}

function box(
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number | { tl?: number; tr?: number; bl?: number; br?: number },
  c: string,
  filled = false
) {
  const r: ViewStyle['borderTopLeftRadius'] =
    typeof radius === 'number' ? radius : (radius.tl ?? 0);
  const style: ViewStyle = {
    position: 'absolute',
    left: x,
    top: y,
    width: w,
    height: h,
    backgroundColor: filled ? c : 'transparent',
  };
  if (typeof radius === 'number') {
    style.borderRadius = radius;
  } else {
    style.borderTopLeftRadius = radius.tl ?? 0;
    style.borderTopRightRadius = radius.tr ?? 0;
    style.borderBottomLeftRadius = radius.bl ?? 0;
    style.borderBottomRightRadius = radius.br ?? 0;
  }
  if (!filled) {
    style.borderWidth = 2;
    style.borderColor = c;
  }
  return <View style={style} />;
}

type Builder = (c: string, t: number) => React.ReactNode;

const BUILDERS: Record<IconName, Builder> = {
  check: (c, t) => <>{seg(4, 12, 10, 18, t, c)}{seg(10, 18, 20, 6, t, c)}</>,
  checkCircle: (c, t) => (
    <>
      {ring(12, 12, 9.5, t, c)}
      {seg(7, 12, 10.5, 15.5, t, c)}
      {seg(10.5, 15.5, 17, 9, t, c)}
    </>
  ),
  alert: (c, t) => (
    <>
      {seg(4, 6, 20, 6, t, c)}
      {seg(4, 6, 12, 20, t, c)}
      {seg(20, 6, 12, 20, t, c)}
      {seg(12, 9, 12, 15, t, c)}
      {dot(12, 18, t * 0.9, c)}
    </>
  ),
  shield: (c, t) => (
    <>
      {seg(4, 5, 12, 20, t, c)}
      {seg(20, 5, 12, 20, t, c)}
      {seg(4, 5, 20, 5, t, c)}
    </>
  ),
  shieldCheck: (c, t) => (
    <>
      {seg(4, 5, 12, 20, t, c)}
      {seg(20, 5, 12, 20, t, c)}
      {seg(4, 5, 20, 5, t, c)}
      {seg(8, 12, 11, 15, t, c)}
      {seg(11, 15, 16, 9, t, c)}
    </>
  ),
  search: (c, t) => (
    <>
      {ring(10, 10, 7, t, c)}
      {seg(15, 15, 20.5, 20.5, t, c)}
    </>
  ),
  pin: (c, t) => (
    <>
      {ring(12, 7.5, 4.5, t, c)}
      {seg(8.5, 10.5, 12, 21, t, c)}
      {seg(15.5, 10.5, 12, 21, t, c)}
    </>
  ),
  briefcase: (c, t) => (
    <>
      {box(4, 8, 16, 11, 3, c)}
      {box(9, 4, 6, 4.5, { tl: 2, tr: 2, bl: 0, br: 0 }, c)}
      {seg(4, 13.5, 20, 13.5, t, c)}
    </>
  ),
  doc: (c, t) => (
    <>
      {box(5, 3, 14, 18, 2, c)}
      {seg(8, 8, 16, 8, t, c)}
      {seg(8, 12, 16, 12, t, c)}
      {seg(8, 16, 13, 16, t, c)}
    </>
  ),
  user: (c, t) => (
    <>
      {dot(12, 8, 3.5, c)}
      {box(5, 13, 14, 8, { tl: 7, tr: 7, bl: 0, br: 0 }, c, true)}
    </>
  ),
  phone: (c, t) => (
    <>
      {box(9, 3, 6, 18, 3, c, true)}
      {seg(12, 5.5, 12, 18.5, t * 0.8, colors.surface)}
    </>
  ),
  share: (c, t) => (
    <>
      {dot(6, 12, 2.6, c)}
      {dot(18, 6, 2.6, c)}
      {dot(18, 18, 2.6, c)}
      {seg(6, 12, 18, 6, t, c)}
      {seg(6, 12, 18, 18, t, c)}
    </>
  ),
  flag: (c, t) => (
    <>
      {seg(6, 3, 6, 21, t, c)}
      {box(6, 4, 12, 8, 0, c, true)}
    </>
  ),
  arrowLeft: (c, t) => (
    <>
      {seg(5, 12, 19, 12, t, c)}
      {seg(5, 12, 11, 6, t, c)}
      {seg(5, 12, 11, 18, t, c)}
    </>
  ),
  arrowRight: (c, t) => (
    <>
      {seg(5, 12, 19, 12, t, c)}
      {seg(19, 12, 13, 6, t, c)}
      {seg(19, 12, 13, 18, t, c)}
    </>
  ),
  chevronRight: (c, t) => (
    <>
      {seg(9, 6, 15, 12, t, c)}
      {seg(9, 18, 15, 12, t, c)}
    </>
  ),
  close: (c, t) => (
    <>
      {seg(6, 6, 18, 18, t, c)}
      {seg(6, 18, 18, 6, t, c)}
    </>
  ),
  info: (c, t) => (
    <>
      {ring(12, 12, 9, t, c)}
      {dot(12, 8, 1.6, c)}
      {seg(12, 11, 12, 17, t, c)}
    </>
  ),
  lock: (c, t) => (
    <>
      {ring(12, 8, 4, t, c)}
      {box(5.5, 10, 13, 11, 2, c, true)}
      {box(10, 14, 4, 4, 1, colors.surface, true)}
    </>
  ),
  building: (c, t) => (
    <>
      {box(4, 4, 16, 17, 1, c)}
      {box(8, 8, 3, 3, 0, c, true)}
      {box(13, 8, 3, 3, 0, c, true)}
      {box(10, 15, 4, 6, 0, c, true)}
    </>
  ),
  clock: (c, t) => (
    <>
      {ring(12, 12, 9, t, c)}
      {seg(12, 12, 12, 7, t, c)}
      {seg(12, 12, 16, 12, t, c)}
    </>
  ),
  money: (c, t) => (
    <>
      {ring(12, 12, 9, t, c)}
      {seg(12, 8, 12, 16, t, c)}
      {seg(8, 12, 10, 12, t, c)}
      {seg(14, 12, 16, 12, t, c)}
    </>
  ),
  language: (c, t) => (
    <>
      {ring(12, 12, 9, t, c)}
      {seg(12, 3, 12, 21, t, c)}
      {seg(3, 12, 21, 12, t, c)}
      {seg(5.5, 7, 18.5, 7, t * 0.7, c)}
      {seg(5.5, 17, 18.5, 17, t * 0.7, c)}
    </>
  ),
  list: (c, t) => (
    <>
      {dot(4, 6, 1.6, c)}
      {dot(4, 12, 1.6, c)}
      {dot(4, 18, 1.6, c)}
      {seg(8, 6, 20, 6, t, c)}
      {seg(8, 12, 20, 12, t, c)}
      {seg(8, 18, 20, 18, t, c)}
    </>
  ),
  bell: (c, t) => (
    <>
      {dot(12, 4, 1.6, c)}
      {box(6, 6, 12, 10, { tl: 6, tr: 6, bl: 1, br: 1 }, c, true)}
      {dot(12, 18.5, 1.8, c)}
    </>
  ),
  edit: (c, t) => (
    <>
      {seg(14, 4, 20, 10, t, c)}
      {seg(4, 20, 15, 9, t, c)}
      {seg(15, 9, 12, 6, t, c)}
    </>
  ),
  plus: (c, t) => (
    <>
      {seg(12, 5, 12, 19, t, c)}
      {seg(5, 12, 19, 12, t, c)}
    </>
  ),
};

export function Icon({ name, size = 24, color = colors.ink, strokeWidth }: IconProps) {
  const t = strokeWidth ?? Math.max(1.6, size * 0.12);
  const content = BUILDERS[name](color, t);
  return (
    <View style={{ width: size, height: size, overflow: 'visible' }}>
      <View style={{ width: 24, height: 24, transform: [{ scale: size / 24 }] }}>
        {content}
      </View>
    </View>
  );
}

export default Icon;
