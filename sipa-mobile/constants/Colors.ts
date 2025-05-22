/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: '#3E7BFA', // Primary blue for SIPA
    tabIconDefault: '#ccc',
    tabIconSelected: '#3E7BFA',
    card: '#f9f9f9',
    border: '#e1e1e1',
    notification: '#ff3b30',

    // SIPA specific colors
    primary: '#3E7BFA',
    secondary: '#6C63FF',
    accent: '#FF6584',
    success: '#4CD964',
    warning: '#FF9500',
    danger: '#FF3B30',
    info: '#5AC8FA',
    lightGray: '#E5E5EA',
    darkGray: '#8E8E93',
  },
  dark: {
    text: '#fff',
    background: '#121212',
    tint: '#5889FF', // Lighter blue for dark mode
    tabIconDefault: '#ccc',
    tabIconSelected: '#5889FF',
    card: '#1e1e1e',
    border: '#272729',
    notification: '#ff453a',

    // SIPA specific colors
    primary: '#5889FF',
    secondary: '#7F78FF',
    accent: '#FF7F97',
    success: '#4CD964',
    warning: '#FF9F0A',
    danger: '#FF453A',
    info: '#64D2FF',
    lightGray: '#2C2C2E',
    darkGray: '#636366',
  },
};
