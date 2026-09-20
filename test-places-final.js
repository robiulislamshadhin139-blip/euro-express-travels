const apiKey = process.env.GOOGLE_PLACES_API_KEY;
fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJP7ij-8t8PqsRdyBWoqh6tk8&fields=name,formatted_address,rating,user_ratings_total&key=${apiKey}`)
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)));
