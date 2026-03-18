import { usePreferencesStore } from '@/store/usePreferencesStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export interface UserProfile {
  name: string;
  email: string;
  profileImage?: string;
}

export function useUserProfile(): UserProfile {
  const profile = usePreferencesStore((s) => s.profile);
  const onboardingName = useOnboardingStore((s) => s.userName);
  const onboardingEmail = useOnboardingStore((s) => s.userEmail);

  return {
    name: profile.name || onboardingName || 'Traveler',
    email: profile.email || onboardingEmail || '',
    profileImage: profile.profileImage,
  };
}

export function useUserAvatar(): string | undefined {
  return usePreferencesStore((s) => s.profile.profileImage);
}

export function useUserName(): string {
  const profileName = usePreferencesStore((s) => s.profile.name);
  const onboardingName = useOnboardingStore((s) => s.userName);
  return profileName || onboardingName || 'Traveler';
}
