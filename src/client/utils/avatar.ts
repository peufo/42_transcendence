import type { UserBasic } from '../../lib/type.ts'

export function getAvatarSrc(user: UserBasic): string {
	if (user.hasAvatar) {
		return `${location.origin}/upload/avatars/${user.id}.webp`
	}
	return user.avatarPlaceholder
}
