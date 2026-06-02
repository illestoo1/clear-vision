from PIL import Image
import io
import httpx

# Create a simple white JPEG image in memory
img = Image.new("RGB", (256, 256), (255, 255, 255))
buf = io.BytesIO()
img.save(buf, format="JPEG")
buf.seek(0)

# POST to the analyze endpoint
url = "http://127.0.0.1:8000/analyze"
files = {"file": ("test.jpg", buf, "image/jpeg")}

with httpx.Client(timeout=10) as client:
    r = client.post(url, files=files)
    print(r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text)
