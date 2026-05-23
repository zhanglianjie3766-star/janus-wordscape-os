export type UserProfile = {
  nickname: string;
  avatar_src: string;
};

export const DEFAULT_USER_NICKNAME = 'JanusAI';
export const DEFAULT_USER_AVATAR_SRC = './avatars/default-user-avatar.svg';

const USER_PROFILE_STORAGE_KEY = 'techlex-os:user-profile:v1';

export function defaultUserProfile(): UserProfile {
  return {
    nickname: DEFAULT_USER_NICKNAME,
    avatar_src: DEFAULT_USER_AVATAR_SRC
  };
}

export function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return defaultUserProfile();
  }

  try {
    const raw = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (!raw) {
      return defaultUserProfile();
    }

    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    const avatarSrc = typeof parsed.avatar_src === 'string' && parsed.avatar_src ? parsed.avatar_src : DEFAULT_USER_AVATAR_SRC;

    return {
      nickname: typeof parsed.nickname === 'string' && parsed.nickname.trim() ? parsed.nickname.trim() : DEFAULT_USER_NICKNAME,
      avatar_src: normalizeAvatarSrc(avatarSrc)
    };
  } catch {
    return defaultUserProfile();
  }
}

function normalizeAvatarSrc(src: string): string {
  if (src === '/avatars/default-user-avatar.svg') {
    return DEFAULT_USER_AVATAR_SRC;
  }

  return src;
}

export function saveUserProfile(profile: UserProfile) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    USER_PROFILE_STORAGE_KEY,
    JSON.stringify({
      nickname: profile.nickname.trim() || DEFAULT_USER_NICKNAME,
      avatar_src: profile.avatar_src || DEFAULT_USER_AVATAR_SRC
    })
  );
}
