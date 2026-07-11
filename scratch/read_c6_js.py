# Read stage-content.js using simple string splitting with correct key stage6
content = open('Project/HLinh/js/stage-content.js', 'r', encoding='utf-8').read()
start_marker = 'stage6: `'
# The last part ends with };
end_marker = '`\n};'
if start_marker in content:
    stage6_html = content.split(start_marker)[1].split(end_marker)[0]
    with open('Project/HLinh/scratch/c6_js_content.html', 'w', encoding='utf-8') as f:
        f.write(stage6_html)
    print("Stage 6 HTML written to scratch/c6_js_content.html.")
else:
    print("Stage 6 marker not found.")
