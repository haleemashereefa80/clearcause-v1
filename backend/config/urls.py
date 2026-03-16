from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.views.static import serve

def serve_with_cors(request, path, document_root=None, show_indexes=False):
    response = serve(request, path, document_root, show_indexes)
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Origin, Content-Type, Accept"
    return response

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('core.urls')),
]

if settings.DEBUG:
    # Use custom serve view to allow professional PDF viewer to fetch PDFs across ports
    urlpatterns += [
        path('media/<path:path>', serve_with_cors, {'document_root': settings.MEDIA_ROOT}),
    ]
