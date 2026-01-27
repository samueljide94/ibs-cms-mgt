import { useMemo } from "react";
import { useWebUser, useUserRoles, useIsAdmin } from "./useWebUser";
import { EDIT_POSITIONS, PositionType } from "@/types/database";

export interface Permissions {
  canView: boolean;
  canCopy: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isAdmin: boolean;
  position: PositionType | null;
}

export const usePermissions = (): Permissions => {
  const { data: webUser, isLoading: userLoading } = useWebUser();
  const { data: roles, isLoading: rolesLoading } = useUserRoles();
  const isAdmin = useIsAdmin();

  return useMemo(() => {
    // Default - no permissions while loading
    if (userLoading || rolesLoading || !webUser) {
      return {
        canView: false,
        canCopy: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        isAdmin: false,
        position: null,
      };
    }

    const position = webUser.position;
    const hasAdminRole = roles?.some(r => r.role === 'Admin') ?? false;
    const isMD = position === 'MD';
    const adminAccess = hasAdminRole || isMD;
    
    // Admin/MD has full CRUD access
    if (adminAccess) {
      return {
        canView: true,
        canCopy: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        isAdmin: true,
        position,
      };
    }

    // Check if user is in an edit-allowed position (MD to Senior, plus Developer)
    const canEditFromPosition = EDIT_POSITIONS.includes(position);

    return {
      canView: true,
      canCopy: true,
      canCreate: canEditFromPosition,
      canEdit: canEditFromPosition,
      canDelete: canEditFromPosition,
      isAdmin: false,
      position,
    };
  }, [webUser, roles, userLoading, rolesLoading, isAdmin]);
};

// Hook to check specific permission
export const useHasPermission = (permission: keyof Omit<Permissions, 'position'>) => {
  const permissions = usePermissions();
  return permissions[permission];
};
