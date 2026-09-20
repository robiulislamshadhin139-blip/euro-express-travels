const apiKey = process.env.GOOGLE_PLACES_API_KEY;
fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=Euro+Express+Travels+Mirpur+Bazar+Bahubal&key=${apiKey}`)
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)));
