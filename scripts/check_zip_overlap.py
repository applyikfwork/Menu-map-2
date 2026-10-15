import zipfile
import csv
import io
import re
import glob

# Load existing restaurant names and slugs from TS files
existing_names = set()
existing_slugs = set()

ts_files = glob.glob('src/data/venues/*.ts') + glob.glob('src/lib/*Venues.ts') + ['src/lib/seedData.ts', 'src/lib/sample50Cafes.ts']

for fpath in ts_files:
    try:
        with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            names = re.findall(r'name["\']?\s*:\s*["\']([^"\']+)["\']', content)
            slugs = re.findall(r'slug["\']?\s*:\s*["\']([^"\']+)["\']', content)
            for n in names:
                existing_names.add(n.strip().lower())
            for s in slugs:
                existing_slugs.add(s.strip().lower())
    except Exception as e:
        pass

print(f"Total unique existing names loaded from codebase: {len(existing_names)}")
print(f"Total unique existing slugs loaded from codebase: {len(existing_slugs)}")

zip_path = r'C:/Users/kavit/.gemini/antigravity/brain/0dab2ae1-4353-441e-9247-f419192af408/.user_uploaded/media_1791910240497_f07e25cd.zip'

with zipfile.ZipFile(zip_path, 'r') as z:
    for name in z.namelist():
        content = z.read(name).decode('utf-8', errors='ignore')
        reader = csv.reader(io.StringIO(content))
        header = next(reader, None)
        file_rests = set()
        overlap = set()
        loc_sample = set()
        for row in reader:
            if not row or len(row) < 3:
                continue
            rname = row[0].strip()
            file_rests.add(rname)
            loc = row[1].strip() if len(row) > 1 else ''
            loc_sample.add(loc)
            if rname.lower() in existing_names:
                overlap.add(rname)
        print(f"\n--- {name} ---")
        print(f"Locality: {loc_sample}")
        print(f"Total restaurants in file: {len(file_rests)}")
        print(f"Overlapping brand names: {len(overlap)}")
        if overlap:
            print(f"Sample overlapping brands: {list(overlap)[:5]}")
