const dynamicIsland = document.getElementById('dynamicIsland');
const albumArt = dynamicIsland.querySelector('img');
const audioPreview = dynamicIsland.querySelector('#audioPreview');
const songNameElement = dynamicIsland.querySelector('#songName');
const artistNameElement = dynamicIsland.querySelector('#artistName');
const playPauseButton = dynamicIsland.querySelector('#playPauseButton');
const currentTimeElement = dynamicIsland.querySelector('#currentTime');
const timeLeft = dynamicIsland.querySelector('#timeLeft');
const progressBar = dynamicIsland.querySelector('.progress-bar .progress');
const apiUrl = 'https://server.ah07.xyz/api/status';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

let intervalId;

function nowPlaying() {
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      let musicPlaying = false;
      for (let i = 0; i < data.status.length; i++) {
        if (data.status[i].name === "Apple Music") {
          musicPlaying = true;
          let imageUrl = data.status[i].assets.largeImage;
          let songName = data.status[i].details;
          let artistName = data.status[i].state;
          let startTime = new Date(data.status[i].timestamps.start).getTime();
          let endTime = new Date(data.status[i].timestamps.end).getTime();
          let currentTime = Date.now();
          let duration = endTime - startTime;
          let elapsed = currentTime - startTime;
          let remaining = duration - elapsed;

          if (artistName === "Anthony Huang") {
            imageUrl = '/assets/albumarts/huang.jpg';
          } else if (artistName === "Ryan Irvani") {
            imageUrl = '/assets/albumarts/irvani.png';
          } else if (imageUrl.startsWith('mp:external/')) {
            let fixedUrl = imageUrl.split('/https/').pop();
            imageUrl = 'https://' + fixedUrl;
          }

          albumArt.crossOrigin = "Anonymous";
          albumArt.src = imageUrl;

          albumArt.onload = () => {
            applyGradientEffect(albumArt);
          };

          albumArt.onerror = () => {
            console.error('Error loading album art image');
            albumArt.src = '/assets/icons/music.webp';
            albumArt.onload = () => {
              const bars = document.querySelectorAll('.bar');
              bars.forEach(bar => {
                bar.style.backgroundColor = '#ffffff';
                bar.style.backgroundImage = 'none';
              });
            };
          };

          songNameElement.textContent = songName;
          artistNameElement.textContent = artistName;

          if (remaining > 0) {
            timeLeft.textContent = formatTime(remaining);
            currentTimeElement.textContent = formatTime(elapsed);
            progressBar.style.width = `${(elapsed / duration) * 100}%`;
          }

          break;
        }
      }

      if (!musicPlaying) {
        dynamicIsland.classList.remove('playing');
        albumArt.style.display = 'none';
        audioPreview.style.display = 'none';
        clearInterval(intervalId);
      } else {
        dynamicIsland.classList.add('playing');
        albumArt.style.display = 'block';
        audioPreview.style.display = 'flex';
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

function formatTime(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function applyGradientEffect(imgElement) {
  const bars = document.querySelectorAll('.bar');

  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

  const blurAmount = Math.max(15, canvas.width / 10);

  ctx.globalAlpha = 1;
  ctx.filter = `blur(${blurAmount}px)`;
  ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
  ctx.filter = 'none';

  bars.forEach((bar, index) => {
    const barCanvas = document.createElement('canvas');
    const barCtx = barCanvas.getContext('2d');
    barCanvas.width = canvas.width / bars.length * 1.2;
    barCanvas.height = canvas.height * 0.6;

    barCtx.drawImage(
      canvas,
      index * barCanvas.width * 0.8,
      canvas.height * 0.2,
      barCanvas.width,
      barCanvas.height,
      0,
      0,
      barCanvas.width,
      barCanvas.height
    );

    bar.style.backgroundImage = `url(${barCanvas.toDataURL()})`;
    bar.style.backgroundSize = 'cover';
    bar.style.backgroundPosition = 'center';
  });
}

document.addEventListener("DOMContentLoaded", () => {
  nowPlaying();
  setInterval(nowPlaying, 1000);
});