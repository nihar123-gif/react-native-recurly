import React from 'react';
import { Image, ImageProps } from 'react-native';

type IconName = 
  | 'add'
  | 'bell'
  | 'calendar'
  | 'card'
  | 'check'
  | 'chevron-right'
  | 'clock'
  | 'close'
  | 'edit'
  | 'home'
  | 'insights'
  | 'search'
  | 'settings'
  | 'subscription'
  | 'trash'
  | 'user'
  | 'wallet';

interface IconProps extends Omit<ImageProps, 'source'> {
  name: IconName;
  size?: number;
  color?: string;
}

const iconMap: Record<IconName, any> = {
  add: require('@/assets/icons/ui/add.png'),
  bell: require('@/assets/icons/ui/bell.png'),
  calendar: require('@/assets/icons/ui/calendar.png'),
  card: require('@/assets/icons/ui/card.png'),
  check: require('@/assets/icons/ui/check.png'),
  'chevron-right': require('@/assets/icons/ui/chevron-right.png'),
  clock: require('@/assets/icons/ui/clock.png'),
  close: require('@/assets/icons/ui/close.png'),
  edit: require('@/assets/icons/ui/edit.png'),
  home: require('@/assets/icons/ui/home.png'),
  insights: require('@/assets/icons/ui/insights.png'),
  search: require('@/assets/icons/ui/search.png'),
  settings: require('@/assets/icons/ui/settings.png'),
  subscription: require('@/assets/icons/ui/subscription.png'),
  trash: require('@/assets/icons/ui/trash.png'),
  user: require('@/assets/icons/ui/user.png'),
  wallet: require('@/assets/icons/ui/wallet.png'),
};

export default function Icon({ 
  name, 
  size = 24, 
  color,
  style,
  ...props 
}: IconProps) {
  return (
    <Image
      source={iconMap[name]}
      style={[
        { width: size, height: size },
        color && { tintColor: color },
        style,
      ]}
      {...props}
    />
  );
}
