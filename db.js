
const config = {
  user: 'pm25',
  password: '1234',
  database: 'PM25DB',
  server: 'localhost',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
    instancename : 'SQLEXPRESS'
  },
  port: 1433,
};

module.exports = config;
