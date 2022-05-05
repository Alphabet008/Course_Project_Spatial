
const config = {
  user: 'USER_ID',
  password: 'PASSWORD',
  database: 'DATABASE_NAME',
  server: 'SERVER_NAME',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
    instancename : 'SQLEXPRESS'
  },
  port: 1433,
};

module.exports = config;
