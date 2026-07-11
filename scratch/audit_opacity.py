import os
import re

css_dir = "Project/HLinh/css"
html_files = ["Project/HLinh/index.html", "Project/HLinh/stage_details.html"]

opacity_patterns = [
    r'rgba\([^)]+\)',
    r'opacity\s*:\s*[0-9.]+'
]

out_summary = []

# Audit CSS files
for filename in os.listdir(css_dir):
    if filename.endswith(".css"):
        path = os.path.join(css_dir, filename)
        lines = open(path, "r", encoding="utf-8").readlines()
        for i, line in enumerate(lines):
            for pat in opacity_patterns:
                if re.search(pat, line):
                    out_summary.append({
                        "file": f"css/{filename}",
                        "line": i + 1,
                        "content": line.strip(),
                        "type": "rgba" if "rgba" in line else "opacity"
                    })

# Audit HTML files style blocks or inline styles
for html_path in html_files:
    if os.path.exists(html_path):
        lines = open(html_path, "r", encoding="utf-8").readlines()
        for i, line in enumerate(lines):
            for pat in opacity_patterns:
                if re.search(pat, line):
                    out_summary.append({
                        "file": os.path.basename(html_path),
                        "line": i + 1,
                        "content": line.strip(),
                        "type": "rgba" if "rgba" in line else "opacity"
                    })

# Group and compile findings
print(f"Audited {len(out_summary)} instances of opacity settings.")
with open("Project/HLinh/scratch/opacity_audit_results.txt", "w", encoding="utf-8") as f:
    f.write("COMPREHENSIVE OPACITY AUDIT RESULTS\n")
    f.write("===================================\n\n")
    for item in out_summary:
        f.write(f"File: {item['file']}:{item['line']}\n")
        f.write(f"Content: {item['content']}\n")
        f.write(f"Type: {item['type']}\n")
        f.write("-" * 40 + "\n")
