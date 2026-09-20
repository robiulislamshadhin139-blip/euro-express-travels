const apiKey = process.env.GOOGLE_PLACES_API_KEY;
const placeId = 'ChIJP7ij-8t8PqsRdyBWoqh6tk8';

fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`)
.then(res => res.json())
.then(data => {
  console.log(JSON.stringify(data, null, 2));
});
