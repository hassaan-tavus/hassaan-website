# Hassaan Raza's Personal Website and AI Digital Twin (powered by Tavus)

This repository contains the code for Hassaan Raza's personal website, featuring information about his interests, work history, and a link to his AI digital twin powered by Tavus.

## Project Structure

- `public/`: Contains static files (HTML, CSS, JavaScript, JSON)
- `api/`: Contains server-side code (Node.js/Express)

## Prerequisites

- Node.js (v14 or later)
- npm (comes with Node.js)
- A Vercel account (you can deploy to other platforms or manually deploy)

## Local Development

1. Clone the repository:
   ```
   git clone https://github.com/hassaan-tavus/hassaan-website.git
   cd hassaan-website
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   TAVUS_API_KEY=your_tavus_api_key
   GOOGLE_SHEET_URL=your_google_sheet_url
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open `http://localhost:3000` in your browser.

## Deploying to Vercel

### Using the Vercel Dashboard

1. Push your code to a GitHub repository.

2. Log in to your Vercel account and click "New Project".

3. Import your GitHub repository.

4. Configure your project:
   - Framework Preset: Other
   - Build Command: `npm run build` (if you have a build step, otherwise leave blank)
   - Output Directory: `public`
   - Install Command: `npm install`

5. Add your environment variables (TAVUS_API_KEY and GOOGLE_SHEET_URL) in the "Environment Variables" section.

6. Click "Deploy".

### Using the Vercel CLI

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Log in to your Vercel account:
   ```
   vercel login
   ```

3. Navigate to your project directory and run:
   ```
   vercel
   ```

4. Follow the prompts to configure your project.

5. Add your environment variables:
   ```
   vercel env add TAVUS_API_KEY
   vercel env add GOOGLE_SHEET_URL
   ```

6. Deploy your project:
   ```
   vercel --prod
   ```

## Updating Your Deployment

After making changes to your code:

1. Commit your changes to Git.
2. Push to your GitHub repository.
3. Vercel will automatically redeploy your site.

Alternatively, you can manually trigger a new deployment using the Vercel dashboard or by running `vercel --prod` in your project directory.

## Additional Notes

- Make sure your Google Apps Script is properly set up and deployed as a web app to handle the form submissions.
- Keep your API keys and sensitive information secure. Never commit them directly to your repository.