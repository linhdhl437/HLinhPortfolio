import os
import shutil

project_dir = "Project/HLinh"
backup_dir = "Project/Hlinh_DUPHONG/HLinh_Backup"
next_dir = "Project/HLinh_Next"

results_file = "Project/HLinh/scratch/file_inventory_results.txt"

if not os.path.exists(results_file):
    print("Inventory file not found. Run inventory_project.py first.")
    exit(1)

# Parse unused files from the results file
unused_files = []
is_unused_section = False

for line in open(results_file, "r", encoding="utf-8"):
    line_str = line.strip()
    if "■ UNUSED FILES" in line_str:
        is_unused_section = True
        continue
    if is_unused_section and line_str.startswith("*"):
        file_path = line_str.replace("*", "").strip()
        unused_files.append(file_path)

print(f"Parsed {len(unused_files)} unused files to backup.")

# 1. Move unused files to backup directory
moved_count = 0
for file in unused_files:
    src_path = os.path.join(project_dir, file)
    dst_path = os.path.join(backup_dir, file)
    
    if os.path.exists(src_path):
        # Create destination directories if not exist
        os.makedirs(os.path.dirname(dst_path), exist_ok=True)
        try:
            # Move file
            shutil.move(src_path, dst_path)
            moved_count += 1
        except Exception as e:
            print(f"Error moving {file}: {e}")
    else:
        print(f"File not found: {file}")

print(f"Successfully moved {moved_count} unused files to {backup_dir}.")

# Clean up empty directories in HLinh recursively
def remove_empty_dirs(path):
    if not os.path.isdir(path):
        return
    # list all files/dirs
    for entry in os.listdir(path):
        full_path = os.path.join(path, entry)
        if os.path.isdir(full_path):
            remove_empty_dirs(full_path)
            
    # if empty now, delete it
    if not os.listdir(path):
        os.rmdir(path)
        print(f"Removed empty directory: {path}")

# Run empty dir cleanup
remove_empty_dirs(project_dir)

# 2. Delete HLinh_Next folder
if os.path.exists(next_dir):
    try:
        shutil.rmtree(next_dir)
        print(f"Successfully deleted {next_dir} folder.")
    except Exception as e:
        print(f"Error deleting {next_dir}: {e}")
else:
    print(f"Folder {next_dir} does not exist.")
