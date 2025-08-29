import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle,
} from 'react-native';

export interface MaterialCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  elevation?: number;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: number;
  margin?: number;
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  children,
  elevation = 2,
  variant = 'elevated',
  padding = 16,
  margin = 8,
  borderRadius = 12,
  backgroundColor,
  borderColor,
  style,
  onPress,
  disabled = false,
  ...touchableProps
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius,
      padding,
      margin,
      backgroundColor: backgroundColor || '#FFFFFF',
    };

    switch (variant) {
      case 'elevated':
        baseStyle.shadowColor = '#000';
        baseStyle.shadowOffset = { width: 0, height: elevation };
        baseStyle.shadowOpacity = 0.1;
        baseStyle.shadowRadius = elevation * 2;
        baseStyle.elevation = elevation;
        break;
      case 'outlined':
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = borderColor || '#E0E0E0';
        break;
      case 'filled':
        baseStyle.backgroundColor = backgroundColor || '#F5F5F5';
        break;
    }

    return { ...baseStyle, ...style };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={getCardStyle()}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.9}
        {...touchableProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={getCardStyle()}>{children}</View>;
};

// Specialized card variants
export const ElevatedCard: React.FC<Omit<MaterialCardProps, 'variant'>> = (props) => (
  <MaterialCard {...props} variant="elevated" />
);

export const OutlinedCard: React.FC<Omit<MaterialCardProps, 'variant'>> = (props) => (
  <MaterialCard {...props} variant="outlined" />
);

export const FilledCard: React.FC<Omit<MaterialCardProps, 'variant'>> = (props) => (
  <MaterialCard {...props} variant="filled" />
);

// Card with different elevation levels
export const Card1: React.FC<Omit<MaterialCardProps, 'elevation'>> = (props) => (
  <MaterialCard {...props} elevation={1} />
);

export const Card2: React.FC<Omit<MaterialCardProps, 'elevation'>> = (props) => (
  <MaterialCard {...props} elevation={2} />
);

export const Card4: React.FC<Omit<MaterialCardProps, 'elevation'>> = (props) => (
  <MaterialCard {...props} elevation={4} />
);

export const Card8: React.FC<Omit<MaterialCardProps, 'elevation'>> = (props) => (
  <MaterialCard {...props} elevation={8} />
);

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});
