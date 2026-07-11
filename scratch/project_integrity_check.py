import os
import re
import json

project_dir = "Project/HLinh"
stage_content_path = "Project/HLinh/js/stage-content.js"
index_path = "Project/HLinh/index.html"
details_path = "Project/HLinh/stage_details.html"

findings = {
    "missing_images": [],
    "placeholders": [],
    "spelling_suspicious": [],
    "broken_links": [],
    "css_mismatches": []
}

# 1. Check stage-content.js content and resources
if os.path.exists(stage_content_path):
    js_content = open(stage_content_path, "r", encoding="utf-8").read()
    # Extract stageContents JSON/Object content
    # Find all image paths referenced in stageContents
    img_refs = re.findall(r'src=["\']([^"\']+)["\']', js_content)
    for img_ref in img_refs:
        # Resolve path relative to project_dir
        if img_ref.startswith("./"):
            img_ref = img_ref[2:]
        full_img_path = os.path.join(project_dir, img_ref)
        if not os.path.exists(full_img_path) and not img_ref.startswith("http"):
            findings["missing_images"].append({
                "ref": img_ref,
                "context": "stage-content.js"
            })
            
    # Check for text placeholders or remnants
    remnants = ["ViTriChenAnh", "ViTriChenAnh", "placeholder", "[Ảnh", "Ảnh chèn", "Trang 1", "Trang 2", "Trang 3"]
    # Check specifically for "ViTriChenAnh" or raw [Ảnh] placeholders
    for rem in ["ViTriChenAnh", "TODO", "placeholder", "chenanh"]:
        matches = re.findall(rf'([^\n]{0,30}{rem}[^\n]{0,30})', js_content, re.IGNORECASE)
        for m in matches:
            findings["placeholders"].append({
                "marker": rem,
                "text": m.strip()
            })

# 2. Check index.html for dead links
if os.path.exists(index_path):
    index_content = open(index_path, "r", encoding="utf-8").read()
    # Check image refs in index.html
    img_refs = re.findall(r'src=["\']([^"\']+)["\']', index_content)
    for img_ref in img_refs:
        if img_ref.startswith("./"):
            img_ref = img_ref[2:]
        full_img_path = os.path.join(project_dir, img_ref)
        if not os.path.exists(full_img_path) and not img_ref.startswith("http") and not img_ref.startswith("data:"):
            findings["missing_images"].append({
                "ref": img_ref,
                "context": "index.html"
            })

# 3. Check for spelling/grammar errors in Vietnamese
# We check stage-content.js for specific common typos like doubled letters, invalid marks
# e.g. "nôi dung", "hanh trinh", "tiến trình", "chuẩn bị", "thông tin"
vietnamese_common_checks = [
    (r'\bhoat\b', "hoạt"),
    (r'\bnghiem\b', "nghiệm"),
    (r'\btiên\b', "tiến"),
    (r'\btrnag\b', "trang"),
    (r'\bchặn\b', "chặng"), # wait, "chặng" is correct, but let's check if "chặn" was used when "chặng" is meant
]

# Let's search inside stage-content.js
if os.path.exists(stage_content_path):
    js_content = open(stage_content_path, "r", encoding="utf-8").read()
    for pattern, correct in vietnamese_common_checks:
        matches = re.findall(pattern, js_content, re.IGNORECASE)
        if matches:
            findings["spelling_suspicious"].append({
                "pattern": pattern,
                "count": len(matches),
                "suggested": correct
            })

# Write audit report
report_path = "Project/HLinh/scratch/project_integrity_report.txt"
with open(report_path, "w", encoding="utf-8") as f:
    f.write("PROJECT INTEGRITY AUDIT REPORT\n")
    f.write("==============================\n\n")
    
    f.write("1. MISSING RESOURCE / BROKEN IMAGE CHECKS\n")
    f.write("------------------------------------------\n")
    if findings["missing_images"]:
        for item in findings["missing_images"]:
            f.write(f"  * [MISSING] {item['ref']} (Referenced in {item['context']})\n")
    else:
        f.write("  * Zero missing images detected! All references exist on disk.\n")
        
    f.write("\n2. UNRESOLVED PLACEHOLDERS & TEMPLATE REMNANTS\n")
    f.write("----------------------------------------------\n")
    if findings["placeholders"]:
        for item in findings["placeholders"]:
            f.write(f"  * [PLACEHOLDER] Found '{item['marker']}' in text:\n")
            f.write(f"    Context: \"... {item['text']} ...\"\n")
    else:
        f.write("  * Zero placeholders detected! Content is fully compiled and clean.\n")

    f.write("\n3. SUSPICIOUS SPELLING / FORMATTING PATTERNS\n")
    f.write("--------------------------------------------\n")
    if findings["spelling_suspicious"]:
        for item in findings["spelling_suspicious"]:
            f.write(f"  * Found pattern matching {item['pattern']} ({item['count']} times). Suggested correct: '{item['suggested']}'\n")
    else:
        f.write("  * Zero obvious Vietnamese spelling typos found in scanned patterns.\n")

print("Integrity report written successfully.")
print(f"Missing images: {len(findings['missing_images'])}")
print(f"Placeholders: {len(findings['placeholders'])}")
print(f"Spelling patterns: {len(findings['spelling_suspicious'])}")
