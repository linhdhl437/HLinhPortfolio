import os
import fitz

# 1. Export Chặng 5 PDF
pdf5_path = "Project/HLinh/PortfolioAssets/CHẶNG 5/Sản phẩm infographic C5.pdf"
img5_dir = "Project/HLinh/PortfolioAssets/CHẶNG 5/Image"
os.makedirs(img5_dir, exist_ok=True)

if os.path.exists(pdf5_path):
    doc = fitz.open(pdf5_path)
    print(f"Chặng 5 PDF pages: {len(doc)}")
    for i, page in enumerate(doc):
        pix = page.get_pixmap(matrix=fitz.Matrix(3.0, 3.0))
        out_name = f"Sản phẩm infographic C5.png" if len(doc) == 1 else f"Sản phẩm infographic C5_{i+1}.png"
        pix.save(os.path.join(img5_dir, out_name))
        print(f"Saved Chặng 5 page {i+1} to {out_name}")
else:
    print("Chặng 5 PDF not found.")

# 2. Export Chặng 6 PDF
pdf6_path = "Project/HLinh/PortfolioAssets/CHẶNG 6/Sản phẩm infographic C6.pdf"
img6_dir = "Project/HLinh/PortfolioAssets/CHẶNG 6/Image"
os.makedirs(img6_dir, exist_ok=True)

if os.path.exists(pdf6_path):
    doc = fitz.open(pdf6_path)
    print(f"Chặng 6 PDF pages: {len(doc)}")
    for i, page in enumerate(doc):
        pix = page.get_pixmap(matrix=fitz.Matrix(3.0, 3.0))
        out_name = f"Sản phẩm infographic C6.png" if len(doc) == 1 else f"Sản phẩm infographic C6_{i+1}.png"
        pix.save(os.path.join(img6_dir, out_name))
        print(f"Saved Chặng 6 page {i+1} to {out_name}")
else:
    print("Chặng 6 PDF not found.")
