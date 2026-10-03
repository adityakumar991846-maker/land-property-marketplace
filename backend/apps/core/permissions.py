from rest_framework import permissions

class IsAdminOrStaff(permissions.BasePermission):
    """
    Allows access only to authenticated staff or superuser accounts.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser))

class IsSellerOrReadOnly(permissions.BasePermission):
    """
    Allows modification only to users with is_seller=True.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_seller)

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Allows editing or deleting only to the owner of the object.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner = getattr(obj, 'seller', getattr(obj, 'user', None))
        return bool(owner and owner == request.user)
