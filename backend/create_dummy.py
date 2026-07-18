import openpyxl

def create_sample_excel(filename="sample_sales.xlsx"):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "SalesData"
    
    headers = ["Product", "Quantity", "UnitPrice", "Region"]
    ws.append(headers)
    
    data = [
        ["Laptop", 5, 1200, "North"],
        ["Keyboard", 25, 45, "East"],
        ["Monitor", 12, 250, "West"],
        ["Mouse", 50, 15, "South"],
        ["Headphones", 15, 80, "North"]
    ]
    
    for row in data:
        ws.append(row)
        
    wb.save(filename)
    print(f"Sample Excel sheet '{filename}' created successfully.")

if __name__ == "__main__":
    create_sample_excel()
