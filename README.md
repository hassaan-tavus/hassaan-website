# Hassaan Raza's Personal Website and AI Digital Twin (powered by Tavus)

This repository contains the code for Hassaan Raza's personal website, featuring information about his interests, work history, and a link to his AI digital twin powered by Tavus.

## Project Structure

- `public/`: Contains static files (HTML, CSS, JavaScript, JSON)
- `api/`: Contains server-side code (Node.js/Express)

## Prerequisites
- A Tavus API Key (sign up for a free account at https://www.tavus.io)
- A Vercel account (you can also deploy to other platforms)

## Creating Your Digital Twin with Tavus

To create your own digital twin using Tavus, you can either use the Tavus app or the API (https://docs.tavus.io):

### Using the Tavus API

First you'll need an API Key. You can sign up for a free account at https://www.tavus.io. Once you have your API key, you can use the following steps to create your digital twin:

1. **Create a Replica:**
   Use the [Create Replica](https://docs.tavus.io/api-reference/phoenix-replica-model/create-replica) endpoint:
   ```
   POST https://tavusapi.com/v2/replicas
   ```
   Include a `training_video_url` in the request body pointing to your 2-minute training video. 
   Note: Ceating a personal replica requires a paid account, however you can still create a conversation or persona with a stock replica.

2. **Create a Persona:**
   Once your replica is trained, [Create a Persona](https://docs.tavus.io/api-reference/personas/create-persona):
   ```
   POST https://tavusapi.com/v2/personas
   ```
   In the request body, include:
   - `name`: A name for your persona
   - `system_prompt`: Include some instructions on who your persona is and how you want them to behave
   - `context`: Add context to your persona by including some information about their background, interests, etc. You can dump a ton of information here. I dumped my entire website content into the context! 
  - `default_replica_id`: Your trained replica's ID


3. **Start a Conversation:**
   With your replica and persona ready, [Create a Conversation](https://docs.tavus.io/api-reference/conversations/create-conversation):
   ```
   POST https://tavusapi.com/v2/conversations
   ```
   Include in the request body:
   - `persona_id`: Your created persona's ID
   - `conversational_context`: (Optional) Any specific context for this conversation, for example, you can include the name of the user you're speaking to.
   - `custom_greeting`: (Optional) A custom greeting to start the conversation with. I like to include the name of the user I'm speaking to here and personally greet them.

4. Replace the `persona_id` in the `api/index.js` file with your own Persona ID.
5. Update the `TAVUS_API_KEY` in your `.env` file with your Tavus API key.

For detailed API documentation, refer to the [Tavus API Reference](https://docs.tavus.io/api-reference/).

Remember to handle API responses and errors appropriately in your application.

### Using the Tavus App

1. Sign up for a Tavus account at [https://www.tavus.io](https://www.tavus.io).
2. To create a replica of yourself, click on the 'Replica Generation' tab in the sidebar
   - Note, creating a personal replica requires a paid account, however you can still create a conversation or persona with a stock replica.
   - You'll need to record a 2-minute video of yourself speaking to train your replica
3. Once your replica is trained, you can immediately test it out in a conversation using the 'Create Conversation' tab
4. To create a Persona and load it up with your information, click on the 'Persona Library' tab in the sidebar -> 'Create Persona'
5. You can now launch a conversation with your new persona 
6. You can use your API key and persona ID to run this same site with your own AI digital twin.


## Writing Section & SEO

The website includes a writing section with static HTML generation for SEO optimization.

### Building Static Pages

Before deployment, generate static HTML pages:

```bash
npm run build
```

This command:
- Generates static HTML pages for each writing in `public/writing/`
- Creates/updates `public/sitemap.xml` with all pages
- Ensures search engines can crawl your writing content

### Adding New Writings

1. Create markdown files:
   - `public/posts/{slug}/content.md` - The main article content
   - `public/posts/{slug}/journey.md` - The writing journey/backstory

2. Add entry to `public/writings.json`:
```json
{
  "id": 2,
  "slug": "your-slug",
  "title": "Your Title",
  "date": "2025-01-01",
  "machine": "Machine Name",
  "authenticity": 85,
  "contentFile": "/posts/your-slug/content.md",
  "journeyFile": "/posts/your-slug/journey.md"
}
```

3. Build and commit:
```bash
npm run build
git add .
git commit -m "Add new writing: Your Title"
git push
```

Vercel will automatically run `npm run build` during deployment.

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