import os

results_path = "Project/HLinh/scratch/opacity_audit_results.txt"
guide_path = "Project/HLinh/scratch/opacity_customization_guide.txt"

if not os.path.exists(results_path):
    print("Audit file not found.")
    exit(1)

content = open(results_path, "r", encoding="utf-8").read()
blocks = content.split("-" * 40)

categories = {
    "1. Nền giấy & Thẻ (Paper & Card Backgrounds)": [],
    "2. Đường viền mờ (Transparent Borders)": [],
    "3. Hiệu ứng Hover & Trạng thái hoạt động (Hover & Active States)": [],
    "4. Hiệu ứng tải trang & Đèn nền (Loading Screen & Ambient Glow)": [],
    "5. Các trang báo cáo chi tiết (stage_details.html & Scoped Styles)": []
}

for block in blocks:
    lines = [l.strip() for l in block.strip().split("\n") if l.strip()]
    if len(lines) < 3:
        continue
    
    file_info = lines[0].replace("File: ", "")
    code_content = lines[1].replace("Content: ", "")
    
    # Categorization logic
    if "stage_details.html" in file_info:
        categories["5. Các trang báo cáo chi tiết (stage_details.html & Scoped Styles)"].append((file_info, code_content))
    elif "rgba" in code_content and ("bg" in code_content or "background" in code_content or "paper" in code_content):
        categories["1. Nền giấy & Thẻ (Paper & Card Backgrounds)"].append((file_info, code_content))
    elif "border" in code_content or "box-shadow" in code_content:
        categories["2. Đường viền mờ (Transparent Borders)"].append((file_info, code_content))
    elif "hover" in code_content or "active" in code_content or "transition" in code_content or "opacity:" in code_content and ("fade" in code_content or "show" in code_content or "hide" in code_content):
        categories["3. Hiệu ứng Hover & Trạng thái hoạt động (Hover & Active States)"].append((file_info, code_content))
    else:
        categories["4. Hiệu ứng tải trang & Đèn nền (Loading Screen & Ambient Glow)"].append((file_info, code_content))

with open(guide_path, "w", encoding="utf-8") as f:
    f.write("🎋 HƯỚNG DẪN CẤU HÌNH ĐỘ TRONG SUỐT (OPACITY & RGBA) CHO HLINH PORTFOLIO 🎋\n")
    f.write("=======================================================================\n\n")
    f.write("Dưới đây là thống kê các vị trí quan trọng quy định độ trong suốt của các hộp chữ, nền giấy\n")
    f.write("và các hiệu ứng. Bạn có thể mở các tệp tin tương ứng và tìm kiếm theo Từ khóa để chỉnh sửa.\n\n")
    
    for cat, items in categories.items():
        if not items:
            continue
        f.write(f"■ {cat}\n")
        f.write("-" * len(cat) + "\n")
        # Deduplicate items in the same file with similar content to keep it concise
        seen = set()
        for file_info, code in items:
            key = (file_info.split(":")[0], code)
            if key in seen:
                continue
            seen.add(key)
            f.write(f"  * Tệp tin: {file_info}\n")
            f.write(f"    Mã CSS:  {code}\n")
        f.write("\n")

print("Guide written successfully.")
