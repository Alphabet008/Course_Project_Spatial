const PM25Model = require("../model/model");

class PM25Controller { 
    async getdata(filename) {
        const { message, error } = await new PM25Model().getdata(filename);
        return { message: message, error: error };
    }

    async performQuerie(select,country_input,year_input,color_pm25) {
        const { result, message, error } = await new PM25Model().performQuerie(select, country_input, year_input, color_pm25);
        return { result: result, message: message, error: error };
    }

    async getPM25point(queries, year_input) {
        const { result, message, error } = await new PM25Model().getPM25point(queries, year_input);
        return { result: result, message: message, error: error };
    }

    async getPM25pointnoD(queries) {
        const { result, polygon, message, error } = await new PM25Model().getPM25pointnoD(queries);
        return { result: result, polygon: polygon, message: message, error: error };
    }
}

module.exports = PM25Controller;
