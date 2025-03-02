const dynamicIsland = document.getElementById('dynamicIsland');
const albumArt = dynamicIsland.querySelector('img');
const apiUrl = 'https://server.ah07.xyz/api/status';

function nowPlaying() {
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      for (let i = 0; i < data.status.length; i++) {
        if (data.status[i].name === "Apple Music") {
          let imageUrl = data.status[i].assets.largeImage;

          if (imageUrl.startsWith('mp:external/')) {
            let fixedUrl = imageUrl.split('/https/').pop();
            imageUrl = 'https://' + fixedUrl;
          }

          // Apply the (potentially fixed) URL
          albumArt.src = imageUrl;
          break;
        }
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

nowPlaying();
setInterval(nowPlaying, 1000);
