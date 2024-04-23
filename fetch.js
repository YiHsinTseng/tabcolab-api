const axios = require('axios');

axios.get('https://tabcolab.live', { withCredentials: true })
  .then((response) => {
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      const cookies = setCookieHeader[0].split('; ');
      const jwtCookie = cookies.find((cookie) => cookie.startsWith('jwt='));
      if (jwtCookie) {
        const jwt = jwtCookie.split('=')[1];
        console.log(jwt);
      }
    }
  })
  .catch((error) => {
    console.error(error);
  });
