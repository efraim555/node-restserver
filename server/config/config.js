// ======================================================
//   Puerto
// ======================================================

process.env.PORT = process.env.PORT || 3000;

// ======================================================
//   Entorno
// ======================================================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ======================================================
//   Entorno
// ======================================================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb://cafe-user:Qwerty1234@ds119113.mlab.com:19113/cafe';
}

process.env.URL_DB = urlDB;