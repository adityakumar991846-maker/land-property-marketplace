import math
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50

    def get_paginated_response(self, data):
        total_count = self.page.paginator.count
        current_page = self.page.number
        page_size = self.get_page_size(self.request) or self.page_size
        total_pages = math.ceil(total_count / page_size) if page_size else 1

        return Response({
            'count': total_count,
            'total_pages': total_pages,
            'current_page': current_page,
            'page_size': page_size,
            'has_next': self.page.has_next(),
            'has_previous': self.page.has_previous(),
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })
