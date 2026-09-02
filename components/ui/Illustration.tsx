import React from 'react';
import { Image, ImageProps } from 'react-native';

type IllustrationName = 
  | 'empty-state-no-subscriptions'
  | 'onboarding-insights'
  | 'onboarding-remind'
  | 'onboarding-track';

interface IllustrationProps extends Omit<ImageProps, 'source'> {
  name: IllustrationName;
  width?: number;
  height?: number;
}

const illustrationMap: Record<IllustrationName, any> = {
  'empty-state-no-subscriptions': require('@/assets/illustrations/empty-state-no-subscriptions.png'),
  'onboarding-insights': require('@/assets/illustrations/onboarding-insights.png'),
  'onboarding-remind': require('@/assets/illustrations/onboarding-remind.png'),
  'onboarding-track': require('@/assets/illustrations/onboarding-track.png'),
};

export default function Illustration({ 
  name, 
  width = 280,
  height = 280,
  style,
  ...props 
}: IllustrationProps) {
  return (
    <Image
      source={illustrationMap[name]}
      style={[
        { width, height, resizeMode: 'contain' },
        style,
      ]}
      {...props}
    />
  );
}
