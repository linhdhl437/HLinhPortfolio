content = open('Project/HLinh/PortfolioAssets/CHẶNG 5/index.html', 'r', encoding='utf-8').read()
marker = '<div class="infographic-mockup">'
if marker in content:
    idx = content.find(marker)
    with open('Project/HLinh/scratch/c5_end.html', 'w', encoding='utf-8') as f:
        f.write(content[idx:])
    print("Found infographic-mockup in body.")
else:
    # Try case insensitive or spaces
    print("Not found exactly.")
