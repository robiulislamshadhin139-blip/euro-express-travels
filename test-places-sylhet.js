const apiKey = process.env.GOOGLE_PLACES_API_KEY;
fetch('https://places.googleapis.com/v1/places:searchText', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
  },
  body: JSON.stringify({
    textQuery: 'Euro Express Travels Bangladesh'
  })
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)));
