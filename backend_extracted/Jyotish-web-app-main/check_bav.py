#!/usr/bin/env python3
import mysql.connector
from mysql.connector import Error

try:
    conn = mysql.connector.connect(
        host='127.0.0.1',
        user='astrojyotish',
        password='password123',
        database='astrojyotish'
    )
    
    cursor = conn.cursor(dictionary=True)
    
    # Get BAV matrix for comparison
    query = "SELECT house, sun, moon, mars, mercury, jupiter, venus, saturn FROM ashtakavarga_bav WHERE profile_id = 1 ORDER BY house"
    cursor.execute(query)
    bav_results = cursor.fetchall()
    
    print("\nBAV Matrix (Profile 1):")
    print("House | Sun | Moon | Mars | Merc | Jupi | Venu | Satu | Total")
    print("------|-----|------|------|------|------|------|------|-------")
    totals = []
    for row in bav_results:
        total = row['sun'] + row['moon'] + row['mars'] + row['mercury'] + row['jupiter'] + row['venus'] + row['saturn']
        totals.append(total)
        print(f"  {row['house']:2d}  |  {row['sun']} |  {row['moon']}   |  {row['mars']}   |  {row['mercury']}   |  {row['jupiter']}   |  {row['venus']}   |  {row['saturn']}   |  {total:2d}")
    
    print(f"\nTotal across all houses: {sum(totals)}")
    print(f"Average per house: {sum(totals)/len(totals):.2f}")
    
    # Reference from user's screenshot
    print("\n\nREFERENCE DATA (from user screenshot):")
    ref_data = {
        1: 31, 2: 29, 3: 39, 4: 30, 5: 19, 6: 19, 7: 31, 8: 28, 9: 27, 10: 27, 11: 28, 12: 29
    }
    
    print("House | Reference | Current | Diff")
    print("------|-----------|---------|------")
    total_diff = 0
    for house in range(1, 13):
        ref = ref_data[house]
        curr = totals[house-1]
        diff = curr - ref
        total_diff += abs(diff)
        print(f"  {house:2d}  |    {ref:2d}     |   {curr:2d}    |  {diff:+3d}")
    
    print(f"\nTotal reference: {sum(ref_data.values())}")
    print(f"Total current: {sum(totals)}")
    print(f"Total absolute difference: {total_diff}")
    
    cursor.close()
    conn.close()
    
except Error as e:
    print(f"Error: {e}")
