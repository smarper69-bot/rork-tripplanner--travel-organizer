import * as Haptics from 'expo-haptics';

export const hapticLight = () => {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export const hapticMedium = () => {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

export const hapticHeavy = () => {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

export const hapticSuccess = () => {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

export const hapticWarning = () => {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

export const hapticError = () => {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

export const hapticSelection = () => {
  void Haptics.selectionAsync();
};
