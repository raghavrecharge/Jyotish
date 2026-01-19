#!/usr/bin/env python3
import os

file_path = '/Users/ajitsingh/Downloads/Ops360-Jyotish/backend/app/api/panchaang.py'

with open(file_path, 'r') as f:
    content = f.read()

# Define the choghadiya function
choghadiya_func = '''
def calculate_choghadiya(sunrise_dt, sunset_dt, weekday):
    """Calculate Day Choghadiya - 8 divisions of the day with their qualities."""
    if not sunrise_dt or not sunset_dt:
        return []
    
    quality_meanings = {
        "Labh": {"meaning": "Gain", "color": "#22c55e"},
        "Amrit": {"meaning": "Best", "color": "#06b6d4"},
        "Kaal": {"meaning": "Bad", "color": "#ef4444"},
        "Shubh": {"meaning": "Good", "color": "#f59e0b"},
        "Rog": {"meaning": "Disease", "color": "#ec4899"},
    }
    
    day_duration = (sunset_dt - sunrise_dt).total_seconds() / 60
    segment_duration = day_duration / 8
    
    start_qualities = [
        ["Labh", "Amrit", "Kaal", "Shubh", "Rog", "Kaal", "Labh", "Amrit"],
        ["Amrit", "Shubh", "Rog", "Kaal", "Labh", "Amrit", "Shubh", "Rog"],
        ["Shubh", "Rog", "Kaal", "Labh", "Amrit", "Shubh", "Rog", "Kaal"],
        ["Rog", "Kaal", "Labh", "Amrit", "Shubh", "Rog", "Kaal", "Labh"],
        ["Kaal", "Labh", "Amrit", "Shubh", "Rog", "Kaal", "Labh", "Amrit"],
        ["Labh", "Amrit", "Shubh", "Rog", "Kaal", "Labh", "Amrit", "Shubh"],
        ["Amrit", "Shubh", "Rog", "Kaal", "Labh", "Amrit", "Shubh", "Rog"]
    ]
    
    choghadiya_list = []
    qualities_today = start_qualities[weekday % 7]
    
    for idx in range(8):
        start_time = sunrise_dt + timedelta(minutes=idx * segment_duration)
        end_time = start_time + timedelta(minutes=segment_duration)
        quality = qualities_today[idx]
        
        choghadiya_list.append({
            "index": idx + 1,
            "quality": quality,
            "meaning": quality_meanings.get(quality, {}).get("meaning", quality),
            "start_time": start_time.strftime("%H:%M"),
            "end_time": end_time.strftime("%H:%M"),
            "color": quality_meanings.get(quality, {}).get("color", "#64748b"),
        })
    
    return choghadiya_list

'''

# Find where to insert (before calculate_panchaang)
insert_pos = content.find('def calculate_panchaang(')
if insert_pos > 0:
    content = content[:insert_pos] + choghadiya_func + '\n' + content[insert_pos:]
    
    # Now find the return statement in calculate_panchaang and add choghadiya
    # Find "weekday": additional["weekday"]
    weekday_pos = content.find('"weekday": additional["weekday"]')
    if weekday_pos > 0:
        # Find the closing brace after this line
        closing_pos = content.find('}', weekday_pos)
        if closing_pos > 0:
            chog_line = ',\n            "choghadiya": calculate_choghadiya(sun_times.get("sunrise_dt"), sun_times.get("sunset_dt"), birth_datetime.weekday())'
            content = content[:closing_pos] + chog_line + content[closing_pos:]
    
    with open(file_path, 'w') as f:
        f.write(content)
    print("Successfully added choghadiya function and updated panchaang response")
else:
    print("ERROR: Could not find calculate_panchaang function")
