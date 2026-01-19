// Test frontend transformation logic
const data = {
    d1: {
        chart_type: "north_indian",
        ascendant_rasi: 6,
        ascendant: 175.775,
        houses: {
            "1": { rasi: 6, planets: [] },
            "2": { rasi: 7, planets: [] },
            "3": {
                rasi: 8,
                planets: [
                    { planet: "MARS", degree: 25.98, is_retrograde: false }
                ]
            },
            "4": {
                rasi: 9,
                planets: [
                    { planet: "MERCURY", degree: 17.84, is_retrograde: true },
                    { planet: "SATURN", degree: 23.56, is_retrograde: false }
                ]
            }
        }
    },
    karakamsha: {
        chart_type: "karakamsha",
        ascendant_rasi: 11,
        atmakaraka: "MARS",
        houses: {
            "1": {
                rasi: 11,
                planets: [
                    { planet: "MOON", degree: null, is_retrograde: false },
                    { planet: "MARS", degree: null, is_retrograde: false },
                    { planet: "KETU", degree: null, is_retrograde: false }
                ]
            }
        }
    }
};

// Simulate transformD1
function transformD1(data) {
    const d1Data = data.d1 || data;
    const points = [];

    if (d1Data.ascendant_rasi) {
        points.push({
            planet: "Lagna",
            sign: d1Data.ascendant_rasi,
            degree: 0,
            house: 1,
            isRetrograde: false,
        });
    }

    if (d1Data.houses) {
        Object.entries(d1Data.houses).forEach(([houseNumStr, house]) => {
            const houseNum = Number(houseNumStr);
            const sign = house?.rasi;
            (house?.planets || []).forEach((p) => {
                points.push({
                    planet: p.planet,
                    sign: sign,
                    degree: p.degree ?? 0,
                    house: houseNum,
                    isRetrograde: !!p.is_retrograde,
                });
            });
        });
    }

    return { varga: "D1", points };
}

// Simulate transformHouseChart
function transformHouseChart(varga, data, ascendantRasi) {
    if (!data?.houses || !ascendantRasi) return null;
    const points = [];

    points.push({
        planet: "Lagna",
        sign: ascendantRasi,
        degree: 0,
        house: 1,
        isRetrograde: false,
    });

    Object.entries(data.houses).forEach(([houseNumStr, house]) => {
        const houseNum = Number(houseNumStr);
        const sign = house?.rasi;
        (house?.planets || []).forEach((p) => {
            points.push({
                planet: p.planet,
                sign: sign,
                degree: p.degree ?? 0,
                house: houseNum,
                isRetrograde: !!p.is_retrograde,
            });
        });
    });

    return { varga, points };
}

console.log("=== D1 Transform ===");
const d1Result = transformD1(data);
console.log(JSON.stringify(d1Result, null, 2));

console.log("\n=== Karakamsha Transform ===");
const karakamshaResult = transformHouseChart("Karakamsha", data.karakamsha, data.karakamsha.ascendant_rasi);
console.log(JSON.stringify(karakamshaResult, null, 2));
