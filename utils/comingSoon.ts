import { Alert } from 'react-native';

export function openComingSoon(featureName?: string) {
  const title = 'Coming Soon';
  const body = featureName
    ? `${featureName} is being built.`
    : 'This feature is being built.';
  Alert.alert(title, body, [{ text: 'OK' }]);
}
