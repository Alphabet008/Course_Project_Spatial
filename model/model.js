const config = require("../db");
const sql = require("mssql");
const fs = require("fs");
const csv = require('csv-parser');
const fastcsv = require("fast-csv");
const path = require("path");
const uuid = require("uuid").v4;


class PM25Model {
    async getdata(filename) {
        try {
            let results = []
            fs.createReadStream('./uploads/'+filename)
            .pipe(csv({
                headers: false
            }))
            .on('data', (data) => results.push(data))
            .on('end', async function ()  {
                console.log(results);
                await sql.connect(config).then(async (pool) => {
                for (let i = 1; i < results.length; i++){
                    await pool.request().input('city', sql.VARCHAR, results[i][1])
                        .query(
                        `INSERT INTO AirPollutionPM25 (country,city,Year,pm25,latitude,longitude,population,wbinc16_text,Region,conc_pm25,color_pm25) 
                        VALUES('${results[i][0]}',@city,'${results[i][2]}',${results[i][3]},${results[i][4]},${results[i][5]},${results[i][6]},'${results[i][7]}','${results[i][8]}','${results[i][9]}','${results[i][10]}');

                        UPDATE AirPollutionPM25
                        SET  geom = geometry::STGeomFromText( 'POINT(' + CAST([Longitude] AS VARCHAR(20)) + ' ' + CAST([Latitude] AS VARCHAR(20)) + ')',4326);`
                    )
                    console.log(i)
                    }
                })
                return {
                    message: "Uploads Data successfully",
                    error: false,
                };
            });
        } catch (error) {
            return {
                message: "Error to get Data",
                error: true,
            };
        }
    }

    async performQuerie(select,country_input,year_input,color_pm25) { 
        try {
            await sql.connect(config);
            let result
            if (select == "a") {
                result = await sql.query(
                `SELECT country,city,Year,pm25 FROM AirPollutionPM25
                WHERE pm25 > 50 AND Year = 2015 order by pm25 DESC`
                );
            }
            else if (select == "b") {
                result = await sql.query(
                `SELECT country,AVG(Pm25) AS pm25 FROM AirPollutionPM25 GROUP BY country ORDER BY pm25 ASC;`
                );
            }
            else if (select == "c") {
                result = await sql.query(
                `SELECT country,city,Year,pm25 
                FROM AirPollutionPM25
                WHERE country = '${country_input}'
                ORDER BY Year ASC;`
                );
            }
            else if (select == "d") {
                result = await sql.query(
                `SELECT Year, color_pm25, SUM(population) AS population
                FROM AirPollutionPM25
                WHERE Year = '${year_input}' AND color_pm25 = '${color_pm25}'
                GROUP BY Year,color_pm25;`
                );
            }

            const { file, message, error } = await this.writeCSV(select, result)
            return {
                result: file,
                message: message,
                error: error,
            };
        } catch (error) {
            return {
                result: [],
                message: "Error to Querie",
                error: true,
            };
        }
    }

    async writeCSV(select, result) {
        try {
            const filename = uuid();
            const ws = fs.createWriteStream(
                `./download/${select}/${filename}.csv`
            );

            fastcsv.write(result.recordset, { headers: true }).pipe(ws);

            const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
            await delay(1000);

            return {
                file: filename + ".csv",
                message: "write CSV successfully",
                error: false,
            };
            } catch (error) {
                return {
                    file: "",
                    message: "Error to write CSV",
                    error: true,
                };
            }
    }

