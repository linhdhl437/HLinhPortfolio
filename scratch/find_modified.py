import os
import filecmp

src_dir = "Project/HLinh"
dest_dir = "D:/GithubDesktopClone/HLinhPortfolio"

def compare_dirs(dir1, dir2):
    diffs = []
    for root, dirs, files in os.walk(dir1):
        # Ignore scratch or temp folders
        if "scratch" in root or ".git" in root or "HLinh_DUPHONG" in root:
            continue
        for file in files:
            rel_path = os.path.relpath(os.path.join(root, file), dir1)
            dest_file = os.path.join(dir2, rel_path)
            if not os.path.exists(dest_file):
                diffs.append(("untracked/new", rel_path))
            else:
                if not filecmp.cmp(os.path.join(root, file), dest_file, shallow=False):
                    diffs.append(("modified", rel_path))
    return diffs

diff_list = compare_dirs(src_dir, dest_dir)
with open("Project/HLinh/scratch/changed_files.txt", "w", encoding="utf-8") as f:
    for status, rel_path in diff_list:
        f.write(f"{status}: {rel_path}\n")
print(f"Found {len(diff_list)} differences.")
