import React from 'react';
import { Image, ImageProps } from 'react-native';

type CategoryName = 
  | 'cloud'
  | 'fitness'
  | 'gaming'
  | 'music'
  | 'reading'
  | 'software'
  | 'streaming'
  | 'utilities';

interface CategoryIconProps extends Omit<ImageProps, 'source'> {
  category: CategoryName;
  size?: number;
}

const categoryMap: Record<CategoryName, any> = {
  cloud: require('@/assets/icons/categories/cloud.png'),
  fitness: require('@/assets/icons/categories/fitness.png'),
  gaming: require('@/assets/icons/categories/gaming.png'),
  music: require('@/assets/icons/categories/music.png'),
  reading: require('@/assets/icons/categories/reading.png'),
  software: require('@/assets/icons/categories/software.png'),
  streaming: require('@/assets/icons/categories/streaming.png'),
  utilities: require('@/assets/icons/categories/utilities.png'),
};

export default function CategoryIcon({ 
  category, 
  size = 48,
  style,
  ...props 
}: CategoryIconProps) {
  return (
    <Image
      source={categoryMap[category]}
      style={[
        { width: size, height: size },
        style,
      ]}
      {...props}
    />
  );
}
