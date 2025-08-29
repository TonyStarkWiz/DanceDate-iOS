import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface BottomNavItem {
  label: string;
  icon: string;
  route: string;
  baseRoute: string;
}

const bottomNavItems: BottomNavItem[] = [
  {
    label: 'Feed',
    icon: 'home',
    route: '/feed',
    baseRoute: '/feed',
  },
  {
    label: 'Events',
    icon: 'calendar',
    route: '/eventList',
    baseRoute: '/eventList',
  },
  {
    label: 'Ball',
    icon: 'star',
    route: '/ball',
    baseRoute: '/ball',
  },
  {
    label: 'Classes',
    icon: 'person',
    route: '/classes',
    baseRoute: '/classes',
  },
  {
    label: 'Matches',
    icon: 'heart',
    route: '/allMatches',
    baseRoute: '/allMatches',
  },
];

interface BottomNavBarProps {
  onTabReselected?: (route: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ onTabReselected }) => {
  const pathname = usePathname();

  const isSelected = (baseRoute: string) => {
    return pathname.startsWith(baseRoute);
  };

  const handleTabPress = (item: BottomNavItem) => {
    const isCurrentlySelected = isSelected(item.baseRoute);
    
    if (isCurrentlySelected) {
      // Tab is already selected, trigger reselect behavior
      if (onTabReselected) {
        onTabReselected(item.route);
      }
    } else {
      // Navigate to new tab
      router.push(item.route);
    }
  };

  const getIconColor = (item: BottomNavItem) => {
    return isSelected(item.baseRoute) ? '#FFFFFF' : '#CCCCCC';
  };

  const getIndicatorColor = (item: BottomNavItem) => {
    return isSelected(item.baseRoute) ? '#203A43' : 'transparent';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(28, 28, 30, 0.2)', 'rgba(28, 28, 30, 0.4)']}
        style={styles.gradientBackground}
      >
        {bottomNavItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tabItem,
              isSelected(item.baseRoute) && styles.selectedTabItem,
            ]}
            onPress={() => handleTabPress(item)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              { backgroundColor: getIndicatorColor(item) }
            ]}>
              <Ionicons
                name={item.icon as any}
                size={24}
                color={getIconColor(item)}
              />
            </View>
            <Text style={[
              styles.tabLabel,
              { color: getIconColor(item) }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  gradientBackground: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  selectedTabItem: {
    // Additional styling for selected state if needed
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});
