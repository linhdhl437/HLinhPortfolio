content = open('Project/HLinh/PortfolioAssets/CHẶNG 6/index.html', 'r', encoding='utf-8').read()
marker = '<div class="ethics-infographic">'
if marker in content:
    idx = content.find(marker)
    with open('Project/HLinh/scratch/c6_end.html', 'w', encoding='utf-8') as f:
        f.write(content[idx:])
    print("Found ethics-infographic in body.")
else:
    # Try other options
    print("Not found exactly.")
