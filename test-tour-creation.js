/**
 * Test script to debug and fix tour creation JSON parsing issues
 */

// Simulate the exact data from the error log
const testTourData = {
  "name": "a round in maldivies",
  "description": "A Round in Maldives ",
  "destinationId": 3,
  "categoryId": 3,
  "duration": 3,
  "durationType": "hours",
  "price": 560000,
  "currency": "EGP",
  "maxCapacity": 13,
  "maxGroupSize": 23,
  "numPassengers": 13,
  "itinerary": "- 00:00 – Pick-up from resort and safety briefing  \n- 00:30 – Snorkeling at vibrant coral reefs  \n- 01:30 – Visit to a local island village  \n- 02:30 – Relaxation on a secluded beach with fresh coconut drinks  \n- 03:30 – Sunset cruise back to the resort  \n- 04:00 – Drop-off at resort",
  "included": [
    "Sunset boat ride",
    "Fresh coconut drink",
    "Guided island tour",
    "Snorkeling gear",
    "Resort pick-up and drop-off"
  ],
  "excluded": [
    "Gratuities",
    "Travel insurance",
    "Optional water sports",
    "Towels or personal swimwear",
    "Meals/snacks"
  ],
  "imageUrl": "/uploads/tour-1752485000431-og1nw9k8miq.jpg",
  "galleryUrls": [
    "blob:https://c4242404-996d-4869-8b68-beca88e908ca-00-kdnlhav5b6io.spock.replit.dev:8080/d9d77018-5eb8-4cca-811a-d877db391f4f",
    "blob:https://c4242404-996d-4869-8b68-beca88e908ca-00-kdnlhav5b6io.spock.replit.dev:8080/baef2858-ff5f-4e3c-9a49-ee6ed6e8e729"
  ],
  "active": true,
  "featured": true,
  "tripType": "",
  "rating": 5,
  "reviewCount": 5,
  "nameAr": "رحلة حول المالديف",
  "descriptionAr": "رحلة حول المالديف بصحبة عربية",
  "itineraryAr": "00:00 – الاستقبال من المنتجع وتعليمات السلامة\n\n00:30 – الغطس في الشعاب المرجانية الملونة\n\n01:30 – زيارة لقرية محلية في إحدى الجزر\n\n02:30 – وقت استجمام على شاطئ منعزل مع مشروب جوز الهند الطازج\n\n03:30 – جولة بحرية عند الغروب والعودة إلى المنتجع\n\n04:00 – الوصول إلى المنتجع",
  "includedAr": [],
  "excludedAr": [],
  "hasArabicVersion": true,
  "gallery": [
    "/uploads/tour-1752485008370-8az0zws9g7.jpg",
    "/uploads/tour-1752485008371-iu87lluqgz.jpg"
  ]
};

// Test the data processing logic
function processToursData(data) {
  console.log('Original data:', JSON.stringify(data, null, 2));
  
  const processedData = { ...data };
  
  // Handle galleryUrls processing
  if (processedData.galleryUrls) {
    if (Array.isArray(processedData.galleryUrls)) {
      processedData.galleryUrls = processedData.galleryUrls.filter(url => 
        url && 
        typeof url === 'string' && 
        url.trim() !== '' && 
        !url.includes('blob:')
      );
    }
  }
  
  // Handle JSON fields
  const jsonFields = ['included', 'excluded', 'includedAr', 'excludedAr'];
  for (const field of jsonFields) {
    if (processedData[field] !== undefined && processedData[field] !== null) {
      if (Array.isArray(processedData[field])) {
        continue;
      } else if (typeof processedData[field] === 'string') {
        try {
          processedData[field] = JSON.parse(processedData[field]);
        } catch (e) {
          processedData[field] = [processedData[field]];
        }
      }
    }
  }
  
  // Handle gallery field specifically
  if (processedData.gallery && Array.isArray(processedData.gallery)) {
    processedData.galleryUrls = processedData.gallery;
    delete processedData.gallery;
  }
  
  console.log('Processed data:', JSON.stringify(processedData, null, 2));
  return processedData;
}

// Test with the actual data
const result = processToursData(testTourData);
console.log('✅ Data processing completed successfully');
console.log('Final galleryUrls:', result.galleryUrls);
console.log('Final included:', result.included);
console.log('Final excluded:', result.excluded);