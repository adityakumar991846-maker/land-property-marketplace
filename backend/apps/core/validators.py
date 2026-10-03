import os
from django.core.exceptions import ValidationError
from PIL import Image

MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
ALLOWED_IMAGE_FORMATS = {'JPEG', 'PNG', 'WEBP'}

def validate_image_file(uploaded_file):
    """
    Enforces strict security validation on uploaded images:
    1. Maximum file size check (5 MB).
    2. Allowed file extension check (.jpg, .jpeg, .png, .webp).
    3. File content header inspection via Pillow to reject executables, scripts, SVGs, and corrupt files.
    """
    if not uploaded_file:
        return

    # 1. Check file size
    if uploaded_file.size > MAX_IMAGE_SIZE_BYTES:
        max_mb = MAX_IMAGE_SIZE_BYTES / (1024 * 1024)
        raise ValidationError(
            f"Image file size cannot exceed {max_mb:.0f} MB. Received: {uploaded_file.size / (1024 * 1024):.2f} MB."
        )

    # 2. Check file extension
    ext = os.path.splitext(uploaded_file.name)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        allowed_str = ', '.join(sorted(ALLOWED_IMAGE_EXTENSIONS))
        raise ValidationError(
            f"Unsupported file extension '{ext}'. Only {allowed_str} are permitted. Executables, scripts, and SVG formats are strictly prohibited."
        )

    # 3. Deep header verification using Pillow
    try:
        initial_pos = uploaded_file.tell() if hasattr(uploaded_file, 'tell') else 0
        img = Image.open(uploaded_file)
        img.verify()
        img_format = img.format.upper() if img.format else ''
        if img_format not in ALLOWED_IMAGE_FORMATS:
            raise ValidationError(
                f"Unsupported image format: {img_format}. Only JPEG, PNG, and WEBP formats are accepted."
            )
        if hasattr(uploaded_file, 'seek'):
            uploaded_file.seek(initial_pos)
    except Exception as e:
        if isinstance(e, ValidationError):
            raise
        raise ValidationError(
            "Invalid or corrupted image file. Please upload a valid JPEG, PNG, or WEBP image."
        )

def validate_positive_number(value):
    if value is not None and value <= 0:
        raise ValidationError("Value must be strictly greater than zero.")