    async getPM25point(queries, year_input) {
        try {
            await sql.connect(config);
            let result
            if (queries == "a" && year_input !== "") {
                result = await sql.query(
                    `SELECT * FROM AirPollutionPM25 WHERE Year = '${year_input}' `
                );      
            }
            else if (queries == "b") {
                result = await sql.query(
                    `DECLARE @BKK geometry
                    SELECT @BKK = geom
                    FROM AirPollutionPM25
                    WHERE country = 'Thailand' AND City = 'Bangkok'

                    SELECT TOP(50) * 
                    FROM AirPollutionPM25  WHERE geom IS NOT NULL AND City != 'Bangkok'
                    ORDER BY geom.STDistance(@BKK); `
                ); 
            }
            else if (queries == "c") {
                result = await sql.query(
                    `SELECT * FROM AirPollutionPM25  
                    WHERE geom IS NOT NULL AND Country IN ('Brunei', 'Cambodia', 'Indonesia', 'Laos', 'Malaysia', 'Myanmar', 'Philippines', 'Singapore', 'Vietnam') AND Year = '2016' `
                ); 
            }
            else if (queries == "e") {
                result = await sql.query(
                    `SELECT *
                    FROM AirPollutionPM25
                    WHERE country = (
                        SELECT TOP(1) country
                        FROM AirPollutionPM25
                        where Year = '2011'
                        GROUP BY country
                        ORDER BY COUNT(city) DESC
                    )AND Year = '2011' `
                ); 
            }
            else if (queries == "f" && year_input !== "") {
                result = await sql.query(
                    `SELECT *
                    FROM AirPollutionPM25  
                    WHERE Year = '${year_input}' AND wbinc16_text LIKE '%Low income%' `
                ); 
            }
            else if (queries === undefined && year_input === undefined) {
                result = await sql.query(
                    `SELECT * FROM AirPollutionPM25 `
                );  

            }
            else if (queries === undefined && year_input === undefined) {
                result = await sql.query(
                    `SELECT * FROM AirPollutionPM25 `
                );  

            }else if (queries == "" && year_input == "") {
                result = await sql.query(
                    `SELECT * FROM AirPollutionPM25 `
                );  

            }
            return {
                result: await this.createGeotemp(result.recordset),
                message: "Get data successfully",
                error: false,
            };
        } catch (error) {
            return {
                result: [],
                message: "Error to Get data",
                error: true,
            };
        }
    }

    async getPM25pointnoD(queries) {
        try {
            await sql.connect(config);
            let result
            if (queries == "d") {
                result = await sql.query(
                    `DECLARE @TH geometry
                    SELECT @TH=geometry::EnvelopeAggregate(geom)
                    FROM AirPollutionPM25
                    WHERE country ='Thailand' AND Year = '2016'

                    SELECT @TH.STEnvelope() AS Polygon `
                );   
                const pointTh = await sql.query(`SELECT * FROM AirPollutionPM25 WHERE Country = 'Thailand' AND Year = '2016'`);

                let FeatureCollection = await this.createGeotemp(pointTh.recordset);

                const polygon = result.recordset[0].Polygon.points;

                let polygonArray = [];

                for (let i = 0; i < polygon.length; i++){
                    polygonArray[i] = [polygon[i].x, polygon[i].y];
                    
                    // console.log(polygonArray[i])
                }

                let features = {
                    type: "Feature",
                    properties: {
                    Info: "Visualize the four points of MBR covering all city points in Thailand in 2009.",
                    },
                    geometry: {
                    type: "polygon",
                    rings: [polygonArray],
                    },
                };

                 return {
                    result: FeatureCollection,
                    polygon: features,
                    message: "Get No D successfully",
                    error: false,
                };

            }
        } catch (error) {
            return {
                    result: [],
                    polygon: [],
                    message: "Error to Get No D",
                    error: true,
                };
        }
    }

    async createGeotemp(result) {
        try { 
            console.log(result.length)
            let FeatureCollection = { type: "FeatureCollection", features: [] };
            let features = {
                type: "Feature",
                geometry: { type: "Point", coordinates: [] },
                properties: {
                    Country: "",
                    City: "",
                    Year: "",
                    Pm25: "",
                    Population: "",
                    Wbinc16_text: "",
                    Region: "",
                    Conc_Pm25: "",
                    Color_Pm25: "",
                },
            };

            for (let i = 0; i < result.length; i++){
                features.properties.Country = result[i].country;
                features.properties.City = result[i].city;
                features.properties.Year = result[i].Year;
                features.properties.Pm25 = result[i].pm25;
                features.properties.Population = result[i].population;
                features.properties.Wbinc16_text = result[i].wbinc16_text;
                features.properties.Region = result[i].region;
                features.properties.Conc_Pm25 = result[i].conc_Pm25;
                features.properties.Color_Pm25 = result[i].color_Pm25;

                let y = result[i].latitude;
                let x = result[i].longitude;
                let xyArrays = [x, y];

                features.geometry.coordinates = xyArrays;
                xyArrays = [];

                FeatureCollection.features.push(features);
                features = {
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [] },
                    properties: {
                        Country: "",
                        City: "",
                        Year: "",
                        Pm25: "",
                        Population: "",
                        Wbinc16_text: "",
                        Region: "",
                        Conc_Pm25: "",
                        Color_Pm25: "",
                    },
                };
                
            }
            return FeatureCollection;
        } catch (error) {
            return [];
        }
    }
}



module.exports = PM25Model;