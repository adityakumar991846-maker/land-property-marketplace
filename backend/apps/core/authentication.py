from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

class OptionalTokenAuthentication(TokenAuthentication):
    """
    Token authentication that gracefully falls back to AnonymousUser
    if a client presents an invalid, expired, or malformed token on public endpoints,
    while still enforcing authentication on views with IsAuthenticated permissions.
    """
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except AuthenticationFailed:
            # Do not block public endpoints if token is invalid; treat as unauthenticated
            return None
