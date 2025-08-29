import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle
} from 'react-native';

export interface AdvancedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: React.ReactNode;
}

export const AdvancedButton: React.FC<AdvancedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  children,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: variant === 'outline' ? 2 : 0,
      opacity: disabled ? 0.6 : 1,
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = 8;
        baseStyle.paddingHorizontal = 16;
        break;
      case 'large':
        baseStyle.paddingVertical = 16;
        baseStyle.paddingHorizontal = 32;
        break;
      default: // medium
        baseStyle.paddingVertical = 12;
        baseStyle.paddingHorizontal = 24;
    }

    // Width styles
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = '#6A4C93';
        break;
      case 'secondary':
        baseStyle.backgroundColor = '#4A148C';
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderColor = '#6A4C93';
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
      case 'danger':
        baseStyle.backgroundColor = '#D32F2F';
        break;
    }

    return { ...baseStyle, ...style };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.fontSize = 14;
        break;
      case 'large':
        baseStyle.fontSize = 18;
        break;
      default: // medium
        baseStyle.fontSize = 16;
    }

    // Variant styles
    switch (variant) {
      case 'outline':
        baseStyle.color = '#6A4C93';
        break;
      case 'ghost':
        baseStyle.color = '#6A4C93';
        break;
      default:
        baseStyle.color = '#FFFFFF';
    }

    return { ...baseStyle, ...textStyle };
  };

  const getIconStyle = () => {
    const baseStyle = {
      marginLeft: iconPosition === 'right' ? 8 : 0,
      marginRight: iconPosition === 'left' ? 8 : 0,
    };

    switch (size) {
      case 'small':
        return { ...baseStyle, size: 16 };
      case 'large':
        return { ...baseStyle, size: 24 };
      default:
        return { ...baseStyle, size: 20 };
    }
  };

  const renderIcon = () => {
    if (!icon) return null;

    const iconStyle = getIconStyle();
    return (
      <Ionicons
        name={icon as any}
        size={iconStyle.size}
        color={getTextStyle().color}
        style={{
          marginLeft: iconStyle.marginLeft,
          marginRight: iconStyle.marginRight,
        }}
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <ActivityIndicator
            size="small"
            color={getTextStyle().color}
            style={{ marginRight: 8 }}
          />
          <Text style={getTextStyle()}>Loading...</Text>
        </>
      );
    }

    if (children) {
      return children;
    }

    return (
      <>
        {iconPosition === 'left' && renderIcon()}
        <Text style={getTextStyle()}>{title}</Text>
        {iconPosition === 'right' && renderIcon()}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});
