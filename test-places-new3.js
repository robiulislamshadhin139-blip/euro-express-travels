const apiKey = process.env.GOOGLE_PLACES_API_KEY;
fetch('https://places.googleapis.com/v1/places/ChIJP7ij-8t8PqsRdyBWoqh6tk8?fields=id,displayName,formattedAddress,rating,userRatingCount', {
  method: 'GET',
  headers: {
    'X-Goog-Api-Key': apiKey
  }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)));
