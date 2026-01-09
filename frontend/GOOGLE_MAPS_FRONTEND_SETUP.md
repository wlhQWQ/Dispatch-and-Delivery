# Frontend Google Maps Setup

## Issue: Infinite Loading on ViewMap Component

The ViewMap component requires a Google Maps JavaScript API key to work properly.

## Solution

Create a `.env` file in the `frontend/` directory with the following content:

```env
VITE_GOOGLE_MAP_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

## Getting Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:

   - **Maps JavaScript API** (required for map rendering)
   - **Geocoding API** (required for address to coordinates conversion)
   - **Directions API** (optional, for route rendering)

4. Create API credentials:

   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

5. (Optional but recommended) Restrict the API key:
   - Click on the API key to edit it
   - Under "Application restrictions", select "HTTP referrers"
   - Add `http://localhost:3000/*` and `http://localhost:5173/*`
   - Under "API restrictions", select "Restrict key"
   - Select the APIs you enabled above

## After Creating .env File

1. Stop the frontend dev server (Ctrl+C in the terminal)
2. Restart it with `npm run dev`
3. The environment variable will now be loaded

## Verification

After restarting, check the browser console. You should see:

- `🔧 useGeocoder hook - geocodingLib: [object Object]`
- `✅ Initializing geocoder...`
- `✅ Geocoder initialized successfully!`
- `🔍 Starting geocoding...`

If the geocodingLib remains `undefined`, check that:

1. The `.env` file exists in the `frontend/` directory
2. The API key is correct
3. The Maps JavaScript API is enabled in Google Cloud Console
4. The dev server was restarted after creating the .env file
