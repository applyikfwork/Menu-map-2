import zipfile
import csv
import io
import re
import glob

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'[^\w-]+', '', text)
    text = re.sub(r'--+', '-', text)
    return text.strip('-')

existing_slugs = set()
ts_files = glob.glob('src/data/venues/*.ts') + glob.glob('src/lib/*Venues.ts')
for fpath in ts_files:
    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
        found = re.findall(r'slug["\']?\s*:\s*["\']([^"\']+)["\']', f.read())
        for s in found:
            existing_slugs.add(s.lower())

print(f"Loaded {len(existing_slugs)} existing slugs.")

zip_path = r'C:/Users/kavit/.gemini/antigravity/brain/0dab2ae1-4353-441e-9247-f419192af408/.user_uploaded/media_1791910240497_f07e25cd.zip'

collisions = []
unique_in_zip = set()
with zipfile.ZipFile(zip_path, 'r') as z:
    for name in z.namelist():
        reader = csv.reader(io.StringIO(z.read(name).decode('utf-8', errors='ignore')))
        next(reader, None)
        for row in reader:
            if not row or len(row) < 3:
                continue
            rname = row[0].strip()
            loc = row[1].strip()
            rslug = slugify(f"{rname}-{loc}")
            unique_in_zip.add((name, rname, loc, rslug))
            if rslug in existing_slugs:
                collisions.append((name, rname, loc, rslug))

print(f"Total unique restaurant entities across zip: {len(unique_in_zip)}")
print(f"Total slug collisions with previously added venues: {len(collisions)}")
if collisions:
    for c in collisions:
        print("  Collision:", c)
else:
    print("  0 collisions! All restaurants and localities in this zip are 100% brand new!")
