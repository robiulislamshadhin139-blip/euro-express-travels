const apiKey = process.env.GOOGLE_PLACES_API_KEY;
const placeId = 'ChIJP7ij-8t8PqsRdyBWoqh6tk8';

fetch(`https://places.googleapis.com/v1/places/${placeId}?fields=reviews,rating,userRatingCount`, {
  method: 'GET',
  headers: {
    'X-Goog-Api-Key': apiKey
  }
})
.then(res => res.json())
.then(data => {
  console.log("Total rating count:", data.userRatingCount);
  console.log("Reviews fetched by API:", data.reviews ? data.reviews.length : 0);
});
