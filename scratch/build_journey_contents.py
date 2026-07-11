import os
import re
import sys
from bs4 import BeautifulSoup

# Reconfigure stdout to use UTF-8
sys.stdout.reconfigure(encoding='utf-8')

# Source directories
assets_dir = "Project/HLinh/PortfolioAssets"
output_js = "Project/HLinh/js/stage-content.js"

def get_stage_folder(stage_num):
    for item in os.listdir(assets_dir):
        path = os.path.join(assets_dir, item)
        if os.path.isdir(path):
            if str(stage_num) in item:
                return path
    raise FileNotFoundError(f"Could not find folder for Stage {stage_num} in {assets_dir}")

def scope_css(css_text, wrapper_class=".stage-document-wrapper"):
    if not css_text:
        return ""
        
    # Replace body selector with wrapper class
    css_text = re.sub(r'\bbody\b', wrapper_class, css_text)
    
    # Split by curly braces to find selectors and declarations
    # A simple but effective parser for scoping CSS
    # Handles basic media queries and standard rules
    parts = re.split(r'([{}])', css_text)
    
    scoped_parts = []
    in_declarations = False
    in_media_query = False
    
    for part in parts:
        if part == '{':
            scoped_parts.append(part)
            in_declarations = True
        elif part == '}':
            scoped_parts.append(part)
            in_declarations = False
            # If we were in media query, check if it's ending
            # (Basic assumption that media query block ends with })
        else:
            part_strip = part.strip()
            if not part_strip:
                scoped_parts.append(part)
                continue
                
            if in_declarations:
                # Inside rule declarations, do not scope
                scoped_parts.append(part)
            else:
                # This is a selector list (e.g. h1, .class) or media query definition
                if part_strip.startswith('@media') or part_strip.startswith('@keyframes'):
                    scoped_parts.append(part)
                else:
                    # Split selectors by comma to prefix each individually
                    selectors = part_strip.split(',')
                    scoped_selectors = []
                    for sel in selectors:
                        sel = sel.strip()
                        if not sel:
                            continue
                        if sel.startswith(wrapper_class):
                            scoped_selectors.append(sel)
                        else:
                            scoped_selectors.append(f"{wrapper_class} {sel}")
                    scoped_parts.append(", ".join(scoped_selectors) + " ")
                    
    return "".join(scoped_parts)

def parse_stage_html(stage_num):
    folder = get_stage_folder(stage_num)
    folder_basename = os.path.basename(folder)
    index_path = os.path.join(folder, "index.html")
    
    print(f"Parsing Stage {stage_num} index.html from {index_path}...")
    
    # Load HTML
    html_text = open(index_path, "r", encoding="utf-8").read()
    soup = BeautifulSoup(html_text, "html.parser")
    
    # 1. Extract CSS and scope it
    style_text = ""
    if soup.style:
        style_text = soup.style.string or ""
        
    scoped_css = scope_css(style_text, wrapper_class=".stage-document-wrapper")
    
    # 2. Extract Document Container
    doc_container = soup.find(class_="document-container")
    if not doc_container:
        # Fallback to body content if document-container is not found
        doc_container = soup.body
        
    if not doc_container:
        raise ValueError(f"Could not find document-container or body in Stage {stage_num} index.html")
        
    # 2b. Remove page break indicators completely for seamless reading (including table rows)
    trang_texts = doc_container.find_all(string=re.compile(r'---\s*Trang'))
    for text_node in trang_texts:
        parent = text_node.parent
        if not parent:
            continue
        if parent.name == 'td':
            tr = parent.parent
            if tr and tr.name == 'tr':
                tr.decompose()
        else:
            parent.decompose()
            
    for indicator in doc_container.find_all(class_="page-break-indicator"):
        indicator.decompose()
        
    # 3. Clean up back links and image notes
    for back_link in doc_container.find_all(class_="back-link"):
        back_link.decompose()
        
    for note in doc_container.find_all(class_="image-note"):
        note.decompose()
        
    # 4. Rewrite image paths to point to PortfolioAssets and add lightbox attributes
    for img in doc_container.find_all("img"):
        src = img.get("src")
        if src:
            src_clean = src.lstrip("./").replace("\\", "/")
            # Check if the image exists at the root PortfolioAssets/ directory, otherwise use stage subfolder
            root_path = os.path.join(assets_dir, src_clean)
            stage_path = os.path.join(assets_dir, folder_basename, src_clean)
            if os.path.exists(root_path) and not os.path.exists(stage_path):
                img["src"] = f"./PortfolioAssets/{src_clean}"
            else:
                img["src"] = f"./PortfolioAssets/{folder_basename}/{src_clean}"
            
        # Add Lightbox capability
        img["data-lightbox"] = ""
        # Add class for cursor pointer zoom
        classes = img.get("class", [])
        if isinstance(classes, str):
            classes = [classes]
        if "cursor-zoom" not in classes:
            classes.append("cursor-zoom")
        img["class"] = classes
        
    container_html = str(doc_container)
    
    # 5. Combine scoped style and wrapped HTML content
    full_html = f"<style>\n{scoped_css}\n</style>\n<div class=\"stage-document-wrapper\">\n{container_html}\n</div>"
    
    # Replace backticks with escaped backticks to avoid JS string literal syntax errors
    full_html = full_html.replace("`", "\\`").replace("${", "\\${")
    
    return full_html

def main():
    print("Beginning compilation of stage-content.js directly from index.html files...")
    
    try:
        stage1_html = parse_stage_html(1)
        stage2_html = parse_stage_html(2)
        stage3_html = parse_stage_html(3)
        stage4_html = parse_stage_html(4)
        stage5_html = parse_stage_html(5)
        stage6_html = parse_stage_html(6)
    except Exception as e:
        print(f"Error during HTML parsing: {e}")
        sys.exit(1)
        
    print(f"Writing database to {output_js}...")
    
    js_content = f"""/* 🎋 Dynamic Stage Content Database for HLinh Portfolio - Compiled from index.html */
window.stageContents = {{
  stage1: `{stage1_html}`,
  stage2: `{stage2_html}`,
  stage3: `{stage3_html}`,
  stage4: `{stage4_html}`,
  stage5: `{stage5_html}`,
  stage6: `{stage6_html}`
}};
"""

    with open(output_js, "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print("Success! stage-content.js generated with zero manual edits.")

if __name__ == "__main__":
    main()
