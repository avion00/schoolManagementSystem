from django.http import FileResponse, Http404
from django.utils import timezone
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.services import record_audit

from .access import can_download
from .models import StoredFile
from .serializers import StoredFileSerializer, UploadSerializer
from .validation import inspect_upload


class FileUploadView(APIView):
    """POST multipart `file` → stored file id to attach to assignments etc."""

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    serializer_class = UploadSerializer

    def post(self, request):
        if request.user.organization_id is None:
            return Response({"detail": "No organization."}, status=400)
        data = UploadSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        upload = data.validated_data["file"]
        kind, content_type, sha = inspect_upload(upload)
        stored = StoredFile(
            organization_id=request.user.organization_id, uploaded_by=request.user,
            original_name=upload.name[:255], content_type=content_type, kind=kind,
            size=upload.size, sha256=sha, created_at=timezone.now(),
        )
        stored.file.save(upload.name, upload, save=False)
        stored.save()
        return Response(StoredFileSerializer(stored).data, status=status.HTTP_201_CREATED)


class FileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        stored = StoredFile.objects.filter(pk=pk).first()
        if stored is None or not can_download(request.user, stored):
            raise Http404  # don't reveal that the file exists
        record_audit(action="file.download", actor=request.user, instance=stored, request=request,
                     organization=request.user.organization)
        response = FileResponse(stored.file.open("rb"), as_attachment=True,
                                filename=stored.original_name, content_type=stored.content_type)
        response["X-Content-Type-Options"] = "nosniff"
        response["Content-Security-Policy"] = "default-src 'none'; sandbox"
        return response
