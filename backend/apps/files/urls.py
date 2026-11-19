from django.urls import path

from .views import FileDownloadView, FileUploadView

app_name = "files"

urlpatterns = [
    path("", FileUploadView.as_view(), name="upload"),
    path("<uuid:pk>/download/", FileDownloadView.as_view(), name="download"),
]
