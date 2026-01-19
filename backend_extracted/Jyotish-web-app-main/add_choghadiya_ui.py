#!/usr/bin/env python3

with open('/Users/ajitsingh/Downloads/Ops360-Jyotish/frontend1/src/components/PanchaangViewEnhanced.tsx', 'r') as f:
    content = f.read()

choghadiya_section = '''        {/* Day Choghadiya - Temporal Qualities */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
            ⚡ Day Choghadiya - Temporal Qualities
          </h2>
          <p className="text-gray-400 mb-6">Eight temporal divisions of the day with their specific qualities and timings.</p>
          
          {panchaang.choghadiya && panchaang.choghadiya.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {panchaang.choghadiya.map((chog: any) => (
                <div
                  key={chog.index}
                  className="rounded-lg p-4 border-2 transition-all hover:shadow-lg"
                  style={{
                    backgroundColor: chog.color + "20",
                    borderColor: chog.color,
                  }}
                >
                  <p className="text-xs text-gray-400 mb-1">Chog {chog.index}</p>
                  <p className="text-base font-bold text-white mb-2">{chog.quality}</p>
                  <p className="text-xs text-gray-300 mb-2">{chog.meaning}</p>
                  <p className="text-xs font-semibold text-white">{chog.start_time} - {chog.end_time}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No Choghadiya data available</p>
          )}
        </div>

'''

old_marker = '        {/* Caution Periods - Inauspicious Times */}'
if old_marker in content:
    content = content.replace(old_marker, choghadiya_section + old_marker)
    with open('/Users/ajitsingh/Downloads/Ops360-Jyotish/frontend1/src/components/PanchaangViewEnhanced.tsx', 'w') as f:
        f.write(content)
    print("Choghadiya section added successfully")
else:
    print("ERROR: Could not find marker")
