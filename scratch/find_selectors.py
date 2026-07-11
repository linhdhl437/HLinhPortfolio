import os

def find_selector(lines, line_idx):
    # Search backwards for the selector name
    brace_depth = 0
    for i in range(line_idx, -1, -1):
        line = lines[i].strip()
        if '}' in line:
            brace_depth += line.count('}')
        if '{' in line:
            brace_depth -= line.count('{')
            if brace_depth < 0:
                # We found the block start, the line above or this line contains the selector
                selector = []
                for j in range(max(0, i-2), i+1):
                    selector.append(lines[j].strip())
                return " ".join(selector)
    return "Unknown"

for f in ['components.css', 'sections.css']:
    path = os.path.join('Project/HLinh/css', f)
    if os.path.exists(path):
        lines = open(path, 'r', encoding='utf-8').read().split('\n')
        print(f"\n=== FILE: {f} ===")
        for idx, line in enumerate(lines):
            if 'backdrop-filter' in line:
                sel = find_selector(lines, idx)
                print(f"Line {idx+1}: {line.strip()} | Selector context: {sel}")
