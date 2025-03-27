import express from "express";
import cors from "cors";
import { appRouter } from "./routes";
import { main } from "./utils/download";
import https from "https";

main();

const app = express();
const PORT = 8080;

// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());

// Sample route
app.get("/hello", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api", appRouter);

// Read SSL certificate files
const key = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCsduheUQA1ksjo
NyhPxetB/RJySYnTNhijdxmX/b5Qt8yOzUYeggyW/Mn0og3O1NTgxrn8RwZNwL6g
OC4l0Y2QZkTi9BtP2QsmUon869lAAse48nQWqX8DA4CSn38ovEbO8CWOXs7nML+6
4/kik/cQSpFsLQUyYHd5OT/YGyo1+COXAnnJ4tsxOVW0/cUiIrU1TQ1UEcfdoP0H
GjJLTM3elE20iS3qE6WzjlWzhglfnU75U3mojBNI4vjccIvC38sL8iClgNx8JjaZ
fMKrWpSFJitdMmKnF9K6odi0wr/8MCyASwjZvRAsNWxLnpl+ZfWE2ZU6M85M0yvK
tSYH7Q7TAgMBAAECggEAQKVDnZLkLrCqIS0HrbtE31PStcct4987pg5PKCNDUrNK
eF6mgWoC+RehRdL2tQgfEXA8J72htcRhT+IvHhrp4u4KtT2F/Uygeslmksj/Apjo
L0GmVRZMlx8ZcxxZCDZmnkvy7+ZGzO7/dzjb2mO3MMKatv87GvKA5g4ZCdLI5DhU
1D3weax3d2A7mKHdDpwK8dYG0L7xuXJYxkGp9PPaIAZmacT88ui8QiF+sl4aeEjK
BWW768CA43eO42/NocRije4+OR0X4X/ax81fXvPkQ85evo5vVEdMZXR844qlG9VN
Yuw3agR9xMoyM9QYX2853MwnUosxR7Kp6s7FQXThAQKBgQDZla+0H1MN2EW/Duus
d8VTQBqx42LmC7eNPSJhKjRxfUg1bBkIKvAIFSdQDrxCcqTyUd0jSheKh5uaco6x
xTFEzHck9cCFQvPm2qsizRrKe6PDSEEZQxE/rKc8oBW23EtVUjkmHYEFn218rlMi
BMMFobciBbB2W3z8VkMA9PDd0wKBgQDK6eTTuncHmRNniUcN8+5/BLLLwD2O1nW+
i6PUtS0RGrmkbfsvCcNJTYmAipjHVVBqzdiFl6hTYNpMM+dvwIp1ciJllmIOQk1Y
n18cNvt1+8nhGQqXIUrvZhHjCwaOg+ADZk5tytHjgm2QatEm5L5jbmBNpovGqxKm
bYjjZIdrAQKBgFzEq0Maz+hpO2N4UxcXgbQ68qbBkhsPB9VaKVxQCEgS6ESOsCWB
WRG5IyfJAI88HgOKz8QKBPt1UeyJxzkYICd7HZlOhiTLJP5aYPjXhgKqsGnEVq0U
oTgKvsrkXh220w+vnNoZXjctgBrWoG8ypIu0JUaGMnRkEWfsx2iTBlctAoGBAI18
U3sy3IZmvToHZY0cFqNookciD4pGjalEcwMBJaB0kxdNPMUKuKmnMAZ6HZd4LG+c
gqp8GfmxYeWal3i7t4+2+rb9CfhJUOdHkSj6SZJ188lKDbFdnIObF0PJz1OWLqAQ
OQWjU4Cg1EbLxHSrMPnh37KlO3dWl9WGMNnloesBAoGANAMmBqW7O9WapBvgRgtT
5xUJqX/+uFLdgEoy4szxPNleOieEjtnoRo2ast/6Svgp8UZD/uA8Qvmigjt4ZHSP
9+rD3I1tTA86nEVOmzdI9IUeoqlGK3BHSHmNRvrcKDq+ZDtf9UprJd/RUawXsA7v
bJPPqZTxe68TSlmHo+CjWuA=
-----END PRIVATE KEY-----`;

const cert = `-----BEGIN CERTIFICATE-----
MIIC8zCCAdugAwIBAgIUR7S8pAeeuxjWPqh3JdsraA6DkaAwDQYJKoZIhvcNAQEL
BQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTI1MDMyMzE3MDI1N1oXDTI2MDMy
MzE3MDI1N1owFDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEArHboXlEANZLI6DcoT8XrQf0SckmJ0zYYo3cZl/2+ULfM
js1GHoIMlvzJ9KINztTU4Ma5/EcGTcC+oDguJdGNkGZE4vQbT9kLJlKJ/OvZQALH
uPJ0Fql/AwOAkp9/KLxGzvAljl7O5zC/uuP5IpP3EEqRbC0FMmB3eTk/2BsqNfgj
lwJ5yeLbMTlVtP3FIiK1NU0NVBHH3aD9BxoyS0zN3pRNtIkt6hOls45Vs4YJX51O
+VN5qIwTSOL43HCLwt/LC/IgpYDcfCY2mXzCq1qUhSYrXTJipxfSuqHYtMK//DAs
gEsI2b0QLDVsS56ZfmX1hNmVOjPOTNMryrUmB+0O0wIDAQABoz0wOzAaBgNVHREE
EzARgglsb2NhbGhvc3SHBH8AAAEwHQYDVR0OBBYEFBlaXxK23eu6a2yfIz3cnDH1
1FnUMA0GCSqGSIb3DQEBCwUAA4IBAQCUVEbtYw+MU30CAkEmwQd0LlaxuweU+LZ2
ts30MaS5yDu/k37vZvtgt/61yoInL1ANt8AAzPXsDBYL3Koi7TQ8R/3dpEMBa2uq
s0CXyL/n+1M5uDLN4McvTYeV9QYdPFbJXbXCeumGLvayv2+9tOHogBUioffpcJ2R
UADVLl/ErXiw8GK47952iFbbDlp6HVc2gHuTqhnbfhivI0a8q6caSSsflqdVBNDk
RWAFL9SXx6rWuGq2jGmzgQP4vhclDxcHd3r51zo+gSawDqYid/6FQz7P0F8jZrYy
DppYa4PG5tJMJmbqyAsCgaCkzoTJiO9Q8O3RWAM2Crk9wz3OdZfr
-----END CERTIFICATE-----`;

const options = { 
  key: Buffer.from(key), 
  cert: Buffer.from(cert) 
};

// Start the HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`HTTPS Server is running on https://localhost:${PORT}`);
  console.log(
    `Make sure to add https://localhost:${PORT} to your Clerk redirect URIs`
  );
});
