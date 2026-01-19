import swisseph as swe
from datetime import datetime
import pytz

birth = datetime(1990, 9, 20, 15, 15, 0)
tz = pytz.timezone('Asia/Kolkata')
birth_utc = tz.localize(birth).astimezone(pytz.UTC)
jd = swe.julday(birth_utc.year, birth_utc.month, birth_utc.day,
                birth_utc.hour + birth_utc.minute/60.0)

swe.set_sid_mode(swe.SIDM_LAHIRI)
flags = swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL

print("Testing if Rahu (True Node) could be Atmakaraka:")
print("=" * 70)

# Mean Node (what we use)
mean_node = swe.calc_ut(jd, swe.MEAN_NODE, flags)
mean_lon = mean_node[0][0]
mean_deg = mean_lon % 30

# True Node
true_node = swe.calc_ut(jd, swe.TRUE_NODE, flags)
true_lon = true_node[0][0]
true_deg = true_lon % 30

print(f"Rahu Mean Node: {mean_lon:.2f}° ({mean_deg:.2f}° in rasi)")
print(f"Rahu True Node: {true_lon:.2f}° ({true_deg:.2f}° in rasi)")
print(f"\nSaturn: 264.98° (24.98° in rasi)")
print()

if true_deg > 24.98:
    print(f"✓ True Node Rahu ({true_deg:.2f}°) > Saturn (24.98°)")
    print("So Rahu would be Atmakaraka if using True Node!")
    
    # Calculate Rahu's D9
    rahu_rasi = int(true_lon / 30.0)
    rahu_deg_in_rasi = true_lon % 30.0
    
    fiery = [0, 4, 8]
    earthy = [1, 5, 9]
    airy = [2, 6, 10]
    watery = [3, 7, 11]
    
    division_size = 30.0 / 9
    division_index = int(rahu_deg_in_rasi / division_size)
    
    if rahu_rasi in fiery:
        navamsa_start = rahu_rasi
    elif rahu_rasi in earthy:
        navamsa_start = 9
    elif rahu_rasi in airy:
        navamsa_start = 6
    else:
        navamsa_start = 3
    
    d9_rasi = ((navamsa_start + division_index) % 12) + 1
    
    print(f"\nRahu D1 Rasi: {rahu_rasi + 1}")
    print(f"Rahu degree in rasi: {rahu_deg_in_rasi:.2f}°")
    print(f"Rahu D9 Rasi: {d9_rasi}")
    
    if d9_rasi == 8:
        print("\n✓✓✓ MATCH! Rahu's D9 is Rasi 8 (Scorpio)!")
        print("This explains why Karakamsha is Rasi 8 in AstroSage!")
    else:
        print(f"\n✗ Rahu D9 is {d9_rasi}, not 8")
else:
    print(f"✗ True Node Rahu ({true_deg:.2f}°) < Saturn (24.98°)")
    print("Saturn remains Atmakaraka even with True Node")
