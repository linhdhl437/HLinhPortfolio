import os
import re

project_dir = "Project/HLinh"
active_files = set()
all_files = []

# 1. Walk through all files in HLinh to register everything
for root, dirs, files in os.walk(project_dir):
    # Skip scratch and git folders
    if "scratch" in root or ".git" in root:
        continue
    for file in files:
        full_path = os.path.join(root, file)
        rel_path = os.path.relpath(full_path, project_dir).replace("\\", "/")
        all_files.append(rel_path)

# Add the main entrypoints
active_files.add("index.html")
active_files.add("stage_details.html")

# 2. Helper to scan content for references
def scan_text_for_references(text):
    refs = []
    # Match href, src, url() patterns
    patterns = [
        r'href=["\']([^"\']+)["\']',
        r'src=["\']([^"\']+)["\']',
        r'url\(["\']?([^"\')]+)["\']?\)'
    ]
    for pat in patterns:
        for match in re.finditer(pat, text):
            ref = match.group(1).strip()
            # Remove hash or query params
            ref = ref.split("?")[0].split("#")[0]
            if ref.startswith("./"):
                ref = ref[2:]
            # Ignore external URLs
            if ref.startswith("http") or ref.startswith("//") or not ref:
                continue
            refs.append(ref)
    return refs

# Scan HTML files
for h_file in ["index.html", "stage_details.html"]:
    path = os.path.join(project_dir, h_file)
    if os.path.exists(path):
        content = open(path, "r", encoding="utf-8").read()
        for ref in scan_text_for_references(content):
            active_files.add(ref)

# Scan CSS files
css_dir = os.path.join(project_dir, "css")
if os.path.exists(css_dir):
    for f in os.listdir(css_dir):
        if f.endswith(".css"):
            content = open(os.path.join(css_dir, f), "r", encoding="utf-8").read()
            for ref in scan_text_for_references(content):
                if ref.startswith("../"):
                    resolved = ref[3:]
                else:
                    resolved = f"css/{ref}"
                active_files.add(resolved)
                
# Scan JS files
js_dir = os.path.join(project_dir, "js")
if os.path.exists(js_dir):
    for f in os.listdir(js_dir):
        if f.endswith(".js"):
            content = open(os.path.join(js_dir, f), "r", encoding="utf-8").read()
            for ref in scan_text_for_references(content):
                active_files.add(ref)

# Let's clean and match
used_files = []
unused_files = []

for file in all_files:
    is_used = False
    
    # Check if this exact file is in active_files
    if file in active_files:
        is_used = True
    else:
        # Check if the file's parent path matches any active reference directory
        # e.g., if a directory path starts with a reference
        for ref in active_files:
            if not ref:
                continue
            # If the reference is a directory like "css" or "PortfolioAssets/CHẬNG 1",
            # check if the file is inside that directory
            if file.startswith(ref + "/"):
                is_used = True
                break
                
    if is_used:
        used_files.append(file)
    else:
        # Ignore some standard files
        if file.startswith("scratch/"):
            continue
        unused_files.append(file)

print(f"Corrected Total files: {len(all_files)}")
print(f"Corrected Active files: {len(used_files)}")
print(f"Corrected Unused files: {len(unused_files)}")

# Save to output file
with open("Project/HLinh/scratch/file_inventory_results.txt", "w", encoding="utf-8") as f:
    f.write("FILE INVENTORY RESULTS\n")
    f.write("======================\n\n")
    f.write("■ ACTIVE FILES (USED BY WEBSITE)\n")
    f.write("-------------------------------\n")
    for item in sorted(used_files):
        f.write(f"  * {item}\n")
        
    f.write("\n■ UNUSED FILES (OBSOLETE / LEFT-OVERS)\n")
    f.write("-------------------------------------\n")
    for item in sorted(unused_files):
        f.write(f"  * {item}\n")
