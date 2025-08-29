import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle
} from 'react-native';

export interface FloatingActionButtonProps {
  icon: string;
  onPress: () => void;
  size?: 'small' | 'normal' | 'large';
  variant?: 'primary' | 'secondary' | 'surface' | 'tertiary';
  label?: string;
  extended?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  bottomOffset?: number;
  rightOffset?: number;
  leftOffset?: number;
  topOffset?: number;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  size = 'normal',
  variant = 'primary',
  label,
  extended = false,
  disabled = false,
  style,
  position = 'bottom-right',
  bottomOffset = 24,
  rightOffset = 24,
  leftOffset = 24,
  topOffset = 24,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 40;
      case 'large':
        return 64;
      default:
        return 56;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 28;
      default:
        return 24;
    }
  };

  const getVariantStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: getSize() / 2,
      width: getSize(),
      height: getSize(),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    };

    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = '#6A4C93';
        break;
      case 'secondary':
        baseStyle.backgroundColor = '#4A148C';
        break;
      case 'surface':
        baseStyle.backgroundColor = '#FFFFFF';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = '#E0E0E0';
        break;
      case 'tertiary':
        baseStyle.backgroundColor = '#F5F5F5';
        break;
    }

    return baseStyle;
  };

  const getPositionStyle = (): ViewStyle => {
    const positionStyle: ViewStyle = {
      position: 'absolute',
    };

    switch (position) {
      case 'bottom-right':
        positionStyle.bottom = bottomOffset;
        positionStyle.right = rightOffset;
        break;
      case 'bottom-left':
        positionStyle.bottom = bottomOffset;
        positionStyle.left = leftOffset;
        break;
      case 'top-right':
        positionStyle.top = topOffset;
        positionStyle.right = rightOffset;
        break;
      case 'top-left':
        positionStyle.top = topOffset;
        positionStyle.left = leftOffset;
        break;
      case 'center':
        positionStyle.top = '50%';
        positionStyle.left = '50%';
        positionStyle.transform = [{ translateX: -getSize() / 2 }, { translateY: -getSize() / 2 }];
        break;
    }

    return positionStyle;
  };

  const getExtendedStyle = (): ViewStyle => {
    if (!extended) return {};

    return {
      width: 'auto',
      minWidth: getSize(),
      paddingHorizontal: 20,
      flexDirection: 'row',
      borderRadius: getSize() / 2,
    };
  };

  const getIconColor = () => {
    switch (variant) {
      case 'surface':
        return '#6A4C93';
      case 'tertiary':
        return '#6A4C93';
      default:
        return '#FFFFFF';
    }
  };

  const getLabelColor = () => {
    switch (variant) {
      case 'surface':
        return '#6A4C93';
      case 'tertiary':
        return '#6A4C93';
      default:
        return '#FFFFFF';
    }
  };

  const getLabelSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      style={[
        getVariantStyle(),
        getPositionStyle(),
        getExtendedStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon as any}
        size={getIconSize()}
        color={getIconColor()}
        style={extended && label ? { marginRight: 8 } : {}}
      />
      {extended && label && (
        <Text
          style={[
            styles.label,
            {
              color: getLabelColor(),
              fontSize: getLabelSize(),
            },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.6,
  },
  label: {
    fontWeight: '600',
  },
});

// Convenience components for common FAB positions
export const BottomRightFAB: React.FC<Omit<FloatingActionButtonProps, 'position'>> = (props) => (
  <FloatingActionButton {...props} position="bottom-right" />
);

export const BottomLeftFAB: React.FC<Omit<FloatingActionButtonProps, 'position'>> = (props) => (
  <FloatingActionButton {...props} position="bottom-left" />
);

export const TopRightFAB: React.FC<Omit<FloatingActionButtonProps, 'position'>> = (props) => (
  <FloatingActionButton {...props} position="top-right" />
);

export const TopLeftFAB: React.FC<Omit<FloatingActionButtonProps, 'position'>> = (props) => (
  <FloatingActionButton {...props} position="top-left" />
);

export const CenterFAB: React.FC<Omit<FloatingActionButtonProps, 'position'>> = (props) => (
  <FloatingActionButton {...props} position="center" />
);
