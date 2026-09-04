'use client';

import React from 'react';
import {
  Zap,
  Droplet,
  Hammer,
  Paintbrush,
  Sparkles,
  Car,
  Leaf,
  Wrench,
  Heart,
  Home,
  HelpCircle,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Zap,
  Droplet,
  Hammer,
  Paintbrush,
  Sparkles,
  Car,
  Leaf,
  Wrench,
  Heart,
  Home,
};

interface ServiceCategoryIconProps extends LucideProps {
  name: string;
}

export function ServiceCategoryIcon({ name, ...props }: ServiceCategoryIconProps) {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent {...props} />;
}
