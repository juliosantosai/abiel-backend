export interface PermissionFinder {
  findPermissionsByRolIds(rolIds: string[]): Promise<string[]>;
}
