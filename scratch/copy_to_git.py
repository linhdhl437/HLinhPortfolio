import os
import shutil

src_dir = "Project/HLinh"
dest_dir = "D:/GithubDesktopClone/HLinhPortfolio"

with open("Project/HLinh/scratch/changed_files.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

copied_count = 0
for line in lines:
    line = line.strip()
    if not line:
        continue
    status, rel_path = line.split(": ", 1)
    src_file = os.path.join(src_dir, rel_path)
    dest_file = os.path.join(dest_dir, rel_path)
    
    if os.path.exists(src_file):
        os.makedirs(os.path.dirname(dest_file), exist_ok=True)
        shutil.copy2(src_file, dest_file)
        print(f"Copied: {rel_path}")
        copied_count += 1
    else:
        print(f"Warning: source file not found {rel_path}")

print(f"Finished copying {copied_count} files.")
