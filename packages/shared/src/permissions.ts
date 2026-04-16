import type { WorkspaceRole, SharePermission, GranularityLevel } from "./types";

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
  suggestion_only: 0,
};

const PERMISSION_HIERARCHY: Record<SharePermission, number> = {
  edit: 3,
  comment: 2,
  view: 1,
  suggestion_only: 0,
};

const GRANULARITY_ORDER: Record<GranularityLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

export function canView(role: WorkspaceRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.viewer;
}

export function canEdit(role: WorkspaceRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.editor;
}

export function canAdmin(role: WorkspaceRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.admin;
}

export function canShare(role: WorkspaceRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.admin;
}

export function canConsumeCredits(role: WorkspaceRole): boolean {
  return role !== "suggestion_only" && role !== "viewer";
}

export function hasSharePermission(
  userPermission: SharePermission,
  required: SharePermission
): boolean {
  return PERMISSION_HIERARCHY[userPermission] >= PERMISSION_HIERARCHY[required];
}

export function isVisibleAtLevel(
  itemLevel: GranularityLevel,
  userLevel: GranularityLevel
): boolean {
  return GRANULARITY_ORDER[itemLevel] <= GRANULARITY_ORDER[userLevel];
}

export function getEffectivePermission(
  workspaceRole: WorkspaceRole | null,
  sharePermission: SharePermission | null
): SharePermission | null {
  if (!workspaceRole && !sharePermission) return null;

  const roleLevel = workspaceRole ? ROLE_HIERARCHY[workspaceRole] : -1;
  const shareLevel = sharePermission
    ? PERMISSION_HIERARCHY[sharePermission]
    : -1;

  if (roleLevel >= shareLevel) {
    if (!workspaceRole) return sharePermission;
    if (workspaceRole === "owner" || workspaceRole === "admin") return "edit";
    if (workspaceRole === "editor") return "edit";
    if (workspaceRole === "viewer") return "view";
    return "suggestion_only";
  }

  return sharePermission;
}
