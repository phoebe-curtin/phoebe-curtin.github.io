// -- SYSTEM -- //

const YOUTUBE_API_KEY = "AIzaSyD3bLEhF37F9PsiHbkVfipqCQg6f7jfGuw";
const BACKUP_API_KEY = "AIzaSyBI6Co_ZQcdwHNGMhQQ6HnYVUgqsoFbqrs"

var searchText = document.getElementById("search-text");

var loadingAudio = new Audio('./audio/loading.wav');
loadingAudio.loop = true;

var errorAudio = new Audio('./audio/error.wav');

var startUpAudio = new Audio('./audio/startup.wav');

var finishedLoading = new Audio('./audio/finishedLoading.wav');

var mouseClickAudio = new Audio('./audio/mouseclick.wav');

document.onclick = () => {
    mouseClickAudio.play();
}

window.addEventListener('load', (event) => {
    document.getElementById("anything").onclick = generateRandomWord;
    document.getElementById("betterthing").onclick = getBetterResult;
    document.getElementById("secret-button").onclick = activateSecretButton;
});

// -- API KEYS -- //

var useBackupKey = false

function getAPIKey () {

    if (useBackupKey)
        return BACKUP_API_KEY
    else
        return YOUTUBE_API_KEY
}

// -- GET A RANDOM VIDEO -- //  

function generateRandomWord() {

    tryingBetterSearch = false

    StartLoadingIcon()

    fetch("https://random-word-api.herokuapp.com/word?number=1")
    .then(response => response.json())
    .then(data => {

            var word = data[0]
            var mainWord = mainWords[Math.floor(Math.random() * (mainWords.length-1))]
            var keyWords = `${word}%20${mainWord}` 

            searchText.innerHTML = `Searching for ${word} and ${mainWord}.`

                const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${keyWords}&key=${getAPIKey()}`;

            fetch(url)
            .then(handleErrors)
            .then(res => res.json())
            .then(data2 => {
            document.getElementById("youtubeVideo").src = `https://www.youtube.com/embed/${data2.items[0].id.videoId}`;
            StopLoadingIcon();
        }).catch();
    })
}

// -- GET BETTER VIDEO -- //

function getSearchKeyWords() {
    var word1 = searchWords[Math.floor(Math.random() * (searchWords.length-1))]
    var word2 = searchWords[Math.floor(Math.random() * (searchWords.length-1))]
    var mainWord = mainWords[Math.floor(Math.random() * (mainWords.length-1))]
    var keyWords = `${word1}%20${word2}%20${mainWord}` 
    searchText.innerHTML = `Searching for ${word1}, ${word2} and ${mainWord}.`
    return keyWords
}

var mainWords = ["music", "audio", "sound", "song", "track", "melody"]

var searchWords = ["latin", "gay", "guitar", "robot", "surf", "emo", "terrible", "meme", "german", "scream", "animal", "movie", "video", "videogame"
, "rap", "hiphop", "ocean", "darkness", "cartoon", "upsetting", "synth", "bells", "strings", "drums", "impressive", "acapella", "singing", "voice", "freestyle",
"jazz", "funk", "vinyl", "bassline", "old", "1950s", "2000s", "1920s", "2010", "1990s", "children", "baby", "machinery", "horror", "love", "death", "funeral",
"gentle", "hippy", "soul", "spy", "classical", "piano", "harp", "beat", "sexy", "underground", "edgy", "westcoast", "feet", "caveman", "christian", "country", "metal", "rock", "japanese",
"korean", "chinese", "highschool", "teen", "worst", "best", "six", "pop", "soundeffect", "technology", "computer", "psychic", "sad", "lesbian", "transgender", "bisexual"]


function getBetterResult() {

    tryingBetterSearch = true

    StartLoadingIcon()
  
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${getSearchKeyWords()}&key=${getAPIKey()}`;

    fetch(url)
    .then(handleErrors)
    .then(response => response.json())
    .then(data => {

      var newUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${getVideoIDStringsFromArray(data.items)}&key=${getAPIKey()}`
      fetch(newUrl)
      .then(handleErrors)
      .then(response => response.json())
      .then(data2 => {

        var foundOne = false;

        var attempts = 50

        while (!foundOne) {
            var video = data2.items[Math.floor(Math.random() * (data2.items.length-1))]

            if (convert_time(video.contentDetails.duration) < 600) {
                document.getElementById("youtubeVideo").src = `https://www.youtube.com/embed/${video.id}`;
                StopLoadingIcon();    
                foundOne = true
            }

            attempts--

            if (attempts <= 0)
                getBetterResult()
        }
      }).catch();
  }).catch();
}

// -- SECRET -- // 

function activateSecretButton(e) {
    e.target.classList.add("rainbow")
    e.target.innerHTML = "♡"
    e.target.color = "Red"
    e.target.style.fontSize = "40pt"
    var audio = new Audio('./audio/secret.wav');
    document.getElementById("search-text").style.display = "block"
    audio.play();
}

// -- LOADING ICON AND SOUND -- //

function StartLoadingIcon() {
    loadingAudio.play()
    document.getElementById("loading-icon").style.display = "block"
  }

  function StopLoadingIcon() {
      loadingAudio.pause()
    document.getElementById("loading-icon").style.display = "none"
    finishedLoading.play();
  }

// -- ERROR HANDLING -- //

var tryingBetterSearch = false;

function TryUseBackupKey ()
{
    useBackupKey = true;

    if (tryingBetterSearch)
        getBetterResult();
    else
        generateRandomWord();
}

function ErrorLoading403() {

    if (!useBackupKey)
    {
        TryUseBackupKey();
        return;
    }

    else
    {
        loadingAudio.pause()
        document.getElementById("error-text").style.display = "block"
        document.getElementById("sub-error-text").style.display = "block"
        document.getElementById("youtubeVideo").style.display = "none"
        document.getElementById("loading-icon").style.display = "none"
        errorAudio.play(); 
    }
}

function ErrorLoadingOther() {
    loadingAudio.pause()
    document.getElementById("error-text").style.display = "block"
    document.getElementById("sub-error-text").style.display = "block"
    document.getElementById("youtubeVideo").style.display = "none"
    document.getElementById("loading-icon").style.display = "none"
    document.getElementById("sub-error-text").innerHTML = "Try connecting to the internet :-)"

    errorAudio.play(); 
}

function ErrorWithApiEvent(response) {
    if (response.status == "403")
        ErrorLoading403()
    else
        ErrorLoadingOther()
}

// -- UTILITY -- //

function getVideoIDStringsFromArray(items) {
    var str = ''

    for (var i = 0; i < items.length; i++) {
        str += items[i].id.videoId

        if (i < items.length - 1)
            str += "%2C"
    }

    return str
}

function handleErrors(response) {
    if (!response.ok) {
        ErrorWithApiEvent(response)
        throw Error(response.statusText);
    }
    return response;
}

function convert_time(duration) {
    var a = duration.match(/\d+/g);

    if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
    }

    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    return duration
}

