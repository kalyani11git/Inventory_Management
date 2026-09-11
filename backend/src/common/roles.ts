export enum UserRole {
  OWNER = 'owner',
  USER = 'user',
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export function isOwner(user: AuthUser) {
  return user.role === UserRole.OWNER;
}
