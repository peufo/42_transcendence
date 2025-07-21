export function createAvatarPlaceholder() {
        const avatarUrl = new URL('https://api.dicebear.com/9.x/bottts-neutral/svg')
        avatarUrl.searchParams.append('seed', String(Math.random()))
        return avatarUrl.toString()
}

