from PIL import Image
import os, glob

img_dir = r"C:\Users\wanme\WorkBuddy\Claw\火锅外卖H5\images"
max_w = 1200
quality = 85

patterns = ["*.jpg", "*.jpeg", "*.png"]
total_before = 0
total_after = 0

for pat in patterns:
    for path in glob.glob(os.path.join(img_dir, pat)):
        img = Image.open(path)
        w, h = img.size

        # Convert to RGB (remove alpha)
        if img.mode in ("RGBA", "P", "LA"):
            rgb = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            if img.mode == "RGBA":
                rgb.paste(img, mask=img.split()[-1])
            img = rgb
        elif img.mode != "RGB":
            img = img.convert("RGB")

        before_size = os.path.getsize(path)

        if w > max_w:
            ratio = max_w / w
            new_w = max_w
            new_h = int(h * ratio)
            img = img.resize((new_w, new_h), Image.LANCZOS)

        img.save(path, "JPEG", quality=quality, optimize=True)
        after_size = os.path.getsize(path)

        total_before += before_size
        total_after += after_size

        saved = before_size - after_size
        print(f"{os.path.basename(path):20s}  {before_size/1024:8.1f} KB -> {after_size/1024:8.1f} KB  saved {saved/1024:.1f} KB")

print(f"\nTotal: {total_before/1024:.1f} KB -> {total_after/1024:.1f} KB  total saved {(total_before-total_after)/1024:.1f} KB")
