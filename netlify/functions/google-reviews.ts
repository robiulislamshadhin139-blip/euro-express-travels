import type { Handler, HandlerEvent } from "@netlify/functions";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json"
};

const fallbackReviews = [
  { id: '1', name: 'Robiul Islam', rating: 5, comment: '"Highly recommend Euro Express Travels! Their service is incredibly professional, fast, and reliable. They provided expert guidance for my visa documentation with zero stress."', date: '9 mins ago' },
  { id: '2', name: 'Fokhrul Islam', rating: 5, comment: 'One of the most trusted travel agencies in Sylhet division. Their visa guidance and file processing are 100% genuine and hassle-free. Got my Schengen visa support on time!', date: '1 week ago' },
  { id: '3', name: 'josim roni', rating: 5, comment: 'Best visa processing and travel agency in Habiganj. Very professional, fast service and highly trusted consultancy for Europe and tourist visas. Highly recommended!', date: '1 week ago' }
];

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ status: "ok" })
    };
  }

  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          reviews: fallbackReviews,
          rating: 5.0,
          total: 7
        })
      };
    }

    const placeId = "ChIJP7ij-8t8PqsRdyBWoqh6tk8";
    const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}?fields=id,displayName,rating,userRatingCount,reviews`;

    const detailsResponse = await fetch(detailsUrl, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "Accept-Language": "en"
      }
    });

    const detailsData = await detailsResponse.json();
    let formattedReviews = fallbackReviews;

    if (detailsData.reviews && detailsData.reviews.length > 0) {
      formattedReviews = detailsData.reviews.map((r: any, idx: number) => {
        let dateText = r.relativePublishTimeDescription;
        if (!dateText && r.publishTime) {
          const d = new Date(r.publishTime);
          dateText = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
        }
        return {
          id: `google_${idx}`,
          name: r.authorAttribution?.displayName || "Google User",
          rating: r.rating || 5,
          comment: r.text?.text || r.originalText?.text || "",
          date: dateText || "Recently"
        };
      });
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        reviews: formattedReviews,
        rating: detailsData.rating || 5.0,
        total: detailsData.userRatingCount || 7
      })
    };
  } catch (err) {
    console.error("Error fetching Google Reviews in Netlify function:", err);
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        reviews: fallbackReviews,
        rating: 5.0,
        total: 7
      })
    };
  }
};
